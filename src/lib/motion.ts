// Client-side capability checks. Every GSAP/WebGL experience must gate on these
// and render a static, fully usable fallback when either returns false.

export function prefersReducedMotion(win: Pick<Window, "matchMedia"> = window): boolean {
  return win.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function supportsWebGL(doc: Pick<Document, "createElement"> = document): boolean {
  try {
    const canvas = doc.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Lab preview overrides from the query string: `?motion=reduce` and `?webgl=off`. */
export function previewOverrides(search: string): { reduce: boolean; noWebGL: boolean } {
  const q = new URLSearchParams(search);
  return { reduce: q.get("motion") === "reduce", noWebGL: q.get("webgl") === "off" };
}
