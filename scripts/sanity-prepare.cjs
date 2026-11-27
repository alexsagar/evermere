/* eslint-disable @typescript-eslint/no-require-imports -- Isolated CommonJS loader for the installed TypeScript compiler. */
// Local-only runner. Uses the installed TypeScript compiler for the typed demo sources.
// No Sanity client, token access, network calls or remote write mode exist here.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
require("./sanity-loader.cjs");
const root = path.resolve(__dirname, "..");

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => !["--dry-run", "--export"].includes(arg))) throw new Error("Only --dry-run or --export is supported; remote operations are deferred.");
  const sharp = require("sharp");
  const { photos } = require("../src/content/photos.ts");
  const { buildMigration, validateMigration, brandFiles } = require("../src/sanity/migration.ts");
  const files = [...photos.map((p) => ({ key: p.id, file: `public${p.src}`, width: p.width, height: p.height, metadata: p })),
    ...Object.entries(brandFiles).map(([key, file]) => ({ key, file }))];
  const assets = [];
  for (const entry of files) {
    const bytes = fs.readFileSync(path.join(root, entry.file));
    const measured = await sharp(bytes).metadata();
    if (entry.width && (entry.width !== measured.width || entry.height !== measured.height)) throw new Error(`Incorrect dimensions: ${entry.key}`);
    const sha1 = crypto.createHash("sha1").update(bytes).digest("hex");
    const extension = path.extname(entry.file).slice(1);
    assets.push({ ...entry, sha1, bytes: bytes.length, width: measured.width, height: measured.height,
      aspectRatio: measured.width / measured.height, _id: `image-${sha1}-${measured.width}x${measured.height}-${extension}` });
  }
  const ids = Object.fromEntries(assets.map((a) => [a.key, a._id]));
  const documents = buildMigration(ids);
  validateMigration(documents, ids);
  if (new Set(assets.map((a) => a.sha1)).size !== assets.length) throw new Error("Duplicate asset bytes");
  const counts = Object.fromEntries([...new Set(documents.map((d) => d._type))].sort().map((type) => [type, documents.filter((d) => d._type === type).length]));
  const summary = { mode: args.includes("--export") ? "local-export" : "dry-run", documents: documents.length, assets: assets.length,
    totalSanityDocumentsIncludingAssets: documents.length + assets.length, photographs: photos.length, types: counts, bytes: assets.reduce((n, a) => n + a.bytes, 0), remoteWrites: 0 };
  if (args.includes("--export")) {
    const out = path.join(root, "sanity", "migration");
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, "documents.ndjson"), documents.map((d) => JSON.stringify(d)).join("\n") + "\n");
    fs.writeFileSync(path.join(out, "assets.json"), JSON.stringify(assets, null, 2) + "\n");
    fs.writeFileSync(path.join(out, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  }
  console.log(JSON.stringify(summary, null, 2));
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
