# Phase 2: Complete Arabic Article Journey - Research

**Researched:** 2026-08-26
**Domain:** Static Astro Arabic article rendering, accessibility, progressive YouTube embedding, and validation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Complete Article and Provenance
- **D-01:** Keep the article text-first and complete without video or JavaScript: one page title, a visibly labelled الخلاصة, an introduction, logically ordered body headings, substantive body, and a conclusion in meaningful document order.
- **D-02:** Render the article's Arabic section, registered author, publication date, and optional material-update date as visible reader facts. Dates must be UTC-stable and formatted for Arabic readers rather than leaking raw implementation-oriented values into prose.
- **D-03:** Add optional structured reference entries at the content-contract boundary. Validate non-empty Arabic-facing labels and permit only explicit HTTPS destinations; malformed entries fail the build.
- **D-04:** Render references as a semantic list under a clear Arabic heading only when entries exist. An absent update date or absent references must produce no empty label, container, separator, or placeholder.
- **D-05:** Preserve the Phase 1 rule that frontmatter keys point to central section and author registries; do not duplicate public author or section facts in article bodies.

#### Arabic Reading, Direction, and Typography
- **D-06:** The full article surface is Arabic-only and inherits correct lang="ar" and dir="rtl" document semantics. Labels, instructions, status text, player controls, and fallback copy must not expose accidental English UI.
- **D-07:** Use a mobile-first, fluid reader from 320 through 1440 CSS pixels and at 200% zoom. Content must reflow without page-level horizontal scrolling, clipped text, or overlapping controls.
- **D-08:** Use locally available Arabic-compatible system fonts; add no webfont request. Body text is at least 1rem, uses comfortable Arabic line height, and stays within an approximately 65–75 character reading measure.
- **D-09:** Use logical CSS properties and start alignment. Ordinary prose stays RTL; URLs, dates, numbers, identifiers, and code-like mixed-direction values use native isolation/direction elements such as <bdi> or an equivalent semantic boundary.
- **D-10:** Heading levels follow document meaning and never skip; visual sizing descends with level. Keep styling restrained, high contrast, and free of decorative effects that compete with long-form reading.

#### Semantics, Keyboard, and Focus
- **D-11:** Prefer native landmarks, headings, lists, links, buttons, and time elements. Add ARIA only when native semantics do not supply the required accessible Arabic name or state.
- **D-12:** Every article control is reachable and operable by keyboard, retains a clearly visible high-contrast focus indicator, and creates no focus or keyboard trap.
- **D-13:** Provide approximately 44×44 CSS-pixel comfortable targets for standalone controls; ordinary inline text links remain the applicable exception. Link text must describe its Arabic destination or action without relying on surrounding prose.
- **D-14:** Meaningful non-text content receives an appropriate Arabic alternative; decorative content, if any, remains silent. No autoplay or motion-heavy behavior is introduced.

#### YouTube Intent and Resilient Fallback
- **D-15:** Initial HTML and page load contain no YouTube iframe and initiate no YouTube request. Reserve a responsive 16:9 media region so activating the enhancement does not materially shift the article.
- **D-16:** One explicit activation of a native Arabic-labelled button creates exactly one labelled iframe from https://www.youtube-nocookie.com/embed/{youtubeId}. It must not autoplay, and repeat activation must not create duplicate players.
- **D-17:** Keep a prominent static Arabic link outside the player enhancement to https://www.youtube.com/watch?v={youtubeId}. It opens in the same tab and remains available when JavaScript, third-party cookies, the iframe host, or player loading fails.
- **D-18:** The direct link is the guaranteed continuation path; the iframe is progressive enhancement. Article comprehension never depends on either media path.

#### Minimal Static Architecture and Regression Safety
- **D-19:** Reuse the Phase 1 collection, registries, public/preview query split, final dynamic route family, path helpers, and restricted MDX map. Extend the existing contract only for article facts that Phase 2 must render.
- **D-20:** Use platform HTML, CSS, and the smallest native JavaScript enhancement. Add no UI framework, design-system package, animation library, icon set, backend, or new dependency unless a locked acceptance criterion demonstrably cannot be met without it.
- **D-21:** Keep production fully static and preserve title-independent routes, collision checks, draft exclusion, and the MDX allowlist. Both existing public proof routes must exercise the completed journey; the production draft route remains absent.
- **D-22:** Verification must cover Markdown and approved MDX, JavaScript-disabled fallback, blocked-player fallback, one-time player activation, keyboard/focus behavior, mixed-direction rendering, responsive widths, 200% zoom, and all Phase 1 regressions.

### the agent's Discretion
- Exact internal component boundaries and filenames, provided the final route remains the single public article route family and the implementation stays smaller than duplication.
- Exact restrained color values, spacing steps, and type scale within the locked contrast, measure, size, RTL, zoom, and reflow constraints.
- Exact Arabic microcopy for metadata and media controls, provided it is clear, truthful, descriptive, and contains no reader-facing English.
- Exact structured-reference field names and date-formatting helper placement, provided the contract fails closed and optional UI disappears cleanly.

### Deferred Ideas (OUT OF SCOPE)
- Homepage, three section indexes, global navigation, About/author page, and three final reviewed articles — Phase 3.
- Page-specific titles/descriptions, canonical and social metadata, sitemap, robots directives, and Arabic 404 — Phase 4.
- Production domain, hosting, Search Console, privacy-conscious analytics, and outbound-click measurement — Phase 5.
- Production crawl, Core Web Vitals, and whole-site launch certification — Phase 6.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SITE-01 | A visitor sees only Arabic reader-facing navigation, labels, controls, messages, and error states across the public website. | Exact Arabic copy, static DOM checks, and browser accessible-name checks are specified below. [VERIFIED: .planning/REQUIREMENTS.md] |
| SITE-02 | A browser and assistive technology receive Arabic language and right-to-left document semantics on every public page. | Preserve root lang="ar" dir="rtl" and test both public route formats. [VERIFIED: .planning/REQUIREMENTS.md] |
| ART-01 | A reader can consume a published article with a clear title, introduction, ordered headings, body, section context, and conclusion without depending on video or client-side JavaScript. | The static article flow and output assertions below cover the complete ordered journey. [VERIFIED: .planning/REQUIREMENTS.md] |
| ART-02 | A reader can comfortably read long-form Arabic articles on supported mobile and desktop widths without clipped text or horizontal page overflow. | The approved 70ch reader, fluid spacing, overflow rules, and width matrix cover this requirement. [VERIFIED: 02-UI-SPEC.md] |
| ART-03 | A reader sees URLs, numbers, punctuation, Arabic diacritics, and other mixed-direction fragments in the correct order within RTL content. | Native bdi/dir boundaries plus representative proof content and visual checks cover this requirement. [VERIFIED: .planning/REQUIREMENTS.md] |
| ART-04 | Every article presents a responsive, dimension-reserved, privacy-enhanced YouTube player that loads the real player only after reader intent. | A native hidden-until-wired button creates one youtube-nocookie iframe inside a 16:9 box. [VERIFIED: 02-CONTEXT.md] |
| ART-05 | Every article presents a prominent Arabic direct link to its matching YouTube video or channel that remains usable when the embedded player is unavailable. | The direct same-tab anchor remains outside all player mutation and is tested with JavaScript disabled and the embed host blocked. [VERIFIED: 02-CONTEXT.md] |
| ART-06 | Every article visibly presents its author, truthful publication or material-update date, and references wherever its claims depend on external or religious sources. | Registry resolution, UTC-stable time elements, optional reference validation, and conditional rendering cover this requirement. [VERIFIED: .planning/REQUIREMENTS.md] |
| ART-07 | Every article begins with a maintained Arabic الخلاصة that gives the reader a useful intent-focused summary. | The route renders the validated summary under an h2 labelled الخلاصة before authored body content. [VERIFIED: 02-UI-SPEC.md] |
| QUAL-01 | A reader receives semantic landmarks and headings, descriptive links, meaningful image alternatives, and an accessible Arabic label for the video player and YouTube action. | Native elements, an Arabic iframe title, axe checks, and manual accessibility-tree review cover this requirement. [VERIFIED: .planning/REQUIREMENTS.md] |
| QUAL-02 | A keyboard user can reach and operate every interactive public control with a visible focus indicator and no keyboard trap. | Native controls, focus transfer to the inserted iframe, automated Tab assertions, and a manual no-trap pass cover this requirement. [VERIFIED: 02-SPEC.md] |
| QUAL-03 | Text, controls, zoom, and responsive reflow meet applicable WCAG 2.2 AA contrast and layout requirements on representative pages. | The locked colors/type scale, computed-style checks, five viewport checks, axe, and manual 200% zoom pass cover this requirement. [VERIFIED: 02-UI-SPEC.md] |
| QUAL-04 | A reader can access the complete article and direct YouTube link when JavaScript, third-party cookies, or the YouTube player is blocked. | A JavaScript-disabled browser context and a blocked youtube-nocookie route verify the static fallback. [VERIFIED: .planning/REQUIREMENTS.md] |
</phase_requirements>

