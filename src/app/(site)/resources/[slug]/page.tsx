import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { shareImage } from "@/components/page/page";
import { JsonLd, absolute, orgId } from "@/components/site/JsonLd";
import { RichText } from "@/components/page/RichText";
import { Img } from "@/components/site/Img";
import { INQUIRY_HREF } from "@/components/site/links";
import { getArticles, getPage, getSiteSettings } from "@/content";

// Known guides are prerendered; any other slug reaches notFound() below (HTTP 404).
// Fully static output: an unlisted slug waits for its static render instead of being
// served the partial fallback shell, which commits HTTP 200 before notFound() runs.
export const ensureStatic = "navigation";
export const instant = false;

export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ slug: a.slug ?? "" }));
}

async function find(slug: string) {
  return (await getArticles()).find((a) => a.slug === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/resources/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [a, site] = await Promise.all([find(slug), getSiteSettings()]);
  if (!a) return {};
  const path = `/resources/${slug}`;
  return {
    title: a.seo?.title ?? a.title,
    description: a.seo?.description ?? a.summary,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: site.name ?? undefined,
      title: a.seo?.socialTitle ?? a.title ?? undefined,
      description: a.seo?.socialDescription ?? a.summary ?? undefined,
      url: path,
      images: shareImage(a.seo?.image, a.image),
    },
  };
}

// A long-form reading page: narrow measure, photograph above the fold,
// breadcrumbs back to the guides, and two other guides at the end.
export default async function ArticlePage({ params }: PageProps<"/resources/[slug]">) {
  const { slug } = await params;
  const [article, all, resources, site] = await Promise.all([find(slug), getArticles(), getPage("resources"), getSiteSettings()]);
  if (!article) notFound();
  const others = all.filter((a) => a.slug !== slug).slice(0, 2);
  const talk = resources?.sections?.find((s) => s.key === "conversation");
  return (
    <article className="ar">
      <nav aria-label="Breadcrumb" className="ar-crumbs">
        <ol>
          <li><Link href="/resources">{resources?.title ?? "Resources"}</Link></li>
          <li aria-current="page">{article.title}</li>
        </ol>
      </nav>
      <JsonLd data={{
        "@graph": [
          {
            "@type": "Article", headline: article.title, description: article.summary ?? undefined, image: article.image?.src ?? undefined,
            datePublished: article.publishedAt ?? undefined, mainEntityOfPage: absolute(`/resources/${slug}`),
            author: { "@type": "Organization", "@id": orgId(), name: site.name }, publisher: { "@type": "Organization", "@id": orgId(), name: site.name, logo: site.logo?.src ?? undefined },
          },
          {
            "@type": "BreadcrumbList", itemListElement: [
              { "@type": "ListItem", position: 1, name: resources?.title ?? "Resources", item: absolute("/resources") },
              { "@type": "ListItem", position: 2, name: article.title },
            ],
          },
        ],
      }} />
      <header className="ar-head">
        <h1 className="ar-title">{article.title}</h1>
        <p className="pg-lead">{article.summary}</p>
      </header>
      <div className="ar-photo"><Img image={article.image} sizes="(min-width: 1024px) 70vw, 100vw" priority /></div>
      <RichText value={article.body} className="ar-body" top />

      <aside className="ar-talk" aria-labelledby="ar-talk">
        <h2 id="ar-talk" className="pg-h3">{talk?.heading}</h2>
        {talk?.body?.map((b) => <p key={b} className="mt-3">{b}</p>)}
        <Link href={INQUIRY_HREF} className="btn btn-primary mt-6">{talk?.cta?.label}</Link>
      </aside>

      {others.length > 0 && (
        <nav aria-labelledby="ar-more" className="ar-more">
          <h2 id="ar-more" className="pg-h3">More guides</h2>
          <ul>
            {others.map((a) => (
              <li key={a._id}><Link href={`/resources/${a.slug}`} className="ar-more-link"><span className="pg-h3">{a.title}</span><span className="mt-2 block">{a.summary}</span></Link></li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  );
}
