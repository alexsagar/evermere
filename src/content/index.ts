import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { requireContent } from "./validate";
import { resolveContentImages } from "@/lib/content-image";
import { client } from "@/sanity/client";
import * as q from "@/sanity/queries";
import { demoHomePage, demoInquirySettings, demoNavigation, demoSiteSettings } from "./demo";
import { demoArticles } from "./demo-articles";
import { demoAccommodations, demoCareServices, demoFaqs, demoGallery, demoTeam } from "./demo-collections";
import { demoPages } from "./demo-pages";

// Single content access point. Components call these, never Sanity directly,
// so the local demo source and the live dataset are interchangeable.
async function load<T>(query: string, demo: NonNullable<T>): Promise<NonNullable<T>> {
  if (!client) return demo;
  return loadSanity<T>(query, demo);
}

async function loadSanity<T>(query: string, demo: NonNullable<T>): Promise<NonNullable<T>> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 3600, expire: 86400 });
  const type = /_type == "([a-zA-Z]+)"/.exec(query)?.[1];
  cacheTag(`sanity:${type ?? "content"}`);
  if (query.includes("asset->")) cacheTag("sanity:images");
  if (!client) throw new Error("CMS client unavailable");
  // Do not log upstream errors: they can include URLs or credential details.
  let value: T;
  try { value = await client.fetch<T>(query); }
  catch { throw new Error(`Sanity fetch failed: ${type ?? "content"}. Check project, dataset and read permissions.`); }
  // An empty published article list is legitimate after the last article is unpublished.
  return resolveContentImages(requireContent(value, type ?? "content", demo, type === "article")) as NonNullable<T>;
}

export const getSiteSettings = () => load(q.siteSettingsQuery, demoSiteSettings);
export const getNavigation = () => load(q.navigationQuery, demoNavigation);
export const getHomePage = () => load(q.homePageQuery, demoHomePage);
export const getInquirySettings = () => load(q.inquirySettingsQuery, demoInquirySettings);
export const getPages = () => load(q.pagesQuery, demoPages);
export const getCareServices = () => load(q.careServicesQuery, demoCareServices);
export const getAccommodations = () => load(q.accommodationsQuery, demoAccommodations);
export const getArticles = () => load(q.articlesQuery, demoArticles);
export const getTeam = () => load(q.teamQuery, demoTeam);
export const getFaqs = () => load(q.faqsQuery, demoFaqs);
export const getGallery = () => load(q.galleryQuery, demoGallery);

export async function getPage(slug: string) {
  return (await getPages()).find((p) => p.slug === slug) ?? null;
}
