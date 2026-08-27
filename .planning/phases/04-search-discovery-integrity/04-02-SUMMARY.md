---
phase: 04-search-discovery-integrity
plan: 02
subsystem: seo-ui-testing
tags: [astro, seo, canonical, open-graph, twitter, playwright, rtl, accessibility]

requires:
  - phase: 04-search-discovery-integrity/04-01
    provides: Validated Astro.site origin plus route-derived sitemap and robots output
provides:
  - Exact Arabic metadata identity for all eight public routes
  - True non-indexable Arabic 404 recovery through the shared shell
  - One inert local cream-and-green SVG favicon for every document
  - Fresh-build browser coverage for metadata, crawler agreement, recovery, reflow, accessibility, and SVG safety
affects: [04-03, phase-05-deployment, phase-06-production-verification]

tech-stack:
  added: []
  patterns:
    - Discriminated shared-layout props separate indexable and non-indexable head output
    - Canonicals derive only from Astro.site and the current pathname
    - Raw source, rendered HTML, XML, text, status, and SVG are checked independently

key-files:
  created:
    - src/pages/404.astro
    - public/favicon.svg
    - tests/search-discovery.spec.ts
  modified:
    - src/layouts/SiteLayout.astro
    - src/pages/index.astro
    - src/pages/[section]/index.astro
    - src/pages/[section]/[slug].astro
    - src/pages/عن-أحمد-المنجاوي.astro
    - playwright.config.ts

key-decisions:
  - "Keep SiteLayout.astro as the sole metadata renderer and expose no canonical or origin override surface."
  - "Reuse maintained Arabic body and registry copy for descriptions instead of creating a parallel SEO copy store."
  - "Keep the 404 and favicon strictly static, local, and free of client runtime or remote assets."

patterns-established:
  - "Search identity parity: title, description, canonical, Open Graph, and Twitter values originate from one typed layout input."
  - "Non-indexable recovery: the explicit indexable=false branch emits noindex,follow and omits canonical/social identity."
  - "Browser artifact isolation: all screenshots, traces, and videos remain under ignored .artifacts/."

requirements-completed: [SITE-06, SEO-02, SEO-03, SEO-05]

duration: 12min
completed: 2026-08-27
---

# Phase 04 Plan 02: Search Identity and Recovery Summary

**Eight Arabic public routes now publish exact self-canonical text metadata, while true missing routes recover through a noindex Arabic shell and every document uses one inert local SVG favicon.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-27T22:54:18Z
- **Completed:** 2026-08-27T23:05:54Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- Centralized unique Arabic title, maintained description, canonical, Open Graph, and Twitter output in the shared layout for the complete eight-route public graph.
- Added an exact Arabic/RTL 404 with true HTTP 404 behavior, `noindex,follow`, no canonical/social identity, native no-JavaScript recovery, and no sitemap membership.
- Added a 327-byte local open-page SVG favicon constrained to two approved colors and parsed for inert, allowlisted geometry at 16 px and 32 px.
- Added a dedicated production-preview contract that independently parses raw frontmatter, rendered HTML, both sitemap XML layers, robots text, HTTP status, and SVG source.

## Task Commits

Each task was committed atomically:

1. **Task 1: Lock the complete browser identity and recovery contract in RED** - `57693b8` (test)
2. **Task 2: Render one exact metadata identity for every public route** - `f7edbce` (feat)
3. **Task 3: Deliver exact Arabic 404 recovery and inert favicon with parsed proof** - `e7b10df` (feat)

## Files Created/Modified

- `tests/search-discovery.spec.ts` - Exact metadata, crawler, 404, favicon, no-JavaScript, focus, reflow, axe, and network contract.
- `playwright.config.ts` - Includes the dedicated suite in the existing production discovery preview lifecycle.
- `src/layouts/SiteLayout.astro` - Sole typed metadata, canonical, social, robots, and favicon rendering boundary.
- `src/pages/index.astro` - Homepage Arabic identity wired from its maintained introduction.
- `src/pages/[section]/index.astro` - Registry-backed section identity.
- `src/pages/[section]/[slug].astro` - Frontmatter-backed article identity with `og:type=article`.
- `src/pages/عن-أحمد-المنجاوي.astro` - Author identity wired from its maintained explanatory copy.
- `src/pages/404.astro` - Static Arabic shared-shell recovery document.
- `public/favicon.svg` - Inert local cream-and-green open-page favicon.

