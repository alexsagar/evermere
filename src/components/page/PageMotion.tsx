"use client";

import { useRef, type ReactNode } from "react";
import { ease, gsap, SplitText, useGSAP } from "@/motion/gsap";
import { useMotion } from "@/motion/useMotion";

/**
 * One motion layer per page, driven by data attributes so pages stay server
 * components and choose their own techniques:
 *   data-m="expand"  a framed photograph widens to full width as you read (scrubbed)
 *   data-m="depth"   a photograph drifts at its own speed (data-d = percent)
 *   data-m="split"   a heading sets line by line once (masks removed afterwards)
 *   data-m="rise"    a photograph opens upward from its floor line once
 *   data-m="pan"     a horizontal strip slides sideways as you scroll past
 * Nothing runs with reduced motion; the static layout is complete without it.
 */
export function PageMotion({ children }: { children: ReactNode }) {
  const { ready, reduced } = useMotion();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ready || reduced) return;
    const q = (m: string) => gsap.utils.toArray<HTMLElement>(`[data-m="${m}"]`, root.current!);

    q("expand").forEach((el) => {
      const st = { trigger: el, start: "top 85%", end: "top 20%", scrub: 0.6 };
      gsap.fromTo(el, { clipPath: "inset(0% 28% 0% 28%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: st });
      const img = el.querySelector("img");
      if (img) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: st });
    });
    q("depth").forEach((el) => {
      const d = Number(el.dataset.d ?? 12);
      gsap.fromTo(el, { yPercent: d }, { yPercent: -d, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
    q("split").forEach((el) => {
      const split = SplitText.create(el, { type: "lines", mask: "lines" });
      gsap.from(split.lines, { yPercent: 105, duration: 1, stagger: 0.08, ease: ease.line, onComplete: () => split.revert(), scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    q("rise").forEach((el) => {
      gsap.from(el, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.1, ease: ease.open, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
    q("pan").forEach((el) => {
      gsap.fromTo(el, { x: 0 }, {
        x: () => -Math.max(0, el.scrollWidth - innerWidth) * 0.7,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      });
    });
  }, { scope: root, dependencies: [ready, reduced], revertOnUpdate: true });

  return <div ref={root}>{children}</div>;
}
