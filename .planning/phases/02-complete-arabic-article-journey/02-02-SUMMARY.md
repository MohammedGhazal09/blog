---
phase: 02-complete-arabic-article-journey
plan: 02
subsystem: content-ui-testing
tags: [astro, mdx, rtl, arabic, references, playwright, accessibility]

requires:
  - phase: 02-complete-arabic-article-journey
    plan: 01
    provides: static Arabic reader shell, registry-backed facts, permanent YouTube continuation, and exact Playwright/axe harness
  - phase: 01-content-and-url-contract
    provides: validated article model, strict Astro schema, public/draft query split, stable Arabic routes, and restricted MDX map
provides:
  - Fail-closed structured Arabic references with native absolute HTTPS and credential validation
  - Conditional update/reference provenance with a deliberate Markdown-present and MDX-absent proof matrix
  - Equivalent complete Markdown and approved-MDX Arabic journeys across bidi, reflow, focus, and accessibility checks
affects: [02-03-intent-gated-player, 02-04-reader-verification, 03-launch-content, 04-search-discovery]

tech-stack:
  added: []
  patterns: [shared semantic reference validation, whole-unit optional rendering, two-format browser contract, artifact-isolated visual QA]

key-files:
  created: []
  modified: [src/lib/content-contract.ts, src/content.config.ts, tests/content-contract.test.ts, src/content/articles/contract-markdown.md, src/pages/[section]/[slug].astro, src/content/articles/contract-mdx.mdx, tests/article-journey.spec.ts, README.md]

key-decisions:
  - "Validate reference shape and semantics once at the shared content boundary, then render only already-validated descriptive same-tab HTTPS links."
  - "Use Markdown as the present optional-provenance fixture and approved MDX as the absent fixture so one browser matrix proves both formats and clean omission."
  - "Keep real 200% browser zoom manual-only when automation cannot prove a changed zoom state; never treat unchanged DPR/viewport screenshots as passing evidence."

patterns-established:
  - "Reference trust boundary: strict Astro entry shape followed by source/index/field-aware native URL and Arabic-label semantic validation."
  - "Optional reader units: guard the complete semantic section or definition row so absence emits no label, wrapper, separator, or reserved gap."
  - "Parity evidence: drive Markdown and MDX through one named route matrix for exact copy, document order, bidi, reflow, axe, and computed visual rules."

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
  - QUAL-03
  - QUAL-04

duration: 26min
completed: 2026-08-26
---

# Phase 2 Plan 2: Provenance and Markdown/MDX Parity Summary

**Fail-closed Arabic reference provenance and one exact browser contract now deliver the same complete RTL reader journey from Markdown and restricted MDX while proving clean optional absence.**

## Performance

- **Duration:** 26 min
- **Started:** 2026-08-26T16:14:01Z
- **Completed:** 2026-08-26T16:40:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Extended the single article contract with readonly structured references that reject malformed shapes, blank or non-Arabic-facing labels, relative/non-HTTPS/credential-bearing URLs, and report the exact source/index/field rule.
- Rendered truthful registry-backed publication/update facts and descriptive semantic references only when complete values exist; MDX proves that missing optionals leave no empty reader UI.
- Expanded approved MDX into a complete Arabic introduction/body/conclusion journey with headings, lists, quotation, link, diacritics, punctuation, Arabic/ASCII digits, and isolated URL/video-ID cases without widening the component allowlist.
- Added one two-route Chromium matrix covering Arabic surface, document semantics, JavaScript-disabled text, provenance, summary, bidi, five-width reflow, accessibility, and locked visual quality.
- Updated the Arabic owner workflow with the exact reference policy, complete authoring order, omission behavior, browser commands, and `.artifacts`-only evidence rule.

## Task Commits

Each TDD task was committed atomically through RED and GREEN:

1. **Task 1 RED: Add failing reference validation cases** - `af80b80` (test)
2. **Task 1 GREEN: Render validated article references** - `1e9a853` (feat)
3. **Task 2 RED: Add failing Markdown and MDX parity matrix** - `5795acd` (test)
4. **Task 2 GREEN: Complete Markdown and MDX reader parity** - `d8e2472` (feat)

## Files Created/Modified

- `src/lib/content-contract.ts` - `ArticleReference`, optional readonly references, and fail-closed source/index/field semantic checks.
- `src/content.config.ts` - Strict optional reference-entry shape at the Astro collection boundary.
- `tests/content-contract.test.ts` - Absent/empty/valid and malformed label/URL/reference diagnostics.
- `src/content/articles/contract-markdown.md` - Truthful update/reference present-state fixture.
- `src/pages/[section]/[slug].astro` - Conditional semantic references after authored content and before media.
- `src/content/articles/contract-mdx.mdx` - Complete approved-MDX journey with deliberately absent update/references.
- `tests/article-journey.spec.ts` - Shared 18-case Markdown/MDX semantic, bidi, responsive, accessibility, and visual contract.
- `README.md` - Arabic reference and complete-article authoring/verification instructions.

