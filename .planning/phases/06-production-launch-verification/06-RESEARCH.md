# Phase 6: Production Launch Verification - Research

**Researched:** 2026-08-28
**Domain:** Read-only production-origin crawling, controlled mobile lab performance, Arabic/RTL accessibility, and authority-bounded launch evidence
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

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

### Deferred Ideas (OUT OF SCOPE)

- Scheduled production monitoring, alerts, or CI cron — add only after a stable final origin exists and recurring observation is requested.
- First-party field telemetry or a `web-vitals` reporting pipeline — add only if CrUX/Search Console cannot provide the required operational view and the owner approves the privacy/analytics expansion.
- Entity, Person, Article, FAQ, VideoObject, or other structured data — remain deferred until truthful source fields and a specific requirement exist.
- Automated Cloudflare, Search Console, Plausible, DNS, or account inspection — requires owner credentials/authority and is not part of this read-only repository phase.
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID                    | Description                                                                                                                                                                                             | Research Support                                                                                                                                                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QUAL-05               | Representative production pages preserve good Core Web Vitals behavior and do not load or shift the real YouTube iframe before reader activation.                                                       | The prescribed runner uses five route roles, three fresh-context cold runs per route, exact CDP throttling, pre-navigation LCP/CLS observers, median gates, and every-article pre/post-intent media checks. [VERIFIED: `.planning/REQUIREMENTS.md`, `06-SPEC.md`]                                  |
| QUAL-06               | A production crawl confirms successful public routes, matching canonicals, unique Arabic metadata, working internal links, correct sitemap/robots output, and no accidental English reader-facing text. | The prescribed crawl uses the deployed sitemap as membership, manual redirects, static HTML/XML parsing, same-origin link closure, draft exclusion, true-404 checks, rendered Arabic/AX-tree scans, and a final-origin-only evidence status. [VERIFIED: `.planning/REQUIREMENTS.md`, `06-SPEC.md`] |
| </phase_requirements> |

## Summary

Build one importable Node `.mjs` module that is also the `npm run verify:production` CLI. Validate `process.env.SITE_ORIGIN` synchronously before filesystem artifact creation, browser launch, or network access; then use Node's native `fetch` with `redirect: "manual"` for the crawl and the already-installed Chromium/Playwright/Axe stack for rendered, performance, accessibility, and media checks. Keep the production command outside every ordinary verification command. [VERIFIED: `06-CONTEXT.md` D-01–D-04; `package.json`; `scripts/launch-ready.mjs`]

Use the browser's native `DOMParser` from an inert `about:blank` page to parse fetched XML and HTML into structured values. This reuses the proven project pattern while avoiding both a new XML/HTML dependency and brittle regex parsing. Discover public membership only from `/sitemap-index.xml` and child sitemaps; classify articles from their rendered `data-video-region`, derive section/article relationships from the deployed route graph, and select the five performance roles deterministically. [VERIFIED: `tests/search-discovery.spec.ts`; `tests/discovery.spec.ts`; `YouTubePlayer.astro`]

Treat evidence scope as data, not prose. A controlled intercepted run proves the runner, a reachable exact final origin can prove the production crawl/lab/media rows, native 200% browser zoom remains human evidence, field INP remains field-only, and Cloudflare/Search Console/Plausible facts remain inherited owner/provider rows. Generated JSON belongs only under `.artifacts/phase-06/`; the committed ledger is reviewer-maintained and never rewritten by the runner. [VERIFIED: `06-CONTEXT.md` D-22–D-25; `05-VERIFICATION.md`; `05-LAUNCH-EVIDENCE.md`]

**Primary recommendation:** Implement `scripts/verify-production.mjs` as the single production runner and import it from one serialized Node test using an internally labelled controlled fixture seam; add no production Playwright config and no package. [VERIFIED: codebase + locked phase decisions]

## Architectural Responsibility Map

| Capability                                        | Primary Tier                 | Secondary Tier             | Rationale                                                                                                                                                                                                            |
| ------------------------------------------------- | ---------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Origin validation and command gating              | Build/CLI tooling            | Network boundary           | The opt-in Node process owns whether any request/browser can begin; the shared origin validator stays the sole authority. [VERIFIED: `scripts/launch-ready.mjs`; `src/lib/site-origin.ts`]                           |
| Sitemap, robots, route, canonical, and link crawl | Build/CLI tooling            | Deployed CDN/static origin | The runner observes public HTTP output; it does not alter Astro routes or provider state. [VERIFIED: `06-SPEC.md`]                                                                                                   |
| LCP/CLS lab measurement                           | Browser automation           | Deployed CDN/static origin | Chromium supplies navigation timing and layout-shift entries while the production origin supplies the measured documents/resources. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/LargestContentfulPaint] |
| Intent-gated YouTube audit                        | Browser automation           | Third-party media boundary | Playwright observes DOM, geometry, requests, and activation; YouTube playback/account availability remains outside the repository's authority. [VERIFIED: `YouTubePlayer.astro`; `06-CONTEXT.md` D-14–D-17]          |
| Arabic/RTL/a11y/reflow audit                      | Browser automation           | Static HTML/CSS            | Rendered semantics, accessibility tree, keyboard focus, and layout are browser-owned observations of static output. [VERIFIED: existing Playwright suites]                                                           |
| Evidence promotion                                | Human review / planning docs | Generated artifacts        | The runner writes raw ignored facts; only a reviewer can update committed PASS/FAIL/PENDING rows. [VERIFIED: `06-CONTEXT.md` D-23–D-25]                                                                              |

## Project Constraints (from AGENTS.md)

- Keep all reader-facing content/navigation Arabic and the root document semantically RTL, with correct bidi handling. [VERIFIED: `AGENTS.md`]
- Preserve Markdown/MDX publishing, fully static crawlable output, minimal client code, and both embedded and direct YouTube paths. [VERIFIED: `AGENTS.md`]
- Do not read or create `.env` files; `SITE_ORIGIN` is an explicit process value only. [VERIFIED: `AGENTS.md`; `06-CONTEXT.md` D-01]
- Do not preserve backward compatibility; choose the simplest complete solution and established existing libraries before custom code. [VERIFIED: user-provided AGENTS instructions]
- Keep every browser artifact below ignored `.artifacts/`; do not write generated evidence into source or planning paths. [VERIFIED: user-provided AGENTS instructions; `.gitignore`]
- Phase 6 has no new reader-facing surface, so no design implementation is planned; if a real defect is found, fix the smallest shared boundary and run logic plus visual verification. [VERIFIED: `.planning/STATE.md`; `06-CONTEXT.md` D-21]
- This research file is created inside the active GSD phase workflow; execution must use the appropriate GSD phase command rather than direct ad-hoc edits. [VERIFIED: `AGENTS.md`]

