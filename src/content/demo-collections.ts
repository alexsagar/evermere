import type {
  AccommodationsQueryResult,
  CareServicesQueryResult,
  FaqsQueryResult,
  GalleryQueryResult,
  TeamQueryResult,
} from "@/sanity/types";
import { image } from "./demo";
import { photos } from "./photos";
import { pt } from "./pt";

// Amenities, activities and dining live as structured sections on their pages
// (demo-pages.ts) rather than as separate documents; see docs/content-plan.md.

const base = (type: string, order: number, title: string, summary: string) => ({
  _id: `${type}-${order}`,
  title,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  summary,
  order,
  image: null,
});

// General descriptions only. Regulated services are confirmed with the client
// before launch (docs/launch-inventory.md).
export const demoCareServices: CareServicesQueryResult = [
  {
    ...base("careService", 1, "Daily routines", "Help with the parts of the morning and evening a resident would like a hand with, at the times they choose."),
    body: pt("Some residents want no help at all. Others appreciate support with dressing, bathing or getting ready for the day. The personal plan records exactly what each person wants, and our team follows it."),
    highlights: ["Planned around personal timing", "Help only where it is wanted", "Consistent team members"],
  },
  {
    ...base("careService", 2, "Wellbeing and movement", "Classes, walks and encouragement that help residents stay strong, steady and active."),
    body: pt("Movement is part of everyday life here, from chair yoga to walks along the shore. Residents who work with their own therapists can use the Lake Room and the level paths to continue their routines."),
    highlights: ["Gentle classes most days", "Level, lit walking paths", "Support for outside therapy routines"],
  },
  {
    ...base("careService", 3, "Household support", "Housekeeping, laundry and maintenance, so the work of keeping a home is no longer yours."),
    body: pt("Suites are cleaned weekly, linens are changed and personal laundry is returned folded. Maintenance requests, from a sticking drawer to a new picture hook, are handled by our own team."),
    highlights: ["Weekly housekeeping", "Personal laundry", "In-house maintenance"],
  },
  {
    ...base("careService", 4, "Transportation", "Scheduled rides to appointments, shopping and outings around the Sound."),
    body: pt("Evermere's vehicle runs a regular schedule into town and to local appointments. Seasonal outings are planned with residents."),
    highlights: ["Scheduled appointment rides", "Weekly shopping trips", "Seasonal outings"],
  },
  {
    ...base("careService", 5, "Coordination with families and providers", "A single point of contact who keeps the people involved informed, in the way each resident prefers."),
    body: pt("With a resident's permission, we coordinate with family members, physicians and other providers, help schedule appointments and keep notes current, so nothing falls through the gaps."),
    highlights: ["Agreed family updates", "Appointment scheduling", "Regular plan reviews"],
  },
];

export const demoAccommodations: AccommodationsQueryResult = [
  {
    ...base("accommodation", 1, "Studio suite", "One generous room with space to sleep, sit and read, and a window onto the courtyard garden."),
    image: image("accommodations-studio-suite"),
    body: pt("The studio suite suits residents who spend their days in the shared rooms and want a calm, simple private space to return to."),
    squareFeet: null,
    features: ["Courtyard view", "Private bathroom with walk-in shower", "Kitchenette", "Built-in storage"],
  },
  {
    ...base("accommodation", 2, "One-bedroom suite", "A separate bedroom and sitting room, with space for a favorite sofa and a table for guests."),
    image: image("accommodations-suite-pines"),
    body: pt("A door between the bedroom and the living space makes it easy to welcome visitors, keep a hobby set up or simply enjoy a little more room."),
    squareFeet: null,
    features: ["Separate bedroom", "Sitting room for guests", "Private bathroom with walk-in shower", "Kitchenette"],
  },
  {
    ...base("accommodation", 3, "Lakeside suite", "Our largest layout, facing the water, with room for two."),
    image: image("accommodations-suite-garden-doors"),
    body: pt("Lakeside suites look across the porch to the shoreline. They are often chosen by couples and by residents who want space for a desk, a reading corner and a dining table."),
    squareFeet: null,
    features: ["Lake view", "Suitable for couples", "Space for dining and work", "Private bathroom with walk-in shower"],
  },
];

// Roles and responsibilities only. No invented names, portraits or credentials.
export const demoTeam: TeamQueryResult = [
  { _id: "team-1", order: 1, name: null, role: "Residence director", bio: "Leads the Evermere team, meets every family personally and is responsible for the quality of daily life in the house." },
  { _id: "team-2", order: 2, name: null, role: "Resident support team", bio: "Provides day-to-day help according to each personal plan, working consistently with the same residents so routines and preferences are known." },
  { _id: "team-3", order: 3, name: null, role: "Culinary team", bio: "Plans seasonal menus, cooks every meal in our kitchen and talks with residents about their preferences and dietary needs." },
  { _id: "team-4", order: 4, name: null, role: "Life enrichment coordinator", bio: "Builds the calendar with residents, organizes classes, clubs and outings, and helps new residents find their people." },
  { _id: "team-5", order: 5, name: null, role: "Housekeeping and maintenance", bio: "Keeps suites and shared rooms clean, comfortable and in good repair, and helps with setup on moving day." },
  { _id: "team-6", order: 6, name: null, role: "Family and inquiry guide", bio: "The first person most families speak with. Answers questions, arranges visits and stays in touch through the move." },
];

