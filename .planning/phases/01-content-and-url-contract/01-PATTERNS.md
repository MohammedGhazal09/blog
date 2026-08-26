# Phase 1: Content and URL Contract - Pattern Map

**Mapped:** 2026-08-26
**Files analyzed:** 15 files/module families
**Analogs found:** 0 / 15

## Repository Baseline

The repository has no implementation analogs. A read-only inventory found only `AGENTS.md` outside `.planning/`; there is no package scaffold, source module, component, content entry, route, or test to copy. Therefore, the locked `01-SPEC.md` and `01-CONTEXT.md` define required behavior, while the verified examples and proposed structure in `01-RESEARCH.md` are the implementation pattern authority. These are reference patterns, not existing reusable code.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `.nvmrc` | config | batch | None | no analog |
| `package.json` / `package-lock.json` | config | batch | None | no analog |
| `astro.config.mjs` | config | file-I/O / batch | None | no analog |
| `tsconfig.json` | config | batch | None | no analog |
| `README.md` | config/documentation | file-I/O | None | no analog |
| `src/config/registries.ts` | config/model | transform | None | no analog |
| `src/lib/content-contract.ts` | utility | transform | None | no analog |
| `src/lib/mdx-policy.ts` | utility | file-I/O / transform | None | no analog |
| `src/content.config.ts` | config/model | file-I/O / transform | None | no analog |
| `src/lib/articles.ts` | service | file-I/O / batch | None | no analog |
| `src/components/ContractNote.astro` | component | request-response | None | no analog |
| `src/components/mdx-components.ts` | config/provider | transform | None | no analog |
| `src/pages/[section]/[slug].astro` | route/component | request-response | None | no analog |
| `src/content/articles/*.{md,mdx}` | model/content | file-I/O | None | no analog |
| `tests/content-contract.test.ts` | test | batch / transform | None | no analog |

## Pattern Assignments

### Root toolchain configuration

**Files:** `.nvmrc`, `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`

**Analog:** None. Use `01-CONTEXT.md` decisions D-01 through D-03 and `01-RESEARCH.md` Standard Stack/Installation sections.

**Concrete pattern:** Pin Node `24.19.0`, npm `11.17.0`, Astro `7.2.7`, `@astrojs/mdx` `7.0.8`, `@astrojs/check` `0.9.10`, and TypeScript `6.0.3`. Configure explicit static output and `trailingSlash: "always"`; do not set a fake `site`, server adapter, UI runtime, path aliases, or additional test/lint framework. The five scripts are `dev`, `test`, `check`, `build`, and `verify`, with `verify` running tests, diagnostics, then build. `astro.config.mjs` invokes the same MDX source preflight used by dev/check/build.

### `src/config/registries.ts` (config/model, transform)

**Analog:** None. Authority: `01-CONTEXT.md` D-05/D-06 and `01-RESEARCH.md` recommended structure (lines 219-242).

Define central typed section and author registries with stable ASCII keys. Store Arabic label, description, and explicit public slug in each section entry; start with the three locked sections and one truthful Ahmed El-Mangawy author entry. Validate registry slugs through the same pure slug rule used for article slugs. Do not introduce repository/service interfaces or multi-author UI.

### `src/lib/content-contract.ts` (utility, transform)

**Analog:** None. Authority: `01-RESEARCH.md` Patterns 1, 2, 3, and 5.

**Canonical slug pattern** (`01-RESEARCH.md` lines 279-300):

```ts
export function assertCanonicalArabicSlug(value: string, field: string): void {
  if (value.normalize("NFC") !== value) fail(field, "must already be Unicode NFC");
  if (/\p{Cc}|\p{Cf}/u.test(value)) fail(field, "contains a control/format character");
  if (/[\\/.%]/u.test(value) || value.includes("--") || /^-|-$/.test(value)) {
    fail(field, "contains an unsafe separator or dot/escape form");
  }
  if (!value.split("-").every(isAllowedArabicSlugSegment)) {
    fail(field, "must contain Arabic letters/marks or Arabic/ASCII digits");
  }
}
```

