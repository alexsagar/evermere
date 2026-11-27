/* eslint-disable @typescript-eslint/no-require-imports -- Read-only approved-target preflight. */
const { session, PROJECT, DATASET } = require("./sanity-session.cjs");
async function main() {
  const s = await session(PROJECT, DATASET);
  const datasets = await s.globalGet(`projects/${PROJECT}/datasets`);
  const development = datasets.find((d) => d.name === DATASET);
  if (!development || development.aclMode !== "public") throw new Error("Expected public development dataset not found. No writes performed.");
  const documents = await s.client.fetch('*[!(_id in path("_.**"))]{_id,_type}');
  let subscription;
  try {
    const value = await s.globalGet(`projects/${PROJECT}/subscription`);
    subscription = { plan: value.plan, planId: value.planId, status: value.status, trial: value.trial, trialEndsAt: value.trialEndsAt };
  } catch (error) { subscription = { inspectionStatus: error.statusCode ?? "unavailable" }; }
  let trial;
  try {
    const value = await s.client.withConfig({ apiVersion: "2023-12-11" }).request({ url: "/journey/trial" });
    trial = { id: value.id, daysLeft: value.daysLeft, totalDays: value.totalDays };
  } catch (error) { trial = { inspectionStatus: error.statusCode }; }
  console.log(JSON.stringify({ account: s.user.email, project: PROJECT, displayName: s.projectInfo.displayName,
    organization: s.projectInfo.organizationId, roles: s.projectInfo.members.find((m) => m.isCurrentUser)?.roles.map((r) => r.name),
    dataset: DATASET, visibility: development.aclMode, developmentDocuments: documents.length,
    types: documents.reduce((a, d) => ({ ...a, [d._type]: (a[d._type] || 0) + 1 }), {}), dashboardReportedPlan: "Free", subscription, trial }, null, 2));
}
main().catch((error) => { console.error(JSON.stringify({ error: "Approved-target preflight failed; no changes performed.", operation: error.operation, status: error.statusCode, reason: /^(Authenticated account|Evermere ownership|Expected public|Isolated Evermere)/.test(error.message) ? error.message : error.name })); process.exitCode = 1; });
