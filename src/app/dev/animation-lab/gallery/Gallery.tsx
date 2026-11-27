"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { photo, type PhotoId } from "@/content/photos";
import { Observer } from "gsap/Observer";
import { gsap, useGSAP } from "@/motion/gsap";

gsap.registerPlugin(Observer);
import { useMotion } from "@/motion/useMotion";

const Apse = dynamic(() => import("./ApseCanvas"), { ssr: false });

const IDS = [
  "exterior-residence-pines", "exterior-residence-stone-cedar", "exterior-glass-gallery-forest", "exterior-entrance-cedar",
  "interiors-front-door-open", "interiors-commons-fireplace", "interiors-library-fireplace", "interiors-garden-room",
  "accommodations-suite-doorway", "accommodations-suite-pines", "dining-room-forest-windows", "outdoors-timber-walkway",
  "outdoors-fire-table-deck", "outdoors-lakeside-path", "outdoors-chairs-dock",
] as const satisfies readonly PhotoId[];

export function Gallery() {
  const { ready, reduced, webgl } = useMotion();
  const spatial = ready && webgl && !reduced;
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<PhotoId>(IDS[0]);

  const move = useCallback((d: number) => setIndex((i) => Math.max(0, Math.min(IDS.length - 1, i + d))), []);

  const show = (id: PhotoId, from: HTMLElement) => {
    opener.current = from;
    setOpen(id);
    // Spatial view: step toward the photograph first, then open the full image.
    if (spatial && from.dataset.spatial) {
      setZoom(true);
      setTimeout(() => dialog.current?.showModal(), 550);
    } else dialog.current?.showModal();
  };

  // Swipe and drag on the canvas turn the wall; vertical page scroll is left alone.
  useGSAP(() => {
    if (!spatial || !stage.current) return;
    Observer.create({
      target: stage.current,
      type: "touch,pointer",
      dragMinimum: 24,
      lockAxis: true,
      onLeft: () => move(1),
      onRight: () => move(-1),
    });
  }, { dependencies: [spatial, move], revertOnUpdate: true });

  const current = photo(IDS[index]);
  const full = photo(open);

  return (
    <div>
      {spatial && (
        <section aria-labelledby="apse-title" className="px-4 sm:px-8 lg:px-12">
          <h2 id="apse-title" className="sr-only">Spatial view</h2>
          <div
            ref={stage}
            className="stage relative h-[62svh] min-h-[22rem] touch-pan-y"
            role="group"
            aria-roledescription="gallery"
            aria-label="Photographs on a curved wall. Use the arrow keys or the buttons to turn."
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
              if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
              if (e.key === "Enter") show(IDS[index], e.currentTarget);
            }}
          >
            <Apse ids={IDS} index={index} zoom={zoom} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p aria-live="polite" className="max-w-[64ch] text-small"><span className="font-semibold">{index + 1} of {IDS.length}.</span> {current.alt}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => move(-1)} disabled={index === 0}>Previous</button>
              <button type="button" className="btn btn-secondary" onClick={() => move(1)} disabled={index === IDS.length - 1}>Next</button>
              <button type="button" className="btn btn-primary" data-spatial="1" onClick={(e) => show(IDS[index], e.currentTarget)}>View full size</button>
            </div>
          </div>
        </section>
      )}

      {/* The conventional gallery: always present, fully usable without the canvas. */}
      <section aria-labelledby="grid-title" className="px-4 py-16 sm:px-8 lg:px-12">
        <h2 id="grid-title" className="text-h3 font-semibold">All photographs</h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {IDS.map((id, i) => {
            const p = photo(id);
            return (
              <li key={id}>
                <button
                  type="button"
                  className="block w-full text-left"
                  onClick={(e) => { setIndex(i); show(id, e.currentTarget); }}
                  aria-label={`View full size: ${p.alt}`}
                >
                  <span className="relative block aspect-[4/3] overflow-hidden bg-lavender">
                    <Image src={p.src} alt="" fill sizes="(min-width: 1024px) 20vw, 45vw" className="object-cover" style={{ objectPosition: `${p.focal.x * 100}% ${p.focal.y * 100}%` }} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <dialog
        ref={dialog}
        className="lab-dialog surface-dark"
        aria-label={full.alt}
        onClose={() => { setZoom(false); opener.current?.focus(); }}
      >
        <form method="dialog" className="flex justify-end">
          <button className="btn btn-inverse" autoFocus>Close</button>
        </form>
        <div className="relative mt-3 min-h-0 flex-1">
          <Image src={full.src} alt={full.alt} fill sizes="100vw" className="object-contain" />
        </div>
        <p className="mt-3 text-small text-lavender">{full.alt} Press Escape to close.</p>
      </dialog>
    </div>
  );
}
