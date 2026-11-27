import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) => {
  const single = (type: string, title: string) => S.listItem().id(type).title(title).child(S.document().schemaType(type).documentId(type).title(title));
  const list = (type: string, title: string) => S.documentTypeListItem(type).title(title);
  const page = (slug: string, title: string) => S.listItem().id(`page-${slug}`).title(title).child(S.documentTypeList("page").title(title).filter('_type == "page" && slug.current == $slug').params({ slug }));
  return S.list().title("Evermere website").items([
    single("siteSettings", "Site settings"), single("homePage", "Homepage"),
    list("page", "Website pages"), list("accommodation", "Accommodations"), list("careService", "Care and support"),
    page("amenities", "Amenities"), page("lifestyle", "Lifestyle and activities"), page("dining", "Dining"),
    list("teamMember", "Team"), list("gallery", "Photography and gallery"), list("article", "Resources"), list("faq", "FAQs"),
    single("inquirySettings", "Inquiry settings"), single("navigation", "Navigation"),
    S.listItem().id("seo").title("SEO").child(S.list().title("SEO — open a document's SEO fields").items([
      single("siteSettings", "Site-wide defaults"), single("homePage", "Homepage"), list("page", "Website pages"), list("article", "Resource articles"),
    ])),
  ]);
};
