"use client";

import Link from "next/link";
import { useRef } from "react";
import { Img, type ContentImage } from "@/components/site/Img";
import { gsap, useGSAP } from "@/motion/gsap";
import { useMotion } from "@/motion/useMotion";
import type { Chapter } from "./types";

/**
 * J. Gallery invitation: a long wall of six photographs at different heights
 * that slides sideways as you scroll past, like walking along a corridor.
 * The full gallery is its own page; nothing here loads WebGL.
 */
export function GalleryPreview({ chapter, images }: { chapter: Chapter; images: ContentImage[] }) {
  const { ready, reduced } = useMotion();
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!ready || reduced) return;
    const wall = root.current!.querySelector<HTMLElement>(".gp-wall")!;
    gsap.fromTo(wall, { x: 0 }, {
      x: () => -Math.max(0, wall.scrollWidth - innerWidth) * 0.6,
      ease: "none",
      scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
    });
  }, { scope: root, dependencies: [ready, reduced], revertOnUpdate: true });

  return (
    <section ref={root} className="gallery-preview surface-dark" aria-labelledby="gp-title">
      <div className="gp-head">
        <h2 id="gp-title" className="gp-title">{chapter.heading}</h2>
        <div>
          {chapter.body?.map((b) => <p key={b}>{b}</p>)}
          {chapter.cta?.href && <Link href={chapter.cta.href} className="btn btn-inverse mt-6">{chapter.cta.label}</Link>}
        </div>
      </div>
      <ul className="gp-wall">
        {images.map((img, i) => (
          <li key={img?.src ?? i} className={`gp-item gp-${i % 3}`}>
            <Img image={img} sizes="(min-width: 1024px) 30vw, 70vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
