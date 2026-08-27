# Requirements: مدونة أحمد المنجاوي

**Defined:** 2026-08-26
**Core Value:** Arabic search users can find a useful, relevant article on Google and continue directly to the matching content on Ahmed El-Mangawy's YouTube channel.

## v1 Requirements

Requirements for the first production release. Each requirement will map to exactly one roadmap phase.

### Public Site Structure

- [x] **SITE-01**: A visitor sees only Arabic reader-facing navigation, labels, controls, messages, and error states across the public website.
- [x] **SITE-02**: A browser and assistive technology receive Arabic language and right-to-left document semantics on every public page.
- [x] **SITE-03**: A visitor can navigate from the homepage to الردود والشبهات, القضايا العامة, and القسم العلمي through ordinary crawlable links.
- [x] **SITE-04**: A visitor can open a crawlable index for each primary section and see a useful Arabic summary and link for every published article in that section.
- [x] **SITE-05**: A visitor can open an Arabic About/author page and follow every article byline to truthful information about Ahmed El-Mangawy.
- [ ] **SITE-06**: A visitor who opens a missing route receives a useful Arabic 404 page with a clear path back into the site.

### Article Experience

- [x] **ART-01**: A reader can consume a published article with a clear title, introduction, ordered headings, body, section context, and conclusion without depending on video or client-side JavaScript.
- [x] **ART-02**: A reader can comfortably read long-form Arabic articles on supported mobile and desktop widths without clipped text or horizontal page overflow.
- [x] **ART-03**: A reader sees URLs, numbers, punctuation, Arabic diacritics, and other mixed-direction fragments in the correct order within RTL content.
- [x] **ART-04**: Every article presents a responsive, dimension-reserved, privacy-enhanced YouTube player that loads the real player only after reader intent.
- [x] **ART-05**: Every article presents a prominent Arabic direct link to its matching YouTube video or channel that remains usable when the embedded player is unavailable.
- [x] **ART-06**: Every article visibly presents its author, truthful publication or material-update date, and references wherever its claims depend on external or religious sources.
- [x] **ART-07**: Every article begins with a maintained Arabic الخلاصة that gives the reader a useful intent-focused summary.

### SEO and Discovery

- [x] **SEO-01**: Every published article has an explicit, stable, clean Arabic URL slug that is not silently regenerated when its title changes.
- [ ] **SEO-02**: Every indexable page has a unique descriptive Arabic page title, meta description, and single clear primary heading.
- [ ] **SEO-03**: Every indexable page emits a self-consistent canonical URL and accurate social-sharing metadata derived from the configured production origin.
- [ ] **SEO-04**: Search crawlers can reach every published article through ordinary HTML links, while drafts and non-public content remain absent from public routes and discovery output.
- [ ] **SEO-05**: The deployed site exposes a sitemap containing only canonical published routes and robots directives that agree with the intended indexing policy.
- [ ] **SEO-06**: The production property is verified in Google Search Console and its canonical sitemap is submitted for crawl and index monitoring.

### File-Based Publishing

- [x] **PUB-01**: The owner can create or edit an article as Markdown/MDX and preview the same content model locally before publication.
- [x] **PUB-02**: The production build rejects articles with missing or invalid title, description, section, slug, author, date, draft state, or YouTube identifier fields.
- [x] **PUB-03**: The production build rejects duplicate public routes, non-normalized slugs, and unsafe control or bidirectional characters in URL identifiers.
- [x] **PUB-04**: An article marked as a draft cannot appear in production routes, indexes, metadata, or the sitemap.
- [x] **PUB-05**: MDX content can use only the small approved component set and cannot introduce arbitrary scripts or unreviewed iframe sources.
- [x] **PUB-06**: A future primary section can be added through the central section/content configuration without creating a separate application or rewriting existing article layouts.

### Content and Editorial Trust

- [x] **CONT-01**: The launch contains at least one substantive Arabic article with a real matching YouTube video in each of the three primary sections.
- [x] **CONT-02**: Every launch article records its matching video and supporting sources, discloses AI assistance when used, and makes no human-review claim unless that review actually occurred.
- [x] **CONT-03**: Public bylines, expertise descriptions, dates, references, and review claims reflect real people, sources, and events rather than SEO-only placeholders.

### Measurement

- [ ] **MEAS-01**: The owner can view privacy-conscious aggregate page traffic without session replay, fingerprinting, or per-reader profiles.
- [ ] **MEAS-02**: The owner can measure one clearly defined outbound YouTube activation per user action, reported as a link click rather than a video view.

### Accessibility and Production Quality

- [x] **QUAL-01**: A reader receives semantic landmarks and headings, descriptive links, meaningful image alternatives, and an accessible Arabic label for the video player and YouTube action.
- [x] **QUAL-02**: A keyboard user can reach and operate every interactive public control with a visible focus indicator and no keyboard trap.
- [x] **QUAL-03**: Text, controls, zoom, and responsive reflow meet applicable WCAG 2.2 AA contrast and layout requirements on representative pages.
- [x] **QUAL-04**: A reader can access the complete article and direct YouTube link when JavaScript, third-party cookies, or the YouTube player is blocked.
- [ ] **QUAL-05**: Representative production pages preserve good Core Web Vitals behavior and do not load or shift the real YouTube iframe before reader activation.
- [ ] **QUAL-06**: A production crawl confirms successful public routes, matching canonicals, unique Arabic metadata, working internal links, correct sitemap/robots output, and no accidental English reader-facing text.

