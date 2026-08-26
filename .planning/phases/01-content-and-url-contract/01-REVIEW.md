---
phase: 01-content-and-url-contract
reviewed: 2026-08-26T13:16:52Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - .gitignore
  - .nvmrc
  - README.md
  - astro.config.mjs
  - package.json
  - src/components/ContractNote.astro
  - src/components/mdx-components.ts
  - src/config/registries.ts
  - src/content.config.ts
  - src/content/articles/contract-draft.md
  - src/content/articles/contract-markdown.md
  - src/content/articles/contract-mdx.mdx
  - src/lib/articles.ts
  - src/lib/content-contract.ts
  - src/lib/mdx-policy.ts
  - src/pages/[section]/[slug].astro
  - tests/content-contract.test.ts
  - tsconfig.json
findings:
  critical: 2
  warning: 0
  info: 0
  total: 2
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-08-26T13:16:52Z
**Depth:** standard
**Files Reviewed:** 18
**Status:** issues_found

## Summary

The Phase 1 content, routing, draft, and static-rendering paths were reviewed against `SEO-01` and `PUB-01` through `PUB-06`. Two fail-closed contract bypasses remain: inherited object properties are accepted as registry identifiers, and the MDX denylist permits executable HTML attributes and JavaScript expressions. Both must be fixed before the phase ships.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: Inherited properties bypass registered author validation

**Classification:** BLOCKER

**File:** `src/lib/content-contract.ts:182-185`

**Issue:** Registry membership uses the `in` operator. Because both registries are ordinary objects, inherited names such as `toString`, `constructor`, and `__proto__` satisfy this check even though they are not registered keys. A public article with `author: "toString"` therefore passes `validateArticleData`, passes the Astro collection schema, and reaches static route generation because the current route does not dereference the author record. This violates `PUB-02`'s requirement that unknown authors fail before output. The section check has the same root defect, although inherited section names currently fail later while deriving the path rather than at the validation boundary.

**Fix:** Test own membership for both registries and add prototype-key regression cases.

```ts
if (!Object.hasOwn(sections, data.section))
  fail(`${source}.section`, `unknown registry key: ${data.section}`);
if (!Object.hasOwn(authors, data.author))
  fail(`${source}.author`, `unknown registry key: ${data.author}`);
```

### CR-02: Restricted MDX policy allows executable client JavaScript without a script tag

**Classification:** BLOCKER

**File:** `src/lib/mdx-policy.ts:47-68`

**Issue:** The preflight is a substring/tag-name denylist: it rejects literal `script` and `iframe` tags plus unknown uppercase component names, but it does not reject executable HTML attributes or MDX JavaScript expressions. For example, `<img src="missing" onerror="alert(document.domain)" />` contains none of the rejected patterns and passes `assertAllowedMdxSource`; Astro's MDX JSX renderer serializes the `onerror` property into the generated HTML, so the browser executes it when the image fails. MDX expressions such as `{/* executable JavaScript */}` also bypass every current check. This is reachable in the stated Git-reviewed authoring model and defeats `PUB-05` and the phase's no-unwanted-client-runtime contract even though the current proof fixture is safe.

**Fix:** Enforce allowed MDX syntax structurally with the already-installed MDX parser: reject expression/ESM nodes, event-handler attributes, unsafe URL schemes, raw `script`/`iframe` elements, and non-allowlisted component elements before compilation. Add regression cases for at least an `onerror` attribute and an MDX expression; the policy test must fail before either can reach `render(article)`.

---

_Reviewed: 2026-08-26T13:16:52Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
