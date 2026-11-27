"use client";

import { useEffect, useReducer, useRef } from "react";
import { LinearFilter, SRGBColorSpace, TextureLoader, type Texture, type WebGLRenderer } from "three";
import { photo, type PhotoId } from "@/content/photos";
/** What a shader plane needs to know about a photograph. */
export type PlanePhoto = { url: string; size: [number, number]; focal: [number, number] };

/** Lab texture URL: 2048px for full-screen planes, 1024px ("sm") for gallery planes. */
export const textureUrl = (id: PhotoId, size: "lg" | "sm" = "lg") => `/lab/textures/${id}${size === "sm" ? "-sm" : ""}.webp`;

/** Lab helper: a curated photograph as a plane photo, using the lab textures. */
export function labPhoto(id: PhotoId): PlanePhoto {
  const p = photo(id);
  return { url: textureUrl(id), size: [p.width, p.height], focal: [p.focal.x, p.focal.y] };
}

const loader = new TextureLoader();

export async function loadTexture(url: string, gl?: WebGLRenderer): Promise<Texture> {
  const t = await loader.loadAsync(url);
  t.colorSpace = SRGBColorSpace;
  t.minFilter = LinearFilter; // no mipmaps: planes are drawn near 1:1, saves a third of the memory
  t.generateMipmaps = false;
  if (gl) gl.initTexture(t); // upload now, not on the first transition frame
  return t;
}

/**
 * Loads exactly the given textures and disposes any that leave the set, so GPU
 * memory tracks the working set rather than the whole collection. Returns a
 * lookup by URL; the component re-renders as textures arrive.
 */
export function useTextureSet(urls: string[], gl?: WebGLRenderer) {
  const cache = useRef(new Map<string, Texture>());
  const pending = useRef(new Set<string>());
  const wanted = useRef(new Set<string>());
  const [, loaded] = useReducer((n: number) => n + 1, 0);
  const key = urls.join("|");

  useEffect(() => {
    wanted.current = new Set(key ? key.split("|") : []);
    for (const [url, t] of cache.current) {
      if (!wanted.current.has(url)) {
        t.dispose();
        cache.current.delete(url);
      }
    }
    for (const url of wanted.current) {
      if (cache.current.has(url) || pending.current.has(url)) continue;
      pending.current.add(url);
      loadTexture(url, gl).then(
        (t) => {
          pending.current.delete(url);
          if (!wanted.current.has(url)) return t.dispose();
          cache.current.set(url, t);
          loaded();
        },
        () => pending.current.delete(url), // a missing texture leaves the plane on its flat color
      );
    }
  }, [key, gl]);

  useEffect(() => {
    const c = cache.current;
    const w = wanted;
    return () => {
      w.current = new Set();
      c.forEach((t) => t.dispose());
      c.clear();
    };
  }, []);

  return (url: string) => cache.current.get(url);
}
