---
phase: 02
slug: complete-arabic-article-journey
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-26
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Unit framework** | Node.js 24.19.0 built-in `node:test` with `node:assert/strict` |
| **Browser framework** | `@playwright/test@1.62.1` with `@axe-core/playwright@4.13.0` and matching Chromium, installed as exact dev dependencies in Wave 0 |
| **Config file** | `playwright.config.ts` — Wave 0 creates it; every report, trace, screenshot, video, snapshot, and temporary browser file stays under ignored `.artifacts/` |
| **Quick run command** | `npm test` |
| **Focused browser command** | `npx playwright test tests/article-journey.spec.ts --project=chromium` |
| **Full suite command** | `npm run verify` after Wave 0 extends it to unit tests → Astro diagnostics → production build → browser suite |
| **Estimated runtime** | Unit feedback under 10 seconds; full browser-inclusive gate target under 120 seconds on the local exact runtime |

---

## Sampling Rate

- **After every task commit:** Run `npm test`; for article/player UI tasks also run the smallest matching Playwright `-g` scenario.
- **After every plan wave:** Run `npm run check && npm run build && npm run test:browser`.
- **Before `$gsd-verify-work`:** Exact Node 24.19.0/npm 11.17.0 `npm run verify` must be green; both public routes must exist and the production draft route must remain absent.
- **Max feedback latency:** 120 seconds for the full local gate; use focused browser grep commands during task iteration.

---

## Per-Requirement Verification Map

| Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| SITE-01 | — | Reader-facing article chrome and controls remain Arabic-only | browser DOM/a11y | `npx playwright test tests/article-journey.spec.ts -g "Arabic surface"` | ❌ W0 | ⬜ pending |
| SITE-02 | — | Both public routes expose `lang="ar"` and `dir="rtl"` | browser DOM | `npx playwright test tests/article-journey.spec.ts -g "Arabic document semantics"` | ❌ W0 | ⬜ pending |
| ART-01 | T2-05, T2-06 | Complete static title → facts → الخلاصة → authored body/conclusion with one h1 and ordered headings | browser + built output | `npx playwright test tests/article-journey.spec.ts -g "complete text-first"` | ❌ W0 | ⬜ pending |
| ART-02 | — | Reader reflows at all locked widths with body text at least 1rem and no page overflow | browser responsive | `npx playwright test tests/article-journey.spec.ts -g "reflow"` | ❌ W0 | ⬜ pending |
| ART-03 | — | Mixed-direction values use explicit native isolation and keep their order | DOM + manual visual | `npx playwright test tests/article-journey.spec.ts -g "bidi"` | ❌ W0 | ⬜ pending |
| ART-04 | T2-02, T2-03, T2-07, T2-08 | Initial load makes zero YouTube requests; one activation creates one encoded no-autoplay nocookie iframe | browser network/DOM | `npx playwright test tests/article-journey.spec.ts -g "intent-gated player"` | ❌ W0 | ⬜ pending |
| ART-05 | T2-02, T2-04 | Exact same-tab direct-video link remains present with JavaScript disabled and player blocked | browser degraded mode | `npx playwright test tests/article-journey.spec.ts -g "direct YouTube"` | ❌ W0 | ⬜ pending |
| ART-06 | T2-01, T2-09 | HTTPS references fail closed; registered facts/dates render once; absent optionals produce no container | unit + browser | `npm test; npx playwright test tests/article-journey.spec.ts -g "provenance"` | ⚠ extend unit; browser W0 | ⬜ pending |
| ART-07 | — | Labelled الخلاصة uses validated summary and precedes authored body | browser DOM | `npx playwright test tests/article-journey.spec.ts -g "summary"` | ❌ W0 | ⬜ pending |
| QUAL-01 | T2-05, T2-08 | Native semantic structure and Arabic names; zero serious/critical axe violations on both routes | axe + browser DOM | `npx playwright test tests/article-journey.spec.ts -g "accessibility"` | ❌ W0 | ⬜ pending |
| QUAL-02 | T2-03 | Keyboard activates every control, visible focus persists, and Tab/Shift+Tab do not trap | browser keyboard + manual | `npx playwright test tests/article-journey.spec.ts -g "keyboard"` | ❌ W0 | ⬜ pending |
| QUAL-03 | — | Locked contrast, type, target sizes, reflow, and responsive behavior hold | axe/browser + manual zoom | `npx playwright test tests/article-journey.spec.ts -g "quality"` | ❌ W0 | ⬜ pending |
| QUAL-04 | T2-06, T2-07 | Complete article and direct link survive disabled JS, blocked embed, and third-party-cookie failure | browser degraded mode | `npx playwright test tests/article-journey.spec.ts -g "degraded"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠ flaky*

---

## Required Automated Scenarios

1. Extend `tests/content-contract.test.ts` for absent, empty, malformed, and valid reference data. Reject blank/non-Arabic-facing labels plus relative, HTTP, JavaScript, malformed, credential-bearing, or otherwise non-HTTPS destinations without weakening the existing 55 Phase 1 checks.
2. Build both public proof routes and assert the production draft output remains absent.
3. On Markdown and approved MDX routes, assert Arabic document semantics, one h1, ordered headings, visible facts, labelled summary, body/conclusion, Arabic media copy, direct link, and no initial iframe.
4. Put `updatedAt` and references on one public proof record and omit them on the other; prove the optional units appear once only when declared.
5. Record requests for YouTube-family hosts; require zero before activation, then exactly one labelled `www.youtube-nocookie.com` iframe with encoded validated ID and no `autoplay=1` after one activation. Repeated activation must not duplicate it.
6. Run one browser context with `javaScriptEnabled: false` and another with `youtube-nocookie.com` aborted; both retain the full article and exact permanent direct link.
7. Force iframe construction failure before the page script runs; activation exposes the specified Arabic `role="status"` error while the direct link stays unchanged.
8. At 320, 390, 768, 1024, and 1440 CSS pixels, assert document `scrollWidth <= clientWidth`, body font size is at least 16px, standalone controls are at least 44px, and no authored content is hidden or truncated.
9. Run `AxeBuilder` on both local routes before activation and fail on serious/critical violations; the third-party iframe is not counted as proof of local accessibility.
10. Assert Playwright output paths resolve beneath `.artifacts/` and no browser artifact appears in source or `.planning`.

---

## Wave 0 Requirements

- [ ] Select the exact Node 24.19.0 runtime and npm 11.17.0 before changing dependencies.
- [ ] Install exact dev packages `@playwright/test@1.62.1` and `@axe-core/playwright@4.13.0`, then install the matching Chromium browser.
- [ ] Create `playwright.config.ts` with production-build preview, Chromium, `tests/**/*.spec.ts`, `baseURL: http://127.0.0.1:4321`, and all outputs under `.artifacts/`.
- [ ] Create `tests/article-journey.spec.ts` with vertical Markdown/MDX, accessibility, network, degraded-mode, keyboard, and reflow scenarios.
- [ ] Extend `tests/content-contract.test.ts` for structured HTTPS references without weakening the Phase 1 matrix.
- [ ] Add `preview` and `test:browser` package scripts and extend `verify` only after the production build can feed the browser suite.
- [x] `.artifacts/` is already ignored; do not create a second browser-output directory.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real 200% browser zoom reflow | ART-02, QUAL-03 | CSS viewport emulation does not reproduce browser zoom and text-resize behavior reliably | At 200% browser zoom, inspect both public routes for no page-level horizontal scroll, clipping, overlap, or unusable controls. |
| Arabic diacritics and bidi visual order | ART-03 | DOM direction assertions cannot prove glyph order or diacritic clipping | Inspect representative HTTPS URL, YouTube ID, Arabic/ASCII digits, punctuation, date, and diacritics at mobile and desktop widths. |
| Accessibility-tree reading order and names | QUAL-01 | Automated rules do not prove Arabic screen-reader naming and logical order | Inspect document → main → article → headings → direct link → activation button → inserted iframe in the browser accessibility tree. |
| Bidirectional keyboard escape around inserted iframe | QUAL-02 | Focus inside a third-party cross-origin iframe needs human keyboard confirmation | Tab and Shift+Tab through the page before and after activation; confirm visible focus and escape in both directions with no trap. |
| Third-party cookie and embed failure resilience | QUAL-04 | Browser/privacy controls and actual third-party player behavior vary | Block third-party cookies, then block `youtube-nocookie.com`; confirm the text and direct action remain complete and usable. |
| No eager third-party media | ART-04, QUAL-04 | A human network/HTML inspection catches remote posters, preconnects, and non-obvious eager assets | Before activation inspect built HTML and network for no iframe, YouTube script, preconnect, poster, `ytimg`, or other YouTube-family request. |

