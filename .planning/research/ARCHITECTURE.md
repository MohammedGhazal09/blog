# Architecture Research

**Domain:** Arabic-only, SEO-first Islamic content directory / knowledge base
**Researched:** 2026-08-26
**Confidence:** HIGH

## Recommendation

Build a **static Astro 7 site with one validated content collection and one reusable article route**. Markdown/MDX is the source of truth; the production build validates content, generates every public page, derives all SEO metadata, emits discovery files, and deploys plain HTML/CSS/minimal JavaScript to a CDN.

Do not introduce SSR, a CMS, a database, authentication, a search service, or a YouTube API integration. None is required for the initial journey of Google result → Arabic article → YouTube video/action. Static generation keeps pages crawlable without JavaScript, makes content failures block deployment, and lets the CDN absorb traffic without changing the application architecture.

Astro 7.2.7 was current in the npm registry on the research date. Current official Astro documentation confirms the required capabilities: glob-loaded content collections with schema validation, MD/MDX rendering, static dynamic routes through `getStaticPaths()`, static file endpoints, a production `site` URL, and sitemap generation from statically generated routes.

## Standard Architecture

### System Overview

```text
┌──────────────────────────────────────────────────────────────────┐
│                         Authoring boundary                        │
│  Markdown/MDX articles ── sections registry ── site configuration│
└──────────────────────────────┬───────────────────────────────────┘
                               │ build input
┌──────────────────────────────▼───────────────────────────────────┐
│                         Build boundary                            │
│  Content loader → schema validation → normalized article records │
│       ├──────────────→ route generation                           │
│       ├──────────────→ page metadata / JSON-LD                    │
│       ├──────────────→ home and section indexes                   │
│       └──────────────→ sitemap and robots output                  │
└──────────────────────────────┬───────────────────────────────────┘
                               │ static artifacts
┌──────────────────────────────▼───────────────────────────────────┐
│                        Delivery boundary                          │
│  CDN-hosted HTML/CSS/assets + tiny embed/tracking JavaScript      │
│       ├──────────────→ analytics endpoint                         │
│       └── on user action → youtube-nocookie.com / YouTube         │
└──────────────────────────────────────────────────────────────────┘
```

The data direction is intentionally one-way. Content never calls page components, routes never invent metadata, and the browser never fetches article data to render a public page.

### Component Responsibilities

| Component | Responsibility | Boundary rule |
|-----------|----------------|---------------|
| Site configuration | Canonical origin, public site name, owner identity, default description | One source for absolute URLs and site-wide metadata; never repeat the domain in article frontmatter |
| Sections registry | Stable internal key, Arabic label, Arabic route slug, short description, navigation order for each section | The three sections are data, not three separate implementations |
| Article content collection | Load MD/MDX, validate frontmatter, expose typed records | Invalid or duplicate publishable content fails the build |
| Content query helper | Filter drafts, enforce unique `(section, slug)`, sort records, select by section | One small module; no repository/service abstraction |
| Route pages | Choose records for a URL and pass them to layouts | Routes do not contain article presentation or SEO rules |
| `BaseLayout` | Set `<html lang="ar" dir="rtl">`, global shell, typography, analytics include | RTL and site-wide semantics are established once |
| `SeoHead` | Render title, description, canonical, social metadata, and optional JSON-LD from normalized page metadata | Canonical/structured data are derived, not hand-authored per page |
| `ArticleLayout` | Render article header/body, visible section context, video area, and direct YouTube action | One layout serves every section |
| `VideoEmbed` | Render a lightweight accessible facade; create the privacy-enhanced iframe only after user activation | No eager YouTube iframe or framework hydration |
| `YouTubeLink` | Render the prominent external action and standardized tracking attributes | URL derives from validated `youtubeId`; content does not duplicate it |
| Analytics include | Load one privacy-conscious provider and record pageviews/outbound events | Analytics failure never blocks navigation or rendering |
| Sitemap/robots generation | Publish crawler discovery files from the same route/site configuration | Drafts are absent from output rather than blocked through robots rules |

