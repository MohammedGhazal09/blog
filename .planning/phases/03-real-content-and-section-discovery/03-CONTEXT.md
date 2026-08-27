# Phase 3: Real Content and Section Discovery - Context

**Gathered:** 2026-08-26
**Status:** Ready for UI specification and planning

<domain>
## Phase Boundary

Phase 3 adds the smallest complete static discovery graph around the proven article reader: an Arabic homepage, one generic index for each of the three registered sections, contextual links from article facts, one truthful author destination, and a real source-backed launch article/video pair in every section. It does not claim Phase 4 search identity, Phase 5 deployment/measurement, or Phase 6 production certification.

</domain>

<spec_lock>
## Requirements (locked via SPEC.md)

**8 requirements are locked.** See `03-SPEC.md` for full requirements, boundaries, and acceptance criteria.

Downstream agents MUST read `03-SPEC.md` before planning or implementing. Requirements are not duplicated here.

**In scope (from SPEC.md):**

- A minimal Arabic homepage with links to all three primary section indexes.
- Three registry-driven Arabic section indexes listing every eligible public article.
- One Arabic author page plus crawlable author links from all public article bylines.
- At least three real launch article/video pairs, one per primary section, with truthful provenance.
- Transparent source/video provenance and AI-assistance disclosure without invented review evidence.
- Removal of Phase 2 proof records from public output while preserving Markdown/MDX regression coverage.
- Automated browser and source verification of the complete homepage-to-content-to-author journey.

**Out of scope (from SPEC.md):**

- Final page-title, meta-description, canonical, social-card, sitemap, robots, favicon, and 404 policy — Phase 4 owns search identity and discovery files.
- Hosting, production domain configuration, Google Search Console, analytics, or outbound-click measurement — Phase 5 owns deployment and measurement.
- Production crawl certification and production Core Web Vitals evidence — Phase 6 owns launch verification.
- Search, filters, tags, related articles, lesson sequencing, or full YouTube-catalog migration — explicitly deferred beyond the three-article launch corpus.
- Automated transcript import, bulk paraphrasing, or invented biography/review data — excluded; the owner explicitly authorized three AI-assisted source-backed launch drafts on 2026-08-27.

</spec_lock>

<decisions>
## Implementation Decisions

### Shared Discovery Shell and Link Graph

- **D-01:** Use one small shared Arabic/RTL site shell for homepage, indexes, author, and article routes. Its persistent header contains only the site name linked to `/`; it does not repeat a full section menu on every page.
- **D-02:** Make context do the navigation work: each homepage section label links to its index, each index article title links to its stable route, each article section fact links back to its index, and each article author fact links to the author page. All are ordinary same-tab anchors and remain usable without JavaScript.
- **D-03:** Extract only the genuinely shared document, typography, color, focus, and page-width treatment from the existing reader. Keep article-specific prose/media rules with the article surface rather than introducing a broad design system.

### Homepage and Section Indexes

- **D-04:** The homepage contains the approved site name, one short factual introduction derived from PROJECT.md, and a registry-driven list of the three sections in `order`. Each entry shows its existing Arabic label and description; no latest-article feed, image, metric, featured block, or promotional carousel is added.
- **D-05:** Implement one registry-driven section-index route/pattern rather than three hand-maintained pages. Unknown section slugs remain absent; registered section roots are generated from the same registry that derives article paths.
- **D-06:** Render articles as a semantic text list, not cards. Each item exposes linked title, description, and truthful publication date. Sort public articles by `publishedAt` descending and then stable article slug ascending so output is deterministic.
- **D-07:** During local development an empty section may show one concise Arabic empty-state sentence. Launch readiness still fails until every registered primary section contains an approved real public article; hiding an empty section is not allowed.

### Truthful Author Context

- **D-08:** Use one author route at `/عن-أحمد-المنجاوي/`. Every public article byline links to it, and the page provides a clear link back to the homepage.
- **D-09:** The author page renders only fields present in the authoritative author registry/profile input. The current name is safe to render; biography, expertise, affiliation, credentials, social profiles, and channel claims are omitted until the owner supplies and approves them. Do not show generated filler or a public “coming soon” claim.
- **D-10:** Structured Person/Article schema and canonical entity identifiers remain outside this phase; Phase 4 owns page identity metadata and the roadmap defers richer structured data.

