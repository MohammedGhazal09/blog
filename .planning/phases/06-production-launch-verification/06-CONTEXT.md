# Phase 6: Production Launch Verification - Context

**Gathered:** 2026-08-28
**Status:** Ready for UI applicability review, research, and planning

<domain>
## Phase Boundary

Phase 6 adds a read-only, opt-in verifier for the exact final public HTTPS origin and records whether the deployed site preserves its crawl/discovery, Arabic/RTL, performance, and intent-gated YouTube contracts. It may fix a repository defect exposed by verification, but it does not deploy the site, create provider state, add reader-facing capabilities, or convert controlled/local evidence into a production pass.

</domain>

<spec_lock>

## Requirements (locked via SPEC.md)

**6 requirements are locked.** See `06-SPEC.md` for full requirements, boundaries, and acceptance criteria.

Downstream agents MUST read `06-SPEC.md` before planning or implementing. Requirements are not duplicated here.

**In scope (from SPEC.md):**

- A reusable, fail-closed production-origin verification command built with Node standard-library APIs and the already-installed Playwright browser tooling.
- Complete production sitemap/robots/public-route/internal-link/canonical/metadata/draft/404 verification.
- Reproducible production LCP and CLS measurements on five representative pages.
- DOM, network, geometry, activation, blocked-iframe fallback, Arabic/RTL, accessibility-name, reflow, and native-zoom evidence.
- A Phase 6 evidence record that preserves local, production, field-data, and owner/provider authority boundaries.
- Phase-scoped fixes only when verification exposes an actual repository defect.

**Out of scope (from SPEC.md):**

- Deploying the site, purchasing/configuring a domain, changing DNS/TLS, or accessing owner accounts — these remain owner-authority operations from Phase 5.
- Treating localhost, a controlled host mapping, preview deployment, mocked response, or intercepted request as proof of final-origin behavior — those inputs may validate the runner only.
- Fabricating INP, CrUX, Search Console, indexing, Plausible, Cloudflare, or real-video availability evidence — these require actual field/provider/production observation.
- A new reader-facing feature, redesign, content expansion, schema/entity markup, CMS, server adapter, analytics listener, or custom tracker — verification is the deliverable and unsupported structured data remains intentionally omitted.
- Adding Lighthouse, `web-vitals`, or another dependency when browser performance APIs and installed Playwright provide the required lab evidence.
- Scoring the intentional 404 route as a Core Web Vitals sample — it participates only in crawl, Arabic, accessibility, and resilience checks.

</spec_lock>

<decisions>
## Implementation Decisions

### Production Command and Safety Boundary

- **D-01:** Expose one opt-in `npm run verify:production` command. Reuse the existing `SITE_ORIGIN` process value and `productionSiteOrigin()` validator; do not add a second origin name, positional parser, config file, or environment-file workflow.
- **D-02:** The production command is read-only and must validate the origin before launching a browser or making a request. It exits nonzero for invalid input or any automated finding and prints a short route/metric/status summary.
- **D-03:** Keep production verification outside `npm test`, `npm run test:browser`, and `npm run verify`. Ordinary local regression must remain deterministic, offline-capable apart from existing controlled behavior, and unable to contact a real production property by accident.
- **D-04:** Add no dependency. Use Node standard-library APIs, the installed Playwright package, and existing Astro/site-origin utilities. Prefer a separate production Playwright surface or equally isolated runner over conditional branches in the ordinary browser suite.

### Crawl and Route Discovery

- **D-05:** Treat the deployed `/sitemap-index.xml` and its child sitemap as the production membership source, then independently cross-check robots, canonical equality, public route shape, internal links, 404 exclusion, and repository-known draft exclusions. Do not maintain a competing hand-authored list of public URLs.
- **D-06:** Crawl every sitemap-listed URL and every same-origin link found on those documents. Require direct successful responses for indexable routes; do not silently follow a redirect and call the original URL healthy.
- **D-07:** Check one canonical per indexable page, exact canonical/page URL equality under the final origin, unique nonempty Arabic titles and descriptions, Arabic `lang`, RTL `dir`, and absence of `noindex` from public pages. Check the intentional missing route separately for a true 404, Arabic recovery UI, `noindex,follow`, and sitemap/canonical exclusion.
- **D-08:** Validate outbound YouTube anchors by URL shape and article video identity without crawling third-party destinations. External availability, playback, account state, and Google indexing are not internal-link results.

### Performance Sampling

- **D-09:** Measure exactly five route roles: homepage, one deterministic section index, and one deterministic article from each discovered section. Discover selections from production routes and record the exact URLs; do not score the 404.
- **D-10:** Use Chromium with one documented mobile-like cold-cache profile: 390×844 CSS pixels, device scale factor 1, four-times CPU throttling, and a Slow-4G-like network profile. Research may align the precise CDP throughput constants to a maintained public convention, but it must record them exactly.
- **D-11:** Run each performance route three times in a fresh context, retain every raw value, and gate the route on the median LCP ≤ 2500 ms and median CLS ≤ 0.1. Do not average away a missing/invalid metric.
- **D-12:** Capture LCP and CLS with browser performance observers installed before navigation. Keep the measured route reader-idle and pre-player-activation. Do not add an in-page telemetry library or send metrics anywhere.
- **D-13:** INP remains field-only for completion claims. CrUX or Search Console may supply it when the final property has qualifying data; a lab click or event duration may be reported only as a separately named diagnostic and cannot pass INP.

