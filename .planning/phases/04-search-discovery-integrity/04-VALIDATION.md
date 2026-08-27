---
phase: 04
slug: search-discovery-integrity
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-27
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for metadata integrity, crawler discovery, the Arabic 404 recovery path, and the local favicon.

## Test Infrastructure

| Property | Value |
| --- | --- |
| **Runtime** | Node `v24.19.0`, npm `11.17.0` |
| **Native framework** | Node `node:test` through `npm test` |
| **Browser framework** | Playwright `1.62.1` plus axe `4.13.0` |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npm test` |
| **Focused browser command** | `npm run build && npx playwright test tests/search-discovery.spec.ts --project=production-discovery` |
| **Full suite command** | `npm run verify` |
| **Launch acceptance** | Set a controlled safe `SITE_ORIGIN` in the current process, run `npm run launch:ready`, then remove that process variable |
| **Browser artifacts** | `.artifacts/**` only |
| **Estimated feedback** | Native checks under 30 seconds; focused browser/full suite under 3 minutes on the pinned local runtime |

## Sampling Rate

- **After each origin or launch-boundary task:** Run `npm test`.
- **After each metadata/page wiring task:** Run `npm run check`.
- **After each rendered discovery task:** Run the focused browser command, which always builds fresh first.
- **After every plan wave and before phase verification:** Run `npm run verify`.
- **Maximum feedback latency:** 3 minutes for the full local gate.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 04-01-01 | 01 | 1 | SEO-03 | T-04-01, T-04-02 | Only a clean production HTTPS origin can become launch identity; request hosts and page data cannot override it. | Native table test | `npm test` | ❌ W0 `tests/site-origin.test.ts` | ⬜ pending |
| 04-01-02 | 01 | 1 | SEO-03, SEO-05 | T-04-01, T-04-04 | Ordinary builds stay deterministic; launch builds fail closed; sitemap derives from Astro routes. | Native + build | `npm test && npm run check && npm run build` | ❌ W0 launch assertions | ⬜ pending |
| 04-02-01 | 02 | 2 | SEO-02, SEO-03 | T-04-02, T-04-05 | The shared layout emits one escaped, self-consistent identity set per indexable route and no invented social fields. | Typecheck + browser | Focused browser command | ❌ W0 `tests/search-discovery.spec.ts` | ⬜ pending |
| 04-02-02 | 02 | 2 | SITE-06, SEO-05 | T-04-04, T-04-06, T-04-07 | Missing routes remain true 404s; robots and sitemap agree; the favicon is inert and local. | Browser + request + XML/SVG parsing + axe | Focused browser command | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 3 | SEO-04 | T-04-03 | Raw approved sources, generated routes, internal links, canonicals, and sitemap URLs agree independently; draft/proof identifiers never publish. | Source/build/browser set comparison | `npm run verify` | ✅ existing oracle; ❌ Phase 4 assertions | ⬜ pending |
| 04-03-02 | 03 | 3 | SITE-06, SEO-02, SEO-03, SEO-04, SEO-05 | T-04-01–T-04-07 | All new behavior and the eight existing page bodies pass the complete regression gate without new client runtime or remote requests. | Full regression + visual inspection | `npm run verify` plus Hercules QA | ✅ harness; ❌ final evidence | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

## Wave 0 Requirements

- [ ] `tests/site-origin.test.ts` — acceptance, normalization, and every rejection branch for `SITE_ORIGIN`.
- [ ] `tests/search-discovery.spec.ts` — metadata identity, canonical/social parity, sitemap/robots agreement, 404, favicon, no-JavaScript, reflow, focus, and accessibility.
- [ ] `playwright.config.ts` — include both production discovery suites while retaining the existing preview lifecycle and `.artifacts/` routing.
- [ ] `package.json` — include the new native test and replace the ineffective launch command with the explicit wrapper.
- [ ] `tests/discovery.spec.ts` — remove the temporary `document-title` axe exception after every page has a title.

No new test framework, browser server, or artifact directory is required.

## Threat Register

| Ref | Threat | Severity | Required control | Verification |
| --- | --- | --- | --- | --- |
| T-04-01 | Canonical-host poisoning through an unsafe launch origin | High | Validate one explicit root HTTPS origin and reject credentials, URL state, local/IP/reserved hosts before build. | Native rejection matrix and controlled launch crawl. |
| T-04-02 | Runtime request-host or page-data override of absolute identity | High | Use only `Astro.site` plus `Astro.url.pathname`; expose no canonical override prop/frontmatter. | Source assertion and exact canonical equality. |
| T-04-03 | Draft or proof-content leakage | High | Preserve public route selection and compare output against an independent raw-frontmatter oracle. | Negative identifier scans across HTML, links, canonicals, and XML. |
| T-04-04 | Sitemap and robots disagreement | Medium | Generate sitemap from Astro routes and robots from the same configured site origin. | Parse both XML layers and exact robots lines. |
| T-04-05 | Metadata injection or duplicate identity | High | Use normal Astro escaping in one layout boundary; never use `set:html` for metadata. | Source scan and exact tag-count/value checks. |
| T-04-06 | Active or external SVG content | High | Keep one reviewed local SVG with a strict element/attribute/color allowlist. | XML parse, allowlist, denylist, content-type, and network checks. |
| T-04-07 | Soft 404 or indexable error page | Medium | Use Astro's static `404.astro`, emit `noindex,follow`, omit canonical/social URL identity, and assert status 404. | Direct response, DOM, navigation, and sitemap exclusion checks. |

High-severity failures block phase completion.

## Manual and External Evidence Boundary

| Behavior | Requirement | Boundary | Required evidence |
| --- | --- | --- | --- |
| Favicon clarity at 16px and 32px plus zero visible regression on existing routes | D-15, D-16 | Visual judgment supplements automated SVG/DOM checks. | Hercules captures and ledger under `.artifacts/hercules-visual-qa/`. |
| Real production hostname, provider fallback/redirect semantics, and Search Console submission | SEO-03, SEO-05 | Explicitly deferred to Phase 5; no owned domain or provider state is fabricated in Phase 4. | Phase 5 deployment evidence. |
| Native browser-chrome 200% zoom and production crawl certification | SITE-06, SEO-04 | Explicitly deferred to Phase 6. | Phase 6 certification evidence. |

The approved Phase 4 defaults are `og:locale="ar_AR"`, strict rejection of whitespace and trailing-dot hosts, and the official exact `@astrojs/sitemap@3.7.3` package. These are source-backed routine decisions, not unresolved user checkpoints.

## Validation Sign-Off

- [x] Every planned task family has an automated verification command or an explicit Wave 0 dependency.
- [x] Sampling continuity prevents three consecutive tasks without automated verification.
- [x] Wave 0 covers every missing native/browser assertion identified by research.
- [x] No watch-mode command is used.
- [x] All browser artifacts remain below `.artifacts/`.
- [x] `nyquist_compliant: true` is set because the validation contract is complete.
- [ ] Wave 0 files exist and pass.
- [ ] Focused and full suites are green on Node `v24.19.0` / npm `11.17.0`.
- [ ] Final Hercules visual/logic review has no unresolved Phase 4 finding.

**Approval:** Strategy auto-approved 2026-08-27 under the owner's explicit autonomous-default instruction; implementation evidence pending.
