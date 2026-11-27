"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { mark } from "@/brand/logo";
import { Logo } from "@/components/brand/Logo";
import { photo, type PhotoId } from "@/content/photos";
import { ease, gsap, labTimeline, SplitText, useGSAP } from "@/motion/gsap";
import { useMotion } from "@/motion/useMotion";
import type { PlaneApi } from "@/motion/webgl/TransitionPlane";

const OpeningCanvas = dynamic(() => import("./OpeningCanvas"), { ssr: false });

const HERO: PhotoId = "exterior-residence-pines";
const noop = () => () => {};

// Runs before first paint (server HTML only): shows the closed-door cover when the
// intro will play, so the photograph never flashes before the doorway opens.
const coverScript = `try{var q=location.search;if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&q.indexOf('motion=reduce')<0){var s=document.createElement('style');s.id='opening-cover-rule';s.textContent='.opening-cover{display:block!important;animation:cover-failsafe .6s 4s forwards}';document.head.appendChild(s)}}catch(e){}`;

/** Doorway geometry, from the logo: bottom center of the inner opening at (24, 44), 10 wide, 17 tall. */
// The ring is drawn at scale 3.4 with the doorway's bottom 39.6px below center.
function fit(w: number, h: number) {
  return { start: 3.4, end: Math.max(w / 10, h / 17) * 1.08, cx: w / 2, cyStart: h / 2 + 39.6, cyEnd: h + 2 };
}

