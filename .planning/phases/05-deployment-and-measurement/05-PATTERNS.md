# Phase 5: Deployment and Measurement - Pattern Map

**Mapped:** 2026-08-28
**Files analyzed:** 8
**Analogs found:** 7 / 8

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/lib/measurement.ts` | utility | transform | `src/lib/site-origin.ts` | exact |
| `scripts/launch-ready.mjs` | config | batch | existing `scripts/launch-ready.mjs` | exact |
| `src/layouts/SiteLayout.astro` | component | request-response | existing `src/layouts/SiteLayout.astro` | exact |
| `tests/content-contract.test.ts` | test | batch / file-I/O | existing `tests/content-contract.test.ts` | exact |
| `tests/deployment-measurement.test.ts` | test | request-response / event-driven | `tests/search-discovery.spec.ts` | role-match |
| `package.json` | config | batch | existing `package.json` | exact |
| `README.md` | config/documentation | file-I/O | existing `README.md` | exact |
| `.planning/phases/05-deployment-and-measurement/05-LAUNCH-EVIDENCE.md` | config/documentation | file-I/O | none | none |

`src/components/YouTubePlayer.astro`, `src/lib/site-origin.ts`, `astro.config.mjs`, and `tests/search-discovery.spec.ts` are reference/baseline files, not planned edits. Preserve them unless a failing contract proves an existing defect.

## Pattern Assignments

### `src/lib/measurement.ts` (utility, transform)

**Analog:** `src/lib/site-origin.ts`

**Imports and narrow public API** (`src/lib/site-origin.ts`, lines 1-4, 16):

```ts
// @ts-ignore Node built-in types are intentionally not a project dependency.
import { isIP } from "node:net";

export const LOCAL_SITE_ORIGIN = "http://127.0.0.1:4322";