## Recommended Project Structure

```text
astro.config.mjs                 # static output, canonical site URL, MDX/sitemap integrations
src/
├── content.config.ts            # one articles collection and its validation schema
├── content/
│   └── articles/                # trusted Markdown/MDX source files
│       ├── refutations/
│       ├── public-issues/
│       └── islamic-scholarship/ # folders aid editors; frontmatter remains authoritative
├── config/
│   ├── site.ts                  # name, origin-dependent metadata, owner identity
│   └── sections.ts              # keys, Arabic labels/slugs/descriptions/order
├── lib/
│   ├── content.ts               # published filtering, uniqueness check, sorting
│   └── seo.ts                   # page metadata and JSON-LD builders
├── layouts/
│   ├── BaseLayout.astro
│   └── ArticleLayout.astro
├── components/
│   ├── SeoHead.astro
│   ├── VideoEmbed.astro
│   ├── YouTubeLink.astro
│   └── Analytics.astro
├── pages/
│   ├── index.astro
│   ├── [section]/
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── robots.txt.ts
│   └── 404.astro
└── styles/
    └── global.css               # tokens, RTL-safe base styles, prose typography
public/
└── static brand assets          # favicon and a local default social image
```

### Structure Rationale

- **One collection:** all articles share the same schema and page layout. Separate collections for the three sections would duplicate validation, querying, and routes.
- **One section registry:** Arabic labels and route slugs change in one place and are reused by navigation, indexes, breadcrumbs, and validation.
- **Two tiny library modules:** content policy and SEO policy each have one shared implementation. More layers would only rename direct function calls.
- **Static route family:** adding a section is a registry/content change, not a new template.
- **Components by responsibility:** only the embed and analytics boundaries need browser JavaScript. Article rendering remains server/build rendered.

## Content and Validation Boundary

### Recommended Frontmatter

```yaml
---
title: "عنوان عربي واضح للمقال"
description: "وصف موجز مستقل يشرح للقارئ ما الذي سيجده في الصفحة."
section: "refutations"
slug: "عنوان-عربي-ثابت"
publishedAt: 2026-08-26
updatedAt: 2026-08-26       # optional; omit when never materially updated
youtubeId: "dQw4w9WgXcQ"
draft: false                # optional; defaults to false
---
```

Use stable ASCII keys internally while keeping every reader-facing value Arabic. The schema should enforce:

| Field | Validation | Reason |
|-------|------------|--------|
| `title` | Non-empty trimmed Arabic-facing text; practical editorial length cap | Supplies the H1, document title, social headline, and structured-data headline |
| `description` | Non-empty trimmed text, roughly 40–180 characters | Supplies the search description and social description without a second SEO field |
| `section` | Enum derived from the sections registry | Prevents orphan routes and label drift |
| `slug` | NFC-normalized Unicode letters/numbers joined by single hyphens; no slashes, spaces, query/hash characters, or leading/trailing hyphen | Produces stable, readable, safe route segments |
| `publishedAt` | Valid date | Drives visible publication metadata and `datePublished` |
| `updatedAt` | Optional valid date not earlier than `publishedAt` | Emit `dateModified` only when truthful |
| `youtubeId` | Exactly one valid 11-character YouTube video ID | Derives embed and outbound URLs from one value |
| `draft` | Boolean, default `false` | Lets incomplete content remain in Git without entering routes or sitemap |

Do **not** add frontmatter for `canonical`, `youtubeUrl`, section display name, author, site name, or JSON-LD. Those values are deterministic and belong in site/section configuration or derivation code. Do not add `keywords`; Google does not use the keywords meta tag for web ranking.

Validation has two levels:

1. **Per-entry schema validation:** Astro's content collection schema rejects malformed fields during development/build.
2. **Collection validation:** `getPublishedArticles()` rejects duplicate `(section, slug)` pairs and impossible date ordering before route generation.

MDX files are trusted code because MDX can import and execute components at build time. Only repository contributors may author them. Prefer plain Markdown for normal articles; use MDX only for a small allow-list of purposeful presentation components. There is no need for runtime HTML sanitization while content remains trusted and reviewed in Git.

