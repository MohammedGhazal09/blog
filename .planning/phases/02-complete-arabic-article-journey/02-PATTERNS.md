# Phase 2: Complete Arabic Article Journey - Pattern Map

**Mapped:** 2026-08-26
**Files analyzed:** 12 new/modified files or file groups
**Analogs found:** 9 / 12

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/lib/content-contract.ts` | model / validation utility | transform | `src/lib/content-contract.ts` lines 8-24, 42-99, 166-207 | exact, extend in place |
| `src/content.config.ts` | config / schema | transform | `src/content.config.ts` lines 7-34 | exact, extend in place |
| `src/pages/[section]/[slug].astro` | route / SSG component | request-response at build time | `src/pages/[section]/[slug].astro` lines 1-38 | exact, extend in place |
| `src/components/YouTubePlayer.astro` | component | event-driven progressive enhancement | `src/components/ContractNote.astro` lines 1-5 for component size; Phase 2 research lines 341-415 for behavior | partial; behavior is new |
| `src/content/articles/contract-markdown.md` | content fixture | file-I/O / transform | existing file plus README authoring contract lines 23-54 | exact, enrich in place |
| `src/content/articles/contract-mdx.mdx` | content fixture | file-I/O / transform | existing file plus `src/components/mdx-components.ts` lines 1-6 | exact, enrich in place |
| `src/content/articles/contract-draft.md` | content fixture | file-I/O / transform | existing file plus `src/lib/articles.ts` lines 9-24 | exact, preserve draft proof |
| `tests/content-contract.test.ts` | test | batch / transform | `tests/content-contract.test.ts` lines 1-55, 114-220 | exact, extend in place |
| `tests/article-journey.spec.ts` | browser test | request-response + event-driven | `tests/content-contract.test.ts` lines 1-55 for local test style; Phase 2 research lines 521-548 | role-adjacent; browser test is new |
| `playwright.config.ts` | test config | request-response | `astro.config.mjs` lines 1-11 and `package.json` lines 11-17 for small declarative config | partial; Playwright config is new |
| `package.json` and `package-lock.json` | config | batch | `package.json` lines 6-17, 19-27 | exact, extend scripts/dev dependencies |
| `README.md` | documentation | file-I/O | `README.md` lines 23-54, 68-105 | exact, extend authoring and verification instructions |

The Phase 2 implementation should not modify `src/lib/articles.ts`, `src/config/registries.ts`, `src/components/mdx-components.ts`, `src/components/ContractNote.astro`, or `astro.config.mjs`. They are analogs and invariants, not feature targets.

## Pattern Assignments

### `src/lib/content-contract.ts` (model / validation utility, transform)

**Analog:** same file; add reference data at the existing trust boundary.

**Imports and type pattern** (lines 1-24):

```typescript
import {
  authorRegistry,
  sectionRegistry,
  type AuthorRecord,
  type SectionRecord,
} from "../config/registries.ts";

export type ArticleData = {
  title: string;
  description: string;
  summary: string;
  section: string;
  author: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  draft: boolean;
  youtubeId: string;
};
```

Add one exported `ArticleReference` shape and one optional `references` property beside the existing article facts. Do not create another model file.

**Diagnostic pattern** (lines 42-75):

```typescript
function fail(location: string, rule: string): never {
  throw new Error(`${location}: ${rule}`);
}

function isArabicLetter(character: string): boolean {
  return /\p{Letter}/u.test(character) && /\p{Script=Arabic}/u.test(character);
}

function assertNonEmpty(
  value: unknown,
  source: string,
  field: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`${source}.${field}`, "must be a non-empty string");
  }
}
```

Reference errors should retain `source.references.{index}.{field}` locations and reuse `assertNonEmpty`, `isArabicLetter`, and `fail`.

**Core semantic-validation pattern** (lines 166-207):

```typescript
export function validateArticleData(
  data: ArticleData,
  source: string,
  options: ValidationOptions = {},
): void {
  const sections = options.sections ?? sectionRegistry;
  const authors = options.authors ?? authorRegistry;
  const today = options.today ?? new Date().toISOString().slice(0, 10);

  assertRegistries(sections, authors);
  assertNonEmpty(data.title, source, "title");
  // existing field, registry, date, draft, and YouTube checks continue here
}
```

Append reference validation inside this function. Parse each destination with the native `URL` parser; require an absolute `https:` URL, a hostname, and no username/password. Require a non-empty Arabic-facing label. Fail closed; the route must not repair invalid data.

**Security pattern:** keep the existing 11-character YouTube ID allowlist at lines 204-206. The player may receive only this validated ID, never a content-provided embed URL.

---

### `src/content.config.ts` (config / schema, transform)

**Analog:** same file.

**Imports and local primitive pattern** (lines 1-7):

```typescript
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

