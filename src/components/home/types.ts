import type { ContentImage } from "@/components/site/Img";

/** A homepage chapter as delivered by the content layer. */
export type Chapter = {
  key?: string | null;
  heading?: string | null;
  body?: string[] | null;
  cta?: { label?: string | null; href?: string | null } | null;
  image?: ContentImage;
};

export type Scene = { heading: string; body: string; image: ContentImage };
