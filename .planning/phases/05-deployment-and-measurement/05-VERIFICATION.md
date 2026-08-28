---
phase: 05-deployment-and-measurement
verified: 2026-08-28T04:03:05Z
status: human_needed
score: 10/10 repository must-haves verified
requirements_verified: []
requirements_pending: [SEO-06, MEAS-01, MEAS-02]
overrides_applied: 0
gaps: []
human_verification:
  - test: Canonical production deployment, DNS, and TLS
    expected: The final owner-controlled HTTPS origin is reachable from the intended deployment, matches canonical identity, and has active DNS and TLS.
    why_human: Requires direct Cloudflare Pages, domain, and live-response authority.
  - test: Search Console ownership and sitemap submission
    expected: The exact final HTTPS URL-prefix property is verified and its absolute /sitemap-index.xml URL is submitted with real service status.
    why_human: Requires owner-controlled Google Search Console access.
  - test: Aggregate Plausible production pageviews
    expected: The final property reports aggregate page traffic from the real production origin without per-reader profiling.
    why_human: Only the real Plausible property can prove ingestion and reporting.
  - test: Real outbound YouTube link reporting
    expected: "One production direct-link action appears as Outbound Link: Click with the destination in url, while player activation is not counted."
    why_human: Requires a real production action and owner-dashboard inspection.
---

# Phase 05: Deployment and Measurement Verification Report

**Phase Goal:** As a site owner, I want to operate the canonical production site and measure the intended discovery-to-YouTube journey without identifying individual readers, so that I can confirm the real production and measurement path works as intended.
**Verified:** 2026-08-28T04:03:05Z
**Status:** human_needed
**Re-verification:** No — initial goal-backward verification

## Goal Achievement

### User Flow Coverage

| Step                               | Expected                                                                                          | Evidence                                                                                       | Status             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------ |
| Prepare the release                | Follow one Arabic path using the pinned runtime and exact static launch command                   | `README.md:134-203`; provider-equivalent controlled sequence and final `npm run verify` passed | ✓ VERIFIED locally |
| Open the Arabic site               | Launch output preserves the same Arabic/RTL body and complete static article journey              | `SiteLayout.astro` adds only a head loader; `45/45` screenshot and state pairs match           | ✓ VERIFIED locally |
| Continue to YouTube                | The permanent native CTA remains usable and produces one controlled outbound wiring attempt       | `tests/deployment-measurement.test.ts:121-182`; full browser suite passed `49/49`              | ✓ VERIFIED locally |
| Observe production use             | The real property reports aggregate pageviews and one outbound link event without reader profiles | External Plausible rows in `05-LAUNCH-EVIDENCE.md` remain `PENDING`                            | ? HUMAN            |
| Operate canonical search discovery | The final HTTPS property is reachable, verified in Search Console, and has its sitemap submitted  | Cloudflare, DNS/TLS, Search Console, and sitemap rows remain `PENDING`                         | ? HUMAN            |
| Outcome                            | Confirm the real production and measurement path works as intended                                | Repository readiness is complete; direct provider evidence is not available                    | ? HUMAN            |

### Observable Repository Truths

