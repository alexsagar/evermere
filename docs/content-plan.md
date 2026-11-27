# Content plan

All Evermere editorial content is now managed in Sanity project `8nawnqp2`, dataset `development`, until explicit production migration approval. Components read published CMS content through `src/content/index.ts`; missing configuration/content never silently falls back. The typed `src/content/demo*.ts` source is a frozen migration/offline test fixture, selected only with `CONTENT_SOURCE=demo`, and must not become an independently edited content copy. See `docs/sanity-preparation.md` for connection, editing and verification instructions.

## Fictional property profile

- **Setting:** a quiet freshwater lake in the Puget Sound region of Washington, ringed by Douglas fir and western red cedar. There is no street address or named town.
- **Architecture:** a two-story Northwest contemporary residence of cedar, stone and glass with deep eaves. It is arranged in a U around an enclosed garden courtyard, with the open side facing the lake and a covered porch along the lakeside.
- **Shared rooms:** the Commons (fireplace, grand piano), the Library, the Garden Room (sunroom), the Studio (art and workshop), the Dining Room, the Lake Room (classes, films, events), a salon and a private dining room.
- **Outdoors:** the courtyard garden with raised beds at standing and seated heights, a covered walkway and a fire table, plus a level, lit lakeside path with benches and a small dock.
- **Suites:** studio, one-bedroom and lakeside layouts. Each has a private bathroom with a walk-in shower, a kitchenette, windows that open and its own climate control. There is also a guest suite for visiting families.
- **Dining:** scratch cooking from seasonal Washington ingredients, three meals plus snacks, flexible seating and timing, and seasonal events such as the summer picnic, the harvest dinner and the crab feed.
- **Lifestyle:** a resident-shaped calendar, outings around the Sound and residents leading groups. Participation is never required.
- **Support philosophy:** a personal plan written with each resident (and family if the resident wishes), reviewed regularly. The specific services are explained in a personal consultation and are not claimed on the site.
- **Family:** families are welcome at reasonable hours, can join meals, have a guest suite and receive updates in the way each resident prefers.
- **Visits and inquiry:** visits by appointment seven days a week. The inquiry path is conversation, visit, consultation, then moving plan, with a reply within one business day.

## Routes and content

| Route | Source | H1 |
| --- | --- | --- |
| `/` | `demoHomePage` (12 chapters) | Morning light on the lake, and the rest of the day is yours. |
| `/about` | page `about` | We started with a simple question: where would we want to live? |
| `/our-home` | page `our-home` | A Northwest house, built around a garden and facing the water. |
| `/accommodations` | page + `demoAccommodations` (3) | Your own front door, your own furniture, your own view. |
| `/care-services` | page + `demoCareServices` (5) | Help with the parts of the day you choose, and respect for the rest. |
| `/lifestyle` | page `lifestyle` | A full calendar, and the freedom to ignore it. |
| `/amenities` | page `amenities` | Everything close by, so the day is easier to enjoy. |
| `/dining` | page `dining` | Good food, cooked here, and a table worth lingering at. |
| `/gallery` | page + `demoGallery` (5 categories) | A year at Evermere, in pictures. |
| `/our-team` | page + `demoTeam` (6 roles) | The people who know your name, and how you take your coffee. |
| `/resources` | page + `demoArticles` (4) | Practical guidance for one of life's bigger decisions. |
| `/resources/[slug]` | `demoArticles` | Article title |
| `/faq` | page + `demoFaqs` (18) | Questions people ask us, answered plainly. |
| `/contact` | page + `demoInquirySettings` | Let's talk, whenever you are ready. |
| `/privacy` | page `privacy` | Privacy notice |
| `/accessibility` | page `accessibility` | Accessibility |

Every page has an SEO title, a meta description, social title and description, a CTA and related internal links. A unit test (`src/content/demo.test.ts`) checks that every internal link points to a planned route.

## Proposed changes (not implemented; awaiting approval)

