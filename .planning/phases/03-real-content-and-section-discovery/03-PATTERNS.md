# Phase 3: Real Content and Section Discovery - Pattern Map

**Mapped:** 2026-08-27  
**Files classified:** 17 concrete files/file groups  
**Analogs found:** 14 / 17 (three launch-input groups intentionally have no truthful repository analog)

This map is descriptive, not a mandate to create extra abstractions. Reuse the existing content trust boundary, static route pattern, native tests, and Playwright artifact policy. Public copy remains Arabic; implementation/test names and diagnostics may remain English.

## File Classification

| New/Modified File | Role | Data Flow | Closest Existing Analog | Match |
|---|---|---|---|---|
| `src/layouts/SiteLayout.astro` | layout/component | static request-response transform | `src/pages/[section]/[slug].astro:37-157,226-247,337-346` | exact source extraction |
| `src/pages/index.astro` | route | registry-to-static-HTML transform | `src/pages/[section]/[slug].astro:37-103` + `src/config/registries.ts:12-31` | role + flow |
| `src/pages/[section]/index.astro` | dynamic route | batch query/filter/sort to static HTML | `src/pages/[section]/[slug].astro:10-18` + `src/lib/articles.ts:9-17` | exact route/query |
| `src/pages/عن-أحمد-المنجاوي.astro` | route | registry-to-static-HTML transform | `src/pages/[section]/[slug].astro:37-103` + `src/config/registries.ts:33-37` | role + flow |
| `src/lib/approval-contract.ts` | utility/trust boundary | file I/O + validation transform | `src/lib/content-contract.ts:48-105,172-255` | role match; hashing is new |
| `src/lib/articles.ts` | service/query boundary | batch content load/filter | itself, `src/lib/articles.ts:9-24` | exact |
| `src/lib/content-contract.ts` | utility/model contract | pure validation/filter/sort | itself, `src/lib/content-contract.ts:293-325` | exact |
| `src/pages/[section]/[slug].astro` | dynamic article route | static request-response transform | itself, especially `:10-34,47-76,105-247` | exact |
| `src/content/articles/contract-markdown.md` | fixture/model | file-backed content input | itself `:1-15` + `contract-draft.md:1-10` | exact |
| `src/content/articles/contract-mdx.mdx` | fixture/model | file-backed content input | itself `:1-11` + `contract-draft.md:1-10` | exact |
| `tests/content-contract.test.ts` | native test | batch transform/assertion | itself `:1-53,345-403` | exact |
| `tests/article-journey.spec.ts` | browser test | request-response/browser event flow | itself `:1-79,117-210,417-507,638-738` | exact |
| `tests/discovery.spec.ts` | browser test | request-response/browser graph traversal | `tests/article-journey.spec.ts:60-79,117-210,638-738` | role + flow |
| `playwright.config.ts` | test config | process/server orchestration | itself `:3-30` | exact base; split is new |
| `package.json` | config | command orchestration | itself `:11-20` | exact |
| `.planning/phases/03-real-content-and-section-discovery/03-CONTENT-INPUTS.md` | internal checkpoint | manual input/state capture | no truthful content analog; follow `03-CONTEXT.md` D-14 | none by design |
| `src/content/articles/<real>.md[x]` + `src/content/reviews/<slug>.json` | production model/evidence | file-backed input + exact-byte approval | article schema analog only; no truthful launch data analog exists | intentionally gated |

`src/content.config.ts`, `src/config/registries.ts`, `src/lib/mdx-policy.ts`, and `src/components/YouTubePlayer.astro` are integration sources, not planned edits unless implementation proves a real incompatibility. Do not widen Phase 3 to touch them speculatively.

## Pattern Assignments

### `src/layouts/SiteLayout.astro` (layout, static request-response)

**Analog:** `src/pages/[section]/[slug].astro`

Copy only the shared document boundary (`:37-44`):

```astro
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <main>
```

