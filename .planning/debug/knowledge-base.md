# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## sveltia-date-schema — Quote Sveltia dates at the CMS producer
- **Date:** 2026-08-31
- **Error patterns:** publishedAt, Expected type string, received object, js-yaml Date rollover, timestamp scalar, normalizeDateInput
- **Root cause:** Sveltia's date widget stores a YYYY-MM-DD string, but default plain YAML output let js-yaml construct lossy Date objects; the first normalizer then bypassed exact syntax and calendar validation because invalid and legitimate source lexemes could become indistinguishable Dates.
- **Fix:** Enable Sveltia 0.201.1 `output.yaml.quote: double`; keep the strict `z.string()` schema and do not preprocess Date objects.
- **Files changed:** public/admin/config.yml, tests/cms-security.test.ts
---
