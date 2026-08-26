---
phase: 01-content-and-url-contract
plan: 01
subsystem: content
tags: [astro, markdown, mdx, arabic, rtl, unicode, static-generation]

# Dependency graph
requires: []
provides:
  - Exact Node 24.19.0 and npm 11.17.0 build contract
  - Registry-backed Arabic article metadata and URL validation
  - Draft-safe Markdown/MDX queries and final static article route family
affects: [02-complete-arabic-article-journey, content-authoring, routing, seo]

# Tech tracking
tech-stack:
  added: [Astro 7.2.7, MDX 7.0.8, Astro Check 0.9.10, TypeScript 6.0.3]
  patterns: [single validated content collection, explicit Arabic slugs, build-time draft exclusion]

key-files:
  created:
    - src/config/registries.ts
    - src/lib/content-contract.ts
    - src/content.config.ts
    - src/lib/articles.ts
    - src/pages/[section]/[slug].astro
  modified:
    - package.json
    - package-lock.json
    - tsconfig.json

key-decisions:
  - "Keep article identity explicit and title-independent through validated Arabic section and article slugs."
  - "Use the identical final route family for development draft preview while excluding drafts from every production query."
  - "Declare UTF-8 directly in the proof route so Arabic renders correctly before the shared metadata system arrives in Phase 4."

patterns-established:
  - "Content boundary: one mixed Markdown/MDX collection delegates semantic policy to pure production validators."
  - "Route identity: derive section and article params only from registered canonical slugs, never titles or filenames."
  - "Visibility boundary: validate all path collisions before filtering, then expose separate public and development-preview queries."

requirements-completed: [SEO-01, PUB-01, PUB-02, PUB-03, PUB-04, PUB-06]

# Metrics
duration: 14min
completed: 2026-08-26
---

# Phase 1 Plan 1: Content and URL Contract Summary

**Validated Arabic Markdown/MDX publishing with stable Unicode routes, registry-backed metadata, draft-safe static generation, and an end-to-end proof article.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-08-26T11:30:24Z
- **Completed:** 2026-08-26T11:43:40Z
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments

- Locked the supported runtime and dependency graph to Node 24.19.0, npm 11.17.0, and the approved Astro/TypeScript baseline.
- Established one typed registry and pure validation contract for Arabic slugs, metadata, dates, YouTube IDs, unique paths, and draft visibility.
- Rendered public Markdown through the final Arabic static route while keeping the valid draft available only on that same route in development.
- Verified the generated public HTML contains correct Arabic content and no production scripts, while the draft route is absent from `dist`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Gate the exact toolchain and leave the Markdown journey RED** - `453b07c` (test)
2. **Task 2: Make the validated article identity and registry contract GREEN** - `765a1f4` (feat)
3. **Task 3: Render the public and draft Markdown records through the final route family** - `96abb96` (feat)

## Files Created/Modified

- `.gitignore` - Keeps generated Astro, dependency, distribution, and browser-test artifacts out of version control.
- `.nvmrc` - Records the exact Node 24.19.0 runtime.
- `package.json` and `package-lock.json` - Enforce the exact runtime and approved dependency baseline with locked verification scripts.
- `tsconfig.json` - Uses Astro's strict TypeScript configuration.
- `tests/content-contract.test.ts` - Exercises title-independent paths and public/draft separation with Node's native runner.
- `src/config/registries.ts` - Defines the three Arabic sections and truthful Ahmed El-Mangawy author identity.
- `src/lib/content-contract.ts` - Owns Unicode, registry, metadata, route, collision, and visibility policy.
- `src/content.config.ts` - Loads and validates one flat mixed Markdown/MDX article collection.
- `src/content/articles/contract-draft.md` - Supplies a valid explicit draft proof record.
- `src/content/articles/contract-markdown.md` - Supplies a valid public Arabic Markdown proof record.
- `src/lib/articles.ts` - Exposes collision-checked public and development-preview article queries.
- `astro.config.mjs` - Configures static output, trailing slashes, and the official MDX integration.
- `src/pages/[section]/[slug].astro` - Generates the final Arabic route family and semantic proof article markup.

## Decisions Made

- Stable public paths use explicit registered section and article slugs; titles and filenames never determine identity.
- Registry and article errors fail the build with source, field/path, and failed-rule context instead of being normalized silently.
- Draft preview reuses the final route schema only in development; production callers receive a separate public-only interface.
- The proof route remains intentionally unstyled and free of client JavaScript until the reader-experience phase.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Declared UTF-8 for Arabic route rendering**

- **Found during:** Task 3 (browser verification of the final route)
- **Issue:** Without an explicit character encoding declaration, the browser decoded Arabic source as mojibake.
- **Fix:** Added `<meta charset="utf-8" />` to the final article proof route without introducing the deferred metadata system.
- **Files modified:** `src/pages/[section]/[slug].astro`
- **Verification:** Browser checks reported `document.characterSet === "UTF-8"` and intact Arabic text at desktop, tablet, and mobile test sizes; the production HTML assertion also passed.
- **Committed in:** `96abb96` (part of Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical functionality)
**Impact on plan:** The fix is required for correct Arabic rendering and does not expand the intended reader UI or SEO scope.

## Issues Encountered

- Browser verification initially exposed mojibake, resolved by the UTF-8 declaration above.
- The development server requests `/favicon.ico` and receives 404; favicon work is outside this content-contract plan and does not affect production route correctness.

## Known Stubs

None. The proof records are intentionally labelled contract fixtures, and all values used by the route are connected to the validated content collection.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plans 01-02 and 01-03 can extend the same contract with MDX policy enforcement and broader validation coverage.
- The shared reader layout, responsive styling, accessibility treatment, YouTube experience, and complete metadata remain intentionally deferred to their planned phases.
- Final canonical domain selection remains a later discovery/deployment blocker and was not needed for this plan.

## Self-Check: PASSED

- All 14 plan files and this summary exist on disk.
- Task commits `453b07c`, `765a1f4`, and `96abb96` resolve as commits.

---
*Phase: 01-content-and-url-contract*
*Completed: 2026-08-26*
