# Phase 1: Content and URL Contract — Specification

**Created:** 2026-08-26
**Ambiguity score:** 0.05 (gate: ≤ 0.20)
**Requirements:** 7 locked

## Goal

Change the empty repository into a locally previewable, build-validated Markdown/MDX publishing foundation in which every article and section has an explicit stable identity and invalid or non-public content cannot enter production output.

## Background

The repository currently contains planning artifacts only: no application scaffold, content directory, route implementation, validation boundary, preview command, or tests exist. The roadmap assigns Phase 1 the content and URL contract required by every later route, metadata record, sitemap entry, article layout, and measurement dimension. A mistake here would make published Arabic URLs unstable or allow malformed, unsafe, or draft content to propagate across later phases.

## Requirements

1. **SEO-01 — Stable Arabic article identity**: Each article declares a public Arabic slug independent of its title, and the public path combines the registered Arabic section slug with that article slug using one trailing-slash policy.
   - Current: No content records, section slugs, routes, or URL policy exist.
   - Target: The three sections have explicit Arabic public slugs, every article has an explicit immutable slug, title edits do not change the path, and the contract produces `/{section-slug}/{article-slug}/`.
   - Acceptance: A valid fixture keeps the same derived path after its title changes; a fixture with no explicit slug fails validation; path generation produces one normalized trailing slash and no query-string identity.

2. **PUB-01 — File authoring and faithful local preview**: The owner can create or edit a Markdown or MDX article and preview it through the same validated collection used by production builds.
   - Current: No Astro project, content collection, article files, or preview command exists.
   - Target: A minimal static project loads `.md` and `.mdx` article records through one content boundary, and the documented local development command renders a valid sample record without a second preview-only schema.
   - Acceptance: The documented preview command starts successfully, a valid Markdown fixture renders, a valid MDX fixture using an approved component renders, and an edited field is reflected after reload without copying the record into another format.

3. **PUB-02 — Complete article metadata contract**: Public article records contain all facts later phases require and the build rejects missing or semantically invalid facts.
   - Current: No article schema exists.
   - Target: The contract requires non-empty `title`, `description`, and `summary` (`الخلاصة`); registered `section` and `author` identifiers; explicit `slug`; ISO publication date; explicit boolean draft state; and a valid 11-character YouTube video ID. A material-update date is optional but cannot precede publication, and a non-draft publication date cannot be in the future because v1 has no scheduler.
   - Acceptance: One valid record passes checks; separate fixtures missing each required field fail with the article path and field name; invalid dates, an unknown section or author, and malformed YouTube IDs fail before static output is produced.

4. **PUB-03 — Normalized unique identifiers**: The validation boundary rejects route ambiguity and unsafe Unicode before any route is generated.
   - Current: No identifier validation or collision detection exists.
   - Target: Section and article slugs must already be Unicode NFC, use Arabic letters/marks, Arabic or ASCII digits, and single hyphen separators, and contain no leading/trailing/repeated hyphen, slash, backslash, dot segment, percent escape, control character, or bidirectional formatting control. Uniqueness is checked on the normalized complete public path.
   - Acceptance: Valid Arabic slug fixtures pass; fixtures covering non-NFC text, separators, dot segments, controls, bidi controls, repeated/edge hyphens, and two records resolving to the same normalized path each fail with actionable diagnostics.

5. **PUB-04 — Drafts fail closed**: Draft state is explicit and draft records cannot enter any production content query.
   - Current: No draft model or public-query boundary exists.
   - Target: Every record declares a boolean draft value; missing or non-boolean values fail validation; production helpers return only records with `draft: false`; local preview can intentionally include drafts.
   - Acceptance: A build/query check with one public and one draft fixture returns only the public record for production, exposes both only through the explicit preview path, and proves the draft cannot contribute a public path.

6. **PUB-05 — Restricted MDX capability**: MDX supports only the small project-approved component surface and cannot introduce executable imports, scripts, or unreviewed iframe sources from article files.
   - Current: No MDX integration, component mapping, or authoring restriction exists.
   - Target: Markdown is the default; MDX resolves components through one central allowlist; article-authored ESM import/export, script content, raw iframe markup, and unknown components fail validation or compilation.
   - Acceptance: An approved-component fixture renders; fixtures containing an import/export, script, raw iframe, and unknown component each fail the documented content check before production output.

7. **PUB-06 — Registry-driven section extension**: Section identity and presentation facts live in one validated registry consumed by content validation and route derivation.
   - Current: No section source of truth exists.
   - Target: The registry contains the three approved Arabic sections with stable keys, labels, public slugs, descriptions, and navigation order, and article records reference only registered keys. Adding a future section requires one registry entry and content, not another schema, collection, or layout family.
   - Acceptance: All three approved sections validate; an article with an unknown key fails; a temporary fourth registry entry plus matching article passes the same checks and derives a path without source changes outside the registry/content fixtures.

## Boundaries

