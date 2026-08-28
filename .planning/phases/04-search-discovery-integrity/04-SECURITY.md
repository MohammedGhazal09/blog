---
phase: 04-search-discovery-integrity
slug: search-discovery-integrity
audited: 2026-08-28T00:36:43Z
register_authored_at_plan_time: true
threats_total: 8
threats_closed: 8
threats_open: 0
status: verified
asvs_level: 1
security_block_on: high
---

# Phase 04 — Security

> Plan-time mitigation audit for search identity, publication boundaries, crawler discovery, missing-route behavior, the local SVG favicon, and the sitemap dependency.

## Audit Result

**SECURED.** All eight unique threats declared across Plans 04-01 through 04-03 are verified closed in implementation and runnable evidence. Every threat has disposition `mitigate`; none is accepted or transferred.

The repeated plan entries were reconciled into the authoritative unique register `T-04-01` through `T-04-07` plus `T-04-SC`. Later-plan refinements strengthen the verification method without creating additional threat IDs.

## Trust Boundaries

| Boundary | Security property verified |
|---|---|
| Explicit process input → launch build | Only one clean, normalized root HTTPS origin reaches `build({ site, mode: "launch-readiness" })`; unsafe input fails before a build. |
| Configured Astro site → page/crawler identity | Canonical, Open Graph, sitemap, and robots identity derive from configured build state, never request-host or page/content overrides. |
| Raw content and registries → public route graph | Only records with literal `draft: false` become public article routes; an independent raw-source oracle verifies every output family. |
| Generated routes → sitemap and robots | Plain official sitemap generation and the robots endpoint agree on origin and exact public membership. |
| Maintained strings → shared document head | One typed layout renders normally escaped metadata exactly once; raw head injection and duplicate page renderers are absent. |
| Local SVG → browser chrome | One local, inert, allowlisted SVG has no active or external content surface. |
| Unknown pathname → error document | Astro's special static 404 returns a true error status with Arabic/RTL recovery and a non-indexable head. |
| npm registry → build dependency graph | The manifest, lockfile, installed package, and registry metadata agree on the exact official package and integrity; lifecycle install scripts are absent. |

## Threat Register

| Threat ID | Category | Component | Disposition | Required mitigation | Status |
|---|---|---|---|---|---|
| T-04-01 | Spoofing / Tampering | Launch origin | mitigate | Validate one explicit root HTTPS origin, reject credentials/URL state/local/IP/reserved hosts, normalize once, and preserve launch-readiness mode. | closed |
| T-04-02 | Spoofing | Absolute page and crawler identity | mitigate | Use only configured `Astro.site` plus the current pathname; expose no request, page, content, canonical, or origin override. | closed |
| T-04-03 | Information Disclosure | Draft/proof publication | mitigate | Keep drafts out of route generation and independently compare raw sources with HTML routes, links, canonical/OG identity, sitemap, and robots. | closed |
| T-04-04 | Tampering / Repudiation | Sitemap and robots agreement | mitigate | Generate sitemap from Astro routes and derive the single robots sitemap URL from the same configured origin. | closed |
| T-04-05 | Tampering / Elevation | Metadata injection or duplication | mitigate | Render normally escaped strings once through the shared layout; forbid `set:html` and duplicate page metadata renderers. | closed |
| T-04-06 | Elevation / Information Disclosure | SVG favicon | mitigate | Serve one local SVG constrained by element, attribute, color, active-content, external-reference, MIME, and network checks. | closed |
| T-04-07 | Spoofing | Missing-route behavior | mitigate | Return a true static 404 with Arabic/RTL recovery, `noindex,follow`, no canonical/social identity, and no sitemap membership. | closed |
| T-04-SC | Tampering | `@astrojs/sitemap` supply chain | mitigate | Pin and verify official package identity, version, repository, integrity, lifecycle-script absence, installed metadata, lockfile facts, and known-vulnerability status. | closed |

## Threat Verification

### T-04-01 — Closed

- `src/lib/site-origin.ts:16-44` applies WHATWG `URL` parsing and `node:net.isIP`, rejects missing/non-string/whitespace input, non-HTTPS schemes, raw or parsed credentials, query/fragment state, non-root paths, trailing-dot hosts, every IP literal, localhost, and reserved/example roots, then returns only normalized `url.origin`.
- `scripts/launch-ready.mjs:3-7` reads only explicit process input, validates it before building, and calls `build({ site, mode: "launch-readiness" })`.
- `src/lib/articles.ts:16-21` observes `import.meta.env.MODE === "launch-readiness"` and executes `assertLaunchSectionCoverage()` on the already public-only corpus. Both article and section static route generators call `getPublicArticles()` (`src/pages/[section]/[slug].astro:11-19`, `src/pages/[section]/index.astro:7-27`).
- `tests/site-origin.test.ts:6-66` covers five normalization cases and 39 fail-closed classes. `tests/content-contract.test.ts:427-481` covers the launch corpus gate, while `tests/content-contract.test.ts:484-578` locks mode propagation, controlled canonical/OG/sitemap/robots identity, local-origin absence, and ordinary-build restoration.
- Fresh end-to-end checks rejected missing input and an HTTP origin with exit code 1 and the expected diagnostics. The controlled HTTPS launch build and all nine launch-output browser checks passed.

