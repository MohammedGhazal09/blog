---
phase: "02-complete-arabic-article-journey"
phase_number: 2
audited_at: "2026-08-26T22:23:00+03:00"
status: secured
asvs_level: 1
block_on: high
register_authored_at_plan_time: true
threats_total: 11
threats_closed: 11
threats_open: 0
accepted_risks: 1
unregistered_flags: 0
---

# Phase 2 Security Audit

## Result

**SECURED.** Every mitigation in the Phase 2 plan-time threat register is present at the declared boundary, and the package-surface acceptance is documented below. No open threat blocks Phase 2.

This audit verifies only T2-01 through T2-10 and T2-SC. It does not claim a repository-wide vulnerability search, third-party YouTube playback assurance, or security coverage for later phases.

## Trust Boundaries

| Boundary | Description | Data crossing |
|---|---|---|
| Markdown/MDX frontmatter -> Astro schema/shared validator | Git-authored facts and references are untrusted until strict shape and semantic validation pass. | Article identity, dates, references, YouTube ID |
| Restricted authored MDX -> Astro compiler/render map | Structural preflight and the exact component map constrain executable MDX capability. | MDX syntax, component names, links |
| Validated collection/registries -> static routes | Production enumeration must expose only validated, non-draft records and registry-backed identity. | Public article data and route parameters |
| Static article -> YouTube navigation/player | Only the validated ID crosses into hardcoded watch/embed destinations; the iframe is intent-gated. | Encoded video ID and escaped Arabic title |
| npm registry/Chromium distribution -> local dev toolchain | Test-only external code is admitted through exact pins, a committed lock, local resolution, and ignored output paths. | Development packages and browser binary |

## Verified Threat Register

