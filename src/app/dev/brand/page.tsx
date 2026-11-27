import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { LogoVariant as Variant } from "@/brand/logo";
import { concepts } from "@/brand/marks";
import { contrast, pairs, palette, radii, spacing, typeScale } from "@/brand/tokens";
import { Logo, Mark } from "@/components/brand/Logo";
import { getArticles, getFaqs, getHomePage, getNavigation, getPage, getSiteSettings } from "@/content";
import { ptText } from "@/content/pt";

// No internal title in production, where the route is a 404.
export const metadata: Metadata = process.env.NODE_ENV === "production" ? {} : { title: "Brand review | Evermere (internal)" };

const tiles: { variant: Variant; bg: string; label: string; dark?: boolean }[] = [
  { variant: "primary", bg: "bg-white", label: "Primary on Pure White" },
  { variant: "lavender", bg: "bg-lavender", label: "Primary on Lavender" },
  { variant: "reversed", bg: "bg-midnight", label: "Reversed on Midnight", dark: true },
  { variant: "white", bg: "bg-royal", label: "White on Royal", dark: true },
  { variant: "midnight", bg: "bg-cloud", label: "Midnight single color" },
];

const personality = [
  ["Warm", "Speaks like a neighbor, not a brochure."],
  ["Independent", "Assumes residents run their own lives."],
  ["Belonging", "Names places and people, not features."],
  ["Composed", "Calm, plain, never urgent or sentimental."],
  ["Trustworthy", "Says what is known; invites a conversation for the rest."],
];

const voice = [
  ["We say", "Residents keep their furniture, their mornings and their opinions."],
  ["We avoid", "Unparalleled luxury senior living where every moment is a treasured memory."],
  ["We say", "Support is planned with each resident, around their routines."],
  ["We avoid", "Our loving caregivers look after your loved one's every need."],
];

