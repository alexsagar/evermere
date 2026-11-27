import Image from "next/image";
import { sanityImageUrl } from "@/lib/content-image";
import { SanityImage } from "./SanityImage";

/** Image as delivered by the content layer (Sanity projection or local demo). */
export type ContentImage = {
  src?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  exhibition?: boolean | null;
  caption?: string | null;
  hotspot?: { x?: number | null; y?: number | null } | null;
} | null | undefined;

/** Fills its positioned parent, cropped around the content's focal point. */
export function Img({ image, sizes, className = "", priority, decorative }: { image: ContentImage; sizes: string; className?: string; priority?: boolean; decorative?: boolean }) {
  if (!image?.src) return null;
  const x = image.hotspot?.x ?? 0.5;
  const y = image.hotspot?.y ?? 0.5;
  const Component = sanityImageUrl(image.src) ? SanityImage : Image;
  return (
    <Component
      src={image.src}
      alt={decorative ? "" : (image.alt ?? "")}
      fill
      sizes={sizes}
      // Next 16: `priority` is deprecated; the LCP image loads eagerly at high priority.
      loading={priority ? "eager" : undefined}
      fetchPriority={priority ? "high" : undefined}
      className={`object-cover ${className}`}
      style={{ objectPosition: `${x * 100}% ${y * 100}%` }}
    />
  );
}
