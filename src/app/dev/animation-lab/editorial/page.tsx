import { getPage } from "@/content";
import type { PhotoId } from "@/content/photos";
import { Editorial, type Room } from "./Editorial";
import { devOnly } from "../dev-only";

// Photographs for the named rooms. The Studio and Lake Room have no photograph of
// the room itself, so they show the activity they are used for, not a fake interior.
const ROOM_PHOTOS: Record<string, PhotoId> = {
  "The Library": "interiors-library-fireplace",
  "The Garden Room": "interiors-garden-room",
  "The Studio": "lifestyle-watercolor-window",
  "The Dining Room": "dining-room-forest-windows",
  "The Lake Room": "lifestyle-stretch-class",
};

export default async function EditorialPage() {
  devOnly();
  const page = await getPage("our-home");
  const sec = (key: string) => page?.sections?.find((s) => s.key === key);
  const copy = (key: string) => ({ heading: sec(key)?.heading ?? "", body: sec(key)?.body ?? [] });
  const rooms: Room[] = (sec("rooms")?.points ?? []).flatMap((pt) => {
    const [name, text] = pt.split(": ");
    return ROOM_PHOTOS[name] ? [{ name, text: text.charAt(0).toUpperCase() + text.slice(1), id: ROOM_PHOTOS[name] }] : [];
  });
  return (
    <main>
      <section className="px-4 pt-10 sm:px-8 lg:px-12">
        <h1 className="text-h2 font-semibold">Editorial compositions</h1>
        <p className="lab-note mt-3">Three compositions for internal pages, using the Our home copy. Text is always in the page; motion only changes how photographs are framed.</p>
      </section>
      <Editorial architecture={copy("architecture")} design={copy("design")} roomsIntro={copy("rooms")} rooms={rooms} />
    </main>
  );
}