const galleryGroups = [
  ["exterior", "The house"],
  ["surroundings", "The lake and the trees"],
  ["interiors", "Inside"],
  ["accommodations", "Suites"],
  ["dining", "At the table"],
  ["lifestyle", "Days here"],
  ["outdoors", "Outdoors"],
] as const;

export const demoGallery: GalleryQueryResult = galleryGroups.map(([category, title], i) => ({
  _id: `gallery-${category}`,
  order: i + 1,
  title,
  slug: category,
  category,
  images: photos.filter((p) => p.category === category).map((p) => image(p.id)),
}));

const faq = (order: number, topic: string, question: string, ...answer: string[]) => ({
  _id: `faq-${order}`,
  order,
  topic,
  question,
  answer: pt(...answer),
});

export const demoFaqs: FaqsQueryResult = [
  faq(1, "Visiting", "Can I visit before deciding?",
    "Please do. Most people visit at least twice before making a decision. Visits are arranged by appointment, seven days a week, so a team member can show you around, answer questions and invite you to stay for a meal. [Arrange a visit](/contact)."),
  faq(2, "Visiting", "What should I look for during a visit?",
    "Look at how people talk to each other, whether residents seem at ease and how the house feels at an ordinary moment rather than a staged one. Our guide to [preparing for a visit](/resources/preparing-for-a-visit) includes a list of questions to bring."),
  faq(3, "Visiting", "Can I bring family members to a visit?",
    "Yes. Many visits include a prospective resident and one or more family members, and we encourage everyone involved in the decision to come."),
  faq(4, "Accommodation", "What kinds of suites are available?",
    "Evermere has studio suites, one-bedroom suites and lakeside suites. Each has a private bathroom, a kitchenette and windows onto the courtyard or the lake. [See the accommodations](/accommodations)."),
  faq(5, "Accommodation", "Can I bring my own furniture?",
    "Yes, and we encourage it. We will help you plan what fits before moving day, and our maintenance team will hang pictures and set up your furniture. If you prefer, a suite can be furnished with simple pieces instead."),
  faq(6, "Accommodation", "Can couples live together?",
    "Yes. Couples can share a larger suite. If partners need different levels of support, we will talk openly about the options."),
  faq(7, "Daily life", "Is there a set daily schedule?",
    "There is a calendar of classes, clubs, meals and outings, but residents decide how to spend their own time. Getting up late, skipping a class or spending an afternoon alone is entirely your choice."),
  faq(8, "Meals", "What are meals like?",
    "Meals are cooked from scratch in our own kitchen, with seasonal Washington ingredients. Breakfast, lunch and dinner are served in the Dining Room, and snacks and drinks are available between meals. [See how we dine](/dining)."),
  faq(9, "Meals", "Can the kitchen accommodate dietary needs?",
    "The culinary team accommodates many dietary preferences and needs. Talk with us about specific requirements so we can explain what is possible."),
  faq(10, "Activities", "What activities are offered?",
    "Art, music, gardening, lectures, book clubs, gentle exercise, walks along the shore and regular outings around the Sound. Residents help plan the calendar and are welcome to start new groups. [Discover daily life](/lifestyle)."),
  faq(11, "Family", "When can family visit?",
    "Family and friends are welcome at any reasonable hour, and they are welcome to join meals and events. A guest suite can be reserved for relatives traveling from farther away."),
  faq(12, "Family", "How will our family be kept informed?",
    "We agree with each resident how and when their family will be updated, and we follow that agreement. Families can always reach a member of our team with questions."),
  faq(13, "Belongings", "Can I bring a pet?",
    "Pet arrangements depend on the animal and the suite. Please ask, and we will talk through the details with you."),
  faq(14, "Support", "What kind of support is available?",
    "Support is planned with each resident around their routines and preferences, from help with daily tasks to household services and transportation. The specific services available are explained in a personal consultation. [Read about care and support](/care-services)."),
  faq(15, "Support", "What happens if my needs change?",
    "Personal plans are reviewed regularly and whenever something changes. We will always talk honestly with you and your family about what Evermere can provide."),
  faq(16, "Costs", "How much does it cost to live at Evermere?",
    "Costs depend on the suite and the support each person chooses, so we do not publish a single price. We are glad to explain costs clearly and in writing during a personal conversation. [Talk with our team](/contact)."),
  faq(17, "Availability", "Is there a suite available now?",
    "Availability changes throughout the year. Contact us for current availability, and we can let you know when a particular type of suite becomes free. [Ask about availability](/contact)."),
  faq(18, "Moving in", "How does moving in work?",
    "After a visit and a personal consultation, we agree on a moving date together. We help plan what to bring, set up furniture on moving day and introduce new residents to neighbors and the team. Our guide to [maintaining independence during a move](/resources/maintaining-independence) has more ideas."),
];
