# Phase 5: Deployment and Measurement - Research

**Researched:** 2026-08-28
**Domain:** Static Cloudflare Pages deployment, Plausible aggregate measurement, and Google Search Console evidence
**Confidence:** HIGH for deterministic deployment/search contracts and the Plausible wiring contract; live provider evidence remains owner-controlled

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

### Static Deployment Contract

- **D-01:** Use Cloudflare Pages as the v1 production host for the portable Astro `dist/` output. Deploy the `main` branch with the repository-pinned Node `24.19.0`, npm `11.17.0`, `npm ci`, and build command `npm run check && npm run launch:ready`.
- **D-02:** Supply the public canonical `SITE_ORIGIN` explicitly through the provider's build configuration. Keep `dist` as the output directory and add no Astro server adapter, Worker runtime, container, database, or provider SDK.
- **D-03:** Document deployment in the existing Arabic owner `README.md` rather than adding a parallel documentation hierarchy. Include initial deployment, custom-domain/DNS/TLS handoff, failure diagnosis, rollback/redeploy, and post-deploy identity checks without embedding an assumed domain or account value.
- **D-04:** Do not add `wrangler.toml`, a GitHub Actions deploy workflow, preview-environment abstraction, or cache configuration unless official research finds one is required for this exact static Pages path. Provider dashboard configuration is sufficient for v1.

### Production-Only Aggregate Analytics

- **D-05:** Use Plausible Cloud through its maintained direct browser script; add no analytics npm package, wrapper, tag manager, server endpoint, or custom collection system.
- **D-06:** Include analytics only when Astro is building in the explicit `launch-readiness` mode already used by `scripts/launch-ready.mjs`. Development and ordinary deterministic production builds stay analytics-free and retain their zero-unexpected-remote-request contract.
- **D-07:** Render the loader once through `SiteLayout.astro`, the sole shared document-head boundary. Accept the current owner-generated public `https://plausible.io/js/pa-….js` asset as explicit build input `PLAUSIBLE_SCRIPT_SRC`; validate its exact HTTPS host/path shape and never commit the real production value. This is not a second canonical origin.
- **D-08:** Use Plausible's current site-specific snippet model identified by Phase 5 research, with **Outbound links** enabled in the Plausible dashboard. Do not use the legacy `script.outbound-links.js` extension. Preserve deferred loading, keep the markup invisible, and add no reader-facing English, consent banner, or visible analytics state.

### Outbound YouTube Metric

- **D-09:** Define the metric as Plausible's automatic outbound-link click event for the permanent static YouTube anchor. The event represents a link action only; documentation and evidence must never call it a video play, view, watch, completion, or iframe interaction.
- **D-10:** Retain the existing same-tab direct anchor, exact generated `youtube.com/watch` destination, Arabic accessible name, and position outside the replaceable player region. Do not add custom click listeners, `onclick`, bespoke data attributes, or calls from the iframe activation button.
- **D-11:** Enable Plausible's **Outbound links** default tracking and filter the exact automatic goal `Outbound Link: Click` by destination property `url` for YouTube-family links. One physical direct-link activation must not be double-counted by project code.

### Search Console and External Evidence

- **D-12:** Register a URL-prefix Search Console property that exactly matches the final validated canonical origin and submit its absolute `/sitemap-index.xml` URL. Prefer owner-controlled DNS verification when available; do not commit an invented verification token or account artifact.
- **D-13:** Treat the final domain, Cloudflare deployment, DNS/TLS, Search Console verification/submission, Plausible property setup, and live events as separate owner-controlled evidence rows. Each remains pending until inspected through the real service or production response.
- **D-14:** Use the controlled Phase 4 hostname only as test data. It cannot close any domain-ownership, deployment, Search Console, indexing, analytics-account, or live-traffic requirement.
- **D-15:** Complete and commit all local source, documentation, test, security, and controlled-launch work before reporting the genuine external authority blocker. If real service access is unavailable, Phase 5 verification must remain truthful and partial rather than marking SEO-06 or live MEAS evidence complete.

### Verification and Safety

- **D-16:** Extend the existing native/build/browser verification stack. Prove one launch-only loader, canonical-host configuration, ordinary-build omission, unchanged Arabic/RTL output, permanent direct-link integrity, and no duplicate project wiring; keep all artifacts under `.artifacts/`.
- **D-17:** Keep vendor behavior and account proof distinct from project wiring. Deterministic tests may prove the markup and browser integration seam, but must not present a mock/stub as proof that Plausible received or reported a real event.
- **D-18:** Scan source and built output for tokens, credentials, verification artifacts, secret loaders, session replay, fingerprinting, cookies, tag managers, and per-reader identifiers. The owner-generated `pa-…` asset key is public but remains provider-supplied and uncommitted; controlled tests use an unmistakable fake fixture. Never read or create `.env` files.
- **D-19:** Preserve every prior phase gate: public/draft separation, canonical/sitemap/robots agreement, text-first Arabic reader behavior, no eager YouTube request, exact static link topology, accessibility, responsive layout, and zero framework/runtime expansion.

### the agent's Discretion

- Exact internal helper names and whether launch-mode detection is kept inline in `SiteLayout.astro` or exposed through one tiny existing-boundary helper, provided there is no second origin source or speculative abstraction.
- Exact deterministic browser seam for proving one project-side outbound attempt, provided it is labelled as wiring evidence and never as real Plausible ingestion/reporting.
- Exact structure of the Phase 5 evidence table and README headings, provided local and external statuses cannot be confused and owner steps remain concise and executable.
- Exact helper/module name for validating `PLAUSIBLE_SCRIPT_SRC`, provided it accepts only the current official `https://plausible.io/js/pa-….js` shape and rejects legacy/generic or alternate-host inputs.

### Deferred Ideas (OUT OF SCOPE)

