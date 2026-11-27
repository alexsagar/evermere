import { demoHomePage, demoInquirySettings, demoNavigation, demoSiteSettings } from "../content/demo";
import { demoArticles } from "../content/demo-articles";
import { demoAccommodations, demoCareServices, demoFaqs, demoGallery, demoTeam } from "../content/demo-collections";
import { demoPages } from "../content/demo-pages";
import { photos } from "../content/photos";

export type MigrationDocument = { _id: string; _type: string; [key: string]: unknown };
export type AssetIds = Record<string, string>;
export const brandFiles = {
  logo: "public/brand/evermere-horizontal-primary.svg",
  logoDark: "public/brand/evermere-horizontal-reversed.svg",
  favicon: "public/favicon.svg",
};

/** Pure conversion, with no network access. Asset IDs are supplied by the local hash manifest. */
export function buildMigration(assetIds: AssetIds): MigrationDocument[] {
  function convert(value: unknown, key = ""): unknown {
    if (value == null) return undefined;
    if (Array.isArray(value)) return value.map((item, index) => {
      const converted = convert(item);
      if (!converted || typeof converted !== "object") return converted;
      const object = converted as Record<string, unknown>;
      return { ...(["sections", "chapters"].includes(key) ? { _type: "section" } : {}), ...object,
        _key: typeof object._key === "string" && /^[a-zA-Z0-9_-]+$/.test(object._key) ? object._key : `item-${index + 1}` };
    });
    if (typeof value !== "object") return key === "slug" ? { _type: "slug", current: value } : value;
    const object = value as Record<string, unknown>;
    if (typeof object.src === "string") {
      const photo = photos.find((p) => p.src === object.src);
      if (!photo || !assetIds[photo.id]) throw new Error(`Unknown migration image: ${object.src}`);
      return {
        _type: "figure", asset: { _type: "reference", _ref: assetIds[photo.id] }, alt: object.alt,
        hotspot: { _type: "sanity.imageHotspot", ...photo.focal, width: 1, height: 1 },
        crop: { _type: "sanity.imageCrop", top: 0, bottom: 0, left: 0, right: 0 },
        source: JSON.stringify(photo.source), originalReference: photo.original.path,
        usage: photo.usage, exhibition: true,
      };
    }
    return { ...(["seo", "defaultSeo"].includes(key) ? { _type: "seo" } : {}), ...Object.fromEntries(Object.entries(object).filter(([, v]) => v != null).map(([k, v]) => [k, convert(v, k)])) };
  }
  const doc = (type: string, value: object, id: string): MigrationDocument => ({ ...convert(value) as object, _type: type, _id: id });
  const site = doc("siteSettings", demoSiteSettings, "siteSettings");
  for (const key of Object.keys(brandFiles)) {
    if (!assetIds[key]) throw new Error(`Missing brand asset: ${key}`);
    site[key] = { _type: "figure", alt: "Evermere Senior Living", asset: { _type: "reference", _ref: assetIds[key] } };
  }
  return [
    site, doc("navigation", demoNavigation, "navigation"), doc("homePage", demoHomePage, "homePage"), doc("inquirySettings", demoInquirySettings, "inquirySettings"),
    ...demoPages.map((p, i) => doc("page", { ...p, order: i + 1 }, p._id)),
    ...demoAccommodations.map((p) => doc("accommodation", p, p._id)),
    ...demoCareServices.map((p) => doc("careService", p, p._id)),
    ...demoTeam.map((p) => doc("teamMember", p, p._id)),
    ...demoGallery.map((p) => doc("gallery", p, p._id)),
    ...demoArticles.map((p) => doc("article", p, p._id)),
    ...demoFaqs.map((p) => doc("faq", p, p._id)),
  ];
}

export function validateMigration(documents: MigrationDocument[], assets: AssetIds) {
  const ids = new Set(documents.map((d) => d._id));
  if (ids.size !== documents.length) throw new Error("Duplicate migration IDs");
  const allowed = new Set([...ids, ...Object.values(assets)]);
  function visit(value: unknown) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    const object = value as Record<string, unknown>;
    if (typeof object._ref === "string" && !allowed.has(object._ref)) throw new Error(`Broken reference: ${object._ref}`);
    Object.values(object).forEach(visit);
  }
  documents.forEach(visit);
}
