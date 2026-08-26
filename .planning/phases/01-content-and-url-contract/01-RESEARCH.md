# Phase 1: Content and URL Contract - Research

**Researched:** 2026-08-26
**Domain:** Astro static content contracts, Arabic URL identity, and build-time authoring safety
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Static Project Baseline
- **D-01:** Use the exact researched baseline—Astro 7.2.7 static output, Node 24.19.0 LTS, npm 11.17.0, TypeScript 6.0.3, official MDX integration, and a committed `package-lock.json`. Do not add a server adapter or UI runtime.
- **D-02:** Pin direct dependency versions exactly for the initial baseline. Record the Node version in the repository and declare compatible engines; upgrades are deliberate follow-up changes.
- **D-03:** Expose ordinary `dev`, `test`, `check`, `build`, and composite `verify` scripts. The composite gate runs Node contract tests, Astro diagnostics, and a production build.

### Content Organization and Registries
- **D-04:** Use one `articles` content collection that accepts `.md` and `.mdx`. Keep launch content flat under one articles directory; explicit `section` metadata—not folders or filenames—is authoritative.
- **D-05:** Keep section and author facts in central typed registries. Use stable ASCII internal keys and Arabic labels, descriptions, and public slugs; frontmatter stores only the keys.
- **D-06:** Start with one truthful author registry entry for Ahmed El-Mangawy. Do not build multi-author UI or editorial roles, but keep the key validated so later rendering does not duplicate identity facts.
- **D-07:** Required article facts are `title`, `description`, `summary`, `section`, `author`, explicit `slug`, `publishedAt`, explicit `draft`, and `youtubeId`; `updatedAt` is optional and constrained by the spec.

### Public Identity and Route Derivation
- **D-08:** Use one pure path helper to derive `/{sectionSlug}/{articleSlug}/`. Configure one trailing-slash policy and use the helper everywhere; neither filename nor title contributes to public identity.
- **D-09:** Use the final dynamic article route family for local preview and production. Development may intentionally enumerate drafts; production enumeration always uses the public-only helper. Do not create a second preview schema or permanent preview URL family.
- **D-10:** Do not configure a fake production hostname or generate redirects in Phase 1. Relative path identity is locked now; canonical origin and redirect policy remain in their assigned later phases.

### Validation and Diagnostics
- **D-11:** Validate field shapes and per-entry relationships at the Astro content-schema boundary. Put Unicode/slug rules, registry membership, date relationships, draft filtering, path derivation, and collection-wide collision checks in small pure functions so downstream code can trust validated records.
- **D-12:** Slug input must already satisfy the canonical form. Reject instead of silently normalizing or rewriting, because a silent repair could change a public identity without the owner noticing.
- **D-13:** Validation diagnostics identify the source article, field or path, and failed rule. Prefer collecting independent preflight failures in one run when the implementation stays simple; correctness and actionable location take precedence over custom error presentation.
- **D-14:** The production query is the only downstream entry point for public records and excludes drafts before route generation. Preview inclusion requires an explicit development-only call.

### Restricted MDX
- **D-15:** Markdown is the default authoring format. MDX receives components through one central component map and proves the mechanism with one minimal, semantic, visually unstyled component that Phase 2 may style or replace.
- **D-16:** Run a source preflight before Astro compilation that rejects article-authored ESM import/export, `<script>`, raw `<iframe>`, and JSX component names outside the allowlist. Do not allow per-article dependency imports.

### Verification
- **D-17:** Use Node's built-in test runner and assertions for pure contract branches; do not add Vitest, Jest, or an E2E framework in this phase.
- **D-18:** Tests cover valid Arabic slugs, every rejected slug class, title-independent paths, collisions, required fields, registry membership, date rules, video IDs, draft separation, MDX restrictions, and temporary registry extension.
- **D-19:** A production build with valid Markdown and approved MDX is the integration check. Invalid cases are isolated as tests/fixtures and must not live in the production content directory during a normal build.

### the agent's Discretion
- Exact internal filenames and export names, provided the single-boundary and single-helper decisions remain intact.
- Name and minimal semantic markup of the one approved proof MDX component.
- Whether actionable preflight diagnostics are emitted individually or as a compact aggregate when both approaches satisfy the spec without extra dependencies.
- Wording of non-final sample article content; it must be clearly marked as a Phase 1 contract fixture rather than one of the three reviewed launch articles.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEO-01 | Every published article has an explicit, stable, clean Arabic URL slug that is not silently regenerated when its title changes. | Pure canonical-slug predicate, one path builder, normalized complete-path collision check, and title-independence test. |
| PUB-01 | The owner can create or edit Markdown/MDX and preview the same content model locally. | One mixed Markdown/MDX `articles` collection, final route family in dev and build, two valid proof entries, and a documented `npm run dev` flow. |
| PUB-02 | Production rejects missing or invalid required article facts. | Astro schema for shapes plus pure semantic validation for registries, dates, and YouTube IDs, with table-driven negative tests. |
| PUB-03 | Production rejects duplicate routes, non-normalized slugs, and unsafe controls. | Reject-before-normalize slug validation, UTS #39 control coverage, and all-entry collision preflight before route generation. |
| PUB-04 | Draft articles cannot appear in production routes or discovery output. | Separate public and explicit dev-preview query functions; public filtering occurs before `getStaticPaths()`. |
| PUB-05 | MDX uses only approved components and cannot add arbitrary scripts or iframe sources. | Raw-source preflight before Astro compilation, one component allowlist/map, and in-memory policy fixtures. |
| PUB-06 | Future sections are registry/content changes rather than new application families. | One typed registry used by schema membership and path derivation, proven by a temporary fourth-section unit case. |
</phase_requirements>

