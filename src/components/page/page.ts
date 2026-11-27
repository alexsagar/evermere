import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, getSiteSettings } from "@/content";

export type PageData = NonNullable<Awaited<ReturnType<typeof getPage>>>;
export type Section = NonNullable<PageData["sections"]>[number];

/** Loads a page by slug, 404s if missing, and returns a section lookup. */
export async function loadPage(slug: string) {
  const page = await getPage(slug);
  if (!page) notFound();
  const sec = (key: string): Section => page.sections?.find((s) => s.key === key) ?? ({ key, heading: "", body: [] } as unknown as Section);
  return { page, sec };
}

/** Per-page metadata from the page's SEO fields; canonical is the page path. */
export async function pageMetadata(slug: string, path = `/${slug}`): Promise<Metadata> {
  const [page, site] = await Promise.all([getPage(slug), getSiteSettings()]);
  const seo = page?.seo;
  return {
    title: seo?.title ?? page?.title ?? site.name,
    description: seo?.description ?? page?.intro ?? undefined,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name ?? undefined,
      title: seo?.socialTitle ?? seo?.title ?? undefined,
      description: seo?.socialDescription ?? seo?.description ?? undefined,
      url: path,
      images: shareImage(seo?.image, page?.image),
    },
  };
}

type Shareable = { src?: string | null; width?: number | null; height?: number | null; alt?: string | null } | null | undefined;
/** The Studio "Social image" when set, otherwise the page photograph. */
export function shareImage(social: Shareable, fallback: Shareable) {
  const i = social?.src ? social : fallback;
  return i?.src ? [{ url: i.src, width: i.width ?? undefined, height: i.height ?? undefined, alt: i.alt ?? fallback?.alt ?? "" }] : undefined;
}
