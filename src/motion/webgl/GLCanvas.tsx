"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { Component, useEffect, useState, type ReactNode } from "react";
import { NoToneMapping } from "three";

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * The only way experiments create a WebGL context. Renders on demand (no frames
 * while idle), caps the pixel ratio, keeps photographs untoned, and falls back to
 * the given static layout if the context cannot be created or is lost.
 *
 * The canvas exists only while its effects are live. Next keeps visited routes
 * in hidden <Activity> trees, which run effect cleanups but keep the DOM; without
 * this, a hidden route would hold its WebGL context indefinitely.
 */
export default function GLCanvas({ fallback, onLost, children, ...props }: CanvasProps & { fallback: ReactNode; onLost?: () => void }) {
  const [live, setLive] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount/unmount mirror of Activity visibility
    setLive(true);
    return () => setLive(false);
  }, []);
  if (!live) return null;
  return (
    <Boundary fallback={fallback}>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.75]}
        flat
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance", toneMapping: NoToneMapping }}
        aria-hidden="true"
        data-lab-canvas=""
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); onLost?.(); });
        }}
        {...props}
      >
        {children}
      </Canvas>
    </Boundary>
  );
}
