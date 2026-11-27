import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Software WebGL (SwiftShader): proves behavior and lifecycle, not GPU performance.
test.use({ launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] }, viewport: { width: 1440, height: 900 } });

/** Records whether any script containing three.js arrives. */
function watchThree(page: Page) {
  const seen = { three: false };
  page.on("response", async (r) => {
    if (r.request().resourceType() !== "script") return;
    const body = await r.text().catch(() => "");
    if (body.includes("WebGLRenderer")) seen.three = true;
  });
  return seen;
}

const live = (page: Page) => page.evaluate(() => [...document.querySelectorAll("canvas")].filter((c) => {
  const gl = c.getContext("webgl2") ?? c.getContext("webgl");
  return gl && !gl.isContextLost();
}).length);

const enter = (page: Page) => page.getByRole("button", { name: "Enter the exhibition" });
const caption = (page: Page) => page.locator(".ex-count");

test("gallery loads without three.js; the exhibition loads it on demand and works by keyboard, buttons and drag", async ({ page }) => {
  const seen = watchThree(page);
  await page.goto("/gallery", { waitUntil: "networkidle" });
  await expect(page.locator(".gl-wall li").first()).toBeVisible();
  expect(seen.three).toBe(false);

  await enter(page).click();
  const dialog = page.getByRole("dialog", { name: "Exhibition" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Back to gallery" })).toBeFocused();
  await expect(page.locator("[data-exhibition-canvas] canvas, .ex-stage canvas")).toHaveCount(1);
  await expect.poll(() => seen.three).toBe(true);
  await expect(caption(page)).toContainText("1 of ");

  await page.keyboard.press("ArrowRight");
  await expect(caption(page)).toContainText("2 of ");
  await page.getByRole("button", { name: "Previous" }).click();
  await expect(caption(page)).toContainText("1 of ");

  const box = (await page.locator(".ex-stage").boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect(caption(page)).toContainText("2 of ");

  // Chapters narrow the wall to one category.
  await dialog.getByRole("button", { name: "Suites" }).click();
  await expect(caption(page)).toContainText("1 of ");
  await expect(caption(page)).toContainText("Suites");

  // Look closer, then Escape steps back before a second Escape leaves.
  await page.getByRole("button", { name: "Look closer" }).click();
  await expect(page.getByRole("button", { name: "Step back" })).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Look closer" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(enter(page)).toBeFocused();
  await expect.poll(() => live(page)).toBe(0);
});

test("full size opens the existing viewer above the exhibition", async ({ page }) => {
  await page.goto("/gallery");
  await enter(page).click();
  await page.keyboard.press("ArrowRight");
  const alt = (await page.locator(".ex-caption").textContent())!.replace(/^.*?(Suites|house|trees|Inside|table|here|Outdoors)/, "").trim();
  await page.getByRole("button", { name: "Full size" }).click();
  const viewer = page.locator(".gl-viewer");
  await expect(viewer).toBeVisible();
  await expect(viewer.locator(".gl-viewer-caption")).toHaveText(alt);
  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
  await expect(page.getByRole("dialog", { name: "Exhibition" })).toBeVisible();
});

test("repeated opening and closing keeps one context at most; leaving the page releases it", async ({ page }) => {
  // Four open/close cycles plus history navigation, each creating and tearing down a WebGL
  // context. Under software rendering and full-suite load the correct path is slow, not
  // broken, so the default 30 s test budget is too tight; give it room without weakening
  // any assertion below.
  test.setTimeout(90_000);
  // The suite runs on `next dev`, which compiles a route on first request. Under parallel
  // load that compile, not the application, delayed the client navigation below past its
  // timeout. Render /gallery and /about once first so the test measures the app.
  await page.goto("/about");
  await page.goto("/gallery");
  await expect(enter(page)).toBeVisible();
  await page.goto("/");
  await page.locator("header").getByRole("link", { name: "Gallery", exact: true }).click();
  await expect(page).toHaveURL(/\/gallery$/, { timeout: 20_000 });
  for (let i = 0; i < 4; i++) {
    await enter(page).click();
    await expect(page.locator(".ex-stage canvas")).toHaveCount(1);
    expect(await live(page)).toBeLessThanOrEqual(1);
    await page.getByRole("button", { name: "Back to gallery" }).click();
    await expect.poll(() => live(page)).toBe(0);
  }
  await enter(page).click();
  await expect(page.locator(".ex-stage canvas")).toHaveCount(1);
  // Client history navigation away with the exhibition open.
  await page.evaluate(() => history.back());
  await expect(page).toHaveURL(/\/$/, { timeout: 20_000 });
  await expect.poll(() => live(page)).toBe(0);
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await page.locator("header").getByRole("link", { name: "About", exact: true }).click(); // the new page is not inert
  await expect(page).toHaveURL(/\/about$/, { timeout: 20_000 });
});

test("axe: exhibition open is clean", async ({ page }) => {
  await page.goto("/gallery");
  await enter(page).click();
  await expect(caption(page)).toContainText("1 of ");
  await page.waitForTimeout(1200);
  const axe = await new AxeBuilder({ page }).include(".ex").analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
});

test.describe("no exhibition offer", () => {
  test("reduced motion keeps the conventional gallery only", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/gallery");
    await expect(page.locator(".gl-wall li").first()).toBeVisible();
    await expect(enter(page)).toHaveCount(0);
  });
  test("phones keep the conventional gallery only", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/gallery");
    await expect(page.locator(".gl-wall li").first()).toBeVisible();
    await expect(enter(page)).toHaveCount(0);
  });
  test("no WebGL keeps the conventional gallery only", async ({ page }) => {
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        return /webgl/.test(type) ? null : (get as (...a: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof get;
    });
    await page.goto("/gallery");
    await expect(page.locator(".gl-wall li").first()).toBeVisible();
    await expect(enter(page)).toHaveCount(0);
  });
});

test("context loss closes the exhibition and keeps the gallery", async ({ page }) => {
  await page.goto("/gallery");
  await enter(page).click();
  await expect(page.locator(".ex-stage canvas")).toHaveCount(1);
  await expect(caption(page)).toContainText("1 of ");
  await page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>(".ex-stage canvas")!;
    (c.getContext("webgl2") ?? c.getContext("webgl"))!.getExtension("WEBGL_lose_context")!.loseContext();
  });
  await expect(page.getByRole("dialog", { name: "Exhibition" })).toBeHidden();
  await expect(page.getByRole("status")).toContainText("could not start");
  await expect(page.locator(".gl-wall li").first()).toBeVisible();
});

test("unrelated routes never load three.js", async ({ page }) => {
  const seen = watchThree(page);
  for (const path of ["/", "/our-home", "/accommodations", "/contact"]) await page.goto(path, { waitUntil: "networkidle" });
  expect(seen.three).toBe(false);
});
