---
phase: 02
slug: complete-arabic-article-journey
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-26
audited: 2026-08-26
---

# Phase 02 — Validation Report

## Result

**GAPS FILLED.** All 13 Phase 2 requirements have executable behavioral coverage or a justified manual-only browser gate with retained evidence. No new test was added: every proposed gap already has a failing-capable check at the correct boundary.

The fresh exact-runtime audit used Node `v24.19.0` / npm `11.17.0` at the current source state. It passed 69/69 native tests, zero Astro errors/warnings/hints, a two-route static build with the draft absent, and 26/26 Chromium cases.

## Test Infrastructure

| Layer | Command | Live result |
|---|---|---|
| Native contract and policy | `npm test` | 69/69 green |
| Astro diagnostics | `npm run check` | 0 errors, warnings, or hints |
| Static production output | `npm run build` | exactly 2 pages; draft absent |
| Browser behavior | `npm run test:browser` | 26/26 Chromium green |
| Exact-runtime composite gate | `npm run verify` | fresh pass: 69/69 + 0 diagnostics + 2 routes/draft absent + 26/26 |

Playwright reports, traces, snapshots, screenshots, and temporary output resolve below ignored `.artifacts/`. The live recursive check found zero browser artifacts outside that directory.

## Per-Requirement Verification Map

| Requirement | Observable behavior | Automated command / manual evidence | Status |
|---|---|---|---|
| SITE-01 | Exact Arabic reader-facing chrome; rendered prose rejects unisolated Latin copy | `npx playwright test tests/article-journey.spec.ts -g "Arabic surface|bidi"` | green |
| SITE-02 | `lang="ar"`, `dir="rtl"`, main/article semantics, ordered headings | `npx playwright test tests/article-journey.spec.ts -g "Arabic document semantics"` | green |
| ART-01 | One h1, labelled summary, introduction, ordered body/conclusion, complete no-JS path | `npx playwright test tests/article-journey.spec.ts -g "complete text-first"` | green |
| ART-02 | Readable single-column reflow at 320/390/768/1024/1440 without overflow | `npx playwright test tests/article-journey.spec.ts -g "reflow"`; native 200% evidence below | green |
| ART-03 | Native isolation for dates, URLs, IDs, code, and Latin fragments | `npx playwright test tests/article-journey.spec.ts -g "bidi"`; bidi/diacritic evidence below | green |
| ART-04 | Zero media request before intent; one focused encoded nocookie iframe, `hl=ar`, no autoplay/duplicate/layout shift | `npx playwright test tests/article-journey.spec.ts -g "intent-gated player"` | green |
| ART-05 | Exact same-tab direct-video link survives no JS, blocked host, and construction failure | `npx playwright test tests/article-journey.spec.ts -g "direct YouTube|degraded player|complete text-first"` | green |
| ART-06 | Registry facts once; optional units omitted whole; unsafe references/future public updates fail closed | `npm test`; `npx playwright test tests/article-journey.spec.ts -g "provenance"` | green |
| ART-07 | Labelled `الخلاصة` uses validated summary and precedes authored content | `npx playwright test tests/article-journey.spec.ts -g "summary"` | green |
| QUAL-01 | Native semantics/Arabic names and zero serious/critical in-scope axe findings | `npx playwright test tests/article-journey.spec.ts -g "accessibility|Arabic document semantics"`; tree evidence below | green |
| QUAL-02 | Enter/Space activation, 44px controls, visible focus, traversal, no cross-origin trap | `npx playwright test tests/article-journey.spec.ts -g "keyboard|quality"`; focus evidence below | green |
| QUAL-03 | Locked type, palette, focus, spacing, targets, responsive behavior, native 200% zoom | `npx playwright test tests/article-journey.spec.ts -g "quality|reflow"`; zoom evidence below | green |
| QUAL-04 | Full article/action survive no JS, blocked host, construction failure, cookie restrictions | `npx playwright test tests/article-journey.spec.ts -g "degraded|complete text-first|intent-gated"`; manual evidence below | green |

