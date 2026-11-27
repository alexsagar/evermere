"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { DataTexture, ShaderMaterial, Vector2 } from "three";
import { fullscreenVertex, transitionFragment } from "./shaders";
import { useTextureSet, type PlanePhoto } from "./textures";

export type TransitionMode = "displace" | "arch" | "dolly";
export type PlaneApi = { set: (progress: number) => void; ready: boolean };
const MODES: Record<TransitionMode, number> = { displace: 0, arch: 1, dolly: 2 };
const blank = new DataTexture(new Uint8Array([24, 36, 61, 255]), 1, 1); // Midnight while loading
blank.needsUpdate = true;

/**
 * Full-viewport shader plane blending two photographs. Progress is pushed in
 * through `apiRef.current.set`, which renders exactly one frame; nothing runs while idle.
 */
export function TransitionPlane({ from, to, mode, apiRef, onReady }: {
  from: PlanePhoto | null;
  to: PlanePhoto;
  mode: TransitionMode;
  apiRef: RefObject<PlaneApi | null>;
  onReady?: () => void;
}) {
  const { gl, size, invalidate } = useThree();
  const tex = useTextureSet([to.url, ...(from ? [from.url] : [])], gl);
  const tFrom = from ? tex(from.url) : undefined;
  const tTo = tex(to.url);

  const matRef = useRef<ShaderMaterial>(null);
  const params = useMemo(
    () => ({
      vertexShader: fullscreenVertex,
      fragmentShader: transitionFragment,
      uniforms: {
        uFrom: { value: blank }, uTo: { value: blank },
        uFromSize: { value: new Vector2(1, 1) }, uToSize: { value: new Vector2(1, 1) },
        uFromFocal: { value: new Vector2(0.5, 0.5) }, uToFocal: { value: new Vector2(0.5, 0.5) },
        uRes: { value: new Vector2(1, 1) }, uProgress: { value: 0 }, uMode: { value: 0 }, uHasFrom: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
    }),
    [],
  );

  const ready = Boolean(tTo && (!from || tFrom));
  useEffect(() => {
    const u = matRef.current!.uniforms;
    u.uMode.value = MODES[mode];
    u.uHasFrom.value = from ? 1 : 0;
    u.uRes.value.set(size.width, size.height);
    u.uFrom.value = tFrom ?? blank;
    u.uTo.value = tTo ?? blank;
    if (from) {
      u.uFromSize.value.set(...from.size);
      u.uFromFocal.value.set(...from.focal);
    }
    u.uToSize.value.set(...to.size);
    u.uToFocal.value.set(...to.focal);
    apiRef.current = {
      ready,
      set: (p) => {
        u.uProgress.value = p;
        invalidate();
      },
    };
    invalidate();
    if (ready) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- photos are compared by URL
  }, [mode, from?.url, to.url, tFrom, tTo, size.width, size.height, ready, apiRef, invalidate, onReady]);

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={matRef} args={[params]} />
    </mesh>
  );
}
