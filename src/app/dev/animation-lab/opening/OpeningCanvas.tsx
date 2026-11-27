"use client";

import type { RefObject } from "react";
import type { PhotoId } from "@/content/photos";
import GLCanvas from "@/motion/webgl/GLCanvas";
import { labPhoto } from "@/motion/webgl/textures";
import { TransitionPlane, type PlaneApi } from "@/motion/webgl/TransitionPlane";

// Variant B: the arch opens in a shader from Midnight onto the photograph. The
// canvas exists only while the intro plays; the DOM image takes over after.
export default function OpeningCanvas({ hero, apiRef, onReady }: { hero: PhotoId; apiRef: RefObject<PlaneApi | null>; onReady: () => void }) {
  return (
    <div className="absolute inset-0">
      <GLCanvas fallback={null}>
        <TransitionPlane from={null} to={labPhoto(hero)} mode="arch" apiRef={apiRef} onReady={onReady} />
      </GLCanvas>
    </div>
  );
}
