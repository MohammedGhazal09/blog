---
phase: 06-production-launch-verification
plan: 02
subsystem: testing
tags: [playwright, cdp, web-vitals, accessibility, rtl, production-verification]

requires:
  - phase: 06-production-launch-verification
    plan: 01
    provides: Exact-origin crawl boundary, controlled authority separation, and ignored evidence paths
  - phase: 05-deployment-and-measurement
    provides: Owner-controlled production evidence boundary and process-local launch configuration
provides:
  - Deterministic five-role production LCP and CLS laboratory audit with fifteen cold samples
  - Every-article media intent, fallback, request, and geometry verification
  - Every-route Arabic, RTL, accessibility, keyboard, text-spacing, and reflow verification
  - Arabic operator workflow and reviewer-maintained Phase 6 evidence ledger
affects: [production-release-review, final-origin-certification, milestone-audit]

tech-stack:
  added: []
  patterns:
    - Separate controlled runner correctness from final-origin, field, native-zoom, and provider evidence
    - Keep production verification opt-in, report-only, and confined to ignored phase artifacts

key-files:
  created: []
  modified:
    - scripts/verify-production.mjs
    - tests/production-verification.test.ts
    - README.md
    - .planning/phases/06-production-launch-verification/06-PRODUCTION-EVIDENCE.md

key-decisions:
  - "Use exactly five deterministic sitemap-derived performance roles with three fresh mobile-like CDP runs per role and maximum-session-window CLS."
  - "Keep controlled timing seams unavailable in network mode and keep INP field-only."
  - "Never promote controlled evidence into final-origin, native-zoom, field, provider, QUAL-05, or QUAL-06 success."

patterns-established:
  - "Production browser reports preserve raw samples, medians, profile constants, route roles, and authority scope for reviewer inspection."
  - "Every article is independently audited before intent, after pointer intent, after Enter intent, during blocked-player fallback, and across reserved geometry."

requirements-addressed: [QUAL-05, QUAL-06]
requirements-completed: [QUAL-05, QUAL-06]

duration: 41min
completed: 2026-08-28
---

# Phase 6 Plan 02: Production Performance, Media, Presentation, and Evidence Summary

> Historical execution record from 2026-08-28. The post-verification addendum below records the later final-origin closure on 2026-08-31.

**The exact-origin verifier now produces authority-labelled performance, media, Arabic/RTL, accessibility, and reflow evidence while every owner-controlled production claim remains explicitly pending.**

## Performance

- **Duration:** 41 min
- **Started:** 2026-08-28T08:59:00+03:00
- **Completed:** 2026-08-28T09:40:00+03:00
- **Tasks:** 3
- **Files modified:** 4 tracked files

## Accomplishments

- Added exactly five deterministic performance roles with three fresh-context cold runs each, the locked mobile/CDP profile, raw LCP/CLS samples, medians, maximum-session-window CLS, and explicit missing/threshold failures.
- Added every-article pre-intent request/iframe checks, pointer and Enter activation, no-cookie identity, independent direct fallback, and stable 16:9 geometry verification.
- Added every-route plus 404 Arabic/RTL, visible/head/attribute/accessibility-tree leakage, landmarks/headings, Axe, keyboard, text-spacing, and 320 CSS-pixel reflow verification.
- Added the Arabic process-local `SITE_ORIGIN` operator workflow and a reviewer-maintained evidence ledger that the runner cannot rewrite.
- Preserved the static application boundary: no dependency, lockfile, Playwright configuration, server adapter, UI, analytics, monitoring, telemetry, or environment-file change.

## Task Commits

Each task was committed atomically:

1. **Task 1: Write the failing controlled performance, media, and Arabic audit contracts** - `c06e352` (test)
2. **Task 2: Complete the production lab, media, and rendered audit runner** - `8d8f2b0` (feat)
3. **Task 3: Add the reviewed evidence ledger, Arabic operator path, and complete local gates** - `5fcf64e` (docs)

## Files Created/Modified

- `scripts/verify-production.mjs` - Complete controlled/final-origin crawl, performance, media, Arabic/RTL, accessibility, and reflow runner.
- `tests/production-verification.test.ts` - Controlled success and failure matrices for performance, media, presentation, evidence authority, and operator documentation.
- `README.md` - Arabic opt-in production verification and reviewer workflow using a process-local origin.
- `.planning/phases/06-production-launch-verification/06-PRODUCTION-EVIDENCE.md` - Reviewer-maintained authority ledger with controlled PASS and external PENDING rows.

## Decisions Made