import { validateArticleData } from "./lib/content-contract.ts";

const nonEmpty = z.string().refine((value) => value.trim().length > 0, "must not be empty");
```

Use built-in `astro/zod`; add no Zod dependency or schema abstraction.

**Shape plus shared semantic validator** (lines 9-34):

```typescript
const articles = defineCollection({
  loader: glob({ base: "./src/content/articles", pattern: "**/*.{md,mdx}" }),
  schema: z
    .object({
      title: nonEmpty,
      // existing fields
      youtubeId: z.string(),
    })
    .superRefine((data, context) => {
      try {
        validateArticleData(data, `article:${data.slug || "unknown"}`);
      } catch (error) {
        context.addIssue({
          code: "custom",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }),
});
```

Add `references: z.array(z.object({ label: nonEmpty, url: nonEmpty }).strict()).optional()`. Keep protocol and Arabic-label policy in `validateArticleData` so production and unit tests share one rule.

---

### `src/pages/[section]/[slug].astro` (route / SSG component, build-time request-response)

**Analog:** same route; it is already the reusable article layout. Do not add a second layout or route.

**Imports and public/preview path pattern** (lines 1-20):

```astro
---
import { render } from "astro:content";

import { mdxComponents } from "../../components/mdx-components.ts";
import { getPreviewArticles, getPublicArticles } from "../../lib/articles.ts";
import { pathParamsFor } from "../../lib/content-contract.ts";

export async function getStaticPaths() {
  const articles = import.meta.env.DEV
    ? await getPreviewArticles()
    : await getPublicArticles();

  return articles.map((article) => ({
    params: pathParamsFor(article),
    props: { article },
  }));
}

const { article } = Astro.props;
const { Content } = await render(article);
---
```

Preserve this flow exactly. Do not call `getCollection` directly or change route identity.

**Arabic shell and restricted MDX pattern** (lines 23-38):

```astro
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <main>
      <article>
        <h1>{article.data.title}</h1>
        <p>{article.data.summary}</p>
        <Content components={mdxComponents} />
      </article>
    </main>
  </body>
</html>
```

Keep `lang`, `dir`, landmarks, one `h1`, and `Content components={mdxComponents}`. Replace only the proof markup with this document order: title, registry-backed facts, labelled `الخلاصة`, authored content, conditional references, then player/direct continuation.

**Registry source pattern** (`src/config/registries.ts` lines 12-37):

```typescript
export const sectionRegistry = {
  generalIssues: {
    label: "القضايا العامة",
    description: "مقالات وتعليقات في القضايا العامة ذات الاهتمام المشترك.",
    slug: "القضايا-العامة",
    order: 2,
  },
  // other registered sections
} as const satisfies Readonly<Record<string, SectionRecord>>;

export const authorRegistry = {
  ahmedElMangawy: { name: "أحمد المنجاوي" },
} as const satisfies Readonly<Record<string, AuthorRecord>>;
```

Resolve display facts from these registries in route frontmatter. Do not duplicate author or section labels in frontmatter/body.

**Date pattern:** use one route-local `Intl.DateTimeFormat("ar", { dateStyle: "long", timeZone: "UTC" })`, parse validated date-only strings at explicit UTC midnight, and render `<time datetime={raw}><bdi dir="auto">{formatted}</bdi></time>`. A shared date utility is unnecessary for this single consumer.

**Conditional pattern:** guard the complete update row and complete references section. Missing optionals must emit no heading, wrapper, separator, or gap.

**Styling pattern:** one route-owned style block with intentional `:global(...)` selectors for rendered Markdown/MDX. Use the UI-SPEC values: system fonts; body `1.125rem/1.9`; `70ch`; logical properties; `#fffdf8`, `#1c1917`, `#166534`; `3px` visible focus; `44px` standalone targets; `aspect-ratio: 16 / 9`; padding breakpoint at `48rem`. Never hide horizontal overflow.

---

### `src/components/YouTubePlayer.astro` (component, event-driven)

**Nearest component convention:** `src/components/ContractNote.astro` lines 1-5 is a single-responsibility Astro component with native markup and no framework runtime:

```astro
<aside>
  <strong>ملاحظة اختبار عقد المحتوى:</strong>
  {" "}
  <slot />
</aside>
```

The player is the only justified new component because its markup, state, and browser script form one cohesive boundary.

**Behavior pattern:** follow `02-RESEARCH.md` lines 341-415. Accept validated `youtubeId` and article `title`; construct the direct URL with `encodeURIComponent`; emit the media heading, privacy note, 16:9 local placeholder, initially hidden native button, initially hidden polite error, and permanent same-tab anchor outside the replaceable region.

Attach one processed Astro `<script>` that:

1. Finds each `data-video-region`.
2. Registers the listener before setting `button.hidden = false`.
3. Uses both `{ once: true }` and an existing-iframe guard.
4. Creates only `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` with no autoplay parameter.
5. Sets `iframe.title` via a DOM property, replaces the button, and focuses the iframe.
6. On construction error, hides the button, reveals the Arabic `role="status"` error, and leaves the direct link untouched.

Do not use `innerHTML`, a remote poster, preconnect, YouTube script, custom controls, or a new production dependency.

---

### Proof article files (content fixtures, file-I/O / transform)

**Analog:** existing authoring contract in `README.md` lines 23-54:

```markdown
---
title: "عنوان المقالة"
description: "وصف موجز مناسب لاكتشاف المقالة."
summary: "الخلاصة التي تظهر للقارئ."
section: "generalIssues"
author: "ahmedElMangawy"
slug: "عنوان-عربي-ثابت"
publishedAt: "2026-08-26"
draft: true
youtubeId: "dQw4w9WgXcQ"
---
```

Enrich both public proofs with an introduction, sequential `h2`/`h3` headings, substantive body, conclusion, and representative bidi values. Put `updatedAt` plus valid structured references on exactly one public proof; omit both on the other to prove clean absence. Keep the draft a draft and keep all route slugs/title-independent identities unchanged.

**Restricted MDX pattern** (`src/components/mdx-components.ts` lines 1-6):

```typescript
import ContractNote from "./ContractNote.astro";
import type { ApprovedMdxComponentName } from "../lib/mdx-policy.ts";

export const mdxComponents = {
  ContractNote,
} satisfies Record<ApprovedMdxComponentName, unknown>;
```

The MDX proof may use only `<ContractNote>` without imports. Do not add the player or references to the MDX allowlist.

---

### `tests/content-contract.test.ts` (test, batch / transform)

**Imports, fixtures, and diagnostics pattern** (lines 1-52):

```typescript
import assert from "node:assert/strict";
import test from "node:test";

import {
  validateArticleData,
  type ArticleData,
  type ArticleRecord,
} from "../src/lib/content-contract.ts";

const fixedToday = "2026-08-26";
const validData: ArticleData = {
  // one complete valid baseline
};

function article(data: Partial<ArticleData> = {}, id = "contract-markdown"): ArticleRecord {
  return { id, data: { ...validData, ...data } };
}

function assertDiagnostic(action: () => unknown, expectedParts: readonly string[]): void {
  assert.throws(action, (error: unknown) => {
    assert.ok(error instanceof Error);
    for (const part of expectedParts)
      assert.match(error.message, new RegExp(part, "iu"));
    return true;
  });
}
```

Extend `validData` only as needed and add table-driven cases beside the existing semantic failures. Cover undefined/empty/nonempty references; blank/non-Arabic-facing labels; malformed, relative, HTTP, JavaScript, and credential-bearing URLs; and one valid absolute HTTPS URL. Keep every Phase 1 slug, route, draft, registry, and MDX test.

---

### `tests/article-journey.spec.ts` (browser test, request-response + event-driven)

**Nearest local convention:** small direct tests with descriptive names and no helper framework beyond the runner (`tests/content-contract.test.ts` lines 1-55).

**Browser-specific analog:** `02-RESEARCH.md` lines 521-548:

```typescript
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("published Markdown has no serious or critical axe violations", async ({ page }) => {
  await page.goto("/القضايا-العامة/اختبار-عقد-المحتوى/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(
    results.violations.filter(
      ({ impact }) => impact === "serious" || impact === "critical",
    ),
  ).toEqual([]);
});
```

Keep one vertical spec covering both public Markdown/MDX routes, Arabic/RTL semantics, ordered document structure, optionals present/absent, bidi markers, direct-link degraded modes, initial zero YouTube-family requests, exactly-one activation, iframe failure, keyboard/focus, five widths, and axe. Do not create one spec file per requirement.

---

### `playwright.config.ts` (test config, request-response)

**Config shape analog** (`astro.config.mjs` lines 1-11):

```javascript
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  trailingSlash: "always",
  integrations: [mdx()],
});
```

Use Playwright's `defineConfig`, one Chromium project, built-site preview web server, and `tests/article-journey.spec.ts` match. Every `outputDir`, HTML report, trace, screenshot, video, and snapshot path must resolve beneath `.artifacts/`, which is already ignored by `.gitignore` line 4. Do not create browser output while planning.

---

### `package.json` and `package-lock.json` (config, batch)

**Exact runtime and composite gate pattern** (`package.json` lines 6-17):

```json
"packageManager": "npm@11.17.0",
"engines": {
  "node": ">=24.19.0 <25",
  "npm": ">=11.17.0 <12"
},
"scripts": {
  "test": "...tests/content-contract.test.ts...",
  "check": "astro check",
  "build": "astro build",
  "verify": "npm test && npm run check && npm run build"
}
```

Preserve the exact runtime guard. Add exact dev dependencies only for `@playwright/test@1.62.1` and `@axe-core/playwright@4.13.0`, plus focused `preview`/`test:browser` scripts. Append the browser gate after production build in `verify`. Commit the npm-generated lockfile change; add no production dependency.

---

### `README.md` (documentation, file-I/O)

**Analog:** current Arabic authoring and verification sections at lines 23-54 and 91-105. Extend the frontmatter example with optional references and explain Arabic-facing labels plus absolute HTTPS-only destinations. Document the required complete article heading sequence and browser/full verification commands. Keep all reader/author-facing documentation Arabic.

## Shared Patterns

### Public and Preview Selection

**Source:** `src/lib/articles.ts` lines 9-24  
**Apply to:** route generation and draft regression tests

```typescript
async function getValidatedArticles() {
  const articles = await getCollection("articles");
  assertUniqueArticlePaths(articles);
  return articles;
}

export async function getPublicArticles() {
  return selectPublicArticles(await getValidatedArticles());
}

export async function getPreviewArticles() {
  return selectPreviewArticles(await getValidatedArticles(), import.meta.env.DEV);
}
```

No Phase 2 code should bypass this boundary.

### Error Handling

**Source:** `src/lib/content-contract.ts` lines 42-44 and `src/content.config.ts` lines 24-32  
**Apply to:** reference validation

Throw location-rich errors from the pure validator; translate them into one Astro schema custom issue. In the browser, catch only player construction errors, reveal the fixed Arabic status message, and preserve static content/direct navigation.

### Validation and Encoding

**Source:** `src/lib/content-contract.ts` lines 67-75, 166-207  
**Apply to:** references and media URLs

Validate all author input during the build. Hardcode destination hosts in trusted code and encode the already validated YouTube ID when composing a path. Never accept full iframe URLs or use raw HTML insertion.

### Arabic and RTL

**Source:** `src/pages/[section]/[slug].astro` lines 23-38 and `02-UI-SPEC.md` lines 189-197  
**Apply to:** route, player, proof content, and browser tests

Retain root `lang="ar" dir="rtl"`; ordinary prose inherits RTL. Use `<bdi dir="ltr">` only for raw URLs/IDs/code-like fragments and `<bdi dir="auto">` for formatted mixed-number dates. Use start alignment and logical CSS properties.

### Restricted MDX

**Source:** `src/components/mdx-components.ts` lines 1-6 and existing tests lines 283-375  
**Apply to:** route and MDX proof

Keep the exact `ContractNote` map and all structural policy tests. Trusted media and references belong outside authored MDX.

### Test Artifacts

**Source:** `.gitignore` line 4 and `02-VALIDATION.md` lines 20-25  
**Apply to:** Playwright config and browser scripts

All reports, traces, screenshots, videos, snapshots, and temporary browser files stay under `.artifacts/`. No test artifact may enter `src/`, `tests/`, or `.planning/`.

## No Analog Found

| File | Role | Data Flow | Reason / planner fallback |
|---|---|---|---|
| `src/components/YouTubePlayer.astro` | component | event-driven | No existing client enhancement. Use the bounded native pattern in `02-RESEARCH.md` lines 341-415 and the small Astro component convention. |
| `tests/article-journey.spec.ts` | browser test | request-response + event-driven | No existing browser suite. Use the Playwright/axe excerpt in research lines 521-548 and the required scenarios in lines 783-805. |
| `playwright.config.ts` | test config | request-response | No existing browser config. Use official `defineConfig`, the existing small config style, and the `.artifacts/` invariant. |

## Planner Recommendations

1. Wave 0 should add exact browser dev dependencies, config, scripts, and the vertical browser spec skeleton.
2. Implement the build-time reference contract and unit tests before templates consume references.
3. Then enrich proof content and complete the existing route plus the single player component.
4. Finish with browser/degraded-mode checks and Arabic README authoring guidance.
5. Do not plan changes to registries, articles query, MDX map/policy, Astro config, or a new layout unless implementation proves a locked criterion cannot be met without one.

## Metadata

**Analog search scope:** `src/pages`, `src/components`, `src/lib`, `src/config`, `src/content`, `tests`, root config/scripts/docs, Phase 1 context, and Phase 2 specification/research/validation  
**Files scanned:** 20 source, test, config, content, and planning files  
**Pattern extraction date:** 2026-08-26
