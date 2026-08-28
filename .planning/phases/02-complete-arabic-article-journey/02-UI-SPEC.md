---
phase: 2
slug: complete-arabic-article-journey
status: approved
shadcn_initialized: false
preset: none
created: 2026-08-26
reviewed: 2026-08-26
---

# Phase 2 — UI Design Contract

> Approved visual and interaction source of truth for the complete Arabic article journey. Final review passed 24/24 and UAT passed 9/9.

---

## Phase Scope Contract

Build one calm, single-column Arabic article reader inside the existing `/{section}/{slug}/` route. The page must communicate the complete article before presenting its YouTube continuation. It has no global navigation, homepage treatment, section index, author page, SEO presentation layer, analytics UI, search, related content, theme switcher, animation, or decorative media.

Document order is fixed:

1. One article title (`h1`)
2. Visible section, author, publication date, and optional material-update date
3. Labelled `الخلاصة`
4. Introduction, ordered body headings and prose, and conclusion
5. Conditional `المراجع`
6. `الفيديو المرتبط بالمقال`, the intent-gated player, and the permanent direct YouTube action

The direct YouTube action is the primary continuation path. The embedded player is optional progressive enhancement. No article meaning may depend on the player or JavaScript.

**Source:** `02-SPEC.md` requirements 1–10 and `02-CONTEXT.md` decisions D-01–D-22.

---

## Design System

| Property          | Value                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| Tool              | none — native HTML, scoped/global CSS, and minimal browser JavaScript                                          |
| Preset            | not applicable                                                                                                 |
| Component library | none                                                                                                           |
| Icon library      | none; controls use Arabic text labels                                                                          |
| Font              | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Tahoma, Arial, sans-serif`; local system fonts only |

`components.json` is absent and the project is Astro without React, Next.js, or Vite application UI. The shadcn initialization gate and registry vetting gate are therefore not applicable. Add no UI package, webfont, image, thumbnail, icon, or decorative asset for this phase.

---

## Spacing Scale

Declared values (all multiples of 4):

| Token | Value | Usage                                                       |
| ----- | ----- | ----------------------------------------------------------- |
| xs    | 4px   | Inline punctuation-safe gaps and very tight label spacing   |
| sm    | 8px   | Metadata item gaps and heading-to-supporting-copy gaps      |
| md    | 16px  | Mobile page padding, control padding, prose element spacing |
| lg    | 24px  | Desktop page padding, summary/media inner padding           |
| xl    | 32px  | Article subsection separation                               |
| 2xl   | 48px  | References and media section separation                     |
| 3xl   | 64px  | Desktop page start/end breathing room                       |

Exceptions: standalone controls have a `44px` minimum block size and minimum comfortable target in both axes. Inline prose links are the only target-size exception. Borders are `1px` and the focus outline is `3px`; these are rendering strokes, not spacing tokens.

### Layout application

- At widths below `48rem`, use `16px` page padding and `32px` block padding.
- At `48rem` and above, use `24px` page padding and `64px` block padding.
- Center the article with `margin-inline: auto` and cap the reading column at `70ch`.
- Keep all header, summary, prose, references, and media content in the same column; no sidebar or multi-column state exists.
- Use `32px` between substantive article sections and `48px` before references and the media continuation.
- Use logical properties only: `padding-inline`, `margin-block`, `border-inline-start`, and `text-align: start`.

**Source:** 8-point default scale, constrained by `02-CONTEXT.md` D-07, D-09, and D-13.

---

## Typography

Use exactly four sizes and two weights. Do not introduce one-off sizes.

| Role    | Size              | Weight | Line Height |
| ------- | ----------------- | ------ | ----------- |
| Body    | 18px (`1.125rem`) | 400    | 1.9         |
| Label   | 14px (`0.875rem`) | 700    | 1.6         |
| Heading | 24px (`1.5rem`)   | 700    | 1.4         |
| Display | 32px (`2rem`)     | 700    | 1.3         |

Application rules:

- The `h1` uses Display. Article `h2` headings use Heading. `h3` uses Body size at weight 700. No lower level is visually larger than its parent.
- Metadata uses Label; long-form prose, summary, lists, references, and control labels use Body unless the compact metadata role applies.
- Keep paragraph measure at no more than `70ch`, start-aligned, never justified.
- Use `text-wrap: balance` only on headings. Do not truncate article text, metadata, reference labels, or control labels.
- Use `overflow-wrap: anywhere` for visible URLs, identifiers, and other unbroken fragments. Do not hide overflow to mask a reflow defect.
- Keep `letter-spacing: normal` so Arabic joining and diacritics remain intact. Do not uppercase, track out, or stylize Arabic labels.
- Use `font-synthesis: none`; use only weights 400 and 700 from the chosen system fallback.
- Link underlines remain visible, use font-derived thickness/position where supported, and skip ink.

**Source:** `02-CONTEXT.md` D-08–D-10 plus the selected better-typography guidance. Values are phase defaults within the locked body-size, measure, and reflow constraints.

---

## Color

This is a fixed light reading surface for Phase 2. Do not add dark mode or theme controls.

| Role              | Value          | Usage                                                                                         |
| ----------------- | -------------- | --------------------------------------------------------------------------------------------- |
| Dominant (60%)    | `#FFFDF8`      | Page and article background                                                                   |
| Secondary (30%)   | `#F5F1E8`      | Summary block and reserved media region only                                                  |
| Accent (10%)      | `#166534`      | Primary CTA background, secondary CTA border/text, link text/underline, visible focus outline |
| Destructive       | not applicable | This phase has no destructive action                                                          |
| Primary text      | `#1C1917`      | Headings and body copy                                                                        |
| Secondary text    | `#57534E`      | Metadata and supporting copy                                                                  |
| Structural border | `#78716C`      | Summary/media/reference separators where a boundary is needed                                 |
| Accent strong     | `#14532D`      | Hover/active state for filled CTA only                                                        |

