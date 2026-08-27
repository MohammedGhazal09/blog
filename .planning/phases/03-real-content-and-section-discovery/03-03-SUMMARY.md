---
phase: 03-real-content-and-section-discovery
plan: 03
subsystem: testing
tags: [playwright, astro, rtl, accessibility, visual-qa, approval-oracle]

requires:
  - phase: 03-real-content-and-section-discovery
    provides: Exact-source dual-review publication boundary and development-only proof fixtures from Plan 03-01
  - phase: 03-real-content-and-section-discovery
    provides: Shared Arabic shell, registry discovery routes, truthful author page, and contextual article links from Plan 03-02
provides:
  - Distinct development-proof and production-discovery Playwright identities with separate ports, routes, and test ownership
  - Independent raw-source/current-sidecar production corpus oracle compared separately with built routes and rendered indexes
  - Complete ignored Hercules visual/logic evidence with corrected pinned-runtime identity and no unresolved structural defect
affects: [03-04, phase-04-search-discovery-integrity, browser-regression, launch-readiness]

tech-stack:
  added: []
  patterns:
    - Development draft journeys and production discovery run through separate Playwright projects and Astro servers
    - Expected public membership is derived independently from raw source bytes plus strict current approval sidecars
    - Visible DevTools inspection and persisted Playwright capture share one ignored evidence ledger with honest backend labels

key-files:
  created:
    - tests/discovery.spec.ts
  modified:
    - playwright.config.ts
    - tests/article-journey.spec.ts

key-decisions:
  - "Keep development and production browser identity explicit through separate projects, ports, readiness routes, and test matches."
  - "Derive the production expectation from raw validated article sources and exact current sidecars, never from the public selector, generated routes, rendered indexes, or future hardcoded article facts."
  - "Use visible Chrome DevTools for live interaction and native zoom, repository Playwright for persisted W: artifacts, and label both roles honestly."

patterns-established:
  - "Three-way corpus proof: independent source oracle equals built routes, equals rendered index links, followed by a separate route-to-index wiring assertion."
  - "Evidence boundary: screenshots, logs, ledgers, and reports remain ignored under .artifacts while tracked browser tests carry reproducible regressions."

requirements-completed: [SITE-03, SITE-04, SITE-05, CONT-03]

duration: "1h 3m"
completed: 2026-08-27
---

# Phase 3 Plan 3: Structural Browser Verification Summary

**Separate development and production browser identities now prove the Arabic discovery graph, independent approval-backed corpus membership, responsive accessibility, proof isolation, and visible structural quality without inventing launch content.**

## Performance

- **Duration:** 1h 3m
- **Started:** 2026-08-27T05:51:16Z
- **Completed:** 2026-08-27T06:54:42Z
- **Tasks:** 3
- **Tracked files modified:** 3

## Accomplishments

- Split the browser harness into explicit `development-proof` and `production-discovery` projects with separate test files, ports, base URLs, and Playwright-managed Astro servers.
- Added a production discovery suite whose independent raw-source/current-sidecar oracle is compared separately with generated routes and rendered section links, while also proving their direct wiring, sort order, privacy, no-JavaScript behavior, keyboard flow, reflow, visual tokens, and accessibility.
- Preserved all 26 Markdown/MDX reader and intent-gated media scenarios while adding shared-shell and contextual section/author link coverage.
- Completed visible Chrome DevTools inspection, native 200% zoom review, and a corrected-runtime 31-capture Playwright evidence pass with 45 tested rows, one fixed QA-environment row, zero failed/untested rows, and only genuine content states blocked.

## Task Commits

1. **Task 1: Separate development proof and production discovery browser identities** - `1bf1786` (test)
2. **Task 2: Prove the production discovery graph, empty/populated states, and accessibility** - `ff23fc3` (test)
3. **Task 3: Run evidence-first visual and logic QA, fix root causes, and re-verify** - no tracked task commit; no product defect was found and the complete evidence set is intentionally ignored under `.artifacts/`

## Files Created/Modified