## Route and URL Strategy

### Public Route Map

```text
/                                      homepage
/{arabic-section-slug}/                section index
/{arabic-section-slug}/{article-slug}/ article
```

Generate section and article routes with `getStaticPaths()` from the sections registry and filtered content collection. This guarantees that only validated, publishable content becomes a public URL.

### Arabic Slug Decision

Use **explicit Arabic slugs**, for example:

```text
/الردود-والشبهات/حقيقة-شبهة-معينة/
```

Google documents support for localized UTF-8 words in URLs and recommends readable words in the audience's language. Arabic slugs are therefore crawlable and more understandable to the intended reader. The trade-off is that copied URLs may appear percent-encoded in some tools and mixed-direction strings can be awkward in logs. That operational inconvenience is smaller than exposing arbitrary transliteration to an Arabic-only audience.

Rules that prevent URL rework:

- Keep the slug explicit in frontmatter; do not derive it from a filename or title that editors may revise.
- Normalize to Unicode NFC and use hyphens only as separators.
- Do not mix Arabic and Latin words inside one slug unless the Latin token is the real public name.
- Choose one trailing-slash convention. For static directory output, canonicalize to trailing slashes and configure the host to redirect the other form.
- Never change a published slug for cosmetic edits. If a genuine change is required later, add one permanent host-level redirect from the previous path.
- Canonicalize HTTPS and one hostname through deployment configuration; page code should not guess the production host.

## Metadata and Discovery Flow

```text
site config ───────────────┐
sections registry ───────┐ │
article frontmatter ───┐ │ │
                      ▼ ▼ ▼
                 normalized PageMeta
                 ├── <title> / description
                 ├── canonical absolute URL
                 ├── Open Graph / social card
                 ├── Article JSON-LD
                 └── visible page heading/dates

generated static routes ──→ @astrojs/sitemap ──→ sitemap-index.xml
site canonical origin ────→ robots.txt endpoint ─→ Sitemap: absolute URL
```

### Page Metadata Rules

- Set `site` in `astro.config.mjs` to the one production origin. Astro uses it for absolute URL generation and sitemap output.
- Build every canonical from `site + normalized pathname`; remove query strings and fragments.
- Article title: `article title | site name`. Section/home titles and descriptions come from their registry/site records.
- Use the article `description` for both `<meta name="description">` and social description.
- Use a local default social image until a real article-specific image exists. Do not fetch a YouTube thumbnail during the initial page request merely to fill social metadata.
- Emit `Article` JSON-LD for articles with `headline`, `description`, `datePublished`, truthful optional `dateModified`, canonical `mainEntityOfPage`, `inLanguage: "ar"`, and the configured author/site identity.
- Emit breadcrumb structured data only when the same breadcrumb is visibly rendered. Do not add FAQ, HowTo, VideoObject, or other markup unless the page visibly meets that feature's requirements and has all required metadata.
- The sitemap integration should consume the statically generated routes. Draft entries are filtered before routes exist, so they cannot leak into the sitemap.
- Generate `robots.txt` as a static endpoint using the configured origin and actual sitemap URL. Robots directives are not an access-control mechanism and should not be used to hide drafts.

This central flow prevents the common failure where an article title, H1, Open Graph title, canonical, sitemap URL, and JSON-LD describe different resources.

## RTL, Bidirectional Text, and Typography Boundaries

RTL is a document-shell concern, not a per-component option:

1. `BaseLayout` always outputs `<html lang="ar" dir="rtl">`; there is no language switch or LTR page variant.
2. Global CSS uses logical properties (`margin-inline`, `padding-inline`, `border-inline-start`, `text-align: start`) so components do not need mirrored copies.
3. Article prose styles live under one `.prose` boundary: readable measure, generous Arabic line height, heading rhythm, lists, quotes, links, and responsive media.
4. Unknown-direction inline values use `<bdi>`. Deliberately LTR values such as a displayed URL, code, or identifier use `dir="ltr"`; do not change the whole paragraph direction.
5. The video wrapper uses `aspect-ratio: 16 / 9` and is direction-neutral. Icons that imply forward/back should use semantic start/end labels or deliberate RTL mirroring; play/external-link icons are not mirrored.

