"use client";

import Link from "next/link";
import { useRef } from "react";
import { Img, type ContentImage } from "@/components/site/Img";
import { ease, gsap, useGSAP } from "@/motion/gsap";
import { useMotion } from "@/motion/useMotion";
import type { Chapter } from "./types";

/**
 * F. Dining: a cinematic letterbox of the Dining Room opens like a pair of
 * doors from the center; a plate from the kitchen sits over its lower edge.
 */
export function Dining({ chapter, detail }: { chapter: Chapter; detail: ContentImage }) {
  const { ready, reduced } = useMotion();
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!ready || reduced) return;
    const el = root.current!;
    const tl = gsap.timeline({ scrollTrigger: { trigger: el.querySelector(".dn-wide"), start: "top 80%", once: true } });
    tl.from(el.querySelector(".dn-wide"), { clipPath: "inset(0% 50% 0% 50%)", duration: 1.3, ease: ease.open })
      .from(el.querySelector(".dn-wide img"), { scale: 1.15, duration: 1.6, ease: ease.open }, 0)
      .from(el.querySelector(".dn-plate"), { yPercent: 18, autoAlpha: 0, duration: 1, ease: ease.settle }, 0.7);
  }, { scope: root, dependencies: [ready, reduced], revertOnUpdate: true });

  return (
    <section ref={root} className="dining" aria-labelledby="dn-title">
      <h2 id="dn-title" className="dn-title">{chapter.heading}</h2>
      <div className="dn-wide"><Img image={chapter.image} sizes="100vw" /></div>
      <div className="dn-lower">
        <div className="dn-plate"><Img image={detail} sizes="(min-width: 1024px) 26vw, 60vw" /></div>
        <div className="dn-body">
          {chapter.body?.map((b) => <p key={b}>{b}</p>)}
          {chapter.cta?.href && <Link href={chapter.cta.href} className="text-link">{chapter.cta.label}</Link>}
        </div>
      </div>
    </section>
  );
}
