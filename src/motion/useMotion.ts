"use client";

import { useSyncExternalStore } from "react";
import { prefersReducedMotion, previewOverrides, supportsWebGL } from "@/lib/motion";

const QUERY = "(prefers-reduced-motion: reduce)";
let webgl: boolean | undefined; // probed once per page load

function subscribe(onChange: () => void) {
  const mq = matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function snapshot() {
  const o = previewOverrides(location.search);
  webgl ??= supportsWebGL();
  return `${o.reduce || prefersReducedMotion() ? 1 : 0}${!o.noWebGL && webgl ? 1 : 0}`;
}

export type MotionState = { ready: boolean; reduced: boolean; webgl: boolean };

/**
 * Capability gate for every experiment. On the server and during hydration it
 * reports `ready: false`, so components render their static, complete layout first.
 */
export function useMotion(): MotionState {
  const s = useSyncExternalStore(subscribe, snapshot, () => "ssr");
  if (s === "ssr") return { ready: false, reduced: true, webgl: false };
  return { ready: true, reduced: s[0] === "1", webgl: s[1] === "1" };
}
