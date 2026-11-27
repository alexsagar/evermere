/* eslint-disable @typescript-eslint/no-require-imports -- Read-only local bundle and approved-target security verification. */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
const { session, PROJECT, DATASET, root } = require("./sanity-session.cjs");
async function main() {
  createRequire(require.resolve("next/package.json"))("@next/env").loadEnvConfig(root);
  assert.equal(process.env.CONTENT_SOURCE, "sanity");
  assert.equal(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, PROJECT);
  assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET, DATASET);
  const { client, globalGet } = await session(PROJECT, DATASET);
  assert(process.env.SANITY_API_READ_TOKEN && process.env.SANITY_API_READ_TOKEN !== client.config().token);
  const secrets = [process.env.SANITY_API_READ_TOKEN, process.env.SANITY_REVALIDATE_SECRET, client.config().token].filter(Boolean);
  let bundles = 0;
  function scan(directory) {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, item.name);
      if (item.isDirectory()) scan(file);
      else if (item.name.endsWith(".js")) {
        const text = fs.readFileSync(file, "utf8");
        assert(!secrets.some((secret) => text.includes(secret)), "Credential found in public JavaScript");
        bundles++;
      }
    }
  }
  scan(path.join(root, ".next/static"));
  for (const route of ["/", "/gallery", "/contact", "/resources"]) {
    const html = await fetch(`http://127.0.0.1:3000${route}`).then((r) => r.text());
    assert(!secrets.some((secret) => html.includes(secret)), "Credential found in public HTML");
  }
  const cors = await globalGet(`projects/${PROJECT}/cors`);
  assert(cors.every((entry) => ["http://127.0.0.1:3333", "http://localhost:3333", "http://127.0.0.1:3000"].includes(entry.origin)));
  assert(cors.find((entry) => entry.origin === "http://127.0.0.1:3333" && entry.allowCredentials));
  assert(cors.find((entry) => entry.origin === "http://127.0.0.1:3000" && !entry.allowCredentials));
  const receipt = JSON.parse(fs.readFileSync(path.join(root, ".cache/cms-verification/read-token.json"), "utf8"));
  const tokenResponse = await fetch(`https://api.sanity.io/v2025-07-11/access/project/${PROJECT}/robots/${receipt.id}`, {
    headers: { Authorization: `Bearer ${client.config().token}` },
  });
  assert.equal(tokenResponse.status, 200);
  const readToken = await tokenResponse.json();
  assert(readToken.memberships.length === 1 && readToken.memberships[0].resourceId === PROJECT && readToken.memberships[0].roleNames.length === 1 && readToken.memberships[0].roleNames[0] === "viewer");
  const report = { project: PROJECT, dataset: DATASET, publicBundlesScanned: bundles, publicHtmlPagesScanned: 4,
    exposedCredentials: 0, websiteReadRole: "viewer", isolatedCliCredentialDifferent: true, cors: cors.map((e) => ({ origin: e.origin, credentials: e.allowCredentials })),
    temporarySeedCredentialCreated: false, productionRequestsPerformed: false };
  fs.writeFileSync(path.join(root, ".cache/cms-verification/security.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
main().catch((error) => { console.error(JSON.stringify({ error: "Security check stopped", name: error.name, status: error.statusCode, detail: error.code === "ERR_ASSERTION" ? error.message : undefined })); process.exitCode = 1; });
