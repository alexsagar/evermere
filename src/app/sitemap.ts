import type { MetadataRoute } from "next";
import { getArticles } from "@/content";
import { site } from "@/lib/site";

// The canonical, indexable content routes. Development, Studio, API and unknown
// URLs are never listed; articles come from published CMS content only.
const CONTENT_ROUTES = [
  "/", "/our-home", "/accommodations", "/amenities", "/lifestyle", "/dining", "/care-services",
  "/about", "/our-team", "/gallery", "/contact", "/resources", "/faq", "/privacy", "/accessibility",
] as const;

/** Empty until production indexing is approved, so the demonstration lists nothing. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!site.indexable) return [];
  const articles = (await getArticles()).filter((a) => a.slug).map((a) => `/resources/${a.slug}`);
  return [...CONTENT_ROUTES, ...articles].map((path) => ({ url: `${site.origin}${path}` }));
}