## Resolved Research Questions

| Question                    | Resolution                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production runner structure | One importable/CLI `scripts/verify-production.mjs`; no second Playwright config. The ordinary suites import neither the real-origin CLI entry nor `SITE_ORIGIN`. [VERIFIED: locked decisions]                                                                                                                                                                                                                                           |
| Sitemap and HTML parsing    | Fetch with Node `fetch(..., {redirect:"manual"})`, enforce size/content/status/origin, then parse in inert Chromium with `DOMParser`; use DOM extraction, not regex parsing. [VERIFIED: existing XML parser pattern; Node 24 constraint]                                                                                                                                                                                                |
| `SITE_ORIGIN` reuse         | Keep `productionSiteOrigin(process.env.SITE_ORIGIN)`, but strengthen the shared validator to require `url.port === ""` and the raw value to equal `url.origin`, thereby accepting only the exact canonical lowercase origin string and rejecting every explicit port/normalization variant required by Phase 6. [VERIFIED: current validator/test mismatch with `06-SPEC.md`]                                                           |
| Controlled runner proof     | Import the runner from a serialized Node test and supply an internal fixture transport. The runner derives `evidenceScope: "controlled"` whenever fixture transport exists and can never mark QUAL-05/06 production-pass from that mode. [VERIFIED: `06-CONTEXT.md` D-24–D-25]                                                                                                                                                          |
| Mobile-like profile         | 390×844, DSF 1, touch/mobile emulation, 4× CPU, Chrome DevTools Slow 4G applied constants: 562.5 ms latency, 180,000 B/s download, 84,375 B/s upload, `cellular4g`. Record target and applied values. [CITED: https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/core/sdk/NetworkManager.ts]                                                                                                                       |
| LCP/CLS capture             | Install observers with `BrowserContext.addInitScript()` before navigation; latest LCP candidate by `startTime`; CLS is the maximum session-window sum excluding `hadRecentInput`, with <1 s gaps and ≤5 s windows. [CITED: https://playwright.dev/docs/api/class-browsercontext#browser-context-add-init-script] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/LargestContentfulPaint] [CITED: https://web.dev/articles/cls] |
| Arabic/accessibility audit  | Scan every public route plus 404: visible text, metadata, alt/title/ARIA attributes, and CDP AX-tree names. The current rendered launch corpus produced zero Latin-letter reader-facing/AX strings, so begin with an empty allowlist. [VERIFIED: 2026-08-28 controlled local crawl of all eight public routes plus 404]                                                                                                                 |
| Final authority boundary    | A reachable exact origin can qualify the Phase 6 production rows after reviewer inspection; field INP, native browser zoom, Search Console, Plausible, Cloudflare, DNS, TLS, and final-owner selection remain separately named evidence. [VERIFIED: `05-VERIFICATION.md`; `06-SPEC.md`]                                                                                                                                                 |
| Timeouts and retries        | Use a 20-second abort for each static fetch, 30-second rendered-audit navigation timeout, 45-second performance navigation timeout, and the fixed five-second post-load metric window. Perform no automatic retry: the three performance iterations are samples, not retries, and any missing iteration fails the route. [RECOMMENDED: deterministic fail-closed policy under D-02/D-11]                                                |

## Standard Stack

### Core

| Tool               | Version                         | Purpose                                                                                                      | Why Standard Here                                                                                                                                                                                             |
| ------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js            | 24.19.0                         | CLI, URL validation, explicit manual-redirect fetches, filesystem JSON output, test runner                   | Project-pinned runtime and sufficient standard APIs; no runner framework is needed. [VERIFIED: `package.json`]                                                                                                |
| `@playwright/test` | 1.62.1, published 2026-07-30    | Bundled Chromium, isolated contexts, request observation/blocking, DOM/keyboard/geometry checks, CDP session | Already installed and already owns browser verification in this repository. [VERIFIED: npm registry + `package.json`]                                                                                         |
| Bundled Chromium   | 151.0.7922.34 in this workspace | Production rendering and CDP throttling/performance/accessibility tree                                       | CDP sessions are Chromium-only in Playwright, and the phase explicitly locks Chromium. [CITED: https://playwright.dev/docs/api/class-browsercontext#browser-context-new-cdp-session] [VERIFIED: local launch] |

### Supporting

| Tool                   | Version                      | Purpose                                                        | When to Use                                                                                                                                                                      |
| ---------------------- | ---------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@axe-core/playwright` | 4.13.0, published 2026-08-11 | Serious/critical WCAG A/AA automated findings                  | Run on every public route plus 404 after the manual semantic assertions; it supplements rather than replaces keyboard/RTL/zoom checks. [VERIFIED: npm registry + existing tests] |
| Astro static output    | 7.2.7, published 2026-08-25  | Existing deployed documents, sitemap, robots, and 404 contract | Observe only; Phase 6 must not add a server adapter or runtime route. [VERIFIED: npm registry + `package.json`]                                                                  |
| Browser `DOMParser`    | Chromium platform API        | Parse XML and static HTML in an inert page                     | Reuse the exact parser approach already passing for sitemap XML. [VERIFIED: `tests/search-discovery.spec.ts`]                                                                    |

**Installation:** None. This phase must not change `dependencies`, `devDependencies`, or `package-lock.json`. [VERIFIED: `06-CONTEXT.md` D-04]

### Alternatives Considered

| Instead of                        | Could Use                                  | Tradeoff / Disposition                                                                                                                             |
| --------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Importable standalone Node runner | Separate production Playwright config/spec | Adds a second lifecycle/config and makes accidental inclusion in ordinary browser runs easier; reject for this opt-in audit. [VERIFIED: D-03/D-04] |
| Browser `DOMParser`               | New XML/HTML parser package                | A package would duplicate an existing passing parser pattern and violate the no-dependency decision; reject. [VERIFIED: D-04 + existing tests]     |
| Raw observer lab capture          | Lighthouse or `web-vitals` dependency      | Adds tooling/telemetry outside the locked scope and still cannot turn lab data into field INP; reject. [VERIFIED: `06-SPEC.md`; D-12/D-13]         |

## Package Legitimacy Audit

Not applicable: Phase 6 installs no external package. The existing Playwright, Axe, and Astro versions were confirmed in `package.json`, the local install, their official documentation, and the npm registry; no slopcheck/install gate is needed because there is no install action. [VERIFIED: codebase + npm registry]

## Architecture Patterns

### System Architecture Diagram

```text
explicit SITE_ORIGIN process value
        |
        v
productionSiteOrigin() -- invalid --> exit nonzero before I/O
        |
        v
manual-redirect fetch crawl
  robots.txt -> sitemap-index.xml -> child sitemap(s) -> public HTML
        |                                  |
        |                                  +-> same-origin link closure
        v
inert Chromium DOMParser -> route graph + metadata + article identities
        |
        +---------------------------+
        |                           |
        v                           v
5-role cold lab               every-route browser audit
3 fresh contexts/route        Arabic/RTL/AX/Axe/reflow/404
CDP network + CPU             every-article media intent/fallback
LCP + CLS observers                  |
        |                            |
        +-------------+--------------+
                      v
 .artifacts/phase-06/{controlled|production}/{UTC-run-id}/report.json
                      |
                      v reviewer inspection only
   06-PRODUCTION-EVIDENCE.md (controlled / final / field / provider rows)
```

[VERIFIED: locked architecture decisions and existing browser/crawl patterns]

### Recommended Project Structure

```text
scripts/
└── verify-production.mjs                 # importable core + CLI main
tests/
├── production-verification.test.ts       # controlled fixture/error matrix
└── site-origin.test.ts                    # strengthened exact-origin matrix
.artifacts/phase-06/                       # ignored generated JSON/failures only
.planning/phases/06-production-launch-verification/
└── 06-PRODUCTION-EVIDENCE.md              # reviewer-maintained committed ledger
```

Do not create `playwright.production.config.ts`, a report package, a schema folder, a monitoring job, or a second origin helper. [VERIFIED: locked decisions + simplest complete design]

### Pattern 1: Fail Before I/O

The CLI must call `productionSiteOrigin(process.env.SITE_ORIGIN)` before `mkdir`, `chromium.launch`, `fetch`, or a report timestamp that implies a run began. The current validator must be tightened because its current tests explicitly accept non-default ports, default ports, uppercase hosts, and a trailing slash, while Phase 6 requires a clean port-free origin. Requiring both `url.port === ""` and `raw === url.origin` after existing public-host checks is the smallest shared-boundary fix and intentionally drops those compatibility variants. [VERIFIED: `src/lib/site-origin.ts`; `tests/site-origin.test.ts`; `06-SPEC.md` requirement 1]

### Pattern 2: Static Crawl First, Browser Audit Second

Use native fetch with `redirect: "manual"` so a 301/302 cannot be mistaken for a healthy source URL. Limit fetched bodies (recommended 5 MiB hard cap), reject credentials/out-of-origin URLs, reject DOCTYPE/entity declarations in XML, require XML or HTML content types where applicable, and extract only structured fields through `DOMParser`. Ordinary HTML doctypes remain valid. Browser navigation then operates on the already-discovered route graph rather than inventing membership. [CITED: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap] [VERIFIED: existing crawl patterns]

Apply `AbortSignal.timeout(20_000)` to each static fetch, 30 seconds to rendered-audit navigations, and 45 seconds to throttled performance navigations. Do not retry automatically. A network/browser failure is evidence from that run and exits nonzero; the operator may deliberately rerun the complete command, producing a separate dated report. [RECOMMENDED: deterministic authority-preserving policy]

The crawl sequence is prescriptive:

1. Fetch `/robots.txt` and `/sitemap-index.xml` directly; require status 200 and no redirect.
2. Parse unique child sitemap URLs; require the exact supplied origin and expected sitemap path family.
3. Parse unique public URLs; require same origin, clean query/fragment-free canonical route shape, and exclusion of 404/drafts.
4. Fetch every public HTML URL directly, extract static identity/internal links/article video identity, and enforce one self-canonical, unique Arabic title/description, `lang="ar"`, `dir="rtl"`, no `noindex`, and no redirect.
5. Fetch every discovered same-origin anchor destination directly, check the intentional missing path separately, and never request outbound YouTube/reference destinations. [VERIFIED: `06-CONTEXT.md` D-05–D-08]

### Pattern 3: Deterministic Five-Role Selection

Classify an article by the presence of one `[data-video-region][data-youtube-id]`; derive its section prefix from its canonical pathname and require the corresponding one-segment section URL to be sitemap-listed and link-connected. Sort section canonical URLs by Unicode code point, use the first as the one section-index sample, and within each of the exactly three discovered sections select the first sorted article canonical. Record both the algorithm and selected URLs. This yields homepage + one section + three articles without a hand-authored production URL list. [VERIFIED: current route/component contract + D-09]

### Pattern 4: Controlled Cold-Lab Runs

For each of the five selected URLs, run exactly three iterations. Each iteration creates a fresh non-persistent context, installs the metrics observer before page scripts, creates a page-specific CDP session, clears browser cache, applies the exact profile, navigates once, waits through a fixed five-second reader-idle observation window after load/fonts readiness, reads metrics, and closes the context. Missing observer support, missing/non-finite LCP, browser errors, or an incomplete run fails the route; `0` is valid CLS. [CITED: https://playwright.dev/docs/api/class-browsercontext] [CITED: https://playwright.dev/docs/api/class-browsercontext#browser-context-add-init-script]

Use current CDP commands `Network.emulateNetworkConditionsByRule` plus `Network.overrideNetworkState`; the older `Network.emulateNetworkConditions` command is currently marked deprecated. Apply 562.5 ms latency, 180,000 B/s download, 84,375 B/s upload, `cellular4g`, and `Emulation.setCPUThrottlingRate({rate:4})`. The Chrome DevTools source identifies these adjusted values as its Slow 4G preset targeting about 150 ms RTT, ~1.6 Mbps down, and ~0.75 Mbps up. [CITED: https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-emulateNetworkConditionsByRule] [CITED: https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setCPUThrottlingRate] [CITED: https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/core/sdk/NetworkManager.ts]

Gate each route on the median (middle sorted value) of its three LCP values and separately of its three CLS values. LCP must be ≤2500 ms and CLS ≤0.1. These are controlled per-run lab gates; do not describe the median of three lab runs as the field 75th percentile. [CITED: https://web.dev/articles/lcp] [CITED: https://web.dev/articles/cls] [VERIFIED: `06-CONTEXT.md` D-11]

### Pattern 5: LCP and Correct CLS Aggregation

Register separate buffered observers for `largest-contentful-paint` and `layout-shift`. Store the latest LCP entry's `startTime`. For CLS, discard entries with `hadRecentInput`, accumulate a session while consecutive entries are less than one second apart and the window is at most five seconds from its first entry, and retain the maximum window sum. Summing all shifts across the page lifecycle is the old algorithm and must not be used. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver/observe] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/LargestContentfulPaint] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/LayoutShift] [CITED: https://web.dev/articles/cls]

### Pattern 6: Media Host Boundary and Geometry

Use exact hostname-or-subdomain matching against one central suffix set: `youtube.com`, `youtube-nocookie.com`, `youtu.be`, `ytimg.com`, `googlevideo.com`, `ggpht.com`, `googleapis.com`, `gstatic.com`, `googleusercontent.com`, `doubleclick.net`, and `googlesyndication.com`. Do not use substring checks such as `hostname.includes("youtube")`. Record and abort matching pre-interaction requests; require zero such requests and zero iframe elements before intent. [VERIFIED: D-14; current test's substring helper is insufficiently strict for a production boundary]

For each article, use fresh pages for pointer and keyboard (`Enter`) activation. Verify one exact `https://www.youtube-nocookie.com/embed/{encodedId}?hl=ar` iframe, one Arabic title equal to the component data, no `autoplay=1`, and no duplicate after a second detached-control attempt. Block media hosts in the fallback pass, then prove the static direct link remains visible, focusable, Arabic-labelled, same-tab, and exactly `https://www.youtube.com/watch?v={id}`. Compare the player region's pre/post bounding box within one CSS pixel and its ratio within a small declared tolerance around 16:9. This proves intent wiring and reserved geometry, not playback availability. [VERIFIED: `YouTubePlayer.astro`; `tests/article-journey.spec.ts`; D-15–D-17]

### Pattern 7: Whole-Site Arabic and Accessibility Audit

On every sitemap route plus the true 404, assert root `lang="ar" dir="rtl"`, one visible main landmark, one h1, non-skipping heading levels, keyboard reachability of every interactive element, visible focus, no horizontal overflow at 320 CSS pixels, and no content/control loss after the WCAG text-spacing override. W3C defines the vertical reflow width as 320 CSS pixels and the stress values as line height 1.5×, paragraph spacing 2×, letter spacing 0.12×, and word spacing 0.16×. [CITED: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html] [CITED: https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html]

Scan Latin letters in visible text nodes, title/meta description, `alt`, element `title`, `aria-label`, and non-ignored CDP accessibility-tree names. Exclude only URLs, exact 11-character machine IDs, scripts/styles, and hidden framework internals; start with an empty proper-noun allowlist because the current eight public documents and 404 produced no Latin-letter reader-facing or AX names. Run Axe with the repository's existing WCAG tags and fail serious/critical findings. Native browser-chrome 200% zoom remains a separate human row because changing device scale or CSS viewport is not proof of native browser zoom. [VERIFIED: local audit; existing tests; D-18–D-20]

### Pattern 8: Evidence Scope Is Immutable

The machine report must be written to a new UTC run directory at `.artifacts/phase-06/{controlled|production}/{YYYYMMDDTHHMMSSZ}/report.json` and include `schemaVersion`, `evidenceScope` (`controlled` or `final-origin`), `transport` (`intercepted-fixture` or `network`), input/normalized origin, start/end UTC, Node/Playwright/Chromium versions, exact profile, route graph, selected samples, raw/median metrics, per-route findings, per-article media observations, Arabic/a11y results, errors, and a gate summary. If fixture transport is supplied, the runner itself assigns controlled scope; callers do not pass a free-form scope string. [VERIFIED: D-22–D-25]

The committed ledger must have distinct rows for: controlled runner correctness; owner-confirmed final origin; final-origin crawl; production LCP/CLS; pre-interaction media; Arabic/RTL/a11y/reflow; native 200% zoom; field INP; inherited Cloudflare/DNS/TLS; inherited Search Console/sitemap; inherited Plausible pageviews/outbound click; QUAL-05; and QUAL-06. Allowed states remain `PASS`, `FAIL`, `PENDING`, and `BLOCKED`, with authority, observed date/value, artifact path, and next action. [VERIFIED: Phase 5 ledger pattern + D-23]

### Anti-Patterns to Avoid

- **Production test inside ordinary Playwright projects:** it risks accidental live contact from `npm run verify`; keep the CLI isolated. [VERIFIED: D-03]
- **Regex XML/HTML parser:** it misses namespaces/entities/malformed structure; use DOMParser extraction. [VERIFIED: existing parser pattern]
- **`page.goto()` as the discovery HTTP client:** it follows redirects and runs analytics/scripts; use manual-redirect static fetch for crawl identity. [VERIFIED: D-06 + read-only boundary]
- **One warmed browser context:** it invalidates the cold-cache contract and makes route order affect results. [CITED: https://playwright.dev/docs/api/class-browsercontext]
- **Average metrics:** averages can hide a bad or missing run; keep raw values and median. [VERIFIED: D-11]
- **Broad English/host allowlist:** substring matching hides leaks and hostname spoofing; use exact tokens and suffix-boundary matching. [VERIFIED: D-19]
- **Generated ledger edits:** a successful controlled JSON run must never promote production or provider facts. [VERIFIED: D-24]

## Likely Files Created or Modified

| File                                                                           | Action | Responsibility                                                                                                                                                                     |
| ------------------------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/verify-production.mjs`                                                | Create | Single importable runner and CLI; static crawl, parser extraction, lab/media/a11y passes, JSON report, concise exit summary. [RECOMMENDED: simplest complete design]               |
| `tests/production-verification.test.ts`                                        | Create | Controlled happy path plus origin/parser/redirect/selection/metric/media/evidence-scope failure matrix; artifacts only under `.artifacts/phase-06/controlled/`. [RECOMMENDED]      |
| `src/lib/site-origin.ts`                                                       | Modify | Enforce exact canonical, port-free input while retaining public HTTPS/reserved-host/IP checks. [VERIFIED: identified requirement gap]                                              |
| `tests/site-origin.test.ts`                                                    | Modify | Move trailing slash, case variants, `:443`, and `:8443` to the rejection matrix; retain one exact normalized valid origin. [VERIFIED: identified requirement gap]                  |
| `package.json`                                                                 | Modify | Add `verify:production`; include the controlled Node test in serialized `npm test`; do not add a dependency or put production verification in `verify`. [VERIFIED: D-01/D-03/D-04] |
| `.planning/phases/06-production-launch-verification/06-PRODUCTION-EVIDENCE.md` | Create | Reviewer-maintained authority/status ledger; never generated by the runner. [VERIFIED: D-23/D-24]                                                                                  |
| `README.md`                                                                    | Modify | Add the concise Arabic PowerShell operator command, artifact path, runtime requirement, and evidence limitations. [VERIFIED: existing Phase 5 operator pattern]                    |

No `package-lock.json`, `playwright.config.ts`, `.gitignore`, Astro route/component, analytics, schema/entity markup, server adapter, UI, monitoring, or `.env` change is planned. [VERIFIED: existing ignore/config state + phase boundaries]

## Don't Hand-Roll

| Problem                     | Don't Build                                  | Use Instead                                                                  | Why                                                                                                                                           |
| --------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser orchestration       | Custom Chrome process/WebSocket manager      | Installed Playwright Chromium and contexts                                   | Existing tested lifecycle, routing, CDP, keyboard, and geometry APIs already cover the requirement. [VERIFIED: codebase]                      |
| XML/HTML grammar            | Regex or partial entity decoder              | Browser `DOMParser` with strict extracted-shape validation                   | Reuses a passing project pattern and handles actual document parsing without a package. [VERIFIED: `tests/search-discovery.spec.ts`]          |
| Core Web Vitals telemetry   | `web-vitals`, Lighthouse, RUM endpoint       | Raw PerformanceObserver for this controlled lab only                         | The phase needs dated lab LCP/CLS, not production telemetry; field status remains external. [VERIFIED: locked scope]                          |
| Accessibility engine        | New scanner                                  | Installed Axe plus semantic/keyboard/AX-tree assertions                      | Automated rules alone do not cover Arabic/RTL, focus order, zoom, or content-language leaks. [VERIFIED: existing tests + WCAG skill guidance] |
| Public route list           | Registry-copy or hardcoded URL array         | Deployed sitemap plus observed route graph; source only for draft exclusions | Prevents a second membership authority. [VERIFIED: D-05]                                                                                      |
| Evidence database/dashboard | Custom service or auto-updating planning doc | Ignored JSON + committed Markdown ledger                                     | Keeps the release audit static, reviewable, and authority-bounded. [VERIFIED: D-22–D-24]                                                      |

**Key insight:** This phase adds an observer, not another application subsystem. One runner and one controlled test are sufficient; every additional runtime/config/reporting layer creates a new authority that the phase is explicitly trying to avoid. [VERIFIED: phase boundary]

## Common Pitfalls

### Pitfall 1: Origin Validation Happens After Browser Startup

**What goes wrong:** Invalid/local/port-bearing input can cause artifact creation or a request before rejection. **Why:** validation is treated as a helper inside the run rather than the CLI gate. **Avoid:** validate synchronously at the first executable line and test no fixture transport/browser invocation occurred. **Warning sign:** an invalid-origin run creates `report.json`. [VERIFIED: D-02]

### Pitfall 2: Redirects Become False 200s

**What goes wrong:** fetch or browser navigation follows a redirect and the runner reports the source URL healthy. **Why:** default fetch/navigation behavior follows redirects. **Avoid:** static crawl uses `redirect:"manual"`; status must be exactly 200 and `Location` is a failure for public/discovery URLs. **Warning sign:** response URL differs from requested canonical. [VERIFIED: D-06]

### Pitfall 3: CLS Uses the Obsolete Lifetime Sum

**What goes wrong:** reported CLS differs from the current metric and may overstate long-lived pages. **Why:** raw layout-shift values are simply summed. **Avoid:** max 5-second session window with gaps under one second, excluding recent input. **Warning sign:** implementation has one accumulator and no timestamps. [CITED: https://web.dev/articles/cls]

### Pitfall 4: Throttling Is Unnamed or Deprecated

**What goes wrong:** later runs cannot be compared, or Chromium removes the old command. **Why:** report says only “Slow 4G” and calls the deprecated all-in-one CDP method. **Avoid:** store every applied constant and use the current by-rule + navigator-state commands; the controlled test asserts the profile object. **Warning sign:** no bytes-per-second/latency values in JSON. [CITED: Chrome DevTools Protocol]

### Pitfall 5: English Audit Scans Only `innerText`

**What goes wrong:** an English iframe title, image alt, ARIA label, metadata string, or landmark name passes. **Why:** accessibility names are not necessarily visible. **Avoid:** combine visible nodes, head/attributes, and CDP AX tree; keep the token allowlist exact and empty initially. **Warning sign:** the audit has one body regex. [VERIFIED: D-18/D-19]

### Pitfall 6: Media Requests Are Matched by Substring

**What goes wrong:** spoofed hostnames match or real Google media families are missed. **Why:** `hostname.includes(...)` is convenient. **Avoid:** `host === suffix || host.endsWith('.' + suffix)` against one reviewed list. **Warning sign:** `youtube.evil.example` is classified as YouTube. [VERIFIED: security reasoning + current test gap]

### Pitfall 7: Controlled Output Looks Like Production Evidence

**What goes wrong:** the planner closes QUAL-05/06 from fixture/local results. **Why:** report filenames and summaries omit authority. **Avoid:** scope/transport are runner-derived fields, controlled artifacts live in a distinct directory, and the committed ledger stays pending until final-origin evidence is reviewed. **Warning sign:** controlled JSON contains `QUAL-05: PASS`. [VERIFIED: D-24/D-25]

### Pitfall 8: Native Zoom Is Claimed from Device Emulation

**What goes wrong:** viewport/device-scale evidence is relabelled as 200% browser zoom. **Why:** both make content look larger. **Avoid:** keep native 200% as a human row; automated 320px reflow/text spacing remain separate results. **Warning sign:** a CDP device scale change is the only zoom evidence. [VERIFIED: Phase 2/3 decisions + D-20]

## Code Examples

Verified implementation patterns for the planner; exact names may change, but the boundaries should not.

### Pre-navigation Metrics Observer

```javascript
// Sources:
// https://playwright.dev/docs/api/class-browsercontext#browser-context-add-init-script
// https://developer.mozilla.org/en-US/docs/Web/API/LargestContentfulPaint
// https://web.dev/articles/cls
await context.addInitScript(() => {
  const state = { lcp: null, cls: 0, shifts: [], supported: [] };
  globalThis.__phase6Vitals = state;

  if (
    PerformanceObserver.supportedEntryTypes.includes("largest-contentful-paint")
  ) {
    state.supported.push("largest-contentful-paint");
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) state.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  }

  if (PerformanceObserver.supportedEntryTypes.includes("layout-shift")) {
    state.supported.push("layout-shift");
    let session = null;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.hadRecentInput) continue;
        state.shifts.push({ startTime: entry.startTime, value: entry.value });
        const continues =
          session &&
          entry.startTime - session.last < 1000 &&
          entry.startTime - session.first <= 5000;
        session = continues
          ? {
              ...session,
              last: entry.startTime,
              value: session.value + entry.value,
            }
          : {
              first: entry.startTime,
              last: entry.startTime,
              value: entry.value,
            };
        state.cls = Math.max(state.cls, session.value);
      }
    }).observe({ type: "layout-shift", buffered: true });
  }
});
```

### Current Slow-4G-Like CDP Profile

```javascript
// Sources:
// https://chromedevtools.github.io/devtools-protocol/tot/Network/
// https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/core/sdk/NetworkManager.ts
const conditions = {
  urlPattern: "",
  latency: 562.5,
  downloadThroughput: 180_000,
  uploadThroughput: 84_375,
  connectionType: "cellular4g",
};

