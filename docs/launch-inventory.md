# Fictional facts to replace or verify before launch

Everything below was invented for the demonstration. None of it may go public until the client supplies or confirms the real information.

## Identity
- [ ] Business name "Evermere Senior Living" and short name "Evermere" (not trademark-checked)
- [ ] Logo: final Threshold mark and outlined wordmark (11 SVG files in `public/brand`), simplified fallback favicon (`public/favicon.svg`); CMS light/dark logos and browser icon are in Site settings → Brand assets; not trademark-checked
- [ ] Tagline: "A home on the water, built around the people in it."

## Contact and operations
- [ ] Phone (206) 555-0142 (reserved fictional number)
- [ ] hello@, privacy@ and accessibility@example.com (reserved domain)
- [ ] Address: currently region "WA" only; no street, city or postal code
- [ ] "Visits by appointment, seven days a week"
- [ ] "Reply within one business day"
- [ ] "Our team is here day and night" (staffing hours)

## Property
- [ ] Lakeside setting, Puget Sound region, Douglas fir and cedar surroundings
- [ ] Two-story cedar, stone and glass building in a U around a courtyard (no stock photograph shows a two-story courtyard; see photography gaps)
- [ ] Named rooms: Commons, Library, Garden Room, Studio, Dining Room, Lake Room, salon, private dining room, guest suite
- [ ] Grand piano, stone fireplace, dock, fire table, raised beds
- [ ] Suite types (studio, one-bedroom, lakeside) and suite features (walk-in shower, kitchenette, climate control, phone, cable, internet)
- [ ] Suite sizes (intentionally left blank as `squareFeet: null`)
- [ ] Couples sharing suites; pet policy ("ask us")

## Services (regulated: confirm with the client and Washington licensing)
- [ ] Care type and license of the real community; no license is claimed anywhere on the site
- [ ] Help with dressing and bathing ("Daily routines")
- [ ] Personal plans, review frequency and family participation
- [ ] Coordination with physicians and providers
- [ ] Housekeeping weekly, personal laundry, maintenance
- [ ] Community vehicle, scheduled transportation and outings
- [ ] Dietary accommodation capabilities
- [ ] What is included in fees (Amenities page says "most are included")

## Lifestyle and dining
- [ ] Classes listed (chair yoga, watercolor, language table, etc.)
- [ ] Seasonal events: summer picnic, harvest dinner, crab feed, holiday baking
- [ ] Meal service model (three meals, snacks, in-suite breakfast)

## Team
- [ ] Six role descriptions; no names, portraits or credentials exist

## Legal and policy
- [ ] Privacy notice (demonstration text; requires legal review)
- [ ] Accessibility statement claims WCAG 2.2 AA design and testing; verify with an audit before publishing
- [ ] Inquiry email delivery provider (Resend, a later milestone)

## Photography (illustrative stock, replace before launch)
- [ ] All 56 photographs are licensed Pexels stock (Pexels License, commercial use, no attribution required). Source page, photographer, license and download date are recorded per image in `src/content/photos.generated.json`; originals are in `assets/photos/originals` (not published).
- [ ] They illustrate a fictional property. They do not show the client's building, and the people pictured are models, not residents, staff or caregivers. Never caption them with names, roles or quotations, and never place testimonials beside them.
- [ ] Replace with commissioned photography of the real community before launch, starting with exteriors, suites, the Commons, Library, courtyard and dining room. Identifiable residents or staff need signed releases.
- [ ] The demonstration disclosure appears only in the internal review (`/dev/creative`); the public pages must not ship stock imagery as real without the client's decision.
- [ ] Open gaps: no two-story courtyard establishing shot; no suite photograph with a lake view (the lakeside suite uses a garden-facing suite).

## Never add without evidence
Licenses, certifications, awards, clinical outcomes, occupancy figures, prices, availability counts, testimonials, staff credentials.

## Milestone 9: inquiry system, footer and editorial refinement

