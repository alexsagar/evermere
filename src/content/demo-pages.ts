import type { PagesQueryResult } from "@/sanity/types";
import { image, inquiry, link, section, withImages } from "./demo";
import type { PhotoId } from "./photos";

type Page = PagesQueryResult[number];

const page = (
  slug: string,
  p: Omit<Page, "_id" | "slug" | "related" | "seo" | "image"> & {
    seo: [title: string, description: string, socialTitle: string, socialDescription: string];
    related: [string, string][];
  },
): Page => ({
  ...p,
  image: null,
  _id: `page-${slug}`,
  slug,
  related: p.related.map(([label, href]) => ({ _key: href, ...link(label, href) })),
  seo: { title: p.seo[0], description: p.seo[1], socialTitle: p.seo[2], socialDescription: p.seo[3], image: null },
});

// Page-specific narratives. Section order is editorial; each page's layout is
// designed separately in the frontend.
const pages: PagesQueryResult = [
  page("about", {
    title: "About Evermere",
    headline: "We started with a simple question: where would we want to live?",
    intro:
      "Evermere was imagined as the kind of place its founders would choose for their own parents, and one day for themselves. Small enough to know everyone, comfortable enough to feel like home, and respectful of the fact that the people who live here have spent a lifetime making their own decisions.",
    sections: [
      section("belief", "What we believe", [
        "Growing older does not make anyone less themselves. Our residents arrive with careers, families, convictions, favorite chairs and strong views on how coffee should be made. A good home makes room for all of it.",
        "So we try to do the opposite of an institution. We learn how each person likes to live, then shape our help around that, rather than asking people to fit a schedule written for someone else.",
      ]),
      section("name", "The name", [
        "A mere is an old English word for a lake. Evermere is a promise about this particular place: the water will be here every morning, and so will we.",
      ]),
      section("principles", "How we work", [
        "These principles guide decisions large and small, from how we design a suite to how we answer the phone.",
      ], [
        "Choice comes first. Residents decide how they spend their days, and we ask before we assume.",
        "Independence is something to protect. We help with what someone wants help with and step back from the rest.",
        "Belonging is built in small moments: a name remembered, a seat saved, a birthday noticed.",
        "Families are partners. We listen to them, keep them informed in the way each resident prefers and welcome them at any time.",
        "We are honest, especially when the answer is complicated.",
      ]),
      section("place", "A residence, not a campus", [
        "Evermere is one home on one shoreline. There are no towers, no long corridors with numbered doors and no parking lots between you and the water. The building is low, warm and easy to find your way around.",
      ], null, link("Explore our home", "/our-home")),
      section("people", "The people who make it work", [
        "A home is only as good as the people looking after it. Our team includes resident support, culinary, life enrichment, housekeeping and maintenance staff, and everyone is expected to know residents by name.",
      ], null, link("Meet our team", "/our-team")),
    ],
    cta: inquiry.visit,
    related: [["Our home", "/our-home"], ["Our team", "/our-team"], ["Care and support", "/care-services"]],
    seo: [
      "About Evermere Senior Living | Our Story and Values",
      "Evermere is a residential senior living community in Washington built on choice, independence and belonging. Learn what guides how we live and work.",
      "Where would you want to live?",
      "The story and values behind Evermere Senior Living, a lakeside home in Washington.",
    ],
  }),

  page("our-home", {
    title: "Our home",
    headline: "A Northwest house, built around a garden and facing the water.",
    intro:
      "Evermere sits on a gentle rise above a quiet lake, ringed by Douglas fir and western red cedar. The building borrows from the region's own architecture: low rooflines, deep eaves, honest materials and big windows that bring the weather in without letting it reach you.",
    sections: [
      section("architecture", "Cedar, stone and a great deal of glass", [
        "The residence is two stories of cedar, dark stone and glass, arranged in a U around a sheltered courtyard. The open side of the U faces the lake, so the garden and the water are visible from almost every shared room.",
        "Inside, there is warm oak underfoot, plaster walls in soft neutral tones and ceilings that rise where people gather. Corridors are short and full of daylight, with windows at each turn so it is always easy to know where you are.",
      ]),
      section("commons", "The Commons", [
        "Just inside the front door, the Commons is the living room of the house. A stone fireplace anchors one end, a grand piano the other, and the long wall of windows looks onto the courtyard. It is the natural place to meet a friend, wait for a ride or simply sit somewhere with people nearby.",
      ]),
      section("rooms", "Rooms with a purpose", [
        "Around the Commons are smaller rooms, each made for something specific.",
      ], [
        "The Library: quiet, carpeted and lined with shelves, with reading chairs by the window and a table for puzzles that take a week.",
        "The Garden Room: a glass-walled sunroom for plants, morning coffee and afternoons when the sun finally comes out.",
        "The Studio: a bright workroom with sinks, easels and long tables for painting, clay, flower arranging and repair projects.",
        "The Dining Room: a high-ceilinged room with views across the courtyard, set with tables for two, four and more.",
        "The Lake Room: a flexible space for exercise classes, lectures, films and family celebrations.",
      ]),
      section("courtyard", "The courtyard", [
        "The heart of Evermere is outdoors. The courtyard garden has raised beds at standing and seated heights, a covered walkway on three sides and a fire table for the cool Northwest evenings. It is fully enclosed, level and planted to look good in every season, from spring tulips to winter grasses.",
      ], null, link("View amenities", "/amenities")),
      section("shore", "The shore", [
        "A level, lit path leads from the porch to the water and follows the shoreline past benches and a small dock. Herons work the shallows in the morning. In summer, residents fish, sketch, read and watch the light change on the far bank.",
      ]),
      section("design", "Designed for ease, without looking like it", [
        "Doorways are wide, floors are level and handrails are built into the woodwork rather than bolted on. Lighting is warm and even, with no harsh glare. These details make the house easier to live in for everyone, and most visitors never notice them.",
      ]),
    ],
    cta: inquiry.visit,
    related: [["Accommodations", "/accommodations"], ["Amenities", "/amenities"], ["Gallery", "/gallery"]],
    seo: [
      "Our Home | Lakeside Residence and Courtyard | Evermere",
      "Explore Evermere's cedar-and-glass residence, garden courtyard, shared rooms and lakeside path in the Puget Sound region of Washington.",
      "A Northwest house facing the water",
      "Cedar, stone, a garden courtyard and a lakeside path. Step inside Evermere.",
    ],
  }),

  page("accommodations", {
    title: "Accommodations",
    headline: "Your own front door, your own furniture, your own view.",
    intro:
      "Every Evermere suite is a private home within the larger house. Bring the furniture you love, hang your own pictures and close the door when you want to. We provide the light, the space and the upkeep.",
    sections: [
      section("suites", "Three kinds of suite", [
        "Suites come in three layouts, so you can choose the amount of space that suits the way you live. Exact sizes, layouts and current availability are shared during a personal conversation, because they vary from suite to suite.",
      ], null, inquiry.availability),
      section("included", "In every suite", [
        "Each suite is designed to feel residential rather than clinical, with practical features that make daily life easier.",
      ], [
        "A private bathroom with a walk-in shower, seat and slip-resistant floor.",
        "Windows that open, with views of the courtyard or the lake.",
        "Generous closets and built-in storage.",
        "Individual heating and cooling controls.",
        "A kitchenette with a small refrigerator and space for a kettle.",
        "Telephone, cable and internet connections.",
        "Weekly housekeeping and linen service.",
      ]),
      section("personal", "Make it yours", [
        "The most important furniture in any suite is the furniture you bring. We will help you plan what fits before moving day, and our maintenance team will hang pictures, mount shelves and set up lamps so everything is where you want it.",
        "If you would prefer not to bring everything, we can furnish a suite with simple pieces that you can replace over time.",
      ], null, link("Read: helping a loved one feel at home", "/resources/feeling-at-home")),
      section("couples", "For couples", [
        "Couples can share a larger suite together. If partners need different levels of support, we will talk honestly about what is possible so they can stay close.",
      ]),
      section("guests", "A room for family", [
        "Evermere has a guest suite that families can reserve when they visit from out of town, so a long journey can end with a good night's sleep down the hall.",
      ]),
    ],
    cta: inquiry.availability,
    related: [["Our home", "/our-home"], ["Gallery", "/gallery"], ["Questions and answers", "/faq"]],
    seo: [
      "Private Suites | Senior Living Accommodations | Evermere",
      "Studio, one-bedroom and lakeside suites at Evermere, each with a private bathroom and room for your own furniture. Ask about availability.",
      "Your own front door and your own view",
      "Private suites at Evermere, made yours with the furniture and pictures you love.",
    ],
  }),

  page("care-services", {
    title: "Care and support",
    headline: "Help with the parts of the day you choose, and respect for the rest.",
    intro:
      "Support at Evermere begins with a conversation, not a checklist. We want to understand how someone likes to live, what they enjoy doing for themselves and where a little help would make life easier. Then we write a personal plan together and keep it current.",
    sections: [
      section("approach", "Our approach", [
        "Good support is mostly invisible. It looks like a morning that starts at the right time, a favorite sweater that is clean when it is wanted and a friendly check-in that does not feel like an inspection.",
        "We pay attention to the details that make someone feel like themselves, and we step back from anything a resident would rather manage alone.",
      ]),
      section("plan", "A personal plan, written together", [
        "Before moving in, each resident meets with our team to talk through routines, preferences and any help they would like. With the resident's permission, family members are welcome to join. The result is a written plan that every team member follows.",
        "Plans are reviewed regularly and whenever something changes. Nobody's support is decided without them.",
      ]),
      section("services", "How we can help", [
        "The support available at Evermere is described below in general terms. The specific services offered, and how they are provided, are explained in full during a personal consultation so that every family has accurate information for their situation.",
      ], null, inquiry.talk),
      section("coordination", "Working with your own providers", [
        "Many residents keep their own physicians, therapists and specialists. We help with scheduling and transportation to appointments, and with the resident's permission we stay in touch with the people involved in their health.",
      ]),
      section("honesty", "Straight answers", [
        "Every person's needs are different, and they can change over time. If a question cannot be answered on a web page, we would rather talk it through with you properly. Call us, write to us or ask during a visit.",
      ], null, inquiry.ask),
    ],
    cta: inquiry.talk,
    related: [["Our team", "/our-team"], ["Questions and answers", "/faq"], ["Read: maintaining independence", "/resources/maintaining-independence"]],
    seo: [
      "Care and Support | Personal Plans | Evermere Senior Living",
      "Personal support at Evermere is planned with each resident, around their routines and preferences. Talk with our team about individual needs.",
      "Support that fits around your life",
      "At Evermere, support starts with a conversation and a plan written together.",
    ],
  }),

  page("lifestyle", {
    title: "Lifestyle",
    headline: "A full calendar, and the freedom to ignore it.",
    intro:
      "Life at Evermere is as social or as private as each resident wants it to be. There is always something happening, from morning stretch class to an evening concert in the Commons, and there is never any pressure to join in.",
    sections: [
      section("rhythm", "The rhythm of a day", [
        "Mornings start slowly, with coffee in the Garden Room and the newspaper by the fire. Late morning is for classes, walks and appointments. After lunch, the house quiets for an hour before the afternoon brings clubs, workshops and visitors. Evenings belong to dinner, conversation and whatever is on in the Lake Room.",
        "That is the general shape. The details belong to the residents.",
      ]),
      section("interests", "Keep doing what you love", [
        "Our life enrichment coordinator builds the calendar with residents, not for them. If enough people want a watercolor group, a Spanish conversation table or a woodworking project, we make room for it.",
      ], [
        "Art and making: painting, clay, flower arranging and small repair projects in the Studio.",
        "Mind: book club, lectures, current-events discussion and a language table.",
        "Movement: stretching, chair yoga, walking groups along the shore and gentle strength classes.",
        "Music: live performances in the Commons, sing-alongs and listening sessions.",
        "Garden: seasonal planting in the courtyard beds and a cutting garden for the dining tables.",
      ]),
      section("outings", "Beyond the front door", [
        "Evermere's own vehicle takes residents into town for shopping, appointments, concerts and lunches out. Seasonal trips visit gardens, ferries, farm stands and museums around the Sound.",
      ]),
      section("contribute", "A chance to contribute", [
        "Many residents spent decades teaching, building, nursing, managing and raising families. They have a great deal to offer. Residents lead clubs, teach classes, welcome new neighbors and help plan events, and their ideas shape the calendar.",
      ]),
      section("quiet", "And room for quiet", [
        "Not everyone wants a busy day, and that is fine. A good book in a sunny window, a nap after lunch or a long phone call with a grandchild are all part of life here, too.",
      ]),
    ],
    cta: inquiry.visit,
    related: [["Dining", "/dining"], ["Amenities", "/amenities"], ["Gallery", "/gallery"]],
    seo: [
      "Lifestyle and Activities | Daily Life at Evermere",
      "Classes, clubs, music, gardening and outings around the Sound, shaped by residents and never required. Discover daily life at Evermere.",
      "A full calendar, and the freedom to ignore it",
      "Art, music, gardening, lectures and lakeside walks, chosen by the people who live here.",
    ],
  }),

  page("amenities", {
    title: "Amenities",
    headline: "Everything close by, so the day is easier to enjoy.",
    intro:
      "The practical comforts at Evermere are designed to remove small burdens and leave more time for the things that matter. Most are included in daily life here; a personal conversation is the best way to learn exactly what is included for each suite.",
    sections: [
      section("house", "Around the house", [
        "Shared rooms are open throughout the day and evening, and residents are welcome to use them with their guests.",
      ], [
        "The Commons, with fireplace and grand piano.",
        "The Library, with large-print books, audiobooks and a puzzle table.",
        "The Garden Room, a sunroom for plants and morning coffee.",
        "The Studio, for art and craft projects.",
        "The Lake Room, for classes, films and private family events.",
        "A salon for hair appointments and nail care.",
        "A private dining room for family celebrations.",
      ]),
      section("outdoor", "Outdoors", [
        "The grounds are level, lit and designed for steady walking in all seasons.",
      ], [
        "An enclosed courtyard garden with raised planting beds.",
        "A covered walkway and fire table.",
        "A lakeside path with benches and a small dock.",
        "A covered porch along the lake side of the house.",
      ]),
      section("services", "Everyday services", [
        "These services take care of the routine work of running a household.",
      ], [
        "Weekly housekeeping and linen service.",
        "Personal laundry service.",
        "Maintenance, including picture hanging and furniture setup on moving day.",
        "Scheduled transportation for shopping, appointments and outings.",
        "Wireless internet throughout the house.",
        "Mail and package handling.",
      ]),
    ],
    cta: inquiry.ask,
    related: [["Our home", "/our-home"], ["Lifestyle", "/lifestyle"], ["Accommodations", "/accommodations"]],
    seo: [
      "Amenities | Courtyard, Lakeside Path and Services | Evermere",
      "Shared rooms, an enclosed garden courtyard, a lakeside path, housekeeping, laundry and transportation at Evermere Senior Living in Washington.",
      "Everything close by",
      "The comforts and services that make daily life at Evermere easier.",
    ],
  }),

  page("dining", {
    title: "Dining",
    headline: "Good food, cooked here, and a table worth lingering at.",
    intro:
      "Meals are one of the great pleasures of a day, and we treat them that way. Our kitchen cooks from scratch, follows the Washington seasons and serves residents in a dining room with a view across the courtyard.",
    sections: [
      section("kitchen", "From our own kitchen", [
        "The culinary team writes menus around what is good right now: spring asparagus, summer berries, Pacific salmon, autumn apples from the orchards east of the mountains. Familiar favorites stay on the menu all year, because some days only a good soup and a grilled cheese sandwich will do.",
      ]),
      section("day", "Through the day", [
        "Breakfast is relaxed and served over a long morning. Lunch is the social meal of the day. Dinner is calmer, with candles on the tables in winter and the doors open to the courtyard in summer. Coffee, tea, fruit and snacks are available between meals.",
      ]),
      section("choice", "Your table, your way", [
        "Residents choose where and when to eat. Join friends at a large table, sit with one companion by the window, or take breakfast in your suite on a slow morning.",
        "The kitchen accommodates dietary preferences and needs, and the chef is happy to talk through them personally.",
      ]),
      section("together", "Meals with family", [
        "Families and friends are always welcome to join for a meal. The private dining room can be reserved for birthdays, anniversaries and holiday gatherings, with a menu planned together with the chef.",
      ]),
      section("seasons", "Celebrating the year", [
        "The calendar is marked by food: a summer picnic on the lawn, a harvest dinner, holiday baking in the Studio and a crab feed when the season allows. These are some of the most popular days of the year.",
      ]),
    ],
    cta: link("Join us for lunch", "/contact"),
    related: [["Lifestyle", "/lifestyle"], ["Our home", "/our-home"], ["Questions and answers", "/faq"]],
    seo: [
      "Dining | Seasonal Meals Cooked Here | Evermere",
      "Seasonal Washington menus cooked from scratch, a dining room with a courtyard view and meals with family. See how we dine at Evermere.",
      "A table worth lingering at",
      "Seasonal meals cooked in our own kitchen, with family always welcome. Join us for lunch.",
    ],
  }),

  page("gallery", {
    title: "Gallery",
    headline: "A year at Evermere, in pictures.",
    intro:
      "The house, the courtyard, the water and the everyday moments in between. Browse by subject, then come and see it in person.",
    sections: [
      section("exterior", "The house and the shore", ["The cedar-and-glass residence, the porch and the lakeside path through the seasons."]),
      section("interior", "Inside", ["The Commons, the Library, the Garden Room and the light in the corridors."]),
      section("suites", "Suites", ["Private suites furnished by the people who live in them."]),
      section("dining", "At the table", ["The Dining Room, the kitchen and meals shared with friends and family."]),
      section("life", "Days here", ["Classes in the Studio, work in the garden and long conversations by the fire."]),
    ],
    cta: inquiry.visit,
    related: [["Our home", "/our-home"], ["Accommodations", "/accommodations"], ["Lifestyle", "/lifestyle"]],
    seo: [
      "Gallery | Photos of Evermere Senior Living",
      "Photographs of Evermere's lakeside residence, private suites, shared rooms, dining and daily life in Washington.",
      "A year at Evermere, in pictures",
      "See the house, the courtyard and the lake, then come and visit in person.",
    ],
  }),

  page("our-team", {
    title: "Our team",
    headline: "The people who know your name, and how you take your coffee.",
    intro:
      "The Evermere team is small by design. Staff work in consistent roles with the same residents over time, so relationships can grow and nothing important has to be explained twice.",
    sections: [
      section("roles", "Who does what", [
        "Each part of the team has a clear role, and everyone shares the same responsibility: to treat Evermere as the residents' home and to act like guests in it.",
      ]),
      section("hiring", "How we choose people", [
        "We hire for warmth, judgment and reliability, then train for everything else. Every team member is introduced to residents personally and learns each person's plan and preferences before working with them.",
      ]),
      section("families", "A direct line for families", [
        "Families can always reach a member of our team. We agree with each resident how and when their family will be updated, and we follow that agreement carefully.",
      ], null, inquiry.talk),
    ],
    cta: inquiry.talk,
    related: [["Care and support", "/care-services"], ["About Evermere", "/about"], ["Contact", "/contact"]],
    seo: [
      "Our Team | The People of Evermere Senior Living",
      "Meet the roles behind Evermere: residence leadership, resident support, culinary, life enrichment and housekeeping teams who know every resident by name.",
      "The people who know your name",
      "A small, consistent team that treats Evermere as the residents' home.",
    ],
  }),

  page("resources", {
    title: "Resources",
    headline: "Practical guidance for one of life's bigger decisions.",
    intro:
      "Choosing a senior living community, for yourself or for someone you love, raises a great many questions. These guides are written to help you ask good ones, wherever you decide to live.",
    sections: [
      section("guides", "Guides for residents and families", [
        "Each guide covers a stage of the decision, from first research to the weeks after moving day.",
      ]),
      section("conversation", "When you are ready to talk", [
        "Every situation is different, and a guide can only go so far. Our team is glad to talk through your questions, with no obligation.",
      ], null, inquiry.talk),
    ],
    cta: inquiry.talk,
    related: [["Questions and answers", "/faq"], ["Contact", "/contact"]],
    seo: [
      "Resources | Guides to Choosing Senior Living | Evermere",
      "Practical guides for older adults and families: choosing a community, preparing for a visit, staying independent and settling into a new home.",
      "Guidance for a big decision",
      "Practical, honest guides to choosing and moving into senior living.",
    ],
  }),

  page("faq", {
    title: "Questions and answers",
    headline: "Questions people ask us, answered plainly.",
    intro:
      "If your question is not here, or the answer depends on your circumstances, the quickest route is a conversation with our team.",
    sections: [],
    cta: inquiry.ask,
    related: [["Resources", "/resources"], ["Contact", "/contact"], ["Accommodations", "/accommodations"]],
    seo: [
      "Questions and Answers | Evermere Senior Living",
      "Answers about visiting Evermere, private suites, meals, activities, family involvement, moving in and how to ask about costs and availability.",
      "Questions people ask us",
      "Plain answers about life, suites, meals and moving in at Evermere.",
    ],
  }),

  page("contact", {
    title: "Contact",
    headline: "Let's talk, whenever you are ready.",
    intro:
      "Whether you are starting to research, comparing communities or ready to visit, we are glad to help. Call, write or send a message below, and a member of our team will reply within one business day.",
    sections: [
      section("process", "What happens next", [
        "There is no pressure and no obligation at any stage. Most families follow a path like this one.",
      ], [
        "A first conversation by phone or email, to understand who you are asking for and what matters most.",
        "A visit to Evermere, with time to see suites and shared rooms, meet the team and stay for a meal.",
        "A personal consultation to talk through routines, support, costs and timing.",
        "When you are ready, a plan for moving day, made together.",
      ]),
      section("visit", "Visiting Evermere", [
        "Visits are arranged by appointment, seven days a week, so a team member can give you their full attention. You are welcome to bring family, to stay for lunch and to come back as many times as you like.",
      ]),
      section("privacy", "A note on privacy", [
        "Please do not send medical information through this form. We will discuss personal needs in a private conversation.",
      ], null, link("Read our privacy notice", "/privacy")),
    ],
    cta: inquiry.visit,
    related: [["Questions and answers", "/faq"], ["Read: preparing for a visit", "/resources/preparing-for-a-visit"]],
    seo: [
      "Contact Evermere | Arrange a Visit or Ask a Question",
      "Call (206) 555-0142 or send a message to arrange a visit, ask about suites and availability or talk with the Evermere team.",
      "Let's talk, whenever you are ready",
      "Arrange a visit or ask a question. The Evermere team replies within one business day.",
    ],
  }),

  page("privacy", {
    title: "Privacy notice",
    headline: "Privacy notice",
    intro:
      "This notice explains what information Evermere collects through this website, why we collect it and how it is handled. It is a demonstration notice and will be reviewed before the site is published.",
    sections: [
      section("collect", "Information we collect", [
        "The inquiry form asks for your name and email address and, if you choose, a telephone number, a topic, how you prefer to be contacted and a short message. Please do not share medical, insurance or financial information through the website.",
        "Like most websites, our servers may record basic technical information, such as browser type and the pages requested, to keep the site secure and working.",
      ]),
      section("use", "How we use it", [
        "We use inquiry details only to respond to you, to arrange visits you request and to follow up on your questions. We do not sell personal information, and we do not use it for unrelated marketing.",
      ]),
      section("share", "Who we share it with", [
        "During this preview, the inquiry form is a demonstration: the website checks each message for completeness and then discards it, so nothing is sent or stored. When it goes live, inquiries will be delivered to our team through a secure email service. We will share information with service providers only as needed to operate the website and respond to you, or where the law requires it.",
      ]),
      section("choices", "Your choices", [
        "You may ask us what information we hold about you, ask us to correct it or ask us to delete it. Contact us at privacy@example.com or (206) 555-0142.",
      ]),
      section("changes", "Changes to this notice", [
        "We will update this notice if our practices change and will show the date of the latest revision on this page.",
      ]),
    ],
    cta: null,
    related: [["Accessibility", "/accessibility"], ["Contact", "/contact"]],
    seo: [
      "Privacy Notice | Evermere Senior Living",
      "How Evermere collects, uses and protects the information you share through this website.",
      "Privacy notice",
      "How Evermere handles information shared through this website.",
    ],
  }),

  page("accessibility", {
    title: "Accessibility",
    headline: "Accessibility",
    intro:
      "We want everyone to be able to use this website comfortably, including people who use screen readers, keyboard navigation, magnification or captions.",
    sections: [
      section("standard", "Our goal", [
        "This website is designed to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. We test with automated tools and keyboard navigation, screen-reader testing is under way, and we review new content before it is published.",
      ]),
      section("features", "What we have done", [], [
        "Text and interface colors meet recommended contrast levels.",
        "Every page can be used with a keyboard, with a clearly visible focus indicator.",
        "Images have text descriptions.",
        "Motion is reduced or removed when your device asks for reduced motion.",
        "Text can be enlarged without loss of content.",
      ]),
      section("feedback", "Tell us if something is not working", [
        "If any part of this website is difficult to use, please let us know at accessibility@example.com or (206) 555-0142. We will respond, and we will provide the information you need in another format.",
      ]),
    ],
    cta: null,
    related: [["Privacy notice", "/privacy"], ["Contact", "/contact"]],
    seo: [
      "Accessibility | Evermere Senior Living",
      "Evermere's commitment to an accessible website, what we have done and how to tell us about a problem.",
      "Accessibility",
      "Our commitment to a website everyone can use.",
    ],
  }),
];