## Decisions Made

- Used a discriminated layout prop union so indexable routes require complete identity while the 404 explicitly suppresses canonical and social output.
- Derived canonical URLs with `new URL(Astro.url.pathname, Astro.site).href`; route data cannot select an origin or canonical.
- Kept social metadata text-only and omitted images, handles, timestamps, keywords, JSON-LD, analytics, and inferred claims because the phase explicitly excludes them.
- Used simple native HTML and logical CSS for the 404 so keyboard, RTL, no-JavaScript, and reflow behavior require no client runtime.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test Bug] Used Playwright's document-title assertion for head titles**
- **Found during:** Task 2 (Render one exact metadata identity for every public route)
- **Issue:** `locator("head > title").toHaveText()` resolved the correct title element but reported empty head text in Playwright.
- **Fix:** Retained the exact count assertion and switched value comparison to `page.toHaveTitle()` for both public and 404 documents.
- **Files modified:** `tests/search-discovery.spec.ts`
- **Verification:** The metadata slice passed 2/2 and the complete discovery suite passed 8/8.
- **Committed in:** `f7edbce`, `e7b10df`

**2. [Rule 1 - Test Bug] Allowed only the mandatory SVG namespace URL**
- **Found during:** Task 3 (Deliver exact Arabic 404 recovery and inert favicon with parsed proof)
- **Issue:** The remote-reference denylist incorrectly treated the required `http://www.w3.org/2000/svg` namespace as a remote asset.
- **Fix:** Asserted exactly one mandatory namespace, removed only that literal for the denylist scan, and retained rejection of every other HTTP/data/active reference.
- **Files modified:** `tests/search-discovery.spec.ts`
- **Verification:** Favicon parsing and the full eight-test discovery suite passed without weakening active-content controls.
- **Committed in:** `e7b10df`

---

**Total deviations:** 2 auto-fixed (2 Rule 1 test bugs)
**Impact on plan:** Both corrections made the browser oracle accurately measure the locked contract; production scope and security assertions were unchanged.

## Issues Encountered

- Direct `npx prettier` could not infer an Astro parser because this repository does not install Prettier or `prettier-plugin-astro`. Astro diagnostics, build, browser verification, and `git diff --check` remained green, so no dependency was added outside the researched plan.

## Verification Evidence

- Initial RED: crawler/status infrastructure passed 2 tests; 6 tests failed only for the deliberately absent metadata, custom 404, and favicon output.
- Focused final suite: 8/8 passed after a fresh static build.
- Full final gate: 128/128 native tests and 46/46 browser tests passed; Astro reported 0 errors, 0 warnings, and 0 hints.
- Static output: 9 generated pages, official sitemap index/URL XML, exact robots text, and no draft/proof/404 sitemap leakage.
- Hercules fallback visual QA: Playwright evidence reviewed at 320, 390, 768, 1024, and 1440 px plus focused keyboard state and 16/32 px favicon rendering. Copy, hierarchy, focus, reflow, clipping, and visual consistency passed.
- Browser network and accessibility: zero unexpected remote requests and zero serious/critical axe violations in scope.

## TDD Gate Compliance

- RED gate: `57693b8` added the failing production browser contract before implementation.
- GREEN gates: `f7edbce` completed the metadata slice and `e7b10df` completed recovery/favicon behavior.

## Known Stubs

None - scans found no placeholder, empty-data, TODO, or unwired UI state in the created or modified plan files.

## User Setup Required

None - no external service configuration is required for this plan.

## Next Phase Readiness

- Plan 04-03 can independently compare the approved source corpus, generated routes, internal links, canonical URLs, and sitemap membership, then run launch-origin proof.
- Phase 5 still owns the real production hostname, hosting, deployment, DNS/TLS, Search Console, and analytics decisions.
- No blockers or unplanned threat surfaces remain.

## Self-Check: PASSED

All nine implementation/test files, the summary, and task commits `57693b8`, `f7edbce`, and `e7b10df` were verified on disk and in Git history.

---
*Phase: 04-search-discovery-integrity*
*Completed: 2026-08-27*
