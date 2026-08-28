---
phase: 04-search-discovery-integrity
reviewed: 2026-08-28T00:08:02Z
depth: deep
files_reviewed: 18
files_reviewed_list:
  - astro.config.mjs
  - package.json
  - package-lock.json
  - playwright.config.ts
  - public/favicon.svg
  - scripts/launch-ready.mjs
  - src/layouts/SiteLayout.astro
  - src/lib/site-origin.ts
  - src/pages/404.astro
  - src/pages/index.astro
  - src/pages/[section]/index.astro
  - src/pages/[section]/[slug].astro
  - src/pages/robots.txt.ts
  - src/pages/عن-أحمد-المنجاوي.astro
  - tests/content-contract.test.ts
  - tests/discovery.spec.ts
  - tests/search-discovery.spec.ts
  - tests/site-origin.test.ts
findings:
  critical: 1
  warning: 1
  info: 0
  total: 2
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-08-28T00:08:02Z  
**Depth:** deep  
**Files Reviewed:** 18  
**Status:** issues_found

## Summary

The review traced the Phase 04 metadata, canonical/social, sitemap/robots, 404, favicon, content-selection, and launch-build paths. The current full gate passes (128 native tests, zero Astro diagnostics, and 49 browser tests), and `npm audit` reports zero known vulnerabilities; those results do not cover the defects below.

Deep call-chain review found one release-blocking regression: the new programmatic launch wrapper no longer selects the existing `launch-readiness` mode, so the required one-public-article-per-section launch guard is dead during the command intended to enforce it. The standard regression gate also does not verify controlled launch output or this mode wiring, which allowed the defect to pass.

## Narrative Findings (AI reviewer)

### Critical Issues

#### CR-01: Launch wrapper bypasses the existing launch-corpus completeness gate

**Classification:** BLOCKER  
**File:** `W:/Mangawy/scripts/launch-ready.mjs:7`  
**Issue:** `launch:ready` now calls `build({ site })`. Astro 7.2.7 defaults an omitted inline `mode` to `"production"`; meanwhile, the production article selector calls `assertLaunchSectionCoverage()` only when `import.meta.env.MODE === "launch-readiness"` (`src/lib/articles.ts:16-20`). Before Phase 04, the package script explicitly ran `astro build --mode launch-readiness`. The wrapper therefore regressed that established behavior: if every public article in one registered section is removed or changed back to draft, `npm run launch:ready` still exits successfully and emits launch output instead of failing. The current three-article corpus masks the defect.

**Fix:** Preserve the existing mode while supplying the validated site, then add a wiring regression that fails if the wrapper omits it:

```js
await build({ site, mode: "launch-readiness" });
```

The regression should prove both halves of the launch boundary: controlled-origin output uses the supplied HTTPS origin, and launch-readiness invokes the section-coverage path.

### Warnings

#### WR-01: The persistent launch regression checks only exit status

**Classification:** WARNING  
**File:** `W:/Mangawy/tests/content-contract.test.ts:482-497`  
**Issue:** The only `launch:ready` test supplies a safe origin and asserts status `0`; it never examines the generated HTML, canonical/Open Graph URLs, sitemap, robots output, or the selected Astro mode. Consequently, a wrapper that validates `SITE_ORIGIN` but ignores it, or the current wrapper that drops `launch-readiness` mode, remains green. `npm run verify` does not close this gap: its later ordinary build replaces `dist`, and `tests/search-discovery.spec.ts` defaults its expected identity to localhost. The one-off controlled launch sequence recorded in the plan summary is evidence for the reviewed commit, not a durable regression gate.

**Fix:** After the spawned controlled launch succeeds, parse representative HTML plus both sitemap layers and `robots.txt`, assert that the controlled HTTPS origin is present and localhost is absent, and verify the wrapper passes `mode: "launch-readiness"`. Restore an ordinary local build in a `finally` block so standalone native tests leave deterministic output.

---

_Reviewed: 2026-08-28T00:08:02Z_  
_Reviewer: the agent (gsd-code-reviewer)_  
_Depth: deep_
