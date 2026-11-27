/* eslint-disable @typescript-eslint/no-require-imports -- Writes ignored local configuration without printing secrets. */
const fs = require("node:fs");
const crypto = require("node:crypto");
const { root, PROJECT, DATASET } = require("./sanity-session.cjs");
const path = require("node:path");
const file = path.join(root, ".env.local");
let text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
function set(name, value) {
  const pattern = new RegExp(`^${name}=.*$`, "m");
  text = pattern.test(text) ? text.replace(pattern, `${name}=${value}`) : text.trimEnd() + `\n${name}=${value}\n`;
}
set("CONTENT_SOURCE", "sanity");
set("NEXT_PUBLIC_SANITY_PROJECT_ID", PROJECT);
set("NEXT_PUBLIC_SANITY_DATASET", DATASET);
set("NEXT_PUBLIC_SANITY_API_VERSION", "2026-11-01");
if (!/^SANITY_REVALIDATE_SECRET=.{32,}$/m.test(text)) set("SANITY_REVALIDATE_SECRET", crypto.randomBytes(48).toString("base64url"));
fs.writeFileSync(file, text, { mode: 0o600 });
console.log("Ignored local environment configured for 8nawnqp2/development, Sanity mode; revalidation secret kept server-side.");
