---
phase: 02-complete-arabic-article-journey
plan: 03
subsystem: media-ui-testing
tags: [astro, youtube-nocookie, progressive-enhancement, rtl, playwright, accessibility]

requires:
  - phase: 02-complete-arabic-article-journey
    plan: 02
    provides: complete Markdown/MDX Arabic reader journeys, permanent same-tab YouTube continuation, and exact browser/reflow/axe contract
  - phase: 01-content-and-url-contract
    provides: validated 11-character YouTube IDs, strict public/draft selection, stable Arabic routes, and restricted MDX boundary
provides:
  - Intent-gated privacy-enhanced iframe with zero eager third-party media requests
  - One-shot native activation with stable 16:9 dimensions, exact Arabic labeling, and iframe focus transfer
  - Resilient JavaScript-disabled, blocked-host, construction-error, keyboard, and permanent-direct-link behavior
  - Two-route responsive visual evidence for pre-activation, focus, activated, and error states
affects: [02-04-reader-verification, 03-launch-content, 04-search-discovery]

tech-stack:
  added: []
  patterns: [intent-gated native enhancement, hardcoded no-cookie media origin, static fallback outside mutation, artifact-isolated visual QA]

key-files:
  created: []
  modified: [src/components/YouTubePlayer.astro, src/pages/[section]/[slug].astro, tests/article-journey.spec.ts]

key-decisions:
  - "Create the iframe only from an already-validated ID after explicit native-button intent, using a hardcoded no-cookie origin and DOM property assignment rather than authored URLs or HTML injection."
  - "Keep the permanent same-tab YouTube anchor as static HTML outside the replaceable 16:9 region so every local failure mode preserves a complete continuation path."
  - "Preserve native hidden semantics with state-aware CSS selectors instead of custom ARIA or keyboard behavior."
  - "Retain real 200% browser zoom and live cross-origin playback/focus escape for Plan 02-04 human verification when automation cannot prove those browser states."

patterns-established:
  - "Media intent boundary: initial static HTML reserves local dimensions but contains no iframe, poster, preconnect, thumbnail, or third-party request."
  - "One-shot enhancement: register the native click listener before revealing the trigger, guard existing iframe state, replace only the button, and focus the inserted frame."
  - "Fallback independence: complete article content, polite static status, and the direct YouTube anchor never depend on the dynamic iframe."

requirements-completed:
  - SITE-01
  - ART-02
  - ART-03
  - ART-04
  - ART-05
  - QUAL-01
  - QUAL-02
  - QUAL-03
  - QUAL-04

duration: 36min
completed: 2026-08-26
---

# Phase 2 Plan 3: Intent-Gated YouTube Player Summary

**A one-shot native Arabic player now creates a focused `youtube-nocookie.com` iframe only after reader intent while preserving the complete static article and direct-video path through every local failure mode.**

## Performance

- **Duration:** 36 min
- **Started:** 2026-08-26T16:56:19Z
- **Completed:** 2026-08-26T17:31:32Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added a hidden-until-wired native Arabic activation button, local 16:9 reserved surface, privacy note, exact static error status, and permanent same-tab YouTube action without adding a dependency or eager remote asset.
- Implemented one processed Astro browser script that accepts only the validated 11-character ID, hardcodes and encodes the no-cookie embed path, prevents duplicates, omits autoplay, and transfers focus to the inserted iframe.
- Expanded the two-route Playwright matrix with pre-activation network silence, one-shot pointer/keyboard activation, focus traversal, JavaScript-disabled fallback, blocked host, forced construction failure, stable dimensions, and direct-link invariants.
- Completed activation and resilience visual QA across both routes, four rendered states, and 320/390/768/1024/1440 widths with all evidence isolated under ignored `.artifacts`.
- Preserved all earlier content, provenance, bidi, restricted-MDX, draft-exclusion, reflow, axe, and visual-quality contracts; the final browser suite increased from 18 to 26 passing cases.

## Task Commits

Each TDD task was committed atomically through RED and GREEN:

1. **Task 1 RED: Add failing intent-gated player tests** - `4e740be` (test)
2. **Task 1 GREEN: Implement intent-gated YouTube player** - `12d7d76` (feat)
3. **Task 2 RED: Add failing resilience and keyboard tests** - `d694a56` (test)
4. **Task 2 GREEN: Harden player fallback and focus states** - `7d188db` (feat)

## Files Created/Modified

- `src/components/YouTubePlayer.astro` - Static Arabic media contract and one-shot processed DOM enhancement using the hardcoded no-cookie embed origin.
- `src/pages/[section]/[slug].astro` - Stable 16:9 media region, secondary/primary action treatments, state-aware hidden/error styling, and exact visible focus rules.
- `tests/article-journey.spec.ts` - Network, idempotence, dimensions, focus, keyboard, disabled-JavaScript, blocked-host, construction-error, reflow, and fallback regression coverage.

## Decisions Made

- Kept the validated `youtubeId` as the only content value crossing into the browser enhancement. The iframe URL is assembled from a hardcoded origin plus `encodeURIComponent`, so authors cannot provide or alter an embed destination.
- Kept the direct YouTube action outside `data-video-region` and never mutates it. Inline playback is optional; the complete static article-to-video journey is not.
- Used a native button, its built-in Enter/Space behavior, native `hidden`, and ordinary focus movement instead of custom keyboard shortcuts, retry logic, a focus trap, or extra ARIA.
- Classified real 200% browser zoom, live cross-origin playback, and human cross-origin focus escape as Plan 02-04 verification. Automated hotkeys did not change measurable browser zoom state, and the visual runner deliberately aborted the external host.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed CSS overriding the native hidden activation state**

