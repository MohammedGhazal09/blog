# Phase 5: Deployment and Measurement - Context

**Gathered:** 2026-08-28
**Status:** Ready for UI specification, research, and planning

<domain>
## Phase Boundary

Phase 5 connects the proven static launch build to one documented Cloudflare Pages operating path and one production-only Plausible measurement path. It defines and locally verifies the exact aggregate pageview and direct-YouTube-click contracts, then records real provider, Search Console, and analytics evidence only when owner-controlled services are available. It does not invent a domain, treat test output as a deployment, or perform the production crawl and Core Web Vitals certification owned by Phase 6.

</domain>

<spec_lock>
## Requirements (locked via SPEC.md)

**6 requirements are locked.** See `05-SPEC.md` for full requirements, boundaries, and acceptance criteria.

Downstream agents MUST read `05-SPEC.md` before planning or implementing. Requirements are not duplicated here.

**In scope (from SPEC.md):**

- A Cloudflare Pages static-deployment runbook for the pinned build contract.
- Production-only Plausible aggregate pageview and automatic outbound-link markup.
- Automated local verification of analytics presence, configuration, de-duplication, and ordinary-build absence.
- An exact definition of the outbound YouTube click metric.
- A launch evidence record that keeps local readiness separate from provider, Search Console, and Plausible account proof.
- Real production/Search Console/analytics evidence if the owner-controlled services are available during the phase.

**Out of scope (from SPEC.md):**

- Inventing or purchasing a domain, changing DNS, accepting provider terms, or creating owner accounts — those require owner authority.
- Claiming deployment, TLS, Search Console verification/submission, indexing, analytics configuration, or traffic without direct service evidence — fabricated operational success is forbidden.
- Custom analytics collection, a first-party event endpoint, tag manager, GA4, session replay, fingerprinting, cookies, or user identity — aggregate Plausible measurement is sufficient.
- Iframe play, watch-time, completion, or YouTube API measurement — the required metric is the permanent outbound-link action only.
- Production crawl certification and Core Web Vitals certification — Phase 6 owns those checks after a live origin exists.
- Reader-facing redesign, consent banner, dashboard, or analytics controls — no such interface is required for the selected cookie-free aggregate service.

</spec_lock>

<decisions>
## Implementation Decisions

### Static Deployment Contract

- **D-01:** Use Cloudflare Pages as the v1 production host for the portable Astro `dist/` output. Deploy the `main` branch with the repository-pinned Node `24.19.0`, npm `11.17.0`, `npm ci`, and build command `npm run check && npm run launch:ready`.
- **D-02:** Supply the public canonical `SITE_ORIGIN` explicitly through the provider's build configuration. Keep `dist` as the output directory and add no Astro server adapter, Worker runtime, container, database, or provider SDK.
- **D-03:** Document deployment in the existing Arabic owner `README.md` rather than adding a parallel documentation hierarchy. Include initial deployment, custom-domain/DNS/TLS handoff, failure diagnosis, rollback/redeploy, and post-deploy identity checks without embedding an assumed domain or account value.
- **D-04:** Do not add `wrangler.toml`, a GitHub Actions deploy workflow, preview-environment abstraction, or cache configuration unless official research finds one is required for this exact static Pages path. Provider dashboard configuration is sufficient for v1.

### Production-Only Aggregate Analytics

- **D-05:** Use Plausible Cloud through its maintained direct browser script; add no analytics npm package, wrapper, tag manager, server endpoint, or custom collection system.
- **D-06:** Include analytics only when Astro is building in the explicit `launch-readiness` mode already used by `scripts/launch-ready.mjs`. Development and ordinary deterministic production builds stay analytics-free and retain their zero-unexpected-remote-request contract.
- **D-07:** Render the loader once through `SiteLayout.astro`, the sole shared document-head boundary. Derive its configured public hostname from the already validated `Astro.site`; do not introduce a second domain/origin input or page-level override.
- **D-08:** Use the official current Plausible outbound-link extension identified by Phase 5 research. Preserve `defer`, keep the markup invisible, and do not add reader-facing English, a consent banner, or a visible analytics state.

### Outbound YouTube Metric

