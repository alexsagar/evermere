import { describe, expect, it } from "vitest";
import { siteConfig } from "./site";

const approved = { SITE_ENV: "production", INDEXING_APPROVED: "yes", NEXT_PUBLIC_SITE_URL: "https://www.client-domain.test", NEXT_PUBLIC_SANITY_DATASET: "production" };

describe("indexing guard", () => {
  it("is non-indexable with nothing configured, on the local origin", () => {
    expect(siteConfig({})).toEqual({ env: "local", origin: "http://localhost:3000", indexable: false });
  });
  it("indexes only when every condition is explicitly met", () => {
    expect(siteConfig(approved).indexable).toBe(true);
    expect(siteConfig(approved).origin).toBe("https://www.client-domain.test");
  });
  it.each([
    ["missing approval", { ...approved, INDEXING_APPROVED: undefined }],
    ["approval typo", { ...approved, INDEXING_APPROVED: "true" }],
    ["preview environment", { ...approved, SITE_ENV: "preview" }],
    ["misspelled environment", { ...approved, SITE_ENV: "prod" }],
    ["missing domain", { ...approved, NEXT_PUBLIC_SITE_URL: undefined }],
    ["invalid domain", { ...approved, NEXT_PUBLIC_SITE_URL: "not a url" }],
    ["plain http", { ...approved, NEXT_PUBLIC_SITE_URL: "http://www.client-domain.test" }],
    ["localhost", { ...approved, NEXT_PUBLIC_SITE_URL: "https://localhost" }],
    ["example domain", { ...approved, NEXT_PUBLIC_SITE_URL: "https://evermere.example.com" }],
    ["preview hosting", { ...approved, NEXT_PUBLIC_SITE_URL: "https://evermere-git-main.vercel.app" }],
    ["development dataset", { ...approved, NEXT_PUBLIC_SANITY_DATASET: "development" }],
    ["missing dataset", { ...approved, NEXT_PUBLIC_SANITY_DATASET: undefined }],
  ])("stays noindex: %s", (_, env) => expect(siteConfig(env).indexable).toBe(false));
});