### T-04-02 — Closed

- Ordinary builds fix `site` to `LOCAL_SITE_ORIGIN` in `astro.config.mjs:5-13`; the explicit launch wrapper supplies the only build-time override.
- `src/layouts/SiteLayout.astro:16-21` requires `Astro.site` and derives indexable canonicals only with `new URL(Astro.url.pathname, Astro.site).href`.
- `src/pages/robots.txt.ts:3-7` requires the configured `site` argument and derives `sitemap-index.xml` from it. No request header or request URL participates.
- A full source scan found no request-host identity source or page/content canonical/origin prop. `tests/search-discovery.spec.ts:623-638` enforces the single layout owner and rejects metadata/canonical/origin markup in all page renderers.
- Local and controlled-launch browser suites verified exact pathname identity for all eight public routes, not only a representative homepage.

### T-04-03 — Closed

- `src/lib/content-contract.ts:327-331` selects only records whose validated `draft` value is exactly `false`; `src/lib/articles.ts:10-21` applies that selector before either production route family consumes articles.
- `tests/discovery.spec.ts:110-179` builds expected publication membership directly from raw Markdown/MDX frontmatter and registry facts without importing the application selector or reading generated output.
- `tests/discovery.spec.ts:431-531` proves exact, duplicate-free agreement between the raw approved corpus, generated HTML paths, ordinary internal anchors, canonical URLs, Open Graph URLs, and both sitemap layers. It also checks every discovered draft route returns 404 and scans HTML, XML, and robots text for every draft title, slug, video ID, path, encoded path, URL, and fabricated approval trace.
- The current corpus contains three public and three draft article records; the resulting public graph contains eight indexable routes. Fresh `npm run verify` passed the independent equality and absence checks.

### T-04-04 — Closed

- `astro.config.mjs:1-13` imports official `@astrojs/sitemap` and invokes plain `sitemap()` with no custom page list, filter, or serializer.
- `src/pages/robots.txt.ts:3-11` emits exactly one same-origin sitemap-index URL and the minimal allow policy.
- `tests/search-discovery.spec.ts:640-676` parses both XML layers, requires one index location, requires the numbered sitemap to equal the exact eight-route identity graph with no duplicates or `/404/`, requires exact robots text, and rechecks draft absence.
- Fresh local verification passed 49/49 browser tests. A controlled HTTPS launch build followed by the same untouched-output suite passed 9/9, after which an ordinary rebuild restored eight local-origin sitemap locations and exact local robots output.

### T-04-05 — Closed

- `src/layouts/SiteLayout.astro:2-21` defines the sole typed indexable/non-indexable metadata boundary and exposes no canonical or origin input.
- `src/layouts/SiteLayout.astro:30-46` renders title, description, canonical, Open Graph, and Twitter fields through normal Astro expressions. The repository-wide renderer scan found those fields only in this layout and found no `set:html` use.
- `tests/search-discovery.spec.ts:310-375` requires exactly one title, description, canonical, each Open Graph field, and each Twitter field on every public route, with exact value parity and prohibited optional fields absent. `tests/search-discovery.spec.ts:623-638` independently checks source ownership and raw-HTML absence.
- The full and controlled-launch browser runs passed these exact count and escaping assertions.

### T-04-06 — Closed

- `public/favicon.svg:1-4` contains only the SVG root and two local path elements, using the approved `#FFFDF8` and `#166534` palette.
- `tests/search-discovery.spec.ts:787-865` requires exactly one local favicon link on all eight public documents plus the 404, a successful `image/svg+xml` response under 2 KiB, exactly one required SVG namespace, a strict element/attribute/color allowlist, a denylist covering script/style/text/foreign objects/images/use/animation/filter/events/URLs/data/fonts, a finite square viewBox, and 16/32 px rendering evidence.
- `tests/search-discovery.spec.ts:733-785` and the broader browser network tests prove the favicon/error surfaces make no unexpected remote request. Fresh browser verification passed.

### T-04-07 — Closed

- `src/pages/404.astro:1-15` is Astro's special static error document and supplies the locked Arabic title, description, H1, and native home recovery link through `indexable={false}`.
- `src/layouts/SiteLayout.astro:19-21,33-49` makes the 404 canonical undefined, emits exactly `noindex,follow`, and omits canonical, Open Graph, and Twitter identity.
- `tests/search-discovery.spec.ts:678-715` proves two unrelated slash-form URLs and a slashless URL return HTTP 404; the slash-form responses have Arabic/RTL semantics, exact recovery DOM, no canonical/social tags, and the exact robots directive.
- `tests/search-discovery.spec.ts:640-660,717-785` proves sitemap exclusion, JavaScript-disabled recovery, keyboard order, focus, reflow, accessibility, and local-only network behavior. All checks passed in both ordinary and controlled-output runs.

