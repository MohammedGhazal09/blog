---
phase: 03
slug: real-content-and-section-discovery
status: verified
asvs_level: 1
block_on: high
register_authored_at_plan_time: true
threats_total: 22
threats_closed: 19
threats_accepted: 3
threats_transferred: 0
threats_open: 0
unregistered_flags: 0
created: 2026-08-27
updated: 2026-08-27
---

# Phase 03 — Security

> Mitigation verification only. Implementation files were treated as read-only. A mitigation is credited only where the current code, tests, or required audit artifact contains the declared control.

## Audit Verdict

**SECURED.** All twenty-two registered threats have explicit dispositions: nineteen mitigations are verified and three residual risks are explicitly accepted. T-03-11's final-run evidence gap is narrowly accepted because Phase 3 has five-width automation, CDP-emulated page scale 2 without overflow, and retained Phase 2 genuine Chrome 200% evidence on the same article/layout foundation. Native browser-chrome zoom was unavailable in the final Phase 3 backend and remains unclaimed. This is not an accessibility waiver: Phase 6 must perform a native 200% production smoke check and reopen T-03-11 if revalidation fails.

The historical review-sidecar design is intentionally superseded. This audit does **not** claim reviewer identity, reviewer consent, approval, transcript verification, religious accuracy, live YouTube playback, or human specialist review. For the affected threats, the current controls are removal of the sidecar/reviewer attack surface, visible AI-assistance/no-transcript disclosure, and executable rejection of review traces in production output.

## Register Provenance

- T-03-01 through T-03-12 and T-03-16 come from the plan-time STRIDE tables in Plans 03-01 through 03-03.
- T-03-13 through T-03-15 come from the original plan-time Plan 03-04 register at authored commit `311f17c`; the current Plan 03-04 replaced that checkpoint with the owner-authorized truthful publication contract.
- T-03-SC is the shared package-supply-chain accepted risk.
- `TB-03-04-01` through `TB-03-04-05` are audit-only identifiers for the five currently declared, unnumbered Plan 03-04 truth-boundary threats. These identifiers add no new requirement.

## Trust Boundaries

| Boundary | Data crossing | Current control |
| --- | --- | --- |
| Markdown/MDX sources → validated public collection | Reader-facing article data, routes, references, YouTube IDs | Strict schema/content validation, unique route assertion, explicit draft selection, and launch section coverage |
| Draft development proof → production output | Phase 2 proof titles, routes, references, demonstration video ID | Draft-only sources, explicit development selector, distinct browser projects/ports, production 404/output scans |
| Prior review model → public output | Reviewer identity, consent, approval fields and claims | Sidecar module/directory deleted; public output and DOM tests reject review traces |
| Registry/content facts → HTML | Dynamic Arabic titles, descriptions, author/section facts, links | Validated data, Astro escaped interpolation, canonical path helpers, restricted MDX policy |
| Local site → YouTube | Video ID, permanent outbound action, click-created no-cookie iframe | Validated 11-character IDs, encoded URLs, user-intent gate, permanent fallback link; live service remains external |
| Automated assertions → visual/accessibility claim | Viewport, focus, RTL, reflow, console/network evidence | Five-width Playwright suite and persisted QA ledger; native 200% zoom evidence remains missing |

## Threat Verification

