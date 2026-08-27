---
phase: 03-real-content-and-section-discovery
verified: "2026-08-27T18:39:23Z"
status: passed
score: "8/8 must-haves verified"
overrides_applied: 0
must_haves:
  truths:
    - "The Arabic homepage exposes ordinary crawlable links to all three registered sections in registry order, and القسم العلمي is described as structured Islamic scholarship."
    - "Each registered section has a crawlable Arabic index that lists all and only its published articles once, with a useful title, summary, date, and stable link."
    - "Every public article byline links to one Arabic author page whose visible claims are limited to truthful registered author context and the publication purpose."
    - "Each registered section contains at least one substantive, independently readable Arabic launch article."
    - "Each launch article cites supporting sources and links to a real Ahmed El-Mangawy YouTube video whose current title matches the article topic."
    - "Each launch article exposes truthful author/date facts and an Arabic AI-assistance/no-transcript disclosure, while proof data and fabricated human-review claims remain absent from production."
    - "The complete homepage-to-section-to-article-to-author/YouTube graph remains static, Arabic/RTL, keyboard-accessible, responsive, and usable without JavaScript."
    - "The publication pipeline validates collection data, rejects duplicate routes, excludes drafts from production, and fails launch readiness when any registered section has no public article."
  artifacts:
    - path: "src/config/registries.ts"
      provides: "Authoritative section labels, meanings, slugs, order, and author name"
    - path: "src/content.config.ts"
      provides: "Validated Markdown/MDX collection schema"
    - path: "src/lib/content-contract.ts"
      provides: "Arabic metadata, date, slug, reference, draft, route, and launch-coverage validation"
    - path: "src/lib/articles.ts"
      provides: "Public and development article-selection choke point"
    - path: "src/layouts/SiteLayout.astro"
      provides: "Shared Arabic/RTL static document shell"
    - path: "src/pages/index.astro"
      provides: "Registry-derived homepage discovery"
    - path: "src/pages/[section]/index.astro"
      provides: "Registry-derived public section indexes"
    - path: "src/pages/[section]/[slug].astro"
      provides: "Rendered article, contextual author/section links, references, and media continuation"
    - path: "src/pages/عن-أحمد-المنجاوي.astro"
      provides: "Truthful minimal Arabic author destination"
    - path: "src/content/articles/usul-al-radd-ala-al-shubuhat.md"
      provides: "Refutations launch article"
    - path: "src/content/articles/adaab-al-khilaf-al-aam.md"
      provides: "General-issues launch article"
    - path: "src/content/articles/madkhal-ilm-al-imla.md"
      provides: "Scholarship launch article"
  key_links:
    - from: "src/pages/index.astro"
      to: "src/config/registries.ts"
      via: "registry-ordered ordinary section anchors"
    - from: "src/content/articles/*.{md,mdx}"
      to: "src/pages/[section]/index.astro"
      via: "Astro glob schema -> getPublicArticles() -> filtered stable articlePath links"
    - from: "src/content/articles/*.{md,mdx}"
      to: "src/pages/[section]/[slug].astro"
      via: "Astro collection -> public/dev selector -> render(article)"
    - from: "src/pages/[section]/[slug].astro"
      to: "src/pages/عن-أحمد-المنجاوي.astro"
      via: "ordinary linked author byline"
    - from: "article youtubeId"
      to: "YouTube"
      via: "YouTubePlayer permanent watch link and intent-created youtube-nocookie iframe"
    - from: "package.json launch:ready"
      to: "assertLaunchSectionCoverage()"
      via: "Astro launch-readiness mode in getPublicArticles()"
mapped_requirements:
  - id: SITE-03
    status: satisfied
  - id: SITE-04
    status: satisfied
  - id: SITE-05
    status: satisfied
  - id: CONT-01
    status: satisfied
  - id: CONT-02
    status: satisfied
  - id: CONT-03
    status: satisfied
deferred:
  - truth: "Native browser-chrome 200% zoom must be revalidated on representative production routes; Phase 3 evidence used CDP-emulated page scale 2 and does not claim native zoom."
    addressed_in: "Phase 6: Production Launch Verification"
    evidence: "Phase 6 owns production performance/launch verification; 03-SECURITY.md AR-03-03 explicitly requires the native 200% production smoke check and reopens T-03-11 on failure."