const cdp = await context.newCDPSession(page);
await cdp.send("Network.emulateNetworkConditionsByRule", {
  matchedNetworkConditions: [conditions],
});
await cdp.send("Network.overrideNetworkState", {
  offline: false,
  latency: conditions.latency,
  downloadThroughput: conditions.downloadThroughput,
  uploadThroughput: conditions.uploadThroughput,
  connectionType: conditions.connectionType,
});
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
```

### Strict Host-Suffix Match

```javascript
// Source: production security boundary derived from D-14.
const belongsTo = (hostname, suffix) =>
  hostname === suffix || hostname.endsWith(`.${suffix}`);

const isMediaHost = (rawUrl) => {
  const hostname = new URL(rawUrl).hostname.toLowerCase();
  return MEDIA_HOST_SUFFIXES.some((suffix) => belongsTo(hostname, suffix));
};
```

### Controlled Scope Cannot Be Chosen by Caller

```javascript
// Source: D-24/D-25 authority boundary.
export async function runProductionVerification(options) {
  const controlled = options.controlledFixture !== undefined;
  const evidenceScope = controlled ? "controlled" : "final-origin";
  const transport = controlled ? "intercepted-fixture" : "network";
  // ...run and serialize these immutable values...
}
```

## State of the Art

| Old Approach                                 | Current Approach                                                       | When Changed / Current Evidence                                                                                    | Impact                                                    |
| -------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| Sum all layout shifts over page lifetime     | Maximum CLS session window: gaps <1 s, total window ≤5 s               | Current web.dev CLS definition [CITED: https://web.dev/articles/cls]                                               | Raw observer code must implement session windows.         |
| `Network.emulateNetworkConditions`           | `emulateNetworkConditionsByRule` + `overrideNetworkState`              | Current CDP marks the former deprecated. [CITED: Chrome DevTools Protocol]                                         | Use current commands and pin exact constants in evidence. |
| One warmed performance session               | Fresh non-persistent context for every run                             | Playwright contexts are isolated and non-persistent. [CITED: https://playwright.dev/docs/api/class-browsercontext] | Route order/cache cannot silently improve later samples.  |
| Automated zoom/device scaling as “200% zoom” | Separate automated reflow/text-spacing from human native zoom          | Locked project decision from earlier phases. [VERIFIED: `.planning/STATE.md`; D-20]                                | Evidence stays truthful.                                  |
| Controlled fixture proves production         | Controlled, final-origin, field, and provider facts have separate rows | Phase 5 verified ledger pattern. [VERIFIED: `05-VERIFICATION.md`]                                                  | No automatic evidence promotion.                          |

**Deprecated/outdated:**

- `Network.emulateNetworkConditions`: deprecated in current CDP; do not start new Phase 6 code on it. [CITED: https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-emulateNetworkConditions]
- Lifetime-summed CLS: replaced by maximum session-window CLS. [CITED: https://web.dev/articles/cls]
- Automated “native zoom” claims: explicitly disallowed by the project evidence contract. [VERIFIED: D-20]

## Assumptions Log

| #   | Claim                                                                                                               | Section | Risk if Wrong |
| --- | ------------------------------------------------------------------------------------------------------------------- | ------- | ------------- |
| —   | None. Implementation choices are either locked, verified in the repository, or cited from current official sources. | —       | —             |

## Open Questions

No implementation research question remains unresolved. The following are external inputs/evidence, not planner decisions:

1. **Exact owner-approved final HTTPS origin** — unavailable in repository evidence; the operator supplies it explicitly at run time and the ledger remains pending until reviewed. [VERIFIED: Phase 5 blockers]
2. **Native 200% browser zoom result** — requires a named human check on the final origin. [VERIFIED: D-20]
3. **Field INP/CrUX data** — remains pending until qualifying real-user field data exists; no lab interaction substitutes for it. [VERIFIED: D-13]
4. **Cloudflare/DNS/TLS, Search Console, and Plausible facts** — inherited from Phase 5 and remain owner/provider evidence regardless of Phase 6 runner results. [VERIFIED: `05-VERIFICATION.md`]

The planner should create pending/human rows for these facts, not pause repository-controlled implementation. [VERIFIED: D-25]

## Environment Availability

| Dependency                   | Required By                   | Available                                             | Version       | Fallback                                                                                                                                              |
| ---------------------------- | ----------------------------- | ----------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js exact pinned runtime | CLI and native tests          | ✓ available at the project-pinned WinGet runtime path | `v24.19.0`    | Select the known pinned runtime before every package/test command; do not relax engines. [VERIFIED: main-session probe + `package.json`]              |
| npm exact pinned version     | package commands              | ✓ bundled with the project-pinned runtime             | `11.17.0`     | Use the npm bundled with Node 24.19.0. [VERIFIED: main-session probe + `package.json`]                                                                |
| `@playwright/test`           | browser/CDP runner            | ✓                                                     | 1.62.1        | — [VERIFIED: local probe]                                                                                                                             |
| Bundled Chromium executable  | rendering/performance/AX tree | ✓                                                     | 151.0.7922.34 | Run `npx playwright install chromium` only if execution later reports the browser missing; no package change. [VERIFIED: local executable and launch] |
| `@axe-core/playwright`       | automated a11y findings       | ✓                                                     | 4.13.0        | Existing semantic/keyboard assertions still run, but missing Axe would block the locked automated scan. [VERIFIED: `package.json`]                    |
| Final public HTTPS origin    | real production rows          | ✗ not supplied/reachable in repository context        | —             | Complete controlled runner work and keep final rows/QUAL-05/QUAL-06 pending. [VERIFIED: Phase 5 verification]                                         |

**Missing dependencies with no fallback:** the exact final public origin blocks only qualifying production evidence; it does not block runner implementation or controlled validation. The exact pinned Node/npm toolchain is available and must be selected explicitly for execution. [VERIFIED: main-session probes + D-25]

**Missing dependencies with fallback:** no package fallback is needed. Context7 was unavailable during this research, so official Playwright, Chrome DevTools, MDN, web.dev, W3C, Google, and repository sources were fetched directly as required. [VERIFIED: research session]

## Validation Architecture

### Test Framework

| Property            | Value                                                                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework           | Node `node:test` on 24.19.0 for runner control/error matrices; installed Playwright 1.62.1 and Axe 4.13.0 inside the runner. [VERIFIED: existing project pattern]                                              |
| Config file         | No new config. Ordinary browser projects remain in `playwright.config.ts`; the production runner is standalone. [VERIFIED: D-03/D-04]                                                                          |
| Quick run command   | `node --test --test-concurrency=1 --test-reporter=tap tests/site-origin.test.ts tests/production-verification.test.ts` [RECOMMENDED]                                                                           |
| Full suite command  | `npm run verify` after the controlled test is added to the existing serialized `npm test`; the real-origin command remains separate. [VERIFIED: package command contract]                                      |
| Real-origin command | PowerShell: `$env:SITE_ORIGIN='https://exact-final-host.example'; npm run verify:production` — placeholder only; README must use the owner's actual exact origin and no `.env` file. [VERIFIED: D-01 + AGENTS] |

### Phase Requirements → Test Map

| Req ID  | Behavior                                                                                                                                                                                                                                      | Test Type                                            | Automated Command                                             | File Exists?                            |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------- |
| QUAL-05 | Controlled runner correctly selects five roles, records three raw LCP/CLS runs and medians, applies exact profile, rejects missing/over-threshold metrics, and verifies media intent/geometry/fallback without promoting controlled evidence. | native integration with intercepted Chromium fixture | `node --test tests/production-verification.test.ts`           | ❌ Wave 0                               |
| QUAL-05 | Exact final-origin five-role lab and every-article media pass                                                                                                                                                                                 | production acceptance                                | `npm run verify:production` with explicit final `SITE_ORIGIN` | ❌ runner Wave 0; final origin external |
| QUAL-06 | Controlled crawl rejects malformed/duplicate/out-of-origin sitemap data, redirects, broken links, wrong canonicals, duplicate/non-Arabic metadata, draft leakage, incorrect 404, and English/AX leaks.                                        | native integration/error matrix                      | `node --test tests/production-verification.test.ts`           | ❌ Wave 0                               |
| QUAL-06 | Exact final-origin crawl, rendered Arabic/RTL/a11y/reflow audit                                                                                                                                                                               | production acceptance                                | `npm run verify:production` with explicit final `SITE_ORIGIN` | ❌ runner Wave 0; final origin external |

### Controlled Fixture Minimum

The fixture must model `/robots.txt`, `/sitemap-index.xml`, one child sitemap, homepage, three section indexes, one article per section, the author page, the intentional 404, static direct YouTube links, and intent-created iframe behavior. It must be internally consistent but visibly synthetic, and every generated report must state `controlled` plus `intercepted-fixture`. [VERIFIED: current eight-route production graph + authority rules]

### Sampling Rate

- **Per task commit:** quick Node runner/origin tests. [RECOMMENDED]
- **Per wave merge:** `npm run verify`; current Phase 5 baseline was 133/133 native and 49/49 browser, but execution must rely on a fresh result. [VERIFIED: `05-VERIFICATION.md`]
- **Phase gate:** pinned full suite green, controlled runner/error matrix green, evidence ledger structurally reviewed, and real-origin rows either qualifying with inspected evidence or explicitly pending/human-needed. [VERIFIED: D-25]

### Wave 0 Gaps

- [ ] `tests/production-verification.test.ts` — controlled transport, failure matrices, immutable evidence scope, artifact isolation.
- [ ] `scripts/verify-production.mjs` — importable/CLI production runner.
- [ ] Strengthened exact-origin cases in `tests/site-origin.test.ts` before changing the shared validator.
- [ ] `06-PRODUCTION-EVIDENCE.md` structure assertions in the native suite so local evidence cannot promote final/provider rows.

No framework installation is needed. [VERIFIED: package boundary]

## Security Domain

Security enforcement and ASVS Level 1 are enabled for this project. [VERIFIED: `.planning/config.json`]

### Applicable ASVS Categories

| ASVS Category         | Applies | Standard Control                                                                                                                                                                                         |
| --------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V2 Authentication     | No      | The verifier has no authentication or account access; do not add provider credentials. [VERIFIED: phase scope]                                                                                           |
| V3 Session Management | No      | Fresh browser contexts are measurement isolation, not user sessions; no auth/session state is persisted. [VERIFIED: architecture]                                                                        |
| V4 Access Control     | No      | The CLI is a local opt-in tool and performs no privileged mutation. [VERIFIED: phase scope]                                                                                                              |
| V5 Input Validation   | Yes     | Shared exact `productionSiteOrigin`, manual redirect handling, same-origin URL checks, bounded response reads, strict DOM-extracted shapes, exact host suffixes, and fixed artifact paths. [RECOMMENDED] |
| V6 Cryptography       | Limited | Rely on browser/Node HTTPS validation; never disable TLS errors or hand-roll crypto/certificate logic in final-origin mode. [RECOMMENDED]                                                                |

### Known Threat Patterns for the Runner

| Pattern                                             | STRIDE                            | Standard Mitigation                                                                                                                                                                                            |
| --------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arbitrary/local origin or credential-bearing URL    | Spoofing / Information Disclosure | Exact public HTTPS validator before I/O; reject IP, reserved/local roots, userinfo, path/query/fragment, explicit port, case/slash normalization variants. [VERIFIED: existing validator + Phase 6 tightening] |
| Redirect escape to another host                     | Spoofing / Information Disclosure | `redirect:"manual"`; reject every non-200 and never crawl `Location`. Browser audits abort unexpected main-frame off-origin navigation. [RECOMMENDED]                                                          |
| Oversized/malicious XML/HTML                        | Denial of Service / Tampering     | Bounded streamed read and expected content type/root; reject XML DOCTYPE/entity declarations, parser errors, duplicates, and out-of-origin locations while allowing the normal HTML doctype. [RECOMMENDED]     |
| Hostname substring spoofing                         | Spoofing                          | Exact hostname-or-subdomain suffix comparison. [RECOMMENDED]                                                                                                                                                   |
| Unexpected pre-intent third-party request           | Information Disclosure            | Central media suffix set, request ledger, abort and fail before activation. [VERIFIED: media contract]                                                                                                         |
| Artifact path escape or sensitive capture           | Information Disclosure            | Fixed `.artifacts/phase-06/{controlled                                                                                                                                                                         | production}/`roots; no user-provided output path, cookies, headers, bodies, credentials, or`.env` reads in JSON. [RECOMMENDED] |
| Controlled evidence promoted as production          | Tampering / Repudiation           | Runner-derived scope/transport, distinct artifact root, committed reviewer ledger, structural tests that prohibit production PASS from controlled rows. [VERIFIED: D-24/D-25]                                  |
| TLS bypass in controlled mode leaks into production | Spoofing                          | Controlled fixtures use Playwright fulfillment and synthetic authority; final-origin mode must keep `ignoreHTTPSErrors` false. [RECOMMENDED]                                                                   |

### Security-Specific Verification

- Assert invalid input exits before calling the fixture fetch/browser factory and before creating `.artifacts`. [RECOMMENDED]
- Assert no `.env` path/string reader or dotenv package appears in the runner/README. [VERIFIED: AGENTS rule]
- Assert final-origin browser contexts do not set `ignoreHTTPSErrors`, credentials, proxy, custom headers, storage state, or persistent user-data directories. [RECOMMENDED]
- Assert reports omit response bodies, cookies, request/response headers, and provider tokens; retain only public URLs, numeric metrics, route findings, tool/profile metadata, and artifact-relative paths. [RECOMMENDED]
- Keep external YouTube/reference anchors shape-validated but never crawled. [VERIFIED: D-08]

## Sources

### Primary (HIGH confidence)

- Repository: `06-SPEC.md`, `06-CONTEXT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, Phase 5 verification/ledger/UAT, `package.json`, `playwright.config.ts`, shared origin/player sources, and the three existing browser suites — exact project contracts and reusable patterns. [VERIFIED: codebase]
- [Playwright BrowserContext](https://playwright.dev/docs/api/class-browsercontext) — isolated non-persistent contexts, pre-page init scripts, request routing, and CDP session creation. [CITED: official Playwright docs]
- [Chrome DevTools Protocol Network](https://chromedevtools.github.io/devtools-protocol/tot/Network/) and [Emulation](https://chromedevtools.github.io/devtools-protocol/tot/Emulation/) — current network/CPU commands, units, and deprecation state. [CITED: official protocol]
- [Chrome DevTools `NetworkManager.ts`](https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/core/sdk/NetworkManager.ts) — maintained Slow 4G target/applied constants and current command pairing. [CITED: official Chrome DevTools source]
- [MDN PerformanceObserver.observe](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver/observe), [LargestContentfulPaint](https://developer.mozilla.org/en-US/docs/Web/API/LargestContentfulPaint), and [LayoutShift](https://developer.mozilla.org/en-US/docs/Web/API/LayoutShift) — buffered observer behavior, latest LCP candidate, layout shift value/input fields. [CITED: MDN]
- [web.dev LCP](https://web.dev/articles/lcp) and [CLS](https://web.dev/articles/cls) — good thresholds, lab/field distinction, and current CLS session-window algorithm. [CITED: Google web.dev]
- [W3C WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) and [Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) — 320 CSS-pixel and text-spacing stress contracts. [CITED: W3C]
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), and [robots guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro) — absolute canonical sitemap URLs and discovery-signal boundaries. [CITED: Google Search Central]

### Secondary (MEDIUM confidence)

- None. No community-only or unverified recommendation is required for this phase.

### Tertiary (LOW confidence)

- None.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — exact installed/pinned versions and package publish records were checked; no dependency is added. [VERIFIED: codebase + npm registry]
- Architecture: HIGH — derived from locked decisions and existing working crawl/media/test patterns, with official API confirmation. [VERIFIED: codebase + official docs]
- Performance method: HIGH — exact current CDP constants/commands and current LCP/CLS definitions were verified from official sources. [CITED: Chrome/MDN/web.dev]
- Accessibility/Arabic audit: HIGH — WCAG values are official, and the current whole launch corpus was locally inspected with DOM plus the Chromium AX tree. [VERIFIED: W3C + controlled local audit]
- Production/provider status: HIGH — accurately unresolved by owner authority; no production claim is made. [VERIFIED: Phase 5 evidence]

**Research date:** 2026-08-28
**Valid until:** 2026-09-04 for CDP/Playwright command details; stable project decisions remain valid until the phase context changes.
