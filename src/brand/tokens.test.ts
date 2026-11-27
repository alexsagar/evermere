import { describe, expect, it } from "vitest";
import { contrast, pairs, palette } from "./tokens";

describe("brand color pairs", () => {
  it("matches the known WCAG reference", () => {
    expect(contrast("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
  });

  it.each(pairs)("$fg on $bg meets its approved use ($use)", ({ fg, bg, use }) => {
    const ratio = contrast(palette[fg].hex, palette[bg].hex);
    if (use === "text") expect(ratio).toBeGreaterThanOrEqual(4.5);
    else if (use === "large") expect(ratio).toBeGreaterThanOrEqual(3);
    else expect(ratio).toBeLessThan(4.5);
  });
});
