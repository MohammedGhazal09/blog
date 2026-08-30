# مدونة أحمد المنجاوي

## What This Is

مدونة أحمد المنجاوي is an Arabic-only, SEO-focused knowledge base that turns Islamic educational material into lightweight, indexable articles for a general Arabic-speaking audience. It organizes content into refutations and misconceptions, general issues, and structured Islamic scholarship, with every article connecting readers to the corresponding YouTube content.

## Core Value

Arabic search users can find a useful, relevant article on Google and continue directly to the matching content on Ahmed El-Mangawy's YouTube channel.

## Requirements

### Validated

- ✓ Store locally previewable articles in validated, Git-tracked Markdown/MDX files without a database or public application backend — Phase 1
- ✓ Give every published article an explicit, stable, clean Arabic URL identity that does not change with its title — Phase 1
- ✓ Let future primary sections reuse the central registry and content contract without an application or article-model rewrite — Phase 1
- ✓ Deliver a complete accessible Arabic RTL article journey that remains readable and actionable without JavaScript or embedded media, with an intent-gated privacy-enhanced player and a permanent direct YouTube action — Phase 2
- ✓ Present the public website entirely in Arabic with correct right-to-left semantics and no English-facing interface — Phase 2
- ✓ Give every article an intent-gated YouTube embed and a prominent permanent direct-video action — Phase 2
- ✓ Keep the visual design simple, responsive, readable, accessible, and lightweight — Phases 2–4
- ✓ Provide the three primary sections, with القسم العلمي defined as structured Islamic scholarship, plus a homepage, section indexes, and reusable article layout — Phase 3
- ✓ Launch with one substantive, source-backed real article and matching YouTube video in every primary section — Phase 3
- ✓ Publish unique Arabic metadata, crawlable discovery links, canonical URLs, sitemap output, and matching robots directives for every public route — Phase 4
- ✓ Provide the repository-controlled Arabic Sveltia editor, GitHub OAuth Worker, editorial pull-request workflow, content/media gate, and fail-closed deployment configuration without adding a database or public runtime backend — Quick Task 260830-lmh

### Active

- [ ] Include privacy-conscious analytics suitable for measuring organic discovery and outbound YouTube engagement.
- [ ] Activate and prove the owner-controlled Cloudflare Access policy, GitHub OAuth app, protected `main` ruleset, and one real draft-only Sveltia pull-request publishing flow.

### Out of Scope

- English or multilingual pages — the website is intentionally Arabic-only.
- A database-backed CMS, custom credential system, or multi-user administration — the isolated Sveltia editor writes Git-tracked Markdown through OAuth and pull requests.
- Public reader accounts, comments, or community features — the single-owner editorial login is isolated from the public site.
- Unattended transcript import or bulk article generation — v1 uses three deliberately drafted, source-backed articles and no catalog-scale automation.
- Migrating the owner's complete YouTube catalog before launch — v1 requires representative real content, not a full archive.
- Natural-science educational content — القسم العلمي refers to Islamic scholarly and educational material.

## Context

- The project is greenfield and begins in an empty repository.
- The primary acquisition channel is Google organic search.
- The intended reader is a general Arabic-speaking search user, so articles should be approachable and assume little prior specialist knowledge.
- The intended journey is: Google result → useful Arabic article → embedded video and clear direct YouTube action.
- The three initial content areas are:
  - **الردود والشبهات:** Responses to intellectual or religious misconceptions.
  - **القضايا العامة:** Commentary and public-interest topics.
  - **القسم العلمي:** Structured Islamic lessons and scholarly material.
- The first release proves the publishing and discovery model with at least one real article per section rather than delaying launch for a complete back-catalog migration.

## Constraints

- **Language:** All reader-facing content and navigation must be Arabic — there is no English version.
- **Directionality:** The document and interface must use RTL semantics while preserving correct bidirectional rendering for URLs, numbers, and embedded media.
- **Publishing:** Canonical content remains in Markdown/MDX files. An isolated Sveltia admin may edit those files through GitHub OAuth and pull requests; there is no database, custom password store, or public application backend.
- **Performance:** The site must remain minimal and lightweight despite YouTube embeds — unnecessary visual effects and client-side code are excluded.
- **SEO:** Public content must be server-rendered or statically generated, crawlable without JavaScript, and equipped with correct metadata and discovery files.
- **Media:** Each article must include both an embedded YouTube player and an explicit outbound YouTube action.
- **Architecture:** Future sections should fit the same content model without requiring a rewrite, while speculative features must not be built in v1.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Name the site مدونة أحمد المنجاوي | User-provided public identity | — Pending |
| Store canonical content in Git-tracked Markdown/MDX | Preserves static builds, reviewable history, and the existing content contract whether files are edited locally or through Sveltia | ✓ Good |
| Isolate Sveltia behind Cloudflare Access and GitHub OAuth with editorial pull requests | Gives the non-technical owner a browser editor without adding a database, public runtime backend, custom passwords, or direct-to-main publishing | ✓ Repository controls verified; provider activation pending |
| Include an embedded player and a direct YouTube button on every article | Supports onsite viewing while preserving a clear path to the channel | ✓ Good |
| Define القسم العلمي as Islamic scholarship and structured religious lessons | Removes ambiguity with natural-science content | — Pending |
| Write for the general Arabic-speaking public | Aligns content with broad search intent and minimal assumed knowledge | — Pending |
| Launch production-ready with one real article per primary section | Validates the structure and publishing flow without blocking on full catalog migration | — Pending |
| Use explicit, title-independent Arabic section and article slugs | Keeps public identities stable and makes collisions and unsafe Unicode fail at the shared boundary | ✓ Good |
| Reuse final article routes for development draft preview while production exposes only public records | Avoids a second preview route or visibility option that could leak drafts | ✓ Good |
| Restrict MDX before compilation through one approved component allowlist and render map | Preserves useful authoring without opening arbitrary executable or iframe surface | ✓ Good |
| Keep the permanent same-tab YouTube action outside the replaceable player region | Preserves the complete article-to-video journey when JavaScript, cookies, iframe construction, or the embed host fails | ✓ Good |
| Validate structured references once at the shared content boundary | Keeps public provenance descriptive, Arabic-facing, absolute-HTTPS, credential-free, and fail-closed without route-side repair | ✓ Good |
| Create the YouTube iframe only after explicit reader intent from a validated ID | Avoids eager third-party requests and autoplay while keeping the host hardcoded to the privacy-enhanced origin | ✓ Good |
| Keep visible focus on the local player boundary while focus is inside the cross-origin iframe | Preserves a clear keyboard focus indicator without a custom focus trap or extra ARIA layer | ✓ Good |
| Allow AI-assisted launch drafts from verified video metadata and cited sources at the owner's explicit request | Unblocks representative content without inventing transcripts, reviewer identities, or approval evidence; each public article discloses the assistance | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-30 during secure Sveltia CMS integration*
