# Feature Research

**Domain:** Arabic-only, SEO-focused Islamic content directory / knowledge base with article-to-YouTube handoff  
**Researched:** 2026-08-26  
**Confidence:** HIGH for launch requirements and standards-backed recommendations; MEDIUM for scale-triggered differentiators because the site has no usage data yet

## Scope and Recommendation

The smallest credible launch is not a portal, course platform, or YouTube mirror. It is a fast Arabic reading site with three unmistakable sections, useful standalone articles, strong authorship/source context, and a reliable next step to the matching YouTube video.

Feature names below describe user or operator capabilities. Framework choices, schema formats, and build checks are implementation notes rather than separate product requirements. A capability is only in v1 when it directly supports discovery, comprehension, trust, publishing safety, or the YouTube handoff.

## Feature Landscape

### Table Stakes (Required for Credible Launch)

| Capability | Why Expected | Complexity | Dependencies / implementation boundary | Confidence |
|-----------|--------------|------------|------------------------------------------|------------|
| Arabic-only global navigation with the three named sections | Readers must immediately understand where they are and what القسم العلمي means in this site | LOW | Requires the fixed section taxonomy and Arabic labels; do not add speculative sections or English UI | HIGH |
| Homepage and crawlable section indexes | Readers and crawlers need a path from the homepage to every launch article | LOW | Requires published-content enumeration and real `<a href>` links; section indexes should show title and a short useful summary | HIGH |
| Clear article reading page | A title, short introduction, well-ordered headings, body, section context, and obvious end state are basic knowledge-base ergonomics | LOW | Requires a reusable article layout and Markdown heading rules; a table of contents is conditional, not universal | HIGH |
| Correct Arabic RTL and bidirectional rendering | Broken punctuation, URLs, numbers, or player controls make Arabic content feel untrustworthy | MEDIUM | Requires `lang="ar"`, document-level `dir="rtl"`, logical CSS properties, and isolation for mixed-direction fragments such as URLs | HIGH |
| Responsive, readable Arabic typography | The general audience must be able to read long-form articles comfortably on phones and desktops | LOW | Requires a restrained text width, legible font sizing/line height, visible links, and no horizontal overflow | HIGH |
| Embedded video plus prominent direct YouTube action on every article | This is the product's core handoff; the direct action also survives player, consent, or browser failures | MEDIUM | Requires a valid video ID/URL in article metadata, a responsive player region, descriptive Arabic labels, and a direct canonical YouTube URL | HIGH |
| Fast, stable article loading despite YouTube | Search visitors should reach the answer before a heavyweight third-party player blocks or shifts the page | MEDIUM | Requires reserved player dimensions and deferred/lazy player loading; the text article must not depend on the iframe or client JavaScript | HIGH |
| Accessible reading and navigation baseline | Keyboard, low-vision, and assistive-technology users need equivalent access to the article and YouTube action | MEDIUM | Target WCAG 2.2 AA basics: semantic landmarks/headings, keyboard access, visible focus, sufficient contrast, descriptive links, meaningful image alternatives, titled player, and article text that remains useful without video | HIGH |
| Author and site trust context | Religious and educational claims need a clear answer to “who wrote this and why should I trust it?” | LOW | Requires an Arabic About/author page, visible byline linked to it, and an honest description of expertise; do not fabricate review roles | HIGH |
| Source and freshness cues | Readers need to distinguish cited scholarship, commentary, and current revisions | MEDIUM | Content model should support references plus published/updated dates; show sources where claims depend on them and update dates only when content materially changes | HIGH |
| Unique search-result identity per public page | Every page needs a descriptive title and summary so search users can distinguish it before clicking | LOW | Requires unique Arabic page title, page-specific meta description, canonical URL, one clear page heading, and share-preview metadata; keyword stuffing is excluded | HIGH |
| Discovery controls | Search engines need an explicit inventory and unambiguous crawl/index instructions | LOW | Requires sitemap output, robots directives, canonicals, clean stable URLs, and no draft URLs in production; sitemap submission does not guarantee indexing | HIGH |
| Privacy-conscious discovery and handoff measurement | The owner must know whether Google discovery and outbound YouTube actions validate the model | MEDIUM | Search Console covers queries/impressions/clicks/indexing; add only aggregate page-view and YouTube CTA/player events needed for the stated questions, with provider/legal review before production | HIGH |
| Safe file-based publishing workflow | Markdown/MDX is only credible if malformed metadata, drafts, and broken video links cannot silently publish | MEDIUM | Requires local preview plus build-time validation of title, description, section, slug, dates, author, draft state, and YouTube identifier; no CMS, database, or editorial login | HIGH |
| Representative real content | Empty categories cannot validate navigation, indexing, reading, or the YouTube journey | MEDIUM (content) | Requires at least one reviewed, genuinely useful article and matching video in each section before launch | HIGH |