### T-04-SC — Closed

- `package.json:22-26` pins `@astrojs/sitemap` exactly to `3.7.3`; `package-lock.json:7-15` repeats the exact root dependency.
- `package-lock.json:383-393` resolves only `https://registry.npmjs.org/@astrojs/sitemap/-/sitemap-3.7.3.tgz` with non-empty SHA-512 integrity and no package `hasInstallScript` flag.
- A fresh registry query returned name `@astrojs/sitemap`, version `3.7.3`, repository `git+https://github.com/withastro/astro.git`, the identical SHA-512 integrity value, and no `preinstall`, `install`, or `postinstall` script.
- A fresh installed-package/manifest/lockfile assertion confirmed the official repository, exact version, exact tarball, non-empty matching integrity, and lifecycle-install-script absence. Both full-tree `npm audit --json` and production-only `npm audit --omit=dev --json` reported 0 total known vulnerabilities (0 info/low/moderate/high/critical) on 2026-08-28.
- `astro.config.mjs:1-13` consumes this exact package through plain official `sitemap()`; no substitute or second sitemap generator is present.

## Review-Fix Closure

| Finding | Fix | Verification |
|---|---|---|
| CR-01 — launch wrapper did not preserve the existing launch-corpus gate | Commit `ad1e1b3` added `mode: "launch-readiness"` to the same validated `build({ site, ... })` call. | Current wrapper at `scripts/launch-ready.mjs:7`; launch-mode coverage reaches `src/lib/articles.ts:18-20`; native launch regression and controlled launch build passed. |
| WR-01 — persistent regression checked only process exit status | Commit `1e38654` expanded the native test to inspect canonical, OG, both sitemap layers, exact robots output, local-origin absence, and final local restoration. | Current test at `tests/content-contract.test.ts:484-578`; native test 70 passed during the fresh 128-test run. |

These fixes close the former launch-mode/regression gap with executable behavior, not documentation alone.

## Summary Threat Flags

No Phase 04 summary contains a `## Threat Flags` entry. The two later code-review findings were refinements of registered launch-origin/publication controls and are closed above; no unregistered implementation flag remains.

## Accepted Risks Log

No accepted risks.

## Residual Operational Boundaries

These are deferred verification boundaries, not accepted Phase 04 implementation threats:

- Phase 5 owns the real production hostname and ownership, hosting-provider behavior, redirects, DNS/TLS, Search Console, analytics, and outbound-click measurement. The controlled HTTPS hostname used in this audit is test identity only; no live deployment claim is made.
- Phase 6 owns live production crawl certification, native browser-chrome 200% zoom, live YouTube playback, and Core Web Vitals evidence.
- Registry metadata and `npm audit` are point-in-time observations from 2026-08-28 and should be rerun at dependency change or release certification.

## Verification Run

| Check | Result |
|---|---|
| Pinned runtime | Node `v24.19.0`; npm `11.17.0` |
| `npm run verify` | 128/128 native tests; Astro 0 errors, 0 warnings, 0 hints; 49/49 browser tests |
| Missing and unsafe launch inputs | Missing `SITE_ORIGIN`: exit 1; HTTP origin: exit 1; both failed with the intended validator diagnostics before build |
| Controlled launch-output suite | `SITE_ORIGIN` and `EXPECTED_SITE_ORIGIN` set process-locally to the same safe HTTPS origin; 9/9 production-discovery tests passed against untouched launch output |
| Ordinary output restoration | Both process variables cleared; fresh ordinary build restored local canonical/OG identity, one local sitemap index location, eight local sitemap URLs, and exact local robots text |
| Supply-chain facts | Registry, installed package, manifest, and lockfile assertions passed for official `@astrojs/sitemap@3.7.3`; zero lifecycle install scripts |
| Known vulnerabilities | Full-tree `npm audit --json`: 0 total; production-only `npm audit --omit=dev --json`: 0 total |

## Security Audit Trail

| Audit Date | Register Origin | Threats Total | Closed | Open | ASVS | Run By |
|---|---|---:|---:|---:|---:|---|
| 2026-08-28 | Plan-time STRIDE register | 8 | 8 | 0 | 1 | the agent (`gsd-security-auditor`) |

## Sign-Off

- [x] Every plan-time threat has a disposition.
- [x] Every `mitigate` disposition has implementation and runnable evidence.
- [x] Accepted risks log is explicit and empty.
- [x] Summary threat flags were incorporated.
- [x] `threats_open: 0` confirmed.
- [x] `status: verified` set in frontmatter.

**Approval:** verified 2026-08-28 — Phase 04 security gate may advance.
