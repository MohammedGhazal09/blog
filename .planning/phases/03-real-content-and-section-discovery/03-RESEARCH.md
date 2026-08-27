# Phase 3: Real Content and Section Discovery - Research

**Researched:** 2026-08-27
**Domain:** Astro static discovery graph, file-backed editorial approval, Arabic RTL content indexing
**Confidence:** HIGH for structural implementation; LOW for absent real-world launch inputs

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Shared Discovery Shell and Link Graph

- **D-01:** Use one small shared Arabic/RTL site shell for homepage, indexes, author, and article routes. Its persistent header contains only the site name linked to `/`; it does not repeat a full section menu on every page.
- **D-02:** Make context do the navigation work: each homepage section label links to its index, each index article title links to its stable route, each article section fact links back to its index, and each article author fact links to the author page. All are ordinary same-tab anchors and remain usable without JavaScript.
- **D-03:** Extract only the genuinely shared document, typography, color, focus, and page-width treatment from the existing reader. Keep article-specific prose/media rules with the article surface rather than introducing a broad design system.

#### Homepage and Section Indexes

- **D-04:** The homepage contains the approved site name, one short factual introduction derived from PROJECT.md, and a registry-driven list of the three sections in `order`. Each entry shows its existing Arabic label and description; no latest-article feed, image, metric, featured block, or promotional carousel is added.
- **D-05:** Implement one registry-driven section-index route/pattern rather than three hand-maintained pages. Unknown section slugs remain absent; registered section roots are generated from the same registry that derives article paths.
- **D-06:** Render articles as a semantic text list, not cards. Each item exposes linked title, description, and truthful publication date. Sort public articles by `publishedAt` descending and then stable article slug ascending so output is deterministic.
- **D-07:** During local development an empty section may show one concise Arabic empty-state sentence. Launch readiness still fails until every registered primary section contains an approved real public article; hiding an empty section is not allowed.

#### Truthful Author Context

- **D-08:** Use one author route at `/عن-أحمد-المنجاوي/`. Every public article byline links to it, and the page provides a clear link back to the homepage.
- **D-09:** The author page renders only fields present in the authoritative author registry/profile input. The current name is safe to render; biography, expertise, affiliation, credentials, social profiles, and channel claims are omitted until the owner supplies and approves them. Do not show generated filler or a public “coming soon” claim.
- **D-10:** Structured Person/Article schema and canonical entity identifiers remain outside this phase; Phase 4 owns page identity metadata and the roadmap defers richer structured data.

#### Human Approval and Truth Gate

- **D-11:** Store review evidence outside the article source in a small local sidecar record keyed to the article. It contains a SHA-256 digest of the reviewed article source plus separate editorial and religious-accuracy entries with real reviewer identity, approval date, and passing decision. Use Node's built-in crypto/filesystem; add no dependency.
- **D-12:** A `draft: false` launch record fails validation when its approval sidecar is missing, malformed, incomplete, or its digest no longer matches the article source. Draft records remain previewable without approval so authors can work before review.
- **D-13:** Reviewer identities and approval details stay internal. The public page shows no reviewer name, badge, or generic “reviewed” claim unless the owner later approves that specific public statement.
- **D-14:** Record the missing real-world inputs in one non-public Phase 3 content-input checklist: approved author facts plus three article packages with source text, matching YouTube URL/ID, real dates, required references, and both approvals. Keep unknown values blank and never seed examples that could be mistaken for approval.

#### Proof Isolation and Verification

- **D-15:** Change Phase 2 proof articles to draft/test-only content. Exercise their Markdown and restricted-MDX reader paths through the existing development-preview boundary; never leave public proof routes merely hidden from indexes.
- **D-16:** Keep the normal structural verification runnable while truthful inputs are absent. Add one explicit launch-readiness check for section coverage, real-content classification, profile evidence, matching videos, and current approval sidecars. Phase 3 cannot verify complete, and later production work cannot proceed, until that check passes.
- **D-17:** Production discovery/browser checks use real approved public content once supplied. Development proof checks may use the draft routes, but the production build must separately assert that every proof route and example reference/video mapping is absent.

#### Arabic Visual Continuity

- **D-18:** Reuse the existing warm surfaces, restrained green link/focus color, system font stack, four-size/two-weight discipline, logical spacing, and readable measure. Discovery content uses headings, lists, and underlined links without images, thumbnails, decorative cards, shadows, gradients, icons, animation, or new UI dependencies.
- **D-19:** Verify the new route graph at representative mobile/desktop widths, keyboard-only navigation, disabled JavaScript, and accessibility-tree/axe checks. Keep all generated browser evidence under `.artifacts/`.

### the agent's Discretion

- Exact shared layout, style-module, helper, and test filenames, provided the implementation reuses existing boundaries and creates no single-use abstraction that is larger than the duplication it removes.
- Exact Arabic microcopy for the homepage introduction, contextual links, and empty state, provided it is concise, reader-facing Arabic and contains no unsupported personal or religious claim.
- Exact JSON field names and approval-sidecar directory, provided the digest binds both approvals to the exact source revision and diagnostics identify the article and failed review rule.
- Whether the development browser suite runs in one or two Playwright projects, provided production draft exclusion remains independently tested and all artifacts stay under `.artifacts/`.

### Deferred Ideas (OUT OF SCOPE)

- Page titles, meta descriptions, canonical/social identity, sitemap, robots, favicon, and Arabic 404 — Phase 4.
- Production domain, hosting, Search Console, aggregate analytics, and outbound-click measurement — Phase 5.
- Production crawl, live-link certification, and Core Web Vitals evidence — Phase 6.
- Search, filters, tags, related articles, lesson sequencing, timestamps, and full-catalog migration — deferred v2/expansion scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SITE-03 | Homepage links to all three primary sections through ordinary crawlable links. | Registry-ordered homepage generation and static-anchor graph described below. [VERIFIED: `.planning/REQUIREMENTS.md`, `src/config/registries.ts`] |
| SITE-04 | Every primary section has a crawlable index with a useful Arabic summary and link for every published article. | One registry-derived `[section]/index.astro`, public-selector reuse, set-equality tests, and deterministic sorting described below. [VERIFIED: `.planning/REQUIREMENTS.md`, `03-CONTEXT.md` D-05–D-07] |
| SITE-05 | An Arabic author page exists and every article byline links to truthful author information. | Verified-field-only author route and contextual article link pattern described below. [VERIFIED: `.planning/REQUIREMENTS.md`, `03-CONTEXT.md` D-08–D-10] |
| CONT-01 | At least one substantive Arabic article with a real matching YouTube video exists in each primary section. | Explicit launch-readiness coverage gate plus human content/video verification; no proof fixture can satisfy it. [VERIFIED: `.planning/REQUIREMENTS.md`, `03-SPEC.md` requirement 4] |
| CONT-02 | Every launch article has recorded editorial and religious-accuracy sign-off before publication. | Exact-source SHA-256 sidecar validation and fail-closed public eligibility described below. [VERIFIED: `.planning/REQUIREMENTS.md`, `03-CONTEXT.md` D-11–D-13] |
| CONT-03 | Bylines, expertise, dates, references, and review claims are real rather than placeholders. | Omit-unknown author policy, proof demotion, strict provenance tests, and human fact audit described below. [VERIFIED: `.planning/REQUIREMENTS.md`, `03-SPEC.md` requirement 6] |
</phase_requirements>

