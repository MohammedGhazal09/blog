---
phase: 01-content-and-url-contract
verified: 2026-08-26T14:14:30Z
status: passed
score: "8/8 must-haves verified"
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: "7/8"
  gaps_closed:
    - "Owner local preview, draft rendering, source reload/restoration, and production draft exclusion"
  gaps_remaining: []
  regressions: []
---

# Phase 1: Content and URL Contract Verification Report

**Phase Goal:** As a site owner, I want to maintain safe previewable Arabic articles, so that public surfaces use stable identities.
**Verified:** 2026-08-26T14:14:30Z
**Status:** passed
**Re-verification:** Yes — after human UAT closure and fresh automated regression checks

## User Flow Coverage

User story: «As a site owner, I want to maintain safe previewable Arabic articles, so that public surfaces use stable identities.»

| Step | Expected | Evidence | Status |
| --- | --- | --- | --- |
| Author or edit | The owner edits one Markdown/MDX source record with the required facts | `README.md:19-104` documents the only authoring workflow; `src/content.config.ts:9-30` loads both formats through one schema; the repository contains valid `.md` and `.mdx` records | ✓ VERIFIED |
| Preview | Public Markdown, approved MDX, and an explicit draft render on their final routes in development; a source edit reloads | `01-UAT.md` records all three Arabic RTL final routes, exactly one approved MDX `<aside>`, draft visibility in development, temporary summary marker appearing after reload and disappearing after `apply_patch` restoration, stopped PID 33492, and released port 4321 | ✓ VERIFIED |
| Build public output | Production emits validated public records and no draft route | Fresh `npm run verify` built exactly two public routes; output probe found both public HTML files and no draft HTML | ✓ VERIFIED |
| Outcome | Later public surfaces receive stable identities unrelated to title or filename | `articlePath()` and `pathParamsFor()` use only registered section slug plus explicit article slug (`src/lib/content-contract.ts:209-242`); native case 18 proves a title edit keeps `/القضايا-العامة/اختبار-عقد-المحتوى/` | ✓ VERIFIED |

## Goal Achievement

### Observable Truths

Roadmap success criteria are the non-negotiable contract. Plan-specific truths below add the exact toolchain, route, policy, and owner-workflow details without replacing roadmap scope.

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | The owner can create or edit an article as Markdown/MDX and preview the same validated content model locally. | ✓ VERIFIED | Mixed loader/schema, dev route branch, named preview query, Arabic authoring guide, and completed `01-UAT.md` prove public Markdown, approved MDX, and draft rendering plus source edit/reload/restoration through the final routes. |
| 2 | A published article keeps its explicit clean Arabic slug when its title changes, while missing metadata, duplicate routes, non-normalized identifiers, unsafe Unicode, invalid dates, and invalid YouTube identifiers are rejected. | ✓ VERIFIED | Shared validator/path/collision functions at `src/lib/content-contract.ts:101-255`; native cases 2-38 directly exercise production helpers and fresh `npm run verify` passed 55/55. |
| 3 | Draft records are excluded from public queries, and MDX cannot use components, executable syntax, raw HTML/iframes, attributes, expressions, or unsafe URL protocols outside the approved surface. | ✓ VERIFIED | Public/preview selectors at `src/lib/content-contract.ts:258-276`, query wiring at `src/lib/articles.ts:9-23`, config-load preflight at `astro.config.mjs:3-5`, structural parser policy at `src/lib/mdx-policy.ts:33-87`, native cases 40-41 and 44-55, and draft absent from fresh output. |
| 4 | A future primary section can be added through the central registry/content contract without another application, collection, schema, query, or route family. | ✓ VERIFIED | One registry family at `src/config/registries.ts:1-40`; case 43 injects a fourth canonical section and derives `/دروس-مستقبلية/سلسلة-٤/` through the same validator/path helper. |
| 5 | The exact supported toolchain and full gate are executable. | ✓ VERIFIED | `.nvmrc` is `24.19.0`; `package.json:6-18` gates npm 11.17.0 and exposes dev/test/check/build/verify. Fresh exact-runtime run reported Node v24.19.0, npm 11.17.0, 55/55 tests, 0 diagnostics, and a successful two-page build. |
| 6 | One mixed article collection validates complete article facts against own-key section/author registries. | ✓ VERIFIED | `src/content.config.ts:9-30` delegates semantic policy to `validateArticleData`; `Object.hasOwn` checks at `src/lib/content-contract.ts:182-185` close inherited-key bypasses; cases 20-43 cover required facts, inherited/unknown keys, registry integrity, and extension. |
| 7 | Development preview and production share the final route family while production callers cannot opt into drafts. | ✓ VERIFIED | `src/pages/[section]/[slug].astro:8-16` has one route family and selects named environment-specific queries; `src/lib/articles.ts:15-23` exposes separate no-boolean public/preview functions; `astro.config.mjs` has static output and no fake origin, redirect, or adapter. |
| 8 | The owner workflow documents the actual authoring, preview, validation, and build commands without a second schema or route family. | ✓ VERIFIED | Arabic `README.md:1-107` matches `package.json` scripts and identifies all required fields, registries, slug rules, explicit drafts, restricted MDX, final route shape, and full verification command. |

