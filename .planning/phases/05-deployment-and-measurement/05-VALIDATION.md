---
phase: 05
slug: deployment-and-measurement
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-28
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
| 05-W0-01 | TBD | 0 | SEO-06 | T-05-07 | Local fixtures cannot mark Search Console ownership or sitemap submission complete. | Native contract | `npm test` | ❌ extend `tests/content-contract.test.ts` | ⬜ pending |
| 05-W0-02 | TBD | 0 | MEAS-01 | T-05-01, T-05-03 | Ordinary output has no analytics; launch output accepts exactly one current official Plausible asset URL per document. | Native build/output | `npm test` | ❌ extend `tests/content-contract.test.ts` | ⬜ pending |
| 05-W0-03 | TBD | 0 | MEAS-01 | T-05-05, T-05-06 | Analytics success, failure, or blocking cannot alter Arabic/RTL content, focus, layout, or navigation. | Browser invariance | `npm run test:browser` | ❌ focused Phase 5 browser coverage | ⬜ pending |
| 05-W0-04 | TBD | 0 | MEAS-01, MEAS-02 | T-05-04 | One direct YouTube activation creates at most one automatic outbound attempt; player activation creates none. | Isolated wiring test | `node --test --test-reporter=tap tests/deployment-measurement.test.ts` | ❌ create | ⬜ pending |
| 05-W0-05 | TBD | 0 | MEAS-01, MEAS-02 | T-05-02 | Source and output contain no credential, verification token, custom tracker, session replay, fingerprinting, cookie identifier, tag manager, or real production `pa-…` value. | Source/output scan | `npm test` | ❌ extend `tests/content-contract.test.ts` | ⬜ pending |

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

- [ ] Extend `tests/content-contract.test.ts` with launch-only inclusion, ordinary omission, exact source-gate, README/evidence-contract, prohibited-tool, secret-pattern, and restoration assertions.
- [ ] Add `tests/deployment-measurement.test.ts` for the isolated current-snippet wiring seam; write artifacts only under `.artifacts/` if a failure needs them.
- [ ] Add the new test file to the explicit `npm test` file list in `package.json`.
- [ ] Reuse the installed Node, Astro, Playwright, and Axe infrastructure; add no test framework or analytics dependency.

## Manual-Only Verifications

| Behavior | Requirement | Why manual | Passing evidence |
| --- | --- | --- | --- |
| Cloudflare production project, deployment, DNS, and TLS are real and correctly configured. | SEO-06 | Requires owner-controlled provider state and final domain ownership. | Dated provider configuration plus a reachable final HTTPS response matching the canonical origin. |
| Search Console property is verified and the absolute canonical sitemap is submitted. | SEO-06 | Ownership and submission status cannot be proven from repository fixtures. | Exact URL-prefix property, `/sitemap-index.xml` submission, last-read date, and service status. |
| Plausible property receives aggregate production pageviews. | MEAS-01 | Only the real dashboard can prove ingestion and reporting. | Real production property and dated aggregate pageview evidence. |
| Plausible **Outbound links** is enabled and reports the YouTube destination. | MEAS-02 | A local interception proves only project wiring. | Exact `Outbound Link: Click` event filtered by property `url`; described only as a link click. |

## Evidence Integrity Rules

- Local source, tests, builds, intercepted requests, and controlled hostnames prove readiness only.
- Real Cloudflare, DNS/TLS, Plausible, and Search Console rows begin `PENDING` and stay there until owner-controlled evidence exists.
- Never read or create `.env` files.
- Never commit the real `PLAUSIBLE_SCRIPT_SRC`, a Search Console verification artifact, or provider credentials.
- Never equate a YouTube link click with playback, viewing, watch time, or completion.

## Validation Sign-Off

- [ ] Every planned task has a runnable automated verification command.
- [ ] No three consecutive implementation tasks lack an automated check.
- [ ] Wave 0 covers every currently missing local assertion.
- [ ] Full ordinary verification passes before and after controlled launch verification.
- [ ] Browser artifacts remain under ignored `.artifacts/**`.
- [ ] External facts remain explicitly pending unless supported by real owner-controlled evidence.
- [ ] `wave_0_complete: true` and `nyquist_compliant: true` are set only after all local checks pass.

**Approval:** pending implementation and audit.