## Summary

Phase 3 does not need a framework, content model, router, test framework, or UI-library change. The repository already has three authoritative section records, one author record containing only the approved name, one strict Markdown/MDX collection, stable route derivation, a public/draft selector, a development-only preview selector, and a verified static Arabic article route. [VERIFIED: `src/config/registries.ts`, `src/content.config.ts`, `src/lib/content-contract.ts`, `src/lib/articles.ts`, `02-VERIFICATION.md`]

The current delta is concrete: there is no homepage, section root, shared shell, or author route; bylines are plain text; no approval sidecars exist; and the two Phase 2 proof articles are still `draft: false` and use example provenance plus the demonstration video ID. [VERIFIED: repository file inventory, `src/pages/[section]/[slug].astro`, `src/content/articles/contract-markdown.md`, `src/content/articles/contract-mdx.mdx`]

The smallest correct plan therefore has two independent outcomes. First, structural work must leave `npm run verify` green with static homepage/section/author pages, truthful empty indexes, proof articles available only from `astro dev`, and production output free of proof content. Second, `npm run launch:ready` must be a separate nonzero gate until every primary section has one genuine public article whose exact source revision has current editorial and religious-accuracy evidence. [VERIFIED: `03-CONTEXT.md` D-15–D-17]

**Primary recommendation:** extend the existing trust boundary with one small Node-built-in approval module, reuse Astro/native HTML for the entire discovery graph, and reserve the final plan for owner-supplied content plus human approval evidence. [VERIFIED: `03-CONTEXT.md` D-01–D-19]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Article authoring and review evidence | Source / Git-tracked content | Human editorial process | Markdown/MDX and non-public JSON sidecars are build inputs; real-world truth is a human responsibility. [VERIFIED: `03-CONTEXT.md` D-11–D-14] |
| Approval freshness | Static build validation | Source filesystem | Build-time code hashes exact source bytes and rejects stale or incomplete public approvals. [VERIFIED: `03-CONTEXT.md` D-11–D-12] |
| Homepage and author page | CDN / Static HTML | Browser | Astro emits complete HTML; the browser only follows native anchors. [VERIFIED: `astro.config.mjs`, `03-UI-SPEC.md`] |
| Section enumeration and sorting | Static build | Source content collection | Build-time queries filter validated public entries and produce deterministic lists. [VERIFIED: `src/lib/articles.ts`, `03-CONTEXT.md` D-05–D-07] |
| Article preview | Frontend development server | Source content collection | The existing `import.meta.env.DEV` branch is the only approved draft-preview boundary. [VERIFIED: `src/pages/[section]/[slug].astro`, `src/lib/articles.ts`] |
| Production discovery | CDN / Static HTML | Static build | Only approved non-draft entries may become routes or index links. [VERIFIED: `03-CONTEXT.md` D-12, D-17] |
| Launch readiness | Build/CI command | Human evidence | Automation proves structural predicates and current sidecars; humans prove substance, factual accuracy, and video match. [VERIFIED: `03-SPEC.md` requirements 4–6] |

## Project Constraints (from AGENTS.md)

- Reader-facing text and navigation are Arabic-only, and every public document uses Arabic language plus RTL semantics. [VERIFIED: `AGENTS.md` Project Constraints]
- Content remains Markdown/MDX with no CMS, database, editorial login, server adapter, or runtime data service. [VERIFIED: `AGENTS.md` Project Constraints and What NOT to Use]
- Public routes must be statically generated/crawlable without JavaScript. [VERIFIED: `AGENTS.md` Project Constraints]
- YouTube media remains intent-gated with a permanent direct action; Phase 3 must not weaken the verified Phase 2 reader journey. [VERIFIED: `AGENTS.md`, `02-VERIFICATION.md`]
- Native HTML/CSS logical properties and the existing system-font stack are the selected RTL/UI implementation; no Tailwind, component kit, CSS-in-JS, webfont, icon, or client framework is justified. [VERIFIED: `AGENTS.md` Technology Stack and What NOT to Use]
- Repository edits must stay inside the active GSD workflow. This research was requested by the active `$gsd-plan-phase` workflow. [VERIFIED: `AGENTS.md` GSD Workflow Enforcement, parent task]
- No project-local skills were found under the supported skill directories. [VERIFIED: repository inspection 2026-08-27]

Additional locked workspace constraints: never read `.env` files; use Node `v24.19.0` and npm `11.17.0`; keep browser artifacts only under ignored `.artifacts/`; preserve unrelated changes; and do not invent content or approval facts. [VERIFIED: parent task, `package.json`, `.gitignore`]

## Evidence-Backed Current State

| Area | Current evidence | Planning consequence |
|------|------------------|----------------------|
| Registered sections | `sectionRegistry` contains exactly `refutations`, `generalIssues`, and `scholarship` with Arabic label, description, slug, and order 1–3. [VERIFIED: `src/config/registries.ts`] | Homepage and section paths must iterate this registry; do not duplicate a three-item list in route code. |
| Author facts | `authorRegistry.ahmedElMangawy` contains only `name: "أحمد المنجاوي"`. [VERIFIED: `src/config/registries.ts`] | The Phase 3 author page may render the name and locked generic publication-purpose copy only; add no speculative optional schema. |
| Content contract | Required frontmatter, Arabic slug safety, dates, references, YouTube ID, registry keys, route collisions, and draft/public selection are already validated. [VERIFIED: `src/content.config.ts`, `src/lib/content-contract.ts`, 69 passing native tests on 2026-08-27] | Extend this boundary; do not revalidate the same fields in pages. |
| Entry source identity | Generated Astro collection types expose `filePath?: string` on article entries, and the local content store records each source path. [VERIFIED: `.astro/content.d.ts`, `.astro/data-store.json`] | Approval validation can hash the actual loader-selected file; fail public validation if `filePath` is absent. |
| Static routing | `output: "static"`, `trailingSlash: "always"`, and one `[section]/[slug].astro` route are active. [VERIFIED: `astro.config.mjs`, repository inventory] | Add static root, registered section roots, and one Arabic author route without a server adapter. |
| Article page | Arabic/RTL semantics, facts, UTC-stable date formatting, summary, rendered content, references, YouTube component, responsive CSS, and focus styling exist in one route. [VERIFIED: `src/pages/[section]/[slug].astro`] | Extract only shell/common CSS; keep article/media rules on the article surface. |
| Discovery routes | No `/`, section-index, or author page exists. [VERIFIED: `rg --files src/pages` on 2026-08-27] | These are new static surfaces, not modifications to hidden existing pages. |
| Public proofs | `contract-markdown.md` and `contract-mdx.mdx` are `draft: false`; both state they are test records and use `dQw4w9WgXcQ`; Markdown also uses `example.com`. [VERIFIED: source fixtures] | Change both to drafts in the same slice that moves browser coverage to the development server. |
| Browser harness | Playwright currently starts `astro preview`, probes the public Markdown proof route, and runs only `article-journey.spec.ts`; all outputs are under `.artifacts/`. [VERIFIED: `playwright.config.ts`] | Split development proof coverage from production discovery coverage before proof demotion. |
| Package surface | No package is needed beyond the installed Astro, Node standard library, Playwright, and axe stack. [VERIFIED: `package.json`, locked decisions] | Do not run an install or add a package legitimacy checkpoint. |