**Score:** 8/8 truths verified.

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `.nvmrc`, `package.json`, `package-lock.json`, `tsconfig.json` | Exact reproducible toolchain and runnable gates | ✓ VERIFIED | Exist, substantive, exact direct versions are installed, and fresh verification ran under the pinned Node/npm pair. |
| `src/config/registries.ts` | Central typed section/author facts | ✓ VERIFIED | Three canonical Arabic sections and one truthful author; consumed by shared validation and route identity. |
| `src/lib/content-contract.ts` | Shared metadata, Unicode, date, identity, collision, and visibility policy | ✓ VERIFIED | 277 lines, substantive, exported functions are used by schema, query layer, route, and native tests. |
| `src/content.config.ts` | One Markdown/MDX schema boundary | ✓ VERIFIED | Mixed glob loader plus required shape and semantic refinement; wired into Astro content sync/check/build. |
| `src/lib/articles.ts` | Collision-checked public and dev-preview queries | ✓ VERIFIED | Loads real collection data, checks all paths before selection, and is consumed by the only article route. |
| `src/lib/mdx-policy.ts` | Structural fail-closed source policy and filesystem preflight | ✓ VERIFIED | Uses pinned `@mdx-js/mdx`, traverses real source ASTs, exports tested policy/preflight, and is invoked at Astro config load. |
| `src/components/ContractNote.astro`, `src/components/mdx-components.ts` | Sole approved semantic MDX component and exact render map | ✓ VERIFIED | Minimal component is intentionally 5 lines, not a stub; map is type-constrained to the central allowlist and passed to rendered content. |
| `src/pages/[section]/[slug].astro` | Final Arabic article route for preview and production | ✓ VERIFIED | Loads named queries, derives params through the shared contract, renders real collection content, and produced both public HTML files. |
| `src/content/articles/contract-markdown.md`, `contract-mdx.mdx`, `contract-draft.md` | Valid public Markdown, approved public MDX, and explicit draft proof records | ✓ VERIFIED | All use the same required frontmatter; public records build, MDX renders the approved aside, and draft output is absent. |
| `tests/content-contract.test.ts` | Native regression matrix invoking production code | ✓ VERIFIED | 375 lines; imported by the executable `npm test` script; fresh run passed all 55 behavior assertions. |
| `README.md` | Arabic owner authoring and verification workflow | ✓ VERIFIED | Commands and identifiers match executable repository contracts; no deployment, canonical, analytics, or other later-phase claims. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `astro.config.mjs` | `src/lib/mdx-policy.ts` | Config-load `preflightArticleSources()` | ✓ WIRED | Executes before Astro exports config, covering dev/check/build source compilation. |
| `src/content.config.ts` | `src/lib/content-contract.ts` | `validateArticleData()` schema refinement | ✓ WIRED | Shape validation and shared semantic validation are one content boundary. |
| `src/lib/articles.ts` | `src/lib/content-contract.ts` | Collision validation then public/preview selection | ✓ WIRED | Complete collection is checked before either visibility branch. |
| `src/pages/[section]/[slug].astro` | `src/lib/articles.ts` | DEV preview vs production public query | ✓ WIRED | Production route enumeration cannot request drafts through an option. |
| `src/pages/[section]/[slug].astro` | `src/lib/content-contract.ts` | `pathParamsFor(article)` | ✓ WIRED | Route params use registered section slug and explicit article slug only. |
| `src/components/mdx-components.ts` | `src/lib/mdx-policy.ts` | `ApprovedMdxComponentName` constraint | ✓ WIRED | Render map must provide exactly the approved component key type. |
| `src/pages/[section]/[slug].astro` | `src/components/mdx-components.ts` | `<Content components={mdxComponents} />` | ✓ WIRED | Approved MDX component renders through the same article route. |
| `tests/content-contract.test.ts` | production policy modules | Direct imports and behavior assertions | ✓ WIRED | Test script selects this file and calls real helpers; no copied validator exists. |
| `README.md` | `package.json` | Documented `npm run dev` and `npm run verify` commands | ✓ WIRED | Commands exist exactly as documented. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `src/pages/[section]/[slug].astro` | `article` prop | `getCollection("articles")` → collision check → environment selector → `getStaticPaths()` props | Yes — three source records load; two public records reach production | ✓ FLOWING |
| Rendered `Content` | Markdown/MDX body plus `mdxComponents` | Astro `render(article)` from the mixed content collection | Yes — fresh public HTML contains Markdown body and the approved MDX aside | ✓ FLOWING |
| Public route set | selected article array | Complete collection → `selectPublicArticles()` | Yes — two public records emitted; explicit draft omitted | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Exact full gate | Exact Node 24.19.0 executing npm 11.17.0 `run verify` | 55/55 tests; Astro 0 errors, 0 warnings, 0 hints; two pages built; exit 0 | ✓ PASS |
| Stable public output and draft exclusion | PowerShell inspection of the three expected `dist/**/index.html` paths | Markdown present, MDX present, draft absent, HTML count 2 | ✓ PASS |
| Arabic/RTL and approved MDX output | Inspect generated HTML for `lang="ar" dir="rtl"`, viewport, approved aside, and scripts | Arabic/RTL and viewport present; approved aside present; zero `<script>` elements | ✓ PASS |
| Locked direct dependency surface | Exact-runtime `npm ls --depth=0` | Astro 7.2.7, MDX integrations/parser, Astro Check 0.9.10, TypeScript 6.0.3; no adapter/UI runtime/database/auth package | ✓ PASS |
| Completed MVP preview flow | `01-UAT.md` plus post-UAT regression probes | Three dev routes rendered Arabic RTL; one approved aside; draft rendered; edit reloaded then was restored; server stopped and port released; production returned to exactly two public HTML files | ✓ PASS |
| Security and schema gates | Exact-runtime `npm audit --audit-level=info`; `gsd-tools query verify.schema-drift 1` | 0 vulnerabilities; `drift_detected: false`, `blocking: false`; security report remains 7/7 threats closed | ✓ PASS |

