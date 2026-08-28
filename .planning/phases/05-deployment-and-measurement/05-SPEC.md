# Phase 5: Deployment and Measurement — Specification

**Created:** 2026-08-28
**Ambiguity score:** 0.08 (gate: ≤ 0.20)
**Requirements:** 6 locked

## Goal

Produce a reproducible Cloudflare Pages launch build and prove, with real service evidence where external ownership is required, that the canonical Arabic site can report aggregate page traffic and one automatic outbound-link event for each direct YouTube action without identifying individual readers.

## Background

The repository already produces deterministic static output, validates an explicit HTTPS `SITE_ORIGIN`, emits canonical metadata plus matching sitemap/robots files, and keeps every permanent YouTube action as a static same-tab link. It does not yet include analytics, a provider-specific operating runbook, production deployment evidence, Search Console evidence, or a definition of the exact outbound metric. The controlled hostname used in Phase 4 is test data only and is not proof of ownership or deployment.

## Requirements

1. **Reproducible static deployment**: The documented production deployment uses Cloudflare Pages, the pinned Node/npm toolchain, committed lockfile, and the explicit launch-readiness build rather than a request-time server.
   - Current: `npm run launch:ready` can build against a validated HTTPS origin, but no deployment contract or provider evidence exists.
   - Target: One owner runbook defines the production branch, install/build commands, output directory, runtime version, explicit `SITE_ORIGIN`, failure behavior, and rollback/redeploy checks for Cloudflare Pages.
   - Acceptance: A clean local simulation of the documented install/check/launch sequence produces `dist/` with the supplied safe origin, and the runbook contains no secret, credential, assumed domain, or environment-file instruction.

2. **Truthful canonical property evidence**: Completion of SEO-06 requires a real reachable HTTPS production property whose effective origin matches every canonical/discovery URL, plus actual Google Search Console property verification and canonical sitemap submission.
   - Current: Controlled launch output proves origin consistency locally; no live property, DNS/TLS, Search Console ownership, or sitemap-submission evidence exists.
   - Target: An evidence record names the final owned origin, production deployment, successful reachability checks, verified Search Console property, submitted sitemap URL, and observed service statuses.
   - Acceptance: The evidence is marked PASS only from owner-controlled live-service proof; without that proof it remains explicitly pending/blocked and no production, ownership, submission, or indexing claim is made.

3. **Aggregate privacy-conscious traffic measurement**: Production pages load Plausible Cloud once per document for aggregate pageview measurement without adding session replay, fingerprinting, cookies, advertising tags, a tag manager, or per-reader profiles.
   - Current: No analytics markup, dependency, account configuration, or traffic evidence exists.
   - Target: Launch-readiness output includes the current owner-generated Plausible `https://plausible.io/js/pa-….js` asset supplied explicitly as the public `PLAUSIBLE_SCRIPT_SRC` build value, while ordinary development and deterministic local builds contain no analytics script or remote analytics request.
   - Acceptance: Static-output tests prove exact script count, current vendor URL validation, launch-only inclusion, and local-build omission; real aggregate pageview evidence is recorded only after the owner supplies the generated asset for the canonical Plausible property.

4. **Exact outbound YouTube metric**: The measurement definition is Plausible's automatic outbound-link click event filtered to direct `youtube.com`/`youtu.be` destinations; it is reported as a link click, never as a play, view, watch-time, or iframe interaction.
   - Current: Every article has a permanent direct YouTube anchor, but no analytics script or metric definition exists.
   - Target: The maintained outbound-link build activates automatic outbound tracking without custom per-link JavaScript, duplicate listeners, or changes to the reader-facing action.
   - Acceptance: Controlled browser verification observes one analytics event attempt for one direct-link action and no duplicate attempt; the operating runbook states the exact event/filter and prohibits interpreting it as a video view.

5. **Credential-free repository boundary**: Hosting, analytics, and Search Console credentials remain outside the repository and browser output.
   - Current: The repository has no service credentials or environment files.
   - Target: Production configuration accepts the public `SITE_ORIGIN` plus the non-secret owner-generated `PLAUSIBLE_SCRIPT_SRC`; provider authentication, Search Console verification, the Plausible property, and the dashboard tracking toggle remain owner-controlled console operations.
   - Acceptance: Source, built output, history diff, and dependency audit contain no token, secret, verification credential, real production `pa-…` value, environment file, or secret-loading mechanism; a clearly labelled fake `pa-…` test fixture may exercise validation without claiming an account.

6. **Evidence-separated launch status**: Local readiness, provider deployment, Search Console, and analytics results are recorded as separate pass/fail/pending facts so local success cannot be mistaken for production completion.
   - Current: Phase 4 reports clearly distinguish controlled output from a real launch, but no Phase 5 operating/evidence record exists.
   - Target: One Phase 5 launch record lists each local and external gate, the command or service surface checked, dated evidence, and the remaining authority owner.
   - Acceptance: Every gate has an unambiguous status and evidence source; externally dependent rows cannot pass from fixtures, screenshots of local output, or controlled test hostnames.

## Boundaries

