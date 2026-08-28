---
phase: 06
slug: production-launch-verification
status: partial
nyquist_compliant: false
wave_0_complete: true
created: 2026-08-28
audited: 2026-08-28
automated_gaps: 0
requirements: [QUAL-05, QUAL-06]
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for the production verifier, controlled runner proof, and authority-bounded final-origin evidence.

## Test Infrastructure

| Property                | Value                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Runtime**             | Node v24.19.0, npm 11.17.0                                                                                                  |
| **Native framework**    | Node built-in node:test through the explicit serialized npm test file list                                                  |
| **Browser framework**   | Installed Playwright 1.62.1, bundled Chromium, and Axe 4.13.0                                                               |
| **Ordinary config**     | playwright.config.ts remains unchanged; production verification is an isolated opt-in runner                                |
| **Quick run command**   | node --test --test-concurrency=1 --test-reporter=tap tests/site-origin.test.ts tests/production-verification.test.ts        |
| **Full local suite**    | npm run verify                                                                                                              |
| **Real-origin command** | Process-local SITE_ORIGIN followed by npm run verify:production; never an environment file                                  |
| **Estimated runtime**   | Focused tests under 60 seconds; full local gate about 120 seconds; real-origin audit depends on 15 cold performance samples |
| **Artifact root**       | Ignored .artifacts/phase-06/** only                                                                                         |

## Sampling Rate

- **After every task commit:** Run the most focused affected Node test plus npm run check when Astro/TypeScript/build wiring changes.
- **After every plan wave:** Run npm test && npm run check && npm run test:browser.
- **Before Phase 6 verification:** Run pinned npm run verify, the controlled production-verifier matrix, evidence-ledger structural checks, and an ordinary-build/output inspection.
- **Real-origin evidence:** Run only with the exact owner-approved final HTTPS origin. A controlled fixture, mapped host, preview, or interception cannot satisfy a production row.
- **Max local feedback latency:** 180 seconds.

## Per-Task Verification Map

| Task ID  | Plan  | Wave | Requirement      | Threat Ref               | Secure behavior                                                                                                                                                                          | Test type                                          | Automated command                                                     | File exists                                | Status                                                 |
| -------- | ----- | ---- | ---------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| 06-01-01 | 06-01 | 1    | QUAL-05, QUAL-06 | T-06-01–T-06-03          | Exact/fail-before-I/O origin and DNS boundaries plus whole static crawl/error behavior are specified against production APIs.                                                            | Native boundary + controlled integration matrix    | `site-origin.test.ts`; focused/full `production-verification.test.ts` | ✅ both files                              | ✅ green locally; requirements remain `PENDING`        |
| 06-01-02 | 06-01 | 1    | QUAL-05, QUAL-06 | T-06-01–T-06-03, T-06-08 | Isolated verifier enforces exact public origin, bounded same-origin crawling, redirects/errors, sanitized reports, controlled/final evidence scopes, and artifact containment.           | Native + controlled browser integration            | focused/full production-verifier commands                             | ✅ runner and both test files              | ✅ green locally; final origin remains manual-only     |
| 06-02-01 | 06-02 | 2    | QUAL-05, QUAL-06 | T-06-04–T-06-07          | Five-role performance/CLS, every-article media, and every-route Arabic/RTL/a11y/reflow contracts are executable and adversarial.                                                         | Controlled browser contract                        | focused performance/media/Arabic patterns                             | ✅ `tests/production-verification.test.ts` | ✅ green locally                                       |
| 06-02-02 | 06-02 | 2    | QUAL-05, QUAL-06 | T-06-04–T-06-07          | Runner records three cold samples for five roles, correct CLS medians/windows, all media intent/fallback/geometry paths, and complete rendered-route audits with timeout/error handling. | Controlled browser/performance/network integration | focused/full production-verifier commands                             | ✅ runner and test file                    | ✅ green locally; lab fixtures do not close production |
| 06-02-03 | 06-02 | 2    | QUAL-05, QUAL-06 | T-06-08                  | README, ignored artifact root, report sanitization, evidence scope, requirement `PENDING` state, and reviewer-ledger immutability are enforced.                                          | Native evidence/documentation contract             | focused evidence/ledger/README/artifact patterns; `npm test`          | ✅ README, ledger, runner, test file       | ✅ green locally; reviewer closure remains manual      |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠ flaky_

## Deterministic Assertions

1. productionSiteOrigin() accepts only the exact serialized port-free public HTTPS origin and rejects every unsafe or normalization variant before any I/O.
2. Ordinary npm run verify never imports or invokes the live-origin command and never requires SITE_ORIGIN.
3. Static requests use manual redirect handling, bounded bodies, strict same-origin URL checks, expected discovery/content shapes, and no external-link crawl.
4. Sitemap membership, same-origin link closure, one self-canonical, unique Arabic metadata, draft exclusion, and true Arabic 404 behavior are independently checked.
5. Five deterministic route roles receive three fresh-context cold runs; every raw LCP/CLS value and the median are preserved, and missing metrics fail.
6. The current CDP network/CPU constants and maximum-session-window CLS algorithm are asserted rather than named vaguely.
7. Every public article produces zero pre-interaction media-host requests and iframes, one matching intent-created no-cookie iframe, stable reserved geometry, and a usable direct fallback when media is blocked.
8. Every public route plus 404 receives rendered Arabic/RTL, accessibility-name, Axe, keyboard, text-spacing, and 320 CSS-pixel reflow checks.
9. Controlled reports always state controlled plus intercepted-fixture; final-origin reports state final-origin plus network.
10. Generated reports contain no cookies, headers, bodies, credentials, tokens, environment-file data, or caller-provided artifact path and remain below .artifacts/phase-06/.
11. The committed ledger is reviewer-maintained and cannot be rewritten or promoted by the runner.

## Wave 0 Requirements

- [x] Strengthened `tests/site-origin.test.ts` with exact-origin and resolved-address rejection cases.
- [x] Created `tests/production-verification.test.ts` with a visibly synthetic controlled fixture and adversarial matrix for both requirements.
- [x] Created the importable/CLI `scripts/verify-production.mjs` runner using existing Node, Playwright, and Axe dependencies.
- [x] Registered the controlled test in serialized `npm test` while keeping `verify:production` outside ordinary verification.
- [x] Added structural assertions for `06-PRODUCTION-EVIDENCE.md`; controlled output cannot promote or mutate external rows.
- [x] Reused existing infrastructure and added no framework or package.

## Manual/External Verifications — All Remain `PENDING`

| Behavior                                                                                                                             | Requirement      | Why manual/external                                                                                              | Passing evidence                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Owner confirms the exact final public HTTPS origin and the intended deployment responds there.                                       | QUAL-05, QUAL-06 | Final origin and deployment are owner/provider facts unavailable in repository context.                          | `PENDING` — dated reachable origin plus inspected report whose scope is final-origin and transport is network.              |
| Final-origin crawl, Arabic/RTL/a11y/reflow, LCP/CLS, and pre-intent media results are reviewed and promoted to the committed ledger. | QUAL-05, QUAL-06 | The repository can build the runner, but only the real deployment can supply qualifying production observations. | `PENDING` — all automated production gates pass in one dated raw report and the reviewer records its ignored artifact path. |
| Native browser-chrome 200% zoom preserves content and controls.                                                                      | QUAL-05, QUAL-06 | Viewport/device emulation cannot prove the actual browser zoom state.                                            | `PENDING` — human check on representative final-origin pages with no clipping, loss, overlap, or two-dimensional scrolling. |
| Qualifying field INP/CrUX or Search Console Core Web Vitals data exists.                                                             | QUAL-05          | A scripted lab click is not field INP, and a new property may have no field data yet.                            | `PENDING` — dated field-source evidence; lab clicks and synthetic metrics do not qualify.                                   |
| Cloudflare production deployment, final DNS, and TLS are genuine and active.                                                         | QUAL-05, QUAL-06 | Provider/deployment authority is outside the verifier and controlled fixtures.                                   | `PENDING` — owner-controlled deployment identity, DNS/TLS state, and exact-origin response.                                 |
| Search Console ownership, sitemap state, and production Core Web Vitals are genuine.                                                 | QUAL-05, QUAL-06 | Google account/property and field data cannot be inferred locally.                                               | `PENDING` — dated owner property, sitemap, index/CWV evidence.                                                              |
| Plausible property, aggregate pageviews, Outbound-links setting, and real YouTube event reporting are genuine.                       | QUAL-05, QUAL-06 | Interception and synthetic clicks prove project wiring only, never provider receipt/reporting.                   | `PENDING` — dated owner dashboard/settings evidence; a link click is not playback or a view.                                |
| A reviewer closes QUAL-05/QUAL-06 only after inspecting all qualifying final-origin, manual, field, and provider evidence.           | QUAL-05, QUAL-06 | The runner cannot self-promote requirement state or mutate the committed ledger.                                 | `PENDING` — reviewer-authored ledger update after all independent authorities are satisfied.                                |

## Evidence Integrity Rules

- A controlled fixture proves runner behavior only; it cannot pass QUAL-05, QUAL-06, deployment, provider, indexing, field, or native-zoom rows.
- Final-origin automated rows require one exact public HTTPS origin and a report produced without interception, TLS bypass, proxy, credentials, storage state, or custom headers.
- Field INP, native 200% zoom, and Phase 5 provider/account rows remain separate from production lab/crawl evidence.
- Never read or create environment files.
- Never commit generated JSON, HTML reports, traces, screenshots, response bodies, cookies, headers, tokens, or a guessed production origin.
- Never equate iframe creation, a YouTube request, or a direct-link click with successful video playback or a view.

## Requirement Coverage Target

| Requirement | Automated repository coverage                                                                                                                                        | Final-origin coverage                                                       | Planned validation state                               |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------ |
| QUAL-05     | Exact origin gate, controlled five-role performance matrix, correct LCP/CLS aggregation, all-article media intent/geometry/fallback, and evidence-scope enforcement. | Final-origin report plus native zoom and field-INP evidence when available. | PARTIAL until qualifying final-origin evidence exists. |
| QUAL-06     | Controlled sitemap/robots/route/link/canonical/metadata/draft/404/Arabic/RTL/a11y/reflow matrix and evidence-scope enforcement.                                      | Final-origin whole-site report and reviewer promotion.                      | PARTIAL until qualifying final-origin evidence exists. |

## Fresh Validation Audit — 2026-08-28

Pinned Node `v24.19.0` and npm `11.17.0` commands:

```powershell
node --test --test-concurrency=1 --test-reporter=tap tests/site-origin.test.ts
node --test --test-concurrency=1 --test-reporter=tap --test-name-pattern='exact controlled crawl|controlled performance profile|controlled media audit covers|controlled Arabic RTL|invalid or absent origin|report serialization|source wiring|evidence ledger|Arabic README|ordinary verification|controlled report generation' tests/production-verification.test.ts
npm run check
```

Results: origin/DNS matrix `58/58` green; focused verifier matrix `12/12` green; Astro diagnostics checked 22 files with 0 errors, warnings, or hints. No repository-controlled coverage gap was found, so no test file was added. Existing authoritative complete evidence remains `263/263` native, `49/49` ordinary browser, and `11/11` threats; none of those results completes QUAL-05 or QUAL-06.

## Validation Sign-Off

- [x] Every planned repository task has a runnable automated verification command.
- [x] No three consecutive implementation tasks lack an automated check.
- [x] Wave 0 covers every missing local assertion identified by research.
- [x] Exact pinned focused tests and `npm run check` passed freshly; authoritative full native/browser evidence remains green.
- [x] Controlled verifier happy path and failure matrix pass with no production promotion.
- [x] Browser artifacts remain under ignored `.artifacts/phase-06/**`.
- [x] Production, field, native-zoom, provider, and reviewer facts remain `PENDING` without direct evidence.
- [x] `wave_0_complete: true` records complete repository-controlled validation artifacts.
- [x] `nyquist_compliant: false` truthfully records missing final-origin/manual/external evidence.

**Approval:** partial — repository-controlled validation is complete; QUAL-05 and QUAL-06 remain `PENDING` until all independent production authorities are reviewed.
