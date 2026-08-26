# Phase 3: Real Content and Section Discovery - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-26
**Phase:** 03-real-content-and-section-discovery
**Areas discussed:** Shared discovery shell, homepage composition, section index presentation, truthful author context, human approval evidence, proof-content isolation, launch readiness gate, Arabic visual continuity
**Mode:** Auto-selected recommendations under the user's standing approval

---

## Shared Discovery Shell

| Option | Description | Selected |
|--------|-------------|:--------:|
| Site-name home link plus contextual links | One shared header links the site name home; page facts supply section/author navigation. | ✓ |
| Full repeated navigation | Repeat all sections and author links on every page. | |
| No shared navigation | Leave every route without a persistent route home. | |

**Choice:** Site-name home link plus contextual links.
**Notes:** This creates a complete crawlable graph with the least repeated interface and matches the existing minimal reader.

---

## Homepage Composition

| Option | Description | Selected |
|--------|-------------|:--------:|
| Introduction plus three-section list | Accurate project copy plus registry labels, descriptions, and links. | ✓ |
| Add latest articles | Duplicate a subset of section-index discovery on the homepage. | |
| Bare links only | Omit the section summaries needed to explain each destination. | |

**Choice:** Introduction plus three-section list.
**Notes:** The three section indexes are the intended discovery boundary; a latest-content module is unneeded at a three-article launch.

---

## Section Index Presentation

| Option | Description | Selected |
|--------|-------------|:--------:|
| Simple deterministic text list | Linked title, description, and date; newest first with slug tie-break. | ✓ |
| Decorative card grid | Add imagery, card shells, and a new responsive presentation system. | |
| Titles only | Minimize markup but omit the useful summary required by SITE-04. | |

**Choice:** Simple deterministic text list.
**Notes:** A concise Arabic empty state is allowed in development, but launch coverage requires at least one approved article in every section.

---

## Truthful Author Context

| Option | Description | Selected |
|--------|-------------|:--------:|
| Verified fields only | Render the approved registry/profile facts and omit unknown optional claims. | ✓ |
| Agent-written biography | Fill missing biography/expertise from inference. | |
| Coming-soon placeholder | Publish a non-informative author placeholder. | |

**Choice:** Verified fields only.
**Notes:** The route is fixed at `/عن-أحمد-المنجاوي/`. Final biography/expertise remains a required truthful input and cannot be invented.

---

## Human Approval Evidence

| Option | Description | Selected |
|--------|-------------|:--------:|
| Sidecar record plus source digest | Bind editorial and religious approvals to the exact source with SHA-256. | ✓ |
| Frontmatter booleans | Store unchecked approval flags that can remain true after content changes. | |
| Commit-message approval | Infer approval from Git history rather than a validated content record. | |

**Choice:** Sidecar record plus source digest.
**Notes:** Use Node built-ins. Reviewer identity/date/decision stays internal; public badges and names are omitted unless separately approved.

---

## Proof-Content Isolation

| Option | Description | Selected |
|--------|-------------|:--------:|
| Draft/test-only proofs | Keep Markdown/MDX regression routes in development preview only. | ✓ |
| Public but unlinked proofs | Preserve public proof routes while hiding them from indexes. | |
| Delete proof coverage | Remove the proof records and the browser regression evidence they support. | |

**Choice:** Draft/test-only proofs.
**Notes:** Production output must contain neither proof routes nor their example references/video mapping.

---

## Launch Readiness Gate

| Option | Description | Selected |
|--------|-------------|:--------:|
| Separate launch-content check | Keep structural verification runnable and expose the missing truthful inputs as one explicit failing gate. | ✓ |
| Fail every ordinary build | Prevent structural implementation from reaching a clean local verification state. | |
| Manual checklist only | Leave corpus/review coverage outside runnable verification. | |

**Choice:** Separate launch-content check.
**Notes:** Phase 3 remains incomplete until the gate passes; Phase 5–6 production work must consume the gate.

---

## Arabic Visual Continuity

| Option | Description | Selected |
|--------|-------------|:--------:|
| Reuse restrained reader language | Keep existing surfaces, green links/focus, system type, logical spacing, and semantic lists. | ✓ |
| Introduce card system | Add card chrome, imagery, and extra responsive styling. | |
| Redesign whole site | Replace the verified Phase 2 reader visual contract. | |

**Choice:** Reuse restrained reader language.
**Notes:** No images, thumbnails, icons, shadows, gradients, animations, webfonts, or new UI dependency.

---

## the agent's Discretion

- Exact component/helper filenames and the smallest shared-style boundary.
- Exact Arabic microcopy constrained by approved project facts.
- Exact sidecar JSON field names and directory.
- Whether draft-proof and production browser journeys share one Playwright project or use two.

## Deferred Ideas

- Phase 4: metadata, canonical/social identity, sitemap, robots, favicon, and 404.
- Phase 5: production domain, deployment, Search Console, analytics, and outbound measurement.
- Phase 6: production crawl and Core Web Vitals certification.
- Later: search, filters, tags, related content, lesson sequencing, and catalog migration.
