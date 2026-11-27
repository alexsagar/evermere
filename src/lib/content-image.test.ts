import { expect, it } from "vitest";
import { exhibitionSelection, exhibitionTextureUrl, resolveContentImages, responsiveSanityImageUrl, sanityImageUrl } from "./content-image";

const src = "https://cdn.sanity.io/images/abc123/development/abcdef-2400x1600.webp";
it("caps Sanity textures on both axes and preserves crop", () => {
  const url = new URL(exhibitionTextureUrl(`${src}?rect=0,0,1200,1600`));
  expect(url.searchParams.get("w")).toBe("1280");
  expect(url.searchParams.get("h")).toBe("1280");
  expect(url.searchParams.get("fit")).toBe("max");
  expect(url.searchParams.get("rect")).toBe("0,0,1200,1600");
});
it("keeps portrait and landscape replacement dimensions in agreement with the crop", () => {
  const result = resolveContentImages({ src, width: 2400, height: 1600, crop: { left: 0.25, right: 0.25 }, hotspot: { x: 0.75, y: 0.5 } });
  expect(result.width).toBe(1200);
  expect(result.height).toBe(1600);
  expect(result.hotspot.x).toBe(1);
  expect(new URL(result.src).searchParams.get("rect")).toBe("600,0,1200,1600");
});
it("rejects invalid dimensions, crops and untrusted remote URLs", () => {
  expect(() => resolveContentImages({ src, width: 0, height: 1 })).toThrow();
  expect(() => resolveContentImages({ src, width: 2400, height: 1600, crop: { left: 0.5, right: 0.5 } })).toThrow();
  for (const url of ["https://evil.test/image.jpg", "http://cdn.sanity.io/images/x/y/a.jpg", "https://cdn.sanity.io.evil.test/image.jpg", "https://cdn.sanity.io/files/a/b/file.pdf"]) {
    expect(sanityImageUrl(url)).toBeNull();
    expect(() => exhibitionTextureUrl(url)).toThrow();
  }
});
it("preserves the optimized local demonstration texture strategy", () => expect(exhibitionTextureUrl("/photos/exterior/example.webp")).toBe("/_next/image?url=%2Fphotos%2Fexterior%2Fexample.webp&w=1280&q=75"));
it("keeps uncropped CDN originals intact before responsive Next optimization", () => {
  const image = { src, width: 2400, height: 1600, crop: { left: 0, right: 0, top: 0, bottom: 0 } };
  expect(resolveContentImages(image)).toBe(image);
});
it("uses the responsive requested width directly on the trusted CDN and retains editorial crop", () => {
  const url = new URL(responsiveSanityImageUrl(`${src}?rect=0,0,1200,1600`, 640));
  expect(url.searchParams.get("w")).toBe("640");
  expect(url.searchParams.get("rect")).toBe("0,0,1200,1600");
  expect(url.searchParams.get("q")).toBe("75");
  expect(url.searchParams.get("fit")).toBe("max");
  expect(() => responsiveSanityImageUrl(src, 5000)).toThrow();
  expect(() => responsiveSanityImageUrl("https://example.com/image.webp", 640)).toThrow();
});
it("keeps curated chapter order and removes empty chapters without hiding gallery photos", () => {
  const groups = [{ title: "Empty", images: [{ src, width: 1, height: 1, exhibition: false }] },
    { title: "Selected", images: [{ src, width: 1600, height: 2400, exhibition: true }, { src, width: 0, height: 0, exhibition: true }] }];
  const selected = exhibitionSelection(groups);
  expect(selected.map((g) => g.title)).toEqual(["Selected"]);
  expect(selected[0].images).toHaveLength(1);
  expect(groups[1].images).toHaveLength(2);
  expect(exhibitionSelection([groups[0]])).toEqual([]);
});
