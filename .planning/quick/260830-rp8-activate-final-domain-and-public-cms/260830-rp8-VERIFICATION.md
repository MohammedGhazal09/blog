---
quick_id: 260830-rp8
verified: 2026-08-31
status: passed
score: 3/3 tasks fully verified
requirements_verified: []
requirements_pending: []
human_verification: []
---

# RP8 Verification Report

## Verdict

**Status: `passed`.** All three tasks pass. The final owner Sveltia proof, protected merge, production draft exclusion, CMS cleanup, and production QA are complete.

## Task Results

| Task | Result | Evidence |
| --- | --- | --- |
| 1. Lock repository and hostname identity | PASS | Production, CMS config, Worker allowlist, tests, and documentation use `MohammedGhazal09/blog` and `ahmed-almangawy.de5.net`. |
| 2. Reduce OAuth permission | PASS | Sveltia and Worker enforce exact `public_repo`; protected security tests and CI pass. |
| 3. Activate providers and verify production | PASS | Pages, DNS/TLS, Access, OAuth configuration, protected `main`, Search Console, owner Sveltia publishing/cleanup, final-origin, media, native zoom, Lighthouse, and Hercules QA pass. |

## Verified Infrastructure

- Exact production origin is reachable over valid HTTPS from the intended Cloudflare Pages deployment.
- Public crawl, canonicals, sitemap/robots, Arabic/RTL identity, accessibility, reflow, and intentional 404 pass.
- Five performance roles × three cold runs pass: median LCP 908–1032 ms and CLS 0.
- Direct Chrome passes pointer and Enter activation for all three articles with matching `youtube-nocookie.com` iframe identities and permanent direct links. The production verifier's three 45-second media subpass timeouts are documented tooling false negatives, not product failures.
- Real Chrome 200% zoom preserves content, controls, visible focus, and vertical reflow without horizontal overflow.
- Fresh unauthenticated `/admin/` is intercepted by Cloudflare Access; the authenticated Arabic/RTL OAuth-only login surface has a 44px target and visible focus.
- Preliminary protected CMS mechanics passed the trusted-base `cms-content-gate`; the completed owner proof below then verified the real production workflow.
- PR #11 merged the producer-side Sveltia YAML serializer fix as `3a87f1e`, preserving strict Astro validation while quoting date strings.
- The owner re-saved a hidden draft through production Sveltia. PR #10 passed the protected gate and merged as `e314aa2` with a quoted date and `draft: true`.
- Production exclusion passed: the draft route returned 404, the homepage and matching section returned 200, and the sitemap held exactly 8 URLs without the proof.
- PR #12 deleted the proof through Sveltia. One unrelated timing test flaked on its first CI run; an unchanged rerun passed all 277 native tests. Cleanup merged and deployed as `3f42d3b`.
- Final cleanup passed: the proof file, remote CMS branch, and open pull requests are absent; the authenticated CMS shows 5 clean entries.
- Final production QA found no product defect. Lighthouse mobile and desktop scored 100 for accessibility, SEO, best practices, and agentic browsing.
- A mobile homepage lab trace under Fast 4G and 4x CPU recorded LCP 365 ms and CLS 0. Article activation recorded lab INP 9 ms and CLS 0.

## Nonblocking Observations

- Five Search Console indexing requests were accepted before the daily quota exhausted. Retry the remaining three article URLs after quota reset; accepted requests are not proof of indexing.
- Field/CrUX INP is unavailable until the site has sufficient real-user data; this is nonblocking.
- Analytics is intentionally out of v1; no telemetry should be added for these observations.

## Monitoring Follow-up

- Retry indexing requests after quota reset for:
  - `/الردود-والشبهات/أصول-منهجية-في-الرد-على-الشبهات/`
  - `/القضايا-العامة/الاستقلال-في-الخلافات-العامة/`
  - `/القسم-العلمي/مدخل-إلى-علم-الإملاء/`
- Recheck field INP only after Search Console or CrUX has an eligible dataset.