### Differentiators (Valuable, Not Automatically v1)

| Capability | Value Proposition | Complexity | Dependencies / add trigger | Confidence |
|-----------|-------------------|------------|----------------------------|------------|
| Intent-first article summary (`الخلاصة`) | Gives a general search visitor a useful answer quickly, then invites deeper reading and viewing | LOW | Depends on an editorial template, not automation; suitable for v1 if the author will maintain it consistently | HIGH |
| Manually curated related reading | Builds topical depth without an opaque recommendation system and gives crawlers meaningful internal paths | LOW | Requires enough genuinely related articles; add per article when a real next step exists, never to fill a slot | HIGH |
| Timestamped YouTube handoff | Sends a reader from the relevant article section to the exact matching moment in the video | MEDIUM | Requires editorially maintained timestamps and stable video mapping; add after ordinary direct-link handoff is validated | MEDIUM |
| Ordered lesson series in القسم العلمي | Makes multi-part Islamic lessons navigable with series index, lesson number, and previous/next links | MEDIUM | Add only when at least one real ordered curriculum exists; requires series metadata and ordering validation, but no user progress/account system | HIGH |
| In-page contents and stable heading deep links for long articles | Helps readers scan lengthy refutations or lessons and share a precise section | LOW | Trigger by article structure/length rather than adding empty chrome to every short article | HIGH |
| Lightweight onsite Arabic search | Becomes useful once section browsing is no longer sufficient; supports title/summary/body discovery without a server database | MEDIUM | Requires a materially larger corpus, Arabic relevance testing, and a static search index; not justified for three launch articles | MEDIUM |
| Accurate Article/Breadcrumb structured data | May help Google understand page type, author, dates, and hierarchy; it does not create or guarantee indexing | LOW | Requires visible page facts to match JSON-LD and validation in Rich Results Test; use Article, not NewsArticle, and add only applicable properties | HIGH |
| Public correction or revision note for materially changed claims | Strengthens trust in sensitive educational content without building a workflow product | LOW | Requires an actual editorial correction policy and meaningful changes; Git history alone is not a reader-facing explanation | MEDIUM |

### Anti-Features (Deliberately Avoid)

