# Creative direction

This document turns the approved brand (`docs/brand.md`) into a visual and motion language for the build milestones. Nothing here is implemented yet. The `/dev/creative` route shows static compositions of these ideas using the real photography and copy.

## 1. Research

Sites were opened in a desktop browser (Playwright, 1440 x 900) on 2026-11-25. For each one I captured the first viewport and checked the page for scroll-driven style changes, smooth-scroll libraries and canvas elements. Limits are noted where they applied: Lusion and Igloo stayed on their WebGL loaders in the headless browser, so their 3D behavior was not observed and is not described.

| Site | Field | What is useful | What to avoid | Adapt for Evermere |
| --- | --- | --- | --- | --- |
| cogirusa.com (client reference) | Senior living | Clear inquiry path: "Schedule a tour" in the utility bar and in the hero; cost calculator as a top-level tool | Full-bleed video with a centered script-accent headline; tracked capitals in navigation; generic Poppins | Keep the always-visible inquiry action and the planning-tool idea (later); replace everything visual |
| eraliving.com | Senior living, Seattle | Real local context; "Request a visit" repeated through the page | Yellow buttons, capitals, card grids, chat widget over content | Local Puget Sound specificity in copy, without the template |
| viliving.com | Premium senior living | Serif display, calmer pacing than most competitors | Brochure layout, carousels | Proof that restraint reads as premium in this sector |
| olsonkundig.com | Architecture, Pacific Northwest | Full-bleed film of a glass room opening onto Puget Sound, a statement in plain sans set over the image bottom-left, sections that alternate photograph and statement | Its own photography and layout | The closest tonal match: Northwest light, glass and water, quiet type laid directly on images. Left-aligned statements over photographs |
| snohetta.com | Architecture | Large light-weight statement with no hero image; project index set as a typographic list (name plus muted description); scroll-linked fades confirmed | Dense news strip | Typographic index for the gallery and resources; one oversized calm statement per page |
| aman.com | Luxury hospitality | Cinematic full-bleed video hero; generous emptiness; "Reserve" pinned top right | Cookie modal over hero; serif-only voice | A single persistent inquiry button top right; one image per screen at the opening |
| fogoislandinn.ca | Hospitality | Drone film of the building on the shore (place before product); centered editorial text blocks between photo bands; triptychs of local images; persistent "Reserve" | Busy mega-menus | Show the setting before the building; the building before the rooms |
| treehotel.se | Hospitality and architecture | Aerial architecture in forest; room names as a horizontal index along the bottom of the hero | Capitalized display, orange pill button | A suite index along the bottom of the Accommodations opening |
| thenewtinsomerset.com | Hospitality | Video-led sections, family and seasonal stories, multiple booking entry points | Italic serif display | Seasonal storytelling for Dining and Gallery |
| kinfolk.com | Editorial | Smooth scroll (Lenis detected), magazine pacing, single cover image centered with generous white space | Serif voice | Editorial pacing for Resources articles and long-form pages |
| lusion.co, igloo.inc | WebGL studios | Both are canvas-first, with loading counters before content | Loaders could not be passed headless; gimmick risk | Evidence that loaders are a cost: Evermere shows a photograph immediately, never a counter |

Common lessons:
- The strongest hospitality and architecture sites lead with place, use one image per screen, and keep a single booking action visible at all times.
- Type laid directly on photography works when it is short, left-aligned and set over a calm area of the image (Olson Kundig).
- Senior living competitors default to capitals, card grids, carousels and stock smiles. That is the gap to own.

## 2. Overall visual direction: "Through the door"

The Threshold mark is a door standing open. The site is the walk through it: from the lake, up the path, into the house, room by room, and out onto the dock again, where the invitation waits.

- **Composition:** one photograph per screen at key moments, set full-bleed or inside an architectural frame (the arch, a window grid, a door width). Text sits on the photograph's calm area, left-aligned, never centered over faces.
- **Rhythm:** alternate immersive photo screens with quiet Cloud or White editorial spreads. A 12-column grid with deliberate asymmetry: the text column sits at columns 2 to 6, images bleed off the opposite edge.
- **Color in use:** photographs carry the warmth (cedar, fire, morning light). The UI stays Midnight, Cloud and White, with Royal reserved for actions. Lavender is used for quiet panels and the arch frame background before an image loads.
- **Type:** Manrope display, set large and tight, one statement per screen. Body at 18px on Cloud. No capitals, no eyebrows.
- **Frames:** the arch (from the logo) is the single recurring shape, used once per page at most. Window-grid masks appear only on Our Home and Accommodations, where they describe real architecture.

