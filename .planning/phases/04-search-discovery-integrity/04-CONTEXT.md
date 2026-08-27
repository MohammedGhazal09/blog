# Phase 4: Search Discovery Integrity - Context

**Gathered:** 2026-08-27
**Status:** Ready for UI specification and planning

<domain>
## Phase Boundary

Phase 4 gives the existing static Arabic route graph one consistent search identity and crawl policy: unique titles/descriptions, self-canonicals, accurate text social metadata, a route-derived sitemap, matching robots output, one local favicon, and an Arabic missing-route recovery page. It does not deploy the site, configure external services, add analytics, or certify production behavior.

</domain>

<spec_lock>
## Requirements (locked via SPEC.md)

**6 requirements are locked.** See `04-SPEC.md` for full requirements, boundaries, and acceptance criteria.

Downstream agents MUST read `04-SPEC.md` before planning or implementing. Requirements are not duplicated here.

**In scope (from SPEC.md):**

- One shared static metadata interface consumed by every public page family.
- Validated site-origin handling for local verification and fail-closed launch-readiness builds.
- Canonical, Open Graph, Twitter, robots, sitemap, and favicon output.
- One static Arabic/RTL 404 page with a home recovery link and noindex policy.
- Native and browser regression checks for metadata uniqueness, route/canonical equality, draft exclusion, discovery-file agreement, and missing-route behavior.

**Out of scope (from SPEC.md):**

- Selecting or purchasing a final domain, configuring a hosting provider, redirects, DNS, TLS, or proving a live origin — Phase 5 owns deployment.
- Google Search Console verification or sitemap submission — Phase 5 owns external search operations.
- Analytics, consent UI, or outbound-click measurement — Phase 5 owns measurement and its governance.
- Production crawl certification, native browser-chrome 200% zoom, live YouTube playback, or Core Web Vitals certification — Phase 6 owns production verification.
- JSON-LD, `Article`, `Person`, breadcrumbs, `VideoObject`, keywords metadata, rich-result work, or an invented social image — structured data is deferred by `SEO-07`, keywords are not a requirement, and no approved share image exists.
- English, alternate-language routes, locale switching, or `hreflang` — the product remains Arabic-only.

</spec_lock>

<decisions>
## Implementation Decisions

### Shared Page Identity

- **D-01:** Render every Phase 4 head field through the existing `SiteLayout.astro`; page routes supply maintained identity facts, while the layout owns markup, canonical derivation, social parity, robots behavior, and the favicon link.
- **D-02:** Use exact page-title composition: homepage `مدونة أحمد المنجاوي`; section `${section.label} | مدونة أحمد المنجاوي`; article `${article.data.title} | مدونة أحمد المنجاوي`; author `عن أحمد المنجاوي | مدونة أحمد المنجاوي`; 404 `الصفحة غير موجودة | مدونة أحمد المنجاوي`.
- **D-03:** Reuse existing maintained copy as descriptions: homepage introduction, section registry description, article frontmatter description, and author-page explanatory paragraph. The 404 uses a dedicated Arabic error description. Do not create a parallel SEO-copy registry.
- **D-04:** Indexable pages contain exactly one canonical and no explicit `index,follow` tag because that is the default. The 404 alone emits `noindex,follow` and omits canonical and social URL identity.

### Origin and Canonical Policy

- **D-05:** Make `Astro.site` the sole absolute-origin source. Construct canonicals from the current pathname against that origin, retaining the established trailing slash and dropping query/fragment state by construction. Page/content data cannot override canonical URLs.
- **D-06:** Ordinary development and verification use the explicit Playwright preview origin `http://127.0.0.1:4322`. Launch-readiness consumes the non-secret `SITE_ORIGIN` build input and fails before accepted output if it is missing or not a clean production HTTPS origin.
- **D-07:** Production-origin validation rejects HTTP, credentials, queries, fragments, non-root paths, localhost names, IP literals, and reserved placeholder domains. Normalize one accepted origin once rather than repairing page URLs independently.
- **D-08:** Do not create or read `.env` files. Phase 5 must supply the real `SITE_ORIGIN` through the selected provider or explicit command and prove that external origin separately.

### Social Sharing Identity

