# Phase 2: Complete Arabic Article Journey — Specification

**Created:** 2026-08-26
**Ambiguity score:** 0.04 (gate: ≤ 0.20)
**Requirements:** 10 locked

## Goal

As an Arabic reader, I want to read a complete accessible article and reach its matching YouTube video, so that I can learn even when media or JavaScript is unavailable.

## Background

Phase 1 provides one validated Markdown/MDX collection, stable final Arabic article routes, explicit draft exclusion, a restricted MDX component surface, and minimal `<html lang="ar" dir="rtl"><main><article>` proof markup. The route currently renders only a title, an unlabelled summary paragraph, and article body: it has no shared reader layout, visible section/author/date facts, reference presentation, responsive reading styles, explicit bidirectional isolation, focus treatment, YouTube player, or resilient direct-video action. Phase 2 turns that proof route into the complete reusable article journey while retaining static output and the Phase 1 trust boundaries.

## Requirements

1. **Arabic-only article surface**: Every reader-facing label, instruction, status, and control in the article journey is Arabic, and the document exposes Arabic language and right-to-left semantics.
   - Current: The root document has `lang="ar"` and `dir="rtl"`, but the article shell has almost no reader-facing interface to test.
   - Target: The shared public article surface and all media fallbacks use Arabic labels; technical identifiers or URLs are isolated without becoming English interface copy.
   - Acceptance: Browser and DOM inspection of both Markdown and MDX routes find `lang="ar"`, `dir="rtl"`, and no accidental English reader-facing label or control text.

2. **Complete text-first article**: Each public article presents one title, a labelled maintained الخلاصة, an introduction, logically ordered section headings and body, and a conclusion without requiring video playback or client-side JavaScript.
   - Current: Title, summary, and arbitrary body render, but the summary is unlabelled and the proof records do not demonstrate the complete structure.
   - Target: The reusable article contract and proof content expose the full ordered reading sequence with exactly one page-level heading and no skipped heading level.
   - Acceptance: Static HTML inspection with JavaScript disabled finds the title, labelled الخلاصة, introduction, ordered headings/body, and conclusion in meaningful DOM order; heading checks report one `h1` and no skipped levels.

3. **Visible provenance and references**: The article visibly identifies its Arabic section, Ahmed El-Mangawy as author, truthful publication date, optional material-update date, and declared references where claims rely on sources.
   - Current: These facts are validated in frontmatter but are not rendered, and no structured reference presentation exists.
   - Target: The article header/footer renders section, author, UTC-stable Arabic-formatted dates, and a semantic reference list when reference entries exist; absent optional updates or references create no empty UI.
   - Acceptance: A proof article with publication, update, and reference data renders each fact once; a record without optional data renders no empty update/reference container; malformed reference data fails the build.

4. **Responsive Arabic readability**: Long-form content remains readable and reflows without clipping or page-level horizontal scrolling from 320 CSS pixels through 1440 CSS pixels and at 200% browser zoom.
   - Current: Only the native viewport is declared; there is no width, line-length, type, spacing, media, or overflow treatment.
   - Target: Mobile-first, fluid reader styles use relative units, a readable Arabic line height, a bounded text measure, and wrapping rules that preserve content at representative widths and zoom.
   - Acceptance: Browser checks at 320, 390, 768, 1024, and 1440 CSS pixels plus 200% zoom show `scrollWidth <= clientWidth`, no clipped text/control, and readable body text of at least 1rem.

5. **Bidirectional isolation**: URLs, dates, numbers, punctuation, video identifiers, code-like fragments, and other left-to-right values appear in the intended order within RTL prose.
   - Current: The root direction is RTL, but no mixed-direction fragment contract exists.
   - Target: The rendered article uses native direction/isolation semantics for left-to-right fragments while ordinary Arabic prose remains RTL.
   - Acceptance: DOM inspection finds explicit isolation/direction on representative mixed fragments, and visual checks at mobile and desktop widths show no reordered or overlapping characters.

6. **Semantic and assistive-technology structure**: The article uses native landmarks, article semantics, descriptive headings/links, meaningful alternatives for non-text content, and an accessible Arabic name for each media action.
   - Current: `<main>` and `<article>` exist, but there is no complete landmark/heading/action structure or non-text/media treatment.
   - Target: Static markup provides a logical reading order and accessible names without unnecessary ARIA or custom widgets; repetitive content, if introduced, has a working Arabic bypass link.
   - Acceptance: Automated accessibility checks report zero serious/critical violations, and accessibility-tree inspection exposes the expected Arabic document, article, heading, link, and button names in logical order.

