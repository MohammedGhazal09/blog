---
phase: 1
slug: content-and-url-contract
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-26
audited: 2026-08-28
---

# Phase 1 — Validation Strategy

> Current adversarial validation map for the completed content and URL contract.

## Test Infrastructure

| Property                  | Value                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| **Framework**             | Node.js 24.19.0 built-in `node:test` / `node:assert/strict`; Astro diagnostics and static build     |
| **Behavioral file**       | `tests/content-contract.test.ts`                                                                    |
| **Phase-focused command** | Exact-runtime `node --test --test-concurrency=1 --test-reporter=tap tests/content-contract.test.ts` |
| **Integration commands**  | `npm run check`; `npm run build`                                                                    |
| **Repository gate**       | `npm run verify` (broader than Phase 1; includes later-phase browser suites)                        |

The audit prepends the installed pinned runtime to `PATH` and points `npm_execpath`/`npm_node_execpath` at it. The ambient shell is Node `v24.8.0` and npm `11.12.1`; the selected pinned installation reports Node `v24.19.0` and npm `11.17.0`.

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement                                    | Threat Ref          | Observable behavior                                                                                                                        | Test Type                                            | Automated Command                                                          | File Exists | Status   |
| -------- | ---- | ---- | ---------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------- | ----------- | -------- |
| 01-01-01 | 01   | 1    | SEO-01, PUB-01, PUB-04                         | T-01, T-06, T-01-SC | Exact runtime is selectable; Arabic identity is title-independent; production excludes drafts                                              | native unit + runtime smoke                          | exact versions; phase-focused command                                      | ✅          | ✅ green |
| 01-01-02 | 01   | 1    | SEO-01, PUB-02, PUB-03, PUB-06                 | T-01, T-02, T-05    | Facts, registries, Unicode slugs, dates, video IDs, collisions, diagnostics, and fourth-section extension pass/fail at the shared boundary | table-driven unit                                    | phase-focused command                                                      | ✅          | ✅ green |
| 01-01-03 | 01   | 1    | PUB-01, PUB-04                                 | T-02, T-06          | One route family builds public content while every explicit Phase 1 draft fixture is absent                                                | unit + Astro integration                             | phase-focused command; `npm run check`; `npm run build`; output inspection | ✅          | ✅ green |
| 01-02-01 | 02   | 2    | PUB-05                                         | T-03, T-04          | Approved component passes; ESM, expressions, HTML, attributes, unsafe URLs, and unknown components fail with diagnostics                   | table-driven unit                                    | phase-focused command                                                      | ✅          | ✅ green |
| 01-02-02 | 02   | 2    | PUB-05                                         | T-03, T-04, T-05    | Production preflight parses real sources before compilation and the typed allowlist/map is checkable                                       | unit + Astro diagnostics                             | phase-focused command; `npm run check`                                     | ✅          | ✅ green |
| 01-02-03 | 02   | 2    | PUB-01, PUB-05                                 | T-03, T-04          | Valid Markdown/MDX compile through the same collection and route; draft proof records stay out of production                               | Astro integration                                    | `npm run check`; `npm run build`; output inspection                        | ✅          | ✅ green |
| 01-03-01 | 03   | 3    | SEO-01, PUB-02, PUB-03, PUB-04, PUB-05, PUB-06 | T-01–T-06           | Every locked validation/security branch has a behavioral regression against production helpers                                             | full native matrix                                   | phase-focused command                                                      | ✅          | ✅ green |
| 01-03-02 | 03   | 3    | PUB-01                                         | T-06, T-01-SC       | Arabic runbook names the real workflow; static build consumes the same validated sources                                                   | documentation contract + integration + completed UAT | phase-focused command; check/build; `01-UAT.md`                            | ✅          | ✅ green |

## Requirement Coverage

| Requirement | Behavioral evidence                                                                                        | Status   |
| ----------- | ---------------------------------------------------------------------------------------------------------- | -------- |
| SEO-01      | Canonical slug rejection matrix, title-independent path, trailing slash, collision ownership               | ✅ green |
| PUB-01      | Mixed collection, shared route build, approved MDX case, completed development-preview UAT                 | ✅ green |
| PUB-02      | Required facts, registry membership, exact dates, draft type, future-public rules, YouTube ID diagnostics  | ✅ green |
| PUB-03      | Non-NFC, separators, escapes, controls/bidi, hyphens, Latin/punctuation, full-path collisions              | ✅ green |
| PUB-04      | Public selector excludes drafts; preview requires development; production excludes contract drafts         | ✅ green |
| PUB-05      | Structural policy accepts the sole approved component and rejects executable/unsafe MDX before compilation | ✅ green |
| PUB-06      | A fourth section validates and derives a route through unchanged production helpers                        | ✅ green |

## Wave 0 Completion

- [x] Exact Node `24.19.0` and npm `11.17.0` installation was selected for this audit.
- [x] Toolchain/configuration files and exact lockfile exist.
- [x] `tests/content-contract.test.ts` contains positive and negative behavioral coverage against production modules.
- [x] Invalid cases remain in memory; production content contains schema-valid records.
- [x] Valid Markdown and approved MDX compile; all Phase 1 contract fixtures are explicit drafts and absent from production output.

## Manual-Only Verification

| Behavior                                                                                                                | Requirement            | Why Manual                                                                                                          | Current Evidence                                                                          |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Development server serves Markdown, approved MDX, and drafts through the final route and reloads a restored source edit | PUB-01, PUB-04, PUB-05 | Source-edit/reload is long-running watcher ergonomics; automated tests cover the security and production boundaries | Completed in `01-UAT.md`; post-UAT verification confirmed restoration and draft exclusion |

This is not an unresolved gap. It remains manual-only because a permanent watch-mode test does not belong in the automated gate.

## Audit Evidence — 2026-08-28

| Check                      | Actual result                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------ |
| Pinned runtime             | Node `v24.19.0`; npm `11.17.0`                                                       |
| Phase-focused native suite | 88 passed, 0 failed, 0 skipped; exit 0                                               |
| Astro diagnostics          | 22 files; 0 errors, 0 warnings, 0 hints; exit 0                                      |
| Static build               | 9 pages built; sitemap generated; exit 0                                             |
| Output inspection          | All three contract fixture output paths absent; current public launch articles built |
| Implementation changes     | None                                                                                 |
| New test files             | None; existing behavioral coverage is complete                                       |

The broader `npm test` was started under the pinned runtime but is not Phase 1 evidence: it now includes later-phase production-verification files and buffers child output. The focused suite plus Astro check/build is the smallest complete deterministic Phase 1 gate.

## Validation Sign-Off

- [x] Every task has passing automated evidence or completed explicit manual-only verification.
- [x] Every Phase 1 requirement maps to observable behavior.
- [x] No test was marked green without a fresh run.
- [x] No implementation file was modified.
- [x] Wave 0 is complete and `nyquist_compliant: true` is current.

**Approval:** Nyquist compliant; all repository-controlled Phase 1 validation gaps are filled.