- **D-09:** Emit `og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`, and Arabic locale from the same normalized page object that produces title/description/canonical. Article pages use `article`; other indexable routes use `website`.
- **D-10:** Emit `twitter:card=summary`, `twitter:title`, and `twitter:description` from those same facts. Do not invent a handle, account, image, logo, or alternate description.
- **D-11:** Article pages may add truthful Open Graph publication and optional update timestamps from validated frontmatter. They must not infer video views, reviewer identity, credentials, or schema claims.

### Sitemap and Robots Agreement

- **D-12:** Use the maintained official `@astrojs/sitemap` integration. Let generated indexable routes supply its URL set and apply only the exclusion needed for the static 404; do not maintain a second list of article or section URLs.
- **D-13:** Generate `robots.txt` from the same normalized site origin. Its minimal policy is `User-agent: *`, `Allow: /`, and exactly one absolute `Sitemap:` line for the generated sitemap index. Do not use `Disallow` to simulate draft security.
- **D-14:** Preserve the existing content selector and route boundary: public records generate paths, drafts do not. Browser/build checks compare raw approved source, HTML routes, canonicals, internal links, and sitemap URLs independently so a shared selector bug cannot make all observations agree falsely.

### Arabic 404 and Local Favicon

- **D-15:** The 404 reuses the site shell and existing visual tokens. It contains `الصفحة غير موجودة` as its only `h1`, the sentence `تعذر العثور على الصفحة المطلوبة.`, and the ordinary link `العودة إلى الصفحة الرئيسية` pointing to `/`. It adds no search box, illustration, suggested content, or client behavior.
- **D-16:** Add one local SVG favicon referenced from every document. Use only simple geometric open-page shapes in the current cream/green palette; use no text glyph, embedded font, remote image, animation, or claim that it is a final owner-approved logo.

### Verification Boundary

- **D-17:** Add the smallest focused native checks for origin acceptance/rejection and a dedicated search-discovery Playwright/build suite for HTML, XML, text endpoint, favicon, status, navigation, no-JavaScript, and accessibility behavior. Reuse the existing Playwright server lifecycle and keep every artifact under `.artifacts/`.
- **D-18:** Every browser verification run must build fresh first. Parse metadata and discovery files rather than relying on screenshots alone, then run rendered 404/focus/reflow/accessibility checks where appearance or interaction matters.
- **D-19:** Keep the full existing `npm run verify` gate green. Phase 4 adds no client runtime, remote request, webfont, CMS, database, SEO framework, schema package, or alternate test framework.

### the agent's Discretion

- Exact helper/type filenames and whether the origin validator lives beside site configuration or the metadata boundary, provided there is one validated origin flow and no single-use abstraction larger than the duplicated code it removes.
- Exact prop/type names for the shared layout metadata input, provided required indexable fields fail at build/type-check time and the 404 can explicitly suppress canonical/social identity.
- Exact focused test-file split, provided native origin branches and production rendered/discovery behavior are both runnable, fresh-build protected, and isolated under the existing test commands.
- Exact SVG path geometry within the locked two-color, no-text, no-remote favicon constraint.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Locked Phase Scope

- `.planning/phases/04-search-discovery-integrity/04-SPEC.md` — Locked six requirements, origin boundary, explicit exclusions, and nine acceptance checks; MUST be read first.
- `.planning/ROADMAP.md` § Phase 4 — Phase goal, dependency, mapped requirement IDs, and five roadmap success criteria.
- `.planning/REQUIREMENTS.md` — Canonical definitions for `SITE-06` and `SEO-02` through `SEO-05`.
- `.planning/PROJECT.md` — Arabic-only identity, static/Markdown architecture, lightweight performance strategy, and core Google-to-article-to-YouTube value.

### Upstream Contracts

- `.planning/phases/03-real-content-and-section-discovery/03-CONTEXT.md` — Inherited shared shell, registry-derived discovery graph, truthful author surface, and proof-isolation decisions.
- `.planning/phases/03-real-content-and-section-discovery/03-SPEC.md` — Upstream public route/content contract that metadata and discovery output must preserve.
- `.planning/phases/03-real-content-and-section-discovery/03-VERIFICATION.md` — Verified eight-route production graph, draft exclusion, link topology, and current browser evidence.
- `.planning/phases/02-complete-arabic-article-journey/02-CONTEXT.md` — Inherited Arabic semantics, text-first reader, focus/reflow rules, and YouTube privacy boundary.
- `.planning/phases/01-content-and-url-contract/01-CONTEXT.md` — Inherited stable path helper, trailing-slash convention, registries, validation, and public/preview selector decisions.

