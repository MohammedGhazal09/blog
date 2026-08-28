---
phase: 06
slug: production-launch-verification
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-28
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

| Task ID  | Plan  | Wave | Requirement      | Threat Ref       | Secure behavior                                                                                                                                                                       | Test type                           | Automated command    | File exists                                                                          | Status     |
| -------- | ----- | ---- | ---------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------- | ------------------------------------------------------------------------------------ | ---------- |
| 06-W0-01 | 06-01 | 0    | QUAL-05, QUAL-06 | T-06-01          | Exact public HTTPS origin is rejected before filesystem, browser, or network I/O for ports, normalization variants, credentials, local/reserved hosts, paths, queries, and fragments. | Native boundary matrix              | focused Node command | ❌ tests/production-verification.test.ts plus strengthened tests/site-origin.test.ts | ⬜ pending |
| 06-W0-02 | 06-01 | 0    | QUAL-06          | T-06-02, T-06-03 | Controlled crawl fails for redirects, malformed/oversized/out-of-origin discovery data, broken links, canonical/metadata drift, draft leakage, and incorrect 404 behavior.            | Controlled integration/error matrix | focused Node command | ❌ tests/production-verification.test.ts                                             | ⬜ pending |
| 06-W0-03 | 06-02 | 0    | QUAL-05          | T-06-04, T-06-05 | Five-role sampling records three raw cold runs plus medians, uses current CDP constants and CLS session windows, and fails missing/over-threshold metrics.                            | Controlled browser/performance      | focused Node command | ❌ tests/production-verification.test.ts                                             | ⬜ pending |
| 06-W0-04 | 06-02 | 0    | QUAL-05          | T-06-06          | Every article has zero pre-intent media requests/iframes, stable geometry, matching pointer/keyboard activation, and a permanent blocked-player fallback.                             | Controlled browser/network/geometry | focused Node command | ❌ tests/production-verification.test.ts                                             | ⬜ pending |
| 06-W0-05 | 06-02 | 0    | QUAL-06          | T-06-07          | Every public route plus 404 passes Arabic/RTL, accessibility-name, serious/critical Axe, keyboard, text-spacing, and 320 CSS-pixel reflow checks.                                     | Controlled rendered audit           | focused Node command | ❌ tests/production-verification.test.ts                                             | ⬜ pending |
| 06-W0-06 | 06-02 | 0    | QUAL-05, QUAL-06 | T-06-08          | Controlled scope is runner-derived, raw artifacts stay ignored, and no controlled result can promote final-origin, field, native-zoom, or provider rows.                              | Native evidence contract            | npm test             | ❌ runner report and 06-PRODUCTION-EVIDENCE.md assertions                            | ⬜ pending |

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

- [ ] Strengthen tests/site-origin.test.ts with exact-origin rejection cases before changing the shared validator.
- [ ] Create tests/production-verification.test.ts with a visibly synthetic controlled fixture and failure matrix covering both phase requirements.
- [ ] Create the importable/CLI scripts/verify-production.mjs runner using existing Node, Playwright, and Axe dependencies.
- [ ] Register the controlled test in serialized npm test and keep verify:production outside ordinary verification.
- [ ] Add structural assertions for 06-PRODUCTION-EVIDENCE.md so controlled output cannot promote external rows.
- [ ] Reuse existing test infrastructure; install no framework or package.

## Manual-Only Verifications

| Behavior                                                                                                                             | Requirement                   | Why manual/external                                                                                              | Passing evidence                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Owner confirms the exact final public HTTPS origin and the intended deployment responds there.                                       | QUAL-05, QUAL-06              | Final origin and deployment are owner/provider facts unavailable in repository context.                          | Dated reachable origin plus inspected report whose scope is final-origin and transport is network.              |
| Final-origin crawl, Arabic/RTL/a11y/reflow, LCP/CLS, and pre-intent media results are reviewed and promoted to the committed ledger. | QUAL-05, QUAL-06              | The repository can build the runner, but only the real deployment can supply qualifying production observations. | All automated production gates pass in one dated raw report and the reviewer records its ignored artifact path. |
| Native browser-chrome 200% zoom preserves content and controls.                                                                      | QUAL-05, QUAL-06              | Viewport/device emulation cannot prove the actual browser zoom state.                                            | Human check on representative final-origin pages with no clipping, loss, overlap, or two-dimensional scrolling. |
| Qualifying field INP/CrUX or Search Console Core Web Vitals data exists.                                                             | QUAL-05                       | A scripted lab click is not field INP, and a new property may have no field data yet.                            | Dated field-source evidence, or an explicit PENDING row when insufficient data exists.                          |
| Cloudflare/DNS/TLS, Search Console, Plausible pageview, and Plausible outbound-link facts inherited from Phase 5 are genuine.        | External Phase 5 requirements | These require owner accounts/provider state and are not Phase 6 runner results.                                  | Phase 5 owner evidence closes each row independently; otherwise they remain pending.                            |

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

## Validation Sign-Off

- [ ] Every planned repository task has a runnable automated verification command.
- [ ] No three consecutive implementation tasks lack an automated check.
- [ ] Wave 0 covers every missing local assertion identified by research.
- [ ] Exact pinned npm test, npm run check, and npm run test:browser pass.
- [ ] Controlled verifier happy path and failure matrix pass with no production promotion.
- [ ] Browser artifacts remain under ignored .artifacts/phase-06/**.
- [ ] Production, field, native-zoom, and provider facts remain pending without direct evidence.
- [ ] wave_0_complete: true is set only after every repository-controlled validation artifact exists and passes.
- [ ] nyquist_compliant: true is set only when all automated and required final-origin/manual evidence exists; otherwise it remains false.

**Approval:** pending
