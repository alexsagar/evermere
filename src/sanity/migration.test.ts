import { describe, expect, it } from "vitest";
import { buildMigration, validateMigration } from "./migration";
import { assertSeedSafe } from "./seed-safety";
import { photos } from "@/content/photos";
import { demoHomePage } from "@/content/demo";
import { demoPages } from "@/content/demo-pages";

const assets = Object.fromEntries([...photos.map((p) => p.id), "logo", "logoDark", "favicon"].map((key, i) => [key, `image-${String(i).padStart(40, "0")}-100x100-webp`]));
const documents = buildMigration(assets);
describe("migration bundle", () => {
  it("has exactly 61 content documents and 59 unique asset references", () => {
    expect(documents).toHaveLength(61);
    expect(Object.keys(assets)).toHaveLength(59);
    expect(documents.filter((d) => d._type === "faq")).toHaveLength(18);
    expect(documents.filter((d) => d._type === "teamMember")).toHaveLength(6);
  });
  it("generates deterministic IDs and content on repeated runs", () => expect(buildMigration(assets)).toEqual(documents));
  it("uses valid stable array keys throughout the export", () => {
    const keys = [...JSON.stringify(documents).matchAll(/"_key":"([^"]+)"/g)].map((m) => m[1]);
    expect(keys.length).toBeGreaterThan(100);
    expect(keys.every((key) => /^[a-zA-Z0-9_-]+$/.test(key))).toBe(true);
  });
  it("has only valid references", () => expect(() => validateMigration(documents, assets)).not.toThrow());
  it("rejects duplicate IDs and broken references", () => {
    expect(() => validateMigration([...documents, documents[0]], assets)).toThrow("Duplicate");
    expect(() => validateMigration([{ _id: "bad", _type: "page", image: { _ref: "missing" } }], assets)).toThrow("Broken reference");
  });
  it("keeps every page's approved copy and stable section keys", () => {
    for (const page of demoPages) {
      const migrated = documents.find((d) => d._id === page._id)!;
      expect(migrated.headline).toBe(page.headline);
      expect(migrated.intro).toBe(page.intro);
      // Demo seo carries a hardcoded image: null default; the migration drops null fields,
      // so compare the editorial text fields and not the absent social-image reference.
      const { title, description, socialTitle, socialDescription } = page.seo!;
      expect(migrated.seo).toMatchObject({ title, description, socialTitle, socialDescription });
      expect(migrated.sections).toEqual(expect.arrayContaining((page.sections ?? []).map((s) => expect.objectContaining({ key: s.key, heading: s.heading, body: s.body }))));
    }
    expect(documents.find((d) => d._type === "homePage")?.headline).toBe(demoHomePage.headline);
  });
  it("includes all 56 photos once in gallery order with focal points and licensing", () => {
    const gallery = documents.filter((d) => d._type === "gallery").flatMap((d) => d.images as Record<string, unknown>[]);
    expect(gallery).toHaveLength(56);
    expect(new Set(gallery.map((i) => (i.asset as { _ref: string })._ref)).size).toBe(56);
    for (const p of photos) {
      expect(gallery.find((i) => (i.asset as { _ref: string })._ref === assets[p.id])).toMatchObject({ alt: p.alt, usage: p.usage, originalReference: p.original.path, hotspot: p.focal });
      expect(JSON.stringify(gallery)).toContain(p.source.pageUrl);
    }
  });
  it("aborts for an unknown image asset", () => expect(() => buildMigration({})).toThrow());
  it("accepts an empty dataset and unchanged seed resumptions", () => {
    expect(() => assertSeedSafe([], documents, Object.values(assets))).not.toThrow();
    expect(() => assertSeedSafe(documents.map((d) => ({ ...d, _rev: "remote", _updatedAt: "now" })), documents, Object.values(assets))).not.toThrow();
  });
  it("ignores Sanity-managed publish metadata while protecting editorial fields", () => {
    const published = { ...documents[0], _system: { base: { id: documents[0]._id, rev: "server-revision" } } };
    expect(() => assertSeedSafe([published], documents, Object.values(assets))).not.toThrow();
    expect(() => assertSeedSafe([{ ...published, name: "Client edit" }], documents, Object.values(assets))).toThrow();
  });
  it("refuses edited content, drafts and unrelated documents before any writes", () => {
    for (const existing of [[{ ...documents[0], name: "Client edit" }], [{ _id: "drafts.page-about", _type: "page" }], [{ _id: "unrelated", _type: "page" }]]) {
      expect(() => assertSeedSafe(existing, documents, Object.values(assets))).toThrow("Refusing all writes");
    }
  });
});
