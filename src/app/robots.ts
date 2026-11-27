import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Blocks all crawlers unless production indexing is explicitly approved (src/lib/site.ts).
export default function robots(): MetadataRoute.Robots {
  if (!site.indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dev/", "/api/", "/studio/"] },
    sitemap: `${site.origin}/sitemap.xml`,
  };
}
