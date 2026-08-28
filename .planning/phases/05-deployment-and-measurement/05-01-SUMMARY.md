---
phase: 05-deployment-and-measurement
plan: 01
subsystem: measurement
tags: [astro, plausible, analytics, playwright, rtl, tdd]

# Dependency graph
requires:
  - phase: 04-search-discovery-integrity
    provides: Validated launch origin, shared metadata head, static public route graph, and locked Arabic/RTL body contract
provides:
  - Fail-closed validation for the current Plausible script asset shape
  - One launch-readiness-only deferred analytics loader across every emitted HTML document
  - Controlled browser evidence for one native YouTube outbound event path and failure-independent UI behavior
affects: [05-02-production-deployment-evidence, launch-readiness, measurement]

# Tech tracking
tech-stack:
  added: []
  patterns: [validated public build inputs, exact Astro mode gates, controlled third-party interception]

key-files:
  created: [src/lib/measurement.ts, tests/deployment-measurement.test.ts]
  modified: [scripts/launch-ready.mjs, src/layouts/SiteLayout.astro, tests/content-contract.test.ts, package.json]

key-decisions:
  - "Accept only exact clean https://plausible.io/js/pa-[A-Za-z0-9_-]+.js assets and fail before the launch build on any normalization or authority difference."
  - "Keep launch-readiness mode as the sole analytics gate and leave ordinary builds, body output, native YouTube navigation, and YouTubePlayer.astro untouched."
  - "Treat controlled interception as local wiring evidence only; real Plausible receipt and dashboard reporting remain external Plan 05-02 facts."

patterns-established:
  - "Public measurement inputs are validated at the launch wrapper before Astro renders them."
  - "Third-party analytics may observe native anchors but cannot own, intercept, delay, retry, or duplicate navigation."

requirements-completed: [MEAS-01, MEAS-02]

# Metrics
duration: 18min
completed: 2026-08-28
---

# Phase 05 Plan 01: Fail-Closed Launch Measurement Summary

**Exact Plausible asset validation and a launch-only deferred loader with controlled proof of one native YouTube outbound event path and zero visible UI change**

## Performance

- **Duration:** 18 min
- **Started:** 2026-08-28T02:39:16Z
- **Completed:** 2026-08-28T02:56:53Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added a small fail-closed validator that accepts only the current clean Plausible `pa-*.js` asset form on the official HTTPS host.
- Extended the controlled launch wrapper and shared head so every launch document receives exactly one deferred loader while ordinary output remains analytics-free even with an ambient value.
- Proved through native and browser tests that one direct YouTube CTA activation creates one matching `Outbound Link: Click` attempt, player activation creates none, and blocked analytics cannot affect Arabic content, focus, layout, media, or navigation.
- Completed headed visual QA over nine route families and five widths with 45/45 byte-identical ordinary/launch screenshot pairs and zero serious or critical Axe findings.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add the executable RED measurement contract** - `a582b0e` (test)
2. **Task 2: Implement the fail-closed launch-only loader and make the slice green** - `516cbb0` (feat)

## Files Created/Modified

- `src/lib/measurement.ts` - Validates and returns only the exact approved public Plausible asset URL shape.
- `scripts/launch-ready.mjs` - Validates both public launch inputs before invoking Astro in launch-readiness mode.
- `src/layouts/SiteLayout.astro` - Adds one deferred, compiler-unprocessed loader to the shared head only for launch-readiness builds.
- `tests/content-contract.test.ts` - Covers validation, output counts, ordinary omission, body invariance, restoration, and source boundaries.
- `tests/deployment-measurement.test.ts` - Provides isolated controlled browser proof for outbound measurement and analytics-failure independence.
- `package.json` - Registers the focused measurement contract and serializes build-mutating native tests.

## Decisions Made

