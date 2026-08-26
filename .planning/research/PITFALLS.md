# Pitfalls Research

**Domain:** Arabic-only, RTL, SEO-focused Islamic Markdown/MDX knowledge site with YouTube conversion
**Researched:** 2026-08-26
**Confidence:** HIGH for search, web-platform, YouTube, and accessibility behavior; MEDIUM for editorial trust recommendations because the site's religious methodology and review authority are product decisions

## Executive Finding

This project can look finished while failing its purpose. A rendered Arabic page is not necessarily semantically RTL; an XML sitemap is not necessarily consistent with canonicals; a YouTube button event is not necessarily a trustworthy click count; valid JSON-LD is not necessarily truthful or eligible for a Google enhancement. The roadmap should therefore make the publishing contract, URL identity, Arabic shell, discovery signals, and measurement definition explicit before launch.

The minimum reliable control set is small: immutable validated slugs, a build-time content validator, semantic `lang="ar" dir="rtl"`, a single metadata/canonical/sitemap generator, a deferred privacy-enhanced YouTube embed plus plain link, and one clearly defined outbound-click event. The final phase must crawl the production build and inspect representative pages rather than treating a successful framework build as launch verification.

## Suggested Phase Ownership

The roadmap may rename or renumber these phases; the ownership boundaries matter more than the labels.

1. **Content Contract and URL Model** — frontmatter schema, section enum, immutable slug rules, source/citation fields.
2. **Arabic Shell and Accessibility** — semantic RTL, bidi isolation, responsive typography, navigation, Arabic-only states.
3. **Article Publishing and Editorial Trust** — layouts, real articles, author/about context, visible citations and review data.
4. **Search Discovery** — titles/descriptions, canonicals, robots, sitemap, structured data, redirects.
5. **YouTube Conversion and Measurement** — embed facade/lazy loading, privacy-enhanced player, direct link, click event.
6. **Production Launch Verification** — crawl rendered output, validate schemas and feeds, mobile/a11y checks, Search Console submission and post-launch observation.

## Critical Pitfalls

### Pitfall 1: RTL Styling Without Correct Arabic and Bidi Semantics

**What goes wrong:**
The page looks right-aligned, but assistive technology, selection, punctuation, numbers, Latin abbreviations, YouTube URLs, and copied text behave incorrectly. A URL or number can visually jump to the wrong side of a sentence, and an invisible bidi control can make a slug or label appear different from its stored value.

**Why it happens:**
Developers use `direction: rtl` and `text-align: right` as visual fixes, apply RTL to every descendant, or paste directional control characters into content. CSS direction alone does not declare the document language, and unisolated mixed-direction inline text follows the Unicode Bidirectional Algorithm in ways that are not obvious from simple Arabic-only fixtures.

**How to avoid:**
- Put `lang="ar" dir="rtl"` on the root `html` element; use logical CSS properties (`margin-inline-*`, `padding-inline-*`, `inset-inline-*`, `text-align: start`).
- Isolate unpredictable mixed-direction fragments with semantic markup such as `<bdi dir="auto">`; use `dir="ltr"` only for intrinsically LTR tokens such as a displayed URL or code.
- Preserve Arabic diacritics in article text, but reject bidi control characters from identifiers and slugs. Normalize identifiers to Unicode NFC before uniqueness checks.
- Do not mirror media, brand marks, play icons, or other icons whose meaning is not directional.

**Warning signs:**
Punctuation appears at the opposite edge; numerals reorder around parentheses; selecting or copying mixed Arabic/URL text changes the apparent order; layout CSS contains many `left`/`right` declarations; the root has no `lang` or `dir`; visually identical slugs compare unequal.

**Verification:**
Inspect generated HTML for root language/direction attributes. Test fixtures containing Arabic with Arabic-Indic and European digits, parentheses, a YouTube URL, an English acronym, and fully vocalized Quranic text. Copy/paste the rendered mixed-direction sentence into plain text, navigate it with the keyboard, and run a screen-reader smoke test. Scan slug values for Unicode bidi controls and NFC-normalize before collision testing. [S10][S11][S12][S15]

**Phase to address:**
Phase 1 owns identifier normalization; Phase 2 owns document and component semantics; Phase 6 repeats mixed-direction acceptance tests.

---

### Pitfall 2: Slugs That Are Malformed, Colliding, or Changed With the Title

**What goes wrong:**
Articles acquire multiple addresses, old search results return 404, Arabic slugs are double-encoded, and two visually similar titles map to the same URL. Links, sitemap entries, canonicals, and analytics then identify the same article differently.

**Why it happens:**
The path is derived from the current title at every build, URL encoding is applied in more than one layer, or filename, frontmatter, and route parameters each become competing identifiers. Arabic Unicode normalization and invisible control characters are often ignored.

