"use client";

import type { RefObject } from "react";
import type { PhotoId } from "@/content/photos";
import GLCanvas from "@/motion/webgl/GLCanvas";
import { labPhoto } from "@/motion/webgl/textures";
import { TransitionPlane, type PlaneApi, type TransitionMode } from "@/motion/webgl/TransitionPlane";

export default function TransitionCanvas(props: { from: PhotoId; to: PhotoId; mode: TransitionMode; apiRef: RefObject<PlaneApi | null>; onReady: () => void }) {
  return (
    <div className="absolute inset-0">
      <GLCanvas fallback={null}>
        <TransitionPlane {...props} from={labPhoto(props.from)} to={labPhoto(props.to)} />
      </GLCanvas>
    </div>
  );
}