| Threat ID | Category | Component | Disposition | Status | Verified mitigation and evidence |
|---|---|---|---|---|---|
| T2-01 | Spoofing / Tampering | Reference labels and URLs | mitigate | CLOSED | Reference entries are strict `{ label, url }` objects at the collection boundary (`src/content.config.ts:23-24`). The shared validator rejects non-arrays and invalid entries, requires a non-empty Arabic-facing label, parses without a base, and requires absolute HTTPS, a hostname, and empty credentials with source/index/field diagnostics (`src/lib/content-contract.ts:220-251`). The route renders the validated label as the anchor text and omits `target` (`src/pages/[section]/[slug].astro:83-90`). Native reference cases start at `tests/content-contract.test.ts:220`; the browser provenance assertion verifies the descriptive same-tab link at `tests/article-journey.spec.ts:509`. |
| T2-02 | Tampering / XSS | Validated YouTube ID and generated watch/embed URLs | mitigate | CLOSED | `youtubeId` is restricted by the 11-character `[A-Za-z0-9_-]` allowlist before rendering (`src/lib/content-contract.ts:42`, `src/lib/content-contract.ts:216-218`). The component accepts only the ID/title, uses Astro-escaped data attributes, hardcodes both hosts, and applies `encodeURIComponent` to watch and embed paths (`src/components/YouTubePlayer.astro:8`, `src/components/YouTubePlayer.astro:18-21`, `src/components/YouTubePlayer.astro:54`). Browser tests assert the exact watch URL and the nocookie hostname/path/locale without autoplay (`tests/article-journey.spec.ts:208`, `tests/article-journey.spec.ts:252-266`). |
| T2-03 | Tampering / Elevation | Player activation handler | mitigate | CLOSED | The browser handler accepts no authored full URL, hardcodes `www.youtube-nocookie.com`, checks for an existing iframe, and combines that guard with a one-shot listener (`src/components/YouTubePlayer.astro:42-45`, `src/components/YouTubePlayer.astro:54`, `src/components/YouTubePlayer.astro:63`). The intent-gated test starts request capture before navigation and proves one iframe and one embed request after repeated activation (`tests/article-journey.spec.ts:212-281`). |
| T2-04 | Spoofing / Elevation | Reference and direct anchors | mitigate | CLOSED | Reference and direct anchors have no `target`, so they create no opener relationship; the direct anchor is static and outside the replaceable player region (`src/pages/[section]/[slug].astro:83-90`, `src/components/YouTubePlayer.astro:16-29`). Browser coverage verifies the exact same-tab direct sibling and preserves it through disabled JavaScript, blocked host, and construction failure (`tests/article-journey.spec.ts:141`, `tests/article-journey.spec.ts:284`, `tests/article-journey.spec.ts:315`). Source and built-output inspection found no authored `target=` attribute. |
| T2-05 | Tampering / Elevation | Restricted MDX path | mitigate | CLOSED | Astro invokes `preflightArticleSources` before exporting build configuration (`astro.config.mjs:3-5`). Structural policy rejects MDX ESM, expressions, raw HTML, intrinsic/unapproved components, and attributes on the sole approved component (`src/lib/mdx-policy.ts:9`, `src/lib/mdx-policy.ts:47-68`, `src/lib/mdx-policy.ts:90`). The render map contains exactly `ContractNote` (`src/components/mdx-components.ts:1-6`) and is passed to the only article render path (`src/pages/[section]/[slug].astro:5`, `src/pages/[section]/[slug].astro:81`). The 69-case native run includes rejected iframe/script/import/export/expression/unsafe-link/component cases; no media or reference JSX permission exists. |
| T2-06 | Information Disclosure | Public static route enumeration | mitigate | CLOSED | Production `getStaticPaths` selects `getPublicArticles`, which applies the explicit `draft === false` filter after collection validation (`src/pages/[section]/[slug].astro:9-16`, `src/lib/articles.ts:8-16`, `src/lib/content-contract.ts:306-310`). The exact-runtime build produced only `/القضايا-العامة/اختبار-عقد-المحتوى/` and `/القسم-العلمي/اختبار-مكون-ام-دي-اكس/`; the draft path was absent. The browser source/output assertions repeat that matrix (`tests/article-journey.spec.ts:860-886`). |
| T2-07 | Information Disclosure | Pre-activation media state | mitigate | CLOSED | Static markup contains only a local reserved region, hidden native trigger, static status, and direct anchor; no authored iframe, poster, thumbnail, preconnect, or remote script exists (`src/components/YouTubePlayer.astro:11-29`). Built-output grep found no `<iframe`, poster, `ytimg`, preconnect, or remote YouTube script tag in either page. Request capture begins before `page.goto()` and requires zero YouTube-family requests until explicit activation (`tests/article-journey.spec.ts:212-247`); the full Chromium run passed both routes. |
| T2-08 | Tampering / XSS | Dynamic iframe title/error | mitigate | CLOSED | Dynamic values are assigned through DOM properties (`iframe.title`, `iframe.src`, `allowFullscreen`); the failure path only reveals pre-authored Arabic status text (`src/components/YouTubePlayer.astro:24-26`, `src/components/YouTubePlayer.astro:52-60`). Source grep found no `innerHTML` or `insertAdjacentHTML`. Browser checks assert the exact Arabic iframe title and the exact static failure status (`tests/article-journey.spec.ts:252-257`, `tests/article-journey.spec.ts:367-398`). |
| T2-09 | Spoofing | Optional provenance | mitigate | CLOSED | Visible section/author identity comes only from registries (`src/pages/[section]/[slug].astro:23-28`). Public update dates are real date-only values, cannot precede publication, and cannot be future claims; commit `97991bdafbc09246bba872095ff5a0b0f1e8f598` added the final public-update control and regression (`src/lib/content-contract.ts:188-213`, `tests/content-contract.test.ts:182-218`). Update facts and references are guarded as whole semantic units (`src/pages/[section]/[slug].astro:65-75`, `src/pages/[section]/[slug].astro:83-93`). The two-route provenance test proves Markdown-present and MDX-absent states without empty remnants (`tests/article-journey.spec.ts:509-549`). |
| T2-10 | Tampering | Playwright/axe/Chromium dev toolchain | mitigate | CLOSED | npm/Node policy and browser packages are exact (`package.json:6-12`, `package.json:28-29`); the lock repeats exact direct pins and resolves Playwright/core at 1.62.1 (`package-lock.json:18-19`, `package-lock.json:1817`, `package-lock.json:5584`). Both browser packages are dev dependencies; no production dependency was added. Exact Node `v24.19.0` and npm `11.17.0` passed the preinstall gate and `npm ci --ignore-scripts`; local Playwright resolved to 1.62.1 and Chromium revision 1234 / 151.0.7922.34; npm audit reported zero vulnerabilities. Playwright outputs and snapshots are under `.artifacts` (`playwright.config.ts:6-16`), which is ignored (`.gitignore:4`). |
| T2-SC | Tampering | Package/install surface | accept | CLOSED | The residual registry/Chromium distribution risk is accepted by the plan-time register and recorded in the Accepted Risks Log. Retained controls materially bound it: exact direct and lock pins, 498 parsed lock entries with zero missing version or integrity/link records, clean exact-runtime install/audit, and dev-only browser tooling. `git log -- package.json package-lock.json` shows Phase 2 package changes only in `2752570`; the Plan 02-02, 02-03, 02-04, and review-fix commits changed no package manifest or lockfile. |

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---|---|---|---|---|
| AR-02-01 | T2-SC | npm registry and Chromium distribution cannot be made trust-free locally. Phase 2 adds no runtime dependency, later plans add no package, browser tooling is dev-only, and exact pins, committed integrity records, local resolution, clean install, and audit evidence constrain the residual supply-chain risk. | Phase 2 plan-time threat register (`02-02-PLAN.md` through `02-04-PLAN.md`) | 2026-08-26 |