**How to avoid:**
- Make one explicit frontmatter `slug` the immutable public identifier. A title edit must not change it.
- Choose one documented shape, for example `/{section}/{slug}/`; use UTF-8 Arabic words and hyphens, not opaque IDs, underscores, query parameters, or fragments.
- Validate at build time: trimmed value, NFC normalization, no slash/backslash, `.`/`..`, query/fragment delimiters, control/bidi characters, leading/trailing or repeated hyphens, and no collision after normalization.
- Encode only when constructing the URL; store and compare the normalized human-readable slug. If an already-published slug changes, add a permanent redirect from the exact old path and update internal links.

**Warning signs:**
The same article appears under a filename path and a frontmatter path; `%25D8...` appears in a URL; changing a title changes the output path; the sitemap contains both encoded and decoded-looking variants; slug uniqueness is checked only as raw bytes.

**Verification:**
Run a build-time table test with Arabic, diacritics, whitespace, reserved characters, NFC/NFD equivalents, and duplicated slugs across sections. Crawl the production output and assert exactly one 200 URL and one self-canonical per article. For any deliberate rename, assert the old URL redirects directly to the new canonical without a chain. Google recommends simple descriptive UTF-8 URLs in the audience's language and hyphens between words. [S1]

**Phase to address:**
Phase 1, before real content is published; redirect verification belongs to Phase 4 and Phase 6.

---

### Pitfall 3: Conflicting Canonical, Robots, Sitemap, and Environment Signals

**What goes wrong:**
Google crawls the site but indexes the wrong host or no pages at all. Preview URLs become canonical, production retains `noindex`, sitemap URLs disagree with page canonicals, or `robots.txt` blocks pages that need to be crawled to observe `noindex` or metadata.

**Why it happens:**
Each SEO artifact is hand-built separately, the public origin is inferred from a deployment request, or preview/staging protection is copied into production. A technically valid sitemap is mistaken for proof of indexing.

**How to avoid:**
- Define one validated production origin and one URL builder used by canonicals, sitemap entries, structured data, and internal links.
- Emit a self-canonical absolute URL for every indexable page. Sitemap only canonical 200 pages and use accurate `lastmod` only for significant content changes.
- Redirect HTTP/alternate-host/trailing-slash variants once to the canonical form. Never use `robots.txt` as an indexing-removal mechanism; Google explicitly says it controls crawler access, not whether a URL can remain indexed.
- Keep preview deployments unavailable to indexing through platform access controls or explicit `noindex`; separately assert that production pages do not carry preview directives.
- Do not list drafts, 404s, redirects, or `noindex` pages in the sitemap.

**Warning signs:**
Canonicals contain `localhost`, a preview host, or mixed trailing-slash rules; `robots.txt` says `Disallow: /`; sitemap URLs redirect; the same page has canonical A while the sitemap lists B; every build changes `lastmod`; production HTML contains `noindex`.

**Verification:**
After production deployment, fetch `/robots.txt`, `/sitemap.xml`, the homepage, every section index, and one article per section. Parse the sitemap and assert every entry returns 200, is on the production origin, is indexable, and matches the page's single canonical. Verify excluded drafts are absent. Submit the sitemap in Search Console and use URL Inspection on representative pages; treat discovered/crawled/indexed as observed states, not an immediate guarantee. [S2][S3][S4][S5]

**Phase to address:**
Phase 4 implements one signal pipeline; Phase 6 verifies it on the real production origin and starts post-launch observation.

---

### Pitfall 4: Thin, Duplicated, or Search-First Content That Satisfies Routes but Not Readers

**What goes wrong:**
The site launches with three technically indexable pages that mostly repeat video descriptions, embed a player, or target keyword variants without answering the query. Section pages contain only cards. Google may crawl them, but readers leave without gaining enough value and the site earns neither search visibility nor YouTube trust.

**Why it happens:**
The implementation checklist counts files and metadata rather than usefulness. The same transcript, summary, or introduction is republished across categories, and headings are chosen for keywords rather than an Arabic reader's question.

**How to avoid:**
- Give each launch article a distinct search intent and a self-contained, genuinely useful Arabic explanation; the video should deepen the article, not supply the missing answer.
- Use a clear question/topic title, concise opening answer, structured explanation, visible sources, and a contextually relevant video action.
- Give each section index a unique Arabic introduction explaining its scope; do not generate tag/search/filter archives in v1.
- Do not mechanically publish transcript fragments, keyword variants, or near-duplicate summaries. Merge overlapping material and choose one canonical article.

**Warning signs:**
Removing the iframe leaves little useful text; multiple pages differ only in title/keyword; descriptions are copied; every section introduction is the same; articles provide assertions but no explanation or sources; the editorial review asks only whether frontmatter validates.

