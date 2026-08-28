---
phase: 05
slug: deployment-and-measurement
status: partial
nyquist_compliant: false
wave_0_complete: true
created: 2026-08-28
audited: 2026-08-28
automated_gaps: 0
manual_only_checks: 8
requirements: [SEO-06, MEAS-01, MEAS-02]
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for deployment readiness, privacy-conscious measurement, and evidence separation.

## Test Infrastructure

| Property                      | Value                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Runtime**                   | Node `v24.19.0`, npm `11.17.0`                                                                              |
| **Native framework**          | Node built-in `node:test` through the explicit `npm test` file list                                         |
| **Browser framework**         | Playwright `1.62.1` plus Axe `4.13.0`                                                                       |
| **Config file**               | `playwright.config.ts`                                                                                      |
| **Quick run command**         | `npm run check` plus the most focused affected Node test                                                    |
| **Full suite command**        | `npm run verify`                                                                                            |
| **Controlled launch command** | `npm run launch:ready` with process-local `SITE_ORIGIN` and a clearly fake validated `PLAUSIBLE_SCRIPT_SRC` |
| **Estimated runtime**         | About 90 seconds for the full local gate                                                                    |
| **Artifact root**             | Ignored `.artifacts/**` only                                                                                |

## Sampling Rate

- **After every task commit:** Run `npm run check` and the most focused affected Node test.
- **After every plan wave:** Run `npm test && npm run check && npm run test:browser`.
- **Before phase verification:** Run `npm run verify`, the controlled launch assertions, the security scan, and an ordinary-build restoration check.
- **Max local feedback latency:** 120 seconds.
- **External evidence:** Inspect real provider state only; no fixture or interception may change an external row to `PASS`.

## Per-Task Verification Map

| Task ID  | Plan  | Wave | Requirement              | Threat Ref       | Secure behavior                                                                                                                                                                                                                                     | Test type                                                     | Automated command                                                                            | File exists                               | Status                                                         |
| -------- | ----- | ---- | ------------------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| 05-01-01 | 05-01 | 1    | MEAS-01, MEAS-02         | T-05-01–T-05-06  | The executable contract rejects unsafe/missing loader values, legacy/custom tracking, reader identifiers, player-event claims, and ordinary-build analytics; it requires exactly one controlled direct-link attempt and none for player activation. | Native contract + isolated browser seam                       | Focused `content-contract.test.ts` command; focused `deployment-measurement.test.ts` command | ✅ both files                             | ✅ green locally; provider receipt remains manual-only         |
| 05-01-02 | 05-01 | 1    | MEAS-01, MEAS-02         | T-05-01–T-05-06  | Launch mode emits one validated deferred loader per document without body changes; blocking the loader leaves Arabic/RTL content, focus, player, and direct navigation usable; cleanup restores ordinary output.                                    | Build/output integration + browser behavior                   | Same two focused commands; `npm run check`                                                   | ✅ both files                             | ✅ green locally; real Plausible reporting remains manual-only |
| 05-02-01 | 05-02 | 2    | SEO-06, MEAS-01, MEAS-02 | T-05-02, T-05-07 | Arabic operations/evidence contracts reject fabricated external PASS states, invented domains/tokens, `.env` instructions, custom trackers, and claims that a link click is a video view.                                                           | Native documentation/evidence contract                        | Focused `content-contract.test.ts` command                                                   | ✅ `tests/content-contract.test.ts`       | ✅ green locally; all provider rows remain `PENDING`           |
| 05-02-02 | 05-02 | 2    | SEO-06, MEAS-01, MEAS-02 | T-05-01–T-05-07  | Controlled launch proves repository readiness only, preserves canonical/sitemap/robots consistency, contains no real credentials, and restores the ordinary local build without promoting external evidence.                                        | Native build/output integration + evidence-state verification | Focused `content-contract.test.ts`; focused deployment test; `npm run check`                 | ✅ both files and `05-LAUNCH-EVIDENCE.md` | ✅ green locally; owner/provider outcomes remain `PENDING`     |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠ flaky_

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

## Manual-Only Verifications — All Remain `PENDING`