| #   | Truth                                                                                                                                                                           | Status     | Evidence                                                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Launch readiness accepts only an exact clean current `https://plausible.io/js/pa-*.js` asset and fails closed on unsafe inputs.                                                 | ✓ VERIFIED | `src/lib/measurement.ts:1-23` uses the native URL parser plus exact protocol, authority, normalization, and path checks. The rejection matrix passed within `133/133` native tests.                                                                            |
| 2   | Every launch HTML document gets exactly one deferred loader, while every ordinary build remains analytics-free even with an ambient value.                                      | ✓ VERIFIED | `SiteLayout.astro:24-60` gates one head loader on the exact mode. `tests/content-contract.test.ts:743-915` checks all documents, ordinary omission, launch inclusion, and restoration. Final direct inspection found nine HTML files and zero analytics files. |
| 3   | One permanent direct YouTube action creates exactly one controlled `Outbound Link: Click` attempt with the direct destination, while player activation creates none.            | ✓ VERIFIED | `tests/deployment-measurement.test.ts:121-182` passed; independent source assertions reject a project-owned listener or custom analytics event path. This proves wiring, not vendor receipt.                                                                   |
| 4   | Blocking analytics cannot alter Arabic content, RTL layout, focus, player behavior, or native navigation.                                                                       | ✓ VERIFIED | `tests/deployment-measurement.test.ts:184-236` passes the aborted-loader seam. The Phase 5 headed report records `45/45` identical visual and structural pairs with zero serious/critical Axe findings.                                                        |
| 5   | `Astro.site` remains the sole canonical authority and analytics does not enter `YouTubePlayer.astro`.                                                                           | ✓ VERIFIED | `SiteLayout.astro:16-28` derives canonical identity only from `Astro.site`; `scripts/launch-ready.mjs:6-11` supplies the validated site and exact build mode. Source checks confirm `YouTubePlayer.astro` is analytics-free.                                   |
| 6   | The Arabic owner README provides one exact Cloudflare, Plausible, Search Console, diagnosis, rollback, and post-deploy operating path without inventing a domain or credential. | ✓ VERIFIED | `README.md:134-203` contains the exact branch, preview, runtime, command, output, public-value, provider, event/property, and sitemap contract. The documentation test passes.                                                                                 |
| 7   | The launch ledger separates local readiness from external facts by status, authority, date/value, real-service evidence, and next action.                                       | ✓ VERIFIED | `05-LAUNCH-EVIDENCE.md` has three dated local `PASS` rows and eleven external `PENDING` rows. `tests/content-contract.test.ts:46-187` rejects unsupported external promotion.                                                                                  |
| 8   | Controlled origins, fake assets, source inspection, interception, and localhost artifacts cannot satisfy live Search Console or Plausible outcomes.                             | ✓ VERIFIED | Tests enforce the authority boundary; `05-VALIDATION.md` remains `partial` and `nyquist_compliant: false`; the ledger explicitly keeps `SEO-06` and live measurement evidence pending.                                                                         |
| 9   | The deployable surface remains static, credential-free, and free of custom trackers or new runtime infrastructure.                                                              | ✓ VERIFIED | Source/output scans passed; `package-lock.json` is unchanged from the pre-phase baseline; security closed `8/8` threats and code review is clean.                                                                                                              |
| 10  | The final ordinary build is restored and every prior phase gate still passes.                                                                                                   | ✓ VERIFIED | Fresh pinned `npm run verify` passed `133/133` native tests, Astro with zero diagnostics, and `49/49` browser tests. Schema drift is false; structural drift safely skipped because no `STRUCTURE.md` exists.                                                  |

**Score:** 10/10 repository truths verified

The score covers repository-controlled must-haves only. It does not convert the four owner-controlled outcomes below into passes.

## Required Artifacts — Three-Level Verification