Accent is reserved for: the permanent YouTube CTA, the player activation button, ordinary text links, and `:focus-visible` outlines. Do not use it for headings, metadata, card decoration, bullets, or ornamental rules.

Contrast evidence against the dominant surface: primary text `17.20:1`, secondary text `7.50:1`, accent `7.01:1`, and structural border `4.72:1`. White CTA text on accent is `7.13:1`. These values exceed the Phase 2 WCAG AA text and focus/UI minimums.

The primary CTA is a filled accent link with white text. The player button is secondary: transparent/secondary background, `2px` accent border, and accent text. Text links are always underlined; hover thickens the underline and never relies on color alone. Every interactive element uses a `3px solid #166534` `:focus-visible` outline with `3px` offset.

**Source:** exact values are researcher defaults under `02-CONTEXT.md` D-10 and D-12; the reserved-for list follows D-15–D-18.

---

## Copywriting Contract

All text below is reader-facing Arabic and must be used exactly except for interpolated article facts.

| Element                  | Copy                                                                |
| ------------------------ | ------------------------------------------------------------------- |
| Summary heading          | `الخلاصة`                                                           |
| Section fact             | `القسم: {اسم القسم}`                                                |
| Author fact              | `الكاتب: أحمد المنجاوي`                                             |
| Publication fact         | `نُشر في: {التاريخ}`                                                |
| Optional update fact     | `حُدّثت المادة في: {التاريخ}`                                       |
| References heading       | `المراجع`                                                           |
| Media heading            | `الفيديو المرتبط بالمقال`                                           |
| Player privacy note      | `لن يُحمَّل مشغّل يوتيوب إلا بعد اختيارك التشغيل.`                  |
| Player activation        | `تشغيل الفيديو هنا`                                                 |
| Primary CTA              | `مشاهدة الفيديو على يوتيوب`                                         |
| Iframe accessible title  | `فيديو المقال: {عنوان المقال}`                                      |
| Player activation error  | `تعذّر تشغيل الفيديو هنا. يمكنك مشاهدة الفيديو مباشرةً على يوتيوب.` |
| Empty state heading      | none — an article route is generated only for a validated record    |
| Empty state body         | none — absent optional updates or references are omitted completely |
| Destructive confirmation | none — no destructive actions exist in this phase                   |

Do not use vague link text such as `اضغط هنا`, expose raw English control labels, or add “opens in a new window” copy: all links in this phase open in the same tab. A reference link uses its validated, descriptive Arabic label rather than its raw URL as the visible name.

**Source:** `02-CONTEXT.md` D-02–D-06, D-13, D-16–D-18 and the approved specifics; exact microcopy is researcher discretion.