Use a simple Arabic-capable system font stack initially, or one self-hosted variable Arabic font if brand quality requires it. Do not load multiple remote font families or weights. Font loading belongs in the shell so typography remains consistent across Markdown, navigation, and metadata previews.

## YouTube Embed and Outbound Tracking

### Embed Performance Pattern

Render a facade rather than an eager iframe:

1. Server-render a fixed-ratio local poster/placeholder, article-specific accessible label, and play button.
2. On activation, replace that facade with an iframe using `https://www.youtube-nocookie.com/embed/{youtubeId}?autoplay=1`.
3. Give the iframe a descriptive Arabic `title`, `allowfullscreen`, a restrictive `allow` list, and `referrerpolicy="strict-origin-when-cross-origin"`.
4. If JavaScript fails, the adjacent direct YouTube link still works.

This uses a tiny native DOM script and no UI framework hydration or embed dependency. It avoids YouTube's substantial third-party requests until the reader chooses playback. YouTube's privacy-enhanced domain reduces pre-play tracking but does not make playback anonymous; the interface should not claim otherwise.

### Outbound Click Flow

`YouTubeLink` should render a normal crawlable `<a>` with standardized attributes such as:

```html
<a href="https://www.youtube.com/watch?v=VIDEO_ID"
   data-analytics-event="youtube_outbound"
   data-video-id="VIDEO_ID"
   data-link-location="article_cta">
```

Prefer the analytics provider's built-in outbound-link tracking. If it cannot attach the required video/location dimensions, one delegated click listener at the document level sends a non-blocking event and lets navigation continue. Track only `videoId`, link location (`article_cta`, `embed_fallback`, or `channel`), and the current route. Do not intercept navigation, wait for an analytics response, or scatter provider calls through article components.

## Data and Deployment Flow

### Publishing Flow

```text
Author adds/edits MD or MDX in Git
    ↓
Pull request / local preview
    ↓
locked dependency install
    ↓
content schema + collection invariants
    ↓ (failure stops deployment)
Astro static build
    ├── HTML pages
    ├── CSS/local assets
    ├── sitemap/robots
    └── tiny embed/analytics scripts
    ↓
atomic deployment to CDN
    ↓
crawler/user receives complete HTML without application JavaScript
```

Production has no application server and no persistent data store. A content change is deployed through the same reviewed build as a code change. Preview deployments are useful because they let the owner check Arabic typography, media, links, and metadata before merging without creating an editorial backend.

External runtime communication is limited to the analytics provider on pageview/click and YouTube after the user activates a video or follows a link. Do not call the YouTube Data API during builds: it introduces credentials, rate limits, nondeterministic builds, and a failure mode for information already known by the author.

## Key Architectural Patterns

### Pattern 1: Registry-Driven Sections

**What:** Model sections as a small typed record containing internal key, Arabic label, Arabic route slug, description, and order.

**When to use:** Navigation, schema enum, route generation, section indexes, breadcrumbs, and metadata.

**Trade-off:** Adding a section requires one registry entry plus content. This is intentionally less flexible than a CMS taxonomy but eliminates duplicated section implementations.

### Pattern 2: Build-Time Failure at the Trust Boundary

**What:** Reject malformed content, duplicate URLs, and invalid YouTube IDs before generating pages.

**When to use:** Every local/CI production build.

**Trade-off:** One bad article blocks deployment. That is desirable for a small reviewed repository because silently publishing broken metadata or route collisions is harder to detect and repair.

### Pattern 3: Progressive Enhancement at Third-Party Boundaries

**What:** Public content and outbound anchors work in HTML; JavaScript only upgrades the embed and adds analytics.

**When to use:** Video playback and measurement.

**Trade-off:** The facade needs a small accessibility/performance check, but it keeps the article readable, crawlable, and actionable when scripts or third-party resources fail.

