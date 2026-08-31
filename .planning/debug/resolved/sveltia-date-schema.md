---
status: resolved
trigger: 'Build failed: publishedAt: Expected type "string", received "object"'
created: 2026-08-31T17:11:59.6511320+03:00
updated: 2026-08-31T18:22:00+03:00
---

## Current Focus

hypothesis: Confirmed — output.yaml.quote double makes Sveltia serialize its date-only string as a quoted YAML scalar, preventing Astro/js-yaml Date construction and preserving the original strict string/date contract.
test: Add a focused repository test requiring the nested Sveltia quote setting, prove it RED before config change, then revert the unsafe preprocessor and set the official option.
expecting: The focused test fails on current config, passes after quote double is added, and existing semantic tests continue rejecting timestamps and impossible dates with the original z.string schema.
next_action: Parent workflow will commit/merge/deploy the fix, then re-save PR 10 through Sveltia so the existing unquoted date is rewritten under the verified quoting configuration.
tdd_checkpoint:
  test_file: tests/cms-security.test.ts
  test_name: Sveltia quotes YAML date strings before Astro parses them
  status: green
  failure_output: "RED: missing output.yaml.quote double caused 1 failure. GREEN: focused node:test exited 0 with 1 pass and 0 failures after the config fix."
reasoning_checkpoint:
  hypothesis: "Sveltia stores type date values as YYYY-MM-DD strings, but its default plain YAML output lets Astro/js-yaml reinterpret them as Date objects; enabling Sveltia's official output.yaml.quote double keeps the scalar a string and makes the Date preprocessor unnecessary and unsafe."
  confirming_evidence:
    - "Sveltia 0.201.1 source getCurrentValue returns inputValue unchanged for dateOnly fields, and its default-value path also returns strings."
    - "The exact 0.201.1 formatter selects QUOTE_DOUBLE for all strings when output.yaml.quote is double, and upstream tests prove double-quoted YAML output."
    - "Astro parseFrontmatter preserves quoted date scalars as strings, while unquoted impossible dates roll over to indistinguishable Date objects."
  falsification_test: "This hypothesis would be false if Sveltia's date-only value were a Date/object at serialization time or if quote double did not produce a quoted date scalar."
  fix_rationale: "Configuring the producer to emit an unambiguous YAML string restores the original z.string plus exact syntax/calendar validators; removing the preprocessor closes the bypass rather than adding a second parser."
  blind_spots: "Existing PR 10 already contains an unquoted value and must be re-saved through deployed Sveltia after this fix; browser publishing proof remains parent workflow work."

## Symptoms

expected: Ahmed can save a hidden Sveltia draft and the cms-content-gate completes successfully.
actual: The trusted-base content restriction passes, but launch builds in the full gate fail while loading the draft.
errors: 'publishedAt: Expected type "string", received "object"; launch build and controlled launch build fail.'
reproduction: Open PR 10, whose Sveltia-authored frontmatter contains unquoted publishedAt 2026-08-31, and run cms-content-gate.
started: First real-owner Sveltia draft proof on 2026-08-31.

## Eliminated

- hypothesis: The semantic calendar/date-order validator rejects the CMS date.
  evidence: The exact fixture fails at z.string with received object before validateArticleData or assertDateOnly runs.
  timestamp: 2026-08-31T17:22:00+03:00
- hypothesis: Broad coercion is required because CMS field types are unpredictable.
  evidence: The exact PR and Sveltia widget produce a Date specifically; existing strings are valid, while numbers and invalid Dates must remain rejected by z.string.
  timestamp: 2026-08-31T17:26:00+03:00

## Evidence

- timestamp: 2026-08-31T17:11:59.6511320+03:00
  checked: Current main schema, PR 10 draft frontmatter, and CI failure.
  found: Main requires z.string while PR 10 supplies an unquoted YAML date parsed as a Date object.
  implication: "Superseded hypothesis: normalize at the shared Astro schema boundary before the existing string semantic contract. Later parser investigation showed this loses invalid-date source information; the final fix quotes strings at the Sveltia producer."
- timestamp: 2026-08-31T17:15:00+03:00
  checked: src/content.config.ts, all publishedAt and updatedAt consumers, package scripts, and test inventory.
  found: The collection schema is the only raw-content boundary; all downstream contracts and page consumers require YYYY-MM-DD strings, and tests already use native node:test.
  implication: "Superseded hypothesis: convert only valid Date instances before z.string validation. Later rollover tests showed a constructed Date cannot preserve source validity; the final fix prevents Date construction with quoted Sveltia output."
- timestamp: 2026-08-31T17:17:00+03:00
  checked: Complete src/lib/content-contract.ts, tests/content-contract.test.ts, public/admin/config.yml, and CMS gate workflow.
  found: Sveltia's date widgets cover both publishedAt and optional updatedAt; semantic validation deliberately requires exact date-only strings; the CMS gate runs native tests, Astro diagnostics, and a production build.
  implication: "Superseded hypothesis: one shared normalizer should serve both date fields. Later evidence rejected normalization; one Sveltia YAML quote setting now protects both fields while the strict public data model remains unchanged."