## Unregistered Flags

None. `02-01-SUMMARY.md`, `02-02-SUMMARY.md`, and `02-04-SUMMARY.md` explicitly report no new flags. `02-03-SUMMARY.md` has no `## Threat Flags` section, and its implementation and summary evidence introduce no surface outside the plan-time register. The future-public-update correction in commit `97991bd` maps to T2-09; the final iframe locale and focus-boundary corrections remain within T2-02/T2-03/T2-08 and do not create a new destination, content-authored URL, or trust boundary.

## Verification Evidence

| Check | Result |
|---|---|
| Exact runtime | Node `v24.19.0`; npm `11.17.0`; project preinstall gate passed |
| Clean lock install | `npm ci --ignore-scripts`: 396 packages added; 397 audited; 0 vulnerabilities |
| Explicit dependency audit | 0 info, low, moderate, high, or critical vulnerabilities |
| Lock graph | lockfile v3; 498 entries; exact root dependencies/devDependencies; 0 missing version records; 0 missing integrity/link records |
| Local browser resolution | `@playwright/test@1.62.1`; `@axe-core/playwright@4.13.0`; local Playwright 1.62.1; Chromium revision 1234 / Chrome 151.0.7922.34 |
| Native mitigation matrix | 69/69 passed |
| Astro diagnostics | 0 errors, 0 warnings, 0 hints |
| Production build | Exactly 2 static public pages; draft absent |
| Chromium mitigation matrix | 26/26 passed across Markdown and MDX |
| Built media state | No authored iframe, poster, thumbnail, preconnect, or remote YouTube script before intent; zero pre-activation YouTube-family requests in both browser rows |
| Artifact isolation | `.artifacts/` is ignored; repository status remained clean before this report was created |
| Environment handling | No `.env` file was read, created, or referenced during this audit |

## Security Audit Trail

| Audit date | Threats total | Closed | Open | Accepted risks | Run by | Result |
|---|---:|---:|---:|---:|---|---|
| 2026-08-26 | 11 | 11 | 0 | 1 | gsd-security-auditor | SECURED |

1. Loaded all four plan threat models, all four summaries, review/fix artifacts, final Hercules report, listed implementation/configuration/tests, and the lockfile before classifying any threat.
2. The requested `src/lib/mdx-components.ts` path does not exist; the live route imports `src/components/mdx-components.ts`, which was loaded and verified as the exact `ContractNote` map.
3. Classified T2-01 through T2-10 as `mitigate` and T2-SC as the plan-declared `accept` disposition with retained controls; no transfer disposition exists.
4. Traced each mitigation from its build/runtime entry point through the enforcing call and focused regression, including the configuration-time MDX preflight and the single production route family.
5. Ran clean install, lock/audit, local Playwright/Chromium resolution, 69 native tests, Astro diagnostics, static build, and 26 Chromium cases under the exact pinned runtime.
6. Inspected the two built pages and package commit history, incorporated all summary threat flags, and found no implementation gap or unregistered attack surface.
7. Modified no implementation file and did not read any `.env` file. This `02-SECURITY.md` file is the audit's only repository change.

## Sign-Off

- [x] All threats have a disposition (`mitigate` or `accept`; no transfer entries)
- [x] Accepted risk documented in the Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: secured` set in frontmatter

**Approval:** verified 2026-08-26