## 3. Signature motion language

Principles: motion reveals photographs, never decorates text. Each transition borrows a real architectural action (opening, stepping through, looking up, sitting down). One signature moment per page; everything else is a quiet fade under 400ms.

Responsibilities, without overlap:
- **Lenis:** smooth scroll and the single scroll clock.
- **GSAP ScrollTrigger:** timelines, pinning, DOM and CSS masks (clip-path), type, and driving WebGL uniforms. It is the only scroll listener.
- **Three.js through React Three Fiber:** one full-screen plane per WebGL moment, with a GLSL shader for displacement and photo-to-photo blends. No geometry beyond planes, no lights, no models.
- **CSS:** hover and focus states and everything in reduced motion.

### Homepage transitions

| From to | Concept | Technique | Reduced motion and fallback |
| --- | --- | --- | --- |
| Opening (mist lake) | Mist lifts: a low-frequency noise displacement on the photograph settles over 2.4s on load while the headline fades in | R3F plane, noise shader; uniform eased by GSAP | Static photograph and headline, no animation |
| Exterior to welcome | The arch opens: the Threshold arch, scaled from logo size, frames the entrance photo and grows until its edges leave the viewport | GSAP scrubbed clip-path (SVG path morph via CSS `clip-path: path()`), pinned for 120vh | Arch-framed static image, then full image below |
| Welcome to interior | Stepping inside: the entrance photo blends into the Commons photo along the line of the door, warm light first | Shader blend with a vertical mask driven by scroll progress | Crossfade on intersection |
| Interior to accommodations | Window grid: the Garden Room's mullions become a mask that reveals the suite, pane by pane | CSS mask with staggered GSAP steps | Plain image swap |
| Accommodations to lifestyle | Sitting down: the camera lowers from standing to seated eye level as the suite gives way to a reading chair by a window | Scrubbed scale and translateY on layered photos | Static pair |
| Lifestyle to dining | Gathering: three lifestyle photographs slide together into one long table composition | Horizontal pinned sequence, GSAP | Vertical stack |
| Dining to outdoors | Opening the doors: the dining room's garden doors part (two vertical panels) onto the covered walk around the courtyard | Two clip-path panels scrubbed apart | Crossfade |
| Outdoors to inquiry | Back to the water: the fire table at dusk settles into the dock photograph; the inquiry panel rises over the calm upper third | Shader crossfade, then GSAP panel | Dock photo with panel, no motion |

Oversized type: a single headline per pinned scene moves at 0.85 times scroll speed against the photo, giving depth without gimmicks.

What we will not do: rotating 3D objects, particles, cursor followers, magnetic buttons, text scrambles, loaders or counters, scroll hijacking beyond one pinned scene at a time.

## 4. Page directions