| Anti-feature | Why It May Be Requested | Why It Is Problematic Here | Minimum Alternative | Confidence |
|-------------|-------------------------|----------------------------|---------------------|------------|
| Browser CMS, admin dashboard, authentication, or database | Familiar editorial convenience | Rebuilds capabilities the file workflow already supplies and expands security/operations scope before publishing is validated | Markdown/MDX, local preview, schema validation, version control | HIGH |
| Accounts, comments, reactions, forums, or community profiles | Can appear to create engagement | Introduces moderation, abuse, privacy, and religious-advice risk without supporting the search-to-YouTube objective | Clear contact/correction route outside the article experience if later needed | HIGH |
| AI-written articles, automatic transcript import, or bulk paraphrasing | Promises rapid catalog growth | Risks thin, inaccurate, duplicated, or unattributed religious content and conflicts with manual authorship/review decisions | Manually authored articles; use the video only as source material under editorial control | HIGH |
| Full YouTube back-catalog migration before launch | Makes the site look comprehensive | Delays validation and encourages low-care pages | One strong real article per section, then migrate based on search/user demand | HIGH |
| English version or generalized multilingual infrastructure | Seems to expand reach | Doubles editorial and canonical/hreflang work while the product is intentionally Arabic-only | Correct `lang="ar"` and RTL; revisit only with a funded second-language plan | HIGH |
| Full-text search, faceted filters, tag clouds, or deep taxonomy at launch | “Knowledge bases should have search” | With three articles these create empty states, duplicate archives, and maintenance without improving discovery | Three section indexes and descriptive internal links; add search when browsing becomes insufficient | HIGH |
| Separate watch pages or VideoObject markup solely to chase video rich results | Video SEO sounds adjacent to the YouTube strategy | Google expects video to be the main content on a dedicated watch page for video features; these articles are intentionally useful text pages with supporting embeds | Optimize article discovery and link to YouTube; create watch pages only if onsite video becomes a genuine product | HIGH |
| Autoplay, sticky players, eager iframe loading, or video popovers | May increase play counts | Harms consent, bandwidth, accessibility, reading focus, and Core Web Vitals | Reserved, deferred inline player plus explicit watch-on-YouTube button | HIGH |
| SEO doorway pages, programmatic keyword variants, or generic “AI overview” pages | Can look like a shortcut to organic traffic | Produces search-engine-first content and weakens trust/topic focus | One people-first page per real search intent with original, reviewed value | HIGH |
| Custom analytics platform, session replay, fingerprinting, or per-reader profiles | More data appears more rigorous | Collects more personal data and code than the validation questions require | Search Console plus minimal aggregate page and YouTube-action events | HIGH |
| Course enrollment, progress tracking, quizzes, certificates, or lesson gating | Structured lessons can be mistaken for an LMS | Requires identity/state and distracts from public crawlable learning content | Public ordered series with previous/next navigation | HIGH |
| Automated “related content” or personalization engine | Promises engagement at scale | Sparse data makes results arbitrary and adds client/server complexity | Editorial related links based on genuine topical continuity | HIGH |

## Feature Dependencies

```text
[Fixed three-section taxonomy]
    ├──requires──> [Validated article metadata]
    │                  ├──enables──> [Homepage + section indexes]
    │                  ├──enables──> [Unique SEO metadata + sitemap]
    │                  └──enables──> [Safe YouTube mapping]
    └──enables──> [Crawlable internal navigation]

[Useful standalone Arabic article]
    ├──requires──> [RTL + responsive reading layout]
    ├──requires──> [Authorship/source context]
    └──leads-to──> [Deferred embed + direct YouTube action]

[Real ordered lesson corpus]
    └──justifies──> [Series index + previous/next navigation]

[Larger, hard-to-scan corpus]
    └──justifies──> [Static onsite Arabic search]

[Article is the main page content]
    └──conflicts-with──> [Watch-page/VideoObject strategy solely for video rich results]

[Privacy-conscious measurement]
    └──conflicts-with──> [Session replay, fingerprinting, per-reader profiles]
```

### Dependency Notes

- **Validated metadata precedes generated discovery:** Section indexes, canonical URLs, sitemap entries, authorship, and YouTube links should all come from the same checked article facts.
- **The article precedes the player:** The HTML article must remain complete, crawlable, and useful when third-party video code is blocked or has not loaded.
- **Trust features require real editorial facts:** A byline, reviewer, updated date, reference, or correction note must describe an actual person or event—not exist only for SEO markup.
- **Series navigation requires actual order:** Do not create a generic course abstraction until a real set of ordered lessons proves the fields and navigation behavior.
- **Onsite search requires corpus pressure:** Add it when users can no longer find content through section indexes and contextual links, then test Arabic matching and relevance against real queries.
- **Analytics follows named questions:** Measure Google discovery, article consumption at an aggregate level, and YouTube actions; new events need a decision they will change.

## MVP Definition

### Launch With (v1)

