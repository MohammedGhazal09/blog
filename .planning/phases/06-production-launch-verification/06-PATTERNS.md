# Phase 6: Production Launch Verification - Pattern Map

**Mapped:** 2026-08-28
**Files analyzed:** 7 new/modified surfaces
**Analogs found:** 7 / 7

## File Classification

| New/Modified File                                                              | Role            | Data Flow                                             | Closest Analog                                                                                | Match Quality                            |
| ------------------------------------------------------------------------------ | --------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `scripts/verify-production.mjs`                                                | utility / CLI   | batch + request-response + file-I/O                   | `scripts/launch-ready.mjs`; `tests/search-discovery.spec.ts`; `tests/article-journey.spec.ts` | composite role/data-flow match           |
| `tests/production-verification.test.ts`                                        | test            | controlled event-driven + request-response + file-I/O | `tests/deployment-measurement.test.ts`                                                        | exact testing/controlled-transport match |
| `src/lib/site-origin.ts`                                                       | utility         | transform / validation                                | existing `src/lib/site-origin.ts`                                                             | exact modification site                  |
| `tests/site-origin.test.ts`                                                    | test            | transform                                             | existing `tests/site-origin.test.ts`                                                          | exact modification site                  |
| `package.json`                                                                 | config          | batch command orchestration                           | existing `package.json` scripts                                                               | exact modification site                  |
| `README.md`                                                                    | documentation   | operator request-response workflow                    | existing Phase 5 production sections in `README.md`                                           | exact documentation match                |
| `.planning/phases/06-production-launch-verification/06-PRODUCTION-EVIDENCE.md` | evidence ledger | manual review / event record                          | `.planning/phases/05-deployment-and-measurement/05-LAUNCH-EVIDENCE.md`                        | exact role match                         |

## Pattern Assignments

### `scripts/verify-production.mjs` (utility/CLI, batch + request-response + file-I/O)

**Primary CLI analog:** `scripts/launch-ready.mjs`

**Imports and fail-fast boundary** (`scripts/launch-ready.mjs:1-11`):

```javascript
import { build } from "astro";

import { plausibleScriptSource } from "../src/lib/measurement.ts";
import { productionSiteOrigin } from "../src/lib/site-origin.ts";

const site = productionSiteOrigin(process.env.SITE_ORIGIN);
process.env.PLAUSIBLE_SCRIPT_SRC = plausibleScriptSource(
  process.env.PLAUSIBLE_SCRIPT_SRC,
);

await build({ site, mode: "launch-readiness" });
```

Copy the direct ESM import style and make `productionSiteOrigin(process.env.SITE_ORIGIN)` the first executable boundary. The new runner may export an importable function, but its CLI path must validate before `fetch`, `chromium.launch`, `mkdir`, or report creation. Keep the error naturally fatal/nonzero as the launch script does.

**Crawl/parser analog** (`tests/search-discovery.spec.ts:280-287`, `640-675`):

```typescript
const document = new DOMParser().parseFromString(xml, "application/xml");
if (document.querySelector("parsererror")) throw new Error("invalid XML");
return [...document.querySelectorAll("loc")].map(
  (location) => location.textContent?.trim() ?? "",
);
```

The existing test then checks HTTP status/content type, uniqueness, exact route membership, robots text, and draft exclusion (`640-675`). Reuse the browser `DOMParser` approach, but production HTTP identity must be stricter than the local Playwright request helper: native `fetch` with `redirect: "manual"`, bounded bodies, exact same-origin extracted URLs, and explicit timeouts. Do not copy the local hand-authored `expectedIdentities()` list; deployed sitemap membership is the Phase 6 authority.

**Metadata and 404 analog** (`tests/search-discovery.spec.ts:320-356`, `678-709`):

```typescript
await expect(page.locator("html")).toHaveAttribute("lang", "ar");
await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
  "href",
  canonical,
);
await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
```

For the missing route, copy the separate true-404 contract: status `404`, Arabic/RTL shell, `noindex,follow`, and zero canonical/Open Graph/Twitter tags (`678-709`).

**Media intent/geometry analog** (`tests/article-journey.spec.ts:256-316`):

