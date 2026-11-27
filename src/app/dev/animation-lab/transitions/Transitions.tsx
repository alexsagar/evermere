"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { photo, type PhotoId } from "@/content/photos";
import { ease, gsap, labTimeline, ScrollTrigger, useGSAP } from "@/motion/gsap";
import { useMotion } from "@/motion/useMotion";
import type { PlaneApi, TransitionMode } from "@/motion/webgl/TransitionPlane";

const Stage = dynamic(() => import("./TransitionCanvas"), { ssr: false });

// A walk from the drive to the fire: exteriors first, then rooms.
const SEQUENCE: PhotoId[] = [
  "exterior-residence-pines", "exterior-entrance-cedar", "interiors-commons-fireplace",
  "interiors-library-fireplace", "accommodations-suite-pines", "outdoors-fire-table-deck",
];
const MODES: { id: TransitionMode; name: string; note: string }[] = [
  { id: "displace", name: "Sliding panel", note: "A soft vertical front crosses the frame; both photographs shift up to 6% along it, like a screen sliding past." },
  { id: "arch", name: "Threshold arch", note: "The next room opens inside the logo's arch, rising from the floor and settling from a slight zoom." },
  { id: "dolly", name: "Step forward", note: "The current photograph moves toward you and opens from the next image's focal point. Scale only, no invented depth." },
];
const noop = () => () => {};

function StaticFrame({ id }: { id: PhotoId }) {
  const p = photo(id);
  return <Image src={p.src} alt="" fill sizes="100vw" className="object-cover" style={{ objectPosition: `${p.focal.x * 100}% ${p.focal.y * 100}%` }} />;
}

export function Transitions() {
  const { ready, reduced, webgl } = useMotion();
  const scrollMode = useSyncExternalStore(noop, () => new URLSearchParams(location.search).get("v") === "scroll", () => false);
  const gl = ready && webgl && !reduced;
  const [mode, setMode] = useState<TransitionMode>("arch");
  const [index, setIndex] = useState(0);
  const [pair, setPair] = useState<{ from: PhotoId; to: PhotoId }>({ from: SEQUENCE[0], to: SEQUENCE[0] });
  const api = useRef<PlaneApi | null>(null);
  const pendingTween = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  const go = useCallback((dir: 1 | -1) => {
    const next = (index + dir + SEQUENCE.length) % SEQUENCE.length;
    tween.current?.progress(1); // a second press finishes the current move first
    setIndex(next);
    if (!gl) return;
    pendingTween.current = true;
    setPair({ from: SEQUENCE[index], to: SEQUENCE[next] });
  }, [index, gl]);

  // Play once both textures of the new pair are on the GPU.
  const onReady = useCallback(() => {
    if (!pendingTween.current || scrollMode) return;
    pendingTween.current = false;
    const s = { p: 0 };
    api.current?.set(0);
    tween.current = labTimeline("transition", gsap.timeline()).to(s, {
      p: 1, duration: mode === "displace" ? 1.3 : 1.6, ease: ease.open,
      onUpdate: () => api.current?.set(s.p),
    }) as unknown as gsap.core.Tween;
  }, [mode, scrollMode]);

  useEffect(() => {
    if (scrollMode) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [go, scrollMode]);

  // Scroll-driven variant: the sticky stage scrubs through the sequence.
  useGSAP(() => {
    if (!scrollMode || !ready || reduced) return;
    const steps = SEQUENCE.length - 1;
    let current = -1;
    ScrollTrigger.create({
      trigger: root.current!.querySelector(".scroll-track"),
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (st) => {
        const t = st.progress * steps;
        const i = Math.min(steps - 1, Math.floor(t));
        if (i !== current) {
          current = i;
          setPair({ from: SEQUENCE[i], to: SEQUENCE[i + 1] });
          setIndex(i);
        }
        api.current?.set(gsap.parseEase(ease.open)(Math.min(1, t - i)));
      },
    });
  }, { scope: root, dependencies: [scrollMode, ready, reduced] });

  const shown = SEQUENCE[index];
  const current = photo(gl && !scrollMode ? pair.to : shown);
  const stage = (
    <div className="stage relative h-[70svh] min-h-[22rem] w-full lg:h-[calc(100svh-8rem)]">
      {/* DOM frame: the fallback, and what screen readers and no-WebGL visitors get. */}
      <div className={gl ? "invisible" : ""}><StaticFrame id={shown} /></div>
      {gl && <Stage from={pair.from} to={pair.to} mode={mode} apiRef={api} onReady={onReady} />}
    </div>
  );

  return (
    <div ref={root}>
      <section aria-labelledby="tx-title" className="px-4 pt-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <h1 id="tx-title" className="text-h2 font-semibold">Photographic transitions</h1>
          <p className="lab-note mt-3">
            Real photographs, cropped around their curated focal points in the shader, never stretched. Textures are 2048px WebP copies of the masters; only the two images in the current transition are on the GPU.
            {!gl && ready && " WebGL is off or motion is reduced, so photographs change without a transition."}
          </p>
          {!scrollMode && (
            <fieldset className="mt-6 flex flex-wrap gap-2">
              <legend className="sr-only">Transition technique</legend>
              {MODES.map((m) => (
                <label key={m.id} className="tx-mode">
                  <input type="radio" name="mode" value={m.id} checked={mode === m.id} onChange={() => setMode(m.id)} className="sr-only" />
                  <span>{m.name}</span>
                </label>
              ))}
            </fieldset>
          )}
          <p className="lab-note mt-3">{MODES.find((m) => m.id === mode)!.note}</p>
        </div>
      </section>

      {scrollMode ? (
        <section aria-label="Scroll-driven sequence" className="scroll-track relative mt-8" style={{ height: `${SEQUENCE.length * 70}svh` }}>
          <div className="sticky top-14 px-4 sm:px-8 lg:px-12">{stage}</div>
        </section>
      ) : (
        <section aria-label="Manual sequence" className="mt-8 px-4 pb-24 sm:px-8 lg:px-12">
          {stage}
          <div className="mx-auto mt-4 flex max-w-[1320px] flex-wrap items-center justify-between gap-4">
            <p aria-live="polite" className="max-w-[70ch] text-small">
              <span className="font-semibold">{index + 1} of {SEQUENCE.length}.</span> {current.alt}
            </p>
            <div className="flex gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => go(-1)}>Previous</button>
              <button type="button" className="btn btn-primary" onClick={() => go(1)} aria-describedby="tx-keys">Next room</button>
            </div>
          </div>
          <p id="tx-keys" className="mx-auto mt-2 max-w-[1320px] text-small">Arrow keys also move between photographs.</p>
        </section>
      )}
    </div>
  );
}