---

# Phase 3: Real Content and Section Discovery Verification Report

**Phase Goal:** As a visitor, I want to discover substantive, source-backed launch content through the homepage, three section indexes, and truthful author context, so that I can find relevant material and understand who published it.

**Verified:** 2026-08-27T18:39:23Z  
**Status:** passed  
**Re-verification:** No — initial verification

## User Flow Coverage

User story: “As a visitor, I want to discover substantive, source-backed launch content through the homepage, three section indexes, and truthful author context, so that I can find relevant material and understand who published it.”

| Step | Expected | Codebase and execution evidence | Status |
| --- | --- | --- | --- |
| Open homepage | `/` presents an Arabic/RTL introduction and the three primary sections in registry order | `src/pages/index.astro:5-25` maps the ordered registry to normal anchors; the fresh static build emitted `/index.html`; the production browser check passed | ✓ VERIFIED |
| Choose a section | Each homepage link opens its registered Arabic section index | `src/config/registries.ts:12-31` defines all three destinations; `src/pages/[section]/index.astro:7-25` generates each root; all three returned 200 in the 12-scenario browser run | ✓ VERIFIED |
| Choose relevant material | Each section index contains exactly its published article with title, description, date, and stable route | `src/pages/[section]/index.astro:8-56` consumes only `getPublicArticles()` and `articlePath()`; `tests/discovery.spec.ts:296-362` independently compared source, generated routes, and rendered links | ✓ VERIFIED |
| Read the article | The article remains substantive and source-backed without JavaScript or video playback | The three Markdown files contain 46–54 lines each, introductions, 3–4 substantive H2 sections, conclusions, structured HTTPS references, and visible AI/no-transcript disclosure; the no-JS journey passed | ✓ VERIFIED |
| Understand publisher context | The byline opens the Arabic author page without unsupported biography or credentials | `src/pages/[section]/[slug].astro:39-49` links the registered name; `src/pages/عن-أحمد-المنجاوي.astro:5-15` renders only the name, generic publication purpose, and home link; browser omission checks passed | ✓ VERIFIED |
| Continue to YouTube | Each article exposes the correct permanent YouTube action and optional intent-gated no-cookie player | `src/pages/[section]/[slug].astro:90-93` passes validated data to `YouTubePlayer`; current YouTube oEmbed resolved all three IDs to Ahmed El-Mangawy with matching topic titles | ✓ VERIFIED |
| Outcome | A visitor can find relevant material and understand who published it | The complete eight-route graph, internal link traversal, no-JS flow, five-width reflow, keyboard focus, and axe checks passed independently | ✓ VERIFIED |

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | The homepage links normally to الردود والشبهات, القضايا العامة, and القسم العلمي, with القسم العلمي clearly meaning Islamic scholarship | ✓ VERIFIED | Registry values at `src/config/registries.ts:12-31`; mapped and ordered at `src/pages/index.astro:5-25`; browser route/link assertions passed |
| 2 | Every primary section has a crawlable Arabic index listing all and only its published articles once with useful metadata | ✓ VERIFIED | Generic registry path generation and public filtering at `src/pages/[section]/index.astro:7-56`; independent three-way corpus equality at `tests/discovery.spec.ts:296-324`; fresh build emitted all section roots |
| 3 | Every public byline leads to a truthful Arabic author destination | ✓ VERIFIED | Linked values at `src/pages/[section]/[slug].astro:39-49`; registered-name-only author surface at `src/pages/عن-أحمد-المنجاوي.astro:5-15`; unsupported-claim browser rejection at `tests/discovery.spec.ts:369-389` |
| 4 | Each section contains at least one substantive Arabic public article | ✓ VERIFIED | Three `draft: false` sources at 48, 46, and 54 lines; each has maintained summary, introduction, multiple authored sections, conclusion, references, and matching built route; launch coverage passed |
| 5 | Each launch article is source-backed and tied to a real matching Ahmed El-Mangawy YouTube video | ✓ VERIFIED | Structured reference arrays in all three sources; direct links validated by schema/browser checks; independent oEmbed resolution returned `gO9yWa85OBc` → “أصول أهل السنة في الرد على الشيعة وغيرهم من أهل البدع”, `gmL_5XVpLPg` → “تنبيه مهم حول علاقتي مع الأطراف المتنازعة”, and `-z32phpbduk` → “#علم_الإملاء\| تعريفه وموضوعاته وأهميته”, all authored by أحمد المنجاوي |
| 6 | Public author/date/disclosure facts are transparent and no proof or fabricated review claim reaches production | ✓ VERIFIED | Publication date is `2026-08-27` in each source and validated against the Riyadh civil date; identical Arabic AI/no-transcript disclosure at article lines 20/22; production scan test at `tests/discovery.spec.ts:392-416`; proof fixtures remain drafts |
| 7 | The full graph is static, Arabic/RTL, no-JS usable, keyboard-accessible, responsive, and free of serious/critical automated accessibility findings | ✓ VERIFIED | `SiteLayout.astro` supplies Arabic/RTL semantics and native links; fresh production-discovery run passed all 12 scenarios, including no-JS (`:454`), keyboard (`:502`), five widths (`:556`), and axe (`:669`) |
| 8 | The content pipeline fails closed on invalid metadata/routes/drafts and enforces section coverage at launch | ✓ VERIFIED | Strict schema at `src/content.config.ts:10-36`; validation and selection at `src/lib/content-contract.ts:199-352`; `src/lib/articles.ts:9-21` is the collection choke point; 84 native tests and `launch:ready` passed |