| Page | Opening | Photography layout | Editorial structure | Signature moment | Inquiry placement | Reduced motion and mobile |
| --- | --- | --- | --- | --- | --- | --- |
| Home | Mist lake, full-bleed, headline bottom-left | One photo per screen, 12 chapters | Statement plus short paragraph per chapter | The full journey above | Persistent header button; final dock panel | Static chapters stacked; WebGL off below 768px |
| About | Couple by the water, cropped tight in the arch | Portrait-led, generous white space | Belief, name, principles as a typographic list | The arch frame narrows into the "name" section | After principles and at the end | Static arch image |
| Our home | Evening exterior, full-bleed | Architectural sequence: exterior plates A to C, then rooms | Room-by-room tour (Library, Commons), then the courtyard told through its covered walk | Forward push along the covered walk | After the courtyard | Images stack; no push |
| Accommodations | A suite seen through its open door (Through the Door frame), suite index along the bottom | Large single suite photos with a detail inset | Three suite types, "in every suite" checklist | Window-grid reveal between suites | "Ask about availability" beside each suite | Plain grid of suites |
| Care and support | Couple walking away along the path | Quiet, people-led photography, no clinical imagery | Approach, plan, how we help (services), straight answers | None heavy: a slow text-to-image fade | "Talk with our team" after the plan and at the end | Static |
| Lifestyle | Watercolor at the window | Day timeline: morning to evening photos in sequence | Rhythm of a day, interests list, outings | Horizontal day scroll (morning to evening) | After "keep doing what you love" | Vertical timeline |
| Dining | Dining room toward winter trees | Overhead plate sequence alternating with room views | Kitchen, the day, choice, family, seasons | Overhead plates rotate in sequence with scroll | "Join us for lunch" mid-page and end | Stacked plates |
| Amenities | Slatted garden walk, perspective push | Split layout: house, outdoors, services as three photographic chapters | Lists set as an architectural schedule (name and line) | Perspective push down the walk | End | Static |
| Gallery | Dock at first light | Masonry-free editorial grid by category, with a full-screen viewer | Category index (Snøhetta-style list) | Full-screen viewer with shader crossfade between photos | Viewer footer and end | Keyboard-accessible viewer, crossfade only |
| Our team | Family looking at photographs | Roles as a typographic list; few photos | Who does what, hiring, families | None | After families section | Static |
| Resources, articles | Misty bench | Text-first, one image per article | Long-form editorial measure (66ch) | None; reading progress line only | End of each article | Static |
| FAQ | Reading smile, small | No large imagery | Accordion by topic | None | After each topic group and end | Native details/summary |
| Contact | Chairs on the dock | Photo beside the form | Steps to visiting, form, privacy note | None | The page itself | Static |

## 5. Decisions closed in Milestone 2

- Logo: Threshold, final, with the outlined Manrope wordmark (11 SVG files in `public/brand`).
- Photography: 56 accepted photographs (see `docs/photography-plan.md`). The first-pass courtyard photograph was withdrawn because it shows three stories; the courtyard is now carried by the covered walkway and fire table photographs, with no wide establishing shot (open gap).
- Accommodations opens through a suite doorway rather than the window grid; the window-grid reveal remains the transition between suites.
- `/dev/creative` is the review surface; it is a 404 in production.

## 6. Next: animation lab experiments

Prerequisites, all met at the end of Milestone 2: final logo paths in `src/brand/logo.ts`; every homepage chapter and transition endpoint has an accepted photograph with a focal point (`src/content/photos.ts`); `src/lib/motion.ts` gates reduced motion and WebGL; three, R3F and drei are still to be added and need approval at the lab milestone.


1. Arch-open mask: SVG path clip morph from logo arch to viewport, scrubbed and pinned, tested on Safari and Firefox.
2. Mist displacement shader on the opening photo: cost under 2ms per frame on a mid-range laptop GPU; static fallback.
3. Shader photo-to-photo blend with a directional mask (door line), driven by one GSAP uniform.
4. Window-grid staggered mask reveal (CSS only).
5. Horizontal pinned "day" sequence for Lifestyle, with keyboard and reduced-motion fallbacks.
6. Full-screen gallery viewer: focus trap, arrow keys, crossfade, preloading.
7. Performance budget check: LCP under 2.5s on 4G with the 3840px masters served through `next/image`.

## 7. Animation lab results (Milestone 3)

Lab at `/dev/animation-lab` (development only). Recordings and frames in `review/m3/` (gitignored).

| Experiment | Verdict | Use |
| --- | --- | --- |
| A. Threshold opening, SVG mask | Recommended | Homepage opening. The logo's doorway becomes the first frame; skippable by any scroll, key or touch; no-JS and reduced-motion show the finished layout. |
| A. Threshold opening, WebGL arch | Not recommended | Visually close to the mask version for a WebGL dependency and a texture wait; keep the mask version. |
| B. Shader transitions | Arch: recommended; dolly: refine; displacement: reject | Arch for homepage chapter cuts and the gallery viewer. Dolly reads as a soft crossfade on busy photographs. The sliding panel reads as a generic wipe. |
| C. Architectural journey | Recommended, shorten | Homepage middle section. DOM and CSS only (WebGL added nothing). Four screens of pinned scroll is the upper limit; consider three cuts. |
| D. Spatial gallery | Refine | Gallery page on desktop only. Strong idea; photographs are small on phones, so mobile keeps the grid. |
| E. Editorial compositions | Recommended | Internal pages: expanding photograph (Our home), layers (Our home design), sticky rooms (Our home rooms, Amenities). |
| F. Page transitions | Recommended | All internal links, via React `<ViewTransition>`; no internal Next APIs. |
| G. Inquiry interaction | Recommended for the inquiry milestone | Flip from button to panel; validation pattern and large targets carry into the real form. |