- Used the platform `URL` parser plus exact authority/path checks, including exact raw-to-normalized equality, so credentials, ports, alternate hosts, queries, fragments, encodings, legacy filenames, and malformed values fail closed.
- Kept `import.meta.env.MODE === "launch-readiness"` as the only inclusion boundary; there is no second flag, compatibility route, application click listener, custom analytics event, or runtime dependency.
- Left `Astro.site` as the sole canonical origin authority and preserved the existing body, styles, Arabic copy, RTL semantics, direct anchor, and `YouTubePlayer.astro` source exactly.
- Classified deterministic browser interception only as project-wiring evidence. No claim is made that a real Plausible property received or reported an event.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Distinguished the deliberate 404 document from unexpected HTTP failures in the headed QA runner**
- **Found during:** Task 2 visual verification
- **Issue:** Chromium emitted the generic resource-error console message for each intentional missing-route document, causing the evidence runner to treat the expected 404 as an asset failure.
- **Fix:** Ignored only the exact expected console echo while adding an independent response ledger that continues to fail on every unexpected HTTP error.
- **Files modified:** `.artifacts/hercules-visual-qa/phase-05-zero-visible-delta/20260828-054623-zero-visible-delta-127.0.0.1-4322/qa-runner.mjs`
- **Verification:** The complete headed matrix passed with the intended 404 response asserted and zero unexpected HTTP failures.
- **Committed in:** Not committed; browser evidence is intentionally stored in the ignored artifact directory.

**2. [Rule 3 - Blocking] Removed animation-frame stabilization from the no-JavaScript screenshot path**
- **Found during:** Task 2 visual verification
- **Issue:** The runner attempted to await page-side `requestAnimationFrame` while JavaScript was intentionally disabled, so Playwright garbage-collected the impossible promise.
- **Fix:** Captured and hashed the no-JavaScript screenshot directly while retaining the same state, request, and cross-mode comparison assertions.
- **Files modified:** `.artifacts/hercules-visual-qa/phase-05-zero-visible-delta/20260828-054623-zero-visible-delta-127.0.0.1-4322/qa-runner.mjs`
- **Verification:** Both ordinary and launch no-JavaScript scenarios passed and made no analytics request.
- **Committed in:** Not committed; browser evidence is intentionally stored in the ignored artifact directory.

---

**Total deviations:** 2 auto-fixed (2 blocking QA-harness corrections)
**Impact on plan:** Both fixes were limited to ignored verification infrastructure and strengthened error classification without changing product code or scope.

## Issues Encountered

- Chrome DevTools MCP was unavailable, so the approved Hercules headed Playwright fallback was used. Evidence is stored under `.artifacts/hercules-visual-qa/phase-05-zero-visible-delta/20260828-054623-zero-visible-delta-127.0.0.1-4322/`.
- The default shell runtime did not match the pinned project baseline. All implementation verification ran under Node v24.19.0 and npm 11.17.0 through ignored local runtime shims.

## Verification Evidence

- `npm test`: 130/130 passed.
- `npm run check`: 0 errors, 0 warnings, 0 hints.
- `npm run test:browser`: 49/49 passed.
- Headed visual QA: 45/45 full-page ordinary/launch pairs byte-identical, 45/45 structural state comparisons identical, and all nine route families free of serious or critical Axe findings.
- Manual screenshot review covered every route at 390px, the representative article at 320/768/1024/1440px, mobile and desktop 404, blocked loader, focus, player activation, and no-JavaScript states with no visual defect found.
- `git diff --check` passed; dependencies and `src/components/YouTubePlayer.astro` are unchanged; restored ordinary `dist/` contains no Plausible markup.

## Known Stubs

None.

## TDD Gate Compliance

- RED: `a582b0e` failed for the absent validator and loader contract after proving the browser/runtime harness worked.
- GREEN: `516cbb0` implemented the minimum production path and passed the complete native, type-check, browser, and visual verification matrix.

## User Setup Required

None for this local implementation plan. Owner-controlled Plausible configuration, production deployment, DNS, and live receipt/reporting evidence remain explicitly assigned to Plan 05-02.

## Next Phase Readiness

- The project-side measurement path is complete, fail-closed, launch-only, and ready for provider-equivalent deployment verification.
- Plan 05-02 must use owner-controlled production/DNS and analytics authority before claiming live Plausible receipt, dashboard reporting, canonical production availability, or Search Console state.

## Self-Check: PASSED

- All six planned source/test files exist and match the task commits.
- Task commits `a582b0e` and `516cbb0` exist in repository history.
- Required verification evidence is present in the ignored artifact directory and ordinary output was restored.

---
*Phase: 05-deployment-and-measurement*
*Completed: 2026-08-28*