- timestamp: 2026-08-31T17:19:00+03:00
  checked: Local Git object database and branches.
  found: PR 10 head SHA is not present locally and no PR tracking ref exists.
  implication: A read-only fetch of refs/pull/10/head is required to reproduce from the exact owner-authored content without altering the working branch.
- timestamp: 2026-08-31T17:20:00+03:00
  checked: Public PR 10 diff fetched from refs/pull/10/head.
  found: The PR adds exactly one Markdown article; publishedAt is the unquoted scalar 2026-08-31, draft is true, and no application file is changed.
  implication: The owner workflow input itself is valid for Sveltia but crosses the Astro schema boundary as a YAML Date object.
- timestamp: 2026-08-31T17:22:00+03:00
  checked: npm run build with the exact PR 10 article materialized temporarily against the unchanged schema.
  found: Build exits 1 with InvalidContentEntryDataError and publishedAt Expected type string received object at the owner-authored article.
  implication: The failure is deterministic and isolated to raw YAML date typing before downstream article semantics or rendering.
- timestamp: 2026-08-31T17:26:00+03:00
  checked: Focused node:test against an identity normalizeDateInput stub.
  found: The test exits 1 because a valid Date remains an object instead of 2026-08-31; unchanged string and rejection-preserving inputs are part of the same focused case.
  implication: The regression test is RED for the exact missing boundary behavior before the fix.
- timestamp: 2026-08-31T17:30:00+03:00
  checked: Focused node:test after implementing normalizeDateInput.
  found: The named test exits 0 with 1 pass and 0 failures.
  implication: Valid Date normalization works while the test confirms strings and non-valid-Date values are not broadly coerced.
- timestamp: 2026-08-31T17:31:00+03:00
  checked: npm run build with the exact PR 10 article after the fix, followed by a fixed-string scan of dist.
  found: Build exits 0, emits 9 public pages, and the hidden draft slug is absent from all generated output.
  implication: The original CMS failure is fixed end-to-end and draft privacy remains intact for the exact owner-authored content.
- timestamp: 2026-08-31T17:33:00+03:00
  checked: Working diff, git diff --check, Playwright output configuration, and ignore rules after deleting the temporary article.
  found: The diff is limited to the helper, collection schema, focused test, and debug state; no whitespace errors exist; .artifacts/playwright is ignored.
  implication: Full browser verification can run without polluting watched source or planning paths.
- timestamp: 2026-08-31T17:38:35+03:00
  checked: Complete npm run verify gate after removing the temporary owner-authored article.
  found: Exit 0; native tests 277/277, Astro diagnostics 0 errors/warnings/hints, static build 9 pages, and Playwright 50/50.
  implication: The fix is stable across the repository's content, security, build, accessibility, discovery, and browser regression gates.
- timestamp: 2026-08-31T17:55:00+03:00
  checked: Reopened session, current normalizer/schema, existing semantic date tests, CMS field configuration, and installed dependency versions.
  found: normalizeDateInput accepts every non-NaN Date and truncates its ISO timestamp; semantic tests still require exact YYYY-MM-DD and real calendar dates; both CMS fields use a date-only datetime widget; Astro installs js-yaml 4.3.1 transitively.
  implication: The first fix can bypass the downstream syntax/calendar checks after source information is lost, so the parsing boundary must be traced before selecting a correction.
- timestamp: 2026-08-31T17:59:00+03:00
  checked: Astro 7.2.7 content-layer and @astrojs/internal-helpers 0.10.4 frontmatter implementation, plus js-yaml 4.3.1 timestamp type.
  found: The glob content layer calls parseFrontmatter; parseFrontmatter calls yaml.load with no options; js-yaml implicitly accepts both date-only and timestamp syntax and constructs Date with Date.UTC without rejecting calendar rollover.
  implication: The exact production parser erases source syntax and calendar validity before the collection Zod schema receives the value.
- timestamp: 2026-08-31T18:03:00+03:00
  checked: Read-only reproduction through Astro's exported parseFrontmatter API with six representative scalars.
  found: All inputs became Date objects; 2026-02-30 became exactly 2026-03-02T00:00:00.000Z, 2026-13-01 became exactly 2027-01-01T00:00:00.000Z, and the timestamp retained a non-midnight time only until normalizeDateInput truncation.
  implication: No Date-only preprocessor can distinguish all invalid sources from legitimate dates; strict validation must inspect the raw scalar before js-yaml construction.
- timestamp: 2026-08-31T18:08:00+03:00
  checked: Complete astro.config.mjs and src/lib/mdx-policy.ts plus all preflight callers and source-policy tests.
  found: astro.config.mjs synchronously runs preflightArticleSources over every Markdown/MDX article before defineConfig; the preflight already reads each complete raw source and sends it through assertAllowedMdxSource.
  implication: Extending this existing pass is smaller than replacing Astro's glob loader and covers dev, check, build, and launch builds before lossy YAML parsing.
