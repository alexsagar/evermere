// Animation-lab textures: smaller WebP copies of selected optimized masters.
// 2048px long edge for full-screen shader planes, 1024px for gallery planes.
// Run: node scripts/photos/lab-textures.mjs
import { mkdirSync, readFileSync } from "node:fs";
import sharp from "sharp";

const records = JSON.parse(readFileSync("src/content/photos.generated.json", "utf8"));
const ids = JSON.parse(readFileSync("src/motion/textures.json", "utf8"));
mkdirSync("public/lab/textures", { recursive: true });
for (const id of ids) {
  const src = `public${records[id].src}`;
  for (const [suffix, edge] of [["", 2048], ["-sm", 1024]]) {
    const info = await sharp(src).resize(edge, edge, { fit: "inside" }).webp({ quality: 80, effort: 5 }).toFile(`public/lab/textures/${id}${suffix}.webp`);
    console.log(`${id}${suffix}: ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
  }
}