Every browser behavior runs against both Markdown and approved MDX fixtures (13 × 2 = 26 cases).

## Regression and Schema Boundaries

| Boundary | Failing-capable evidence | Result |
|---|---|---|
| Required fields, registries, dates, slugs, paths, collisions, drafts, YouTube IDs | native cases 1–39 and 53–57 | green |
| Optional references | omitted/empty/valid plus malformed shape, label, protocol, URL, and credentials cases | green |
| Future public update claims | public rejection plus preserved future-draft behavior | green |
| Restricted MDX | approved component plus rejected ESM, script/iframe, expressions, attributes, unsafe links, unknown components | green |
| Public enumeration | production `getPublicArticles()` path; exactly two routes; draft absent | green |
| Player/DOM trust boundary | validated ID, hardcoded encoded hosts, one-shot activation, property assignment, static error, no HTML sinks | green |

## Manual-Only Gates

Completed in genuine Chrome under `.artifacts/hercules-visual-qa/phase-02-plan-04-final/20260826-211123-phase-02-plan-04-final-127.0.0.1-4321/`:

| Gate | Requirements | Evidence | Result |
|---|---|---|---|
| Native browser 200% zoom | ART-02, QUAL-03 | `screenshots/markdown-200-percent-browser.png`, report, structured results | pass |
| Arabic bidi and diacritics | ART-03 | inspected mobile/desktop/zoom screenshots | pass |
| Accessibility-tree order and Arabic names | QUAL-01 | `logs/chrome-devtools-results.json`, report | pass |
| Live cross-origin Tab/Shift+Tab escape | QUAL-02 | report records forward/backward escape and visible focus boundary | pass |
| Third-party cookies and blocked embed | QUAL-04 | `screenshots/third-party-cookies-blocked.png`, resilience matrix | pass |
| Human pre-intent DOM/network inspection | ART-04, QUAL-04 | report records local document/CSS only and no YouTube-family asset/request | pass |

The proof video may show an external unavailable state. Production playback is intentionally deferred; the local privacy boundary, shell, and permanent direct link remain verified.

## Artifact and Drift Audit

| Claim | Result |
|---|---|
| Final Hercules report exists at the recorded path | green |
| `.artifacts/` is ignored; Playwright output/report/snapshots resolve there; zero stray artifacts | green |
| Live build contains exactly two public `index.html` files and no draft output | green |
| `02-REVIEW.md` is clean after the future-update fix | green |
| `02-UI-REVIEW.md` is 24/24 with no remaining in-scope fix | green |
| `02-SECURITY.md` is secured: 11/11 threats closed, 0 open | green |
| Implementation files modified by this audit | none |
| Genuine new automated gap | none |

## Runtime Advisory

### Non-blocking — bare PATH selects an older host runtime

Bare PATH currently resolves to Node `v24.8.0` and npm `11.12.1`; do not use those binaries for the exact project gate. Select Node `v24.19.0` / npm `11.17.0` explicitly. The fresh pinned-runtime `npm run verify` already passed at the current source state, so no runtime-freshness gap remains.

No blocker, skipped requirement, flaky test, implementation bug, or unverified Phase 2 behavior was found.

## Sign-Off

- [x] All 13 requirements map to behavioral automation and, where necessary, retained manual evidence.
- [x] Every automated test was executed in this audit.
- [x] Native tests, diagnostics, build, and browser suite are green.
- [x] Exactly two public routes build and the draft is absent.
- [x] Manual-only Chrome gates are evidenced rather than simulated.
- [x] Browser artifacts stay exclusively under ignored `.artifacts/`.
- [x] No implementation file was modified and no new test was warranted.

**Approval:** Phase 2 Nyquist validation complete. The exact-runtime composite gate is fresh and green; the bare-PATH selection note is advisory only.
