import type {
  HomePageQueryResult,
  InquirySettingsQueryResult,
  Link,
  NavigationQueryResult,
  SiteSettingsQueryResult,
} from "@/sanity/types";
import { photo, type PhotoId } from "./photos";

// Fictional demonstration brand. Every business fact here is invented and listed
// in docs/launch-inventory.md for replacement before launch. 555-01xx numbers and
// example.com addresses are reserved so test inquiries never reach a real business.

export const link = (label: string, href: string): Link => ({ _type: "link", label, href });

// Same shape as the image projection in src/sanity/queries.ts.
export const image = (id: PhotoId) => {
  const p = photo(id);
  return { alt: p.alt, src: p.src, width: p.width, height: p.height, hotspot: p.focal, crop: null, caption: null, exhibition: true };
};
export type DemoImage = ReturnType<typeof image>;

export type DemoSection = {
  _key: string;
  key: string;
  heading: string;
  body: string[];
  points: string[] | null;
  cta: Link | null;
  image: DemoImage | null;
};

export const section = (
  key: string,
  heading: string,
  body: string[],
  points: string[] | null = null,
  cta: Link | null = null,
): DemoSection => ({ _key: key, key, heading, body, points, cta, image: null });

// Attaches photographs to sections by key, keeping copy and art direction separate.
export const withImages = <T extends { key: string }>(sections: T[], map: Partial<Record<string, PhotoId>>) =>
  sections.map((s) => ({ ...s, image: map[s.key] ? image(map[s.key]!) : null }));

export const inquiry = {
  visit: link("Arrange a visit", "/contact"),
  talk: link("Talk with our team", "/contact"),
  ask: link("Ask a question", "/contact"),
  availability: link("Ask about availability", "/contact"),
} as const;

export const demoSiteSettings: NonNullable<SiteSettingsQueryResult> = {
  logo: null,
  logoDark: null,
  favicon: null,
  name: "Evermere Senior Living",
  shortName: "Evermere",
  tagline: "A home on the water, built around the people in it.",
  description:
    "Evermere is a residential senior living community on the shore of a quiet lake in the Puget Sound region of Washington. Cedar, glass and deep eaves frame a two-story residence wrapped around a garden courtyard, with private suites, generous shared rooms and a lakeside path a few steps from the front door.",
  phone: "(206) 555-0142",
  email: "hello@example.com",
  address: { _type: "address", region: "WA" },
  hours: "Visits by appointment, seven days a week",
  defaultSeo: {
    title: "Evermere Senior Living | Lakeside Senior Living in Washington",
    description:
      "A residential senior living community on a quiet Washington lake. Private suites, shared rooms, a garden courtyard and personal support. Arrange a visit.",
    socialTitle: "Evermere Senior Living",
    socialDescription: "A home on the water, built around the people in it. Come and see Evermere for yourself.",
    image: null,
  },
};

const nav = (items: [string, string][]) => items.map(([label, href]) => ({ _key: href, ...link(label, href) }));

export const demoNavigation: NonNullable<NavigationQueryResult> = {
  primary: nav([
    ["Our home", "/our-home"],
    ["Care and support", "/care-services"],
    ["Lifestyle", "/lifestyle"],
    ["About", "/about"],
    ["Gallery", "/gallery"],
  ]),
  footer: nav([
    ["Accommodations", "/accommodations"],
    ["Dining", "/dining"],
    ["About Evermere", "/about"],
    ["Our team", "/our-team"],
    ["Amenities", "/amenities"],
    ["Resources", "/resources"],
    ["Questions and answers", "/faq"],
    ["Contact", "/contact"],
    ["Privacy", "/privacy"],
    ["Accessibility", "/accessibility"],
  ]),
  cta: inquiry.visit,
};

export const demoInquirySettings: NonNullable<InquirySettingsQueryResult> = {
  heading: "Start a conversation",
  intro:
    "Tell us a little about how we can help. A member of our team will call or write back within one business day.",
  successMessage:
    "Thank you. Your message has reached the Evermere team, and we will be in touch within one business day.",
  errorMessage:
    "Something went wrong on our side.",
  interestOptions: [
    "Arranging a visit",
    "Private suites and availability",
    "Daily life and activities",
    "Support and personal routines",
    "Costs and what is included",
    "Something else",
  ],
  nextSteps: [
    "Send a few details, or call us. There is no form to fill in beyond your name and how to reach you.",
    "A member of our team replies within one business day to answer questions and suggest a time to visit.",
    "Come for coffee or lunch, see a suite and the shared rooms, and take as long as you like.",
  ],
};