| Threat ID | Category | Disposition | Verified mitigation and evidence | Status |
| --- | --- | --- | --- | --- |
| T-03-01 | Tampering | mitigate | The superseded digest/sidecar surface is absent (`src/lib/approval-contract.ts` and `src/content/reviews/` do not exist). Public loading now uses validated collection data, route uniqueness, draft selection, and coverage in `src/lib/articles.ts:10-21`; all public articles disclose AI assistance/no transcript at `src/content/articles/usul-al-radd-ala-al-shubuhat.md:22`, `adaab-al-khilaf-al-aam.md:20`, and `madkhal-ilm-al-imla.md:20`. No SHA-256 or human-approval claim is credited. | closed |
| T-03-02 | Tampering / Repudiation | mitigate | Sidecar JSON, reviewer dates, and review decisions were removed rather than fabricated. Runtime source has no review import; `tests/discovery.spec.ts:392-416` rejects former sidecar fields and approval phrases from `dist` and every public route. | closed |
| T-03-03 | Elevation of privilege | mitigate | There is no public “approved” privilege to bypass after supersession. `getValidatedArticles()` asserts unique routes and `getPublicArticles()` selects only explicit `draft:false` entries (`src/lib/articles.ts:10-21`; `src/lib/content-contract.ts:314-352`); production tests reject review/approval claims (`tests/discovery.spec.ts:392-416`). | closed |
| T-03-04 | Information integrity | mitigate | Both proof sources are `draft: true` (`contract-markdown.md:10`, `contract-mdx.mdx:9`). Production and development use separate selectors (`src/pages/[section]/[slug].astro:11-15`), projects, ports, matches, and readiness URLs (`playwright.config.ts:18-51`). Production tests require proof 404s and reject proof traces (`tests/discovery.spec.ts:392-416`; `tests/article-journey.spec.ts:929-939`). | closed |
| T-03-05 | Spoofing | mitigate | Launch status has its own command (`package.json:19`), central registry coverage (`src/lib/content-contract.ts:333-352`), mode-only invocation (`src/lib/articles.ts:16-21`), negative missing-section tests and a successful complete-corpus CLI assertion (`tests/content-contract.test.ts:425-495`). | closed |
| T-03-06 | Information disclosure | mitigate | Reviewer/sidecar implementation and directory are absent. Public-output/DOM negative scans exist at `tests/discovery.spec.ts:392-416`, browser artifacts are routed under `.artifacts/` (`playwright.config.ts:5-10`) and ignored (`.gitignore:4`). | closed |
| T-03-07 | Spoofing / Repudiation | transfer → accept (owner supersession) | Automation does not certify identity, substance, religious accuracy, reference adequacy, or semantic video equivalence. The owner-authorized Plan 03-04 contract accepts publication with cautious cited prose and visible AI/no-transcript disclosure; `03-VALIDATION.md` and `03-UAT.md` explicitly record that specialist review was not performed. See AR-03-01. | accepted |
| T-03-08 | Spoofing | mitigate | Section routes come from the registry, article links use `articlePath`, and author/section facts use fixed or registry-derived normal anchors (`src/pages/index.astro:19-25`, `src/pages/[section]/index.astro:35-47`, `src/pages/[section]/[slug].astro:39-47`). Browser tests follow registry, article, author, and home links and require HTTP 200 (`tests/discovery.spec.ts:271-292`, `296-362`, `420-452`, `454-499`). | closed |
| T-03-09 | Tampering / XSS | mitigate | Frontmatter is strict-schema validated and passed through `validateArticleData` (`src/content.config.ts:9-39`); URLs must be credential-free absolute HTTPS (`src/lib/content-contract.ts:244-275`); Astro templates use normal escaped interpolation; MDX preflight rejects ESM, expressions, raw HTML, unapproved elements/attributes, and unsafe protocols (`src/lib/mdx-policy.ts:34-87`, called by `astro.config.mjs:3-5`). | closed |
| T-03-10 | Information integrity | mitigate | The author page renders only the registered name, locked generic purpose, and home link (`src/pages/عن-أحمد-المنجاوي.astro:5-18`). The browser test rejects biography, expertise, affiliation, credentials, social/channel, and reviewer claims (`tests/discovery.spec.ts:369-389`). | closed |
| T-03-11 | Denial of service / accessibility | mitigate → accept (evidence-gap residual) | Logical fluid CSS, wrapping, `70ch`, one breakpoint, keyboard/axe checks, and five locked viewport widths are implemented (`src/layouts/SiteLayout.astro:34-106`; `tests/discovery.spec.ts:502-575`, `669-691`). Phase 3 also captured CDP-emulated page scale 2 without overflow and retains Phase 2 genuine Chrome 200% evidence on the same article/layout foundation. The final Phase 3 report accurately states that native browser-chrome zoom was unavailable and is not claimed. Acceptance is limited to this evidence gap; Phase 6 native 200% production revalidation is mandatory. See AR-03-03. | accepted |
| T-03-12 | Repudiation | mitigate | Persisted QA evidence includes target identity, backend, branch/commit, redaction boundary, findings-first report, screenshot paths, and a ledger with every discovered item classified. Evidence: `.artifacts/hercules-visual-qa/phase-03-final/20260827-201453-phase-03-final-127.0.0.1-4323/REPORT.md`, `coverage-ledger.md`, and `metadata.json`. No product defect existed, so before/after evidence was not applicable. | closed |
| T-03-13 | Information disclosure / Repudiation | mitigate | The current control removes the need to store reviewer identity or consent: no approval module or review directory exists, runtime searches find no review field, and production tests reject reviewer/approval traces (`tests/discovery.spec.ts:392-416`). This audit makes no consent claim. | closed |
| T-03-14 | Information integrity | mitigate | Phase 2 proofs remain distinct draft-only records and cannot satisfy public selection (`contract-markdown.md:10`, `contract-mdx.mdx:9`; `src/lib/content-contract.ts:327-331`). Production tests require both proof routes to be 404 and reject their titles, `example.com`, and `dQw4w9WgXcQ` (`tests/discovery.spec.ts:392-409`). | closed |
| T-03-15 | Elevation of privilege | mitigate | The runnable gate remains `npm test && npm run check && npm run test:browser` and browser testing performs a fresh build (`package.json:16-21`). `03-UAT.md` records 9/9 user/technical outcomes, while the final QA report and ledger account for tested, blocked, and out-of-scope states rather than silently passing them. | closed |
| T-03-16 | Information integrity | mitigate | The superseded sidecar portion was deleted, but independence from the shared public selector is retained: `expectedPublicCorpus()` reads raw article frontmatter (`tests/discovery.spec.ts:45-153`) and is compared separately with generated routes and rendered index links, followed by route-to-index equality (`tests/discovery.spec.ts:296-324`). | closed |
| T-03-SC | Tampering | accept | Dependencies remain exact-pinned in `package.json:24-36`; the Phase 03 diff changed scripts only and did not change `package-lock.json`. No new package/runtime service was introduced. See AR-03-02. | accepted |
| TB-03-04-01 | Information integrity / Repudiation | mitigate | Every public article contains the same visible Arabic AI-assistance/no-transcript disclosure (article lines cited under T-03-01), and `tests/discovery.spec.ts:420-452` requires it on every independently derived public route. | closed |
| TB-03-04-02 | Spoofing / Repudiation | mitigate | Fake reviewer/consent creation is prevented by deletion of the old layer and executable rejection of review traces (`tests/discovery.spec.ts:392-416`). No reviewer identity, consent, or approval is claimed. | closed |
| TB-03-04-03 | Information integrity | mitigate | Each public source binds one explicit YouTube ID to a topic-matching Arabic title/summary and reference label (`usul-al-radd-ala-al-shubuhat.md:2-17`, `adaab-al-khilaf-al-aam.md:2-15`, `madkhal-ilm-al-imla.md:2-15`); `tests/discovery.spec.ts:420-452` verifies the exact permanent YouTube URL. This closes the local identity/link control only; live playback is transferred as XR-03-01. | closed |
| TB-03-04-04 | Information integrity | mitigate | Proof sources are draft-only, public selection excludes drafts, and production 404/output scans reject both proof identities and demonstration values (same evidence as T-03-04/T-03-14). | closed |
| TB-03-04-05 | Information integrity | mitigate | The three articles use cautious prose, dependent-claim HTTPS citations, and no unsupported profile claims (`src/content/articles/*.md`; URL validation at `src/lib/content-contract.ts:244-275`; author omission test at `tests/discovery.spec.ts:369-389`). Residual specialist editorial/religious judgment is not claimed and is accepted as AR-03-01. | closed |