**Verification:**
Review each launch article against its intended query: can a general reader identify the answer, reasoning, source basis, and next step without playing the video? Compare article text for substantial duplication. Search exact sentences across the repository. Confirm each section page has unique purpose text and only indexable, substantive destinations. Google's current guidance emphasizes helpful, reliable, people-first content and warns against content produced primarily to attract search traffic. [S6]

**Phase to address:**
Phase 3 owns the editorial acceptance checklist; Phase 6 performs a real-content review, not placeholder verification.

---

### Pitfall 5: Generic Metadata or Structured Data That Is Valid but False

**What goes wrong:**
All pages have the same Arabic title/description, titles mix English framework defaults with Arabic, JSON-LD claims an author, date, image, FAQ, or video property that is absent or inaccurate, or markup describes the YouTube video as if the site owns/hosts facts it cannot verify. Rich Results Test passes, yet Google rewrites titles or ignores/removes the enhancement.

**Why it happens:**
Metadata is treated as a template decoration and JSON-LD as a ranking lever. Developers copy examples without mapping every property to visible article data. Google explicitly states valid structured data is not guaranteed to appear and may be ineligible when misleading or hidden.

**How to avoid:**
- Require a distinct Arabic `title` and page-specific Arabic `description`; keep title text concise, descriptive, and in the same language/script as the page.
- Derive one `Article`/`BlogPosting` object from validated visible content. Use the real author identity and accurate published/modified dates; omit unknown optional properties.
- Add `VideoObject` only if required properties can be truthfully sourced and the page is genuinely a watch page centered on that visible video. Do not invent view counts, upload dates, durations, thumbnails, or content URLs.
- Do not add FAQ schema unless an actual visible FAQ exists and current Google feature eligibility justifies it. Schema must mirror what the reader sees.

**Warning signs:**
Every page shares one description; `<title>` contains English such as “Home” or a framework name; structured data is authored separately from frontmatter; generated JSON-LD contains placeholders; hidden FAQ text exists only for schema; tests assert JSON syntax but not semantic equality with visible content.

**Verification:**
For every public route, assert exactly one nonempty Arabic title, one page-specific description, one canonical, and no placeholder/default English. Validate JSON-LD syntax and Google's Rich Results Test, then manually compare author, dates, headline, image, and video properties with visible content and upstream YouTube facts. Confirm markup removal would not remove information that users were otherwise unable to see. [S7][S8][S9][S16][S17][S18]

**Phase to address:**
Phase 4 owns metadata and schema generation; Phase 3 provides truthful source fields; Phase 6 validates representative production URLs.

---

### Pitfall 6: The YouTube Embed Defeats Performance, Privacy, Availability, or Accessibility

**What goes wrong:**
The iframe loads third-party resources before the article becomes usable, hurting mobile performance and consuming data even when no one plays it. The embed fails because playback is disabled or age-restricted, has no accessible title, or is too small, and the direct YouTube journey disappears with it.

**Why it happens:**
A raw iframe is pasted into every MDX file and eagerly loaded. The embed is considered “one element,” while its network and script cost is ignored. Availability is checked only on the author's logged-in desktop session.

**How to avoid:**
- Render the embed through one component from a validated YouTube video ID; content files must not paste arbitrary iframe HTML.
- Use a thumbnail facade activated by the user, or at minimum a below-fold lazy-loaded iframe. Load from `youtube-nocookie.com`, use a responsive 16:9 container meeting YouTube's minimum viewport, and provide an Arabic `title` and keyboard-operable play control.
- Preserve a prominent plain `<a>` link to the exact YouTube video or channel regardless of embed state. Do not autoplay.
- Treat privacy-enhanced mode as reduced personalization, not “no third-party request”; the facade is what prevents pre-interaction YouTube connections.

**Warning signs:**
Initial page load contacts YouTube/Google domains before the player is near the viewport or activated; Lighthouse identifies the iframe as a large third-party cost; the player overflows or drops below 200×200; keyboard focus cannot activate it; a blocked video leaves a blank rectangle and no direct link.

**Verification:**
Record the mobile network waterfall before interaction and assert there are no YouTube player requests when using a facade. Activate it by keyboard and pointer, verify the correct real video plays, verify the direct link works with the embed blocked, and test narrow viewports. Re-check age/embedding availability for all three launch videos in a logged-out session. YouTube documents privacy-enhanced mode and minimum player size; web.dev recommends lazy loading or facades for costly third-party embeds. [S13][S14][S19]

**Phase to address:**
Phase 5 implements the single embed component; Phase 6 verifies real videos, network behavior, keyboard operation, and fallback links.

---

### Pitfall 7: YouTube Click Analytics Produces a Precise-Looking but Wrong Number

**What goes wrong:**
One click is recorded twice, navigation cancels the event, iframe playback is counted as a YouTube outbound click, bots/previews inflate counts, or analytics blockers create missing events. The owner believes the metric is exact and makes content decisions on contaminated data.

**Why it happens:**
Automatic outbound measurement and a custom handler are enabled simultaneously, multiple nested elements handle the same click, or “video engagement” is never operationally defined.

