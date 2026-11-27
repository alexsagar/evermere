/* eslint-disable @typescript-eslint/no-require-imports -- Local verification runner. */
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const port = 3101;
const origin = `http://127.0.0.1:${port}`;
const documents = fs.readFileSync("sanity/migration/documents.ndjson", "utf8").trim().split("\n").map(JSON.parse);
const routes = ["/", ...documents.filter((d) => d._type === "page").map((d) => `/${d.slug.current}`), ...documents.filter((d) => d._type === "article").map((d) => `/resources/${d.slug.current}`)];
async function main() {
  try { await fetch(origin, { signal: AbortSignal.timeout(1000) }); throw new Error("Verification port already in use"); }
  catch (error) { if (error.message === "Verification port already in use") throw error; }
  const server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], { stdio: "ignore", windowsHide: true });
  let exited = false;
  server.once("exit", () => { exited = true; });
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      if (exited) throw new Error("Production server exited before readiness");
      try { ready = (await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(1000) })).ok; } catch { /* startup */ }
      if (ready) break;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    assert(ready, "Production server did not become ready");
    const titles = new Set();
    for (const route of routes) {
      const result = await fetch(`${origin}${route}`);
      assert.equal(result.status, 200, route);
      assert.match(result.headers.get("x-robots-tag") ?? "", /noindex/);
      const html = await result.text();
      assert.match(html, /name="robots" content="[^"]*noindex/);
      const title = html.match(/<title>(.*?)<\/title>/)?.[1];
      assert(title, `Missing title: ${route}`);
      titles.add(title);
    }
    const forbidden = ["/dev/smoke", "/dev/brand", "/dev/creative", "/dev/animation-lab", "/dev/animation-lab/opening", "/dev/animation-lab/journey", "/dev/animation-lab/gallery", "/dev/animation-lab/editorial", "/dev/animation-lab/inquiry", "/dev/animation-lab/transitions", "/dev/animation-lab/passage/library", "/dev/animation-lab/passage/suite", "/not-an-evermere-page", "/resources/not-an-evermere-article"];
    for (const route of forbidden) assert.equal((await fetch(`${origin}${route}`)).status, 404, route);
    const webhook = await fetch(`${origin}/api/sanity/revalidate`, { method: "POST", body: "{}" });
    assert([401, 503].includes(webhook.status), "Unsigned webhook must fail closed");
    assert.equal(titles.size, routes.length, "Content page titles must remain unique");
    console.log(JSON.stringify({ contentRoutes200: routes.length, uniqueTitles: titles.size, noindex: routes.length, protectedOrUnknown404: forbidden.length, unsignedWebhook: webhook.status }, null, 2));
  } finally {
    if (!exited) await new Promise((resolve) => { server.once("exit", resolve); server.kill(); });
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