1. **Fold `/amenities` into `/our-home` and `/lifestyle`.** Most amenities are rooms already described on Our home, and services overlap with Care and support. Keep `/amenities` as a redirect. This would also remove the unused `amenity` schema type.
2. **Retire the `activity` and `dining` document types.** Their content reads better as editorial page sections than as repeated items, which also avoids the card-grid pattern. Today they hold no demo content.
3. **Rename the visible label "Care services" to "Care and support"** (already done in navigation; the URL is unchanged) until the client confirms which licensed services it offers.
4. **Consider `/visit` as a dedicated inquiry landing page** for campaigns, separate from the general `/contact`.

## Schema changes in this milestone

- `seo`: added `socialTitle` and `socialDescription`.
- New `section` object (`key`, `heading`, `body[]`, `points[]`, `image`, `cta`) for structured editorial sections.
- `siteSettings`: added `shortName` and `description`.
- `homePage`: replaced the rich-text `story` with `chapters[]` (sections) and added `cta`.
- `page`: added `headline`, `intro`, `sections[]`, `cta` and `related[]`.
- `teamMember`: `role` is now required and `name` is optional, so roles can be described without invented people.
- Added 13 typed GROQ queries and matching content accessors.

## Route inventory (Milestone 4)

| Route | Status |
| --- | --- |
| `/` | Built: public homepage |
| `/our-home`, `/care-services`, `/lifestyle`, `/about`, `/gallery` (main navigation) | Not built: 404. Content exists in `src/content/demo-pages.ts` |
| `/accommodations`, `/dining`, `/our-team`, `/amenities`, `/resources`, `/faq` (footer) | Not built: 404 |
| `/contact`, `/privacy`, `/accessibility` | Not built: 404. Inquiry actions point to the homepage panel (`/#inquire`) until the inquiry milestone |
| `/dev/*` | Development only: 404 in production |

Inquiry: the homepage panel is a local demonstration. It validates, shows a success state that says nothing was sent, and stores nothing.

## Milestone 6.1 status
- Routes: 19 public content routes return 200 (home, about, our-home, accommodations, care-services, lifestyle, amenities, dining, gallery, our-team, resources, four articles, faq, contact, privacy, accessibility). Unknown URLs and article slugs return 404 with noindex. All `/dev/*` routes return 404 in production.
- Article routing: `resources/[slug]` uses `ensureStatic = "navigation"` with `instant = false`, matching the bundled guide `keeping-pages-static.md`. The four guides are prerendered, and unlisted slugs call `notFound()` and return HTTP 404.
- Known framework limitation (Next 16.4.6): for an unlisted slug, the on-demand static render returns HTTP 404 with the branded page only in the RSC payload (`E{"digest":"NEXT_HTTP_ERROR_FALLBACK;404"}`), so without JavaScript the body is empty. With JavaScript the page renders one header, main, footer and H1. Unmatched non-article URLs render fully without JavaScript. A proxy-based workaround would duplicate the content lookup on every request, so it was not adopted. The fix is tracked by a `test.fixme` in `tests/e2e/site.spec.ts`.
- Content audit (no remote resources):
  - These are all sourced from `src/content`: brand name, contact details, navigation, home and internal page copy, suites, care services, lifestyle and dining, team roles, gallery assets with alt text and hotspots, articles, FAQs, inquiry settings and SEO.
  - Fixed: the root default title and description were hardcoded and now come from `siteSettings.defaultSeo`.
  - Frontend-owned by design: interface labels (form labels, "Next", "Related", "Read on"), the 404 copy, the demo footer notice and fallbacks for missing CTA labels.
  - The logo is a vector wordmark in code, so its `aria-label` matches the artwork. `siteSettings.logo` exists for M8 if a raster or alternative logo is needed.
- Required in M8 (Sanity integration):
  - Revalidate newly published articles (on-demand tags), and verify that an unlisted slug becomes 200 after publishing.
  - Verify hotspot crops through the Sanity image pipeline.
  - Decide whether the 404 copy should become editable.
