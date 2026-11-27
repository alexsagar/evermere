/* eslint-disable @typescript-eslint/no-require-imports -- Opt-in connected browser and reversible media verification. */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { createHmac } = require("node:crypto");
const { createRequire } = require("node:module");
const { chromium } = require("@playwright/test");
const { session, PROJECT, DATASET, root } = require("./sanity-session.cjs");
const origin = "http://127.0.0.1:3000";
require("./sanity-loader.cjs");
const { responsiveSanityImageUrl } = require("../src/lib/content-image.ts");
async function main() {
  assert(process.argv.includes("--confirm=8nawnqp2/development"));
  createRequire(require.resolve("next/package.json"))("@next/env").loadEnvConfig(root);
  assert.equal(process.env.CONTENT_SOURCE, "sanity");
  assert.equal(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, PROJECT);
  assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET, DATASET);
  const { client } = await session(PROJECT, DATASET);
  const site = await client.getDocument("siteSettings");
  const gallery = await client.getDocument("gallery.exterior");
  assert(!await client.getDocument("drafts.siteSettings"));
  assert(!await client.getDocument("drafts.gallery.exterior"));
  const assets = JSON.parse(fs.readFileSync(path.join(root, "sanity/migration/assets.json"), "utf8"));
  const remoteAssets = new Map((await client.fetch('*[_type == "sanity.imageAsset"]{_id,url}')).map((a) => [a._id, a]));
  const portrait = assets.find((a) => a.metadata && a.height > a.width);
  assert(portrait);
  const folder = path.join(root, ".cache/cms-verification/screenshots");
  fs.mkdirSync(folder, { recursive: true });
  const results = { project: PROJECT, dataset: DATASET, screenshots: [], images: [], browserErrors: [], unauthorizedWrites: [], textures: [] };
  async function notify(id, type) {
    const body = JSON.stringify({ _id: id, _type: type }), time = Date.now();
    const signature = `t=${time},v1=${createHmac("sha256", process.env.SANITY_REVALIDATE_SECRET).update(`${time}.${body}`).digest("base64url")}`;
    assert.equal((await fetch(`${origin}/api/sanity/revalidate`, { method: "POST", headers: { "sanity-webhook-signature": signature }, body })).status, 204);
  }
  async function change(id, values) {
    assert(!await client.getDocument(`drafts.${id}`));
    const published = await client.getDocument(id);
    await client.action({ actionType: "sanity.action.document.edit", draftId: `drafts.${id}`, publishedId: id, patch: { set: values } });
    const draft = await client.getDocument(`drafts.${id}`);
    await client.action({ actionType: "sanity.action.document.publish", draftId: draft._id, publishedId: id, ifPublishedRevisionId: published._rev, ifDraftRevisionId: draft._rev });
  }
  const browser = await chromium.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => sessionStorage.setItem("evermere:opening-seen", "1"));
  const page = await context.newPage();
  page.on("pageerror", (e) => results.browserErrors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("404")) results.browserErrors.push(m.text()); });
  page.on("request", (r) => {
    const url = new URL(r.url());
    if (!["GET", "HEAD"].includes(r.method()) && !url.pathname.startsWith("/_next/")) results.unauthorizedWrites.push({ method: r.method(), host: url.hostname, path: url.pathname });
    if (url.hostname === "cdn.sanity.io" && url.searchParams.get("fit") === "max" && url.searchParams.get("h") === "1280") results.textures.push({ path: url.pathname, w: url.searchParams.get("w"), h: url.searchParams.get("h") });
  });
  try {
    // Every approved photograph is requested at the same bounded thumbnail size the gallery uses.
    for (const asset of assets.filter((a) => a.metadata)) {
      const remote = remoteAssets.get(asset._id);
      const response = await fetch(responsiveSanityImageUrl(remote.url, 640), { signal: AbortSignal.timeout(20000) });
      assert.equal(response.status, 200, asset.key);
      const buffer = Buffer.from(await response.arrayBuffer());
      const size = await require("sharp")(buffer).metadata();
      assert(size.width <= 640);
      assert(Math.abs(size.width / size.height - asset.width / asset.height) < 0.03);
      results.images.push({ key: asset.key, width: size.width, height: size.height, bytes: buffer.length });
      if (results.images.length % 14 === 0) console.log(`Verified CDN photographs ${results.images.length}/56`);
    }
    const routes = ["/", "/our-home", "/accommodations", "/amenities", "/lifestyle", "/dining", "/gallery", "/contact", "/resources/choosing-a-community"];
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        const response = await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
        assert.equal(response.status(), 200, route);
        assert.equal(await page.locator("h1").count(), 1);
        assert(await page.locator('meta[name="robots"]').getAttribute("content").then((v) => v.includes("noindex")));
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert(await page.evaluate(() => getComputedStyle(document.body).fontFamily.toLowerCase().includes("manrope")));
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < height; y += 750) { await page.evaluate((position) => scrollTo(0, position), y); await page.waitForTimeout(25); }
        await page.waitForTimeout(500);
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(400);
        const file = `${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}-${width}.jpg`;
        await page.screenshot({ path: path.join(folder, file), fullPage: true, type: "jpeg", quality: 78, animations: "disabled" });
        results.screenshots.push(file);
      }
    }
    // Independent logo fields and favicon use existing approved assets; no new asset upload.
    try {
      await change("siteSettings", { logo: site.favicon, logoDark: site.favicon, favicon: site.logo });
      await notify("siteSettings", "siteSettings");
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${origin}/about`, { waitUntil: "networkidle" });
        assert.equal(await page.locator("header .site-logo img").count(), 2);
        assert.equal(await page.locator("footer img").count(), 1);
        const boxes = await page.locator("header .site-logo img").evaluateAll((els) => els.map((el) => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height, fit: getComputedStyle(el).objectFit })));
        assert(boxes.every((b) => b.width > 0 && b.height <= 40 && b.fit === "contain"));
        const favicon = await page.locator('link[rel="icon"]').getAttribute("href");
        assert(favicon.includes(site.logo.asset._ref.split("-")[1]));
        if (width === 390) {
          await page.getByRole("button", { name: /menu/i }).click();
          assert(await page.getByRole("dialog").isVisible());
          await page.keyboard.press("Escape");
        }
      }
      results.brand = { independentLightDarkFields: true, squareReplacementFitsDesktopMobileFooter: true, faviconMetadataUpdates: true, originalRestored: true };
    } finally {
      await change("siteSettings", { logo: site.logo, logoDark: site.logoDark, favicon: site.favicon });
      await notify("siteSettings", "siteSettings");
    }
    // Replace one chapter's first photograph with an already uploaded portrait, then restore.
    const changed = structuredClone(gallery.images);
    changed[0] = { ...changed[0], asset: { _type: "reference", _ref: portrait._id }, alt: "M81 approved portrait dimension verification",
      caption: "M81 temporary portrait caption", hotspot: { _type: "sanity.imageHotspot", x: 0.5, y: 0.5, width: 1, height: 1 } };
    try {
      await change(gallery._id, { images: changed });
      await notify(gallery._id, "gallery");
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${origin}/gallery`, { waitUntil: "networkidle" });
      const thumbnail = page.getByRole("button", { name: "View larger: M81 approved portrait dimension verification", exact: true });
      const img = thumbnail.locator("img");
      assert.equal(Number(await img.getAttribute("width")), portrait.width);
      assert.equal(Number(await img.getAttribute("height")), portrait.height);
      await page.getByRole("button", { name: "Enter the exhibition" }).click();
      await page.locator(".ex-stage canvas").waitFor({ state: "visible", timeout: 15000 });
      await page.locator(".ex-caption").filter({ hasText: "M81 temporary portrait caption" }).waitFor();
      await page.getByRole("button", { name: "Look closer" }).click();
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(folder, "exhibition-portrait-close.jpg"), type: "jpeg", quality: 85 });
      await page.getByRole("button", { name: "Step back" }).click();
      await page.getByRole("button", { name: "Back to gallery" }).click();
      await page.locator(".ex-stage canvas").waitFor({ state: "detached" });
      assert(results.textures.length > 0);
      assert(results.textures.every((t) => t.w === "1280" && t.h === "1280" && t.path.includes(`/${PROJECT}/${DATASET}/`)));
      results.replacement = { asset: portrait.key, width: portrait.width, height: portrait.height, sameAssetReused: true, galleryDimensions: true, exhibitionAndCloseLook: true, caption: true, canvasDisposed: true, restored: true };
    } finally {
      await change(gallery._id, { images: gallery.images });
      await notify(gallery._id, "gallery");
    }
    // Conventional mobile and reduced-motion fallback stay available in connected CMS mode.
    const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(`${origin}/gallery`, { waitUntil: "networkidle" });
    assert.equal(await reducedPage.getByRole("button", { name: "Enter the exhibition" }).count(), 0);
    assert.equal(await reducedPage.locator(".gl-wall li").count(), 56);
    await reduced.close();
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(`${origin}/gallery`, { waitUntil: "networkidle" });
    assert.equal(await page.getByRole("button", { name: "Enter the exhibition" }).count(), 0);
    assert.equal(await page.locator(".gl-wall li").count(), 56);
    results.fallbacks = { mobile: true, reducedMotion: true };
    assert.deepEqual(results.browserErrors, []);
    assert.deepEqual(results.unauthorizedWrites, []);
    assert.equal(await client.fetch('count(*[!(_id in path("_.**"))])'), 120);
    fs.writeFileSync(path.join(root, ".cache/cms-verification/visual.json"), JSON.stringify(results, null, 2));
    console.log(JSON.stringify({ images: results.images.length, views: results.screenshots.length, branding: results.brand, replacement: results.replacement, fallbacks: results.fallbacks, browserErrors: 0, unauthorizedWrites: 0 }, null, 2));
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(JSON.stringify({ error: "Connected visual verification stopped", name: error.name, status: error.statusCode,
  detail: error.code === "ERR_ASSERTION" || error.name === "TimeoutError" ? error.message.slice(0, 500) : undefined })); process.exitCode = 1; });
