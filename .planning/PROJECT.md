# مدونة أحمد المنجاوي

## What This Is

مدونة أحمد المنجاوي is an Arabic-only, SEO-focused knowledge base that turns Islamic educational material into lightweight, indexable articles for a general Arabic-speaking audience. It organizes content into refutations and misconceptions, general issues, and structured Islamic scholarship, with every article connecting readers to the corresponding YouTube content.

## Core Value

Arabic search users can find a useful, relevant article on Google and continue directly to the matching content on Ahmed El-Mangawy's YouTube channel.

## Requirements

### Validated

- ✓ Let the owner create and edit locally previewable Markdown/MDX articles without a CMS, authentication system, or database — Phase 1
- ✓ Give every published article an explicit, stable, clean Arabic URL identity that does not change with its title — Phase 1
- ✓ Let future primary sections reuse the central registry and content contract without an application or article-model rewrite — Phase 1

### Active

- [ ] Present the entire public website in Arabic with a correct right-to-left reading experience and no English-facing interface.
- [ ] Provide three primary sections: الردود والشبهات, القضايا العامة, and القسم العلمي.
- [ ] Use القسم العلمي for structured Islamic scholarship and religious lessons, not natural-science content.
- [ ] Give every article a corresponding YouTube embed and a prominent direct link to the video or channel.
- [ ] Provide page-specific SEO metadata and crawlable discovery links so public pages can be indexed correctly by Google.
- [ ] Ship a production-ready homepage, section indexes, and reusable article page layout.
- [ ] Keep the visual design extremely simple, responsive, readable, and lightweight.
- [ ] Include search-engine discovery foundations such as canonical URLs, sitemap output, and robots directives.
- [ ] Include privacy-conscious analytics suitable for measuring organic discovery and outbound YouTube engagement.
- [ ] Launch with at least one real article in each of the three primary sections.

### Out of Scope

- English or multilingual pages — the website is intentionally Arabic-only.
- A browser-based CMS or administration dashboard — Markdown/MDX is the v1 publishing workflow.
- User accounts, authentication, comments, or community features — they do not support the initial SEO-to-YouTube objective.
- Automatic article generation or transcript import from YouTube — v1 content is authored and reviewed manually.
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
- **Publishing:** Content lives in Markdown/MDX files — the initial release has no CMS, database, or editorial login.
- **Performance:** The site must remain minimal and lightweight despite YouTube embeds — unnecessary visual effects and client-side code are excluded.
- **SEO:** Public content must be server-rendered or statically generated, crawlable without JavaScript, and equipped with correct metadata and discovery files.
- **Media:** Each article must include both an embedded YouTube player and an explicit outbound YouTube action.
- **Architecture:** Future sections should fit the same content model without requiring a rewrite, while speculative features must not be built in v1.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Name the site مدونة أحمد المنجاوي | User-provided public identity | — Pending |
| Publish through Markdown/MDX | Simplest lightweight workflow; avoids CMS, authentication, and database scope | — Pending |
| Include an embedded player and a direct YouTube button on every article | Supports onsite viewing while preserving a clear path to the channel | — Pending |
| Define القسم العلمي as Islamic scholarship and structured religious lessons | Removes ambiguity with natural-science content | — Pending |
| Write for the general Arabic-speaking public | Aligns content with broad search intent and minimal assumed knowledge | — Pending |
| Launch production-ready with one real article per primary section | Validates the structure and publishing flow without blocking on full catalog migration | — Pending |
| Use explicit, title-independent Arabic section and article slugs | Keeps public identities stable and makes collisions and unsafe Unicode fail at the shared boundary | ✓ Good |
| Reuse final article routes for development draft preview while production exposes only public records | Avoids a second preview route or visibility option that could leak drafts | ✓ Good |
| Restrict MDX before compilation through one approved component allowlist and render map | Preserves useful authoring without opening arbitrary executable or iframe surface | ✓ Good |

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
*Last updated: 2026-08-26 after Phase 1*
