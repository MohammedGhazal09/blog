---
phase: 01-content-and-url-contract
plan: 02
subsystem: content
tags: [astro, mdx, security, node-test, static-generation, arabic]

# Dependency graph
requires:
  - phase: 01-content-and-url-contract plan 01
    provides: Validated mixed article collection, Arabic route identity, draft-safe queries, and final route family
provides:
  - Pre-compilation restricted-MDX source policy for Markdown and MDX article files
  - One typed ContractNote allowlist and render component map
  - Approved Arabic MDX proof article rendered through the shared production route
affects: [01-03-validation-coverage, 02-complete-arabic-article-journey, content-authoring]

# Tech tracking
tech-stack:
  added: []
  patterns: [config-load source preflight, typed central MDX component map, in-memory policy regression cases]

key-files:
  created:
    - src/lib/mdx-policy.ts
    - src/components/ContractNote.astro
    - src/components/mdx-components.ts
    - src/content/articles/contract-mdx.mdx
  modified:
    - tests/content-contract.test.ts
    - astro.config.mjs
    - src/pages/[section]/[slug].astro

key-decisions:
  - "Treat the MDX scanner as a narrow policy guard for Git-reviewed content, never as sanitization or hostile-input isolation."
  - "Derive the render-map key contract from the single readonly approved-component allowlist."

patterns-established:
  - "MDX policy: remove frontmatter, fenced code, and inline code examples before rejecting ESM, script, iframe, and unknown uppercase JSX names."
  - "MDX rendering: articles contain no imports; the shared route supplies one central component map to Astro render output."

requirements-completed: [PUB-01, PUB-05]

# Metrics
duration: 17min
completed: 2026-08-26
---

# Phase 1 Plan 2: Restricted MDX Policy Summary

**Pre-compilation MDX policy with one typed semantic component allowlist and a statically rendered Arabic proof article on the shared route family.**

## Performance

- **Duration:** 17 min
- **Started:** 2026-08-26T12:09:53Z
- **Completed:** 2026-08-26T12:26:44Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Defined native policy cases for approved `ContractNote` use and actionable rejection of ESM, scripts, iframes, and unknown components while excluding code examples.
- Added a Node-standard-library article preflight that runs as Astro configuration loads for dev, check, and build.
- Rendered a valid public MDX record through the same collection, public query, Arabic route, and semantic shell as Markdown without article imports or production client scripts.
- Preserved the UTF-8 and responsive viewport declarations introduced in Plan 01.

## Task Commits

Each task was committed atomically:

1. **Task 1: Specify approved and forbidden MDX behavior in RED** - `45d3e51` (test)
2. **Task 2: Enforce the central allowlist before Astro compilation** - `33cfd8a` (feat)
3. **Task 3: Render approved MDX through the existing article route** - `04a3d14` (feat)

## TDD Gate Compliance

- **RED:** The exact diagnostic gate passed with one `ERR_MODULE_NOT_FOUND` for `src/lib/mdx-policy.ts` and one native failing test entry before implementation (`45d3e51`).
- **GREEN:** The production policy made all 11 native tests and Astro diagnostics pass (`33cfd8a`).
- **Integration:** The final shared-route MDX build passed in `04a3d14`; no separate refactor commit was needed.

## Files Created/Modified

- `tests/content-contract.test.ts` - Adds table-driven approved, forbidden, case/spacing, and code-example policy cases.
- `src/lib/mdx-policy.ts` - Owns the single allowlist, pure source assertion, and recursive Markdown/MDX preflight.
- `src/components/ContractNote.astro` - Supplies semantic Arabic proof markup without styles or runtime behavior.
- `src/components/mdx-components.ts` - Maps exactly the approved component-name type to Astro render components.
- `astro.config.mjs` - Runs article source preflight before exporting Astro configuration.
- `src/content/articles/contract-mdx.mdx` - Provides a valid Arabic public MDX proof record without imports.
- `src/pages/[section]/[slug].astro` - Supplies the central component map while preserving the existing semantic route shell and viewport metadata.