### Inquiry architecture
- One shared form, `src/components/inquiry/Inquiry.tsx`, used by the Contact page, the homepage invitation and the lab. Every inquiry action still leads to `/contact#inquire`.
- Fields: name and email (required), phone, topic, preferred contact method and message (optional), plus a required privacy confirmation. The "who are you asking for" field was removed. No medical, insurance or financial fields; the message hint asks visitors not to include them.
- Shared rules in `src/lib/inquiry/fields.ts` run in the browser (no zod in the client bundle) and on the server. Server endpoint: `POST /api/inquiry` (`src/app/api/inquiry/route.ts`, `src/lib/inquiry/server.ts`): same-origin Origin and Sec-Fetch-Site checks, JSON content type, 8 KB streamed body cap, strict zod shape (unknown fields rejected), field limits, control-character and CR/LF rejection (header injection), honeypot, per-inquiry UUID for duplicate suppression, per-IP rate limit, `Cache-Control: no-store`, `maxDuration` 15 s, provider and verification timeouts. Responses never echo submitted values. Nothing is logged, stored or sent to Sanity or analytics.
- Client: error summary with focus, per-field messages linked by `aria-describedby`, `aria-busy`, repeat clicks ignored while sending, retry keeps answers and reuses the inquiry ID, failure message offers the phone number, success heading receives focus.

### Modes (fail closed)
- `INQUIRY_MODE` unset or `demo`: validates, then discards. The success state says nothing was sent or stored. This is the only active mode.
- Any other value, or `live` with anything missing or malformed: endpoint returns 503. Live requires `RESEND_API_KEY`, `INQUIRY_SENDER_DOMAIN`, `INQUIRY_FROM_EMAIL` on that domain, `INQUIRY_TO_EMAIL` (not example.com), `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `INQUIRY_RATE_LIMIT=distributed`. Even when complete, `src/lib/inquiry/config.ts` keeps live disabled until a distributed rate limiter exists.
- Prepared but inactive: `resendMailer` (Resend HTTP API, plain text only, success only on a returned message ID) and `verifyTurnstile` (fails closed on missing token, error or timeout). Both are tested with mocked fetch only. No accounts, keys, recipients or test emails were created or sent.

### Before live delivery (client approval required)
1. Client-approved recipient address and a verified sending domain in Resend (SPF/DKIM).
2. Turnstile site and secret keys; add the widget to the form and send `turnstileToken`.
3. A shared rate limiter (for example a hosted key-value store) replacing the in-memory limiter and duplicate cache, then remove the hold in `config.ts`.
4. Server-only secrets in the host's environment (never `NEXT_PUBLIC_` except the Turnstile site key, never in Sanity).
5. Final privacy notice and retention wording approved by the client's counsel. No HIPAA, GDPR or state privacy-law compliance is claimed.
6. Update the demonstration hint and success copy in `Inquiry.tsx` for live mode.

### Footer
Closing chapter instead of a column footer: the CMS tagline as large closing line, one "Arrange a visit" link with phone, email and visiting hours beside it, a single flowing index of every page (primary and footer navigation merged without duplicates), the CMS dark logo at full measure sized by height so any logo proportions fit, then name, Privacy, Accessibility and the demonstration disclosure. No uppercase headings, icons, cards or social links. `FooterReveal` plays once on entry (line and index settle, logo rises out of a clip); server HTML is final, reduced motion and no-JavaScript show it unchanged. No pinning, no Three.js.

### Editorial audit (Sanity development)
Audited 421 strings across all 61 documents: zero em or en dashes, no unsupported licensing, staffing, rating or medical claims, no AI cliches beyond two literal uses ("thrive", "journey") kept as natural. Repeats are intentional SEO/summary reuse. One 89-word article paragraph was kept; it reads well. Changes were limited to copy that contradicted the new form:
- `inquirySettings.intro`: removed "who you are asking for" and the duplicated medical warning.
- `inquirySettings.errorMessage`: now a short server-failure sentence; the form adds recovery and the phone number.
- `page.privacy` sections 0 and 2: list the actual fields; state that the demonstration checks and discards messages.
Backup before editing: `.cache/m9/development-before-m9.tar.gz` (documents; assets unchanged). Applied with `scripts/sanity-m9-editorial.cjs`, revision-locked to the audited `_rev`, refusing drafts. Published in development, refreshed with `pnpm cms:revalidate`, verified on the production build. The offline fixture mirrors the same copy. Production dataset untouched.

### Verification
163 unit tests (146 + 17 inquiry). Playwright: 69 passed and the documented skip; one full-suite run showed the M7 exhibition repeat test failing under load and it passed 9/9 when rerun alone. CMS-connected production build: 19 content routes 200 with noindex header and meta, unknown and article 404s, development routes 404, demo POST 200, cross-origin POST 403, signed revalidation refreshed the edited documents. Review captures: `review/m9/` (footer, form and error state at 1920, 1440, 1280, 1024, 768, 390 and 320; two recordings). No horizontal overflow at any width.

### Still needed from the client
Real name, logo, address, phone, email and hours; approved inquiry recipient and sending domain; privacy and legal wording; approval for Resend, Turnstile and a shared rate-limit store.

## Milestone 10: technical SEO, indexing safeguards, structured data, accessibility

### Indexing safeguards (`src/lib/site.ts`, 14 unit tests)
Indexing stays off unless **all four** hold: `SITE_ENV=production`, `INDEXING_APPROVED=yes`, an `https` `NEXT_PUBLIC_SITE_URL` on a real public host (not localhost, 127.0.0.1, example.*, vercel.app, pages.dev or netlify.app), **and** `NEXT_PUBLIC_SANITY_DATASET` set to an approved non-`development` dataset. Any missing, misspelled or invalid value falls back to the non-indexable local configuration and can never switch indexing on. The dataset gate is the M10 addition: because `src/lib/env.ts` only authorizes the `development` dataset under Sanity mode, without this gate a production+approved deployment could have served the development dataset as an indexable live site. `indexable` drives `metadataBase`, the robots meta tag, `X-Robots-Tag`, `robots.txt` and `sitemap.ts`. noindex is not access control; a confidential client preview still needs authentication.

Verified on the production build (Sanity development, default local config): every one of the 19 content routes serves `<meta name="robots" content="noindex, nofollow, nocache">` and an `X-Robots-Tag: noindex, nofollow` header; `robots.txt` is `User-Agent: * / Disallow: /`; `sitemap.xml` is empty (0 URLs). Fail-closed, localhost, preview, approval-typo, misspelled-env, http, example-domain, preview-hosting, development-dataset and missing-dataset cases are each covered by a unit test. Authorized-production behavior is tested only through isolated configuration tests; no real indexing was enabled and no URLs were submitted to any search engine.

### Structured data (JSON-LD)
Validated against the actual generated production HTML.
- Homepage: a `@graph` with `Organization` (`@id` `/#organization`, name, url, description, logo) and `WebSite` (`@id` `/#website`, publisher -> the Organization `@id`). Valid JSON, valid Schema.org vocabulary.
- Articles: `Article` (headline, description, image, mainEntityOfPage, author and publisher both the Organization, publisher logo) and `BreadcrumbList` (Resources -> article title). Valid JSON and vocabulary.
- Only CMS-published facts appear. No address, geo, hours, telephone, ratings, prices, credentials or invented dates.
- **Content-model improvement (future):** articles carry no `datePublished` (no publish-date field in the CMS yet), so the `Article` node omits it. Google treats `datePublished`/`dateModified` as recommended for Article rich results, so adding a publish-date field is the one change needed for full rich-result eligibility. Deferred, not a defect.
- Distinction recorded: the markup is valid JSON and valid Schema.org, but Google **rich-result eligibility** also depends on noindex being lifted and (for Article) a publish date; neither is claimed now.