Lessons: Next keeps visited routes in hidden `<Activity>` trees (effects clean up, DOM stays), so WebGL canvases must unmount on effect cleanup (`LabCanvas` does). Page server components render in parallel with layouts, so every dev page gates itself (`devOnly()`).

Measured frame timing (Playwright Chromium, 1440 x 900, rAF intervals during each animation): Intel UHD Graphics (Direct3D 11): 59 to 60 fps everywhere, p95 16.8 ms. SwiftShader software WebGL: shader transitions 55 fps with p95 33 ms; DOM-only experiences 56 to 60 fps. JS heap about 26 MB. Not yet measured on phones or low-end Android GPUs.

## 8. Homepage (Milestone 4)

Sequence: Threshold opening hero (SVG mask, once per session) / Welcome (expanding photograph) / pinned journey with two cuts (arch, sliding door) / sticky suites / Lavender collage of everyday life / Dining letterbox with overlapping plate / Support under the arch (no motion) / Outdoors with the WebGL arch shader (scroll-scrubbed, CSS clip fallback) / Family on Royal / sliding gallery wall / Invitation with steps and the inquiry panel.

Kept from the lab: A (mask), B (arch shader, Outdoors only), C (shortened to three scenes), E (expand, layers, sticky rooms), G (inquiry panel). Not used: A-WebGL, sliding-panel and step-forward shaders, D (gallery milestone), F (page transitions: waits for real internal pages).

## 9. Refinement (Milestone 5)

- Outdoors arch moved from the WebGL shader to a CSS clip. Frame review at 0/25/50/75/100% showed the shader arch grew past the frame by 25% and read only as a moving edge, while the CSS arch reads as the Threshold doorway throughout. The homepage now ships no three.js; the shader stays in the lab.
- Suites: each suite holds the frame for about 90svh, triggers at 40% of the viewport, crossfades instead of wiping, and labels the photograph with "n of 3" and the suite name.
- SplitText line masks are reverted after the reveal, and masked headings use line-height 1.08, so descenders are never cut.
- Outdoors stage sits below the fixed header; its copy panel scrolls on short screens.
- Mid-page inquiry action after the suites; text and footer links meet 44px targets.
- Links to unbuilt routes do not prefetch (avoids 404 prefetch requests) until the pages exist.

## 10. Milestone 6.1 refinements
- Accommodations: the headline comes first, beside a tall arched doorway photograph. The three suites form distinct chapters:
  - Studio: full-bleed photograph with a lifted Cloud panel.
  - One-bedroom: on Midnight, a sticky statement beside a tall photograph.
  - Lakeside: wide 16:8 frame above two-column text.
- Page endings use three variants of `Related`: "next" on tour pages (a large next-chapter link plus the visit action), "invite" on About and Our team (a Midnight band), and "quiet" on documents and help pages. Gallery closes on a full-bleed exterior photograph carrying the intro's final sentence and `page.cta`.
- Dining: plate drift is capped at 10% so it no longer reaches the heading (minimum gap 38 px on mobile, 74 px or more on desktop). Lifestyle: both photographs in the pair use the same drift. Care and support: below 1024 px it has a sticky contents strip, calmer type, numbered areas of help and two existing photographs. Outdoors: photographs stack below 768 px, and the desktop arch is unchanged.
- Homepage:
  - The hero headline scales with viewport height so it clears the navigation on short screens.
  - The Rooms sticky frame is capped at `100svh - 18rem` so the photograph and caption stay in view.
  - The Everyday lower row moved left to fill the empty corner.
