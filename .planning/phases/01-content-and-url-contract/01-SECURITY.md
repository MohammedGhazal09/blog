---
phase: "01-content-and-url-contract"
phase_number: 1
audited_at: "2026-08-26T16:50:25+03:00"
status: secured
asvs_level: 1
block_on: open
register_authored_at_plan_time: true
threats_total: 7
threats_closed: 7
threats_open: 0
accepted_risks: 0
unregistered_flags: 0
---

# Phase 1 Security Audit

## Result

**SECURED.** Every plan-time mitigation is present at the declared boundary. No open threat blocks Phase 1.

This audit verifies only the seven registered threats. It does not claim that the restricted MDX policy is a hostile-input sandbox, and it does not broaden into a repository-wide vulnerability scan.

## Verified Threat Register

| Threat ID | Category | Disposition | Status | Verified mitigation and evidence |
|---|---|---|---|---|
| T-01 | Spoofing | mitigate | CLOSED | `assertCanonicalArabicSlug` rejects non-NFC input, Unicode control/format characters (including bidi controls), unsafe separators/dots/escapes, malformed hyphens, and characters outside the Arabic letter/mark and Arabic/ASCII digit grammar (`src/lib/content-contract.ts:50`, `src/lib/content-contract.ts:101`). Both complete-path and route-param helpers re-run the assertion before creating paths (`src/lib/content-contract.ts:209`, `src/lib/content-contract.ts:227`), and the route consumes `pathParamsFor` (`src/pages/[section]/[slug].astro:14`). Native regressions cover the declared accepted and rejected classes (`tests/content-contract.test.ts:42`). |
| T-02 | Spoofing / Tampering | mitigate | CLOSED | `assertUniqueArticlePaths` derives every complete path, compares it in one map, and reports the path plus both source owners (`src/lib/content-contract.ts:245`). `getValidatedArticles` invokes it on the complete collection before either public or preview selection (`src/lib/articles.ts:8`); the collision regression requires both owners (`tests/content-contract.test.ts:99`). |
| T-03 | Tampering / Information Disclosure / Elevation | mitigate | CLOSED | Astro configuration invokes `preflightArticleSources` at configuration load before exporting the build configuration (`astro.config.mjs:3`, `astro.config.mjs:5`). The preflight parses each Markdown/MDX source structurally with pinned `@mdx-js/mdx` and rejects `mdxjsEsm`, flow expressions, and text expressions before Astro compilation (`src/lib/mdx-policy.ts:7`, `src/lib/mdx-policy.ts:21`, `src/lib/mdx-policy.ts:47`, `src/lib/mdx-policy.ts:90`). Native tests reject import, export, and both expression forms (`tests/content-contract.test.ts:294`). Within the required implementation scope, the only environment reads are npm's public user-agent version gate and Astro's public `DEV` flag; no secret-bearing environment access or `.env` loader exists (`package.json:12`, `src/lib/articles.ts:22`, `src/pages/[section]/[slug].astro:9`). No `.env` file was read during this audit. |
| T-04 | Tampering | mitigate | CLOSED | The single allowlist contains only `ContractNote` (`src/lib/mdx-policy.ts:9`) and the render map is statically constrained to that name (`src/components/mdx-components.ts:4`). Structural traversal rejects raw HTML, fragments, intrinsic elements such as script/iframe, non-allowlisted components, and every attribute on the approved component; Markdown link/image/definition URLs are restricted to `http:`, `https:`, and `mailto:` (`src/lib/mdx-policy.ts:22`, `src/lib/mdx-policy.ts:53`, `src/lib/mdx-policy.ts:56`, `src/lib/mdx-policy.ts:63`, `src/lib/mdx-policy.ts:70`). Regressions cover case/spacing variants, event-handler HTML, component expressions/attributes, an unsafe URL, and an unknown component (`tests/content-contract.test.ts:294`). |
| T-05 | Denial of Service | mitigate | CLOSED | One mixed collection schema requires all declared fields and delegates semantic validation to the shared production contract (`src/content.config.ts:7`, `src/content.config.ts:9`, `src/content.config.ts:24`). `validateArticleData` validates the complete registries, source fields, own-property membership, canonical slug, exact real dates and ordering, explicit draft state, future-publication rule, and YouTube ID while `fail` preserves location plus rule (`src/lib/content-contract.ts:42`, `src/lib/content-contract.ts:124`, `src/lib/content-contract.ts:166`). Invalid facts remain in the native test matrix and assert source, field/path, and rule diagnostics (`tests/content-contract.test.ts:114`, `tests/content-contract.test.ts:138`). |
| T-06 | Information Disclosure | mitigate | CLOSED | Both query paths first load and collision-check the complete collection. `getPublicArticles` then applies the fail-closed `draft === false` filter; `getPreviewArticles` delegates to a selector that throws unless the explicit Astro development flag is true (`src/lib/articles.ts:8`, `src/lib/articles.ts:15`, `src/lib/articles.ts:19`, `src/lib/content-contract.ts:258`, `src/lib/content-contract.ts:264`, `src/lib/content-contract.ts:271`). Production route enumeration selects only `getPublicArticles` (`src/pages/[section]/[slug].astro:8`). Tests prove public exclusion and production preview rejection (`tests/content-contract.test.ts:221`, `tests/content-contract.test.ts:238`); inspected static output contains both public proof pages and no draft page. |
| T-01-SC | Tampering | mitigate | CLOSED | `.nvmrc` pins Node 24.19.0 (`.nvmrc:1`); `package.json` declares npm 11.17.0, compatible engines, and an exact preinstall version gate (`package.json:6`, `package.json:7`, `package.json:12`). All five direct dependencies, including the directly imported `@mdx-js/mdx@3.1.1`, are exact pins (`package.json:20`), and the lock root repeats those exact versions (`package-lock.json:7`). Each direct package has a resolved version and integrity record (`package-lock.json:25`, `package-lock.json:334`, `package-lock.json:1722`, `package-lock.json:2511`, `package-lock.json:6323`). Full lock parsing found no package entry missing a version or integrity/link record. The submitted independent clean `npm ci` reproduced 391 installed packages; the current exact-runtime audit reports zero vulnerabilities. |

