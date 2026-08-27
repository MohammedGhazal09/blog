# Phase 4: Search Discovery Integrity — Specification

**Created:** 2026-08-27
**Ambiguity score:** 0.04 (gate: ≤ 0.20)
**Requirements:** 6 locked

## Goal

Every generated public route presents one unique Arabic search identity, one self-consistent canonical and social identity derived from a single configured origin, and an indexing policy that exposes only published content; missing routes return a useful Arabic 404 response.

## Background

Phase 3 produces a complete static graph of eight public routes: the homepage, three section indexes, three published articles, and the Ahmed El-Mangawy author page. Each route already has exactly one visible Arabic `h1`, ordinary crawlable links, RTL document semantics, and production-only filtering that excludes the two proof drafts. The shared `SiteLayout.astro`, however, emits no page title, description, canonical, social metadata, robots directive, or favicon. `astro.config.mjs` has no configured site origin or sitemap integration, no robots endpoint exists, and an unknown route receives Astro's generic response rather than a useful Arabic page. Phase 4 closes that discovery-identity gap without deploying the site or adding runtime behavior.

## Requirements

1. **Unique Arabic page identity**: Every indexable generated page has exactly one non-empty descriptive Arabic `<title>`, one non-empty Arabic meta description, and one visible `h1`; titles and descriptions are unique across the complete public route set.
   - Current: Public pages already expose one Arabic `h1`, but `SiteLayout.astro` renders neither `<title>` nor `<meta name="description">`.
   - Target: Homepage, section, article, and author routes provide page-specific Arabic title and description values through one shared head boundary. Article identity derives from validated article frontmatter; section and author identity derives from the established registries or locked page copy.
   - Acceptance: A fresh static-build crawl finds exactly one title, description, and `h1` on every indexable HTML page; each value contains Arabic text, is non-empty, and no two indexable routes share the same title or description.

2. **Canonical and social consistency**: Every indexable page emits one absolute self-canonical URL and accurate text-based Open Graph and Twitter metadata derived from the same page identity and configured site origin.
   - Current: No production origin, canonical link, Open Graph metadata, or Twitter metadata exists.
   - Target: One validated site origin supplies every absolute URL. Canonicals use the route's existing trailing-slash form with no query or fragment. `og:title`, `og:description`, and `og:url` match the page title, description, and canonical; article pages use the article Open Graph type and other public pages use the website type. Text-only sharing metadata is complete without inventing an unapproved image.
   - Acceptance: Building against a controlled origin and crawling every indexable route proves one canonical per page, exact canonical-to-route equality, one-to-one metadata equality, the correct Open Graph type, and no foreign, placeholder, query, or fragment URL.

3. **Origin safety boundary**: Local development and verification remain runnable without a deployed domain, while launch-readiness output cannot silently publish placeholder or local canonical URLs.
   - Current: Astro has no `site` setting, and the final hostname is not yet available.
   - Target: Ordinary local development/builds use the explicit local preview origin. A launch-readiness build requires one explicit valid HTTPS origin, rejects credentials, queries, fragments, paths other than `/`, localhost, IP hosts, and reserved placeholder domains, and normalizes the accepted origin once for all consumers. Phase 5 supplies and proves the real external value.
   - Acceptance: Focused checks prove valid HTTPS origins build, malformed or non-production origins fail before output is accepted, ordinary local verification remains green, and no content file can override the origin or canonical URL.

4. **Published-only discovery graph**: Search discovery output contains all and only generated public routes, while ordinary HTML links still connect the homepage, section indexes, articles, and author page.
   - Current: Public route queries and indexes already exclude drafts, but no sitemap or metadata-level regression check protects that exclusion.
   - Target: The current public route graph remains fully reachable through static anchors; draft proof routes and their titles, slugs, and media identifiers appear in no production HTML, canonical, social metadata, sitemap, or robots output.
   - Acceptance: An independent source/build/HTML comparison proves every published route is linked and discoverable exactly once where expected, every draft route is absent, and all internal public links resolve successfully.

5. **Sitemap and robots agreement**: Build output exposes a canonical sitemap and robots policy derived from the same configured origin and generated route set.
   - Current: Neither sitemap output nor a robots endpoint exists.
   - Target: Astro's maintained sitemap integration enumerates generated indexable routes rather than a hand-maintained URL list. Robots allows crawling of public content and names the absolute canonical sitemap URL. The 404 page, draft routes, proof content, and development-only resources are excluded.
   - Acceptance: XML/text parsing confirms that sitemap URLs equal the complete canonical indexable route set, each sitemap URL uses the configured origin and trailing slash, robots names that sitemap exactly once, and robots contains no rule that pretends to secure draft content.

6. **Arabic missing-route recovery and browser identity**: Unknown routes return a useful Arabic 404 page with an ordinary link back to the homepage, and every public page references one valid local favicon.
   - Current: Unknown routes receive the generic framework response and browser favicon requests return 404.
   - Target: A static Arabic/RTL 404 document uses the shared layout, contains exactly one clear `h1`, explains the error in Arabic, offers a normal home link, and declares `noindex,follow` without a canonical or sitemap entry. A minimal local favicon uses the existing visual palette and requires no remote request or client JavaScript.
   - Acceptance: Browser requests to representative missing paths return HTTP 404 with the locked Arabic recovery surface, home navigation succeeds, robots metadata is `noindex,follow`, the page is absent from the sitemap, and the favicon request succeeds with a valid image response.

