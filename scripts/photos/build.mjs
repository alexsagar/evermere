// Downloads selected Pexels originals (kept outside /public), writes optimized WebP
// masters for the site and records provenance in src/content/photos.generated.json.
// Run: node --env-file=.env.local scripts/photos/build.mjs
// Originals and review sheets stay on D: in gitignored folders.
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const selection = JSON.parse(readFileSync("assets/photos/selection.json", "utf8"));
const out = "src/content/photos.generated.json";
const previous = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : {};
const wide = new Set(["exterior", "surroundings", "outdoors"]);
const records = {};

for (const s of selection) {
  const hit = JSON.parse(readFileSync(`.cache/photos/search/${s.from}.json`, "utf8"))[s.n];
  const original = `assets/photos/originals/${s.category}/${s.id}.jpg`;
  const web = `public/photos/${s.category}/${s.id}.webp`;
  mkdirSync(`assets/photos/originals/${s.category}`, { recursive: true });
  mkdirSync(`public/photos/${s.category}`, { recursive: true });

  if (!existsSync(original)) {
    const res = await fetch(hit.original);
    if (!res.ok) throw new Error(`${s.id}: download ${res.status}`);
    writeFileSync(original, Buffer.from(await res.arrayBuffer()));
  }

  const meta = await sharp(original).metadata();
  const landscape = meta.width >= meta.height;
  // Heroes up to 3840px wide; other landscapes 2560px; portraits 3200px tall.
  const resize = landscape ? { width: Math.min(meta.width, wide.has(s.category) ? 3840 : 2560) } : { height: Math.min(meta.height, 3200) };
  const info = await sharp(original).rotate().resize(resize).webp({ quality: 82, effort: 5 }).toFile(web);

  records[s.id] = {
    src: `/photos/${s.category}/${s.id}.webp`,
    width: info.width,
    height: info.height,
    bytes: info.size,
    original: { path: original, width: meta.width, height: meta.height, bytes: statSync(original).size },
    source: {
      provider: "Pexels",
      providerId: hit.id,
      pageUrl: hit.pageUrl,
      photographer: hit.photographer,
      photographerUrl: hit.photographerUrl,
      license: "Pexels License",
      licenseUrl: "https://www.pexels.com/license/",
      acquired: previous[s.id]?.source.acquired ?? new Date().toISOString().slice(0, 10),
    },
  };
  console.log(`${s.id}: ${meta.width}x${meta.height} -> ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
}

writeFileSync(out, JSON.stringify(records, null, 2) + "\n");
console.log(`Wrote ${Object.keys(records).length} records to ${out}`);
