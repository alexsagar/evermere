import { expect, test } from "vitest";
import { prefersReducedMotion, previewOverrides, supportsWebGL } from "./motion";

test("prefersReducedMotion reads the media query", () => {
  const win = (matches: boolean) => ({ matchMedia: () => ({ matches }) as MediaQueryList });
  expect(prefersReducedMotion(win(true))).toBe(true);
  expect(prefersReducedMotion(win(false))).toBe(false);
});

test("supportsWebGL falls back to false without a context or on error", () => {
  const doc = (ctx: unknown) =>
    ({ createElement: () => ({ getContext: () => ctx }) }) as unknown as Document;
  expect(supportsWebGL(doc({}))).toBe(true);
  expect(supportsWebGL(doc(null))).toBe(false);
  expect(supportsWebGL({ createElement: () => { throw new Error(); } } as unknown as Document)).toBe(false);
});

test("previewOverrides reads only the two documented lab flags", () => {
  expect(previewOverrides("")).toEqual({ reduce: false, noWebGL: false });
  expect(previewOverrides("?motion=reduce&webgl=off")).toEqual({ reduce: true, noWebGL: true });
  expect(previewOverrides("?motion=full&webgl=on")).toEqual({ reduce: false, noWebGL: false });
});
