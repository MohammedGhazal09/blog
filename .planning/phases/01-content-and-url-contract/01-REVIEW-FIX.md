---
phase: 01-content-and-url-contract
fixed_at: 2026-08-26T16:37:28+03:00
review_path: .planning/phases/01-content-and-url-contract/01-REVIEW.md
iteration: 2
findings_in_scope: 2
fixed: 2
skipped: 0
status: all_fixed
---

# Phase 1: Code Review Fix Report

**Fixed at:** 2026-08-26T16:37:28+03:00
**Source review:** `.planning/phases/01-content-and-url-contract/01-REVIEW.md`
**Iteration:** 2

**Summary:**

- Findings in scope: 2
- Fixed: 2
- Skipped: 0

## Fixed Issues

### CR-01: Inherited properties bypass registered author validation

**Files modified:** `src/lib/content-contract.ts`, `tests/content-contract.test.ts`
**Commit:** 76bdc0f
**Applied fix:** Replaced prototype-chain membership checks with `Object.hasOwn` for both section and author registries, with inherited-key regressions at both boundaries.

### CR-02: Restricted MDX policy allows executable client JavaScript without a script tag

**Files modified:** `src/lib/mdx-policy.ts`, `tests/content-contract.test.ts`, `package.json`, `package-lock.json`
**Commit:** a470643
**Applied fix:** Replaced the source denylist with the pinned `@mdx-js/mdx` structural parser. Preflight now rejects MDX expressions and ESM, raw or intrinsic HTML, attributes on the exact approved `ContractNote` component, unsafe URL protocols, and non-allowlisted components while leaving Markdown and code examples valid.

## Iteration 2 Verification Regression

**Regression:** Independent verification after a clean `npm ci` exposed TS2591 diagnostics for the build-time-only `node:fs`, `node:path`, and `node:url` imports because iteration 1 removed their deliberate local suppressions.
**Resolution:** Restored import-local `@ts-ignore` comments documenting the intentional no-`@types/node` contract. `@ts-ignore` is used instead of `@ts-expect-error` because Astro's generated type state can resolve these imports in some clean runs, where `@ts-expect-error` itself becomes TS2578; the local ignore passes both resolution states without adding a project-wide Node type dependency.
**Commit:** 7329a7a
**Verification:** Exact Node 24.19.0/npm 11.17.0 clean install followed by `npm run verify`: 55/55 tests passed, Astro check reported 0 errors, 0 warnings, and 0 hints, and the static build produced 2 pages.

---

_Fixed: 2026-08-26T16:37:28+03:00_
_Fixer: the agent (gsd-code-fixer)_
_Iteration: 2_