Keep this module pure and directly executable by Node 24 type stripping: relative `.ts` imports, erasable TypeScript only, no aliases/enums/decorators. It owns slug, exact date-only, YouTube ID, registry membership, article path, draft selection, and complete-path collision rules. Reject non-NFC input rather than repairing it. Inject `today` for deterministic future-date checks.

**Complete-path collision pattern** (`01-RESEARCH.md` lines 462-475):

```ts
export function assertUniquePaths(entries: readonly ArticleRecord[]): void {
  const owners = new Map<string, string>();
  for (const entry of entries) {
    const path = articlePath(entry);
    const prior = owners.get(path);
    if (prior) throw new Error(`${path}: collision between ${prior} and ${entry.id}`);
    owners.set(path, entry.id);
  }
}
```

Run collision validation across all validated entries before draft filtering. Diagnostics retain source ID, field/path, failed rule, and both owners for collisions.

### `src/lib/mdx-policy.ts` (utility, file-I/O / transform)

**Analog:** None. Authority: `01-CONTEXT.md` D-15/D-16 and `01-RESEARCH.md` Pattern 4 (lines 327-335).

Use one narrow raw-source preflight before Astro compilation. After excluding frontmatter, fenced code, and inline code spans, reject top-level ESM import/export, `<script>`, raw `<iframe>`, and JSX component names outside the central allowlist. Export the pure source checker for tests and the minimal filesystem preflight for `astro.config.mjs`. This is a Git-authoring policy guard, not sanitizer or hostile-input sandbox.

### `src/content.config.ts` (config/model, file-I/O / transform)

**Analog:** None. Authority: current Astro Content Layer example in `01-RESEARCH.md` lines 244-277.

**Imports and loader/schema pattern:**

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const articles = defineCollection({
  loader: glob({ base: "./src/content/articles", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().refine((value) => value.trim().length > 0),
    description: z.string().refine((value) => value.trim().length > 0),
    summary: z.string().refine((value) => value.trim().length > 0),
    section: z.string(),
    author: z.string(),
    slug: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    draft: z.boolean(),
    youtubeId: z.string()
  }).superRefine(validateArticleData)
});

export const collections = { articles };
```

The schema owns required shapes and delegates policy to production pure functions. Use the current `src/content.config.ts` API, not legacy `src/content/config.ts`. Keep one mixed collection; section metadata, not folder names, determines identity.

### `src/lib/articles.ts` (service, file-I/O / batch)

**Analog:** None. Authority: `01-CONTEXT.md` D-09/D-14 and `01-RESEARCH.md` Pattern 3 (lines 303-325).

Expose two unambiguous named wrappers: `getPublicArticles()` and `getPreviewArticles()`. Both load and validate the complete collection and collision set first. The public wrapper filters `draft === false`; the preview wrapper fails closed outside development. Do not use a boolean-option query or add a preview URL family.

### MDX component family (component/provider, transform/request-response)

**Files:** `src/components/ContractNote.astro`, `src/components/mdx-components.ts`

**Analog:** None. Authority: `01-CONTEXT.md` D-15 and the render example in `01-RESEARCH.md` lines 436-458.

Provide one minimal semantic, visually unstyled proof component and export it through one central component map/allowlist. Article MDX must not import it. Do not add styling, a component framework, or speculative component families; Phase 2 owns reader UI.

### `src/pages/[section]/[slug].astro` (route/component, request-response)

**Analog:** None. Authority: current Astro route/render example in `01-RESEARCH.md` lines 303-325 and 436-458.

**Route enumeration pattern:**

```ts
export async function getStaticPaths() {
  const entries = import.meta.env.DEV
    ? await getPreviewArticles()
    : await getPublicArticles();

  return entries.map((article) => ({
    params: pathParamsFor(article),
    props: { article }
  }));
}
```

**Render pattern:**

```astro
---
import { render } from "astro:content";
import { mdxComponents } from "../../components/mdx-components";
const { article } = Astro.props;
const { Content } = await render(article);
---
<html lang="ar" dir="rtl">
  <body><main><h1>{article.data.title}</h1><p>{article.data.summary}</p><Content components={mdxComponents} /></main></body>
