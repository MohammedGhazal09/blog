---
phase: 05
slug: deployment-and-measurement
status: partial
nyquist_compliant: false
wave_0_complete: true
created: 2026-08-28
audited: 2026-08-28
automated_gaps: 0
manual_only_checks: 4
requirements: [SEO-06, MEAS-01, MEAS-02]
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for deployment readiness, privacy-conscious measurement, and evidence separation.

## Test Infrastructure

| Property | Value |
| --- | --- |
| **Runtime** | Node `v24.19.0`, npm `11.17.0` |
| **Native framework** | Node built-in `node:test` through the explicit `npm test` file list |
| **Browser framework** | Playwright `1.62.1` plus Axe `4.13.0` |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npm run check` plus the most focused affected Node test |
| **Full suite command** | `npm run verify` |
| **Controlled launch command** | `npm run launch:ready` with process-local `SITE_ORIGIN` and a clearly fake validated `PLAUSIBLE_SCRIPT_SRC` |
| **Estimated runtime** | About 90 seconds for the full local gate |
| **Artifact root** | Ignored `.artifacts/**` only |

## Sampling Rate

- **After every task commit:** Run `npm run check` and the most focused affected Node test.
- **After every plan wave:** Run `npm test && npm run check && npm run test:browser`.
- **Before phase verification:** Run `npm run verify`, the controlled launch assertions, the security scan, and an ordinary-build restoration check.
- **Max local feedback latency:** 120 seconds.
- **External evidence:** Inspect real provider state only; no fixture or interception may change an external row to `PASS`.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure behavior | Test type | Automated command | File exists | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 05-W0-01 | 05-02 | 0 | SEO-06 | T-05-07 | Local fixtures cannot mark Search Console ownership or sitemap submission complete. | Native evidence contract | `npm test` | ✅ `tests/content-contract.test.ts` | ✅ green locally; live property remains manual-only |
| 05-W0-02 | 05-01 | 0 | MEAS-01 | T-05-01, T-05-03 | Ordinary output has no analytics; launch output accepts exactly one current official Plausible asset URL per document. | Native build/output | `npm test` | ✅ `tests/content-contract.test.ts` | ✅ green |
| 05-W0-03 | 05-01 | 0 | MEAS-01 | T-05-05, T-05-06 | Analytics success, failure, or blocking cannot alter Arabic/RTL content, focus, layout, or navigation. | Browser invariance | `npm run test:browser` plus headed Phase 5 QA | ✅ existing browser suites and ignored evidence | ✅ green |
| 05-W0-04 | 05-01 | 0 | MEAS-01, MEAS-02 | T-05-04 | One direct YouTube activation creates at most one automatic outbound attempt; player activation creates none. | Isolated wiring test | `npm test` | ✅ `tests/deployment-measurement.test.ts` | ✅ green |
| 05-W0-05 | 05-02 | 0 | MEAS-01, MEAS-02 | T-05-02 | Source and output contain no credential, verification token, custom tracker, session replay, fingerprinting, cookie identifier, tag manager, or real production `pa-…` value. | Source/output scan | `npm test` | ✅ `tests/content-contract.test.ts` | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠ flaky*

## Deterministic Assertions

1. Every launch HTML document, including `404.html`, contains exactly one validated `https://plausible.io/js/pa-….js` loader; every ordinary HTML document contains zero Plausible markup.
2. `import.meta.env.MODE === "launch-readiness"` is the only analytics inclusion gate, while `Astro.site` remains the only canonical origin authority.
3. Missing or unsafe `SITE_ORIGIN` and `PLAUSIBLE_SCRIPT_SRC` values fail closed; the clearly fake test fixture is accepted without being presented as a real account asset.
4. Ordinary and launch `<body>` structure, text, landmarks, focus order, link topology, Arabic semantics, and layout are identical.
5. `YouTubePlayer.astro` remains free of analytics listeners, attributes, custom event calls, and navigation interception.
6. The isolated browser seam labels intercepted requests as project-wiring evidence only and never as Plausible receipt, reporting, pageviews, or video views.
7. Analytics request failure leaves the permanent same-tab YouTube anchor and static content fully usable.
8. A `finally` path restores an ordinary build and proves local canonical identity plus zero analytics after controlled launch tests.

## Wave 0 Requirements

- [x] Extended `tests/content-contract.test.ts` with launch-only inclusion, ordinary omission, exact source-gate, README/evidence-contract, prohibited-tool, secret-pattern, and restoration assertions.
- [x] Added `tests/deployment-measurement.test.ts` for the isolated current-snippet wiring seam; browser artifacts remain under ignored `.artifacts/`.
- [x] Added the new test file to the explicit serialized `npm test` file list in `package.json`.
- [x] Reused the installed Node, Astro, Playwright, and Axe infrastructure; no test framework or analytics dependency was added.

## Manual-Only Verifications

| Behavior | Requirement | Why manual | Passing evidence |
| --- | --- | --- | --- |
| Cloudflare production project, deployment, DNS, and TLS are real and correctly configured. | SEO-06 | Requires owner-controlled provider state and final domain ownership. | `PENDING` — dated provider configuration plus a reachable final HTTPS response matching the canonical origin. |
| Search Console property is verified and the absolute canonical sitemap is submitted. | SEO-06 | Ownership and submission status cannot be proven from repository fixtures. | `PENDING` — exact URL-prefix property, `/sitemap-index.xml` submission, last-read date, and service status. |
| Plausible property receives aggregate production pageviews. | MEAS-01 | Only the real dashboard can prove ingestion and reporting. | `PENDING` — real production property and dated aggregate pageview evidence. |
| Plausible **Outbound links** is enabled and reports the YouTube destination. | MEAS-02 | A local interception proves only project wiring. | `PENDING` — exact `Outbound Link: Click` event filtered by property `url`; described only as a link click. |

## Evidence Integrity Rules

- Local source, tests, builds, intercepted requests, and controlled hostnames prove readiness only.
- Real Cloudflare, DNS/TLS, Plausible, and Search Console rows begin `PENDING` and stay there until owner-controlled evidence exists.
- Never read or create `.env` files.
- Never commit the real `PLAUSIBLE_SCRIPT_SRC`, a Search Console verification artifact, or provider credentials.
- Never equate a YouTube link click with playback, viewing, watch time, or completion.

## Requirement Coverage Result

| Requirement | Automated repository coverage | Live-service coverage | Final validation state |
| --- | --- | --- | --- |
| SEO-06 | Runbook/evidence-state contract, safe origin output, sitemap/robots generation, and fabricated-pass rejection are green. | Final deployment, DNS/TLS, Search Console ownership, and sitemap submission are `PENDING`. | PARTIAL |
| MEAS-01 | Launch-only aggregate loader, ordinary omission, failure independence, no-reader-identifier scan, and controlled pageview seam are green. | Real aggregate pageviews in the owner Plausible property are `PENDING`. | PARTIAL |
| MEAS-02 | Exactly one controlled direct-link event attempt with matching `url`, zero player attempts, and no project tracking path are green. | Real `Outbound Link: Click` reporting in the owner property is `PENDING`. | PARTIAL |

No missing automated repository test was found, so no Nyquist test file was added during this audit. `nyquist_compliant` remains `false` because the three Phase 5 requirements include owner-controlled live-service outcomes that cannot truthfully pass from repository automation.

## Validation Audit 2026-08-28

| Metric | Count |
| --- | ---: |
| Automated gaps found | 0 |
| Automated gaps resolved | 0 |
| Local map entries green | 5 |
| Manual-only checks pending | 4 |

## Validation Sign-Off

- [x] Every planned repository task has a runnable automated verification command.
- [x] No three consecutive implementation tasks lack an automated check.
- [x] Wave 0 covers every local assertion identified by the draft strategy.
- [x] Pinned `npm test` passed `133/133` after the code-review fix.
- [x] The latest complete browser gate passed `49/49`; headed evidence records `45/45` identical visual/state pairs.
- [x] Browser artifacts remain under ignored `.artifacts/**`.
- [x] External facts remain explicitly pending without fabricated evidence.
- [x] `wave_0_complete: true` records local completion.
- [x] `nyquist_compliant: false` records unresolved manual live-service outcomes.

**Approval:** partial — automated repository coverage is complete; four owner-controlled checks remain pending.
