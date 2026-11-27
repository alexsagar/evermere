import { describe, expect, it } from "vitest";
import * as demo from "./demo";
import { demoArticles } from "./demo-articles";
import * as collections from "./demo-collections";
import { demoPages } from "./demo-pages";

const all = JSON.stringify({ demo, demoArticles, collections, demoPages });
const routes = new Set(["/", ...demoPages.map((p) => `/${p.slug}`), ...demoArticles.map((a) => `/resources/${a.slug}`)]);

describe("demo content", () => {
  it("uses only reserved phone numbers and example.com email", () => {
    for (const n of all.match(/\d{3}-\d{4}/g) ?? []) expect(n).toMatch(/^555-01\d\d$/);
    for (const e of all.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? []) expect(e).toMatch(/@example\.com$/);
  });

  it("links only to planned routes", () => {
    const hrefs = [...all.matchAll(/"href":"([^"]+)"/g), ...all.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]);
    expect(hrefs.length).toBeGreaterThan(20);
    for (const href of hrefs) expect(routes, href).toContain(href);
  });

  it("has no placeholder copy", () => {
    expect(all).not.toMatch(/lorem|ipsum|TODO|TBD|placeholder/i);
  });

  it("covers the planned scope", () => {
    expect(demoArticles).toHaveLength(4);
    expect(collections.demoFaqs.length).toBeGreaterThanOrEqual(15);
    expect(demo.demoHomePage.chapters).toHaveLength(12);
    expect(collections.demoTeam.every((t) => t.name === null)).toBe(true);
  });
});
