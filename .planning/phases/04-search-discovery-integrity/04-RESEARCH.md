# Phase 4: Search Discovery Integrity - Research

**Researched:** 2026-08-27
**Domain:** Astro 7 static metadata, canonical-origin integrity, crawler discovery files, static error delivery, and verification
**Confidence:** HIGH, except the exact Open Graph Arabic locale code and package-legitimacy automation noted below

<user_constraints>
## User Constraints (from CONTEXT.md)

**Provenance:** The following decisions, discretion, and deferred ideas are copied verbatim from `04-CONTEXT.md`. [VERIFIED: codebase grep]

### Locked Decisions

#### Shared Page Identity

- **D-01:** Render every Phase 4 head field through the existing `SiteLayout.astro`; page routes supply maintained identity facts, while the layout owns markup, canonical derivation, social parity, robots behavior, and the favicon link.
- **D-02:** Use exact page-title composition: homepage `مدونة أحمد المنجاوي`; section `${section.label} | مدونة أحمد المنجاوي`; article `${article.data.title} | مدونة أحمد المنجاوي`; author `عن أحمد المنجاوي | مدونة أحمد المنجاوي`; 404 `الصفحة غير موجودة | مدونة أحمد المنجاوي`.
- **D-03:** Reuse existing maintained copy as descriptions: homepage introduction, section registry description, article frontmatter description, and author-page explanatory paragraph. The 404 uses a dedicated Arabic error description. Do not create a parallel SEO-copy registry.
- **D-04:** Indexable pages contain exactly one canonical and no explicit `index,follow` tag because that is the default. The 404 alone emits `noindex,follow` and omits canonical and social URL identity.

#### Origin and Canonical Policy

- **D-05:** Make `Astro.site` the sole absolute-origin source. Construct canonicals from the current pathname against that origin, retaining the established trailing slash and dropping query/fragment state by construction. Page/content data cannot override canonical URLs.
- **D-06:** Ordinary development and verification use the explicit Playwright preview origin `http://127.0.0.1:4322`. Launch-readiness consumes the non-secret `SITE_ORIGIN` build input and fails before accepted output if it is missing or not a clean production HTTPS origin.
- **D-07:** Production-origin validation rejects HTTP, credentials, queries, fragments, non-root paths, localhost names, IP literals, and reserved placeholder domains. Normalize one accepted origin once rather than repairing page URLs independently.
- **D-08:** Do not create or read `.env` files. Phase 5 must supply the real `SITE_ORIGIN` through the selected provider or explicit command and prove that external origin separately.

#### Social Sharing Identity

- **D-09:** Emit `og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`, and Arabic locale from the same normalized page object that produces title/description/canonical. Article pages use `article`; other indexable routes use `website`.
- **D-10:** Emit `twitter:card=summary`, `twitter:title`, and `twitter:description` from those same facts. Do not invent a handle, account, image, logo, or alternate description.
- **D-11:** Article pages may add truthful Open Graph publication and optional update timestamps from validated frontmatter. They must not infer video views, reviewer identity, credentials, or schema claims.

#### Sitemap and Robots Agreement

- **D-12:** Use the maintained official `@astrojs/sitemap` integration. Let generated indexable routes supply its URL set and apply only the exclusion needed for the static 404; do not maintain a second list of article or section URLs.
- **D-13:** Generate `robots.txt` from the same normalized site origin. Its minimal policy is `User-agent: *`, `Allow: /`, and exactly one absolute `Sitemap:` line for the generated sitemap index. Do not use `Disallow` to simulate draft security.
- **D-14:** Preserve the existing content selector and route boundary: public records generate paths, drafts do not. Browser/build checks compare raw approved source, HTML routes, canonicals, internal links, and sitemap URLs independently so a shared selector bug cannot make all observations agree falsely.

#### Arabic 404 and Local Favicon

- **D-15:** The 404 reuses the site shell and existing visual tokens. It contains `الصفحة غير موجودة` as its only `h1`, the sentence `تعذر العثور على الصفحة المطلوبة.`, and the ordinary link `العودة إلى الصفحة الرئيسية` pointing to `/`. It adds no search box, illustration, suggested content, or client behavior.
- **D-16:** Add one local SVG favicon referenced from every document. Use only simple geometric open-page shapes in the current cream/green palette; use no text glyph, embedded font, remote image, animation, or claim that it is a final owner-approved logo.

#### Verification Boundary

- **D-17:** Add the smallest focused native checks for origin acceptance/rejection and a dedicated search-discovery Playwright/build suite for HTML, XML, text endpoint, favicon, status, navigation, no-JavaScript, and accessibility behavior. Reuse the existing Playwright server lifecycle and keep every artifact under `.artifacts/`.
- **D-18:** Every browser verification run must build fresh first. Parse metadata and discovery files rather than relying on screenshots alone, then run rendered 404/focus/reflow/accessibility checks where appearance or interaction matters.
- **D-19:** Keep the full existing `npm run verify` gate green. Phase 4 adds no client runtime, remote request, webfont, CMS, database, SEO framework, schema package, or alternate test framework.

### the agent's Discretion

- Exact helper/type filenames and whether the origin validator lives beside site configuration or the metadata boundary, provided there is one validated origin flow and no single-use abstraction larger than the duplicated code it removes.
- Exact prop/type names for the shared layout metadata input, provided required indexable fields fail at build/type-check time and the 404 can explicitly suppress canonical/social identity.
- Exact focused test-file split, provided native origin branches and production rendered/discovery behavior are both runnable, fresh-build protected, and isolated under the existing test commands.
- Exact SVG path geometry within the locked two-color, no-text, no-remote favicon constraint.

### Deferred Ideas (OUT OF SCOPE)

