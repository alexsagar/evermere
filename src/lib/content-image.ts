/** Only Sanity's image CDN can be used for remote content and WebGL textures. */
export function exhibitionSelection<T extends { images: { src?: string | null; width?: number | null; height?: number | null; exhibition?: boolean | null }[] }>(groups: T[]): T[] {
  return groups.map((group) => ({ ...group, images: group.images.filter((image) => image.exhibition !== false && image.src && Number.isFinite(image.width) && Number.isFinite(image.height) && Number(image.width) > 0 && Number(image.height) > 0) })).filter((group) => group.images.length > 0);
}

export function sanityImageUrl(src: string): URL | null {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.hostname === "cdn.sanity.io" && !url.username && !url.password
      && /^\/images\/[a-z0-9]+\/[a-z0-9_-]+\/[a-f0-9]+-\d+x\d+\.[a-z0-9]+$/.test(url.pathname) ? url : null;
  } catch { return null; }
}

/** Next Image supplies the chosen responsive width; the CDN does one bounded encode. */
export function responsiveSanityImageUrl(src: string, width: number, quality = 75): string {
  const url = sanityImageUrl(src);
  if (!url || !Number.isInteger(width) || width <= 0 || width > 3840) throw new Error("Invalid responsive Sanity image request");
  url.searchParams.set("w", String(width));
  url.searchParams.set("fit", "max");
  url.searchParams.set("auto", "format");
  url.searchParams.set("q", String(Math.max(1, Math.min(100, quality))));
  return url.toString();
}

export function exhibitionTextureUrl(src: string): string {
  const url = sanityImageUrl(src);
  if (url) {
    url.searchParams.set("w", "1280");
    url.searchParams.set("h", "1280");
    url.searchParams.set("fit", "max");
    url.searchParams.set("auto", "format");
    url.searchParams.set("q", "75");
    return url.toString();
  }
  if (!src.startsWith("/photos/") || src.includes("..") || src.includes("?")) throw new Error("Unsupported exhibition image source");
  return `/_next/image?url=${encodeURIComponent(src)}&w=1280&q=75`;
}

/** Resolve editorial crop once, keeping dimensions and texture planes in agreement. */
export function resolveContentImages<T>(value: T): T {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(resolveContentImages) as T;
  const object = value as Record<string, unknown>;
  if ("src" in object && object.src == null) throw new Error("Missing Sanity image asset");
  if (typeof object.src === "string") {
    const url = sanityImageUrl(object.src);
    if (!url || !Number.isFinite(object.width) || !Number.isFinite(object.height) || Number(object.width) <= 0 || Number(object.height) <= 0) throw new Error("Invalid Sanity image metadata");
    const width = Number(object.width), height = Number(object.height);
    const crop = object.crop as { left?: number; right?: number; top?: number; bottom?: number } | null;
    if (crop) {
      const { left = 0, right = 0, top = 0, bottom = 0 } = crop;
      if (![left, right, top, bottom].every((n) => Number.isFinite(n) && n >= 0 && n < 1) || left + right >= 1 || top + bottom >= 1) throw new Error("Invalid Sanity image crop");
      // A zero crop must keep the original CDN file, avoiding an unnecessary re-encode before Next Image.
      if (left === 0 && right === 0 && top === 0 && bottom === 0) return value;
      const x = Math.round(width * left), y = Math.round(height * top);
      const w = Math.max(1, Math.min(width - x, Math.round(width * (1 - left - right))));
      const h = Math.max(1, Math.min(height - y, Math.round(height * (1 - top - bottom))));
      url.searchParams.set("rect", `${x},${y},${w},${h}`);
      const focal = object.hotspot as { x?: number; y?: number } | null;
      return { ...object, src: url.toString(), width: w, height: h,
        hotspot: { x: Math.max(0, Math.min(1, ((focal?.x ?? 0.5) * width - x) / w)), y: Math.max(0, Math.min(1, ((focal?.y ?? 0.5) * height - y) / h)) } } as T;
    }
    return value;
  }
  return Object.fromEntries(Object.entries(object).map(([key, child]) => [key, resolveContentImages(child)])) as T;
}
