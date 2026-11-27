"use client";

import { useRef, useState, type ReactNode } from "react";
import { Img, type ContentImage } from "@/components/site/Img";
import { ScrollTrigger, gsap, useGSAP } from "@/motion/gsap";
import { useMotion } from "@/motion/useMotion";

export type SwapItem = { key: string; title: string; image: ContentImage; children: ReactNode };

/**
 * A sticky photograph beside a column of entries (large screens). The entry at
 * 40% of the viewport owns the frame; photographs crossfade and the caption names
 * the entry, so image and text never disagree. Small screens show each photograph
 * inline above its entry.
 */
export function StickySwap({ items, aspect = "4 / 3", side = "left" }: { items: SwapItem[]; aspect?: string; side?: "left" | "right" }) {
  const { ready } = useMotion();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(() => {
    if (!ready) return;
    gsap.utils.toArray<HTMLElement>(".sw-item", root.current!).forEach((item, i) => {
      ScrollTrigger.create({ trigger: item, start: "top 40%", end: "bottom 40%", onToggle: (st) => st.isActive && setActive(i) });
    });
  }, { scope: root, dependencies: [ready], revertOnUpdate: true });

  return (
    <div ref={root} className={`swap swap-${side}`}>
      <div className="swap-stage" aria-hidden="true">
        <div className="swap-frame" style={{ aspectRatio: aspect }}>
          {items.map((it, i) => (
            <div key={it.key} className="swap-layer" data-active={i === active || undefined}>
              <Img image={it.image} sizes="(min-width: 1024px) 50vw, 1px" decorative />
            </div>
          ))}
        </div>
        <p className="swap-caption"><span>{active + 1} of {items.length}</span> {items[active]?.title}</p>
      </div>
      <ol className="swap-list">
        {items.map((it, i) => (
          <li key={it.key} className="sw-item" data-active={i === active || undefined}>
            <div className="swap-inline relative" style={{ aspectRatio: aspect }}><Img image={it.image} sizes="100vw" /></div>
            {it.children}
          </li>
        ))}
      </ol>
    </div>
  );
}
