# Phase 2: Complete Arabic Article Journey - Context

**Gathered:** 2026-08-26
**Status:** Ready for UI specification and planning

<domain>
## Phase Boundary

Phase 2 turns the existing validated final article route into one complete Arabic, right-to-left, accessible, text-first reading journey with truthful provenance, resilient YouTube continuation, and a deliberately tiny client enhancement. It does not add discovery pages, production SEO identity, deployment, analytics, or production certification.

</domain>

<spec_lock>
## Requirements (locked via SPEC.md)

**10 requirements are locked.** See `02-SPEC.md` for full requirements, boundaries, and acceptance criteria.

Downstream agents MUST read `02-SPEC.md` before planning or implementing. Requirements are not duplicated here.

**In scope (from SPEC.md):**
- One reusable Arabic article reader layout applied to the existing final route family.
- Complete text-first article structure, labelled الخلاصة, provenance, dates, and conditional references.
- Minimal mobile-first reader styling, mixed-direction isolation, visible focus, and WCAG 2.2 AA-oriented semantics.
- One intent-gated privacy-enhanced YouTube player and one permanent direct-video link per article.
- Content-contract additions strictly required to render truthful references or article facts.
- Updated proof content and focused automated/browser checks for Markdown, approved MDX, no-JavaScript fallback, keyboard use, responsive reflow, and draft exclusion.

**Out of scope (from SPEC.md):**
- Homepage, primary-section indexes, global navigation, About/author page, or real launch corpus — Phase 3 owns discovery and launch content.
- Page titles, meta descriptions, canonicals, social metadata, sitemap, robots directives, or Arabic 404 page — Phase 4 owns search-discovery identity.
- Production domain, hosting, Search Console, analytics, or outbound-click reporting — Phase 5 owns deployment and measurement.
- Production Core Web Vitals and whole-site crawl certification — Phase 6 owns production verification.
- CMS, database, authentication, search, comments, related-content engine, autoplay, sticky/popover player, transcripts, or timestamp navigation — excluded or trigger-based later scope.
- A broad design system, UI framework, animation system, icon library, or decorative visual assets — unnecessary for the minimal article journey.

</spec_lock>

<decisions>
## Implementation Decisions

### Complete Article and Provenance
- **D-01:** Keep the article text-first and complete without video or JavaScript: one page title, a visibly labelled `الخلاصة`, an introduction, logically ordered body headings, substantive body, and a conclusion in meaningful document order.
- **D-02:** Render the article's Arabic section, registered author, publication date, and optional material-update date as visible reader facts. Dates must be UTC-stable and formatted for Arabic readers rather than leaking raw implementation-oriented values into prose.
- **D-03:** Add optional structured reference entries at the content-contract boundary. Validate non-empty Arabic-facing labels and permit only explicit HTTPS destinations; malformed entries fail the build.
- **D-04:** Render references as a semantic list under a clear Arabic heading only when entries exist. An absent update date or absent references must produce no empty label, container, separator, or placeholder.
- **D-05:** Preserve the Phase 1 rule that frontmatter keys point to central section and author registries; do not duplicate public author or section facts in article bodies.

### Arabic Reading, Direction, and Typography
- **D-06:** The full article surface is Arabic-only and inherits correct `lang="ar"` and `dir="rtl"` document semantics. Labels, instructions, status text, player controls, and fallback copy must not expose accidental English UI.
- **D-07:** Use a mobile-first, fluid reader from 320 through 1440 CSS pixels and at 200% zoom. Content must reflow without page-level horizontal scrolling, clipped text, or overlapping controls.
- **D-08:** Use locally available Arabic-compatible system fonts; add no webfont request. Body text is at least `1rem`, uses comfortable Arabic line height, and stays within an approximately 65–75 character reading measure.
- **D-09:** Use logical CSS properties and start alignment. Ordinary prose stays RTL; URLs, dates, numbers, identifiers, and code-like mixed-direction values use native isolation/direction elements such as `<bdi>` or an equivalent semantic boundary.
- **D-10:** Heading levels follow document meaning and never skip; visual sizing descends with level. Keep styling restrained, high contrast, and free of decorative effects that compete with long-form reading.

### Semantics, Keyboard, and Focus
- **D-11:** Prefer native landmarks, headings, lists, links, buttons, and time elements. Add ARIA only when native semantics do not supply the required accessible Arabic name or state.
- **D-12:** Every article control is reachable and operable by keyboard, retains a clearly visible high-contrast focus indicator, and creates no focus or keyboard trap.
- **D-13:** Provide approximately 44×44 CSS-pixel comfortable targets for standalone controls; ordinary inline text links remain the applicable exception. Link text must describe its Arabic destination or action without relying on surrounding prose.
- **D-14:** Meaningful non-text content receives an appropriate Arabic alternative; decorative content, if any, remains silent. No autoplay or motion-heavy behavior is introduced.

### YouTube Intent and Resilient Fallback
- **D-15:** Initial HTML and page load contain no YouTube iframe and initiate no YouTube request. Reserve a responsive 16:9 media region so activating the enhancement does not materially shift the article.
- **D-16:** One explicit activation of a native Arabic-labelled button creates exactly one labelled iframe from `https://www.youtube-nocookie.com/embed/{youtubeId}`. It must not autoplay, and repeat activation must not create duplicate players.
- **D-17:** Keep a prominent static Arabic link outside the player enhancement to `https://www.youtube.com/watch?v={youtubeId}`. It opens in the same tab and remains available when JavaScript, third-party cookies, the iframe host, or player loading fails.
- **D-18:** The direct link is the guaranteed continuation path; the iframe is progressive enhancement. Article comprehension never depends on either media path.