function Section({ title, intro, children, className = "" }: { title: string; intro?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`px-4 py-20 sm:px-8 lg:px-12 lg:py-28 ${className}`}>
      <div className="mx-auto max-w-[1320px]">
        <h2 className="text-h2 font-semibold">{title}</h2>
        {intro && <p className="mt-4 max-w-[62ch] text-lead">{intro}</p>}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

// Development-only design system review. Not part of the public site.
export default async function BrandPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const [site, home, nav, faqs, articles, ourHome] = await Promise.all([
    getSiteSettings(),
    getHomePage(),
    getNavigation(),
    getFaqs(),
    getArticles(),
    getPage("our-home"),
  ]);
  const chapters = home.chapters ?? [];

  return (
    <main>
      <header className="surface-dark bg-midnight px-4 pt-10 pb-24 text-white sm:px-8 lg:px-12 lg:pb-32">
        <div className="mx-auto max-w-[1320px]">
          <p className="text-small text-lavender">Internal review, not for publication</p>
          <h1 className="mt-16 max-w-[14ch] text-display font-semibold">{site.name} brand system</h1>
          <p className="mt-8 max-w-[56ch] text-lead text-lavender">
            Three logo directions, the approved palette, Manrope typography and the editorial voice, shown with real
            Evermere copy. Choose a logo direction to finalize before the homepage milestone begins.
          </p>
          <nav aria-label="Review sections" className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-small font-semibold">
            {[["#logos", "Logo concepts"], ["#color", "Color"], ["#type", "Typography"], ["#ui", "Interface"], ["#voice", "Voice"], ["#editorial", "Editorial samples"]].map(([href, label]) => (
              <a key={href} href={href} className="underline decoration-lavender/60 underline-offset-4 hover:decoration-white">{label}</a>
            ))}
          </nav>
        </div>
      </header>

      <div id="logos">
        {concepts.map((c, i) => (
          <section key={c.id} aria-labelledby={`concept-${c.id}`} className={`px-4 py-20 sm:px-8 lg:px-12 lg:py-28 ${i % 2 ? "bg-white" : ""}`}>
            <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="text-small font-semibold text-royal">Concept {i + 1} of 3</p>
                <h2 id={`concept-${c.id}`} className="mt-3 text-h2 font-semibold">{c.name}</h2>
                <p className="mt-6 max-w-[48ch]">{c.rationale}</p>
                {c.id === "threshold" && (
                  <p className="mt-6 max-w-[48ch] border-l-2 border-royal pl-4 font-semibold">
                    Selected in Milestone 2. Final logo with outlined wordmark; see /dev/creative for the finished system.
                  </p>
                )}
              </div>
              <div className="flex aspect-[4/3] items-center justify-center bg-cloud lg:col-span-6 lg:col-start-7" data-testid={`hero-${c.id}`}>
                <Mark concept={c.id} size={200} />
              </div>

              {c.id === "threshold" && (<>
              <div className="lg:col-span-12">
                <h3 className="text-h3 font-semibold">Variations</h3>
                <ul className="mt-6 grid gap-px bg-lavender sm:grid-cols-2 lg:grid-cols-5">
                  {tiles.map((t) => (
                    <li key={t.label} className={`${t.bg} ${t.dark ? "surface-dark text-white" : ""} flex min-h-44 flex-col justify-between gap-6 p-6`}>
                      <Logo variant={t.variant} height={40} />
                      <span className="text-small">{t.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-7">
                <h3 className="text-h3 font-semibold">Small sizes</h3>
                <div className="mt-6 flex flex-wrap items-end gap-8">
                  {[64, 48, 32, 24, 16].map((s) => (
                    <figure key={s} className="flex flex-col items-start gap-2">
                      <Mark concept={c.id} size={s} />
                      <figcaption className="text-small">{s}px</figcaption>
                    </figure>
                  ))}
                  <figure className="flex flex-col items-start gap-2">
                    <span className="surface-dark flex items-center gap-2 rounded-t-sm bg-midnight px-3 py-2 text-small text-white">
                      <Mark concept={c.id} variant="white" size={16} />
                      Evermere Senior Living
                    </span>
                    <figcaption className="text-small">Favicon in a browser tab</figcaption>
                  </figure>
                </div>
              </div>

              <div className="lg:col-span-12">
                <h3 className="text-h3 font-semibold">In use</h3>
                <div className="mt-6 border border-lavender">
                  <div className="flex flex-wrap items-center justify-between gap-6 bg-white px-6 py-4">
                    <Logo height={40} />
                    <ul className="hidden gap-6 text-small font-semibold lg:flex">
                      {nav.primary?.slice(0, 5).map((l) => <li key={l._key}>{l.label}</li>)}
                    </ul>
                    <span className="btn btn-primary">{nav.cta?.label}</span>
                  </div>
                  <div className="surface-dark flex flex-wrap items-end justify-between gap-6 bg-midnight px-6 py-10 text-white">
                    <Logo variant="reversed" height={36} />
                    <p className="text-small text-lavender">{site.phone} &nbsp; {site.email}</p>
                  </div>
                </div>
              </div>
              </>)}
            </div>
          </section>
        ))}
      </div>

      <Section title="Color" intro="Five colors, used with restraint. Midnight carries text and weight, Royal marks every action, and Lavender and Cloud keep large surfaces quiet. Photography brings the rest of the color." className="bg-white">
        <div id="color" className="grid gap-px bg-lavender sm:grid-cols-5">
          {Object.entries(palette).map(([key, c]) => (
            <div key={key} className="bg-white">
              <div className="h-40 border-b border-lavender" style={{ background: c.hex }} />
              <div className="p-5">
                <p className="font-semibold">{c.name}</p>
                <p className="text-small">{c.hex}</p>
                <p className="mt-2 text-small">{c.role}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 overflow-x-auto" tabIndex={0} role="region" aria-label="Contrast pairs table">
          <table className="w-full min-w-[560px] text-left text-small">
            <caption className="mb-4 text-left text-h3 font-semibold">Contrast pairs</caption>
            <thead>
              <tr className="border-b-2 border-midnight"><th className="py-3">Sample</th><th>Pair</th><th>Ratio</th><th>Approved for</th></tr>
            </thead>
            <tbody>
              {pairs.map((p) => (
                <tr key={`${p.fg}-${p.bg}`} className="border-b border-lavender">
                  <td className="py-3"><span className="inline-block px-3 py-1 font-semibold" data-contrast-sample style={{ color: palette[p.fg].hex, background: palette[p.bg].hex }} aria-hidden="true">Evermere</span></td>
                  <td>{palette[p.fg].name} on {palette[p.bg].name}</td>
                  <td>{contrast(palette[p.fg].hex, palette[p.bg].hex).toFixed(2)}:1</td>
                  <td>{{ text: "All text", large: "Large text and graphics only", none: "Not for text" }[p.use]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Typography" intro="Manrope only, in weights from 450 to 700. Large sizes are tightened, body text is generous and never smaller than 18px. No italics, no capitals for decoration.">
        <div id="type" className="divide-y divide-lavender border-y border-lavender">
          {typeScale.map((t) => (
            <div key={t.token} className="grid gap-4 py-8 lg:grid-cols-12">
              <div className="text-small lg:col-span-3">
                <p className="font-semibold">{t.token}</p>
                <p>{t.size}, weight {t.weight}, leading {t.leading}</p>
                <p>{t.use}</p>
              </div>
              <p className="max-w-[24ch] break-words lg:col-span-9 lg:max-w-none" style={{ fontSize: t.size, fontWeight: t.weight, lineHeight: t.leading, letterSpacing: t.tracking }}>
                {t.token === "body" || t.token === "small" ? site.description : t.token === "lead" ? home.intro : home.headline}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Interface" intro="Square, architectural forms. A 2px radius softens buttons and fields; layout blocks and photographs stay square. One arched frame per page, echoing the doorway, is the only curve." className="bg-white">
        <div id="ui" className="grid gap-12 lg:grid-cols-2">
          <div>
            <h3 className="text-h3 font-semibold">Buttons and links</h3>
            <div className="mt-6 flex flex-wrap gap-4">
              <a href="#ui" className="btn btn-primary">Arrange a visit</a>
              <a href="#ui" className="btn btn-secondary">Talk with our team</a>
            </div>
            <div className="surface-dark mt-4 flex flex-wrap gap-4 bg-midnight p-6">
              <a href="#ui" className="btn btn-inverse">Ask about availability</a>
            </div>
            <p className="mt-6">Inline links read as <a href="#ui" className="link">see the accommodations</a>, underlined and in Royal Blue. Press Tab to see focus rings.</p>
          </div>
          <div>
            <h3 className="text-h3 font-semibold">Spacing, corners and motion</h3>
            <div className="mt-6 flex flex-wrap items-end gap-3" aria-label="Spacing scale">
              {spacing.map((s) => (
                <span key={s} className="flex flex-col items-center gap-2 text-small">
                  <span className="block bg-royal" style={{ width: Math.min(s, 64), height: s / 2 }} />
                  {s}
                </span>
              ))}
            </div>
            <ul className="mt-8 space-y-2 text-small">
              {radii.map((r) => <li key={r.token}><span className="font-semibold">{r.token}</span> ({r.value}): {r.use}</li>)}
              <li><span className="font-semibold">Motion:</span> slow, eased and purposeful. Transitions 200ms to 600ms with a soft ease-out; scroll storytelling reveals photography rather than decorating text. Everything has a still fallback for reduced motion.</li>
              <li><span className="font-semibold">Icons:</span> used sparingly, 2px strokes on a 24px grid with square ends, in Midnight or Royal. Never as decoration beside headings.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Personality and voice" intro="Warm but not sentimental, professional but not corporate. We write to prospective residents first and to their families second, as adults making their own choices.">
        <div id="voice" className="grid gap-12 lg:grid-cols-2">
          <dl className="divide-y divide-lavender border-y border-lavender">
            {personality.map(([term, def]) => (
              <div key={term} className="grid grid-cols-[9rem_1fr] gap-4 py-4">
                <dt className="font-semibold">{term}</dt>
                <dd>{def}</dd>
              </div>
            ))}
          </dl>
          <ul className="space-y-6">
            {voice.map(([kind, line]) => (
              <li key={line} className={kind === "We say" ? "border-l-2 border-royal pl-4" : "border-l-2 border-lavender pl-4"}>
                <p className="text-small font-semibold">{kind}</p>
                <p className="text-lead">{line}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <section id="editorial" aria-labelledby="editorial-title" className="surface-dark bg-midnight px-4 py-20 text-white sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-12">
          <h2 id="editorial-title" className="text-small font-semibold text-lavender lg:col-span-12">Editorial sample: opening sequence</h2>
          <div className="lg:col-span-7">
            <p className="text-display font-semibold">{home.headline}</p>
            <p className="mt-8 max-w-[52ch] text-lead text-lavender">{home.intro}</p>
            <a href="#editorial" className="btn btn-inverse mt-10">{home.cta?.label}</a>
          </div>
          <figure className="lg:col-span-4 lg:col-start-9">
            <div className="flex aspect-[3/4] items-end bg-royal p-6" style={{ borderRadius: "999px 999px 0 0" }}>
              <figcaption className="text-small">Photograph to come: the lake at first light, seen through the open front door.</figcaption>
            </div>
          </figure>
        </div>
      </section>

      <Section title="Homepage narrative" intro="Twelve chapters for a scroll-driven photographic journey, from the first view of the lake to the invitation to visit." className="bg-white">
        <ol className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {chapters.map((ch, i) => (
            <li key={ch._key} className="grid grid-cols-[2.5rem_1fr] gap-2 border-t border-lavender pt-6">
              <span className="text-small font-semibold text-royal">{i + 1}</span>
              <div>
                <h3 className="text-h3 font-semibold">{ch.heading}</h3>
                <p className="mt-3">{ch.body?.[0]}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Content excerpts" intro="Selected copy from the structured content source.">
        <div className="grid gap-16 lg:grid-cols-12">
          <article className="lg:col-span-7">
            <h3 className="text-h1 font-semibold">{ourHome?.headline}</h3>
            <p className="mt-6 text-lead">{ourHome?.intro}</p>
            {ourHome?.sections?.slice(0, 2).map((s) => (
              <div key={s._key} className="mt-10">
                <h4 className="text-h3 font-semibold">{s.heading}</h4>
                {s.body?.map((b) => <p key={b} className="mt-4 max-w-[66ch]">{b}</p>)}
              </div>
            ))}
          </article>
          <aside className="lg:col-span-4 lg:col-start-9" aria-label="Questions and resources">
            <h3 className="text-h3 font-semibold">Questions and answers</h3>
            <p className="mt-2 text-small">{faqs.length} answers written</p>
            <div className="mt-6 divide-y divide-lavender border-y border-lavender">
              {faqs.slice(0, 4).map((f) => (
                <details key={f._id} className="group py-4">
                  <summary className="cursor-pointer font-semibold">{f.question}</summary>
                  <p className="mt-3">{ptText(f.answer)}</p>
                </details>
              ))}
            </div>
            <h3 className="mt-12 text-h3 font-semibold">Resource articles</h3>
            <ul className="mt-4 space-y-4">
              {articles.map((a) => <li key={a._id}><p className="font-semibold">{a.title}</p><p className="text-small">{a.summary}</p></li>)}
            </ul>
          </aside>
        </div>
      </Section>
    </main>
  );
}