</html>
```

Use the final Arabic route family, pure path/param derivation, and semantic proof markup only. Title and filename never feed route identity. No final layout, metadata system, YouTube player, sitemap, or visual polish belongs here.

### `src/content/articles/*.{md,mdx}` (model/content, file-I/O)

**Analog:** None. Authority: `01-CONTEXT.md` D-04/D-07/D-19 and `01-RESEARCH.md` structure (lines 219-242).

Keep only valid, flat Markdown and approved-component MDX proof entries. Each explicitly supplies all required frontmatter and is clearly marked as a Phase 1 fixture. Invalid cases remain in-memory in tests so normal dev/check/build stays green.

### `tests/content-contract.test.ts` (test, batch / transform)

**Analog:** None. Authority: `01-VALIDATION.md`, D-17/D-18, and Node example in `01-RESEARCH.md` lines 479-492.

```ts
import test from "node:test";
import assert from "node:assert/strict";

test("changing a title does not change the public path", () => {
  const before = articlePath(validArticle);
  const after = articlePath({ ...validArticle, data: { ...validArticle.data, title: "عنوان جديد" } });
  assert.equal(after, before);
});
```

Use one table-driven native test file covering the full locked minimum matrix: valid and rejected slug classes, title independence, collision diagnostics, every required fact, registries, exact dates, video IDs, draft separation and production preview guard, MDX policy, and temporary fourth-section injection. Do not add fixtures to production content or a third-party runner.

### `README.md` (documentation, file-I/O)

**Analog:** None. Authority: `01-SPEC.md` PUB-01 and `01-RESEARCH.md` recommended structure.

Document exact runtime selection, install, authoring fields, Markdown-default/MDX restrictions, `npm run dev`, `npm test`, `npm run check`, `npm run build`, and `npm run verify`. Keep reader-facing sample content Arabic; developer commands and identifiers may remain code literals. Do not document nonexistent deployment, production origin, analytics, or redirects.

## Shared Patterns

### One validation boundary

Apply to `registries.ts`, `content-contract.ts`, `content.config.ts`, `articles.ts`, and route generation: raw-source policy → per-entry schema/pure semantic validation → all-entry path collision validation → environment-specific draft query → path helper → static route. Downstream route/render code trusts the validated result and does not revalidate fields.

### Fail-closed diagnostics

Every trust-boundary rejection identifies source, field or complete path, and rule. Never silently normalize identities, default `draft`, coerce editorial dates, or allow unknown registry/component names.

### No authentication or runtime error layer

Authentication, middleware, database transactions, API response formatting, and runtime logging patterns do not apply: Phase 1 is a static build-time pipeline with no server, database, session, or secret.

### Minimal dependency surface

Use Astro/MDX for content loading and rendering, JavaScript `String.prototype.normalize()` and `Map` for identity policy, and Node built-ins for tests. Do not add a parser, slug generator, service abstraction, test framework, frontend runtime, CSS system, or sitemap/player/analytics package.

## No Analog Found

| File / Family | Reason | Planner Authority |
|---|---|---|
| All 15 proposed files/module families | Repository contains planning/instruction artifacts only; no implementation exists | Locked `01-SPEC.md`, `01-CONTEXT.md`, verified `01-RESEARCH.md`, and `01-VALIDATION.md` |

## Metadata

**Analog search scope:** Entire repository, excluding `.git` and `.env*`
**Files scanned:** 1 non-planning file (`AGENTS.md`) plus the four required Phase 1 planning inputs
**Existing implementation files:** 0
**Pattern extraction date:** 2026-08-26
