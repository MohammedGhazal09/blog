---
status: complete
phase: 01-content-and-url-contract
source:
  - 01-01-SUMMARY.md
  - 01-02-SUMMARY.md
  - 01-03-SUMMARY.md
started: 2026-08-26T17:12:16+03:00
updated: 2026-08-26T17:12:16+03:00
---

## Current Test

[testing complete]

## Tests

### 1. Local preview, source reload, and production draft exclusion
expected: Under Node 24.19.0 and npm 11.17.0, the public Markdown, approved MDX, and explicit draft records render as Arabic RTL pages on their final routes in development; a Markdown source edit appears after reload and disappears after restoration; a subsequent production build emits only the two public routes.
result: pass
evidence:
  - All three final-route URLs rendered Arabic content with `lang="ar"` and `dir="rtl"` in the development browser session.
  - The approved MDX route rendered exactly one approved `<aside>` component.
  - The explicit draft route rendered in development.
  - Replacing the Markdown summary with `علامة إعادة التحميل المؤقتة لاختبار المصدر الأصلي.` appeared after browser reload.
  - Restoring the source with `apply_patch` removed the temporary marker and restored the original summary after reload.
  - The development server process was stopped and port 4321 was confirmed released.
  - A post-restore `npm run build` succeeded; the public Markdown and MDX outputs existed, the draft output did not, and `dist` contained exactly two HTML files.
  - `git diff --exit-code -- src/content/articles/contract-markdown.md` passed after restoration.

## Summary

total: 1
passed: 1
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
