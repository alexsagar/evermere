import { Gallery } from "./Gallery";
import { devOnly } from "../dev-only";

export default function GalleryPage() {
  devOnly();
  return (
    <main className="pb-8">
      <section className="px-4 py-10 sm:px-8 lg:px-12">
        <h1 className="text-h2 font-semibold">Spatial gallery</h1>
        <p className="lab-note mt-3">Fifteen photographs on a curved wall. Only the photograph in front and two either side are loaded as 1024px textures; the rest stay as flat Lavender panels until you turn toward them. Drag, swipe, use the arrow keys or the buttons. The grid below works on its own.</p>
      </section>
      <Gallery />
    </main>
  );
}