**Score:** 8/8 truths verified

## Required Artifacts

| Artifact | Exists | Substantive | Wired / data-flow status | Final status |
| --- | --- | --- | --- | --- |
| `src/config/registries.ts` | Yes, 40 lines | Three full section records plus author record | Imported by contract, homepage, indexes, article, author page, and tests | ✓ VERIFIED |
| `src/content.config.ts` | Yes, 39 lines | Strict frontmatter object and semantic refinement | Astro automatically loads it; glob feeds the `articles` collection | ✓ VERIFIED |
| `src/lib/content-contract.ts` | Yes, 369 lines | Slug/date/Arabic/reference/path/draft/coverage validation | Called by collection schema, content selector, section links, article routes, and native tests | ✓ VERIFIED |
| `src/lib/articles.ts` | Yes, 29 lines | Real collection load, collision check, public/preview split, launch gate | Called by both section and article static-path generators | ✓ VERIFIED |
| `src/layouts/SiteLayout.astro` | Yes, 120 lines | Complete static Arabic shell and responsive/focus styles | Used by homepage, section index, article, and author routes | ✓ VERIFIED |
| `src/pages/index.astro` | Yes, 60 lines | Registry-derived semantic homepage list | Auto-routed to `/`; built and browser-tested | ✓ VERIFIED |
| `src/pages/[section]/index.astro` | Yes, 105 lines | Generic paths, filtering, deterministic sort, useful list output | Loads public collection and uses stable `articlePath()` links | ✓ VERIFIED |
| `src/pages/[section]/[slug].astro` | Yes, 273 lines | Complete article facts/content/references/media render | Loads public/dev collection, renders Markdown/MDX, links section/author, passes YouTube data | ✓ VERIFIED |
| `src/pages/عن-أحمد-المنجاوي.astro` | Yes, 25 lines | Minimal truthful author surface | Uses author registry; reached from every public byline and returns home | ✓ VERIFIED |
| Three launch Markdown files | Yes, 48/46/54 lines | Substantive original Arabic prose, summaries, sections, conclusions, citations, disclosure | Loaded by the collection glob; produce three public routes and section entries | ✓ VERIFIED |
| `src/components/YouTubePlayer.astro` | Yes, 65 lines | Permanent link, intent gate, no-cookie iframe, error fallback | Imported and passed every article's validated `youtubeId` and title | ✓ VERIFIED |
| `tests/content-contract.test.ts` and browser suites | Yes, 625/694/942 lines | Native contract plus separate production/development browser coverage | Included by `npm test` and Playwright projects; fresh focused checks passed | ✓ VERIFIED |

