# Phase 4: Search Discovery Integrity - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-27
**Phase:** 04-search-discovery-integrity
**Areas discussed:** Shared metadata identity, origin and canonical policy, social metadata, sitemap and robots agreement, Arabic 404 and favicon, regression verification

---

## Shared Metadata Identity

| Option | Description | Selected |
| --- | --- | :---: |
| Shared layout props | Reuse `SiteLayout.astro` as the single typed head boundary and pass maintained facts from routes. | ✓ |
| Per-page head markup | Repeat titles, canonical construction, and social tags in every route family. | |
| New metadata registry | Create a parallel route-to-SEO data source independent of current content/registries. | |

**User's choice:** Recommended option auto-approved by the user's instruction to make routine decisions and create needed files autonomously.
**Notes:** Reusing the existing shell is the smallest path and prevents identity drift.

---

## Origin and Canonical Policy

| Option | Description | Selected |
| --- | --- | :---: |
| Validated build origin | Use the local preview origin normally and require a safe explicit HTTPS `SITE_ORIGIN` for launch readiness. | ✓ |
| Future hostname in source | Commit an unproven external domain before deployment exists. | |
| Relative canonicals | Emit non-absolute canonical URLs. | |

**User's choice:** Recommended option auto-approved.
**Notes:** This keeps local work runnable without making a false ownership/deployment claim.

---

## Social Metadata

| Option | Description | Selected |
| --- | --- | :---: |
| Accurate text-only tags | Mirror title, description, canonical, type, locale, site name, and truthful article dates; omit unknown images/handles. | ✓ |
| Placeholder share image | Create an unapproved branded image solely to fill social-image fields. | |
| Defer all social tags | Leave the roadmap's social-metadata requirement unsatisfied. | |

**User's choice:** Recommended option auto-approved.
**Notes:** Complete text identity is truthful and sufficient for Phase 4; no entity claim is invented.

---

## Sitemap and Robots Agreement

| Option | Description | Selected |
| --- | --- | :---: |
| Route-derived files | Use the official Astro sitemap integration and a robots endpoint backed by the same origin. | ✓ |
| Hand-maintained list | Duplicate public URLs in a separate static sitemap file. | |
| Robots only | Rely on crawling without the required sitemap. | |

**User's choice:** Recommended option auto-approved.
**Notes:** Drafts stay absent from generated routes; robots is not used as access control.

---

## Arabic 404 and Favicon

| Option | Description | Selected |
| --- | --- | :---: |
| Quiet recovery + local SVG | Reuse the existing shell, Arabic recovery copy, home link, noindex, and a geometric two-color favicon. | ✓ |
| Framework defaults | Keep the generic missing-route page and favicon 404. | |
| Decorative error surface | Add illustration, recommendations, search, or new interactions. | |

**User's choice:** Recommended option auto-approved.
**Notes:** The selected surface is useful, Arabic-only, lightweight, and visibly consistent.

---

## Regression Verification

| Option | Description | Selected |
| --- | --- | :---: |
| Focused native + browser checks | Validate origin branches and parse fresh HTML/XML/robots output through the existing Playwright lifecycle. | ✓ |
| Manual inspection only | Rely on browser spot checks without a repeatable metadata/discovery contract. | |
| New SEO test framework | Add another testing dependency and parallel harness. | |

**User's choice:** Recommended option auto-approved.
**Notes:** Existing Node, Playwright, axe, and `.artifacts/` patterns cover the phase without a new framework.

---

## the agent's Discretion

- Exact helper/type and focused test filenames.
- Exact SVG path geometry inside the locked cream/green, no-text favicon treatment.
- Small component boundaries that preserve one metadata/origin flow and do not exceed the duplication removed.

## Deferred Ideas

- Real domain, hosting, redirects, DNS/TLS, Search Console, and analytics — Phase 5.
- Production crawl, native 200% zoom, live playback, and Core Web Vitals — Phase 6.
- Structured data and designed social-sharing imagery — future requirement/approved-asset work.