### Source-Backed Publication Truth Gate

- **D-11:** The owner's 2026-08-27 instruction authorizes autonomous filenames, slugs, structure, and AI-assisted Arabic copy for the three launch articles. Each article is derived from verified YouTube page metadata and cited public sources; no transcript is claimed.
- **D-12:** Public eligibility remains the existing schema, explicit `draft` state, unique-route validation, and registered-section launch coverage. The prior human-review sidecar layer is removed rather than populated with synthetic identities or implied consent.
- **D-13:** Each AI-assisted article states that fact publicly in Arabic and identifies that it is not a verbatim video transcript. No page claims human editorial or religious review unless such evidence is supplied later.
- **D-14:** `03-CONTENT-INPUTS.md` records the chosen source paths, slugs, matching YouTube URLs/IDs, video dates, article dates, cited sources, and actual authorship/review status. It stores no reviewer identity or consent fiction.

### Proof Isolation and Verification

- **D-15:** Change Phase 2 proof articles to draft/test-only content. Exercise their Markdown and restricted-MDX reader paths through the existing development-preview boundary; never leave public proof routes merely hidden from indexes.
- **D-16:** Keep normal structural verification and a separate launch-readiness check. Launch readiness proves that every registered section has public content; content schema and browser checks prove routes, dates, references, videos, proof isolation, and disclosure behavior.
- **D-17:** Production discovery/browser checks use the real source-backed public corpus. Development proof checks may use the draft routes, while the production build separately asserts that every proof route and example reference/video mapping is absent.

### Arabic Visual Continuity

- **D-18:** Reuse the existing warm surfaces, restrained green link/focus color, system font stack, four-size/two-weight discipline, logical spacing, and readable measure. Discovery content uses headings, lists, and underlined links without images, thumbnails, decorative cards, shadows, gradients, icons, animation, or new UI dependencies.
- **D-19:** Verify the new route graph at representative mobile/desktop widths, keyboard-only navigation, disabled JavaScript, and accessibility-tree/axe checks. Keep all generated browser evidence under `.artifacts/`.

### the agent's Discretion

- Exact shared layout, style-module, helper, and test filenames, provided the implementation reuses existing boundaries and creates no single-use abstraction that is larger than the duplication it removes.
- Exact Arabic microcopy for the homepage introduction, contextual links, and empty state, provided it is concise, reader-facing Arabic and contains no unsupported personal or religious claim.
- Exact article source filenames and Arabic slugs, provided they remain explicit, collision-free, and recorded in the Phase 3 content ledger.
- Whether the development browser suite runs in one or two Playwright projects, provided production draft exclusion remains independently tested and all artifacts stay under `.artifacts/`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Locked Phase Scope

- `.planning/phases/03-real-content-and-section-discovery/03-SPEC.md` — Locked goal, eight falsifiable requirements, truth boundaries, and acceptance criteria; MUST be read first.
- `.planning/ROADMAP.md` § Phase 3 — Validated MVP user story, dependency, mapped requirement IDs, and four roadmap success criteria.
- `.planning/REQUIREMENTS.md` — Canonical definitions for `SITE-03`, `SITE-04`, `SITE-05`, `CONT-01`, `CONT-02`, and `CONT-03`.
- `.planning/PROJECT.md` — Arabic-only product identity, core Google-to-article-to-YouTube value, section meanings, static architecture, and explicit exclusions.

### Upstream Reader and Content Contracts

- `.planning/phases/02-complete-arabic-article-journey/02-CONTEXT.md` — Locked Arabic reader, provenance, media, accessibility, and minimal-static decisions inherited by discovery surfaces.
- `.planning/phases/02-complete-arabic-article-journey/02-SPEC.md` — Upstream article-journey requirements and boundaries that Phase 3 must preserve.
- `.planning/phases/02-complete-arabic-article-journey/02-VERIFICATION.md` — Independent evidence for the current article route, proof fixtures, tests, and public/draft behavior.
- `.planning/phases/01-content-and-url-contract/01-CONTEXT.md` — Registry, collection, route identity, public/preview selector, restricted-MDX, and validation decisions.
- `.planning/phases/01-content-and-url-contract/01-SPEC.md` — Upstream content/URL/draft guarantees that new discovery routes and launch checks must preserve.

