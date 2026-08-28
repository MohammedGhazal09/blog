# Phase 6: Production Launch Verification — Specification

**Created:** 2026-08-28
**Ambiguity score:** 0.03 (gate: ≤ 0.20)
**Requirements:** 6 locked

## Goal

Provide a repeatable production-origin verification path that can prove the deployed Arabic release's crawl/discovery contract, representative loading and layout stability, and intent-gated YouTube behavior without turning local or controlled evidence into a production claim.

## Background

The repository already produces nine static Arabic documents with validated canonical metadata, generated sitemap and robots output, working section/article journeys, a reserved 16:9 YouTube facade, and comprehensive local native and browser coverage. Phase 5 also provides a fail-closed launch build and an evidence ledger, but the owner-controlled Cloudflare deployment, final HTTPS origin, Search Console state, and real Plausible reporting remain unavailable. No reusable whole-origin production crawler or production performance evidence path exists yet, and no local result can establish the behavior of an undeployed final origin.

## Requirements

1. **Explicit production target**: Production verification accepts one explicitly supplied safe final HTTPS origin and rejects absent, local, credential-bearing, port-bearing, path-bearing, query-bearing, fragment-bearing, or otherwise non-origin input.
   - Current: Launch readiness validates an explicit canonical origin, but there is no Phase 6 production-verification command or evidence contract.
   - Target: One documented command validates the production origin before requesting any route and uses that origin as the only crawl and performance target.
   - Acceptance: A runnable input matrix passes a normalized public HTTPS origin and fails closed for unsafe or non-production-shaped values without reading an environment file.

2. **Whole-site discovery crawl**: The verifier checks every public URL discovered from the production sitemap together with robots, sitemap-index, section, article, internal-link, canonical, metadata, draft-exclusion, and 404 behavior.
   - Current: Local suites prove generated discovery output and route behavior against controlled builds, but no real-origin crawl record exists.
   - Target: The production crawl proves successful public responses, one matching same-origin canonical per indexable page, unique nonempty Arabic titles and descriptions, working same-origin internal links, correct robots/sitemap agreement, absence of drafts, and an intentional non-indexable Arabic 404.
   - Acceptance: Any non-200 public route or discovery file, redirecting/mismatched/out-of-origin canonical, duplicate or non-Arabic metadata, broken internal link, listed draft, malformed discovery file, or incorrect 404 makes the production crawl fail.

3. **Representative production performance**: The homepage, one section index, and one article from each of the three registered sections receive production lab measurements for loading and visual stability.
   - Current: Static architecture and local browser tests reduce performance risk, but no metric has been captured from the final deployed origin.
   - Target: Each of the five representative production pages records LCP at or below 2.5 seconds and CLS at or below 0.1 under one documented reproducible browser profile; the 404 is excluded from scoring.
   - Acceptance: The evidence record includes the exact origin, routes, browser/profile, timestamp, and raw LCP/CLS values, and fails the criterion when any representative route exceeds either threshold. INP is reported only from qualifying field data and otherwise remains explicitly pending rather than inferred from a lab click.

4. **Intent-gated YouTube media**: Every representative production article preserves the lightweight player boundary before interaction and activates only the matching privacy-enhanced player after reader intent.
   - Current: The shared component and controlled tests create the iframe only after activation and reserve a 16:9 region, but final-origin network and geometry behavior are unverified.
   - Target: Before pointer or keyboard activation there is no YouTube iframe and no request to YouTube/Google media hosts; activation creates one matching `youtube-nocookie.com` iframe without autoplay, while the permanent direct YouTube link remains available.
   - Acceptance: Browser network and DOM evidence for all three representative articles proves zero pre-interaction YouTube player requests/iframes, stable 16:9 reserved geometry, the correct activated video ID and Arabic title, and a usable direct link when iframe requests are blocked.

