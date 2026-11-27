import { defineQuery } from "next-sanity";

// "image" is the optional Studio "Social image"; it overrides the page photograph for sharing.
const social = `title, description, socialTitle, socialDescription, "image": image{ "src": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }`;
const seo = `seo{ ${social} }`;
// Image shape shared by Sanity and the local demo (see src/content/photos.ts).
const img = `{ alt, "src": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, hotspot{ x, y }, crop{ left, right, top, bottom }, caption, exhibition }`;
const sections = `sections[]{ _key, key, heading, body, points, cta, image${img} }`;
const item = `_id, title, "slug": slug.current, summary, body, order, image${img}`;

export const siteSettingsQuery = defineQuery(
  `*[_type == "siteSettings" && _id == "siteSettings"][0]{ name, shortName, tagline, description, phone, email, address, hours, logo${img}, logoDark${img}, favicon${img}, defaultSeo{ ${social} } }`,
);

export const navigationQuery = defineQuery(`*[_type == "navigation" && _id == "navigation"][0]{ primary, footer, cta }`);

export const homePageQuery = defineQuery(
  `*[_type == "homePage" && _id == "homePage"][0]{ headline, intro, heroImages[]${img}, chapters[]{ _key, key, heading, body, points, cta, image${img} }, cta, ${seo} }`,
);

export const inquirySettingsQuery = defineQuery(
  `*[_type == "inquirySettings" && _id == "inquirySettings"][0]{ heading, intro, successMessage, errorMessage, interestOptions, nextSteps }`,
);

export const pagesQuery = defineQuery(
  `*[_type == "page"] | order(order asc){ _id, title, "slug": slug.current, headline, intro, image${img}, ${sections}, cta, related, ${seo} }`,
);

export const careServicesQuery = defineQuery(`*[_type == "careService"] | order(order asc){ ${item}, highlights }`);
export const accommodationsQuery = defineQuery(`*[_type == "accommodation"] | order(order asc){ ${item}, squareFeet, features }`);
export const amenitiesQuery = defineQuery(`*[_type == "amenity"] | order(order asc){ ${item} }`);
export const activitiesQuery = defineQuery(`*[_type == "activity"] | order(order asc){ ${item} }`);
export const diningQuery = defineQuery(`*[_type == "dining"] | order(order asc){ ${item} }`);
export const articlesQuery = defineQuery(`*[_type == "article"] | order(order asc){ ${item}, publishedAt, ${seo} }`);
export const teamQuery = defineQuery(`*[_type == "teamMember"] | order(order asc){ _id, role, name, bio, order }`);
export const faqsQuery = defineQuery(`*[_type == "faq"] | order(order asc){ _id, question, answer, topic, order }`);
export const galleryQuery = defineQuery(`*[_type == "gallery"] | order(order asc){ _id, title, "slug": slug.current, category, order, images[]${img} }`);