// Homepage narrative: a sequence of chapters that later supports a scroll-driven
// photographic journey. Chapter keys match docs/photography-plan.md.
export const demoHomePage: NonNullable<HomePageQueryResult> = {
  headline: "Morning light on the lake, and the rest of the day is yours.",
  intro:
    "Evermere is a residential senior living community on a quiet Washington shoreline. Private suites, warm shared rooms and a team who knows your name, in a home designed for the life you still want to live.",
  heroImages: [image("surroundings-lake-mist-shore"), image("exterior-residence-pines"), image("interiors-commons-fireplace")],
  chapters: withImages([
    section("arrival", "There is a moment, coming up the drive, when the lake appears.", [
      "The road bends through a stand of Douglas fir, the trees open, and the water is there: still, silver in the morning, gold by evening. Most people who visit Evermere remember that moment first.",
      "We built the home around it. Every shared room faces the courtyard or the lake, and most suites see one or the other.",
    ]),
    section("introduction", "A home first, and a community because of it.", [
      "Evermere is a residence for older adults who want their own space, their own routines and the ease of good company close by. It is not a hospital and it does not look like one. It is a place to live.",
      "Residents keep their furniture, their mornings and their opinions. What changes is the work they no longer have to do alone: the cooking, the upkeep, the long winter evenings, the worry of a family three hours away.",
    ], null, link("Learn about Evermere", "/about")),
    section("surroundings", "Cedar, glass and a long view of the water.", [
      "The residence is a two-story Northwest contemporary building in cedar and glass, with deep eaves that keep the rain off a covered porch running the length of the lakeside.",
      "A level path follows the shore past benches and a small dock. Behind the house, the trees hold the quiet in.",
    ], null, link("Explore our home", "/our-home")),
    section("entrance", "Come in. The fire is already lit.", [
      "The front door opens into the Commons: a tall living room with a stone fireplace, deep chairs and windows onto the courtyard. It is where people meet before lunch, read the paper and wave to visitors.",
      "There is no front desk to check in at. Someone will simply say hello.",
    ]),
    section("spaces", "Rooms for being alone, and rooms for being together.", [
      "Private suites are quiet, light and yours to furnish. Each has its own bathroom, generous closets and windows that open.",
      "A few steps away are the Library, the Garden Room, the Studio and the Dining Room. Some days you will want all of them. Some days you will want your own door and a good book. Both are right.",
    ], null, link("See the accommodations", "/accommodations")),
    section("everyday", "The shape of the day is up to you.", [
      "Coffee on the porch, a walk along the shore, a watercolor class in the Studio, an afternoon nap, a card game that runs long. The calendar is full, and none of it is required.",
      "Residents help shape what happens here, from the book club reading list to the next trip into town.",
    ], null, link("Discover daily life", "/lifestyle")),
    section("dining", "A long table, a seasonal menu and time to talk.", [
      "Meals are cooked in our own kitchen with Washington produce, seafood and orchard fruit when the season allows. The Dining Room looks across the courtyard, and conversation tends to outlast dessert.",
      "Prefer breakfast in your suite or a later lunch? Tell the kitchen. Family is always welcome at the table.",
    ], null, link("See how we dine", "/dining")),
    section("support", "Support that fits around your life, not the other way around.", [
      "Everyone at Evermere has a personal plan, written together with the resident and, when they wish, their family. It describes the help someone wants, the routines that matter to them and the things they would rather keep doing themselves.",
      "The plan changes when life does. Our team is here day and night, and we explain exactly what support is available during your first conversation with us.",
    ], null, link("Read about care and support", "/care-services")),
    section("outdoors", "Weather is not a reason to stay inside.", [
      "The courtyard garden has raised planting beds at standing and seated heights, a covered walk and a fire table for cool evenings. In summer, the dock is the best seat in the house.",
      "Paths are level, lit and edged for steady walking, and there is always a bench within sight.",
    ], null, link("View amenities", "/amenities")),
    section("family", "Families are part of the household.", [
      "Children and grandchildren visit when they like, stay for dinner, bring the dog and join the summer picnic. A guest suite can be reserved for family traveling from farther away.",
      "We keep families informed in the way each resident prefers, and we welcome their questions at any hour.",
    ], null, link("Meet our team", "/our-team")),
    section("gallery", "See it for yourself, in every season.", [
      "Photographs can show you the light, the rooms and the view. They cannot show you how it feels to sit by the fire on a wet November afternoon. For that, you will have to visit.",
    ], null, link("Browse the gallery", "/gallery")),
    section("invitation", "Come for coffee. Stay as long as you like.", [
      "The best way to understand Evermere is to spend an hour here. Walk the halls, see a suite, have lunch with us and ask every question you have. There is no obligation, and nothing to sign.",
    ], null, inquiry.visit),
  ], {
    arrival: "surroundings-lake-mist-shore",
    introduction: "surroundings-lake-dawn-pines",
    surroundings: "exterior-residence-pines",
    entrance: "exterior-entrance-cedar",
    spaces: "accommodations-studio-suite",
    everyday: "lifestyle-watercolor-window",
    dining: "dining-room-forest-windows",
    support: "outdoors-walk-path-together",
    outdoors: "outdoors-timber-walkway",
    family: "lifestyle-grandchild-photos",
    gallery: "outdoors-lakeside-path",
    invitation: "outdoors-chairs-dock",
  }),
  cta: inquiry.visit,
  seo: {
    title: "Evermere Senior Living | Lakeside Senior Living in Washington",
    description:
      "A residential senior living community on a quiet Washington lake, with private suites, seasonal dining and personal support. Arrange a visit to Evermere.",
    socialTitle: "Evermere Senior Living, on the water in Washington",
    socialDescription: "Private suites, a garden courtyard and a long view of the lake. Come for coffee and see Evermere for yourself.",
    image: null,
  },
};
