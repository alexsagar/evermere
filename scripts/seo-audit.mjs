// Production-mode SEO audit of every content route: status, headers, title, description,
// canonical, robots, Open Graph, H1/heading order, image alt, JSON-LD, internal links.
// Usage: node scripts/seo-audit.mjs [baseURL] > review/m10/seo-audit.json
const B = process.argv[2] ?? "http://127.0.0.1:3000";
for (let i = 0; i < 60; i++) { try { await fetch(B + "/robots.txt"); break; } catch { await new Promise((r) => setTimeout(r, 1000)); } }

const ROUTES = ["/", "/our-home", "/accommodations", "/amenities", "/lifestyle", "/dining", "/care-services", "/about", "/our-team", "/gallery", "/contact", "/resources", "/faq", "/privacy", "/accessibility"];
const res = await (await fetch(B + "/resources")).text();
ROUTES.push(...new Set(res.match(/\/resources\/[a-z0-9-]+(?=")/g)));

const all = (html, re) => [...html.matchAll(re)].map((m) => m[1]);
const meta = (html, attr, key) => all(html, new RegExp(`<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"`, "g"));
const decode = (s) => s?.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');
const rows = [];
const links = new Set();
for (const path of ROUTES) {
  const r = await fetch(B + path);
  const html = await r.text();
  const body = html.replace(/<script[\s\S]*?<\/script>/g, "");
  const headings = all(body, /<h([1-6])[\s>]/g).map(Number);
  let skip = null;
  headings.forEach((h, i) => { if (i && h > headings[i - 1] + 1 && !skip) skip = `h${headings[i - 1]}->h${h}`; });
  all(body, /<a[^>]*href="(\/[^"#?]*)/g).forEach((l) => links.add(l || "/"));
  rows.push({
    path, status: r.status, xRobots: r.headers.get("x-robots-tag"),
    title: decode(all(html, /<title>([^<]*)<\/title>/g)[0]), titles: all(html, /<title>/g).length,
    description: decode(meta(html, "name", "description")[0]), descriptions: meta(html, "name", "description").length,
    canonical: all(html, /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/g), robots: meta(html, "name", "robots"),
    ogTitle: decode(meta(html, "property", "og:title")[0]), ogImage: !!meta(html, "property", "og:image")[0], ogUrl: meta(html, "property", "og:url")[0],
    twitter: meta(html, "name", "twitter:card")[0],
    h1: headings.filter((h) => h === 1).length, headingSkip: skip,
    imgNoAlt: all(body, /<img((?:(?!alt=)[^>])*)>/g).length,
    jsonLd: all(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map((j) => { try { const d = JSON.parse(j); return (d["@graph"] ?? [d]).map((x) => x["@type"]).join("+"); } catch { return "INVALID"; } }),
  });
}
const dup = (k) => rows.filter((r) => rows.filter((o) => o[k] === r[k]).length > 1).map((r) => r.path);
const linkStatus = {};
for (const l of links) linkStatus[l] = (await fetch(B + l, { method: "HEAD" })).status;
const extra = {};
for (const p of ["/robots.txt", "/sitemap.xml", "/nope", "/resources/nope", "/dev/animation-lab", "/api/inquiry", "/studio"]) {
  const r = await fetch(B + p); extra[p] = { status: r.status, xRobots: r.headers.get("x-robots-tag"), body: p.endsWith(".txt") || p.endsWith(".xml") ? (await r.text()).trim() : undefined };
}
console.log(JSON.stringify({ rows, duplicateTitles: dup("title"), duplicateDescriptions: dup("description"), brokenLinks: Object.entries(linkStatus).filter(([, s]) => s !== 200), extra }, null, 2));
