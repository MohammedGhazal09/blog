---
phase: 02-complete-arabic-article-journey
reviewed: 2026-08-26T18:52:05Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - README.md
  - package.json
  - playwright.config.ts
  - src/components/YouTubePlayer.astro
  - src/content.config.ts
  - src/content/articles/contract-markdown.md
  - src/content/articles/contract-mdx.mdx
  - src/lib/content-contract.ts
  - src/pages/[section]/[slug].astro
  - tests/article-journey.spec.ts
  - tests/content-contract.test.ts
findings:
  critical: 1
  warning: 1
  info: 0
  total: 2
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-08-26T18:52:05Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

The eleven scoped files were reviewed statically, with the shared content-validation path traced through `src/content.config.ts`, `src/lib/articles.ts`, and the final article route. One blocker allows a public article to render a future update date as a truthful provenance fact. The browser suite also omits the phase's explicit 200% zoom gate, leaving a required reflow mode unverified.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: [BLOCKER] Public articles can claim a future update date

**File:** `W:\Mangawy\src\lib\content-contract.ts:196-204`

**Affected sink:** `W:\Mangawy\src\pages\[section]\[slug].astro:65-70`

**Issue:** `validateArticleData()` rejects a future `publishedAt` for public records, but only checks that `updatedAt` is a real date and is not earlier than publication. A record with `draft: false`, `publishedAt: "2026-08-01"`, and `updatedAt: "2026-08-27"` passes when `today` is `2026-08-26`. The content schema calls this validator for every collection entry, and the route then renders the future value under `حُدّثت المادة في`. This violates the locked requirement that visible publication/update facts be truthful.

**Fix:** Validate `draft` before the date-state rules, then reject a future update on public records and add the missing regression case to `tests/content-contract.test.ts`.

```typescript
if (typeof data.draft !== "boolean")
  fail(`${source}.draft`, "must be an explicit boolean");

if (data.updatedAt !== undefined) {
  assertDateOnly(data.updatedAt, source, "updatedAt");
  if (data.updatedAt < data.publishedAt)
    fail(`${source}.updatedAt`, "must not be earlier than publishedAt");
  if (!data.draft && data.updatedAt > today)
    fail(`${source}.updatedAt`, "public articles cannot claim a future update");
}
```

## Warnings

### WR-01: [WARNING] The required 200% zoom reflow mode is never exercised

**File:** `W:\Mangawy\tests\article-journey.spec.ts:638-714`

**Issue:** The reflow test iterates the five locked CSS viewport widths, but it never applies or verifies 200% browser zoom. Phase 2 explicitly requires both the width matrix and a 200% zoom pass. A regression that only appears when text and controls are magnified can therefore ship while `npm run verify` remains green; the current assertions prove ordinary viewport resizing only.

**Fix:** Add one dedicated 200% zoom scenario for both Markdown and MDX routes using the project's Chromium/DevTools test backend. At that zoom level, repeat the existing no-horizontal-overflow assertion and verify that every readable node and standalone control remains visible, contained, and keyboard reachable. Keep any screenshots/traces under `.artifacts/playwright/` through the existing Playwright configuration.

---

_Reviewed: 2026-08-26T18:52:05Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
