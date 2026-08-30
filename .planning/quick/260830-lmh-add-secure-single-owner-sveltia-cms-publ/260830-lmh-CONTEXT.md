# Quick Task 260830-lmh: Secure single-owner Sveltia CMS - Context

**Gathered:** 2026-08-30
**Status:** Ready for implementation

<domain>
## Task Boundary

Add a non-technical publishing interface for the single site owner while preserving the existing Astro static site, Git-tracked Markdown/MDX content, SEO output, and content validation. No database, site runtime backend, custom password store, or multi-user administration is introduced.

</domain>

<decisions>
## Implementation Decisions

### Authentication and ownership

- Recommended answer auto-approved: GitHub OAuth is the CMS identity mechanism; personal-access-token login is disabled.
- Recommended answer auto-approved: Cloudflare Access protects the exact `/admin/*` surface and allows only the owner's verified identity.
- Recommended answer auto-approved: the owner secures GitHub with a passkey or hardware key, a separate backup authenticator, and offline recovery codes; SMS is not the primary factor.

### Publishing safety

- Recommended answer auto-approved: Sveltia uses `editorial_workflow`, so edits create pull requests instead of writing directly to `main`.
- Recommended answer auto-approved: new articles default to hidden drafts and use `.md`; existing `.mdx` remains supported.
- Recommended answer auto-approved: a required GitHub check restricts `cms/**` pull requests to direct article files and safe raster media, then runs the existing content checks and build.

### Owner experience

- Recommended answer auto-approved: all CMS labels, hints, and owner instructions are Arabic and the standalone admin document is RTL.
- Recommended answer auto-approved: the fixed author is hidden, sections are selected by Arabic label, dates use native date inputs, and the YouTube field accepts the 11-character video ID.

### External setup boundary

- The final public hostname, Worker URL, GitHub OAuth credentials, Cloudflare Access policy, and branch-protection rule require owner-controlled provider access and are not guessed.
- Repository placeholders remain fail-closed until those exact values are supplied during deployment.

</decisions>

<specifics>
## Specific Ideas

- Vendor exact Sveltia CMS version `0.201.1` locally rather than loading an unversioned CDN script.
- Use the official Sveltia CMS Authenticator source pinned to commit `25f56e1ed4a96cb25fcb96469c9c99fb6d3713bc`, with a narrow fail-closed hardening patch.
- Store browser and visual-QA evidence only under ignored `.artifacts/`.

</specifics>

<canonical_refs>
## Canonical References

- Sveltia CMS configuration schema and official documentation for GitHub OAuth, editorial workflow, fields, media, and CSP.
- Existing `src/content.config.ts`, `src/lib/content-contract.ts`, and `src/lib/mdx-policy.ts` remain the authoritative content contract.
- Cloudflare Access and GitHub branch-protection setup are external operational gates and must be evidenced from their owner-controlled dashboards.

</canonical_refs>
