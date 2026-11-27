import { describe, expect, it, vi } from "vitest";
import { contentEnvironmentSchema } from "@/lib/env";
import { requireContent } from "./validate";

describe("CMS configuration and response contracts", () => {
  it("uses explicitly selected demo mode even when a project ID exists", () => expect(contentEnvironmentSchema.parse({ CONTENT_SOURCE: "demo", NEXT_PUBLIC_SANITY_PROJECT_ID: "example" }).CONTENT_SOURCE).toBe("demo"));
  it("never silently selects demo when CMS configuration is absent", () => expect(() => contentEnvironmentSchema.parse({})).toThrow());
  it("requires a real project in CMS mode", () => {
    expect(() => contentEnvironmentSchema.parse({ CONTENT_SOURCE: "sanity" })).toThrow();
    expect(() => contentEnvironmentSchema.parse({ CONTENT_SOURCE: "sanity", NEXT_PUBLIC_SANITY_PROJECT_ID: "local-demo" })).toThrow();
    expect(contentEnvironmentSchema.parse({ CONTENT_SOURCE: "sanity", NEXT_PUBLIC_SANITY_PROJECT_ID: "8nawnqp2" }).NEXT_PUBLIC_SANITY_DATASET).toBe("development");
  });
  it("rejects production and unrelated projects in CMS mode", () => {
    expect(() => contentEnvironmentSchema.parse({ CONTENT_SOURCE: "sanity", NEXT_PUBLIC_SANITY_PROJECT_ID: "4qnp14bk" })).toThrow();
    expect(() => contentEnvironmentSchema.parse({ CONTENT_SOURCE: "sanity", NEXT_PUBLIC_SANITY_PROJECT_ID: "8nawnqp2", NEXT_PUBLIC_SANITY_DATASET: "production" })).toThrow();
  });
  it("requires CMS brand assets rather than silently displaying the demonstration brand", () => {
    expect(() => requireContent({ name: "Evermere", logo: null }, "siteSettings", { name: "Evermere", logo: null })).toThrow("brand assets missing");
  });
  it("rejects unknown modes, malformed datasets and invalid API dates", () => {
    for (const value of [{ CONTENT_SOURCE: "auto" }, { NEXT_PUBLIC_SANITY_DATASET: "../private" }, { NEXT_PUBLIC_SANITY_API_VERSION: "tomorrow" }]) expect(() => contentEnvironmentSchema.parse(value)).toThrow();
  });
  it("never replaces missing, empty or invalid CMS responses with demo copy", () => {
    expect(() => requireContent(null, "settings", { name: "demo" })).toThrow("missing");
    expect(() => requireContent([], "articles", [{ title: "demo" }])).toThrow("missing");
    expect(() => requireContent({ name: 9 }, "settings", { name: "demo" } as unknown as { name: number })).toThrow("Invalid");
  });
  it("allows an explicitly empty published article collection after unpublishing", () => expect(requireContent([], "article", [{ title: "demo" }], true)).toEqual([]));
  it("accepts schema-nullable images and links without replacing published content", () => {
    const value = [{ title: "Privacy", image: null, cta: null, related: null }];
    expect(requireContent(value, "page", [{ title: "About", image: { src: "example" }, cta: { href: "/" }, related: [] }] as unknown as typeof value)).toBe(value);
  });
  it("reads demo without network and propagates CMS authentication errors", async () => {
    vi.resetModules();
    vi.doMock("server-only", () => ({}));
    vi.doMock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
    vi.doMock("@/sanity/client", () => ({ client: null }));
    const demo = await import("./index");
    expect((await demo.getArticles()).length).toBe(4);
    vi.resetModules();
    vi.doMock("@/sanity/client", () => ({ client: { fetch: vi.fn().mockRejectedValue(new Error("secret-token")) } }));
    const cms = await import("./index");
    await expect(cms.getArticles()).rejects.toThrow("Sanity fetch failed: article");
    await expect(cms.getArticles()).rejects.not.toThrow("secret-token");
    vi.doUnmock("@/sanity/client");
  });
});