Copy global canvas/type/measure/link/focus rules from `:105-157` and `:226-247`, and the sole padding breakpoint from `:337-341`. The inherited values are `#fffdf8`, `#1c1917`, the system font stack, `1.125rem/1.9`, `70ch`, `#166534` underlined links, and `3px` focus outline/offset.

Add only the locked one-link header (`مدونة أحمد المنجاوي` → `/`) and a slot inside `main`. Keep summary, prose, references, media, and YouTube-control rules in the article route. Do not turn this into a token library, header component, navigation system, metadata manager, footer, or design system.

### `src/pages/index.astro` (route, registry transform)

**Analogs:** `src/config/registries.ts:12-31`; article shell markup at `src/pages/[section]/[slug].astro:37-103`.

The registry is already the single source of display facts:

```ts
export const sectionRegistry = {
  refutations: { label: "الردود والشبهات", description: "ردود موثقة على الشبهات الفكرية والدينية.", slug: "الردود-والشبهات", order: 1 },
  // ...same shape for all registered sections
} as const satisfies Readonly<Record<string, SectionRecord>>;
```

Use `Object.entries(sectionRegistry)` sorted by `order`, then native `ul > li > h2 > a + p`. The route owns its one-off Arabic heading/introduction. Do not duplicate the three records, create a list-row component, add a latest feed, or expose stable ASCII keys.

### `src/pages/[section]/index.astro` (dynamic route, batch query/filter/sort)

**Analogs:** article static path generation at `src/pages/[section]/[slug].astro:10-18`; public selector at `src/lib/articles.ts:15-17`; stable article URL at `src/lib/content-contract.ts:257-290`.

```astro
export async function getStaticPaths() {
  const articles = await getPublicArticles();
  return /* registered sections mapped to params + section-specific article props */;
}
```

Use the same `params`/`props` static-generation shape as the article route, but enumerate `sectionRegistry`, never content-derived section slugs. Filter the centrally approved public records by stable section key, apply the pure shared sort, and link titles via `articlePath(article)`. Format dates with the existing UTC-stable Arabic formatter from the article route (`:29-34`) and render `<time datetime>` with `bdi[dir=auto]` as at `:57-61`.

Render a semantic text list and the exact empty sentence when no public entry exists. Do not hand-maintain three pages, call `getPreviewArticles()`, hide registered empty sections, or validate approvals in page code.

### `src/pages/عن-أحمد-المنجاوي.astro` (route, registry transform)

**Analogs:** `authorRegistry` at `src/config/registries.ts:33-37`; article lookup/render at `src/pages/[section]/[slug].astro:26-28,53-55`.

```ts
const author = authorRegistry.ahmedElMangawy;
```

Render only the registered name, the locked generic publication-purpose paragraph, and the home anchor. Optional facts must be whole conditional semantic units only after an authoritative field actually exists. Do not add optional fields to the registry now, generate biography text, reserve empty spacing, or render channel/expertise/reviewer claims.

### `src/lib/approval-contract.ts` (utility, file I/O + validation)

**Closest analog:** fail-closed diagnostics and strict validation in `src/lib/content-contract.ts:48-105,172-255`.

Reuse the location-first error convention:

```ts
function fail(location: string, rule: string): never {
  throw new Error(`${location}: ${rule}`);
}
```

Reuse the existing validation ordering style: type/shape first, then semantic constraints, with diagnostics naming the article and failed field/rule. Use Node built-ins for the one new I/O pattern:

```ts
const digest = createHash("sha256")
  .update(readFileSync(article.filePath))
  .digest("hex");
```

Required flow: public record only → require normalized `filePath` → derive one sidecar from validated slug → read/strictly parse JSON → reject missing/unknown fields → validate article slug/source/classification → validate both reviewer identity/date/pass records and editorial human flags → compare lowercase 64-hex raw-byte digest. Dates follow the existing real `YYYY-MM-DD`, non-future pattern at `content-contract.ts:83-105`.

