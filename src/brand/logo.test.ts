import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { horizontalSvg, markSvg, variants, type LogoVariant } from "./logo";

const files = readdirSync("public/brand");

describe("final logo assets", () => {
  it("exports every variant as mark and horizontal lockup, plus the small mark", () => {
    expect(files).toHaveLength(Object.keys(variants).length * 2 + 1);
  });

  it.each(files)("%s is self-contained, titled and matches the source", (name) => {
    const svg = readFileSync(`public/brand/${name}`, "utf8").trim();
    expect(svg).not.toMatch(/<text|font-family|<image|href=/);
    expect(svg).toMatch(/<title>Evermere( Senior Living)?<\/title>/);
    const [, kind, v] = name.match(/^evermere-(horizontal|mark|mark-small)-(\w+)\.svg$/)!;
    const expected = kind === "horizontal" ? horizontalSvg(v as LogoVariant) : markSvg(v as LogoVariant, kind === "mark-small");
    expect(svg).toBe(expected);
  });

  it("uses only approved palette colors", () => {
    const fills = files.flatMap((f) => readFileSync(`public/brand/${f}`, "utf8").match(/#[0-9A-F]{6}/gi) ?? []);
    for (const c of fills) expect(["#18243D", "#4564B4", "#DCDFF5", "#FFFFFF"]).toContain(c.toUpperCase());
  });

  it("favicon is the simplified small mark", () => {
    expect(readFileSync("public/favicon.svg", "utf8").trim()).toBe(markSvg("primary", true));
  });
});
