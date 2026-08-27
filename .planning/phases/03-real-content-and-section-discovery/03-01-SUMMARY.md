---
phase: 03-real-content-and-section-discovery
plan: 01
subsystem: content-trust
tags: [astro, node-sha256, approval-sidecars, playwright, launch-readiness]

requires:
  - phase: 01-content-and-url-contract
    provides: Validated registries, content collection, stable routes, and public/preview selectors
  - phase: 02-complete-arabic-article-journey
    provides: Complete Markdown/MDX article journey and browser regression matrix
provides:
  - Strict exact-source dual-review approval validation for every public article
  - Draft-only Phase 2 proof records with complete development browser coverage
  - Separate expected-red launch-readiness mode with aggregated section diagnostics
affects: [03-02, 03-03, 03-04, phase-04-search-identity]

tech-stack:
  added: []
  patterns:
    - Raw Node SHA-256 approval binding at the central collection-load boundary
    - Structural build and launch-readiness build use separate Astro modes
    - Draft proof journeys run only through the explicit development selector

key-files:
  created:
    - src/lib/approval-contract.ts
  modified:
    - src/lib/articles.ts
    - src/lib/content-contract.ts
    - src/content/articles/contract-markdown.md
    - src/content/articles/contract-mdx.mdx
    - tests/content-contract.test.ts
    - tests/article-journey.spec.ts
    - playwright.config.ts
    - package.json

key-decisions:
  - "Bind both human approvals to the exact raw article bytes through one lowercase SHA-256 digest; do not normalize or expose approval data."
  - "Keep ordinary verification structurally green and invoke registered-section coverage only in Astro launch-readiness mode."
  - "Keep Phase 2 proof wording and routes intact in development while excluding every proof trace from production output."

patterns-established:
  - "Fail-closed public choke point: load and validate routes, then validate every public approval before any selector returns content."
  - "Truthful launch gate: aggregate every missing registered section in registry order and exit nonzero without fabricating content."

requirements-completed: [CONT-01, CONT-02, CONT-03]

duration: 22min
completed: 2026-08-27
---

# Phase 3 Plan 1: Publication Approval and Proof Isolation Summary

**Exact-source SHA-256 approval sidecars now fail public content closed, while draft proof journeys remain fully testable in development and launch readiness honestly reports all missing sections.**

## Performance

- **Duration:** 22 min
- **Started:** 2026-08-27T04:46:00Z
- **Completed:** 2026-08-27T05:08:00Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- Added strict sidecar validation for exact article ID, slug, repository source, raw-byte digest, launch classification, current editorial approval, and current religious-accuracy approval.
- Demoted the Markdown and restricted-MDX proof records to drafts without changing their test content, final development paths, media behavior, or accessibility coverage.
- Added an independent `launch:ready` build mode that fails with all three missing registry keys and Arabic labels while ordinary `verify` remains green.
- Expanded native coverage from 69 to 125 tests and retained all 26 development browser scenarios.

## Task Commits

Each task was committed atomically:

1. **Task 1: Lock approval integrity, launch failure, and proof isolation in RED** - `ed9ffee` (test)
2. **Task 2: Move proof journeys behind the development boundary without losing coverage** - `b0905fb` (test)
3. **Task 3: Enforce exact-source approval and separate structural verification from launch readiness** - `2cc6285` (feat)

## Files Created/Modified

- `src/lib/approval-contract.ts` - Strict Node-built-in sidecar shape, path, date, decision, and raw SHA-256 validation.
- `src/lib/articles.ts` - Central approval validation before selection plus launch-only coverage orchestration.
- `src/lib/content-contract.ts` - Pure registry-order missing-section assertion.
- `src/content/articles/contract-markdown.md` - Markdown proof marked draft-only.
- `src/content/articles/contract-mdx.mdx` - Restricted-MDX proof marked draft-only.
- `tests/content-contract.test.ts` - Exact-byte approval, negative-shape, draft-bypass, coverage, and CLI matrix.
- `tests/article-journey.spec.ts` - Development proof journey plus production proof-route/trace absence assertions.
- `playwright.config.ts` - Managed foreground Astro development server with artifacts kept under `.artifacts/`.
- `package.json` - Separate `astro build --mode launch-readiness` script.

