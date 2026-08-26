# Phase 3: Real Content and Section Discovery — Specification

**Created:** 2026-08-26
**Ambiguity score:** 0.05 (gate: ≤ 0.20)
**Requirements:** 8 locked

## Goal

The public static site changes from two isolated proof-article routes into a complete Arabic discovery journey: homepage → three primary section indexes → at least one real, reviewed article/video pair per section → truthful author context.

## Background

The central registries already define the three Arabic sections, their stable slugs, summaries, order, and the author name أحمد المنجاوي. The validated content collection and the shared `[section]/[slug]` route already produce accessible static Arabic article pages, exclude drafts from production, and preserve a direct matching YouTube action.

No homepage, section-index route, or About/author route exists. Article bylines are plain text rather than links. The two current public articles explicitly identify themselves as technical proof records, use example provenance and a non-matching demonstration video, cover only two sections, and are not launch content. No stored editorial or religious-accuracy approval exists. Phase 3 must reuse the proven article contract while replacing those public proofs with truthful launch material.

## Requirements

1. **Homepage section discovery**: The static Arabic homepage links to every primary section through ordinary HTML anchors.
   - Current: `/` has no page, and production readiness currently probes an article route because the homepage returns 404.
   - Target: `/` presents the site name, one concise and accurate Arabic introduction, and one descriptive link for each registry-defined primary section in registry order. The القسم العلمي description explicitly identifies structured Islamic scholarship and religious lessons rather than natural science.
   - Acceptance: A production build emits `/index.html`; the page has `lang="ar"`, `dir="rtl"`, one `h1`, and crawlable anchors resolving successfully to الردود والشبهات, القضايا العامة, and القسم العلمي.

2. **Complete section indexes**: Each primary section has one crawlable Arabic index containing every public article assigned to that section exactly once.
   - Current: Only `[section]/[slug]` article routes exist; none of the three section roots has an index.
   - Target: Each section root displays the registry label and description, then a deterministic newest-first list of its public articles. Each entry exposes the article title, description, truthful publication date, and an ordinary link to the stable article route; equal dates use the stable article slug as the tie-breaker.
   - Acceptance: The production build emits all three registry-derived section roots, and automated set-equality checks confirm that each index links to all and only the non-draft articles in its section with no duplicate entry.

3. **Truthful author destination and linked bylines**: Every public article byline links to one Arabic About/author page that contains only supplied and verified facts about أحمد المنجاوي.
   - Current: The author registry contains only the name أحمد المنجاوي; article pages render that name as unlinked text, and no author page or verified biography exists.
   - Target: The author name on every public article is an ordinary link to `/عن-أحمد-المنجاوي/`. That page identifies the author and publication purpose using owner-approved facts, provides a clear route back into the site, and omits any biography, expertise, affiliation, credential, social profile, or channel claim that has not been supplied and approved.
   - Acceptance: Every built public article contains the same crawlable author link; the built author page has Arabic/RTL document semantics and one `h1`; a fact-by-fact comparison against the owner-approved profile input finds no added or altered claim.

4. **Real launch corpus coverage**: The public collection contains at least one substantive Arabic article with its real matching YouTube video in each primary section.
   - Current: Two public proof articles cover القضايا العامة and القسم العلمي, no public article covers الردود والشبهات, and neither proof article is a real launch article/video pair.
   - Target: Each of the three sections has at least one genuine article that includes a maintained summary, introductory prose, at least two substantive authored sections, a conclusion, references wherever its claims require them, and a verified matching YouTube identifier. The article remains useful without playing the video.
   - Acceptance: A production-corpus check finds at least one eligible public record for each registry section; each route renders the required text structure and its direct YouTube URL opens the owner-supplied matching video; the human editorial record confirms that the article independently answers its intended topic.

