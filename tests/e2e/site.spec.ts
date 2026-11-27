import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Milestone 6: every public content page, links, 404s, gallery, inquiry, FAQ,
// navigation state and the page transition.

const ROUTES = ["/", "/about", "/our-home", "/accommodations", "/care-services", "/lifestyle", "/amenities", "/dining", "/gallery",
  "/our-team", "/resources", "/resources/choosing-a-community", "/resources/preparing-for-a-visit", "/resources/maintaining-independence",
  "/resources/feeling-at-home", "/faq", "/contact", "/privacy", "/accessibility"];

const skipOpening = (page: Page) => page.addInitScript(() => sessionStorage.setItem("evermere:opening-seen", "1"));

function watch(page: Page) {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("console", (m) => m.type() === "error" && !m.text().includes("404 (Not Found)") && problems.push(m.text()));
  page.on("request", (r) => {
    const { hostname, protocol } = new URL(r.url());
    if (protocol.startsWith("http") && !["localhost", "127.0.0.1"].includes(hostname)) problems.push(`external: ${r.url()}`);
    // The only permitted write is the same-origin inquiry endpoint, which discards data in demonstration mode.
    if (r.method() !== "GET" && r.method() !== "HEAD" && !r.url().includes("/_next/") && new URL(r.url()).pathname !== "/api/inquiry") problems.push(`write: ${r.method()} ${r.url()}`);
  });
  return problems;
}

