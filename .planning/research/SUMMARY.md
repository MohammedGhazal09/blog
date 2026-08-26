# Project Research Summary

**Project:** مدونة أحمد المنجاوي  
**Domain:** Arabic-only, SEO-first Islamic knowledge base and YouTube handoff site  
**Researched:** 2026-08-26  
**Confidence:** HIGH

## Executive Summary

مدونة أحمد المنجاوي should launch as a small, fully static Arabic reading site—not a portal, LMS, CMS, or YouTube mirror. The expert pattern is a useful, crawlable article that answers a real search intent, establishes visible authorship and sources, and then offers both a lightweight embedded video and a prominent direct YouTube action. The three fixed sections are navigation data over one shared content model, not separate applications.

Build v1 with Astro 7 static output, one validated Markdown/MDX content collection, native semantic RTL HTML/CSS, and Cloudflare Pages. Generate routes, metadata, canonicals, sitemap, and robots output from the same checked content facts. Keep browser JavaScript to the `lite-youtube-embed` facade and a hosted Plausible snippet. Do not add React, Tailwind, SSR, a CMS, database, authentication, search, community features, or AI content generation.

The main risks are semantic RTL/bidirectional defects, unstable Arabic URLs, contradictory discovery signals, thin or weakly sourced religious content, and an eager or inaccessible YouTube player. Prevent them at their source: validate identifiers and content during the build, centralize URL/SEO policy, review three substantive launch articles, progressively enhance the player while retaining a normal link, and verify the real production origin rather than treating successful compilation as launch proof.

## Key Findings

### Recommended Stack

