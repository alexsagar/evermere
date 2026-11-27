/* eslint-disable @typescript-eslint/no-require-imports -- Controlled local integration utilities. */
const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@sanity/client");

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "8nawnqp2";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "development";
const root = path.resolve(__dirname, "..");

function assertTarget(project, dataset) {
  if (project !== PROJECT || dataset !== DATASET) {
    throw new Error(`Only approved Evermere project ${PROJECT}, dataset ${DATASET} is permitted.`);
  }
}

function resolveAuthToken() {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN;
  const authFile = path.join(root, ".cache/sanity-auth/config.json");
  if (fs.existsSync(authFile)) {
    const config = JSON.parse(fs.readFileSync(authFile, "utf8"));
    if (config.authToken) return config.authToken;
  }
  throw new Error("Sanity CLI authentication required (set SANITY_AUTH_TOKEN or run scripts/sanity-cli.cjs login).");
}

async function session(project = PROJECT, dataset = DATASET) {
  assertTarget(project, dataset);
  const token = resolveAuthToken();
  const client = createClient({
    projectId: PROJECT,
    dataset: DATASET,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-11-01",
    useCdn: false,
    perspective: "raw",
    token,
  });
  const globalGet = async (uri) => {
    const response = await fetch(`https://api.sanity.io/v2021-06-07/${uri}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = new Error("Sanity management request failed");
      error.statusCode = response.status;
      error.operation = uri;
      throw error;
    }
    return response.json();
  };
  const user = await globalGet("users/me");
  if (process.env.SANITY_EXPECTED_EMAIL && user.email !== process.env.SANITY_EXPECTED_EMAIL) {
    throw new Error("Authenticated account does not match SANITY_EXPECTED_EMAIL.");
  }
  const projectInfo = await globalGet(`projects/${PROJECT}`);
  if (
    projectInfo.id !== PROJECT ||
    (process.env.SANITY_EXPECTED_ORG_ID && projectInfo.organizationId !== process.env.SANITY_EXPECTED_ORG_ID) ||
    !projectInfo.members?.some((m) => m.isCurrentUser)
  ) {
    throw new Error("Evermere ownership/permission check failed.");
  }
  return { client, globalGet, projectInfo, user };
}

module.exports = { PROJECT, DATASET, root, assertTarget, session };