7. **Keyboard and focus operation**: Every interactive article control is reachable and operable by keyboard, has a visible high-contrast focus indicator, meets a 44×44 CSS-pixel target where not an inline text-link exception, and creates no keyboard trap.
   - Current: The proof article has no interactive controls.
   - Target: Native links/buttons provide activation and focus behavior; loading the player preserves a logical focus path and never traps Tab or Shift+Tab.
   - Acceptance: A keyboard-only pass can reach and activate the player action and direct link, visibly track focus, and continue past every control in both directions with no trap.

8. **Intent-gated privacy-enhanced player**: The real YouTube iframe is absent from initial HTML and network activity, appears only after explicit reader activation, uses the privacy-enhanced YouTube host, reserves a responsive 16:9 region before activation, and does not autoplay.
   - Current: Only a validated `youtubeId` exists; there is no player or media UI.
   - Target: A lightweight native enhancement replaces an Arabic placeholder action with one labelled `youtube-nocookie.com` iframe after click while preserving dimensions and avoiding a client framework.
   - Acceptance: Initial DOM/network inspection finds zero iframe and YouTube requests; one activation creates exactly one labelled privacy-enhanced iframe without autoplay; its reserved region does not change dimensions materially.

9. **Permanent direct YouTube path**: Every article includes a prominent descriptive Arabic link to the exact matching YouTube video that remains usable when JavaScript, the iframe, third-party cookies, or player loading is unavailable.
   - Current: The video identifier is validated but no outbound link renders.
   - Target: Static HTML always contains a same-tab `https://www.youtube.com/watch?v={youtubeId}` link with an Arabic accessible name that distinguishes the destination/action.
   - Acceptance: With JavaScript disabled and the YouTube embed host blocked, the link remains present, keyboard-operable, and resolves from the article's validated video identifier.

10. **Static, lightweight, regression-safe delivery**: The complete article journey stays statically generated, preserves Phase 1 content/draft/MDX guarantees, and adds no UI framework, eager third-party media, runtime backend, or speculative site-wide surface.
   - Current: Production builds two public proof routes with no client scripts and excludes the draft.
   - Target: Article text and direct action remain static; only the smallest intent-gated media enhancement is shipped; all Phase 1 tests and production draft exclusion continue to pass.
   - Acceptance: The exact-runtime full gate passes, both public routes build, the draft route is absent, restricted MDX tests remain green, and output inspection finds no framework runtime or eager iframe.

## Boundaries

**In scope:**
- One reusable Arabic article reader layout applied to the existing final route family.
- Complete text-first article structure, labelled الخلاصة, provenance, dates, and conditional references.
- Minimal mobile-first reader styling, mixed-direction isolation, visible focus, and WCAG 2.2 AA-oriented semantics.
- One intent-gated privacy-enhanced YouTube player and one permanent direct-video link per article.
- Content-contract additions strictly required to render truthful references or article facts.
- Updated proof content and focused automated/browser checks for Markdown, approved MDX, no-JavaScript fallback, keyboard use, responsive reflow, and draft exclusion.

**Out of scope:**
- Homepage, primary-section indexes, global navigation, About/author page, or real launch corpus — Phase 3 owns discovery and launch content.
- Page titles, meta descriptions, canonicals, social metadata, sitemap, robots directives, or Arabic 404 page — Phase 4 owns search-discovery identity.
- Production domain, hosting, Search Console, analytics, or outbound-click reporting — Phase 5 owns deployment and measurement.
- Production Core Web Vitals and whole-site crawl certification — Phase 6 owns production verification.
- CMS, database, authentication, search, comments, related-content engine, autoplay, sticky/popover player, transcripts, or timestamp navigation — excluded or trigger-based later scope.
- A broad design system, UI framework, animation system, icon library, or decorative visual assets — unnecessary for the minimal article journey.

## Constraints

