# Phase 1: Content and URL Contract - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-26
**Phase:** 01-content-and-url-contract
**Areas discussed:** Static project baseline, content organization, registry and URL derivation, validation and diagnostics, draft preview behavior, restricted MDX, verification commands

---

## Static Project Baseline

| Option | Description | Selected |
|--------|-------------|----------|
| Exact researched baseline | Pin the verified Astro/Node/npm/TypeScript stack, static output, and lockfile. | ✓ |
| Compatible ranges | Allow package resolution to move within semver ranges. | |
| Custom generator | Build the static content pipeline without Astro. | |

**User's choice:** Auto-approved recommendation under the persistent goal objective.
**Notes:** Exact versions make the greenfield baseline reproducible; no dynamic capability justifies a server or client framework.

---

## Content Organization

| Option | Description | Selected |
|--------|-------------|----------|
| One metadata-driven collection | One articles collection; `section` metadata is authoritative. | ✓ |
| Three collections | Separate collection and schema per public section. | |
| Folder-derived taxonomy | Infer section and path from source directories. | |

**User's choice:** Auto-approved recommendation under the persistent goal objective.
**Notes:** One collection avoids parallel pipelines and lets a registry entry extend taxonomy without a rewrite.

---

## Registry and URL Derivation

| Option | Description | Selected |
|--------|-------------|----------|
| Central registry and helper | Stable internal keys, Arabic public facts, and one route derivation function. | ✓ |
| Duplicate frontmatter facts | Repeat author labels and section slugs inside each article. | |
| Automatic title/folder paths | Derive public identity from mutable content organization. | |

**User's choice:** Auto-approved recommendation under the persistent goal objective.
**Notes:** A single source prevents metadata, routes, and later sitemap output from disagreeing.

---

## Validation and Diagnostics

| Option | Description | Selected |
|--------|-------------|----------|
| Schema plus pure validators | Astro handles entry shapes; pure functions handle semantic and collection rules. | ✓ |
| Astro schema only | Limit validation to per-entry schema refinements. | |
| Custom parser | Replace Astro's content boundary with a standalone loader/parser. | |

**User's choice:** Auto-approved recommendation under the persistent goal objective.
**Notes:** Boundary validation makes invalid states hard to represent while keeping non-trivial rules directly testable.

---

## Draft Preview Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Final routes with mode filtering | Development includes drafts intentionally; production uses public-only enumeration. | ✓ |
| Separate preview routes | Create a second permanent route family for drafts. | |
| Raw inspector | Preview frontmatter/body without the actual route contract. | |

**User's choice:** Auto-approved recommendation under the persistent goal objective.
**Notes:** Reusing final paths proves the actual contract and avoids disposable preview behavior.

---

## Restricted MDX

| Option | Description | Selected |
|--------|-------------|----------|
| Component map plus preflight | Central allowlist and source checks reject imports, scripts, iframes, and unknown components. | ✓ |
| Per-article imports | Let every MDX file import arbitrary packages and components. | |
| Markdown only | Remove MDX despite the locked publishing requirement. | |

**User's choice:** Auto-approved recommendation under the persistent goal objective.
**Notes:** The selected surface keeps the explicit MDX capability without turning trusted content into an unrestricted code entry point.

---

## Verification Commands

| Option | Description | Selected |
|--------|-------------|----------|
| Node tests plus Astro checks | Built-in tests for pure rules, then Astro diagnostics and production build. | ✓ |
| Vitest suite | Add a separate test framework and configuration. | |
| Build only | Rely on successful compilation without focused branch checks. | |

**User's choice:** Auto-approved recommendation under the persistent goal objective.
**Notes:** Node's built-in runner covers non-trivial branches with no dependency; the Astro build remains the integration proof.

## the agent's Discretion

- Exact internal file/export names.
- Minimal proof MDX component name and unstyled semantic markup.
- Compact aggregation versus individual emission of actionable validation errors.
- Non-final fixture prose.

## Deferred Ideas

None.
