import { z } from "zod";

/**
 * Site environment and indexing guard. Indexing is OFF unless all three hold:
 * SITE_ENV=production, INDEXING_APPROVED=yes and an https NEXT_PUBLIC_SITE_URL that is
 * not local, example or preview hosting. Anything missing, misspelled or invalid falls
 * back to the non-indexable local configuration; it can never switch indexing on.
 * The development Sanity dataset can never be served as an indexable live site: indexing
 * also requires NEXT_PUBLIC_SANITY_DATASET to be an explicitly approved non-development
 * dataset. noindex is not access control: a confidential client preview also needs auth.
 */
const LOCAL = "http://localhost:3000";
const schema = z.object({
  SITE_ENV: z.enum(["local", "preview", "production"]).catch("local"),
  NEXT_PUBLIC_SITE_URL: z.url({ protocol: /^https?$/ }).catch(LOCAL),
  INDEXING_APPROVED: z.string().optional().catch(undefined),
  NEXT_PUBLIC_SANITY_DATASET: z.string().optional().catch(undefined),
});

export function siteConfig(source: Record<string, string | undefined> = process.env) {
  const v = schema.parse({
    SITE_ENV: source.SITE_ENV || undefined,
    NEXT_PUBLIC_SITE_URL: source.NEXT_PUBLIC_SITE_URL || undefined,
    INDEXING_APPROVED: source.INDEXING_APPROVED,
    NEXT_PUBLIC_SANITY_DATASET: source.NEXT_PUBLIC_SANITY_DATASET,
  });
  const url = new URL(v.NEXT_PUBLIC_SITE_URL);
  const publicHost = url.protocol === "https:" && !/(^|\.)(localhost|127\.0\.0\.1|example\.(com|org|net)|vercel\.app|pages\.dev|netlify\.app)$/.test(url.hostname);
  const productionDataset = !!v.NEXT_PUBLIC_SANITY_DATASET && v.NEXT_PUBLIC_SANITY_DATASET !== "development";
  return {
    env: v.SITE_ENV,
    origin: url.origin,
    indexable: v.SITE_ENV === "production" && v.INDEXING_APPROVED === "yes" && publicHost && productionDataset,
  };
}

export const site = siteConfig();
