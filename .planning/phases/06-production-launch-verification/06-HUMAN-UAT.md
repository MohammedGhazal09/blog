---
status: partial
phase: 06-production-launch-verification
source:
  - 06-VERIFICATION.md
  - 06-PRODUCTION-EVIDENCE.md
started: 2026-08-28T13:50:35Z
updated: 2026-08-28T13:50:35Z
---

## Current Test

[awaiting owner-controlled launch and provider evidence]

## Tests

### 1. Exact final public HTTPS origin

expected: The owner confirms one exact lowercase, port-free, path-free public HTTPS origin as the canonical production property, and that origin serves the intended deployment.
result: blocked
blocked_by: third-party
reason: Requires the owner's domain and deployment control planes; the repository must not guess the production origin.

### 2. Final-origin production crawl

expected: A network report from the approved origin confirms direct successful public routes, matching self-canonicals, unique Arabic metadata, correct Arabic and RTL identity, working internal links, correct robots and sitemap output, excluded drafts, and the intentional Arabic 404.
result: blocked
blocked_by: release-build
reason: Requires the approved live origin and a reviewer-inspected final-origin report.

### 3. Production LCP, CLS, and media behavior

expected: All five discovered route roles provide three cold production samples with median LCP at or below 2500 ms and median CLS at or below 0.1; every article preserves zero pre-intent media activity, stable geometry, exact trusted activation identity, and a usable direct link without treating iframe creation as playback.
result: blocked
blocked_by: release-build
reason: Controlled fixtures verify the runner but cannot establish the live origin's timing, network, geometry, or media behavior.

### 4. Native browser 200% zoom

expected: Representative production pages preserve text, controls, visible focus, and one-dimensional reflow at real browser 200% zoom without clipping, overlap, content loss, or horizontal scrolling.
result: blocked
blocked_by: release-build
reason: Requires the approved live origin and a human-controlled native browser zoom session; viewport emulation is not equivalent evidence.

### 5. Field INP and Core Web Vitals

expected: Dated CrUX or Search Console field INP and 75th-percentile Core Web Vitals are recorded when eligible data exists; otherwise the evidence row remains PENDING.
result: blocked
blocked_by: third-party
reason: Requires real-user field data from an eligible public origin; laboratory interactions cannot prove field INP.

### 6. Cloudflare deployment, DNS, and TLS

expected: The intended Pages production deployment is active, the owned domain is correctly bound, DNS resolves as intended, and the live TLS certificate is valid.
result: blocked
blocked_by: third-party
reason: Requires owner-controlled Cloudflare and domain access plus a real production response.

### 7. Search Console ownership and sitemap submission

expected: The exact final HTTPS URL-prefix property is verified and its absolute `/sitemap-index.xml` URL has a dated submission or read status, without describing submission as proof of indexing.
result: blocked
blocked_by: third-party
reason: Requires owner-controlled Google Search Console access and the final public origin.

### 8. Plausible pageviews and outbound YouTube reporting

expected: The final Plausible property shows aggregate production pageviews and one real `Outbound Link: Click` with the permanent YouTube destination in `url`, while player activation is not counted as that event or described as a video view.
result: blocked
blocked_by: third-party
reason: Requires the owner's Plausible property, real production traffic, and dashboard inspection.

### 9. QUAL-05 closure decision

expected: QUAL-05 is promoted only after the exact-origin performance and media evidence, native zoom result, and field-data state are reviewed; otherwise it remains PENDING.
result: blocked
blocked_by: prior-phase
reason: Its qualifying production, native-browser, and field evidence is still unavailable; controlled results have no authority to close it.

### 10. QUAL-06 closure decision

expected: QUAL-06 is promoted only after the final-origin crawl and rendered Arabic, RTL, accessibility, and reflow evidence are reviewed; otherwise it remains PENDING.
result: blocked
blocked_by: prior-phase
reason: Its qualifying final-origin report is still unavailable; controlled results have no authority to close it.

## Summary

total: 10
passed: 0
issues: 0
pending: 0
skipped: 0
blocked: 10

## Gaps

[none — these are external authority gates, not diagnosed repository defects]

## Evidence Rules

- Update a result only after inspecting direct owner-controlled, final-origin, native-browser, field, or provider evidence appropriate to that test.
- Never promote localhost, a controlled fixture, browser interception, source inspection, a lab click, iframe creation, or an unverified screenshot into production proof.
- Do not store credentials, DNS secrets, provider verification tokens, the private Plausible asset value, or account identifiers in this file or elsewhere in the repository.
- Keep `QUAL-05` and `QUAL-06` PENDING until their exact evidence rows are complete; do not mark Phase 6 complete while this UAT remains partial.
