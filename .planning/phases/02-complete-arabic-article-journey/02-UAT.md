---
status: complete
phase: 02-complete-arabic-article-journey
source:
  - 02-01-SUMMARY.md
  - 02-02-SUMMARY.md
  - 02-03-SUMMARY.md
  - 02-04-SUMMARY.md
started: 2026-08-26T19:40:43.260Z
updated: 2026-08-26T19:40:43.260Z
---

## Current Test

[testing complete]

## Tests

**Section 1 — User-flow walk-through**

### 1. Open a complete Arabic article
expected: Opening either public article route shows one readable Arabic RTL article with its title, registry-backed facts, labelled summary, introduction, structured body, conclusion, and matching video section in a calm single-column layout.
result: pass
evidence:
  - Both public Markdown and approved-MDX routes passed the complete text-first, Arabic-surface, document-semantics, and visual-hierarchy browser checks.
  - The final Hercules review inspected both routes at 320, 390, 768, 1024, and 1440 CSS pixels with no in-scope visual defect.

### 2. Read when JavaScript or embedded media is unavailable
expected: With JavaScript disabled, or when the embedded-media host cannot load, the complete article remains readable and the activation-only control does not become a dead interface element.
result: pass
evidence:
  - JavaScript-disabled, blocked-host, iframe-construction-failure, and third-party-cookie-blocked journeys retain the complete article and static Arabic status content.
  - The degraded-state Chromium matrix passed for both public routes.

### 3. Reach the matching YouTube video
expected: The permanent Arabic YouTube action remains visible outside the replaceable player region, points to the validated matching video, and uses ordinary same-tab navigation even when JavaScript or inline playback is unavailable.
result: pass
evidence:
  - Browser checks prove the exact encoded YouTube destination, absence of a new-tab target, and survival through no-JavaScript, blocked-host, and construction-error states on both routes.
  - The direct action is static HTML and never depends on iframe creation.

### 4. Activate optional inline playback intentionally
expected: Activating the native Arabic button creates one privacy-enhanced Arabic YouTube iframe only after intent, preserves the reserved dimensions, moves focus into the player, and never duplicates or autoplays the embed.
result: pass
evidence:
  - Initial navigation produced zero YouTube-family requests; one activation created exactly one encoded youtube-nocookie.com iframe with `hl=ar` and no autoplay parameter.
  - Pointer, Enter, Space, repeated activation, stable-dimensions, and focus-transfer checks passed across both routes.

**Section 2 — Technical checks**

### 5. Preserve Markdown and restricted-MDX parity
expected: Markdown and approved MDX deliver the same complete Arabic reading journey, while update facts and references render only when valid values exist and disappear as whole units when absent.
result: pass
evidence:
  - The two-route Chromium matrix passed 26/26 cases.
  - Markdown proves present update/reference provenance; MDX proves clean optional absence without empty labels, wrappers, separators, or reserved gaps.
  - Native validation rejects malformed or unsafe references and restricted-MDX capabilities.

### 6. Reflow, zoom, bidi, and diacritics remain readable
expected: At the supported phone, tablet, and desktop widths and at native browser 200% zoom, Arabic text, mixed-direction values, punctuation, digits, URLs, video IDs, and diacritics remain readable without clipping, overlap, or horizontal overflow.
result: pass
evidence:
  - Automated reflow checks passed at 320, 390, 768, 1024, and 1440 CSS pixels for both routes.
  - Genuine Chrome 200% zoom, bidi, and diacritic evidence passed in the final Hercules report under `.artifacts/hercules-visual-qa/phase-02-plan-04-final/20260826-211123-phase-02-plan-04-final-127.0.0.1-4321/`.

### 7. Accessibility, keyboard, privacy, and degraded states hold
expected: Arabic document semantics and accessible names remain correct; controls meet target and focus requirements; keyboard users can enter and leave the cross-origin player; no remote media request occurs before explicit intent; local failures preserve the primary journey.
result: pass
evidence:
  - Accessibility-tree order, axe scope, native Enter/Space behavior, 44px controls, visible 3px focus, and live Tab/Shift+Tab escape passed.
  - The Phase 2 UI review scored 24/24, the code review is clean, and security verification closed 11/11 threats with zero open.

### 8. Publish only validated public article routes
expected: Production output contains the two validated public Arabic article routes, excludes the draft route, and rejects future public update claims while retaining draft scheduling flexibility.
result: pass
evidence:
  - The exact-runtime build emitted exactly two static public pages and no draft page.
  - The 69-case native suite covers content fields, registries, dates, slugs, route collisions, drafts, references, YouTube IDs, MDX policy, and the future-public-update guard.

**Section 3 — Coverage check**

### 9. User-story outcome is delivered
expected: An Arabic reader can learn from a complete accessible article and reach its matching YouTube video even when embedded media or JavaScript is unavailable.
result: pass
evidence:
  - The complete text-first journey, permanent same-tab video action, no-JavaScript path, blocked-media path, responsive reader, and accessibility behavior are all directly exercised at the user-visible boundary.
  - `02-VALIDATION.md` maps every one of the 13 Phase 2 requirements to passing executable coverage or retained genuine-Chrome evidence.

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
