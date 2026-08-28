# Phase 5: Deployment and Measurement - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-28
**Phase:** 05-deployment-and-measurement
**Areas discussed:** Static deployment contract, production-only analytics loading, outbound YouTube metric semantics, external evidence and ownership boundary, verification and failure handling

---

## Static deployment contract

| Option | Description | Selected |
|--------|-------------|----------|
| Cloudflare Pages static hosting | Reuse portable `dist/`, pinned runtime, and explicit launch build through the provider dashboard. | ✓ |
| Provider-neutral runbook | Avoid naming a host but leave deployment settings underspecified. | |
| Runtime adapter | Add an Astro server/edge runtime despite no request-time capability. | |

**User's choice:** Recommended option approved through the user's instruction to make routine decisions autonomously.
**Notes:** Cloudflare Pages was already the researched stack recommendation; no runtime adapter or provider SDK is justified.

---

## Production-only analytics loading

| Option | Description | Selected |
|--------|-------------|----------|
| Direct Plausible launch-only script | One official script in controlled production output, configured from the validated site hostname. | ✓ |
| Analytics in every build | Simplifies markup but creates local remote requests and pollutes deterministic verification. | |
| Analytics npm wrapper | Adds dependency and abstraction without adding required behavior. | |

**User's choice:** Recommended option approved through the user's instruction to make routine decisions autonomously.
**Notes:** Ordinary local output remains analytics-free; the shared layout is the single integration point.

---

## Outbound YouTube metric semantics

| Option | Description | Selected |
|--------|-------------|----------|
| Automatic outbound-link click | Measure the permanent direct anchor using Plausible's maintained outbound-link feature. | ✓ |
| Custom project event | Add link-specific JavaScript and a duplicate maintenance surface. | |
| Iframe/play tracking | Treat inline playback as engagement, exceeding the requirement and creating false view claims. | |

**User's choice:** Recommended option approved through the user's instruction to make routine decisions autonomously.
**Notes:** One link action is reported as a click only; it is never called a video view.

---

## External evidence and ownership boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Evidence-separated pending status | Complete local work and keep live provider/account rows pending until real owner-controlled proof exists. | ✓ |
| Treat local readiness as completion | Mark production and Search Console complete from controlled output. | |
| Placeholder domain/account | Invent a hostname or service state to let the phase appear green. | |

**User's choice:** Recommended option approved through the user's instruction to make routine decisions autonomously.
**Notes:** No domain, deployment, DNS/TLS, Search Console, analytics account, or traffic fact will be fabricated.

---

## Verification and failure handling

| Option | Description | Selected |
|--------|-------------|----------|
| Fail-closed local and external gates | Reject unsafe origin/configuration and unsupported operational claims; preserve all prior tests. | ✓ |
| Advisory-only checks | Report problems without blocking launch output or claims. | |
| Manual-only verification | Rely entirely on operator observation despite deterministic source/output contracts. | |

**User's choice:** Recommended option approved through the user's instruction to make routine decisions autonomously.
**Notes:** Mocks may prove project wiring but cannot be presented as Plausible ingestion or dashboard evidence.

## the agent's Discretion

- Internal helper names and the smallest launch-mode check.
- Deterministic test seam for project-side analytics wiring.
- Exact evidence-table and README heading structure.
- Current official Plausible script filename if vendor guidance supersedes prior stack research.

## Deferred Ideas

- Production crawl and Core Web Vitals certification remain Phase 6 scope.
- Custom analytics, watch-time measurement, consent UI without a legal trigger, multi-environment deployment, and a provider runtime remain outside v1.