**How to avoid:**
- Define the v1 metric narrowly: **an intentional activation of the visible direct YouTube link on an article**. Do not equate this with a completed YouTube view, subscription, or iframe play.
- Use exactly one measurement path. If the analytics product already records outbound link clicks, configure/enrich that event rather than emitting a duplicate custom event.
- Attach stable non-personal parameters such as article slug, section, and target type; never include free-form article text, user identifiers, or sensitive query strings.
- Send without blocking navigation (`sendBeacon` or `fetch(..., {keepalive:true})` where a custom endpoint is used). Document that blockers and network loss make the count directional.

**Warning signs:**
Two events share the same timestamp for one activation; event counts exceed link activations in a browser test; middle-click/keyboard activation differs from pointer clicks; navigating quickly loses events; dashboard labels say “video views” or “conversions” when only a link click occurred.

**Verification:**
In an analytics debug/session view, activate the link once by mouse, keyboard, and modified/new-tab click and verify the deliberately supported cases each create at most one event with correct slug/section/target. Repeat with the analytics script blocked and confirm navigation still works. Compare a small manual test log with received events, and label the production metric “outbound YouTube link activations,” not views. GA4 enhanced measurement, for example, already emits `click` for links leaving the current domain; MDN recommends `sendBeacon` for small analytics payloads during navigation. [S20][S21]

**Phase to address:**
Phase 5 owns the metric definition and implementation; Phase 6 verifies once-only behavior and dashboard naming.

---

### Pitfall 8: Arabic Typography and Navigation Are Visually Attractive but Inaccessible

**What goes wrong:**
Diacritics are clipped, lines are too long, text becomes unreadable at zoom, the mobile viewport scrolls horizontally, focus order follows an LTR mental model, link/heading distinctions depend only on color, or custom webfonts delay content. General readers and assistive-technology users abandon the page.

**Why it happens:**
Testing uses short unvocalized Arabic on one desktop width. A decorative Arabic font is applied to body copy, fixed heights clip glyphs, and layout is evaluated only by screenshots.

**How to avoid:**
- Use a readable, well-supported Arabic body font (system fallback is acceptable), generous unitless line height, constrained line length, and no fixed height on text containers.
- Use semantic landmarks, a logical heading hierarchy, an Arabic skip link, visible focus, distinguishable links, and Arabic accessible names for navigation and media controls.
- Support reflow at 320 CSS px and text spacing/zoom without content loss. Keep the content/navigation order correct in the DOM; do not use CSS visual reordering to simulate RTL.
- Test both unvocalized prose and dense diacritics. Avoid unnecessary font weights/files and ensure fallbacks include Arabic glyphs.

**Warning signs:**
Horizontal scrolling at a narrow width; clipped tashkeel; headings selected by font size rather than semantics; tab order jumps; icon-only controls have English/no labels; layout breaks when line height or letter/word spacing is increased; body content remains invisible while fonts load.

**Verification:**
Automate an accessibility scan, then manually test keyboard navigation, visible focus, Arabic screen-reader pronunciation, 200% zoom, 320 CSS px reflow, user text-spacing overrides, and a fixture rich in diacritics. Confirm no two-dimensional scrolling for ordinary article content and no loss of controls. Automated checks do not replace the Arabic/bidi manual pass. [S12][S22][S23][S24]

**Phase to address:**
Phase 2 owns the design contract and reusable shell; Phase 3 tests real long-form content; Phase 6 runs the final manual/automated pass.

---

### Pitfall 9: Sensitive Religious Claims Lack Visible Provenance or Editorial Accountability

**What goes wrong:**
The site may be technically optimized yet fail to earn reader trust—or publish a materially inaccurate quotation, attribution, hadith grade, or scholarly position. Search metadata and author schema cannot compensate for unclear sourcing.

**Why it happens:**
Content is transcribed from a video without a source audit, citations are buried in prose or omitted, and “author” metadata is added without an About page or a defined editorial method. Theological disagreement is presented as undisputed fact.

**How to avoid:**
- Require visible, human-readable sources for substantive claims. For Quran citations include surah/ayah; for hadith include collection/reference and grading or the site's chosen verification source where relevant; for quotations identify the work/scholar precisely.
- Publish an Arabic About/editorial-method page that truthfully identifies the author, scope, review approach, and correction mechanism. Do not claim credentials or consensus not established by the owner.
- Distinguish direct source text, explanation, opinion, and disputed interpretation in the article itself. Record a reviewed/modified date only when a substantive review occurred.
- Keep theological accuracy as a named human acceptance step for every article; it cannot be automated by the MDX build.

**Warning signs:**
Claims cite only the matching YouTube video; quotations have no edition/reference; every modified date equals build time; `author` exists only in JSON-LD; the About page is missing or generic; reviewers debate the source after publication.

