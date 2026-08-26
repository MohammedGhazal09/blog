---
phase: 02-complete-arabic-article-journey
plan: 01
subsystem: ui-testing
tags: [astro, playwright, rtl, arabic, accessibility, static]

requires:
  - phase: 01-content-and-url-contract
    provides: validated Markdown/MDX collection, stable Arabic route identity, registry facts, public/draft split, and restricted MDX rendering
provides:
  - Exact Playwright 1.62.1 and axe 4.13.0 browser harness with artifact-safe Chromium output
  - Complete static Arabic Markdown reader with registry-backed facts and UTC-stable dates
  - JavaScript-independent permanent same-tab YouTube continuation
affects: [02-02-provenance-references, 02-03-intent-gated-player, 02-04-reader-verification]

tech-stack:
  added: ["@playwright/test@1.62.1", "@axe-core/playwright@4.13.0"]
  patterns: [artifact-isolated browser tests, registry-backed reader facts, route-owned logical CSS, static media fallback]

key-files:
  created: [playwright.config.ts, tests/article-journey.spec.ts, src/components/YouTubePlayer.astro]
  modified: [package.json, package-lock.json, src/pages/[section]/[slug].astro, src/content/articles/contract-markdown.md]

key-decisions:
  - "Keep the permanent direct-video anchor as the complete static media boundary for this slice; defer the iframe enhancement to its planned later slice."
  - "Keep Astro preview under Playwright lifecycle by disabling Astro's agent-background detection and probing the real article route instead of the intentionally absent homepage."

patterns-established:
  - "Reader facts: resolve validated registry keys in route frontmatter and render Arabic labels with semantic dl/time/bdi elements."
  - "Browser evidence: keep reports, traces, videos, screenshots, and Hercules ledgers exclusively beneath ignored .artifacts/."

requirements-completed:
  - SITE-01
  - SITE-02
  - ART-01
  - ART-02
  - ART-03
  - ART-05
  - ART-06
  - ART-07
  - QUAL-01
  - QUAL-02
  - QUAL-03
  - QUAL-04

duration: 21min
completed: 2026-08-26
---

# Phase 2 Plan 1: Static Arabic Markdown Journey Summary

**A complete registry-backed RTL Markdown reader with an exact-runtime Chromium contract and a permanent same-tab YouTube continuation that works without JavaScript**

## Performance

- **Duration:** 21 min
- **Started:** 2026-08-26T15:43:28Z
- **Completed:** 2026-08-26T16:03:35Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Added exact dev-only Playwright/axe pins, a Chromium preview harness, and a JavaScript-disabled reader contract while keeping all generated evidence under ignored `.artifacts/`.
- Upgraded the existing single route into a responsive Arabic reader with registry-backed section/author facts, UTC-stable Arabic dates, labelled `الخلاصة`, semantic heading order, bidi-safe mixed values, and the locked type/spacing/palette/focus contract.
- Added the permanent encoded YouTube action as inert static HTML with no target, iframe, remote poster, preconnect, script, or request before reader navigation.
- Enriched the Markdown contract fixture with substantive Arabic introduction/body/conclusion, lists, quotation, link, diacritics, punctuation, Arabic/ASCII digits, and inline URL/video-ID bidi cases.

## Task Commits

Each task was committed atomically:

1. **Task 1: Make the static Markdown journey fail in a real Chromium harness** - `2752570` (test)
2. **Task 2: Make the complete static Arabic Markdown and direct-video journey GREEN** - `768cc3b` (feat)

## Files Created/Modified

- `package.json` / `package-lock.json` - Exact browser dev dependencies and preview/browser/composite scripts.
- `playwright.config.ts` - One Chromium project with Playwright-managed Astro preview and `.artifacts`-only output paths.
- `tests/article-journey.spec.ts` - RED-to-GREEN JavaScript-disabled Markdown journey, computed style, responsive, source-safety, public-route, and draft-exclusion assertions.
- `src/pages/[section]/[slug].astro` - Registry-backed semantic article shell and route-owned RTL reader CSS.
- `src/components/YouTubePlayer.astro` - Encoded permanent same-tab YouTube continuation boundary.
- `src/content/articles/contract-markdown.md` - Complete Arabic contract fixture and bidi proof content.

## Decisions Made