test("all 19 content pages: 200, one h1, unique title, noindex, no overflow", async ({ page }) => {
  test.setTimeout(180_000);
  await skipOpening(page);
  const problems = watch(page);
  const titles = new Set<string>();
  for (const path of ROUTES) {
    const res = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(res?.status(), path).toBe(200);
    expect(res?.headers()["x-robots-tag"], path).toContain("noindex");
    await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute("content", /noindex/);
    await expect(page.locator("h1"), path).toHaveCount(1);
    await expect(page.locator('meta[name="description"]'), path).toHaveAttribute("content", /.{50}/);
    await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute("href", new RegExp(`${path === "/" ? "" : path}$`));
    titles.add(await page.title());
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${path} @${width}`).toBeLessThanOrEqual(0);
    }
  }
  expect(titles.size).toBe(ROUTES.length);
  expect(problems).toEqual([]);
});

test("every internal link resolves; no links to dev routes", async ({ page, request }) => {
  test.setTimeout(180_000);
  const hrefs = new Set<string>();
  for (const path of ROUTES) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    for (const h of await page.$$eval("a[href^='/']", (a) => a.map((x) => x.getAttribute("href")!))) hrefs.add(h);
  }
  for (const h of hrefs) {
    expect(h, "dev link").not.toMatch(/^\/dev\b/);
    const [path, hash] = h.split("#");
    expect((await request.get(path || "/")).status(), h).toBe(200);
    if (hash === "inquire") expect(path).toBe("/contact");
  }
});

test("unknown pages and article slugs are genuine branded 404s with one header", async ({ request, page }) => {
  for (const path of ["/no-such-page", "/resources/no-such-guide"]) {
    expect((await request.get(path)).status(), path).toBe(404);
    await page.goto(path);
    await expect(page.locator("h1")).toHaveText("This door does not lead anywhere.");
    await expect(page.locator("header.site-header")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator(".skip-link")).toHaveCount(1);
  }
});

test.describe("404 without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("unmatched URL: branded page in server HTML, one header, main and footer", async ({ page }) => {
    expect((await page.goto("/no-such-page"))?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("This door does not lead anywhere.");
    for (const el of ["header", "main", "footer"]) await expect(page.locator(el)).toHaveCount(1);
  });
  // Framework limitation (Next 16.4.6, ensureStatic = "navigation"): an unlisted slug's
  // on-demand static render returns HTTP 404 with the branded page only in the RSC
  // payload, so the server HTML body is empty. See docs/content-plan.md, Article routing.
  test("unknown article slug: still a genuine noindex 404 without JavaScript", async ({ page }) => {
    const res = await page.goto("/resources/no-such-guide");
    expect(res?.status()).toBe(404);
    expect(res?.headers()["x-robots-tag"]).toContain("noindex");
  });
  test.fixme("unknown article slug: branded page in server HTML", async ({ page }) => {
    await page.goto("/resources/no-such-guide");
    await expect(page.locator("h1")).toHaveText("This door does not lead anywhere.");
  });
});

test("articles: unique h1, breadcrumb, related guides, inquiry action", async ({ page }) => {
  const h1s = new Set<string>();
  for (const path of ROUTES.filter((r) => r.startsWith("/resources/"))) {
    await page.goto(path);
    h1s.add((await page.locator("h1").textContent())!);
    await expect(page.locator('nav[aria-label="Breadcrumb"] a')).toHaveAttribute("href", "/resources");
    await expect(page.locator(".ar-more li")).toHaveCount(2);
    await expect(page.locator('.ar-talk a[href="/contact#inquire"]')).toBeVisible();
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    await expect(page.locator('footer a[href="/resources"]')).toHaveAttribute("aria-current", "page");
  }
  expect(h1s.size).toBe(4);
});

test("gallery: filters, counts, viewer keys, swipe, Escape and focus return", async ({ page }) => {
  await page.goto("/gallery");
  const count = page.locator(".gl-count");
  await expect(count).toHaveText("56 photographs");
  const filters = page.locator(".gl-filters button");
  let sum = 0;
  for (let i = 1; i < (await filters.count()); i++) {
    await filters.nth(i).click();
    await expect(filters.nth(i)).toHaveAttribute("aria-pressed", "true");
    const n = Number((await count.textContent())!.split(" ")[0]);
    await expect(page.locator(".gl-thumb")).toHaveCount(n);
    sum += n;
  }
  expect(sum).toBe(56);
  await filters.nth(1).click();
  const second = page.locator(".gl-thumb").nth(1);
  const label = (await second.getAttribute("aria-label"))!.replace("View larger: ", "");
  await second.click();
  const viewer = page.getByRole("dialog", { name: "Photograph viewer" });
  await expect(viewer).toBeVisible();
  await expect(viewer.locator(".gl-viewer-caption")).toHaveText(label);
  await expect(viewer.locator("img")).toHaveAttribute("alt", label);
  await page.keyboard.press("ArrowRight");
  await expect(viewer.getByText(/^3 of /)).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(viewer.getByText(/^1 of /)).toBeVisible();
  await viewer.dispatchEvent("touchstart", { touches: [{ clientX: 300, clientY: 300, identifier: 0 }] });
  await viewer.dispatchEvent("touchend", { changedTouches: [{ clientX: 100, clientY: 300, identifier: 0 }] });
  await expect(viewer.getByText(/^2 of /)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
  await expect(second).toBeFocused();
  await filters.first().click();
  await expect(count).toHaveText("56 photographs");
});

test("contact: validation summary, demo success, no form data leaves the page", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/contact#inquire");
  const form = page.locator("form[aria-labelledby='iq-title']");
  await expect(form).toBeVisible();
  await form.getByRole("button", { name: /send|submit/i }).click();
  await expect(page.locator(".iq-summary")).toBeFocused();
  await expect(page.locator("#iq-name")).toHaveAttribute("aria-invalid", "true");
  await page.fill("#iq-name", "Jordan Example");
  await page.fill("#iq-email", "jordan@example.com");
  await page.check("#iq-consent");
  await page.locator("#iq-email").press("Enter");
  await expect(page.locator(".iq-sent[role=status]")).toBeVisible();
  expect(problems).toEqual([]);
});

test("FAQ: 18 questions open and close by keyboard", async ({ page }) => {
  await page.goto("/faq");
  const items = page.locator("details.fq-item");
  await expect(items).toHaveCount(18);
  const summary = items.first().locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(items.first()).toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(items.first()).not.toHaveAttribute("open", "");
});

test("navigation: active state, back/forward, transition leaves no duplicate scroll triggers", async ({ page }) => {
  await skipOpening(page);
  await page.goto("/about");
  const count = () => page.evaluate(() => (window as unknown as { __lab?: { ScrollTrigger: { getAll(): unknown[] } } }).__lab?.ScrollTrigger.getAll().length ?? -1);
  await page.locator('header a[href="/our-home"]').first().click();
  await expect(page).toHaveURL(/\/our-home$/);
  await expect(page.locator('header a[href="/our-home"]').first()).toHaveAttribute("aria-current", "page");
  const first = await count();
  expect(first).toBeGreaterThanOrEqual(0);
  for (const href of ["/lifestyle", "/our-home", "/gallery", "/our-home"]) {
    await page.locator(`header a[href="${href}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  }
  await expect.poll(count).toBe(first);
  await page.goBack();
  await expect(page).toHaveURL(/\/gallery$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/our-home$/);
  await expect(page.locator("h1:visible")).toHaveCount(1);
});

// Regression for the confirmed M10 defect (WCAG 2.4.11 Focus Not Obscured): when focus
// moved to a control above the current scroll position, the browser scrolled it to the very
// top where the fixed header covered it. Fix: html { scroll-padding-top: 6.5rem } plus
// scroll-margin-top on the form, FAQ groups and in-page section targets. Native focus() and
// fragment navigation both honor scroll-padding, so the focused target must land at or below
// the header's bottom edge.
test("keyboard focus and fragment targets are never hidden under the fixed header", async ({ page }) => {
  await skipOpening(page);
  const headerBottom = async () => {
    const b = await page.locator("header.site-header").boundingBox();
    return (b?.y ?? 0) + (b?.height ?? 0);
  };
  for (const height of [900, 560]) { // full and short viewports
    // A focusable control above the fold, reached after scrolling down, is not obscured.
    await page.setViewportSize({ width: 1024, height });
    await page.goto("/faq");
    const bottom = await headerBottom();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.evaluate(() => (document.querySelector("details.fq-item summary") as HTMLElement).focus());
    const top = await page.evaluate(() => document.querySelector("details.fq-item summary")!.getBoundingClientRect().top);
    expect(top, `faq summary @${height}`).toBeGreaterThanOrEqual(bottom - 2);
  }
  // The contact form control, focused from the page bottom, clears the header.
  await page.setViewportSize({ width: 1024, height: 560 });
  await page.goto("/contact");
  const bottom = await headerBottom();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.evaluate(() => (document.querySelector("#iq-name") as HTMLElement).focus());
  const inputTop = await page.evaluate(() => document.querySelector("#iq-name")!.getBoundingClientRect().top);
  expect(inputTop, "contact input").toBeGreaterThanOrEqual(bottom - 2);
  // Fragment navigation to the inquiry section respects scroll-padding.
  await page.goto("/contact#inquire");
  const formTop = await page.evaluate(() => document.querySelector("form[aria-labelledby='iq-title']")!.getBoundingClientRect().top);
  expect(formTop, "inquire fragment").toBeGreaterThanOrEqual((await headerBottom()) - 2);
});

test("axe: representative layouts and states", async ({ page }) => {
  test.setTimeout(120_000);
  await skipOpening(page);
  for (const path of ["/about", "/our-home", "/accommodations", "/amenities", "/lifestyle", "/dining", "/care-services", "/our-team",
    "/gallery", "/contact", "/resources", "/resources/feeling-at-home", "/faq", "/privacy", "/no-such-page"]) {
    await page.goto(path);
    if (path === "/faq") await page.locator("details.fq-item summary").first().click();
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(violations.map((v) => `${path}: ${v.id}`)).toEqual([]);
  }
  await page.goto("/gallery");
  await page.locator(".gl-thumb").first().click();
  const { violations } = await new AxeBuilder({ page }).include("dialog").analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
});