- **D-09:** Define the metric as Plausible's automatic outbound-link click event for the permanent static YouTube anchor. The event represents a link action only; documentation and evidence must never call it a video play, view, watch, completion, or iframe interaction.
- **D-10:** Retain the existing same-tab direct anchor, exact generated `youtube.com/watch` destination, Arabic accessible name, and position outside the replaceable player region. Do not add custom click listeners, `onclick`, bespoke data attributes, or calls from the iframe activation button.
- **D-11:** Configure/filter the Plausible property for YouTube-family outbound destinations in the service console using the exact event and property names confirmed by official research. One physical direct-link activation must not be double-counted by project code.

### Search Console and External Evidence

- **D-12:** Register a URL-prefix Search Console property that exactly matches the final validated canonical origin and submit its absolute `/sitemap-index.xml` URL. Prefer owner-controlled DNS verification when available; do not commit an invented verification token or account artifact.
- **D-13:** Treat the final domain, Cloudflare deployment, DNS/TLS, Search Console verification/submission, Plausible property setup, and live events as separate owner-controlled evidence rows. Each remains pending until inspected through the real service or production response.
- **D-14:** Use the controlled Phase 4 hostname only as test data. It cannot close any domain-ownership, deployment, Search Console, indexing, analytics-account, or live-traffic requirement.
- **D-15:** Complete and commit all local source, documentation, test, security, and controlled-launch work before reporting the genuine external authority blocker. If real service access is unavailable, Phase 5 verification must remain truthful and partial rather than marking SEO-06 or live MEAS evidence complete.

### Verification and Safety

- **D-16:** Extend the existing native/build/browser verification stack. Prove one launch-only loader, canonical-host configuration, ordinary-build omission, unchanged Arabic/RTL output, permanent direct-link integrity, and no duplicate project wiring; keep all artifacts under `.artifacts/`.
- **D-17:** Keep vendor behavior and account proof distinct from project wiring. Deterministic tests may prove the markup and browser integration seam, but must not present a mock/stub as proof that Plausible received or reported a real event.
- **D-18:** Scan source and built output for tokens, credentials, verification artifacts, secret loaders, session replay, fingerprinting, cookies, tag managers, and per-reader identifiers. Never read or create `.env` files.
- **D-19:** Preserve every prior phase gate: public/draft separation, canonical/sitemap/robots agreement, text-first Arabic reader behavior, no eager YouTube request, exact static link topology, accessibility, responsive layout, and zero framework/runtime expansion.

### the agent's Discretion

- Exact internal helper names and whether launch-mode detection is kept inline in `SiteLayout.astro` or exposed through one tiny existing-boundary helper, provided there is no second origin source or speculative abstraction.
- Exact deterministic browser seam for proving one project-side outbound attempt, provided it is labelled as wiring evidence and never as real Plausible ingestion/reporting.
- Exact structure of the Phase 5 evidence table and README headings, provided local and external statuses cannot be confused and owner steps remain concise and executable.
- Exact safe fallback if official Plausible script naming has changed since project research, provided the current official no-package automatic outbound-link integration is used and its source is recorded.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Locked Phase Scope

- `.planning/phases/05-deployment-and-measurement/05-SPEC.md` — Locked six requirements, external-evidence boundary, constraints, and eight acceptance gates; MUST be read first.
- `.planning/ROADMAP.md` § Phase 5 — Phase goal, dependency, mapped requirements, and three roadmap success criteria.
- `.planning/REQUIREMENTS.md` — Canonical definitions for `SEO-06`, `MEAS-01`, and `MEAS-02`.
- `.planning/PROJECT.md` — Arabic-only product, static architecture, lightweight delivery constraint, privacy-conscious analytics requirement, and core Google-to-YouTube journey.

### Upstream Search and Reader Contracts

- `.planning/phases/04-search-discovery-integrity/04-CONTEXT.md` — Validated single-origin, launch-mode, metadata, sitemap/robots, artifact, and no-external-claim decisions inherited by Phase 5.
- `.planning/phases/04-search-discovery-integrity/04-SPEC.md` — Upstream canonical/discovery requirements and the explicit handoff of deployment, Search Console, and analytics.
- `.planning/phases/04-search-discovery-integrity/04-VERIFICATION.md` — Verified controlled-launch identity and exact list of production facts that remain unproven.
- `.planning/phases/02-complete-arabic-article-journey/02-CONTEXT.md` — Permanent direct-link, intent-gated iframe, no-JavaScript, accessibility, and no-eager-YouTube contracts measurement must preserve.

