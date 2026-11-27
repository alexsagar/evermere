import { site } from "@/lib/site";

/**
 * Schema.org JSON-LD. Only facts the CMS already publishes (name, description, logo,
 * article titles and dates). No address, geo, hours, ratings, prices or credentials:
 * those wait for verified client information. `<` is escaped so content cannot end the script.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export const absolute = (path: string) => new URL(path, site.origin).toString();
export const orgId = () => absolute("/#organization");