- timestamp: 2026-08-31T18:11:00+03:00
  checked: js-yaml type availability and first JSON_SCHEMA experiment command.
  found: No @types/js-yaml package is installed; the experiment did not run because PowerShell quoting corrupted the inline JavaScript at the quoted-key fixture.
  implication: Retry the same read-only experiment with unambiguous argument quoting; TypeScript integration may need one narrow local declaration or a package-provided typing decision after behavior is proven.
- timestamp: 2026-08-31T18:14:00+03:00
  checked: Retried js-yaml JSON_SCHEMA experiment with legitimate, rollover, timestamp, quoted-key, and alias inputs.
  found: JSON_SCHEMA preserved every tested date/timestamp scalar as its original string and resolved alternate YAML key/value spellings safely.
  implication: Raw preflight is technically viable, but it adds a direct parser dependency and should be skipped if Sveltia can emit quoted date strings natively.
- timestamp: 2026-08-31T18:16:00+03:00
  checked: New official-Sveltia configuration evidence supplied during investigation.
  found: Reported Sveltia 0.201.1 support for output.yaml.quote double may prevent lossy YAML Date construction at the source.
  implication: Verify this simpler producer-side fix against the exact pinned distribution before implementing any raw parser.
- timestamp: 2026-08-31T18:20:00+03:00
  checked: Sveltia 0.201.1 npm metadata, published configuration schema, and the project's vendored CMS bundle serializer code.
  found: The exact schema accepts output.yaml.quote with none/double/single; the vendored formatter reads that option and selects QUOTE_DOUBLE as defaultStringType when set to double; the deprecated yaml_quote message explicitly equates true with quote double.
  implication: Producer-side quoting is supported by the deployed CMS bundle and applies globally to string values; only the date widget's stored type remains to verify before changing config.
- timestamp: 2026-08-31T18:21:00+03:00
  checked: npm gitHead metadata and attempted GitHub tree resolution.
  found: The 0.201.1 package publishes no gitHead, so the first source-tree API request had an empty revision and returned 404.
  implication: Resolve the official tag directly instead of relying on absent npm gitHead metadata.
- timestamp: 2026-08-31T18:11:00+03:00
  checked: Official Sveltia v0.201.1 tag source for date-time config/defaults/helpers and YAML file formatting, plus upstream formatter tests.
  found: type date normalizes to dateOnly; getCurrentValue returns the input YYYY-MM-DD string unchanged; defaults return strings; formatYAML selects QUOTE_DOUBLE for quote double; upstream tests assert all string values are double-quoted.
  implication: The producer-side config fix is fully supported by the exact deployed version and is smaller/safer than raw preflight parsing; remove the Date normalizer and retain the original strict schema.
- timestamp: 2026-08-31T18:12:00+03:00
  checked: Focused CMS config regression test before changing production configuration.
  found: Exit 1 with one expected failure because output.yaml.quote double is absent from the current config.
  implication: The test is RED for the exact producer-side contract gap and can now guard the minimal config correction.
- timestamp: 2026-08-31T18:13:00+03:00
  checked: Focused CMS config regression test after adding quote double and restoring the original schema.
  found: Exit 0 with 1 pass and 0 failures.
  implication: The producer-side setting and both date-only widgets are now locked by runnable regression coverage.
- timestamp: 2026-08-31T18:14:00+03:00
  checked: Parsed updated config, Astro quoted-frontmatter behavior, focused impossible published/update date tests, git diff, and whitespace check.
  found: Config resolves output.yaml.quote to double; Astro returns the quoted date as string 2026-08-31; both strict calendar tests pass; diff is limited to config and focused CMS test with no whitespace errors.
  implication: The unsafe normalizer/schema/test changes are fully reverted and proportional verification supports running the complete repository gate.
- timestamp: 2026-08-31T18:22:00+03:00
  checked: Fresh complete npm run verify gate after the producer-side fix.
  found: Exit 0; native tests 277/277, Astro diagnostics 0 errors/warnings/hints, static build 9 pages, and Playwright 50/50.
  implication: The minimal config fix preserves content semantics, CMS security, launch checks, rendering, accessibility, and browser behavior across the repository.

## Resolution

root_cause: Sveltia's date-only widget stores a YYYY-MM-DD string, but its default plain YAML serialization emitted that string unquoted; Astro's js-yaml parser then constructed a Date before Zod, while the first attempted normalizer unsafely accepted rollover and timestamp Dates after source validity was lost.
fix: Enabled Sveltia 0.201.1's official output.yaml.quote double option, restored the original z.string date schema, removed normalizeDateInput, and replaced its test with a focused CMS configuration regression.
verification: Focused RED/GREEN passed; parsed config and quoted Astro frontmatter passed; strict impossible-date tests passed; full npm run verify exited 0 with 277 native tests, zero Astro diagnostics, a 9-page build, and 50 browser tests.
files_changed:
  - public/admin/config.yml
  - tests/cms-security.test.ts
