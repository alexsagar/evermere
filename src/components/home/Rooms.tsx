"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Img, type ContentImage } from "@/components/site/Img";
import { gsap, ScrollTrigger, useGSAP } from "@/motion/gsap";
import { useMotion } from "@/motion/useMotion";
import type { Chapter } from "./types";

export type Room = { title: string; summary: string; features: string[]; image: ContentImage };

/**
 * D. Private suites: the photograph frame stays put (CSS sticky) while the suite
 * descriptions scroll past. Each suite holds the frame for most of a screen, and
 * photographs crossfade (interruptible CSS transition) so fast scrolling never stacks wipes.
 * Each photograph carries its own caption, taken from its alt text, so an
 * illustrative suite is never presented as a specific view.
 */
export function Rooms({ chapter, rooms, cta, visit }: { chapter: Chapter; rooms: Room[]; cta?: { label: string; href: string }; visit?: { label: string; href: string } }) {
  const { ready } = useMotion();
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(() => {
    if (!ready) return;
    gsap.utils.toArray<HTMLElement>(".rm-item", root.current!).forEach((item, i) => {
      ScrollTrigger.create({ trigger: item, start: "top 40%", end: "bottom 40%", onToggle: (st) => st.isActive && setActive(i) });
    });
  }, { scope: root, dependencies: [ready], revertOnUpdate: true });

  return (
    <section ref={root} className="rooms" aria-labelledby="rooms-title">
      <div className="rooms-head">
        <h2 id="rooms-title" className="rooms-title">{chapter.heading}</h2>
        <div className="rooms-intro">{chapter.body?.map((b) => <p key={b}>{b}</p>)}</div>
      </div>
      <div className="rooms-grid">
        <div className="rooms-stage" aria-hidden="true">
          <div className="rooms-frame">
            {rooms.map((r, i) => (
              <div key={r.title} className="rm-layer" data-active={i === active || undefined}>
                <Img image={r.image} sizes="(min-width: 1024px) 55vw, 1px" decorative />
              </div>
            ))}
          </div>
          {/* The suite name travels with its photograph, so each image is clearly attributed. */}
          <p className="rooms-caption"><span className="rc-index">{active + 1} of {rooms.length}</span><strong>{rooms[active]?.title}</strong> {rooms[active]?.image?.alt}</p>
        </div>
        <ol className="rooms-list">
          {rooms.map((r, i) => (
            <li key={r.title} className="rm-item" data-active={i === active || undefined}>
              <figure className="rm-inline">
                <div className="relative aspect-[4/3]"><Img image={r.image} sizes="100vw" /></div>
              </figure>
              <h3 className="rm-title">{r.title}</h3>
              <p className="rm-summary">{r.summary}</p>
              <ul className="rm-features">{r.features.map((f) => <li key={f}>{f}</li>)}</ul>
            </li>
          ))}
          {(cta || visit) && (
            <li className="rm-cta">
              {/* Mid-page inquiry: the first point a visitor has seen the suites. */}
              {visit && <a href={visit.href} className="btn btn-primary mr-6">{visit.label}</a>}
              {cta && <Link href={cta.href} className="text-link">{cta.label}</Link>}
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}