5. **Dual human publication approval**: A launch article cannot become public until both editorial and religious-accuracy sign-off have been recorded for that exact article revision.
   - Current: The content schema has no review approval data, and public eligibility depends only on the existing metadata and `draft` state.
   - Target: Each prospective public launch article carries durable, local evidence of two separate human approvals: editorial review and religious-accuracy review. Each approval identifies a real reviewer, approval date, reviewed revision or content identity, and passing decision. Draft preview remains available before approval, but production publication fails closed when either approval is missing, invalid, or stale.
   - Acceptance: Negative contract/build checks reject public records missing either approval or pointing to a different revision; a fully approved record builds; every public launch article can be traced to both recorded approvals. Reviewer identities remain internal unless their publication is separately approved.

6. **Truthful public facts and provenance**: Public author, expertise, date, reference, video, and review statements reflect supplied real-world facts rather than proof data or SEO placeholders.
   - Current: The proof fixtures intentionally contain test wording, `example.com` references, demonstration dates, and a demonstration video ID; no final biography, expertise, launch references, or review facts have been supplied.
   - Target: Optional facts are omitted when evidence is unavailable. Facts that are shown match the owner-approved profile and content packages exactly, publication/update dates describe real events, references support the claims that depend on them, and visible review language is emitted only from valid approval records.
   - Acceptance: The public build contains none of the Phase 2 proof titles, routes, test wording, `example.com` references, or demonstration video mapping; an approval audit maps every public factual field to an owner-supplied source with no unsupported claim.

7. **Proof records stay non-public without losing regression coverage**: Phase 2 proof content does not appear in the launch surface, while its Markdown/MDX contract coverage remains executable.
   - Current: The Markdown and MDX proof records are public because `draft: false`, and the browser suite uses their production routes.
   - Target: Proof records are moved behind the draft/test boundary or replaced by synthetic test data. Production routes, homepage links, section indexes, and later discovery files operate only on real approved content, while tests still cover both Markdown and approved MDX rendering paths.
   - Acceptance: A production build emits no proof-article route and no index link to one; native and browser checks still exercise the Markdown and MDX article journeys without making proof records public.

8. **Static Arabic discovery quality**: The new discovery surfaces remain Arabic-only, RTL, semantic, dependency-free, and usable without client-side JavaScript.
   - Current: The article route satisfies this contract, but no discovery or author surfaces exist to verify against it.
   - Target: Homepage, section indexes, author page, and updated bylines use native headings, landmarks, lists, and anchors; reuse the existing registries, content selectors, palette, typography, and focus treatment; and add no CMS, database, client framework, search UI, or runtime fetch.
   - Acceptance: With JavaScript disabled, a keyboard user can traverse homepage → section → article → author and back through visible-focus links; no reader-facing English appears; representative pages pass semantic, reflow, contrast, and serious/critical accessibility checks; the pinned-runtime project verification passes.

## Boundaries

**In scope:**

- A minimal Arabic homepage with links to all three primary section indexes.
- Three registry-driven Arabic section indexes listing every eligible public article.
- One Arabic author page plus crawlable author links from all public article bylines.
- At least three real launch article/video pairs, one per primary section, with truthful provenance.
- A fail-closed editorial and religious-accuracy approval requirement for public launch articles.
- Removal of Phase 2 proof records from public output while preserving Markdown/MDX regression coverage.
- Automated and human verification of the complete homepage-to-content-to-author journey.

**Out of scope:**

- Final page-title, meta-description, canonical, social-card, sitemap, robots, favicon, and 404 policy — Phase 4 owns search identity and discovery files.
- Hosting, production domain configuration, Google Search Console, analytics, or outbound-click measurement — Phase 5 owns deployment and measurement.
- Production crawl certification and production Core Web Vitals evidence — Phase 6 owns launch verification.
- Search, filters, tags, related articles, lesson sequencing, or full YouTube-catalog migration — explicitly deferred beyond the three-article launch corpus.
- AI-authored articles, automated transcript import, or invented biography/review data — excluded by the project trust requirements.

## Constraints

- All public reader-facing text and navigation are Arabic with correct RTL semantics; planning and source identifiers may remain English.
- The implementation remains fully static and reuses the existing Astro content collection, central registries, public/draft selector, and stable article route. No new runtime service or dependency is justified.
- Final author facts, expertise, article text, matching YouTube videos, dates, references, reviewer identities, and approvals must come from the owner or another verifiable source. The agent must not invent them.
- The three section meanings and Arabic descriptions stay aligned with the approved project definition, especially القسم العلمي as Islamic scholarship.
- Public reviewer identity is opt-in; internal recorded identity is still required for the approval gate.
- Development and browser evidence stays under the ignored `.artifacts/` directory.
- Verification uses Node `v24.19.0` and npm `11.17.0`, matching the repository contract.

