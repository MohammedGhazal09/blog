---
phase: 03
slug: real-content-and-section-discovery
status: in_progress
nyquist_compliant: false
wave_0_complete: true
created: 2026-08-27
updated: 2026-08-27
---

# Phase 03 — Validation Strategy

> Updated after the owner authorized autonomous source-backed launch content. The earlier human-review sidecar checks are superseded and must not be represented as completed evidence.

## Test Infrastructure

| Property | Value |
| --- | --- |
| Runtime | Node `v24.19.0`, npm `11.17.0` |
| Native contract | Node `node:test` through `npm test` |
| Static diagnostics/build | `npm run check`, `npm run build` |
| Launch gate | `npm run launch:ready` |
| Browser | Playwright 1.62.1 plus axe 4.13.0 |
| Full suite | `npm run verify` |
| Browser artifacts | `.artifacts/**` only |

## Per-Task Verification Map

| Task | Requirements | Behavior | Evidence | Status |
| --- | --- | --- | --- | --- |
| 03-01 | CONT-01, CONT-03 | Proof Markdown/MDX records remain draft-only; normal build is structural; launch coverage is explicit. | Native tests, development-proof browser project, build scan | ✅ green |
| 03-02 | SITE-03, SITE-04, SITE-05 | Homepage, three indexes, contextual links, and truthful minimal author page are static Arabic/RTL routes. | Astro build and browser graph checks | ✅ green |
| 03-03 | SITE-03, SITE-04, SITE-05 | Production oracle, no-JS graph, keyboard focus, five-width reflow, no remote discovery requests, and axe checks are independent. | `tests/discovery.spec.ts` | ✅ green |
| 03-04-01 | CONT-02, CONT-03 | Review sidecars and fabricated reviewer identities are absent; source/video/date/authorship facts are recorded truthfully. | Repository search plus `03-CONTENT-INPUTS.md` | ✅ green |
| 03-04-02 | CONT-01, CONT-02 | Each section has one cited AI-assisted Arabic article and real topic-matching video ID. | Schema/build/readiness/source audit | ✅ green |
| 03-04-03 | SITE-03–05, CONT-01–03 | Real public graph passes full automation and rendered Hercules review. | Full suite plus final QA ledger | ⬜ pending final Hercules |

## Threat Register

| Ref | Threat | Control | Evidence |
| --- | --- | --- | --- |
| T-03-01 | AI text is presented as a transcript or completed human review. | Visible Arabic AI/no-transcript note in every launch article; no review UI or sidecar. | Source and built-output scan. |
| T-03-02 | A Phase 2 proof fixture enters production. | Proof sources remain `draft: true`; production routes/indexes and `dist` reject proof traces. | Browser 404, set equality, output scan. |
| T-03-03 | A registered section launches empty. | `assertLaunchSectionCoverage()` remains a separate launch-readiness gate. | Native missing-section matrix plus green real-corpus command. |
| T-03-04 | Video identity or source provenance is fabricated. | Use verified YouTube page IDs/titles/dates and explicit HTTPS references recorded in the content ledger. | Frontmatter/ledger/link audit. |
| T-03-05 | Unsupported biography or credential appears. | Author registry exposes only the name; browser test rejects unsupported claim vocabulary and elements. | Author-route browser check. |
| T-03-06 | Long Arabic content clips, overflows, or becomes unusable without JavaScript. | Existing logical CSS, `70ch` measure, five-width/no-JS/keyboard/axe/Hercules checks. | Playwright and final screenshots. |

## Automated Gates

- [x] Native contract suite includes schema, route, reference, preview, registry, MDX policy, and launch coverage cases.
- [x] Production discovery suite derives the public corpus independently from raw article frontmatter.
- [x] Production discovery checks homepage/index set equality, author facts, proof/review absence, no-JS traversal, keyboard order/focus, 320–1440 reflow, network silence, visual tokens, and axe results.
- [x] Playwright output, report, snapshots, traces, screenshots, and video are configured below `.artifacts/`.
- [ ] Full `npm run verify`, direct `npm run launch:ready`, focused production suite, `git diff --check`, and final source/output scans are green after all documentation changes.

## Human and External Evidence Boundary

| Item | Current evidence | Status |
| --- | --- | --- |
| Video topic correspondence | Verified YouTube page title/ID for each selected video matches the article's declared topic; no transcript claim is made. | Verified metadata; semantic depth not transcript-verified |
| Article substance and religious accuracy | Cautious source-backed prose plus citations and visible AI disclosure. | Human specialist review not performed; recommended before external deployment |
| Author/profile facts | Only the registered name and generic publication purpose are shown. | No unsupported biography/credential claim |
| Native 200% zoom and final Arabic visual quality | Must be inspected during Hercules final QA. | Pending |
| Hosted production, Search Console, analytics, and live provider behavior | Owned by Phases 5–6 and may require credentials/domain access. | Out of Phase 3 |

## Validation Sign-Off

- [x] Owner-input checkpoint superseded by explicit autonomous-content instruction.
- [x] No fake reviewer, consent, human approval, transcript, or biography evidence was created.
- [x] Ordinary and launch publication contracts are executable under the exact runtime.
- [ ] Hercules final QA has no unresolved phase-scoped visual or logic finding.
- [ ] Set `status: passed` and `nyquist_compliant: true` only after final gates pass.

**Approval:** pending final automated and Hercules verification
