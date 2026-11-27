import { VariantSwitch } from "../VariantSwitch";
import { Transitions } from "./Transitions";
import { devOnly } from "../dev-only";

export default function TransitionsPage() {
  devOnly();
  return (
    <main>
      <VariantSwitch label="Transition demonstration" options={[["manual", "Manual"], ["scroll", "Scroll-driven"]]} />
      <Transitions />
    </main>
  );
}
