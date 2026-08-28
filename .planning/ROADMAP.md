# Roadmap: مدونة أحمد المنجاوي

## Overview

The v1 roadmap establishes a safe file-based content and URL contract, proves one complete Arabic article-to-YouTube journey, expands that same model to the three launch sections, then makes discovery signals, measurement, and production behavior verifiably consistent. The sequence stays fully static and deliberately excludes the deferred CMS, database, authentication, search, community, and AI-generation scope.

## Phases

- [x] **Phase 1: Content and URL Contract** - The owner can maintain validated Markdown/MDX content with stable public identities. (completed 2026-08-26)
- [x] **Phase 2: Complete Arabic Article Journey** - A reader can consume one accessible RTL article and continue to its matching YouTube content. (completed 2026-08-26)
- [x] **Phase 3: Real Content and Section Discovery** - Visitors can discover truthful launch content across the homepage and all three primary sections. (completed 2026-08-27)
- [x] **Phase 4: Search Discovery Integrity** - Every public route presents one consistent, crawlable identity to readers and search engines. (completed 2026-08-27)
- [ ] **Phase 5: Deployment and Measurement** - Repository work is complete; owner-controlled production and measurement evidence remains pending.
- [ ] **Phase 6: Production Launch Verification** - Production behavior is verified across crawlability, Arabic presentation, links, and performance.

## Phase Details

### Phase 1: Content and URL Contract

**Goal:** As a site owner, I want to maintain safe previewable Arabic articles, so that public surfaces use stable identities.
**Mode:** mvp
**Depends on:** Nothing (first phase)
**Requirements:** SEO-01, PUB-01, PUB-02, PUB-03, PUB-04, PUB-05, PUB-06
**Success Criteria** (what must be TRUE):

  1. The owner can create or edit an article as Markdown/MDX and preview the same validated content model locally.
  2. A published article keeps its explicit clean Arabic slug when its title changes, while the build rejects missing metadata, duplicate routes, non-normalized identifiers, unsafe Unicode, invalid dates, and invalid YouTube identifiers.
  3. Draft records are excluded from public content queries, and MDX cannot use components, scripts, or iframe sources outside the small approved set.
  4. The owner can add a future primary section through the central section and content configuration without creating a separate application or rewriting the article model.

**Plans:** 3/3 plans complete
**UI hint:** yes

### Phase 2: Complete Arabic Article Journey

**Goal:** As a reader of Arabic, I want to read a complete accessible article and reach its matching YouTube video, so that I can learn even when media or JavaScript is unavailable.
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** SITE-01, SITE-02, ART-01, ART-02, ART-03, ART-04, ART-05, ART-06, ART-07, QUAL-01, QUAL-02, QUAL-03, QUAL-04
**Success Criteria** (what must be TRUE):

  1. Every public surface in the article journey exposes Arabic-only reader-facing text with Arabic language and right-to-left document semantics.
  2. A reader can understand the complete article—including its title, maintained الخلاصة, introduction, ordered headings, body, section, conclusion, author, truthful date, and needed references—without JavaScript or video playback.
  3. Long-form Arabic text remains readable without clipping or horizontal page overflow on supported mobile and desktop widths, and mixed-direction URLs, numbers, punctuation, and diacritics appear in the correct order.
  4. A keyboard or assistive-technology user can navigate semantic landmarks and headings, understand descriptive labels and alternatives, operate every control with visible focus, and encounter no keyboard trap.
  5. The responsive, dimension-reserved, privacy-enhanced YouTube player loads only after reader intent, while a prominent Arabic direct link remains usable when the player, JavaScript, or third-party cookies are unavailable.

**Plans:** 4/4 plans complete
**UI hint:** yes

### Phase 3: Real Content and Section Discovery

**Goal:** As a visitor, I want to discover substantive, source-backed launch content through the homepage, three section indexes, and truthful author context, so that I can find relevant material and understand who published it.
**Mode:** mvp
**Depends on:** Phase 2
**Requirements:** SITE-03, SITE-04, SITE-05, CONT-01, CONT-02, CONT-03
**Success Criteria** (what must be TRUE):

  1. A visitor can follow ordinary crawlable homepage links to الردود والشبهات, القضايا العامة, and القسم العلمي, with القسم العلمي clearly presented as structured Islamic scholarship.
  2. Each primary section has a crawlable Arabic index that gives a useful summary and link for every published article in that section.
  3. A visitor can open an Arabic About/author page from any article byline and find truthful information about Ahmed El-Mangawy.
  4. Each primary section contains at least one substantive Arabic article with a real matching YouTube video, cited supporting sources, truthful author/date facts, transparent AI-assistance disclosure when applicable, and no fabricated review claim.

**Plans:** 4/4 plans complete
**UI hint:** yes

### Phase 4: Search Discovery Integrity

**Goal:** Readers and crawlers receive one accurate, consistent identity and indexing policy for every public route.
**Mode:** mvp
**Depends on:** Phase 3
**Requirements:** SITE-06, SEO-02, SEO-03, SEO-04, SEO-05
**Success Criteria** (what must be TRUE):

  1. Every indexable page has a unique descriptive Arabic title, meta description, and one clear primary heading.
  2. Every indexable page emits a self-consistent canonical URL and accurate social metadata derived from the configured production origin.
  3. Crawlers and visitors can reach every published article through ordinary HTML links, while drafts and non-public records appear in no public route or discovery output.
  4. The deployed sitemap contains only canonical published routes, and robots directives agree with the intended indexing policy.
  5. A visitor who opens a missing route receives a useful Arabic 404 page with a clear link back into the site.

**Plans:** 3/3 plans complete
**UI hint:** yes

### Phase 5: Deployment and Measurement

**Goal:** As a site owner, I want to operate the canonical production site and measure the intended discovery-to-YouTube journey without identifying individual readers, so that I can confirm the real production and measurement path works as intended.
**Mode:** mvp
**Depends on:** Phase 4
**Requirements:** SEO-06, MEAS-01, MEAS-02
**Success Criteria** (what must be TRUE):

  1. The canonical production property is reachable and verified in Google Search Console with its canonical sitemap submitted for crawl and index monitoring.
  2. The owner can view aggregate page traffic without session replay, fingerprinting, or per-reader profiles.
  3. The owner can measure one outbound YouTube activation per link action, reported as a link click rather than a video view.

**Plans:** 2/2 plans complete
**UI hint:** yes

### Phase 6: Production Launch Verification

**Goal:** The deployed release demonstrates that its performance and search-discovery contracts hold on representative production routes.
**Mode:** mvp
**Depends on:** Phase 5
**Requirements:** QUAL-05, QUAL-06
**Success Criteria** (what must be TRUE):

  1. Representative production pages preserve good Core Web Vitals behavior and neither load nor shift the real YouTube iframe before reader activation.
  2. A production crawl confirms successful public routes, matching canonicals, unique Arabic metadata, working internal links, correct sitemap and robots output, and no accidental English reader-facing text.

**Plans:** TBD
**UI hint:** yes

## Progress

**Execution Order:** Phases execute in numeric order from 1 through 6.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Content and URL Contract | 3/3 | Complete    | 2026-08-26 |
| 2. Complete Arabic Article Journey | 4/4 | Complete    | 2026-08-26 |
| 3. Real Content and Section Discovery | 4/4 | Complete   | 2026-08-27 |
| 4. Search Discovery Integrity | 3/3 | Complete    | 2026-08-28 |
| 5. Deployment and Measurement | 2/2 | Verification pending | - |
| 6. Production Launch Verification | 0/TBD | Not started | - |
