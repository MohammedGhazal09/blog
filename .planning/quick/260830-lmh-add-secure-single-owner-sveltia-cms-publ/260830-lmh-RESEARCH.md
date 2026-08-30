# Quick Task 260830-lmh: Research

**Researched:** 2026-08-30
**Scope:** Sveltia CMS `0.201.1`, GitHub OAuth, Cloudflare deployment, and the existing article contract

## Recommendation

Keep the reader-facing site fully static. Serve Sveltia from `public/admin/`, authenticate it through GitHub OAuth, place Cloudflare Access in front of `/admin/*`, and make every CMS save an editorial pull request. This adds an owner-friendly editor without a database or a public application backend.

## Integration contract

- The existing article schema requires Arabic-facing `title`, `description`, and `summary`; registered `section` and `author` keys; a canonical Arabic `slug`; date-only publication metadata; an explicit `draft`; an 11-character YouTube ID; optional HTTPS references; and a Markdown body.
- Sveltia can express this directly with native string, text, select, hidden, boolean, date, list, URL, and rich-text fields.
- `omit_empty_optional_fields: true` prevents empty optional dates/references from violating Astro's schema.
- `identifier_field: slug`, Unicode slugging, and `extension: md` keep new files direct and predictable.

## Security findings

- GitHub does not provide the required browser-only PKCE flow for this integration; an OAuth server-side token exchange remains necessary.
- The official Sveltia Authenticator includes secure `HttpOnly`, `SameSite=Lax` CSRF state, callback verification, scope allowlisting, and opener-origin checks. Its upstream `ALLOWED_DOMAINS` behavior is optional, so this deployment must reject requests when the allowlist is empty.
- `auth_methods: [oauth]` removes personal-access-token login. The private repository requires `auth_scope: repo`.
- Sveltia's interface controls are not an authorization boundary. A required pull-request check must reject CMS-branch edits outside `src/content/articles/*.{md,mdx}` and `public/media/articles/*.{png,jpg,jpeg,webp}`; raster files also need size, regular-file, extension, and magic-byte validation.
- A strict admin-only CSP needs GitHub API/image origins, jsDelivr fonts, blob/data support used by the CMS, and `https://unpkg.com` for the version-pinned Arabic locale request. OAuth popups require `Cross-Origin-Opener-Policy: same-origin-allow-popups`.

## Version and provenance

- `@sveltia/cms@0.201.1`, npm integrity `sha512-++flmpoV6WhY7CsWbppajXpLXPfpKdcvziFRm03dFxN2610htA+Pn/18nVY2f4FdGFL0euaPmQ4IcnwSe2i33Q==`.
- Sveltia CMS Authenticator commit `25f56e1ed4a96cb25fcb96469c9c99fb6d3713bc`, source blob `8c4c3beb721245c30b43e8b5e8444be7038f1789`.
- Both projects use the MIT License. Wrangler is invoked at pinned version `4.123.0` without adding it to the site's runtime dependency graph.

## Operational boundary

Cloudflare Workers and Access have adequate free tiers for one owner, but the final hostname and provider credentials are external. The repository can deliver and test the complete fail-closed configuration; live OAuth, Access enforcement, branch protection, and a real publish remain blocked until the owner performs the documented dashboard steps.
