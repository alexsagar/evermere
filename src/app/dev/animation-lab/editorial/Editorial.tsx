"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { photo, type PhotoId } from "@/content/photos";
import { ease, gsap, ScrollTrigger, SplitText, useGSAP } from "@/motion/gsap";
import { useMotion } from "@/motion/useMotion";

export type Copy = { heading: string; body: string[] };
export type Room = { name: string; text: string; id: PhotoId };

function Ph({ id, sizes, className = "" }: { id: PhotoId; sizes: string; className?: string }) {
  const p = photo(id);
  return <Image src={p.src} alt={p.alt} fill sizes={sizes} className={`object-cover ${className}`} style={{ objectPosition: `${p.focal.x * 100}% ${p.focal.y * 100}%` }} />;
}

export function Editorial({ architecture, design, rooms, roomsIntro }: { architecture: Copy; design: Copy; rooms: Room[]; roomsIntro: Copy }) {
  const { ready, reduced } = useMotion();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      if (!ready || reduced) return;
      const el = root.current!;

      // 1. Expanding photograph: a framed view widens to the full width as you read.
      gsap.fromTo(el.querySelector(".ex-frame"),
        { clipPath: "inset(0% 30% 0% 30%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: el.querySelector(".ex"), start: "top 70%", end: "bottom bottom", scrub: 0.5 } });
      gsap.fromTo(el.querySelector(".ex-frame img"), { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el.querySelector(".ex"), start: "top 70%", end: "bottom bottom", scrub: 0.5 } });

      // 2. Layers: the headline sets line by line; photographs drift at three speeds.
      const split = SplitText.create(el.querySelector(".ly-title")!, { type: "lines", mask: "lines" });
      gsap.from(split.lines, { yPercent: 105, duration: 1.1, stagger: 0.1, ease: ease.line, scrollTrigger: { trigger: el.querySelector(".ly"), start: "top 70%", once: true } });
      gsap.utils.toArray<HTMLElement>(".ly-ph", el).forEach((ph) => {
        gsap.fromTo(ph, { yPercent: Number(ph.dataset.speed) }, { yPercent: -Number(ph.dataset.speed), ease: "none", scrollTrigger: { trigger: el.querySelector(".ly"), start: "top bottom", end: "bottom top", scrub: true } });
      });

      // 3. Rooms: the frame stays (CSS sticky); the photograph changes with the paragraph in view.
      gsap.utils.toArray<HTMLElement>(".rm-item", el).forEach((item, i) => {
        ScrollTrigger.create({ trigger: item, start: "top 55%", end: "bottom 55%", onToggle: (st) => st.isActive && setActive(i) });
      });
    },
    { scope: root, dependencies: [ready, reduced], revertOnUpdate: true },
  );

  // Room frame reveal: the arriving photograph wipes up from the floor line.
  useGSAP(() => {
    if (!ready || reduced) return;
    const layer = root.current!.querySelector<HTMLElement>(`.rm-layer[data-i="${active}"]`);
    if (layer) gsap.fromTo(layer, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: ease.open });
  }, { scope: root, dependencies: [active, ready, reduced] });

  return (
    <div ref={root}>
      {/* 1. Expanding architectural photograph */}
      <section className="ex px-4 pt-16 sm:px-8 lg:px-12" aria-labelledby="ex-title">
        <div className="mx-auto max-w-[1320px]">
          <p className="text-small font-semibold text-royal">Composition 1: expanding photograph</p>
          <h2 id="ex-title" className="mt-3 max-w-[18ch] text-h1 font-semibold">{architecture.heading}</h2>
          <p className="mt-6 max-w-[58ch] text-lead">{architecture.body[0]}</p>
        </div>
        <div className="ex-pad mt-12 lg:h-[180svh]">
          <div className="ex-frame stage relative h-[70svh] lg:sticky lg:top-14 lg:h-[calc(100svh-3.5rem)]">
            <Ph id="exterior-residence-stone-cedar" sizes="100vw" />
          </div>
        </div>
      </section>

      {/* 2. Layered editorial storytelling */}
      <section className="ly relative overflow-hidden bg-white px-4 py-24 sm:px-8 lg:px-12 lg:py-40" aria-labelledby="ly-title">
        <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-small font-semibold text-royal">Composition 2: layered storytelling</p>
            <h2 id="ly-title" className="ly-title mt-3 text-h1 font-semibold">{design.heading}</h2>
            {design.body.map((b) => <p key={b} className="mt-6 max-w-[52ch] text-lead">{b}</p>)}
          </div>
          <div className="relative grid grid-cols-2 gap-4 lg:col-span-6 lg:block lg:h-[44rem]">
            <div className="ly-ph relative aspect-[3/4] lg:absolute lg:top-0 lg:right-0 lg:w-[58%]" data-speed="8"><Ph id="interiors-front-door-open" sizes="(min-width: 1024px) 30vw, 50vw" /></div>
            <div className="ly-ph relative aspect-[4/5] lg:absolute lg:top-[38%] lg:left-0 lg:w-[46%]" data-speed="22"><Ph id="exterior-cedar-shingle-light" sizes="(min-width: 1024px) 24vw, 50vw" /></div>
            <div className="ly-ph relative col-span-2 aspect-[16/10] lg:absolute lg:right-[6%] lg:bottom-[-6%] lg:w-[50%]" data-speed="14"><Ph id="outdoors-timber-walkway" sizes="(min-width: 1024px) 26vw, 100vw" /></div>
          </div>
        </div>
      </section>

      {/* 3. Pinned living-space exploration */}
      <section className="rm px-4 py-24 sm:px-8 lg:px-12" aria-labelledby="rm-title">
        <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-12">
          <div className="lg:col-span-12">
            <p className="text-small font-semibold text-royal">Composition 3: rooms around the Commons</p>
            <h2 id="rm-title" className="mt-3 text-h1 font-semibold">{roomsIntro.heading}</h2>
            <p className="mt-6 max-w-[58ch] text-lead">{roomsIntro.body[0]}</p>
          </div>
          <div className="hidden lg:col-span-7 lg:block">
            <div className="stage sticky top-24 aspect-[4/3] w-full">
              {rooms.map((r, i) => (
                <div key={r.name} className="rm-layer absolute inset-0" data-i={i} style={{ zIndex: i === active ? 2 : 1, visibility: Math.abs(i - active) <= 1 ? "visible" : "hidden" }} aria-hidden={i !== active}>
                  <Ph id={r.id} sizes="55vw" />
                </div>
              ))}
              <p className="absolute bottom-0 left-0 z-10 bg-midnight px-4 py-2 text-small text-white">{rooms[active].name}</p>
            </div>
          </div>
          <ol className="lg:col-span-5">
            {rooms.map((r, i) => (
              <li key={r.name} className="rm-item border-t border-lavender py-10 lg:min-h-[70svh] lg:py-16" data-active={i === active || undefined}>
                <div className="relative mb-6 aspect-[4/3] lg:hidden"><Ph id={r.id} sizes="100vw" /></div>
                <h3 className="text-h2 font-semibold">{r.name}</h3>
                <p className="mt-4 max-w-[44ch] text-lead">{r.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
