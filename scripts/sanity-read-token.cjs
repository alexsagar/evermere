/* eslint-disable @typescript-eslint/no-require-imports -- Securely captures the CLI result; never prints the credential. */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { session, PROJECT, DATASET, root } = require("./sanity-session.cjs");
async function main() {
  await session(PROJECT, DATASET);
  const file = path.join(root, ".env.local");
  let text = fs.readFileSync(file, "utf8");
  const receipt = path.join(root, ".cache/cms-verification/read-token.json");
  if (/^SANITY_API_READ_TOKEN=.+$/m.test(text) && fs.existsSync(receipt)) { console.log("Existing dedicated website Viewer credential retained."); return; }
  const result = spawnSync(process.execPath, [path.join(__dirname, "sanity-cli.cjs"), "tokens", "create", "Evermere development website read-only", `--project=${PROJECT}`, "--role=viewer", "--yes", "--json"], { cwd: root, encoding: "utf8", windowsHide: true });
  if (result.status !== 0) throw new Error("Viewer token creation failed");
  const value = JSON.parse(result.stdout);
  if (!value.token || !value.id || !value.memberships?.some((m) => m.resourceType === "project" && m.resourceId === PROJECT && m.roleNames.length === 1 && m.roleNames[0] === "viewer")) throw new Error("Unexpected token scope");
  text = /^SANITY_API_READ_TOKEN=.*$/m.test(text) ? text.replace(/^SANITY_API_READ_TOKEN=.*$/m, `SANITY_API_READ_TOKEN=${value.token}`) : text.trimEnd() + `\nSANITY_API_READ_TOKEN=${value.token}\n`;
  fs.writeFileSync(file, text, { mode: 0o600 });
  fs.mkdirSync(path.dirname(receipt), { recursive: true });
  fs.writeFileSync(receipt, JSON.stringify({ id: value.id, label: value.label, project: PROJECT, role: "viewer" }, null, 2));
  console.log("Dedicated project-scoped Viewer token configured only in ignored .env.local; no token value printed.");
}
main().catch(() => { console.error("Read-only credential setup stopped. No credential value was logged."); process.exitCode = 1; });
