# Phase 1: Content and URL Contract - Context

**Gathered:** 2026-08-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 creates the static project, content contracts, stable Arabic identity rules, safe preview behavior, and runnable validation checks that every later route and public surface will consume. It does not deliver the finished reader experience, discovery pages, production SEO output, hosting, or analytics.

</domain>

<spec_lock>
## Requirements (locked via SPEC.md)

**7 requirements are locked.** See `01-SPEC.md` for full requirements, boundaries, and acceptance criteria.

Downstream agents MUST read `01-SPEC.md` before planning or implementing. Requirements are not duplicated here.

**In scope (from SPEC.md):**
- Minimal static project and pinned development/build commands needed to load, preview, check, and build the content contract.
- One Markdown/MDX article collection and one central section/author configuration boundary.
- Explicit Arabic article and section slug policy with normalization, safety, and collision checks.
- Required article metadata, date, draft, and YouTube identifier validation.
- Production-vs-preview draft filtering.
- Restricted MDX component surface and failure checks.
- Small valid and invalid fixtures or equivalent runnable checks proving the contract.
- Authoring documentation sufficient to create and preview a record.

**Out of scope (from SPEC.md):**
- Finished Arabic article layout, typography, accessibility treatment, and YouTube player — Phase 2 owns the reader journey.
- Homepage, section indexes, About page, and three final reviewed articles — Phase 3 owns public discovery and launch content.
- Page titles, descriptions, canonicals, social metadata, sitemap, robots directives, and public 404 implementation — Phase 4 owns search-discovery integrity.
- Production domain selection, Cloudflare deployment, Search Console, and analytics — Phase 5 owns the live operating boundary.
- Production crawl and Core Web Vitals verification — Phase 6 owns launch verification.
- CMS, database, authentication, search, community, AI content generation, or automatic transcript import — excluded from v1.
- Automatic published-URL migration or redirect generation — no published routes exist yet; future URL changes require an explicit superseding decision.

</spec_lock>

<decisions>
## Implementation Decisions

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Locked Phase Scope
- `.planning/phases/01-content-and-url-contract/01-SPEC.md` — Locked requirements, boundaries, constraints, and pass/fail acceptance criteria; MUST be read first.
- `.planning/ROADMAP.md` § Phase 1 — Phase goal, dependency order, seven mapped requirement IDs, and roadmap success criteria.
- `.planning/REQUIREMENTS.md` — Canonical definitions for `SEO-01` and `PUB-01` through `PUB-06`.
- `.planning/PROJECT.md` — Arabic-only, static, file-based publishing, performance, and no-backend project constraints.

### Research and Project Guidance
- `.planning/research/STACK.md` — Verified 2026 Astro/Node/npm/TypeScript versions and intentionally excluded dependencies.
- `.planning/research/ARCHITECTURE.md` — One-way static content pipeline, registry/query boundaries, URL strategy, and vertical build order.
- `.planning/research/PITFALLS.md` — Unicode identity, draft leakage, MDX trust, and build-validation failure modes.
- `AGENTS.md` — Repository-level project constraints, selected stack, and mandatory GSD workflow entry points.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None. The repository contains only planning and instruction files; no application scaffold, source module, component, content entry, or test exists.

### Established Patterns
- Planning has locked a fully static, registry-driven Astro architecture with Markdown preferred over MDX and native platform features preferred over libraries.
- GSD artifacts are committed atomically, and phase requirements must remain traceable to `SEO-01` and `PUB-01`–`PUB-06`.

### Integration Points
- New root package/runtime configuration and lockfile.
- New Astro configuration, content configuration, article source directory, registry module, identity/validation helpers, minimal route, approved MDX component map, and focused contract tests.
- Later phases will consume the validated public-query and path-helper interfaces; those boundaries must be stable and documented.

</code_context>

<specifics>
## Specific Ideas

- Public paths remain human-readable Arabic and keep section context: `/{Arabic section slug}/{explicit Arabic article slug}/`.
- Invalid authoring input fails closed with its source location instead of being silently repaired.
- The same final route shape is used during preview, avoiding a disposable preview architecture.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-content-and-url-contract*
*Context gathered: 2026-08-26*
