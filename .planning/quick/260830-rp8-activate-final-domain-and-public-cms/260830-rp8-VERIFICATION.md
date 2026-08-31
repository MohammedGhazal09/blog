---
quick_id: 260830-rp8
verified: 2026-08-31
status: human_needed
score: 2/3 tasks fully verified
requirements_verified: []
requirements_pending: []
human_verification:
  - test: Real-owner Sveltia draft-only publishing proof
    expected: Ahmed's dedicated GitHub account authorizes Sveltia, opens a cms/* pull request containing only a hidden draft, passes cms-content-gate, remains absent from production, and removes the proof content afterward.
    why_human: "Ahmed's dedicated GitHub username is not yet available. The developer account is not Ahmed’s dedicated owner identity and must not substitute."
---

# RP8 Verification Report

## Verdict

**Status: `human_needed`.** Tasks 1 and 2 pass. Task 3 passes every public/provider/quality gate except the final real-owner identity proof.

## Task Results

| Task | Result | Evidence |
| --- | --- | --- |
| 1. Lock repository and hostname identity | PASS | Production, CMS config, Worker allowlist, tests, and documentation use `MohammedGhazal09/blog` and `ahmed-almangawy.de5.net`. |
| 2. Reduce OAuth permission | PASS | Sveltia and Worker enforce exact `public_repo`; protected security tests and CI pass. |
| 3. Activate providers and verify production | HUMAN NEEDED | Pages, DNS/TLS, Access, OAuth configuration, protected `main`, Search Console, final-origin, media, native zoom, and Hercules QA pass. Ahmed's dedicated-account draft proof remains. |

## Verified Infrastructure

- Exact production origin is reachable over valid HTTPS from the intended Cloudflare Pages deployment.
- Public crawl, canonicals, sitemap/robots, Arabic/RTL identity, accessibility, reflow, and intentional 404 pass.
- Five performance roles × three cold runs pass: median LCP 908–1032 ms and CLS 0.
- Direct Chrome passes pointer and Enter activation for all three articles with matching `youtube-nocookie.com` iframe identities and permanent direct links. The production verifier's three 45-second media subpass timeouts are documented tooling false negatives, not product failures.
- Real Chrome 200% zoom preserves content, controls, visible focus, and vertical reflow without horizontal overflow.
- Fresh unauthenticated `/admin/` is intercepted by Cloudflare Access; the authenticated Arabic/RTL OAuth-only login surface has a 44px target and visible focus.
- Protected CMS mechanics and cleanup pull requests using non-owner test content pass the trusted-base `cms-content-gate`; proof content is absent from protected `main` and production. This does not prove Ahmed's actual owner workflow.

## Nonblocking Observations

- Google indexing is `PENDING`; sitemap submission is not proof of indexing.
- Field INP is `PENDING` until Search Console or CrUX has eligible real-user data.
- Analytics is intentionally out of v1; no telemetry should be added for these observations.

## Human Closure Test

The only closure path is: dedicated Ahmed account → Write collaborator only → Sveltia OAuth → hidden draft → `cms/*` PR → required gate → production exclusion → cleanup. No account credentials are requested or stored.