- Kept the final-origin reader-idle window fixed at five seconds and measured CLS across the full relevant session window.
- Kept INP outside the lab runner because a synthetic click is not field interaction evidence.
- Kept controlled-only timing and sample seams unavailable to network mode so callers cannot manufacture favorable production values.
- Kept the report generator unable to select arbitrary artifact paths or mutate the committed evidence ledger.
- Made no reader-facing UI change because the full automated and visual audit found no phase-scoped defect.

## Deviations from Plan

None - the tracked plan implementation executed exactly as written.

## Issues Encountered

- The ignored Hercules/Playwright visual-QA harness initially expanded Arabic routes beyond the Windows filename limit. It was corrected to use deterministic short hashes and rerun successfully.
- The same ignored harness initially treated the intentional 404 navigation notice as an unexpected console error. It was corrected to classify only the exact 404-route notice and rerun successfully.
- Neither issue affected tracked source, application behavior, or plan scope.

## Verification

- Full native suite: **177/177 passed**.
- Astro diagnostics: **0 errors, 0 warnings, 0 hints**.
- Browser suite: **49/49 passed**.
- Static build: **9 HTML documents** generated.
- Ordinary analytics markup matches: **0**.
- Missing-origin CLI: nonzero exit with **0** production artifact directories created.
- `package-lock.json`, `playwright.config.ts`, and `.gitignore`: unchanged by the plan.
- `git diff --check`: clean.
- Stub scan: initialization arrays/objects, null metric guards, and empty URL-component guards were reviewed as functional runtime/test state; no UI-rendering or goal-blocking stub exists.

## Visual QA

- Hercules visual-QA workflow executed through the documented Playwright fallback because Chrome DevTools MCP was unavailable.
- Evidence is stored only under the ignored `.artifacts/phase-06/visual-qa/` directory.
- All 8 sitemap routes plus a true 404 were exercised in visible Chromium.
- Five unique route archetypes were visually inspected at 390x844, 768x1024, 1366x768, and 1920x1080; all routes were inspected at mobile and desktop widths.
- Result: **9 routes, 50 screenshots, 0 Axe violations, 0 horizontal-overflow failures, 0 unexpected console errors, and 0 confirmed product findings**.
- Keyboard focus and the player-intent surface were visually inspected; the one blocked `youtube-nocookie.com` request was intentional test containment after explicit intent.

## Evidence Authority and Threat Boundary

- Controlled runner correctness is **PASS** and cannot be promoted by caller options.
- Final public origin, production crawl, production LCP/CLS, production media behavior, production presentation, native 200% zoom, field INP, Cloudflare/DNS/TLS, Search Console, and Plausible remain **PENDING**.
- `QUAL-05` and `QUAL-06` remain **PENDING** because no owner-approved final origin was supplied.
- No new endpoint, authentication path, schema, file trust boundary, dependency, or runtime application surface was introduced.

## User Setup Required

No repository setup is required. Final certification requires the owner-approved exact public HTTPS origin and direct evidence from the owner-controlled deployment and service dashboards.

## Next Phase Readiness

- Repository-controlled Phase 6 implementation and local verification are complete.
- The milestone can proceed to external launch evidence collection without further application changes.
- Do not close `QUAL-05` or `QUAL-06` until the final-origin, native-zoom, and relevant owner/provider evidence rows are directly reviewed.

## Post-Verification Addendum — 2026-08-31

- The final-origin report at `.artifacts/phase-06/production/20260831T044102223Z/report.json` passed crawl, performance, and presentation against the exact production origin.
- Five roles × three cold runs produced median LCP values of 908–1032 ms and CLS 0. Direct visible Chrome separately passed pointer and Enter media activation for all three articles after the verifier's fixed 45-second media subpasses timed out.
- Native Chrome 200% zoom preserved content, controls, focus, and one-dimensional reflow without horizontal overflow.
- `QUAL-05` and `QUAL-06` are complete. Field INP remains a nonblocking `PENDING` observation until eligible CrUX or Search Console data exists; analytics remains out of v1.
- Current authority is `06-PRODUCTION-EVIDENCE.md`, `06-HUMAN-UAT.md`, and `06-VERIFICATION.md`; their reviewer-authored closure supersedes the original pending execution state above.

## Self-Check: PASSED

- All four tracked plan files and this summary exist.
- Task commits `c06e352`, `8d8f2b0`, and `5fcf64e` exist.
- Fresh full verification and visual QA evidence support every repository-controlled completion claim.
- At original plan completion, external facts and both requirement IDs were pending; the dated addendum and current evidence ledger record the later closure.

---

_Phase: 06-production-launch-verification_
_Completed: 2026-08-28_
