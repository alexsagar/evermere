import "server-only";
import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import { env } from "@/lib/env";

// Only constructed when a real project ID exists (see src/content).
export const client = env.CONTENT_SOURCE === "sanity"
  ? createClient({
      projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
      useCdn: false, // Next owns the cache; webhooks must read fresh published data.
      perspective: "published",
      stega: false,
      token: process.env.SANITY_API_READ_TOKEN || undefined,
    })
  : null;

export const urlFor = client ? createImageUrlBuilder(client).image : null;