---

## Component Inventory and Visual Anatomy

These are semantic responsibilities, not a mandate to create one file per row. Reuse the existing route and introduce only the smallest component boundary that prevents duplication.

| Surface            | Required anatomy                                                              | Visual contract                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Article shell      | `main > article`                                                              | Single centered reading column on the dominant surface; no card shell, shadow, decorative header, or sidebar                          |
| Article header     | `h1` followed by a semantic fact list                                         | Title is the strongest element; metadata is quieter, wraps naturally, and never uses visual-only separators that leave empty remnants |
| Summary            | `section` + `h2` + summary prose                                              | Secondary surface, `24px` padding desktop / `16px` mobile, one structural start-edge or full border, no icon                          |
| Article prose      | authored introduction, ordered headings, paragraphs, lists, quotations, links | Consistent vertical rhythm; headings descend; long fragments wrap; complete text remains selectable                                   |
| References         | conditional `section` + `h2` + semantic list                                  | Render only with at least one reference; each Arabic label is a normal underlined HTTPS link                                          |
| Media continuation | `section` + `h2` + privacy note + 16:9 region + permanent CTA                 | Quiet reserved region, text-only activation, no thumbnail/poster request, no autoplay, no spinner or motion                           |

The registered Arabic section label comes from `sectionRegistry`; the author name comes from `authorRegistry`. Never duplicate these display facts in article frontmatter or body copy.

---

## Responsive and Reflow Contract

- Support a continuous range from `320px` through `1440px`; the specified `48rem` spacing breakpoint changes padding only.
- Keep the same DOM order and one-column layout at every width. Do not move metadata, references, or media into side rails.
- At `200%` browser zoom, all text and controls reflow in the available inline size with no overlap or clipping.
- The page must satisfy `document.documentElement.scrollWidth <= document.documentElement.clientWidth`; do not use global `overflow-x: hidden` as a workaround.
- Set `min-inline-size: 0` on layout children that could otherwise force overflow.
- The media region uses `inline-size: 100%` and `aspect-ratio: 16 / 9`; the placeholder and iframe occupy the same box.
- Standalone button/link labels may wrap to multiple lines while retaining at least `44px` block size and centered readable text.
- Apply `max-inline-size: 100%` to any meaningful author-provided media. Phase 2 itself introduces no image.

Verification widths are exactly `320`, `390`, `768`, `1024`, and `1440` CSS pixels, plus a `200%` zoom pass.

---

## RTL and Bidirectional Contract

- The root remains `<html lang="ar" dir="rtl">`; the article does not override its ordinary Arabic direction.
- Use `text-align: start` and logical CSS properties throughout. No `left`/`right` spacing declarations are allowed in the reader UI.
- Wrap a visible raw URL, YouTube ID, code-like value, or explicitly Latin fragment in `<bdi dir="ltr">`.
- Wrap dates or mixed numeral fragments embedded in Arabic prose in `<bdi dir="auto">` when their direction is not intrinsically supplied by a native element.
- Dates use `<time datetime="YYYY-MM-DD">` with a UTC-stable Arabic long-date presentation, equivalent to `Intl.DateTimeFormat("ar", { dateStyle: "long", timeZone: "UTC" })`.
- Reference destinations and the YouTube URL normally remain in `href` and are represented by descriptive Arabic text, avoiding unnecessary raw URL display.
- Diacritics must remain attached to their Arabic letters; do not apply letter spacing, forced LTR direction, or character-by-character markup to Arabic prose.

---

## Interaction Contract

### Permanent YouTube action

- Render a normal same-tab `<a>` in the initial static HTML with `href="https://www.youtube.com/watch?v={youtubeId}"`.
- Style it as the filled primary CTA and keep it outside the replaceable player region so player mutation cannot remove it.
- It remains visible and operable with JavaScript disabled, cookies blocked, the embed host blocked, or iframe creation failing.
- It is reached in normal DOM order after the player region and has no `target="_blank"`.

### Intent-gated player