### Researched Stack and Owner Workflow

- `.planning/research/STACK.md` — Cloudflare Pages, Plausible Cloud, exact runtime, static output, and no-package analytics recommendations plus cited official sources.
- `.planning/research/ARCHITECTURE.md` — Researched deployment, origin, analytics, and static integration boundaries.
- `AGENTS.md` — GSD workflow, runtime, artifact isolation, UI checks, simplicity, and `.env` prohibition.
- `README.md` — Existing Arabic owner authoring/verification guide that will receive the smallest deployment and measurement extension.
- `.nvmrc` — Pinned Node production runtime.
- `package.json` and `package-lock.json` — Exact npm/runtime contract, static scripts, and dependency graph.

### Source and Test Integration Points

- `scripts/launch-ready.mjs` — Explicit validated production-origin build and `launch-readiness` mode boundary.
- `src/lib/site-origin.ts` — Single accepted production-origin validator; analytics identity must consume its result indirectly through `Astro.site`.
- `astro.config.mjs` — Static output, local origin, sitemap, MDX, and no-adapter configuration.
- `src/layouts/SiteLayout.astro` — Sole shared document-head integration point for one invisible launch-only script.
- `src/components/YouTubePlayer.astro` — Permanent direct anchor and existing iframe activation boundary; measurement must not add another link handler.
- `tests/content-contract.test.ts` — Native build/source contract and controlled launch-output restoration patterns.
- `tests/search-discovery.spec.ts` — Separate transport/site identity, metadata/discovery, network, visible-body, and launch-mode browser patterns.
- `tests/discovery.spec.ts` — Independent route/link/source oracle protecting direct anchors and public membership.
- `playwright.config.ts` — Existing deterministic server lifecycle and ignored artifact paths.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `productionSiteOrigin()` plus `launch-ready.mjs`: Already form one fail-closed public origin and explicit build-mode boundary; deployment and analytics can reuse them without another config surface.
- `SiteLayout.astro`: Already renders every document head exactly once and owns `Astro.site`, making it the smallest place for one launch-only loader.
- `YouTubePlayer.astro`: Already provides a static same-tab direct anchor outside the player region; Plausible automatic outbound tracking can observe it without component changes.
- Native Node and Playwright suites: Already inspect raw source, controlled launch output, local restoration, network requests, DOM/link topology, Arabic UI, and accessibility.

### Established Patterns

- Astro generates portable static HTML with no server adapter or client framework.
- Ordinary builds use a fixed localhost identity; only the explicit launch wrapper accepts a production origin.
- Shared identities are derived once, tested independently, and never repaired at page level.
- All remote media remains intent-gated; browser tests treat unexpected remote requests as failures.
- Operational claims are narrower than controlled test evidence and are recorded truthfully.

### Integration Points

- Add one build-mode-guarded Plausible loader to the existing shared head.
- Extend native and browser checks to compare ordinary and launch output without weakening prior network assertions.
- Extend the Arabic README with the Cloudflare Pages, Search Console, Plausible, rollback, and evidence workflow.
- Record external statuses in Phase 5 verification/UAT artifacts, not in runtime source or a fake deployment fixture.

</code_context>

<specifics>
## Specific Ideas

- Cloudflare Pages settings remain deliberately boring: `main`, Node `24.19.0`, npm `11.17.0`, `npm ci`, `npm run check && npm run launch:ready`, and `dist`.
- The one reportable journey is `Google result → Arabic article pageview → Outbound Link: Click to YouTube`; the final step is not evidence of playback.
- Search Console submits the canonical `/sitemap-index.xml`, not an alternate hand-maintained route list.
- A controlled launch build can prove markup and identity, while live dashboards alone can prove account setup and real event reporting.

</specifics>

<deferred>
## Deferred Ideas

- Production-wide crawl certification, live-link checks, good Core Web Vitals evidence, and production no-shift/no-eager-iframe certification — Phase 6.
- Consent-management UI — add only if a later legal/privacy requirement or analytics-service change makes it necessary.
- Custom analytics, first-party collection, watch-time measurement, multiple environments, a deployment workflow, and provider runtime configuration — excluded until a proven need exceeds the static dashboard path.

</deferred>

---

*Phase: 05-deployment-and-measurement*
*Context gathered: 2026-08-28*
