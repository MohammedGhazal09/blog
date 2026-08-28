---
phase: 04
slug: search-discovery-integrity
status: audited
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-27
audited: 2026-08-28
requirements_verified: [SITE-06, SEO-02, SEO-03, SEO-04, SEO-05]
automated_gaps: 0
---

# Phase 04 — Nyquist Validation Audit

> Final adversarial coverage audit for search identity, crawler discovery, published-route isolation, the Arabic 404 recovery path, and the local favicon.

## Audit Result

**NYQUIST COMPLIANT.** All six planned task behaviors have real automated checks that can fail, every check was executed on the pinned runtime, and no missing automated coverage or implementation bug was found. No test file was added or weakened during this audit.

Wave 0 is complete: `tests/site-origin.test.ts`, the launch regression in `tests/content-contract.test.ts`, `tests/search-discovery.spec.ts`, the independent graph oracle in `tests/discovery.spec.ts`, and the existing Playwright lifecycle all exist and pass. Browser output remains confined to the ignored `.artifacts/` tree.

## Test Infrastructure

| Property | Audited value |
| --- | --- |
| Runtime | Node `v24.19.0`, npm `11.17.0` |
| Native framework | Node `node:test` through `npm test` |
| Browser framework | Playwright `1.62.1` plus axe `4.13.0` |
| Browser config | `playwright.config.ts` |
| Full gate | `npm run verify` |
| Controlled launch | Process-local `SITE_ORIGIN=https://blog.ahmed-mangawy.org`; `npm run launch:ready` |
| Untouched launch-output gate | Matching process-local `EXPECTED_SITE_ORIGIN`; `npx playwright test tests/search-discovery.spec.ts --project=production-discovery` without rebuilding |
| Deterministic restoration | Clear both origin variables; rerun `npm run verify` |
| Browser artifacts | `.artifacts/**`, confirmed ignored by Git |
| Alternate/watch runner | None |

## Exact Task and Requirement Map

| Task ID | Requirement(s) | Observable behavior | Test evidence | Command | Status |
| --- | --- | --- | --- | --- | --- |
| 04-01-01 | SEO-03 | Launch origin accepts only a clean normalized root HTTPS origin and rejects whitespace, credentials, URL state, paths, local/reserved names, and IP literals. | `tests/site-origin.test.ts`: five normalization cases and 39 fail-closed cases. | `npm test` | green |
| 04-01-02 | SEO-03, SEO-05 | Ordinary output is deterministic; launch readiness preserves section coverage, uses the controlled origin in canonical/OG/sitemap/robots output, and restores local output afterward. | `tests/content-contract.test.ts`: complete section matrix and controlled identity regression; fixes `ad1e1b3`, `1e38654`. | `npm test`; controlled launch sequence | green |
| 04-02-01 | SEO-02, SEO-03 | Every public route has one unique escaped Arabic title/description/H1 and one self-consistent canonical, Open Graph, and Twitter identity owned by the shared head. | `tests/search-discovery.spec.ts`: exact counts, uniqueness, escaping, parity, type, prohibited-field absence, route equality, and sole-source/no-override scan. | Focused production-discovery suite | green |
| 04-02-02 | SITE-06, SEO-05 | Unknown paths are true Arabic/RTL 404s with `noindex,follow`, no canonical/social identity, native recovery, and one inert local favicon; robots and sitemap agree. | `tests/search-discovery.spec.ts`: slash/slashless status, exact DOM/head, no-JS, keyboard/focus/reflow/axe/network, XML/text parsing, SVG allow/deny checks. | Focused production-discovery suite | green |
| 04-03-01 | SEO-04 | Approved raw sources equal generated article pages and ordinary article anchors; the full graph equals canonical, OG, and both sitemap layers; every draft identity is absent. | `tests/discovery.spec.ts`: independent raw-frontmatter oracle, duplicate-free set equality, link resolution, and all-current-draft negative scans. | `npm run verify` | green |
| 04-03-02 | SITE-06, SEO-02, SEO-03, SEO-04, SEO-05 | All eight public bodies stay unchanged across semantic order, computed tokens, responsiveness, focus, no-JS, accessibility, console/network locality, and controlled identity. | Both discovery suites plus ignored Hercules evidence under `.artifacts/hercules-visual-qa/phase-04-final/`. | `npm run verify`; controlled suite; Hercules ledger | green |

## Requirement Coverage

| Requirement | Automated evidence | Classification |
| --- | --- | --- |
| SITE-06 | True 404 status; exact Arabic/RTL recovery; `noindex,follow`; canonical/social omission; sitemap exclusion; no-JS, focus, reflow, axe, and network checks. | FILLED |
| SEO-02 | All eight indexable routes have exactly one unique Arabic title, description, and H1; values are normally escaped and body structure is locked. | FILLED |
| SEO-03 | Safe-origin matrix; launch mode and complete section coverage; local/controlled canonical and OG identity; no override surface; deterministic restoration. | FILLED |
| SEO-04 | Independent source/build/anchor/canonical/OG/sitemap equality; every public link resolves; all three current drafts and identifiers are absent. | FILLED |
| SEO-05 | Sitemap index and numbered sitemap equal the public graph; robots uses the same origin and exact policy; 404/drafts are excluded locally and in launch output. | FILLED |

