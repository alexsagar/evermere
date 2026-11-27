/* eslint-disable @typescript-eslint/no-require-imports */
const { PROJECT, DATASET, session } = require("./sanity-session.cjs");
(async () => {
  const { client } = await session(PROJECT, DATASET);
  const docs = await client.fetch('*[!(_type match "sanity.*") && !(_id match "_.*")]{_id,_type,...}');
  const dotted = new Set(docs.filter(d=>d._id.includes(".")).map(d=>d._id));
  // walk every doc, collect _ref values pointing to dotted content ids
  function refs(o, acc){ if(!o||typeof o!=="object")return; if(Array.isArray(o)){o.forEach(x=>refs(x,acc));return;} if(typeof o._ref==="string")acc.push(o._ref); for(const k in o) if(k!=="_ref")refs(o[k],acc); }
  const incoming={}; let total=0;
  for(const d of docs){ const a=[]; refs(d,a); for(const r of a){ if(dotted.has(r)){ total++; (incoming[d._id]??=[]).push(r);} } }
  console.log("docs(real content)",docs.length,"dotted",dotted.size);
  console.log("total refs to dotted ids:",total);
  console.log("referencing docs:",Object.keys(incoming).length);
  for(const [k,v] of Object.entries(incoming)) console.log(" ",k,"->",[...new Set(v)].length,"refs:",[...new Set(v)].slice(0,8).join(","));
})().catch(e=>{console.error("REF FAIL",e.message);process.exit(1);});
