/* eslint-disable @typescript-eslint/no-require-imports */
const { PROJECT, DATASET, session } = require("./sanity-session.cjs");
(async () => {
  const { client } = await session(PROJECT, DATASET);
  const docs = await client.fetch('*[]{_id,_type,"rev":_rev}');
  const assets = docs.filter(d => d._type.startsWith("sanity."));
  const content = docs.filter(d => !d._type.startsWith("sanity."));
  const dotted = content.filter(d => d._id.includes("."));
  const drafts = docs.filter(d => d._id.startsWith("drafts.") || d._id.includes("versions."));
  console.log("total", docs.length, "content", content.length, "assets", assets.length);
  console.log("dotted-content", dotted.length, "drafts/versions", drafts.length);
  const byType = {};
  for (const d of dotted) byType[d._type] = (byType[d._type]||0)+1;
  console.log("dotted by type:", JSON.stringify(byType));
  console.log("dotted ids:", dotted.map(d=>d._id).join(","));
  // asset dotted?
  console.log("dotted assets:", assets.filter(a=>a._id.replace(/^image-|^file-/,'').includes(".")).length);
})().catch(e => { console.error("AUDIT FAIL", e.message); process.exit(1); });