- Production-wide crawl certification, live-link checks, good Core Web Vitals evidence, and production no-shift/no-eager-iframe certification — Phase 6.
- Consent-management UI — add only if a later legal/privacy requirement or analytics-service change makes it necessary.
- Custom analytics, first-party collection, watch-time measurement, multiple environments, a deployment workflow, and provider runtime configuration — excluded until a proven need exceeds the static dashboard path.
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID                    | Description                                                                                                                               | Research Support                                                                                                                                                                                                                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEO-06                | The production property is verified in Google Search Console and its canonical sitemap is submitted for crawl and index monitoring.       | Use an exact HTTPS URL-prefix property, owner-controlled verification, and the absolute `/sitemap-index.xml`; record submission and latest service status separately from local output. [CITED: https://support.google.com/webmasters/answer/34592] [CITED: https://support.google.com/webmasters/answer/7451001] |
| MEAS-01               | The owner can view privacy-conscious aggregate page traffic without session replay, fingerprinting, or per-reader profiles.               | Use the current Plausible Cloud site-specific snippet only in launch-readiness output; Plausible documents aggregate-only measurement, no cookies or persistent identifiers, and no stored raw IP/User-Agent. [CITED: https://plausible.io/data-policy]                                                           |
| MEAS-02               | The owner can measure one clearly defined outbound YouTube activation per user action, reported as a link click rather than a video view. | Enable Plausible's current **Outbound links** default tracking; the exact automatic goal is `Outbound Link: Click`, and its destination property is `url`. [CITED: https://plausible.io/docs/outbound-link-click-tracking]                                                                                        |
| </phase_requirements> |

## Summary

Phase 5 should be planned as two truthfully separated tracks: deterministic repository readiness and owner-controlled service activation. The repository can fully prove the static Cloudflare build contract, launch-mode gating, unchanged Arabic/RTL body, ordinary-build omission, direct-link integrity, secret-free output, and evidence-table structure. A real domain, production deployment, Plausible property, reported events, Search Console ownership, and sitemap status can pass only from their live services. [VERIFIED: 05-SPEC.md, 05-CONTEXT.md, scripts/launch-ready.mjs, tests/content-contract.test.ts]

Cloudflare Pages needs no Astro adapter for this existing static `dist/` deployment. Its dashboard Git path officially supports `main`, a build command, and `dist`; the Pages build image recognizes `.nvmrc` or `NODE_VERSION` for Node pinning. Because official Pages documentation describes automatic dependency installation but does not promise `npm ci`, the reproducible provider command should explicitly run `npm ci` and set `SKIP_DEPENDENCY_INSTALL=1`, followed by the locked check/launch command. Preview branch builds should be set to **None** for v1 so the production-only analytics build is not run automatically on every non-production branch. [CITED: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/] [CITED: https://developers.cloudflare.com/pages/configuration/build-image/] [CITED: https://developers.cloudflare.com/pages/configuration/branch-build-controls/]

The critical current-vendor finding is that Plausible changed its script in October 2025. New sites receive a unique site-specific snippet, and default outbound tracking is toggled in Plausible settings without changing that snippet. The old generic `script.outbound-links.js` path still responds, but it is the pre-October-2025 integration and must not be selected as the "current" solution. The automatic goal is exactly `Outbound Link: Click`; the outbound URL is exposed as property `url`, which is the property to filter for YouTube-family destinations. [CITED: https://plausible.io/docs/script-update-guide] [CITED: https://plausible.io/docs/outbound-link-click-tracking] [CITED: https://plausible.io/docs/script-extensions]

**Primary recommendation:** implement launch-only wiring now around an explicit, fail-closed `PLAUSIBLE_SCRIPT_SRC` input. Accept only the current owner-generated public `https://plausible.io/js/pa-….js` shape, use a clearly fake valid fixture for deterministic tests, never commit the real production value, and do not substitute the legacy outbound script. The real provider asset and its property identity are required only for deployment and live evidence. [CITED: https://plausible.io/docs/script-update-guide] [VERIFIED: 05-CONTEXT.md D-07/D-18]

## Architectural Responsibility Map

| Capability                                   | Primary Tier             | Secondary Tier           | Rationale                                                                                                                                                                                                                                                         |
| -------------------------------------------- | ------------------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reproducible static build                    | Frontend build / SSG     | CDN / Static             | Astro creates `dist/`; Pages uploads and serves it without a request-time adapter. [VERIFIED: astro.config.mjs, scripts/launch-ready.mjs] [CITED: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/]                                 |
| Canonical launch identity                    | Frontend build / SSG     | CDN / Static             | `productionSiteOrigin()` validates the sole canonical-origin input and `Astro.site` drives page/discovery identity; `PLAUSIBLE_SCRIPT_SRC` controls only a vendor asset URL. [VERIFIED: src/lib/site-origin.ts, src/layouts/SiteLayout.astro, 05-CONTEXT.md D-07] |
| Pageview and outbound observation            | Browser / Client         | Plausible Cloud          | The deferred vendor snippet observes documents and external anchors; project code must not own click behavior. [CITED: https://plausible.io/docs/plausible-script] [CITED: https://plausible.io/docs/outbound-link-click-tracking]                                |
| Aggregate reporting                          | Plausible Cloud          | Browser / Client         | Dashboard state and received events are external service facts, not build artifacts. [CITED: https://plausible.io/docs/outbound-link-click-tracking]                                                                                                              |
| Production delivery and rollback             | CDN / Static             | Cloudflare control plane | Pages deploys static output and rolls production back to an earlier successful production deployment. [CITED: https://developers.cloudflare.com/pages/configuration/rollbacks/]                                                                                   |
| Property verification and sitemap monitoring | Google Search Console    | CDN / Static             | Search Console verifies the exact property and fetches the live sitemap; local XML cannot prove either result. [CITED: https://support.google.com/webmasters/answer/34592] [CITED: https://support.google.com/webmasters/answer/7451001]                          |
| Evidence status                              | Repository documentation | External control planes  | Local and owner-controlled results must remain separate dated rows with distinct evidence sources. [VERIFIED: 05-SPEC.md, 05-CONTEXT.md]                                                                                                                          |

## Project Constraints (from AGENTS.md)

- Keep all reader-facing content and navigation Arabic-only with document-level RTL and correct bidi behavior. [VERIFIED: AGENTS.md]
- Preserve Markdown/MDX publishing, static crawlable output, minimal client code, and one embedded plus one explicit YouTube action per article. [VERIFIED: AGENTS.md]
- Use the GSD workflow before edits; this research is running under the Phase 5 planning workflow. [VERIFIED: init.phase-op 05]
- Never read or create `.env` files. Provider dashboard variables may be documented, but no environment file may be introduced or inspected. [VERIFIED: AGENTS.md, 05-SPEC.md]
- Browser artifacts must remain under ignored `.artifacts/`, never under watched source or planning paths. [VERIFIED: AGENTS.md, playwright.config.ts]
- For UI-related execution, run `npx ui-skills start`; after a UI change, apply the project visual QA workflow. Phase 5 itself has a zero-visible-change UI contract. [VERIFIED: AGENTS.md, 05-UI-SPEC.md]
- Prefer the simplest complete implementation, established libraries, no backward compatibility, and synchronized `.planning/STATE.md` after execution adjustments. [VERIFIED: AGENTS.md]
- No project-local skills were present in `.codex/skills/` or `.agents/skills/` during this research. [VERIFIED: filesystem inspection 2026-08-28]

## Standard Stack

### Core

| Library / Service                             | Version                                       | Purpose                                                       | Why Standard                                                                                                                                                                                                                                                     |
| --------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Astro                                         | 7.2.7 (already installed)                     | Static build and launch-mode rendering                        | Existing framework; `build({ mode })` determines `import.meta.env.MODE`, and static output remains `dist/`. [VERIFIED: package.json] [CITED: https://docs.astro.build/en/reference/programmatic-reference/]                                                      |
| Node.js                                       | 24.19.0                                       | Provider/local build runtime                                  | Already pinned in `.nvmrc`, package engines, and the current workspace. Pages supports pinning Node with `.nvmrc` or `NODE_VERSION`. [VERIFIED: .nvmrc, package.json, runtime probe] [CITED: https://developers.cloudflare.com/pages/configuration/build-image/] |
| npm                                           | 11.17.0                                       | Locked install and scripts                                    | Already pinned by `packageManager`, engines, preinstall guard, and lockfile. [VERIFIED: package.json, runtime probe]                                                                                                                                             |
| Cloudflare Pages                              | Hosted static service                         | Git-triggered build, atomic static delivery, rollback         | Official Astro dashboard path uses `main`, a build command, and `dist`; no server adapter is required for the current static output. [CITED: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/]                                     |
| Plausible Cloud current site-specific snippet | Account-generated, unversioned public snippet | Aggregate pageview and automatic outbound-link tracking       | Since October 2025, each site receives a unique snippet and outbound measurement is toggled in the site's Tracking settings. [CITED: https://plausible.io/docs/script-update-guide] [CITED: https://plausible.io/docs/outbound-link-click-tracking]              |
| Google Search Console                         | Hosted service                                | Exact production property verification and sitemap monitoring | URL-prefix properties include only the specified protocol/host/path prefix; the Sitemaps report records fetch/processing status. [CITED: https://support.google.com/webmasters/answer/34592] [CITED: https://support.google.com/webmasters/answer/7451001]       |

### Supporting

| Library / Service      | Version                    | Purpose                                                        | When to Use                                                                                                                           |
| ---------------------- | -------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `node:test`            | Node 24 built-in           | Raw source/output, lifecycle, runbook, and evidence assertions | Extend existing native tests; no test dependency is needed. [VERIFIED: tests/content-contract.test.ts, package.json]                  |
| Playwright             | 1.62.1 (already installed) | Controlled browser seam and zero-visible-delta proof           | Use only for browser behavior; store any generated artifacts under `.artifacts/`. [VERIFIED: package.json, playwright.config.ts]      |
| `@axe-core/playwright` | 4.13.0 (already installed) | Accessibility regression check                                 | Reuse the existing representative-route checks after launch instrumentation. [VERIFIED: package.json, tests/search-discovery.spec.ts] |

### Alternatives Considered

| Instead of                              | Could Use                                            | Tradeoff                                                                                                                                                                                                                                                        |
| --------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current Plausible site-specific snippet | Legacy `script.outbound-links.js` plus `data-domain` | The legacy path is hostname-configurable but predates the October 2025 script redesign. It would evade the newly discovered constraint instead of using the current official integration. Do not use it. [CITED: https://plausible.io/docs/script-update-guide] |
| Pages dashboard Git build               | Wrangler/direct upload or GitHub Actions             | Adds SDK/workflow/configuration and credential handling without improving this static v1 path. [CITED: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/] [VERIFIED: 05-CONTEXT.md D-04]                                           |
| Search Console UI                       | Search Console API                                   | Adds OAuth/API automation for a one-time owner operation and does not remove the ownership requirement. [CITED: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap]                                                             |

**Installation:** No new npm package is required or permitted for this phase. [VERIFIED: 05-SPEC.md, 05-CONTEXT.md D-05]

**Package Legitimacy Audit:** Not applicable; this phase installs no external package. Existing dependencies remain locked by `package-lock.json`. [VERIFIED: package.json, package-lock.json]

## Current Plausible Contract (Verified 2026-08-28)

1. Plausible introduced a new script in October 2025; each site now has a unique site-specific snippet. [CITED: https://plausible.io/docs/script-update-guide]
2. The owner retrieves the exact snippet from **Site settings → General → Tracking → Site installation → Review**. [CITED: https://plausible.io/docs/plausible-script]
3. **Outbound links** is a Default tracking toggle. It is enabled by default for newly added sites, but the owner must inspect the actual property rather than assume the default. Toggle changes take effect without changing the snippet. [CITED: https://plausible.io/docs/outbound-link-click-tracking]
4. Enabling it creates the exact goal `Outbound Link: Click`; disabling it removes that goal. [CITED: https://plausible.io/docs/outbound-link-click-tracking]
5. The destination is reported under property `url`; the dashboard supports filtering that property with `contains`. [CITED: https://plausible.io/docs/outbound-link-click-tracking]
6. A current generated bundle inspected from Plausible's own production site hardcodes its configured domain, sends events to `https://plausible.io/api/event`, auto-captures `pageview`, and registers outbound click/auxclick handling that sends `Outbound Link: Click` with `props.url = link.href`. This verifies current behavior but is not a stable API contract to copy into project code. [CITED: https://plausible.io/js/pa-6_srOGVV9SLMWJ1ZpUAbG.js]
7. Automatic outbound events count toward billable monthly pageviews. [CITED: https://plausible.io/docs/outbound-link-click-tracking]
8. The current script does not capture on localhost by default; its documented `captureOnLocalhost` option defaults to `false`. Therefore a local mock/stub can prove the integration seam, but only production/service evidence can prove receipt and reporting. [CITED: https://plausible.io/docs/script-extensions]

### Required Metric Definition

```text
Event: Outbound Link: Click
Property: url
Included destinations: direct HTTPS URLs whose hostname is youtube.com,
www.youtube.com, or youtu.be
Meaning: activation of the permanent outbound anchor only
Not meaning: play, view, watch, watch time, completion, or iframe interaction
```

This definition is compatible with the current generated `https://www.youtube.com/watch?v=…` anchors and requires no `YouTubePlayer.astro` change. [VERIFIED: src/components/YouTubePlayer.astro] [CITED: https://plausible.io/docs/outbound-link-click-tracking]

## Architecture Patterns

### System Architecture Diagram

```text
Git push to main
  → Cloudflare Pages Git integration
  → pinned Node 24.19.0 / npm 11.17.0
  → npm ci
  → npm run check
  → SITE_ORIGIN=<owner-controlled final HTTPS origin>
  → PLAUSIBLE_SCRIPT_SRC=<owner-generated public pa-….js URL>
  → npm run launch:ready
      → productionSiteOrigin() validation
      → Astro build mode = launch-readiness
      → static dist/ with canonical/sitemap/robots identity
      → current owner-generated Plausible snippet in each document head
  → Cloudflare static production deployment
      ├─ browser requests complete Arabic HTML
      │    → Plausible site-specific script
      │       ├─ automatic pageview → Plausible Cloud dashboard
      │       └─ direct YouTube anchor activation
      │            → Outbound Link: Click + property url
      └─ Google Search Console
           → exact HTTPS URL-prefix property
           → fetch /sitemap-index.xml
           → external status: Success / error / pending

Decision boundary:
  real site-specific snippet unavailable
    → local implementation and controlled verification use a clearly fake valid fixture
    → deployment and live analytics evidence remain pending
```

The flow keeps build identity, browser observation, and external reporting in separate tiers. [VERIFIED: codebase grep] [CITED: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/] [CITED: https://plausible.io/docs/outbound-link-click-tracking] [CITED: https://support.google.com/webmasters/answer/7451001]

### Recommended Project Structure

```text
scripts/
└── launch-ready.mjs                         # extend existing boundary with Plausible asset validation
src/
├── lib/
│   ├── site-origin.ts                       # reuse unchanged production origin validator
│   └── measurement.ts                       # one fail-closed Plausible asset URL validator
├── layouts/SiteLayout.astro                 # only runtime source integration point
└── components/YouTubePlayer.astro           # leave unchanged
tests/
├── content-contract.test.ts                 # extend launch/ordinary raw-output contract
├── deployment-measurement.test.ts           # one isolated Node+Playwright seam if needed
└── search-discovery.spec.ts                  # preserve ordinary zero-remote/body baselines
README.md                                     # append concise Arabic owner runbook
.planning/phases/05-deployment-and-measurement/
└── 05-LAUNCH-EVIDENCE.md                     # local/external status matrix, no browser artifacts
```

This is the smallest file map that covers runtime wiring, deterministic output, one browser seam, owner operations, and truthful external status. `YouTubePlayer.astro`, `astro.config.mjs`, and the origin helper should not change unless implementation uncovers a violated existing contract. [VERIFIED: codebase inspection, 05-CONTEXT.md D-07/D-10/D-16]

### Pattern 1: Existing Astro Mode as the Only Gate

**What:** Detect launch output with `import.meta.env.MODE === "launch-readiness"` inside the shared layout. Astro documents that programmatic `build({ mode })` determines `import.meta.env.MODE`. [CITED: https://docs.astro.build/en/reference/programmatic-reference/]

**When to use:** Only to include the non-rendering analytics snippet. Do not infer production from `process.env`, `CF_PAGES`, hostname, or `import.meta.env.PROD`, because ordinary builds are also production-mode builds in Vite terms. [VERIFIED: scripts/launch-ready.mjs, package.json] [CITED: https://docs.astro.build/en/guides/environment-variables/]

```astro
---
// Source: https://docs.astro.build/en/reference/programmatic-reference/
const isLaunchReadiness = import.meta.env.MODE === "launch-readiness";
---
```

### Pattern 2: Validated Generated Asset, Not a Reimplementation

**What:** Read the exact current site-specific asset URL from `PLAUSIBLE_SCRIPT_SRC`, validate the official HTTPS host/path shape at build time, and emit it once through the launch-only head boundary with `defer`. Do not reconstruct, minify, proxy, or wrap the vendor asset. [CITED: https://plausible.io/docs/plausible-script] [VERIFIED: 05-CONTEXT.md D-07]

**When to use:** Only in `launch-readiness` mode. Deterministic tests use an unmistakably fake valid asset URL and may replace its response to prove the browser seam; evidence must say "project wiring" rather than "Plausible received the event." The owner checks the real property/bundle identity separately. [VERIFIED: 05-CONTEXT.md D-07/D-17/D-18]

### Pattern 3: Provider Build With Explicit Install Semantics

**What:** Configure production branch `main`, output `dist`, Node `24.19.0`, public `SITE_ORIGIN`, and disable Cloudflare's automatic dependency step with `SKIP_DEPENDENCY_INSTALL=1`; use provider build command `npm ci && npm run check && npm run launch:ready`. This preserves the locked check/launch sequence while making the required `npm ci` explicit in the only Pages command field. [CITED: https://developers.cloudflare.com/pages/configuration/build-image/] [VERIFIED: package.json, 05-CONTEXT.md D-01]

**When to use:** Production Pages builds only. Set preview branch control to **None** for v1; official Pages defaults to building all non-production branches, which would otherwise run production-only measurement on preview deployments. [CITED: https://developers.cloudflare.com/pages/configuration/branch-build-controls/]

### Pattern 4: Evidence Rows Are State, Not Claims in Prose

**What:** Record one row per gate with `Status`, `Evidence source`, `Observed value/date`, and `Authority/next action`. Allowed statuses should be `PASS`, `FAIL`, `PENDING`, or `BLOCKED`; external rows start `PENDING`. [VERIFIED: 05-SPEC.md requirement 6]

**When to use:** Every local run and every owner service inspection. A local fixture may never update a Cloudflare, Plausible, or Search Console row to PASS. [VERIFIED: 05-CONTEXT.md D-13/D-14/D-17]

### Anti-Patterns to Avoid

- **Legacy Plausible extension:** Do not use `script.outbound-links.js` merely because it can derive `data-domain` from `Astro.site`; it is the old script model superseded by the October 2025 site-specific snippet. [CITED: https://plausible.io/docs/script-update-guide]
- **Second canonical origin input:** `PLAUSIBLE_SCRIPT_SRC` is an allowed public asset URL, not canonical identity. Do not derive metadata from it, add a second hostname variable, or expose a page prop; `Astro.site` remains the sole canonical origin authority. [VERIFIED: 05-CONTEXT.md D-07]
- **Custom click tracking:** Do not touch `YouTubePlayer.astro`, add `onclick`, delay navigation, or call `plausible()` from project code. [VERIFIED: 05-CONTEXT.md D-09/D-10]
- **Preview analytics contamination:** Do not leave Pages' default all-branch previews enabled with the launch-only production command. [CITED: https://developers.cloudflare.com/pages/configuration/branch-build-controls/]
- **Ambient provider URL:** Do not use `CF_PAGES_URL` as canonical identity; Pages documents it as the URL of the current deployment, which may be a preview. [CITED: https://developers.cloudflare.com/pages/configuration/build-configuration/]
- **Fixture-as-production evidence:** Never call a controlled host, intercepted request, local script stub, or generated `dist/` a deployed property or reported event. [VERIFIED: 05-SPEC.md, 05-CONTEXT.md D-14/D-17]

## Don't Hand-Roll

| Problem                   | Don't Build                                             | Use Instead                                                          | Why                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static hosting            | Worker, server adapter, container, deploy API client    | Cloudflare Pages Git dashboard + `dist/`                             | Current site is portable static output and official Pages supports Astro `dist/`. [CITED: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/]              |
| Analytics loader          | Wrapper component, npm SDK, proxy, copied vendor bundle | Validated `PLAUSIBLE_SCRIPT_SRC` rendered once in `SiteLayout.astro` | The current snippet is site-specific and dashboard configuration changes its automatic features. [CITED: https://plausible.io/docs/script-update-guide] [VERIFIED: 05-CONTEXT.md D-07] |
| Outbound measurement      | Project listener, custom event queue, navigation delay  | Plausible **Outbound links** Default tracking                        | It automatically produces `Outbound Link: Click` and `url`. [CITED: https://plausible.io/docs/outbound-link-click-tracking]                                                            |
| Search Console submission | OAuth/API automation or committed verification artifact | Owner-operated URL-prefix verification and Sitemaps report           | Ownership remains an external authority fact; the API does not remove it. [CITED: https://support.google.com/webmasters/answer/9008080]                                                |
| Rollback system           | Custom artifact registry or redeploy script             | Pages rollback to a prior successful production deployment           | Rollback is a built-in provider operation. [CITED: https://developers.cloudflare.com/pages/configuration/rollbacks/]                                                                   |
| Evidence capture          | Browser screenshots in `.planning/`                     | Text status matrix plus artifacts under `.artifacts/`                | Project rules isolate browser artifacts and require claims to identify their real source. [VERIFIED: AGENTS.md, 05-SPEC.md]                                                            |

**Key insight:** the difficult parts of this phase are service identity and evidence provenance, not code volume. One head boundary and one provider build path are sufficient; custom infrastructure would make truthful verification harder. [VERIFIED: 05-SPEC.md, codebase inspection]

## Common Pitfalls

### Pitfall 1: Shipping an Outdated Plausible Snippet

**What goes wrong:** The plan uses the historically common `script.outbound-links.js` plus `data-domain`, even though current Plausible sites receive unique snippets. [CITED: https://plausible.io/docs/script-update-guide]

**Why it happens:** Old examples are widespread and the legacy URL still returns JavaScript, so availability is mistaken for the current recommended integration. [VERIFIED: live HTTP probe 2026-08-28]

**How to avoid:** Retrieve the snippet from the actual final property's Site Installation screen and record the official update-guide source. [CITED: https://plausible.io/docs/plausible-script]

**Warning signs:** Any new source containing `script.outbound-links.js`, `data-domain`, or a hand-authored `plausible()` click call. [VERIFIED: 05-CONTEXT.md D-05/D-08/D-10]

### Pitfall 2: Treating the Current `pa-…` Source as Derivable From Hostname

**What goes wrong:** Tests claim the snippet is configured from `Astro.site`, but the unique asset key is generated by Plausible and the bundle embeds the site's domain. [CITED: https://plausible.io/docs/script-update-guide] [VERIFIED: official live Plausible site source inspected 2026-08-28]

**Why it happens:** The legacy integration used a hostname-configured script while the current vendor model uses a provider-generated site-specific asset. [CITED: https://plausible.io/docs/script-update-guide]

**How to avoid:** Accept and validate `PLAUSIBLE_SCRIPT_SRC` explicitly, never invent or commit the real key, use a clearly fake valid fixture locally, and verify the real property/bundle identity only as external evidence. [CITED: https://plausible.io/docs/plausible-script] [VERIFIED: 05-CONTEXT.md D-07/D-18]

**Warning signs:** A committed real `pa-…` value, a locally derived key, an alternate host/path, legacy `script.outbound-links.js`, or a claim that the public asset key is a secret. Controlled tests may use only an unmistakably fake structurally valid fixture. [VERIFIED: 05-CONTEXT.md D-07/D-18]

### Pitfall 3: Believing Cloudflare's Automatic Install Proves `npm ci`

**What goes wrong:** Pages installs dependencies, but the phase claims an `npm ci` deployment without an explicit `npm ci` command. [CITED: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/]

**Why it happens:** Pages has a build command field but no separately documented install-command field in the Git dashboard flow. [CITED: https://developers.cloudflare.com/pages/configuration/build-configuration/]

**How to avoid:** Use `SKIP_DEPENDENCY_INSTALL=1` and start the build command with `npm ci`. [CITED: https://developers.cloudflare.com/pages/configuration/build-image/]

**Warning signs:** Build logs show `npm install` before the project command or do not show `npm ci`. [CITED: https://developers.cloudflare.com/pages/configuration/build-image/]

### Pitfall 4: Running Production Measurement on Preview Branches

**What goes wrong:** Pages defaults to deploying non-production branches; the same launch command would emit production analytics and canonical identity on previews. [CITED: https://developers.cloudflare.com/pages/configuration/branch-build-controls/]

**Why it happens:** The main build setting is reused for both environments while Phase 5 intentionally has only one launch mode. [VERIFIED: 05-CONTEXT.md D-04/D-06]

**How to avoid:** Set Preview branch control to **None** for v1. Add preview-environment design only when explicitly required later. [CITED: https://developers.cloudflare.com/pages/configuration/branch-build-controls/]

**Warning signs:** A `*.pages.dev` branch URL produces a Plausible request or shows final-domain canonical tags without a documented deliberate preview policy. [CITED: https://developers.cloudflare.com/pages/configuration/preview-deployments/]

### Pitfall 5: False-Green Local Analytics

**What goes wrong:** A browser route interception or stub produces one POST and the report claims Plausible received or displayed it. [VERIFIED: 05-CONTEXT.md D-17]

**Why it happens:** The current script does not capture localhost by default, and browser automation adds another suppression surface; a deterministic seam necessarily differs from live service proof. [CITED: https://plausible.io/docs/script-extensions] [VERIFIED: current generated Plausible bundle inspected 2026-08-28]

**How to avoid:** Label the deterministic result "one project integration attempt" and keep live ingestion/dashboard rows pending until inspected on the real property. [VERIFIED: 05-SPEC.md requirement 6]

**Warning signs:** Words such as "received", "reported", "traffic", or "dashboard PASS" supported only by Playwright output. [VERIFIED: 05-SPEC.md]

### Pitfall 6: Misreporting the Event

**What goes wrong:** A direct link click is described as a video view or playback. [VERIFIED: 05-SPEC.md requirement 4]

**Why it happens:** The link and the embedded player point to the same video but are distinct interactions. [VERIFIED: src/components/YouTubePlayer.astro]

**How to avoid:** Use exact event `Outbound Link: Click`, property `url`, and the phrase "direct YouTube link click" in all evidence. [CITED: https://plausible.io/docs/outbound-link-click-tracking]

**Warning signs:** Any Phase 5 artifact containing "watch time", "view", "play", "completion", or an event call from `[data-video-activate]`. [VERIFIED: 05-CONTEXT.md D-09/D-10]

### Pitfall 7: Search Console Submission Equals Indexing

**What goes wrong:** A submitted or successfully fetched sitemap is claimed as proof that its URLs are indexed. [CITED: https://support.google.com/webmasters/answer/7451001]

**Why it happens:** The Sitemaps report exposes `Success`, discovered URLs, and errors, but Google states that sitemap submission is a hint and does not guarantee crawl or indexing. [CITED: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap]

**How to avoid:** Record property verification, submitted URL, submission date, last read, and status exactly; leave indexing and production crawl certification to their own evidence. [CITED: https://support.google.com/webmasters/answer/7451001]

**Warning signs:** `SEO-06 PASS` without a real verified property and exact sitemap row, or language that says all pages are indexed. [VERIFIED: .planning/REQUIREMENTS.md]

## Code Examples

Verified patterns from official sources and the existing codebase:

### Launch-Mode Detection

```astro
---
// Source: https://docs.astro.build/en/reference/programmatic-reference/
const isLaunchReadiness = import.meta.env.MODE === "launch-readiness";
---
```

`scripts/launch-ready.mjs` already passes `mode: "launch-readiness"`; no additional environment flag is needed. [VERIFIED: scripts/launch-ready.mjs]

### Existing Fail-Closed Origin Build

```js
// Source: scripts/launch-ready.mjs
const site = productionSiteOrigin(process.env.SITE_ORIGIN);
await build({ site, mode: "launch-readiness" });
```

Canonical metadata continues to consume `Astro.site`; the independent Plausible asset validator may only control the deferred script `src` and must never become a canonical-origin source. [VERIFIED: 05-CONTEXT.md D-07]

### Pages Provider Settings

```text
Production branch: main
Preview branch control: None
Build output directory: dist
Node version: 24.19.0 (from committed .nvmrc; optionally mirror NODE_VERSION)
Environment values:
  SITE_ORIGIN=<exact owner-controlled final HTTPS origin>
  PLAUSIBLE_SCRIPT_SRC=<exact owner-generated public https://plausible.io/js/pa-….js URL>
  SKIP_DEPENDENCY_INSTALL=1
Build command:
  npm ci && npm run check && npm run launch:ready
```

Cloudflare documents the branch controls, `dist`, Node override mechanisms, and dependency-install opt-out; the exact final origin remains owner-controlled and must not be invented in the repository. [CITED: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/] [CITED: https://developers.cloudflare.com/pages/configuration/build-image/] [CITED: https://developers.cloudflare.com/pages/configuration/branch-build-controls/]

### Deterministic Build Restoration

```ts
// Source: tests/content-contract.test.ts
try {
  // build and inspect launch-readiness output
} finally {
  // remove SITE_ORIGIN from the child environment
  // run the ordinary build and assert the local canonical is restored
}
```

Extend this existing lifecycle rather than leaving `dist/` in launch mode after a test. [VERIFIED: tests/content-contract.test.ts]

## State of the Art

| Old Approach                                                                                                              | Current Approach                                                                           | When Changed                       | Impact                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generic Plausible script-extension filenames such as `script.outbound-links.js` and snippet updates for optional features | Unique snippet per site; enable **Outbound links** in site settings with no snippet update | October 2025                       | Final source requires the actual property-generated public snippet; hostname-only local construction is no longer the current integration. [CITED: https://plausible.io/docs/script-update-guide] |
| Treat enhanced measurements as script filename choices                                                                    | Toggle outbound links, file downloads, and form submissions under Default tracking         | Current docs updated 2026-08-14    | Tests and runbook must verify the account toggle separately from source inclusion. [CITED: https://plausible.io/docs/script-extensions]                                                           |
| Depend on Pages' default build image versions                                                                             | Pin Node through `.nvmrc` or `NODE_VERSION`; v3 receives rolling updates                   | Pages v3 current in 2026           | The committed `.nvmrc` and exact preinstall guard are required to avoid provider drift. [CITED: https://developers.cloudflare.com/pages/configuration/build-image/]                               |
| Custom static deployment adapter                                                                                          | Plain Astro `dist/` through Pages dashboard Git integration                                | Current official Astro Pages guide | Do not add `@astrojs/cloudflare` unless SSR/runtime bindings are actually introduced. [CITED: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/]                     |

**Deprecated/outdated for this phase:**

- Legacy Plausible outbound filename configuration is not the selected current integration. [CITED: https://plausible.io/docs/script-update-guide]
- `CF_PAGES_URL` is not a canonical-origin input because it identifies the current deployment, including previews. [CITED: https://developers.cloudflare.com/pages/configuration/build-configuration/]
- A sitemap `Success` status is not an indexing guarantee. [CITED: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap]

## Assumptions Log

| #   | Claim                                                                                                                        | Section                          | Risk if Wrong                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| A1  | No owner-controlled Cloudflare, Plausible, DNS, or Search Console service session is available to this researcher. [ASSUMED] | Environment / Resolved Questions | External evidence may be obtainable later; all such rows must start pending until actually inspected. |

## Open Questions (RESOLVED)

1. **RESOLVED — May the current public Plausible site-specific asset key appear in browser output?**
   - Yes. `PLAUSIBLE_SCRIPT_SRC` is permitted as validated public installation configuration and appears as the deferred script `src` only in launch-readiness output. Its real owner-generated value is never committed; deterministic tests use an unmistakably fake valid fixture. Credentials, verification tokens, alternate hosts/paths, legacy scripts, APIs, and secret loaders remain forbidden. [VERIFIED: 05-CONTEXT.md D-07/D-18]

2. **RESOLVED — How are unavailable owner-controlled services handled?**
   - The repository completes all local implementation, documentation, controlled launch, security, and test work without those services. The final origin, Cloudflare deployment, Plausible property/snippet/dashboard events, Search Console verification, and sitemap submission remain external dependencies; their evidence rows stay `PENDING` until real owner-controlled proof exists. [VERIFIED: 05-CONTEXT.md D-13/D-15/D-17]

## Environment Availability

| Dependency                       | Required By                                  | Available | Version / State                                                                                                      | Fallback                                                      |
| -------------------------------- | -------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Node.js                          | Local/provider build simulation              | ✓         | v24.19.0 from the pinned workspace runtime. [VERIFIED: runtime probe]                                                | —                                                             |
| npm                              | Locked install and scripts                   | ✓         | 11.17.0. [VERIFIED: runtime probe]                                                                                   | —                                                             |
| Git                              | Cloudflare Git integration / repository work | ✓         | Installed; branch `gsd/v1.0-milestone`. [VERIFIED: runtime probe]                                                    | —                                                             |
| Astro dependencies               | Static build/check                           | ✓         | Installed from committed lockfile; current `npm test` exited 0 on 2026-08-28. [VERIFIED: package.json, runtime test] | `npm ci` on clean provider/local environment                  |
| Cloudflare Pages account/project | Production deployment evidence               | ?         | Owner-controlled; not inspected. [ASSUMED]                                                                           | No truthful deployment fallback; keep pending                 |
| Owned domain/DNS/TLS             | Canonical property                           | ?         | Owner-controlled; not inspected. [ASSUMED]                                                                           | No truthful substitute; controlled hostname is test data only |
| Plausible Cloud property/snippet | MEAS-01/MEAS-02 live proof                   | ?         | Owner-controlled; not inspected. [ASSUMED]                                                                           | Local seam only; live rows remain pending                     |
| Google Search Console property   | SEO-06                                       | ?         | Owner-controlled; not inspected. [ASSUMED]                                                                           | No truthful substitute; row remains pending                   |

**Missing dependencies with no fallback:** final owner-controlled origin, production deployment, current Plausible property/snippet, and Search Console property are required to close their live evidence rows. [VERIFIED: 05-SPEC.md]

**Missing dependencies with fallback:** none for live evidence. Deterministic local tests are useful but are explicitly not substitutes. [VERIFIED: 05-CONTEXT.md D-17]

## Validation Architecture

### Test Framework

| Property           | Value                                                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework          | Node 24 built-in `node:test` for source/output/lifecycle; Astro 7.2.7 diagnostics/build; Playwright 1.62.1 + Axe 4.13 for browser behavior. [VERIFIED: package.json, tests/]                 |
| Config file        | `playwright.config.ts`; Node tests are listed explicitly by the `npm test` script. [VERIFIED: package.json, playwright.config.ts]                                                            |
| Quick run command  | `npm run check` for a head-only edit; targeted new measurement test should be runnable with `node --test --test-reporter=tap tests/deployment-measurement.test.ts`. [VERIFIED: package.json] |
| Full suite command | `npm run verify`, followed by the controlled launch-readiness assertions that restore ordinary output in `finally`. [VERIFIED: package.json, tests/content-contract.test.ts]                 |

### Phase Requirements → Test Map

| Req ID     | Behavior                                                                                                                                                                                | Test Type                                  | Automated Command                                                          | File Exists?                                                                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEO-06     | Runbook/evidence record requires exact final URL-prefix property and absolute sitemap; external row cannot PASS from local fixtures                                                     | Native contract + manual external evidence | `npm test`                                                                 | ❌ Wave 0 extension in `tests/content-contract.test.ts`; live service is manual-only because ownership cannot be automated without credentials. [CITED: https://support.google.com/webmasters/answer/34592] |
| MEAS-01    | Ordinary HTML has zero analytics; controlled launch HTML has exactly one current snippet per document; body/RTL unchanged; source/output contain no prohibited tracking/secret patterns | Native build/output + browser invariance   | `npm test` and `npm run test:browser`                                      | ❌ Wave 0 assertions in `tests/content-contract.test.ts`; existing browser baselines already cover ordinary output. [VERIFIED: current tests]                                                               |
| MEAS-01    | One automatic pageview attempt at the deterministic integration seam; never presented as real Plausible ingestion                                                                       | Isolated browser seam                      | `node --test --test-reporter=tap tests/deployment-measurement.test.ts`     | ❌ Wave 0. [VERIFIED: 05-CONTEXT.md D-17]                                                                                                                                                                   |
| MEAS-02    | Permanent same-tab YouTube anchor remains unchanged/outside player; one direct activation creates at most one automatic outbound attempt; player button creates none                    | Native source + isolated browser seam      | `node --test --test-reporter=tap tests/deployment-measurement.test.ts`     | ❌ Wave 0; direct-anchor topology already exists in browser baselines. [VERIFIED: src/components/YouTubePlayer.astro, tests/search-discovery.spec.ts]                                                       |
| MEAS-01/02 | Real pageview and `Outbound Link: Click` with `url` appear in the actual dashboard/property                                                                                             | Manual external evidence                   | Owner inspects Plausible Site Installation, Tracking toggle, and dashboard | Manual-only by definition; a mock cannot prove receipt/reporting. [CITED: https://plausible.io/docs/outbound-link-click-tracking]                                                                           |

### Exact Deterministic Assertions

The planner should require these falsifiable checks:

1. Inspect every emitted launch HTML document, including `404.html`, for exactly one current Plausible integration and inspect every ordinary HTML document for zero Plausible markup. [VERIFIED: 05-UI-SPEC.md]
2. Assert `import.meta.env.MODE` is the only analytics gate and `scripts/launch-ready.mjs` still passes `mode: "launch-readiness"`. [CITED: https://docs.astro.build/en/reference/programmatic-reference/] [VERIFIED: scripts/launch-ready.mjs]
3. Compare ordinary and launch `<body>` markup/text/landmarks/link topology exactly; the only permitted output difference is the non-rendering head integration and origin-dependent existing metadata/discovery. [VERIFIED: 05-UI-SPEC.md]
4. Assert all existing YouTube CTA href/text/target/class/order values and the complete `YouTubePlayer.astro` source boundary remain free of analytics handlers, attributes, and calls. [VERIFIED: src/components/YouTubePlayer.astro, 05-CONTEXT.md D-10]
5. In an isolated browser seam, intercept the remote site-specific asset and event endpoint, exercise one direct CTA activation, record at most one attempt named `Outbound Link: Click` with property `url`, and prove player activation emits none. Label this test "wiring only." [VERIFIED: 05-CONTEXT.md D-16/D-17]
6. Block the analytics request and verify native link navigation, Arabic content, focus, and player behavior are unchanged. [VERIFIED: 05-UI-SPEC.md]
7. Scan repository source and `dist/` for credential/token patterns, verification tags/files, GA/GTM/session replay/fingerprinting/cookie APIs, custom event calls, and `.env` references without reading any environment file. [VERIFIED: 05-CONTEXT.md D-18]
8. Always restore an ordinary `npm run build` in `finally` and assert local canonical identity plus zero analytics after restoration. [VERIFIED: tests/content-contract.test.ts]
9. External rows pass only after inspecting real service state; local test output cannot mutate them to PASS. [VERIFIED: 05-SPEC.md requirement 6]

### Sampling Rate

- **Per task commit:** `npm run check` plus the most targeted Node test. [VERIFIED: existing package scripts]
- **Per wave merge:** `npm test && npm run check && npm run test:browser`. [VERIFIED: existing package scripts]
- **Phase gate:** `npm run verify`, controlled launch simulation, security scans, zero-visible-delta browser review, then external-evidence inspection. [VERIFIED: 05-SPEC.md, AGENTS.md]

### Wave 0 Gaps

- [ ] Extend `tests/content-contract.test.ts` for per-document launch inclusion, ordinary omission, exact source gate, README contract, evidence status rules, secret/prohibited-tool scans, and guaranteed ordinary-output restoration. [VERIFIED: established test ownership]
- [ ] Add `tests/deployment-measurement.test.ts` only for the isolated current-snippet browser seam; keep it free of screenshots unless needed, and place any artifacts under `.artifacts/`. [VERIFIED: AGENTS.md]
- [ ] Add the new test file to the explicit `npm test` file list in `package.json`. [VERIFIED: package.json]
- [ ] No framework installation is needed. [VERIFIED: package.json]

## Security Domain

### Applicable ASVS Categories

| ASVS Category           | Applies                        | Standard Control                                                                                                                                                                                                                       |
| ----------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V2 Authentication       | No                             | Public static site; provider/search/analytics authentication remains outside repository/browser output. [VERIFIED: 05-SPEC.md]                                                                                                         |
| V3 Session Management   | No project session             | Do not add reader sessions, cookies, localStorage identifiers, or tag manager state. Plausible documents no persistent identifiers. [CITED: https://plausible.io/data-policy]                                                          |
| V4 Access Control       | No runtime application control | Owner control planes enforce service access; repository evidence must not contain credentials. [VERIFIED: 05-SPEC.md]                                                                                                                  |
| V5 Input Validation     | Yes                            | Keep `productionSiteOrigin()` as canonical validation and add one fail-closed URL-shape validator for public `PLAUSIBLE_SCRIPT_SRC`; the asset URL is never canonical identity. [VERIFIED: src/lib/site-origin.ts, 05-CONTEXT.md D-07] |
| V6 Cryptography         | No project cryptography        | Use HTTPS provider/service endpoints and owner DNS verification; never invent token encryption or hashing. [VERIFIED: 05-SPEC.md]                                                                                                      |
| V12 Files and Resources | Yes                            | Serve only static `dist/`; do not add verification files/tokens or environment files to public output. [VERIFIED: 05-CONTEXT.md D-18]                                                                                                  |
| V14 Configuration       | Yes                            | Pin runtime/lockfile, gate analytics by exact build mode, restrict preview builds, and document separate provider values. [VERIFIED: package.json, 05-CONTEXT.md]                                                                      |

### Known Threat Patterns for This Stack

| Pattern                                              | STRIDE                  | Standard Mitigation                                                                                                                                                                                                                    |
| ---------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unsafe canonical origin or analytics asset URL       | Spoofing / Tampering    | Existing HTTPS production-origin validator plus a separate exact Plausible HTTPS host/path validator; only `Astro.site` controls canonical identity. [VERIFIED: src/lib/site-origin.ts, 05-CONTEXT.md D-07]                            |
| Credential or verification token committed/published | Information Disclosure  | DNS-based owner verification when possible; no committed Search Console artifact, analytics credential, provider token, or secret loader. [CITED: https://support.google.com/webmasters/answer/9008080] [VERIFIED: 05-CONTEXT.md D-18] |
| Third-party script supply-chain change               | Tampering               | Load only the exact official `https://plausible.io/js/pa-…js` asset from the owner-generated snippet, only in launch mode; preserve complete static functionality if blocked. [CITED: https://plausible.io/docs/plausible-script]      |
| Duplicate project and vendor tracking                | Repudiation / Integrity | No project click listener or custom event call; source and browser tests enforce one integration seam. [VERIFIED: 05-CONTEXT.md D-10/D-11]                                                                                             |
| Preview traffic contaminates production measurement  | Integrity               | Disable automatic preview branch builds for v1. [CITED: https://developers.cloudflare.com/pages/configuration/branch-build-controls/]                                                                                                  |
| Analytics becomes a navigation dependency            | Denial of Service       | Deferred vendor loading, native anchor, no `preventDefault`, no wait/retry/status UI. [VERIFIED: 05-UI-SPEC.md]                                                                                                                        |
| Local evidence is promoted to production status      | Repudiation             | Four-state evidence matrix with explicit source/authority and external rows defaulting to pending. [VERIFIED: 05-SPEC.md requirement 6]                                                                                                |

## Evidence Record Schema

The phase should create one compact `05-LAUNCH-EVIDENCE.md` table with these minimum rows. This is operational evidence, not browser-test artifact storage. [VERIFIED: 05-SPEC.md requirement 6, AGENTS.md]

| Gate                                         | Initial Status | Passing Evidence                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clean pinned install/check/launch simulation | PENDING        | Dated command results and inspected `dist/` identity; controlled origin explicitly labelled test data. [VERIFIED: 05-SPEC.md]                                                                                                                                                                                                                      |
| Repository/output credential scan            | PENDING        | Dated scan scope and zero prohibited findings; no `.env` file read. [VERIFIED: 05-CONTEXT.md D-18]                                                                                                                                                                                                                                                 |
| Cloudflare production project configuration  | PENDING        | Owner-inspected `main`, exact command, `dist`, Node version, variables, preview control. [CITED: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/] [CITED: https://developers.cloudflare.com/pages/configuration/build-image/] [CITED: https://developers.cloudflare.com/pages/configuration/branch-build-controls/] |
| Production deployment/reachability           | PENDING        | Real deployment identifier/commit and reachable final HTTPS response. [VERIFIED: 05-SPEC.md]                                                                                                                                                                                                                                                       |
| DNS/TLS/custom-domain identity               | PENDING        | Owner/live DNS/TLS plus response identity matching canonical origin. [CITED: https://developers.cloudflare.com/pages/configuration/custom-domains/]                                                                                                                                                                                                |
| Plausible property and current snippet       | PENDING        | Actual property hostname, generated snippet, and bundle/site identity match. [CITED: https://plausible.io/docs/plausible-script]                                                                                                                                                                                                                   |
| Plausible aggregate pageview                 | PENDING        | Real dashboard pageview for production property; never a local interception. [CITED: https://plausible.io/docs/plausible-script]                                                                                                                                                                                                                   |
| Plausible outbound toggle/goal               | PENDING        | Tracking setting enabled and exact `Outbound Link: Click` goal present. [CITED: https://plausible.io/docs/outbound-link-click-tracking]                                                                                                                                                                                                            |
| Real YouTube outbound link event             | PENDING        | Dashboard event filtered by property `url` for the exact production YouTube link; described only as a link click. [CITED: https://plausible.io/docs/outbound-link-click-tracking]                                                                                                                                                                  |
| Search Console URL-prefix property           | PENDING        | Real verified property exactly matching final `https://…/` origin. [CITED: https://support.google.com/webmasters/answer/34592]                                                                                                                                                                                                                     |
| Sitemap submission                           | PENDING        | Exact absolute `/sitemap-index.xml`, submitted date, last read, and current status. [CITED: https://support.google.com/webmasters/answer/7451001]                                                                                                                                                                                                  |

No row may pass from screenshots of localhost, the Phase 4 controlled hostname, test stubs, or source inspection alone. [VERIFIED: 05-CONTEXT.md D-13/D-14/D-17]

## Sources

### Primary (HIGH confidence)

- [Plausible script update guide](https://plausible.io/docs/script-update-guide) — October 2025 redesign, unique snippet per site, current configuration model; last updated 2026-05-26. [CITED: https://plausible.io/docs/script-update-guide]
- [Plausible script installation](https://plausible.io/docs/plausible-script) — current site-specific snippet retrieval path and head installation; last updated 2026-08-14. [CITED: https://plausible.io/docs/plausible-script]
- [Plausible outbound-link tracking](https://plausible.io/docs/outbound-link-click-tracking) — settings toggle, exact goal name, `url` property, reporting/filtering, billing note; last updated 2026-08-14. [CITED: https://plausible.io/docs/outbound-link-click-tracking]
- [Plausible optional measurements](https://plausible.io/docs/script-extensions) — dashboard toggles and current `plausible.init()` option semantics; last updated 2026-08-14. [CITED: https://plausible.io/docs/script-extensions]
- [Plausible data policy](https://plausible.io/data-policy) — aggregate-only data, no cookies/persistent identifiers, raw IP/User-Agent not stored; updated March 2026. [CITED: https://plausible.io/data-policy]
- [Cloudflare Pages Astro guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) — dashboard Git deployment, `main`, build command, `dist`, static/SSR boundary; last updated 2026-04-21. [CITED: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/]
- [Cloudflare Pages build image](https://developers.cloudflare.com/pages/configuration/build-image/) — Node pinning, dependency-install opt-out, v3 behavior; last updated 2026-04-21. [CITED: https://developers.cloudflare.com/pages/configuration/build-image/]
- [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/) — command exit semantics, output directory, environment/system variables; last updated 2026-04-21. [CITED: https://developers.cloudflare.com/pages/configuration/build-configuration/]
- [Cloudflare Pages branch controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/) — preview defaults and **None** option; last updated 2026-04-21. [CITED: https://developers.cloudflare.com/pages/configuration/branch-build-controls/]
- [Cloudflare Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/) — valid production rollback targets and dashboard operation; last updated 2026-04-21. [CITED: https://developers.cloudflare.com/pages/configuration/rollbacks/]
- [Search Console property types](https://support.google.com/webmasters/answer/34592) — exact URL-prefix coverage and protocol/host distinctions. [CITED: https://support.google.com/webmasters/answer/34592]
- [Search Console ownership verification](https://support.google.com/webmasters/answer/9008080) — DNS and other verification methods, token persistence, owner authority. [CITED: https://support.google.com/webmasters/answer/9008080]
- [Search Console Sitemaps report](https://support.google.com/webmasters/answer/7451001) — submission workflow, exact statuses, fetch/processing evidence. [CITED: https://support.google.com/webmasters/answer/7451001]
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) — absolute canonical URLs, sitemap-index support, submission is not an indexing guarantee; last updated 2026-07-08. [CITED: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap]
- [Astro environment variables](https://docs.astro.build/en/guides/environment-variables/) and [programmatic API](https://docs.astro.build/en/reference/programmatic-reference/) — mode behavior and `import.meta.env.MODE`. [CITED: https://docs.astro.build/en/guides/environment-variables/] [CITED: https://docs.astro.build/en/reference/programmatic-reference/]
- Current repository sources/tests listed in the task — established mode, origin, layout, link, and restore patterns. [VERIFIED: codebase inspection 2026-08-28]

### Secondary (MEDIUM confidence)

- [Current Plausible production bundle example](https://plausible.io/js/pa-6_srOGVV9SLMWJ1ZpUAbG.js) — confirms current generated-bundle event/endpoint behavior but is site-specific implementation, not a stable public API contract. [CITED: https://plausible.io/js/pa-6_srOGVV9SLMWJ1ZpUAbG.js]

### Tertiary (LOW confidence)

- None. The two former open questions are formally resolved above; live service state remains pending evidence rather than an architectural ambiguity. [VERIFIED: 05-CONTEXT.md]

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — locked existing stack plus current official Cloudflare, Plausible, Google, and Astro documentation. [CITED: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/] [CITED: https://plausible.io/docs/script-update-guide] [CITED: https://support.google.com/webmasters/answer/34592] [CITED: https://docs.astro.build/en/reference/programmatic-reference/]
- Architecture: HIGH for static deployment, explicit Plausible asset validation, launch-only wiring, and evidence separation; the real provider value and live reporting remain external facts. [CITED: https://plausible.io/docs/script-update-guide] [VERIFIED: 05-CONTEXT.md]
- Pitfalls: HIGH — derived from official vendor changes, official provider defaults, and concrete existing code/test boundaries. [CITED: https://plausible.io/docs/script-update-guide] [CITED: https://developers.cloudflare.com/pages/configuration/branch-build-controls/] [VERIFIED: codebase grep]
- Validation: HIGH for deterministic contracts; external receipt/reporting necessarily remains owner-controlled. [VERIFIED: 05-SPEC.md]

**Research date:** 2026-08-28
**Valid until:** 2026-09-04 for Plausible snippet semantics; 2026-09-27 for Cloudflare/Search Console/static architecture. [ASSUMED]

---

_Phase 05 research for مدونة أحمد المنجاوي_
