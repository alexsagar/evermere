import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const ROUTES = ["", "/opening", "/opening?v=gl", "/transitions", "/journey", "/gallery", "/editorial", "/passage/library", "/inquiry"];
const WIDTHS = [1920, 1440, 1280, 1024, 768, 390, 320];
const lab = (r: string) => `/dev/animation-lab${r}`;

function watch(page: Page) {
  const problems: string[] = [];
  page.on("console", (m) => m.type() === "error" && problems.push(m.text()));
  page.on("pageerror", (e) => problems.push(e.message));
  // Lazy images cancelled by a viewport change report ERR_ABORTED; that is not a failure.
  page.on("requestfailed", (r) => !r.failure()?.errorText.includes("ABORTED") && problems.push(`failed: ${r.url()}`));
  page.on("response", (r) => r.status() >= 400 && problems.push(`${r.status()}: ${r.url()}`));
  page.on("request", (r) => {
    const { hostname } = new URL(r.url());
    if (!["localhost", "127.0.0.1"].includes(hostname) && !r.url().startsWith("data:")) problems.push(`external: ${r.url()}`);
  });
  return problems;
}

// Live WebGL contexts. Next keeps visited routes in hidden <Activity> trees, so a
// canvas element may linger in the DOM after its context has been released.
const contexts = (page: Page) =>
  page.evaluate(() => [...document.querySelectorAll("canvas")].filter((c) => {
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    return gl && !gl.isContextLost();
  }).length);

const triggers = (page: Page) => page.evaluate(() => (window as unknown as { __lab?: { ScrollTrigger: { getAll(): unknown[] } } }).__lab?.ScrollTrigger.getAll().length ?? 0);

for (const route of ROUTES) {
  test(`lab ${route || "index"}: seven widths, no overflow, errors or external requests; axe clean`, async ({ page }) => {
    test.setTimeout(120_000);
    const problems = watch(page);
    const res = await page.goto(lab(route), { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
    expect(res?.headers()["x-robots-tag"]).toContain("noindex");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator("main h1").first()).toBeAttached();

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(250);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width}px`).toBeLessThanOrEqual(width);
      expect(await page.locator("canvas").count()).toBeLessThanOrEqual(1);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    // Audit the settled state: wait until no GSAP tween is mid-flight (intros, line
    // reveals), rather than a fixed delay that a slow run can outlast.
    await page.waitForFunction(() => {
      const g = (window as unknown as { __lab?: { gsap: typeof import("gsap").gsap } }).__lab?.gsap;
      return !!g && !g.globalTimeline.getChildren(true, true, false).some((t) => t.isActive());
    }, undefined, { timeout: 15_000, polling: 200 });
    await page.waitForTimeout(300);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
    expect(problems).toEqual([]);
  });
}

test("reduced motion: the opening shows the photograph and headline at once; the journey stacks", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(lab("/opening"));
  await expect(page.locator(".opening-cover")).toBeHidden();
  await expect(page.locator("#opening-title")).toBeVisible();
  await page.goto(lab("/journey"));
  await page.waitForTimeout(800);
  await expect(page.locator(".journey")).not.toHaveAttribute("data-pinned", "");
  expect(await triggers(page)).toBe(0);
});

test("no WebGL: transitions and gallery fall back to DOM photographs", async ({ page }) => {
  await page.goto(lab("/transitions?webgl=off"));
  await expect(page.locator(".stage img").first()).toBeVisible();
  expect(await page.locator("canvas").count()).toBe(0);
  await page.getByRole("button", { name: "Next room" }).click();
  await expect(page.getByText("2 of 6.")).toBeVisible();
  await page.goto(lab("/gallery?webgl=off"));
  expect(await page.locator("canvas").count()).toBe(0);
  await expect(page.getByRole("heading", { name: "All photographs" })).toBeVisible();
});

test("cleanup: client navigation does not leak ScrollTriggers or canvases", async ({ page }) => {
  await page.goto(lab("/journey"));
  await page.waitForTimeout(1000);
  const first = await triggers(page);
  expect(first).toBeGreaterThan(0);
  const nav = page.getByRole("navigation", { name: "Experiments" });
  for (let i = 0; i < 2; i++) {
    await nav.getByRole("link", { name: "4. Spatial gallery" }).click();
    await page.waitForURL(/gallery/);
    await page.waitForTimeout(1200);
    await expect.poll(() => contexts(page)).toBe(1);
    await expect.poll(() => triggers(page)).toBe(0);
    await nav.getByRole("link", { name: "3. Architectural journey" }).click();
    await page.waitForURL(/journey/);
    await page.waitForTimeout(1200);
    await expect.poll(() => triggers(page)).toBe(first);
    await expect.poll(() => contexts(page)).toBe(0);
  }
});

test("gallery: keyboard opens the full-size dialog, Escape closes and returns focus", async ({ page }) => {
  await page.goto(lab("/gallery"));
  const thumb = page.getByRole("button", { name: /^View full size: / }).nth(2);
  await thumb.focus();
  await page.keyboard.press("Enter");
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(thumb).toBeFocused();
});

test("page transitions: links, history and focus", async ({ page }) => {
  const problems = watch(page);
  await page.goto(lab("/passage/library"));
  await expect(page.getByRole("heading", { level: 1, name: "The Library" })).toBeVisible();
  await page.getByRole("link", { name: "Continue to a suite" }).click();
  await expect(page).toHaveURL(/passage\/suite/);
  await expect(page.getByRole("heading", { level: 1, name: "Make it yours" })).toBeFocused();
  // Repeated and interrupted navigation settles on the last destination.
  await page.getByRole("link", { name: "Back to the Library" }).click();
  await expect(page).toHaveURL(/passage\/library/);
  await page.goBack();
  await expect(page).toHaveURL(/passage\/suite/);
  await page.goForward();
  await expect(page).toHaveURL(/passage\/library/);
  await expect(page.getByRole("heading", { level: 1, name: "The Library" })).toBeVisible();
  expect(problems).toEqual([]);
});

test("inquiry: validation, demonstration success, only the local endpoint is called", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (r) => r.method() !== "GET" && posts.push(r.url()));
  await page.goto(lab("/inquiry"));
  await page.getByRole("button", { name: "Arrange a visit" }).click();
  await expect(page.getByLabel("Your name")).toBeFocused();
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.locator(".iq-summary")).toBeFocused();
  await expect(page.getByLabel("Your name")).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel("Your name").fill("Jordan Avery");
  await page.getByLabel("Email address").fill("jordan@example.com");
  await page.getByLabel(/privacy notice/).check();
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByRole("heading", { name: "Your inquiry is ready." })).toBeFocused();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("button", { name: "Arrange a visit" })).toBeFocused();
  await page.getByRole("button", { name: "Arrange a visit" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Arrange a visit" })).toBeFocused();
  expect(posts.filter((u) => !u.includes("__nextjs")).map((u) => new URL(u).pathname)).toEqual(["/api/inquiry"]);
});