### Minimal Static Architecture and Regression Safety
- **D-19:** Reuse the Phase 1 collection, registries, public/preview query split, final dynamic route family, path helpers, and restricted MDX map. Extend the existing contract only for article facts that Phase 2 must render.
- **D-20:** Use platform HTML, CSS, and the smallest native JavaScript enhancement. Add no UI framework, design-system package, animation library, icon set, backend, or new dependency unless a locked acceptance criterion demonstrably cannot be met without it.
- **D-21:** Keep production fully static and preserve title-independent routes, collision checks, draft exclusion, and the MDX allowlist. Both existing public proof routes must exercise the completed journey; the production draft route remains absent.
- **D-22:** Verification must cover Markdown and approved MDX, JavaScript-disabled fallback, blocked-player fallback, one-time player activation, keyboard/focus behavior, mixed-direction rendering, responsive widths, 200% zoom, and all Phase 1 regressions.

### the agent's Discretion
- Exact internal component boundaries and filenames, provided the final route remains the single public article route family and the implementation stays smaller than duplication.
- Exact restrained color values, spacing steps, and type scale within the locked contrast, measure, size, RTL, zoom, and reflow constraints.
- Exact Arabic microcopy for metadata and media controls, provided it is clear, truthful, descriptive, and contains no reader-facing English.
- Exact structured-reference field names and date-formatting helper placement, provided the contract fails closed and optional UI disappears cleanly.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Locked Phase Scope
- `.planning/phases/02-complete-arabic-article-journey/02-SPEC.md` — Locked goal, ten requirements, phase boundaries, constraints, and measurable acceptance criteria; MUST be read first.
- `.planning/ROADMAP.md` § Phase 2 — Dependency on Phase 1, mapped requirement IDs, and roadmap-level success criteria.
- `.planning/REQUIREMENTS.md` — Canonical definitions for `SITE-01`, `SITE-02`, `ART-01` through `ART-07`, and `QUAL-01` through `QUAL-04`.
- `.planning/PROJECT.md` — Product identity, Arabic-only audience, core Google-to-article-to-YouTube value, static publishing constraints, and v1 exclusions.

### Upstream Contracts and Repository Rules
- `.planning/phases/01-content-and-url-contract/01-CONTEXT.md` — Locked Astro/static architecture, registries, final route, public/preview query split, MDX boundary, and validation decisions inherited by this phase.
- `.planning/phases/01-content-and-url-contract/01-SPEC.md` — Upstream content, URL, draft, and MDX guarantees that Phase 2 must preserve.
- `README.md` — Current authoring, exact-runtime verification, preview, and production-build workflow.
- `AGENTS.md` — Repository-specific constraints, exact stack, ignored browser-artifact location, UI workflow requirement, and prohibition on reading `.env` files without permission.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/pages/[section]/[slug].astro`: Existing final route and minimal Arabic document shell; it already renders validated Markdown/MDX through the approved component map.
- `src/lib/articles.ts`: Single validated collection query with separate public and explicit development-preview entry points; production draft exclusion must continue through this boundary.
- `src/lib/content-contract.ts`: Pure validation, route derivation, registry membership, date, video-ID, collision, and draft-selection helpers; reference validation belongs at this shared trust boundary.
- `src/config/registries.ts`: Central Arabic section and author facts; the reader UI can resolve display labels without duplicating content metadata.
- `src/content.config.ts`: Existing Astro schema boundary for required and optional frontmatter facts.
- `src/components/mdx-components.ts` and `src/components/ContractNote.astro`: Existing restricted MDX render surface, proving approved MDX and Markdown can share the same route.
- `tests/content-contract.test.ts`: Built-in Node test suite that already protects validation, path identity, drafts, and the MDX allowlist.

### Established Patterns
- Astro static generation with no server adapter or client UI runtime.
- `getStaticPaths()` enumerates preview records only in development and public records in production, using the same final route shape.
- Content validation fails closed before public rendering; downstream templates consume validated records rather than repairing input.
- Styling and interaction currently have no framework abstraction, so native scoped/global CSS and a tiny browser enhancement fit the established baseline.

### Integration Points
- Extend the article schema/type/validator only for the optional structured facts needed by Phase 2.
- Replace the proof markup inside the existing final route with the reusable article reader surface while preserving `getStaticPaths()` and MDX rendering.
- Expand proof Markdown/MDX content enough to exercise summary, heading order, conclusion, provenance, references, mixed-direction text, and conditional absence.
- Extend the Node contract tests and add focused browser checks under ignored `.artifacts` output; keep generated browser artifacts out of source and `.planning`.

</code_context>

<specifics>
## Specific Ideas

- The guaranteed journey is article text first, then a permanent action such as `مشاهدة الفيديو على يوتيوب`; the inline player remains optional progressive enhancement.
- The reserved media region presents an Arabic activation control such as `تشغيل الفيديو` before the privacy-enhanced iframe exists.
- The references heading is Arabic (`المراجع`) and is omitted entirely when the article declares no references.
- Mixed-direction examples should include a real HTTPS URL, an 11-character YouTube identifier, Arabic/ASCII digits, punctuation, and an Arabic date presentation.

</specifics>

<deferred>
## Deferred Ideas

- Homepage, three section indexes, global navigation, About/author page, and three final reviewed articles — Phase 3.
- Page-specific titles/descriptions, canonical and social metadata, sitemap, robots directives, and Arabic 404 — Phase 4.
- Production domain, hosting, Search Console, privacy-conscious analytics, and outbound-click measurement — Phase 5.
- Production crawl, Core Web Vitals, and whole-site launch certification — Phase 6.

</deferred>

---

*Phase: 02-complete-arabic-article-journey*
*Context gathered: 2026-08-26*
