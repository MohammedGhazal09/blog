---
quick_id: 260830-qhv
description: Launch production without analytics and update the deployment contract
mode: quick-full
status: ready
must_haves:
  truths:
    - "The launch-readiness build succeeds with only SITE_ORIGIN and emits no analytics script when PLAUSIBLE_SCRIPT_SRC is absent."
    - "The final-origin verifier accepts a consistently analytics-free site while continuing to reject malformed or unexpected third-party loaders."
    - "Arabic deployment instructions and active planning state no longer require Plausible or leave MEAS-01/MEAS-02 as launch blockers."
  artifacts:
    - path: "scripts/launch-ready.mjs"
      provides: "Production build entry point with optional, validated analytics input"
    - path: "src/layouts/SiteLayout.astro"
      provides: "Shared head that remains analytics-free when no loader is configured"
    - path: "scripts/verify-production.mjs"
      provides: "Final-origin validation compatible with a deliberately analytics-free release"
    - path: "README.md"
      provides: "Arabic Cloudflare deployment instructions without analytics setup"
    - path: ".planning/REQUIREMENTS.md"
      provides: "Current v1 scope with measurement explicitly removed by owner decision"
  key_links:
    - from: "scripts/launch-ready.mjs"
      to: "src/layouts/SiteLayout.astro"
      via: "launch-readiness mode and optional PLAUSIBLE_SCRIPT_SRC"
    - from: "scripts/verify-production.mjs"
      to: "deployed HTML"
      via: "zero-or-one exact Plausible loader contract"
    - from: "README.md"
      to: ".planning/REQUIREMENTS.md"
      via: "analytics-free deployment scope"
---

# Quick Task 260830-qhv: Launch production without analytics

## Task 1: Make the production path analytics-optional

**Files:** `scripts/launch-ready.mjs`, `src/layouts/SiteLayout.astro`, `scripts/verify-production.mjs`, `tests/content-contract.test.ts`, `tests/production-verification.test.ts`

**Action:** Keep the existing strict Plausible URL validation only when a loader is explicitly supplied. Allow launch builds and final-origin verification to run with no analytics input and require the emitted site to contain no Plausible loader in that case. Preserve rejection of malformed, duplicated, or unrelated third-party scripts.

**Verify:** Add focused regression coverage for an analytics-free launch build and an analytics-free controlled production crawl; run the focused native tests.

**Done:** `npm run launch:ready` succeeds with only a valid `SITE_ORIGIN`, emitted HTML contains no Plausible request, and the production verifier reports no analytics finding for consistent omission.

## Task 2: Reconcile owner documentation and active scope

**Files:** `README.md`, `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`

**Action:** Remove Plausible from the required Cloudflare build inputs and Arabic launch checklist. Record the owner's explicit decision to skip analytics, move MEAS-01/MEAS-02 out of v1, update requirement counts/traceability, and remove analytics from active blockers without rewriting historical phase evidence.

**Verify:** Search active operator/planning documents for contradictory required analytics setup and run documentation contract tests.

**Done:** The current deployment path requires only the canonical origin, active v1 counts are internally consistent, and historical phase files remain intact as implementation history.

## Task 3: Run the release gates

**Files:** no additional source files

**Action:** Run the native suite, Astro check, production launch build without analytics, browser suite, and a clean-worktree/diff review. Keep all generated browser artifacts under the ignored `.artifacts` directory.

**Verify:** `npm test`, `npm run check`, analytics-free `npm run launch:ready`, and `npm run test:browser` pass.

**Done:** Every repository-controlled gate is green and the ordinary local build is restored after build-mutating tests.
