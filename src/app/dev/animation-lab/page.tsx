import Image from "next/image";
import Link from "next/link";
import { photo } from "@/content/photos";
import { experiments } from "./experiments";
import { devOnly } from "./dev-only";

const covers = [
  "exterior-entrance-cedar", "interiors-library-fireplace", "exterior-residence-pines", "exterior-glass-gallery-forest",
  "interiors-commons-fireplace", "accommodations-suite-doorway", "outdoors-chairs-dock",
] as const;

export default function LabIndex() {
  devOnly();
  return (
    <main className="px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1320px]">
        <h1 className="max-w-[18ch] text-h1 font-semibold">Animation lab: through the door, in motion.</h1>
        <p className="mt-6 max-w-[60ch] text-lead">
          Seven experiments built on the Threshold logo, the approved photographs and the real editorial copy. Each opens on its own route, so only one WebGL scene runs at a time. Use the preview links in the bar to check reduced motion and the no-WebGL fallback.
        </p>
        <ol className="mt-16 grid grid-cols-1 gap-px bg-lavender md:grid-cols-2">
          {experiments.map((e, i) => {
            const p = photo(covers[i]);
            return (
              <li key={e.slug} className="bg-white">
                <Link href={`/dev/animation-lab/${e.slug}`} className="group grid h-full grid-cols-[6rem_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-5 sm:p-6">
                  <span className="relative block aspect-[3/4] overflow-hidden bg-lavender">
                    <Image src={p.src} alt="" fill sizes="160px" className="object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: `${p.focal.x * 100}% ${p.focal.y * 100}%` }} />
                  </span>
                  <span>
                    <span className="text-small font-semibold text-royal">Experiment {i + 1}</span>
                    <span className="mt-1 block text-h3 font-semibold group-hover:underline">{e.name}</span>
                    <span className="mt-3 block text-small">{e.intent}</span>
                    <span className="mt-3 block text-small text-midnight/80">{e.variants}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}
