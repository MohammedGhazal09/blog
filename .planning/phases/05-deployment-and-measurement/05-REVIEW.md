---
phase: 05-deployment-and-measurement
reviewed: 2026-08-28T03:44:28Z
depth: deep
files_reviewed: 7
files_reviewed_list:
  - README.md
  - package.json
  - scripts/launch-ready.mjs
  - src/layouts/SiteLayout.astro
  - src/lib/measurement.ts
  - tests/content-contract.test.ts
  - tests/deployment-measurement.test.ts
findings:
  critical: 0
  warning: 1
  info: 0
  total: 1
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-08-28T03:44:28Z  
**Depth:** deep  
**Files Reviewed:** 7  
**Status:** issues_found

## Summary

The review traced the launch flow from `npm run launch:ready` through the two input validators, Astro build mode, the shared head, generated documents, controlled browser interception, ordinary-output restoration, and the Arabic deployment runbook. The production path is fail-closed and no credential, injection, duplicate tracking, navigation interception, or analytics/UI coupling defect was found.

One portability defect exists in the new browser test server. It does not affect the generated website, but it makes the Phase 5 measurement test fail on POSIX runners and therefore weakens the promised reproducible verification path.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Static-server containment check is Windows-only

**File:** `tests/deployment-measurement.test.ts:70`  
**Issue:** The server accepts files only when the resolved path starts with `` `${DIST_ROOT}\\` ``. `node:path.resolve()` uses `/` on Linux and macOS, so every legitimate file below `dist/` fails this check on those platforms and receives HTTP 400. The controlled measurement test therefore cannot run on the POSIX environment used by most deployment/CI systems. This is a test-reliability defect in a Phase 5 gate, not a style preference.

**Fix:** Import `sep` from `node:path` and compare against `` `${DIST_ROOT}${sep}` `` while retaining the exact-root exception:

```ts
import { extname, resolve, sep } from "node:path";

if (!path.startsWith(`${DIST_ROOT}${sep}`) && path !== DIST_ROOT) {
  response.writeHead(400).end();
  return;
}
```

## Deep Review Notes

- Import graph: `launch-ready.mjs` validates `SITE_ORIGIN` and `PLAUSIBLE_SCRIPT_SRC` before calling Astro; `SiteLayout.astro` independently validates the build-time Plausible value before rendering one deferred head loader.
- Trust boundaries: the production origin rejects non-HTTPS, paths, credentials, ports represented outside `origin`, IP/reserved hosts, queries, and fragments; the Plausible source additionally requires exact raw-to-normalized equality, official authority, and a narrow current asset path.
- Error propagation: invalid launch inputs throw before output is built. Ordinary mode does not evaluate the Plausible validator, so ambient or missing values cannot change ordinary output.
- State mutation: launch tests serialize all `dist/` mutations and restore an ordinary analytics-free build in `finally` blocks.
- Reader interaction: `YouTubePlayer.astro` is unchanged and contains no analytics hook; vendor behavior observes the permanent native anchor without owning navigation.
- Documentation: the Arabic runbook accurately separates repository-controlled readiness from Cloudflare, DNS/TLS, Plausible, and Search Console evidence that only the owner can supply.

---

_Reviewed: 2026-08-28T03:44:28Z_  
_Reviewer: Codex acting inline as gsd-code-reviewer_  
_Depth: deep_
