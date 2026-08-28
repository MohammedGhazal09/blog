---
phase: 06-production-launch-verification
reviewed: 2026-08-28T07:09:03Z
depth: deep
files_reviewed: 6
files_reviewed_list:
  - scripts/verify-production.mjs
  - tests/production-verification.test.ts
  - src/lib/site-origin.ts
  - tests/site-origin.test.ts
  - package.json
  - README.md
findings:
  critical: 8
  warning: 1
  info: 0
  total: 9
status: issues_found
---

# Phase 06: Code Review Report

**Reviewed:** 2026-08-28T07:09:03Z
**Depth:** deep
**Files Reviewed:** 6
**Status:** issues_found

## Summary

The production verifier has eight blocking correctness/security defects and one robustness warning. Most importantly, the rendered media audit targets a selector that exists only in its synthetic fixture, so it cannot pass against the real `YouTubePlayer.astro` output. The review also found reachable local-network origin input, unguarded off-origin browser redirects, false-green article/robots/sitemap/language paths, and an unbounded post-navigation wait.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: The production media audit targets a test-only selector

**Classification:** BLOCKER

**File:** `W:\Mangawy\scripts\verify-production.mjs:857` (fixture divergence at `W:\Mangawy\tests\production-verification.test.ts:175`)

**Issue:** `auditMedia()` locates the permanent fallback with `[data-youtube-direct]`. The controlled fixture invents that attribute, but the real component renders only `<a class="youtube-cta" ...>` at `src/components/YouTubePlayer.astro:28`. On every real article, the locator has no element; `getAttribute()`/`innerText()` times out, aborting `auditMedia()` into the outer runner error path. Therefore `npm run verify:production` cannot produce a passing media audit for the current site, while the controlled tests falsely report PASS.

**Fix:** Reuse the real stable component contract, for example locate the permanent link within the media section by `.youtube-cta` and verify its exact `href`. Make the controlled fixture render the same class/structure as the component, and add a contract assertion that every verifier selector occurs in the real component source.

### CR-02: A local DNS hostname passes the production-origin SSRF boundary

**Classification:** BLOCKER

**File:** `W:\Mangawy\src\lib\site-origin.ts:21-41`

**Issue:** The validator rejects literal IPs and a short reserved-root list, but accepts any other hostname, including a single-label local DNS name such as `https://router`. That value has HTTPS syntax, no port/path/userinfo, `isIP(hostname) === 0`, and `raw === url.origin`, so it reaches both Node fetch and Chromium. On a home or corporate resolver it can target a private service, contradicting the phase threat model that treats `SITE_ORIGIN` as untrusted SSRF/local-network input. Public-looking DNS names that resolve to private/special-use addresses have the same problem.

**Fix:** Reject single-label and special-use/local suffixes, then resolve all A/AAAA results before browser/fetch creation and reject loopback, private, link-local, multicast, documentation, and other non-global addresses. Add invalid cases for `https://router`, `.local`, `.internal`/`home.arpa`, and a controlled hostname resolving to a private address; all must fail before browser, fixture, artifact, or route I/O.

### CR-03: Browser audits can follow and misattribute off-origin navigation

**Classification:** BLOCKER

**File:** `W:\Mangawy\scripts\verify-production.mjs:620` (also lines 758, 820, 852, and 1028)

**Issue:** Static fetches correctly use `redirect: "manual"`, but every Playwright `page.goto()` follows redirects and the verifier never guards main-frame requests or checks `page.url()` afterward. A server can return 200 to the static fetch and redirect Chromium by user agent, JavaScript, meta refresh, or a changed response. The runner then records performance, media, or presentation observations under the original same-origin URL even though it audited another origin, and Chromium may contact a local or attacker-controlled host. This is the exact browser redirect-escape threat named in the Phase 06 research.

**Fix:** Install a main-frame navigation guard before every audit navigation, abort and record any destination whose origin differs from `normalizedOrigin`, and assert the final `page.url()` exactly equals the requested URL before collecting evidence. Add a controlled browser-only redirect/meta-refresh case that must fail without contacting or auditing the destination.

### CR-04: Articles with no media region are excluded instead of failed

**Classification:** BLOCKER

**File:** `W:\Mangawy\scripts\verify-production.mjs:440-442` (downstream filters at lines 470 and 1546-1548)

**Issue:** Article identity is inferred from the presence of exactly one `[data-video-region]`. `validateArticle()` returns success when the region is absent, and both performance selection and `auditMedia()` then exclude that URL. A sitemap-listed article that loses its entire player and direct YouTube action can therefore escape `YOUTUBE_IDENTITY`; with another valid article in the same section, route selection and the media gate can still pass. This violates D-14 and the locked requirement to inspect every public article.

