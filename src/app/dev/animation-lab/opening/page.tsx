import { getHomePage } from "@/content";
import { VariantSwitch } from "../VariantSwitch";
import { Opening } from "./Opening";
import { devOnly } from "../dev-only";

export default async function OpeningPage() {
  devOnly();
  const home = await getHomePage();
  const intro = home.chapters?.find((c) => c.key === "introduction");
  return (
    <main>
      <VariantSwitch label="Opening variant" options={[["mask", "A. SVG mask"], ["gl", "B. WebGL arch"]]} />
      <Opening headline={home.headline ?? ""} intro={home.intro ?? ""} next={{ heading: intro?.heading ?? "", body: intro?.body?.[0] ?? "" }} />
    </main>
  );
}
