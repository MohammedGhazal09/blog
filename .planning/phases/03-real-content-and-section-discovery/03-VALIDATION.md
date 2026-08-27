---
phase: 03
slug: real-content-and-section-discovery
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-27
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node 24 native `node:test`; Astro check/build; Playwright 1.62.1 with axe 4.13.0 |
| **Config file** | `package.json`, `playwright.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm run verify` |
| **Launch gate command** | `npm run launch:ready` — Wave 0 adds it; it must remain nonzero until truthful launch inputs exist |
| **Estimated runtime** | Current native suite ~8 seconds; measure the expanded full suite after Wave 0 |
| **Browser artifacts** | `.artifacts/playwright/**` only |

---

## Sampling Rate

- **After every trust-boundary or selector task:** Run `npm test`.
- **After every Astro route/layout task:** Run `npm test && npm run check && npm run build`.
- **After every browser task:** Run the focused Playwright project/file.
- **After every plan wave:** Run `npm run verify`.
- **After real content or approval evidence changes:** Run both `npm run verify` and `npm run launch:ready`.
- **Before `$gsd-verify-work`:** Both commands and every required manual content check must be green.
- **Max quick-feedback latency:** 30 seconds; browser/full-suite latency is measured after Wave 0.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | CONT-02, CONT-03 | T-03-01, T-03-02 | A public article requires a strict sidecar whose SHA-256 digest matches the exact source bytes and whose two review records pass. | native unit/contract | `npm test` | ❌ W0 approval cases | ⬜ pending |
| 03-01-02 | 01 | 1 | CONT-01, CONT-02 | T-03-03 | Drafts bypass approval for preview; every `draft: false` entry fails closed when approval is missing, malformed, incomplete, or stale. | native + build | `npm test && npm run build` | ❌ W0 selector cases | ⬜ pending |
| 03-01-03 | 01 | 1 | CONT-01, CONT-03 | T-03-04 | Phase 2 proof records are draft-only, remain reachable in development, and are absent from production routes/output. | build + browser | focused development proof project, then `npm run build` | ⚠️ existing browser coverage requires server split | ⬜ pending |
| 03-01-04 | 01 | 1 | CONT-01 | T-03-05 | Launch readiness exits nonzero when any registered section lacks a genuine approved public article; ordinary structural verification remains runnable. | native + CLI integration | `npm run verify`; expected-red `npm run launch:ready` | ❌ W0 readiness command | ⬜ pending |
| 03-02-01 | 02 | 2 | SITE-03, SITE-05 | — | `/` and `/عن-أحمد-المنجاوي/` are static Arabic/RTL pages with registry-driven links and only verified author fields. | check + build + browser | `npm test && npm run check && npm run build` | ❌ W0 discovery coverage | ⬜ pending |
| 03-02-02 | 02 | 2 | SITE-04 | — | Every registered section root exists, lists all and only approved public entries, and sorts date-descending then slug-ascending. | native + build | `npm test && npm run build` | ❌ W0 sort/set cases | ⬜ pending |
| 03-02-03 | 02 | 2 | SITE-04, SITE-05 | — | Article section and author facts are ordinary contextual anchors whose targets exist without JavaScript. | browser | focused production discovery project | ❌ W0 discovery browser cases | ⬜ pending |
| 03-03-01 | 03 | 3 | SITE-03, SITE-04, SITE-05 | T-03-04, T-03-06 | Development proof and production discovery suites run against distinct servers while all output stays under `.artifacts/`. | browser harness | `npm run test:browser` | ❌ W0 project/server split | ⬜ pending |
| 03-03-02 | 03 | 3 | SITE-03, SITE-04, SITE-05 | T-03-06 | Homepage, section, article, and author routes retain Arabic/RTL semantics, native links, focus visibility, reflow, no-JS use, and serious/critical axe cleanliness. | browser + manual visual | `npm run test:browser` | ❌ W0 discovery browser cases | ⬜ pending |
| 03-04-01 | 04 | 4 | CONT-01, CONT-02, CONT-03 | T-03-07 | No source, video, date, reference, author fact, reviewer, or approval value is invented; missing inputs remain blank and block the plan. | checkpoint + source audit | `npm run launch:ready` | ❌ external inputs missing | ⬜ pending |
| 03-04-02 | 04 | 4 | CONT-01, CONT-02, CONT-03 | T-03-01, T-03-07 | Each registered section has a real article/video package and digest-bound dual human approval for its final bytes. | readiness + human review | `npm run verify && npm run launch:ready` | ❌ external inputs missing | ⬜ pending |
| 03-04-03 | 04 | 4 | SITE-03, SITE-04, SITE-05, CONT-01, CONT-02, CONT-03 | T-03-06, T-03-07 | Real approved content is discoverable, proof/reviewer traces are absent, and rendered UI plus facts pass final review. | full suite + manual UAT | `npm run verify && npm run launch:ready` | ❌ external inputs missing | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Threat Register

