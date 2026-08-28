# Phase 6: Production Launch Verification - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-28
**Phase:** 06-production-launch-verification
**Areas discussed:** Production command and target, crawl and route discovery, performance profile and metrics, YouTube intent boundary, Arabic and responsive audit, evidence and failure policy
**Mode:** Recommendations auto-approved by the user's standing instruction

---

## Production Command and Target

**Question:** How should the operator supply the final origin and run verification?

| Option                                   | Description                                                                               | Selected |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| Reuse `SITE_ORIGIN` with one npm command | Extend the existing fail-closed origin authority and avoid another parser/config surface. | ✓        |
| Add a positional origin argument         | Add a second command-line input convention and wrapper parsing.                           |          |
| Add a configuration file                 | Persist production configuration in a new repository file.                                |          |

**Auto-approved recommendation:** Reuse `SITE_ORIGIN` and expose `npm run verify:production`.
**Why:** Phase 4 and Phase 5 already established this exact explicit, non-secret, no-`.env` origin boundary.

**Question:** Should production verification run inside the ordinary regression gate?

| Option                       | Description                                                               | Selected |
| ---------------------------- | ------------------------------------------------------------------------- | -------- |
| Keep it opt-in and isolated  | Prevent local/CI runs from contacting a real property accidentally.       | ✓        |
| Add it to `npm run verify`   | Make every full local gate require a live origin.                         |          |
| Replace local browser checks | Rely on the production site instead of deterministic regression coverage. |          |

**Auto-approved recommendation:** Keep it opt-in and isolated.
**Why:** Production access is externally controlled and cannot be a deterministic repository gate.

---

## Crawl and Route Discovery

**Question:** What should define production route membership?

| Option                                         | Description                                                                       | Selected |
| ---------------------------------------------- | --------------------------------------------------------------------------------- | -------- |
| Deployed sitemap plus independent cross-checks | Crawl the live discovery graph and verify it against route/link/draft invariants. | ✓        |
| Hand-maintained route list                     | Duplicate the content registry in test data.                                      |          |
| Representative routes only                     | Leave some public canonicals, metadata, and links unchecked.                      |          |

**Auto-approved recommendation:** Use the deployed sitemap plus independent cross-checks.
**Why:** It tests what crawlers actually receive while detecting drift rather than sharing a second list.

**Question:** Should the verifier request third-party outbound references?

| Option                                              | Description                                          | Selected |
| --------------------------------------------------- | ---------------------------------------------------- | -------- |
| Validate internal links and outbound URL shape only | Keep the result focused on site-controlled behavior. | ✓        |
| Crawl every external reference                      | Make third-party availability a site failure.        |          |
| Ignore outbound links completely                    | Miss malformed or mismatched YouTube destinations.   |          |

**Auto-approved recommendation:** Check same-origin responses and validate outbound YouTube identity without crawling third parties.
**Why:** The site controls its links, not external uptime or playback policies.

---

## Performance Profile and Metrics

**Question:** Which lab profile and aggregation should gate LCP and CLS?

| Option                                                  | Description                                                                       | Selected |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- | -------- |
| Three cold mobile-like Chromium runs with a median gate | Reproducible and less sensitive to one transient sample while retaining raw runs. | ✓        |
| One unthrottled desktop run                             | Faster but too optimistic and noisy as a release signal.                          |          |
| Add Lighthouse or `web-vitals`                          | Add dependencies for metrics already available from browser APIs.                 |          |

**Auto-approved recommendation:** Use three cold 390×844 mobile-like runs, exact CDP throttling, raw values, and median gates.
**Why:** This is a stable lab signal using the installed browser stack and matches the project's lightweight mobile risk.

**Question:** What should count as INP evidence?

| Option                     | Description                                                              | Selected |
| -------------------------- | ------------------------------------------------------------------------ | -------- |
| Qualifying field data only | Keep the metric's real meaning and report lab responsiveness separately. | ✓        |
| A scripted lab click       | Produce a number quickly but mislabel it as a field metric.              |          |
| Ignore responsiveness      | Leave the field evidence boundary undocumented.                          |          |

**Auto-approved recommendation:** Keep INP field-only.
**Why:** A short scripted page visit cannot reproduce the page-lifetime interaction distribution INP represents.

---

## YouTube Intent Boundary

**Question:** How broad should media verification be?

