---
phase: 04-search-discovery-integrity
verified: 2026-08-28T00:59:12Z
status: passed
score: 13/13 must-haves verified
requirements_verified: [SITE-06, SEO-02, SEO-03, SEO-04, SEO-05]
overrides_applied: 0
gaps: []
human_verification: []
---

# Phase 04: Search Discovery Integrity Verification Report

**Phase Goal:** Readers and crawlers receive one accurate, consistent identity and indexing policy for every public route.
**Verified:** 2026-08-28T00:59:12Z
**Status:** passed
**Re-verification:** No — initial goal-backward verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | Every indexable page has a unique descriptive Arabic title, meta description, and one clear primary heading. | ✓ VERIFIED | A fresh ordinary build produced eight indexable HTML routes. Independent output parsing found 8/8 unique titles, 8/8 unique descriptions, and one H1 on each route. `tests/search-discovery.spec.ts:310-375` verifies exact Arabic values and counts against registries and raw frontmatter. |
| 2 | Every indexable page emits a self-consistent canonical URL and accurate social metadata derived from the configured production origin. | ✓ VERIFIED | `src/layouts/SiteLayout.astro:16-46` is the sole renderer and derives canonical identity from `Astro.url.pathname` plus `Astro.site`. Fresh local verification passed 49/49 browser tests; a controlled HTTPS build followed by 9/9 untouched-output tests proved canonical, Open Graph, Twitter, sitemap, and robots origin agreement. |
| 3 | Crawlers and visitors can reach every published article through ordinary HTML links, while drafts and non-public records appear in no public route or discovery output. | ✓ VERIFIED | `tests/discovery.spec.ts:110-178` derives membership directly from raw Markdown/MDX frontmatter; `:431-531` proves exact source/HTML/anchor/canonical/OG/sitemap equality, working internal links, and absence of all three current drafts across HTML, XML, and robots. The oracle does not import `getPublicArticles()`. |
| 4 | The deployable sitemap contains only canonical published routes, and robots directives agree with the intended indexing policy. | ✓ VERIFIED | Plain official `sitemap()` in `astro.config.mjs:13` generated one index plus eight canonical URLs. `src/pages/robots.txt.ts:3-11` emits the exact allow policy and same-origin sitemap-index URL. Fresh parsing found one sitemap-index location, eight sitemap URLs, no 404/draft route, and exact robots text. This is build-output proof; live deployment remains Phase 5/6 scope. |
| 5 | A visitor who opens a missing route receives a useful Arabic 404 page with a clear link back into the site. | ✓ VERIFIED | `src/pages/404.astro:7-15` uses the shared Arabic/RTL shell with the locked H1, message, and native home link. `SiteLayout.astro:33-49` emits `noindex,follow` and omits canonical/social identity. Two slash-form routes and one slashless route returned true 404s; no-JS recovery, focus, reflow, and Axe checks passed. |
| 6 | Ordinary builds remain fixed to the explicit local origin, while launch readiness accepts only one normalized safe HTTPS origin and never loads an environment file. | ✓ VERIFIED | `src/lib/site-origin.ts:4-44` contains the single origin boundary; `tests/site-origin.test.ts` covers five accepted normalizations and 39 rejected inputs. `astro.config.mjs:5-10` fixes ordinary output; `scripts/launch-ready.mjs:3-7` reads only process-local `SITE_ORIGIN`, validates it, and builds with `mode: "launch-readiness"`. Source scans found no `loadEnv` or dotenv use. |
| 7 | The exact official `@astrojs/sitemap@3.7.3` dependency is pinned and plain route-derived sitemap generation has no parallel URL list, filter, or serializer. | ✓ VERIFIED | Manifest, root lock record, installed lock record, tarball URL, integrity, and install-script absence all matched version 3.7.3. `astro.config.mjs:1-13` invokes plain `sitemap()`. Fresh production-only `npm audit` reported zero vulnerabilities. |
| 8 | Local and controlled launch builds prove absolute host agreement, untouched launch output is browser-tested locally, and ordinary local identity is restored afterward. | ✓ VERIFIED | The verifier independently ran `npm run launch:ready` with `https://blog.ahmed-mangawy.org`, then 9/9 production-discovery checks against untouched output while transport stayed on `127.0.0.1:4322`, cleared both origin variables, rebuilt ordinarily, and confirmed controlled identity absent and local identity restored. |
| 9 | Every HTML document references one inert local cream/green SVG favicon with no active or remote content. | ✓ VERIFIED | `SiteLayout.astro:29` owns the single root-relative link. `public/favicon.svg` contains only an SVG root and two local paths. `tests/search-discovery.spec.ts:787-865` verifies all public documents plus 404, MIME, size, square viewBox, geometry/attribute/color allowlists, active/remote denylists, and 16/32px rendering. |
| 10 | An independent raw-source/registry oracle equals generated HTML, ordinary anchors, canonical/OG URLs, and sitemap membership, with every draft identity absent. | ✓ VERIFIED | `tests/discovery.spec.ts:24-178` reads raw files and registries without application selectors; `:431-531` compares five independently observed output families and checks every draft title, slug, video ID, path, encoded path, and URL. The two named proof routes are required as a subset of all three current drafts. |
| 11 | The eight established public bodies have zero visible regression across text, DOM order, typography, measure, spacing, focus, containment, reflow, and no-JavaScript behavior. | ✓ VERIFIED | `tests/search-discovery.spec.ts:52-181,378-621` locks body text SHA-256 values, landmark/heading/list/link order, one H1, one font family, four sizes, two weights, 70ch measure, responsive padding, border, underline/focus rules, containment, and document width. The verifier also inspected the 390px and 1440px route sheets plus missing/focus/no-JS and favicon sheets; no RTL, clipping, overflow, hierarchy, focus, or favicon defect was visible. |
| 12 | Browser verification uses fresh ordinary or controlled builds and keeps all generated evidence beneath the ignored `.artifacts/` boundary. | ✓ VERIFIED | `package.json:16-20` builds before browser tests; Plan 04-03's controlled sequence was independently repeated. `playwright.config.ts:4-15` routes reports, traces, screenshots, and videos under `.artifacts/`. `git check-ignore -v` confirmed the final Hercules run is ignored; the coverage ledger has no failed, blocked, or untested item. |
| 13 | All high-severity Phase 04 threats and the two review findings are closed in current code. | ✓ VERIFIED | Fix `ad1e1b3` is present in `scripts/launch-ready.mjs:7`, preserving launch-readiness mode. Fix `1e38654` is present in `tests/content-contract.test.ts:484-578`, inspecting controlled artifacts and restoring local output in `finally`. Fresh full verification, controlled verification, source scans, SVG checks, and zero-vulnerability audit independently support all 8/8 security closures. |