### Probe Execution

No probe script is declared by the plans or summaries, and no conventional `scripts/**/probe-*.sh` file exists. Step 7c is not applicable.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| SEO-01 | 01-01, 01-03 | Explicit stable clean Arabic slug independent of title | ✓ SATISFIED | Explicit `slug`; registered section slug; shared path helpers; title-independence case 18; canonical-slug and collision cases 2-19. |
| PUB-01 | 01-01, 01-02, 01-03 | Author/edit Markdown/MDX and preview the same model locally | ✓ SATISFIED | One mixed collection, both formats, shared dev route/query, owner guide, and completed UAT prove public Markdown, approved MDX, draft rendering, and source edit/reload/restoration. |
| PUB-02 | 01-01, 01-03 | Reject missing or invalid required article facts | ✓ SATISFIED | Required schema plus shared semantic validation; cases 20-39 cover each required field, own-key registries, dates, draft type, and YouTube ID; fresh check/build pass valid records. |
| PUB-03 | 01-01, 01-03 | Reject duplicate routes, non-NFC slugs, and unsafe Unicode/controls | ✓ SATISFIED | `assertCanonicalArabicSlug`, all-entry `assertUniqueArticlePaths`, and cases 2-19 cover every locked class with location/rule and both collision owners. |
| PUB-04 | 01-01, 01-03 | Draft cannot appear in production routes or outputs | ✓ SATISFIED | Explicit boolean schema, public-only selector/query, production route branch, cases 40-41, and fresh output proves draft absence. Later indexes/metadata/sitemap do not yet exist, so there is no unverified Phase 1 discovery sink. |
| PUB-05 | 01-02, 01-03 | MDX uses only approved components and cannot introduce arbitrary executable or iframe surface | ✓ SATISFIED | Pre-compilation structural parser rejects ESM, expressions, raw/intrinsic HTML including script/iframe, component attributes, unsafe protocols, and unknown components; approved map renders; cases 44-55 pass. |
| PUB-06 | 01-01, 01-03 | A fourth section is a registry/content change, not an application rewrite | ✓ SATISFIED | Central registry is authoritative; case 43 validates a copied registry with a fourth section and derives its route through unchanged contract code. |

All seven Phase 1 requirement IDs are claimed by plan frontmatter and individually accounted for above. `.planning/REQUIREMENTS.md` maps no additional requirement to Phase 1, so there are no orphaned Phase 1 requirements.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| — | — | No `TBD`, `FIXME`, `XXX`, `TODO`, `HACK`, placeholder, empty-return, or console-only implementation pattern found in the implemented Phase 1 scope | — | No blocker or warning anti-pattern |

The two empty-looking scan matches are legitimate: `ValidationOptions = {}` is an optional input default, and `updatedAt !== undefined` is a validation branch. Neither flows an empty value to rendered output.

### Human Verification Required

None. The previously deferred owner preview/source-reload flow passed in `01-UAT.md`, and fresh post-UAT regression checks confirmed the restored source and production output.

### Gaps Summary

No implementation gap, missing artifact, unwired key link, requirement blocker, blocker anti-pattern, unresolved human check, or regression was found. Finished reader layout/accessibility/media belongs to Phase 2; launch content and indexes to Phase 3; metadata/canonicals/discovery files to Phase 4; deployment/measurement to Phase 5; and production crawl/performance to Phase 6. Those later-phase items are not Phase 1 gaps.

---

_Verified: 2026-08-26T14:14:30Z_
_Verifier: the agent (gsd-verifier)_
