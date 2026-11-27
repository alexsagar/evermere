"use client";

import Image from "next/image";
import { useRef } from "react";
import { photo, type PhotoId } from "@/content/photos";
import { ease, gsap, labTimeline, useGSAP } from "@/motion/gsap";
import { useMotion } from "@/motion/useMotion";

export type Scene = { id: PhotoId; heading: string; body: string };

/**
 * One pinned walk through the house. Each cut borrows a different action:
 * the arch opens, a door slides aside, the view lowers to a seat, a window
 * widens onto the garden. DOM and CSS only: WebGL added nothing visible here.
 */
export function Journey({ scenes }: { scenes: Scene[] }) {
  const { ready, reduced } = useMotion();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ready || reduced) return;
      const mm = gsap.matchMedia();

      // Desktop and large tablets: one pinned stage, about one screen of scroll per cut.
      mm.add("(min-width: 1024px)", () => {
        const el = root.current!;
        el.dataset.pinned = "";
        const s = gsap.utils.toArray<HTMLElement>(".j-scene", el);
        const t = gsap.utils.toArray<HTMLElement>(".j-text", el);
        gsap.set(s.slice(1), { autoAlpha: 1 });
        gsap.set(t.slice(1), { autoAlpha: 0, y: 40 });
        const tl = labTimeline("journey", gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el.querySelector(".j-pin"), start: "top top+=56", end: `+=${(s.length - 1) * 100}%`, pin: true, scrub: 0.6 },
        }));
        const text = (i: number, at: number) =>
          tl.to(t[i - 1], { autoAlpha: 0, y: -30, duration: 0.25 }, at).to(t[i], { autoAlpha: 1, y: 0, duration: 0.3 }, at + 0.35);

        // 1 to 2, exterior to entrance: the Threshold arch opens from the path.
        tl.fromTo(s[1], { clipPath: "inset(58% 41% 0% 41% round 999px 999px 0 0)" }, { clipPath: "inset(0% 0% 0% 0% round 0px 0px 0 0)", duration: 1, ease: ease.open }, 0)
          .to(s[0].querySelector("img"), { scale: 1.12, duration: 1 }, 0)
          .fromTo(s[1].querySelector("img"), { scale: 1.25 }, { scale: 1, duration: 1, ease: ease.open }, 0);
        text(1, 0.3);
        // 2 to 3, entrance to the Commons: the door slides aside along its edge.
        tl.fromTo(s[2], { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: ease.open }, 1.2)
          .to(s[1].querySelector("img"), { xPercent: -8, duration: 1 }, 1.2);
        text(2, 1.5);
        // 3 to 4, Commons to suite: the view lowers to seated height and the suite rises.
        tl.to(s[2].querySelector("img"), { yPercent: -10, scale: 1.06, duration: 1 }, 2.4)
          .fromTo(s[3], { yPercent: 100 }, { yPercent: 0, duration: 1, ease: ease.open }, 2.4)
          .fromTo(s[3].querySelector("img"), { yPercent: -30 }, { yPercent: 0, duration: 1, ease: ease.open }, 2.4);
        text(3, 2.7);
        // 4 to 5, suite to outdoors: a window in the suite widens onto the fire table.
        tl.fromTo(s[4], { clipPath: "inset(50% 50% 50% 50%)" }, { clipPath: "inset(22% 30% 30% 30%)", duration: 0.4, ease: ease.settle }, 3.3)
          .to(s[4], { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: ease.open }, 3.7)
          .fromTo(s[4].querySelector("img"), { scale: 1.3 }, { scale: 1, duration: 1.4, ease: ease.open }, 3.3)
          .to(s[3].querySelector("img"), { scale: 0.94, duration: 1 }, 3.7);
        text(4, 4.0);
        return () => delete el.dataset.pinned;
      });

      // Phones and small tablets: natural scrolling, each photograph opens once as it arrives.
      mm.add("(max-width: 1023px)", () => {
        gsap.utils.toArray<HTMLElement>(".j-scene", root.current!).forEach((scene) => {
          gsap.from(scene, {
            clipPath: "inset(12% 8% 0% 8% round 48vw 48vw 0 0)",
            duration: 1.1,
            ease: ease.open,
            scrollTrigger: { trigger: scene, start: "top 85%", once: true },
          });
        });
      });
    },
    { scope: root, dependencies: [ready, reduced], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="journey">
      <div className="j-pin">
        {scenes.map((sc, i) => {
          const p = photo(sc.id);
          return (
            <section key={sc.id} className="j-scene stage" aria-labelledby={`j-${i}`} style={{ zIndex: i }}>
              <Image src={p.src} alt={p.alt} fill sizes="100vw" priority={i === 0} className="object-cover" style={{ objectPosition: `${p.focal.x * 100}% ${p.focal.y * 100}%` }} />
              <div className="j-text surface-dark">
                <p className="text-small text-lavender">{i + 1} of {scenes.length}</p>
                <h2 id={`j-${i}`} className="mt-2 text-h2 font-semibold">{sc.heading}</h2>
                {sc.body && <p className="mt-4 text-lavender">{sc.body}</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
