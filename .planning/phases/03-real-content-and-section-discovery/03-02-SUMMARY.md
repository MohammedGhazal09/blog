---
phase: 03-real-content-and-section-discovery
plan: 02
subsystem: ui
tags: [astro, rtl, arabic, static-discovery, accessibility]

requires:
  - phase: 03-real-content-and-section-discovery
    provides: Exact-source public approval boundary and development-only proof articles from Plan 03-01
  - phase: 02-complete-arabic-article-journey
    provides: Verified Arabic article, provenance, reflow, keyboard, and intent-gated YouTube journey
provides:
  - Shared Arabic/RTL static shell with one persistent site-name home link
  - Registry-ordered homepage and three registry-derived public-only section indexes
  - Truthful minimal author destination and contextual article section/author links
affects: [03-03, 03-04, phase-04-search-identity]

tech-stack:
  added: []
  patterns:
    - Static discovery routes consume registries and approved-public selectors directly
    - Shared shell owns document, column, type, link, focus, and responsive padding rules
    - Truthful absence renders as an explicit section empty state and complete author-field omission

key-files:
  created:
    - src/layouts/SiteLayout.astro
    - src/pages/index.astro
    - src/pages/[section]/index.astro
    - src/pages/عن-أحمد-المنجاوي.astro
  modified:
    - src/pages/[section]/[slug].astro
    - tests/article-journey.spec.ts

key-decisions:
  - "Keep the complete discovery graph registry-derived and approved-public-only; empty registered sections remain visible and launch readiness remains red."
  - "Expose no author claim beyond the registered name and the locked generic publication purpose."
  - "Move only document-wide visual rules into SiteLayout while retaining article prose, provenance, and media rules locally."

patterns-established:
  - "Registry graph: homepage sections, section paths, article paths, and visible labels come from established registries/helpers rather than parallel route data."
  - "Truthful omission: unsupported author facts emit no headings, placeholders, reserved gaps, or schema claims."

requirements-completed: [SITE-03, SITE-04, SITE-05, CONT-03]

duration: 17min
completed: 2026-08-27
---

# Phase 3 Plan 2: Static Arabic Discovery Graph Summary

**One shared Arabic/RTL Astro shell now connects the registry-driven homepage, three truthful section indexes, minimal author page, and contextual article facts without exposing drafts or unsupported claims.**

## Performance

- **Duration:** 17 min
- **Started:** 2026-08-27T05:17:34Z
- **Completed:** 2026-08-27T05:35:22Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added a zero-client-JavaScript shared shell with Arabic/RTL document semantics, one site-name home link, the locked warm one-column presentation, and mobile-first reflow.
- Added `/` plus all three registry section roots from one registry/query path; every empty section remains visible with the exact truthful Arabic sentence while discovery calls only `getPublicArticles()`.
- Added the verified-field-only author route and ordinary linked section/author article facts without changing the Phase 2 article, provenance, or YouTube behavior.
- Preserved stable article sorting by canonical date descending and direct slug ascending, with `articlePath()` as the sole article-link builder.

## Task Commits

Each task was committed atomically:

1. **Task 1: Make homepage-to-section discovery work through one shared Arabic shell** - `c77cc05` (feat)
2. **Task 2: Complete article-to-section-to-author context without unsupported facts** - `7f9d82d` (feat)

## Files Created/Modified

- `src/layouts/SiteLayout.astro` - Shared Arabic document, single-link header, centered column, typography, links, focus, and responsive padding.
- `src/pages/index.astro` - Exact Arabic introduction and registry-ordered semantic section list.
- `src/pages/[section]/index.astro` - One static-path generator for every registered section with public-only deterministic article lists and truthful empty states.
- `src/pages/عن-أحمد-المنجاوي.astro` - Registered-name-only author destination with locked generic purpose and home link.
- `src/pages/[section]/[slug].astro` - Existing article wrapped by the shared shell with linked section and author fact values.
- `tests/article-journey.spec.ts` - Shared-layout ownership checks plus contextual-link regression assertions for both development proof formats.

## Decisions Made

- Discovery never uses the development preview selector; a direct proof article can validate contextual links without entering a homepage or section index.
- Registered empty sections remain crawlable structural routes and state their absence plainly; they do not satisfy the separate launch-readiness gate.
- The author page renders no optional model or empty conditional shell because the registry currently proves only `أحمد المنجاوي`.
- No component, token, metadata, navigation, author-schema, client-runtime, or package abstraction was added.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated source-coupled article layout assertions after the planned shell extraction**

- **Found during:** Task 2 (Complete article-to-section-to-author context without unsupported facts)
- **Issue:** Four existing Chromium checks still read `max-inline-size: 70ch` from the article route and measured the article's computed maximum after the plan intentionally moved column ownership to `SiteLayout`; 22 other reader/media scenarios passed.
- **Fix:** Read and inspect the shared layout in the regression test, measure the `main` column cap while retaining child-within-article checks, and add exact section/author href assertions for both draft proof formats.
- **Files modified:** `tests/article-journey.spec.ts`
- **Verification:** Focused browser rerun and final `npm run verify` both passed all 26 Chromium scenarios.
- **Committed in:** `7f9d82d`

---

**Total deviations:** 1 auto-fixed (1 blocking issue)
**Impact on plan:** The change aligned regression ownership with the planned shared-shell architecture and strengthened contextual-link coverage without changing product scope.

## Issues Encountered

- The intentionally failing Windows launch-readiness build again printed the known libuv shutdown assertion after the correct aggregated missing-section diagnostic. The command remained nonzero for the expected truth-gate reason; normal build and full verification were unaffected.

## Verification Evidence

- `npm run verify` — passed: 125/125 native tests, zero Astro errors/warnings/hints, five normal static routes, and 26/26 Chromium article journeys.
- Built-output assertions — passed for `/`, all three registered section roots, the exact empty sentence, registry order/copy, one `main`/`h1`, and the minimal author destination.
- `npm run launch:ready` — expected nonzero and named `refutations`, `generalIssues`, and `scholarship` with their Arabic labels.
- Hercules-guided fallback Playwright QA — passed 20 responsive route states plus focus, no-JavaScript traversal, contextual links, zero serious/critical axe findings, and zero console/page/network errors; ignored evidence is under `.artifacts/qa/20260827-082648-03-02-127.0.0.1-4321/`.
- Manual screenshot review — passed for representative homepage, empty-section, author, article, and visible-focus states on mobile and desktop.
- `git diff --check` — passed.

## Known Stubs

None. The section empty sentence is intentional truthful product behavior while genuine approved launch content is absent, not a stub or fabricated placeholder.

## User Setup Required

None - no external service, secret, environment variable, or package configuration is required.

## Next Phase Readiness

- Plan 03-03 can add production discovery/browser coverage around the now-complete static route graph and reuse the ignored artifact boundary.
- Plan 03-04 remains the genuine-input gate for three real article/video packages and exact-source dual approvals.
- Phase 3 is not complete; launch readiness must remain red until those owner-supplied inputs exist.

## Self-Check: PASSED

- All four created route/layout files and both modified regression surfaces exist.
- Task commits `c77cc05` and `7f9d82d` exist in repository history.
- All task acceptance criteria and plan-level verification commands passed, with launch readiness intentionally red for the correct missing-content reason.
- Stub and threat-surface scans found no goal-blocking placeholder or unplanned network/auth/file/schema surface.

---
*Phase: 03-real-content-and-section-discovery*
*Completed: 2026-08-27*
