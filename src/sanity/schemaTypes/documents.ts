import { defineField, defineType, type FieldDefinition } from "sanity";

const title = defineField({ name: "title", type: "string", validation: (r) => r.required() });
const slug = defineField({
  name: "slug",
  type: "slug",
  options: { source: "title" },
  validation: (r) => r.required(),
});
const summary = defineField({ name: "summary", type: "text", rows: 3 });
const image = defineField({ name: "image", type: "figure" });
const body = defineField({ name: "body", type: "richText" });
const seo = defineField({ name: "seo", type: "seo" });
const order = defineField({ name: "order", type: "number" });

const collection = (name: string, extra: FieldDefinition[] = [], heading = name) =>
  defineType({
    name,
    title: heading,
    type: "document",
    fields: [title, slug, summary, image, ...extra, body, seo, order],
    preview: { select: { title: "title", subtitle: "slug.current", media: "image" } },
  });

export const page = collection("page", [
  defineField({ name: "headline", title: "Primary heading (H1)", type: "string" }),
  defineField({ name: "intro", type: "text", rows: 3 }),
  defineField({ name: "sections", type: "array", of: [{ type: "section" }] }),
  defineField({ name: "cta", type: "link" }),
  defineField({ name: "related", title: "Internal links", type: "array", of: [{ type: "link" }] }),
], "General page");
export const careService = collection("careService", [
  defineField({ name: "highlights", type: "array", of: [{ type: "string" }] }),
], "Care service");
export const accommodation = collection("accommodation", [
  defineField({ name: "floorPlan", type: "figure" }),
  defineField({ name: "squareFeet", type: "number" }),
  defineField({ name: "features", type: "array", of: [{ type: "string" }] }),
  defineField({ name: "gallery", type: "array", of: [{ type: "figure" }] }),
]);
export const amenity = collection("amenity");
export const activity = collection("activity");
export const dining = collection("dining", [
  defineField({ name: "gallery", type: "array", of: [{ type: "figure" }] }),
]);
export const article = collection("article", [
  defineField({ name: "publishedAt", type: "datetime" }),
], "Resource article");

export const gallery = defineType({
  name: "gallery",
  type: "document",
  fields: [
    title,
    slug,
    defineField({ name: "category", type: "string", options: { list: ["exterior", "surroundings", "interiors", "accommodations", "dining", "lifestyle", "outdoors"] } }),
    defineField({ name: "images", type: "array", of: [{ type: "figure" }] }),
    order,
  ],
});

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  preview: { select: { title: "role", subtitle: "name", media: "portrait" } },
  fields: [
    // Roles first: the demo describes responsibilities, never invented people.
    defineField({ name: "role", type: "string", validation: (r) => r.required() }),
    defineField({ name: "name", type: "string" }),
    defineField({ name: "portrait", type: "figure" }),
    defineField({ name: "bio", type: "text", rows: 4 }),
    order,
  ],
});

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  preview: { select: { title: "question", subtitle: "topic" } },
  fields: [
    defineField({ name: "question", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", type: "richText" }),
    defineField({ name: "topic", type: "string" }),
    order,
  ],
});