### Repository and Source Boundaries

- `AGENTS.md` — Repository workflow rules, exact runtime, UI/testing requirements, artifact isolation, and prohibition on reading `.env` files without permission.
- `README.md` — Current authoring, preview, build, and exact-runtime verification workflow.
- `src/config/registries.ts` — Authoritative section labels, descriptions, slugs, order, and current author identity.
- `src/content.config.ts` — Astro collection schema and shared semantic-validation entry point.
- `src/lib/articles.ts` — Validated public and development-preview content selectors.
- `src/lib/content-contract.ts` — Registry validation, public/draft selection, stable path derivation, date/video/reference checks, and collision boundary.
- `src/pages/[section]/[slug].astro` — Existing complete article route, reader markup, byline facts, and visual contract to reuse.
- `tests/content-contract.test.ts` — Native contract-regression suite and current fixture assumptions.
- `tests/article-journey.spec.ts` — Current production-route browser matrix that must be split safely when proofs become drafts.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `sectionRegistry` / `authorRegistry`: Already hold stable internal keys and Arabic display facts; homepage, index generation, contextual links, and author rendering should consume them directly.
- `getPublicArticles()` / `getPreviewArticles()`: Preserve one explicit public/draft boundary for production discovery and development proof journeys.
- `pathParamsFor()` and the shared content contract: Keep one stable article identity source and validate publication eligibility once rather than checking it independently in routes.
- `[section]/[slug].astro`: Supplies the proven Arabic document shell, reader palette, typography, focus, responsive measure, article facts, and media journey.
- Native Node tests plus Playwright/axe: Already provide the exact low-dependency verification stack and artifact routing required by the phase.

### Established Patterns

- Astro static generation with no server adapter, runtime data service, CMS, client framework, webfont, image dependency, or CSS framework.
- Registry-derived identities and fail-closed schema/shared validation; downstream routes consume trusted records instead of repairing them.
- Development preview includes drafts through a dedicated selector, while production enumerates only public records.
- Native semantic HTML and small scoped/global CSS provide the interface; JavaScript is reserved for the already-implemented intent-gated YouTube enhancement.

### Integration Points

- Add a shared public shell/style boundary and move only truly global reader rules out of the article route.
- Add root, section-index, and author routes that consume the existing registries and article selectors.
- Turn article section/author facts into contextual anchors without disturbing the fixed text/media order.
- Keep public selection at the existing schema/draft/route boundary and make launch coverage explicit without a second publication system.
- Demote proof content from public output, adapt browser lifecycle for draft proof routes, and add production discovery/launch-readiness checks.

</code_context>

<specifics>
## Specific Ideas

- The header is deliberately tiny: `مدونة أحمد المنجاوي` links home; page-specific content supplies the rest of the navigation graph.
- Section indexes read like a clean bibliography, not a marketing card grid.
- The author path is `/عن-أحمد-المنجاوي/`; no unsupported credential or expertise sentence is generated to fill it.
- The content ledger records actual source/video/date/reference facts and explicitly states that no transcript or human-review package exists.
- Launch readiness is green only when each registered section contains a validated public article; browser QA separately proves the rendered graph and disclosure text.

</specifics>

<deferred>
## Deferred Ideas

- Page titles, meta descriptions, canonical/social identity, sitemap, robots, favicon, and Arabic 404 — Phase 4.
- Production domain, hosting, Search Console, aggregate analytics, and outbound-click measurement — Phase 5.
- Production crawl, live-link certification, and Core Web Vitals evidence — Phase 6.
- Search, filters, tags, related articles, lesson sequencing, timestamps, and full-catalog migration — deferred v2/expansion scope.

</deferred>

---

*Phase: 03-real-content-and-section-discovery*
*Context gathered: 2026-08-26; publication boundary updated: 2026-08-27*