## Accepted Risks

None. Every registered threat has disposition `mitigate`; no risk was accepted or transferred.

## Unregistered Flags

None. The three plan summaries contain no `## Threat Flags` entries. The structural MDX parser remediation maps to T-03 and T-04, and its exact direct dependency maps to T-01-SC; these are not new unmapped attack surfaces. `01-03-SUMMARY.md` also records that its new-threat-surface check found no unplanned trust-boundary surface.

## Verification Evidence

| Check | Result |
|---|---|
| Exact runtime | Node `v24.19.0`; npm `11.17.0` |
| Native mitigation matrix | 55/55 passed under the exact runtime during this audit |
| Dependency audit | 0 info, low, moderate, high, or critical vulnerabilities during this audit |
| Lock graph | 492 lock package entries including platform optionals; root direct pins exact; zero missing version records; zero missing integrity/link records |
| Independent clean gate supplied with the phase | Clean `npm ci`: 391 installed packages and 0 vulnerabilities; `npm run verify`: 55/55 tests, 0 Astro errors/warnings/hints, 2 public static pages |
| Static output inspected during this audit | Public Markdown present; public MDX present; draft absent; neither public page contains a production `<script>` tag |
| Environment handling | No `.env` file read; no secret-bearing environment loader or access in the required implementation scope |

## Audit Trail

1. Loaded all three plan-time threat models, all three summaries, Phase 1 specification/context/validation/review artifacts, the complete listed implementation and test scope, and the full lock graph before classifying threats.
2. Confirmed the repository has no project-local `.codex/skills` or `.agents/skills` directory; applied the selected security validation skills only as evidence methodology.
3. Classified all seven entries as `mitigate`; there are no `accept` or `transfer` dispositions.
4. Traced each declared mitigation from its public/configuration entry point through the enforcing control and its focused regression evidence.
5. Ran the 55-case native suite and npm vulnerability audit under the exact pinned runtime, then inspected the existing production output for public/draft separation and script absence.
6. Modified no implementation file and did not read any `.env` file. This `01-SECURITY.md` file is the audit's only repository change.