## Open Threats

None. T-03-11's final-backend native-zoom evidence gap is explicitly accepted as AR-03-03 with mandatory Phase 6 production revalidation; the underlying accessibility controls remain enforced.

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale and boundary | Accepted by | Date |
| --- | --- | --- | --- | --- |
| AR-03-01 | T-03-07; TB-03-04-05 | Qualified human editorial/religious review was not performed. The site discloses AI assistance and non-transcript status, cites sources, and makes no review, approval, or religious-accuracy claim. Specialist review remains recommended before external deployment. | Project owner, through the explicit Plan 03-04 owner override | 2026-08-27 |
| AR-03-02 | T-03-SC | Existing exact-pinned Astro/MDX/Playwright/axe dependencies remain in use; Phase 03 added no package. Residual upstream package risk is accepted for this phase. | Phase 03 plan | 2026-08-27 |
| AR-03-03 | T-03-11 | Acceptance is limited to the final Phase 3 backend's inability to capture native browser-chrome 200% zoom. Five-width automation, CDP-emulated scale 2 without overflow, and retained Phase 2 genuine Chrome 200% evidence cover the same article/layout foundation. This does not waive accessibility. **Revalidation trigger:** Phase 6 must run and record a native 200% zoom production smoke check; any clipping, concealment, two-dimensional scrolling, or unusable Arabic reflow reopens T-03-11 and blocks launch. | Project owner | 2026-08-27 |

## Transferred Risks Log

| Risk ID | Threat Ref | Transferred boundary | Evidence and follow-up |
| --- | --- | --- | --- |
| XR-03-01 | TB-03-04-03 | Live `youtube-nocookie.com` playback and third-party availability remain YouTube/external-network responsibilities. | Local code constructs the encoded no-cookie iframe only after intent and preserves a permanent YouTube link (`src/components/YouTubePlayer.astro:5-54`). The final QA report records aborted remote requests and explicitly does not claim playback. Run a deployed smoke test without immediate navigation. |

## Unregistered Flags

None. The four supplied summaries contain no `## Threat Flags` section and introduce no unmapped threat flag for this audit.

## Security Audit Trail

| Audit date | Threats total | Closed | Accepted | Open | Run by |
| --- | ---: | ---: | ---: | ---: | --- |
| 2026-08-27 | 22 | 19 | 3 | 0 | Codex security auditor |

## Sign-Off

- [x] All 22 requested threats are classified.
- [x] Accepted and transferred residual risks are documented without overstating evidence.
- [x] Implementation files were not modified.
- [x] `threats_open: 0` confirmed.
- [x] `status: verified` set in frontmatter.

**Approval:** verified 2026-08-27. Phase 3 security gate is closed. Phase 6 must execute the AR-03-03 native 200% production revalidation trigger; failure reopens T-03-11 and blocks launch.