## Adversarial Coverage Notes

- **Origin poisoning:** Raw delimiters, credentials, paths, localhost/subdomains, IP literals, reserved roots/subdomains, normalization, and non-default HTTPS ports are covered.
- **Launch corpus:** The wrapper is tied to `mode: "launch-readiness"`; missing one or several registered sections fails in registry order. Fixes `ad1e1b3` and `1e38654` close the former propagation and exit-status-only gaps.
- **Head injection/duplication:** Assertions count required tags, compare decoded values, prove uniqueness, and reject alternate renderers, override props, and raw head HTML.
- **Soft/indexable 404:** Status, Arabic semantics, exact head policy, visible recovery, keyboard activation, and sitemap absence are independent observations.
- **Publication leakage:** Expected membership derives from raw frontmatter and registries, not the production selector/output; every draft is scanned by title, slug, video ID, path, encoded path, and URL.
- **False visual confidence:** Body invariance uses text hashes, DOM order, computed typography/measure/spacing/border/focus/containment, and document width. Screenshots supplement assertions.
- **Browser regression:** No-JS, focus order, responsive widths, axe, console/page-error/response ledgers, remote-request denial, and inert favicon behavior are covered.

## Verification Run — 2026-08-28

| Gate | Actual result |
| --- | --- |
| Initial ordinary `npm run verify` | 128/128 native; Astro 0 errors, 0 warnings, 0 hints; 49/49 browser. |
| Controlled `npm run launch:ready` | Passed with `https://blog.ahmed-mangawy.org`; launch-readiness generated nine pages and both sitemap layers. |
| Untouched controlled-output discovery | 9/9 passed while browser transport stayed on `127.0.0.1:4322`. |
| Final ordinary `npm run verify` | 128/128 native; Astro 0 errors, 0 warnings, 0 hints; 49/49 browser. |
| Output restoration | `dist` contains local identity and no controlled HTTPS identity. |
| Required files | Four Phase 04 tests, Playwright config, three plans, and three summaries exist. |
| Planning consistency | GSD `validate consistency` passed; only expected absent Phase 5/6 directory warnings. GSD `validate health` was healthy with zero findings. |
| Summary validation | `04-03-SUMMARY.md` passed. `04-01`/`04-02` are tool false negatives because historical RED/failure prose precedes their explicit `## Self-Check: PASSED`; files, commits, and current gates are green. |
| Requirements/state | SITE-06 and SEO-02 through SEO-05 are complete; Roadmap marks Phase 4 complete; State records 04-03 completion/readiness. |
| Artifact isolation | `git check-ignore -v` confirms the Hercules and Playwright artifact roots are ignored. |
| Hercules evidence | Final `REPORT.md`, `automation-results.json`, and `coverage-ledger.md`: 280/280 checks, nine Axe records with zero serious/critical findings, zero unexpected console/page/request/remote/HTTP failures. |

## Manual and External Boundaries

These are later-phase or human boundaries, not Phase 04 gaps:

| Boundary | Owner | Phase 04 evidence limit |
| --- | --- | --- |
| Real hostname ownership, hosting, redirects, DNS/TLS, Search Console, analytics, outbound-click measurement | Phase 5 | Controlled HTTPS identity proves output consistency only, not deployment. |
| Production crawl, native browser-chrome 200% zoom, live YouTube playback, Core Web Vitals | Phase 6 | Local automation and inspected Hercules evidence only. |
| Final branding/favicon and religious/editorial approval | Human review | Technical inertness, rendering, semantics, and current approved copy only. |

No production URL, provider state, external-service account, traffic event, live playback, or production performance result is fabricated.

## Audit Trail

| Date | Event | Result |
| --- | --- | --- |
| 2026-08-27 | Strategy created | Wave 0 requirements identified. |
| 2026-08-27 | Plans 04-01 through 04-03 executed | Native, browser, graph, launch, and body-invariance coverage added. |
| 2026-08-28 | Fixes `ad1e1b3`, `1e38654` | Launch mode and persistent controlled-output/restoration regression locked. |
| 2026-08-28 | Nyquist adversarial audit | 6/6 tasks green; 5/5 requirements FILLED; 0 gaps; 0 escalations. |

## Sign-Off

- [x] Every planned task has runnable behavioral evidence and exact requirement mapping.
- [x] Every required test was executed; none is green from inspection alone.
- [x] Full ordinary verification passed before and after controlled untouched-output verification.
- [x] Local identity was restored deterministically.
- [x] No implementation/config/package file or test was modified by this audit.
- [x] No watch mode, alternate framework, tracked browser artifact, or environment file was introduced.
- [x] External and later-phase claims remain explicitly unverified.

**Approval:** audited and Nyquist compliant on 2026-08-28. Phase 04 has no remaining automated validation gap.
