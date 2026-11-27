import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const width of [1440, 1280, 768, 390, 320]) {
  test(`brand review at ${width}px: no overflow, errors or axe violations`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width, height: 900 });

    const res = await page.goto("/dev/brand");
    expect(res?.status()).toBe(200);
    expect(res?.headers()["x-robots-tag"]).toContain("noindex");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(width);

    // The finalized Threshold lockups render in every color variant, and every mark has real geometry.
    for (const v of ["primary", "lavender", "reversed", "white", "midnight"]) {
      await expect(page.locator(`svg[data-logo="${v}"]`).first()).toBeVisible();
    }
    const marks = await page.locator("svg[data-mark], svg[data-logo]").evaluateAll((svgs) =>
      svgs.map((s) => (s as SVGGraphicsElement).getBBox().width > 0),
    );
    expect(marks.length).toBeGreaterThan(0);
    expect(marks.every(Boolean)).toBe(true);
    expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toMatch(/manrope/i);

    if (width === 1440 || width === 320) {
      const axe = await new AxeBuilder({ page })
        // Contrast samples deliberately show failing pairs; their ratios are unit-tested.
        .exclude("[data-contrast-sample]")
        .analyze();
      expect(axe.violations).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}

test("finalized logo files are served as SVG", async ({ request }) => {
  const files = [
    ...["primary", "midnight", "lavender", "reversed", "white"].flatMap((v) => [`evermere-horizontal-${v}`, `evermere-mark-${v}`]),
    "evermere-mark-small-primary",
  ];
  expect(files).toHaveLength(11);
  for (const f of files) {
    const res = await request.get(`/brand/${f}.svg`);
    expect(res.status(), f).toBe(200);
    expect(await res.text(), f).toContain("<svg");
  }
});
