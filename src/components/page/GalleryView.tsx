"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { exhibitionSelection } from "@/lib/content-image";
import { sanityImageUrl } from "@/lib/content-image";
import { sanityLoader } from "@/components/site/SanityImage";
import { useMotion } from "@/motion/useMotion";
import { Exhibition } from "./Exhibition";
import type { ContentImage } from "@/components/site/Img";

export type GalleryGroup = { slug: string; title: string; images: NonNullable<ContentImage>[] };

/**
 * The conventional gallery: category filters (toggle buttons), a curated
 * multi-column wall at thumbnail sizes, and a native-dialog viewer with previous
 * and next, arrow keys, swipe, Escape and focus return. A future spatial view can
 * mount above this; this view keeps working on its own.
 */
export function GalleryView({ groups }: { groups: GalleryGroup[] }) {
  const curated = useMemo(() => exhibitionSelection(groups), [groups]);
  const [filter, setFilter] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const touch = useRef<number | null>(null);
  const { ready, reduced, webgl } = useMotion();
  // The exhibition is offered on tablet and desktop widths with WebGL and motion; phones,
  // reduced motion and no-WebGL visitors keep this gallery, which shows every photograph.
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(min-width: 768px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const [exhibit, setExhibit] = useState(false);
  const [failed, setFailed] = useState(false);
  const enter = useRef<HTMLButtonElement>(null);
  const live = useRef(false);

  const shown = groups.filter((g) => !filter || g.slug === filter).flatMap((g) => g.images.map((img) => ({ img, group: g.title })));
  const current = shown[index];
  const shownCount = shown.length;

  const step = useCallback((d: number) => setIndex((i) => (i + d + shownCount) % shownCount), [shownCount]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (!el.open) return;
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [step]);

  const open = (i: number, from: HTMLButtonElement) => {
    opener.current = from;
    setIndex(i);
    dialog.current?.showModal();
  };

  // From the exhibition: open this viewer on top, on the same photograph in the full list.
  const view = (src: string) => {
    setFilter(null);
    const i = groups.flatMap((g) => g.images).findIndex((img) => img.src === src);
    open(Math.max(0, i), document.activeElement as HTMLButtonElement);
  };

  return (
    <div className="gl">
      {failed && <p className="gl-note" role="status">The exhibition could not start on this device. Every photograph is here in the gallery.</p>}
      {exhibit && (
        <Exhibition
          groups={curated}
          onView={view}
          onClose={() => { live.current = false; setExhibit(false); enter.current?.focus(); }}
          // Closing also releases the context; only a loss while open is a failure.
          onFail={() => { if (!live.current) return; live.current = false; setExhibit(false); setFailed(true); }}
        />
      )}
      {/* The exhibition offer shares the filter row, whose height is reserved on first paint, so it appears without moving the wall. */}
      <div className="gl-top">
        <div className="gl-filters" role="group" aria-label="Show photographs of">
          <button type="button" aria-pressed={filter === null} onClick={() => setFilter(null)}>All</button>
          {groups.map((g) => (
            <button key={g.slug} type="button" aria-pressed={filter === g.slug} onClick={() => setFilter(g.slug)}>{g.title}</button>
          ))}
        </div>
        {ready && webgl && !reduced && wide && !failed && curated.length > 0 && (
          <button ref={enter} type="button" className="btn btn-primary gl-enter" onClick={() => { live.current = true; setExhibit(true); }}>Enter the exhibition</button>
        )}
      </div>
      <p className="gl-count" aria-live="polite">{shown.length} photographs</p>

      <ul className="gl-wall">
        {shown.map(({ img }, i) => (
          <li key={img.src} className="gl-item">
            <button type="button" className="gl-thumb" onClick={(e) => open(i, e.currentTarget)} aria-label={`View larger: ${img.alt}`}>
              <Image
                src={img.src!}
                loader={sanityImageUrl(img.src!) ? sanityLoader : undefined}
                alt=""
                width={img.width ?? 1200}
                height={img.height ?? 800}
                sizes="(min-width: 1280px) 24vw, (min-width: 768px) 32vw, 48vw"
                style={{ objectPosition: `${(img.hotspot?.x ?? 0.5) * 100}% ${(img.hotspot?.y ?? 0.5) * 100}%` }}
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="gl-viewer surface-dark"
        aria-label="Photograph viewer"
        onClose={() => opener.current?.focus()}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          touch.current = null;
        }}
      >
        <div className="gl-viewer-bar">
          <p aria-live="polite">{index + 1} of {shown.length}{current ? `, ${current.group}` : ""}</p>
          <form method="dialog"><button className="btn btn-inverse" autoFocus>Close</button></form>
        </div>
        {current && (
          <div className="gl-viewer-image">
            <Image src={current.img.src!} loader={sanityImageUrl(current.img.src!) ? sanityLoader : undefined} alt={current.img.alt ?? ""} fill sizes="100vw" className="object-contain" />
          </div>
        )}
        <div className="gl-viewer-foot">
          <p className="gl-viewer-caption">{current?.img.caption ?? current?.img.alt}</p>
          <div className="flex gap-2">
            <button type="button" className="btn btn-inverse" onClick={() => step(-1)}>Previous</button>
            <button type="button" className="btn btn-inverse" onClick={() => step(1)}>Next</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