### Research and Repository Boundaries

- `.planning/research/ARCHITECTURE.md` — Researched site-origin, metadata-flow, sitemap/robots, static endpoint, and fail-closed origin guidance.
- `.planning/research/STACK.md` — Verified official sitemap integration choice and dependency/version guidance.
- `AGENTS.md` — Repository workflow, static stack, artifact isolation, UI QA, exact runtime, and `.env` prohibition.
- `README.md` — Current authoring, preview, build, and verification commands that Phase 4 must keep accurate.

### Source and Test Integration Points

- `astro.config.mjs` — Current static/trailing-slash/MDX configuration; integration and normalized site origin connect here.
- `src/layouts/SiteLayout.astro` — Existing shared document head and visual shell; sole metadata rendering boundary.
- `src/config/registries.ts` — Authoritative site-visible section and author facts.
- `src/lib/articles.ts` — Public/preview collection boundary that keeps drafts out of production routes.
- `src/lib/content-contract.ts` — Stable article path, validation, and collision functions inherited by discovery checks.
- `src/pages/index.astro` — Homepage title/description identity source and registry discovery root.
- `src/pages/[section]/index.astro` — Registry-derived section identity and public article links.
- `src/pages/[section]/[slug].astro` — Article identity, validated dates, author/section links, and media surface.
- `src/pages/عن-أحمد-المنجاوي.astro` — Truthful author identity and explanatory copy.
- `tests/discovery.spec.ts` — Existing independent public-corpus oracle, link graph, widths, network, focus, and accessibility patterns to reuse.
- `playwright.config.ts` — Existing production/development server lifecycle and ignored artifact routing.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `SiteLayout.astro`: Already owns the one shared `<head>`, Arabic/RTL document semantics, site header, viewport, favicon location, global palette, focus, and responsive measure.
- `sectionRegistry` / `authorRegistry`: Supply maintained Arabic identity without page-specific duplication.
- Article frontmatter and the content schema: Already validate title, description, publication date, optional update date, author, section, slug, draft state, and video ID.
- `articlePath()` plus `getPublicArticles()`: Provide the canonical relative route graph and the established public-only boundary.
- Existing Node/Playwright/axe tests: Supply dependency-free pure checks, production/development servers, independent source oracles, responsive matrices, network observation, and accessibility assertions.

### Established Patterns

- Astro pre-renders static HTML with a single trailing-slash policy and no server adapter or UI runtime.
- Shared facts live in registries/frontmatter and are validated once; renderers consume them rather than repair or repeat them.
- Public route generation excludes drafts structurally, and browser tests rebuild before examining output.
- Native HTML/CSS and one existing intent-gated media script are the complete client surface; browser artifacts already live under ignored `.artifacts/` paths.

### Integration Points

- Extend Astro configuration with normalized site origin and official sitemap output.
- Extend the shared layout's current empty head with required metadata derived from typed page props and the current route.
- Pass the already-maintained title/description/type/date facts from the four public page families.
- Add a static `404.astro`, generated `robots.txt` endpoint, and one public SVG favicon.
- Add origin and rendered-discovery checks without altering the content schema, public selector, route family, or visual system.

</code_context>

<specifics>
## Specific Ideas

- Public title examples are deliberately predictable: `القسم العلمي | مدونة أحمد المنجاوي` and an article's exact title followed by the same site suffix.
- The 404 looks like an ordinary quiet page in the existing site, not a branded marketing interstitial.
- The favicon is a replaceable technical browser asset, not a claim that a final logo has been designed or approved.
- Robots output is intentionally boring and transparent: allow public crawling and point to the sitemap; absent drafts need no crawler rule.

</specifics>

<deferred>
## Deferred Ideas

- Final production hostname, provider deployment, redirect rules, DNS/TLS, Search Console verification/submission, aggregate analytics, and outbound YouTube click measurement — Phase 5.
- Production crawl certification, native browser-chrome 200% zoom, live YouTube playback, and Core Web Vitals evidence — Phase 6.
- JSON-LD/rich-result work and a designed social-sharing image — deferred until `SEO-07` or an approved asset makes them real requirements.

</deferred>

---

*Phase: 04-search-discovery-integrity*
*Context gathered: 2026-08-27*
