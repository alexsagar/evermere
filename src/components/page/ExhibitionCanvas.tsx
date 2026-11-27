"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, type Group, type MeshBasicMaterial, type PerspectiveCamera, type Texture } from "three";
import { ease, gsap } from "@/motion/gsap";
import GLCanvas from "@/motion/webgl/GLCanvas";
import { useTextureSet } from "@/motion/webgl/textures";
import { exhibitionTextureUrl } from "@/lib/content-image";

export type ExhibitPhoto = { src: string; width: number; height: number };

// Photographs hang at eye level on the inside of a gently curved wall. The visitor
// stands DISTANCE in front of it; the wall turns about the curve's center (behind the
// visitor) to bring each photograph to the front, so neighbors recede at the sides.
// Spacing follows each photograph's real width, so gaps stay even whatever the aspect.
const RADIUS = 26;
const DISTANCE = 9;
const HEIGHT = 3.1; // plane height in world units: about two thirds of the view height
const GAP = 1.1;
const FOV = 30;
const MIDNIGHT = "#18243D";
const LIT = new Color(1, 1, 1);
const SIDE = new Color(0.14, 0.15, 0.18); // linear; neighbors read as unlit
const FOCUS_SIDE = new Color(0.08, 0.09, 0.12);
const BLANK = new Color("#26334f");

/** Next image endpoint: an optimized, size-capped texture (never the original file). */
export const textureSrc = exhibitionTextureUrl;

function Wall({ photos, index, focus }: { photos: ExhibitPhoto[]; index: number; focus: boolean }) {
  const { gl, camera, invalidate, size } = useThree();
  const wall = useRef<Group>(null);

  // Angle of each photograph's center along the arc, from cumulative widths.
  const layout = useMemo(() => {
    const out: { w: number; a: number }[] = [];
    for (const p of photos) {
      const w = (HEIGHT * p.width) / p.height;
      const prev = out.at(-1);
      out.push({ w, a: prev ? prev.a + (prev.w / 2 + GAP + w / 2) / RADIUS : 0 });
    }
    return out;
  }, [photos]);

  // Working set: the photograph in front and two either side. The rest stay blank.
  const urls = useMemo(() => photos.filter((_, i) => Math.abs(i - index) <= 2).map((p) => textureSrc(p.src)), [photos, index]);
  const tex = useTextureSet(urls, gl);

  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    // Camera distance that fits the photograph in front, whole, at the given share of
    // the view (aspect preserved: never cropped, on wide or portrait screens).
    const w = layout[index]?.w ?? HEIGHT;
    const fit = (share: number, fov: number) => Math.max(HEIGHT / share, w / share / (size.width / size.height)) / (2 * Math.tan((fov * Math.PI) / 360));
    const fov = focus ? FOV - 4 : FOV;
    const z = DISTANCE - (focus ? fit(0.9, fov) : Math.max(DISTANCE, fit(0.62, fov)));
    const tl = gsap.timeline({ defaults: { ease: ease.open }, onUpdate: invalidate });
    tl.to(wall.current!.rotation, { y: layout[index]?.a ?? 0, duration: 1 }, 0)
      .to(cam.position, { z: -z, duration: 0.9 }, focus ? 0.15 : 0)
      .to(cam, { fov, duration: 0.9, onUpdate: () => cam.updateProjectionMatrix() }, "<");
    return () => { tl.kill(); };
  }, [index, focus, layout, camera, invalidate, size]);

  return (
    <>
      <color attach="background" args={[MIDNIGHT]} />
      <group ref={wall} position={[0, 0, RADIUS - DISTANCE]}>
        {photos.map((p, i) => {
          const { w, a } = layout[i];
          const active = i === index;
          return (
            <mesh key={p.src} position={[Math.sin(a) * RADIUS, 0, -Math.cos(a) * RADIUS]} rotation={[0, -a, 0]}>
              <planeGeometry args={[w, HEIGHT]} />
              <Plate map={tex(textureSrc(p.src))} tone={active ? LIT : focus ? FOCUS_SIDE : SIDE} />
            </mesh>
          );
        })}
      </group>
    </>
  );
}

// Lighting is a color multiply: the photograph in front at full brightness, neighbors dimmed.
function Plate({ map, tone }: { map?: Texture; tone: Color }) {
  const { invalidate } = useThree();
  const mat = useRef<MeshBasicMaterial>(null);
  useEffect(() => {
    const m = mat.current;
    if (!m) return;
    if (!map) { m.color.copy(BLANK); invalidate(); return; }
    const tw = gsap.to(m.color, { r: tone.r, g: tone.g, b: tone.b, duration: 0.6, ease: ease.settle, onUpdate: invalidate });
    return () => { tw.kill(); };
  }, [map, tone, invalidate]);
  return <meshBasicMaterial ref={mat} key={map ? "t" : "c"} map={map ?? null} color={BLANK} toneMapped={false} />;
}

// Canvas creation failed: hand back to the shell, which returns to the conventional gallery.
function Failed({ onLost }: { onLost: () => void }) {
  useEffect(onLost, [onLost]);
  return null;
}

export default function ExhibitionCanvas({ onLost, ...props }: { photos: ExhibitPhoto[]; index: number; focus: boolean; onLost: () => void }) {
  return (
    <GLCanvas fallback={<Failed onLost={onLost} />} onLost={onLost} data-exhibition-canvas="" camera={{ position: [0, 0, 0], fov: FOV, near: 0.1, far: 60 }}>
      <Wall {...props} />
    </GLCanvas>
  );
}