**Score:** 13/13 truths verified

## Required Artifacts — Three-Level Verification

| Artifact | Expected | L1 Exists | L2 Substantive | L3 Wired | Status / Details |
|---|---|---:|---:|---:|---|
| `src/lib/site-origin.ts` | Local constant and fail-closed production-origin validator | ✓ | ✓ | ✓ | Imported by ordinary Astro config and launch wrapper; native rejection matrix passes. |
| `tests/site-origin.test.ts` | Acceptance/normalization/rejection matrix | ✓ | ✓ | ✓ | Included by `npm test`; 44 origin cases pass. |
| `scripts/launch-ready.mjs` | Explicit launch-only Astro build wrapper | ✓ | ✓ | ✓ | Called by `npm run launch:ready`; validates before `build({ site, mode })`. Its seven lines are complete minimal implementation, not a stub. |
| `astro.config.mjs` | Fixed local site and plain official sitemap integration | ✓ | ✓ | ✓ | Loaded by every Astro build; preserves static output and trailing slashes. |
| `package.json` / `package-lock.json` | Exact official sitemap dependency and runnable gates | ✓ | ✓ | ✓ | Manifest/lock/install facts agree on 3.7.3 with integrity and no dependency install script. |
| `src/pages/robots.txt.ts` | Same-origin minimal crawler policy | ✓ | ✓ | ✓ | Astro builds `dist/robots.txt`; output exactly matches the sitemap index identity. |
| `src/layouts/SiteLayout.astro` | Sole escaped title/description/canonical/OG/Twitter/favicon/noindex boundary | ✓ | ✓ | ✓ | Consumed by all four public page families and 404; source ownership test rejects alternate renderers and overrides. |
| `src/pages/index.astro`, `src/pages/[section]/index.astro`, `src/pages/[section]/[slug].astro`, `src/pages/عن-أحمد-المنجاوي.astro` | Maintained identity facts for all public route families | ✓ | ✓ | ✓ | Homepage copy, registries, and validated article frontmatter flow into the shared layout; static paths use the public selector. |
| `src/pages/404.astro` | True Arabic shared-shell missing-route recovery | ✓ | ✓ | ✓ | Built as Astro's special `404.html`; preview returns true 404 with exact noindex recovery behavior. |
| `public/favicon.svg` | Inert local open-page favicon | ✓ | ✓ | ✓ | Linked once by the shared layout, served as SVG, parsed and rendered at 16px/32px. |
| `tests/discovery.spec.ts` | Independent public-graph and draft-exclusion oracle | ✓ | ✓ | ✓ | Included by the `production-discovery` project; raw-source membership is independent from the application selector and generated output. |
| `tests/search-discovery.spec.ts` | Metadata/discovery/404/favicon/body-invariance gate | ✓ | ✓ | ✓ | Included by the same project; separates local transport from declared absolute identity and passed local plus controlled runs. |
| `playwright.config.ts` | Fresh static-preview lifecycle and ignored artifact routing | ✓ | ✓ | ✓ | `production-discovery` runs both discovery suites on port 4322; development proof remains isolated on 4321. |
| `.artifacts/hercules-visual-qa/phase-04-final/20260828-023210-phase-04-final-127.0.0.1-4322/` | Ignored responsive/focus/favicon/accessibility/network evidence | ✓ | ✓ | ✓ | Contains report, coverage ledger, automation JSON, contact sheets, identity/redaction notes, and console/network ledger; Git ignore confirmed. |

