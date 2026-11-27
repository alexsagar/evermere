"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GalleryGroup } from "./GalleryView";

// three.js and the scene download only when a visitor opens the exhibition.
const Canvas = dynamic(() => import("./ExhibitionCanvas"), { ssr: false });

/** Per chapter, at most this many photographs hang on the wall. */
const PER_CHAPTER = 18;

/**
 * The optional exhibition: a modal dialog over the conventional gallery. Every
 * control, caption and announcement is DOM; the canvas is decoration (aria-hidden).
 * Closing returns focus to the button that opened it. If WebGL fails or the
 * context is lost, the dialog closes and the conventional gallery is announced.
 */
export function Exhibition({ groups, onClose, onFail, onView }: {
  groups: GalleryGroup[];
  onClose: () => void;
  onFail: () => void;
  onView: (src: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [chapter, setChapter] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [focus, setFocus] = useState(false);
  const drag = useRef<number | null>(null);

  // "All" hangs two photographs from each chapter, in chapter order.
  const photos = useMemo(() => {
    const selected = groups.map((g) => ({ ...g, images: g.images.filter((img) => img.exhibition !== false) }));
    const list = chapter ? selected.filter((g) => g.slug === chapter).flatMap((g) => g.images.map((img) => ({ img, group: g.title })))
      : selected.flatMap((g) => g.images.slice(0, 2).map((img) => ({ img, group: g.title })));
    return list.filter(({ img }) => img.src && img.width && img.height).slice(0, PER_CHAPTER);
  }, [groups, chapter]);
  const current = photos[index];
  const wall = useMemo(() => photos.map(({ img }) => ({ src: img.src!, width: img.width!, height: img.height! })), [photos]);

  const move = useCallback((d: number) => { setFocus(false); setIndex((i) => Math.max(0, Math.min(photos.length - 1, i + d))); }, [photos.length]);

  const back = useRef<HTMLButtonElement>(null);
  // Opens on mount. Cleanup also runs when Next hides this route in an <Activity> tree
  // after navigation: closing there keeps an invisible modal from making the new page inert.
  useEffect(() => {
    const el = dialog.current!;
    el.showModal();
    back.current?.focus();
    return () => { if (el.open) el.close(); };
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
    if (e.key === "Escape" && focus) { e.preventDefault(); setFocus(false); }
  };

  return (
    <dialog ref={dialog} className="ex surface-dark" aria-labelledby="ex-title" onClose={() => { if (!dialog.current?.open) onClose(); }} onCancel={(e) => { if (focus) { e.preventDefault(); setFocus(false); } }} onKeyDown={onKey}>
      <div className="ex-bar">
        <h2 id="ex-title" className="ex-title">Exhibition</h2>
        <div className="ex-chapters" role="group" aria-label="Chapter">
          <button type="button" aria-pressed={chapter === null} onClick={() => { setChapter(null); setIndex(0); setFocus(false); }}>All</button>
          {groups.map((g) => (
            <button key={g.slug} type="button" aria-pressed={chapter === g.slug} onClick={() => { setChapter(g.slug); setIndex(0); setFocus(false); }}>{g.title}</button>
          ))}
        </div>
        <form method="dialog"><button ref={back} className="btn btn-inverse">Back to gallery</button></form>
      </div>

      <div
        className="ex-stage"
        onPointerDown={(e) => { drag.current = e.clientX; }}
        onPointerUp={(e) => {
          if (drag.current === null) return;
          const dx = e.clientX - drag.current;
          drag.current = null;
          if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1);
          else setFocus((f) => !f); // a tap or click on the wall focuses the photograph in front
        }}
        onPointerCancel={() => { drag.current = null; }}
      >
        <Canvas photos={wall} index={index} focus={focus} onLost={onFail} />
      </div>

      <div className="ex-foot">
        <p className="ex-caption" aria-live="polite">
          <span className="ex-count">{index + 1} of {photos.length}, {current?.group}</span>
          {current?.img.caption ?? current?.img.alt}
        </p>
        <div className="ex-actions">
          <button type="button" className="btn btn-inverse" onClick={() => move(-1)} disabled={index === 0}>Previous</button>
          <button type="button" className="btn btn-inverse" onClick={() => move(1)} disabled={index === photos.length - 1}>Next</button>
          <button type="button" className="btn ex-focus" aria-pressed={focus} onClick={() => setFocus((f) => !f)}>{focus ? "Step back" : "Look closer"}</button>
          <button type="button" className="text-link text-link-light" onClick={() => current && onView(current.img.src!)}>Full size</button>
        </div>
      </div>
    </dialog>
  );
}