Drafts bypass only approval I/O. Never hash parsed/re-serialized content, hash only the body, accept extra fields, treat SHA-256 as identity authentication, return sidecar data to routes, or add a schema/hash dependency.

### `src/lib/articles.ts` (service/query boundary, batch)

**Exact current pattern** (`:9-24`):

```ts
async function getValidatedArticles() {
  const articles = await getCollection("articles");
  assertUniqueArticlePaths(articles);
  return articles;
}

export async function getPublicArticles() {
  return selectPublicArticles(await getValidatedArticles());
}
```

Insert approval validation once inside `getValidatedArticles()` for every `draft:false` entry, before any consumer can select routes or discovery entries. Preserve `getPreviewArticles()` and its `import.meta.env.DEV` guard. Homepage and indexes must always call `getPublicArticles()`, even in development.

Readiness coverage belongs here only as orchestration of a pure helper and only when `import.meta.env.MODE === "launch-readiness"`. Do not import review data in a route or make ordinary empty-corpus builds fail.

### `src/lib/content-contract.ts` (utility, pure transform)

**Analogs:** route collision assertion (`:293-304`) and generic selectors (`:306-325`).

```ts
export function selectPublicArticles<T extends ArticleRecord>(entries: readonly T[]): T[] {
  return entries.filter((entry) => entry.data.draft === false);
}
```

Add only pure helpers needed by more than one consumer/test:

- newest-first sort by canonical `publishedAt`, then direct code-point slug ascending;
- registered-section coverage assertion that aggregates every missing section;
- any set/duplicate assertion actually shared by route/readiness tests.

Match existing generic readonly-input/new-array output conventions and `fail(location, rule)` diagnostics. Do not use Arabic `localeCompare` for the stable tie-break, mix filesystem I/O into this file, or duplicate existing path/schema validation.

### `src/pages/[section]/[slug].astro` (existing route, static transform)

Keep its central mode boundary unchanged (`:10-18`) and its reader order (`:45-100`). Wrap it in `SiteLayout`, then change only the two `dd` values at `:48-55` into ordinary anchors:

- section label → `/${section.slug}/`;
- author name → `/عن-أحمد-المنجاوي/`.

Preserve date formatting, summary, rendered content, references, and `YouTubePlayer`. Preserve article-specific CSS from `:160-224,249-346`; remove only rules now owned by the shared layout. Do not make the fact row clickable or add breadcrumb/back/related/review UI.

### Proof fixture demotion

**Files:** `src/content/articles/contract-markdown.md`, `src/content/articles/contract-mdx.mdx`.

Both currently use the same explicit frontmatter field as the existing draft (`contract-draft.md:9`):

```yaml
draft: true
```

Change only `draft: false` to `draft: true`; retain explicit proof wording, Markdown/MDX bodies, test video ID, and test references for development regression coverage. Do not disguise them as real content, delete them, create approval sidecars for them, or let either route enter `dist`.

### `tests/content-contract.test.ts` (native test, batch assertions)

Reuse built-in imports and data builders (`:1-53`):

```ts
import assert from "node:assert/strict";
import test from "node:test";

function assertDiagnostic(action: () => unknown, expectedParts: readonly string[]): void {
  assert.throws(action, (error: unknown) => {
    assert.ok(error instanceof Error);
    for (const part of expectedParts) assert.match(error.message, new RegExp(part, "iu"));
    return true;
  });
}
```

Follow the table-driven negative-matrix style at `:114-218,257-330` and exact selector expectations at `:345-403`. Extend this file rather than add a test framework or shared fixture package. Approval tests should use Node temporary directories/files outside source/planning paths and cover missing, invalid JSON, unknown/missing field, bad/future date, non-pass, wrong source/article, digest mismatch, both passes, and draft bypass. Sorting/coverage tests cover differing dates, equal-date slug tie, all registry keys, missing/foreign sections, and duplicates. Add one child-process assertion proving readiness exits nonzero while ordinary build remains structurally valid.

