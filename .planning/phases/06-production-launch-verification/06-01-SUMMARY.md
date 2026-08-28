---
phase: 06-production-launch-verification
plan: 01
subsystem: testing
tags: [node-test, playwright, production-crawl, seo, evidence]

requires:
  - phase: 04-search-discovery-integrity
    provides: Static sitemap, robots, canonical, Arabic metadata, and 404 contracts
  - phase: 05-deployment-and-measurement
    provides: Exact production-origin boundary and authority-separated launch evidence
provides:
  - Exact serialized port-free public HTTPS origin validation
  - Importable and opt-in whole-origin crawl verifier
  - Controlled crawl/error matrix with immutable evidence authority
affects: [06-02-production-browser-audit, production-release-review]

tech-stack:
  added: []
  patterns:
    - Validate the exact origin before timestamps, filesystem work, browser launch, fixture callbacks, or requests
    - Derive controlled evidence scope from the injected transport and write only ignored public-fact JSON

key-files:
  created:
    - scripts/verify-production.mjs
    - tests/production-verification.test.ts
  modified:
    - src/lib/site-origin.ts
    - tests/site-origin.test.ts
    - package.json

key-decisions:
  - "Use the existing productionSiteOrigin boundary and intentionally reject every normalization variant."
  - "Keep controlled runner success separate from QUAL-05 and QUAL-06, which remain pending without qualifying final-origin evidence."

patterns-established:
  - "Static production discovery uses manual redirects, 20-second aborts, 5 MiB streamed-body bounds, and inert Chromium DOMParser extraction."
  - "Generated evidence uses a fixed .artifacts/phase-06/{controlled|production}/{UTC-run-id}/report.json path and never rewrites planning evidence."

requirements-addressed: [QUAL-05, QUAL-06]
requirements-completed: []

duration: 26min
completed: 2026-08-28
---

# Phase 6 Plan 01: Exact-Origin Crawl Boundary Summary

**An exact-origin, fail-before-I/O verifier now crawls deployed sitemap membership and same-origin links while controlled evidence remains unable to claim production success.**

## Performance

- **Duration:** 26 min
- **Started:** 2026-08-28T08:31:00+03:00
- **Completed:** 2026-08-28T08:57:00+03:00
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Tightened the shared origin boundary to accept only the exact lowercase, port-free serialized HTTPS origin.
- Added one importable/CLI crawler that verifies robots, sitemap XML, direct public responses, same-origin link closure, canonical and Arabic metadata identity, draft exclusion, YouTube anchor identity, and the true Arabic 404.
- Added a visibly synthetic controlled fixture plus named redirect, malformed XML, duplicate, entity, size, cross-origin, HTTP, link, canonical, metadata, noindex, draft, 404, external-link, and authority tests.
- Preserved ordinary verification isolation and dependency/lockfile/Playwright configuration boundaries.

## Task Commits

Each task was committed atomically:

1. **Task 1: Write the failing exact-origin and controlled crawl contracts** - `981e29e` (test)
2. **Task 2: Implement the isolated exact-origin crawl command** - `74700c7` (feat)

## Files Created/Modified

- `scripts/verify-production.mjs` - Importable crawler and opt-in CLI with fixed, authority-labelled JSON output.
- `tests/production-verification.test.ts` - Controlled happy path, fail-before-I/O checks, and complete crawl/error/authority matrix.
- `src/lib/site-origin.ts` - Exact serialized and port-free production-origin enforcement.
- `tests/site-origin.test.ts` - Exact-origin acceptance/rejection matrix.
- `package.json` - Serialized controlled test registration and isolated `verify:production` command.

## Decisions Made

- Reused the shared validator, Node fetch, browser DOMParser, installed Chromium, and repository draft oracle; no new helper layer or package was added.
- Kept both production requirements pending in controlled reports even when the crawler itself passes.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration is required for repository-controlled Plan 01 work.

## Verification

- Focused exact-origin and controlled crawler matrix: **64/64 passed**.
- Full native suite: **153/153 passed**.
- Astro diagnostics: **0 errors, 0 warnings, 0 hints**.
- Browser suite: **49/49 passed**.
- Missing-origin CLI check: exited nonzero and created **0** production run directories.
- `package-lock.json`, `playwright.config.ts`, and `.gitignore`: unchanged.
- Generated test reports were inspected in-process for fixed controlled scope, public-only fields, pending production requirements, and fixed ignored paths, then removed by exact-path cleanup.

## Security and Evidence Boundary

- Origin validation precedes filesystem, browser, transport, and timestamp activity.
- Static responses are redirect-free, timeout-bounded, size-bounded, content-typed, same-origin checked, and rejected on unsafe XML declarations.
- Reports contain public crawl facts only and cannot select their scope or output location through caller options.
- No unresolved High-severity security finding exists.

## Next Phase Readiness

- Ready for `06-02-PLAN.md` to add performance, media-interaction, Arabic/accessibility/reflow auditing, and the reviewer evidence ledger.
- The exact owner-approved final HTTPS origin remains unavailable, so final-origin results, native zoom, field data, provider facts, `QUAL-05`, and `QUAL-06` remain pending/human-needed.

## Self-Check: PASSED

- Created files exist: `scripts/verify-production.mjs`, `tests/production-verification.test.ts`.
- Task commits exist: `981e29e`, `74700c7`.
- All task acceptance criteria and plan-level verification checks passed without contacting a real property.

---

_Phase: 06-production-launch-verification_
_Completed: 2026-08-28_
