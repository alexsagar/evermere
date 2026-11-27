/* eslint-disable @typescript-eslint/no-require-imports -- Removes only this verification's identical restored draft. */
const assert = require("node:assert/strict");
const { session, PROJECT, DATASET } = require("./sanity-session.cjs");
require("./sanity-loader.cjs");
const { assertSeedSafe } = require("../src/sanity/seed-safety.ts");
async function main() {
  const { client } = await session(PROJECT, DATASET);
  const [published, draft] = await Promise.all([client.getDocument("siteSettings"), client.getDocument("drafts.siteSettings")]);
  assert.equal(published.name, "Evermere Senior Living");
  if (draft) {
    assertSeedSafe([{ ...draft, _id: published._id }], [published], []);
    await client.delete("drafts.siteSettings");
  }
  console.log("Studio required-field test restored; only its unchanged draft was discarded, published identity never changed.");
}
main().catch(() => { console.error("Studio draft cleanup refused: content must match its published original."); process.exitCode = 1; });