Do not seed a passing review file under `src/content/reviews` or use a proof article as launch-ready input.

### `tests/article-journey.spec.ts` (development browser test)

Keep its two explicit proof fixtures (`:18-48`), `openArticle`/DOM-order helpers (`:60-79`), no-JS journey (`:141-210`), keyboard/focus checks (`:417-507`), reflow loop (`:638-714`), and axe severity filter (`:716-738`). Run this file only against the development server/project so both draft proof paths remain reachable.

Update production-specific `dist` expectations at `:865-884`; those assertions move to production discovery coverage and must require proof-route absence. Do not weaken the proof content assertions simply because records became drafts.

### `tests/discovery.spec.ts` (production browser test)

**Analog:** the helper and verification idioms in `tests/article-journey.spec.ts`.

Reuse:

- `page.goto()` plus role-based locators (`:60-63,83-115`);
- static no-JS contexts (`:141-210`);
- native focus/computed-outline assertions (`:417-507`);
- viewport loop and horizontal-overflow predicate (`:638-714`);
- AxeBuilder tags and serious/critical filter (`:716-729`).

Cover homepage registry parity/order, all registered section roots, public set equality/sort, author truth/omission, section/author article links, unknown route absence, proof/example/reviewer absence, no-JS traversal, Arabic/RTL/heading/list/time semantics, keyboard, 320/390/768/1024/1440 reflow, and axe. With no genuine public articles yet, do not fabricate populated production assertions or screenshots; test truthful empty structural states and production proof exclusion until Plan 03-04 supplies real inputs.

### `playwright.config.ts` (test config, server orchestration)

Preserve the artifact contract verbatim (`:6-16`):

```ts
outputDir: ".artifacts/playwright/output",
snapshotPathTemplate: ".artifacts/playwright/snapshots/{testFilePath}/{arg}{ext}",
reporter: [["html", { outputFolder: ".artifacts/playwright/report", open: "never" }]],
```

The current single preview server/project (`:18-29`) is the analog. Split it with explicit, distinct names/ports/base URLs:

- development proof project/server: `astro dev`, matching `article-journey.spec.ts`;
- production discovery project/server: built `astro preview`, matching `discovery.spec.ts`.

Keep `reuseExistingServer: false` and use route-specific readiness URLs that prove the intended server mode. If Playwright's multi-server/project routing cannot bind each project unambiguously, use two small sequential configs rather than a custom process manager. Never emit artifacts outside `.artifacts/`.

### `package.json` (config, command orchestration)

Preserve the current smallest script chain (`:15-19`):

```json
"test:browser": "playwright test",
"check": "astro check",
"build": "astro build",
"verify": "npm test && npm run check && npm run build && npm run test:browser"
```

Add only:

```json
"launch:ready": "astro build --mode launch-readiness"
```

Keep `verify` structural and green without fabricated launch content; keep `launch:ready` deterministically nonzero until all registered sections have genuine approved launch entries. Preserve exact Node/npm enforcement at `:6-15`. Do not add a dependency, environment package, secondary build tool, or warning-only readiness script.

### Plan 03-04 input checkpoint and real corpus (manual/file-backed gate)

**Files:** `03-CONTENT-INPUTS.md`, eventual `src/content/articles/<real>.md[x]`, eventual `src/content/reviews/<slug>.json`.

There is no truthful repository analog for launch content or approvals. The existing content files explicitly identify themselves as test/proof records and use demonstration/example provenance; they must never be copied as launch facts.

The planning checklist has exactly four rows: approved author facts, refutations package, general-issues package, scholarship package. Article rows track source text, matching YouTube URL/ID, real dates, required references, editorial identity/date/pass, religious-accuracy identity/date/pass, repository visibility/consent, and status. Leave unknown values blank—no example values and no pre-checked approvals.