## Key Link Verification

| From | To | Via | Status | Evidence |
|---|---|---|---|---|
| `astro.config.mjs` | `src/lib/site-origin.ts` | `site: LOCAL_SITE_ORIGIN` | ✓ WIRED | Import at line 5; config assignment at line 10. |
| `scripts/launch-ready.mjs` | `src/lib/site-origin.ts` | `productionSiteOrigin(process.env.SITE_ORIGIN)` before Astro build | ✓ WIRED | Lines 3-7; missing/unsafe inputs fail and controlled input builds. |
| `astro.config.mjs` | `@astrojs/sitemap@3.7.3` | plain `sitemap()` | ✓ WIRED | Lines 2 and 13; no custom pages, filter, or serializer. |
| `src/pages/robots.txt.ts` | generated sitemap index | `new URL("sitemap-index.xml", site).href` | ✓ WIRED | Lines 3-11; local and controlled output equality passed. |
| `SiteLayout.astro` | `Astro.site` + route pathname | `new URL(Astro.url.pathname, Astro.site).href` | ✓ WIRED | Lines 16-21; exact self-canonical assertions pass on all eight routes. |
| Article route | shared layout | validated title/description with `ogType="article"` | ✓ WIRED | `src/pages/[section]/[slug].astro:38-42`; exact article identity tests pass. |
| 404 route | shared layout | `indexable={false}` | ✓ WIRED | `src/pages/404.astro:7-15`; noindex and canonical/social omission pass. |
| Shared layout | `public/favicon.svg` | one `/favicon.svg` icon link | ✓ WIRED | `SiteLayout.astro:29`; all nine HTML states and the asset response pass. |
| Raw frontmatter/registries | HTML, anchors, canonicals, OG URLs, sitemap | independent expected graph | ✓ WIRED | `tests/discovery.spec.ts:110-178,431-531`; exact set equality and draft-negative scans pass. |
| `tests/search-discovery.spec.ts` | Playwright production lifecycle | `production-discovery` project | ✓ WIRED | `playwright.config.ts:25-31`; 9 focused tests and full 49-test browser gate pass. |
| UI body-invariance contract | all eight routes | text/DOM/token/box/scroll-width assertions plus inspected captures | ✓ WIRED | `tests/search-discovery.spec.ts:378-621`; baseline keys equal the current eight-route identity set. |