// Art direction: opening photograph and section photographs per page.
const art: Record<string, { hero?: PhotoId; sections?: Partial<Record<string, PhotoId>> }> = {
  about: { hero: "outdoors-couple-by-water", sections: { belief: "lifestyle-conversation-plants", place: "exterior-residence-garden-side", people: "outdoors-walk-path-together" } },
  "our-home": {
    hero: "exterior-residence-evening-pines",
    sections: { architecture: "exterior-residence-stone-cedar", commons: "interiors-commons-fireplace", rooms: "interiors-library-fireplace", courtyard: "outdoors-timber-walkway", shore: "outdoors-lakeside-path", design: "exterior-cedar-slats-sky" },
  },
  accommodations: { hero: "accommodations-suite-doorway", sections: { included: "accommodations-suite-bedroom-bath", personal: "accommodations-suite-forest-mirror", couples: "lifestyle-cards-couple" } },
  "care-services": { hero: "outdoors-walk-path-together", sections: { approach: "lifestyle-conversation-plants", plan: "lifestyle-reading-armchair", coordination: "lifestyle-stretch-class" } },
  lifestyle: { hero: "lifestyle-watercolor-window", sections: { rhythm: "lifestyle-coffee-window", interests: "lifestyle-garden-harvest", outings: "outdoors-walk-lakeside-trees", contribute: "lifestyle-cards-friends", quiet: "lifestyle-reading-window" } },
  amenities: { hero: "exterior-slatted-garden-walk", sections: { house: "interiors-lounge-clerestory", outdoor: "outdoors-bench-misty-lake", services: "dining-room-garden-light" } },
  dining: { hero: "dining-room-forest-windows", sections: { kitchen: "dining-salmon-plate", day: "dining-morning-coffee", choice: "dining-breakfast-table", together: "dining-couple-toast", seasons: "dining-summer-salad" } },
  gallery: { hero: "surroundings-dock-first-light", sections: { exterior: "exterior-residence-pines", interior: "interiors-commons-tall-windows", suites: "accommodations-suite-pines", dining: "dining-seasonal-plate", life: "lifestyle-piano" } },
  "our-team": { hero: "interiors-commons-tall-windows", sections: { families: "lifestyle-grandchild-photos" } },
  resources: { hero: "outdoors-bench-misty-lake" },
  faq: { hero: "lifestyle-reading-smile" },
  privacy: {},
  accessibility: {},
  contact: { hero: "outdoors-chairs-dock", sections: { visit: "interiors-front-door-open" } },
};

export const demoPages: PagesQueryResult = pages.map((p) => {
  const a = art[p.slug ?? ""];
  if (!a) return p;
  return { ...p, image: a.hero ? image(a.hero) : null, sections: p.sections && withImages(p.sections.map((s) => ({ ...s, key: s.key ?? "" })), a.sections ?? {}) };
});
