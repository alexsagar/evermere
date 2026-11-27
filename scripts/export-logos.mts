// Writes the final, self-contained Evermere logo SVGs (outlined wordmark, no fonts).
// Run: node scripts/export-logos.mts
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { horizontalSvg, markSvg, variants, type LogoVariant } from "../src/brand/logo.ts";

const dir = "public/brand";
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
for (const v of Object.keys(variants) as LogoVariant[]) {
  writeFileSync(`${dir}/evermere-horizontal-${v}.svg`, horizontalSvg(v) + "\n");
  writeFileSync(`${dir}/evermere-mark-${v}.svg`, markSvg(v) + "\n");
}
writeFileSync(`${dir}/evermere-mark-small-primary.svg`, markSvg("primary", true) + "\n");
// Favicon: small mark, primary colors.
writeFileSync("public/favicon.svg", markSvg("primary", true) + "\n");
console.log(`Wrote ${Object.keys(variants).length * 2 + 1} SVG files to ${dir} and public/favicon.svg`);