The requested file list named `src/lib/registries.ts`; that path does not exist. This is not an implementation gap: the established canonical registry is `src/config/registries.ts`, and every current consumer imports that file consistently.

## Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| Homepage | Three section roots | Registry-derived `<a href>` values | ✓ WIRED | Exact order/copy and HTTP 200 destinations verified in browser |
| Markdown/MDX | Content collection | Astro `glob()` plus strict schema/refinement | ✓ WIRED | Fresh `astro check` synced content with 0 diagnostics |
| Public collection | Section indexes | `getPublicArticles()` → filter/sort → `articlePath()` | ✓ WIRED | Independent raw-source oracle equaled both `dist` routes and rendered anchors |
| Public collection | Article routes | `getPublicArticles()` / development-only preview → `render(article)` | ✓ WIRED | Three production articles built; two draft proofs remain development-only |
| Article byline | Author page | Native `/عن-أحمد-المنجاوي/` anchor | ✓ WIRED | Present on every independently derived public article and destination returns 200 |
| Article `youtubeId` | YouTube action/player | `YouTubePlayer` props → watch URL and no-cookie iframe | ✓ WIRED | Browser tests assert exact URLs; oEmbed resolved all three video IDs and titles |
| Launch command | Section coverage | `astro build --mode launch-readiness` → `assertLaunchSectionCoverage()` | ✓ WIRED | Native nested CLI test passed and the direct launch build generated all 8 routes |
| Draft proofs | Production exclusion | Explicit `draft: true` → `selectPublicArticles()` | ✓ WIRED | Proof routes return 404 and proof titles/example/video ID are absent from built output |

`gsd-tools verify.artifacts/key-links` produced false negatives for superseded historical sidecar paths, glob pseudo-paths, and patterns split across lines. Manual source tracing and execution above resolve those items. The removed `src/lib/approval-contract.ts` is an intentional Plan 03-04 supersession recorded in the authoritative spec/context, not a current must-have.

## Data-Flow Trace (Level 4)

| Surface | Data variable | Source | Produces real data | Status |
| --- | --- | --- | --- | --- |
| Homepage | `sections` | `sectionRegistry` sorted by `order` | Three registered Arabic records render as three anchors | ✓ FLOWING |
| Section indexes | `articles` | Markdown/MDX glob → schema → `getCollection()` → public selector | Each of the three section pages renders its actual launch record | ✓ FLOWING |
| Article route | `article` / `Content` | Same validated collection and public static paths | Full Markdown body, facts, references, summary, and media data render | ✓ FLOWING |
| Author route/bylines | `author` | `authorRegistry.ahmedElMangawy` | Registered name renders in bylines and author H1; no empty optional props | ✓ FLOWING |
| Media continuation | `youtubeId`, `title` | Validated article frontmatter | Permanent URLs resolve; click creates the encoded no-cookie iframe | ✓ FLOWING |
| Launch readiness | public entries | `getPublicArticles()` | All three section keys are present; missing-section matrix proves failure behavior | ✓ FLOWING |

No database or runtime fetch is involved; these are build-time static data flows.

## Behavioral Spot-Checks

| Behavior | Command / method | Result | Status |
| --- | --- | --- | --- |
| Native content and launch contract | Pinned `npm test` | 84/84 passed; 0 skipped/todo; nested launch-readiness build exited 0 | ✓ PASS |
| Astro static diagnostics | Pinned `npm run check` | 16 files; 0 errors, 0 warnings, 0 hints | ✓ PASS |
| Static route generation | Pinned `npm run build` | Exactly 8 pages: homepage, author, three indexes, three articles | ✓ PASS |
| Production graph behavior | Pinned `npx playwright test --project=production-discovery tests/discovery.spec.ts` | 12/12 passed in 58.6s | ✓ PASS |
| YouTube video identity | YouTube oEmbed lookup for all three IDs | All resolved to أحمد المنجاوي; current titles match the declared section/article topics | ✓ PASS |
| Existing MVP UAT | `03-UAT.md` plus final Hercules evidence | 9/9 UAT items passed; 40 route/viewport captures and a complete ledger exist | ✓ PASS |

