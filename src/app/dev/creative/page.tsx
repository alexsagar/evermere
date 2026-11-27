import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { variants, type LogoVariant } from "@/brand/logo";
import { palette } from "@/brand/tokens";
import { Logo, Mark } from "@/components/brand/Logo";
import { getHomePage, getPages, getSiteSettings } from "@/content";
import { photo, photos, type PhotoCategory, type PhotoId } from "@/content/photos";
import "./creative.css";
import { ViewerFocus } from "./viewer-focus";

// No internal title in production, where the route is a 404.
export const metadata: Metadata = process.env.NODE_ENV === "production" ? {} : { title: "Creative review | Evermere (internal)" };

const pos = (id: PhotoId): CSSProperties => {
  const { x, y } = photo(id).focal;
  return { objectPosition: `${x * 100}% ${y * 100}%` };
};

function Photo({ id, sizes, className = "", priority }: { id: PhotoId; sizes: string; className?: string; priority?: boolean }) {
  const p = photo(id);
  return (
    <Image
      src={p.src}
      alt={p.alt}
      width={p.width}
      height={p.height}
      sizes={sizes}
      priority={priority}
      className={`h-full w-full object-cover ${className}`}
      style={pos(id)}
      data-photo={id}
    />
  );
}

function Band({ id, title, intro, children, className = "" }: { id: string; title: string; intro?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`px-4 py-20 sm:px-8 lg:px-12 lg:py-28 ${className}`}>
      <div className="mx-auto max-w-[1320px]">
        <h2 id={`${id}-title`} className="max-w-[22ch] text-h2 font-semibold">{title}</h2>
        {intro && <p className="mt-5 max-w-[60ch] text-lead">{intro}</p>}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

const logoTiles: { v: LogoVariant; bg: string; dark?: boolean }[] = [
  { v: "primary", bg: "bg-white" },
  { v: "lavender", bg: "bg-lavender" },
  { v: "reversed", bg: "bg-midnight", dark: true },
  { v: "white", bg: "bg-royal", dark: true },
  { v: "midnight", bg: "bg-cloud" },
];

const transitions: { from: PhotoId; to: PhotoId; name: string; idea: string; mask: "arch" | "door" | "grid" | "lower" | "gather" | "split" | "settle" }[] = [
  { from: "exterior-residence-pines", to: "exterior-entrance-cedar", name: "Exterior to welcome", idea: "The Threshold arch grows from logo size until it leaves the frame, opening onto the entrance.", mask: "arch" },
  { from: "exterior-entrance-cedar", to: "interiors-commons-fireplace", name: "Welcome to interior", idea: "Stepping inside: the entrance blends into the Commons along the line of the door, warm light first.", mask: "door" },
  { from: "interiors-garden-room", to: "accommodations-suite-pines", name: "Interior to accommodations", idea: "The Garden Room's window grid becomes a mask that reveals the suite pane by pane.", mask: "grid" },
  { from: "accommodations-suite-pines", to: "lifestyle-reading-window", name: "Accommodations to lifestyle", idea: "Sitting down: the view lowers from standing to seated eye level, settling on a reading chair.", mask: "lower" },
  { from: "lifestyle-cards-friends", to: "dining-room-forest-windows", name: "Lifestyle to dining", idea: "Gathering: three moments slide together into one long table.", mask: "gather" },
  { from: "dining-room-garden-light", to: "outdoors-timber-walkway", name: "Dining to outdoors", idea: "The garden doors part as two panels onto the covered walk around the courtyard.", mask: "split" },
  { from: "outdoors-fire-table-deck", to: "outdoors-chairs-dock", name: "Outdoors to inquiry", idea: "Back to the water: the dock settles and the invitation rises over its calm upper third.", mask: "settle" },
];

const categories: { id: PhotoCategory; label: string }[] = [
  { id: "exterior", label: "Exterior" },
  { id: "surroundings", label: "Surroundings" },
  { id: "interiors", label: "Interiors" },
  { id: "accommodations", label: "Accommodations" },
  { id: "dining", label: "Dining" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "outdoors", label: "Outdoors" },
];

// Development-only creative review. Not part of the public site.
export default async function CreativePage() {
  if (process.env.NODE_ENV === "production") notFound();
  const [site, home, pages] = await Promise.all([getSiteSettings(), getHomePage(), getPages()]);
  const page = (slug: string) => pages.find((p) => p.slug === slug);
  const chapter = (key: string) => home.chapters?.find((c) => c.key === key);
  const concepts = ["our-home", "accommodations", "lifestyle", "dining", "amenities", "gallery"].map((s) => page(s)!);

  return (
    <main className="creative">
      <ViewerFocus />
      {/* Opening: the proposed homepage first screen, static. */}
      <header className="surface-dark relative min-h-[100svh] overflow-hidden bg-midnight text-white">
        <div className="absolute inset-0">
          <Photo id="surroundings-lake-mist-shore" sizes="100vw" priority />
        </div>
        <div className="relative flex min-h-[100svh] flex-col justify-between p-4 sm:p-8 lg:p-12">
          <div className="flex items-center justify-between gap-6">
            <Logo variant="reversed" height={40} />
            <a href="#collection" className="btn btn-inverse">Inspect photographs</a>
          </div>
          <div className="max-w-[46rem] bg-midnight p-6 sm:p-10">
            <p className="text-small text-lavender">Internal creative review, Milestone 2</p>
            <h1 className="mt-6 text-h1 font-semibold">{home.headline}</h1>
            <p className="mt-6 max-w-[52ch] text-lead text-lavender">{home.intro}</p>
          </div>
        </div>
      </header>

      <nav aria-label="Review sections" className="sticky top-0 z-10 border-b border-lavender bg-white/95 px-4 sm:px-8 lg:px-12">
        <ul className="mx-auto flex max-w-[1320px] gap-6 overflow-x-auto py-4 text-small font-semibold whitespace-nowrap">
          {[["#logo", "Logo"], ["#direction", "Direction"], ["#exterior", "Exterior"], ["#transitions", "Transitions"], ["#interior", "Interior"], ["#pages", "Pages"], ["#collection", "Photography"]].map(([h, l]) => (
            <li key={h}><a href={h} className="underline-offset-4 hover:underline">{l}</a></li>
          ))}
        </ul>
      </nav>

      <Band id="logo" title="The final Threshold logo" intro="An arched doorway with the door swung open. The wordmark is converted to Manrope outlines, so every file renders identically without fonts. Below 28px, a simplified mark with a wider opening keeps the door legible.">
        <div className="grid gap-px bg-lavender lg:grid-cols-12">
          <div className="flex min-h-80 items-center justify-center bg-white p-8 lg:col-span-7">
            <Logo height={112} className="h-auto max-w-full" />
          </div>
          <div className="flex flex-col justify-between gap-8 bg-cloud p-8 lg:col-span-5">
            <div className="flex flex-wrap items-end gap-6" aria-label="Mark at 64, 48, 32, 24 and 16 pixels">
              {[64, 48, 32, 24, 16].map((s) => (
                <figure key={s} className="flex flex-col items-start gap-2">
                  <Mark size={s} />
                  <figcaption className="text-small">{s}px</figcaption>
                </figure>
              ))}
            </div>
            <div className="flex items-center gap-3 self-start bg-midnight px-3 py-2 text-small text-white">
              <Mark size={16} variant="white" />
              {site.name}
            </div>
          </div>
          {logoTiles.map((t) => (
            <div key={t.v} className={`${t.bg} ${t.dark ? "surface-dark text-white" : ""} flex min-h-40 flex-col justify-between gap-6 p-6 lg:col-span-4 last:lg:col-span-4`}>
              <Logo variant={t.v} height={40} />
              <p className="text-small">{t.v}: {variants[t.v].use}</p>
            </div>
          ))}
          <div className="flex min-h-40 flex-col justify-between gap-6 bg-white p-6 lg:col-span-4">
            <div className="flex items-center justify-between gap-4 border-b border-lavender pb-4">
              <Logo height={32} />
              <span className="btn btn-primary min-h-10 px-4 text-small">Arrange a visit</span>
            </div>
            <p className="text-small">Navigation at 32px height, with the persistent inquiry action.</p>
          </div>
        </div>
      </Band>

      <Band id="direction" title="Through the door" intro="The site is a walk through the house: from the lake, up the path, into the rooms and out onto the dock, where the invitation waits. One photograph per screen at key moments, text laid on the calm part of the image, and the arch from the logo as the single recurring frame." className="bg-white">
        <div className="grid gap-12 lg:grid-cols-12">
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:col-span-7">
            {[
              ["Place before product", "The lake and trees first, then the building, then the rooms."],
              ["One image, one statement", "Each immersive screen carries a single photograph and a single sentence."],
              ["Architecture as motion", "Every transition borrows a real action: opening, stepping in, sitting down."],
              ["Quiet everywhere else", "Editorial spreads on Cloud and White between the immersive moments."],
            ].map(([t, d]) => (
              <div key={t} className="border-t-2 border-midnight pt-4">
                <dt className="font-semibold">{t}</dt>
                <dd className="mt-2">{d}</dd>
              </div>
            ))}
          </dl>
          <div className="grid grid-cols-5 gap-px self-start bg-lavender lg:col-span-5" aria-label="Approved palette">
            {Object.values(palette).map((c) => (
              <div key={c.hex} className="bg-white">
                <div className="aspect-[1/2]" style={{ background: c.hex }} />
                <p className="p-2 text-[0.75rem] leading-tight">{c.name}</p>
              </div>
            ))}
          </div>
        </div>
      </Band>

      <section id="exterior" aria-labelledby="exterior-title" className="surface-dark bg-midnight px-4 py-20 text-white sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 id="exterior-title" className="max-w-[20ch] text-h2 font-semibold">{chapter("surroundings")?.heading}</h2>
          <p className="mt-5 max-w-[60ch] text-lead text-lavender">{chapter("surroundings")?.body?.[0]}</p>
          <ol className="mt-12 grid gap-4 md:grid-cols-3" aria-label="Exterior sequence, plates A to C">
            {(["exterior-residence-pines", "exterior-residence-garden-side", "exterior-residence-evening-pines"] as PhotoId[]).map((id, i) => (
              <li key={id}>
                <div className="aspect-[3/2] overflow-hidden"><Photo id={id} sizes="(min-width: 768px) 33vw, 100vw" /></div>
                <p className="mt-3 text-small text-lavender">Plate {"ABC"[i]}: {photo(id).motion}</p>
              </li>
            ))}
          </ol>
          <div className="mt-20 grid items-end gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h3 className="text-h3 font-semibold">The arch opens</h3>
              <p className="mt-4 max-w-[48ch] text-lavender">Storyboard of the signature homepage moment: the logo arch frames the entrance and grows until its edges leave the viewport. Scrubbed by scroll in the animation lab; a static arch-framed image with reduced motion.</p>
            </div>
            <ol className="grid grid-cols-4 gap-3 lg:col-span-7" aria-label="Arch storyboard, four frames">
              {[0.34, 0.55, 0.78, 1].map((s, i) => (
                <li key={s} className="aspect-[3/4] overflow-hidden bg-white/10">
                  <div className="arch-frame h-full w-full" style={{ "--arch": s } as CSSProperties}>
                    <Photo id="exterior-entrance-cedar" sizes="20vw" />
                  </div>
                  <span className="sr-only">Frame {i + 1}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <Band id="transitions" title="Seven transitions, seven different actions" intro="No two chapters use the same reveal. Each storyboard shows the outgoing photograph, the mask at its midpoint and the arriving photograph.">
        <ol className="space-y-16">
          {transitions.map((t, i) => (
            <li key={t.name} className="grid gap-6 border-t border-lavender pt-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="text-small font-semibold text-royal">{i + 1} of {transitions.length}</p>
                <h3 className="mt-2 text-h3 font-semibold">{t.name}</h3>
                <p className="mt-3 max-w-[40ch]">{t.idea}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 lg:col-span-8">
                <div className="aspect-[4/3] overflow-hidden"><Photo id={t.from} sizes="22vw" /></div>
                <div className={`mask-${t.mask} relative aspect-[4/3] overflow-hidden`}>
                  <Photo id={t.from} sizes="22vw" />
                  <div className="mask-layer absolute inset-0"><Photo id={t.to} sizes="22vw" /></div>
                </div>
                <div className="aspect-[4/3] overflow-hidden"><Photo id={t.to} sizes="22vw" /></div>
              </div>
            </li>
          ))}
        </ol>
      </Band>

      <section id="interior" aria-labelledby="interior-title" className="bg-white px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 lg:pt-24">
            <h2 id="interior-title" className="text-h2 font-semibold">{chapter("entrance")?.heading}</h2>
            <p className="mt-5 max-w-[46ch] text-lead">{chapter("entrance")?.body?.[0]}</p>
            <div className="mt-10 aspect-[4/3] overflow-hidden"><Photo id="interiors-garden-room" sizes="(min-width: 1024px) 40vw, 100vw" /></div>
          </div>
          <div className="lg:col-span-7">
            <div className="aspect-[4/5] overflow-hidden lg:aspect-[3/4]"><Photo id="interiors-commons-fireplace" sizes="(min-width: 1024px) 55vw, 100vw" /></div>
          </div>
          <div className="lg:col-span-7 lg:col-start-1">
            <div className="window-grid aspect-[3/2] overflow-hidden"><Photo id="accommodations-studio-suite" sizes="(min-width: 1024px) 55vw, 100vw" /></div>
          </div>
          <div className="self-end lg:col-span-4 lg:col-start-9">
            <h3 className="text-h3 font-semibold">{chapter("spaces")?.heading}</h3>
            <p className="mt-4">{chapter("spaces")?.body?.[0]}</p>
            <a href="#pages" className="link mt-6 inline-block">{chapter("spaces")?.cta?.label}</a>
          </div>
        </div>
      </section>

      <Band id="pages" title="Every page its own composition" intro="Static sketches of the openings proposed for the main internal pages, using their real headlines. Full directions are in docs/creative-direction.md.">
        <ul className="grid gap-x-8 gap-y-16 md:grid-cols-2">
          {concepts.map((p, i) => {
            const hero = photos.find((x) => x.src === p.image?.src)?.id ?? "outdoors-chairs-dock";
            return (
              <li key={p._id} className={`concept concept-${i}`}>
                <div className="concept-frame relative aspect-[4/3] overflow-hidden bg-lavender">
                  <Photo id={hero} sizes="(min-width: 768px) 45vw, 100vw" />
                  <p className="concept-title absolute bg-midnight p-4 text-[1.0625rem] leading-snug font-semibold text-white">{p.headline}</p>
                </div>
                <h3 className="mt-4 text-h3 font-semibold">{p.title}</h3>
                <p className="mt-2 max-w-[52ch] text-small">{p.intro}</p>
              </li>
            );
          })}
        </ul>
      </Band>

      <section id="collection" aria-labelledby="collection-title" className="bg-white px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 id="collection-title" className="text-h2 font-semibold">The photography collection</h2>
          <p className="mt-5 max-w-[62ch] text-lead">{photos.length} licensed photographs, chosen for one consistent Northwest world. Select any image to inspect the full-resolution master at actual size. They are illustrative stock images of a fictional property: they do not show the client&rsquo;s building, and the people pictured are models, not Evermere residents or staff.</p>
          {categories.map((c) => {
            const set = photos.filter((p) => p.category === c.id);
            return (
              <div key={c.id} className="mt-16">
                <h3 className="border-b-2 border-midnight pb-3 text-h3 font-semibold">{c.label} <span className="text-small font-medium">({set.length})</span></h3>
                <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {set.map((p) => (
                    <li key={p.id}>
                      <a href={`#view-${p.id}`} className="block" aria-label={`View ${p.id} at full size`}>
                        <span className="block aspect-[4/3] overflow-hidden bg-lavender"><Photo id={p.id} sizes="(min-width: 1024px) 22vw, 45vw" /></span>
                      </a>
                      <p className="mt-2 text-small font-semibold break-words">{p.id}</p>
                      <p className="text-small">{p.width} x {p.height}, {Math.round(p.bytes / 1024)} KB</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {photos.map((p) => (
        <div key={p.id} id={`view-${p.id}`} className="viewer surface-dark" role="dialog" aria-modal="true" aria-label={`${p.id}, full resolution`}>
          <a href="#collection" className="btn btn-inverse viewer-close">Close</a>
          <div className="viewer-scroll" tabIndex={0} role="region" aria-label="Image at actual size, scrollable">
            {/* Plain img on purpose: shows the master file at 100% for sharpness checks. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt={p.alt} width={p.width} height={p.height} loading="lazy" decoding="async" />
          </div>
          <p className="viewer-meta text-small">{p.alt} {p.width} x {p.height}. {p.usage}.</p>
        </div>
      ))}
    </main>
  );
}
