"use client";

import Link from "next/link";
import { useRef } from "react";
import { Img } from "@/components/site/Img";
import { ease, gsap, useGSAP } from "@/motion/gsap";
import { useMotion } from "@/motion/useMotion";
import type { Scene } from "./types";

/**
 * C. Through the home: one pinned walk from the drive to the fireplace. Two cuts,
 * two different actions: the Threshold arch opens on the entrance, then the
 * door slides aside into the Commons. About two screens of scroll in total.
 * Phones, tablets and reduced motion get the same scenes stacked.
 */
export function Journey({ scenes, cta }: { scenes: Scene[]; cta?: { label: string; href: string } }) {
  const { ready, reduced } = useMotion();
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!ready || reduced) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const el = root.current!;
      el.dataset.pinned = "";
      const s = gsap.utils.toArray<HTMLElement>(".jr-scene", el);
      const t = gsap.utils.toArray<HTMLElement>(".jr-text", el);
      gsap.set(t.slice(1), { autoAlpha: 0, y: 32 });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el.querySelector(".jr-pin"), start: "top top", end: `+=${(s.length - 1) * 95}%`, pin: true, scrub: 0.6 },
      });
      const text = (i: number, at: number) =>
        tl.to(t[i - 1], { autoAlpha: 0, y: -24, duration: 0.25 }, at).to(t[i], { autoAlpha: 1, y: 0, duration: 0.3 }, at + 0.4);
      // Drive to entrance: the arch opens from the path.
      tl.fromTo(s[1], { clipPath: "inset(56% 41% 0% 41% round 999px 999px 0 0)" }, { clipPath: "inset(0% 0% 0% 0% round 0px 0px 0 0)", duration: 1, ease: ease.open }, 0)
        .to(s[0].querySelector("img"), { scale: 1.12, duration: 1 }, 0)
        .fromTo(s[1].querySelector("img"), { scale: 1.25 }, { scale: 1, duration: 1, ease: ease.open }, 0);
      text(1, 0.3);
      if (s[2]) {
        // Entrance to the Commons: the door slides aside along its edge.
        tl.fromTo(s[2], { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: ease.open }, 1.2)
          .to(s[1].querySelector("img"), { xPercent: -8, duration: 1 }, 1.2);
        text(2, 1.5);
      }
      return () => delete el.dataset.pinned;
    });
    mm.add("(max-width: 1023px)", () => {
      gsap.utils.toArray<HTMLElement>(".jr-scene", root.current!).forEach((scene) => {
        gsap.from(scene, { clipPath: "inset(10% 6% 0% 6% round 46vw 46vw 0 0)", duration: 1.1, ease: ease.open, scrollTrigger: { trigger: scene, start: "top 85%", once: true } });
      });
    });
  }, { scope: root, dependencies: [ready, reduced], revertOnUpdate: true });

  return (
    <section ref={root} id="home-journey" className="journey" aria-label="Through the home">
      <div className="jr-pin">
        {scenes.map((sc, i) => (
          <article key={sc.heading} className="jr-scene" style={{ zIndex: i }} aria-labelledby={`jr-${i}`}>
            <Img image={sc.image} sizes="100vw" />
            <div className="jr-text surface-dark">
              <h2 id={`jr-${i}`} className="jr-title">{sc.heading}</h2>
              <p>{sc.body}</p>
              {i === scenes.length - 1 && cta && <Link href={cta.href} className="text-link text-link-light">{cta.label}</Link>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
