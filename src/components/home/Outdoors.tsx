"use client";

import Link from "next/link";
import { useRef } from "react";
import { Img, type ContentImage } from "@/components/site/Img";
import { ease, gsap, ScrollTrigger, useGSAP } from "@/motion/gsap";
import { useMotion } from "@/motion/useMotion";
import type { Chapter } from "./types";

/**
 * H. Outdoors: the Threshold arch opens from the covered walk onto the lakeside
 * path as you scroll. A CSS clip, not WebGL: side-by-side frame review in
 * Milestone 5 showed the shader version added no visible quality, so the
 * homepage ships no three.js. With reduced motion, and on phones, the photographs stack.
 */
export function Outdoors({ chapter, from, to }: { chapter: Chapter; from: ContentImage; to: ContentImage }) {
  const { ready, reduced } = useMotion();
  const root = useRef<HTMLElement>(null);
  const animated = ready && !reduced;

  useGSAP(() => {
    if (!animated) return;
    // Phones get the stacked photographs: the arch reads poorly behind a full-width panel.
    gsap.matchMedia().add("(min-width: 768px)", () => {
    const el = root.current!;
    const arch = el.querySelector(".od-to");
    const open = gsap.parseEase(ease.open);
    // The closed arch sits centred in the photograph left of the copy panel (or the
    // full width on mobile, where the panel sits below), so it never runs under the
    // panel or leaves a strip of the first photograph between them.
    let box = { l: 0, r: 0, t: 0 };
    const measure = () => {
      const stage = el.querySelector(".od-stage")!.getBoundingClientRect();
      const panel = el.querySelector(".od-copy")!.getBoundingClientRect();
      const free = panel.left > stage.left + stage.width / 2 ? panel.left - stage.left : stage.width;
      const w = Math.min(stage.width * 0.2, free * 0.5);
      box = { l: free / 2 - w / 2, r: stage.width - free / 2 - w / 2, t: stage.height * 0.58 };
    };
    const set = (p: number) => {
      const e = 1 - open(p);
      gsap.set(arch, { clipPath: `inset(${e * box.t}px ${e * box.r}px 0px ${e * box.l}px round ${e * 50}vw ${e * 50}vw 0 0)` });
    };
    measure();
    set(0);
    ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom bottom", onUpdate: (st) => set(st.progress), onRefresh: (st) => { measure(); set(st.progress); } });
    });
  }, { scope: root, dependencies: [animated], revertOnUpdate: true });

  return (
    <section ref={root} className={`outdoors ${animated ? "is-animated" : ""}`} aria-labelledby="od-title">
      <div className="od-stage">
        <div className="od-photos">
          <div className="od-from"><Img image={from} sizes="100vw" /></div>
          <div className="od-to"><Img image={to} sizes="100vw" /></div>
        </div>
        <div className="od-copy surface-dark">
          <h2 id="od-title" className="od-title">{chapter.heading}</h2>
          {chapter.body?.map((b) => <p key={b}>{b}</p>)}
          {chapter.cta?.href && <Link href={chapter.cta.href} className="text-link text-link-light">{chapter.cta.label}</Link>}
        </div>
      </div>
    </section>
  );
}