- Final production hostname, provider deployment, redirect rules, DNS/TLS, Search Console verification/submission, aggregate analytics, and outbound YouTube click measurement — Phase 5.
- Production crawl certification, native browser-chrome 200% zoom, live YouTube playback, and Core Web Vitals evidence — Phase 6.
- JSON-LD/rich-result work and a designed social-sharing image — deferred until `SEO-07` or an approved asset makes them real requirements.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SITE-06 | A visitor who opens a missing route receives a useful Arabic 404 page with a clear path back into the site. | Static `src/pages/404.astro`, `dist/404.html`, Astro preview fallback semantics, exact Arabic recovery DOM, 404 status checks, and no-JS/focus/reflow validation. [VERIFIED: `.planning/REQUIREMENTS.md`; installed Astro 7.2.7 preview source] |
| SEO-02 | Every indexable page has a unique descriptive Arabic page title, meta description, and single clear primary heading. | A discriminated shared layout metadata contract plus a complete eight-route uniqueness matrix derived from registries/frontmatter. [VERIFIED: codebase grep] |
| SEO-03 | Every indexable page emits a self-consistent canonical URL and accurate social-sharing metadata derived from the configured production origin. | A validated launch-origin helper, programmatic launch build override, `Astro.site` + `Astro.url.pathname` canonical construction, and parity assertions across canonical/Open Graph/Twitter fields. [CITED: https://docs.astro.build/en/reference/api-reference/#url] |
| SEO-04 | Search crawlers can reach every published article through ordinary HTML links, while drafts and non-public content remain absent from public routes and discovery output. | Preserve `getPublicArticles()` for generation but retain the independent raw-frontmatter test oracle to compare source, output paths, anchors, canonicals, sitemap, and proof identifiers. [VERIFIED: `tests/discovery.spec.ts`] |
| SEO-05 | The deployed site exposes a sitemap containing only canonical published routes and robots directives that agree with the intended indexing policy. | Official route-derived sitemap 3.7.3 behavior, a static `robots.txt.ts` endpoint using the same `site`, XML/text parsing, and exact set equality checks. [CITED: https://docs.astro.build/en/guides/integrations-guide/sitemap/] |
</phase_requirements>

## Summary

Phase 4 should keep metadata as a static build concern. Each page supplies only its maintained title/description/type facts to `SiteLayout.astro`; the layout derives canonical and social identity from `Astro.url.pathname` and `Astro.site`, renders the favicon, and branches explicitly between indexable pages and the noindex 404. Astro documents that `Astro.site` is the configured `site` parsed as `URL | undefined`, while prerendered `Astro.url` uses the configured site/base and current output pathname. [CITED: https://docs.astro.build/en/reference/api-reference/#site] [CITED: https://docs.astro.build/en/reference/api-reference/#url]

Do not try to export `defineConfig(({ command, mode }) => ...)`: Astro 7.2.7's `defineConfig` accepts an `AstroUserConfig` object, and its config loader imports the default object without passing a config environment. `command` is available to integration hooks, while build `mode` is kept in Astro's inline build configuration and is not passed to the user's `astro.config.mjs`. [VERIFIED: `node_modules/astro/dist/config/index.d.ts`; `node_modules/astro/dist/core/config/vite-load.js`; `node_modules/astro/dist/types/public/integrations.d.ts`; `node_modules/astro/dist/core/build/index.js`] The clean launch boundary is therefore a small Node entry point that validates the explicit process environment, then calls Astro's exported `build({ site })`; ordinary `astro build` remains pinned to `http://127.0.0.1:4322`. [VERIFIED: installed `astro@7.2.7` exports `build`] This also avoids `loadEnv()` and any `.env` access. [VERIFIED: codebase constraint]

Install only official sitemap 3.7.3 [ASSUMED pending slopcheck]. Its pinned source automatically removes `/404` and `/500`, accepts only page routes, de-duplicates generated URLs, respects directory trailing slashes, and writes `sitemap-index.xml` plus numbered sitemap files beginning with `sitemap-0.xml`. No sitemap filter is needed for this repository; adding one would duplicate route policy and create drift risk. [CITED: https://github.com/withastro/astro/blob/%40astrojs/sitemap%403.7.3/packages/integrations/sitemap/src/index.ts] [CITED: https://docs.astro.build/en/guides/integrations-guide/sitemap/]

**Primary recommendation:** Use a shared discriminated metadata prop in `SiteLayout.astro`, a single fail-closed origin validator invoked by `scripts/launch-ready.mjs`, `sitemap()` with no route list/filter, a generated `robots.txt.ts`, static `404.astro`, and one local allowlisted SVG; prove all outputs with one native origin test file and one fresh-build Playwright discovery suite. [VERIFIED: locked D-01 through D-19]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Production-origin validation | Build tooling | — | It consumes an explicit build input before static output exists; no browser or request host may influence it. [VERIFIED: locked D-05 through D-08] |
| Page identity and canonical/social tags | Static page/layout renderer | Build tooling | Pages supply maintained facts; the shared layout owns emitted markup and derives URLs during prerender. [CITED: https://docs.astro.build/en/reference/api-reference/#url] |
| Sitemap | Build integration | Static hosting | The integration receives generated page routes during `astro build`, then hosting serves XML files verbatim. [CITED: https://docs.astro.build/en/guides/integrations-guide/sitemap/] |
| `robots.txt` | Static endpoint at build time | Static hosting | Astro executes `GET` during the static build and writes the returned body as `/robots.txt`. [CITED: https://docs.astro.build/en/guides/endpoints/#static-file-endpoints] |
| Missing-route recovery | Static page | Static preview/host fallback | Astro builds `404.astro` to `404.html`; preview/host chooses that file for missing routes and supplies the HTTP status. [CITED: https://docs.astro.build/en/basics/astro-pages/#custom-404-error-page] |
| Favicon | Static asset | Shared document head | `public/favicon.svg` is copied as a local file; the shared layout references it once from every HTML document. [CITED: https://developers.google.com/search/docs/appearance/favicon-in-search] |
| Route/crawler verification | Native Node + Playwright | Static build output | Node isolates origin branches; Playwright parses rendered HTML/XML/text and validates status, keyboard, reflow, and accessibility. [VERIFIED: `package.json`; `playwright.config.ts`] |

## Project Constraints (from AGENTS.md)

- Reader-facing content and navigation must remain Arabic-only and documents must preserve RTL semantics. [VERIFIED: `AGENTS.md`]
- Public content must be statically generated/crawlable without JavaScript and no CMS, database, editorial login, speculative runtime, or unnecessary client code may be added. [VERIFIED: `AGENTS.md`]
- Prefer the simplest established solution, do not preserve backward compatibility, and use the official maintained sitemap integration rather than custom equivalents. [VERIFIED: `AGENTS.md`; locked phase spec]
- Never read or create `.env` files; `SITE_ORIGIN` is a non-secret explicit process input. [VERIFIED: `AGENTS.md`; locked D-08]
- Browser artifacts must remain under ignored `.artifacts/` paths and never enter source or planning directories. [VERIFIED: `AGENTS.md`; `playwright.config.ts`]
- UI work must follow the approved UI contract: existing page bodies have a zero-visible-regression budget; only the quiet 404 and favicon are new visible surfaces. [VERIFIED: `04-UI-SPEC.md`]
- Phase 4 planning has Nyquist validation enabled and ASVS L1 security enforcement that blocks high-severity threats. [VERIFIED: `.planning/config.json`]

## Standard Stack

### Core

| Library / Platform | Version | Purpose | Why Standard |
|--------------------|---------|---------|--------------|
| Astro | 7.2.7 (already installed) | Static pages/layouts, `Astro.site`, `Astro.url`, static endpoint, 404 build and preview | This pinned version's installed source/types define the exact behavior Phase 4 depends on. [VERIFIED: `node_modules/astro/package.json`] |
| Native URL + `node:net.isIP` | Node 24.19.0 target | Parse/normalize origins and reject IP hosts | These platform APIs cover the required validation without another package. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/URL] [CITED: https://nodejs.org/api/net.html#netisipinput] |
| Native Astro head markup | Astro 7.2.7 | Title, description, canonical, Open Graph, Twitter, robots, favicon | A local layout makes exact output visible and testable; no SEO wrapper is justified. [VERIFIED: locked D-01 and D-19] |
| Static SVG | SVG 2 browser platform | One local favicon | A square, finite `viewBox` and simple local geometry meet the locked asset contract without image tooling or runtime. [CITED: https://developer.mozilla.org/en-US/docs/Web/SVG] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@astrojs/sitemap` [ASSUMED pending slopcheck] | 3.7.3, published 2026-05-26 | Route-derived sitemap index and numbered sitemap output | Always in Phase 4; call `sitemap()` with no custom page list or route filter. [CITED: https://docs.astro.build/en/guides/integrations-guide/sitemap/] [CITED: https://registry.npmjs.org/@astrojs/sitemap/3.7.3] |
| `@playwright/test` | 1.62.1 (already installed) | Rendered/status/network/XML/text/UI checks | Extend the existing production-discovery project and preview server lifecycle. [VERIFIED: `package.json`; `playwright.config.ts`] |
| `@axe-core/playwright` | 4.13.0 (already installed) | Serious/critical accessibility regression checks | Use on the new 404 and re-enable the document-title rule on existing routes after metadata exists. [VERIFIED: `package.json`; `tests/discovery.spec.ts`] |
| Node test runner | Node 24.19.0 target | Pure origin acceptance/rejection tests | Add one small `tests/site-origin.test.ts`; no new test framework. [CITED: https://nodejs.org/api/test.html] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Programmatic launch wrapper | Parse `process.argv` for `--mode launch-readiness` in `astro.config.mjs` | Parsing CLI arguments couples policy to invocation spelling because Astro 7.2.7 does not pass `mode` into a user config factory. Do not use it. [VERIFIED: installed Astro 7.2.7 config loader/types] |
| `robots.txt.ts` | `public/robots.txt` | A public text file would hard-code the host and can disagree with the normalized `Astro.site`; locked D-13 requires the generated endpoint. [CITED: https://docs.astro.build/en/guides/integrations-guide/sitemap/#sitemap-link-in-robotstxt] |
| Official sitemap integration | Hand-written XML or route list | A second URL registry can omit new pages or expose removed/draft pages; locked D-12 forbids it. [VERIFIED: locked D-12] |
| Native head markup | SEO/meta package | Another dependency hides a small deterministic tag set and creates no value for the locked text-only metadata. [VERIFIED: locked D-19] |
| SVG favicon | PNG/ICO asset pipeline | Raster variants would add tooling and multiple files while the approved contract requires only one SVG. [VERIFIED: locked D-16; `04-UI-SPEC.md`] |

**Installation:**

```bash
# Run only after selecting the repository's exact Node/npm versions and the
# package-legitimacy human checkpoint described below.
npm install --save-exact @astrojs/sitemap@3.7.3
```

The official docs also offer `npx astro add sitemap`, but the minimal manual install is preferable because the integration/config changes are phase work and the package version must stay exact. [CITED: https://docs.astro.build/en/guides/integrations-guide/sitemap/#manual-install]

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | postinstall | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-------------|-----------|-------------|
| `@astrojs/sitemap` [ASSUMED] | npm 3.7.3; published 2026-05-26 | Package line created 2022-03-18 | 2,642,230 downloads for 2026-08-20 through 2026-08-26 | `github.com/withastro/astro`, package directory `packages/integrations/sitemap`; npm provenance enabled | None declared | Unavailable: active Python 3.11 has no `pip`, so the required tool could not be installed | Flagged for one `checkpoint:human-verify` before install; official docs/source/registry all agree on identity and version. [CITED: https://registry.npmjs.org/@astrojs/sitemap/3.7.3] [CITED: https://github.com/withastro/astro/blob/%40astrojs/sitemap%403.7.3/packages/integrations/sitemap/package.json] |

**Packages removed due to slopcheck [SLOP] verdict:** none; slopcheck did not run. [VERIFIED: environment probe]

**Packages flagged as suspicious [SUS]:** none received a `[SUS]` verdict; `@astrojs/sitemap` remains `[ASSUMED]` solely because graceful-degradation rules require a human checkpoint when slopcheck is unavailable. [VERIFIED: environment probe]

The registry check succeeded in the correct ecosystem, the package has no `postinstall` script, and the exact npm repository/homepage match Astro's official integration documentation. These facts reduce risk but do not override the mandatory `[ASSUMED]` disposition without slopcheck. [CITED: https://docs.astro.build/en/guides/integrations-guide/sitemap/] [CITED: https://registry.npmjs.org/@astrojs/sitemap/3.7.3]

## Architecture Patterns

### System Architecture Diagram

```text
Explicit local build ────────────────┐
  fixed 127.0.0.1:4322              │
                                     ▼
Explicit launch command       astro.config.mjs ───────────────┐
  SITE_ORIGIN                  site + trailingSlash + sitemap │
       │                              │                        │
       ▼                              ▼                        │
site-origin validator ──────► normalized Astro.site            │
  HTTPS/root/no-host poison          │                        │
                                      ├──► prerendered routes  │
registries/frontmatter ─► page props ─┤      │                 │
                                      │      ▼                 │
Astro.url.pathname ──────────────────►│ SiteLayout head        │
                                      │  title/description     │
                                      │  canonical/social      │
                                      │  favicon/noindex       │
                                      │      │                 │
                                      │      ▼                 │
                                      │ static HTML + 404.html │
                                      │                        │
generated page routes ───────────────►│ @astrojs/sitemap       │
                                      │  sitemap-index.xml     │
                                      │  sitemap-0.xml         │
                                      │                        │
normalized Astro.site ───────────────►│ robots.txt endpoint    │
                                      │                        │
public/favicon.svg ──────────────────►┘                        │
                                                               ▼
                                  dist/ served by astro preview/static host
                                      │
                                      ├──► browser/user
                                      └──► crawler
```

The build is the only trust boundary that creates absolute identity. No request `Host`/`X-Forwarded-Host`, page frontmatter field, content string, or client script participates in origin selection. [VERIFIED: locked D-05 through D-08]

### Recommended Project Structure

```text
astro.config.mjs                         # fixed local site; mdx + sitemap integrations
scripts/
└── launch-ready.mjs                     # validate SITE_ORIGIN, call build({ site })
src/
├── layouts/
│   └── SiteLayout.astro                 # typed page identity + every head tag
├── lib/
│   └── site-origin.ts                   # local constant + pure production validator
├── pages/
│   ├── index.astro                      # maintained homepage identity facts
│   ├── [section]/index.astro            # section registry identity facts
│   ├── [section]/[slug].astro           # article frontmatter identity/type
│   ├── عن-أحمد-المنجاوي.astro           # maintained author identity facts
│   ├── 404.astro                         # noindex recovery surface
│   └── robots.txt.ts                     # static endpoint from context.site
public/
└── favicon.svg                           # inert two-color open-page geometry
tests/
├── site-origin.test.ts                   # pure trust-boundary table tests
├── discovery.spec.ts                     # existing independent route/body oracle
└── search-discovery.spec.ts              # dedicated head/XML/text/404/favicon suite
```

This split keeps each concern at one boundary and adds no reusable abstraction beyond the origin validator and the already-shared document layout. [VERIFIED: current repository structure; locked D-17]

### Pattern 1: Explicit Local Config, Validated Launch Override

**What:** Keep `astro.config.mjs` an ordinary object with `site` set to the fixed verification origin. A small launch entry point requires `process.env.SITE_ORIGIN`, validates and normalizes it, then invokes Astro's exported `build({ site })`, whose inline config overrides the local value for that build. [VERIFIED: installed `astro@7.2.7` `build()`/config merge source]

**Why:** Normal development/tests stay deterministic even if a developer has an unrelated `SITE_ORIGIN` in the shell, while launch-readiness cannot fall back to localhost. The wrapper uses the process environment directly and does not call Vite `loadEnv()`. [VERIFIED: locked D-06 through D-08]

**Validator contract:**

1. Reject a missing/non-string/empty value before URL construction. [VERIFIED: locked D-06]
2. Reject surrounding whitespace rather than silently repairing it. [ASSUMED: recommended strictness]
3. Parse with `new URL(raw)` and require `protocol === "https:"`. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/URL/URL]
4. Require empty username/password and reject any raw `@`; require `pathname === "/"`; require empty search/hash and reject raw `?`/`#` so even empty delimiters cannot survive URL parsing unnoticed. [VERIFIED: locked D-07; WHATWG behavior verified in Node 24]
5. Lowercase through URL normalization; reject a trailing-dot hostname; strip IPv6 brackets only for `isIP()` checking; reject IPv4/IPv6. [CITED: https://nodejs.org/api/net.html#netisipinput] [ASSUMED: strict trailing-dot rejection]
6. Reject the special-use single-label roots `localhost`, `test`, `invalid`, and `example` plus all their subdomains; also reject `example.com`, `example.net`, `example.org` and their subdomains. [CITED: https://www.rfc-editor.org/rfc/rfc2606] [CITED: https://www.rfc-editor.org/rfc/rfc6761]
7. Return `url.origin`; do not return the untrusted input or a per-page repaired value. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/URL/origin]

Do not reject an explicit HTTPS port unless the locked specification is amended: D-07 does not forbid ports, and a port is part of a valid URL origin. [VERIFIED: locked D-07] The production host choice and canonical-host redirect policy remain Phase 5. [VERIFIED: deferred scope]

### Pattern 2: Discriminated Shared Page Identity

**What:** Give `SiteLayout.astro` a prop union that makes indexable identity and 404 identity mutually explicit. Indexable props require `title`, `description`, and `ogType`; the non-indexable branch requires `indexable: false` and cannot accept URL/type fields. [VERIFIED: locked D-01 and discretion]

**When to use:** Every route uses this layout; page files derive values from the already-maintained registry/frontmatter/copy and do not pass a canonical URL. [VERIFIED: current code; locked D-02 and D-03]

**Canonical rule:** Guard that `Astro.site` exists, then calculate exactly `new URL(Astro.url.pathname, Astro.site).href`. Astro documents this exact canonical construction, and directory builds with trailing-slash behavior produce the current route pathname with its slash. [CITED: https://docs.astro.build/en/reference/api-reference/#url] [CITED: https://docs.astro.build/en/reference/configuration-reference/#buildformat]

In `.astro` pages/layouts, `Astro.site` and `Astro.url` are globals. In `.ts` endpoints, the same `site: URL | undefined` and current `url: URL` values arrive through `APIContext`; robots must use `site`, not the endpoint request URL's origin, so every absolute crawler URL remains tied to the validated config. [CITED: https://docs.astro.build/en/reference/api-reference/#site] [CITED: https://docs.astro.build/en/guides/endpoints/#static-file-endpoints]

**Escaping rule:** Render metadata values through normal Astro expressions; never use `set:html` for registry/frontmatter strings. [CITED: https://docs.astro.build/en/reference/directives-reference/#sethtml]

**Minimal social rule:** Use only the fields locked in D-09/D-10. Skip optional article publication/update Open Graph timestamps in this phase because D-11 permits but does not require them, and the minimal complete identity already satisfies the phase. [VERIFIED: locked D-11; Ponytail/YAGNI constraint]

### Pattern 3: Route-Derived Discovery Without a Second Filter

**What:** Add `sitemap()` after `mdx()` in the integration list and configure no `customPages`, `serialize`, or route filter. Version 3.7.3 gathers resolved page routes/build pages, discards endpoints/redirects, automatically ignores 404/500 status pages, de-duplicates, sorts URL data, and applies directory trailing slashes. [CITED: https://github.com/withastro/astro/blob/%40astrojs/sitemap%403.7.3/packages/integrations/sitemap/src/index.ts] [CITED: https://github.com/withastro/astro/blob/%40astrojs/sitemap%403.7.3/packages/integrations/sitemap/src/generate-sitemap.ts]

**Output names:** The default `filenameBase` is `sitemap`; even this eight-route site gets `sitemap-index.xml` and `sitemap-0.xml`. Robots must point to the index, not directly to the numbered URL set. [CITED: https://docs.astro.build/en/guides/integrations-guide/sitemap/]

**404 behavior:** No custom filter is needed in pinned 3.7.3 because its `STATUS_CODE_PAGES` contains `404` and `500`; a regression test should still enforce exclusion. [CITED: https://github.com/withastro/astro/blob/%40astrojs/sitemap%403.7.3/packages/integrations/sitemap/src/index.ts]

**Draft behavior:** The integration can only omit drafts if production route generation omits them. Preserve `getPublicArticles()` and verify against raw source independently; robots is not draft protection. [VERIFIED: `src/pages/[section]/[slug].astro`; locked D-14]

### Pattern 4: Static Machine Endpoints and Error Asset

**Robots:** `src/pages/robots.txt.ts` is a static file endpoint. Astro removes the `.ts` suffix and runs `GET` at build time; file-extension endpoints are requested without a trailing slash regardless of `trailingSlash`. [CITED: https://docs.astro.build/en/guides/endpoints/#static-file-endpoints] Return `text/plain; charset=utf-8`, the two crawler policy lines, one blank line, and exactly one `Sitemap: ${new URL("sitemap-index.xml", site).href}` line. [CITED: https://docs.astro.build/en/guides/integrations-guide/sitemap/#sitemap-link-in-robotstxt]

**404:** `src/pages/404.astro` always builds to `dist/404.html`, including directory builds. Astro's static preview plugin reads that file and responds with status 404 when the Vite fallback handles a missing route. [CITED: https://docs.astro.build/en/basics/astro-pages/#custom-404-error-page] [VERIFIED: `node_modules/astro/dist/core/output-filename.js`; `node_modules/astro/dist/core/preview/vite-plugin-astro-preview.js`]

**Preview caveat:** With `trailingSlash: "always"`, `astro preview` short-circuits a missing pathname that lacks a trailing slash and emits Astro's generic 404 template instead of `dist/404.html`; a missing path that respects the established slash contract reaches the custom file with status 404. [VERIFIED: `node_modules/astro/dist/core/preview/vite-plugin-astro-preview.js`] Test two unrelated slash-form missing paths for the locked Arabic recovery surface, and separately assert a slashless missing path is still status 404 without claiming its body is the custom page. Host-level canonical slash redirects/behavior belong to Phase 5. [VERIFIED: locked trailing-slash contract and deferred deployment scope]

**Favicon:** Place the SVG in `public/` and link it exactly once as `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`. Use a finite square `viewBox`, local `<path>` geometry, cream fill, and green stroke only. [VERIFIED: `04-UI-SPEC.md`] Google requires a crawlable, stable, square favicon and supports root-relative favicon URLs. [CITED: https://developers.google.com/search/docs/appearance/favicon-in-search]

### Anti-Patterns to Avoid

- **Config factory assumption:** `defineConfig(({ command, mode }) => ...)` is a Vite-shaped pattern that Astro 7.2.7 does not type or invoke. Use the explicit launch wrapper. [VERIFIED: installed Astro config types/loader]
- **Ambient environment controls local builds:** Reading `SITE_ORIGIN` directly in `astro.config.mjs` makes ordinary verification depend on shell state. Keep local config fixed and override only through launch entry point. [VERIFIED: locked D-06]
- **Canonical from request origin:** `Astro.url.origin` can be localhost when `site` is absent and request-derived origins can be poisonable in runtime architectures. Use only the validated `Astro.site` plus pathname. [CITED: https://docs.astro.build/en/reference/api-reference/#url]
- **Sitemap filter duplicating 404/public routes:** Pinned integration already excludes 404 and the public selector already excludes drafts; another list/filter can drift. Test the output instead. [VERIFIED: pinned integration source; locked D-12]
- **`Disallow` as secrecy:** Robots directives are crawler hints, not access control; absent drafts must not build. [CITED: https://developers.google.com/search/docs/crawling-indexing/robots/intro]
- **Active SVG features:** Do not permit scripts, event attributes, `foreignObject`, external references, `<image>`, `<use>`, animation, CSS `url()`, fonts, or data/HTTP URLs. [CITED: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/script]
- **Soft 404:** Do not create a catch-all page that returns 200 or redirect missing routes home. Use Astro's special 404 output and assert response status. [CITED: https://docs.astro.build/en/basics/astro-pages/#custom-404-error-page]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sitemap enumeration/XML/index splitting | Custom route walker and XML writer | `@astrojs/sitemap@3.7.3` [ASSUMED pending slopcheck] | It receives Astro's generated routes, handles URL de-duplication/trailing slash/index files, and excludes status pages. [CITED: pinned official source] |
| URL parsing/normalization | Host/protocol regex | WHATWG `URL` plus explicit policy and `node:net.isIP` | Regex misses credentials, IPv6, encoded forms, default ports, and normalized hostname behavior. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/URL/URL] |
| SEO abstraction | Meta component library/schema builder | One typed shared Astro layout | The required tag set is small, static, and must remain inspectable. [VERIFIED: locked D-01 and D-19] |
| `robots.txt` templating package | robots generator dependency | Static Astro endpoint + `Response` | The output is four deterministic lines and Astro supplies `site` at build time. [CITED: official Astro sitemap docs] |
| XML dependency for tests | Third-party parser | Browser `DOMParser` inside Playwright | The existing browser test stack can parse XML and detect parser errors without a package. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/DOMParser] |
| Favicon generator/sanitizer | Image pipeline or runtime sanitizer | Tiny reviewed allowlisted SVG source + tests | The asset is local, fixed, geometric, and has no user input. [VERIFIED: locked D-16] |

**Key insight:** The route graph, origin, and page identity already exist at build time. Planning should connect those boundaries and test their agreement, not introduce parallel registries or runtime services. [VERIFIED: current architecture and locked decisions]

## Common Pitfalls

### Pitfall 1: Treating Astro Config Like Vite Config

**What goes wrong:** A callback expects `{ command, mode }`, but Astro's `defineConfig` accepts an object and its loader never calls the export. Launch validation silently cannot distinguish modes or fails config loading. [VERIFIED: installed Astro 7.2.7 config types/loader]

**How to avoid:** Put launch intent in `scripts/launch-ready.mjs`; validate `process.env.SITE_ORIGIN`, then call `build({ site })`. Keep ordinary config local. [VERIFIED: installed Astro public `build` export]

**Warning signs:** Type errors on the callback, `command`/`mode` undefined, or localhost canonicals after `npm run launch:ready`. [VERIFIED: derived from pinned behavior]

### Pitfall 2: Origin Validation That Parses but Does Not Enforce Policy

**What goes wrong:** `new URL()` accepts credentials, paths, query/fragment, IP literals, localhost, and reserved hosts that are syntactically valid but unsafe for launch identity. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/URL]

**How to avoid:** Validate every locked field and hostname class, normalize once to `.origin`, and table-test valid/invalid cases. [VERIFIED: locked D-07]

**Warning signs:** Canonicals containing `@`, `?`, `#`, `/subpath`, `127.0.0.1`, `[::1]`, `localhost`, or `example.*`. [VERIFIED: locked D-07]

### Pitfall 3: Shared-Bug False Confidence

**What goes wrong:** Route generation, sitemap expectations, and tests all import `getPublicArticles()`, so one selector bug can expose a draft while every layer agrees. [VERIFIED: locked D-14]

**How to avoid:** Retain the existing independent filesystem/frontmatter oracle and compare its approved set and excluded identifiers to generated files, rendered anchors, canonical/social values, sitemap XML, and robots text. [VERIFIED: `tests/discovery.spec.ts`]

**Warning signs:** Expected routes in tests are imported from application selectors rather than parsed from raw files. [VERIFIED: derived test-design risk]

### Pitfall 4: Assuming `sitemap.xml` or Filtering 404 Manually

**What goes wrong:** Robots points at a nonexistent `sitemap.xml`, or a brittle hostname/path filter duplicates behavior already present in 3.7.3. [CITED: official sitemap docs and pinned source]

**How to avoid:** Point robots to `sitemap-index.xml`; parse that index to discover/verify `sitemap-0.xml`; use plain `sitemap()`. [CITED: https://docs.astro.build/en/guides/integrations-guide/sitemap/]

**Warning signs:** `filter()` in config, a hard-coded route array, or tests only reading one assumed XML filename. [VERIFIED: derived from pinned output contract]

### Pitfall 5: Confusing Static 404 File With Universal Host Semantics

**What goes wrong:** The file exists, but tests check only body content or only `/404/`; missing routes might be soft-404s or preview can serve a generic template for slash-invalid paths. [VERIFIED: installed Astro preview source]

**How to avoid:** Request unrelated missing paths that conform to the established trailing-slash route contract, assert status and exact custom body, assert `/404` is not in sitemap, and record the slashless preview behavior separately. [VERIFIED: pinned source; locked acceptance]

**Warning signs:** `page.goto()` result status is not asserted, a redirect is accepted, or the test uses `/404/` instead of a genuinely unknown path. [VERIFIED: test-design principle]

### Pitfall 6: Metadata Drift or Duplicate Tags

**What goes wrong:** Page title, description, canonical, `og:*`, and Twitter fields come from separate strings; the layout or page adds duplicates. [VERIFIED: locked D-01/D-09/D-10]

**How to avoid:** Build one normalized page identity in layout frontmatter and render each selector exactly once; compare values for equality, not mere presence. [CITED: https://ogp.me/]

**Warning signs:** More than one canonical/description/title, page files contain canonical URLs, or `og:url` differs from canonical. [VERIFIED: locked acceptance]

### Pitfall 7: Unsafe or Decorative SVG Growth

**What goes wrong:** A harmless-looking favicon gains remote image/font references, scripts/events, filters, animation, or an unclipped shape that fails at 16px. [CITED: MDN SVG element references; `04-UI-SPEC.md`]

**How to avoid:** Use a tiny element/attribute allowlist, parse it as SVG in-browser, prohibit active/external constructs, verify the square viewBox/content type, and capture 16px/32px evidence under `.artifacts/`. [VERIFIED: approved UI evidence contract]

**Warning signs:** `href`, `url(`, `data:`, `http`, `<script>`, `<style>`, `<foreignObject>`, `<image>`, `<use>`, `<animate>`, or event attributes. [CITED: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/script]

## Code Examples

These are implementation patterns, not additional scope.

### Pure Production-Origin Validator

```ts
// src/lib/site-origin.ts
// Sources: WHATWG URL + Node net.isIP
// https://developer.mozilla.org/en-US/docs/Web/API/URL/URL
// https://nodejs.org/api/net.html#netisipinput
import { isIP } from "node:net";

export const LOCAL_SITE_ORIGIN = "http://127.0.0.1:4322";

const RESERVED_ROOTS = [
  "localhost",
  "test",
  "invalid",
  "example",
  "example.com",
  "example.net",
  "example.org",
];

function isHostOrSubdomain(hostname: string, root: string): boolean {
  return hostname === root || hostname.endsWith(`.${root}`);
}

export function productionSiteOrigin(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0 || raw !== raw.trim()) {
    throw new Error("SITE_ORIGIN must be an explicit clean HTTPS origin");
  }

  const url = new URL(raw);
  const hostname = url.hostname.replace(/^\[|\]$/gu, "");
  const reserved = RESERVED_ROOTS.some((root) =>
    isHostOrSubdomain(hostname, root),
  );

  if (
    url.protocol !== "https:" ||
    raw.includes("@") ||
    raw.includes("?") ||
    raw.includes("#") ||
    url.username !== "" ||
    url.password !== "" ||
    url.pathname !== "/" ||
    url.search !== "" ||
    url.hash !== "" ||
    url.hostname.endsWith(".") ||
    isIP(hostname) !== 0 ||
    reserved
  ) {
    throw new Error("SITE_ORIGIN is not a safe production origin");
  }

  return url.origin;
}
```

Use table tests for all rejection branches and normalization; do not add a class or configuration object for one validator. [VERIFIED: locked discretion; Ponytail constraint]

### Deterministic Config and Launch Wrapper

```js
// astro.config.mjs
// Source: https://docs.astro.build/en/reference/configuration-reference/#site
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { LOCAL_SITE_ORIGIN } from "./src/lib/site-origin.ts";
import { preflightArticleSources } from "./src/lib/mdx-policy.ts";

preflightArticleSources(new URL("./src/content/articles/", import.meta.url));

export default defineConfig({
  site: LOCAL_SITE_ORIGIN,
  output: "static",
  trailingSlash: "always",
  integrations: [mdx(), sitemap()],
});
```

```js
// scripts/launch-ready.mjs
// Source: installed astro@7.2.7 public build export
import { build } from "astro";
import { productionSiteOrigin } from "../src/lib/site-origin.ts";

const site = productionSiteOrigin(process.env.SITE_ORIGIN);
await build({ site });
```

```json
{
  "scripts": {
    "launch:ready": "node scripts/launch-ready.mjs"
  }
}
```

This wrapper replaces the ineffective `astro build --mode launch-readiness` distinction; it does not load `.env` files. [VERIFIED: installed config behavior; locked D-08]

### Shared Metadata Branch

```astro
---
// src/layouts/SiteLayout.astro
// Source: https://docs.astro.build/en/reference/api-reference/#url
type Props =
  | {
      title: string;
      description: string;
      indexable?: true;
      ogType: "website" | "article";
    }
  | {
      title: string;
      description: string;
      indexable: false;
    };

const page = Astro.props;
if (!Astro.site) throw new Error("Astro.site must be configured");
const canonical =
  page.indexable === false
    ? undefined
    : new URL(Astro.url.pathname, Astro.site).href;
---

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{page.title}</title>
  <meta name="description" content={page.description} />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  {
    page.indexable === false ? (
      <meta name="robots" content="noindex,follow" />
    ) : (
      <>
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content={page.ogType} />
        <meta property="og:site_name" content="مدونة أحمد المنجاوي" />
        <meta property="og:locale" content="ar_AR" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={page.title} />
        <meta name="twitter:description" content={page.description} />
      </>
    )
  }
</head>
```

The Open Graph protocol requires a `language_TERRITORY` locale shape; `ar_AR` is the recommended generic-Arabic platform convention here but could not be verified from a current authoritative Meta locale registry in this session. [CITED: https://ogp.me/] [ASSUMED] Record it as the one human-confirmable metadata literal; it does not affect URL integrity. [ASSUMED]

### Static Robots Endpoint

```ts
// src/pages/robots.txt.ts
// Source: https://docs.astro.build/en/guides/integrations-guide/sitemap/#sitemap-link-in-robotstxt
import type { APIRoute } from "astro";

export const GET = (({ site }) => {
  if (!site) throw new Error("Astro.site must be configured");
  const sitemap = new URL("sitemap-index.xml", site).href;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}) satisfies APIRoute;
```

### Minimal 404 and Favicon Geometry

```astro
---
import SiteLayout from "../layouts/SiteLayout.astro";
---

<SiteLayout
  title="الصفحة غير موجودة | مدونة أحمد المنجاوي"
  description="تعذر العثور على الصفحة المطلوبة."
  indexable={false}
>
  <h1>الصفحة غير موجودة</h1>
  <p>تعذر العثور على الصفحة المطلوبة.</p>
  <a class="recovery" href="/">العودة إلى الصفحة الرئيسية</a>
</SiteLayout>

<style>
  h1 { margin-block: 0 1rem; }
  p { margin-block: 0 1.5rem; }
  .recovery {
    display: inline-flex;
    align-items: center;
    min-block-size: 44px;
    min-inline-size: 44px;
  }
</style>
```

```svg
<!-- public/favicon.svg; geometry may vary within the locked contract -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M4 7c4-1 8 0 12 3v17c-4-3-8-4-12-3V7Z" fill="#FFFDF8" stroke="#166534" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M28 7c-4-1-8 0-12 3v17c4-3 8-4 12-3V7Z" fill="#FFFDF8" stroke="#166534" stroke-width="2.5" stroke-linejoin="round"/>
</svg>
```

The 404 spacing, native anchor behavior, 44px target, logical properties, inherited focus style, and no decorative additions are locked by `04-UI-SPEC.md`. [VERIFIED: `04-UI-SPEC.md`]

## State of the Art

| Old/Incorrect Approach | Current Pinned Approach | When/Version | Impact |
|------------------------|-------------------------|--------------|--------|
| Assume a single `sitemap.xml` | `sitemap-index.xml` links numbered files beginning at `sitemap-0.xml` | `@astrojs/sitemap` 3.7.3 [ASSUMED pending slopcheck] | Robots/tests must name and parse the index and numbered URL set. [CITED: official sitemap docs] |
| Manually filter `/404/` | Integration source automatically excludes status pathnames `404` and `500` | Verified in 3.7.3 source | Use `sitemap()` without duplicative URL logic; preserve regression tests. [CITED: pinned official source] |
| Treat `Astro.url` as always request-host-derived | Prerendered `Astro.url` uses configured `site`/`base`; `Astro.site` is the parsed config URL | Current Astro API docs/7.2.7 | Canonical construction is deterministic during build when `site` is mandatory. [CITED: official Astro API docs] |
| Assume `404.astro` becomes a directory route | Astro special-cases it to `404.html` | Current Astro/7.2.7 | Static preview/hosts can use one conventional error file. [VERIFIED: installed output source] |
| Use a config callback for mode | Astro 7.2.7 config is a loaded object; command exists on integration hooks, mode on inline build config | Astro 7.2.7 | Launch intent needs an explicit wrapper or supported inline config, not a Vite config factory. [VERIFIED: installed source/types] |

**Deprecated/outdated for this phase:**

- `astro build --mode launch-readiness` as the sole safety boundary: the mode changes build/Vite mode but is not delivered to a user config factory, so it cannot by itself require `SITE_ORIGIN`. [VERIFIED: installed Astro 7.2.7 source]
- A static `public/robots.txt` recommendation in early project research: locked D-13 supersedes it with a site-derived endpoint. [VERIFIED: `04-CONTEXT.md` precedence]
- JSON-LD/social images from early architecture research: the phase specification explicitly defers both. [VERIFIED: `04-SPEC.md` and deferred context]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Use `og:locale="ar_AR"` as the generic Arabic Open Graph locale literal. The OGP format is verified, but the exact current Meta-supported Arabic literal was not verified from an authoritative locale registry. [ASSUMED] | Shared Metadata Branch | Low: social locale interpretation could be ignored/misclassified; canonical, title, description, sitemap, and crawling remain correct. Planner should add one human literal-confirmation checkpoint or lock the user-approved default. |
| A2 | Reject leading/trailing whitespace in `SITE_ORIGIN` rather than trimming it. [ASSUMED] | Origin validator | Low: an otherwise valid copied origin with whitespace fails; this is intentionally fail-closed and easy to correct. |
| A3 | Reject a trailing-dot hostname rather than normalizing it away. [ASSUMED] | Origin validator | Low: a technically valid fully-qualified form fails; the safer clean-origin spelling is unambiguous and easy to supply. |

## Open Questions

1. **Exact Open Graph Arabic locale literal**
   - What we know: D-09 requires an Arabic locale, and OGP specifies `language_TERRITORY`. [CITED: https://ogp.me/]
   - What's unclear: A current authoritative Meta registry for the generic Arabic literal was not accessible; the historical/common `ar_AR` convention remains [ASSUMED].
   - Recommendation: Lock `ar_AR` for this phase unless the owner explicitly prefers a territorial Arabic locale; keep the test literal in one constant/expectation. [ASSUMED]

2. **No-slash missing paths in local preview**
   - What we know: With `trailingSlash: "always"`, pinned `astro preview` returns status 404 but uses a generic template before its custom-404 fallback for a no-slash path. [VERIFIED: installed Astro preview source]
   - What's unclear: Nothing in Phase 4 code can make every static host implement the same slash normalization without deployment configuration, which is deferred. [VERIFIED: phase boundary]
   - Recommendation: Treat slash-form URLs as the Phase 4 route contract, prove the Arabic custom response on multiple slash-form unknown routes, assert slashless status remains 404, and assign production redirect/fallback parity to Phase 5. [VERIFIED: locked trailing-slash/deployment boundaries]

No other planning decision is open; titles, descriptions, metadata fields, 404 copy, favicon palette, sitemap policy, test boundaries, and exclusions are locked. [VERIFIED: `04-CONTEXT.md`; `04-UI-SPEC.md`]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Project-selected Node | Builds/tests/install | Available but default shell is wrong | Default `v24.8.0`; required `v24.19.0`; bundled workspace Node is `v24.19.0` | Use/select the bundled exact Node or install/select `.nvmrc` version before mutation. [VERIFIED: environment probe; `.nvmrc`] |
| Project-selected npm | Package install/lockfile | Available but wrong | Default `11.12.1`; required `11.17.0`; no nvm/fnm/Volta detected | Select/install npm 11.17.0 under Node 24.19.0 before `npm install`. [VERIFIED: environment probe; `package.json`] |
| Astro CLI | Build/preview | Yes | 7.2.7 | — [VERIFIED: `npx astro --version`] |
| Playwright test | Browser validation | Yes | 1.62.1 with matching Chromium 1234 installed | — [VERIFIED: environment probe; `package.json`] |
| `@astrojs/sitemap` | Sitemap output | No, intentionally not yet installed | Target 3.7.3 [ASSUMED pending slopcheck] | None; phase install required after checkpoint. [VERIFIED: `package.json`; npm registry] |
| Python `pip` / slopcheck | Package legitimacy automation | No | Active Python 3.11.14 has no `pip` module | Human verification checkpoint using official docs/source/registry evidence. [VERIFIED: environment probe] |
| `SITE_ORIGIN` | Launch-readiness only | Intentionally not inspected | Non-secret explicit future input | Controlled safe HTTPS fixture for Phase 4 launch test; real value supplied in Phase 5. [VERIFIED: locked D-06/D-08] |

**Missing dependencies with no fallback:**

- `@astrojs/sitemap@3.7.3` is required for implementation, but installation is blocked until the exact Node 24.19.0/npm 11.17.0 toolchain is selected because the repository's `preinstall` rejects the current defaults. [VERIFIED: `package.json`; environment probe]

**Missing dependencies with fallback:**

- slopcheck is unavailable; use the required human package-legitimacy checkpoint and retain `[ASSUMED]` provenance. [VERIFIED: environment probe]
- The default Node is wrong but the Codex workspace dependency bundle contains Node 24.19.0; npm 11.17.0 still must be selected. [VERIFIED: workspace dependency probe]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Native framework | Node `node:test`, target runtime 24.19.0; existing TypeScript test execution pattern. [VERIFIED: `package.json`] |
| Browser framework | `@playwright/test` 1.62.1 + `@axe-core/playwright` 4.13.0. [VERIFIED: `package.json`] |
| Config file | `playwright.config.ts`; existing production preview at `http://127.0.0.1:4322`, artifacts under `.artifacts/playwright/`. [VERIFIED: `playwright.config.ts`] |
| Quick native command | `npm test` after its explicit Node test file list includes `tests/site-origin.test.ts`. [VERIFIED: recommended minimal change] |
| Focused browser command | `npm run build && npx playwright test tests/search-discovery.spec.ts --project=production-discovery`. [VERIFIED: existing lifecycle + locked D-18] |
| Full suite command | `npm run verify`. [VERIFIED: `package.json`] |
| Launch acceptance command | PowerShell: `$env:SITE_ORIGIN='https://blog.ahmed-mangawy.org'; npm run launch:ready; Remove-Item Env:SITE_ORIGIN` using a controlled non-placeholder fixture that is never deployed. [ASSUMED fixture hostname; no network request occurs] |

Update the production-discovery project's `testMatch` to include both `discovery.spec.ts` and `search-discovery.spec.ts`; keep the one preview server and current artifact routing. [VERIFIED: locked D-17; `playwright.config.ts`]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Evidence | Failure Cases | File Exists? |
|--------|----------|-----------|-------------------|----------|---------------|-------------|
| SITE-06 | Unrelated slash-form missing routes return status 404, exact Arabic/RTL shell/copy, one main/H1, two native home anchors, noindex, no canonical/social, working home navigation | Browser + request + axe + no-JS + responsive | Focused browser command | Parsed response/status/DOM, focus styles/order, 320–1440 reflow, JS-disabled navigation, zero serious/critical axe findings | 200 soft 404, redirect, generic/English body, wrong copy, duplicate H1, missing link, overflow, script dependency | ❌ Wave 0 `tests/search-discovery.spec.ts` |
| SEO-02 | Eight indexable routes have exactly one non-empty Arabic title/description/H1 and titles/descriptions are unique | Browser + raw-source oracle | Focused browser command | Sets of route→title/description/H1 values; Arabic Unicode assertion; exact locked title patterns | Empty/English/duplicate tags or identity, hidden extra H1 | ❌ Wave 0 |
| SEO-03 | Canonical equals local-origin + exact route pathname; OG/Twitter fields exactly mirror identity; type is correct; launch origin validation fails closed | Native + build + browser | `npm test`; launch acceptance; focused browser | Validator tables; exact tag equality; absolute URL parse; no query/hash/foreign host; controlled launch dist host | Host poison, localhost launch, page override, divergent social strings, invented image/handle | ❌ Wave 0 native + browser |
| SEO-04 | Raw published source set equals generated HTML routes, canonical set, internal-link graph, and sitemap; every draft/proof identifier absent | Source/build/browser/XML comparison | `npm run verify` | Independent frontmatter oracle, dist file walk, anchors/status, XML URL set, negative corpus scan | Shared selector bug, broken internal link, draft/proof title/slug/video leak | ✅ Existing oracle; ❌ Phase 4 assertions |
| SEO-05 | Sitemap index and numbered URL file exist and exactly equal canonical published routes; robots has exact allow policy and one matching absolute sitemap line | Request + XML DOM parse + text parse | Focused browser command | XML parser-error check, exact `<loc>` sets, content types/status, exact normalized robots lines | `sitemap.xml` assumption, missing/extra/404/draft URL, wrong host/slash, duplicate sitemap line, `Disallow` misuse | ❌ Wave 0 |

### Major Decisions → Verification Map

| Decision | Minimum Check | Failure Evidence |
|----------|---------------|------------------|
| D-01 | Source check: only `SiteLayout.astro` emits canonical/OG/Twitter/favicon/robots meta; every page passes typed identity. | Duplicate head markup in page files or build/type failure. [VERIFIED: decision contract] |
| D-02 | Exact route-family title matrix across all indexable routes and 404. | Any title mismatch/duplicate/non-Arabic value. [VERIFIED: decision contract] |
| D-03 | Description equals exact existing intro/registry/frontmatter/author copy; 404 exact sentence. | Parallel SEO copy or value drift. [VERIFIED: decision contract] |
| D-04 | Indexable pages: one canonical and no robots meta; 404: exactly `noindex,follow`, no canonical/social. | Explicit `index,follow`, share URL on 404, or missing noindex. [VERIFIED: decision contract] |
| D-05 | Canonical equals `new URL(path, expectedOrigin).href`; source forbids canonical prop/frontmatter. | Foreign host, query/hash, missing slash, content override. [VERIFIED: decision contract] |
| D-06 | Normal build outputs `127.0.0.1:4322`; launch command missing input fails and safe input succeeds. | Silent local fallback in launch or ambient prod origin in ordinary build. [VERIFIED: decision contract] |
| D-07 | Table-test HTTPS valid normalization and every rejected category, including IPv6 and reserved subdomains. | Any unsafe table row accepted. [VERIFIED: decision contract] |
| D-08 | Source scan contains no `loadEnv`, dotenv package, or `.env` creation/read; launch wrapper reads process env only. | `.env` access or committed env artifact. [VERIFIED: decision contract] |
| D-09 | Exact equality of OG title/description/url; type matrix; site name/Arabic locale once. | Mismatched or duplicated property. [VERIFIED: decision contract] |
| D-10 | `summary`, mirrored title/description, and absence of Twitter image/handle/account. | Invented Twitter identity or divergent copy. [VERIFIED: decision contract] |
| D-11 | Prefer no optional article timestamps; if planner includes them, exact validated frontmatter equality and no inferred claims. | Unvalidated/inferred date or credentials/review claim. [VERIFIED: decision contract] |
| D-12 | Plain `sitemap()` source config; parsed output excludes 404 and equals route oracle. | Custom URL list/filter or output mismatch. [VERIFIED: pinned source + decision] |
| D-13 | Exact robots line grammar/content type and one sitemap index URL from expected origin; no `Disallow`. | Host mismatch, duplicate line, security-through-robots. [VERIFIED: decision contract] |
| D-14 | Expected set comes from raw frontmatter parser, not application selector; negative proof identifiers checked in every output family. | All expectations reuse `getPublicArticles()`. [VERIFIED: decision contract] |
| D-15 | Exact DOM/copy/action plus zero new UI elements/client behavior; controlled-body comparison for existing routes. | Search/illustration/suggestions/button/card/script/visible body regression. [VERIFIED: UI contract] |
| D-16 | Every HTML has one same favicon link; SVG status/type/square viewBox/allowlist/no-active-content; 16px/32px captures. | Missing link, remote reference, active SVG, clipped/unreadable geometry. [VERIFIED: UI contract] |
| D-17 | One native file + one dedicated Playwright file; same server lifecycle/artifact root. | New framework/server or artifacts outside `.artifacts/`. [VERIFIED: decision contract] |
| D-18 | Browser script begins with a fresh build; metadata/XML/text parsed; rendered checks used only for visible states. | Stale dist, screenshots presented as metadata/status proof. [VERIFIED: decision contract] |
| D-19 | `npm run verify` green; source/network checks show no new client/remote/runtime package surface. | Existing regression or new JS/remote request/framework. [VERIFIED: decision contract] |

### Native Origin Test Matrix

The pure test table should include at least these classes. [VERIFIED: locked D-07]

| Class | Examples | Expected |
|-------|----------|----------|
| Valid normalized HTTPS | `https://blog.ahmed-mangawy.org`, trailing `/`, uppercase host, explicit default `:443` | Return one lowercase normalized `.origin`; default port removed by URL normalization. [CITED: WHATWG URL] |
| Missing/unclean | `undefined`, `""`, leading/trailing whitespace | Throw before accepted build output. [VERIFIED: D-06; whitespace [ASSUMED]] |
| Scheme | `http:`, `ftp:` | Throw. [VERIFIED: D-07] |
| Credentials | username, password, both | Throw. [VERIFIED: D-07] |
| URL state | non-empty or empty `?` query delimiter, non-empty or empty `#` fragment delimiter, `/path`, `/path/` | Throw. [VERIFIED: D-07; Node 24 URL probe] |
| Local/IP | `localhost`, `sub.localhost`, `127.0.0.1`, public IPv4, `[::1]`, public IPv6 | Throw. [VERIFIED: D-07] |
| Reserved | `example.com/.net/.org`, their subdomains, `.example`, `.invalid`, `.test` | Throw. [CITED: RFC 2606/6761] |
| Host normalization hazards | `localhost.`, `example.com.`, raw empty userinfo `@` | Throw. [ASSUMED: strict clean-origin policy] |
| Malformed | relative string, invalid URL, missing hostname | Throw. [CITED: WHATWG URL] |

### Browser/Data Parsing Requirements

1. Build the expected route/identity matrix from registries and the existing raw-frontmatter oracle, not from rendered output or `getPublicArticles()`. [VERIFIED: D-14]
2. Use Playwright locators for HTML tags and browser `DOMParser(..., "application/xml")` for sitemap documents; assert no `parsererror` before reading `<loc>`. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/DOMParser]
3. Treat URL sets as sets and separately assert no duplicate `<loc>` values; compare exact `.href` values, not decoded display strings. [VERIFIED: URL integrity requirement]
4. Parse robots into trimmed non-comment lines; require one `User-agent`, one `Allow`, one `Sitemap`, no `Disallow`, and exact final URL. [CITED: Google robots docs]
5. Parse SVG as `image/svg+xml`; assert no parser error, a finite square viewBox, only allowed element/attribute names/colors, no external/active content, and response `Content-Type`. [CITED: MDN DOMParser/SVG]

### Sampling Rate

- **Per task commit:** `npm test` for origin/helper tasks; `npm run check` for metadata prop wiring; focused browser command for output tasks. [VERIFIED: recommended task boundaries]
- **Per wave merge:** `npm run verify`. [VERIFIED: locked D-19]
- **Phase gate:** exact-runtime package install complete, native suite green, controlled safe launch build green, fresh local build/preview browser suite green, and full `npm run verify` green. [VERIFIED: locked acceptance]

### Wave 0 Gaps

- [ ] `tests/site-origin.test.ts` — pure acceptance/rejection/normalization and missing-launch-input tests for SEO-03/D-06/D-07. [VERIFIED: gap scan]
- [ ] `tests/search-discovery.spec.ts` — route identity, canonical/social parity, XML/text agreement, 404, favicon, no-JS, reflow, focus, accessibility, and negative proof checks. [VERIFIED: gap scan]
- [ ] `playwright.config.ts` production `testMatch` — include both discovery suites while retaining port 4322 and `.artifacts/`. [VERIFIED: current config]
- [ ] `package.json` native test file list — include the origin test; replace `launch:ready` with the explicit wrapper. [VERIFIED: current scripts]
- [ ] Existing axe suite — remove `.disableRules(["document-title"])` after every page has a title. [VERIFIED: `tests/discovery.spec.ts`]
- [ ] Exact Node 24.19.0/npm 11.17.0 selection and package-legitimacy human checkpoint before sitemap installation. [VERIFIED: environment/package audit]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No accounts, login, or identity boundary exists in this static phase. [VERIFIED: project constraints] |
| V3 Session Management | No | No cookies/session/runtime state is introduced. [VERIFIED: project constraints] |
| V4 Access Control | No for runtime authorization | Draft exclusion is publication integrity, not authorization; drafts must be absent from output rather than hidden by robots. [CITED: Google robots introduction] |
| V5 Input Validation | Yes | Pure fail-closed `SITE_ORIGIN` validation using WHATWG URL, explicit policy, `node:net.isIP`, and source/content schema boundaries. [CITED: MDN URL; Node net docs] |
| V6 Cryptography | No | No secrets, tokens, encryption, signing, or hashes are required. [VERIFIED: phase boundaries] |

### Threat Model

| Threat / Asset | STRIDE | Severity | Attack Path | Required Mitigation | Verification |
|----------------|--------|----------|-------------|---------------------|--------------|
| Canonical-host poisoning | Spoofing/Tampering | High | Malicious/mistyped build input supplies attacker/local/placeholder origin; all canonical, OG, sitemap, robots outputs inherit it | Explicit launch-only input; HTTPS/root/no-credential/no-query/no-fragment/no-local/no-IP/no-reserved validation; normalize once; layout/endpoint consume only `Astro.site` | Native invalid matrix + controlled launch crawl proving one host. [VERIFIED: D-05 through D-08] |
| Runtime Host/X-Forwarded-Host poisoning | Spoofing | High if runtime-derived | Code derives canonical from request host/origin | Static build only; never derive absolute identity from request headers or `Astro.url.origin`; use validated `Astro.site` | Source assertion and canonical equality. [CITED: Astro config security docs host-header discussion] |
| Draft/proof leakage | Information Disclosure | High for publication integrity | Draft selector accidentally generates a page, which sitemap then faithfully exposes | Preserve production selector; independent raw-source oracle; negative identifiers across dist/head/sitemap/robots; no robots secrecy | Full source/build/browser comparison. [VERIFIED: D-14] |
| Crawler-file mismatch | Tampering/Repudiation | Medium | Hard-coded robots host/file name diverges from actual sitemap/canonicals | Generate robots from `site`; parse both XML layers; exact set and one-line agreement | Focused browser parsing. [VERIFIED: D-13] |
| Metadata injection/XSS | Tampering/Elevation | High if raw HTML used | Article/registry strings containing markup enter head through raw HTML | Normal Astro expression escaping; no `set:html`; existing content validation; exact DOM counts | Source scan + hostile-character fixture/native build if present. [CITED: Astro directives docs] |
| Active/external SVG content | Elevation/Information Disclosure | High | Favicon contains script/event/foreignObject/external resource/data URI | Fixed local source; minimal SVG element/attribute allowlist; prohibit active/external constructs; no user input | XML parse, denylist/allowlist, network observation, source scan. [CITED: MDN SVG script docs] |
| Soft-404/indexing confusion | Spoofing | Medium | Missing route returns 200, redirect, canonical, or sitemap membership | Astro special 404 file; preview/host 404 status; `noindex,follow`; no canonical/social; integration status exclusion | Direct response + DOM/XML checks. [VERIFIED: pinned Astro source and D-04/D-15] |

### Security Planning Rules

- Treat any unsafe origin acceptance, draft/proof leak, raw metadata injection, or active/external SVG as a phase-blocking high-severity failure. [VERIFIED: `.planning/config.json` security policy]
- Do not claim robots protects non-public content; its only security-safe posture is transparency over already-public routes. [CITED: https://developers.google.com/search/docs/crawling-indexing/robots/intro]
- Do not add CSP, sanitizer, authentication, or runtime host allowlists solely for this phase; static output plus source allowlists remove those attack paths more simply. [VERIFIED: phase boundaries]
- Do not expose the rejected `SITE_ORIGIN` value in reader-facing HTML. Build errors may identify the failed rule but should not emit partial accepted output. [VERIFIED: D-06/D-07]

## Sources

### Primary (HIGH confidence)

- [Astro configuration reference](https://docs.astro.build/en/reference/configuration-reference/) — `site`, static output, `build.format`, trailing-slash effect on `Astro.url`. [CITED]
- [Astro API reference](https://docs.astro.build/en/reference/api-reference/#url) — `Astro.url`, prerendered origin behavior, exact canonical example; `Astro.site` URL/undefined contract. [CITED]
- [Astro static endpoints](https://docs.astro.build/en/guides/endpoints/#static-file-endpoints) — build-time `GET`, `Response`, `APIRoute`, file-extension route behavior. [CITED]
- [Astro custom 404](https://docs.astro.build/en/basics/astro-pages/#custom-404-error-page) — `src/pages/404.astro` builds to `404.html`. [CITED]
- [Official Astro sitemap guide](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — install/config, `site` requirement, exact output names, robots endpoint example, filter semantics. [CITED]
- [Pinned sitemap 3.7.3 integration source](https://github.com/withastro/astro/blob/%40astrojs/sitemap%403.7.3/packages/integrations/sitemap/src/index.ts) — route collection, status exclusion, URL normalization/de-duplication, page-only behavior. [CITED]
- [Pinned sitemap 3.7.3 writer](https://github.com/withastro/astro/blob/%40astrojs/sitemap%403.7.3/packages/integrations/sitemap/src/write-sitemap.ts) and [defaults](https://github.com/withastro/astro/blob/%40astrojs/sitemap%403.7.3/packages/integrations/sitemap/src/config-defaults.ts) — index/numbered file naming and entry limit. [CITED]
- Installed `astro@7.2.7` source/types: `node_modules/astro/dist/config/index.d.ts`, `core/config/vite-load.js`, `core/config/config.js`, `core/build/index.js`, `types/public/context.d.ts`, `core/output-filename.js`, `core/preview/vite-plugin-astro-preview.js` — exact pinned config, build URL, output, and preview semantics. [VERIFIED: local installed package]
- [Open Graph protocol](https://ogp.me/) — title/type/url/description/site-name/locale semantics and locale shape. [CITED]
- [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) — canonical and sitemap consistency. [CITED]
- [Google robots creation guidance](https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt) — robots grammar and fully qualified sitemap URL. [CITED]
- [Google favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search) — stable crawlable square favicon and head link. [CITED]
- [MDN URL](https://developer.mozilla.org/en-US/docs/Web/API/URL), [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser), and [SVG script](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/script) — platform parsing and active SVG surface. [CITED]
- [Node `net.isIP`](https://nodejs.org/api/net.html#netisipinput) and [Node test runner](https://nodejs.org/api/test.html) — IP validation and native tests. [CITED]
- [RFC 2606](https://www.rfc-editor.org/rfc/rfc2606) and [RFC 6761](https://www.rfc-editor.org/rfc/rfc6761) — reserved example/special-use hostnames. [CITED]

### Secondary (MEDIUM confidence)

- npm registry metadata for [`@astrojs/sitemap@3.7.3`](https://registry.npmjs.org/@astrojs/sitemap/3.7.3) and [npm weekly downloads API](https://api.npmjs.org/downloads/point/last-week/%40astrojs%2Fsitemap) — version, publication, source/homepage, dependencies/scripts, popularity. Package remains `[ASSUMED]` because slopcheck was unavailable. [CITED]
- `.planning/research/STACK.md` and `.planning/research/ARCHITECTURE.md` — prior stack/architecture conclusions, superseded where Phase 4 locked context is narrower. [VERIFIED: codebase]

### Tertiary (LOW confidence)

- `og:locale="ar_AR"` as the generic Arabic platform literal; OGP's format is verified, exact literal is [ASSUMED] pending human confirmation. [ASSUMED]

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH for existing Astro/platform/test stack; MEDIUM for adding official sitemap only because the mandatory slopcheck tool was unavailable. [VERIFIED: official docs/source/registry + audit]
- Architecture: HIGH — locked decisions match the installed Astro 7.2.7 source and current code boundaries. [VERIFIED: codebase + pinned source]
- Sitemap/robots: HIGH for behavior/output names; package identity remains procedurally `[ASSUMED]` until checkpoint. [CITED: pinned official source/docs]
- Static 404/preview: HIGH — installed preview/output source gives exact status/fallback behavior, including the no-slash caveat. [VERIFIED: installed source]
- Security: HIGH — threat paths and controls derive directly from explicit trust boundaries and ASVS L1 policy. [VERIFIED: config + phase decisions]
- Validation: HIGH — existing independent oracle, Playwright lifecycle, axe, artifacts, and commands are present; gaps are specific. [VERIFIED: test/config scan]

**Research date:** 2026-08-27

**Valid until:** 2026-09-26 for the pinned versions. Re-run registry/source checks if Astro or sitemap versions change. [ASSUMED: 30-day stable-version review window]
