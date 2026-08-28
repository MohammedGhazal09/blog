---
status: partial
phase: 05-deployment-and-measurement
source:
  - 05-VERIFICATION.md
started: 2026-08-28T04:03:05Z
updated: 2026-08-28T04:03:05Z
---

## Current Test

[awaiting owner-controlled service evidence]

## Tests

### 1. Canonical production deployment, DNS, and TLS

expected: The final owner-controlled HTTPS origin is reachable from the intended production deployment, matches emitted canonical identity, and has active DNS and TLS.
result: blocked
blocked_by: third-party
reason: Requires the owner's Cloudflare Pages and domain control planes plus a real production response.

### 2. Search Console ownership and sitemap submission

expected: The exact final HTTPS URL-prefix property is verified and its absolute `/sitemap-index.xml` URL has a recorded submission and service status.
result: blocked
blocked_by: third-party
reason: Requires owner-controlled Google Search Console access.

### 3. Aggregate Plausible production pageviews

expected: The final property reports aggregate page traffic from the real production origin without per-reader profiling.
result: blocked
blocked_by: third-party
reason: Requires the owner Plausible property and real production traffic.

### 4. Real outbound YouTube link reporting

expected: One production use of the permanent YouTube action appears as `Outbound Link: Click` with the direct destination in `url`, while player activation is not counted as that link event.
result: blocked
blocked_by: third-party
reason: Requires one real production link action and inspection of the owner Plausible dashboard.

## Summary

total: 4
passed: 0
issues: 0
pending: 0
skipped: 0
blocked: 4

## Gaps

[none — these are external authority gates, not diagnosed code defects]

## Evidence Rules

- Update a test only after inspecting direct owner-controlled service evidence.
- Never promote a fixture, controlled hostname, localhost response, source scan, intercepted request, or screenshot into a pass.
- Do not store credentials, verification tokens, or the real Plausible asset value in this file or the repository.
