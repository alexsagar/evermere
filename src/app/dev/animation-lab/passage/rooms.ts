import { getPage } from "@/content";
import type { PassageRoom } from "./Passage";

export async function passageRoom(slug: "library" | "suite"): Promise<PassageRoom> {
  if (slug === "library") {
    const page = await getPage("our-home");
    const point = page?.sections?.find((s) => s.key === "rooms")?.points?.find((p) => p.startsWith("The Library"));
    return { slug, title: "Our home", heading: "The Library", body: [point?.split(": ")[1]?.replace(/^./, (c) => c.toUpperCase()) ?? ""], id: "interiors-library-fireplace", next: { slug: "suite", label: "Continue to a suite" } };
  }
  const page = await getPage("accommodations");
  const sec = page?.sections?.find((s) => s.key === "personal");
  return { slug, title: "Accommodations", heading: sec?.heading ?? "", body: sec?.body ?? [], id: "accommodations-suite-doorway", next: { slug: "library", label: "Back to the Library" } };
}
