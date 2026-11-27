/* eslint-disable @typescript-eslint/no-require-imports -- Controlled, reversible crop/hotspot verification. */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { createHmac } = require("node:crypto");
const { createRequire } = require("node:module");
const { chromium } = require("@playwright/test");
const { session, PROJECT, DATASET, root } = require("./sanity-session.cjs");
require("./sanity-loader.cjs");
const { resolveContentImages, responsiveSanityImageUrl } = require("../src/lib/content-image.ts");
async function main() {
  assert(process.argv.includes("--confirm=8nawnqp2/development"));
  createRequire(require.resolve("next/package.json"))("@next/env").loadEnvConfig(root);
  const { client } = await session(PROJECT, DATASET);
  const original = await client.getDocument("gallery.exterior");
  assert(!await client.getDocument("drafts.gallery.exterior"));
  const asset = await client.getDocument(original.images[0].asset._ref);
  const changed = structuredClone(original.images);
  changed[0] = { ...changed[0], alt: "M81 temporary crop verification", crop: { _type: "sanity.imageCrop", left: 0.1, right: 0.2, top: 0.1, bottom: 0.1 },
    hotspot: { _type: "sanity.imageHotspot", x: 0.65, y: 0.4, width: 0.1, height: 0.1 } };
  const expected = resolveContentImages({ src: asset.url, width: asset.metadata.dimensions.width, height: asset.metadata.dimensions.height, crop: changed[0].crop, hotspot: changed[0].hotspot });
  async function publish(images) {
    assert(!await client.getDocument(`drafts.${original._id}`));
    const live = await client.getDocument(original._id);
    await client.action({ actionType: "sanity.action.document.edit", draftId: `drafts.${original._id}`, publishedId: original._id, patch: { set: { images } } });
    const draft = await client.getDocument(`drafts.${original._id}`);
    await client.action({ actionType: "sanity.action.document.publish", draftId: draft._id, publishedId: original._id, ifDraftRevisionId: draft._rev, ifPublishedRevisionId: live._rev });
    const body = JSON.stringify({ _id: original._id, _type: "gallery" }), time = Date.now();
    const signature = `t=${time},v1=${createHmac("sha256", process.env.SANITY_REVALIDATE_SECRET).update(`${time}.${body}`).digest("base64url")}`;
    assert.equal((await fetch("http://127.0.0.1:3000/api/sanity/revalidate", { method: "POST", headers: { "sanity-webhook-signature": signature }, body })).status, 204);
  }
  let browser;
  try {
    await publish(changed);
    const response = await fetch(responsiveSanityImageUrl(expected.src, 640));
    assert.equal(response.status, 200);
    const delivered = await require("sharp")(Buffer.from(await response.arrayBuffer())).metadata();
    assert(Math.abs(delivered.width / delivered.height - expected.width / expected.height) < 0.01);
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto("http://127.0.0.1:3000/gallery", { waitUntil: "networkidle" });
    const image = page.getByRole("button", { name: "View larger: M81 temporary crop verification", exact: true }).locator("img");
    await image.scrollIntoViewIfNeeded();
    assert.equal(Number(await image.getAttribute("width")), expected.width);
    assert.equal(Number(await image.getAttribute("height")), expected.height);
    const style = await image.evaluate((el) => getComputedStyle(el).objectPosition.split(" ").map(parseFloat));
    assert(Math.abs(style[0] / 100 - expected.hotspot.x) < 0.001);
    assert(Math.abs(style[1] / 100 - expected.hotspot.y) < 0.001);
    const report = { project: PROJECT, dataset: DATASET, croppedWidth: expected.width, croppedHeight: expected.height, cdnWidth: delivered.width, cdnHeight: delivered.height,
      cropRectangle: new URL(expected.src).searchParams.get("rect"), remappedFocalPoint: expected.hotspot, browserDimensionsAndFocalPosition: true, restored: true };
    await page.screenshot({ path: path.join(root, ".cache/cms-verification/screenshots/crop-hotspot.jpg"), type: "jpeg", quality: 85 });
    fs.writeFileSync(path.join(root, ".cache/cms-verification/crop.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await publish(original.images);
    if (browser) await browser.close();
  }
}
main().catch((error) => { console.error(JSON.stringify({ error: "Crop verification stopped", name: error.name, status: error.statusCode, detail: error.code === "ERR_ASSERTION" ? error.message : undefined })); process.exitCode = 1; });
