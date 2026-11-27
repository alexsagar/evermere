// Searches Pexels and writes a numbered contact sheet per query for visual review.
// Run: node --env-file=.env.local scripts/photos/search.mjs "<slug>" "<query>" [landscape|portrait]
// Output stays on D: under .cache/photos (gitignored).
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const [slug, query, orientation = "landscape"] = process.argv.slice(2);
const key = process.env.PEXELS_API_KEY;
if (!key) throw new Error("PEXELS_API_KEY is not set");

const dir = ".cache/photos/search";
mkdirSync(dir, { recursive: true });

const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=30&orientation=${orientation}&size=large`;
const res = await fetch(url, { headers: { Authorization: key } });
if (!res.ok) throw new Error(`Pexels ${res.status}`);
const { photos } = await res.json();

const items = photos.map((p, i) => ({
  n: i,
  id: p.id,
  width: p.width,
  height: p.height,
  alt: p.alt,
  photographer: p.photographer,
  photographerUrl: p.photographer_url,
  pageUrl: p.url,
  original: p.src.original,
  preview: p.src.medium,
}));
writeFileSync(`${dir}/${slug}.json`, JSON.stringify(items, null, 2));

// 6 x 5 grid of 320 x 214 cells, each labeled with its index and pixel width.
const cw = 320, ch = 214, cols = 6;
const cells = await Promise.all(
  items.map(async (it) => {
    const buf = Buffer.from(await (await fetch(it.preview)).arrayBuffer());
    const img = await sharp(buf).resize(cw, ch, { fit: "cover" }).toBuffer();
    const label = Buffer.from(
      `<svg width="${cw}" height="${ch}"><rect width="88" height="22" fill="#000"/><text x="4" y="16" font-size="14" font-family="Arial" fill="#fff">${it.n} · ${it.width}</text></svg>`,
    );
    return sharp(img).composite([{ input: label }]).toBuffer();
  }),
);
const rows = Math.ceil(cells.length / cols);
await sharp({ create: { width: cw * cols, height: ch * rows, channels: 3, background: "#222" } })
  .composite(cells.map((input, i) => ({ input, left: (i % cols) * cw, top: Math.floor(i / cols) * ch })))
  .jpeg({ quality: 78 })
  .toFile(`${dir}/${slug}.jpg`);
console.log(`${slug}: ${items.length} results`);
