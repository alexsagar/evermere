/* eslint-disable @typescript-eslint/no-require-imports -- Local CommonJS CLI. */
// Prepared for the next, explicitly approved milestone. Never invoked by build/tests.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { session, assertTarget } = require("./sanity-session.cjs");
require("./sanity-loader.cjs");
const { assertSeedSafe } = require("../src/sanity/seed-safety.ts");
const root = path.resolve(__dirname, "..");
async function main() {
  const args = process.argv.slice(2);
  if (!args.length || (args.includes("--dry-run") && !args.includes("--check-remote"))) {
    const { spawnSync } = require("node:child_process");
    process.exitCode = spawnSync(process.execPath, [path.join(__dirname, "sanity-prepare.cjs"), "--dry-run"], { stdio: "inherit" }).status ?? 1;
    return;
  }
  const project = args.find((s) => s.startsWith("--project="))?.slice(10);
  const dataset = args.find((s) => s.startsWith("--dataset="))?.slice(10);
  const confirm = args.find((s) => s.startsWith("--confirm="))?.slice(10);
  assertTarget(project, dataset);
  if (!args.includes("--check-remote") && (!args.includes("--apply") || confirm !== `${project}/${dataset}`)) throw new Error("Explicit --apply and matching --confirm=8nawnqp2/development required.");
  const documents = fs.readFileSync(path.join(root, "sanity/migration/documents.ndjson"), "utf8").trim().split("\n").map(JSON.parse);
  const assets = JSON.parse(fs.readFileSync(path.join(root, "sanity/migration/assets.json"), "utf8"));
  // Validate every local byte before making any network request.
  for (const asset of assets) {
    const file = path.resolve(root, asset.file);
    if (!file.startsWith(`${root}${path.sep}`) || crypto.createHash("sha1").update(fs.readFileSync(file)).digest("hex") !== asset.sha1) throw new Error("Asset manifest changed; regenerate and review the local export.");
  }
  const { client } = await session(project, dataset);
  const existing = await client.fetch('*[!(_id in path("_.**"))]');
  assertSeedSafe(existing, documents, assets.map((a) => a._id));
  const existingIds = new Set(existing.map((d) => d._id));
  if (args.includes("--check-remote")) {
    console.log(JSON.stringify({ project, dataset, safe: true, existing: existing.length, contentDocuments: documents.length, assets: assets.length,
      newContentDocuments: documents.filter((d) => !existingIds.has(d._id)).length, newAssets: assets.filter((a) => !existingIds.has(a._id)).length, remoteWrites: 0 }, null, 2));
    return;
  }
  for (const asset of assets) {
    if (existingIds.has(asset._id)) continue;
    const uploaded = await client.assets.upload("image", fs.createReadStream(path.join(root, asset.file)), { filename: path.basename(asset.file) });
    if (uploaded._id !== asset._id) throw new Error("Asset identity differs from dry-run; stopped before content writes.");
    console.log(`Prepared asset ${assets.indexOf(asset) + 1}/${assets.length}`);
  }
  const missing = documents.filter((d) => !existingIds.has(d._id));
  if (missing.length) {
    const tx = client.transaction();
    missing.forEach((d) => tx.createIfNotExists(d));
    await tx.commit();
  }
  console.log(`Seed complete: ${missing.length} new content documents. Existing documents were never replaced.`);
}
main().catch((error) => { console.error(JSON.stringify({ error: "Seed stopped; existing content was never replaced.", status: error.statusCode,
  reason: /^(Only approved|Dataset contains|Asset manifest|Asset identity|Explicit|Authenticated account|Evermere ownership|Isolated Evermere)/.test(error.message) ? error.message : error.name })); process.exitCode = 1; });
