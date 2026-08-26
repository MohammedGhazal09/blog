---
phase: 1
slug: content-and-url-contract
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-26
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js 24.19.0 built-in `node:test` and `node:assert/strict` |
| **Config file** | none — Wave 0 creates the test script and first focused test file |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm run verify` |
| **Estimated runtime** | under 60 seconds after dependencies are installed |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm run verify`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | SEO-01, PUB-03 | T-01, T-02 | Arabic identifiers are canonical and complete paths cannot collide | table-driven unit | `npm test` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | PUB-02, PUB-06 | T-05 | Article facts, registry membership, and date/video relationships fail closed | table-driven unit + diagnostics | `npm test` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | PUB-05 | T-03, T-04 | MDX source cannot import/export code or bypass the approved component surface | policy unit + build integration | `npm test && npm run build` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | PUB-04 | T-06 | Drafts are filtered before production path enumeration | unit + build integration | `npm test && npm run build` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 2 | PUB-01 | — | Valid Markdown and approved MDX render through the same collection and final route family | Astro diagnostics + build | `npm run check && npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Select Node `24.19.0` and npm `11.17.0`; record the Node version and compatible engines.
- [ ] Create `.nvmrc`, `package.json`, `package-lock.json`, `astro.config.mjs`, and `tsconfig.json` with exact direct dependency versions.
- [ ] Create `tests/content-contract.test.ts` with valid, rejection, collision, draft, registry-extension, date, video-ID, and MDX-policy cases.
- [ ] Keep negative cases in test memory or dedicated test fixtures outside the production content collection.
- [ ] Create valid Markdown and approved-MDX proof entries for the integration build.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| The documented local preview command starts and serves a proof article through its final Arabic route | PUB-01 | The development server is a long-running process; the production build remains the automated route/render gate | Run `npm run dev -- --host 127.0.0.1`, request one generated Arabic article path, confirm HTTP 200 and the edited article field, then stop the server |

---

## Validation Sign-Off

- [ ] All tasks have automated verification or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verification
- [ ] Wave 0 covers all missing references
- [ ] No watch-mode flags
- [ ] Feedback latency remains under 60 seconds
- [ ] `nyquist_compliant: true` set in frontmatter after the plan/task map is finalized

**Approval:** pending