export function Opening({ headline, intro, next }: { headline: string; intro: string; next: { heading: string; body: string } }) {
  const { ready, reduced, webgl } = useMotion();
  const variant = useSyncExternalStore(noop, () => (new URLSearchParams(location.search).get("v") === "gl" ? "gl" : "mask"), () => "mask");
  const [glFailed, setGlFailed] = useState(false);
  const useGL = variant === "gl" && webgl && !glFailed;
  const [played, setPlayed] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const plane = useRef<PlaneApi | null>(null);
  const [glReady, setGlReady] = useState(false);
  const p = photo(HERO);
  const animate = ready && !reduced && !played;

  // If the shader texture is not ready in 2.5s, play the mask version instead.
  useEffect(() => {
    if (!useGL || glReady) return;
    const t = setTimeout(() => setGlFailed(true), 2500);
    return () => clearTimeout(t);
  }, [useGL, glReady]);

  useGSAP(
    () => {
      if (!ready) return;
      document.getElementById("opening-cover-rule")?.remove();
      const el = root.current!;
      const split = SplitText.create(el.querySelector("h1")!, { type: "lines", mask: "lines", linesClass: "line" });

      // Scroll hand-off to the first editorial section, in every motion mode except reduced.
      if (!reduced) {
        gsap.to(el.querySelector(".opening-photo"), { scale: 1.08, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
        gsap.to(el.querySelector(".opening-copy"), { yPercent: -18, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      }
      if (!animate || (useGL && !glReady)) return;

      const stage = el.querySelector<HTMLElement>(".stage")!;
      const { start, end, cx, cyStart, cyEnd } = fit(stage.clientWidth, stage.clientHeight);
      const door = el.querySelector<SVGGElement>(".door"); // absent in the WebGL variant
      const s = { scale: start, cy: cyStart, gl: 0 };
      const ring = el.querySelector<SVGGElement>(".door-ring")!;
      const h = stage.clientHeight;
      // Doorway and ring share one transform, so the logo itself becomes the opening.
      const place = () => {
        door?.setAttribute("transform", `translate(${cx} ${s.cy}) scale(${s.scale}) translate(-24 -44)`);
        ring.setAttribute("transform", `translate(0 ${s.cy - h / 2}) scale(${s.scale}) translate(-24 -44)`);
      };
      place();

      const tl = labTimeline("opening", gsap.timeline({ defaults: { ease: ease.open }, onComplete: () => setPlayed(true) }));
      tl.to(el.querySelector(".door-panel"), { opacity: 0, duration: 0.5, ease: "power1.out" }, 0.35)
        .from(el.querySelector(".opening-photo img"), { scale: 1.18, duration: 2.2 }, 0.35);
      if (useGL) {
        tl.to(s, { gl: 1, duration: 2, onUpdate: () => plane.current?.set(s.gl) }, 0.6)
          .to(ring, { opacity: 0, duration: 0.9 }, 0.6);
      } else {
        tl.to(s, { scale: end, cy: cyEnd, duration: 1.9, onUpdate: place }, 0.75)
          .to(ring, { opacity: 0, duration: 0.45, ease: "power1.in" }, 1.05);
      }
      tl.from(el.querySelector(".opening-panel"), { clipPath: "inset(100% 0% 0% 0%)", duration: 0.9, ease: ease.settle }, 2.25)
        .from(split.lines, { yPercent: 105, duration: 1.1, stagger: 0.09, ease: ease.line }, 2.4)
        .from(el.querySelectorAll(".opening-fade"), { opacity: 0, y: 16, duration: 0.8, stagger: 0.1, ease: ease.settle }, 2.7);

      // Never make anyone wait: any intent to move on finishes the intro quickly.
      const hurry = () => tl.timeScale(4);
      const opts = { once: true, passive: true } as const;
      addEventListener("wheel", hurry, opts);
      addEventListener("touchstart", hurry, opts);
      addEventListener("keydown", hurry, opts);
      return () => {
        removeEventListener("wheel", hurry);
        removeEventListener("touchstart", hurry);
        removeEventListener("keydown", hurry);
      };
    },
    { scope: root, dependencies: [ready, reduced, useGL, glReady], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="opening">
      <script dangerouslySetInnerHTML={{ __html: coverScript }} />
      <section className="stage relative h-[100svh] min-h-[34rem]" aria-labelledby="opening-title">
        <div className="opening-photo absolute inset-0">
          <Image src={p.src} alt={p.alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: `${p.focal.x * 100}% ${p.focal.y * 100}%` }} />
        </div>

        {animate && useGL && <OpeningCanvas apiRef={plane} onReady={() => setGlReady(true)} hero={HERO} />}

        {/* The closed door. Rendered by the server for the pre-paint cover, then animated. */}
        {(!ready || animate) && (
          <svg className={`opening-cover absolute inset-0 h-full w-full ${ready ? "is-live" : ""}`} aria-hidden="true">
            <defs>
              <mask id="doorway" maskUnits="userSpaceOnUse">
                <rect width="100%" height="100%" fill="#fff" />
                {!useGL && <g className="door"><path d="M19 44V27a5 5 0 0 1 10 0v17Z" fill="#000" /></g>}
              </mask>
            </defs>
            {!(useGL && glReady) && <rect width="100%" height="100%" fill="#18243D" mask="url(#doorway)" />}
            <svg x="50%" y="50%" overflow="visible">
              <g className="door-ring" transform="translate(-82 -110) scale(3.4)">
                <path d={mark.body} fill="#fff" fillRule="evenodd" />
                <path className="door-panel" d={mark.accent} fill="#DCDFF5" />
              </g>
            </svg>
          </svg>
        )}

        <div className="opening-copy relative flex h-full flex-col justify-between p-4 text-white sm:p-8 lg:p-12">
          <div className="opening-fade"><Logo variant="reversed" height={36} /></div>
          <div className="opening-panel surface-dark max-w-[44rem] bg-midnight p-6 sm:p-10">
            <h1 id="opening-title" className="text-h1 font-semibold">{headline}</h1>
            <p className="opening-fade mt-6 max-w-[52ch] text-lead text-lavender">{intro}</p>
            <a href="#after-opening" className="opening-fade btn btn-inverse mt-8">Continue</a>
          </div>
        </div>
      </section>

      <section id="after-opening" className="bg-cloud px-4 py-24 sm:px-8 lg:px-12 lg:py-36">
        <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-12">
          <h2 className="text-h1 font-semibold lg:col-span-6">{next.heading}</h2>
          <p className="text-lead lg:col-span-5 lg:col-start-8 lg:pt-3">{next.body}</p>
        </div>
      </section>
    </div>
  );
}

