---
phase: 06
slug: production-launch-verification
status: verified
threats_open: 0
threats_total: 11
asvs_level: 1
block_on: high
created: 2026-08-28
audited: 2026-08-28
verified: 2026-08-28
register_authored_at_plan_time: true
---

# Phase 06 — Security

> Verification of the two Phase 6 plan-time STRIDE registers against the implemented exact-origin, crawl, browser-audit, report, and evidence-authority paths. Duplicate `T-06-SC` entries are consolidated into one accepted supply-chain risk.

## Audit Scope and Decision Rule

This is a declared-mitigation audit, not an open-ended vulnerability scan. Each threat begins open and closes only when the planned control is present at the relevant implementation entry points and supported by focused tests. Documentation is used only for the accepted-risk and external-authority records; it is not treated as implementation evidence for a `mitigate` disposition.

The configured threshold is ASVS Level 1 with `block_on: high`. Independently of severity triage for unregistered findings, an absent control in the plan-authored threat register remains an open threat and withholds phase security sign-off.

## Trust Boundaries

| Boundary | Description | Data crossing |
| --- | --- | --- |
| Operator process value → verifier CLI | The sole target value can otherwise select an unsafe network destination. | Process-local `SITE_ORIGIN`; no environment file is read. |
| Production origin → static crawler/parser | Public network responses may redirect, exceed bounds, contain hostile XML/HTML, or point outside the approved origin. | Robots, sitemap XML, HTML, URLs, response status and media type. |
| Final-origin browser → network | Rendered documents and scripts can attempt cross-origin HTTP, WebSocket, WebRTC, proxy, DNS-rebinding, or TLS-bypass paths. | Browser requests, response endpoints, public page state. |
| Reader intent → third-party media | Media must remain blocked before a trusted pointer/Enter boundary and must retain exact identity afterward. | YouTube iframe request, video ID, Arabic title, direct fallback URL. |
| Controlled fixture → generated report | Synthetic success must not acquire final-origin or provider authority. | Fixture responses, controlled timing seams, raw audit observations. |
| CDP laboratory → performance claim | Lab LCP/CLS samples must not be promoted to field INP or production/provider proof. | Fifteen cold LCP/CLS samples, medians, profile constants. |
| Runner → ignored artifact filesystem | Report paths and schema must be fixed and sensitive HTTP values must not be persisted. | JSON findings, errors, route graph, audit observations. |
| Generated JSON → committed evidence ledger | Machine results must not promote reviewer-, field-, native-zoom-, requirement-, or provider-controlled rows. | Controlled/final scope, `QUAL-05`, `QUAL-06`, external evidence states. |

## Threat Register