export function productionSiteOrigin(raw: unknown): string {
```

**Fail-closed parsing and validation** (`src/lib/site-origin.ts`, lines 17-44):

```ts
if (typeof raw !== "string" || raw.length === 0 || raw !== raw.trim()) {
  throw new Error("SITE_ORIGIN must be an explicit clean HTTPS origin");
}

const url = new URL(raw);
// ...reject every disallowed protocol, credential, path, query, fragment,
// address, or reserved hostname...
return url.origin;
```

Copy the shape, not the origin rules: expose one small validator for `PLAUSIBLE_SCRIPT_SRC`; accept only a clean `https://plausible.io/js/pa-….js` asset and throw on missing, legacy, generic, credentialed, alternate-host, query, or fragment input. Do not add a class, schema library, or second origin abstraction.

**Validation test pattern** (`tests/site-origin.test.ts`, lines 6-18, 20-65):

```ts
const validOrigins = [/* named raw/expected cases */] as const;
for (const [name, raw, expected] of validOrigins) {
  test(`normalizes ${name}`, () => {
    assert.equal(productionSiteOrigin(raw), expected);
  });
}

const invalidOrigins: readonly [string, unknown][] = [/* boundary cases */];
for (const [name, raw] of invalidOrigins) {
  test(`rejects ${name}`, () => {
    assert.throws(() => productionSiteOrigin(raw));
  });
}
```

Keep focused validator cases in the existing native test ownership unless the planner finds a smaller coherent placement.

---

### `scripts/launch-ready.mjs` (config, batch)

**Analog:** existing `scripts/launch-ready.mjs`

**Explicit imports, validated boundary, exact mode** (lines 1-7):

```js
import { build } from "astro";

import { productionSiteOrigin } from "../src/lib/site-origin.ts";

const site = productionSiteOrigin(process.env.SITE_ORIGIN);

await build({ site, mode: "launch-readiness" });
```

Retain this direct top-level flow. If the Plausible value must be validated before Astro builds, add only the validator import/call here. The mode remains the sole analytics inclusion signal; do not infer it from `CF_PAGES`, hostname, or `PROD`.

---

### `src/layouts/SiteLayout.astro` (component, request-response)

**Analog:** existing `src/layouts/SiteLayout.astro`

**Frontmatter gate location** (lines 16-22):

```astro
const page = Astro.props;
if (!Astro.site) throw new Error("Astro.site must be configured");
const canonical =
  page.indexable === false
    ? undefined
    : new URL(Astro.url.pathname, Astro.site).href;
```

Add the exact `import.meta.env.MODE === "launch-readiness"` decision in frontmatter. Keep `Astro.site` as the only canonical origin authority.

**Single shared head boundary** (lines 24-50):

```astro
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <!-- existing metadata -->
  </head>
```

Render one deferred, non-rendering Plausible loader here only in launch-readiness mode. Do not change any line in `<body>` or `<style>`, add analytics attributes, or touch the YouTube component.

---

### `tests/content-contract.test.ts` (test, batch / file-I/O)

**Analog:** existing `tests/content-contract.test.ts`

**Native test and source inspection imports** (lines 1-4):

```ts
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
```

**Launch source contract** (lines 484-494):

```ts
test("launch readiness wires coverage mode and controlled discovery identity", () => {
  const launchScript = readFileSync(
    new URL("../scripts/launch-ready.mjs", import.meta.url),
    "utf8",
  );
  assert.match(
    launchScript,
    /build\(\{\s*site,\s*mode:\s*["']launch-readiness["']\s*\}\)/u,
  );
```

**Child-process controlled build** (lines 498-503):

```ts
const result = spawnSync(
  process.execPath,
  [npmCli, "run", "launch:ready"],
  {
    env: { ...process.env, SITE_ORIGIN: controlledOrigin },
  },
);
```

Extend the child environment with an unmistakably fake but structurally valid `PLAUSIBLE_SCRIPT_SRC`, then inspect every emitted HTML document for exactly one launch loader and unchanged bodies. Ordinary output must contain zero analytics.

**Guaranteed ordinary-build restoration** (lines 562-576):

```ts
} finally {
  const ordinaryEnv = { ...process.env };
  delete ordinaryEnv.SITE_ORIGIN;
  const restored = spawnSync(process.execPath, [npmCli, "run", "build"], {
    env: ordinaryEnv,
  });
  // assert the local canonical identity was restored
}
```

Also delete `PLAUSIBLE_SCRIPT_SRC` in the restoration environment and assert no Plausible markup remains. Reuse `readFileSync`, `spawnSync`, and `try/finally`; do not introduce fixtures or another test framework. Contract-test the Arabic README, evidence status rules, prohibited trackers, and absence of committed real values here.

---

### `tests/deployment-measurement.test.ts` (test, request-response / event-driven)

**Analog:** `tests/search-discovery.spec.ts`

**Request observation** (`tests/search-discovery.spec.ts`, lines 737-741):

```ts
page.on("request", (request) => {
  if (new URL(request.url()).origin !== LOCAL_PREVIEW_ORIGIN)
    remoteRequests.push(request.url());
});

await page.goto(NOT_FOUND_PATHS[0]);
```

Use the same Playwright request interception seam inside the native test lifecycle. Assert only project wiring: one initial analytics attempt, at most one automatic outbound attempt for the permanent YouTube anchor, none from player activation, and usable navigation/content when the analytics request is aborted. Never claim vendor receipt or dashboard reporting. Store failure artifacts only under `.artifacts/`.

**Existing direct-link expectations** (`tests/search-discovery.spec.ts`, lines 129-130):

```ts
"فيديو: أصول أهل السنة في الرد على الشيعة وغيرهم من أهل البدع=>https://www.youtube.com/watch?v=gO9yWa85OBc",
"مشاهدة الفيديو على يوتيوب=>https://www.youtube.com/watch?v=gO9yWa85OBc",
```

Preserve the direct anchor's Arabic accessible name, same-tab native behavior, and exact YouTube URL. Do not add a custom click handler merely to make the test easier.

---

### `package.json` (config, batch)

**Analog:** existing `package.json`

**Explicit native-test list** (line 15):

```json
"test": "node -e \"const {spawnSync}=require('node:child_process');const r=spawnSync(process.execPath,['--test','--test-reporter=tap','tests/content-contract.test.ts','tests/site-origin.test.ts'],{encoding:'utf8'});...\""
```

Append `tests/deployment-measurement.test.ts` to this existing explicit list. Preserve the current runner, reporter, runtime guard, `launch:ready`, and dependency graph; add no analytics or test dependency.

---

### `README.md` (documentation/config, file-I/O)

**Analog:** existing `README.md`

**Concise Arabic operational sections and executable commands** (`README.md`, lines 89-100, 112-130):

```text
## المسودات والمعاينة

شغّل المعاينة المحلية: `npm run dev`

## التحقق والبناء

نفّذ `npm test` ثم `npm run check` ثم `npm run build`.
```

Append Arabic owner-facing sections with exact Cloudflare Pages settings, initial deploy, DNS/TLS/custom domain, diagnosis, rollback/redeploy, post-deploy canonical/discovery checks, Search Console sitemap steps, and Plausible property/outbound-toggle verification. Use placeholders for owner-controlled values and explicitly distinguish local wiring from live service evidence.

---

### `.planning/phases/05-deployment-and-measurement/05-LAUNCH-EVIDENCE.md` (documentation/config, file-I/O)

**Analog:** none. Use the required schema from `05-RESEARCH.md`, lines 522-540.

Create one compact table with gate, status, authority/evidence, date, and notes. All local and external rows start `PENDING`; only dated evidence from the correct authority may change a row. Include clean pinned build, credential scan, Cloudflare configuration/deployment, DNS/TLS, Plausible property/pageview/outbound link, Search Console property, and sitemap submission. Controlled origins, fake `pa-…` fixtures, source inspection, localhost screenshots, and intercepted requests cannot pass external rows.

## Shared Patterns

### Trust-boundary validation

**Source:** `src/lib/site-origin.ts`, lines 16-44  
**Apply to:** `PLAUSIBLE_SCRIPT_SRC` and the launch script.

Parse with the platform `URL`, enumerate allowed structure, fail closed, and return a normalized string. Do not silently omit analytics in a launch-readiness build when its required public input is missing or unsafe.

### One build-mode authority

**Source:** `scripts/launch-ready.mjs`, lines 5-7  
**Apply to:** `SiteLayout.astro` and all output tests.

```js
const site = productionSiteOrigin(process.env.SITE_ORIGIN);
await build({ site, mode: "launch-readiness" });
```

The exact Astro mode is the only inclusion gate. `Astro.site` remains canonical identity; Plausible's asset URL is not an origin source.

### Deterministic cleanup

**Source:** `tests/content-contract.test.ts`, lines 562-576  
**Apply to:** every controlled launch build test.

Always restore a fresh ordinary build in `finally`, remove both controlled public inputs from the child environment, then prove local canonical identity and analytics omission.

### Zero-visible-change boundary

**Source:** `src/layouts/SiteLayout.astro`, lines 50-163; `05-UI-SPEC.md`  
**Apply to:** shared layout and browser checks.

Only the head receives a deferred script. Body HTML, Arabic/RTL semantics, accessible tree, focus order, layout, styles, YouTube link, and player behavior remain byte/behavior-equivalent where applicable.

### No authentication or application error UI

This phase has no server, account, controller, middleware, database, authentication, or reader-facing analytics failure state. Build-time validation throws; browser analytics failure is silent and cannot block content/navigation.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `.planning/phases/05-deployment-and-measurement/05-LAUNCH-EVIDENCE.md` | documentation/config | file-I/O | No existing launch evidence ledger; its exact schema is defined by Phase 5 research. |

## Metadata

**Analog search scope:** `src/`, `scripts/`, `tests/`, root configuration/documentation, Phase 5 artifacts  
**Strong analogs inspected:** `src/lib/site-origin.ts`, `scripts/launch-ready.mjs`, `src/layouts/SiteLayout.astro`, `tests/content-contract.test.ts`, `tests/site-origin.test.ts`, `tests/search-discovery.spec.ts`, `package.json`, `README.md`  
**Pattern extraction date:** 2026-08-28