## State and Error Handling

**State management:** None. Article/index pages are pure build output. `VideoEmbed` owns only its local played/not-played DOM state. No global store is justified.

**Failure behavior:**

- Invalid frontmatter, duplicate route, unknown section, or bad video ID: fail the build with the source file named.
- Missing article route: static 404 response; never render an empty generic article page.
- YouTube unavailable/blocked: retain the visible direct link and article content.
- Analytics unavailable: ignore the failure; links and navigation remain normal.
- Unknown production origin: production build should fail rather than emit placeholder canonicals or a wrong sitemap host.

## Scaling Considerations

| Scale | Architecture adjustment |
|-------|-------------------------|
| Initial release to ~1,000 articles | No change: full static generation, one collection, CDN delivery |
| ~1,000–10,000 articles | Measure build duration first; cache package/build artifacts, avoid repeated full-collection queries, and optimize local images. Keep the same public architecture |
| Beyond ~10,000 articles or unacceptable measured build time | Investigate incremental/content-aware builds or selective server rendering for indexes only. Preserve the content schema and route contract; do not add a database solely because traffic increased |

Traffic is not the likely bottleneck because static HTML is CDN-served. Build duration and editorial navigation through a large Git content tree will become constraints before request throughput.

## Anti-Patterns

### Separate Application per Section

**What people do:** Create three collections, three route trees, or three article layouts.

**Why it is wrong:** Every metadata, typography, and embed fix must be repeated and future sections become code work.

**Do this instead:** One collection and route family keyed by the sections registry.

### Client-Side Content Rendering

**What people do:** Fetch article JSON in the browser or hydrate a large SPA to render Markdown.

**Why it is wrong:** It adds JavaScript and failure states to pages whose primary requirement is crawlable HTML.

**Do this instead:** Render MD/MDX during the static build.

### Eager Raw YouTube Iframes

**What people do:** Place a normal YouTube iframe in every initial HTML page.

**Why it is wrong:** Third-party resources, cookies/storage behavior, and main-thread work arrive before the visitor expresses interest.

**Do this instead:** Use a local facade and privacy-enhanced iframe on activation.

### Hand-Authored SEO Duplicates

**What people do:** Add canonical URLs, full YouTube URLs, author names, and JSON-LD blobs to every article.

**Why it is wrong:** The duplicated values drift and URL changes require mass edits.

**Do this instead:** Author only content-specific facts and derive the rest centrally.

### Premature Runtime Services

**What people do:** Add SSR, a database, content API, CMS, search index, queue, or video metadata service for future needs.

**Why it is wrong:** It adds deployment and security surface without improving the v1 user journey.

**Do this instead:** Revisit a service only after a measured limitation cannot be solved within the static content pipeline.

## Suggested Vertical Build Order

### 1. Content and URL Contract

- Scaffold static Astro with the production-origin configuration contract.
- Define the sections registry, one article collection, schema, draft filtering, and duplicate URL check.
- Add one minimal real article and verify its intended Arabic URL.

**Dependency rationale:** Routes, metadata, navigation, sitemap, and analytics dimensions all depend on stable section/slug/video identifiers. Changing this contract later causes the most rework.

### 2. Complete Article Slice

- Build `BaseLayout`, global `lang`/`dir`, core typography, `SeoHead`, and `ArticleLayout`.
- Generate one article route end to end with complete HTML, canonical, Article JSON-LD, facade embed, and direct YouTube action.
- Test with JavaScript disabled and in a narrow RTL viewport.

**Dependency rationale:** The article is the landing page from search and proves the full value path before indexes or polish multiply a flawed template.

### 3. Section and Homepage Discovery

- Generate the three section indexes from the same collection.
- Build the homepage/navigation from the sections registry.
- Add one real publishable article per section and confirm all pages use the shared layout/query path.

**Dependency rationale:** Generalize only after one vertical slice works; this exposes any accidental section-specific assumptions with three representative records.

### 4. Crawler and Performance Completion

