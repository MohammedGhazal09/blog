---
phase: 04-search-discovery-integrity
plan: 03
subsystem: seo-testing
tags: [astro, seo, sitemap, canonical, playwright, accessibility, visual-regression]

requires:
  - phase: 04-search-discovery-integrity/04-01
    provides: Validated local and controlled HTTPS site-origin policy with route-derived sitemap and robots output
  - phase: 04-search-discovery-integrity/04-02
    provides: Exact metadata identity, true Arabic 404 recovery, and inert local favicon across the public route graph
provides:
  - Independent source-to-output proof for every published route and every draft exclusion
  - Exact agreement across generated pages, ordinary internal links, canonical and Open Graph URLs, and both sitemap layers
  - Zero-visible-regression body contract for all eight public routes across responsive, focus, and no-JavaScript states
  - Controlled launch-origin proof plus complete ignored visual, network, console, and accessibility evidence
affects: [05-deployment-and-measurement, 06-production-launch-verification]

tech-stack:
  added: []
  patterns:
    - Browser transport stays local while declared absolute site identity is parameterized independently
    - Approved public membership is derived from raw frontmatter rather than production selectors or generated output
    - Existing page bodies are locked through deterministic text, DOM-order, computed-style, focus, and containment assertions

key-files:
  created: []
  modified:
    - tests/discovery.spec.ts
    - tests/search-discovery.spec.ts

key-decisions:
  - "Separate declared absolute site identity from localhost browser transport so controlled launch output can be tested without remote navigation."
  - "Lock Phase 3 body output through text, DOM order, computed tokens, focus behavior, and containment instead of relying on screenshots alone."
  - "Classify deliberate 404 console noise only when an independent HTTP response ledger proves the exact missing-route URL."

patterns-established:
  - "Published-graph oracle: raw approved sources must equal generated pages, crawlable anchors, canonical and Open Graph identity, and sitemap membership."
  - "Launch proof: build once with a controlled HTTPS origin, test that untouched output locally, clear process variables, then restore and verify deterministic local output."
  - "Visual evidence containment: all browser captures and ledgers remain under the ignored .artifacts/ tree."

requirements-completed: [SITE-06, SEO-02, SEO-03, SEO-04, SEO-05]

duration: 29min
completed: 2026-08-28
---

# Phase 04 Plan 03: Published Graph and Zero-Regression Proof Summary

**An independent raw-source oracle now proves the complete public route graph across HTML, links, canonical identity, and sitemap output, while deterministic browser checks lock all eight established Arabic bodies against visible regression.**

## Performance

- **Duration:** 29 min
- **Started:** 2026-08-27T23:16:10Z
- **Completed:** 2026-08-27T23:44:47Z
- **Tasks:** 2
- **Tracked implementation files:** 2

## Accomplishments

- Proved exact equality between approved raw Markdown/MDX sources, generated article routes, ordinary internal article anchors, canonical and Open Graph URLs, and both generated sitemap layers.
- Proved every draft record is absent from routes, links, page identity, sitemap XML, robots text, and scanned output identities without importing the production public-content selector into the expectation oracle.
- Locked the complete eight-route reader-facing body contract through exact visible-text hashes, landmark and content order, typography tokens, 70ch measure, responsive spacing, focus rules, containment, and document width.
- Verified ordinary local identity, controlled HTTPS launch identity against untouched launch output, and restored local identity through the required full verification sequence.
- Captured and inspected complete ignored Hercules evidence for responsive routes, missing routes, no-JavaScript recovery, keyboard focus, favicon sizes, discovery files, console, network, and accessibility.

## Task Commits

Each task was committed atomically, with the TDD task split into its required red and green commits:

1. **Task 1 RED: Add the failing independent published-graph oracle** - `d90c278` (test)
2. **Task 1 GREEN: Prove source, build, links, identity, and sitemap equality** - `f859390` (feat)
3. **Task 2: Lock launch identity and all eight route bodies** - `bbc9aa9` (test)

**Plan metadata:** recorded by the summary commit that contains this file.

## Files Created/Modified

- `tests/discovery.spec.ts` - Independent raw-frontmatter public-corpus oracle, source/output/anchor/canonical/sitemap set equality, link resolution, and complete draft/proof absence matrix.
- `tests/search-discovery.spec.ts` - Separate local transport and expected site identity plus exact eight-route body, responsive, focus, containment, and discovery assertions.

No production application, configuration, dependency, or package file changed in Task 2. Visual and browser evidence remains ignored under `.artifacts/hercules-visual-qa/phase-04-final/`.