| Threat ID | Category | Component | Disposition | Verified mitigation and evidence | Status |
| --- | --- | --- | --- | --- | --- |
| T-06-01 | Spoofing / Information Disclosure | `productionSiteOrigin()` and CLI entry | mitigate | `src/lib/site-origin.ts:104-132` rejects non-exact, non-HTTPS, credential/path/query/fragment/port, IP, local, and reserved origins; `src/lib/site-origin.ts:135-186` rejects non-global or inconsistent DNS answers with a deadline; `scripts/verify-production.mjs:2060-2073` completes that validation before timestamps, browser, fetch, fixture callback, or artifact work. `tests/site-origin.test.ts:11-153` and `tests/production-verification.test.ts:1672-1720,2053-2080` cover the rejection and fail-before-I/O matrices. | closed |
| T-06-02 | Spoofing / Information Disclosure | Static crawl and browser navigation | mitigate | `scripts/verify-production.mjs:155-194` pins Node HTTPS and Chromium DNS, forces certificate verification, and disables proxy use; `scripts/verify-production.mjs:206-298` enforces exact same-origin clean URLs, manual redirects, exact status, and exact media types; `scripts/verify-production.mjs:739-859` blocks every off-origin browser/WebSocket request and rejects a changed final destination. `tests/production-verification.test.ts:1914-1983,2053-2123,2435-2553,2699-2720` proves TLS, redirects, off-origin containment, and external-link non-crawling. | closed |
| T-06-03 | Tampering / Denial of Service | XML/HTML response parsing | mitigate | `scripts/verify-production.mjs:18-19,119-152,241-369` applies 20-second request aborts, a streamed 5 MiB bound, exact media types/statuses, inert `DOMParser`, XML DOCTYPE/entity rejection, exact sitemap root/entry shape, parser-error rejection, and duplicate-location rejection. `scripts/verify-production.mjs:372-417,491-641` parses HTML inertly and requires the expected public-document/media shape. The controlled failure matrix at `tests/production-verification.test.ts:2393-2697` exercises redirect, media-type, malformed/empty/duplicate/entity-bearing/oversized/out-of-origin sitemap and malformed public-document gates. | closed |
| T-06-04 | Tampering / Repudiation | Controlled evidence scope | mitigate | `scripts/verify-production.mjs:2060-2073` derives `controlled`/`intercepted-fixture` solely from the injected fixture; `scripts/verify-production.mjs:2607-2662` fixes field INP and both requirement gates to `PENDING`. Caller attempts to promote scope, transport, requirements, or output path are rejected by behavior at `tests/production-verification.test.ts:2722-2750`; `tests/production-verification.test.ts:2923-2938` proves a controlled report cannot mutate the ledger. | closed |
| T-06-05 | Information Disclosure | Pre-intent media audit | mitigate | The implementation uses a stricter exact-resource classifier rather than a permissive family allowlist: `scripts/verify-production.mjs:1136-1168` recognizes only the exact expected media navigation, while the default guard at `scripts/verify-production.mjs:785-813` records and aborts every other off-origin request. `scripts/verify-production.mjs:1528-1570,1669-1691` records exact expected embed/poster attempts and requires zero pre-intent iframes and media requests. Tests at `tests/production-verification.test.ts:647-672,1207-1215,1390-1462` prove delayed eager media, exact YouTube poster traffic, hostname spoofing, wrong-video Google media, and unrelated Google requests all fail without destination contact. | closed |
| T-06-06 | Spoofing / Tampering | Activation and fallback audit | mitigate | `scripts/verify-production.mjs:1136-1223` consumes a one-shot trusted exact pointer/Enter event; `scripts/verify-production.mjs:1371-1458,1647-1715` requires one exact encoded no-cookie iframe, Arabic title, no autoplay/duplicate, focus, stable 16:9 geometry, and one exact visible/focusable same-tab direct link. `tests/production-verification.test.ts:600-645,675-1087` covers valid pointer/keyboard/fallback behavior, synthetic/focus/hover rejection, duplicate/transient iframe peaks, and stable reparenting. The report calls these activation/fallback observations and does not claim playback. | closed |
| T-06-07 | Tampering / Elevation of Privilege | Final-origin browser context | mitigate | `scripts/verify-production.mjs:155-194` pins DNS, forces Node TLS verification, disables proxy use and WebRTC; `scripts/verify-production.mjs:739-859` blocks HTTP/WebSocket origin escape and checks the actual remote address; `scripts/verify-production.mjs:1090-1133,2156-2176` uses fresh non-persistent contexts without credentials, custom headers, storage state, proxy settings, or TLS bypass. Network-mode timing/deadline values remain fixed at `scripts/verify-production.mjs:2084-2125`. Tests at `tests/production-verification.test.ts:1723-1983,2053-2123,2753-2822` cover proxy bypass, DNS/TLS pinning, WebSocket/WebRTC containment, redirects, and forbidden context/config patterns. | closed |
| T-06-08 | Information Disclosure / Tampering | Report writer | mitigate | Fixed ignored roots and caller-path rejection remain enforced. `scripts/verify-production.mjs:44,107-152` defines one report-safe URL/string boundary that removes credentials and fragments, removes every non-allowlisted query name/value, and preserves only the exact public YouTube `v={11-character ID}` and no-cookie `hl=ar` query shapes. `scripts/verify-production.mjs:2095-2113` applies that sanitizer through the `JSON.stringify` replacer to every string before both the artifact write and the returned report are produced. The value-level regression at `tests/production-verification.test.ts:2755-2828` injects credential-bearing external links plus secret-bearing HTTP, WebSocket, cleanup-error, query-name, query-value, and fragment values; it proves none survive in either the returned object or artifact bytes while the safe public URL shape and findings remain available. The focused regression passed `1/1`, and the supplied pinned-runtime native suite passed `263/263`. | closed |
| T-06-09 | Repudiation / Tampering | Evidence ledger and requirement state | mitigate | `scripts/verify-production.mjs:2607-2658` keeps field INP, `QUAL-05`, and `QUAL-06` pending and contains no planning-file write path. `tests/production-verification.test.ts:2824-2938` enforces authority rows, pending external/requirement state, ordinary-command isolation, fixed artifact roots, and byte-for-byte ledger immutability. `06-PRODUCTION-EVIDENCE.md:7-20` has one controlled-tool `PASS` and keeps every final-origin, native-zoom, field, provider, `QUAL-05`, and `QUAL-06` row `PENDING`. The Phase 6 commit range contains no Phase 5 evidence-file change. | closed |
| T-06-10 | Denial of Service | Performance/rendered audit | mitigate | Fixed navigation/audit/setup/close deadlines are declared at `scripts/verify-production.mjs:24-32`; `scripts/verify-production.mjs:909-1040` performs exactly three non-retried fresh-context runs per each of five selected routes and records explicit failed runs; `scripts/verify-production.mjs:1043-1133,2577-2597` bounds cleanup and closes pages, contexts, and the browser on failure. `tests/production-verification.test.ts:531-598,2150-2359` proves exactly fifteen samples, unique contexts, missing metrics, stalled fonts/tasks/setup/cleanup/browser close, explicit failures, artifact completion, and bounded return. | closed |
| T-06-SC | Tampering | npm/package supply chain | accept | Consolidated from the duplicate plan entries. The Phase 6 range has no `package-lock.json` change; the only `package.json` change registers the controlled test and opt-in verifier, with no dependency change. All 504 non-root lock entries retain `resolved` and `integrity` metadata. Fresh production-only and full `npm audit` runs both reported zero vulnerabilities. Residual upstream ecosystem risk is documented below rather than misrepresented as mitigated. | closed (accepted) |