**In scope:**
- Minimal static project and pinned development/build commands needed to load, preview, check, and build the content contract.
- One Markdown/MDX article collection and one central section/author configuration boundary.
- Explicit Arabic article and section slug policy with normalization, safety, and collision checks.
- Required article metadata, date, draft, and YouTube identifier validation.
- Production-vs-preview draft filtering.
- Restricted MDX component surface and failure checks.
- Small valid and invalid fixtures or equivalent runnable checks proving the contract.
- Authoring documentation sufficient to create and preview a record.

**Out of scope:**
- Finished Arabic article layout, typography, accessibility treatment, and YouTube player — Phase 2 owns the reader journey.
- Homepage, section indexes, About page, and three final reviewed articles — Phase 3 owns public discovery and launch content.
- Page titles, descriptions, canonicals, social metadata, sitemap, robots directives, and public 404 implementation — Phase 4 owns search-discovery integrity.
- Production domain selection, Cloudflare deployment, Search Console, and analytics — Phase 5 owns the live operating boundary.
- Production crawl and Core Web Vitals verification — Phase 6 owns launch verification.
- CMS, database, authentication, search, community, AI content generation, or automatic transcript import — excluded from v1.
- Automatic published-URL migration or redirect generation — no published routes exist yet; future URL changes require an explicit superseding decision.

## Constraints

- The application remains fully static; content is validated at build time and no request-time server, database, or secret is introduced.
- Markdown is preferred; MDX exists only for approved presentational components.
- Public paths use UTF-8 Arabic slugs and one trailing-slash convention; filenames and titles are not public identity.
- Validation occurs once at the content/registry boundary so downstream code may trust typed records.
- The three public section labels remain الردود والشبهات, القضايا العامة, and القسم العلمي; القسم العلمي means structured Islamic scholarship.
- New article records fail closed: explicit draft state and required metadata are mandatory.
- Phase 1 must leave at least one runnable check that fails when non-trivial validation logic regresses.

## Acceptance Criteria

- [ ] The documented install, check, preview, and production-build commands complete successfully for valid content.
- [ ] Both a Markdown article and an approved-component MDX article load through one validated collection.
- [ ] Changing a title does not change its derived Arabic public path.
- [ ] Missing required metadata and every documented invalid field class stop the build with file-and-field diagnostics.
- [ ] Unsafe, non-normalized, and colliding Arabic paths are rejected before route generation.
- [ ] Draft content is visible only through an explicit preview path and contributes no production route.
- [ ] Article-authored imports/exports, scripts, raw iframes, and unknown MDX components are rejected.
- [ ] The three approved sections are defined once and unknown section/author identifiers fail validation.
- [ ] A temporary fourth registered section works through the existing contract without a new collection, schema, or layout.
- [ ] No application runtime, database, authentication, CMS, search, analytics, or finished reader UI is added in this phase.

## Ambiguity Report

| Dimension | Score | Min | Status | Notes |
|-----------|-------|-----|--------|-------|
| Goal Clarity | 0.96 | 0.75 | ✓ | Empty baseline and seven target capabilities are explicit. |
| Boundary Clarity | 0.96 | 0.70 | ✓ | Later-phase reader, SEO, deployment, and verification surfaces are excluded. |
| Constraint Clarity | 0.94 | 0.65 | ✓ | Identifier, draft, date, MDX, static-runtime, and registry constraints are locked. |
| Acceptance Criteria | 0.95 | 0.70 | ✓ | Valid and invalid fixtures provide binary checks for every contract branch. |
| **Ambiguity** | **0.05** | **≤0.20** | **✓** | Weighted clarity is 95%. |

## Interview Log

The project goal explicitly grants approval to use recommended answers and continue. The one-shot gray-area questionnaire was therefore resolved in `--auto` mode after all areas were identified.

| Round | Perspective | Question summary | Decision locked |
|-------|-------------|------------------|-----------------|
| 1 | Researcher | What exists, and what missing capability triggers Phase 1? | Planning files exist; the repository lacks all application, content, validation, preview, and test artifacts. |
| 2 | Simplifier | What is the irreducible publishing foundation? | One static project, one collection, one registry, one validation boundary, and runnable contract checks; no backend or CMS. |
| 3 | Boundary Keeper | Which public surfaces belong later? | Reader UI, indexes, full SEO output, deployment, analytics, and production audits stay in Phases 2–6. |
| 4 | Failure Analyst | Which mistakes must make verification fail? | Missing facts, unsafe/non-NFC identifiers, route collisions, draft leakage, invalid dates/video IDs, and arbitrary MDX capabilities all fail closed. |
| 5 | Seed Closer | What identity and metadata choices cannot remain implicit? | Explicit Arabic section/article slugs, required draft state, stable registry keys, content facts for later phases, and a central MDX allowlist are locked. |

---

*Phase: 01-content-and-url-contract*
*Spec created: 2026-08-26*
*Next step: $gsd-discuss-phase 1 — implementation decisions (how to build what is specified above)*
