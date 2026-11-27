/* eslint-disable @typescript-eslint/no-require-imports -- Opt-in controlled remote integration procedure, never a normal test. */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { createHmac } = require("node:crypto");
const { createRequire } = require("node:module");
const { createClient } = require("@sanity/client");
const { session, PROJECT, DATASET, root } = require("./sanity-session.cjs");
const origin = "http://127.0.0.1:3000";
const TEMP = "m81-temporary-article";
const clean = (doc) => Object.fromEntries(Object.entries(doc).filter(([key]) => !["_rev", "_createdAt", "_updatedAt"].includes(key)));
async function main() {
  if (!process.argv.includes("--confirm=8nawnqp2/development")) throw new Error("Explicit approved-target confirmation required");
  createRequire(require.resolve("next/package.json"))("@next/env").loadEnvConfig(root);
  assert.equal(process.env.CONTENT_SOURCE, "sanity");
  assert.equal(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, PROJECT);
  assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET, DATASET);
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  assert(secret?.length >= 32);
  const { client } = await session(PROJECT, DATASET);
  const viewer = createClient({ projectId: PROJECT, dataset: DATASET, apiVersion: "2026-11-01", perspective: "published", useCdn: false, token: process.env.SANITY_API_READ_TOKEN });
  const originals = await client.fetch('*[!(_id in path("_.**")) && _type != "sanity.imageAsset"]');
  assert.equal(originals.length, 61);
  assert(!originals.some((d) => d._id.startsWith("drafts.")));
  assert.equal(await client.getDocument(TEMP), undefined);
  const byType = (type) => originals.find((d) => d._type === type);
  const results = [];
  const backupFile = path.join(root, ".cache/cms-verification/restore.json");
  fs.mkdirSync(path.dirname(backupFile), { recursive: true });
  fs.writeFileSync(backupFile, JSON.stringify({ project: PROJECT, dataset: DATASET, originals }, null, 2));
  async function notify(id, type, valid = true) {
    const body = JSON.stringify({ _id: id, _type: type });
    const time = Date.now();
    const signature = `t=${time},v1=${createHmac("sha256", secret).update(`${time}.${body}`).digest("base64url")}`;
    const result = await fetch(`${origin}/api/sanity/revalidate`, { method: "POST", headers: { "sanity-webhook-signature": valid ? signature : "invalid", "Content-Type": "application/json" }, body });
    assert.equal(result.status, valid ? 204 : 401);
    assert.equal(await result.text(), "");
  }
  async function html(route, status = 200) {
    const response = await fetch(`${origin}${route}`);
    assert.equal(response.status, status, route);
    assert.match(response.headers.get("x-robots-tag") || "", /noindex/);
    return response.text();
  }
  async function has(route, marker, expected = true, status = 200) {
    for (let i = 0; i < 12; i++) {
      const text = await html(route, status);
      if (text.includes(marker) === expected) return;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error(`Expected content did not reach ${route}`);
  }
  async function publish(id) {
    const [draft, live] = await Promise.all([client.getDocument(`drafts.${id}`), client.getDocument(id)]);
    assert(draft);
    await client.action({ actionType: "sanity.action.document.publish", draftId: draft._id, publishedId: id,
      ifDraftRevisionId: draft._rev, ...(live ? { ifPublishedRevisionId: live._rev } : {}) });
  }
  async function edit(id, values) {
    await client.action({ actionType: "sanity.action.document.edit", draftId: `drafts.${id}`, publishedId: id, patch: { set: values } });
  }
  async function scenario(doc, field, value, marker, route) {
    await html(route);
    try {
      await edit(doc._id, { [field]: value });
      await notify(doc._id, doc._type);
      await has(route, marker, false);
      const published = await viewer.fetch('*[_id == $id][0]', { id: doc._id });
      assert(!JSON.stringify(published).includes(marker));
      await publish(doc._id);
      await notify(doc._id, doc._type);
      await has(route, marker);
      // The original seed must now refuse this editor change, without writing anything.
      require("./sanity-loader.cjs");
      const { assertSeedSafe } = require("../src/sanity/seed-safety.ts");
      const current = await client.getDocument(doc._id);
      assert.throws(() => assertSeedSafe([current], originals, []));
      results.push({ type: doc._type, field, draftHidden: true, publishedWithoutBuild: true, seedRefusesEditorChange: true });
      console.log(`Verified draft/publish/revalidation: ${doc._type}.${field}`);
    } finally {
      const draft = await client.getDocument(`drafts.${doc._id}`);
      if (draft) await client.delete(draft._id);
      const current = await client.getDocument(doc._id);
      if (JSON.stringify(current?.[field]) !== JSON.stringify(doc[field])) {
        await edit(doc._id, { [field]: doc[field] });
        await publish(doc._id);
      }
      await notify(doc._id, doc._type);
      await has(route, marker, false);
    }
  }
  const unsigned = await fetch(`${origin}/api/sanity/revalidate`, { method: "POST", body: "{}" });
  assert.equal(unsigned.status, 401);
  await notify("homePage", "homePage", false);
  await scenario(byType("homePage"), "headline", "M81 temporary homepage verification", "M81 temporary homepage verification", "/");
  await scenario(byType("siteSettings"), "tagline", "M81 temporary site verification", "M81 temporary site verification", "/about");
  await scenario(originals.find((d) => d._type === "page" && d.slug.current === "about"), "headline", "M81 temporary page verification", "M81 temporary page verification", "/about");
  await scenario(byType("accommodation"), "title", "M81 temporary suite verification", "M81 temporary suite verification", "/accommodations");
  const gallery = byType("gallery");
  const images = structuredClone(gallery.images);
  images[0].alt = "M81 temporary gallery verification";
  await scenario(gallery, "images", images, images[0].alt, "/gallery");
  await scenario(byType("faq"), "question", "M81 temporary FAQ verification", "M81 temporary FAQ verification", "/faq");
  const about = originals.find((d) => d._type === "page" && d.slug.current === "about");
  await scenario(about, "seo", { ...about.seo, title: "M81 temporary SEO verification" }, "M81 temporary SEO verification", "/about");

  // This document did not exist during the already-completed production build.
  const article = clean(byType("article"));
  const firstSlug = "m81-temporary-guide", secondSlug = "m81-renamed-guide";
  try {
    await html(`/resources/${firstSlug}`, 404); // Also verifies negative-route cache invalidation.
    await client.create({ ...article, _id: `drafts.${TEMP}`, title: "M81 temporary resource verification", slug: { _type: "slug", current: firstSlug },
      seo: { ...article.seo, title: "M81 temporary article metadata" }, order: 999 });
    await notify(TEMP, "article");
    await html(`/resources/${firstSlug}`, 404);
    await publish(TEMP);
    await notify(TEMP, "article");
    await has("/resources", "M81 temporary resource verification");
    await has(`/resources/${firstSlug}`, "M81 temporary article metadata");
    await edit(TEMP, { title: "M81 edited temporary guide" });
    await publish(TEMP);
    await notify(TEMP, "article");
    await has(`/resources/${firstSlug}`, "M81 edited temporary guide");
    await edit(TEMP, { slug: { _type: "slug", current: secondSlug } });
    await publish(TEMP);
    await notify(TEMP, "article");
    await html(`/resources/${firstSlug}`, 404);
    await has(`/resources/${secondSlug}`, "M81 edited temporary guide");
    await client.action({ actionType: "sanity.action.document.unpublish", publishedId: TEMP, draftId: `drafts.${TEMP}` });
    await notify(TEMP, "article");
    await html(`/resources/${secondSlug}`, 404);
    await has("/resources", "M81 edited temporary guide", false);
    results.push({ articleLifecycle: { postBuildPublish: true, negativeCacheCleared: true, listing: true, metadata: true, edit: true, slugChange: true, unpublish: true } });
    console.log("Verified post-build article publication, edit, slug change and unpublish.");
  } finally {
    for (const id of [`drafts.${TEMP}`, TEMP]) if (await client.getDocument(id)) await client.delete(id);
    await notify(TEMP, "article");
    await html(`/resources/${firstSlug}`, 404);
    await html(`/resources/${secondSlug}`, 404);
  }
  assert.equal(await client.fetch('count(*[!(_id in path("_.**"))])'), 120);
  assert.equal(await client.fetch('count(*[_id in path("drafts.**")])'), 0);
  const summary = { project: PROJECT, dataset: DATASET, cmsMode: true, webhook: { unsignedRejected: true, invalidRejected: true, locallySignedOnly: true }, results,
    temporaryArticleDeleted: true, finalDocumentsIncludingAssets: 120, drafts: 0, originalContentRestored: true };
  fs.writeFileSync(path.join(root, ".cache/cms-verification/publishing.json"), JSON.stringify(summary, null, 2));
  console.log("Controlled publishing verification passed; all original content restored.");
}
main().catch((error) => { console.error(JSON.stringify({ error: "Controlled integration verification stopped", name: error.name, status: error.statusCode,
  detail: error.code === "ERR_ASSERTION" ? error.message : /^(Expected content|Explicit)/.test(error.message) ? error.message : undefined })); process.exitCode = 1; });
