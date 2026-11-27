/* eslint-disable @typescript-eslint/no-require-imports -- Local CLI launcher. */
const { spawnSync } = require("node:child_process");
const { createRequire } = require("node:module");
const { loadEnvConfig } = createRequire(require.resolve("next/package.json"))("@next/env");
const { assertTarget } = require("./sanity-session.cjs");
loadEnvConfig(process.cwd());
const id = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
if (!id || id === "local-demo") {
  console.error("Local Studio awaits an approved real Sanity project ID. Schema extraction and CMS dry-run work offline.");
  process.exitCode = 1;
} else {
  assertTarget(id, process.env.NEXT_PUBLIC_SANITY_DATASET || "development");
  const environment = {
    ...process.env, SANITY_STUDIO_PROJECT_ID: id, SANITY_STUDIO_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET || "development",
    SANITY_CLI_CONFIG_PATH: require("node:path").join(process.cwd(), ".cache/sanity-auth/config.json"),
  };
  delete environment.SANITY_AUTH_TOKEN;
  const result = spawnSync(process.execPath, ["node_modules/sanity/bin/sanity", "dev", "--host", "127.0.0.1", "--port", "3333"], { stdio: "inherit", env: environment });
  process.exitCode = result.status ?? 1;
}
