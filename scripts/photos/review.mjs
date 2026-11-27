// Builds review sheets of the optimized set: framed thumbnails and 100% center crops
// for sharpness checks. Output goes to .cache/photos/review (gitignored).
// Run: node scripts/photos/review.mjs
import { mkdirSync, readFileSync } from "node:fs";
import sharp from "sharp";

const records = JSON.parse(readFileSync("src/content/photos.generated.json", "utf8"));
const dir = ".cache/photos/review";
mkdirSync(dir, { recursive: true });
const ids = Object.keys(records);
const label = (w, text) => Buffer.from(`<svg width="${w}" height="20"><rect width="${w}" height="20" fill="#000"/><text x="4" y="15" font-size="13" font-family="Arial" fill="#fff">${text}</text></svg>`);

async function sheet(name, cw, ch, make) {
  const cols = 4;
  for (let p = 0; p * 16 < ids.length; p++) {
    const page = ids.slice(p * 16, p * 16 + 16);
    const cells = await Promise.all(page.map(async (id, i) => {
      const img = await make(id);
      return sharp(img).composite([{ input: label(cw, `${p * 16 + i} ${id}`), top: 0, left: 0 }]).toBuffer();
    }));
    await sharp({ create: { width: cw * cols, height: ch * Math.ceil(page.length / cols), channels: 3, background: "#222" } })
      .composite(cells.map((input, i) => ({ input, left: (i % cols) * cw, top: Math.floor(i / cols) * ch })))
      .jpeg({ quality: 80 })
      .toFile(`${dir}/${name}-${p}.jpg`);
  }
}

const file = (id) => `public${records[id].src}`;
await sheet("thumbs", 480, 320, (id) => sharp(file(id)).resize(480, 320, { fit: "contain", background: "#222" }).toBuffer());
await sheet("crops", 400, 400, async (id) => {
  const { width, height } = records[id];
  return sharp(file(id)).extract({ left: Math.round(width / 2 - 200), top: Math.round(height / 2 - 200), width: 400, height: 400 }).toBuffer();
});
console.log(`Review sheets for ${ids.length} photos in ${dir}`);