## Summary

Phase 2 should be planned as one vertical reader journey, not as separate styling, accessibility, and media subsystems. Extend the existing content boundary with optional structured references, enrich the two existing public proof records, then render every validated fact through the existing dynamic article route. Keep section and author display facts in the central registries, keep drafts behind the existing production query, and pass authored Markdown/MDX through the existing restricted component map. [VERIFIED: src/content.config.ts] [VERIFIED: src/lib/articles.ts] [VERIFIED: src/components/mdx-components.ts]

The production implementation needs no new dependency: native Astro templates, semantic HTML, CSS logical properties, Intl.DateTimeFormat, URL, encodeURIComponent, and a small processed Astro script meet the reader requirements. The player activation is the only client enhancement; the permanent direct link and complete article remain static HTML. [CITED: https://docs.astro.build/en/guides/client-side-scripts/] [CITED: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat] [VERIFIED: 02-CONTEXT.md]

The only justified package addition is test-only: exact dev dependencies @playwright/test 1.62.1 and @axe-core/playwright 4.13.0 provide the locked reproducible browser and automated accessibility gate. Official Playwright guidance warns that automated checks detect only some accessibility problems, so keyboard, focus, bidi, iframe failure, and 200% zoom remain explicit manual gates. [CITED: https://playwright.dev/docs/accessibility-testing] [VERIFIED: npm registry]

**Primary recommendation:** Preserve the single Phase 1 route/data flow, add one small YouTube enhancement boundary, and make the permanent static article plus direct link the invariant across every failure state. [VERIFIED: 02-CONTEXT.md]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Reference shape and HTTPS validation | Build-time content pipeline | Static template | Invalid author input must stop content loading before rendering. [VERIFIED: 02-CONTEXT.md] |
| Section, author, dates, summary, and references | Frontend SSG template | Central registries | The existing Astro route resolves validated data and emits static HTML; registry keys remain the source of display truth. [VERIFIED: src/pages/[section]/[slug].astro] [VERIFIED: src/config/registries.ts] |
| Arabic semantics and readable layout | Browser / Client | Static HTML/CSS | Native lang, dir, bdi, time, logical properties, and CSS reflow require no runtime framework. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi] |
| Direct YouTube continuation | CDN / Static | External YouTube | The same-tab anchor exists in initial HTML and remains independent of JavaScript and iframe state. [VERIFIED: 02-CONTEXT.md] |
| Intent-gated player | Browser / Client | External YouTube | One local button handler creates a hardcoded privacy-enhanced iframe only after intent. [CITED: https://support.google.com/youtube/answer/171780] |
| Draft exclusion and route identity | Build-time content pipeline | CDN / Static | The existing public query and path helpers decide which static pages exist; the template must not bypass them. [VERIFIED: src/lib/articles.ts] |
| Accessibility and degraded-mode verification | Test pipeline | Browser / Client | Node contract tests protect build-time policy; Playwright/axe and manual checks protect rendered behavior. [CITED: https://playwright.dev/docs/accessibility-testing] |

## Project Constraints (from AGENTS.md)

- All reader-facing content and navigation are Arabic-only, with RTL semantics and correct bidi handling for URLs, numbers, and media. [VERIFIED: AGENTS.md]
- Content remains Markdown/MDX with no CMS, database, authentication, or editorial login. [VERIFIED: AGENTS.md]
- Public content remains statically generated/crawlable without JavaScript, and unnecessary client code or visual effects are excluded. [VERIFIED: AGENTS.md]
- Every article includes both an embedded YouTube player and an explicit outbound YouTube action. [VERIFIED: AGENTS.md]
- Future sections reuse the same content model; speculative v1 features are not built. [VERIFIED: AGENTS.md]
- Preserve exact Astro 7.2.7, Node 24.19.0, npm 11.17.0, TypeScript 6.0.3, static output, and the existing lockfile discipline. [VERIFIED: AGENTS.md] [VERIFIED: package-lock.json]
- Do not introduce React, Vue, Svelte, Tailwind, a UI kit, a webfont, an RTL transformer, a server adapter, or a CMS for this phase. [VERIFIED: AGENTS.md]
- Browser-test output belongs only under the already ignored .artifacts directory, never under source or planning paths. [VERIFIED: user-provided AGENTS instructions] [VERIFIED: .gitignore]
- Do not read or create .env files for this phase. [VERIFIED: user-provided AGENTS instructions] [VERIFIED: 02-SPEC.md]
- Work was initialized through the GSD phase operation before this research artifact was written. [VERIFIED: gsd-tools init.phase-op 2]

## Standard Stack

### Core

| Library / Platform | Version | Purpose | Why Standard |
|--------------------|---------|---------|--------------|
| Astro | 7.2.7 | Static route generation, content rendering, processed client script | Already installed and locked; processed scripts are bundled, TypeScript-capable, module scripts, and deduplicated. [CITED: https://docs.astro.build/en/guides/client-side-scripts/] [VERIFIED: package-lock.json] |
| Astro content collections | Astro 7.2.7 built-in | Schema validation and Markdown/MDX rendering | The existing collection already validates every entry and renders both formats through one route. [CITED: https://docs.astro.build/en/guides/content-collections/] [VERIFIED: src/content.config.ts] |
| Native HTML/CSS/JavaScript | Living platform | Landmarks, headings, bdi/time, responsive layout, focus, iframe creation | These platform primitives cover the locked surface without a production dependency. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi] [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio] |
| Intl.DateTimeFormat and URL | Node/browser built-ins | UTC-stable Arabic date display and absolute HTTPS validation/construction | Both are native and already compatible with the locked Node/browser baseline. [CITED: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat] [VERIFIED: src/lib/mdx-policy.ts] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @astrojs/mdx | 7.0.8 | Existing approved MDX rendering | Continue using the current integration and exact component map; add no per-article imports. [VERIFIED: package-lock.json] |
| @mdx-js/mdx | 3.1.1 | Existing structural preflight parser | Preserve the current ESM/expression/raw-HTML/component/URL restrictions unchanged. [VERIFIED: src/lib/mdx-policy.ts] |
| Node built-in node:test | Node 24.19.0 | Contract and static-output assertions | Extend the current test file for references and retain the exact-runtime unit gate. [CITED: https://nodejs.org/docs/latest-v24.x/api/test.html] [VERIFIED: tests/content-contract.test.ts] |
| @playwright/test | 1.62.1 | Rendered-route, network, JavaScript-disabled, keyboard, and viewport checks | Add only as an exact dev dependency because locked acceptance requires reproducible browser behavior checks. [CITED: https://playwright.dev/docs/intro] [VERIFIED: npm registry] |
| @axe-core/playwright | 4.13.0 | Automated serious/critical accessibility scan | Run on both public routes before iframe activation, then retain manual accessibility checks for issues automation cannot detect. [CITED: https://playwright.dev/docs/accessibility-testing] [VERIFIED: npm registry] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native button plus iframe creation | lite-youtube-embed | Rejected for this locked phase: it is not installed, the exact behavior is small, and the approved contract forbids eager posters/requests and requires hidden-until-wired behavior. [VERIFIED: package.json] [VERIFIED: 02-UI-SPEC.md] |
| Intl.DateTimeFormat | Date formatting package | Rejected: the native formatter supports locale, dateStyle, and explicit UTC with less code and no dependency. [CITED: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat] |
| Native bdi/dir/logical CSS | RTL transformation library | Rejected: native bidi isolation and logical properties directly express the required semantics. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi] |
| Playwright plus axe | Handwritten accessibility rule engine | Rejected: accessibility rule detection is not a safe custom-code task; use the established test integration and manual audit. [CITED: https://playwright.dev/docs/accessibility-testing] |

**Production installation:** none. [VERIFIED: 02-CONTEXT.md]

**Test-only installation under exact Node/npm:**

~~~bash
npm install --save-dev --save-exact @playwright/test@1.62.1 @axe-core/playwright@4.13.0
npx playwright install chromium
~~~

The npx command above resolves the locally installed Playwright binary after the exact dev dependency is committed; it is not a production dependency or an unpinned package fetch. [VERIFIED: npm registry] [CITED: https://playwright.dev/docs/browsers]

**Version verification:**

| Package | Registry version checked | Published | Postinstall |
|---------|--------------------------|-----------|-------------|
| @playwright/test | 1.62.1 | 2026-07-30 | none reported by npm metadata. [VERIFIED: npm registry] |
| @axe-core/playwright | 4.13.0 | 2026-08-11 | none reported by npm metadata. [VERIFIED: npm registry] |

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| @playwright/test | npm | about 5 years 11 months | 56,970,888/week | github.com/microsoft/playwright | OK | Approved as an exact dev dependency; official Playwright docs identify this package. [CITED: https://playwright.dev/docs/intro] [VERIFIED: npm registry] |
| @axe-core/playwright | npm | about 5 years 3 months | 9,262,683/week | github.com/dequelabs/axe-core-npm | OK | Approved as an exact dev dependency; official Playwright and Deque docs identify this package. [CITED: https://playwright.dev/docs/accessibility-testing] [CITED: https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright] [VERIFIED: npm registry] |

**Packages removed due to slopcheck [SLOP] verdict:** none. [VERIFIED: slopcheck 0.6.1]

**Packages flagged as suspicious [SUS]:** none. [VERIFIED: slopcheck 0.6.1]

The installed slopcheck module returned OK for both packages. Its follow-on install process failed before npm execution because the Python subprocess could not resolve npm on Windows; git status remained clean, and registry/postinstall checks were run separately. [VERIFIED: slopcheck execution 2026-08-26] [VERIFIED: git status]

## Architecture Patterns

### System Architecture Diagram

~~~text
Markdown / restricted MDX
          |
          v
Phase 1 MDX structural preflight
          |
          v
Astro collection schema + shared semantic validator
  - required article facts
  - optional references: Arabic-facing label + absolute HTTPS URL
          |
          v
Complete collection collision check
          |
          +---- development ----> explicit preview query (drafts included)
          |
          +---- production -----> public query (draft === false)
                                      |
                                      v
                         existing /[section]/[slug] route
                         - registry-backed author/section
                         - UTC Arabic dates
                         - title -> facts -> الخلاصة -> body
                         - conditional references
                         - media region + permanent direct link
                                      |
                                      v
                           static HTML + CSS on CDN
                                      |
                       +--------------+----------------+
                       |                               |
                JavaScript unavailable          handler registered
                       |                               |
             complete article + direct link      reveal native button
                                                       |
                                                 reader activates?
                                                  /          \
                                                no            yes
                                                |              |
                                          no YouTube request   encoded validated ID
                                                               |
                                                               v
                                                one youtube-nocookie iframe
                                                               |
                                                    blocked or succeeds
                                                               |
                                             permanent direct link remains
~~~

Every security-sensitive branch either fails during the build or degrades to the permanent static link; no branch hides article text or makes the iframe authoritative. [VERIFIED: 02-CONTEXT.md]

### Recommended Project Structure

~~~text
src/
├── config/
│   └── registries.ts                  # unchanged source of section/author truth
├── content/
│   └── articles/                      # enrich both public proof records; keep draft
├── components/
│   ├── YouTubePlayer.astro            # only new behavior-focused component boundary
│   ├── ContractNote.astro             # preserve approved MDX component
│   └── mdx-components.ts              # preserve restricted map
├── lib/
│   ├── content-contract.ts            # reference type and semantic validation
│   └── articles.ts                    # preserve public/preview split
├── content.config.ts                  # optional reference shape
└── pages/
    └── [section]/
        └── [slug].astro               # single reusable article reader route and styles
tests/
├── content-contract.test.ts           # reference validation plus Phase 1 regressions
└── article-journey.spec.ts            # Playwright/axe vertical journey checks
playwright.config.ts                   # preview server and .artifacts-only outputs
.artifacts/                            # already ignored; all browser artifacts stay here
~~~

The route itself is already the reusable layout for every article, so do not add a separate layout component merely for future reuse. Isolate only the player because its markup, state, and browser script form one cohesive behavior boundary. [VERIFIED: src/pages/[section]/[slug].astro] [VERIFIED: 02-CONTEXT.md]

### Pattern 1: Extend the Existing Trust Boundary Once

**What:** Add one optional references array to ArticleData and the Astro schema, while semantic HTTPS and label policy remains in validateArticleData. [VERIFIED: src/content.config.ts] [VERIFIED: src/lib/content-contract.ts]

**When to use:** Every Markdown/MDX article passes this path before rendering; templates must consume the validated entries without repairing them. [VERIFIED: src/lib/articles.ts]

**Example:**

~~~typescript
// Source: existing Phase 1 content-contract pattern plus locked D-03.
export type ArticleReference = {
  label: string;
  url: string;
};

// In ArticleData:
references?: readonly ArticleReference[];

// In validateArticleData:
for (const [index, reference] of (data.references ?? []).entries()) {
  assertNonEmpty(reference.label, source, "references." + index + ".label");
  if (![...reference.label].some(isArabicLetter)) {
    fail(source + ".references." + index + ".label", "must be Arabic-facing");
  }

  const destination = URL.parse(reference.url);
  if (
    !destination ||
    destination.protocol !== "https:" ||
    !destination.hostname ||
    destination.username ||
    destination.password
  ) {
    fail(
      source + ".references." + index + ".url",
      "must be an absolute HTTPS URL without credentials",
    );
  }
}
~~~

Use z.array(z.object({ label: nonEmpty, url: nonEmpty }).strict()).optional() for shape validation, but keep the URL/Arabic-facing policy in the shared semantic validator so unit tests invoke production policy. [CITED: https://docs.astro.build/en/guides/content-collections/] [VERIFIED: src/content.config.ts]

### Pattern 2: Resolve Truthful Facts at Build Time

**What:** Resolve the existing section and author keys through registries, format validated date-only strings once in UTC, and emit native dl/time markup. [VERIFIED: src/config/registries.ts] [VERIFIED: 02-UI-SPEC.md]

**When to use:** In the route frontmatter before static markup renders. [VERIFIED: src/pages/[section]/[slug].astro]

**Example:**

~~~astro
---
// Source: MDN Intl.DateTimeFormat and <time>; data was already validated.
const dateFormatter = new Intl.DateTimeFormat("ar", {
  dateStyle: "long",
  timeZone: "UTC",
});
const formatDate = (value: string) =>
  dateFormatter.format(new Date(value + "T00:00:00.000Z"));

const section = sectionRegistry[
  article.data.section as keyof typeof sectionRegistry
];
const author = authorRegistry[
  article.data.author as keyof typeof authorRegistry
];
---

<dl class="article-facts">
  <div><dt>القسم:</dt><dd>{section.label}</dd></div>
  <div><dt>الكاتب:</dt><dd>{author.name}</dd></div>
  <div>
    <dt>نُشر في:</dt>
    <dd>
      <time datetime={article.data.publishedAt}>
        <bdi dir="auto">{formatDate(article.data.publishedAt)}</bdi>
      </time>
    </dd>
  </div>
</dl>
~~~

The explicit UTC suffix and timeZone prevent the build machine's local zone from changing a date-only fact. The machine-readable datetime stays the validated YYYY-MM-DD value while the visible text is Arabic. [CITED: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time]

### Pattern 3: Hidden-Until-Wired Progressive Enhancement

**What:** Initial HTML contains no iframe or remote media request. A native button begins hidden, the processed Astro script attaches a one-shot idempotent listener, then reveals it. [CITED: https://docs.astro.build/en/guides/client-side-scripts/] [VERIFIED: 02-UI-SPEC.md]

**When to use:** Only inside the single YouTubePlayer component. [VERIFIED: 02-CONTEXT.md]

**Example:**

~~~astro
---
const { youtubeId, title } = Astro.props;
const directUrl =
  "https://www.youtube.com/watch?v=" + encodeURIComponent(youtubeId);
const iframeTitle = "فيديو المقال: " + title;
---

<section aria-labelledby="article-video-heading">
  <h2 id="article-video-heading">الفيديو المرتبط بالمقال</h2>
  <p>لن يُحمَّل مشغّل يوتيوب إلا بعد اختيارك التشغيل.</p>
  <div
    class="video-region"
    data-video-region
    data-youtube-id={youtubeId}
    data-iframe-title={iframeTitle}
  >
    <button type="button" data-video-activate hidden>
      تشغيل الفيديو هنا
    </button>
    <p role="status" data-video-error hidden>
      تعذّر تشغيل الفيديو هنا. يمكنك مشاهدة الفيديو مباشرةً على يوتيوب.
    </p>
  </div>
  <a class="youtube-link" href={directUrl}>
    مشاهدة الفيديو على يوتيوب
  </a>
</section>

<script>
  for (const region of document.querySelectorAll("[data-video-region]")) {
    const button = region.querySelector("[data-video-activate]");
    const error = region.querySelector("[data-video-error]");
    if (!(button instanceof HTMLButtonElement) || !(error instanceof HTMLElement)) {
      continue;
    }

    button.addEventListener(
      "click",
      () => {
        if (region.querySelector("iframe")) return;
        try {
          const id = region.getAttribute("data-youtube-id");
          const title = region.getAttribute("data-iframe-title");
          if (!id || !title) throw new Error("missing validated player data");

          const iframe = document.createElement("iframe");
          iframe.title = title;
          iframe.allowFullscreen = true;
          iframe.src =
            "https://www.youtube-nocookie.com/embed/" +
            encodeURIComponent(id);
          button.replaceWith(iframe);
          iframe.focus();
        } catch {
          button.hidden = true;
          error.hidden = false;
        }
      },
      { once: true },
    );
    button.hidden = false;
  }
</script>
~~~

Astro recommends data attributes for passing component/frontmatter values to processed scripts, and processed scripts are deduplicated when a component appears multiple times. The YouTube help center identifies youtube-nocookie.com as the privacy-enhanced embed domain. [CITED: https://docs.astro.build/en/guides/client-side-scripts/] [CITED: https://support.google.com/youtube/answer/171780]

Do not add autoplay=1. The official player parameters document identifies autoplay as the parameter that starts playback automatically; omitting it preserves the locked no-autoplay behavior. [CITED: https://developers.google.com/youtube/player_parameters]

### Pattern 4: One Restrained Global Reader Style

**What:** Use one style block or one imported stylesheet owned by the route, with global descendant selectors for rendered Markdown/MDX. [CITED: https://docs.astro.build/en/guides/styling/]

**When to use:** The Content renderer is a child rendering boundary, so purely scoped parent selectors can fail to reach authored headings and prose. [CITED: https://docs.astro.build/en/guides/styling/]

**Example:**

~~~css
/* Source: locked 02-UI-SPEC values. */
* {
  box-sizing: border-box;
}

html {
  background: #fffdf8;
  color: #1c1917;
  font-family:
    system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Tahoma, Arial,
    sans-serif;
  font-synthesis: none;
}

body {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.9;
}

.article-reader {
  max-inline-size: 70ch;
  margin-inline: auto;
  padding: 2rem 1rem;
  text-align: start;
  min-inline-size: 0;
}

h1 {
  font-size: 2rem;
  line-height: 1.3;
  text-wrap: balance;
}

h2 {
  font-size: 1.5rem;
  line-height: 1.4;
  text-wrap: balance;
}

h3 {
  font-size: 1.125rem;
  line-height: 1.4;
}

a {
  color: #166534;
  text-decoration-thickness: from-font;
  text-underline-position: from-font;
  text-decoration-skip-ink: auto;
}

:where(a, button, iframe):focus-visible {
  outline: 3px solid #166534;
  outline-offset: 3px;
}

.video-region {
  inline-size: 100%;
  aspect-ratio: 16 / 9;
  min-inline-size: 0;
}

.video-region iframe {
  inline-size: 100%;
  block-size: 100%;
  border: 0;
}

.video-region button,
.youtube-link {
  display: inline-flex;
  min-inline-size: 44px;
  min-block-size: 44px;
  align-items: center;
  justify-content: center;
}

bdi,
code,
.article-reader a {
  overflow-wrap: anywhere;
}

@media (min-width: 48rem) {
  .article-reader {
    padding: 4rem 1.5rem;
  }
}
~~~

The approved type scale is body 1.125rem/1.9, label 0.875rem/1.6, h2 1.5rem/1.4, and h1 2rem/1.3; the reading measure is 70ch and system fonts only. [VERIFIED: 02-UI-SPEC.md]

### Pattern 5: Automated Accessibility Plus Manual Gates

**What:** Scan both public routes before iframe activation and fail only on serious/critical axe impacts; separately assert the exact semantic names and behavior that axe cannot infer. [CITED: https://playwright.dev/docs/accessibility-testing]

**Example:**

~~~typescript
// Source: official Playwright accessibility testing guide.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("published Markdown has no serious or critical axe violations", async ({
  page,
}) => {
  await page.goto("/القضايا-العامة/اختبار-عقد-المحتوى/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(
    results.violations.filter(
      ({ impact }) => impact === "serious" || impact === "critical",
    ),
  ).toEqual([]);
});
~~~

Automated accessibility checks are partial by design; the plan must retain manual heading, screen-reader name/order, focus visibility, cross-origin iframe Tab/Shift+Tab, bidi, and zoom checks. [CITED: https://playwright.dev/docs/accessibility-testing] [VERIFIED: 02-SPEC.md]

### Anti-Patterns to Avoid

- **Second public route or preview layout:** It would bypass the verified single-route and public/preview query guarantees. Use the existing dynamic route. [VERIFIED: 01-VERIFICATION.md]
- **Full article card/layout component tree:** One route already supplies reuse; create only the player boundary where behavior is cohesive. [VERIFIED: src/pages/[section]/[slug].astro]
- **Raw author/section strings in content:** Resolve registry keys; do not duplicate identity facts. [VERIFIED: 02-CONTEXT.md]
- **Eager iframe, thumbnail, preconnect, or YouTube script:** Any of these can initiate a third-party request before intent. [VERIFIED: 02-UI-SPEC.md]
- **Visible but unwired activation button:** Start hidden and reveal only after listener registration so no-JavaScript users never meet a dead control. [VERIFIED: 02-UI-SPEC.md]
- **Global overflow-x: hidden:** It conceals reflow failures instead of fixing the forcing element. [VERIFIED: 02-UI-SPEC.md]
- **ARIA-first markup:** Native section, h2, dl, time, ul, a, and button provide semantics; reserve role="status" for the dynamic error announcement. [VERIFIED: 02-UI-SPEC.md]
- **Weakening the MDX allowlist for video or references:** Video belongs in the trusted route component and references belong in validated frontmatter, not arbitrary article JSX/iframes. [VERIFIED: src/lib/mdx-policy.ts] [VERIFIED: 02-CONTEXT.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Arabic date localization | Month-name table or string replacement | Intl.DateTimeFormat with timeZone UTC | Locale and date presentation are native and explicit. [CITED: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat] |
| Mixed-direction isolation | Unicode control-character insertion | bdi with dir plus native dir semantics | bdi isolates a span from surrounding bidi context without hidden control characters. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi] |
| 16:9 sizing | Resize observer or JavaScript height math | CSS aspect-ratio: 16 / 9 | The CSS property defines a preferred width-to-height ratio. [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio] |
| Player controls | Custom play/pause/fullscreen UI | Native activation button plus YouTube iframe controls | The phase owns consent/activation, not a replacement media player. [VERIFIED: 02-SPEC.md] |
| URL parsing | Ad-hoc HTTPS regex | URL.parse plus explicit protocol/hostname/credential checks | The codebase already uses the platform URL parser for protocol policy. [VERIFIED: src/lib/mdx-policy.ts] |
| Accessibility scanner | Local rule catalog | @axe-core/playwright plus manual review | Official Playwright guidance integrates axe and documents automation's limits. [CITED: https://playwright.dev/docs/accessibility-testing] |
| RTL layout transformation | Left/right CSS rewrite plugin | Logical CSS properties and text-align start | The approved UI contract requires logical properties directly. [VERIFIED: 02-UI-SPEC.md] |

**Key insight:** Almost every Phase 2 requirement is a native document-platform concern. Custom abstractions increase surface area at exactly the boundaries already solved by HTML, CSS, Astro static rendering, and Phase 1 validation. [VERIFIED: 02-CONTEXT.md]

## Common Pitfalls

### Pitfall 1: Validating Reference Shape but Not Destination Semantics
**What goes wrong:** A non-empty string can still be javascript:, relative, credential-bearing, or otherwise outside the locked HTTPS contract. [VERIFIED: 02-CONTEXT.md]
**Why it happens:** Zod object shape and URL policy are different checks. [VERIFIED: src/content.config.ts]
**How to avoid:** Parse without a base, require protocol https:, a hostname, and no username/password; report article, entry index, and field. [VERIFIED: existing content-contract diagnostic pattern]
**Warning signs:** The template contains URL repair, protocol branching, or try/catch around malformed references. [VERIFIED: 02-CONTEXT.md]

### Pitfall 2: Triggering YouTube Before Intent
**What goes wrong:** An iframe, poster, preconnect, or remote thumbnail can make a YouTube request during initial load. [VERIFIED: 02-UI-SPEC.md]
**Why it happens:** Developers optimize the visual placeholder before checking the network contract. [VERIFIED: 02-SPEC.md]
**How to avoid:** Use a local CSS-only region and text button; add the hardcoded iframe only inside the click handler. [CITED: https://support.google.com/youtube/answer/171780]
**Warning signs:** Initial HTML contains youtube, youtu.be, i.ytimg.com, iframe, preconnect, or script URLs other than the static direct anchor href. [VERIFIED: 02-SPEC.md]

### Pitfall 3: Losing Focus When Replacing the Button
**What goes wrong:** Removing the focused trigger leaves keyboard users without a clear location. [VERIFIED: 02-UI-SPEC.md]
**Why it happens:** DOM replacement is treated as visual-only state. [VERIFIED: fixing-accessibility skill]
**How to avoid:** Set the iframe title first, replace the button, then call iframe.focus(); verify Tab and Shift+Tab continue. [VERIFIED: 02-UI-SPEC.md]
**Warning signs:** document.activeElement becomes body after activation or focus is invisible on the iframe. [VERIFIED: 02-SPEC.md]

### Pitfall 4: Duplicate Players
**What goes wrong:** Repeated events or duplicate initialization create more than one iframe/request. [VERIFIED: 02-CONTEXT.md]
**Why it happens:** A click handler lacks one-shot registration and a DOM guard. [VERIFIED: 02-UI-SPEC.md]
**How to avoid:** Use both { once: true } and an existing-iframe guard; test repeat activation/synthetic clicks. [VERIFIED: 02-UI-SPEC.md]
**Warning signs:** More than one iframe or more than one youtube-nocookie embed request exists. [VERIFIED: 02-SPEC.md]

### Pitfall 5: Local-Time Date Drift
**What goes wrong:** A date-only fact can render as the previous/next day when parsed or formatted in a build machine's local time zone. [VERIFIED: 02-CONTEXT.md]
**Why it happens:** Parsing and formatting use implicit time zones. [CITED: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat]
**How to avoid:** Append an explicit UTC midnight to the already validated date and format with timeZone UTC. [VERIFIED: 02-UI-SPEC.md]
**Warning signs:** Tests depend on the workstation time zone or compare raw Date.toString output. [VERIFIED: 02-CONTEXT.md]

### Pitfall 6: Scoped CSS Missing Rendered Markdown/MDX
**What goes wrong:** Route chrome is styled but authored h2, lists, links, quotations, and code retain defaults. [CITED: https://docs.astro.build/en/guides/styling/]
**Why it happens:** Astro scoped styles do not automatically cross every child component boundary. [CITED: https://docs.astro.build/en/guides/styling/]
**How to avoid:** Use one intentional global style block/import for the article route or explicit :global descendants. [CITED: https://docs.astro.build/en/guides/styling/]
**Warning signs:** Markdown and MDX routes compute different typography despite the same shell. [VERIFIED: 02-SPEC.md]

### Pitfall 7: Over-Isolating Arabic Content
**What goes wrong:** Applying dir=ltr to containers or splitting Arabic character-by-character breaks joining, diacritics, and reading order. [VERIFIED: 02-UI-SPEC.md]
**Why it happens:** Direction is treated as a global visual fix instead of isolating only mixed fragments. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi]
**How to avoid:** Keep ordinary prose inherited RTL; wrap only dates, URLs, IDs, numbers, and code-like fragments in bdi with dir auto/ltr as appropriate. [VERIFIED: 02-UI-SPEC.md]
**Warning signs:** Arabic prose has letter-spacing, forced ltr, left alignment, or explicit Unicode bidi controls. [VERIFIED: 02-UI-SPEC.md]

### Pitfall 8: Empty Optional UI
**What goes wrong:** Missing updatedAt or references leaves an empty heading, separator, dl row, or spacing gap. [VERIFIED: 02-CONTEXT.md]
**Why it happens:** Containers render unconditionally while only their contents are conditional. [VERIFIED: 02-UI-SPEC.md]
**How to avoid:** Guard the complete metadata row/reference section with the data condition. [VERIFIED: 02-CONTEXT.md]
**Warning signs:** Empty المراجع headings or update labels appear on the MDX proof route selected to omit optional facts. [VERIFIED: recommended proof matrix]

### Pitfall 9: Bypassing Public Queries or MDX Policy
**What goes wrong:** Direct getCollection usage in the route can leak drafts or skip collision checks; article-authored iframes/scripts expand XSS and third-party origins. [VERIFIED: 01-SECURITY.md]
**Why it happens:** Phase 2 features are wired beside rather than through Phase 1 boundaries. [VERIFIED: 01-VERIFICATION.md]
**How to avoid:** Keep getPublicArticles/getPreviewArticles and mdxComponents exactly in the current route flow; build the player only in a trusted Astro component. [VERIFIED: src/lib/articles.ts] [VERIFIED: src/components/mdx-components.ts]
**Warning signs:** New getCollection call, new route family, new MDX component name, raw HTML permission, or article iframe. [VERIFIED: src/lib/mdx-policy.ts]

### Pitfall 10: Treating Axe as Complete Accessibility Proof
**What goes wrong:** Automated checks pass while heading meaning, Arabic accessible names, focus order, bidi readability, or keyboard traps remain wrong. [CITED: https://playwright.dev/docs/accessibility-testing]
**Why it happens:** Automated coverage is mistaken for human judgment. [CITED: https://playwright.dev/docs/accessibility-testing]
**How to avoid:** Keep the explicit manual gates in Validation Architecture. [VERIFIED: 02-SPEC.md]
**Warning signs:** The plan has an axe task but no keyboard, accessibility-tree, zoom, or visual bidi checkpoint. [VERIFIED: 02-CONTEXT.md]

### Pitfall 11: Browser Artifacts Entering Watched Paths
**What goes wrong:** Reports, screenshots, traces, and videos under source/planning paths create noisy diffs or CI watch loops. [VERIFIED: user-provided AGENTS instructions]
**Why it happens:** Playwright defaults are accepted without project-specific output configuration. [CITED: https://playwright.dev/docs/test-configuration]
**How to avoid:** Set every Playwright output/report/snapshot path under .artifacts; the directory is already ignored. [VERIFIED: .gitignore]
**Warning signs:** test-results, playwright-report, screenshots, traces, or videos appear outside .artifacts. [VERIFIED: user-provided AGENTS instructions]

## Code Examples

Verified patterns from official sources and locked project contracts are shown in Architecture Patterns. The planner should reference those examples rather than introduce new helpers or dependencies. [VERIFIED: 02-CONTEXT.md]

### Conditional References

~~~astro
<!-- Source: locked D-04; descriptive Arabic labels, not raw URLs. -->
{
  article.data.references?.length ? (
    <section aria-labelledby="references-heading">
      <h2 id="references-heading">المراجع</h2>
      <ul>
        {article.data.references.map((reference) => (
          <li>
            <a href={reference.url}>{reference.label}</a>
          </li>
        ))}
      </ul>
    </section>
  ) : null
}
~~~

Astro escapes interpolated text/attributes, while the content contract separately limits the destination scheme to absolute HTTPS. [CITED: https://docs.astro.build/en/reference/astro-syntax/] [VERIFIED: 02-CONTEXT.md]

### Responsive Overflow Assertion

~~~typescript
// Source: locked Phase 2 acceptance widths.
for (const width of [320, 390, 768, 1024, 1440]) {
  test("reflows at " + width + "px", async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/القضايا-العامة/اختبار-عقد-المحتوى/");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
~~~

Do not set overflow-x hidden to make this assertion pass; locate and fix the forcing element. [VERIFIED: 02-UI-SPEC.md]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Eager youtube.com iframe in initial HTML | Intent-gated youtube-nocookie.com iframe plus permanent direct link | Locked for Phase 2 on 2026-08-26 | No player request occurs before reader intent, and failure does not block continuation. [CITED: https://support.google.com/youtube/answer/171780] [VERIFIED: 02-CONTEXT.md] |
| Client framework/custom element for a single player | Processed Astro script with native DOM and button | Locked for Phase 2 on 2026-08-26 | Production gains only the behavior it needs and no UI runtime. [CITED: https://docs.astro.build/en/guides/client-side-scripts/] |
| Implicit/local date formatting | Explicit Arabic Intl formatter with UTC | Locked for Phase 2 on 2026-08-26 | Visible dates remain stable across build environments. [CITED: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat] |
| Directional left/right CSS and raw mixed text | Logical properties plus bdi isolation | Current native platform pattern | The same layout follows RTL semantics while isolated LTR fragments preserve order. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi] |
| Accessibility by DOM inspection alone | Playwright/axe automation plus explicit manual gates | Required by Phase 2 validation | Common violations become repeatable regressions without claiming automation is complete. [CITED: https://playwright.dev/docs/accessibility-testing] |

**Deprecated/outdated:**
- Do not add old YouTube parameters such as modestbranding, showinfo, autohide, or theme; the official parameter reference marks them deprecated/nonfunctional. [CITED: https://developers.google.com/youtube/player_parameters]
- Do not carry Phase 1's “zero client scripts” output expectation into Phase 2; the locked exception is one minimal player enhancement, while the article/direct link remain static. [VERIFIED: 01-VERIFICATION.md] [VERIFIED: 02-CONTEXT.md]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | None. Stack/package claims were checked against the codebase, official documentation, npm registry, and slopcheck; implementation choices are locked by CONTEXT/SPEC/UI-SPEC. | — | — |

## Open Questions

None block planning. Use the public Markdown proof record to exercise updatedAt plus references, and use the public approved-MDX record to exercise clean omission of both optional facts; keep both explicitly labelled as contract fixtures because Phase 3 owns real launch articles/videos/references. [VERIFIED: 02-CONTEXT.md] [VERIFIED: .planning/ROADMAP.md]

The caller explicitly identifies 02-UI-SPEC.md as the approved visual/interaction contract, which resolves its stale draft/pending frontmatter and checker footer for this research run. [VERIFIED: caller scope]

### What Might Have Been Missed Review

The final review checked for hidden runtime state, database/schema work, AI behavior, production SEO metadata, analytics, webfonts/assets, global navigation, and alternate route families; none belongs to Phase 2. The remaining non-automatable risks are explicitly carried by the manual 200% zoom, visual bidi/diacritic, accessibility-tree, cross-origin keyboard, blocked-cookie, and initial-network gates below. [VERIFIED: 02-SPEC.md] [VERIFIED: .planning/ROADMAP.md]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js exact runtime | All project commands | ✓, bundled executable available but not selected on PATH | 24.19.0 bundled; PATH currently 24.8.0 | Select the bundled/official exact runtime before execution. [VERIFIED: environment probe 2026-08-26] |
| npm exact package manager | Install/full gate | ✗ currently selected | 11.12.1 selected; 11.17.0 required | No compatible fallback because preinstall intentionally enforces 11.17.0; select/install the exact npm first. [VERIFIED: package.json] |
| Existing Astro dependencies | Build/check | ✓ | Exact lock: Astro 7.2.7, MDX 7.0.8, Astro Check 0.9.10, TypeScript 6.0.3 | — [VERIFIED: package-lock.json] |
| Chrome | Manual browser verification / possible local Playwright channel | ✓ | 151.0.7922.174 | Edge 151.0.4129.107 is also installed. [VERIFIED: environment probe 2026-08-26] |
| Playwright Chromium | Repeatable browser tests | ⚠ cached older revisions, Phase 2 version not installed | @playwright/test 1.62.1 browser not yet installed | Run the local exact Playwright install command in Wave 0. [VERIFIED: environment probe 2026-08-26] |
| @axe-core/playwright | Automated accessibility gate | ✗ project dependency absent | 4.13.0 recommended | Install exact dev dependency in Wave 0. [VERIFIED: package.json] [VERIFIED: npm registry] |
| .artifacts ignore boundary | Browser artifacts | ✓ | .artifacts/ ignored | Configure all Playwright output beneath it. [VERIFIED: .gitignore] |
| Context7 CLI/MCP | Documentation lookup | ✗ | — | Official Astro, MDN, Google/YouTube, Playwright, Deque, and OWASP docs were fetched directly. [VERIFIED: environment probe 2026-08-26] |

**Missing dependencies with no fallback:**
- Exact npm 11.17.0 is not selected; execution must repair/select it before npm install or the full gate. [VERIFIED: package.json] [VERIFIED: environment probe 2026-08-26]

**Missing dependencies with fallback/setup:**
- The exact Playwright/axe dev packages and matching Chromium are absent; Wave 0 installs them after exact runtime selection. [VERIFIED: package.json] [VERIFIED: npm registry]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Unit framework | Node.js 24.19.0 built-in node:test with node:assert/strict. [VERIFIED: package.json] |
| Browser framework | @playwright/test 1.62.1 with @axe-core/playwright 4.13.0. [VERIFIED: npm registry] |
| Config file | playwright.config.ts — Wave 0; webServer runs the built Astro preview and every output path is under .artifacts. [VERIFIED: user-provided AGENTS instructions] |
| Quick run command | npm test [VERIFIED: package.json] |
| Focused browser command | npx playwright test tests/article-journey.spec.ts --project=chromium [CITED: https://playwright.dev/docs/running-tests] |
| Full suite command | npm run verify after extending verify to run unit tests, Astro check, production build, then Playwright. [VERIFIED: Phase 1 composite-gate pattern] |

Recommended package scripts/configuration:

~~~json
{
  "scripts": {
    "preview": "astro preview",
    "test:browser": "playwright test",
    "verify": "npm test && npm run check && npm run build && npm run test:browser"
  }
}
~~~

playwright.config.ts should set testDir to tests, match only *.spec.ts, use baseURL http://127.0.0.1:4321, start npm run preview -- --host 127.0.0.1 through webServer, set outputDir to .artifacts/playwright, and place any HTML report under .artifacts/playwright-report. [CITED: https://playwright.dev/docs/test-configuration] [VERIFIED: .gitignore]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SITE-01 | Both routes expose exact Arabic labels/control names and no English UI chrome | browser DOM/accessibility | npx playwright test tests/article-journey.spec.ts -g "Arabic surface" | ❌ Wave 0 |
| SITE-02 | html lang=ar and dir=rtl on Markdown and MDX routes | browser DOM | npx playwright test tests/article-journey.spec.ts -g "Arabic document semantics" | ❌ Wave 0 |
| ART-01 | Static ordered title → facts → الخلاصة → authored body/conclusion, one h1, no skipped levels | browser + built output | npx playwright test tests/article-journey.spec.ts -g "complete text-first" | ❌ Wave 0 |
| ART-02 | No page overflow at 320/390/768/1024/1440 and computed body ≥1rem | browser responsive | npx playwright test tests/article-journey.spec.ts -g "reflow" | ❌ Wave 0 |
| ART-03 | Representative bdi dir boundaries exist; visual mixed fragments stay ordered | DOM + manual visual | npx playwright test tests/article-journey.spec.ts -g "bidi" | ❌ Wave 0 |
| ART-04 | Initial zero YouTube request/iframe; one click creates exactly one no-autoplay youtube-nocookie iframe in unchanged region | browser network/DOM | npx playwright test tests/article-journey.spec.ts -g "intent-gated player" | ❌ Wave 0 |
| ART-05 | Exact direct URL and descriptive Arabic link remain with JS disabled and embed blocked | browser degraded mode | npx playwright test tests/article-journey.spec.ts -g "direct YouTube" | ❌ Wave 0 |
| ART-06 | Reference schema/semantic failures; registry facts/date/update render once; absent optionals leave no container | unit + browser | npm test; npx playwright test tests/article-journey.spec.ts -g "provenance" | ⚠ extend existing unit file; browser Wave 0 |
| ART-07 | Labelled الخلاصة precedes authored body and uses validated summary | browser DOM | npx playwright test tests/article-journey.spec.ts -g "summary" | ❌ Wave 0 |
| QUAL-01 | Native landmark/heading/link/button names and zero serious/critical axe violations on both routes | axe + browser DOM | npx playwright test tests/article-journey.spec.ts -g "accessibility" | ❌ Wave 0 |
| QUAL-02 | Keyboard activates trigger/link; focus moves to iframe; Tab/Shift+Tab escape; focus style visible | browser keyboard + manual | npx playwright test tests/article-journey.spec.ts -g "keyboard" | ❌ Wave 0 |
| QUAL-03 | Locked contrast/type/target computed styles, responsive reflow, manual 200% zoom | axe/browser + manual | npx playwright test tests/article-journey.spec.ts -g "quality" | ❌ Wave 0 |
| QUAL-04 | Complete text/direct link with javaScriptEnabled false; blocked embed does not remove fallback | browser degraded mode | npx playwright test tests/article-journey.spec.ts -g "degraded" | ❌ Wave 0 |

### Required Automated Scenarios

1. Extend tests/content-contract.test.ts with valid undefined/empty/nonempty references, blank/non-Arabic-facing label, non-array/wrong shape through schema/check, relative/http/javascript/malformed/credential-bearing URLs, and a valid HTTPS URL. Existing 55 Phase 1 cases must remain green. [VERIFIED: tests/content-contract.test.ts] [VERIFIED: 02-CONTEXT.md]
2. Build both public proof routes and assert the production draft HTML path remains absent. [VERIFIED: 01-VERIFICATION.md]
3. For both Markdown and approved MDX routes, assert exact Arabic document semantics, one h1, ordered h2 hierarchy, summary/facts/body/conclusion, media heading, hidden initial trigger until hydration, direct link, and no initial iframe. [VERIFIED: 02-SPEC.md]
4. Put updatedAt/references on one public proof record and omit them on the other; assert the optional row/section appears once on the first and not at all on the second. [VERIFIED: 02-CONTEXT.md]
5. Capture requests whose host contains youtube, youtu.be, ytimg, or googlevideo; before activation the count must be zero. After activation, assert one iframe with hostname www.youtube-nocookie.com, encoded validated ID path, no autoplay=1, and exactly one activation request/iframe. [VERIFIED: 02-SPEC.md]
6. Run one context with javaScriptEnabled false and one with youtube-nocookie aborted; in both, assert the full article and exact permanent direct link remain visible/operable. [CITED: https://playwright.dev/docs/api/class-browser#browser-new-context-option-java-script-enabled] [VERIFIED: 02-CONTEXT.md]
7. Inject an iframe-construction failure before page script execution, activate the button, and assert the Arabic role=status error appears while the direct link stays unchanged. [VERIFIED: 02-UI-SPEC.md]
8. At each locked width, assert document scrollWidth <= clientWidth, article max measure, body font size >=16px, controls min block size >=44px, and no authored content is hidden/truncated. [VERIFIED: 02-UI-SPEC.md]
9. Run AxeBuilder on both routes before activation and fail on serious/critical violations; do not scan the third-party iframe as proof of local accessibility. [CITED: https://playwright.dev/docs/accessibility-testing]
10. Assert all Playwright reports, traces, screenshots, videos, and snapshots resolve beneath .artifacts. [VERIFIED: user-provided AGENTS instructions]

### Manual / Browser Gates

- At 320, 390, 768, 1024, and 1440 CSS pixels, visually confirm Arabic line measure, no clipped diacritics, no overlap, correct start alignment, and restrained one-column hierarchy. [VERIFIED: 02-UI-SPEC.md]
- At 200% browser zoom, confirm no page-level horizontal scrolling, no clipped text/control, and usable multiline 44px targets; do not substitute CSS zoom for this pass. [VERIFIED: 02-SPEC.md]
- Inspect a representative HTTPS URL, YouTube ID, Arabic/ASCII digits, punctuation, date, and diacritics on mobile and desktop for correct bidi order. [VERIFIED: 02-CONTEXT.md]
- Inspect the accessibility tree for Arabic names and logical order: document, main, article, h1/h2/h3, direct link, activation button, and inserted iframe. [VERIFIED: 02-SPEC.md]
- Complete keyboard-only Tab/Shift+Tab passes before and after activation; verify the focus indicator is visible, focus enters the iframe after replacement, and exits both directions without a trap. [VERIFIED: 02-UI-SPEC.md]
- Disable JavaScript and block youtube-nocookie.com separately; confirm article comprehension and the direct action remain intact, with no dead activation button in the JavaScript-disabled state. [VERIFIED: 02-CONTEXT.md]
- Block third-party cookies in the browser and repeat activation/direct-link checks; the article and direct link must remain complete regardless of the embedded player's cookie behavior. [VERIFIED: 02-SPEC.md]
- Inspect initial network activity and built HTML for no iframe, YouTube script, preconnect, poster, ytimg request, or other eager third-party media. [VERIFIED: 02-UI-SPEC.md]

### Sampling Rate

- **Per task commit:** npm test; for UI/player tasks also run the focused Playwright grep for the changed behavior. [VERIFIED: Nyquist requirement]
- **Per wave merge:** npm run check && npm run build && npm run test:browser. [VERIFIED: Phase 1 gate pattern]
- **Phase gate:** Exact Node 24.19.0/npm 11.17.0 npm run verify green, all manual/browser gates recorded, both public routes present, and draft route absent before gsd-verify-work. [VERIFIED: 02-SPEC.md]

### Wave 0 Gaps

- [ ] Select exact Node 24.19.0 and npm 11.17.0 before dependency changes. [VERIFIED: environment probe 2026-08-26]
- [ ] Install exact dev packages @playwright/test@1.62.1 and @axe-core/playwright@4.13.0, then install matching Chromium. [VERIFIED: npm registry]
- [ ] playwright.config.ts — built preview server, Chromium project, test match, and all outputs under .artifacts. [CITED: https://playwright.dev/docs/test-configuration]
- [ ] tests/article-journey.spec.ts — vertical Markdown/MDX, a11y, network, degraded-mode, keyboard, and reflow scenarios. [VERIFIED: 02-SPEC.md]
- [ ] Extend tests/content-contract.test.ts for references without weakening the Phase 1 matrix. [VERIFIED: tests/content-contract.test.ts]
- [ ] Add preview/test:browser scripts and append the browser gate to verify after the production build. [VERIFIED: Phase 1 composite-gate pattern]
- [x] .artifacts/ is already ignored; do not create another browser-output directory. [VERIFIED: .gitignore]

## Security Domain

Security enforcement is enabled at ASVS Level 1 and blocks high-severity gaps. This static phase has no authentication/session/access-control boundary; its meaningful trust boundaries are build-time article data, restricted MDX, generated outbound URLs, client-created iframe state, draft visibility, and third-party requests. [VERIFIED: .planning/config.json] [VERIFIED: 02-SPEC.md]

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No identity/login feature or secret exists in Phase 2. [VERIFIED: 02-SPEC.md] |
| V3 Session Management | no | The site remains static and has no session state. [VERIFIED: astro.config.mjs] |
| V4 Access Control | no | There are no authenticated resources; draft exclusion is a build/output policy protected by the public query. [VERIFIED: src/lib/articles.ts] |
| V5 Input Validation | yes | Astro Zod shape validation, shared semantic validation, absolute HTTPS references, encoded YouTube IDs, Astro escaping, and the existing MDX preflight. [VERIFIED: src/content.config.ts] [VERIFIED: src/lib/mdx-policy.ts] |
| V6 Cryptography | no | Phase 2 implements no cryptographic operation; HTTPS endpoints are fixed/validated rather than custom crypto. [VERIFIED: 02-CONTEXT.md] |
| V8 Data Protection | yes, privacy boundary | No YouTube request before intent; the direct link is inert until navigation and the embed uses the privacy-enhanced host. [CITED: https://support.google.com/youtube/answer/171780] |

### Concrete Phase 2 Threat Model

| Threat ID | Pattern | STRIDE | Standard Mitigation | Verification |
|-----------|---------|--------|---------------------|--------------|
| T2-01 | Reference URL injects unsafe scheme, credentials, or misleading parser form | Spoofing / Tampering | Validate at build time with URL.parse; require absolute https:, hostname, no credentials; render descriptive Arabic label; same-tab only. [VERIFIED: 02-CONTEXT.md] | Unit cases for relative/http/javascript/malformed/userinfo plus valid HTTPS. |
| T2-02 | YouTube ID escapes an attribute/path or changes query behavior | Tampering / XSS | Preserve Phase 1 11-character allowlist, pass through escaped data attribute, and apply encodeURIComponent before URL concatenation. [VERIFIED: src/lib/content-contract.ts] | Existing invalid-ID tests plus exact iframe/direct URL assertions. |
| T2-03 | Client script creates iframe to an attacker-controlled host or creates duplicates | Tampering / Elevation | Hardcode https://www.youtube-nocookie.com/embed/; accept only validated ID; one-shot listener plus iframe guard; never accept full embed URL from content. [CITED: https://support.google.com/youtube/answer/171780] | Host/path/no-autoplay/exact-one browser test. |
| T2-04 | Target/new-window link exposes opener or unexpected navigation | Spoofing / Elevation | Keep every Phase 2 link same-tab and omit target=_blank; therefore no opener relationship is created. If later scope changes target, require rel=noopener. [VERIFIED: 02-UI-SPEC.md] | Assert no target attribute on reference/direct links. |
| T2-05 | Article-authored MDX injects script, iframe, event handler, expression, unsafe URL, or unapproved component | Tampering / Elevation | Preserve the configuration-load structural preflight and exact component map; do not add player/reference MDX permissions. [VERIFIED: src/lib/mdx-policy.ts] [VERIFIED: 01-SECURITY.md] | All existing MDX regression cases remain green. |
| T2-06 | Draft route leaks into production through new rendering code | Information Disclosure | Route continues to call getPublicArticles in production; no direct getCollection call or alternate route family. [VERIFIED: src/lib/articles.ts] | Built draft path absent; public paths exactly two. |
| T2-07 | Initial page load leaks reader data to YouTube/thumbnail hosts before intent | Information Disclosure | No iframe, remote poster, preconnect, YouTube script, or ytimg asset; only a static href; create nocookie iframe after click. [VERIFIED: 02-UI-SPEC.md] | Initial HTML and request log contain zero YouTube-family requests. |
| T2-08 | Dynamic error/title content becomes HTML injection | XSS / Tampering | Set iframe.title and status text through DOM properties/static text; never use innerHTML. Astro escapes server-rendered text/attributes. [CITED: https://docs.astro.build/en/reference/astro-syntax/] | Code review grep rejects innerHTML/insertAdjacentHTML in player component. |
| T2-09 | Optional values produce misleading empty provenance | Spoofing | Render the complete update/reference semantic unit only when data exists; source author/section only from registries. [VERIFIED: 02-CONTEXT.md] | Presence/absence proof matrix. |
| T2-10 | Test tooling or browser binaries become a supply-chain vector | Tampering | Exact pins, committed lock integrity, official package provenance, slopcheck OK, no postinstall script, explicit Chromium install, devDependencies only. [VERIFIED: npm registry] | npm ci, npm audit, lock inspection, package legitimacy audit. |

### Security Planning Gates

- Block implementation if reference validation accepts non-HTTPS, relative, credential-bearing, or unparsable destinations. [VERIFIED: 02-CONTEXT.md]
- Block implementation if the initial page creates any YouTube-family request or iframe before activation. [VERIFIED: 02-SPEC.md]
- Block implementation if the player accepts a content-provided full URL, uses innerHTML, weakens the YouTube ID regex, or weakens the MDX preflight/allowlist. [VERIFIED: 01-SECURITY.md]
- Block implementation if the production route bypasses getPublicArticles or a draft file appears in dist. [VERIFIED: src/lib/articles.ts]
- Do not add CSP, security headers, analytics consent, domain policy, or hosting controls in Phase 2; those require the later production boundary. [VERIFIED: .planning/ROADMAP.md]

## Sources

### Primary (HIGH confidence)

- [Astro client-side scripts](https://docs.astro.build/en/guides/client-side-scripts/) — processed scripts, bundling, module behavior, deduplication, and data-attribute pattern. [CITED: https://docs.astro.build/en/guides/client-side-scripts/]
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/) — schema validation, querying, and body rendering. [CITED: https://docs.astro.build/en/guides/content-collections/]
- [Astro styling](https://docs.astro.build/en/guides/styling/) — scoped/global CSS behavior and child boundaries. [CITED: https://docs.astro.build/en/guides/styling/]
- [Astro template syntax](https://docs.astro.build/en/reference/astro-syntax/) — safe interpolation in Astro templates. [CITED: https://docs.astro.build/en/reference/astro-syntax/]
- [YouTube embed parameters](https://developers.google.com/youtube/player_parameters) — iframe URL form, autoplay parameter, and deprecated parameters; page last-modified 2026-04-28 during retrieval. [CITED: https://developers.google.com/youtube/player_parameters]
- [YouTube Privacy Enhanced Mode](https://support.google.com/youtube/answer/171780) — youtube-nocookie.com domain. [CITED: https://support.google.com/youtube/answer/171780]
- [MDN bdi](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi) — bidirectional isolation. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi]
- [MDN time](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time) — datetime machine-readable value. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time]
- [MDN Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) — locale, dateStyle, and timeZone. [CITED: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat]
- [MDN aspect-ratio](https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio) — preferred width/height ratio. [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio]
- [MDN focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible) — input-modality-aware focus indicator. [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible]
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing) — official axe integration and automation limitations. [CITED: https://playwright.dev/docs/accessibility-testing]
- [Deque axe Playwright package](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) — official package/source and AxeBuilder usage. [CITED: https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright]
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) — security verification framework used by project configuration. [CITED: https://owasp.org/www-project-application-security-verification-standard/]
- npm registry and downloads API — exact package versions, publication dates, repositories, weekly downloads, engines/peers, and absent postinstall metadata checked 2026-08-26. [VERIFIED: npm registry]
- Phase 2 CONTEXT, SPEC, and approved UI-SPEC — locked scope, behavior, copy, visual system, state matrix, and validation gates. [VERIFIED: 02-CONTEXT.md] [VERIFIED: 02-SPEC.md] [VERIFIED: 02-UI-SPEC.md]
- Phase 1 implementation, verification, and security audit — current trusted boundaries and regression guarantees. [VERIFIED: 01-VERIFICATION.md] [VERIFIED: 01-SECURITY.md]

### Secondary (MEDIUM confidence)

- None. Ecosystem/package discovery was verified against official sources and registry metadata. [VERIFIED: research protocol 2026-08-26]

### Tertiary (LOW confidence)

- None. No unverified web-search claim is used. [VERIFIED: research protocol 2026-08-26]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — production stack is already locked/installed; the two test packages were confirmed by official docs, npm metadata, and slopcheck. [VERIFIED: package-lock.json] [VERIFIED: npm registry]
- Architecture: HIGH — recommendations extend the verified Phase 1 route/query/schema/MDX flow and use locked Phase 2 contracts. [VERIFIED: 01-VERIFICATION.md] [VERIFIED: 02-CONTEXT.md]
- Pitfalls: HIGH — each pitfall maps to a locked acceptance state, existing security boundary, or official platform/tool documentation. [VERIFIED: 02-SPEC.md]
- Validation: HIGH — every Phase 2 requirement ID maps to a runnable automated command plus explicit manual gates where automation is incomplete. [VERIFIED: .planning/config.json] [CITED: https://playwright.dev/docs/accessibility-testing]
- Security: HIGH — concrete threats cover references, encoded IDs, iframe creation, target safety, XSS/MDX, drafts, and third-party requests as requested. [VERIFIED: caller scope]

**Research date:** 2026-08-26
**Valid until:** 2026-09-02 — browser testing packages are fast-moving; locked production stack remains valid until deliberately upgraded. [VERIFIED: npm registry]