**Verification:**
Before publishing, a designated owner/editor checks every visible citation against the referenced source and signs off on quotations, attributions, and the article's characterization of disputed views. Sample all citation links/references after build. Confirm author/about and review information visible to users matches metadata exactly. Google explicitly names clear sourcing, evidence of expertise, and author/site background as trust signals in its people-first content self-assessment. [S6]

**Phase to address:**
Phase 1 defines required source/review fields; Phase 3 owns the editorial method and human sign-off; Phase 6 audits the three launch articles.

---

### Pitfall 10: Markdown/MDX Accepts Broken or Unsafe Content Until Production

**What goes wrong:**
A missing field emits an English fallback, an invalid section creates an orphan route, duplicate slugs overwrite output, a bad YouTube ID breaks the embed, a draft enters the sitemap, malformed MDX stops the deploy, or arbitrary embedded HTML/script bypasses the site's layout and security assumptions.

**Why it happens:**
Markdown is mistaken for “just text,” frontmatter is weakly typed, and validation lives only inside individual UI components. Local ownership lowers the threat level but does not prevent accidental content defects.

**How to avoid:**
- Validate every content file once at build time with a closed schema: Arabic title/description, section enum, immutable slug, valid dates, draft state, supported YouTube ID/URL, citation structure, and only fields actually used by v1.
- Fail the build on duplicate normalized route keys, missing required fields, unknown sections, invalid internal links, invalid dates/video IDs, and public drafts.
- Use a small MDX component allowlist and a single video component. Treat repository content as trusted-author input, but reject raw scripts and arbitrary iframes because they bypass performance, privacy, and accessibility controls.
- Render every public content file during CI/build; do not validate only the three pages referenced by tests.

**Warning signs:**
Components contain repeated `field || "Untitled"` fallbacks; frontmatter type assertions replace runtime validation; content files paste iframe HTML; route generation silently skips invalid files; draft filtering differs among page generation, sitemap, and indexes.

**Verification:**
Keep one small invalid-content fixture set or validator unit test proving the build rejects a duplicate normalized slug, missing Arabic metadata, unsupported section, invalid video ID, and draft leakage. Run a full production build and crawl all generated routes. Confirm indexes, sitemap, and route generation consume the same validated collection.

**Phase to address:**
Phase 1 owns the shared schema and failure behavior; Phases 3–5 consume only validated content; Phase 6 performs the full build/crawl.

---

### Pitfall 11: English Leaks Through “Non-Content” UI and Error States

**What goes wrong:**
The normal article path is Arabic, but 404 pages, empty states, pagination labels, iframe titles, breadcrumbs, cookie/analytics notices, dates, build error fallbacks, or screen-reader labels appear in English. This violates the core product constraint and may cause Google to generate mismatched title links.

**Why it happens:**
Only Markdown body text is reviewed. Framework starter pages and component-library defaults remain, and accessible names are invisible during screenshot review.

**How to avoid:**
- Centralize the small set of reader-facing strings in Arabic and delete unused starter UI. Arabic-only v1 does not need an internationalization framework.
- Explicitly author Arabic 404/error/empty labels, navigation landmarks, media titles, skip links, and date presentation. Keep machine identifiers and URLs out of reader-facing copy unless needed.
- Set Arabic title/description for every route type, including section indexes and not-found pages; do not expose raw exception messages.

**Warning signs:**
Repository-visible UI contains “Home,” “Read more,” “Not found,” “Previous,” or “Play video”; accessible-name inspection reveals English; framework/site name appears in a search preview; dates/months render in an unintended locale.

**Verification:**
Crawl all public routes plus 404 and failure/empty states. Extract visible text, document titles, meta descriptions, `alt`, `title`, `aria-label`, and landmark names; review English-letter matches with a small whitelist for intentional URLs/proper nouns. Manually inspect accessibility-tree names because they are not all visible. Google recommends title text in the same language and writing system as the page's primary content. [S16]

