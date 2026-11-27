import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { photos } from "../../src/content/photos";

function watch(page: Page) {
  const problems: string[] = [];
  page.on("console", (m) => m.type() === "error" && problems.push(m.text()));
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("requestfailed", (r) => problems.push(`failed: ${r.url()}`));
  page.on("response", (r) => r.status() >= 400 && problems.push(`${r.status()}: ${r.url()}`));
  return problems;
}

for (const width of [1440, 1280, 768, 390, 320]) {
  test(`creative review at ${width}px: layout, logo, font, noindex, axe`, async ({ page }) => {
    const problems = watch(page);
    await page.setViewportSize({ width, height: 900 });

    const res = await page.goto("/dev/creative");
    expect(res?.status()).toBe(200);
    expect(res?.headers()["x-robots-tag"]).toContain("noindex");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

    // Finalized logo: reversed lockup in the opening, primary lockup in the logo band.
    await expect(page.locator('header svg[data-logo="reversed"]')).toHaveAttribute("aria-label", "Evermere Senior Living");
    await expect(page.locator('#logo svg[data-logo="primary"]').first()).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toMatch(/manrope/i);
    expect(await page.evaluate(async () => (await document.fonts.ready, document.fonts.check("16px Manrope")))).toBe(true);

    // Every photograph carries descriptive alt text, never a file id.
    const alts = await page.locator("img").evaluateAll((imgs) => imgs.map((i) => [i.getAttribute("alt") ?? "", i.getAttribute("src") ?? ""]));
    for (const [alt, src] of alts) {
      expect(alt.length, src).toBeGreaterThan(20);
      expect(alt, src).not.toMatch(/^[a-z]+(-[a-z]+)+$/);
    }

    if (width === 1440 || width === 390) {
      const axe = await new AxeBuilder({ page }).analyze();
      expect(axe.violations).toEqual([]);
    }
    expect(problems).toEqual([]);
  });
}

test("creative review renders every photograph in the collection", async ({ page }) => {
  const problems = watch(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dev/creative#collection");

  const thumbs = page.locator("#collection img[data-photo]");
  await expect(thumbs).toHaveCount(photos.length);
  for (const img of await thumbs.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0), { message: await img.getAttribute("data-photo") ?? "" }).toBe(true);
  }
  expect(problems).toEqual([]);
});

test("full-resolution viewer: keyboard open, focus trap, Escape closes and restores focus", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/dev/creative#collection");
  const id = photos[0].id;
  const link = page.locator(`a[href="#view-${id}"]`);
  const viewer = page.locator(`#view-${id}`);

  await link.focus();
  await page.keyboard.press("Enter");
  await expect(viewer).toBeVisible();
  await expect(viewer).toHaveAttribute("role", "dialog");
  await expect(viewer.locator(".viewer-close")).toBeFocused();
  await expect(viewer.locator("img")).toHaveAttribute("alt", photos[0].alt);
  await expect.poll(() => viewer.locator("img").evaluate((i: HTMLImageElement, w) => i.complete && i.naturalWidth === w, photos[0].width)).toBe(true);

  // Tab cycles between the close button and the scrollable image only.
  await page.keyboard.press("Tab");
  await expect(viewer.locator(".viewer-scroll")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(viewer.locator(".viewer-close")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(viewer.locator(".viewer-scroll")).toBeFocused();

  const axe = await new AxeBuilder({ page }).include(`#view-${id}`).analyze();
  expect(axe.violations).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
  await expect(link).toBeFocused();

  // The Close link behaves the same way.
  await page.keyboard.press("Enter");
  await expect(viewer).toBeVisible();
  // :target shows the viewer before the async hashchange handler moves focus; wait for it.
  await expect(viewer.locator(".viewer-close")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(viewer).toBeHidden();
  await expect(link).toBeFocused();
  expect(problems).toEqual([]);
});
