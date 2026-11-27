/* eslint-disable @typescript-eslint/no-require-imports */
const { PROJECT, DATASET, session } = require("./sanity-session.cjs");
(async () => {
  const { client } = await session(PROJECT, DATASET);
  for (const id of ["page.about","gallery.dining","faq.1","article.choosing-a-community","team.1","accommodation.1"]) {
    const n = await client.fetch('count(*[references($id)])', { id });
    console.log("references("+id+") =", n);
  }
  const nav = await client.fetch('*[_id=="navigation"][0]');
  console.log("NAV keys:", Object.keys(nav||{}).join(","));
  console.log("NAV sample:", JSON.stringify(nav).slice(0,400));
  const page = await client.fetch('*[_id=="page.about"][0]{_id,related,"hasImageRef":defined(image.asset._ref),"secRefs":count(sections[]._ref)}');
  console.log("page.about:", JSON.stringify(page));
})().catch(e=>{console.error("FAIL",e.message);process.exit(1);});