The generic `gsd-tools verify.key-links` query reported several false negatives because it treated escaped regex strings and descriptive/non-file endpoints literally. Manual source inspection and executable behavior above prove those links are wired.

## Data-Flow Trace (Level 4)

| Artifact / Output | Data | Source | Produces Real Data | Status |
|---|---|---|---:|---|
| Public metadata head | title, description, type | Maintained homepage/author copy, section registry, validated article frontmatter | Yes — eight distinct identities | ✓ FLOWING |
| Public route graph | published records and paths | Astro content collection → validation → literal `draft: false` selector → static paths | Yes — three articles plus five structural routes | ✓ FLOWING |
| Absolute identity | canonical, OG URL, sitemap and robots host | Explicit local constant or validated launch process input → Astro build `site` → `Astro.site` | Yes — local and controlled hosts independently proven | ✓ FLOWING |
| Missing-route recovery | Arabic copy and indexing state | Static `404.astro` → shared `indexable=false` layout branch | Yes — true 404 response with noindex and home navigation | ✓ FLOWING |
| Favicon | local SVG bytes | Shared head link → `public/favicon.svg` | Yes — successful local image response with inert source | ✓ FLOWING |
| Independent verification graph | approved/excluded route sets | Raw Markdown/MDX frontmatter plus registries, without public-selector import | Yes — three public and three draft records observed | ✓ FLOWING |

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Full ordinary gate | `npm run verify` on Node 24.19.0/npm 11.17.0 | 128/128 native; Astro 0 errors, 0 warnings, 0 hints; 49/49 browser | ✓ PASS |
| Controlled identity against untouched launch output | controlled `npm run launch:ready`, then focused production-discovery suite before rebuild | 9/9 passed with declared HTTPS identity and localhost transport | ✓ PASS |
| Deterministic restoration | clear origin inputs, `npm run build`, inspect combined HTML/XML/robots | Local `http://127.0.0.1:4322` restored; controlled hostname absent | ✓ PASS |
| Built discovery shape | direct parsing of `dist` | 9 HTML files, 8 indexable, 8 unique titles, 8 unique descriptions, one H1 each, 8 canonical/sitemap URLs, exact robots | ✓ PASS |
| Dependency vulnerability check | `npm audit --omit=dev --json` | 0 total vulnerabilities at every severity | ✓ PASS |
| Artifact containment | `git check-ignore -v` on final Hercules run | Matched `.gitignore:4:.artifacts/` | ✓ PASS |

## Probe Execution

No Phase 04 plan or summary declares a probe, and no conventional `scripts/**/tests/probe-*.sh` exists. Probe execution is not applicable.

## Requirements Coverage

| Requirement | Source Plans | Status | Evidence |
|---|---|---|---|
| SITE-06 | 04-02, 04-03 | ✓ SATISFIED | True Arabic/RTL 404, exact recovery copy/link, noindex policy, no canonical/social identity, sitemap exclusion, no-JS, focus, reflow, and accessibility all pass. |
| SEO-02 | 04-02, 04-03 | ✓ SATISFIED | Eight indexable routes have unique maintained Arabic titles/descriptions and exactly one H1; body identity is unchanged. |
| SEO-03 | 04-01, 04-02, 04-03 | ✓ SATISFIED | Strict origin matrix, explicit launch mode, sole canonical renderer, social parity, controlled untouched-output run, and local restoration pass. |
| SEO-04 | 04-03 | ✓ SATISFIED | Independent raw-source/build/anchor/canonical/OG/sitemap equality, 200 internal links, 404 draft paths, and complete negative identity scans pass. |
| SEO-05 | 04-01, 04-02, 04-03 | ✓ SATISFIED | Exact official route-derived sitemap and same-origin minimal robots policy contain only the eight canonical public routes. Live production certification remains Phase 6. |

No Phase 04 requirement in `REQUIREMENTS.md` is orphaned from the three plans.

## Anti-Patterns and Security Scan

