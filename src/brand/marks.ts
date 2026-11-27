// Milestone 1 logo concepts, kept for the internal review page only.
// Threshold was selected; its final geometry lives in ./logo.ts.
import { mark } from "./logo.ts";

export type Concept = {
  id: "threshold" | "continuum" | "courtyard";
  name: string;
  rationale: string;
  body: string; // primary shape, filled with the main color
  accent: string; // secondary shape, filled with the accent color
  bodyRule?: "evenodd";
};

export const concepts: Concept[] = [
  {
    id: "threshold",
    name: "Threshold",
    rationale:
      "An arched doorway seen straight on, with the door swung open into light. It reads as an invitation rather than a house: the moment of arrival, and the freedom to come and go. The heavy arch gives it architectural weight; the single open panel keeps it warm.",
    body: mark.body,
    bodyRule: "evenodd",
    accent: mark.accent,
  },
  {
    id: "continuum",
    name: "Continuum",
    rationale:
      "A monogram E built like a floor plan: one continuous wall forms the spine and the outer bars, and the middle bar stands slightly apart in Royal Blue. The structure holds the individual without enclosing them, which is the brand idea in its simplest form. Most legible at very small sizes.",
    body: "M8 6H40V14H17V34H40V42H8Z",
    accent: "M21 20H36V28H21Z",
  },
  {
    id: "courtyard",
    name: "Courtyard",
    rationale:
      "The residence in plan view: four wings around a garden, with open corners where paths lead in. The Royal Blue center is the shared courtyard everyone faces. It describes the actual architecture of the property and suggests gathering and belonging without a single literal symbol.",
    body: "M6 6H21V15H15V21H6ZM27 6H42V21H33V15H27ZM42 27V42H27V33H33V27ZM6 27H15V33H21V42H6Z",
    accent: "M19 19H29V29H19Z",
  },
];