- H1 scale by page type: documents 3.75rem, care 4rem, editorial default 5rem, expressive 6rem (Accommodations).
- Motion: `src/motion/gsap.ts` registers ScrollTrigger and SplitText. Flip registers in Inquiry (home and contact only), and Observer in the lab gallery. Page transitions and ScrollTrigger cleanup are covered by Playwright.
- Responsive sweep: all 19 routes at 1920, 1440, 1280, 1024, 768, 390 and 320 widths, plus 1366x650 and 390x600. No overflow; screenshots are in `review/m6/sweep/`.
- Initial JavaScript per route (production, gzip): home 254 KB, contact 250 KB, other routes 235 to 236 KB. No three.js, lab code or standalone Observer on public routes. No comparable M5 baseline exists.
- Lighthouse (production, one run each; Gallery mobile repeated after an outlier):
  - Performance: desktop 99 to 100, mobile 90 to 96.
  - Accessibility: 100, except the article at 98 (`heading-order`, since fixed).
  - Best Practices: 100.
  - SEO: 69 by design, because noindex fails `is-crawlable`.
  - CLS: 0 everywhere. Mobile LCP 2.8 to 3.5 s; the main opportunities are render-blocking CSS, unused JS and responsive images, deferred to the performance milestone.
- Accessibility: automated axe and keyboard coverage only. Manual screen-reader testing is deferred to Milestone 10, and no full WCAG compliance is claimed.

## 11. Gallery exhibition (Milestone 7)
- Design: the conventional gallery stays the default. An "Enter the exhibition" button in the filter row opens a full-viewport dialog. Photographs hang at eye level on a gently curved wall (radius 26, viewer 9 units in front, pivot behind the viewer) on Midnight. Spacing follows each photograph's real width. The photograph in front is lit, and neighbors are dimmed by a color multiply. "Look closer" (or a tap on the wall) dollies the camera with a GSAP timeline until the photograph fits whole at 90% of the view; the fit uses the viewport aspect, so photographs are never cropped. "Step back" or Escape returns.
- Changes from lab experiment D:
  - The curated ID list is replaced by content groups.
  - Lab textures are replaced by `/_next/image` URLs at w=1280.
  - Fixed angular steps are replaced by width-aware spacing.
  - The camera no longer sits at the circle center, so photographs are larger and the arc no longer wraps behind the viewer.
  - Focus fits by aspect.
  - Chapters use the gallery categories ("All" hangs two per category, at most 18 per wall).
  - Observer is replaced by native pointer events.
  - Full size reuses the existing viewer, stacked above the exhibition.
- Lifecycle:
  - `Exhibition.tsx` (DOM) imports `ExhibitionCanvas.tsx` dynamically, so three.js loads only on entry.
  - One context through `GLCanvas` with demand rendering and DPR at most 1.75.
  - The texture working set is the photograph in front plus two either side (`useTextureSet` disposes textures that leave it), in sRGB without mipmaps.
  - Closing unmounts the canvas. A context loss while open (`GLCanvas onLost`) closes the dialog and shows a status note; the gallery stays usable.
- Accessibility: the canvas is `aria-hidden`. Chapters, Previous, Next, Look closer, Full size and Back to gallery are buttons, and the caption (position, chapter, alt text) is `aria-live`. Arrow keys move along the wall, and Escape steps back or closes. Focus starts on "Back to gallery" and returns to the opener. The offer is hidden for reduced motion, no WebGL, and widths below 768 px (phones keep the conventional gallery). Manual screen-reader testing is deferred to M10.
- Performance (production, `next start`):
  - Default gallery Lighthouse: desktop 99 (LCP 0.8 s, CLS 0, JS 240 KB, images 937 KB); mobile 91 (LCP 3.4 s, TBT 73 ms, JS 227 KB, images 621 KB). This matches the M6.1 baseline; a CLS of 0.018 from the first offer placement was fixed by moving the offer into the filter row.
  - Entering the exhibition adds 251 KB of JS and 3 textures (564 KB); each step fetches about one more texture.
  - Frame intervals with SwiftShader software WebGL in headless Chromium are 16.7 ms median and p95 during a turn and a focus. That is browser frames, not GPU throughput; there is no physical-GPU or real-device measurement.
  - JS heap after 6 open/close cycles: 10.7 MB before, 9.1 MB after, with no live canvases left.
- Limitations: no physical-device or GPU testing; no phone exhibition by design; no arch mask or shader transition (a camera dolly read cleaner than a mask in review); no M10 screen-reader pass.
- M8 (Sanity): the exhibition reads the same gallery groups (category, alt text, dimensions). Images must keep `width` and `height` in the query, and the texture URL should move to the Sanity image CDN (w=1280, auto format) when it is connected.