## Decisions Made

- Keep the preflight deliberately narrow to the locked trusted-Git authoring model; a future untrusted content source requires a new trust-boundary decision.
- Keep the approved name list as the type source of truth so a missing or extra render-map key fails static checking.
- Keep the proof component and route visually unstyled because Phase 2 owns the complete reader experience.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Kept Node built-in imports checkable without adding a dependency**

- **Found during:** Task 2 (Astro diagnostics)
- **Issue:** `astro check` could not resolve Node built-in type declarations because the locked project intentionally has no `@types/node` dependency.
- **Fix:** Added narrow `@ts-expect-error` annotations only to the three Node built-in imports and removed the typed `process` reference, preserving the approved dependency graph.
- **Files modified:** `src/lib/mdx-policy.ts`
- **Verification:** Exact-runtime `npm test` passed 11/11 and `npm run check` reported zero errors, warnings, or hints.
- **Committed in:** `33cfd8a`

**2. [Rule 1 - Bug] Removed English reader-facing wording from the MDX fixture**

- **Found during:** Task 3 Hercules visual QA
- **Issue:** The new Arabic proof article rendered the English word “Markdown”.
- **Fix:** Replaced it with the Arabic transliteration `ماركداون`.
- **Files modified:** `src/content/articles/contract-mdx.mdx`
- **Verification:** Repeated browser checks at 390x844, 768x1024, 1366x768, and 1920x1080 with RTL, matching viewport/scroll widths, approved proof text, and no console exceptions or document failures.
- **Committed in:** `04a3d14`
- **Evidence:** Ignored report at `.artifacts/hercules-visual-qa/20260826-151651-plan-01-02-127.0.0.1-4321/qa-report.md`

---

**Total deviations:** 2 auto-fixed (1 blocking integration issue, 1 reader-facing language bug)
**Impact on plan:** Both fixes preserved the locked dependency and Phase 1 UI boundaries; no scope or runtime surface was added.

## Issues Encountered

- Browser QA initially reached a stale Astro process and returned a 404. The stale process was stopped and the current checkout was served before evidence was accepted.
- A Chrome profile created inside ignored `.artifacts` caused Vite file watching to hit a locked cookie file. Evidence remained in `.artifacts`, while the disposable browser profile was moved outside the watched repository for the final run.
- The browser requested `/favicon.ico` and received 404; favicon work remains outside this content-contract plan.
- `roadmap.update-plan-progress` reported `2/3` and `In Progress` but left the file at `1/3`; the two Phase 1 counters were updated directly without marking the phase complete.

## Known Stubs

None. The `metadata = {}` source found by the stub scan is an intentional in-memory rejected ESM test case and never flows to rendering. Both proof articles are explicitly labelled contract fixtures and are fully wired through the content collection.

## User Setup Required

None - no external service configuration required.

## Verification

- Exact runtime: Node `v24.19.0`, npm `11.17.0`.
- `npm run verify`: 11/11 native tests, zero Astro diagnostics, two static public routes.
- Generated MDX route contains `ملاحظة اختبار عقد المحتوى` and zero production `<script>` tags.
- Existing Markdown output remains present, the draft output remains absent, and the responsive viewport declaration is preserved.
- Browser QA passed the required MDX route at four responsive widths with correct Arabic RTL semantics and no horizontal overflow.

## Next Phase Readiness

- Plan 01-03 can expand the native validation matrix and authoring verification against this pre-compilation policy.
- Phase 1 remains in progress at 2/3 plans; this summary does not mark the phase complete.
- Final typography, layout, accessibility treatment, YouTube experience, metadata, and favicon remain assigned to later phases.

## Self-Check: PASSED

- All seven created/modified plan files exist on disk.
- Task commits `45d3e51`, `33cfd8a`, and `04a3d14` resolve as commits.
- The exact-runtime full verification gate passed after the final task commit.
- No untracked source or planning artifacts remain; browser evidence is contained in ignored `.artifacts`.

---
*Phase: 01-content-and-url-contract*
*Completed: 2026-08-26*