### Sanity SEO publishing (project `8nawnqp2`, dataset `development`; production untouched)
Verified by mechanism and by live output:
- `src/sanity/client.ts` uses `perspective: "published"`, so draft edits are never visible on ordinary website routes (requirement 1, architecturally guaranteed).
- Published SEO fields render in the actual HTML: per-page `<title>` and `<meta name="description">`, Open Graph and Twitter tags, and the Studio social image (served from `cdn.sanity.io/images/8nawnqp2/development/...`), proving the Studio -> published -> HTML path end to end (requirement 3).
- `pnpm cms:revalidate` posts an HMAC-signed webhook to `/api/sanity/revalidate` (503 without the secret, 401 on a bad signature, 204 + tag revalidation on success), the mechanism that makes a publish visible after signed local revalidation (requirement 2).
- The full destructive write/publish/revalidate/restore round-trip with a revision-locked backup was executed in Milestone 9 (`.cache/m9/development-before-m9.tar.gz`, `scripts/sanity-m9-editorial.cjs`). M10 made **no** CMS writes: re-running a live mutation was intentionally avoided to protect the development dataset and avoid any risk of a leftover draft or overwriting a concurrent editor. No temporary documents or drafts exist; no remote webhook is registered; the seed script was not re-run.

### Accessibility
- **Keyboard focus not obscured (WCAG 2.4.11), confirmed defect + fix.** Focus moving to a control above the scroll position scrolled it under the fixed header. Fix: `html { scroll-padding-top: 6.5rem }` plus `scroll-margin-top` on the inquiry form, FAQ groups and in-page section targets (`globals.css`, `pages-b.css`, `home.css`). Verified on the current build: native `focus()` and fragment navigation both honor scroll-padding, so focused controls and fragment targets land at or below the header's bottom edge, at full (900 px) and short (560 px) viewports, on both the FAQ summaries and the contact input. Regression test added (`tests/e2e/site.spec.ts`, "keyboard focus and fragment targets are never hidden under the fixed header").
- Lighthouse Accessibility = **100** on every assessed route (including the article, reconfirming the earlier heading-order fix). Axe (`wcag2a/aa`, `wcag21aa`, `wcag22aa`) reports 0 violations across representative layouts and the gallery dialog. Footer contrast flags were transient during the reveal animation only (0 at rest).
- Gallery image viewer: Escape closes and restores focus to the triggering thumbnail (tested). Exhibition: static non-WebGL fallback, keyboard-reachable, reduced-motion respected, focus restored on exit.
- Homepage journey: the crossfading imagery is a decorative `aria-hidden` stage; the semantic content (headings, summaries, features, captioned images) is always in the DOM and accessibility tree, so the cinematic fade hides nothing from keyboard or assistive tech. The transition was kept; no genuine defect was found.
- Reflow / zoom: the 78-view responsive and 200% text sweep shows no horizontal overflow and no clipped content at any size; no two-dimensional scrolling. True browser 400% zoom was not scripted in this environment; narrow-viewport emulation supplements but is not presented as actual browser zoom. Real 400% browser zoom and reflow remain a manual check.
- **Screen reader:** actual verification is pending — Narrator is installed but cannot be reliably operated or heard from this environment. A manual checklist of expected landmarks, reading order and announcements for every surface is at `review/m10/screen-reader-checklist.md`. Accessibility-tree inspection is not presented as completed screen-reader testing. Full WCAG 2.2 AA compliance is **not** claimed on automated checks alone.