## v2 Requirements

Deferred capabilities. They are excluded from the initial roadmap until their stated trigger exists.

### Content Discovery

- **DISC-01**: Readers can follow manually curated related-article links once multiple genuine next steps exist.
- **DISC-02**: Readers can search a static Arabic index once section browsing and contextual links become demonstrably insufficient for the corpus.

### Long-Form Reading

- **READ-01**: Readers can use an in-page contents list and stable heading links on articles whose length and structure justify them.
- **READ-02**: Readers can open a public correction or revision note when materially changed claims make a formal convention necessary.

### Video and Lessons

- **VID-01**: Readers can follow editorially maintained links to relevant YouTube timestamps once reliable article-to-video mappings exist.
- **LEARN-01**: Readers can navigate an ordered lesson series with lesson numbers and previous/next links once a real multi-part curriculum exists.

### Enhanced Search Presentation

- **SEO-07**: Applicable article and breadcrumb structured data mirrors stable visible author, date, and hierarchy facts and passes current validation tooling.

### Content Expansion

- **CONT-04**: The owner can migrate more of the YouTube archive according to observed search demand and editorial capacity after the three-article launch model is validated.
- **WATCH-01**: Readers can use a dedicated onsite watch experience only if evidence changes the current article-first product strategy.

## Out of Scope

Explicit exclusions prevent scope creep during v1.

| Feature | Reason |
|---------|--------|
| English or multilingual website | The product is intentionally Arabic-only; translation, locale routing, and hreflang are not justified. |
| Browser CMS or administration dashboard | Markdown/MDX plus local preview and validation is the selected v1 workflow. |
| Database, authentication, or reader accounts | No v1 capability requires request-time state or identity. |
| Comments, forums, reactions, or community profiles | They introduce moderation, privacy, and religious-advice risk without supporting the core journey. |
| Unattended transcript automation or bulk paraphrasing | The three launch articles are intentionally drafted from verified video metadata and cited sources; no transcript or mass-generation pipeline is used. |
| Full YouTube catalog migration before launch | Three substantive representative articles are sufficient to validate the model. |
| Search, filters, tags, or deep taxonomy at launch | Three section indexes are simpler and sufficient for the launch corpus. |
| Separate watch pages or VideoObject markup for rich-result manipulation | Articles are useful text pages with supporting media, not dedicated video watch pages. |
| Autoplay, sticky players, eager iframes, or video popovers | They harm reading focus, privacy, accessibility, and performance. |
| Doorway pages or programmatic keyword variants | The site requires one original, people-first page per genuine search intent. |
| Session replay, fingerprinting, or per-reader analytics profiles | Aggregate discovery and outbound-click measurement fully serves the validation goal. |
| Enrollment, progress tracking, quizzes, certificates, or lesson gating | القسم العلمي remains public scholarship, not an LMS. |
| Automated recommendations or personalization | Curated links are sufficient when real related content exists. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SITE-01 | Phase 2 | Complete |
| SITE-02 | Phase 2 | Complete |
| SITE-03 | Phase 3 | Complete |
| SITE-04 | Phase 3 | Complete |
| SITE-05 | Phase 3 | Complete |
| SITE-06 | Phase 4 | Pending |
| ART-01 | Phase 2 | Complete |
| ART-02 | Phase 2 | Complete |
| ART-03 | Phase 2 | Complete |
| ART-04 | Phase 2 | Complete |
| ART-05 | Phase 2 | Complete |
| ART-06 | Phase 2 | Complete |
| ART-07 | Phase 2 | Complete |
| SEO-01 | Phase 1 | Complete |
| SEO-02 | Phase 4 | Pending |
| SEO-03 | Phase 4 | Pending |
| SEO-04 | Phase 4 | Pending |
| SEO-05 | Phase 4 | Pending |
| SEO-06 | Phase 5 | Pending |
| PUB-01 | Phase 1 | Complete |
| PUB-02 | Phase 1 | Complete |
| PUB-03 | Phase 1 | Complete |
| PUB-04 | Phase 1 | Complete |
| PUB-05 | Phase 1 | Complete |
| PUB-06 | Phase 1 | Complete |
| CONT-01 | Phase 3 | Complete |
| CONT-02 | Phase 3 | Complete |
| CONT-03 | Phase 3 | Complete |
| MEAS-01 | Phase 5 | Pending |
| MEAS-02 | Phase 5 | Pending |
| QUAL-01 | Phase 2 | Complete |
| QUAL-02 | Phase 2 | Complete |
| QUAL-03 | Phase 2 | Complete |
| QUAL-04 | Phase 2 | Complete |
| QUAL-05 | Phase 6 | Pending |
| QUAL-06 | Phase 6 | Pending |

**Coverage:**

- v1 requirements: 36 total
- Mapped to phases: 36
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-26*
*Last updated: 2026-08-27 after the owner authorized autonomous source-backed launch content*
