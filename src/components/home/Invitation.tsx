import { Inquiry } from "@/components/inquiry/Inquiry";
import { Img } from "@/components/site/Img";
import type { Chapter } from "./types";

type Settings = { heading: string; intro: string; successMessage: string; errorMessage: string; interestOptions: string[] };

/**
 * K. The invitation. The dock at first light inside the Threshold arch, the
 * last statement, and the inquiry panel itself (id="inquire", the target of
 * every inquiry link on the page). Steps explain what happens next.
 */
export function Invitation({ chapter, settings, phone, steps }: { chapter: Chapter; settings: Settings; phone?: string | null; steps: string[] }) {
  return (
    <section id="inquire" className="invitation" aria-labelledby="iv-title">
      <div className="iv-arch"><div className="relative h-full w-full"><Img image={chapter.image} sizes="(min-width: 1024px) 36vw, 90vw" /></div></div>
      <div className="iv-copy">
        <h2 id="iv-title" className="iv-title">{chapter.heading}</h2>
        {chapter.body?.map((b) => <p key={b} className="iv-lead">{b}</p>)}
        <ol className="iv-steps">
          {steps.map((s) => <li key={s}>{s}</li>)}
        </ol>
        <div className="iv-actions">
          <Inquiry settings={settings} openOnHash="inquire" phone={phone} />
          {phone && <p className="iv-phone">Prefer to talk? Call <a href={`tel:+1${phone.replace(/\D/g, "")}`} className="text-link">{phone}</a>.</p>}
        </div>
      </div>
    </section>
  );
}