5. **Arabic, RTL, and resilient production presentation**: The production crawl and browser pass detect accidental reader-facing English, language/direction drift, bidi breakage, inaccessible media naming, or narrow/zoom content loss.
   - Current: Local tests cover Arabic shell semantics, accessibility names, 320 CSS-pixel reflow, text spacing, and controlled scale evidence; native 200% production zoom and the final whole-site language leak pass are not recorded.
   - Target: Every public route plus 404 exposes Arabic `lang`/RTL document semantics and Arabic reader-facing text, metadata, alternatives, titles, and accessible names, with only a documented narrow whitelist for URLs, identifiers, and unavoidable proper nouns. Representative production pages remain usable at 320 CSS pixels and native 200% browser zoom.
   - Acceptance: The audit fails for unexplained English reader-facing text or accessible names, incorrect `lang`/`dir`, horizontal content overflow, clipped controls/text, missing direct media fallback, or loss of keyboard reachability; native zoom evidence remains a named human check when automation cannot prove browser zoom state.

6. **Authority-bounded evidence**: Runner correctness, real-origin results, field metrics, and provider/account observations remain separate facts with no implied promotion between them.
   - Current: Phase 5 truthfully keeps four external outcomes pending, but Phase 6 has no evidence ledger or verification report.
   - Target: Phase 6 records controlled/local runner checks separately from dated final-origin crawl and lab results, and separately from CrUX/Search Console field data and owner-controlled provider facts.
   - Acceptance: `QUAL-05` and `QUAL-06` pass only from qualifying final-origin evidence; without a reachable final HTTPS origin they remain pending or human-needed even when the runner and all local regressions pass.

## Boundaries

**In scope:**

- A reusable, fail-closed production-origin verification command built with Node standard-library APIs and the already-installed Playwright browser tooling.
- Complete production sitemap/robots/public-route/internal-link/canonical/metadata/draft/404 verification.
- Reproducible production LCP and CLS measurements on five representative pages.
- DOM, network, geometry, activation, blocked-iframe fallback, Arabic/RTL, accessibility-name, reflow, and native-zoom evidence.
- A Phase 6 evidence record that preserves local, production, field-data, and owner/provider authority boundaries.
- Phase-scoped fixes only when verification exposes an actual repository defect.

**Out of scope:**

- Deploying the site, purchasing/configuring a domain, changing DNS/TLS, or accessing owner accounts — these remain owner-authority operations from Phase 5.
- Treating localhost, a controlled host mapping, preview deployment, mocked response, or intercepted request as proof of final-origin behavior — those inputs may validate the runner only.
- Fabricating INP, CrUX, Search Console, indexing, Plausible, Cloudflare, or real-video availability evidence — these require actual field/provider/production observation.
- A new reader-facing feature, redesign, content expansion, schema/entity markup, CMS, server adapter, analytics listener, or custom tracker — verification is the deliverable and unsupported structured data remains intentionally omitted.
- Adding Lighthouse, `web-vitals`, or another dependency when browser performance APIs and installed Playwright provide the required lab evidence.
- Scoring the intentional 404 route as a Core Web Vitals sample — it participates only in crawl, Arabic, accessibility, and resilience checks.

## Constraints

- Preserve the fully static Astro architecture and current public route/content model.
- Use Node `24.19.0`, npm `11.17.0`, the committed lockfile, Node standard-library APIs, and the already-installed Playwright package; add no dependency unless research proves an explicit criterion impossible without it.
- Never read or create `.env` files. Supply the final origin explicitly to the verification command.
- Keep browser artifacts only under ignored `.artifacts/` paths and never under watched source or planning directories.
- Crawl assertions must derive public membership from the deployed sitemap and cross-check repository-known draft exclusions rather than maintain a competing hand-authored public URL list.
- Production verification must not mutate content, provider state, DNS, analytics settings, or Search Console.
- LCP ≤ 2.5 seconds and CLS ≤ 0.1 are per-run lab gates; the project's Core Web Vitals field status still depends on 75th-percentile field data when such data exists.
- INP is field-only for this phase's completion claim; a lab responsiveness proxy may be reported only under its own name.
- Do not add entity/schema markup merely to satisfy an SEO checklist; Phase 4 intentionally omitted unsupported claims.

## Acceptance Criteria