- Kept the direct link as the only media behavior in this slice because it fully guarantees the article-to-YouTube journey without JavaScript; the intent-gated iframe remains explicitly owned by later Phase 2 plans.
- Set `ASTRO_PREVIEW_BACKGROUND=0` in Playwright's server environment and used the real Markdown article as the readiness URL. Astro 7.2.7 otherwise auto-backgrounds under an agent and the deliberately absent homepage returns 404, preventing Playwright from owning a healthy server lifecycle.
- Applied entity guidance only through visible central author/section identity and self-contained Arabic prose. Schema, an author page, metadata, and canonical/entity-home work remain in their locked later phases.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Kept Astro preview in the Playwright process lifecycle**
- **Found during:** Task 1 RED verification
- **Issue:** Astro 7.2.7 detected the agent environment, launched preview in the background, and exited the configured Playwright web-server process before navigation.
- **Fix:** Set `ASTRO_PREVIEW_BACKGROUND=0` through `webServer.env`, preserving the planned `astro preview` command while forcing foreground ownership.
- **Files modified:** `playwright.config.ts`
- **Verification:** Chromium reached the existing route and failed on missing `القسم:` rather than server startup.
- **Committed in:** `2752570`

**2. [Rule 3 - Blocking] Probed an existing generated route for preview readiness**
- **Found during:** Task 1 RED verification
- **Issue:** The planned root readiness URL returned 404 because Phase 3 owns the homepage, so Playwright waited until timeout despite a healthy article server.
- **Fix:** Kept `baseURL` at `http://127.0.0.1:4321` and changed only `webServer.url` to the existing Markdown route.
- **Files modified:** `playwright.config.ts`
- **Verification:** The RED test navigated successfully; the final browser suite passed.
- **Committed in:** `2752570`

---

**Total deviations:** 2 auto-fixed (2 blocking issues).  
**Impact on plan:** Both changes are test-lifecycle fixes required for the exact Astro version and current route set; production behavior and scope are unchanged.

## Issues Encountered

- The first composite verification after Hercules QA found port 4321 still occupied by the evidence server. Stopping the recorded Astro preview process restored the required fresh Playwright lifecycle; the rerun passed.
- Chrome DevTools MCP could not attach because its shared profile was locked by an already-running browser. The available Hercules workflow therefore used the repository's exact pinned Playwright/Chromium fallback and recorded the backend honestly.
- Axe reported the pre-existing missing document title. The evidence ledger classifies it out of scope because Phase 4 explicitly owns page titles/metadata; there were zero serious/critical findings within the 02-01 reader surface.

## Visual QA

- Evidence root: `.artifacts/hercules-visual-qa/phase-02-plan-01/20260826-185556-test-and-fix-127.0.0.1-4321/`
- Inspected viewport and full-page screenshots at 320, 390, 768, 1024, and 1440 CSS pixels plus focus screenshots at 390 and 1440.
- Verified one-column reflow, readable Arabic hierarchy, intact diacritics/bidi samples, exact 18px body and 32/24/18/14px type roles, no overflow, a 240.7×50.2px CTA, visible 3px focus, zero initial YouTube requests, and zero console/page errors.
- Coverage ledger accounts for all discovered states; title metadata, MDX-wide verification, iframe enhancement states, and real 200% zoom are marked with their explicit later-plan ownership rather than claimed as tested here.

## TDD Gate Compliance

- **RED:** `2752570` committed the browser contract after proving a route-level failure on the missing `القسم:` reader fact.
- **GREEN:** `768cc3b` followed and made the unchanged reader assertions pass.
- **REFACTOR:** No separate refactor commit was needed; the minimum route/component implementation passed the full gate and visual review.

## Known Stubs

None. The component name anticipates the later player enhancement, but its permanent direct link is complete final functionality for this plan and is fully wired from the validated video ID.

## Threat Flags

None. The new outbound navigation is the planned T2-02/T2-04/T2-07 surface: it composes an encoded allowlisted video ID into a hardcoded HTTPS host, opens same-tab, and performs no request until navigation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Ready for `02-02-PLAN.md` to add structured provenance/references and exercise the same shell across Markdown and approved MDX.
- Phase 4 must add the document title together with its locked metadata/canonical work; this plan deliberately did not pull that scope forward.

## Self-Check: PASSED

- All seven key source/config/test files exist.
- Task commits `2752570` and `768cc3b` exist in repository history.
- Exact Node 24.19.0/npm 11.17.0 `npm run verify` passed after the final source commit.
- Production output contains exactly one h1, Arabic/RTL semantics, registry facts, labelled summary, introduction/body/conclusion, exact direct URL, no eager YouTube resource, and no draft route.
- Hercules evidence is present only under ignored `.artifacts/hercules-visual-qa/phase-02-plan-01/` with no unresolved in-scope visual or interaction defect.

---
*Phase: 02-complete-arabic-article-journey*
*Completed: 2026-08-26*
