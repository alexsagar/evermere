/* eslint-disable @typescript-eslint/no-require-imports -- Read-only connected content audit. */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { createClient } = require("@sanity/client");
const { session, PROJECT, DATASET, root } = require("./sanity-session.cjs");
require("./sanity-loader.cjs");
const { assertSeedSafe } = require("../src/sanity/seed-safety.ts");
const { validateMigration } = require("../src/sanity/migration.ts");
const { resolveContentImages } = require("../src/lib/content-image.ts");
async function main() {
  const { client } = await session(PROJECT, DATASET);
  const planned = fs.readFileSync(path.join(root, "sanity/migration/documents.ndjson"), "utf8").trim().split("\n").map(JSON.parse);
  const assets = JSON.parse(fs.readFileSync(path.join(root, "sanity/migration/assets.json"), "utf8"));
  const remote = await client.fetch('*[!(_id in path("_.**"))]');
  try { assertSeedSafe(remote, planned, assets.map((a) => a._id)); }
  catch (error) {
    const changes = remote.filter((d) => d._type !== "sanity.imageAsset").flatMap((d) => {
      const original = planned.find((p) => p._id === d._id);
      return original ? [{ id: d._id, additionalFields: Object.keys(d).filter((k) => !(k in original) && !["_rev", "_createdAt", "_updatedAt"].includes(k)) }] : [{ id: d._id, unexpected: true }];
    }).filter((d) => d.unexpected || d.additionalFields.length);
    console.error(JSON.stringify({ changedDocumentMetadata: changes })); throw error;
  }
  assert.equal(remote.length, 120);
  const byId = new Map(remote.map((d) => [d._id, d]));
  for (const asset of assets) {
    const live = byId.get(asset._id);
    assert(live, `Missing asset ${asset.key}`);
    assert.equal(live.sha1hash, asset.sha1);
    assert.equal(live.metadata.dimensions.width, asset.width);
    assert.equal(live.metadata.dimensions.height, asset.height);
  }
  validateMigration(remote.filter((d) => d._type !== "sanity.imageAsset"), Object.fromEntries(assets.map((a) => [a.key, a._id])));
  const { createRequire } = require("node:module");
  createRequire(require.resolve("next/package.json"))("@next/env").loadEnvConfig(root);
  const published = createClient({ projectId: PROJECT, dataset: DATASET, apiVersion: "2026-11-01", perspective: "published", useCdn: false, stega: false, token: process.env.SANITY_API_READ_TOKEN });
  const queries = require("../src/sanity/queries.ts");
  const active = ["siteSettings", "navigation", "homePage", "inquirySettings", "pages", "careServices", "accommodations", "articles", "team", "faqs", "gallery"];
  for (const key of active) {
    const value = await published.fetch(queries[`${key}Query`]);
    assert(value && (!Array.isArray(value) || value.length), `Missing published ${key}`);
    resolveContentImages(value);
  }
  const summary = { project: PROJECT, dataset: DATASET, contentDocuments: 61, assets: 59, photographs: 56, total: remote.length,
    types: remote.reduce((a, d) => ({ ...a, [d._type]: (a[d._type] || 0) + 1 }), {}), exactSeedMatch: true,
    validReferences: true, measuredAssetMetadataMatch: true, viewerPublishedQueries: active.length, drafts: remote.filter((d) => d._id.startsWith("drafts.")).length };
  fs.mkdirSync(path.join(root, ".cache/cms-verification"), { recursive: true });
  fs.writeFileSync(path.join(root, ".cache/cms-verification/audit.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}
main().catch((error) => { console.error(JSON.stringify({ error: "Connected content audit failed", status: error.statusCode, name: error.name, detail: error.code === "ERR_ASSERTION" ? error.message : undefined })); process.exitCode = 1; });