### Intent-Gated YouTube Verification

- **D-14:** Inspect every public article route, not only the three performance samples. Before interaction, require no iframe and no request to centrally enumerated YouTube/Google media hosts, while preserving the 16:9 player region's dimensions.
- **D-15:** Exercise pointer and keyboard activation in fresh pages. Each path must create one matching `youtube-nocookie.com` iframe with the article video ID, Arabic title, no autoplay parameter, and no duplicate iframe.
- **D-16:** Abort or block player requests in a dedicated fallback pass and verify the permanent direct YouTube anchor remains visible, keyboard reachable, correctly labelled, and points to the matching video. DOM creation proves wiring; it does not prove that YouTube allowed or played the video.
- **D-17:** Measure player-region geometry before and immediately after iframe creation and attribute only media-region movement to this contract. The reserved region must not collapse, grow, or cause a player-related layout shift.

### Arabic, RTL, Accessibility, and Reflow Audit

- **D-18:** Scan rendered visible text plus document titles, descriptions, image alternatives, element titles, `aria-label` values, and landmark/control accessible names on every public route plus 404. Ignore URLs, source code, scripts, styles, machine identifiers, and hidden framework internals.
- **D-19:** Use a tiny explicit allowlist only for unavoidable approved proper nouns or technical tokens found in actual reader-facing output. Do not create a broad Latin-text regex exemption that can hide an English UI regression.
- **D-20:** Automate 320 CSS-pixel reflow, text-spacing stress, horizontal-overflow detection, landmark/heading sanity, keyboard reachability, and serious/critical Axe checks using existing patterns. Preserve native 200% browser-chrome zoom as a named human evidence row when automation cannot prove the actual zoom state.
- **D-21:** Phase 6 adds no reader-facing UI by default. If verification exposes a real visual/accessibility defect, make the smallest shared-boundary fix and re-run all applicable local and production checks.

### Evidence, Artifacts, and Status

- **D-22:** Store generated JSON, Playwright HTML, traces, screenshots, and other raw evidence only below ignored `.artifacts/phase-06/`. Passing runs need no screenshot unless a check specifically requires visual evidence.
- **D-23:** Maintain one committed `06-PRODUCTION-EVIDENCE.md` ledger with separate rows for controlled runner correctness, final-origin crawl, production LCP/CLS, pre-interaction media behavior, native zoom, field INP, and inherited provider/account facts.
- **D-24:** The runner may populate an ignored machine-readable report, but it must not silently rewrite the committed ledger. A reviewer updates the ledger only from inspected evidence so generated output cannot promote a pending authority gate by itself.
- **D-25:** If the final origin is unavailable, complete local runner tests and all ordinary regressions, then keep final-origin rows, `QUAL-05`, and `QUAL-06` pending/human-needed. Phase 5's four provider/account blockers remain separate and unchanged.

### the agent's Discretion

- Exact production Playwright config/test filenames and whether the command uses a thin Node wrapper, provided there is one origin authority and ordinary verification cannot invoke it.
- Exact XML parsing and report-schema internals, provided malformed/duplicate/out-of-origin entries fail closed and the report remains readable without another package.
- The deterministic section selected for the performance index sample and article ordering within each section, provided the algorithm is derived from the deployed route graph and recorded.
- The controlled transport/interception seam used to prove runner correctness locally, provided its output is unmistakably labelled controlled evidence and cannot satisfy a final-origin row.
- Exact timeout and retry values, provided redirects, unavailable routes, missing metrics, and browser errors fail clearly rather than becoming silent skips.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Locked Phase Scope and Project Contracts

- `.planning/phases/06-production-launch-verification/06-SPEC.md` — Locked six requirements, boundaries, constraints, and acceptance gates; MUST be read first.
- `.planning/ROADMAP.md` § Phase 6 — Production-verification goal, dependency, mapped requirements, and success criteria.
- `.planning/REQUIREMENTS.md` — Canonical definitions and pending state for `QUAL-05` and `QUAL-06`.
- `.planning/PROJECT.md` — Arabic-only product, static architecture, performance/SEO constraints, and core Google-to-YouTube journey.
- `AGENTS.md` — Repository workflow, simplicity, artifact isolation, UI review, runtime, and no-`.env` rules.

### Upstream Launch and Search Boundaries

