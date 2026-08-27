---
phase: 04-search-discovery-integrity
plan: 01
subsystem: seo
tags: [astro, sitemap, robots, canonical-origin, tdd, supply-chain]

requires:
  - phase: 01-content-and-url-contract
    provides: Validated Arabic content identity and stable public route family
  - phase: 03-real-content-and-section-discovery
    provides: Registry-derived public routes and the approved launch corpus
provides:
  - One fail-closed HTTPS launch-origin validator with deterministic local builds
  - Exact official Astro sitemap generation derived from the static route graph
  - Minimal same-origin robots policy pointing to the generated sitemap index
  - Native, build, output, browser, accessibility, and visual regression evidence
affects: [04-search-discovery-integrity, 05-deployment-and-measurement, 06-production-launch-verification]

tech-stack:
  added: ["@astrojs/sitemap@3.7.3"]
  patterns:
    - Ordinary builds use one fixed local origin while launch builds require explicit validated HTTPS input
    - Crawler discovery is generated from Astro routes without a parallel URL list, filter, or serializer

key-files:
  created:
    - src/lib/site-origin.ts
    - tests/site-origin.test.ts
    - scripts/launch-ready.mjs
    - src/pages/robots.txt.ts
  modified:
    - astro.config.mjs
    - package.json
    - package-lock.json
    - tests/content-contract.test.ts

key-decisions:
  - "Keep ordinary builds deterministic at http://127.0.0.1:4322 and accept production identity only through the explicit launch wrapper."
  - "Use plain official sitemap() output and derive robots from Astro.site so no second crawler route or origin policy can drift."

patterns-established:
  - "Origin boundary: validate explicit launch identity once, before invoking Astro build, and never infer it from requests or environment files."
  - "Crawler boundary: generated public routes are the sole sitemap source and robots publishes only the matching sitemap-index URL."

requirements-completed: [SEO-03, SEO-05]

duration: "8m"
completed: 2026-08-27
---

# Phase 4 Plan 1: Crawler Origin and Discovery Summary

**Fail-closed launch-origin validation now drives the exact official Astro sitemap and a matching minimal robots policy without duplicating the public route graph.**

## Performance

- **Duration:** 8m
- **Started:** 2026-08-27T22:37:00Z
- **Completed:** 2026-08-27T22:44:58Z
- **Tasks:** 2
- **Tracked files modified:** 8

## Accomplishments

- Added a pure production-origin validator covering normalization and rejection of unsafe schemes, credentials, URL state, non-root paths, local/IP/reserved hosts, malformed values, and ambiguous raw delimiters.
- Kept ordinary builds fixed at `http://127.0.0.1:4322` while making `npm run launch:ready` require an explicit safe HTTPS `SITE_ORIGIN` without reading environment files.
- Audited and pinned official `@astrojs/sitemap@3.7.3`, then used plain `sitemap()` so Astro's generated route graph remains the only crawler URL source.
- Added an exact static robots policy derived from the same configured site origin and proved local and controlled-launch host agreement before restoring local output.

## Task Commits

Each task was committed atomically, with the TDD task split into its required red and green commits:

1. **Task 1 RED: Add the failing origin validation matrix** - `b7ae0f5` (test)
2. **Task 1 GREEN: Establish the safe origin and launch-build boundary** - `02918d4` (feat)
3. **Task 2: Publish the official route-derived sitemap and matching robots policy** - `58c86e6` (feat)

**Plan metadata:** recorded by the summary commit that contains this file.

## Files Created/Modified

- `src/lib/site-origin.ts` - Fixed local origin plus normalized, fail-closed production HTTPS origin validator.
- `tests/site-origin.test.ts` - Native valid/invalid origin matrix and deterministic ordinary-build assertions.
- `scripts/launch-ready.mjs` - Explicit process-input validation followed by Astro's programmatic launch build.
- `astro.config.mjs` - Fixed ordinary-build origin and plain official sitemap integration.
- `src/pages/robots.txt.ts` - Static UTF-8 allow policy with one same-origin sitemap-index URL.
- `package.json` - Pinned sitemap dependency, native origin tests, and explicit launch-ready command.
- `package-lock.json` - Exact official sitemap package and integrity record.
- `tests/content-contract.test.ts` - Controlled launch regression now supplies an explicit safe origin.

## Decisions Made

- Local verification output always uses the fixed preview origin, even if an ambient `SITE_ORIGIN` exists.
- Launch identity is accepted only from explicit process input after strict root-HTTPS validation; request hosts and environment files are not identity sources.
- The sitemap uses the official integration with no custom pages, filter, serializer, or second route registry.
- Robots derives its sole absolute URL from `Astro.site` and contains no draft hiding rule or hard-coded production host.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Regression] Supplied the newly required explicit launch origin in the existing launch contract test**

- **Found during:** Task 1 (safe origin and launch-build boundary)
- **Issue:** The pre-existing launch regression invoked `launch:ready` without input, which correctly became invalid after the planned fail-closed boundary was implemented.
- **Fix:** Provided a controlled safe HTTPS `SITE_ORIGIN` only for that test process.
- **Files modified:** `tests/content-contract.test.ts`
- **Verification:** The launch regression, 128-test native suite, controlled launch build, and complete `npm run verify` gate passed.
- **Committed in:** `02918d4`

---

**Total deviations:** 1 auto-fixed regression.
**Impact on plan:** The adjustment was required to test the intended explicit-input contract and introduced no new product scope.

## Issues Encountered

- None. The exact package identity, repository, integrity, lockfile, installed metadata, and absence of lifecycle install scripts all passed before integration.

## Verification Evidence

- TDD RED failed because `src/lib/site-origin.ts` did not yet exist; the later GREEN commit made the complete matrix pass.
- `npm run verify` passed under Node `v24.19.0` and npm `11.17.0`: 128/128 native tests, zero Astro diagnostics, static build, and 38/38 Playwright browser/visual/accessibility tests.
- Missing and unsafe launch origins exited nonzero; controlled safe HTTPS launch output used `https://blog.ahmed-mangawy.org` exclusively.
- The final ordinary build restored `http://127.0.0.1:4322` in `sitemap-index.xml`, `sitemap-0.xml`, and `robots.txt`.
- Final robots output contains exactly `User-agent: *`, `Allow: /`, one blank line, and one absolute `Sitemap:` entry.
- Source scans found no environment-file loader, dotenv use, request-derived identity, custom sitemap page/filter/serializer, placeholder, TODO, or FIXME in modified implementation files.
- `git diff --check` passed and browser artifacts remained inside the ignored `.artifacts/` directory.

## Known Stubs

None. All created and modified runtime paths are fully wired to build input or Astro's generated output.

## User Setup Required

No local setup is required. A final safe HTTPS production hostname must be supplied explicitly as `SITE_ORIGIN` when running the launch-readiness build; no secret or environment file is used.

## Next Phase Readiness

- Plan 04-02 can consume the validated configured origin for canonical, Open Graph, and page-identity metadata.
- Plan 04-03 can independently compare public route identity, sitemap membership, robots policy, and browser-rendered metadata.
- The final canonical hostname remains an operational launch decision, but it no longer blocks local implementation or verification.

## Self-Check: PASSED

- Commits `b7ae0f5`, `02918d4`, and `58c86e6` exist.
- All eight implementation files named by this summary exist at their expected paths.
- Both requirement IDs from Plan 04-01 are present in summary frontmatter.
- The full verification gate and final local crawler-output checks passed.
- No untracked browser artifact, environment file, or unexpected tracked deletion was introduced.

---
*Phase: 04-search-discovery-integrity*
*Completed: 2026-08-27*
