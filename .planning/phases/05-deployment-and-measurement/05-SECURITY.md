---
phase: 05
slug: deployment-and-measurement
status: verified
threats_open: 0
threats_total: 8
asvs_level: 1
block_on: high
created: 2026-08-28
verified: 2026-08-28
register_authored_at_plan_time: true
---

# Phase 05 — Security

> Verification of the Phase 5 plan-time STRIDE register against the implemented launch, measurement, evidence, and rollback paths.

## Trust Boundaries

| Boundary | Description | Data crossing |
| --- | --- | --- |
| Provider build values → launch wrapper | Public but untrusted launch values enter the static build. | Final site origin and public Plausible script URL; no secret is required. |
| Launch wrapper → Astro shared head | Validated values and the exact build mode control canonical identity and analytics inclusion. | Normalized origin, validated script URL, `launch-readiness` mode. |
| Browser → Plausible | A third-party loader may observe aggregate pageviews and outbound-link clicks. | Page URL and outbound destination; no project reader profile or identifier. |
| Native YouTube action → external navigation | Measurement may observe but must not own, delay, duplicate, or relabel navigation. | Public YouTube destination URL. |
| Repository/runbook → owner control planes | Instructions cross into Cloudflare, DNS, Plausible, and Search Console. | Public configuration and owner-controlled service evidence. |
| Local evidence → launch ledger | Controlled proof must not be promoted into a live-service claim. | Test results, dates, artifact references, explicit external status. |

## Threat Register

| Threat ID | Category | Component | Disposition | Verified mitigation and evidence | Status |
| --- | --- | --- | --- | --- | --- |
| T-05-01 | Spoofing / Tampering | `productionSiteOrigin`, `plausibleScriptSource`, launch wrapper, Search Console runbook | mitigate | `src/lib/site-origin.ts:16-44` rejects unsafe origins; `src/lib/measurement.ts:1-23` accepts only an exact clean official asset URL; `scripts/launch-ready.mjs:6-11` validates before build. README lines 150-158 and 194-199 require the exact owner-controlled HTTPS origin and keep service proof pending. | closed |
| T-05-02 | Information Disclosure | Runtime source, tests, README, evidence ledger, `dist/` | mitigate | Only `pa-FAKE_TEST_FIXTURE_DO_NOT_DEPLOY.js` is committed. `tests/content-contract.test.ts:189-249` scans deployable source/output while excluding environment-file reads. An independent explicit-path scan found no credential pattern, verification tag, real Plausible value, GA/GTM, reader storage, replay, or fingerprinting. | closed |
| T-05-03 | Tampering | Owner-supplied Plausible loader | mitigate | `src/lib/measurement.ts:8-20` enforces HTTPS, exact authority, no credentials/port/query/fragment, exact normalization, and the `pa-*.js` path. `src/layouts/SiteLayout.astro:24-60` emits one deferred loader only in launch mode. Negative validator cases and controlled failure behavior pass. | closed |
| T-05-04 | Repudiation / Integrity | Shared head, outbound anchor, metric documentation | mitigate | `tests/deployment-measurement.test.ts:121-182` proves one direct `Outbound Link: Click` attempt with matching `url` and zero player attempts. `tests/content-contract.test.ts:743-841` proves one loader per document, identical bodies, and no project listener/custom call. README lines 184-192 labels the metric only as a direct-link click. | closed |
| T-05-05 | Tampering / Integrity | Ordinary output and Cloudflare build controls | mitigate | `src/layouts/SiteLayout.astro:24-28` uses the exact `launch-readiness` gate. `tests/content-contract.test.ts:787-915` proves ambient ordinary omission, controlled inclusion, and final ordinary restoration. README lines 134-168 locks `main`, preview `None`, pinned runtime, `SKIP_DEPENDENCY_INSTALL=1`, the exact command, and `dist`. | closed |
| T-05-06 | Denial of Service | Analytics network failure | mitigate | The external loader is deferred. `src/components/YouTubePlayer.astro` remains analytics-free and retains a native permanent anchor. `tests/deployment-measurement.test.ts:184-236` aborts the loader, then verifies Arabic/RTL content, player activation, focus, and direct navigation remain usable with no retry or project error UI. | closed |
| T-05-07 | Repudiation | `05-LAUNCH-EVIDENCE.md` | mitigate | The ledger has 14 authority-separated gates, three dated local `PASS` rows, and eleven external `PENDING` rows. `tests/content-contract.test.ts:46-187` enforces statuses, required cells, dated passes, and real-service evidence for any external pass; a fabricated status-only promotion fails. | closed |
| T-05-SC | Tampering | npm runtime and dependency graph | mitigate | `package.json:6-20` pins npm/runtime behavior and uses `npm ci` in the documented release path. `package-lock.json` is unchanged from pre-Phase-5 commit `43743d6`; the only package manifest change adds the serialized measurement test and no dependency. | closed |

## Accepted Risks Log

No accepted risks. Every plan-time threat uses a verified mitigation disposition.

## External Authority Boundary

Cloudflare project identity, the final domain/DNS/TLS state, the live Plausible property and dashboard, and the Search Console property remain owner-controlled `PENDING` evidence. Keeping those facts pending is part of the verified integrity control; it is not an accepted security risk or a local mitigation gap. No fixture, controlled hostname, localhost response, intercepted request, source inspection, or generated screenshot is treated as live-service proof.

## Verification Performed

- Deep code review of seven Phase 5 source, test, manifest, and runbook files; one portability warning fixed and re-reviewed clean.
- Pinned `npm test`: `133/133` passed after the fix.
- Explicit deployable-source and ordinary-`dist/` credential/tracker scan: clean.
- Real Plausible asset-value scan excluding the unmistakable fake fixture: clean.
- `package-lock.json` drift check against `43743d6`: unchanged.
- Browser-artifact containment check: `.artifacts/` ignored and no artifact tracked.
- Phase 5 headed visual/failure evidence: `45/45` screenshot pairs and structural states identical; zero serious/critical Axe findings.

## Summary Threat Flags

Neither Phase 5 summary records an unmapped `Threat Flags` entry. The visual QA harness corrections and code-review portability fix stay within the existing integrity and verification threats; no new production attack surface was introduced.

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
| --- | ---: | ---: | ---: | --- |
| 2026-08-28 | 8 | 8 | 0 | Codex acting inline as gsd-security-auditor |

## Sign-Off

- [x] All threats have a `mitigate` disposition.
- [x] Every mitigation is verified in implementation, tests, or the authority-bounded operating record.
- [x] No accepted risk or unregistered summary flag remains.
- [x] `threats_open: 0` confirmed.
- [x] `status: verified` set in frontmatter.

**Approval:** verified 2026-08-28