- Enable sitemap generation, generate robots output, add 404 behavior, and enforce canonical host/trailing-slash redirects at deployment.
- Audit metadata agreement, structured data, internal links, heading hierarchy, responsive RTL, embed keyboard operation, and no-JavaScript fallback.

**Dependency rationale:** Discovery files should be generated from final routes, not maintained in parallel while route conventions are still changing.

### 5. Deploy and Measure

- Deploy atomically to the CDN, verify real production canonicals/status codes, and submit the sitemap through the normal search-console workflow.
- Add the privacy-conscious analytics include and verify pageview plus outbound YouTube events without blocking links.

**Dependency rationale:** Analytics and search tooling need the real origin and stable route/event names. They should observe the finished slice rather than shape its architecture.

## Research Flags for Roadmap

| Phase topic | Research need | Reason |
|-------------|---------------|--------|
| Content/schema and static routing | Low | Official Astro patterns directly cover the required flow |
| Arabic typography and RTL visual system | Medium | Requires device/browser visual validation, especially mixed-direction excerpts and narrow layouts |
| Structured data | Medium | Validate generated production examples with Google's tooling; avoid adding unsupported types |
| YouTube facade/accessibility | Medium | Needs a small real-browser performance, keyboard, and blocked-third-party test |
| Deployment redirects/canonicals | Medium | Exact configuration depends on the selected static host and final domain |

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Static Astro content/routing architecture | HIGH | Current official Astro docs and current npm package version |
| Metadata, canonical, sitemap, URL guidance | HIGH | Current Google Search Central documentation and Astro sitemap/site configuration docs |
| RTL/bidirectional boundary | HIGH | HTML semantics and logical-property patterns are stable platform behavior documented by MDN |
| YouTube facade/privacy-enhanced embed | HIGH for architecture, MEDIUM for final UX | YouTube Help and web.dev document the mechanisms; final placeholder design requires testing |
| Scaling thresholds | MEDIUM | The architecture recommendation is sound; exact build threshold depends on content size, host, and CI measurements |

## Sources

- [Astro content collections](https://docs.astro.build/en/guides/content-collections/) — loaders, schema validation, collection queries, and rendering. **HIGH confidence**
- [Astro routing](https://docs.astro.build/en/guides/routing/#dynamic-routes) — static dynamic routes with `getStaticPaths()`. **HIGH confidence**
- [Astro sitemap integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — generation from statically generated routes and SSR limitation. **HIGH confidence**
- [Astro configuration: `site`](https://docs.astro.build/en/reference/configuration-reference/#site) — production origin used for canonical URLs and sitemaps. **HIGH confidence**
- [Astro static file endpoints](https://docs.astro.build/en/guides/endpoints/#static-file-endpoints) — build-generated text endpoints such as robots output. **HIGH confidence**
- [Astro npm package](https://www.npmjs.com/package/astro) — 7.2.7 observed as current on 2026-08-26. **HIGH confidence**
- [Google Search Central: URL structure](https://developers.google.com/search/docs/crawling-indexing/url-structure) — readable localized UTF-8 URL guidance. **HIGH confidence**
- [Google Search Central: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) — canonicalization methods and consistency. **HIGH confidence**
- [Google Search Central: sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) — absolute canonical URLs and sitemap discovery. **HIGH confidence**
- [Google Search Central: Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article) — supported article types and recommended properties. **HIGH confidence**
- [Google Search Central: keywords meta tag](https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag) — confirms it is not used for web ranking. **HIGH confidence**
- [MDN: `dir` global attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/dir) and [MDN: `<bdi>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi) — document direction and bidirectional isolation semantics. **HIGH confidence**
- [web.dev: third-party embed best practices](https://web.dev/articles/embed-best-practices) — facades and lazy third-party loading. **HIGH confidence**
- [YouTube Help: embed videos and privacy-enhanced mode](https://support.google.com/youtube/answer/171780?hl=en) — supported embed URL pattern and privacy-enhanced domain. **HIGH confidence**

---
*Architecture research for: مدونة أحمد المنجاوي*
*Researched: 2026-08-26*
