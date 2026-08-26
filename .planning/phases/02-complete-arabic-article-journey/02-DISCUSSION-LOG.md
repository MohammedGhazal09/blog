# Phase 2: Complete Arabic Article Journey - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-26
**Phase:** 02-complete-arabic-article-journey
**Areas discussed:** Article structure and provenance, Arabic readability and accessibility, YouTube activation and fallback, static architecture and phase boundaries
**Resolution mode:** The user pre-approved the recommended defaults; all decisions were resolved in one autonomous pass.

---

## Article Structure and Provenance

### Complete reading sequence

| Option | Description | Selected |
|--------|-------------|----------|
| Structured text-first article | One title, labelled الخلاصة, introduction, ordered headings/body, conclusion, and visible provenance without media dependency. | ✓ |
| Minimal body | Keep title, unlabelled summary, and free-form body with sparse metadata. | |
| Video-led article | Make the player the primary explanation and keep only supporting text. | |

**User's choice:** Approved the recommended structured text-first article.
**Notes:** The article must remain useful without JavaScript, video playback, third-party cookies, or access to YouTube.

### References and optional facts

| Option | Description | Selected |
|--------|-------------|----------|
| Structured conditional facts | Validate optional HTTPS reference entries and render semantic Arabic reference/date UI only when data exists. | ✓ |
| Body-authored citations only | Leave references embedded informally in MD/MDX prose. | |
| Permanent empty sections | Always render update and reference headings, even when no data exists. | |

**User's choice:** Approved structured conditional facts.
**Notes:** Section, registered author, publication date, and optional update date remain truthful and visible; malformed entries fail the build.

---

## Arabic Readability and Accessibility

### Reading system

| Option | Description | Selected |
|--------|-------------|----------|
| Native mobile-first RTL reader | System Arabic-compatible fonts, 1rem+ body, comfortable line height, 65–75ch measure, logical properties, and reflow through 200% zoom. | ✓ |
| Desktop-first editorial treatment | Optimize the desktop composition first and adapt it down later. | |
| Framework design system | Add a UI framework, component library, tokens, and reusable primitives before the article. | |

**User's choice:** Approved the native mobile-first RTL reader.
**Notes:** Representative widths are 320, 390, 768, 1024, and 1440 CSS pixels; no webfont dependency or decorative visual system is wanted.

### Semantics and operation

| Option | Description | Selected |
|--------|-------------|----------|
| Native semantic controls | Use landmarks, ordered headings, links, buttons, time/list elements, visible focus, keyboard access, and 44px standalone targets. | ✓ |
| Custom interactive wrappers | Build interaction from generic elements and reproduce semantics with ARIA and JavaScript. | |
| Visual-only acceptance | Optimize appearance while leaving keyboard and assistive-technology checks for later. | |

**User's choice:** Approved native semantics and full Phase 2 accessibility checks.
**Notes:** Use `<bdi>` or equivalent native isolation for representative URLs, numbers, dates, and identifiers; add ARIA only where native semantics are insufficient.

---

## YouTube Activation and Fallback

### Player loading

| Option | Description | Selected |
|--------|-------------|----------|
| Intent-gated privacy player | Reserve 16:9 space and create one labelled non-autoplaying `youtube-nocookie.com` iframe only after explicit activation. | ✓ |
| Eager privacy iframe | Render the privacy-enhanced iframe on initial load. | |
| Direct link only | Omit the inline player entirely. | |

**User's choice:** Approved the intent-gated privacy-enhanced player.
**Notes:** Initial HTML/network activity must contain no iframe or YouTube request; repeat activation must not create duplicates or trap focus.

### Permanent outbound path

| Option | Description | Selected |
|--------|-------------|----------|
| Same-tab exact-video link | Keep a prominent static Arabic link to `https://www.youtube.com/watch?v={youtubeId}` outside the enhancement. | ✓ |
| New-tab channel link | Send readers to the general channel in a new tab. | |
| Player-only continuation | Remove the direct link after the iframe enhancement is available. | |

**User's choice:** Approved the permanent same-tab exact-video link.
**Notes:** The direct link remains the guaranteed fallback when JavaScript, cookies, iframe loading, or the player host is unavailable.

---

## Static Architecture and Phase Boundaries

### Implementation size

| Option | Description | Selected |
|--------|-------------|----------|
| Extend existing static boundaries | Reuse the Phase 1 collection, registries, route, MDX allowlist, and native platform features; add only required contract/UI/test changes. | ✓ |
| Introduce a reusable UI platform | Add a framework, component library, animation system, icons, and design-system abstractions. | |
| Expand the phase vertically and horizontally | Build the article plus discovery, SEO, deployment, and analytics surfaces now. | |

**User's choice:** Approved the smallest existing-boundary extension.
**Notes:** No new dependency, runtime backend, or speculative abstraction is justified by Phase 2.

### Boundary handling

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve roadmap ownership | Keep discovery in Phase 3, SEO identity in Phase 4, deployment/measurement in Phase 5, and production certification in Phase 6. | ✓ |
| Pull adjacent work into Phase 2 | Implement all public-site and launch surfaces alongside the reader route. | |
| Leave later ownership undefined | Record no explicit boundary and decide during implementation. | |

**User's choice:** Approved the existing roadmap ownership.
**Notes:** The current proof Markdown and MDX routes are sufficient for Phase 2 verification; the real three-article launch corpus remains Phase 3 work.

---

## the agent's Discretion

- Exact component/file boundaries and the smallest deduplicated organization.
- Exact restrained CSS values within the locked Arabic readability, contrast, reflow, and focus constraints.
- Exact clear Arabic microcopy for facts and media actions.
- Exact internal reference field names and UTC-stable Arabic date helper placement.

## Deferred Ideas

- Homepage, section indexes, global navigation, About page, and launch corpus — Phase 3.
- SEO metadata, canonicals, sitemap, robots, and Arabic 404 — Phase 4.
- Hosting, Search Console, analytics, and YouTube activation reporting — Phase 5.
- Production crawl and Core Web Vitals certification — Phase 6.
