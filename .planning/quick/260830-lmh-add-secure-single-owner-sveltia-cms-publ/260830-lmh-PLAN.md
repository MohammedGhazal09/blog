---
quick_id: 260830-lmh
status: complete
mode: inline
description: Add secure single-owner Sveltia CMS publishing with Arabic RTL fields, GitHub OAuth, editorial PR workflow, content-only validation, and Cloudflare Access documentation
---

# Secure single-owner Sveltia CMS

## Must haves

- The existing public Astro site remains static and database-free.
- A standalone Arabic RTL Sveltia admin exposes every current article field and defaults new content to a draft.
- Only GitHub OAuth is offered; the checked-in deployment state fails closed until exact owner-controlled domains and credentials are configured.
- CMS saves use pull requests, and a stable required check prevents CMS branches from changing code or uploading unsafe media.
- The owner has one Arabic setup and recovery path for OAuth, Cloudflare Access, branch protection, publishing, rollback, and credential loss.
- Automated and browser evidence covers config loading, security boundaries, build integrity, responsive layout, console/network behavior, and every safely reachable state; provider-only states are recorded as blocked.

## Task 1: Add the isolated CMS and OAuth boundary

**Files:** `public/admin/*`, `public/_headers`, `workers/sveltia-cms-auth/*`, `THIRD_PARTY_NOTICES.md`

**Action:** Vendor the exact Sveltia bundle, add the Arabic standalone page and collection config, add admin-only security headers, and vendor the pinned official OAuth Worker with GitHub-only/fail-closed hardening and a placeholder deployment config.

**Verify:** Run the official Sveltia config validator, verify bundle integrity/provenance, and run focused OAuth security tests.

**Done when:** the local admin loads from self-hosted assets, exposes the current content model, offers OAuth only, and no checked-in secret or guessed production origin exists.

## Task 2: Enforce the Git publishing boundary

**Files:** `scripts/validate-cms-change.mjs`, `tests/cms-security.test.ts`, `.github/workflows/cms-content-gate.yml`, `package.json`, `playwright.config.ts`

**Action:** Add one Node-stdlib validator for direct article paths and safe raster media, focused tests for the path/media/OAuth/admin contracts, and an immutable-action CI job that always runs existing test/check/build gates and applies the extra boundary to `cms/**` pull requests.

**Verify:** Exercise allowed and denied paths, symlinks, oversize files, extension/signature mismatches, OAuth state/domain failures, and the normal project pipeline.

**Done when:** UI restrictions cannot bypass path, file-type, content, or build validation, and the check name is stable for branch protection.

## Task 3: Document and visually verify owner publishing

**Files:** `README.md`, `.artifacts/sveltia-cms-*`, quick-task summary/verification, `.planning/STATE.md`

**Action:** Add Arabic one-time provider setup and daily publishing/recovery instructions. Run Chromium QA at mobile, tablet, desktop, and large desktop sizes, inspect screenshots, RTL, labels, validation, console/network/CSP behavior, and ledger all unreachable live-provider states as blocked.

**Verify:** Run `npm test`, `npm run check`, `npm run build`, `npm run test:browser`, `npm audit`, the Sveltia validator, and the focused Worker checks; visually inspect saved artifacts.

**Done when:** all repository-controlled requirements pass, external credential/domain work is precisely identified, GSD state is current, and the implementation is committed atomically.