1. Initial HTML contains the secondary media surface and privacy note, but no iframe, remote poster, YouTube script, preconnect, or other YouTube request.
2. The native `<button type="button">` starts hidden and is revealed only after its activation handler is registered. A JavaScript-disabled reader must not encounter a dead button.
3. Keyboard Enter/Space or one pointer activation creates exactly one iframe at `https://www.youtube-nocookie.com/embed/{youtubeId}` without an autoplay parameter.
4. The iframe replaces the placeholder inside the existing 16:9 box, receives the accessible Arabic title, and is programmatically focused after insertion so focus is not lost with the removed trigger.
5. The handler is one-shot/idempotent: repeat activation cannot create a second iframe.
6. Tab and Shift+Tab can continue into and past the iframe without a page-level trap.
7. If iframe construction throws, keep the permanent CTA untouched and expose the specified Arabic error in a nearby polite status. Do not attempt to infer cross-origin playback success.

No hover-only behavior, autoplay, sticky state, popover, fullscreen custom control, loader animation, skeleton, transition, or keyboard shortcut is part of this phase.

---

## Accessibility Contract

- Use native `main`, `article`, `section`, headings, `dl`/`dt`/`dd` (or an equally semantic fact list), `time`, lists, links, and button before ARIA.
- Provide exactly one `h1`. The labelled summary, references, media section, and authored major sections use `h2`; nested article subsections use `h3` without skipped levels.
- Do not add a bypass link in Phase 2 because there is no repetitive navigation block. If Phase 3 adds such a block, its shared layout owns the Arabic bypass link.
- Every link and button has its descriptive visible Arabic name. The iframe has the interpolated Arabic title. There are no icon-only controls.
- All controls participate in native tab order; do not use positive `tabindex`.
- Use `:focus-visible` exactly as defined in the color contract and never remove outlines without that replacement.
- Standalone controls meet the `44px` target; inline prose/reference links remain the accepted WCAG target-size exception.
- Normal text contrast is at least `4.5:1`; control boundaries and focus indicators are at least `3:1` against adjacent surfaces.
- The full article and direct action remain available without JavaScript. A blocked enhancement never hides or disables static content.
- No motion is introduced, so no reduced-motion variant is required. No media autoplays.
- Automated checks must report zero serious or critical accessibility violations, followed by manual heading, accessible-name, keyboard, focus, and no-trap checks on both Markdown and approved MDX routes.

**Source:** `02-SPEC.md` requirements 6–9, `02-CONTEXT.md` D-11–D-18, and selected fixing-accessibility guidance.

---

## State Matrix

| State                       | Required result                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| Published Markdown          | Complete article order, facts, conditional references, player region, and direct CTA render statically |
| Published approved MDX      | Same shell, order, type, spacing, semantics, and media behavior as Markdown                            |
| No update date              | No update label, empty container, separator, or reserved gap                                           |
| No references               | No references heading, container, separator, or reserved gap                                           |
| JavaScript disabled         | Full article and primary YouTube CTA remain; no dead activation button and no iframe                   |
| YouTube embed blocked       | Full article and primary YouTube CTA remain usable                                                     |
| Third-party cookies blocked | Full article and primary YouTube CTA remain usable; embed still targets privacy-enhanced host          |
| Player activated once       | One non-autoplay iframe occupies the already reserved box and receives focus                           |
| Player activation repeated  | No second iframe and no duplicated status/control                                                      |
| Player construction error   | Arabic error appears; permanent CTA remains unchanged                                                  |
| Keyboard only               | Trigger and direct CTA activate natively, focus is always visible, and focus exits both directions     |
| 320px / 200% zoom           | One-column reflow, wrapped labels/fragments, no horizontal page overflow                               |
| Draft in production         | No route and therefore no reader UI                                                                    |

---

## Registry Safety

| Registry        | Blocks Used | Safety Gate                                                |
| --------------- | ----------- | ---------------------------------------------------------- |
| shadcn official | none        | not applicable — shadcn is not initialized                 |
| third-party     | none        | no registry or block declared; codebase checked 2026-08-26 |

No registry code may enter Phase 2. The only permitted UI inputs are the repository’s own registries, validated content, native platform elements, and existing Astro rendering boundary.

---

## Visual Exclusions

Do not add cards around the whole article, hero artwork, gradients, shadows, rounded-pill metadata, badges, icons, remote thumbnails, webfonts, dark mode, animation, a table of contents, related links, share buttons, sticky controls, breadcrumbs, site navigation, or a footer. Each is either decorative, speculative, or owned by another phase.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved — final UI review passed 24/24 and Phase 2 UAT passed 9/9
