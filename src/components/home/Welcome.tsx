"use client";

import Link from "next/link";
import { useRef } from "react";
import { Img } from "@/components/site/Img";
import { gsap, useGSAP } from "@/motion/gsap";
import { useMotion } from "@/motion/useMotion";
import type { Chapter } from "./types";

/**
 * B. Welcome: oversized statement, generous space, and a narrow view of the lake
 * that widens to the full page as you read (expanding photograph).
 */
export function Welcome({ chapter }: { chapter: Chapter }) {
  const { ready, reduced } = useMotion();
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!ready || reduced) return;
    const frame = root.current!.querySelector(".welcome-frame");
    const st = { trigger: frame, start: "top 85%", end: "top 15%", scrub: 0.6 };
    gsap.fromTo(frame, { clipPath: "inset(0% 32% 0% 32%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: st });
    gsap.fromTo(root.current!.querySelector(".welcome-frame img"), { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: st });
  }, { scope: root, dependencies: [ready, reduced], revertOnUpdate: true });

  return (
    <section ref={root} className="welcome" aria-labelledby="welcome-title">
      <div className="welcome-text">
        <h2 id="welcome-title" className="welcome-title">{chapter.heading}</h2>
        <div className="welcome-body">
          {chapter.body?.map((b) => <p key={b}>{b}</p>)}
          {chapter.cta?.href && <Link href={chapter.cta.href} className="text-link">{chapter.cta.label}</Link>}
        </div>
      </div>
      <div className="welcome-frame">
        <Img image={chapter.image} sizes="100vw" />
      </div>
    </section>
  );
}