## Decisions Made

- Kept semantic URL and Arabic-label policy in `validateArticleData` rather than duplicating it in the route or relying on schema shape alone. The route therefore consumes trusted content and performs no repair or fallback parsing.
- Used the Markdown fixture for positive optional provenance and the MDX fixture for negative optional provenance. This makes omission behavior executable without creating another route, content model, or component.
- Preserved the exact `ContractNote` MDX allowlist and kept references/media in the trusted route layer; authored MDX gained only ordinary Markdown structure and the already-approved component.
- Classified real 200% browser zoom as manual-only when automated hotkeys left DPR and inner width unchanged. The unchanged screenshots are retained as evidence of the blocker, not reported as a pass.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Chrome DevTools MCP was unavailable, so the Hercules workflow used the repository's real visible Playwright Chromium fallback and identified the backend honestly.
- Automated zoom hotkeys did not change browser DPR or inner width. The visual ledger marks 200% zoom blocked/manual-only in accordance with `02-VALIDATION.md`.
- The first Markdown 320px evidence load logged one anonymous cached 404 without a captured failing URL, failed request, or HTTP error. It did not recur on any later route/width load and remains a Phase 4 recheck recommendation rather than a reader defect.
- Axe's `document-title` rule remains excluded because page titles/metadata are explicitly owned by Phase 4; the plan's in-scope serious/critical rules and explicit semantic assertions pass.

## Visual QA

- Provenance evidence: `.artifacts/hercules-visual-qa/phase-02-plan-02-provenance/20260826-191601-test-and-fix-127.0.0.1-4321/`.
- Parity evidence: `.artifacts/hercules-visual-qa/phase-02-plan-02-parity/20260826-192833-test-and-fix-127.0.0.1-4321-article-parity/`.
- Both routes were captured at 320, 390, 768, 1024, and 1440 CSS pixels with viewport/full-page evidence, ARIA snapshots, console/network records, and focused CTA screenshots at 390 and 1440.
- Visual inspection confirmed shared hierarchy/measure/spacing, readable Arabic joining and diacritics, isolated mixed-direction fragments, no clipping/overflow, no MDX optional gap, 240.7×50.2px direct-video actions, and visible 3px focus outlines.
- Initial page loads made zero YouTube-family requests, captured zero failed requests and zero HTTP errors.

## TDD Gate Compliance

- **Task 1 RED:** `af80b80` proved valid/invalid reference cases failed before implementation.
- **Task 1 GREEN:** `1e9a853` followed and passed the complete reference/provenance contract.
- **Task 2 RED:** `5795acd` committed the Markdown/MDX browser parity matrix before the MDX fixture and documentation were completed.
- **Task 2 GREEN:** `d8e2472` followed and made the unchanged parity matrix pass.
- **REFACTOR:** No separate refactor commit was needed; both minimal GREEN implementations passed formatting, source-policy, full runtime, and visual review gates.

## Known Stubs

None. Empty values found by the stub scan are deliberate validator defaults, credential comparisons, or malicious MDX test fixtures; none flow to reader rendering or represent unfinished behavior.

## Threat Flags

None. The reference destination and MDX surfaces are already covered by T2-01, T2-04, T2-05, T2-06, and T2-09; no new endpoint, auth path, file-access boundary, schema trust boundary, or eager network behavior was introduced beyond the plan's threat register.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Ready for `02-03-PLAN.md` to add the intent-gated privacy-enhanced YouTube player without changing the validated article text/provenance boundary.
- The final Phase 2 verification should perform the manual 200% zoom check that browser automation could not prove.
- Phase 4 still owns Arabic document titles, metadata, favicon/discovery files, and the site 404 surface.

## Self-Check: PASSED

- All eight planned source/config/test/documentation files and this summary exist.
- Task commits `af80b80`, `1e9a853`, `5795acd`, and `d8e2472` exist in repository history in RED/GREEN order.
- Exact Node 24.19.0/npm 11.17.0 `npm run verify` passed after the final source commit: 68/68 Node tests, zero Astro diagnostics, two static routes, and 18/18 browser cases.
- Built output contains one Markdown update/reference unit, zero MDX optional units, no draft marker, no iframe, and no `youtube-nocookie` resource.
- Both Hercules evidence roots exist beneath ignored `.artifacts/`; the parity ledger/report record the blocked real-zoom check and non-repeating anonymous 404 without overstating coverage.

---
*Phase: 02-complete-arabic-article-journey*
*Completed: 2026-08-26*