## Decisions Made

- Approval validation returns no review information and remains the sole responsibility of `src/lib/articles.ts`; routes cannot access reviewer data.
- Sidecars are located with `encodeURIComponent(article.id)` so entry IDs cannot traverse the review root.
- Coverage counts only already-selected public records and reports every missing registry section in stable registry order.
- No review directory, example sidecar, dependency, reviewer identity, content fact, or passing launch fixture was created.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Stabilized Astro development-server ownership under Playwright**

- **Found during:** Task 2 (Move proof journeys behind the development boundary without losing coverage)
- **Issue:** Astro 7 auto-detected the agent environment, backgrounded `astro dev`, and let Playwright's managed server process exit early. Its injected development toolbar also contributed four non-page `h1` elements to an unscoped locator.
- **Fix:** Set `ASTRO_DEV_BACKGROUND=0` alongside the preserved preview flag and scope the semantic heading count to `main h1`, which continues to enforce exactly one page heading without counting framework tooling outside the document main content.
- **Files modified:** `playwright.config.ts`, `tests/article-journey.spec.ts`
- **Verification:** Playwright starts and owns the foreground server; all 26 Markdown/MDX scenarios pass.
- **Committed in:** `b0905fb`

---

**Total deviations:** 1 auto-fixed (1 blocking issue)
**Impact on plan:** The fix was limited to reliable development test orchestration and preserved every reader assertion and artifact boundary.

## Issues Encountered

- On Windows, the intentionally failing Astro launch build prints a libuv shutdown assertion after the correct aggregated readiness diagnostic. The command remains deterministically nonzero, and native coverage requires the three registry keys and Arabic labels while rejecting missing-script/module failures. Ordinary build and full verification are unaffected.

## Verification Evidence

- `npm run verify` — passed: 125/125 native tests, zero Astro diagnostics, normal static build, and 26/26 Chromium journeys.
- `npm run launch:ready` — expected nonzero: named `refutations`, `generalIssues`, and `scholarship` with their Arabic labels.
- Normal `dist` scan — no proof route, proof title, `example.com`, demonstration video ID, review field, reviewer fixture value, or sidecar trace.
- Hercules-guided visual/logic QA — passed at mobile and desktop for both proof formats; evidence and coverage ledger are under ignored `.artifacts/qa/03-01/`.
- `git diff --check` — passed.

## TDD Gate Compliance

- RED: `ed9ffee` committed the failing trust/readiness contract before production implementation.
- GREEN: `2cc6285` implemented the approval boundary and launch mode; all 125 native tests pass.
- No refactor commit was needed.

## User Setup Required

None - no external service, secret, environment variable, or package configuration is required.

## Next Phase Readiness

- Plan 03-02 can build the registry-driven discovery graph on a structurally green repository with zero public articles.
- Plan 03-03 can split development-proof and production-discovery browser projects while reusing the established artifact boundary.
- Launch remains intentionally blocked until Plan 03-04 receives real owner-supplied articles, matching videos, truthful dates/references, consented reviewer identities, and exact-source dual approvals.
- Phase 3 is not complete and `npm run launch:ready` must remain red until those genuine inputs exist.

## Self-Check: PASSED

- Created file `src/lib/approval-contract.ts` exists.
- Task commits `ed9ffee`, `b0905fb`, and `2cc6285` exist in repository history.
- All task acceptance criteria and plan-level verification commands were rerun successfully, with launch readiness intentionally red for the correct missing-content reason.

---
*Phase: 03-real-content-and-section-discovery*
*Completed: 2026-08-27*