- Preserve exact Node 24.19.0, npm 11.17.0, Astro 7.2.7, static output, trailing slashes, one content model, and the restricted MDX boundary.
- Use platform HTML/CSS/JavaScript and already-installed dependencies; no package is added unless a demonstrated acceptance criterion cannot be met otherwise.
- Target WCAG 2.2 AA for applicable Phase 2 surfaces, including 320px reflow, 200% text resize, 4.5:1 normal-text contrast, 3:1 UI/focus contrast, visible focus, and no keyboard trap.
- Use mobile-first fluid layout, relative units, body text of at least 1rem, comfortable Arabic line height, and a readable measure near 65–75 characters.
- Do not render or request the real iframe before reader intent; do not autoplay; retain a static direct-video link regardless of enhancement state.
- No `.env` file may be read or created for this phase.

## Acceptance Criteria

- [ ] Both public proof routes render Arabic-only article UI with `lang="ar"` and `dir="rtl"`; the production draft route remains absent.
- [ ] JavaScript-disabled static HTML contains the complete title → الخلاصة → introduction → ordered body headings → conclusion journey.
- [ ] The article presents section, author, truthful publication/update facts, and conditional semantic references without empty optional UI.
- [ ] Representative mixed-direction values preserve their intended order through native direction/isolation semantics.
- [ ] At 320, 390, 768, 1024, and 1440 CSS pixels and at 200% zoom, no page-level horizontal overflow, clipped content, or overlapping controls occurs.
- [ ] Automated accessibility checks report zero serious/critical violations on Markdown and MDX routes.
- [ ] Keyboard-only operation reaches and activates all article controls with visible focus, 44px comfortable targets where applicable, and no trap.
- [ ] Initial page HTML/network activity contains no YouTube iframe/request; one explicit activation creates one non-autoplaying `youtube-nocookie.com` iframe in a dimension-reserved region.
- [ ] A prominent Arabic direct-video link remains present and operable with JavaScript disabled and the player blocked.
- [ ] Exact-runtime tests, Astro diagnostics, production build, Phase 1 contract matrix, public-route output, and draft exclusion all pass.

## Ambiguity Report

| Dimension | Score | Min | Status | Notes |
|-----------|------:|----:|:------:|-------|
| Goal Clarity | 0.97 | 0.75 | ✓ | One end-to-end reader outcome with explicit degraded modes. |
| Boundary Clarity | 0.96 | 0.70 | ✓ | Phase 3–6 and deferred surfaces are named explicitly. |
| Constraint Clarity | 0.94 | 0.65 | ✓ | Runtime, static delivery, WCAG, width/zoom, privacy, and dependency limits are measurable. |
| Acceptance Criteria | 0.96 | 0.70 | ✓ | Ten pass/fail gates cover text, media, resilience, accessibility, and regression. |
| **Ambiguity** | **0.04** | **≤0.20** | **✓** | Weighted clarity 0.96. |

## Interview Log

The user pre-approved the agent's recommended answers for every gray area, so the one-shot questionnaire was resolved in `--auto` style after codebase scouting.

| Round | Perspective | Question summary | Decision locked |
|-------|-------------|------------------|-----------------|
| 1 | Researcher | What exists and what is missing from the Phase 1 proof route? | Reuse the validated collection/final route; add only the complete reader journey and focused contract additions. |
| 2 | Simplifier | What is the irreducible article experience? | Text-first title, labelled summary, structured body, provenance, conclusion, direct video link, and intent-gated player. |
| 3 | Boundary Keeper | Which adjacent surfaces stay out? | Homepage/index/About, SEO metadata/discovery files, deployment, analytics, and production certification remain in Phases 3–6. |
| 4 | Failure Analyst | What must still work when media or enhancement fails? | Full article and permanent direct-video link work without JavaScript, cookies, iframe, or player host. |
| 5 | Seed Closer | What responsive/accessibility limits are binding? | WCAG 2.2 AA-oriented native semantics, 320px/200% reflow, visible focus, keyboard operation, 44px targets, and mixed-bidi isolation. |
| 6 | Seed Closer | When may YouTube load and where should the direct link go? | Explicit click only; one non-autoplay privacy-enhanced iframe; permanent same-tab link to the exact matching video. |

---

*Phase: 02-complete-arabic-article-journey*
*Spec created: 2026-08-26*
*Next step: $gsd-discuss-phase 2 — implementation decisions (how to build what is specified above)*