## Decisions Made

- Kept preview requests, network-locality checks, navigation, no-JavaScript contexts, and local sitemap fetching on `127.0.0.1`; only absolute canonical, Open Graph, sitemap, and robots expectations use the controlled expected origin.
- Required the independent oracle to read raw source frontmatter and registry facts directly so application filtering and generated outputs cannot share the same false-green membership bug.
- Used deterministic body structure and computed-style assertions as the repeatable regression gate, with screenshots retained as inspected evidence rather than the sole oracle.
- Accepted missing-route browser console echoes only when the exact response URL independently returned the intentional 404 status.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test Correction] Required the named proof drafts as a subset of the complete current draft corpus**

- **Found during:** Task 1 (independent published-graph oracle)
- **Issue:** The plan named two proof draft routes, while the maintained corpus currently contains three draft records.
- **Fix:** Required both named proof fixtures to exist as a subset and checked every discovered draft record for absence across every public output family.
- **Files modified:** `tests/discovery.spec.ts`
- **Verification:** The source/build/link/canonical/sitemap oracle and full 128-test native gate passed.
- **Committed in:** `f859390`

**2. [Rule 1 - Evidence Runner Correction] Waited for Enter navigation and classified HTTP errors through an exact response ledger**

- **Found during:** Task 2 (final visual and logic evidence)
- **Issue:** Keyboard recovery capture could race navigation, and generic Chromium 404 console echoes were not sufficient to prove which requested route caused each error.
- **Fix:** Waited for the Enter-triggered navigation and independently recorded every HTTP response URL before classifying intentional missing-route errors.
- **Files modified:** Ignored evidence runner and results under `.artifacts/` only
- **Verification:** Standalone evidence completed 280/280 checks with zero unexpected console errors, page errors, failed requests, remote requests, or HTTP errors.
- **Committed in:** Not tracked; evidence is intentionally ignored

---

**Total deviations:** 2 auto-fixed test/evidence corrections.
**Impact on plan:** Both corrections strengthened the planned independent proof and changed no production behavior or scope.

## Issues Encountered

- Chrome DevTools MCP was unavailable, so Hercules used its documented headed Playwright fallback and labeled that backend explicitly in the evidence report.

## Verification Evidence

- Ordinary `npm run verify` passed before and after the controlled launch sequence: 128/128 native tests, Astro 0 errors/0 warnings/0 hints, and 49/49 browser tests.
- Controlled `SITE_ORIGIN=https://blog.ahmed-mangawy.org` launch build passed; the direct production-discovery run against untouched launch `dist` passed 9/9 while browser transport remained local.
- Both origin variables were cleared before the final ordinary verification, which restored `http://127.0.0.1:4322` output.
- The independent published-graph oracle proved exact, duplicate-free source/build/anchor/canonical/Open Graph/sitemap equality and absence of all current draft records.
- Hercules evidence covered eight public routes at five widths, responsive 404 states, no-JavaScript recovery, focus states, 16px/32px favicon rendering, discovery endpoints, and full network/console ledgers.
- Standalone visual/logic evidence passed 280/280 checks; nine Axe records contained zero serious or critical findings, and visual inspection found no RTL, clipping, overflow, hierarchy, focus, responsive, or favicon defect.
- `git check-ignore` confirmed the complete evidence tree remains outside tracked source and planning paths.

## Known Stubs

None. Every required oracle, browser invariant, launch-origin proof, and evidence ledger is complete and connected to the existing verification commands.

## User Setup Required

None for this plan. Production deployment, domain ownership, DNS/TLS, Search Console verification, analytics account configuration, and live-service certification remain later operational work and were not fabricated here.

## Next Phase Readiness

- Phase 4 implementation is complete and ready for phase-level UI, code, security, UAT, regression, and goal verification.
- Phase 5 can rely on one proven absolute-origin and crawler-discovery contract when adding deployment and privacy-conscious measurement.
- No implementation or evidence blocker remains from Plan 04-03.

## Self-Check: PASSED

- Commits `d90c278`, `f859390`, and `bbc9aa9` exist in repository history.
- Both tracked test files named by this summary exist and contain the completed independent graph and body-invariance gates.
- All five requirement IDs from Plan 04-03 appear exactly in summary frontmatter.
- The required ordinary, controlled-launch, untouched-output, restored-local, and artifact-ignore checks passed.
- No production source, package file, environment file, or tracked browser artifact was introduced by Task 2.

---
*Phase: 04-search-discovery-integrity*
*Completed: 2026-08-28*