## Open Threats

No open threats. The former T-06-08 report-confidentiality gap is closed by the shared serialization sanitizer and value-level regression cited in the threat register.

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
| --- | --- | --- | --- | --- |
| AR-06-SC | T-06-SC | Phase 6 adds no package or lockfile mutation and performs no installation step. The remaining risk is ordinary upstream npm ecosystem compromise outside this phase's implementation authority. Any future manifest/lock change reopens legitimacy review; audit results do not guarantee future upstream safety. | Both Phase 6 plan-time threat registers (`06-01-PLAN.md`, `06-02-PLAN.md`) | 2026-08-28 |

## External Authority Boundary

No owner-approved final public origin was supplied to this audit, and no production origin, Cloudflare account, DNS/TLS state, Search Console property, Plausible property, field INP, native 200% zoom session, video playback, `QUAL-05`, or `QUAL-06` success is claimed. Those rows remain `PENDING` in `06-PRODUCTION-EVIDENCE.md`. Controlled evidence establishes runner behavior only.

## Summary Threat Flags

Neither `06-01-SUMMARY.md` nor `06-02-SUMMARY.md` contains a `## Threat Flags` section, so there are no summary flags to map and no `unregistered_flag` warning. Code-review fixes remain within registered T-06-05, T-06-06, and T-06-10 control families.

## Verification Performed

- Read both plan threat models, both summaries, `06-REVIEW.md`, `06-REVIEW-FIX.md`, `06-PRODUCTION-EVIDENCE.md`, the cited origin/verifier implementation, manifest/lockfile, configuration boundaries, and relevant tests. No environment file was read.
- Focused read-only run on the available local runtime: `tests/site-origin.test.ts` plus `tests/production-verification.test.ts` passed `173/173` in 325.5 seconds. The local shell is Node `v24.8.0`/npm `11.12.1`, so this is supplemental rather than pinned-runtime evidence.
- Fresh orchestrator evidence supplied for the T-06-08 re-audit used the required runtime and reported: npm production/full audits `0`; native tests `263/263`; Astro diagnostics `0/0/0`; browser tests `49/49`; `node --check` and `git diff --check` passed; `package-lock.json`, `playwright.config.ts`, and `.gitignore` remained unchanged; no Plausible loader appeared in ordinary `dist`; and missing `SITE_ORIGIN` failed with the artifact inventory byte-for-byte unchanged.
- A fresh supplemental npm production/full audit in this shell also reported `0` vulnerabilities. `npm ls --depth=0` reported the expected exact direct dependency versions with no graph problems.
- `package-lock.json` has no Phase 6 or working-tree diff; `playwright.config.ts` and `.gitignore` have no working-tree diff. The Phase 6 range contains no Phase 5 evidence-file changes.
- T-06-08 re-audit traced `reportSafeUrl`/`reportSafeString` through the final `JSON.stringify` replacer to both output sinks. A fresh direct run of `report serialization removes URL credentials and sensitive values everywhere` passed `1/1`; local `node --check` and scoped `git diff --check` also passed. This supplemental local run used Node `v24.8.0`; the supplied `263/263` result is the pinned-runtime authority.

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
| --- | ---: | ---: | ---: | --- |
| 2026-08-28 | 11 | 10 | 1 | Codex acting inline as `gsd-security-auditor` |
| 2026-08-28 | 11 | 11 | 0 | Codex acting inline as `gsd-security-auditor` — T-06-08 re-audit |

## Sign-Off

- [x] All threats have a declared disposition (`mitigate` or `accept`).
- [x] The accepted supply-chain risk is documented once after consolidating duplicate `T-06-SC` entries.
- [x] External and provider authority boundaries remain pending and unclaimed.
- [x] Every declared mitigation is present in implementation.
- [x] `threats_open: 0` confirmed.
- [x] `status: verified` set in frontmatter.

**Approval:** verified 2026-08-28 — all 11 consolidated plan-time threats are closed or documented as accepted.
