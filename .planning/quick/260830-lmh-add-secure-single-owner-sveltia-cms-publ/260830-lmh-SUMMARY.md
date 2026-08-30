---
quick_id: 260830-lmh
status: complete
subsystem: cms-publishing
tags: [sveltia, github-oauth, cloudflare-access, editorial-workflow, ci, rtl, security]
implementation_commit: 1f665c0
completed: 2026-08-30
---

# Quick Task 260830-lmh: Secure Single-Owner Sveltia CMS Summary

**The owner now has a repository-controlled Arabic Sveltia editor that preserves the static Astro architecture, creates editorial pull requests, and fails closed until the real Cloudflare and GitHub settings are activated.**

## Outcome

- Added an Arabic RTL admin at `/admin/` using the locally pinned Sveltia CMS `0.201.1` bundle.
- Mapped the existing article contract into owner-friendly fields; new articles are Markdown drafts by default.
- Added a hardened GitHub OAuth Worker and disabled personal-access-token login.
- Added a CMS pull-request boundary that permits only direct article files and genuine PNG/JPEG/WebP media up to 2 MiB.
- Added Arabic setup, publishing, recovery, rollback, and credential-loss instructions.
- Kept the reader-facing site statically generated with no database, reader login, or public application backend.

## Security Boundary

- Cloudflare Access is the intended single-owner perimeter for `/admin/*`.
- OAuth accepts only exact allowlisted HTTPS hostnames, GitHub's fixed endpoints, the `repo` scope, valid CSRF state, and the expected opener origin.
- Sveltia uses `editorial_workflow`; content changes go through pull requests instead of writing directly to `main`.
- The `CMS content gate` workflow loads its validator from the trusted base commit and pins GitHub Actions by immutable SHA.
- Checked-in production values are deliberately non-working placeholders; no secret, password, personal access token, or guessed production hostname is present.

## Implementation Commit

- `1f665c0` — `feat(cms): add secure single-owner Sveltia publishing`

## Key Files

- `public/admin/` — pinned CMS shell, Arabic locale bootstrap, accessibility repair, configuration, license, and bundle.
- `workers/sveltia-cms-auth/` — fail-closed GitHub OAuth Worker and placeholder deployment configuration.
- `scripts/validate-cms-change.mjs` — Node-stdlib article/media trust-boundary validator.
- `.github/workflows/cms-content-gate.yml` — stable pull-request check for CMS branches.
- `tests/cms-security.test.ts` and `tests/cms-admin.spec.ts` — security and browser regression coverage.
- `README.md` — Arabic owner operations guide.

## Visual QA Fixes

- Pinned the CMS interface to Arabic even when the browser locale is English.
- Removed Sveltia's invalid button `aria-readonly` output and zoom-blocking viewport directives.
- Reused the existing favicon so the admin cold load has no missing-resource error.

Evidence is stored only in the ignored directory `.artifacts/hercules-visual-qa/20260830-170014-sveltia-cms-127.0.0.1-4322-admin/`. The final ledger records 19 tested, 4 fixed, 10 provider-blocked, 2 out-of-scope, 0 failed, and 0 untested scenarios.

## Verification Evidence

- Pinned runtime: Node `24.19.0`, npm `11.17.0`.
- Native logic/security suite: `273/273` passed, including `10/10` focused CMS tests.
- Playwright browser suite: `50/50` passed.
- Astro diagnostics: 26 files, zero errors, warnings, or hints.
- Static build: 9 pages generated successfully.
- Dependency audit: zero vulnerabilities at the low threshold.
- Vendored bundle: 2,002,028 bytes; SHA-256 `124148170fdddf18351d9771697b6b8c17ea12220a029895fa87dd90aadd797b`.
- Staged-diff whitespace check passed outside the byte-pinned vendor bundle, and the staged text secret scan found no high-confidence matches.

## External Activation Required

Repository work is complete, but production publishing is intentionally not activated. With the owner present:

1. Choose the final admin hostname and replace the fail-closed Worker/CMS placeholders.
2. Configure Cloudflare Access for the owner's verified identity only.
3. Create the GitHub OAuth app, store its secret in Cloudflare, and protect `main` with the required `CMS content gate` check.
4. Run one real hidden-draft pull request through review, merge, rebuild, and cleanup.

## Known Platform Limitation

Windows cannot create the symbolic-link attack fixture without Developer Mode. The validator rejects symbolic links, the test reports this limitation explicitly, and Linux CI executes the fixture.

## Self-Check: PASSED

The implementation commit exists, all planned artifacts are present, fresh repository-controlled gates pass, browser evidence is ignored, and external provider states remain unclaimed.