- [ ] The production verifier accepts exactly one clean public HTTPS origin and fails closed before network access for every unsafe input in the validation matrix.
- [ ] One command crawls robots, sitemap index, every sitemap-listed public page, all same-origin internal links, and the intentional 404.
- [ ] Every indexable page returns 200 with one same-origin self-canonical, unique nonempty Arabic title/description, correct Arabic/RTL identity, and no draft or accidental English leakage.
- [ ] Robots and sitemap output agree with the final origin, every listed URL resolves directly, and excluded drafts/404s are absent.
- [ ] The homepage, one section index, and one article per registered section each record LCP ≤ 2.5 seconds and CLS ≤ 0.1 from the final HTTPS origin using the documented profile.
- [ ] All three representative articles produce zero YouTube/Google media requests and zero iframes before activation and preserve the reserved 16:9 media geometry.
- [ ] Pointer and keyboard activation each create only the matching `youtube-nocookie.com` iframe without autoplay, and the permanent direct link remains usable when the player is blocked.
- [ ] Representative pages retain content, controls, focus reachability, and one-dimensional reflow at 320 CSS pixels and native 200% browser zoom.
- [ ] The production evidence record includes dated raw route/metric results and does not relabel local runner proof, a lab interaction, or provider-independent output as production, field INP, Search Console, or Plausible evidence.
- [ ] `QUAL-05` and `QUAL-06` remain pending/human-needed unless the exact final HTTPS origin is reachable and supplies qualifying evidence.
- [ ] The pinned full local regression gate still passes after any Phase 6 repository change.

## Ambiguity Report

| Dimension           | Initial  | Final    | Min       | Status | Notes                                                                                            |
| ------------------- | -------- | -------- | --------- | ------ | ------------------------------------------------------------------------------------------------ |
| Goal Clarity        | 0.82     | 0.97     | 0.75      | ✓      | The deliverable is a production verifier plus authority-bounded evidence.                        |
| Boundary Clarity    | 0.58     | 0.98     | 0.70      | ✓      | Verification is isolated from deployment, feature work, unsupported schema, and provider claims. |
| Constraint Clarity  | 0.62     | 0.96     | 0.65      | ✓      | Runtime, origin, dependency, artifact, metric, and evidence rules are explicit.                  |
| Acceptance Criteria | 0.65     | 0.97     | 0.70      | ✓      | Eleven binary gates define crawl, performance, media, presentation, and status outcomes.         |
| **Ambiguity**       | **0.31** | **0.03** | **≤0.20** | **✓**  | Recommended answers were auto-approved under the mission's non-interactive authority.            |

## Interview Log

| Round | Perspective     | Question summary                                                                      | Recommendation and auto-approved decision                                                                                                                                              |
| ----- | --------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Researcher      | What is missing after the existing local SEO, media, launch, and regression coverage? | Add one real-origin verifier and evidence record; do not rebuild already-covered product behavior.                                                                                     |
| 2     | Simplifier      | What is the irreducible production sample?                                            | Crawl every public URL, but measure performance on the homepage, one section, and one article from each of the three sections; keep 404 outside performance scoring.                   |
| 3     | Boundary Keeper | Which origin and evidence may satisfy the phase?                                      | Only the exact explicitly supplied final public HTTPS origin; local, preview, mapped, and intercepted origins prove runner correctness only.                                           |
| 3     | Boundary Keeper | Should verification add reader features, schema, or monitoring infrastructure?        | No; make only phase-scoped defect fixes and preserve Phase 4's truthful omission of unsupported structured data.                                                                       |
| 4     | Failure Analyst | Which performance claims would create a false green?                                  | Gate production lab LCP at 2.5 seconds and CLS at 0.1; keep INP/75th-percentile status pending until qualifying field data exists.                                                     |
| 4     | Failure Analyst | What invalidates the lightweight video claim?                                         | Any pre-click YouTube/Google media request or iframe, missing reserved geometry, wrong video, autoplay, inaccessible activation, or lost direct fallback fails.                        |
| 5     | Seed Closer     | How broad is the Arabic/RTL audit?                                                    | Include visible copy, document metadata, alternatives, titles, and accessibility names on every public route plus 404, using only a narrow documented technical/proper-noun whitelist. |
| 5     | Seed Closer     | What happens when deployment/provider access remains unavailable?                     | Complete and verify the repository-controlled runner, record final-origin checks as pending/human-needed, and do not promote `QUAL-05` or `QUAL-06`.                                   |

---

_Phase: 06-production-launch-verification_
_Spec created: 2026-08-28_
_Next step: $gsd-discuss-phase 6 — implementation decisions (how to build what is specified above)_
