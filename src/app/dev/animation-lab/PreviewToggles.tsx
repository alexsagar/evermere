"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { previewOverrides } from "@/lib/motion";

const noop = () => () => {};

// Links that reload the current experiment with reduced motion or without WebGL,
// and a root flag so CSS (including view transitions) honors the preview.
export function PreviewToggles() {
  const path = usePathname();
  const search = useSyncExternalStore(noop, () => location.search, () => "");
  const o = previewOverrides(search);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-reduce-motion", o.reduce);
  }, [o.reduce]);

  const href = (reduce: boolean, noWebGL: boolean) => {
    const q = new URLSearchParams();
    if (reduce) q.set("motion", "reduce");
    if (noWebGL) q.set("webgl", "off");
    return `${path}${q.size ? `?${q}` : ""}`;
  };

  // Plain anchors: a full load re-runs every capability check cleanly.
  return (
    <div className="lab-toggles" role="group" aria-label="Preview modes">
      <a href={href(!o.reduce, o.noWebGL)} data-on={o.reduce || undefined}>Reduced motion: {o.reduce ? "on" : "off"}</a>
      <a href={href(o.reduce, !o.noWebGL)} data-on={o.noWebGL || undefined}>WebGL: {o.noWebGL ? "off" : "on"}</a>
    </div>
  );
}
