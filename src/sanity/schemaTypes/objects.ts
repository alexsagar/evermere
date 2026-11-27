import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Search title", description: "Use the approved page title. The private demonstration always remains noindex.", type: "string", validation: (r) => r.max(70) }),
    defineField({ name: "description", type: "text", rows: 3, validation: (r) => r.max(160) }),
    defineField({ name: "image", title: "Social image", type: "image" }),
    defineField({ name: "socialTitle", type: "string", validation: (r) => r.max(70) }),
    defineField({ name: "socialDescription", type: "text", rows: 2, validation: (r) => r.max(200) }),
  ],
});

// Editorial section: content only. The frontend decides layout per page.
export const section = defineType({
  name: "section",
  type: "object",
  fields: [
    defineField({
      name: "key",
      description: "Stable identifier used by the approved design. Do not change this key.",
      readOnly: true,
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "heading", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", type: "array", of: [{ type: "text" }] }),
    defineField({ name: "points", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "image", type: "figure" }),
    defineField({ name: "cta", type: "link" }),
  ],
});

export const figure = defineType({
  name: "figure",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alternative text",
      type: "string",
      validation: (r) => r.required(),
    }),
    // Internal record only; never rendered.
    defineField({ name: "source", title: "Source and license (internal)", type: "string" }),
    defineField({ name: "caption", type: "text", rows: 2, description: "Optional factual caption. Stock models must not be described as residents or staff." }),
    defineField({ name: "usage", title: "Intended use (internal)", type: "text", rows: 2 }),
    defineField({ name: "originalReference", title: "Original local reference (internal)", type: "string", readOnly: true }),
    defineField({ name: "exhibition", title: "Include in exhibition", type: "boolean", initialValue: true, description: "Array order controls chapter order. All photographs remain in the conventional gallery." }),
  ],
});

export const address = defineType({
  name: "address",
  type: "object",
  fields: ["street", "city", "region", "postalCode"].map((name) =>
    defineField({ name, type: "string" }),
  ),
});

export const link = defineType({
  name: "link",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", type: "string", validation: (r) => r.required() }),
  ],
});

export const richText = defineType({
  name: "richText",
  type: "array",
  of: [{ type: "block", styles: [{ title: "Normal", value: "normal" }, { title: "Heading", value: "h3" }] }],
});