---

## Security Gates

- **T2-01:** Block if reference validation accepts relative, non-HTTPS, credential-bearing, or unparsable destinations.
- **T2-02/T2-03:** Block if a content-authored full embed URL is accepted, the 11-character video ID rule weakens, the iframe host is not hardcoded, the ID is not encoded, or repeat activation creates duplicates.
- **T2-05/T2-08:** Block if the MDX preflight/allowlist weakens or player/error rendering uses `innerHTML`/`insertAdjacentHTML`.
- **T2-06:** Block if the production route bypasses `getPublicArticles()` or the draft path appears in production output.
- **T2-07:** Block if initial load makes any YouTube-family request, including iframe, script, preconnect, poster, thumbnail, or media asset.
- Do not pull CSP, hosting headers, analytics consent, production domains, or deployment policy into Phase 2.

---

## Validation Sign-Off

- [ ] Every implementation task has an automated verify command or an explicit Wave 0 dependency.
- [ ] Sampling continuity: no three consecutive tasks lack automated verification.
- [ ] Wave 0 creates every missing config, browser test, and test dependency listed above.
- [ ] No watch-mode flag appears in any verification command.
- [ ] Browser artifacts remain exclusively under ignored `.artifacts/`.
- [ ] Full local feedback latency stays below 120 seconds or focused commands are used per task.
- [ ] All manual-only gates are recorded before phase verification.
- [ ] `wave_0_complete: true` and `nyquist_compliant: true` are set after the planned infrastructure and task coverage are proven.

**Approval:** pending implementation and phase verification
