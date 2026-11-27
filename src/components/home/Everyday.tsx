"use client";

import Link from "next/link";
import { useRef } from "react";
import { Img, type ContentImage } from "@/components/site/Img";
import { ease, gsap, SplitText, useGSAP } from "@/motion/gsap";
import { useMotion } from "@/motion/useMotion";
import type { Chapter } from "./types";

/**
 * E. Everyday life: an asymmetric collage of four photographs that drift at
 * different speeds behind and beside the statement, like moments glimpsed
 * through rooms. People in the photographs are never named or captioned.
 */
export function Everyday({ chapter, images }: { chapter: Chapter; images: ContentImage[] }) {
  const { ready, reduced } = useMotion();
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!ready || reduced) return;
    const el = root.current!;
    const split = SplitText.create(el.querySelector(".ev-title")!, { type: "lines", mask: "lines" });
    gsap.from(split.lines, { yPercent: 105, duration: 1.1, stagger: 0.09, ease: ease.line, onComplete: () => split.revert(), scrollTrigger: { trigger: el, start: "top 65%", once: true } });
    gsap.utils.toArray<HTMLElement>(".ev-ph", el).forEach((ph) => {
      const d = Number(ph.dataset.depth);
      gsap.fromTo(ph, { yPercent: d }, { yPercent: -d, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }, { scope: root, dependencies: [ready, reduced], revertOnUpdate: true });

  const [a, b, c, d] = images;
  return (
    <section ref={root} className="everyday" aria-labelledby="ev-title">
      <div className="ev-ph ev-a" data-depth="10"><Img image={a} sizes="(min-width: 1024px) 34vw, 60vw" /></div>
      <div className="ev-ph ev-b" data-depth="24"><Img image={b} sizes="(min-width: 1024px) 22vw, 40vw" /></div>
      <div className="ev-copy">
        <h2 id="ev-title" className="ev-title">{chapter.heading}</h2>
        {chapter.body?.map((t) => <p key={t}>{t}</p>)}
        {chapter.cta?.href && <Link href={chapter.cta.href} className="text-link">{chapter.cta.label}</Link>}
      </div>
      <div className="ev-ph ev-c" data-depth="16"><Img image={c} sizes="(min-width: 1024px) 26vw, 50vw" /></div>
      <div className="ev-ph ev-d" data-depth="30"><Img image={d} sizes="(min-width: 1024px) 18vw, 40vw" /></div>
    </section>
  );
}