## Boundaries

**In scope:**

- One shared static metadata interface consumed by every public page family.
- Validated site-origin handling for local verification and fail-closed launch-readiness builds.
- Canonical, Open Graph, Twitter, robots, sitemap, and favicon output.
- One static Arabic/RTL 404 page with a home recovery link and noindex policy.
- Native and browser regression checks for metadata uniqueness, route/canonical equality, draft exclusion, discovery-file agreement, and missing-route behavior.

**Out of scope:**

- Selecting or purchasing a final domain, configuring a hosting provider, redirects, DNS, TLS, or proving a live origin — Phase 5 owns deployment.
- Google Search Console verification or sitemap submission — Phase 5 owns external search operations.
- Analytics, consent UI, or outbound-click measurement — Phase 5 owns measurement and its governance.
- Production crawl certification, native browser-chrome 200% zoom, live YouTube playback, or Core Web Vitals certification — Phase 6 owns production verification.
- JSON-LD, `Article`, `Person`, breadcrumbs, `VideoObject`, keywords metadata, rich-result work, or an invented social image — structured data is deferred by `SEO-07`, keywords are not a requirement, and no approved share image exists.
- English, alternate-language routes, locale switching, or `hreflang` — the product remains Arabic-only.

## Constraints

- Keep Astro static output and the existing trailing-slash route contract.
- Emit no new client-side JavaScript, remote font, remote image, CMS, database, or runtime metadata fetch.
- Reuse the existing content and registry facts; page files must not repeat article canonical URLs, author facts, or section identity.
- Add only Astro's maintained sitemap integration as a production dependency; use platform/Astro primitives for every other Phase 4 behavior.
- Do not read or create `.env` files. The launch origin is a non-secret build input supplied explicitly by Phase 5 infrastructure.
- All reader-facing and browser-visible text remains Arabic and every rendered document retains `lang="ar" dir="rtl"`.

## Acceptance Criteria

- [ ] Every indexable built page has one unique descriptive Arabic title, one unique Arabic description, one `h1`, and one absolute self-canonical URL.
- [ ] Open Graph and Twitter text metadata exactly matches each page's visible/maintained identity, with no invented social image or false entity claim.
- [ ] Local verification uses the explicit local origin; launch-readiness rejects a missing or unsafe production origin and succeeds with a controlled valid HTTPS origin.
- [ ] The sitemap URL set exactly equals the canonical published-route set and contains no draft, proof, 404, or development-only route.
- [ ] Robots allows public crawling, references the canonical sitemap exactly once, and does not use crawl rules as draft access control.
- [ ] Homepage-to-section-to-article and article-to-author links remain ordinary, working HTML anchors; all internal public links resolve.
- [ ] Representative missing routes return the Arabic 404 document with HTTP 404, `noindex,follow`, and a working homepage link.
- [ ] Every public page references one local favicon whose request succeeds without a remote dependency.
- [ ] The full native, Astro diagnostic, static build, and browser test gates pass without new client-side code or reader-facing English.

## Ambiguity Report

| Dimension | Score | Min | Status | Notes |
| --- | ---: | ---: | :---: | --- |
| Goal Clarity | 0.96 | 0.75 | ✓ | Public identity and discovery outputs are enumerated and measurable. |
| Boundary Clarity | 0.97 | 0.70 | ✓ | Deployment, external services, structured data, and production certification are explicitly assigned elsewhere. |
| Constraint Clarity | 0.94 | 0.65 | ✓ | Origin behavior, static delivery, dependencies, language, and URL policy are locked. |
| Acceptance Criteria | 0.96 | 0.70 | ✓ | Nine pass/fail checks cover every required surface and failure boundary. |
| **Ambiguity** | **0.04** | **≤0.20** | **✓** | Weighted clarity is 0.96. |

## Interview Log

The owner explicitly approved autonomous use of recommended defaults and instructed the agent not to pause for routine names, files, copy, or technical choices. The following one-shot questionnaire was therefore executed in `--auto` mode.

| Round | Perspective | Question summary | Auto-selected decision |
| --- | --- | --- | --- |
| 1 | Researcher | How can Phase 4 define absolute identity before a live domain exists? | Use one validated build origin; local verification stays local and launch-readiness fails without a safe explicit HTTPS origin. |
| 2 | Simplifier | What is the minimum accurate social/search metadata set? | Title, description, canonical, Open Graph text/URL/type, Twitter text/card, favicon, robots, and sitemap; omit unapproved imagery and structured data. |
| 3 | Boundary Keeper | Which documents are indexable and what remains for later phases? | Index only generated public home/section/article/author routes; noindex the 404; leave deployment, Search Console, analytics, and production certification to Phases 5–6. |
| 4 | Failure Analyst | Which outcomes make the phase invalid? | Duplicate/English/empty metadata, unsafe or placeholder launch origins, canonical-route disagreement, draft leakage, mismatched sitemap/robots, non-Arabic 404, or missing favicon. |
| 5 | Seed Closer | Should drafts be blocked through robots, and should JSON-LD or keywords be added now? | No. Drafts must not exist in output; JSON-LD remains deferred and keywords metadata is excluded. |

---

*Phase: 04-search-discovery-integrity*
*Spec created: 2026-08-27*
*Next step: $gsd-discuss-phase 4 — implementation decisions for the locked search-discovery contract*
