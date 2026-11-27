/* eslint-disable @typescript-eslint/no-require-imports -- Read-only live/offline visual comparison; inquiry remains a local demo. */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require("@playwright/test");
const root = path.resolve(__dirname, "..");
const folder = path.join(root, ".cache/cms-verification/screenshots");
let stage = "startup";
async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(() => sessionStorage.setItem("evermere:opening-seen", "1"));
  const live = await context.newPage(), demo = await context.newPage();
  const errors = [], writes = [], comparisons = [];
  live.on("pageerror", (e) => errors.push(e.message));
  live.on("request", (r) => { if (!["GET", "HEAD"].includes(r.method()) && !r.url().includes("/_next/")) writes.push(r.method()); });
  const routes = ["/", "/our-home", "/accommodations", "/amenities", "/lifestyle", "/dining", "/gallery", "/contact", "/resources/choosing-a-community"];
  const sample = (page) => page.evaluate(() => {
    const heading = document.querySelector("h1"), rect = heading.getBoundingClientRect(), style = getComputedStyle(heading);
    return { main: document.querySelector("main").innerText.replace(/\s+/g, " "), footer: document.querySelector("footer").innerText.replace(/\s+/g, " "),
      fontSize: style.fontSize, lineHeight: style.lineHeight, width: rect.width, x: rect.x, headerHeight: document.querySelector("header").getBoundingClientRect().height };
  });
  try {
    for (const width of [1440, 390]) {
      await Promise.all([live.setViewportSize({ width, height: 900 }), demo.setViewportSize({ width, height: 900 })]);
      for (const route of routes) {
        stage = `${route} at ${width}`;
        await Promise.all([live.goto(`http://127.0.0.1:3000${route}`, { waitUntil: "domcontentloaded" }), demo.goto(`http://127.0.0.1:3100${route}`, { waitUntil: "domcontentloaded" })]);
        await Promise.all([live.locator("h1").waitFor({ state: "visible" }), demo.locator("h1").waitFor({ state: "visible" }), live.evaluate(() => document.fonts.ready), demo.evaluate(() => document.fonts.ready)]);
        await live.waitForTimeout(1200);
        const [a, b] = await Promise.all([sample(live), sample(demo)]);
        assert.equal(a.main, b.main, `Editorial content mismatch ${route} at ${width}`);
        assert.equal(a.footer, b.footer, `Footer mismatch ${route} at ${width}`);
        assert.equal(a.fontSize, b.fontSize);
        assert.equal(a.lineHeight, b.lineHeight);
        assert(Math.abs(a.width - b.width) < 1 && Math.abs(a.x - b.x) < 1, `Heading layout mismatch ${route}`);
        assert(Math.abs(a.headerHeight - b.headerHeight) < 1);
        const file = `viewport-${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}-${width}.jpg`;
        await live.screenshot({ path: path.join(folder, file), type: "jpeg", quality: 85, animations: "disabled" });
        comparisons.push({ route, width, editorialCopy: "equal", typographyAndHeadingBounds: "equal", header: "equal" });
      }
    }
    stage = "connected inquiry";
    await live.goto("http://127.0.0.1:3000/contact#inquire", { waitUntil: "domcontentloaded" });
    const form = live.locator("form[aria-labelledby='iq-title']");
    await form.getByRole("button", { name: /send|submit/i }).click();
    assert.equal(await live.locator("#iq-name").getAttribute("aria-invalid"), "true");
    await live.fill("#iq-name", "Jordan Example");
    await live.fill("#iq-contact", "jordan@example.com");
    await live.locator("#iq-contact").press("Enter");
    await live.locator(".iq-sent[role=status]").waitFor({ state: "visible" });
    stage = "non-WebGL fallback";
    const noGl = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await noGl.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type === "webgl" || type === "webgl2" ? null : original.call(this, type, ...args); };
    });
    const fallback = await noGl.newPage();
    await fallback.goto("http://127.0.0.1:3000/gallery", { waitUntil: "domcontentloaded" });
    await fallback.locator(".gl-wall li").first().waitFor({ state: "visible" });
    await fallback.waitForTimeout(1000);
    assert.equal(await fallback.locator(".gl-wall li").count(), 56);
    assert.equal(await fallback.getByRole("button", { name: "Enter the exhibition" }).count(), 0);
    await noGl.close();
    assert.deepEqual(errors, []);
    assert.deepEqual(writes, []);
    fs.writeFileSync(path.join(root, ".cache/cms-verification/comparison.json"), JSON.stringify({ comparisons, connectedInquiryDemo: true, noWebGlFallback: true, browserErrors: 0, unauthorizedWrites: 0 }, null, 2));
    console.log(JSON.stringify({ comparedViews: comparisons.length, editorialCopyAndLayoutMatch: true, connectedInquiryDemo: true, noWebGlFallback: true, browserErrors: 0, unauthorizedWrites: 0 }));
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(JSON.stringify({ error: "Connected/offline browser comparison stopped", stage, name: error.name, detail: error.code === "ERR_ASSERTION" || error.name === "TimeoutError" ? error.message.slice(0, 500) : undefined })); process.exitCode = 1; });
