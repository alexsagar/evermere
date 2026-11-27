import { getHomePage, getPage } from "@/content";
import { Journey, type Scene } from "./Journey";
import { devOnly } from "../dev-only";

export default async function JourneyPage() {
  devOnly();
  const [home, ourHome] = await Promise.all([getHomePage(), getPage("our-home")]);
  const ch = (key: string) => home.chapters?.find((c) => c.key === key);
  const sec = ourHome?.sections?.find((s) => s.key === "commons");
  // One sentence per scene: the panel must never outgrow the photograph.
  const first = (t?: string | null) => (t ?? "").split(/(?<=\.) /)[0];
  const scenes: Scene[] = [
    { id: "exterior-residence-pines", heading: ch("surroundings")?.heading ?? "", body: first(ch("surroundings")?.body?.[0]) },
    { id: "exterior-entrance-cedar", heading: ch("entrance")?.heading ?? "", body: first(ch("entrance")?.body?.[1]) },
    { id: "interiors-commons-fireplace", heading: sec?.heading ?? "", body: first(sec?.body?.[0]) },
    { id: "accommodations-suite-pines", heading: ch("spaces")?.heading ?? "", body: first(ch("spaces")?.body?.[0]) },
    { id: "outdoors-fire-table-deck", heading: ch("outdoors")?.heading ?? "", body: first(ch("outdoors")?.body?.[1]) },
  ];
  return (
    <main>
      <section className="px-4 py-10 sm:px-8 lg:px-12">
        <h1 className="mx-auto max-w-[1320px] text-h2 font-semibold">Architectural journey</h1>
        <p className="lab-note mx-auto mt-3 max-w-[1320px]">Scroll through five rooms. On large screens the stage is pinned for four screens of scroll, one per cut; on phones and with reduced motion the scenes stack and scroll naturally.</p>
      </section>
      <Journey scenes={scenes} />
      <section className="bg-cloud px-4 py-24 sm:px-8 lg:px-12">
        <p className="mx-auto max-w-[1320px] text-lead">{ch("everyday")?.heading}</p>
      </section>
    </main>
  );
}