| Option                                                                   | Description                                                          | Selected |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------- | -------- |
| Every public article, both activation modes, and blocked-player fallback | Verify the shared contract against every real launch video identity. | ✓        |
| One representative article                                               | Reduce work but miss content-specific identity/fallback drift.       |          |
| Source inspection only                                                   | Prove implementation shape without real rendered/network behavior.   |          |

**Auto-approved recommendation:** Verify all public articles with fresh pointer, keyboard, and blocked-player passes.
**Why:** There are only three launch articles, and each carries a distinct external video identity.

**Question:** Does iframe creation prove the real video plays?

| Option                                                   | Description                                              | Selected |
| -------------------------------------------------------- | -------------------------------------------------------- | -------- |
| No — report wiring separately from availability/playback | Keep browser DOM evidence truthful.                      | ✓        |
| Yes — treat iframe creation as playback                  | Promote a local DOM fact into an external-service claim. |          |

**Auto-approved recommendation:** Never equate iframe creation with playback.
**Why:** Embedding restrictions, age gates, outages, and account policies remain external facts.

---

## Arabic and Responsive Audit

**Question:** Which surfaces should the English-leak scanner inspect?

| Option                                                        | Description                                                          | Selected |
| ------------------------------------------------------------- | -------------------------------------------------------------------- | -------- |
| Visible and accessibility-facing text on every route plus 404 | Cover what readers and assistive technology actually receive.        | ✓        |
| Visible paragraphs only                                       | Miss metadata, controls, alternatives, titles, and landmark names.   |          |
| Raw HTML ASCII scan                                           | Produce false positives from URLs, scripts, styles, and identifiers. |          |

**Auto-approved recommendation:** Scan visible copy, metadata, alternatives, titles, and accessible names with only a tiny explicit allowlist.
**Why:** This catches reader-facing leaks without masking them in machine syntax noise.

**Question:** How should 200% zoom be verified?

| Option                                          | Description                                            | Selected |
| ----------------------------------------------- | ------------------------------------------------------ | -------- |
| Keep native browser zoom as a named human check | Preserve the evidence boundary established in Phase 2. | ✓        |
| Call viewport resizing native zoom              | Automate a different condition and mislabel it.        |          |
| Drop the zoom check                             | Leave an explicit acceptance surface unverified.       |          |

**Auto-approved recommendation:** Automate 320-pixel reflow and retain native 200% zoom as human evidence when automation cannot prove it.
**Why:** CDP page scaling and viewport changes are not equivalent to browser-chrome zoom.

---

## Evidence and Failure Policy

**Question:** Where should results live?

| Option                                                 | Description                                                               | Selected |
| ------------------------------------------------------ | ------------------------------------------------------------------------- | -------- |
| Ignored raw artifacts plus a committed truthful ledger | Keep generated noise out of source while preserving status and authority. | ✓        |
| Commit browser reports and screenshots                 | Pollute planning/source history with generated output.                    |          |
| Console output only                                    | Lose raw evidence and durable blocker status.                             |          |

**Auto-approved recommendation:** Use `.artifacts/phase-06/` for raw output and `06-PRODUCTION-EVIDENCE.md` for reviewed status.
**Why:** It follows the repository's artifact isolation rule and Phase 5's evidence-separation pattern.

**Question:** What happens when the final HTTPS origin remains unavailable?

| Option                                                               | Description                                                              | Selected |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------- |
| Complete local runner proof and keep production requirements pending | Finish repository-controlled work without inventing deployment evidence. | ✓        |
| Mark the phase complete from local interception                      | Treat a fixture as the final property.                                   |          |
| Stop without creating the verifier                                   | Leave actionable repository work undone.                                 |          |

**Auto-approved recommendation:** Build and fully test the runner, then record final-origin checks as pending/human-needed.
**Why:** This maximizes safe progress while respecting the external authority boundary.

---

## the agent's Discretion

- Exact production Playwright filenames and thin wrapper structure.
- Exact XML parser/report schema within the no-dependency constraint.
- Deterministic route ordering for representative sampling.
- Controlled local interception/transport seam used only to prove runner correctness.
- Exact timeouts and retries, provided failures are explicit and never silently skipped.

## Deferred Ideas

- Scheduled monitoring and alerts.
- First-party field-vitals telemetry.
- Entity/schema markup.
- Automated provider-account inspection.