**Phase to address:**
Phase 2 owns shared Arabic strings and states; each feature phase owns its new labels; Phase 6 runs the whole-site leak audit.

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Derive slug from the current title | No frontmatter field | Every title edit can break backlinks, canonicals, and analytics continuity | Never for a published route |
| Hand-edit sitemap, canonical, and JSON-LD URLs separately | Fast first page | Conflicting origins and paths appear as content grows | Never; one URL builder is simpler |
| Paste raw YouTube iframes in MDX | No component work | Inconsistent privacy, loading, labels, sizing, and analytics | Never; one embed component is smaller overall |
| Reuse one site description for all pages | Less editorial input | Unhelpful snippets and indistinguishable results | Only as a temporary non-production placeholder |
| Use CSS `left`/`right` throughout | Familiar styling | Fragile RTL and mixed-direction maintenance | Only for a truly physical property with documented reason |
| Treat all MDX as arbitrary JSX | Maximum author freedom | Content bypasses layout, performance, and safety contracts | Never in v1; use a small allowlist |
| Track both automatic outbound clicks and custom click events | Easy dashboard setup | Double-counting and unclear metric meaning | Never for the same interaction |
| Stamp `lastmod`/`dateModified` at build time | Always looks fresh | Misleads crawlers/readers and destroys change meaning | Never; use substantive editorial modification time |
| Add tag/search archive pages before content volume exists | More crawlable URLs | Thin duplicate listings consume review and confuse site structure | Not in v1 |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google Search | Treating sitemap submission as an indexing command | Make signals consistent, submit sitemap, inspect representative URLs, then observe coverage and queries over time |
| `robots.txt` | Using `Disallow` to remove a page from Google | Use access control for private previews or a crawlable `noindex` for public URLs being removed; robots controls crawling, not guaranteed exclusion [S4][S5] |
| Structured data | Copying all optional example properties | Emit only truthful properties backed by visible validated content; validate both syntax and meaning [S7][S8] |
| YouTube embed | Claiming `youtube-nocookie.com` makes the player request-free | Use a facade to avoid third-party requests before interaction; privacy-enhanced mode reduces personalization [S13][S14] |
| YouTube availability | Assuming every public YouTube URL is embeddable | Test logged-out embed playback; preserve an explicit direct link for disabled/age-restricted playback |
| Analytics | Calling outbound link activations “video views” | Name the event for what was observed and use YouTube's own analytics for downstream video behavior |
| Webfonts | Loading many Arabic weights from a third party | Prefer a system/local subset or minimal weights; verify diacritics and fallback rendering before adding files |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| Eager YouTube iframe | Third-party requests dominate waterfall; slow LCP/interaction | Facade or below-fold lazy iframe; no autoplay | On the first article, especially mobile/slow networks—not a scale problem |
| Hydrating the whole MDX article | Large JS bundle despite static prose | Render prose statically; hydrate only the player/facade if needed | As article/component count grows; visible early in bundle audit |
| Multiple Arabic font families/weights | Flash/invisible text, large font transfer, layout shift | One readable family with system fallback and minimal weights | On the first mobile visit |
| Full-resolution video thumbnail/hero | Slow LCP and excess data | Responsive dimensions, correct intrinsic size, compressed modern image | On the first image-heavy article |
| Sitemap regenerated with false `lastmod` | Unnecessary recrawl signals and meaningless change dates | Use actual significant content modification dates | Every deployment, even with only three articles |

## Security and Integrity Mistakes

These are scoped to the Markdown/YouTube domain rather than a speculative enterprise threat model.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Arbitrary raw HTML/scripts in MDX | Stored script execution or policy bypass if a future contributor/source is less trusted | Local trusted authors only, small component allowlist, reject raw scripts/arbitrary iframes |
| Interpolating an unvalidated YouTube URL into iframe attributes | Unexpected origin or malformed embed | Accept a strict video ID or parse against an allowlisted YouTube host, then construct the embed URL internally |
| Invisible bidi controls in slugs/identifiers | Spoofed-looking or unstable routes and misleading review diffs | NFC-normalize identifiers and reject bidi/control characters; allow ordinary Arabic diacritics in content |
| Sending full page/query data to analytics | Accidental collection of sensitive or identifying data | Emit only stable article/section/target identifiers; avoid free text and query strings; document retention/consent for the selected provider |
| Showing raw build/runtime errors publicly | Path or implementation disclosure plus English UI | Static Arabic error/404 page; log build failures only in deployment output |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Right-aligning instead of semantic RTL | Broken mixed text, reading, and navigation order | Root `lang="ar" dir="rtl"`, logical CSS, local bidi isolation |
| Making the video the article's first/heaviest element | Slow answer and unclear page value | Lead with the useful Arabic answer; place a clearly labeled player/action in context |
| Using only a play facade with no direct link | Blocked embeds strand users and obscure channel journey | Always include a prominent Arabic direct YouTube link |
| Long full-width Arabic lines | Fatigue and poor comprehension | Constrain reading width and use comfortable unitless line height |
| Decorative font with weak diacritic support | Clipped/misread religious text | Test Quranic/fully vocalized fixtures; use a proven readable fallback |
| Ambiguous section label `القسم العلمي` | Readers may expect natural science | Add a concise Arabic scope description indicating Islamic scholarship/lessons |
| Mirroring all icons in RTL | Play/media symbols become confusing | Mirror only directional navigation icons; leave semantic/media marks unchanged |

## "Looks Done But Isn't" Checklist

