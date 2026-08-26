---
phase: 1
slug: content-and-url-contract
status: planned
nyquist_compliant: true
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

- **After every task commit:** Run `npm test`; the two explicit RED tasks use an inverted exit assertion until their following implementation task turns the suite green
- **After every plan wave:** Run `npm run verify`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | SEO-01, PUB-01, PUB-04 | T-01, T-06, T-01-SC | Exact runtime/package gate exists and the Markdown identity/visibility journey is specified RED | native contract RED gate | exact versions, then inverted `npm test` exit | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | SEO-01, PUB-02, PUB-03, PUB-06 | T-01, T-02, T-05 | Article facts, registries, canonical Arabic identity, collisions, and draft policy become GREEN at one boundary | table-driven unit + diagnostics | `npm test` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | PUB-01, PUB-04 | T-02, T-06 | Public and draft Markdown use the final route; production emits only public output | unit + Astro integration | `npm test && npm run check && npm run build` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | PUB-05 | T-03, T-04 | Approved/forbidden MDX policy behaviors are specified RED | native policy RED gate | inverted `npm test` exit | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | PUB-05 | T-03, T-04, T-05 | Raw source is preflighted before compilation against one allowlist/map | policy unit + Astro diagnostics | `npm test && npm run check` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 2 | PUB-01, PUB-05 | T-03, T-04 | Approved MDX renders through the same collection and final route family | Astro diagnostics + build | `npm test && npm run check && npm run build` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 3 | SEO-01, PUB-02, PUB-03, PUB-04, PUB-05, PUB-06 | T-01–T-06 | Every locked validation and security branch has native regression coverage | full native matrix + build integration | `npm test && npm run verify` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 3 | PUB-01 | T-06, T-01-SC | Clean install/full gate and final-route local preview workflow are proven and documented | clean integration + local smoke | exact versions, `npm ci`, `npm run verify`, then documented dev smoke | ❌ W0 | ⬜ pending |

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
| The documented local preview command serves public Markdown, approved MDX, and a development-only draft through the final route family and reloads an edited field | PUB-01, PUB-04, PUB-05 | The development server is a long-running process; production build/output inspection remains the automated publication gate | Run `npm run dev -- --host 127.0.0.1`, request the three documented Arabic paths, edit and restore the Markdown summary after confirming reload, stop the server, rebuild, and confirm the draft output path is absent |

---

## Validation Sign-Off

- [x] All tasks have automated verification or explicit RED-to-GREEN dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verification
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags in automated checks
- [x] Feedback latency remains under 60 seconds for native checks
- [x] `nyquist_compliant: true` set after the final plan/task map

**Approval:** planned for execution; Wave 0 remains incomplete until Plan 01 runs