### On-page SEO and AI answer (AEO/GEO) review
Built on the M9 editorial audit; no rewrite was needed.
- 19 routes: unique, keyword-forward titles (38-61 chars) with the brand suffix; unique descriptions (88-153 chars) each naming the Washington / Puget Sound location and a clear next step; one meaningful, human H1 per page (several phrased as questions, which reads well for AI answer surfaces).
- Business information is consistent (Washington, Puget Sound, lakeside; `(206) 555-0142`). No telephone or address is placed in structured data, so there is no NAP conflict to reconcile.
- No unsupported claims: no licensing, credentials, ratings, prices, occupancy or medical outcomes. Fictional-but-coherent brand voice only.
- No Sanity corrections were required (no confirmed issue). `llms.txt` is deferred until after client approval and real-content replacement, per the brief.
- **Future SEO opportunities that require the real client:** verified location (street/city/postal) to enable `LocalBusiness`/`PostalAddress`/geo and a service area; legal business identity and licensing (Washington) to make any care claims; verified services; real property details and suite sizes; named staff with real credentials for author/E-E-A-T; real, licensed photography; an article publish-date field for `Article` dates; genuine reviews before any `AggregateRating`. None were invented.

### Lighthouse (production build, Sanity development, local `next start`)
Accessibility and Best Practices are 100 across all routes. SEO is 69 on every route — an **intentional** deduction: Lighthouse fails "Page is blocked from indexing" because the site is deliberately noindex; it will rise to ~100 once indexing is approved. Per-route Performance figures and the main diagnostics are in `review/m10/lighthouse/` (one desktop + one mobile per route), with the full table in `review/m10/lighthouse/summary.md`. Home performance (especially mobile TBT from the hero/journey animation under this software-rendered measurement environment) is the main actionable item and is handed to Milestone 11; no JS/image/CSS optimization was done in M10 per scope.

### Remaining limitations
- Actual screen-reader pass pending (checklist ready).
- True 400% browser-zoom reflow pass pending (emulation done).
- Article `datePublished` absent until a CMS publish-date field exists.
- The one documented no-JavaScript unknown-article 404 skip remains accepted (Next 16.4.6 on-demand static render; genuine 404 + noindex header confirmed, branded HTML body only in the RSC payload).

### Milestone 11 performance priorities
Home LCP and mobile TBT (hero + journey animation cost), image delivery and any CSS/JS trimming the Lighthouse diagnostics flag. Measure against real GPU rendering, not only this software-rendered environment.