## Standard Stack

### Core

| Library / platform | Version | Purpose | Why Standard Here |
|--------------------|---------|---------|-------------------|
| Astro | 7.2.7 | Static routes, layouts, content collection, build modes | Already installed and verified; `astro build --mode <name>` is supported by the installed CLI. [VERIFIED: `package.json`, installed Astro CLI help] |
| Node.js | 24.19.0 | SHA-256, filesystem reads, native tests | Exact repository runtime and built-ins satisfy approval validation without a dependency. [VERIFIED: `package.json`, local runtime probe] |
| TypeScript | 6.0.3 | Existing Astro/source typing | Already pinned and compatible with the current checks. [VERIFIED: `package.json`] |
| HTML + CSS | Native platform | Static Arabic landmarks, lists, links, RTL, focus, reflow | Fully covers the approved UI contract with zero discovery-page JavaScript. [VERIFIED: `03-UI-SPEC.md`, Phase 2 implementation] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@astrojs/mdx` | 7.0.8 | Existing restricted MDX rendering | Retain for the test-only MDX proof and any genuinely needed approved launch MDX. [VERIFIED: `package.json`, `astro.config.mjs`] |
| `@playwright/test` | 1.62.1 | Development-preview and production-preview browser contracts | Reuse for route/link/reflow/keyboard/no-JS checks. [VERIFIED: `package.json`, local CLI probe] |
| `@axe-core/playwright` | 4.13.0 | Serious/critical automated accessibility checks | Reuse on the homepage, one section, one article when available, and author page. [VERIFIED: `package.json`, current browser test] |
| `node:test` / `node:assert` | Node 24 built-ins | Approval, sorting, coverage, and content contract tests | Extend the current no-framework native suite. [VERIFIED: `tests/content-contract.test.ts`] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Node `crypto` + JSON | Third-party hashing/schema packages | Adds supply-chain and configuration surface for standard-library work; rejected by D-11. [VERIFIED: `03-CONTEXT.md` D-11] |
| Astro static routes | CMS/database/API | Adds runtime state and contradicts the explicit project boundary. [VERIFIED: `AGENTS.md`, `03-SPEC.md`] |
| Native list markup | Cards/component library | Adds visual and dependency bloat and violates the approved UI contract. [VERIFIED: `03-UI-SPEC.md`] |
| Separate readiness command | Make normal build fail for empty launch corpus | Would block structural development while truthful inputs are unavailable, contradicting D-16. [VERIFIED: `03-CONTEXT.md` D-16] |

**Installation:** none. The phase must not change dependency manifests except package scripts. [VERIFIED: locked constraints]

## Package Legitimacy Audit

Not applicable. Phase 3 installs no external package, so the slopcheck/registry gate is intentionally skipped. [VERIFIED: `package.json`, `03-CONTEXT.md` D-11/D-18]

## Architecture Patterns

### System Architecture Diagram

```text
Owner-supplied Markdown/MDX bytes
        |
        +--> existing MDX/source preflight
        |
        +--> Astro content schema + shared semantic validator
        |
        v
Validated article entry (data + filePath)
        |
        +--> draft:true ------------------> DEV selector --> proof article route only
        |
        +--> draft:false --> approval sidecar lookup
                              |
                              +--> missing/malformed/stale/non-pass --> build error
                              |
                              +--> exact raw-byte SHA-256 + two pass records
                                      |
                                      v
                                public selector
                                      |
         sectionRegistry ------------+----> static section indexes
                |                     +----> static article routes
                +--------------------------> static homepage links
         authorRegistry -------------------> static author page/bylines

Normal `astro build`:
  structural routes may build with zero public articles and truthful empty states

`astro build --mode launch-readiness`:
  public approved entries --> one-or-more per registered section?
       no  --> diagnostic + nonzero exit
       yes --> launch-readiness build succeeds (human evidence still audited)
```

This flow keeps approval I/O at build time, not in the browser, and preserves the existing static delivery boundary. [VERIFIED: locked architecture and current source]

### Recommended Project Structure

```text
src/
├── layouts/
│   └── SiteLayout.astro                 # genuinely shared Arabic shell and global tokens
├── pages/
│   ├── index.astro                      # registry-driven homepage
│   ├── [section]/index.astro            # one registry-derived section index route
│   ├── [section]/[slug].astro           # existing article route, wrapped and linked
│   └── عن-أحمد-المنجاوي.astro          # verified-field-only author page
├── lib/
│   ├── articles.ts                      # existing loader; invokes public approval/readiness gates
│   ├── content-contract.ts              # existing pure sort/coverage selectors and validators
│   └── approval-contract.ts             # raw SHA-256 + strict sidecar validation
└── content/
    ├── articles/                        # draft proofs plus owner-supplied launch sources
    └── reviews/                         # internal per-article approval JSON; no passing examples
tests/
├── content-contract.test.ts             # existing native suite plus approval/sort/coverage cases
├── article-journey.spec.ts              # draft proof journey against `astro dev`
└── discovery.spec.ts                    # production static discovery and proof-isolation checks
```

Every listed new file has at least two real consumers or owns a complete route/trust boundary. Do not add components for one-off headings, list rows, author facts, or empty states. [VERIFIED: Ponytail constraint, `03-CONTEXT.md` agent discretion]

### Minimal File-Change Map

| Action | File(s) | Exact responsibility |
|--------|---------|----------------------|
| Add | `src/layouts/SiteLayout.astro` | Shared document/head/header/main column and only common palette/type/link/focus/reflow rules. |
| Add | `src/pages/index.astro`, `src/pages/[section]/index.astro`, `src/pages/عن-أحمد-المنجاوي.astro` | Complete static discovery graph using registries and public entries. |
| Add | `src/lib/approval-contract.ts` | Strict JSON shape, raw-byte digest, two approval records, and diagnostic errors; no Astro rendering. |
| Modify | `src/lib/articles.ts`, `src/lib/content-contract.ts` | Invoke approval validation for every `draft:false` entry; add pure newest-first sort and registered-section coverage assertion; apply coverage only in readiness mode. |
| Modify | `src/pages/[section]/[slug].astro` | Wrap shared shell; turn section/author values into native anchors; leave prose/media CSS local. |
| Modify | `src/content/articles/contract-markdown.md`, `contract-mdx.mdx` | Set `draft: true`; do not disguise or delete proof content. |
| Modify/Add | `playwright.config.ts`, `tests/article-journey.spec.ts`, `tests/discovery.spec.ts` | Run proof journeys against development and discovery/proof-absence against production with all artifacts under `.artifacts/`. |
| Modify | `package.json` | Keep `verify` structural; add explicit nonzero `launch:ready` using Astro's installed `--mode` flag. |
| Add only when supplied | `src/content/articles/<real>.md[x]`, `src/content/reviews/<slug>.json` | Real owner content and exact approvals; never create placeholders that pass. |
| Add planning evidence | `.planning/phases/03-real-content-and-section-discovery/03-CONTENT-INPUTS.md` | Non-public blank checklist for author/content/video/date/reference/reviewer inputs. |

`src/content.config.ts`, `src/config/registries.ts`, `src/lib/mdx-policy.ts`, and `YouTubePlayer.astro` should remain unchanged unless implementation proves an unavoidable integration need. Their current responsibilities already satisfy Phase 3. [VERIFIED: source inspection]

### Pattern 1: Strict Approval Sidecar Bound to Exact Bytes

**What:** For each public article, derive the sidecar path from the already-validated stable article slug, read the loader-provided article `filePath`, hash the raw `Buffer` with SHA-256, and compare it with a strict sidecar. Drafts do not need a sidecar. [VERIFIED: `03-CONTEXT.md` D-11–D-12]

**Recommended shape (type contract, not a passing sample):**

```ts
type ReviewDecision = {
  reviewer: string;          // owner-supplied real internal identity
  approvedAt: string;        // real YYYY-MM-DD date, not future
  decision: "pass";
};

