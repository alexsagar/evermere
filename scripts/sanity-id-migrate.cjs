/* eslint-disable @typescript-eslint/no-require-imports -- Local, isolated migration utility. */
// Dotted -> non-dotted content document IDs, so published docs are readable without a token.
// Sanity hides _id values containing "." from unauthenticated reads. Assets (image-*) and
// reserved system docs (_.*) are never touched. No content->content references exist in this
// dataset (verified), so only create-new + delete-old is required; nothing to rewrite.
//
// Usage: node scripts/sanity-id-migrate.cjs --dry-run | --execute | --rollback=<backup.ndjson>
const fs = require("node:fs");
const path = require("node:path");
const { PROJECT, DATASET, root, session } = require("./sanity-session.cjs");

const BACKUP_DIR = path.join(root, ".cache", "m11-id-migration");
const SYSTEM_FIELDS = new Set(["_id", "_rev", "_createdAt", "_updatedAt", "_system"]);
const newIdFor = (id) => id.split(".").join("-");
const isContent = (d) => !d._type.startsWith("sanity.") && !d._id.startsWith("_.");

async function readState(client) {
  const docs = await client.fetch("*[]{...}");
  const content = docs.filter(isContent);
  const assets = docs.filter((d) => d._type.startsWith("sanity."));
  const system = docs.filter((d) => d._id.startsWith("_."));
  const drafts = docs.filter((d) => d._id.startsWith("drafts.") || d._id.includes("versions."));
  const dotted = content.filter((d) => d._id.includes("."));
  return { docs, content, assets, system, drafts, dotted };
}

function buildMapping(dotted, allIds) {
  const mapping = {};
  const targets = new Set();
  for (const d of dotted) {
    const to = newIdFor(d._id);
    if (to.includes(".")) throw new Error(`Mapping still dotted: ${to}`);
    if (allIds.has(to)) throw new Error(`Target id already exists: ${to}`);
    if (targets.has(to)) throw new Error(`Collision: two docs map to ${to}`);
    targets.add(to);
    mapping[d._id] = to;
  }
  return mapping;
}

function stripped(doc, newId) {
  const out = { _id: newId };
  for (const [k, v] of Object.entries(doc)) if (!SYSTEM_FIELDS.has(k)) out[k] = v;
  return out;
}

async function main() {
  const mode = process.argv.find((a) => a.startsWith("--")) || "--dry-run";
  const { client } = await session(PROJECT, DATASET);

  if (mode.startsWith("--rollback=")) return rollback(client, mode.slice("--rollback=".length));

  const state = await readState(client);
  // Abort conditions
  if (state.drafts.length) throw new Error(`Aborting: ${state.drafts.length} draft/version docs present.`);
  const realContent = state.content.filter((d) => isContent(d));
  if (realContent.length !== 61) throw new Error(`Expected 61 content docs, found ${realContent.length}.`);
  if (state.assets.length !== 59) throw new Error(`Expected 59 assets, found ${state.assets.length}.`);

  const allIds = new Set(state.docs.map((d) => d._id));
  const mapping = buildMapping(state.dotted, allIds);
  const projected = {
    content: state.content.length, // unchanged count (rename only)
    assets: state.assets.length,
    combined: state.content.length + state.assets.length,
    dottedToMigrate: state.dotted.length,
  };
  console.log("PROJECT/DATASET:", PROJECT, DATASET);
  console.log("counts now -> content", state.content.length, "assets", state.assets.length, "system", state.system.length, "drafts", state.drafts.length);
  console.log("dotted to migrate:", state.dotted.length);
  console.log("projected after:", JSON.stringify(projected));

  if (mode === "--dry-run") {
    console.log("DRY RUN ok. Sample mapping:");
    Object.entries(mapping).slice(0, 6).forEach(([a, b]) => console.log("  ", a, "->", b));
    console.log("No unresolved issues. Re-run with --execute to apply.");
    return;
  }
  if (mode !== "--execute") throw new Error(`Unknown mode ${mode}`);

  // Backup before any mutation
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(BACKUP_DIR, `backup-${stamp}.ndjson`);
  fs.writeFileSync(backupFile, state.dotted.map((d) => JSON.stringify(d)).join("\n") + "\n");
  fs.writeFileSync(path.join(BACKUP_DIR, `mapping-${stamp}.json`), JSON.stringify(mapping, null, 2));
  fs.writeFileSync(path.join(BACKUP_DIR, `counts-${stamp}.json`), JSON.stringify({ projected, revs: Object.fromEntries(state.dotted.map((d) => [d._id, d._rev])) }, null, 2));
  console.log("backup written:", path.relative(root, backupFile));

  // Revision check for concurrent-edit safety: re-read revs immediately before committing
  // and abort if any dotted doc changed since the snapshot above.
  const nowRevs = Object.fromEntries((await client.fetch('*[_id in $ids]{_id,_rev}', { ids: state.dotted.map((d) => d._id) })).map((d) => [d._id, d._rev]));
  const changed = state.dotted.filter((d) => nowRevs[d._id] !== d._rev);
  if (changed.length) throw new Error(`Aborting: ${changed.length} docs changed since snapshot (concurrent edit). No mutations sent.`);

  // Atomic transaction: create non-dotted copy, delete dotted original.
  const tx = client.transaction();
  for (const d of state.dotted) {
    tx.create(stripped(d, mapping[d._id]));
    tx.delete(d._id);
  }
  await tx.commit({ visibility: "sync" });
  console.log("migration committed:", state.dotted.length, "documents renamed.");

  // Post-validation
  const after = await readState(client);
  const problems = [];
  if (after.dotted.length) problems.push(`still ${after.dotted.length} dotted content docs`);
  if (after.content.length !== 61) problems.push(`content count ${after.content.length} != 61`);
  if (after.assets.length !== 59) problems.push(`asset count ${after.assets.length} != 59`);
  console.log("post-validate:", problems.length ? "FAIL " + problems.join("; ") : "OK (61 content, 59 assets, no dotted)");
  if (problems.length) { console.error("Validation failed. Backup at", backupFile); process.exit(2); }
}

async function rollback(client, file) {
  const docs = fs.readFileSync(file, "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const tx = client.transaction();
  for (const d of docs) {
    tx.createIfNotExists(d); // restore old dotted doc with original fields
    tx.delete(newIdFor(d._id)); // remove the migrated copy
  }
  await tx.commit();
  console.log("rollback restored", docs.length, "dotted docs and removed their migrated copies.");
}

main().catch((e) => { console.error("MIGRATION ERROR:", e.message); process.exit(1); });
