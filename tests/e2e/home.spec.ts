import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const WIDTHS = [1920, 1440, 1280, 1024, 768, 390, 320];

function watch(page: Page) {
  const problems: string[] = [];
  page.on("console", (m) => m.type() === "error" && problems.push(m.text()));
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("requestfailed", (r) => !r.failure()?.errorText.includes("ABORTED") && problems.push(`failed: ${r.url()}`));
  page.on("response", (r) => r.status() >= 400 && problems.push(`${r.status()}: ${r.url()}`));
  page.on("request", (r) => {
    const { hostname, protocol } = new URL(r.url());
    if (protocol.startsWith("http") && !["localhost", "127.0.0.1"].includes(hostname)) problems.push(`external: ${r.url()}`);
  });
  return problems;
}

// Mark the opening as seen so audits run on the settled page.
const skipOpening = (page: Page) => page.addInitScript(() => sessionStorage.setItem("evermere:opening-seen", "1"));

test("homepage: seven widths without overflow, errors or external requests", async ({ page }) => {
  test.setTimeout(120_000);
  const problems = watch(page);
  const res = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(res?.status()).toBe(200);
  expect(res?.headers()["x-robots-tag"]).toContain("noindex");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator('header svg[data-logo]').first()).toBeAttached();
  expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toMatch(/manrope/i);
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width}px`).toBeLessThanOrEqual(width);
  }
  expect(problems).toEqual([]);
});

test("homepage SEO: title, description, canonical and Open Graph", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Evermere/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{60,}/);
  // Local demo: the canonical resolves to the configured origin (NEXT_PUBLIC_SITE_URL).
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https?:\/\/[^/]+\/?$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/photos\//);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Evermere/);
});

for (const width of [1440, 390]) {
  test(`homepage at ${width}px: no axe violations after scrolling every section`, async ({ page }) => {
    test.setTimeout(120_000);
    await skipOpening(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 600) await page.evaluate((y) => scrollTo(0, y), y);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(800);
    const axe = await new AxeBuilder({ page }).exclude("canvas").analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
  });
}

test("the opening plays once per session and never hides the hero content", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero-cover.is-live")).toBeVisible();
  await expect(page.locator("#hero-title")).toBeAttached();
  await expect(page.locator(".hero-cover")).toHaveCount(0, { timeout: 8000 });
  await page.reload();
  await page.waitForTimeout(600);
  await expect(page.locator(".hero-cover.is-live")).toHaveCount(0);
  await expect(page.locator("#hero-title")).toBeVisible();
});

test("reduced motion: complete static hero, stacked journey, no WebGL", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".hero-cover")).toBeHidden();
  await expect(page.locator("#hero-title")).toBeVisible();
  await expect(page.getByRole("link", { name: "Arrange a visit" }).first()).toBeVisible();
  await page.locator(".outdoors").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await expect(page.locator(".journey")).not.toHaveAttribute("data-pinned", "");
  expect(await page.locator("canvas").count()).toBe(0);
});

test("without JavaScript, every chapter and the inquiry anchor are in the page", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator("#hero-title")).toBeVisible();
    expect(await page.locator("main h2").count()).toBeGreaterThanOrEqual(11);
    await expect(page.locator("#inquire")).toBeAttached();
    await expect(page.locator(".hero-cover")).toBeHidden();
  } finally {
    await ctx.close();
  }
});

test("homepage never creates a WebGL context or loads three.js", async ({ page }) => {
  await skipOpening(page);
  const scripts: string[] = [];
  page.on("response", async (r) => { if (r.request().resourceType() === "script") scripts.push((await r.text().catch(() => "")).slice(0, 300000)); });
  await page.goto("/");
  await page.locator(".outdoors").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  expect(await page.locator("canvas").count()).toBe(0);
  expect(scripts.some((s) => s.includes("WebGLRenderer"))).toBe(false);
});

test("Outdoors arch starts closed and opens with scroll (CSS clip)", async ({ page }) => {
  await skipOpening(page);
  await page.goto("/");
  const clip = () => page.locator(".od-to").evaluate((e) => getComputedStyle(e).clipPath);
  await page.locator(".outdoors").scrollIntoViewIfNeeded();
  // Closed: a narrow arch measured in px (top inset ~58% of the stage).
  await expect.poll(clip).toMatch(/^inset\([1-9][\d.]*px /);
  await page.evaluate(() => { const el = document.querySelector(".outdoors") as HTMLElement; scrollTo(0, el.offsetTop + el.offsetHeight); });
  await expect.poll(clip).toMatch(/^inset\(0(%|px)?[ )]/);
});

test("no WebGL preview flag changes nothing on the homepage", async ({ page }) => {
  await skipOpening(page);
  await page.goto("/?webgl=off");
  await page.locator(".outdoors").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  expect(await page.locator("canvas").count()).toBe(0);
  await expect(page.locator(".od-from img")).toBeAttached();
});

test("mobile menu: opens as a modal, Escape closes, focus and scrolling return", async ({ page }) => {
  await skipOpening(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const button = page.getByRole("button", { name: "Menu" });
  await button.click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("button", { name: "Close" })).toBeFocused();
  await expect(menu.getByRole("link", { name: "Our home" })).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(button).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
});

test("skip link moves focus to the main content", async ({ page }) => {
  await skipOpening(page);
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("inquiry: the header action opens the panel; demonstration submission sends nothing", async ({ page }) => {
  await skipOpening(page);
  const writes: string[] = [];
  page.on("request", (r) => r.method() !== "GET" && writes.push(r.url()));
  await page.goto("/");
  await page.locator("header .site-cta").click();
  await expect(page.getByLabel("Your name")).toBeFocused();
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.locator(".iq-summary")).toBeFocused();
  await page.getByLabel("Your name").fill("Jordan Avery");
  await page.getByLabel("Email address").fill("jordan@example.com");
  await page.getByLabel(/privacy notice/).check();
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByRole("heading", { name: "Your inquiry is ready." })).toBeFocused();
  await expect(page.getByText(/nothing was sent or stored/)).toBeVisible();
  // The only write is the same-origin demonstration endpoint, which discards the data.
  expect(writes.filter((u) => !u.includes("__nextjs")).map((u) => new URL(u).pathname)).toEqual(["/api/inquiry"]);
});
