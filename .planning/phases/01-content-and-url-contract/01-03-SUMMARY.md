---
phase: 01-content-and-url-contract
plan: 03
subsystem: testing
tags: [astro, node-test, arabic, unicode, mdx, content-authoring]

# Dependency graph
requires:
  - phase: 01-content-and-url-contract plan 01
    provides: Validated Arabic article identity, registries, draft-safe queries, and final route family
  - phase: 01-content-and-url-contract plan 02
    provides: Restricted MDX source policy, approved component allowlist, and shared MDX rendering
provides:
  - Exhaustive 48-case native contract matrix for every locked Phase 1 branch
  - Pure fail-closed development preview selection boundary
  - Arabic owner workflow for article authoring, preview, verification, and build
  - Clean locked-install and local source-reload smoke evidence
affects: [02-complete-arabic-article-journey, content-authoring, routing, phase-verification]

# Tech tracking
tech-stack:
  added: []
  patterns: [table-driven native contract tests, fixed-date validation, exact-runtime clean gate, source-owned preview smoke]

key-files:
  created:
    - README.md
  modified:
    - tests/content-contract.test.ts
    - src/lib/content-contract.ts
    - src/lib/articles.ts

key-decisions:
  - "Route development preview through a pure selector that returns the complete validated set only after the explicit development guard passes."
  - "Keep the owner workflow Arabic and derive every documented command and authoring key from the executable repository contract."

patterns-established:
  - "Contract coverage: one valid fixture builder plus in-memory tables exercise production helpers with source, field/path, rule, and collision-owner diagnostics."
  - "Preview proof: fetch the final route family, edit and restore the original Markdown source, then rebuild and inspect static output."

requirements-completed: [SEO-01, PUB-01, PUB-02, PUB-03, PUB-04, PUB-05, PUB-06]

# Metrics
duration: 12min
completed: 2026-08-26
---

# Phase 1 Plan 3: Contract Coverage and Authoring Workflow Summary

**Exhaustive native content-policy coverage, a fail-closed pure preview selector, and an exact Arabic file-authoring workflow proven by clean install, static build, and live source reload.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-26T12:40:21Z
- **Completed:** 2026-08-26T12:52:13Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Expanded the native suite from 11 to 48 cases covering every locked Arabic slug, metadata, date, path collision, registry extension, draft visibility, and MDX policy branch.
- Added a production pure preview selector so native tests prove development receives both public and draft records while production fails closed.
- Wrote one Arabic owner guide for the exact runtime, flat article location, every frontmatter fact, stable path rules, drafts, restricted MDX, preview, checks, and build.
- Reproduced the locked dependency graph with `npm ci`, passed the full exact-runtime gate, and proved source edit/reload/restore on the final development route family.

## Task Commits

Each task was committed atomically:

1. **Task 1: Complete the fail-closed contract matrix and fix only shared roots** - `8f155d6` (test)
2. **Task 2: Document authoring and run the clean full gate plus local preview smoke** - `4ba0f12` (docs)

## Files Created/Modified

- `tests/content-contract.test.ts` - Uses one valid fixture builder and deterministic in-memory tables to cover 48 production-contract branches with actionable diagnostics.
- `src/lib/content-contract.ts` - Adds the pure explicit-development preview selector without changing the public visibility policy.
- `src/lib/articles.ts` - Routes the existing Astro preview query through the tested pure selector.
- `README.md` - Gives the owner the exact Arabic article-authoring-to-preview/build workflow.

## Decisions Made

- Kept the complete matrix in the existing Node built-in test file; no parser, sanitizer, browser framework, runner, schema, or route guard was added.
- Kept the fourth-section proof injected in test memory so the authoritative default registry and production content remain unchanged.
- Kept the preview smoke HTTP-based because Phase 1 has no design specification or finished reader UI; browser artifacts were unnecessary and none were created.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Made development-preview inclusion directly testable at the shared boundary**

- **Found during:** Task 1 (draft visibility matrix)
- **Issue:** The production query included drafts in development, but the native suite could exercise only the guard and public filter independently, not the complete explicit-preview selection behavior through a production pure function.
- **Fix:** Added `selectPreviewArticles(entries, isDevelopment)` beside the public selector and routed `getPreviewArticles()` through it.
- **Files modified:** `src/lib/content-contract.ts`, `src/lib/articles.ts`, `tests/content-contract.test.ts`
- **Verification:** Native cases prove the development selector returns both records and both the guard and selector reject production mode; exact-runtime `npm run verify` passed.
- **Committed in:** `8f155d6`

---

**Total deviations:** 1 auto-fixed (1 missing critical functionality)
**Impact on plan:** The correction stays inside the planned shared policy boundary and adds no route, schema, dependency, or runtime surface.

## Issues Encountered

- The first temporary-source restore check observed a working-copy line-ending transition while the development server was still watching the file. A subsequent Git diff was empty, the original summary appeared on reload, and the final tree retained no fixture change.
- `npm ci` reported one informational pending install-script approval for locked `esbuild@0.28.2`; installation completed, npm audit reported zero vulnerabilities, and Astro check/build both passed without changing the lockfile or approved package set.

## Known Stubs

None. The empty/undefined values in the test matrix are deliberate rejected in-memory cases. The proof articles remain explicitly labelled Phase 1 contract fixtures and are fully wired through the collection and route.

## User Setup Required

None - no external service configuration required.

## Verification

- Exact runtime: Node `v24.19.0`, npm `11.17.0`.
- Clean install: `npm ci` added 391 locked packages, audited 392 packages, and reported zero vulnerabilities.
- Full gate: 48/48 native tests, zero Astro errors/warnings/hints, and two public static routes.
- Development smoke: public Markdown, approved MDX, and draft final routes each returned HTTP 200 with their Arabic proof content.
- Source reload: the temporary Markdown summary appeared on the first fetch after edit; the original summary appeared on the first fetch after restore.
- Server lifecycle: the owned Astro development process was stopped and port 4321 was released.
- Production output: Markdown and MDX `index.html` files exist; the draft `index.html` remains absent.
- No `.env` file was read or created, and no browser artifact was written.

## Next Phase Readiness

- All three Phase 1 implementation plans now have summaries and the content contract is ready for orchestrator-owned review, security/UI gates as applicable, Nyquist audit, and phase verification.
- Phase 1 is not marked verified or complete by this plan executor.
- Final reader layout, accessibility treatment, YouTube experience, real launch content, metadata, deployment, analytics, and production verification remain assigned to Phases 2–6.

## Self-Check: PASSED

- All four created/modified implementation files and this summary exist on disk.
- Task commits `8f155d6` and `4ba0f12` resolve as commits.
- Stub and new-threat-surface scans found no unresolved production stub or unplanned trust-boundary surface.
- The exact-runtime clean/full gate, preview smoke, source restore, server shutdown, and production output inspection all passed.

---
*Phase: 01-content-and-url-contract*
*Completed: 2026-08-26*