| Surface | Finding | Severity | Impact |
|---|---|---|---|
| 18 Phase 04 source/config/package/test files | No TODO, FIXME, XXX, unreferenced debt marker, placeholder implementation, raw metadata renderer, request-host identity, environment-file loader, custom sitemap list/filter/serializer, or console-only handler | None | No completion blocker or warning. |
| Three test walker helpers | `return []` only when an inspected directory is absent | ℹ️ Info | Test utility fallback; does not flow to user-visible output and is not a stub. |
| `package-lock.json` | Pattern scan hits were integrity/funding strings | ℹ️ Info | Lockfile data, not source debt markers. |
| Sitemap dependency | Exact 3.7.3 package/lock/install facts; no dependency install script; production audit zero | None | No known dependency/security regression. |
| SVG favicon | Strict local element/attribute/color allowlist and active/remote denylist pass | None | No script, image, font, event, animation, URL, or external reference surface. |

`git diff --check` passed and the worktree was clean before this report was written.

## Review, Security, UAT, and Validation Cross-Check

| Gate | Claimed result | Independent cross-check | Verdict |
|---|---|---|---|
| UI review | 24/24 | Source/style assertions passed; verifier inspected route, missing/focus/no-JS, and 16/32px favicon contact sheets | Consistent |
| Deep code re-review | 18 files, 0 findings | Current source was read end-to-end at the relevant boundaries; fresh full and controlled gates passed | Consistent |
| Review fixes | CR-01 and WR-01 closed | Commits `ad1e1b3` and `1e38654` exist; current wrapper mode and persistent controlled-output regression are present and passing | Consistent |
| Security | 8/8 threats closed, no accepted risk | Origin, selector, renderer, discovery, 404, SVG, package, audit, and local/controlled behaviors independently verified | Consistent |
| Nyquist validation | 6/6 tasks and 5/5 requirements, 0 gaps | All declared test files exist, are included by runnable commands, and passed fresh | Consistent |
| UAT | 8/8 agent-executed, no human signoff claimed | Automated user flows and stored visual evidence were replayed/inspected; report preserves the non-human boundary | Consistent |
| Hercules evidence | 280/280; nine Axe records; no required failed/blocked/untested item | Coverage ledger, automation JSON, console/network notes, contact sheets, and Git ignore were inspected | Consistent |

## Disconfirmation Pass

1. **Potential partial wording:** Roadmap criterion 4 says “deployed sitemap.” Phase 04's locked specification explicitly excludes deployment and requires generated deployable output. The build output is verified; actual hostname ownership, hosting, and production crawl are not claimed and are assigned to Phases 5–6.
2. **Potential misleading automation:** Generic `gsd-tools verify.key-links` produced regex/path false negatives. None was accepted as evidence; each connection was traced manually and then exercised through fresh builds/tests.
3. **Potential uncovered failure paths:** Missing/whitespace/credential/query/fragment/path/local/IP/reserved/malformed origins, missing launch section coverage, draft leakage, missing routes, no-JS recovery, metadata duplication/override, active SVG content, and restoration after controlled build all have runnable checks. Provider, DNS/TLS, live service, and production-performance failures are later-phase boundaries.

## Human and Later-Scope Boundaries

No unresolved Phase 04 human-verification item remains. The Plan 04-03 capture-inspection checkpoint was completed against the saved responsive/focus/favicon evidence, and this report does not misrepresent that as owner signoff.

The following are explicitly **not Phase 04 gaps**:

- Phase 5: real hostname selection/ownership, provider deployment, redirects, DNS/TLS, Search Console, analytics, and outbound-click measurement.
- Phase 6: live production crawl certification, native browser-chrome 200% zoom, live YouTube playback, and Core Web Vitals.
- Human governance: qualified religious/editorial approval and final brand/favicon approval. The current code proves technical safety, truthful copy sourcing, and rendering only.

## Gaps Summary

No implementation, wiring, test-independence, security, artifact-containment, or Phase 04 goal gap was found. No override was needed.

## Readiness

Phase 04's code-level search identity and indexing contract is achieved. Phase 5 may proceed using the explicit launch-origin boundary and verified crawler graph, while keeping all real deployment and measurement claims external until they are actually proven.

---

_Verified: 2026-08-28T00:59:12Z_
_Verifier: the agent (gsd-verifier)_
