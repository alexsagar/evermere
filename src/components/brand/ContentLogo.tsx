import Image from "next/image";
import type { ContentImage } from "@/components/site/Img";
import { Logo } from "./Logo";

/**
 * CMS logos fit the approved logo space without assuming the Threshold proportions.
 * `fluid` fills the parent's width instead (the footer's closing mark).
 */
export function ContentLogo({ image, dark = false, height = 40, fluid = false }: { image?: ContentImage; dark?: boolean; height?: number; fluid?: boolean }) {
  if (!image?.src || !image.width || !image.height) return <Logo variant={dark ? "reversed" : "primary"} height={height} className={fluid ? "logo-fluid" : undefined} />;
  return <Image src={image.src} alt={image.alt ?? ""} width={image.width} height={image.height} unoptimized
    style={fluid ? { height: "100%", width: "auto", maxWidth: "100%", objectFit: "contain", objectPosition: "left bottom" } : { height, width: "auto", maxWidth: height * 186 / 48, objectFit: "contain" }} />;
}