- `tests/discovery.spec.ts` - Independent production corpus oracle and complete static discovery, privacy, no-JavaScript, keyboard, responsive, token, and axe contract.
- `playwright.config.ts` - Separate development-proof and production-discovery project/server identities with all browser output under `.artifacts/`.
- `tests/article-journey.spec.ts` - Preserved two-format article/media matrix plus shared shell and contextual destination checks.
- `.artifacts/hercules-visual-qa/phase-03-structural/20260827-091113-phase-03-structural-127.0.0.1-4322/` - Ignored screenshots, native-zoom evidence, identity notes, console/network summary, complete coverage ledger, and findings-first report.

## Decisions Made

- Production discovery expectations stay independent from `getPublicArticles()`, `dist`, route generation, rendered indexes, and future real-content constants so common-mode selector omissions cannot pass.
- Reviewer values may be inspected only through non-echoing negative checks; they never enter oracle results, assertion diagnostics, screenshots, logs, or public output.
- Visible Chrome DevTools remains the live inspection backend; Playwright persists evidence because DevTools could not write to the `W:` artifact path.
- A truthful empty corpus is a structurally valid test state but never a launch-ready state; populated screenshots and approvals remain blocked until genuine owner input exists.

## Deviations from Plan

None - the plan executed exactly as written. Task 3 found no product source defect, so no speculative source change or empty commit was created.

## Issues Encountered

- The final identity check found both long-lived Astro listeners using bare-PATH Node `24.8.0`. They were stopped, the normal site was rebuilt, both servers were relaunched through the pinned Node `24.19.0` executable, and all 31 persisted captures were refreshed with zero failures. This was a QA run-state issue, not a product defect.
- The intentionally failing Windows launch-readiness build printed the known libuv handle-closing assertion after the correct aggregated missing-section diagnostic. The expected exit remained nonzero for the truth-gate reason; the subsequent normal five-page build passed and restored `dist`.

## Verification Evidence

- Pinned `npm run verify` - passed: 125/125 native tests, zero Astro errors/warnings/hints across 17 files, five normal static routes, and 37/37 browser tests across both explicit projects.
- Pinned `npm run launch:ready` - expected nonzero and named all missing sections: `refutations`, `generalIssues`, and `scholarship`, with their Arabic labels.
- Pinned normal `npm run build` after the expected-red gate - passed and restored exactly five structural pages with no proof trace.
- Corrected-runtime `capture-evidence.mjs` - 31/31 route/viewport captures passed with zero browser console issues, failed requests, unexpected remote requests, semantic failures, or horizontal overflow.
- Hercules report - 45 ledger rows tested, one QA-environment row fixed, zero failed, zero untested, and two genuine-input rows blocked.
- `git diff --check`, ignored-artifact check, focused/skipped-test scan, and watched-path artifact scan - passed.

## Known Stubs

None. Truthful section empty states are deliberate structural behavior; real launch content is a blocked external input owned by Plan 03-04, not a stub to fabricate.

## User Setup Required

None for Plan 03-03. No external service, secret, environment file, new dependency, or account configuration was introduced.

## Next Phase Readiness

- Plan 03-04 can now supply genuine owner facts and one exact article/video/review package per section against an already corpus-adaptive production suite.
- Phase 3 remains incomplete. `CONT-01` and `CONT-02` stay pending, launch readiness stays red, and Phase 4 must not begin until the human trust gate receives genuine inputs.

## Self-Check: PASSED

- Task commits `1bf1786` and `ff23fc3` exist and the three tracked browser surfaces exist.
- All task acceptance criteria and plan verification commands passed; the launch gate remains intentionally red for the exact missing-content reason.
- The ignored Hercules directory contains identity evidence, 31 refreshed captures, native zoom screenshots, a complete ledger, console/network notes, and the final report.
- No source defect remains, no test is focused/skipped, no `.env` file was read, and no browser artifact exists in a watched source or planning path.

---
*Phase: 03-real-content-and-section-discovery*
*Completed: 2026-08-27*
