import { z } from "zod";

// Public values only. Server secrets (Resend, Turnstile secret, Sanity tokens)
// get their own server-only module when the inquiry milestone adds them.
export const contentEnvironmentSchema = z.object({
  CONTENT_SOURCE: z.enum(["demo", "sanity"]).default("sanity"),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().regex(/^[a-z0-9-]+$/).optional(),
  NEXT_PUBLIC_SANITY_DATASET: z.string().regex(/^[a-z0-9_-]+$/).default("development"),
  NEXT_PUBLIC_SANITY_API_VERSION: z.iso.date().default("2026-11-01"),
}).superRefine((value, ctx) => {
  if (value.CONTENT_SOURCE === "sanity" && (!value.NEXT_PUBLIC_SANITY_PROJECT_ID || value.NEXT_PUBLIC_SANITY_PROJECT_ID === "local-demo")) {
    ctx.addIssue({ code: "custom", path: ["NEXT_PUBLIC_SANITY_PROJECT_ID"], message: "CMS mode requires an approved real project ID" });
  }
  if (value.CONTENT_SOURCE === "sanity" && value.NEXT_PUBLIC_SANITY_PROJECT_ID && value.NEXT_PUBLIC_SANITY_PROJECT_ID !== "8nawnqp2") {
    ctx.addIssue({ code: "custom", path: ["NEXT_PUBLIC_SANITY_PROJECT_ID"], message: "Only approved Evermere project 8nawnqp2 is permitted" });
  }
  if (value.CONTENT_SOURCE === "sanity" && value.NEXT_PUBLIC_SANITY_DATASET !== "development") {
    ctx.addIssue({ code: "custom", path: ["NEXT_PUBLIC_SANITY_DATASET"], message: "Only development is authorized until production migration approval" });
  }
});

export const env = contentEnvironmentSchema.parse({
  CONTENT_SOURCE: process.env.CONTENT_SOURCE || undefined,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || undefined,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET || undefined,
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION || undefined,
});

/** True once a real Sanity project is configured; until then the local demo source is used. */
export const sanityConfigured = env.CONTENT_SOURCE === "sanity";