type ArticleApprovalSidecar = {
  articleSlug: string;
  source: string;            // must equal normalized Astro entry.filePath
  sha256: string;            // lowercase 64-hex digest of exact raw file bytes
  classification: "launch";
  editorial: ReviewDecision & {
    substantive: true;
    videoMatchesArticle: true;
  };
  religiousAccuracy: ReviewDecision;
};
```

`substantive` and `videoMatchesArticle` record the required human editorial judgments against the same digest; they are not inferred by word count or network status. [VERIFIED: `03-SPEC.md` requirements 4–5]

```ts
// Source: Node built-ins already required by 03-CONTEXT.md D-11
const digest = createHash("sha256")
  .update(readFileSync(article.filePath))
  .digest("hex");
```

Hash raw bytes, including frontmatter and body. Do not normalize newlines, parse/re-serialize Markdown, hash only the body, or use Astro's shorter internal `digest`; any exact source edit must stale both approvals. [VERIFIED: D-11 exact-source requirement; `.astro/data-store.json` shows the internal digest is not the required 64-hex SHA-256]

Validation order should be: validate article data and canonical slug → require `filePath` for public entries → resolve sidecar from the slug → parse strict JSON → compare slug/source → validate both decision objects/dates → compare raw SHA-256. Each error must name the article slug and failed rule. [VERIFIED: `03-CONTEXT.md` D-12 and agent discretion]

### Pattern 2: Public and Preview Remain Different Queries

**What:** Keep `getPreviewArticles()` as the direct development route boundary for all drafts. Use only `getPublicArticles()` for homepage/section discovery in every mode; this prevents test records from looking published even during local discovery. [VERIFIED: `src/lib/articles.ts`, `03-CONTEXT.md` D-15–D-17]

| Record/state | `astro dev` direct article route | Homepage/section list | Normal production build | Launch readiness |
|--------------|----------------------------------|-----------------------|-------------------------|------------------|
| Draft proof | Included | Excluded | Excluded | Excluded |
| Draft real work-in-progress | Included | Excluded | Excluded | Excluded |
| Public article missing/stale approval | Validation error | No valid discovery output | Nonzero build | Nonzero |
| Approved launch article | Included | Included | Included | Counts toward its section |

This is stricter and simpler than letting development indexes mix drafts with public entries. The direct preview path already supplies draft access. [VERIFIED: current preview selector and D-15]

### Pattern 3: Deterministic Registry-Driven Indexing

```ts
// Source: existing canonical YYYY-MM-DD and slug contracts
const sorted = articles.toSorted((a, b) =>
  b.data.publishedAt.localeCompare(a.data.publishedAt) ||
  (a.data.slug < b.data.slug ? -1 : a.data.slug > b.data.slug ? 1 : 0),
);
```

Canonical `YYYY-MM-DD` strings sort chronologically with ordinary lexical comparison. Use direct code-point comparison for the slug tie-break rather than locale-sensitive collation, so output does not depend on ICU collation changes. [VERIFIED: `src/lib/content-contract.ts` date syntax; D-06]

Generate section static paths from `Object.entries(sectionRegistry).sort((a,b) => a[1].order - b[1].order)`. A section page filters public entries by the registry key, renders each exactly once, and shows the locked empty sentence only when no public entry exists. [VERIFIED: `03-UI-SPEC.md` Surface Contracts]

### Pattern 4: Separate Structural Build from Launch Readiness

Use the installed Astro CLI's native mode flag rather than an environment-variable package or second build system. [VERIFIED: local `astro build --help`]

```json
{
  "scripts": {
    "build": "astro build",
    "launch:ready": "astro build --mode launch-readiness"
  }
}
```

The article selector should invoke the pure registered-section coverage assertion only when `import.meta.env.MODE === "launch-readiness"`. Normal build still validates every `draft:false` sidecar but may succeed with zero public records and render truthful empty section indexes. [VERIFIED: D-12, D-16]

The readiness command must exit nonzero and list each missing section by stable key/Arabic label. It must not mutate sources, manufacture records, or convert missing content into warnings. [VERIFIED: `03-SPEC.md` acceptance criteria]

### Pattern 5: One Shared Shell, Local Article Rules

`SiteLayout.astro` should own `html[lang=ar][dir=rtl]`, UTF-8/viewport, the one-link header, body canvas/type, common column width, ordinary underlined links, focus outline, and one padding breakpoint. Homepage/index/author routes supply semantic content through the slot. [VERIFIED: `03-UI-SPEC.md` Shared Shell]

The article route keeps summary, prose headings, blockquote, references, media, and YouTube-control styles. Do not move `YouTubePlayer` or its client script into the shared layout; discovery pages must ship zero new client JavaScript. [VERIFIED: D-03, D-18; current route/component]

### Anti-Patterns to Avoid

- **Hide proofs only from indexes:** their static routes would remain public. Set both proof sources to `draft: true` and assert built-route absence. [VERIFIED: D-15/D-17]
- **Require launch coverage in ordinary `build`:** this would make structural work impossible while external inputs are missing. Use the separate mode command. [VERIFIED: D-16]
- **Hash parsed content:** newline/frontmatter edits could escape approval freshness. Hash the raw file buffer. [VERIFIED: D-11 exact-source wording]
- **Treat SHA-256 as reviewer authentication:** a digest prevents stale approvals but a committer who can edit both files can replace both. Repository access control and human review remain the authenticity boundary. [VERIFIED: threat analysis of local sidecar model]
- **Expose approval records:** never import reviewer names into page props or render a review badge. Add a built-output negative check. [VERIFIED: D-13]
- **Infer “substantive” from length:** word counts cannot prove religious/editorial adequacy. Record human decisions. [VERIFIED: `03-SPEC.md`]
- **Use `localeCompare("ar")` for the stable tie-break:** linguistic collation can change with ICU; the requirement is deterministic slug order, not reader-facing dictionary collation. [VERIFIED: D-06]
- **Duplicate three section pages:** it breaks the already-proven registry scalability contract. [VERIFIED: D-05, PUB-06]
- **Add optional author placeholders:** omission is the truthful state. [VERIFIED: D-09, `03-UI-SPEC.md`]
- **Move Phase 4 metadata into this phase:** titles/canonicals/schema/sitemap/robots/404 remain deferred. [VERIFIED: phase boundary]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SHA-256 | Custom hash or checksum | `node:crypto.createHash("sha256")` | Required exact algorithm exists in the runtime. [VERIFIED: D-11] |
| File access | Content HTTP endpoint or database | `node:fs.readFileSync` during static build | Review data is local build input. [VERIFIED: D-11] |
| Frontmatter parser for approvals | Regex/YAML re-parser | Astro `getCollection()` entry data plus `entry.filePath` | The collection already parses/validates metadata and exposes source identity. [VERIFIED: generated Astro types] |
| Routing | Manual HTML files or client router | Astro file routes + `getStaticPaths()` | Existing static pattern and no client runtime. [VERIFIED: current route/config] |
| Discovery data model | Three arrays/configs | `sectionRegistry` + validated article collection | Single source already exists. [VERIFIED: registries/content contract] |
| Date formatter | Custom Arabic date strings | Existing `Intl.DateTimeFormat("ar", {dateStyle:"long", timeZone:"UTC"})` pattern | Preserves current date-only semantics. [VERIFIED: article route] |
| Approval UI | Badges/reviewer components | No public rendering | Evidence is internal by decision. [VERIFIED: D-13] |
| Search/filtering | Client search library | Three semantic section lists | Launch corpus and scope do not justify search. [VERIFIED: REQUIREMENTS out of scope] |

**Key insight:** Phase 3 needs one new trust rule and three new static page shapes, not a new platform. [VERIFIED: repository gap analysis]

## Development vs Production Discovery Rules

1. `astro dev` keeps all drafts addressable at their final article paths through the existing preview selector. [VERIFIED: current route/selectors]
2. Homepage and section indexes always query approved public articles, never preview articles; draft proof URLs are reached only by known test paths. [RECOMMENDED: smallest interpretation of D-15/D-17]
3. Normal production build emits homepage, all three registered section roots, and author page even when sections are empty; it emits no draft article route. [VERIFIED: D-07/D-16]
4. Any `draft:false` record with missing/malformed/stale approvals fails every build, because claiming publication without approval is a content-contract violation rather than a launch-coverage issue. [VERIFIED: D-12]
5. The explicit launch build adds exact section-coverage checks; until real inputs exist, it must fail while normal structural verification can pass. [VERIFIED: D-16]
6. Browser proof coverage runs against `astro dev`; production browser coverage runs against the built preview and separately asserts no proof route, title, `example.com` reference, or demonstration mapping appears. [VERIFIED: D-17]

Recommended Playwright shape: retain one config with two projects and two local web servers—development tests match `article-journey.spec.ts` on one port, production tests match `discovery.spec.ts` on another. If concurrent Astro servers prove unstable, use two configs sequentially; no product behavior changes. [RECOMMENDED: `03-CONTEXT.md` agent discretion]

## Fixture Migration

- Set `draft: true` in both `contract-markdown.md` and `contract-mdx.mdx`; leave their explicit test wording intact so nobody mistakes them for launch content. [VERIFIED: D-15]
- Keep `contract-draft.md` a draft. It remains a selector fixture and need not become a browser journey. [VERIFIED: current test scope]
- Point the existing article journey suite at `astro dev`, preserving both Markdown and restricted-MDX coverage at their current final paths. [VERIFIED: existing DEV selector]
- Replace production assertions that expect the two proof files with assertions that both routes are absent and all visible discovery links come from approved public entries. [VERIFIED: D-17]
- Do not create fake “real” articles, fake approval JSON, or a passing sidecar example. Negative fixtures should be in-memory or temporary test data and must never enter public content directories. [VERIFIED: D-14]
- Keep every Playwright output, screenshot, trace, report, and temporary browser payload below `.artifacts/`; `.gitignore` already excludes it. [VERIFIED: `.gitignore`, `playwright.config.ts`]

## Common Pitfalls

### Pitfall 1: Approval Check Happens After Route Selection

**What goes wrong:** a public article can enter a route/index before stale approval is noticed. [VERIFIED: failure analysis]

**How to avoid:** validate all `draft:false` sidecars inside `getValidatedArticles()` before any public selector/route consumes entries. Drafts bypass only the approval requirement, not the existing content schema. [RECOMMENDED: current central loader pattern]

**Warning sign:** page code imports filesystem/review data or independently checks approvals. [VERIFIED: architecture anti-pattern]

### Pitfall 2: Readiness Becomes a Warning

**What goes wrong:** empty sections or missing content are logged but the launch command exits zero. [VERIFIED: D-16 contradicts this result]

**How to avoid:** throw one aggregated diagnostic listing all missing section requirements; automated tests must assert nonzero behavior. [RECOMMENDED]

### Pitfall 3: Public and Development Servers Are Confused

**What goes wrong:** proof tests pass only because production accidentally includes drafts, or production tests hit the dev server. [VERIFIED: current harness depends on the public proof route]

**How to avoid:** use distinct ports/project names, route readiness URLs, and explicit proof-presence/proof-absence assertions. [RECOMMENDED]

### Pitfall 4: Sidecar Privacy Is Misstated

**What goes wrong:** “internal” is interpreted as secret, even though Git readers can see reviewer identity. [VERIFIED: local sidecar storage model]

**How to avoid:** keep sidecars out of rendered output and confirm repository visibility plus reviewer consent before adding identities. If the repository is public, do not proceed until the owner chooses an approved private evidence location compatible with D-11. [RECOMMENDED: privacy/security gate]

### Pitfall 5: Section Sorting Is Tested Only by Example

**What goes wrong:** newest-first works, but equal dates are unstable or foreign-section entries leak. [VERIFIED: D-06]

**How to avoid:** native tests cover differing dates, equal dates, each registry key, duplicates, and set equality; browser tests inspect rendered link order. [RECOMMENDED]

### Pitfall 6: Shared CSS Becomes a Design System

**What goes wrong:** article-only media/prose rules spread to all pages or new tokens/components appear. [VERIFIED: D-03/D-18]

**How to avoid:** shared layout owns only document/header/column/type/link/focus rules; route CSS owns surface-specific list/article rules. [VERIFIED: `03-UI-SPEC.md`]

### Pitfall 7: SEO Scope Creep

**What goes wrong:** Phase 3 adds incomplete titles, canonical URLs, structured data, sitemap, or robots before a production origin exists. [VERIFIED: Phase 4 boundary and STATE blocker]

**How to avoid:** verify crawlable anchors and static routes only; leave identity/discovery files to Phase 4. [VERIFIED: `03-SPEC.md`]

### Pitfall 8: “Video Exists” Is Treated as “Video Matches”

**What goes wrong:** an 11-character ID or HTTP success is accepted as editorial relevance. [VERIFIED: current proof uses a valid demonstration ID that is explicitly not launch content]

**How to avoid:** retain technical ID validation, but require the digest-bound human editorial `videoMatchesArticle: true` record and a manual direct-link check. [RECOMMENDED from CONT-01]

## SEO, Accessibility, Performance, and Security Pitfalls

| Domain | Required protection | Verification |
|--------|---------------------|--------------|
| SEO/crawlability | Static same-tab anchors, registered paths, no client routing, no hidden drafts, no broken homepage links. Do not implement Phase 4 metadata early. [VERIFIED: SITE-03/04, phase boundary] | Inspect built HTML and crawl all local anchors; set equality against registries/public entries. |
| Arabic/RTL | `lang="ar" dir="rtl"`, one `h1`, semantic lists, logical CSS, UTC-stable `<time>`, no visible raw slugs or unisolated Latin prose. [VERIFIED: UI-SPEC] | Native rendered-copy guard plus browser semantic/bidi tests. |
| Accessibility | Header/main landmarks, ordered headings, native anchors, visible 3px focus, 44px standalone home target, reflow 320–1440 and native 200% zoom. [VERIFIED: UI-SPEC] | Playwright/axe plus manual zoom/focus/landmark inspection. |
| Performance | No new client script, remote asset, image, font, card library, animation, or runtime fetch on discovery pages. Keep player code article-only. [VERIFIED: D-18] | Built-source/DOM negative assertions and request capture. |
| Content security | Reuse strict Markdown/MDX and HTTPS-reference boundaries; never render review JSON. [VERIFIED: Phase 2 contract] | Existing negative tests plus built-output reviewer/sidecar scan. |
| Approval integrity | Raw SHA-256 exact bytes, strict sidecar shape, non-future real dates, pass-only decisions, public fail-closed. [VERIFIED: D-11/D-12] | Native positive/negative/stale tests. |
| Privacy | Reviewer identity is required internally but must not be public; repository visibility must be understood. [VERIFIED: D-13] | Human repo-access confirmation plus dist/browser negative checks. |

## Code Examples

### Registry Paths Without Duplication

```ts
// Source: existing src/config/registries.ts pattern
const sections = Object.entries(sectionRegistry).sort(
  ([, a], [, b]) => a.order - b.order,
);