- [ ] Arabic-only homepage and navigation exposing الردود والشبهات, القضايا العامة, and القسم العلمي.
- [ ] One crawlable index for each section, with useful article summaries and no empty launch section.
- [ ] Reusable, responsive RTL article layout with accessible semantic structure.
- [ ] One real, reviewed article and matching video per section.
- [ ] Per-article embedded YouTube player with reserved/deferred loading and a prominent direct YouTube action.
- [ ] Visible author byline/profile, published or materially updated dates, and support for references.
- [ ] Unique Arabic title, meta description, canonical URL, stable clean URL, share preview, sitemap, and robots directives.
- [ ] Search Console ownership/submission and minimal privacy-conscious measurement of page visits and YouTube actions.
- [ ] Markdown/MDX local preview and build-time content validation, including exclusion of drafts.
- [ ] Basic accessibility and performance verification on representative mobile and desktop sizes.
- [ ] Prefer an editorial `الخلاصة` summary in launch articles if it can be maintained consistently; it is the one low-cost v1 differentiator.

### Add After Validation (v1.x)

- [ ] Manually curated related articles — once more than one genuine next step exists.
- [ ] In-page contents and heading links — for articles whose structure is long enough to benefit.
- [ ] Timestamped YouTube actions — when editors can reliably maintain section-to-video timestamps.
- [ ] Ordered lesson series — when the first real multi-part curriculum is ready.
- [ ] Article/Breadcrumb structured data — after visible author/date/breadcrumb facts are stable and can be validated.
- [ ] Lightweight onsite search — only when section browsing and internal links show real discovery friction.

### Future Consideration (v2+)

- [ ] Broader archive migration — prioritize topics using Search Console demand and editorial capacity.
- [ ] Public correction/revision notes — formalize when material corrections become frequent enough to need a reader-facing convention.
- [ ] Dedicated onsite video/watch experience — only if product evidence changes the article-first strategy; it is not a route to manufacture video rich results.

## Feature Prioritization Matrix

| Capability | User / operator value | Implementation cost | Priority |
|-----------|-----------------------|---------------------|----------|
| Three-section Arabic navigation and indexes | HIGH | LOW | P1 |
| RTL responsive article reading | HIGH | MEDIUM | P1 |
| Embedded player + direct YouTube action | HIGH | MEDIUM | P1 |
| Fast/stable third-party video loading | HIGH | MEDIUM | P1 |
| Accessible semantic baseline | HIGH | MEDIUM | P1 |
| Author/source/freshness trust signals | HIGH | MEDIUM | P1 |
| Per-page SEO identity + discovery files | HIGH | LOW | P1 |
| Validated Markdown/MDX publishing | HIGH | MEDIUM | P1 |
| Search Console + minimal aggregate events | HIGH | MEDIUM | P1 |
| Three representative real articles | HIGH | MEDIUM (content) | P1 |
| Intent-first `الخلاصة` | HIGH | LOW (content) | P1 if maintained |
| Manual related reading | MEDIUM | LOW | P2 |
| Long-article contents/deep links | MEDIUM | LOW | P2 |
| Timestamped YouTube handoff | MEDIUM | MEDIUM | P2 |
| Ordered lesson series | HIGH when corpus exists | MEDIUM | P2, trigger-based |
| Article/Breadcrumb structured data | MEDIUM | LOW | P2 |
| Lightweight Arabic onsite search | HIGH at scale, LOW at launch | MEDIUM | P2, trigger-based |
| Public corrections convention | MEDIUM | LOW | P3 |
| Dedicated onsite watch pages | LOW under current strategy | HIGH | P3 / avoid |

**Priority key:**

- **P1:** Must have for launch or validates the core journey.
- **P2:** Add only after its stated content/usage trigger.
- **P3:** Future consideration; evidence must first change current scope.

## Competitor Pattern Check

This is a pattern check, not a mandate to copy mature portals whose catalogs and teams are much larger.