| Artifact                               | Expected                                                                  | L1 Exists | L2 Substantive | L3 Wired | Status / Details                                                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------- | --------: | -------------: | -------: | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/measurement.ts`               | Fail-closed public Plausible script validator                             |         ✓ |              ✓ |        ✓ | 24 lines; exported validator is imported by both launch preflight and the shared layout, with positive and negative tests.               |
| `scripts/launch-ready.mjs`             | Explicit validated launch build boundary                                  |         ✓ |              ✓ |        ✓ | 11 complete lines; validates site and measurement inputs before Astro `launch-readiness` build.                                          |
| `src/layouts/SiteLayout.astro`         | One launch-only non-rendering analytics loader                            |         ✓ |              ✓ |        ✓ | Used by every route family; exact mode gate and deferred head script are covered across all emitted HTML.                                |
| `tests/content-contract.test.ts`       | Validator, output, README, ledger, source-scan, and restoration contracts |         ✓ |              ✓ |        ✓ | 1,043 lines; included in the explicit serialized native test command and passed fresh.                                                   |
| `tests/deployment-measurement.test.ts` | Isolated controlled browser measurement/failure seam                      |         ✓ |              ✓ |        ✓ | 257 lines; registered by `npm test`, uses platform path separation, and restores ordinary output in `finally`.                           |
| `package.json`                         | Pinned runtime and complete runnable verification commands                |         ✓ |              ✓ |        ✓ | Registers the measurement test with concurrency 1 and preserves the existing static build/check/browser commands with no new dependency. |
| `README.md`                            | Arabic launch and provider operations path                                |         ✓ |              ✓ |        ✓ | 203 lines; executable documentation assertions cover Cloudflare, Plausible, Search Console, rollback, and evidence boundaries.           |
| `05-LAUNCH-EVIDENCE.md`                | Authority-bounded launch status matrix                                    |         ✓ |              ✓ |        ✓ | 14 rows; three local passes and eleven external pending facts are parsed and constrained by the native suite.                            |

## Key Link Verification

| From                       | To                                    | Via                                                                                | Status                         | Evidence                                                                                                 |
| -------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `scripts/launch-ready.mjs` | `src/lib/measurement.ts`              | `plausibleScriptSource(process.env.PLAUSIBLE_SCRIPT_SRC)` before build             | ✓ WIRED                        | `scripts/launch-ready.mjs:3-11`; unsafe input stops launch readiness.                                    |
| `scripts/launch-ready.mjs` | Astro canonical identity              | validated `SITE_ORIGIN` plus `mode: "launch-readiness"`                            | ✓ WIRED                        | Controlled build and ordinary restoration both pass.                                                     |
| `SiteLayout.astro`         | every generated HTML head             | exact mode gate plus one deferred external script                                  | ✓ WIRED                        | All nine launch/ordinary HTML bodies and loader counts are compared by the native contract.              |
| Permanent YouTube CTA      | Plausible automatic outbound behavior | native same-tab anchor observed by the controlled vendor stub                      | ✓ WIRED locally                | One matching controlled attempt and zero player attempts pass; no project event path exists.             |
| `package.json`             | native measurement lifecycle          | explicit serialized `tests/deployment-measurement.test.ts` entry                   | ✓ WIRED                        | The fresh native run included and passed the named controlled seam.                                      |
| `README.md`                | Cloudflare Pages launch wrapper       | exact `npm ci && npm run check && npm run launch:ready` command and public values  | ✓ WIRED as operations contract | Documentation test enforces the command, `main`, `None`, pinned runtime, `dist`, and both public values. |
| `README.md`                | Plausible property                    | current asset instructions, Outbound links setting, event name, and `url` property | ✓ WIRED as operations contract | Exact event/property wording is tested; real dashboard state remains human.                              |
| `README.md`                | Search Console                        | exact HTTPS URL-prefix property and absolute sitemap-index submission              | ✓ WIRED as operations contract | Exact instructions and evidence row exist; real ownership/submission remain human.                       |

## Behavioral Verification

| Check            | Result                                                                   | Status    |
| ---------------- | ------------------------------------------------------------------------ | --------- |
| Pinned full gate | `133/133` native; Astro `0` errors, warnings, and hints; `49/49` browser | ✓ PASS    |
| Ordinary output  | Nine HTML documents; zero Plausible source/asset matches                 | ✓ PASS    |
| Schema drift     | `drift_detected: false`; no schema or ORM                                | ✓ PASS    |
| Structural drift | Safely skipped with `reason: no-structure-md`; non-blocking by contract  | ✓ PASS    |
| Code review      | Deep review clean after the cross-platform separator fix                 | ✓ PASS    |
| Security         | `8/8` plan-time threats closed; no accepted risk                         | ✓ PASS    |
| UI               | `24/24`; zero actionable local finding                                   | ✓ PASS    |
| Validation       | Five repository entries green; four manual-only checks pending           | ◐ PARTIAL |

## Requirements Coverage

| Requirement | Repository Evidence                                                                                                                         | Live-Service Evidence                                                                                                  | Status        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------- |
| `SEO-06`    | Safe launch identity, sitemap/robots output, Arabic runbook, evidence-state enforcement, and fabricated-pass rejection are green.           | Final deployment/DNS/TLS, exact Search Console property verification, and absolute sitemap submission are uninspected. | ? NEEDS HUMAN |
| `MEAS-01`   | Launch-only aggregate loader, ordinary omission, failure independence, no-reader-identifier scan, and controlled pageview wiring are green. | Real aggregate pageviews in the final Plausible property are uninspected.                                              | ? NEEDS HUMAN |
| `MEAS-02`   | One controlled direct-link attempt with matching `url`, zero player attempts, and no project tracking path are green.                       | Real `Outbound Link: Click` reporting in the final property is uninspected.                                            | ? NEEDS HUMAN |

No Phase 5 requirement is complete from repository evidence alone. `REQUIREMENTS.md` must keep all three pending until the corresponding owner-controlled facts are recorded.

## Anti-Patterns and Security Scan

| Surface                                             | Finding                                                                                                                                                                | Severity | Impact                                                             |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| Eight Phase 5 runtime/test/runbook/ledger artifacts | No TODO, FIXME, XXX, HACK, placeholder, unimplemented return, or empty implementation pattern                                                                          | None     | No repository completion blocker.                                  |
| Runtime and ordinary output                         | No credential, verification artifact, real production Plausible asset, custom tracker, GA/GTM, replay, fingerprinting, per-reader storage, adapter, or deploy workflow | None     | Static privacy boundary preserved.                                 |
| Launch ledger                                       | Eleven external rows remain `PENDING`                                                                                                                                  | None     | Intentional evidence state; prevents a fabricated production pass. |

## Disconfirmation Pass

1. **Partially met requirement:** Every Phase 5 requirement has complete repository wiring and incomplete live-service proof. None is promoted to complete.
2. **Potentially misleading test:** The controlled browser seam proves that the project exposes one intended automatic outbound path; it cannot prove the real Plausible service received, retained, or displayed the event.
3. **Uncovered automated path:** Cloudflare/DNS/TLS state, Search Console ownership/submission, Plausible aggregate ingestion, and real outbound reporting have no honest local automation path. They are persisted in `05-HUMAN-UAT.md`.

## Human Verification Required

### 1. Canonical production deployment, DNS, and TLS

**Test:** Inspect the owner Cloudflare Pages project, intended production deployment, final domain/DNS/TLS state, and real HTTPS response.
**Expected:** The final origin is reachable, matches canonical output, comes from the intended deployment, and has active DNS/TLS.
**Why human:** These facts require the owner's provider and domain authority.

### 2. Search Console ownership and sitemap submission

**Test:** Inspect the exact final HTTPS URL-prefix property and Sitemaps report.
**Expected:** Ownership is verified and the absolute `/sitemap-index.xml` URL has a real submission/read status.
**Why human:** Repository output cannot prove Google account ownership or service state.

### 3. Aggregate Plausible production pageviews

**Test:** Inspect the final Plausible property after real production visits.
**Expected:** Aggregate page traffic appears without session replay, fingerprinting, or per-reader profiles.
**Why human:** Only the real property can prove ingestion and reporting.

### 4. Real outbound YouTube link reporting

**Test:** Use the permanent link once in production and inspect the final Plausible dashboard.
**Expected:** One `Outbound Link: Click` appears with the direct YouTube destination in `url`; it is not described as a video view, and player activation is not counted as the link action.
**Why human:** Provider receipt and dashboard reporting require a real production action and owner access.

## Gaps Summary

No missing, stubbed, orphaned, insecure, or untested repository artifact was found. The phase cannot receive `passed` status because its roadmap goal and all three mapped requirements include real provider/account outcomes. Those four authority gates are saved in `05-HUMAN-UAT.md`; no override applies.

## Readiness

Phase 5 is ready for owner-controlled production verification. Keep the phase in verification-pending state, keep `SEO-06`, `MEAS-01`, and `MEAS-02` pending, and do not call `phase.complete` until direct evidence closes all four human checks.

---

_Verified: 2026-08-28T04:03:05Z_
_Verifier: Codex acting inline as gsd-verifier_