- `.planning/phases/05-deployment-and-measurement/05-CONTEXT.md` — Final-origin, Cloudflare, Plausible, external-authority, and Phase 6 handoff decisions.
- `.planning/phases/05-deployment-and-measurement/05-VERIFICATION.md` — Verified repository readiness and the four owner-controlled facts that remain unavailable.
- `.planning/phases/05-deployment-and-measurement/05-LAUNCH-EVIDENCE.md` — Current separated local/external evidence ledger pattern.
- `.planning/phases/05-deployment-and-measurement/05-HUMAN-UAT.md` — Exact provider and final-origin human checks that Phase 6 must not fabricate.
- `.planning/phases/04-search-discovery-integrity/04-CONTEXT.md` — Single-origin, route-derived discovery, metadata, 404, and production-certification handoff decisions.
- `.planning/phases/04-search-discovery-integrity/04-VERIFICATION.md` — Controlled search-identity evidence and explicitly unproven production facts.
- `.planning/phases/02-complete-arabic-article-journey/02-CONTEXT.md` — Intent-gated player, permanent direct link, fallback, keyboard, responsive, and manual-zoom decisions.

### Research Basis

- `.planning/research/SUMMARY.md` — Phase 6 production crawl, performance, and launch-observation recommendations.
- `.planning/research/PITFALLS.md` — Production canonical drift, eager YouTube requests, Arabic/RTL leaks, accessibility, and evidence-boundary failure modes.
- `.planning/research/STACK.md` — Pinned runtime, installed Playwright/Astro toolchain, static hosting, and no-Lighthouse-package recommendation.

### Source and Test Integration Points

- `src/lib/site-origin.ts` — Sole public production-origin validator and local-origin constant.
- `scripts/launch-ready.mjs` — Existing explicit launch-mode build boundary.
- `src/components/YouTubePlayer.astro` — Shared 16:9 facade, intent-created no-cookie iframe, error state, and permanent direct anchor.
- `src/config/registries.ts` and `src/lib/content-contract.ts` — Registered sections, validated public article identity, and draft contract.
- `playwright.config.ts` — Ordinary deterministic browser lifecycle and ignored artifact configuration.
- `tests/search-discovery.spec.ts` — Current XML parsing, metadata, crawl, Arabic/RTL, 404, network, and layout patterns.
- `tests/article-journey.spec.ts` — Current player interaction, keyboard, fallback, reflow, accessibility, and media geometry patterns.
- `tests/discovery.spec.ts` — Independent public-route/link/source oracle.
- `tests/content-contract.test.ts` and `tests/deployment-measurement.test.ts` — Build restoration, evidence-separation, controlled-network, and no-fabricated-provider patterns.
- `package.json` and `package-lock.json` — Pinned commands and dependency boundary.
- `.gitignore` — Required `.artifacts/` isolation.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `productionSiteOrigin()`: Already rejects unsafe, local, reserved, credential-bearing, and non-origin values; the production verifier should call it rather than create another validator.
- Existing Playwright and Axe installation: Already supports browser navigation, request observation/blocking, CDP sessions, accessibility scans, artifacts, and responsive checks without another package.
- `YouTubePlayer.astro`: Exposes stable semantic hooks and validated video identity for pre/post-interaction verification.
- Sitemap/robots and shared `SiteLayout.astro`: Already provide one deployed route graph and one metadata renderer for whole-site assertions.
- Phase 5 ledger and browser tests: Provide established evidence-authority wording, controlled interception, and ordinary-build restoration patterns.

### Established Patterns

- Production identity is explicit and fail-closed; ordinary builds stay pinned to a local deterministic origin.
- Browser checks use public semantics, roles, computed styles, network records, and independent source/route oracles rather than screenshots alone.
- Third-party media is forbidden before intent; the permanent static link is the resilient completion path.
- Local/controlled evidence never proves a provider account, final deployment, or real-service receipt.
- All browser artifacts live under `.artifacts/`, and source/planning paths remain clean.

### Integration Points

- Add one opt-in package command and isolated production browser entry point without changing the ordinary Playwright projects.
- Reuse the existing production-origin validator before creating the production browser context.
- Extend native/local controlled coverage only enough to prove the new verifier's parsing, selection, failure, and authority boundaries.
- Add a Phase 6 evidence ledger and a concise Arabic owner command to the existing README if the plan requires an operator path.

</code_context>

<specifics>
## Specific Ideas

- The intended operator flow is an explicit PowerShell process value followed by `npm run verify:production`; it never instructs the owner to create or read a `.env` file.
- The performance report keeps three cold-run values plus the median for every sampled route, so one summary number never hides the raw evidence.
- The pre-interaction request denylist covers YouTube player, thumbnail, and media delivery families; post-interaction requests are observed separately and may be aborted after the matching iframe/request is proven.
- The production verifier is a release audit, not a monitor. Re-running it is manual and deliberate.

</specifics>

<deferred>
## Deferred Ideas

- Scheduled production monitoring, alerts, or CI cron — add only after a stable final origin exists and recurring observation is requested.
- First-party field telemetry or a `web-vitals` reporting pipeline — add only if CrUX/Search Console cannot provide the required operational view and the owner approves the privacy/analytics expansion.
- Entity, Person, Article, FAQ, VideoObject, or other structured data — remain deferred until truthful source fields and a specific requirement exist.
- Automated Cloudflare, Search Console, Plausible, DNS, or account inspection — requires owner credentials/authority and is not part of this read-only repository phase.

</deferred>

---

_Phase: 06-production-launch-verification_
_Context gathered: 2026-08-28_