| Capability | الإسلام سؤال وجواب (observed 2026-08-26) | موقع الشيخ ابن باز (observed 2026-08-26) | Recommended approach here |
|-----------|-------------------------------------------|------------------------------------------|---------------------------|
| Topic navigation | Prominent categories and search | Prominent content families including فتاوى, دروس, صوتيات, and مرئيات | Keep exactly three plain section indexes; breadth is not a launch goal |
| Onsite search | Present for a large archive | Present for a large archive | Defer until this catalog is no longer easily scannable |
| Media breadth | Articles/questions are organized within a broad information portal | Separate lesson, audio, and video areas | Keep one focused article-to-matching-YouTube path; no media portal |
| Trust/identity | Strong named-site/editorial identity | Strong named-scholar identity | Make Ahmed El-Mangawy's authorship, background, and sources explicit without inventing institutional review |
| Content volume | Large established catalog | Large established catalog | Launch with three representative real articles and expand from observed demand |

## Sources

### Primary standards and current platform guidance

- [Google: Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) — bylines, author background, clear sourcing, and people-first content; last updated 2025-12-10. **HIGH confidence.**
- [Google: SEO link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) — real anchor links, crawlability, and descriptive anchor text; last updated 2025-12-10. **HIGH confidence.**
- [Google: Influencing title links](https://developers.google.com/search/docs/appearance/title-link) — descriptive, concise, distinct page titles; last updated 2025-12-10. **HIGH confidence.**
- [Google: How to write meta descriptions](https://developers.google.com/search/docs/appearance/snippet) — page-specific snippet guidance; last updated 2026-04-20. **HIGH confidence.**
- [Google: Canonical URL methods](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) — canonicalization guidance; last updated 2026-07-10. **HIGH confidence.**
- [Google: What is a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) — internal linking remains primary; sitemap helps discovery but does not guarantee crawl/indexing. **HIGH confidence.**
- [Google: Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article) — Article properties, author URL, dates, and the fact that there are no required properties. **HIGH confidence.**
- [Google: Video SEO best practices](https://developers.google.com/search/docs/appearance/video) — dedicated watch page/main-video requirements for video features; last updated 2025-12-18. **HIGH confidence.**
- [Google: Core Web Vitals and Search](https://developers.google.com/search/docs/appearance/core-web-vitals) — loading, interactivity, and visual-stability guidance; last updated 2025-12-10. **HIGH confidence.**
- [Google: How to use Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start) — crawl/index status plus query/page/country impressions and clicks; last updated 2025-12-10. **HIGH confidence.**
- [YouTube: Embedded players and player parameters](https://developers.google.com/youtube/player_parameters) — iframe requirements, caption parameters, and deprecated player parameters; last updated 2026-04-28. **HIGH confidence.**
- [W3C Internationalization: Structural markup and RTL text in HTML](https://www.w3.org/International/questions/qa-html-dir) — document `dir="rtl"`, runtime `dir="auto"`, and bidirectional isolation guidance. **HIGH confidence.**
- [W3C: Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/) — keyboard, contrast, headings/labels, visible focus, target size, and page language requirements. **HIGH confidence.**

### Current competitor observations

- [الإسلام سؤال وجواب](https://islamqa.info/ar) — homepage navigation/categories and search observed 2026-08-26. **MEDIUM confidence** for ecosystem patterns; no claim that its scope should be copied.
- [موقع الشيخ ابن باز](https://binbaz.org.sa/) — homepage search and content families (فتاوى، دروس، صوتيات، مرئيات) observed 2026-08-26. **MEDIUM confidence** for ecosystem patterns; mature-archive features are not launch requirements here.

## Open Questions for Later Phases

- What exact privacy/consent obligations apply to the chosen hosting, analytics provider, visitor geography, and YouTube embed behavior? Resolve before production analytics/player configuration.
- Does the first real القسم العلمي material form an ordered curriculum? If not, omit series fields from v1.
- Which Arabic URL-slug convention best balances readability, sharing, and owner preference? This affects URL stability and should be locked before publication.
- Will launch articles consistently include original video thumbnails/images with appropriate rights? If not, use a simple site-level share image and avoid pretending every article has unique imagery.

---
*Feature research for: مدونة أحمد المنجاوي*  
*Researched: 2026-08-26*
