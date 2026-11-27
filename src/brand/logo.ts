// Final Evermere logo (Threshold). Single source for the site, favicon and exported SVGs.
// Plain data and string builders, no framework imports, so Node can run the export script.
// A client logo uploaded to siteSettings.logo in Sanity replaces this at render time.
import wordmark from "./wordmark.json" with { type: "json" };

export const mark = {
  // Arched doorway with an inner opening (even-odd), and the open door panel.
  body: "M8 44V24a16 16 0 0 1 32 0v20ZM19 44V27a5 5 0 0 1 10 0v17Z",
  accent: "M19 44V28.5l6 2.5V44Z",
};

// Optically simplified for 16 to 24px: wider opening and door, edges on a 3-unit grid
// so they land on whole pixels at 16px.
export const smallMark = {
  body: "M6 45V24a18 18 0 0 1 36 0v21ZM18 45V27a6 6 0 0 1 12 0v18Z",
  accent: "M18 45V28.5l6 3V45Z",
};

export { wordmark };

export const variants = {
  primary: { body: "#18243D", accent: "#4564B4", name: "#18243D", descriptor: "#4564B4", use: "White and Cloud backgrounds" },
  lavender: { body: "#18243D", accent: "#4564B4", name: "#18243D", descriptor: "#18243D", use: "Lavender backgrounds" },
  reversed: { body: "#FFFFFF", accent: "#DCDFF5", name: "#FFFFFF", descriptor: "#DCDFF5", use: "Midnight backgrounds and dark photography" },
  midnight: { body: "#18243D", accent: "#18243D", name: "#18243D", descriptor: "#18243D", use: "Single color on light backgrounds" },
  white: { body: "#FFFFFF", accent: "#FFFFFF", name: "#FFFFFF", descriptor: "#FFFFFF", use: "Single color on Royal and photography" },
} as const;

export type LogoVariant = keyof typeof variants;

export const lockup = { width: 186, height: 48 };

const title = (t: string) => `<title>${t}</title>`;

export function markSvg(v: LogoVariant, small = false): string {
  const c = variants[v];
  const m = small ? smallMark : mark;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="Evermere">${title("Evermere")}<path fill="${c.body}" fill-rule="evenodd" d="${m.body}"/><path fill="${c.accent}" d="${m.accent}"/></svg>`;
}

export function horizontalSvg(v: LogoVariant): string {
  const c = variants[v];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lockup.width} ${lockup.height}" role="img" aria-label="Evermere Senior Living">${title("Evermere Senior Living")}<path fill="${c.body}" fill-rule="evenodd" d="${mark.body}"/><path fill="${c.accent}" d="${mark.accent}"/><path fill="${c.name}" d="${wordmark.name.d}"/><path fill="${c.descriptor}" d="${wordmark.descriptor.d}"/></svg>`;
}
