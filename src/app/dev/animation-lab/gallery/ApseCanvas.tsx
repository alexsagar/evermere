"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, type Group, type PerspectiveCamera, type Texture } from "three";
import { photo, type PhotoId } from "@/content/photos";
import { ease, gsap } from "@/motion/gsap";
import GLCanvas from "@/motion/webgl/GLCanvas";
import { textureUrl, useTextureSet } from "@/motion/webgl/textures";

// Photographs hang on the inside of a shallow curved wall, like an exhibition
// apse. The viewer stands at its center and turns to face each one.
const RADIUS = 12;
const STEP = 0.3; // radians between photographs; 15 of them span about 240 degrees
const HEIGHT = 2.3; // plane height in world units
const LAVENDER = new Color("#DCDFF5");
const DIM = new Color(0.22, 0.23, 0.27); // linear: about 50% perceived brightness

function Apse({ ids, index, zoom }: { ids: readonly PhotoId[]; index: number; zoom: boolean }) {
  const { gl, camera, invalidate } = useThree();
  const wall = useRef<Group>(null);
  // Working set: the photograph in front and two either side. Others stay flat Lavender.
  const near = useMemo(() => ids.filter((_, i) => Math.abs(i - index) <= 2), [ids, index]);
  const tex = useTextureSet(near.map((id) => textureUrl(id, "sm")), gl);

  useEffect(() => {
    const target = { yaw: index * STEP, z: zoom ? -4 : 0, fov: zoom ? 24 : 30 };
    const cam = camera as PerspectiveCamera;
    const tw = gsap.to(wall.current!.rotation, {
      y: target.yaw, duration: 1.1, ease: ease.open, onUpdate: invalidate,
    });
    const tz = gsap.to(cam.position, { z: target.z, duration: 0.7, ease: ease.open, onUpdate: invalidate });
    const tf = gsap.to(cam, { fov: target.fov, duration: 0.7, ease: ease.open, onUpdate: () => { cam.updateProjectionMatrix(); invalidate(); } });
    return () => { tw.kill(); tz.kill(); tf.kill(); };
  }, [index, zoom, camera, invalidate]);

  return (
    <>
    <color attach="background" args={["#18243D"]} />
    <group ref={wall}>
      {ids.map((id, i) => {
        const p = photo(id);
        const w = (HEIGHT * p.width) / p.height;
        const a = i * STEP;
        const t = tex(textureUrl(id, "sm"));
        return (
          <mesh key={id} position={[Math.sin(a) * RADIUS, 0, -Math.cos(a) * RADIUS]} rotation={[0, -a, 0]}>
            <planeGeometry args={[w, HEIGHT]} />
            <Plate map={t} active={i === index} />
          </mesh>
        );
      })}
    </group>
    </>
  );
}

const WHITE = new Color(1, 1, 1);

// Photographs to the side are dimmed so the one in front reads as lit.
function Plate({ map, active }: { map?: Texture; active: boolean }) {
  const { invalidate } = useThree();
  useEffect(() => { invalidate(); }, [map, active, invalidate]);
  return <meshBasicMaterial key={map ? "t" : "c"} map={map ?? null} color={map ? (active ? WHITE : DIM) : LAVENDER} toneMapped={false} />;
}

export default function ApseCanvas(props: { ids: readonly PhotoId[]; index: number; zoom: boolean }) {
  return (
    <GLCanvas fallback={null} camera={{ position: [0, 0, 0], fov: 30, near: 0.1, far: 40 }}>
      <Apse {...props} />
    </GLCanvas>
  );
}
