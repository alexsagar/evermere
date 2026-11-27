"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";
import { responsiveSanityImageUrl } from "@/lib/content-image";

export const sanityLoader = ({ src, width, quality }: ImageLoaderProps) => responsiveSanityImageUrl(src, width, quality);

/** Client boundary keeps Next's loader function out of serialized server props. */
export function SanityImage(props: Omit<ImageProps, "loader">) {
  // All sizing, alt text, loading and focal-position props are supplied by the existing image component.
  // eslint-disable-next-line jsx-a11y/alt-text -- alt is required by ImageProps and supplied through props.
  return <Image {...props} loader={sanityLoader} />;
}