Use the exact researched baseline until a deliberate dependency upgrade: Astro **7.2.7** on Node.js **24.19.0 LTS**, npm **11.17.0** with a committed lockfile, and TypeScript **6.0.3** (TypeScript 7 is outside `@astrojs/check`'s current peer range). Astro's static output and built-in content collections cover routing, validation, and rendering without an application runtime.

**Core technologies:**

- **Astro 7.2.7:** static routing, layouts, content rendering, and build pipeline—complete HTML with no framework hydration by default.
- **Astro content collections:** one `articles` collection for `.md` and `.mdx`, validated with Astro's built-in Zod export.
- **`@astrojs/mdx` 7.0.8:** supports the explicitly allowed MDX workflow; prefer Markdown unless an approved component is needed.
- **`@astrojs/sitemap` 3.7.3:** derives discovery output from generated routes and the configured production `site` origin.
- **HTML + modern CSS:** `<html lang="ar" dir="rtl">`, semantic landmarks, logical properties, and local bidi isolation; no RTL or styling framework.
- **`lite-youtube-embed` 0.3.4:** one wrapped, accessible facade using `youtube-nocookie.com`, plus an adjacent direct link and no-script fallback.
- **Cloudflare Pages:** serve `dist/` as static assets with no Astro adapter; redirect alternate hostnames and URL variants to one canonical origin.
- **Plausible Cloud:** direct site snippet and one automatic outbound-link measurement path; no analytics SDK or duplicate custom event.

Development gates are `astro check` followed by `astro build`; use Prettier with its Astro plugin. Search Console, browser accessibility checks, and production Lighthouse/PageSpeed spot checks are operational verification, not application dependencies.

### Expected Features

**Must have (v1 table stakes):**

- Arabic-only homepage, navigation, 404/states, and crawlable indexes for الردود والشبهات, القضايا العامة, and القسم العلمي, whose description explicitly means Islamic scholarship.
- One responsive, accessible RTL article layout with correct mixed-direction handling, constrained reading width, visible focus, and complete usefulness without JavaScript or video.
- One substantive, reviewed article and matching real video per section; visible author/about context, truthful dates, references where claims depend on them, and preferably a maintained `الخلاصة`.
- A deferred, dimension-reserved YouTube embed and prominent direct YouTube link on every article.
- Stable explicit Arabic slugs, unique Arabic titles/descriptions, canonical and social metadata, sitemap, robots directives, and no draft leakage.
- Safe Markdown/MDX preview and build-time checks for section, slug, dates, duplicate routes, author policy, draft state, and YouTube ID.
- Search Console setup plus minimal privacy-conscious page/outbound measurement that answers the launch validation questions.

**Add only after the stated trigger:**

- Curated related reading when a real next article exists; a table of contents/deep links only for sufficiently long articles.
- Timestamped handoffs when editors can maintain reliable mappings; ordered series when a real multi-part curriculum exists.
- Article/Breadcrumb JSON-LD after the corresponding visible author/date/breadcrumb facts are stable and validated.
- Static Arabic search only when a materially larger corpus makes section browsing and contextual links demonstrably inadequate.

**Defer or reject:**

- CMS, database, auth, accounts, comments, forums, reactions, personalization, course progress, quizzes, certificates, and community moderation.
- AI-written content, transcript automation, doorway pages, bulk paraphrasing, and full catalog migration before validation.
- React or another UI runtime, Tailwind/component kits, SSR, a YouTube API build dependency, separate watch pages, autoplay/sticky/eager players, or speculative multilingual infrastructure.

### Architecture Approach

The architecture is a one-way static publishing pipeline: reviewed content and small configuration registries enter a build-time validation boundary; typed queries generate all public routes and metadata; the CDN serves complete HTML/CSS; only analytics and user-activated YouTube cross runtime third-party boundaries. One section registry, one article collection, one query helper, one layout family, and one URL/SEO policy are sufficient. Adding a section is a registry/content change rather than another implementation.

**Major components:**

1. **Site configuration and section registry** — canonical origin, site/owner facts, stable keys, Arabic labels/slugs/descriptions, and navigation order.
2. **Article collection and query helper** — validate frontmatter, normalize/reject unsafe slugs, filter drafts, enforce unique `(section, slug)`, and sort/select published records.
3. **Static routes** — generate `/`, each section index, and `/{section}/{article}/` from validated records only.
4. **`BaseLayout`, `SeoHead`, and `ArticleLayout`** — establish Arabic semantics once and render consistent reading, trust, canonical, social, and truthful structured metadata.
5. **`VideoEmbed` and `YouTubeLink`** — derive both destinations from one validated 11-character video ID; wrap the selected facade so replacement touches one file.
6. **Discovery/deployment boundary** — sitemap, robots, redirects, static 404, CDN delivery, Search Console, and non-blocking aggregate analytics.

Use explicit immutable Arabic slugs with NFC normalization and hyphen separators. Do not duplicate deterministic values such as canonical URL, YouTube URL, author, site name, or section label in frontmatter. MDX is trusted build-time code: restrict authoring to repository contributors and a small approved component set.

### Critical Pitfalls

1. **Visual right alignment mistaken for RTL correctness** — set root language/direction semantics, use logical CSS, isolate mixed-direction fragments, and test URLs/numbers/diacritics with keyboard and screen readers.
2. **Slugs derived from changing titles or accepting unsafe Unicode** — require explicit normalized slugs, reject bidi/control characters and collisions at build time, and retain permanent redirects for any unavoidable published change.
3. **Canonical, sitemap, robots, and host disagreement** — derive every absolute URL from one production origin and route policy; crawl deployed output and never use robots rules as access control.
4. **Routes filled with thin or unaccountable content** — launch three useful human-reviewed articles with visible authorship and sources; structured data must mirror visible facts and cannot manufacture trust or indexing.
5. **YouTube/analytics defeating performance or truthfulness** — activate the privacy-enhanced player only on intent, keep the direct link, verify real embeds logged out, and count one outbound activation as an outbound click—not a video view.

Additional launch blockers include arbitrary scripts/iframes in MDX, false build-time `lastmod`, inaccessible Arabic typography, and English leakage through metadata, ARIA names, errors, or empty states.

## Implications for Roadmap

### Phase 1: Content and URL Contract

**Rationale:** Every route, label, metadata record, sitemap entry, and measurement dimension depends on stable identifiers.  
**Delivers:** Minimal Astro scaffold; locked versions; production-origin contract; section registry; article schema; draft filtering; duplicate/slug/date/video validation; one minimal real record.  
**Addresses:** Safe file publishing, fixed taxonomy, stable clean URLs.  
**Avoids:** Malformed/colliding slugs, draft leakage, duplicated deterministic frontmatter, broken content reaching production.

### Phase 2: Arabic Shell and Complete Article Slice

**Rationale:** Prove the primary Google → article → YouTube path end to end before multiplying it across indexes.  
**Delivers:** Arabic-only shell, semantic RTL/bidi behavior, accessible responsive typography, SEO head, article layout, visible trust context, wrapped lightweight player, and direct YouTube action.  
**Addresses:** Readable standalone article, accessibility baseline, embedded and direct video handoff.  
**Avoids:** English UI leakage, CSS-only RTL, eager iframe weight, video-only usefulness, inaccessible controls.

### Phase 3: Real Content and Site Discovery

**Rationale:** Homepage and indexes should generalize a proven article contract and must contain useful content at launch.  
**Delivers:** Homepage, three generated section indexes, About/author context, and one reviewed article/video per section with truthful dates and references.  
**Addresses:** Crawlable navigation, representative content, trust/source cues, optional maintained `الخلاصة`.  
**Avoids:** Empty sections, thin search-first pages, fabricated review facts, ambiguity around القسم العلمي.

### Phase 4: Search Discovery Integrity

**Rationale:** Discovery files must be derived after route/content conventions stabilize.  
**Delivers:** Unique Arabic metadata, canonical/social output, sitemap, robots, visible breadcrumbs where used, static 404, and truthful minimal Article/Breadcrumb JSON-LD only when its facts are ready.  
**Addresses:** Page identity, indexability, crawler inventory.  
**Avoids:** Conflicting origins, accidental `noindex`, false schema, repeated descriptions, meaningless deployment-time modification dates.

### Phase 5: Deployment and Measurement

**Rationale:** Redirects, analytics, and search tooling require the final origin and real routes.  
**Delivers:** Cloudflare Pages deployment, canonical-host/trailing-slash redirects, Search Console ownership/sitemap submission, Plausible pageviews and a single outbound-link path.  
**Addresses:** Privacy-conscious validation of organic discovery and YouTube handoff.  
**Avoids:** Duplicate origins, blocked navigation, double-counted events, or labeling clicks as views.

### Phase 6: Production Launch Verification

**Rationale:** Static success is not proof that deployed indexing, Arabic rendering, embeds, and measurement work together.  
**Delivers:** Production crawl and metadata agreement check; representative URL inspection; logged-out/blocked-video fallback; no-JS, mobile, keyboard, screen-reader, zoom/reflow, diacritics, and performance checks; whole-site Arabic/accessible-name audit.  
**Addresses:** Production readiness and launch baseline.  
**Avoids:** The full set of “looks done but isn't” failures, especially wrong canonicals, invisible English labels, broken real media, and inaccessible RTL behavior.

### Phase Ordering Rationale

- Lock content identity first because changing it later invalidates URLs, metadata, links, redirects, and analytics continuity.
- Prove one complete article before indexes; then generalize using the same registry/query/layout path and three real records.
- Generate SEO/discovery from final routes, then configure the real host and measurement, then verify the deployed system.
- Keep all v1.x features out of these phases unless their explicit corpus/editorial trigger already exists.

### Research Flags

Phases likely needing deeper planning research or a targeted spike:

- **Phase 2:** real-browser RTL/bidi typography, accessibility, and `lite-youtube-embed` behavior require visual/device verification, not more framework selection.
- **Phase 3:** the owner must define authoritative religious sources, hadith verification conventions, disputed-position labeling, and human sign-off.
- **Phase 4:** validate actual generated structured-data examples with Google tooling; omit unsupported types/properties.
- **Phase 5:** final Cloudflare redirect syntax, canonical domain, Plausible consent/retention, and outbound configuration depend on chosen production details.
- **Phase 6:** real video embeddability and post-launch Search Console evidence cannot be known before production.

Phases with established patterns that should skip broad research:

- **Phase 1:** Astro collections, static routing, schema validation, and Unicode/slug safeguards are well documented.
- **Phase 3 (technical implementation):** registry-driven indexes and static navigation are standard; only editorial policy needs research/decision.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Exact 2026 versions, engine/peer constraints, and deployment behavior were checked against official Astro, Node, npm, Cloudflare, MDN, and provider documentation. |
| Features | HIGH | v1 capabilities follow the explicit project goal and stable Google/W3C/YouTube expectations; competitor observations are supporting rather than decisive evidence. |
| Architecture | HIGH | Static, registry-driven, build-validated content is directly supported by current Astro docs and matches the absence of request-time state. |
| Pitfalls | HIGH | Core findings are grounded in Google Search Central, W3C/WCAG, Unicode, YouTube, and web.dev; final UX and operational behavior still need real production testing. |

**Overall confidence:** HIGH

### Gaps to Address

- **Editorial authority:** owner decision required for sources, hadith grading, disputed views, correction policy, and sign-off; software must expose truthful fields but cannot select theology.
- **Production identity:** choose the canonical domain/hostname before Phase 4 completion and verify redirects on Cloudflare Pages.
- **Launch assets:** supply three final articles, real YouTube IDs, truthful dates, references, owner profile facts, and any social image.
- **Analytics governance:** confirm Plausible account, consent/legal position, retention, and exact metric names before enabling production tracking.
- **Search outcomes:** indexing and ranking are post-launch observations, not acceptance criteria that code can guarantee.
- **Publishing usability:** Git-authored Markdown/MDX is correct for v1 but must be validated by the owner's first real publishing cycle before any Git-backed CMS is considered.

## Sources

### Primary (HIGH confidence)

- Astro official documentation/releases and npm registry — static output, content collections, MDX, sitemap, current versions, engines, and peer compatibility.
- Node.js official release index — Node 24.19.0 LTS and bundled npm version.
- Google Search Central — helpful content, URL/canonical/sitemap/robots guidance, titles/descriptions, and Article/Video structured-data policies.
- MDN and W3C Internationalization/WCAG 2.2 — Arabic language/direction semantics, bidi isolation, logical CSS, accessibility, reflow, and text spacing.
- YouTube Help/IFrame documentation and web.dev — privacy-enhanced embeds, availability constraints, facade/lazy-loading performance.
- Cloudflare Pages official Astro/build documentation — static `dist/` deployment with no runtime adapter.
- Plausible official documentation — direct hosted snippet and automatic outbound-link tracking.
- Unicode UTS #39 — normalization and bidirectional-control risks in identifiers.

### Secondary (MEDIUM confidence)

- Current Arabic/Islamic publisher pattern observations in `FEATURES.md` — support trust, sourcing, section navigation, and restrained feature choices; product-specific validation still comes from this site's readers and content.
- Scale thresholds in `ARCHITECTURE.md` — useful planning heuristics, but changes should follow measured build time rather than article count alone.

Detailed citations and access dates are preserved in [STACK.md](./STACK.md), [FEATURES.md](./FEATURES.md), [ARCHITECTURE.md](./ARCHITECTURE.md), and [PITFALLS.md](./PITFALLS.md).

---
*Research completed: 2026-08-26*  
*Ready for roadmap: yes*