```typescript
const youtubeRequests: string[] = [];
page.on("request", (pendingRequest) => {
  if (isYouTubeFamilyRequest(pendingRequest.url())) {
    youtubeRequests.push(pendingRequest.url());
  }
});
await expect(page.locator("iframe")).toHaveCount(0);
expect(youtubeRequests).toEqual([]);

const before = await region.boundingBox();
await trigger.click();
const iframe = region.locator("iframe");
await expect(iframe).toHaveCount(1);
const iframeUrl = new URL((await iframe.getAttribute("src"))!);
expect(iframeUrl.hostname).toBe("www.youtube-nocookie.com");
expect(iframeUrl.searchParams.get("autoplay")).not.toBe("1");
const after = await region.boundingBox();
expect(Math.abs(after!.width - before!.width)).toBeLessThanOrEqual(1);
expect(Math.abs(after!.height - before!.height)).toBeLessThanOrEqual(1);
```

Reuse the semantic hooks `[data-video-region]`, the Arabic button/link roles, fresh pages for each activation path, one-pixel geometry tolerance, and exact iframe identity. Strengthen the existing media-family helper: do not copy its substring matching; use `host === suffix || host.endsWith('.' + suffix)` against one central reviewed suffix set.

**Accessibility/reflow analog** (`tests/search-discovery.spec.ts:290-307`, `733-783`): reuse the document scroll-width plus visible-element bounding-box check, native `Tab` order/focus assertions, and Axe tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`, failing serious/critical violations only. Put screenshots only in `.artifacts/phase-06/**` and only where evidence/failure warrants them.

**Integration points:** `productionSiteOrigin()` is the sole input authority; installed `chromium` and `AxeBuilder` provide browser/CDP/a11y behavior; sitemap output supplies public membership; `[data-video-region][data-youtube-id]` supplies article identity; the runner writes only ignored machine reports and never the committed ledger.

**Landmines:** no positional origin/config alias; no `.env` read; no implicit redirects/retries; no external YouTube crawl; no warmed performance context; no average in place of three raw values plus median; no lifetime CLS sum; no deprecated `Network.emulateNetworkConditions`; no `ignoreHTTPSErrors`, proxy, credentials, storage state, custom headers, or persistent profile in final-origin mode; no response bodies/headers/cookies/tokens in reports; controlled fixture scope must be runner-derived and can never produce production PASS.

---

### `tests/production-verification.test.ts` (test, controlled event-driven + request-response + file-I/O)

**Analog:** `tests/deployment-measurement.test.ts`

**Native test/import style** (`1-15`):

```typescript
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createServer, type Server } from "node:http";
import test from "node:test";

import { chromium, type Browser, type Page } from "@playwright/test";
```

Use built-in `node:test` and strict assertions; import the runner for the controlled matrix rather than invoking the real-origin CLI for every case. Keep fixture names visibly synthetic, following `FAKE_TEST_FIXTURE_DO_NOT_DEPLOY` (`10-13`).

**Controlled interception seam** (`108-118`):

```typescript
await page.route(CONTROLLED_PLAUSIBLE_SCRIPT_SRC, (route) =>
  route.fulfill({ body: vendorStub, contentType: "text/javascript" }),
);
await page.route(PLAUSIBLE_EVENT_ENDPOINT, async (route) => {
  attempts.push(route.request().postDataJSON() as WiringAttempt);
  await route.fulfill({ status: 202, body: "ok" });
});
```

Copy route fulfillment/abortion as the deterministic transport seam. Test that injected fixture transport forces `evidenceScope: "controlled"` and `transport: "intercepted-fixture"`; callers must not choose these labels.

**Resource cleanup** (`128-133`, `237-249`): initialize server/browser handles, use `try/finally`, close both, remove process-only origin values from any ordinary-build environment, and verify restoration. For Phase 6, cleanup must not delete broad/user paths; all test artifacts remain under the fixed `.artifacts/phase-06/controlled/` root.

**Test matrix to reuse/extend:** exact invalid-origin fail-before-I/O; manual redirect rejection; malformed/oversized/duplicate/out-of-origin discovery XML; broken links/canonical/metadata/draft/404 failures; deterministic five-role selection; three raw metric values and medians; missing/over-threshold LCP/CLS; max-session-window CLS; exact CDP profile; pre-intent host requests; pointer/Enter activation; blocked iframe with focused direct link; Arabic/RTL/Latin/AX/Axe/reflow failures; controlled report cannot promote evidence ledger rows.

**Landmines:** do not mutate the committed ledger from tests; do not require a real origin; do not let this test call the CLI's production network path; do not put browser artifacts in `tests/` or `.planning/`; serialize this native test with the existing package command.

---

### `src/lib/site-origin.ts` (utility, transform/validation)

**Analog:** the current file itself, especially `16-44`.

Keep the existing trust-boundary sequence: type/trim check, native `URL`, hostname normalization for `isIP`, reserved-root suffix boundary, HTTPS/userinfo/path/query/fragment/trailing-dot/IP/reserved rejection, then return `url.origin`.

**Smallest required change:** add exact canonical input and port-free enforcement at the shared boundary: reject when `url.port !== ""` or `raw !== url.origin`. This intentionally drops the current normalization compatibility for slash, case, `:443`, and `:8443`; Phase 6 explicitly requires the exact serialized origin.

**Style conventions:** named export, `string` return, one public error for malformed/unclean input and one for unsafe origin, standard-library `node:` import, no dependency. Preserve the `@ts-ignore` rationale at `1-2` unless project typing changes independently.

**Landmine:** `new URL(raw)` throws its own error for malformed values; existing tests assert only that it throws, not exact text. Do not broaden acceptance by returning a normalized value when raw input differs.

---

### `tests/site-origin.test.ts` (test, transform)

**Analog:** the current table-driven test at `6-18` and `20-66`.

```typescript
for (const [name, raw, expected] of validOrigins) {
  test(`normalizes ${name}`, () => {
    assert.equal(productionSiteOrigin(raw), expected);
  });
}

for (const [name, raw] of invalidOrigins) {
  test(`rejects ${name}`, () => {
    assert.throws(() => productionSiteOrigin(raw));
  });
}
```

Keep one exact public HTTPS origin as valid. Move trailing slash, uppercase host, explicit default port, and non-default port from the valid table into the invalid table. Retain all existing absent/type/whitespace/scheme/userinfo/path/query/fragment/trailing-dot/local/IP/reserved/malformed cases. Add these rejection cases before changing the implementation so the contract gap is visible.

---

### `package.json` (config, batch orchestration)

**Analog:** current serialized scripts at `11-20`.

Add `verify:production` as a direct `node scripts/verify-production.mjs` opt-in command. Append `tests/production-verification.test.ts` to the explicit serialized file list inside `test`; retain `--test-concurrency=1` and TAP output. Do not add `verify:production` to `verify`, `test`, or `test:browser`. Do not alter dependencies or `package-lock.json`.

**Landmine:** the Windows-safe `spawnSync(process.execPath, ...)` wrapper normalizes doubled slashes in test output; extend its file list instead of replacing it with a shell-concatenated command.

---

### `README.md` (documentation, operator request-response)

**Analog:** Arabic production operator guidance at `134-203`, especially the exact runtime/config table (`138-150`), ordered final-origin inspection (`174-182`), and evidence-authority warning (`201-203`).

Add a concise Arabic section showing a process-local PowerShell assignment followed by `npm run verify:production`, the ignored `.artifacts/phase-06/.../report.json` location, expected 15 cold samples/runtime, and the rule that controlled/local output does not prove final-origin, native zoom, field INP, Search Console, Cloudflare, or Plausible facts. Keep all reader/operator prose Arabic; technical command names may remain code tokens.

**Landmines:** never instruct creation/loading of an environment file; never include a guessed final host as if authoritative; do not imply iframe creation proves playback; do not imply lab values are field Core Web Vitals.

---

### `06-PRODUCTION-EVIDENCE.md` (evidence ledger, manual review/event record)

**Analog:** `05-LAUNCH-EVIDENCE.md:1-27`.

Copy the Arabic heading, explicit allowed states (`PASS`, `FAIL`, `PENDING`, `BLOCKED`), tabular authority/source/date/evidence/next-action structure, and the `حدود الإثبات` section. Phase 5 lines `24-27` are the key boundary: local rows prove repeatable repository readiness only; external rows require dated real-service evidence.

Create distinct rows for controlled runner correctness; owner-confirmed exact origin; final-origin crawl; production LCP/CLS; pre-interaction media; Arabic/RTL/a11y/reflow; native 200% zoom; field INP; inherited Cloudflare/DNS/TLS; Search Console/sitemap; Plausible pageviews/outbound click; `QUAL-05`; and `QUAL-06`. Start unavailable external/final/field/human rows as `PENDING`; record controlled runner results only in the controlled row.

**Landmine:** the runner and controlled test must never write or promote this file. An ignored JSON path is evidence for reviewer inspection, not authority by itself.

## Shared Patterns

### Explicit origin authority

**Source:** `scripts/launch-ready.mjs:4-6`, `src/lib/site-origin.ts:16-44`  
**Apply to:** runner, origin tests, package command, README.  
One process value (`SITE_ORIGIN`), one validator (`productionSiteOrigin()`), validation before all I/O, and no alternate config path.

### Controlled transport and cleanup

**Source:** `tests/deployment-measurement.test.ts:108-118`, `121-145`, `237-249`  
**Apply to:** production verifier tests.  
Use Playwright route fulfillment/abort for synthetic behavior, visibly fake fixture constants, and `try/finally` cleanup. Controlled transport determines controlled evidence scope.

### Discovery and metadata

**Source:** `tests/search-discovery.spec.ts:280-287`, `320-356`, `640-709`  
**Apply to:** production crawl and controlled failure matrix.  
Parse through browser `DOMParser`, reject parser errors, require unique sitemap locations, exact self-canonical Arabic/RTL identity, explicit public/404 robots behavior, and draft exclusion.

### Media, fallback, and geometry

**Source:** `tests/article-journey.spec.ts:247-316`, `319-397`, `452-525`  
**Apply to:** every production article.  
Zero pre-intent iframe/media requests, exact no-cookie iframe after native pointer/keyboard intent, stable 16:9 region, no autoplay/duplicate iframe, and a visible/focusable exact direct link even when player requests fail.

### Accessibility and artifact isolation

**Source:** `tests/search-discovery.spec.ts:290-307`, `733-783`; `playwright.config.ts:3-15`; `.gitignore:4`  
**Apply to:** every public route plus 404 and all generated evidence.  
Use semantic roles, keyboard focus, 320px overflow checks, WCAG-tagged Axe serious/critical filtering, failure-oriented capture, and `.artifacts/` exclusively.

## Naming and Style Conventions

- ESM throughout (`"type": "module"`); scripts use `.mjs`, project utilities/tests may import `.ts` directly under Node 24.
- Node built-ins use the `node:` prefix; tests use `node:test` plus `node:assert/strict`.
- Constants are uppercase (`LOCAL_SITE_ORIGIN`, `CONTROLLED_ORIGIN`); functions are camelCase; evidence fields should be explicit camelCase (`evidenceScope`, `transport`, `schemaVersion`).
- Reader/operator-facing prose and accessibility names are Arabic; technical identifiers/URLs remain isolated code tokens.
- Tests are behavior sentences and table-driven matrices. Error assertions generally prove rejection, not brittle full-message equality.
- Fixed artifact roots are repository-relative and ignored; never accept a caller-provided output directory.

## No Analog Found

No file is wholly without an analog. Two algorithms are new and should follow `06-RESEARCH.md` rather than inventing a project precedent:

| Surface                         | New algorithm                                                     | Required source of truth                                         |
| ------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| `scripts/verify-production.mjs` | current CDP Slow-4G-like profile and three-run median LCP/CLS     | `06-RESEARCH.md` Patterns 4-5; exact recorded constants/commands |
| `scripts/verify-production.mjs` | authority-labelled report schema and fixed UTC artifact directory | `06-RESEARCH.md` Pattern 8; D-22-D-25                            |

## Minimal Implementation Recommendation

Use exactly the seven planned surfaces. Do not create a production Playwright config, parser/report/schema library, route registry copy, monitoring job, telemetry endpoint, UI, dependency, or lockfile change. One importable/CLI runner plus one controlled native test is the smallest complete boundary.

## Metadata

**Analog search scope:** `scripts/`, `src/lib/`, `tests/`, `playwright.config.ts`, `.gitignore`, `README.md`, Phase 5 evidence artifacts  
**Primary analogs deeply inspected:** 6 (`launch-ready.mjs`, origin utility/test, deployment controlled test, search browser suite, article browser suite, Phase 5 ledger)  
**Pattern extraction date:** 2026-08-28
