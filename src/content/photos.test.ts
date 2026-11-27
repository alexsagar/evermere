import { existsSync, readFileSync, statSync } from "node:fs";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import * as demo from "./demo";
import { demoAccommodations, demoGallery } from "./demo-collections";
import { demoPages } from "./demo-pages";
import { photos } from "./photos";

const rejected: { id: string }[] = JSON.parse(readFileSync("assets/photos/rejected.json", "utf8"));

describe("photo manifest", () => {
  it("lists 50 to 70 unique photographs", () => {
    expect(photos.length).toBeGreaterThanOrEqual(50);
    expect(photos.length).toBeLessThanOrEqual(70);
    expect(new Set(photos.map((p) => p.id)).size).toBe(photos.length);
  });

  it.each(photos)("$id: file, dimensions and records are consistent", async (p) => {
    const file = `public${p.src}`;
    expect(existsSync(file)).toBe(true);
    const meta = await sharp(file).metadata();
    expect([meta.width, meta.height]).toEqual([p.width, p.height]);
    expect(statSync(file).size).toBe(p.bytes);
    expect(Math.max(p.width, p.height)).toBeGreaterThanOrEqual(2560);
    expect(p.src).toContain(`/photos/${p.category}/`);
    expect(p.alt.length).toBeGreaterThan(20);
    expect(p.focal.x).toBeGreaterThanOrEqual(0);
    expect(p.focal.y).toBeLessThanOrEqual(1);
    expect(p.source.pageUrl).toMatch(/^https:\/\/www\.pexels\.com\/photo\//);
    expect(p.source.photographer).toBeTruthy();
    expect(p.source.licenseUrl).toBe("https://www.pexels.com/license/");
    expect(p.source.acquired).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("content references only accepted photographs", () => {
    const srcs = new Set(photos.map((p) => p.src));
    const used = JSON.stringify({ demo, demoPages, demoAccommodations, demoGallery }).match(/\/photos\/[\w/-]+\.webp/g) ?? [];
    expect(used.length).toBeGreaterThan(40);
    for (const src of used) expect(srcs, src).toContain(src);
    for (const r of rejected) expect(JSON.stringify(used)).not.toContain(r.id);
  });

  it("every page opening, homepage chapter and accommodation type has a photograph", () => {
    for (const c of demo.demoHomePage.chapters ?? []) expect(c.image?.src, c.key ?? "").toBeTruthy();
    const main = ["about", "our-home", "accommodations", "care-services", "lifestyle", "amenities", "dining", "gallery", "our-team", "resources", "faq", "contact"];
    for (const slug of main) expect(demoPages.find((p) => p.slug === slug)?.image?.src, slug).toBeTruthy();
    for (const a of demoAccommodations) expect(a.image?.src, a.title ?? "").toBeTruthy();
  });

  it("homepage chapters never repeat a photograph", () => {
    const srcs = (demo.demoHomePage.chapters ?? []).map((c) => c.image?.src);
    expect(new Set(srcs).size).toBe(srcs.length);
  });
});