## Summary

Phase 1 should be implemented as one build-time trust boundary, not as several partially overlapping validators. Raw article source first passes an MDX-policy preflight; Astro then loads `.md` and `.mdx` through one content collection and validates per-entry shapes; pure functions enforce semantic rules and collection-wide path uniqueness; only then does a query branch expose either development-preview records or production-public records. This sequence directly reflects the locked specification and prevents routes from inventing identity. [VERIFIED: .planning/phases/01-content-and-url-contract/01-SPEC.md] [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

Use Astro's current Content Layer API: `src/content.config.ts`, `glob()` from `astro/loaders`, `z` from `astro/zod`, `getCollection()`/`render()` from `astro:content`, and static dynamic routes through `getStaticPaths()`. Astro documents each of these APIs for current content collections and static routing. [CITED: https://docs.astro.build/en/guides/content-collections/] [CITED: https://docs.astro.build/en/guides/routing/#dynamic-routes]

Keep the implementation small: four external npm packages, one test file using Node's built-in runner, no production origin, no SEO output, no sitemap, no YouTube player, no CSS system, and no browser test framework. Phase 1's route is an intentionally unstyled semantic proof surface; Phase 2 owns the finished RTL reader UI. [VERIFIED: .planning/phases/01-content-and-url-contract/01-SPEC.md] [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

**Primary recommendation:** Plan two implementation waves: (1) pinned static baseline plus registries/schema/pure contract tests, then (2) MDX preflight, final route/query boundary, valid Markdown/MDX proof content, authoring instructions, and the full `verify` gate.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Markdown/MDX authoring | Repository / static storage | Frontend Server (build-time SSG) | Files are the source of truth and are consumed only during dev/build. |
| Raw MDX policy enforcement | Frontend Server (build-time SSG) | — | The source must fail before MDX can compile imports, scripts, iframes, or unknown components. |
| Article field validation | Frontend Server (build-time SSG) | Repository diagnostics | Astro's build/dev content boundary owns shape and semantic rejection. |
| Arabic URL identity | Frontend Server (build-time SSG) | CDN / Static | A pure build helper derives the path; the CDN later serves that exact static directory path. |
| Draft separation | Frontend Server (build-time SSG) | — | Production route enumeration must receive only public records; the browser must never decide visibility. |
| Local preview | Frontend Server (Astro dev) | Browser / Client | Astro dev renders the same validated records; the browser only displays generated HTML. |
| Production article output | Frontend Server (build-time SSG) | CDN / Static | `getStaticPaths()` emits static pages with no request-time backend. |

The tier assignments are derived from the project's one-way static architecture and locked no-backend/no-database decision. [VERIFIED: .planning/research/ARCHITECTURE.md] [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

## Project Constraints (from AGENTS.md)

- Use GSD workflow entry points before repository changes and keep planning/state artifacts synchronized through GSD commands. [VERIFIED: AGENTS.md]
- Do not read any `.env` file without explicit user permission. Phase 1 requires no secret or environment file. [VERIFIED: AGENTS.md] [VERIFIED: .planning/research/STACK.md]
- Choose the simplest implementation that fully meets current requirements; do not preserve backward compatibility or scaffold speculative future features. [VERIFIED: AGENTS.md]
- Prefer established maintained libraries over custom replacements; native platform features and the locked Astro APIs cover this phase. [VERIFIED: AGENTS.md] [VERIFIED: .planning/research/STACK.md]
- Run `find-skills` before major coding work and use relevant skills; `gsd-phase-researcher`, `find-skills`, and `entity-seo` informed this research. Entity guidance reinforces stable centralized author identity, but entity schema remains out of scope until later phases. [VERIFIED: AGENTS.md]
- UI-related implementation must run `npx ui-skills start`. The proof page remains semantic and unstyled because no Phase 1 UI design contract exists. [VERIFIED: AGENTS.md] [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]
- After actual rendered UI changes, use the configured visual-QA workflow if available; keep all browser artifacts in one ignored output directory outside source and `.planning`. [VERIFIED: AGENTS.md]
- Preserve a clean worktree, update `STATE.md` after adjustments through GSD state commands, and never stop or interrupt a running subagent. [VERIFIED: AGENTS.md]
- Reader-facing content remains Arabic-only; the application is static Markdown/MDX, minimal, crawlable without client JavaScript, and contains no CMS/database/authentication. [VERIFIED: AGENTS.md]

## Standard Stack

### Core

| Technology | Version | Purpose | Why Standard |
|------------|---------|---------|--------------|
| Node.js | 24.19.0 LTS | Build runtime and native TypeScript test execution | Locked runtime; Node documents stable built-in test execution and type stripping for erasable TypeScript syntax. [CITED: https://nodejs.org/docs/latest-v24.x/api/test.html] [CITED: https://nodejs.org/docs/latest-v24.x/api/typescript.html] |
| npm | 11.17.0 | Exact dependency installation and committed lockfile | Locked package manager; no second package manager is justified. [VERIFIED: .planning/research/STACK.md] |
| `astro` | 7.2.7 | Static build, content loading, dev preview, rendering, and route generation | Official current project framework; exact registry version and official APIs verified. [VERIFIED: npm registry] [CITED: https://docs.astro.build/en/guides/content-collections/] |
| `@astrojs/mdx` | 7.0.8 | Official MDX compilation and component rendering | Required only because PUB-01/PUB-05 explicitly include MDX; official integration matches Astro 7. [VERIFIED: npm registry] [CITED: https://docs.astro.build/en/guides/integrations-guide/mdx/] |

### Development

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@astrojs/check` | 0.9.10 | Astro and TypeScript diagnostics | Run after unit tests and before the production build in `verify`. [VERIFIED: npm registry] [CITED: https://docs.astro.build/en/guides/typescript/#type-checking] |
| `typescript` | 6.0.3 | Type checking for Astro/config/contract modules | Exact version is locked to the checker's researched peer range. [VERIFIED: npm registry] [VERIFIED: .planning/research/STACK.md] |
| `node:test` + `node:assert/strict` | Node built-ins | Pure contract regression checks | Use one focused `.test.ts` file; no third-party test package. [CITED: https://nodejs.org/docs/latest-v24.x/api/test.html] |

### Intentionally Not Installed in Phase 1

| Deferred item | Reason |
|---------------|--------|
| `@astrojs/sitemap` | Sitemap and production origin belong to Phase 4. |
| `lite-youtube-embed` | The finished player belongs to Phase 2/5 work, not the proof surface. |
| Prettier / ESLint | Neither is locked or needed to prove the contract; Astro diagnostics plus the small test/build gate are sufficient. |
| React, Tailwind, component kits | No Phase 1 interaction or design system requires a browser/UI runtime. |

The exclusions are locked phase boundaries, not alternative-stack recommendations. [VERIFIED: .planning/phases/01-content-and-url-contract/01-SPEC.md] [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

### Installation

```bash
npm install --save-exact astro@7.2.7 @astrojs/mdx@7.0.8
npm install --save-dev --save-exact @astrojs/check@0.9.10 typescript@6.0.3
```

Create the minimal project files directly rather than invoking an interactive starter over a repository that already contains committed planning artifacts. This is a phase-specific implementation recommendation. [VERIFIED: codebase inventory]

Record `"packageManager": "npm@11.17.0"` and compatible engine ranges (`node >=24.19.0 <25`, `npm >=11.17.0 <12`) in `package.json`, while `.nvmrc` pins the selected Node runtime to exactly `24.19.0`. Direct dependency versions remain exact. [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

Recommended scripts:

```json
{
  "scripts": {
    "dev": "astro dev",
    "test": "node --test tests/content-contract.test.ts",
    "check": "astro check",
    "build": "astro build",
    "verify": "npm test && npm run check && npm run build"
  }
}
```

`astro.config.mjs` should invoke the local content-source preflight at configuration load before exporting the static MDX configuration; therefore `dev`, `check`, and `build` all start behind the same raw-source policy. Keep `output: "static"` and `trailingSlash: "always"` explicit, and omit `site` until the production origin is selected in its assigned later phase. Astro documents static output and trailing-slash configuration. [CITED: https://docs.astro.build/en/reference/configuration-reference/#output] [CITED: https://docs.astro.build/en/reference/configuration-reference/#trailingslash]

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Postinstall | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|-------------|
| `astro@7.2.7` | npm | ~5.5 years | 4,884,660/week | `github.com/withastro/astro` | OK | none reported | Approved |
| `@astrojs/mdx@7.0.8` | npm | ~4.2 years | 1,819,289/week | `github.com/withastro/astro` | OK | none reported | Approved |
| `@astrojs/check@0.9.10` | npm | ~3.1 years | 2,575,121/week | `github.com/withastro/astro` | OK | none reported | Approved |
| `typescript@6.0.3` | npm | ~13.9 years | 273,257,696/week for package | `github.com/microsoft/TypeScript` | OK | none reported | Approved |

Registry versions, creation dates, repositories, weekly downloads, and absent `scripts.postinstall` values were checked on 2026-08-26. Exact releases were published on 2026-08-25 (`astro`), 2026-08-24 (`@astrojs/mdx`), 2026-07-27 (`@astrojs/check`), and 2026-04-16 (`typescript@6.0.3`). [VERIFIED: npm registry]

Slopcheck 0.6.1 returned `OK` for all four names when explicitly forced to the npm ecosystem. The explicit ecosystem is important in this currently package-less repository; auto-detection selected PyPI and produced false cross-ecosystem results before the audit was corrected. [VERIFIED: slopcheck npm audit]

**Packages removed due to slopcheck [SLOP] verdict:** none.

**Packages flagged as suspicious [SUS]:** none.

## Architecture Patterns

### System Architecture Diagram

```text
Git-authored .md/.mdx + typed section/author registry
                         │
                         ▼
             Raw source policy preflight
        ┌──────── invalid/forbidden ────────┐
        │                                    ▼
        │                              Stop with source/rule
        ▼
Astro glob loader → per-entry schema → pure semantic validation
        │                    │ invalid       │
        │                    └───────────────► Stop with field/rule
        ▼
All validated entries → complete-path collision preflight
        │                    │ collision
        │                    └───────────────► Stop with both sources/path
        ▼
Environment decision
        ├── development ──► explicit preview query (public + drafts)
        └── production ───► public query (`draft === false` only)
                                      │
                                      ▼
                         one pure path helper
                    /{sectionSlug}/{articleSlug}/
                                      │
                                      ▼
                       Astro `getStaticPaths()`
                                      │
                                      ▼
                   static semantic proof HTML in `dist/`
                                      │
                                      ▼
                    later delivery by CDN (no Phase 1 runtime)
```

This flow uses the same content schema and final route family in dev and production; only the query policy branches. [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

### Recommended Project Structure

```text
.nvmrc                              # exact Node 24.19.0
package.json                        # exact direct packages, engines, scripts
package-lock.json                   # committed lock
astro.config.mjs                    # static, trailing slash, MDX, preflight call
tsconfig.json                       # Astro strict preset; no path aliases needed
README.md                           # install/author/check/preview/build instructions
src/
├── content.config.ts               # one mixed articles collection/schema
├── content/articles/               # flat valid proof content only
├── config/registries.ts            # sections + one author registry
├── lib/content-contract.ts         # slug/date/video/path/set pure rules
├── lib/articles.ts                 # Astro loading + public/preview queries
├── lib/mdx-policy.ts               # raw-source policy and filesystem preflight
├── components/ContractNote.astro   # semantic, unstyled approved proof component
├── components/mdx-components.ts    # one central component map/allowlist
└── pages/[section]/[slug].astro     # final route family and proof renderer
tests/
└── content-contract.test.ts        # all pure contract branches
```

Use in-memory invalid records and source strings in the single test file. Keep only valid Markdown/MDX proof entries in `src/content/articles/`, because production content directories must always build normally. [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

### Pattern 1: Schema for Shape, Pure Functions for Policy

**What:** The Astro schema owns required types and calls pure refinements; pure modules own reusable slug, date, registry, video, path, draft, and collision rules.

**When to use:** Every content load, unit test, route query, and later consumer.

**Why:** Current Astro content collections support loader-level schemas, while collection-wide relationships necessarily run after entries have been loaded. [CITED: https://docs.astro.build/en/guides/content-collections/]

```ts
// Source: Astro content collections official guide
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

The exact field-level refinements should delegate to the pure contract module so tests exercise production logic, not a duplicate validator. [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

### Pattern 2: Reject Canonical Slugs; Never Repair Them

**What:** Check `slug.normalize("NFC") === slug`; reject controls/format characters, slash, backslash, percent, dots, edge/repeated hyphens, empty segments, and any character outside Arabic letters/marks plus ASCII/Arabic digits.

**When to use:** Registry initialization and every article schema validation.

**Implementation note:** Split on `-`, require every segment to start with an Arabic letter or allowed digit, and then allow Arabic combining marks within the segment. A code-point predicate is clearer than one opaque regular expression and makes each failure class independently testable. Unicode normalization and bidi-control guidance support rejecting noncanonical and deceptive identifier forms. [CITED: https://unicode.org/reports/tr15/] [CITED: https://www.unicode.org/reports/tr39/#Bidirectional_Controls]

```ts
// Source basis: Unicode UAX #15 and UTS #39; project policy is locked in CONTEXT.md
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

Do not return a normalized string. Rejection is the product behavior because silent repair can change public identity. [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

### Pattern 3: Validate All Entries Before Filtering Drafts

**What:** Load all entries, validate collection invariants across all of them, then expose two named wrappers: `getPublicArticles()` and `getPreviewArticles()`.

**When to use:** Every route/index consumer. Production code imports only the public wrapper; the preview wrapper throws unless Astro is in development mode.

**Why:** Validating only the already-filtered set can hide collisions or malformed drafts until publication, while filtering after `getStaticPaths()` can leak a draft route. [VERIFIED: .planning/research/PITFALLS.md]

```ts
// Source: Astro static dynamic routing guide + locked project query policy
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

`pathParamsFor()` and `articlePath()` must derive from the same registered section slug and explicit article slug. The title and file ID are never inputs. [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

### Pattern 4: One Raw-Source MDX Gate

**What:** Before Astro compilation, scan article source after excluding frontmatter, fenced code, and inline code spans; reject top-level ESM `import`/`export`, `<script>`, `<iframe>`, and JSX component tags not present in the central allowlist.

**When to use:** At Astro configuration load and directly from tests/preflight helpers.

**Why:** MDX officially supports ESM and component expressions, so a component map alone does not prohibit article-authored executable imports. [CITED: https://docs.astro.build/en/guides/integrations-guide/mdx/] [CITED: https://mdxjs.com/docs/using-mdx/]

Keep the scanner deliberately narrow and fail closed. It is a policy guard for Git-reviewed local files, not a sandbox for hostile uploads; if the trust model changes, disable MDX or adopt parser-level isolation as a new architecture decision. [VERIFIED: .planning/research/PITFALLS.md]

### Pattern 5: Date-Only Facts Stay Date-Only

**What:** Require quoted `YYYY-MM-DD` strings, validate that they represent a real UTC calendar date, compare `updatedAt >= publishedAt`, and compare non-draft publication against an injected `today` value.

**When to use:** Schema refinement and deterministic tests.

**Why:** Injecting the comparison date avoids tests that change with the wall clock. Avoid automatic `Date` coercion because the phase contract is an editorial date, not an instant with a timezone. This is a phase-specific recommendation derived from PUB-02. [VERIFIED: .planning/phases/01-content-and-url-contract/01-SPEC.md]

### Anti-Patterns to Avoid

- **Three collections or routes by section:** duplicates the exact contract PUB-06 exists to centralize. [VERIFIED: .planning/research/ARCHITECTURE.md]
- **Title/filename slug generation:** breaks SEO-01 on an editorial rename. [VERIFIED: .planning/research/PITFALLS.md]
- **Calling `.normalize("NFC")` and accepting the result:** silently changes public identity; reject instead. [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]
- **Checking collisions only after draft filtering:** allows a conflicting draft to remain hidden until publication. [VERIFIED: .planning/research/PITFALLS.md]
- **Boolean draft defaults:** a missing `draft` must fail, not become public or private implicitly. [VERIFIED: .planning/phases/01-content-and-url-contract/01-SPEC.md]
- **Per-article MDX imports:** bypass the component allowlist and make builds dependency/code-execution surfaces. [CITED: https://mdxjs.com/docs/using-mdx/]
- **Invalid fixtures inside production content:** makes ordinary dev/check/build intentionally broken. Use in-memory test tables. [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]
- **Fake `site` origin, sitemap, redirects, or full metadata:** these are explicitly assigned to Phase 4/5. [VERIFIED: .planning/phases/01-content-and-url-contract/01-SPEC.md]
- **Visual polish on the proof route:** no Phase 1 design contract exists; Phase 2 owns layout, typography, accessibility treatment, and the YouTube experience. [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown/MDX parsing | A custom parser or Markdown renderer | Astro content collection + official MDX integration | These official APIs already load, validate, and render both formats. [CITED: https://docs.astro.build/en/guides/content-collections/] |
| Content discovery | Recursive application-level content repository | Astro `glob()` loader | One built-in loader covers the flat source directory. [CITED: https://docs.astro.build/en/reference/content-loader-reference/] |
| Unicode normalization | A normalization table/library | `String.prototype.normalize("NFC")` for comparison, then reject | The JavaScript platform exposes Unicode normalization directly. [CITED: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize] |
| Slug generation/transliteration | Arabic slugify/transliteration | Explicit author-supplied slug + validator | Stability is editorial identity, not an algorithmic title transformation. [VERIFIED: .planning/phases/01-content-and-url-contract/01-SPEC.md] |
| Test framework | Jest/Vitest configuration | `node:test` and `node:assert/strict` | Node 24 provides the required runner/assertions. [CITED: https://nodejs.org/docs/latest-v24.x/api/test.html] |
| Content service layer | Repository/service interfaces around `getCollection()` | Two small named query functions | There is one local content source and no backend. [VERIFIED: .planning/research/ARCHITECTURE.md] |
| Draft access control | Client checks, robots, or a preview route family | Build-time query separation | Draft paths must not exist in production output. [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md] |
| URL collision store | Database/index | In-memory `Map` during build | The collection is local and build-time; a map can report both sources and the complete path. [VERIFIED: .planning/research/ARCHITECTURE.md] |

**Key insight:** The custom code should encode only this project's policy. Astro and Node already own parsing, rendering, routing, type diagnostics, and test execution.

## Common Pitfalls

### Pitfall 1: Treating the Astro Schema as Collection-Wide

**What goes wrong:** Every entry validates individually but two entries produce the same public path.

**Why it happens:** The schema validates one loaded record; collision knowledge exists only after collection loading. [CITED: https://docs.astro.build/en/guides/content-collections/]

**How to avoid:** Run `assertUniqueArticlePaths(allEntries)` before draft filtering and route mapping.

**Warning signs:** Collision logic appears only inside `getStaticPaths()`, or only compares the article slug without the section slug.

### Pitfall 2: Unicode Looks Equal but Is Not Equal

**What goes wrong:** Composed/decomposed Arabic forms, format controls, or bidi controls create deceptive or unstable route strings.

**Why it happens:** Unicode code-point sequences can render similarly while remaining distinct; bidi controls can alter display order. [CITED: https://unicode.org/reports/tr15/] [CITED: https://www.unicode.org/reports/tr39/#Bidirectional_Controls]

**How to avoid:** Reject non-NFC input and every non-allowed code point before path creation; compare canonical complete paths.

**Warning signs:** The validator normalizes and returns a repaired slug, accepts `\p{L}` from every writing system, or reports only “invalid slug” without the rule.

### Pitfall 3: Draft Filtering Happens Too Late

**What goes wrong:** A draft receives a generated static path even if the page later hides or labels it.

**Why it happens:** Visibility is treated as a rendering condition rather than a route-enumeration condition.

**How to avoid:** `getPublicArticles()` filters before any production caller receives records; `getStaticPaths()` never sees a production draft. [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

**Warning signs:** Route props include drafts, templates branch on `article.data.draft`, or a single query accepts an easy-to-misuse boolean option in production code.

### Pitfall 4: An Allowlist Map Is Mistaken for an MDX Sandbox

**What goes wrong:** An MDX file imports code directly or embeds raw script/iframe markup despite the render-time map.

**Why it happens:** MDX supports imports and JSX; component mapping controls supplied components but does not by itself prohibit source syntax. [CITED: https://mdxjs.com/docs/using-mdx/] [CITED: https://docs.astro.build/en/guides/integrations-guide/mdx/]

**How to avoid:** Run the raw-source policy before compilation and keep MDX limited to trusted Git-reviewed content.

**Warning signs:** The only PUB-05 check is “unknown component fails to render,” or article files contain package imports.

### Pitfall 5: Date Coercion Hides Invalid Editorial Facts

**What goes wrong:** Non-date strings roll into another date, future publish dates depend on timezone, or `updatedAt` predates publication.

**Why it happens:** General-purpose date coercion answers “can this become a Date?” rather than “is this the exact declared editorial date?”

**How to avoid:** Exact date-only syntax, round-trip calendar validation, explicit relationship checks, and injected `today` in tests. [VERIFIED: .planning/phases/01-content-and-url-contract/01-SPEC.md]

**Warning signs:** `z.coerce.date()` is the only date rule or tests use the actual current day without injection.

### Pitfall 6: Toolchain Drift Is Ignored

**What goes wrong:** Planning passes but install/verification runs on different Node/npm versions than the locked baseline.

**Why it happens:** The repository currently has no runtime version file and the machine's globally installed tools are older than D-01.

**How to avoid:** Wave 0 upgrades/selects Node 24.19.0 and npm 11.17.0, then records Node in `.nvmrc`, declares engines, and verifies versions before install. [VERIFIED: environment probe 2026-08-26] [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

**Warning signs:** `node --version` remains `v24.8.0` or `npm --version` remains `11.12.1` during execution.

## Code Examples

### Current Astro Content Query and Render

```astro
---
// Source: https://docs.astro.build/en/guides/content-collections/
import { render } from "astro:content";
import { mdxComponents } from "../../components/mdx-components";

const { article } = Astro.props;
const { Content } = await render(article);
---

<!doctype html>
<html lang="ar" dir="rtl">
  <body>
    <main>
      <h1>{article.data.title}</h1>
      <p>{article.data.summary}</p>
      <Content components={mdxComponents} />
    </main>
  </body>
</html>
```

This is proof markup only. Phase 2 replaces/extends it with the finished reader layout and accessibility treatment. [VERIFIED: .planning/phases/01-content-and-url-contract/01-SPEC.md]

### Pure Complete-Path Collision Check

```ts
// Source basis: locked D-08/D-11/D-18 decisions
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

The actual error should retain the path and both source IDs. [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

### Node Native Contract Test

```ts
// Source: https://nodejs.org/docs/latest-v24.x/api/test.html
import test from "node:test";
import assert from "node:assert/strict";

test("changing a title does not change the public path", () => {
  const before = articlePath(validArticle);
  const after = articlePath({ ...validArticle, data: { ...validArticle.data, title: "عنوان جديد" } });
  assert.equal(after, before);
});
```

Node's TypeScript support strips erasable syntax and does not apply `tsconfig` transformations; keep test imports relative with explicit `.ts` extensions and avoid enums, parameter properties, decorators, and path aliases in modules executed directly by Node. [CITED: https://nodejs.org/docs/latest-v24.x/api/typescript.html]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Legacy collection config under `src/content/config.ts` | Content Layer config at `src/content.config.ts` with loaders such as `glob()` | Astro Content Layer API, current in Astro 7 | Planner should use the current loader API and avoid legacy examples. [CITED: https://docs.astro.build/en/guides/content-collections/] |
| Calling a method on an entry to render it | Import `render()` from `astro:content` and pass the entry | Current Content Layer API | Route proof uses `const { Content } = await render(entry)`. [CITED: https://docs.astro.build/en/guides/content-collections/] |
| Transpiling every TypeScript test through a test framework | Node 24 type stripping + `node --test` for erasable `.ts` | Enabled in current Node 24 line | The phase needs no test runner/transpiler dependency. [CITED: https://nodejs.org/docs/latest-v24.x/api/typescript.html] |

**Deprecated/outdated for this phase:** legacy Astro content collection examples, title-derived slug recipes, and MDX examples with per-file imports all conflict with the locked current contract. [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | None. Phase scope and implementation choices are locked, and technical claims above were checked against project artifacts, official documentation, the npm registry, or the local environment. | — | — |

## Open Questions

None block planning. The production origin, redirects, sitemap, real launch content, YouTube behavior, and analytics are deliberately assigned to later phases. [VERIFIED: .planning/phases/01-content-and-url-contract/01-SPEC.md]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback / Action |
|------------|-------------|-----------|---------|-------------------|
| Node.js | All Phase 1 commands | ⚠ wrong locked version | 24.8.0 installed; 24.19.0 required | Install/select 24.19.0 before `npm install`; no version manager was detected. |
| npm | Exact dependency install | ⚠ wrong locked version | 11.12.1 installed; 11.17.0 required | Upgrade with the selected Node baseline or install npm 11.17.0 after Node selection. |
| Git | File-based workflow/lockfile | ✓ | 2.51.0.windows.1 | — |
| npm registry | Package resolution | ✓ | Ping succeeded (527 ms) | Use committed lockfile after initial exact install. |
| Astro CLI | Dev/check/build | ✗ expected | not installed | Installed locally by the Phase 1 package step; invoke through npm scripts. |
| `nvm` / `fnm` / `volta` | Runtime selection convenience | ✗ | — | Manual Node 24.19.0 installation is the available fallback. |

Environment facts were probed locally on 2026-08-26 without reading any `.env` file. [VERIFIED: environment probe 2026-08-26]

**Missing dependencies with no fallback:** Node 24.19.0/npm 11.17.0 are not currently selected and must be addressed in Wave 0 because they are locked rather than optional.

**Missing dependencies with fallback:** Astro and related project packages are absent as expected and will be installed locally from exact versions.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Node.js 24.19.0 built-in `node:test` + `node:assert/strict` |
| Config file | none — exact test file in package script |
| Quick run command | `npm test` |
| Full suite command | `npm run verify` |

Node documents both the built-in test runner and direct execution of supported TypeScript syntax. [CITED: https://nodejs.org/docs/latest-v24.x/api/test.html] [CITED: https://nodejs.org/docs/latest-v24.x/api/typescript.html]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEO-01 | Explicit slug is required; title changes do not alter `/{section}/{slug}/`; trailing slash is singular | unit | `npm test` | ❌ Wave 0 |
| PUB-01 | Both valid `.md` and approved `.mdx` load/render through the collection; local dev command starts | build integration + manual preview smoke | `npm run build`; then `npm run dev` | ❌ Wave 0 |
| PUB-02 | Every required field, registry/date/video relationship, and diagnostic source/field fails correctly | table-driven unit + Astro build | `npm test && npm run check` | ❌ Wave 0 |
| PUB-03 | NFC, separators, dot/percent, controls, bidi controls, hyphens, allowed Arabic code points, and complete-path collisions | table-driven unit | `npm test` | ❌ Wave 0 |
| PUB-04 | Public query excludes drafts; explicit dev preview includes them; draft contributes no production route | unit + production build | `npm test && npm run build` | ❌ Wave 0 |
| PUB-05 | Approved component passes; import/export, script, iframe, and unknown component each fail | source-policy unit + valid MDX build | `npm test && npm run build` | ❌ Wave 0 |
| PUB-06 | Three sections pass; unknown key fails; temporary fourth registry entry works unchanged | unit | `npm test` | ❌ Wave 0 |

### Minimum Test Matrix

- One valid Arabic slug with diacritics/Arabic digits and one with ASCII digits.
- One case each for decomposed non-NFC input, slash, backslash, dot/dot-segment, percent escape, C0/C1 control, bidi/format control, repeated hyphen, leading hyphen, trailing hyphen, empty slug, Latin letter, and disallowed punctuation.
- A title-only edit with path equality and a same-complete-path collision that reports both source IDs.
- A base valid article, then one mutation per required field plus unknown section/author, malformed calendar date, `updatedAt < publishedAt`, future non-draft publication, and malformed YouTube ID.
- Public/draft pair tested through public and preview policies; production preview wrapper fails closed.
- MDX strings for approved component, ESM import, ESM export, `<script>`, `<iframe>`, and unknown JSX component.
- Registry extension test that adds a fourth section to injected registry data and derives a path without changing schema/route code.

This matrix is the locked D-18 coverage translated into the smallest runnable checks. [VERIFIED: .planning/phases/01-content-and-url-contract/01-CONTEXT.md]

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm run verify`
- **Phase gate:** exact Node/npm versions selected, clean install from lockfile, `npm run verify` green, valid Markdown and MDX proof routes built, and one explicit local preview smoke check.

### Wave 0 Gaps

- [ ] Select/install Node 24.19.0 and npm 11.17.0; confirm exact versions.
- [ ] Create `.nvmrc`, `package.json`, `package-lock.json`, `astro.config.mjs`, and `tsconfig.json`.
- [ ] Create `tests/content-contract.test.ts` with the full pure-contract matrix.
- [ ] Create valid Markdown/MDX proof entries only; keep negative cases in memory in tests.
- [ ] Create an ignored browser-artifact directory only if later visual/browser work actually runs; do not put artifacts in source or `.planning`. [VERIFIED: AGENTS.md]

## Security Domain

### Trust Boundary

Phase 1 processes repository-authored Markdown/MDX during a privileged local/CI build. MDX supports JavaScript expressions, ESM imports/exports, and components, so unrestricted content can execute or import build-time code; the project therefore treats files as trusted Git-reviewed input plus an accidental-policy-violation surface, not as hostile public uploads. [CITED: https://mdxjs.com/docs/using-mdx/] [VERIFIED: .planning/research/PITFALLS.md]

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No users, login, CMS, API, or runtime application exists in Phase 1. |
| V3 Session Management | no | No browser/application session state exists. |
| V4 Access Control | no runtime control | Git/repository review is the authoring boundary; draft exclusion is a build publication policy, not user authorization. |
| V5 Input Validation | yes | Schema validation, canonical Unicode predicates, registry checks, raw MDX preflight, and complete-path collision rejection. |
| V6 Cryptography | no | No secrets, credentials, encryption, signing, or request-time transport is introduced. |

This applicability mapping is scoped to the Phase 1 architecture; ASVS category definitions come from the OWASP Application Security Verification Standard. [CITED: https://owasp.org/www-project-application-security-verification-standard/]

### Threat-Model Considerations for the Build-Time Authoring Boundary

| Threat | STRIDE | Entry Point | Standard Mitigation | Residual / Verification |
|--------|--------|-------------|---------------------|-------------------------|
| Deceptive Arabic route using normalization or bidi controls | Spoofing | `section.slug`, article `slug` | Require already-NFC input; allow only the locked Arabic/digit grammar; reject controls/format characters; compare complete paths | Unit cases for non-NFC and UTS #39 bidi controls. [CITED: https://www.unicode.org/reports/tr39/#Bidirectional_Controls] |
| Duplicate article identity shadows another record | Spoofing / Tampering | Complete derived path | All-entry `Map` collision preflight before draft filtering and routes | Test error includes path and both source IDs. |
| MDX import/export executes or reads build context | Tampering / Information Disclosure / Elevation of Privilege | `.mdx` body | Reject ESM before compilation; no per-article imports; exact lockfile; no Phase 1 secrets | Test import/export fixtures; never read `.env`. [CITED: https://mdxjs.com/docs/using-mdx/] [VERIFIED: AGENTS.md] |
| Raw script/iframe bypasses approved surface | Tampering | `.md`/`.mdx` body | Reject tags in preflight; supply only central approved component map | Test lowercase/uppercase/tag-spacing cases and valid proof component. |
| Malformed content stops every build | Denial of Service | Any article/registry entry | Fail closed with aggregate actionable source/field/rule diagnostics; keep invalid fixtures out of production content | Expected for trusted reviewed publishing; `npm test` remains fast and isolates branches. |
| Draft becomes statically addressable | Information Disclosure | Production query/route generation | Public-only wrapper filters before `getStaticPaths()`; preview wrapper is development-only | Test both wrappers and inspect production build routes. |

### Security Planning Rule

Do not describe the lightweight source preflight as sanitization or a hostile-input sandbox. It is sufficient only for the locked Git-reviewed authoring model. If browser uploads, remote CMS content, or untrusted contributors enter scope, stop and redesign the trust boundary—prefer Markdown-only ingestion or a separately evaluated parser/sandbox rather than extending the Phase 1 scanner. [VERIFIED: .planning/research/PITFALLS.md]

## Sources

### Primary (HIGH confidence)

- [Astro content collections](https://docs.astro.build/en/guides/content-collections/) — current `src/content.config.ts`, loaders, schemas, `getCollection()`, and `render()` APIs.
- [Astro content loader reference](https://docs.astro.build/en/reference/content-loader-reference/) — current `glob()` loader contract.
- [Astro dynamic routing](https://docs.astro.build/en/guides/routing/#dynamic-routes) — static `getStaticPaths()` route generation.
- [Astro MDX integration](https://docs.astro.build/en/guides/integrations-guide/mdx/) — official integration and render-time component map.
- [Astro configuration reference](https://docs.astro.build/en/reference/configuration-reference/) — static output and trailing slash policy.
- [Node.js test runner](https://nodejs.org/docs/latest-v24.x/api/test.html) — native test command/API.
- [Node.js TypeScript modules](https://nodejs.org/docs/latest-v24.x/api/typescript.html) — type stripping behavior and limitations.
- [Unicode UAX #15](https://unicode.org/reports/tr15/) — normalization forms.
- [Unicode UTS #39 bidi controls](https://www.unicode.org/reports/tr39/#Bidirectional_Controls) — identifier/display security considerations.
- [Google URL structure guidance](https://developers.google.com/search/docs/crawling-indexing/url-structure) — readable localized UTF-8 URLs.
- [MDX using MDX](https://mdxjs.com/docs/using-mdx/) — ESM, expressions, and component capabilities.
- npm registry metadata and npm downloads API — exact versions, dates, repositories, downloads, and postinstall inspection.
- Slopcheck 0.6.1 forced npm audit — all four packages returned `OK`.
- Phase `01-SPEC.md`, `01-CONTEXT.md`, project `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, and research `STACK.md`, `ARCHITECTURE.md`, `PITFALLS.md` — locked local scope and project-wide verified decisions.

### Secondary (MEDIUM confidence)

- [MDN `String.prototype.normalize()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) — JavaScript platform normalization API usage.
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) — security category framing.

### Tertiary (LOW confidence)

- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — locked exact versions rechecked against npm, official Astro/Node docs, and slopcheck.
- Architecture: HIGH — phase decisions are explicit and current Astro APIs support the exact one-way static flow.
- Validation: HIGH — every requirement maps to a pure test branch plus Astro check/build integration.
- Security: HIGH for the locked trusted-Git boundary; deliberately not generalized to hostile content ingestion.
- Environment: HIGH — direct local probes found the exact version drift and missing project packages.

**Research date:** 2026-08-26
**Valid until:** 2026-09-25 for the locked baseline; recheck registry/package compatibility before any deliberate upgrade.
