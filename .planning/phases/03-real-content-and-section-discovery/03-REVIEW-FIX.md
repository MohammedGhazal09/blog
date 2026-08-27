---
phase: 03-real-content-and-section-discovery
fixed_at: 2026-08-27T18:01:01Z
review_path: .planning/phases/03-real-content-and-section-discovery/03-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 03: Code Review Fix Report

**Fixed at:** 2026-08-27T18:01:01Z
**Source review:** `.planning/phases/03-real-content-and-section-discovery/03-REVIEW.md`
**Iteration:** 1

**Summary:**

- Findings in scope: 4
- Fixed: 4
- Skipped: 0

## Fixed Issues

### WR-01: Publication eligibility changes at UTC midnight instead of the project civil day

**Status:** fixed: requires human verification
**Files modified:** `src/lib/content-contract.ts`, `tests/content-contract.test.ts`
**Commit:** 967dd74
**Applied fix:** Derived the default publication date in `Asia/Riyadh` and added a regression check for an instant when Riyadh and UTC fall on different civil dates.

### WR-02: Arabic-only reader-facing metadata is not enforced by the content boundary

**Status:** fixed: requires human verification
**Files modified:** `src/lib/content-contract.ts`, `tests/content-contract.test.ts`
**Commit:** 597b4f8
**Applied fix:** Reused one Arabic-facing assertion for section labels and descriptions, author names, article titles, descriptions, summaries, and reference labels, with Latin-only rejection cases for every newly protected field.

### WR-03: The standalone browser-test command can validate stale production output

**Status:** fixed
**Files modified:** `package.json`
**Commit:** d596ad1
**Applied fix:** Made `test:browser` build immediately before Playwright and removed the redundant direct build step from `verify`.

### WR-04: Discovery oracle imposes global slug uniqueness that routing does not require

**Status:** fixed: requires human verification
**Files modified:** `tests/discovery.spec.ts`
**Commit:** 7132d90
**Applied fix:** Removed global article-slug uniqueness from the discovery oracle, retained complete-route collision detection, and added a fixture proving one slug can produce distinct routes in two registered sections.

## Verification

- Runtime: Node v24.19.0, npm 11.17.0
- `npm run verify`: passed
- Unit tests: 84 passed
- Astro diagnostics: 0 errors, 0 warnings, 0 hints
- Static build: 8 pages generated
- Playwright: 38 passed across development-proof and production-discovery
- Browser artifacts: `.artifacts/`

---

_Fixed: 2026-08-27T18:01:01Z_
_Fixer: the agent (gsd-code-fixer)_
_Iteration: 1_