| Behavior                                                                                                                 | Requirement              | Why manual                                                                                 | Passing evidence                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Cloudflare Pages production project and production deployment match the documented branch/runtime/build/output settings. | SEO-06                   | Requires the owner-controlled Pages project and deployment identity.                       | `PENDING` — provider configuration, production deployment ID/commit, and dated observation.              |
| Final domain DNS and TLS are active.                                                                                     | SEO-06                   | Localhost and controlled origins cannot prove domain ownership, DNS, or certificate state. | `PENDING` — owner DNS/Pages state plus a reachable final HTTPS response.                                 |
| Search Console URL-prefix property is owner-verified and its absolute `/sitemap-index.xml` is submitted/read.            | SEO-06                   | Repository output cannot prove Google ownership or service status.                         | `PENDING` — exact property, submission URL, submission/read dates, and reported status.                  |
| The final Plausible property exists, matches the production hostname, and supplies the current official loader source.   | MEAS-01                  | A fake validated `pa-…` fixture proves only input/output wiring.                           | `PENDING` — owner property and Site installation evidence; never commit the real value.                  |
| Plausible receives aggregate pageviews from real production traffic.                                                     | MEAS-01                  | Only the real dashboard after real visits proves ingestion/reporting.                      | `PENDING` — dated aggregate dashboard evidence without reader identities.                                |
| Plausible **Outbound links** is enabled for the final property.                                                          | MEAS-02                  | Source scans and interception cannot inspect the provider toggle.                          | `PENDING` — owner-controlled property setting for `Outbound Link: Click`.                                |
| Plausible reports a real direct YouTube `Outbound Link: Click` with matching `url`.                                      | MEAS-02                  | Local interception proves a project attempt, not provider receipt/reporting.               | `PENDING` — dated dashboard event filtered by the exact YouTube destination; label only as a link click. |
| Real production reachability and traffic are observed.                                                                   | SEO-06, MEAS-01, MEAS-02 | Controlled/local responses cannot prove production availability or use.                    | `PENDING` — dated final-origin responses and owner-authorized production evidence.                       |

## Evidence Integrity Rules

- Local source, tests, builds, intercepted requests, and controlled hostnames prove readiness only.
- Real Cloudflare, DNS/TLS, Plausible, and Search Console rows begin `PENDING` and stay there until owner-controlled evidence exists.
- Never read or create `.env` files.
- Never commit the real `PLAUSIBLE_SCRIPT_SRC`, a Search Console verification artifact, or provider credentials.
- Never equate a YouTube link click with playback, viewing, watch time, or completion.

## Requirement Coverage Result

| Requirement | Automated repository coverage                                                                                                             | Live-service coverage                                                                      | Final validation state |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------- |
| SEO-06      | Runbook/evidence-state contract, safe origin output, sitemap/robots generation, and fabricated-pass rejection are green.                  | Final deployment, DNS/TLS, Search Console ownership, and sitemap submission are `PENDING`. | PARTIAL                |
| MEAS-01     | Launch-only aggregate loader, ordinary omission, failure independence, no-reader-identifier scan, and controlled pageview seam are green. | Real aggregate pageviews in the owner Plausible property are `PENDING`.                    | PARTIAL                |
| MEAS-02     | Exactly one controlled direct-link event attempt with matching `url`, zero player attempts, and no project tracking path are green.       | Real `Outbound Link: Click` reporting in the owner property is `PENDING`.                  | PARTIAL                |

No missing automated repository test was found, so no Nyquist test file was added during this audit. `nyquist_compliant` remains `false` because the three Phase 5 requirements include owner-controlled live-service outcomes that cannot truthfully pass from repository automation.

## Validation Audit 2026-08-28

### Fresh focused commands

Run after prepending the pinned runtime root to `PATH` and setting `npm_execpath`/`npm_node_execpath` to its npm CLI and Node executable:

```powershell
node --test --test-concurrency=1 --test-reporter=tap --test-name-pattern='Arabic owner runbook|launch evidence separates|deployment footprint|accepts only the exact current Plausible|launch readiness wires' tests/content-contract.test.ts
node --test --test-concurrency=1 --test-reporter=tap tests/deployment-measurement.test.ts
npm run check
```

Fresh result: `5/5` focused contract tests green, `1/1` controlled browser-wiring test green, and Astro diagnostics green for 22 files. Both behavioral commands restore ordinary local output in their cleanup paths.

| Metric                           | Count |
| -------------------------------- | ----: |
| Automated gaps found             |     0 |
| Automated gaps resolved          |     0 |
| Executed task map entries green  |     4 |
| Fresh focused native tests green |     6 |
| Manual-only checks pending       |     8 |

## Validation Sign-Off

- [x] Every planned repository task has a runnable automated verification command.
- [x] No three consecutive implementation tasks lack an automated check.
- [x] Wave 0 covers every local assertion identified by the draft strategy.
- [x] Fresh pinned Phase 5 evidence passed 5 focused contract tests and 1 isolated browser-wiring test; 0 failed or skipped.
- [x] Fresh `npm run check` inspected 22 files with 0 errors, warnings, or hints.
- [x] Prior complete browser evidence remains 49/49 with 45/45 headed visual/state pairs; the fresh isolated browser seam re-proved analytics failure independence and direct/player event separation.
- [x] Browser artifacts remain under ignored `.artifacts/**`.
- [x] External facts remain explicitly pending without fabricated evidence.
- [x] `wave_0_complete: true` records local completion.
- [x] `nyquist_compliant: false` records unresolved manual live-service outcomes.

**Approval:** partial — automated repository coverage is complete; eight explicitly separated owner-controlled checks remain pending.
