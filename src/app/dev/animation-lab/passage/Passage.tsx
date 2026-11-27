import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { photo, type PhotoId } from "@/content/photos";

export type PassageRoom = { slug: string; title: string; heading: string; body: string[]; id: PhotoId; next: { slug: string; label: string } };

/**
 * Experiment F. Ordinary links between two routes; React's <ViewTransition>
 * (built into the App Router) opens the arriving photograph inside the
 * Threshold arch. Without View Transitions support, navigation is simply instant.
 */
export function Passage({ room }: { room: PassageRoom }) {
  const p = photo(room.id);
  return (
    <main className="grid min-h-[calc(100svh-3.5rem)] lg:grid-cols-12">
      <ViewTransition name="passage-photo" share="passage" default="none">
        <div className="stage relative min-h-[50svh] lg:col-span-7">
          <Image src={p.src} alt={p.alt} fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" style={{ objectPosition: `${p.focal.x * 100}% ${p.focal.y * 100}%` }} />
        </div>
      </ViewTransition>
      <div className="flex flex-col justify-between gap-12 bg-white px-4 py-10 sm:px-8 lg:col-span-5 lg:px-12 lg:py-16">
        <div>
          <ViewTransition name="passage-title" share="passage-title" default="none">
            <p className="text-small font-semibold text-royal">{room.title}</p>
          </ViewTransition>
          <h1 className="mt-3 text-h1 font-semibold">{room.heading}</h1>
          {room.body.map((b) => <p key={b} className="mt-6 max-w-[48ch] text-lead">{b}</p>)}
        </div>
        <nav aria-label="Rooms" className="flex flex-wrap items-center gap-4">
          <Link href={`/dev/animation-lab/passage/${room.next.slug}`} className="btn btn-primary">{room.next.label}</Link>
          <Link href="/dev/animation-lab" className="link">Back to the lab</Link>
        </nav>
      </div>
    </main>
  );
}