**Fix:** Derive article membership independently from registered section slugs and the deployed route shape, then require exactly one media region and one matching direct anchor for every such route. Build the media audit list from that independent article set. Add a fixture with two articles in one section, remove all media markup from one, and require both crawl and media failure.

### CR-05: The Latin whitelist can hide arbitrary English UI text

**Classification:** BLOCKER

**File:** `W:\Mangawy\scripts\verify-production.mjs:968-972`

**Issue:** `isAllowedLatinValue()` exempts every string beginning with `http://` or `https://`; it does not require the whole value to be a URL. Visible or accessible text such as `https://example.com English settings` is therefore dropped from `latinLeaks()`, allowing an accidental English regression to pass. D-19 explicitly forbids a broad Latin exemption that can hide English UI text.

**Fix:** Exempt only a value that parses as one exact absolute URL and serializes back to the complete trimmed string, plus exact machine IDs and an explicit finite proper-noun set when one is actually approved. Add DOM-text and AX-name cases containing a URL prefix followed by English words and require `PRESENTATION_LATIN`.

### CR-06: Conflicting robots rules can pass the crawl gate

**Classification:** BLOCKER

**File:** `W:\Mangawy\scripts\verify-production.mjs:1280-1296`

**Issue:** Robots validation checks only that the file contains one global `User-agent: *`, one `Allow: /`, and the expected sitemap directive. It does not reject additional groups or disallow rules. A file can add `User-agent: Googlebot` followed by `Disallow: /` and still pass every current condition, even though Google will select the specific group and stop crawling the site. The verifier can then report a successful crawl contract while the primary search crawler is blocked.

**Fix:** For this generated static site, normalize line endings and require the exact known robots policy (global allow plus the one exact sitemap directive), or parse groups and prove no supported crawler-specific group blocks public routes. Add Googlebot/Bingbot-specific `Disallow: /` and conflicting-directive failure cases.

### CR-07: Empty discovery output can still report the crawl gate as PASS

**Classification:** BLOCKER

**File:** `W:\Mangawy\scripts\verify-production.mjs:1306-1319` and `W:\Mangawy\scripts\verify-production.mjs:1528-1533`

**Issue:** An empty sitemap index or an empty child `urlset` is structurally accepted: there is no minimum child/public URL assertion. `crawlPassed` is then snapshotted before `selectPerformanceRoutes()` adds `PERFORMANCE_SELECTION`, so `automatedGates.crawl` remains PASS despite discovering and crawling zero public pages. The command exits nonzero because a later finding exists, but the machine-readable authority record contains a false-green crawl result.

**Fix:** Add explicit crawl-membership findings for zero child sitemaps, zero public URLs, and missing required registered section/article coverage, and compute the crawl gate only after those crawl completeness checks. Add separate empty-index and empty-urlset tests that assert `automatedGates.crawl === "FAIL"`.

### CR-08: Font readiness can bypass every documented navigation timeout

**Classification:** BLOCKER

**File:** `W:\Mangawy\scripts\verify-production.mjs:624`

**Issue:** The 45-second timeout applies only to `page.goto()`. Immediately afterward, the runner awaits `document.fonts.ready` through `page.evaluate()` with no timeout; Playwright does not apply the navigation timeout to an arbitrary evaluated promise. A production page whose used web font never completes can stall the whole verifier indefinitely, never reaching the report/finally cleanup. This violates the phase requirement that unavailable resources and browser errors fail clearly under bounded timeout behavior.

**Fix:** Bound font readiness (and close the context on timeout) with a runner-side `Promise.race` or an equivalent explicit timer, record `PERFORMANCE_NAVIGATION`, and continue with failed metrics. Add a controlled page whose font request never settles and assert the run returns a failed report within the configured bound.

## Warnings

### WR-01: Content-type validation uses substring matching

**Classification:** WARNING

**File:** `W:\Mangawy\scripts\verify-production.mjs:234-243`

**Issue:** `contentType.includes(type)` accepts invalid media types such as `application/notxml` for the current `"xml"` expectation or `text/html-malformed` for `"text/html"`. This weakens the documented strict response-shape boundary and makes the outcome depend on whether the later DOM parser happens to accept a mislabeled body.

**Fix:** Parse the media type before `;`, lowercase it, and compare it against exact allowed values (`text/plain`, `application/xml`, `text/xml`, `text/html`, `application/xhtml+xml`). Add one invalid substring-only content-type case for each discovery and HTML path.

---

_Reviewed: 2026-08-28T07:09:03Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: deep_