- **Found during:** Task 2 (Harden Arabic error, keyboard/focus, no-JavaScript, and blocked-player states)
- **Issue:** The authored `[data-video-activate] { display: inline-flex; }` rule overrode browser handling of `hidden`, exposing a dead activation button when JavaScript was disabled.
- **Fix:** Scoped the rendered control style to `[data-video-activate]:not([hidden])` and kept the construction-error status state-aware, centered, and wrap-safe.
- **Files modified:** `src/pages/[section]/[slug].astro`
- **Verification:** Both `degraded` route cases, JavaScript-disabled accessibility checks, focused Task 2 gate, full browser suite, and five-width visual matrix pass.
- **Committed in:** `7d188db`

**2. [Rule 3 - Blocking] Kept reflow assertions scoped to rendered article content**

- **Found during:** Task 2 full `npm run verify`
- **Issue:** The pre-existing reflow test required every direct article child and every paragraph to be visible, so it incorrectly failed on the processed non-rendered `<script>` and intentionally hidden error status introduced by the planned enhancement.
- **Fix:** Excluded only script/style children and elements carrying native `hidden`; all reader content still must remain visible and inside the article column at every locked width.
- **Files modified:** `tests/article-journey.spec.ts`
- **Verification:** Focused reflow cases passed 2/2, followed by the exact full gate at 26/26 Chromium cases.
- **Committed in:** `7d188db`

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking test-contract correction)
**Impact on plan:** Both changes were required for the planned native enhancement and exact full gate. No new feature, dependency, route, content capability, or architecture was added.

## Issues Encountered

- Chrome DevTools MCP was unavailable, so the Hercules workflow used visible Playwright Chromium fallback and labels the backend honestly.
- The Task 2 RED test initially used nonexistent Playwright `boundingBox()` `left`/`right` fields; the RED commit was corrected to `x`/`width` before GREEN implementation.
- The first full gate exposed the two stale reflow assumptions described above; the focused reflow rerun and complete gate passed after the narrow correction.
- Five automated `Control+=` shortcuts did not change DPR, inner width, or visual viewport scale. The report marks real 200% zoom blocked/manual-only instead of claiming evidence that was not produced.
- One generic anonymous 404 console message appeared only in the first forced-error context. An immediate response-logging reproduction produced no 4xx/5xx response, so it is documented without classifying it as an application defect.
- The installed GSD SDK uses named flags for metric/decision/session mutations and matches the unpadded phase number in the ROADMAP table. Initial positional/padded calls returned incomplete no-op results; rerunning the installed handler contracts updated and validated every planning artifact.

## Visual QA

- Activation evidence: `.artifacts/hercules-visual-qa/phase-02-plan-03-activation/20260826-200443-test-and-fix-127.0.0.1-4321/`.
- Resilience evidence: `.artifacts/hercules-visual-qa/phase-02-plan-03-resilience/20260826-202207-test-and-fix-127.0.0.1-4321/`.
- The resilience run captured 80 required viewport/full-page screenshots plus one zoom-attempt image and generated 20 reviewed contact sheets for both routes, all four states, and all five widths.
- Machine validation passed all 10 route-width rows: zero eager YouTube requests, one post-intent no-cookie request/iframe, exact title/status, focused iframe, unchanged dimensions, unchanged same-tab CTA outside mutation, and zero overflow/clipping.
- The activated screenshots intentionally show a failed-frame icon because the runner aborts the external host after DOM insertion; real playback is not claimed.

## TDD Gate Compliance

- **Task 1 RED:** `4e740be` proved network silence, one-shot creation, exact no-cookie URL/title, focus, dimensions, and direct-link independence failed before implementation.
- **Task 1 GREEN:** `12d7d76` followed and made the intent-gated player contract pass.
- **Task 2 RED:** `d694a56` proved disabled-JavaScript, blocked-host, construction-error, Enter/Space, target-size, focus-style, and traversal behavior before the fallback correction.
- **Task 2 GREEN:** `7d188db` followed and made the resilience contract plus the complete suite pass.
- **REFACTOR:** No separate refactor commit was needed; the minimal native implementation passed source-policy, runtime, security-boundary, and visual gates.

## Known Stubs

None. The stub scan found only `const youtubeRequests: string[] = []` in the browser test, which is an intentional request-capture accumulator and does not flow to reader rendering.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Ready for `02-04-PLAN.md` to perform the retained human verification of real 200% zoom, live cross-origin playback, and cross-origin focus escape.
- The player contract is complete for Markdown and approved MDX without widening the content model, MDX allowlist, route family, or dependency surface.
- Phase 4 still owns Arabic page titles, metadata, favicon/discovery files, and the final canonical domain.

## Self-Check: PASSED

- All three planned source/test files and this summary exist.
- Task commits `4e740be`, `12d7d76`, `d694a56`, and `7d188db` exist in repository history in RED/GREEN order.
- Exact Node 24.19.0/npm 11.17.0 `npm run verify` passed after the final source commit: 68/68 Node tests, zero Astro diagnostics, two static public routes, and 26/26 Chromium cases.
- Production output contains exactly the two public fixtures; no draft marker or route is present.
- Forbidden-source, dependency, MDX-capability, artifact-ignore, stub, and unplanned-threat-surface scans passed.
- Both ignored Hercules evidence roots exist; the resilience ledger/report honestly retains real 200% zoom and cross-origin verification for Plan 02-04.

---
*Phase: 02-complete-arabic-article-journey*
*Completed: 2026-08-26*
