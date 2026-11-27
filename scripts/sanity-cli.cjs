/* eslint-disable @typescript-eslint/no-require-imports -- Isolated local CLI launcher. */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const directory = path.join(root, ".cache", "sanity-auth");
fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
const environment = { ...process.env, SANITY_CLI_CONFIG_PATH: path.join(directory, "config.json") };
// Never inherit an unrelated global token. The original CLI config is untouched.
delete environment.SANITY_AUTH_TOKEN;
const result = spawnSync(process.execPath, [path.join(root, "node_modules/sanity/bin/sanity"), ...process.argv.slice(2)], {
  cwd: root, stdio: "inherit", env: environment, windowsHide: true,
});
process.exitCode = result.status ?? 1;