## Probe Execution

Step 7c was skipped: Phase 3 declares no `probe-*.sh` script and no conventional probe was found. The runnable acceptance gates are the native, Astro, launch-readiness, and Playwright commands recorded above.

## Requirements Coverage

| Requirement | Source plans | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| SITE-03 | 03-02, 03-03, 03-04 | Homepage links normally to all three primary sections | ✓ SATISFIED | Registry-derived anchors, built roots, and browser traversal |
| SITE-04 | 03-02, 03-03, 03-04 | Every section index lists every published article usefully | ✓ SATISFIED | Independent source/route/index equality plus visible title/description/date |
| SITE-05 | 03-02, 03-03, 03-04 | Arabic author page and linked truthful bylines | ✓ SATISFIED | Registered-name-only page, every byline link, unsupported-claim rejection |
| CONT-01 | 03-01, 03-04 | One substantive Arabic article and matching real video per section | ✓ SATISFIED | Three substantive sources, three public routes, green section coverage, resolved video metadata |
| CONT-02 | 03-01, 03-04 | Matching video/sources, AI disclosure, no false review claim | ✓ SATISFIED | References and video IDs in frontmatter, visible disclosures, production review-trace scan |
| CONT-03 | 03-01–03-04 | Real public facts rather than proof/SEO placeholders | ✓ SATISFIED | Proof isolation, Riyadh publication-date validation, registered author context, real oEmbed metadata |

No Phase 3 requirement is orphaned: all six roadmap-mapped IDs appear in Plan 03-04, and the earlier plans provide additional structural coverage.

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| Phase 3 source/test scope | — | No `TBD`, `FIXME`, `XXX`, `TODO`, `HACK`, placeholder copy, empty handler, or console-only implementation found | None | No blocker or warning |
| `tests/discovery.spec.ts` | 51, 165 | `return []` for absent test directories/build section directories | ℹ️ Info | Legitimate observation helpers; values are populated for current real corpus and do not flow to a user-visible placeholder |

## Disconfirmation Pass and Evidence Limits

- **Potentially partial requirement checked:** specialist editorial/religious accuracy cannot be certified from code. Phase 3 does not claim such review; every article discloses AI assistance/no transcript and cites its sources. This is a documented pre-deployment recommendation, not a failed Phase 3 truth.
- **Potentially misleading test checked:** `expectedPublicCorpus()` uses a narrow frontmatter scalar reader, but it runs only after the fresh Astro schema/check/build boundary. It is independent of `getPublicArticles()`, generated routes, and rendered indexes, so selector omissions cannot make both expected and observed sets silently agree.
- **Uncovered external path checked:** local evidence proves exact outbound URLs and intent-created iframe construction, not continuous live YouTube playback. Playback availability remains an external deployment smoke check and is not counted in the score.
- **Visual evidence boundary:** existing UAT/Hercules evidence closes the Phase 3 visual/user-flow check at five widths and CDP scale 2. Native browser-chrome 200% zoom remains explicitly unclaimed and deferred to Phase 6.

## Deferred Items

| # | Item | Addressed In | Evidence |
| --- | --- | --- | --- |
| 1 | Native browser-chrome 200% zoom revalidation on production routes | Phase 6 | `03-SECURITY.md` AR-03-03 requires the smoke check and says failure reopens T-03-11; Phase 6 owns production launch verification |

## Human Verification Required

None remains for the Phase 3 acceptance scope. The planner-deferred visible-browser check was exercised by `03-UAT.md` and the final Hercules report/ledger. The three boundaries above—native zoom, live playback, and optional specialist content review—are explicitly not Phase 3 success claims.

## Gaps Summary

No actionable Phase 3 gaps were found. All eight goal-backward truths and all six mapped requirements are supported by substantive, wired source plus fresh pinned-runtime execution evidence.

---

_Verified: 2026-08-27T18:39:23Z_  
_Verifier: the agent (gsd-verifier)_