- [ ] **Arabic document semantics:** Root HTML has `lang="ar" dir="rtl"`; mixed Arabic/URL/number fixtures render, copy, and read correctly.
- [ ] **Stable routes:** Titles can change without paths changing; normalized duplicate/reserved/bidi-control slugs fail the build.
- [ ] **Production origin:** Every canonical, sitemap URL, JSON-LD URL, and internal absolute URL uses one production origin and route policy.
- [ ] **Indexability:** Production pages have no accidental `noindex`; `robots.txt` does not block public content; drafts/redirects/404s are absent from sitemap.
- [ ] **Useful real content:** One substantive reviewed article exists in each section; the article remains useful without playing the video.
- [ ] **Unique Arabic search text:** Titles and descriptions are page-specific, Arabic, descriptive, and free of starter/default English.
- [ ] **Truthful schema:** JSON-LD matches visible author, dates, headline, image, and video data; no invented properties or hidden FAQ content.
- [ ] **YouTube fallback:** Every real embed works logged-out or fails gracefully with a correct direct link.
- [ ] **Embed performance/privacy:** No player request occurs before intent when using the facade; mobile layout is responsive and keyboard operable.
- [ ] **Metric definition:** One direct-link activation produces at most one event and is labeled as an outbound click, not a video view.
- [ ] **Arabic accessibility:** Keyboard, focus, screen reader, zoom, text spacing, 320 CSS px reflow, and diacritics have been manually checked.
- [ ] **Editorial trust:** About/method information and visible citations exist; each launch article has human source/accuracy sign-off.
- [ ] **Content failure behavior:** Invalid frontmatter, duplicates, bad internal links/video IDs, raw disallowed embeds, and draft leakage fail the build.
- [ ] **Whole-site Arabic audit:** Homepage, sections, articles, 404, empty/error states, metadata, and accessibility names contain no accidental English UI.
- [ ] **Post-launch observation:** Sitemap is submitted; representative URL Inspection results and baseline organic/outbound events are recorded without assuming instant indexing.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Accidental production `noindex`/robots block | MEDIUM | Correct directive, redeploy, verify live response/HTML, resubmit sitemap, request indexing for representative URLs, monitor coverage |
| Wrong canonical origin or duplicate URL variants | MEDIUM | Choose canonical form, unify generator, add direct permanent redirects, update internal links/sitemap, inspect affected URLs |
| Published slug churn | HIGH | Restore old slug where possible; otherwise direct-redirect every known old path, update links/canonical/sitemap, retain redirects indefinitely |
| Thin/duplicated articles | MEDIUM | Merge into the strongest page, redirect weaker URLs, rewrite for distinct intent and sources, update internal links |
| Misleading structured data | LOW–MEDIUM | Remove unsupported properties immediately, correct visible content/metadata, rerun Rich Results Test, inspect Search Console enhancements/manual actions |
| Heavy YouTube embed | LOW | Replace shared embed component with facade/lazy loading; all articles improve at once; retest network and mobile performance |
| Double-counted analytics | MEDIUM | Disable one event path, version/rename the corrected metric, annotate the dashboard break, do not silently compare pre/post totals |
| Religious citation/attribution error | HIGH | Correct visible text and source promptly, update substantive modified/review date, add a transparent correction note when material, re-review dependent articles |
| English UI leakage | LOW | Fix the centralized string/default metadata or error shell, then rerun the whole-site visible/accessibility-text scan |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| RTL/bidi semantic defects | Phases 1–2 | Root attributes, mixed-direction fixture, control-character scan, keyboard/screen-reader pass |
| Unstable/malformed slugs | Phase 1 | Validator edge cases, normalized collision test, crawl one URL per article |
| Canonical/robots/sitemap conflict | Phase 4 | Production crawl: sitemap 200/indexable/self-canonical; representative URL Inspection |
| Thin/duplicate/search-first content | Phase 3 | Editorial query-intent review, exact-text/duplication check, useful-without-video test |
| Metadata/schema misuse | Phase 4 | Per-route uniqueness checks, Rich Results Test, visible-to-JSON-LD comparison |
| YouTube performance/privacy/availability | Phase 5 | Pre-interaction waterfall, keyboard activation, logged-out real-video and fallback-link tests |
| Inaccurate click analytics | Phase 5 | One-event-per-supported-activation debug test; metric label review |
| Arabic typography/navigation accessibility | Phase 2 | Axe-equivalent scan plus manual keyboard, screen reader, zoom, spacing, reflow, diacritic tests |
| Weak religious provenance | Phase 3 | Human source audit and sign-off for each launch article; author/about parity with metadata |
| Content validation failure | Phase 1 | Invalid-fixture validator test and full production build of every file |
| Accidental English UI | Phases 2–6 | Crawl visible text, metadata, alt/title/ARIA, 404/error/empty states with intentional-term whitelist |

## Sources

All web sources below were fetched successfully and reviewed on 2026-08-26. Search claims rely on Google Search Central rather than third-party SEO commentary.

