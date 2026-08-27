---
phase: 03-real-content-and-section-discovery
reviewed: 2026-08-27T17:49:54Z
depth: standard
files_reviewed: 17
files_reviewed_list:
  - package.json
  - playwright.config.ts
  - src/content/articles/contract-markdown.md
  - src/content/articles/contract-mdx.mdx
  - src/content/articles/usul-al-radd-ala-al-shubuhat.md
  - src/content/articles/adaab-al-khilaf-al-aam.md
  - src/content/articles/madkhal-ilm-al-imla.md
  - src/layouts/SiteLayout.astro
  - src/lib/articles.ts
  - src/lib/content-contract.ts
  - src/pages/index.astro
  - src/pages/[section]/index.astro
  - src/pages/[section]/[slug].astro
  - src/pages/عن-أحمد-المنجاوي.astro
  - tests/content-contract.test.ts
  - tests/article-journey.spec.ts
  - tests/discovery.spec.ts
findings:
  critical: 0
  warning: 4
  info: 0
  total: 4
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-08-27T17:49:54Z  
**Depth:** standard  
**Files Reviewed:** 17  
**Status:** issues_found

## Summary

The public corpus correctly keeps the proof records behind the draft boundary, gives all three launch articles the required Arabic AI-assistance/no-transcript disclosure, and does not recreate the deleted human-review sidecar or imply an approval that did not occur. Four warnings remain: publication-date validation uses the wrong civil-day boundary, the content contract does not enforce Arabic reader-facing metadata, the production browser command can test stale output, and the discovery oracle rejects a route shape that the implementation deliberately permits.

Phase 4 metadata, canonicals, favicon, and document-title work were not reported because the Phase 3 specification explicitly defers them.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Publication eligibility changes at UTC midnight instead of the project civil day

**Classification:** WARNING  
**File:** `src/lib/content-contract.ts:179`  
**Issue:** The default `today` value comes from `new Date().toISOString()`, which is always a UTC date. Publication dates are civil date-only values. During the first three hours of a Riyadh calendar day, an article dated that local day is treated as future-dated and the build fails even though its publication date is truthful. The unit tests always inject `today`, so they do not exercise this production default.

**Fix:** Derive the default date in the explicitly chosen publication timezone (for example `Asia/Riyadh`) or pass the intended build civil date into the schema boundary. Add a test for an instant where the Riyadh date and UTC date differ.

### WR-02: Arabic-only reader-facing metadata is not enforced by the content boundary

**Classification:** WARNING  
**File:** `src/lib/content-contract.ts:140-169,182-186`  
**Issue:** Section labels/descriptions, author names, and article title/description/summary are checked only for non-empty strings. A Latin-only value therefore passes the same validated collection used by public pages, despite the project and Phase 3 UI contract requiring all public interface copy to be Arabic. Reference labels already receive an Arabic-facing check, so the protection is inconsistent at the same trust boundary.

**Fix:** Reuse one `assertArabicFacing` helper for section labels/descriptions, author names, and article title/description/summary, while leaving stable registry keys, URLs, and YouTube IDs exempt. Add Latin-only rejection cases to `tests/content-contract.test.ts`.

### WR-03: The standalone browser-test command can validate stale production output

**Classification:** WARNING  
**File:** `package.json:16`  
**Related:** `playwright.config.ts:45-50`  
**Issue:** `npm run test:browser` starts `astro preview` but never builds `dist`. On a clean checkout it cannot start; after a source edit it can serve an older `dist` and produce a false green production-discovery result. The full `verify` script happens to build first, but the separately exposed browser command is not self-contained.

**Fix:** Make `test:browser` build immediately before Playwright (for example, `npm run build && playwright test`) and remove the now-redundant ordinary build from `verify`, or change the production web-server command to build before previewing. Keep the generated output under the existing ignored directories.

### WR-04: Discovery oracle imposes global slug uniqueness that routing does not require

**Classification:** WARNING  
**File:** `tests/discovery.spec.ts:88,127-135`  
**Issue:** `expectedPublicCorpus()` rejects a repeated article slug even when the articles belong to different sections. The implementation correctly defines identity by the complete `/{section}/{slug}/` path and `assertUniqueArticlePaths()` permits that safe case. This independent oracle will therefore fail a valid future corpus and pressure maintainers to add an undocumented global restriction.

**Fix:** Remove the `articleSlugs` set and its duplicate check; retain the complete-route collision check. Add a small oracle/contract fixture proving that the same article slug in two different registered sections yields two distinct valid routes.

---

_Reviewed: 2026-08-27T17:49:54Z_  
_Reviewer: the agent (gsd-code-reviewer)_  
_Depth: standard_
