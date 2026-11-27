// Lab index data: one entry per experiment, in review order.
export const experiments = [
  {
    slug: "opening",
    name: "Threshold opening",
    intent: "The logo's doorway becomes the first frame of the site: an arch opens on the residence, widens to full screen and hands over to the headline.",
    variants: "A: SVG mask and GSAP. B: WebGL arch shader with a slow focal settle.",
  },
  {
    slug: "transitions",
    name: "Photographic transitions",
    intent: "Three shader transitions between real photographs, each borrowing a physical action: a sliding panel, a door opening, a step forward.",
    variants: "Directional displacement, Threshold arch, dolly. Manual and scroll-driven.",
  },
  {
    slug: "journey",
    name: "Architectural journey",
    intent: "One pinned walk from the lake to the fire table: exterior, entrance, Commons, suite, outdoors, with a different action between each room.",
    variants: "Pinned desktop sequence; stacked mobile and reduced-motion sequence.",
  },
  {
    slug: "gallery",
    name: "Spatial gallery",
    intent: "Photographs hung on a curved wall like an exhibition apse. You turn to face each one, then step through to the full image.",
    variants: "WebGL apse with DOM controls; conventional accessible gallery beneath.",
  },
  {
    slug: "editorial",
    name: "Editorial compositions",
    intent: "Three page-level compositions for internal pages: an expanding photograph, layered storytelling and a pinned room tour.",
    variants: "Expand, layers, pinned rooms.",
  },
  {
    slug: "passage/library",
    name: "Page transitions",
    intent: "Moving between rooms: the next page's photograph opens inside the Threshold arch while the shared title stays put.",
    variants: "Arch reveal between two laboratory routes using React View Transitions.",
  },
  {
    slug: "inquiry",
    name: "Inquiry interaction",
    intent: "The visit invitation unfolds from its button into a calm, large-type form, and closes the door gently on success.",
    variants: "Simulated locally. Nothing is sent or stored.",
  },
] as const;