| ID | Authority and source | Supports | Confidence |
|----|----------------------|----------|------------|
| S1 | Google Search Central — [URL structure best practices](https://developers.google.com/search/docs/crawling-indexing/url-structure) | Simple descriptive audience-language URLs, UTF-8, hyphens | HIGH |
| S2 | Google Search Central — [Canonical URL methods](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) | Canonical consolidation signals and consistency | HIGH |
| S3 | Google Search Central — [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) | Absolute canonical URLs; accurate significant-change `lastmod`; ignored priority/changefreq | HIGH |
| S4 | Google Search Central — [Introduction to robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro) | Robots controls crawler access and is not a page-removal mechanism | HIGH |
| S5 | Google Search Central — [Robots meta tags](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) | Page-level indexing directives | HIGH |
| S6 | Google Search Central — [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | Search-first warning signs, sourcing, expertise, author/site background | HIGH |
| S7 | Google Search Central — [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) | Visible, representative, non-misleading data; no display guarantee | HIGH |
| S8 | Google Search Central — [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article) | Supported article properties and validation workflow | HIGH |
| S9 | Google Search Central — [Video structured data](https://developers.google.com/search/docs/appearance/structured-data/video) | VideoObject eligibility/properties and watch-page context | HIGH |
| S10 | W3C Internationalization — [Structural markup and RTL text in HTML](https://www.w3.org/International/questions/qa-html-dir) | Root `dir`, `dir=auto`, `bdi`, logical styling | HIGH |
| S11 | W3C Internationalization — [Unicode Bidirectional Algorithm basics](https://www.w3.org/International/articles/inline-bidi-markup/uba-basics) | Mixed-direction rendering behavior and isolation need | HIGH |
| S12 | W3C WAI — [Understanding language of page](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html) | Programmatic Arabic language and screen-reader pronunciation | HIGH |
| S13 | YouTube Help — [Embed videos and playlists](https://support.google.com/youtube/answer/171780?hl=en) | Privacy-enhanced mode, `youtube-nocookie.com`, embedding limitations | HIGH |
| S14 | web.dev — [Best practices for third-party embeds](https://web.dev/articles/embed-best-practices) | Lazy loading and facade pattern for embed performance | HIGH |
| S15 | Unicode Consortium — [UTS #39 Unicode Security Mechanisms](https://www.unicode.org/reports/tr39/#Bidirectional_Controls) | Identifier normalization/control-character concerns | HIGH |
| S16 | Google Search Central — [Influencing title links](https://developers.google.com/search/docs/appearance/title-link) | Descriptive distinct titles, no stuffing/boilerplate, same language/script | HIGH |
| S17 | Google Search Central — [Meta descriptions and snippets](https://developers.google.com/search/docs/appearance/snippet) | Unique, accurate, human-readable page descriptions | HIGH |
| S18 | Schema.org — [Article](https://schema.org/Article), [VideoObject](https://schema.org/VideoObject) | Vocabulary semantics; Google eligibility remains governed by S7–S9 | HIGH for vocabulary, not a Google display promise |
| S19 | YouTube IFrame Player API — [Player parameters](https://developers.google.com/youtube/player_parameters) | Embed format and minimum 200×200 viewport | HIGH |
| S20 | Google Analytics Help — [Enhanced measurement events](https://support.google.com/analytics/answer/9216061?hl=en) | Automatic outbound `click` event behavior in GA4 | HIGH when GA4 is selected; otherwise illustrative |
| S21 | MDN — [`Navigator.sendBeacon()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) | Non-blocking small analytics payload during navigation | HIGH |
| S22 | W3C WAI — [WCAG 2.2 reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | 320 CSS px reflow without two-dimensional scrolling | HIGH |
| S23 | W3C WAI — [WCAG 2.2 text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) | No loss when users override text spacing | HIGH |
| S24 | W3C — [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/) | Keyboard, focus, semantics, contrast, language, and reflow baseline | HIGH |

## Research Gaps and Roadmap Flags

- **Religious editorial methodology:** The owner must decide the authoritative sources, hadith verification convention, and how disputed positions are labeled. Research can require visible provenance but cannot choose a theological authority.
- **Analytics provider:** The project requires privacy-conscious analytics but has not selected a product. Phase 5 should verify the chosen provider's exact event, consent, retention, and outbound-click behavior; do not build two measurement paths “for flexibility.”
- **Production host/origin:** Canonical and redirect tests need the final domain and deployment behavior. Phase 4 should keep the origin explicit, and Phase 6 must test the deployed host.
- **Real YouTube videos:** Embed availability, thumbnail facts, and VideoObject fields can only be verified after the three launch video URLs are chosen.
- **Post-launch search evidence:** Indexing and ranking cannot be proven pre-launch. Establish Search Console and click-event baselines, then evaluate discovery and outbound engagement over time without interpreting lack of immediate indexing as a software failure.

---
*Pitfalls research for: مدونة أحمد المنجاوي*
*Researched: 2026-08-26*
