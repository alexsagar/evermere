/* eslint-disable @typescript-eslint/no-require-imports -- Local signing utility; no secrets printed or browser access. */
const { createHmac } = require("node:crypto");
const { createRequire } = require("node:module");
const { root, PROJECT, DATASET, assertTarget } = require("./sanity-session.cjs");
require("./sanity-loader.cjs");
const { revalidationTags } = require("../src/sanity/revalidation.ts");
async function main() {
  createRequire(require.resolve("next/package.json"))("@next/env").loadEnvConfig(root);
  assertTarget(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, process.env.NEXT_PUBLIC_SANITY_DATASET);
  const type = process.argv.find((v) => v.startsWith("--type="))?.slice(7);
  const id = process.argv.find((v) => v.startsWith("--id="))?.slice(5);
  const bodyObject = { _id: id, _type: type };
  revalidationTags(bodyObject);
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret || secret.length < 32) throw new Error("Local secret required");
  const time = Date.now(), body = JSON.stringify(bodyObject);
  const signature = `t=${time},v1=${createHmac("sha256", secret).update(`${time}.${body}`).digest("base64url")}`;
  const response = await fetch("http://127.0.0.1:3000/api/sanity/revalidate", { method: "POST", headers: { "sanity-webhook-signature": signature }, body });
  if (response.status !== 204) throw new Error("Local revalidation failed");
  console.log(`Revalidated ${type} locally for ${PROJECT}/${DATASET}. No remote webhook delivery is configured.`);
}
main().catch(() => { console.error("Local revalidation failed. Supply --type and --id and ensure the CMS website is running on port 3000."); process.exitCode = 1; });
