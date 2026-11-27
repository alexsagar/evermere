import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [{ name: "identity", title: "Identity", default: true }, { name: "brand", title: "Brand assets" }, { name: "contact", title: "Contact" }, { name: "seo", title: "SEO" }],
  fields: [
    defineField({ name: "name", type: "string", group: "identity", validation: (r) => r.required() }),
    defineField({ name: "shortName", type: "string", group: "identity" }),
    defineField({ name: "tagline", type: "string", group: "identity" }),
    defineField({ name: "description", title: "Property description", type: "text", rows: 4, group: "identity" }),
    defineField({ name: "logo", title: "Logo for light backgrounds", type: "figure", group: "brand", validation: (r) => r.required(), description: "Horizontal logo, transparent background. The site contains it within the existing responsive space; any proportions are supported." }),
    defineField({ name: "logoDark", title: "Logo for dark backgrounds", type: "figure", group: "brand", validation: (r) => r.required() }),
    defineField({ name: "favicon", title: "Browser icon", type: "figure", group: "brand", validation: (r) => r.required(), description: "Separate square artwork used as the website favicon. Changing it or the logos does not change the architectural opening." }),
    defineField({ name: "phone", type: "string", group: "contact" }),
    defineField({ name: "email", type: "string", group: "contact" }),
    defineField({ name: "address", type: "address", group: "contact" }),
    defineField({ name: "hours", type: "string", group: "contact" }),
    defineField({ name: "defaultSeo", type: "seo", group: "seo" }),
  ],
});

export const navigation = defineType({
  name: "navigation",
  type: "document",
  fields: [
    defineField({ name: "primary", type: "array", of: [{ type: "link" }] }),
    defineField({ name: "footer", type: "array", of: [{ type: "link" }] }),
    defineField({ name: "cta", title: "Inquiry call to action", type: "link" }),
  ],
});

export const homePage = defineType({
  name: "homePage",
  title: "Homepage",
  type: "document",
  // Content fields only; layout and motion live in the frontend.
  fields: [
    defineField({ name: "headline", type: "string", validation: (r) => r.required() }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    defineField({ name: "heroImages", type: "array", of: [{ type: "figure" }] }),
    defineField({ name: "chapters", type: "array", of: [{ type: "section" }] }),
    defineField({ name: "cta", type: "link" }),
    defineField({ name: "featuredServices", type: "array", of: [{ type: "reference", to: [{ type: "careService" }] }] }),
    defineField({ name: "featuredFaqs", type: "array", of: [{ type: "reference", to: [{ type: "faq" }] }] }),
    defineField({ name: "seo", type: "seo" }),
  ],
});

export const inquirySettings = defineType({
  name: "inquirySettings",
  type: "document",
  // Submissions are never stored in Sanity; this holds copy only.
  fields: [
    defineField({ name: "heading", type: "string" }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    defineField({ name: "successMessage", type: "text", rows: 2 }),
    defineField({ name: "errorMessage", type: "text", rows: 2 }),
    defineField({ name: "interestOptions", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "nextSteps", title: "What happens after an inquiry", type: "array", of: [{ type: "string" }], validation: (r) => r.max(4) }),
  ],
});

export const singletonTypes = new Set(["siteSettings", "navigation", "homePage", "inquirySettings"]);