| Ref | Threat | Required control | Evidence |
|-----|--------|------------------|----------|
| T-03-01 | An edited article retains stale approval. | Hash exact source bytes with Node SHA-256 and reject mismatches before public selection. | Native mismatch test and failing build. |
| T-03-02 | A malformed, incomplete, future-dated, or non-passing sidecar is accepted. | Strict shape/date/decision validation with article-specific diagnostics. | Native negative matrix. |
| T-03-03 | Missing approval is treated as public. | Central fail-closed validation for every `draft: false` entry. | Native selector and build tests. |
| T-03-04 | A proof fixture enters production discovery. | `draft: true`, production route/index absence assertions, and readiness classification. | Build manifest, `dist` scan, browser 404/absence checks. |
| T-03-05 | Launch readiness becomes a warning or is folded into ordinary build. | Separate command with deterministic nonzero exit for missing coverage; keep `verify` structural. | CLI integration test. |
| T-03-06 | Internal reviewer identity or sidecar data leaks into public output. | Never pass sidecars to rendering; scan `dist` and DOM for review fields/known values. | Build/browser negative assertions. |
| T-03-07 | Automation claims truth, religious accuracy, substance, or video match. | Require owner-supplied packages and real human review; automation checks only structure and integrity. | Manual audit and signed sidecars for exact bytes. |

---

## Wave 0 Requirements

- [ ] Extend `tests/content-contract.test.ts` with approval-sidecar cases: missing file, invalid JSON, unknown/missing field, malformed/future date, non-pass decision, wrong article/source, digest mismatch, both approvals passing, and draft bypass.
- [ ] Add deterministic sorting/coverage cases: date descending, equal-date slug ascending, every registered section, missing section, foreign section, and duplicate prevention.
- [ ] Add `npm run launch:ready` plus a child-process/CLI assertion proving missing section coverage exits nonzero while ordinary `npm run build` succeeds.
- [ ] Split Playwright development-proof and production-discovery servers/projects without moving any artifact outside `.artifacts/`.
- [ ] Add `tests/discovery.spec.ts` for route/link registry parity, set equality, truthful author output, proof/reviewer absence, disabled JavaScript, keyboard focus, 320–1440px reflow, and serious/critical axe checks.

No test framework, fixture framework, or runtime dependency is added. Use existing Node/Astro/Playwright facilities and temporary directories outside watched source/planning paths.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Every launch article is substantive and independently useful. | CONT-01 | Structure and length cannot prove editorial usefulness. | An editorial reviewer reads the final exact source and records pass only after it answers its topic. |
| The direct YouTube video genuinely matches its article. | CONT-01, CONT-03 | A valid/reachable ID does not prove semantic correspondence. | Open the owner-supplied URL, compare its subject with the article, and record the match before approval. |
| Religious claims are accurate and references are adequate. | CONT-02, CONT-03 | This requires qualified human judgment. | The religious-accuracy reviewer checks final source/references and records pass against the exact digest. |
| Every public author/profile fact is true. | SITE-05, CONT-03 | Repository code cannot independently prove biography or credentials. | Compare each rendered claim with owner-approved input; omit every unknown optional field. |
| Reviewer identities/dates are real, consented, and suitable for repository storage. | CONT-02 | Automation validates shape, not identity, consent, or repository privacy. | Confirm repository visibility and reviewer consent before committing sidecars. |
| Native 200% zoom and final Arabic visual quality are acceptable. | SITE-03, SITE-04, SITE-05 | True browser zoom and visual judgment require rendered inspection. | Inspect homepage, longest section, representative article, and author page at native 200%; keep Hercules evidence under `.artifacts/`. |

---

## Known External Blocker

Structural Plans 03-01 through 03-03 can execute now. Plan 03-04 cannot pass until the owner supplies:

- one real article/video/date/reference package for each of the three registered sections;
- real editorial and religious-accuracy reviewers for each exact final source revision;
- confirmation that storing reviewer identities in the repository is consented and appropriate.

No placeholder or proof fixture may satisfy this gate.

---

## Validation Sign-Off

- [ ] All tasks have automated verification or a Wave 0 dependency.
- [ ] Sampling continuity: no three consecutive tasks lack automated feedback.
- [ ] Wave 0 covers every currently missing automated reference.
- [ ] No watch-mode flags, `.skip`, `.only`, `.fixme`, or warning-only launch gate.
- [ ] Browser artifacts remain exclusively under `.artifacts/`.
- [ ] Ordinary `npm run verify` is green without fabricated content.
- [ ] `npm run launch:ready` is green only after real content and human evidence exist.
- [ ] Every manual-only content, identity, consent, and visual check is recorded.
- [ ] `nyquist_compliant: true` and `wave_0_complete: true` are set only after the evidence exists.

**Approval:** pending