Once supplied, real article sources follow the existing collection schema at `src/content.config.ts:9-36`, first enter as `draft: true`, receive human review against final exact bytes, then become public with their matching sidecars. Plan 03-04 remains a real input checkpoint until the owner supplies packages and both reviewers act. Automation may validate structure/integrity but must not claim substance, religious accuracy, factual truth, reference adequacy, identity, consent, or video correspondence.

## Shared Patterns

### Central fail-closed trust boundary

**Source:** `src/content.config.ts:27-36`, `src/lib/articles.ts:9-17`, `src/lib/content-contract.ts:48-50`  
**Apply to:** approval validation, public selection, readiness.

Schema/semantic validation throws before routes query records; `getValidatedArticles()` is the only content-load choke point; page code consumes trusted entries. Approval checks belong there once, not in each route.

### Registry-derived identity

**Source:** `src/config/registries.ts:12-40`, `src/lib/content-contract.ts:257-290`  
**Apply to:** homepage, section paths, article links, author rendering.

Stable ASCII keys remain internal; Arabic labels/slugs are public. Derive links and static paths from registries and existing helpers rather than copy strings into parallel config.

### Static public vs development preview

**Source:** `src/lib/articles.ts:15-24`, `src/pages/[section]/[slug].astro:10-18`, `src/lib/content-contract.ts:306-325`  
**Apply to:** article routes, proof browser project, discovery indexes.

Direct development article paths may use preview entries. Production routes and all discovery lists use public entries only. Approval failure for `draft:false` is a build error; missing per-section launch coverage is a separate readiness error.

### Arabic semantics, bidi, and dates

**Source:** `src/pages/[section]/[slug].astro:29-34,37-103`; browser tests `:117-210,570-636`  
**Apply to:** every new page and discovery test.

Use `lang="ar" dir="rtl"`, native landmarks/headings/lists/facts/time/anchors, UTC date-only formatting, and `bdi` for mixed values. Do not add redundant ARIA, click handlers, raw visible slugs, or English reader-facing copy.

### Artifact isolation

**Source:** `.gitignore:1-4`, `playwright.config.ts:6-16`  
**Apply to:** every browser run, visual QA, screenshot, trace, report, and browser payload.

All generated browser evidence stays under `.artifacts/`; no test artifact enters `src/`, `tests/`, or `.planning/`.

## No Analog Found / Intentional Gates

| File/Concern | Why no analog exists | Planner action |
|---|---|---|
| `src/lib/approval-contract.ts` exact-byte hashing | Existing validators are pure and no sidecar I/O exists | Copy diagnostic style; implement only the Node built-in I/O/hash delta |
| `03-CONTENT-INPUTS.md` | No prior truthful owner-input checkpoint exists | Create blank four-row internal checklist; never seed facts |
| Real launch articles and review sidecars | Repository contains only explicit proof/draft fixtures and no reviewers | Keep Plan 03-04 blocked at the human checkpoint until supplied |

## What Not to Generalize

- No one-off heading, list-row, author-fact, empty-state, or date component.
- No repository/CMS/service layer around local Markdown and JSON.
- No design system, tokens file, UI library, client router, or discovery JavaScript.
- No optional author schema until an approved fact actually arrives.
- No generalized approval workflow, signatures, PKI, secrets service, or remote reviewer system.
- No Phase 4 metadata/404/sitemap work and no Phase 5/6 deployment claims.

## Metadata

**Analog search scope:** `src/`, `tests/`, `playwright.config.ts`, `package.json`, `.gitignore`, and Phase 3 planning contracts.  
**Files scanned:** 17 repository source/config/test/content files plus five Phase 3 inputs.  
**Pattern extraction date:** 2026-08-27.  
**Truth status:** structural mapping complete; real content, video mappings, dates/references, reviewer identities/consent, and approvals remain absent and were not invented.