## Acceptance Criteria

- [ ] `/` builds as an Arabic/RTL homepage with ordinary links to all three primary section roots.
- [ ] All three section roots build and list all and only their public articles once, newest first with a stable tie-breaker.
- [ ] Every public article byline links to `/عن-أحمد-المنجاوي/`, whose visible claims match the owner-approved profile facts exactly.
- [ ] Each primary section has at least one substantive real article whose direct YouTube action matches its owner-supplied video.
- [ ] Every public launch article has current editorial and religious-accuracy approval records, and missing/stale approval fails closed.
- [ ] Phase 2 proof articles, routes, test copy, example references, and demonstration video mapping are absent from public output.
- [ ] The full homepage → section → article → author journey remains crawlable, keyboard-operable, Arabic-only, and usable without JavaScript.
- [ ] Native contract tests, Astro diagnostics, production build checks, Chromium journeys, accessibility checks, and human content approval all pass under the pinned runtime.

## Ambiguity Report

Initial assessment from the roadmap and requirement IDs alone was `0.27`. Auto-selected recommendations lock the minimum discovery surface, truth gates, public-proof boundary, and pass/fail evidence below.

| Dimension | Score | Min | Status | Notes |
|-----------|------:|----:|:------:|-------|
| Goal Clarity | 0.96 | 0.75 | ✓ | One end-to-end visitor discovery journey with a defined corpus floor. |
| Boundary Clarity | 0.95 | 0.70 | ✓ | Phase 4–6 search, deployment, and production certification are explicitly excluded. |
| Constraint Clarity | 0.93 | 0.65 | ✓ | Static architecture, Arabic-only UI, pinned runtime, and truth-source limits are locked. |
| Acceptance Criteria | 0.96 | 0.70 | ✓ | Eight binary checks cover routes, corpus, approval, truth, accessibility, and regression. |
| **Ambiguity** | **0.05** | **≤0.20** | **✓** | Weighted clarity `0.9515`; ambiguity `0.0485`, rounded to `0.05`. |

Status: ✓ = met minimum, ⚠ = below minimum (planner treats as assumption)

## Interview Log

The user approved recommended answers and automatic continuation before this run. The following decisions were therefore auto-selected after codebase scouting.

| Round | Perspective | Question summary | Decision locked |
|-------|-------------|------------------|-----------------|
| 1 | Researcher | What exists, and what is the real Phase 3 delta? | Reuse the validated registries, content collection, and article route; add the missing homepage, three indexes, linked author destination, real corpus, and review evidence. |
| 2 | Simplifier | What is the irreducible homepage and index scope? | Homepage = accurate intro plus three section links; indexes = registry description plus title/description/date/link for every public article. No search, tags, latest-content module, or catalog migration. |
| 3 | Boundary Keeper | Which adjacent SEO and production work stays out? | Metadata/canonical/discovery files stay in Phase 4, deployment/measurement in Phase 5, and production crawl/performance certification in Phase 6. |
| 4 | Failure Analyst | What outcomes make the phase unacceptable? | Any public proof content, missing section coverage, non-matching video, unsupported author/factual claim, or absent/stale human approval is a failure. Publication fails closed. |
| 5 | Seed Closer | How are deterministic discovery and truthful author context verified? | Registry order controls sections; article indexes are newest-first with slug tie-breaks; every byline links to one author route whose claims are compared to approved facts. |
| 6 | Seed Closer | What may the agent infer when real-world facts are missing? | Only generic structure and user-supplied section descriptions may be authored. Biography, expertise, article claims, dates, references, videos, reviewers, and approvals cannot be invented and may block final completion. |

---

*Phase: 03-real-content-and-section-discovery*
*Spec created: 2026-08-26*
*Next step: $gsd-discuss-phase 3 — implementation decisions (how to build what is specified above)*