**In scope:**
- A Cloudflare Pages static-deployment runbook for the pinned build contract.
- Production-only Plausible aggregate pageview and automatic outbound-link markup.
- Automated local verification of analytics presence, configuration, de-duplication, and ordinary-build absence.
- An exact definition of the outbound YouTube click metric.
- A launch evidence record that keeps local readiness separate from provider, Search Console, and Plausible account proof.
- Real production/Search Console/analytics evidence if the owner-controlled services are available during the phase.

**Out of scope:**
- Inventing or purchasing a domain, changing DNS, accepting provider terms, or creating owner accounts — those require owner authority.
- Claiming deployment, TLS, Search Console verification/submission, indexing, analytics configuration, or traffic without direct service evidence — fabricated operational success is forbidden.
- Custom analytics collection, a first-party event endpoint, tag manager, GA4, session replay, fingerprinting, cookies, or user identity — aggregate Plausible measurement is sufficient.
- Iframe play, watch-time, completion, or YouTube API measurement — the required metric is the permanent outbound-link action only.
- Production crawl certification and Core Web Vitals certification — Phase 6 owns those checks after a live origin exists.
- Reader-facing redesign, consent banner, dashboard, or analytics controls — no such interface is required for the selected cookie-free aggregate service.

## Constraints

- Preserve Astro static output and the zero-framework architecture; no server adapter, database, runtime API, or analytics npm package may be added.
- Use Node `24.19.0`, npm `11.17.0`, `npm ci`, the committed lockfile, and `dist/` as the portable output.
- Never read or create `.env` files. The public production origin is supplied explicitly to the launch process.
- Ordinary local builds must remain deterministic at `http://127.0.0.1:4322` and must not load analytics.
- Launch builds must fail closed for a missing/unsafe origin or a missing/unsafe current Plausible asset URL. The script URL is an explicit public build value, not a second canonical origin or a credential.
- All reader-facing output remains Arabic/RTL; analytics and deployment additions must create no visible English UI.
- Browser-test artifacts remain only under ignored `.artifacts/` paths.

## Acceptance Criteria

- [ ] A clean pinned-runtime deployment simulation runs checks and creates static `dist/` output through the explicit launch-readiness path.
- [ ] The deployment runbook names Cloudflare Pages settings, rollback/redeploy checks, external ownership steps, and the no-environment-file boundary without embedding a domain or credential.
- [ ] Controlled launch output contains exactly one current site-specific Plausible `pa-….js` script per rendered document, sourced from a validated public fixture while the real owner-generated value remains uncommitted.
- [ ] Ordinary development/local production output contains no Plausible markup or analytics network request.
- [ ] One direct YouTube link action produces one outbound-link event attempt, with no duplicate listener/event and no claim that the click is a video view.
- [ ] Repository and built-output scans find no analytics/hosting/Search Console secret, environment file, session replay, fingerprinting, tag manager, or per-reader identifier.
- [ ] Phase evidence reports local readiness independently from live deployment, Search Console, and Plausible account status.
- [ ] SEO-06, live MEAS-01 evidence, and live MEAS-02 evidence pass only if real owner-controlled service proof is available; otherwise each remains explicitly pending/blocked.

## Ambiguity Report

| Dimension | Score | Min | Status | Notes |
|-----------|-------|-----|--------|-------|
| Goal Clarity | 0.93 | 0.75 | ✓ | Local deliverables and externally evidenced outcomes are separated. |
| Boundary Clarity | 0.96 | 0.70 | ✓ | No domain/account invention, custom analytics, or Phase 6 certification. |
| Constraint Clarity | 0.91 | 0.65 | ✓ | Static Astro, pinned runtime, explicit origin, no env files, and no reader UI are locked. |
| Acceptance Criteria | 0.90 | 0.70 | ✓ | Eight pass/fail gates distinguish controlled output from live services. |
| **Ambiguity** | **0.08** | **≤0.20** | **✓** | Weighted clarity passes the spec gate. |

## Interview Log

| Round | Perspective | Question summary | Decision locked |
|-------|-------------|------------------|-----------------|
| 1 | Researcher | What deployment and measurement foundations already exist? | Reuse the Phase 4 explicit-origin launch build, static direct links, and crawler identity; no second origin or event system. |
| 2 | Simplifier | What is the smallest complete production measurement path? | Cloudflare Pages plus one production-only Plausible outbound-link script; no adapter, package, dashboard, or custom event code. |
| 3 | Boundary Keeper | What may local work claim without owner service access? | Only readiness; live deployment, domain, Search Console, and analytics evidence require real owner-controlled proof. |
| 4 | Failure Analyst | Which false-green outcomes must be rejected? | Controlled hostnames cannot prove ownership/deployment; page clicks cannot be called video views; local build success cannot pass external gates. |
| 5 | Seed Closer | How is analytics identity selected? | Use the current owner-generated public `pa-….js` asset URL only in launch-readiness mode; ordinary builds remain analytics-free and the canonical origin remains `Astro.site`. |

---

*Phase: 05-deployment-and-measurement*
*Spec created: 2026-08-28*
*Next step: $gsd-discuss-phase 5 — implementation decisions (how to build what is specified above)*