return sections.map(([sectionKey, section]) => ({
  params: { section: section.slug },
  props: { sectionKey, section },
}));
```

### Stable Public Article Link

```astro
---
// Source: existing articlePath() contract
import { articlePath } from "../../lib/content-contract.ts";
---

<h2><a href={articlePath(article)}>{article.data.title}</a></h2>
```

### Truthful Omission

```astro
<!-- Source: 03-UI-SPEC.md; current registry has only the name -->
<h1>عن {authorRegistry.ahmedElMangawy.name}</h1>
<p>تنشر المدونة مقالات عربية في الردود والشبهات والقضايا العامة والعلوم الشرعية، وتربط كل مقال بالمحتوى الموافق له على يوتيوب.</p>
<a href="/">العودة إلى الصفحة الرئيسية</a>
```

Do not create empty biography/expertise elements or an optional-fact registry schema until real approved fields arrive. [VERIFIED: D-09]

## State of the Art

| Current repository approach | Phase 3 approach | Impact |
|-----------------------------|------------------|--------|
| Two isolated public proof routes [VERIFIED: current build model] | Draft-only proof routes in development plus production discovery routes [VERIFIED: D-15–D-17] | Preserves regression coverage without polluting launch surfaces. |
| Publication eligibility = valid metadata + `draft:false` [VERIFIED: current selector] | Publication eligibility additionally requires exact-source dual approval [VERIFIED: D-11/D-12] | Prevents stale/unreviewed public content. |
| Full document/CSS duplicated in the sole route [VERIFIED: article route] | One small shell with article-specific rules retained locally [VERIFIED: D-01/D-03] | Enables four route types without a design-system abstraction. |
| Browser suite uses production proof URLs [VERIFIED: Playwright config] | Development proof suite plus production discovery suite [VERIFIED: D-17] | Proves both preview capability and production exclusion. |

No deprecation or external ecosystem migration is needed in this phase. [VERIFIED: package/config inspection]

## Truthful External Inputs and Readiness Boundary

### Inputs That Are Not Present

| Required input | Current evidence | Status |
|----------------|------------------|--------|
| One real article source per primary section | Only two explicit proof articles and one draft selector fixture exist; `refutations` has no article. [VERIFIED: source inventory] | Missing |
| Matching real YouTube ID/URL per article | Proofs use the demonstration ID `dQw4w9WgXcQ`; no owner-supplied launch mappings exist. [VERIFIED: fixtures, STATE] | Missing |
| Real publication/update dates and required references | Current dates/references are explicitly proof data, including `example.com`. [VERIFIED: fixtures] | Missing |
| Editorial reviewer identity/date/pass for exact revision | No review directory or sidecar exists. [VERIFIED: repository inventory] | Missing |
| Religious-accuracy reviewer identity/date/pass for exact revision | No review directory or sidecar exists. [VERIFIED: repository inventory] | Missing |
| Approved author facts beyond the name | Registry contains only the name, which D-09 marks safe; all optional facts remain absent. [VERIFIED: registry, D-09] | Optional and intentionally omitted |

### Required Gate Behavior

- Structural implementation can complete and `npm run verify` can be green without launch articles; the three section roots show truthful empty states. [VERIFIED: D-07/D-16]
- `npm run launch:ready` must fail nonzero while any registered section lacks an approved public launch article. [VERIFIED: D-16]
- Adding real sources as drafts must not change production discovery or readiness. [VERIFIED: D-12]
- Changing one approved source byte must stale its sidecar and make the public build fail until humans review the new revision and update the digest/records. [VERIFIED: D-11/D-12]
- Automation cannot declare article substance, religious accuracy, factual accuracy, reference adequacy, or video match by itself. These require owner-supplied packages and real human evidence. [VERIFIED: `03-SPEC.md`]
- Phase 3 must remain incomplete, and Phase 4 production-discovery work must not proceed, until both `npm run verify` and `npm run launch:ready` pass and the manual content audit is recorded. [VERIFIED: D-16]

### Content-Input Checklist Recommendation

Create one planning-only `03-CONTENT-INPUTS.md` with four rows: approved author facts, refutations package, general-issues package, scholarship package. For each article row, leave source text, YouTube mapping, real dates, required references, editorial identity/date, and religious-accuracy identity/date blank until supplied. Do not include example values or “approved” defaults. [VERIFIED: D-14]

Before recording reviewer identities, confirm repository visibility and reviewer consent because “not rendered publicly” does not mean “secret from repository readers.” [RECOMMENDED: security/privacy boundary]

## Recommended Plan Decomposition (Vertical MVP Slices)

### Plan 03-01 — Fail-Closed Publication Boundary

- Add the small approval contract using Node `fs`/`crypto`, strict JSON, raw-byte digest, and diagnostic native tests. [VERIFIED: D-11/D-12]
- Invoke it centrally for every `draft:false` entry; add pure section-coverage/readiness logic and `npm run launch:ready`. [VERIFIED: D-12/D-16]
- Demote both public proofs to drafts and move their Markdown/MDX browser journeys to the development server in the same plan so `verify` never has a broken intermediate state. [VERIFIED: D-15]
- Acceptance: native approval stale/missing/pass cases work; proof paths exist in dev, not production; ordinary build passes; readiness fails for the three missing sections. [RECOMMENDED]

### Plan 03-02 — Complete Static Discovery Graph

- Add the shared shell, homepage, one registry-derived section-index route, author route, and linked article section/author facts. [VERIFIED: D-01–D-10]
- Add deterministic sort/set-equality helpers and structural native/build assertions. [VERIFIED: D-05–D-07]
- Acceptance: `/`, all three section roots, and `/عن-أحمد-المنجاوي/` build; every anchor resolves; empty states are truthful; no optional author claim appears. [VERIFIED: UI-SPEC]

### Plan 03-03 — Production/Development Browser Proof

- Add production discovery tests and preserve the development article matrix. [VERIFIED: D-17/D-19]
- Cover no-JS, keyboard, Arabic/RTL, one-H1/list semantics, sort/order, 320–1440 reflow, axe, proof absence, no reviewer output, and visual-token continuity. [VERIFIED: UI-SPEC verification matrix]
- Run `npx ui-skills start` before UI implementation as required by workspace instructions, then run Hercules visual QA after the rendered graph exists; keep all outputs under `.artifacts/`. [VERIFIED: parent AGENTS instructions]
- Acceptance: full structural `npm run verify` green; no phase-scoped visual or logic finding remains. [RECOMMENDED]

### Plan 03-04 — Truthful Launch Corpus and Human Sign-Off (External Input Gate)

- Checkpoint for the owner-supplied three article/video/date/reference packages and real reviewer records; do not fabricate missing data. [VERIFIED: D-14]
- Add the real sources first as drafts, run preview/content review, obtain both approvals for exact final bytes, then flip to public and add sidecars. [RECOMMENDED: fail-closed workflow]
- Run structural verify, launch readiness, direct video-match checks, fact-by-fact author/content audit, browser discovery on real content, Hercules review, and Phase 3 UAT. [VERIFIED: `03-SPEC.md` acceptance]
- Acceptance: every registered section has one substantive approved real article; proof traces are absent; both commands pass; human evidence is recorded. [VERIFIED: Phase 3 goal]

Plans 03-01 through 03-03 are safe to execute without real-world content. Plan 03-04 is truthfully blocked until the owner supplies the required packages and reviewers act. [VERIFIED: current repository state and D-16]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | No implementation recommendation relies on an unverified real-world fact. All personal, article, video, date, reference, and reviewer data remains explicitly missing. | Entire document | None; the final content slice stays gated. |

The one discretionary recommendation—using public-only entries in development indexes while keeping draft proof routes directly previewable—is identified as a recommendation, not a locked factual claim. [RECOMMENDED: smallest interpretation of D-15/D-17]

## Open Questions (RESOLVED)

1. **What optional author facts should be shown?**
   - Resolution status: **RESOLVED** — omit every optional author fact truthfully until the owner supplies and approves it.
   - What is known: only `أحمد المنجاوي` is approved and present. [VERIFIED: registry, D-09]
   - Recommendation: ship the minimal author page with name, locked publication-purpose copy, and home link; add nothing else until supplied.

2. **Which three article/video packages are launch content?**
   - Resolution status: **RESOLVED / DELEGATED to Plan 03-04 Task 2** — infer no value; its blocking checkpoint requires the owner to supply one complete package per registered section.
   - What is known: none exists in the repository. [VERIFIED: source inventory]
   - Recommendation: owner supplies one package per registered section; do not repurpose proof fixtures.

3. **Who performs each review and on what date?**
   - Resolution status: **RESOLVED / DELEGATED to Plan 03-04 Task 2** — infer no identity, date, or pass value; its blocking checkpoint remains closed until real reviewers act on the exact final bytes.
   - What is known: no reviewer evidence exists. [VERIFIED: repository inventory]
   - Recommendation: require real identity/date/pass records after final source bytes are ready; never seed them.

4. **Can reviewer identities safely live in this Git repository?**
   - Resolution status: **RESOLVED / DELEGATED to Plan 03-04 Task 2** — its checkpoint blocks sidecar publication until the owner confirms repository visibility and every reviewer's informed consent.
   - What is known: D-11 requires local sidecars and D-13 forbids public rendering, but repository visibility/consent is not documented. [VERIFIED: CONTEXT; missing local evidence]
   - Recommendation: confirm repository access and reviewer consent before committing identities. This is a privacy/security checkpoint, not a reason to delay structural work.

5. **Should development indexes show drafts?**
   - Resolution status: **RESOLVED** — indexes remain public-only in every mode; drafts are previewed directly at their final paths through the development boundary.
   - What is known: drafts must be previewable, but production discovery must be public-only. [VERIFIED: D-15/D-17]
   - Recommendation: indexes remain public-only in every mode; direct final-path preview covers drafts with less ambiguity.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Build, SHA-256, native tests | ✓ | 24.19.0 | None; exact version required. [VERIFIED: local probe] |
| npm | Package scripts | ✓ | 11.17.0 | None; exact version required. [VERIFIED: local probe] |
| Astro | Static routes/build/readiness mode | ✓ | 7.2.7 | None needed. [VERIFIED: local CLI probe] |
| Playwright | Browser validation | ✓ | 1.62.1 | Focused manual browser checks only if executable later disappears. [VERIFIED: local CLI probe] |
| Playwright Chromium | Local route/UI checks | ✓ | Installed at `chromium-1234` path | System Chrome plus manual evidence if needed. [VERIFIED: executable-path probe] |
| Git | Local sidecar/content workflow | ✓ | 2.51.0.windows.1 | None needed. [VERIFIED: local probe] |
| Real content/review inputs | Launch readiness | ✗ | — | No safe fallback; human input required. [VERIFIED: repository inventory] |

**Missing dependency with no fallback:** owner-supplied launch content, matching videos, real dates/references, and dual human approvals. [VERIFIED: current state]

## Validation Architecture

### Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | Node 24 native `node:test`; Astro check/build; Playwright 1.62.1 + axe 4.13.0 [VERIFIED: `package.json`] |
| Config file | `playwright.config.ts`; native test command is in `package.json` [VERIFIED: repository] |
| Quick run command | `npm test` |
| Full suite command | `npm run verify` |
| Launch gate command | `npm run launch:ready` (new; intentionally red until truthful inputs exist) |
| Current quick runtime | ~8.1 seconds wall-clock; 69/69 pass on 2026-08-27 [VERIFIED: local run] |
| Browser artifacts | `.artifacts/playwright/**` only [VERIFIED: config/gitignore] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SITE-03 | Homepage has registry-order ordinary anchors to all three section roots; each resolves. | native + production browser | `npm test && npm run test:browser` | ❌ Wave 0 discovery cases |
| SITE-04 | Each registered index contains all and only approved public entries once, sorted date-desc/slug-asc; empty state is truthful. | native + production browser | `npm test && npm run test:browser` | ❌ Wave 0 sort/set/discovery cases |
| SITE-05 | Every public byline links to one Arabic author route; page shows only approved fields and home link. | browser + human fact comparison | `npm run test:browser` | ❌ Wave 0 discovery cases |
| CONT-01 | One approved launch record exists per section and direct video mapping is recorded. | readiness command + manual content/video audit | `npm run launch:ready` | ❌ Wave 0 coverage gate; real inputs missing |
| CONT-02 | Public record requires current editorial and religious-accuracy pass records for exact bytes. | native negative/positive + build | `npm test && npm run build` | ❌ Wave 0 approval cases |
| CONT-03 | No proof/public placeholder claims; visible facts match owner input; reviewer identities absent from public output. | native/browser negative + manual fact audit | `npm run verify` | ❌ Wave 0 production negative cases; owner input missing |

### Per-Task Sampling

- **After approval/sort/selector tasks:** `npm test`.
- **After each Astro route/layout task:** `npm test && npm run check && npm run build`.
- **After browser/config tasks:** focused Playwright project/file, then `npm run verify` at wave end.
- **After real content changes:** `npm run verify` and `npm run launch:ready`; never accept only one.
- **Before `$gsd-verify-work`:** both commands green plus manual content/reviewer evidence.
- **Max automated feedback latency:** quick native feedback is currently ~8 seconds; route/build feedback should remain under 30 seconds on this machine unless browser launch dominates. [VERIFIED: local native run; Phase 2 evidence]

### Wave 0 Gaps

- [ ] Approval-sidecar tests: missing file, invalid JSON, unknown/missing field, malformed/non-future date, non-pass decision, source mismatch, digest mismatch, both approvals pass, draft bypass.
- [ ] Sorting/coverage tests: date descending, equal-date slug ascending, one/multiple/missing section, foreign section, duplicate prevention.
- [ ] `tests/discovery.spec.ts`: static route graph, registry parity, set equality, author truth, proof absence, no-JS, keyboard, reflow, axe, reviewer-output absence.
- [ ] Playwright project/server split: development proof routes vs production discovery routes, distinct readiness URLs/ports, artifact paths unchanged.
- [ ] `launch:ready` script and a failing-capable test that proves missing sections exit nonzero.

No framework installation or shared fixture framework is required. Extend the existing native helpers and keep test data in memory or temporary directories outside watched source/planning paths. [VERIFIED: current infrastructure, artifact rule]

### Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Article is substantive and independently useful | CONT-01 | Structure/length cannot prove editorial usefulness. | Human editorial reviewer reads final exact source and records pass only after topic is answered. |
| YouTube video genuinely matches article | CONT-01/CONT-03 | A valid/reachable ID does not prove semantic match. | Open owner-supplied direct URL, compare subject to article, record digest-bound editorial match. |
| Religious claims are accurate and references adequate | CONT-02/CONT-03 | Requires qualified human judgment. | Religious-accuracy reviewer checks final exact source/references and records pass. |
| Author/profile facts are true | SITE-05/CONT-03 | Repository cannot independently prove biography/credentials. | Compare every rendered claim with owner-approved input; omitted facts require no claim. |
| Reviewer identities/dates are real and consented | CONT-02 | Automation validates shape, not identity or consent. | Owner verifies identity/date and repository privacy before sidecar commit. |
| Native 200% zoom and final Arabic visual quality | SITE-03/04/05 | Existing Phase 2 process treats true browser zoom/visual judgment as manual. | Inspect homepage, longest section, representative article, author page at native 200%; record Hercules evidence under `.artifacts/`. |

### Validation Sign-Off Conditions

- Every implementation task has an automated command or explicit Wave 0 dependency.
- No three consecutive tasks lack automated feedback.
- No `.skip`, `.only`, `.fixme`, warning-only readiness result, or browser artifact outside `.artifacts/`.
- Ordinary `verify` remains green before real content arrives; readiness remains deliberately red.
- Final Phase 3 sign-off requires ordinary verification, launch readiness, human content approvals, and rendered UI review all green.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No accounts or runtime service exist. [VERIFIED: project scope] |
| V3 Session Management | No | Static site has no sessions. [VERIFIED: project scope] |
| V4 Access Control | Limited, repository process only | Git/repository permissions protect internal reviewer evidence; no public authorization code is added. [VERIFIED: architecture] |
| V5 Input Validation | Yes | Existing Astro/Zod/shared content contract plus strict approval JSON validation. [VERIFIED: current source + D-12] |
| V6 Cryptography | Yes, integrity binding only | Node built-in SHA-256 binds approvals to exact bytes; it is not a signature or identity proof. [VERIFIED: D-11 and threat analysis] |
| V8 Data Protection | Yes | Reviewer identities must not enter rendered HTML/dist and repository visibility requires confirmation. [VERIFIED: D-13] |
| V14 Configuration | Yes | Separate structural and launch modes must fail with the correct exit semantics. [VERIFIED: D-16] |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Edited article retains stale approval | Tampering | Raw SHA-256 mismatch rejects public build. |
| Sidecar points at another source/article | Tampering | Exact `articleSlug` and normalized `source` equality plus slug-derived sidecar path. |
| Missing review is treated as public | Elevation of privilege / process bypass | Central fail-closed validation before public selection. |
| Reviewer identity leaks to public HTML | Information disclosure | Never pass sidecars to routes; scan `dist`/DOM for reviewer fields/values. |
| Malicious reference/MDX enters article | Tampering/XSS | Preserve existing HTTPS-reference and restricted-MDX policies. [VERIFIED: Phase 2] |
| Test proof appears in production | Information integrity | `draft:true`, production route/index absence assertions, launch classification in sidecar. |
| Same committer alters article and sidecar | Tampering | SHA-256 alone cannot prevent this; repository review/access policy and actual human sign-off remain required. |

Do not add digital signatures, PKI, a secrets system, or remote approval service in Phase 3; none is requested, and the sidecar model is explicitly local. [VERIFIED: D-11 and project exclusions]

## Sources

### Primary (HIGH confidence)

- `03-SPEC.md`, `03-CONTEXT.md`, `03-UI-SPEC.md` — locked phase scope, decisions, UI contract, truth/readiness rules.
- `ROADMAP.md`, `REQUIREMENTS.md`, `STATE.md` — phase goal, requirement definitions, current blockers.
- `src/config/registries.ts`, `src/content.config.ts`, `src/lib/*.ts`, `src/pages/[section]/[slug].astro` — live architecture and reusable boundaries.
- `tests/content-contract.test.ts`, `tests/article-journey.spec.ts`, `playwright.config.ts`, `package.json` — executable current validation.
- `02-VERIFICATION.md` — independently verified Phase 2 behavior and retained browser evidence.
- Installed Astro 7.2.7 CLI/type output — `--mode` support and content-entry `filePath` availability. [VERIFIED: local probe]

### Official documentation already cited by project research (HIGH confidence)

- [Astro content collections](https://docs.astro.build/en/guides/content-collections/) — build-time content loading and querying. [CITED: docs.astro.build/en/guides/content-collections/]
- [Astro configuration reference](https://docs.astro.build/en/reference/configuration-reference/) — static output/configuration context. [CITED: docs.astro.build/en/reference/configuration-reference/]
- [MDN `dir`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/dir), [`lang`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/lang), and [`<bdi>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi) — native Arabic/RTL and bidi primitives. [CITED: developer.mozilla.org]

No web search was used to infer project-specific biography, article, video, date, reference, reviewer, hosting, or production facts. [VERIFIED: research process]

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — exact installed versions and current source were inspected.
- Architecture: HIGH — the recommended flow extends existing selectors/routes and locked decisions without a new dependency.
- Approval integrity: HIGH for stale-revision detection; MEDIUM for operational authenticity because repository permissions and human process remain external.
- UI/accessibility: HIGH — approved UI-SPEC and verified Phase 2 tokens/patterns are explicit.
- Real launch corpus: LOW/blocked — no truthful owner content or reviewer evidence exists locally.

**Research date:** 2026-08-27
**Valid until:** 2026-09-26 for structural guidance; external facts have no validity until supplied and approved.
