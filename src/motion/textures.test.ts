import { existsSync } from "node:fs";
import sharp from "sharp";
import { expect, it } from "vitest";
import { photo, type PhotoId } from "@/content/photos";
import ids from "./textures.json";

it.each(ids as PhotoId[])("%s: lab textures exist at 2048 and 1024px with the master's aspect", async (id) => {
  const p = photo(id); // throws for an unknown id
  for (const [suffix, edge] of [["", 2048], ["-sm", 1024]] as const) {
    const file = `public/lab/textures/${id}${suffix}.webp`;
    expect(existsSync(file), file).toBe(true);
    const m = await sharp(file).metadata();
    expect(Math.max(m.width!, m.height!)).toBe(edge);
    expect(Math.abs(m.width! / m.height! - p.width / p.height)).toBeLessThan(0.01);
  }
});
