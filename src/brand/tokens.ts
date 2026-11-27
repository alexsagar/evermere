// Brand tokens shared by the review page and tests. Colors mirror globals.css.
export const palette = {
  midnight: { hex: "#18243D", name: "Midnight Blue", role: "Primary text, dark surfaces, the mark" },
  royal: { hex: "#4564B4", name: "Royal Blue", role: "Actions, links, the accent in the mark" },
  lavender: { hex: "#DCDFF5", name: "Lavender", role: "Quiet surfaces, accents on dark" },
  cloud: { hex: "#F5F7FC", name: "Cloud White", role: "Default page background" },
  white: { hex: "#FFFFFF", name: "Pure White", role: "Raised surfaces, text on dark" },
} as const;

export type ColorName = keyof typeof palette;

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Intended foreground/background pairs and what each is approved for.
// "text": any size (4.5:1). "large": 24px+ or 19px+ bold, and UI marks (3:1). "none": never.
export const pairs: { fg: ColorName; bg: ColorName; use: "text" | "large" | "none" }[] = [
  { fg: "midnight", bg: "white", use: "text" },
  { fg: "midnight", bg: "cloud", use: "text" },
  { fg: "midnight", bg: "lavender", use: "text" },
  { fg: "royal", bg: "white", use: "text" },
  { fg: "royal", bg: "cloud", use: "text" },
  { fg: "royal", bg: "lavender", use: "large" },
  { fg: "white", bg: "midnight", use: "text" },
  { fg: "lavender", bg: "midnight", use: "text" },
  { fg: "cloud", bg: "midnight", use: "text" },
  { fg: "white", bg: "royal", use: "text" },
  { fg: "cloud", bg: "royal", use: "text" },
  { fg: "lavender", bg: "royal", use: "none" },
  { fg: "royal", bg: "midnight", use: "none" },
];

export const typeScale = [
  { token: "display", size: "clamp(3rem, 7vw, 6.5rem)", weight: 600, leading: 0.98, tracking: "-0.035em", use: "One statement per page" },
  { token: "h1", size: "clamp(2.5rem, 5vw, 4.25rem)", weight: 600, leading: 1.04, tracking: "-0.03em", use: "Page headings" },
  { token: "h2", size: "clamp(1.875rem, 3.2vw, 2.75rem)", weight: 600, leading: 1.1, tracking: "-0.02em", use: "Section headings" },
  { token: "h3", size: "1.375rem", weight: 650, leading: 1.25, tracking: "-0.01em", use: "Sub-sections, item titles" },
  { token: "lead", size: "clamp(1.1875rem, 1.6vw, 1.375rem)", weight: 450, leading: 1.5, tracking: "-0.005em", use: "Introductions" },
  { token: "body", size: "1.125rem", weight: 450, leading: 1.65, tracking: "0", use: "Running text, 18px minimum" },
  { token: "small", size: "0.9375rem", weight: 500, leading: 1.5, tracking: "0.005em", use: "Captions, footer, metadata" },
] as const;

export const spacing = [4, 8, 12, 16, 24, 32, 48, 64, 96, 144, 208] as const;

export const radii = [
  { token: "none", value: "0", use: "Photography, sections, layout blocks" },
  { token: "sm", value: "2px", use: "Buttons, inputs, focus rings" },
  { token: "arch", value: "999px 999px 0 0", use: "Reserved: one arched image frame per page, echoing the doorway" },
] as const;
