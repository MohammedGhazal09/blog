# Stack Research

**Domain:** Arabic-only, SEO-first Islamic content directory and knowledge base
**Researched:** 2026-08-26
**Confidence:** HIGH

## Executive Recommendation

Build v1 as a **fully static Astro 7 site** deployed to **Cloudflare Pages**. Keep articles in a single validated Astro content collection containing Markdown and MDX files. Astro should pre-render every public route to HTML at build time; do not add a server adapter, UI framework, CMS, database, authentication layer, or client-side router.

Use the platform directly for Arabic: `<html lang="ar" dir="rtl">`, semantic HTML, CSS logical properties, and `<bdi>`/explicit `dir="ltr"` only around mixed-direction values such as URLs. Use Astro's native `<head>` rendering for page metadata and JSON-LD, its `site` setting for absolute canonical URLs, and the official sitemap integration. This avoids i18n, SEO, schema, and CSS dependencies that do not earn their cost on an Arabic-only site.

Use `lite-youtube-embed` for the required player. It delays the real `youtube-nocookie.com` iframe until activation and provides a `<noscript>` iframe fallback, preventing a normal YouTube iframe from dominating initial page weight. Use hosted Plausible via the site-specific `<script>` snippet—no npm analytics SDK—and enable its automatic outbound-link measurement so direct YouTube/video/channel links are reported without custom event code.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Astro | 7.2.7 | Static site framework, routing, layouts, build pipeline, content rendering | Content-focused and server-first; its default static output pre-renders routes and strips client JavaScript from ordinary components. This directly satisfies crawlability and lightweight-delivery requirements. | HIGH — current npm release and official release/docs verified |
| Node.js | 24.19.0 LTS (Krypton) | Build runtime | Current supported LTS on the research date. Astro 7 requires Node `>=22.12.0`; Node 24 avoids using the non-LTS Node 26 line in production builds. | HIGH — official Node release index and Astro engine metadata verified |
| npm | 11.17.0 with `package-lock.json` | Package management | Bundled with Node 24.19.0 and sufficient for this small dependency graph; introducing pnpm/Bun brings no v1 benefit. Commit the lockfile. | HIGH — official Node release index verified |
| TypeScript | 6.0.3 | Content schema and component/config type checking | Use TypeScript only where Astro naturally uses it. Version 6.0.3 is the newest line compatible with `@astrojs/check@0.9.10`; do not take npm's TypeScript 7 latest tag yet. | HIGH — npm peer metadata verified |
| HTML + modern CSS | Living standards | Arabic semantics, responsive layout, typography, RTL/bidirectional handling | Native `lang`, `dir`, `<bdi>`, media queries, logical properties, and system fonts fully cover v1. No RTL framework or CSS-in-JS layer is needed. | HIGH — current MDN platform documentation verified |

### Supporting Libraries and Services

| Library / Service | Version | Purpose | When to Use | Confidence |
|-------------------|---------|---------|-------------|------------|
| `@astrojs/mdx` | 7.0.8 | Official `.mdx` support | Install because the publishing requirement explicitly allows MDX components inside articles. A content collection glob can include both `*.md` and `*.mdx`. | HIGH — current release, Astro `^7.0.0` peer, and official integration docs verified |
| `@astrojs/sitemap` | 3.7.3 | Generate XML sitemap files during `astro build` | Always. Configure the exact production origin in Astro's `site` option; use a static `public/robots.txt` that points to the generated sitemap. | HIGH — current official release/docs verified |
| `lite-youtube-embed` | 0.3.4 | Lightweight YouTube facade/custom element | Wrap it once in an Astro `YouTubeEmbed.astro` component and pass a validated video ID plus Arabic title/play label. It uses `youtube-nocookie.com` for the activated iframe and retains a no-script iframe. | HIGH — current npm release and tagged source commit verified |
| Plausible Analytics Cloud | Hosted service; unversioned snippet | Privacy-conscious traffic analytics and automatic outbound-link measurement | Add the account's site-specific snippet directly to the shared head. Enable **Outbound links** in Plausible settings and filter URLs/domains for `youtube.com`/`youtu.be`. No npm package is needed. | HIGH — official docs updated 2026-08-14 verified |
| Astro content collections (`astro:content`, `astro/loaders`, `astro/zod`) | Built into Astro 7.2.7 | File discovery, frontmatter validation, typed queries, render Markdown/MDX | Define one `articles` collection with a filesystem `glob()` loader and a schema for title, description, publication date, section, slug policy, YouTube ID/URL, and draft state. Do not install Zod separately; import the framework export. | HIGH — official current content-collection docs verified through Context7 |

### Development Tools

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| `@astrojs/check` | 0.9.10 | Astro/TypeScript diagnostics | Run `astro check` before every production build. Pair with TypeScript 6.0.3 because the current peer range is `^5.0.0 || ^6.0.0`. |
| Prettier | 3.9.6 | Deterministic formatting | Keep editorial diffs readable; apply to code and Markdown/MDX. |
| `prettier-plugin-astro` | 0.14.1 | Format `.astro` files | Configure once with Prettier; no ESLint stack is needed for this small static site. |
| Astro production build | 7.2.7 | Primary runnable verification | Minimum CI gate: `npm run check && npm run build`. A successful build validates content schemas, static paths, and integration output. |
| Google Search Console | Hosted service | Index coverage and sitemap submission | Submit the canonical sitemap after launch; this is operational tooling, not a code dependency. |
| PageSpeed Insights / Lighthouse | Hosted/browser tooling | Performance, SEO, and accessibility spot checks | Use against preview/production URLs. Do not add a Lighthouse npm harness until recurring regressions justify it. |

## Required Configuration Pattern

Keep the framework configuration intentionally small:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://<canonical-production-domain>',
  output: 'static',
  integrations: [mdx(), sitemap()],
});
```

`output: 'static'` is Astro's default, but keeping it explicit documents the v1 architecture. Do not add `@astrojs/cloudflare`: Cloudflare Pages serves the generated `dist/` directory as static assets and needs no runtime adapter.

The shared layout should render `<html lang="ar" dir="rtl">`. Prefer CSS logical properties (`margin-inline`, `padding-inline`, `border-inline-start`, `text-align: start`) over left/right overrides. Isolate Latin URLs, handles, and other mixed-direction fragments with `<bdi>` or a narrowly applied `dir="ltr"`; do not set direction with CSS alone.

Generate SEO with one local Astro head component using native tags: unique Arabic `<title>` and description, `link[rel=canonical]`, robots directive, Open Graph/Twitter metadata, and JSON-LD. Construct canonicals from `new URL(Astro.url.pathname, Astro.site)`. A third-party SEO wrapper would save little code while hiding output that must be inspected.

## Installation

```bash
# Start from Astro's minimal template, then pin the researched baseline.
npm create astro@latest -- . --template minimal

# Runtime/build dependencies
npm install astro@7.2.7 @astrojs/mdx@7.0.8 @astrojs/sitemap@3.7.3 lite-youtube-embed@0.3.4

# Development-only checks and formatting
npm install -D @astrojs/check@0.9.10 typescript@6.0.3 prettier@3.9.6 prettier-plugin-astro@0.14.1
```

Use the Plausible dashboard's generated site-specific snippet directly; do **not** install `@plausible-analytics/tracker` unless a future interactive application needs a programmatic analytics API.

Recommended package scripts:

```json
{
  "scripts": {
    "dev": "astro dev",
    "check": "astro check",
    "build": "astro build",
    "preview": "astro preview",
    "format": "prettier --write ."
  }
}
```

## Hosting and Deployment

Use **Cloudflare Pages** with Git integration:

| Setting | Value |
|---------|-------|
| Production branch | `main` |
| Build command | `npm run check && npm run build` |
| Build output directory | `dist` |
| Build runtime | Node 24 LTS; pin `24.19.0` in the provider setting and a version file |
| Runtime/server adapter | None |
| Secrets/environment | None required for v1; Plausible's public snippet contains no secret |

Connect the custom domain before launch, set Astro `site` to that exact HTTPS origin, and redirect the `*.pages.dev` hostname plus the non-canonical `www`/apex variant to the chosen canonical host. This prevents duplicate public origins and makes sitemap/canonical generation deterministic. Every content commit triggers a complete static rebuild; at v1 scale this is simpler than SSR or incremental rendering.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Astro 7 static output | Hugo | Choose Hugo only if the owner drops MDX/components entirely and the team prefers Go templates. Hugo is excellent for Markdown-only sites, but it does not match the explicit MDX workflow as directly. |
| Astro 7 static output | Eleventy | Choose Eleventy if the team strongly prefers a lower-level JavaScript templating pipeline and accepts assembling content validation, MDX, and SEO conventions themselves. Astro is more cohesive for this brief. |
| Astro 7 static output | Next.js | Choose Next.js only after the product genuinely becomes a dynamic React application with authenticated or request-time features. It is unnecessary for static Arabic articles. |
| Cloudflare Pages static hosting | Netlify or Vercel | Use either when an existing organization already standardizes billing, previews, domains, and observability there. No application rewrite is required because `dist/` is portable. |
| Plausible Cloud | Cloudflare Web Analytics | Use Cloudflare's native analytics only if automatic outbound YouTube click reporting is removed. Its official Web Analytics docs cover traffic/performance, while Plausible explicitly documents automatic outbound-link goals and URL filtering. |
| Plausible Cloud | Self-hosted Umami/Plausible | Self-host only when data residency, ownership, or cost at proven traffic volume justifies operating a database, upgrades, backups, and monitoring. That contradicts v1's no-database simplicity. |
| `lite-youtube-embed` | Native lazy `<iframe>` | Use a normal `loading="lazy"` iframe only after measuring that the facade is unnecessary. The standard YouTube player still initializes much more third-party code once near the viewport. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| React, Vue, Svelte, or a client SPA/router | The public experience is document navigation. A component runtime adds JavaScript without improving the primary Google → article → YouTube journey. | Astro components rendered to static HTML |
| Next.js/Nuxt SSR, Astro server output, or `@astrojs/cloudflare` | No request-time data, accounts, personalization, or mutations exist in v1. A server runtime adds cold starts, runtime failure modes, and deployment coupling. | Astro static output served from `dist/` |
| WordPress, a headless CMS, database, ORM, or authentication package | Explicitly out of scope and would create security, backup, migration, and editorial-admin work before the publishing model is validated. | Git-tracked Markdown/MDX content collections |
| Tailwind, component kits, CSS-in-JS, or RTL transformation plugins | The site needs a tiny layout and typography layer. Native CSS logical properties already handle RTL and produce less build/config/runtime surface. | One small global stylesheet plus scoped Astro styles |
| i18n/routing libraries | There is one language and no locale switching. | Root `lang="ar" dir="rtl"` and Arabic routes/content |
| `astro-seo`, schema builder packages, or meta-tag managers | A single local head component covers the required tags transparently and avoids another compatibility layer. | Native Astro head markup and plain JSON-LD objects |
| GA4/Google Tag Manager | Disproportionate script/configuration and privacy governance for the two required measurements. | Plausible's single hosted snippet and outbound-link goal |
| Algolia/Pagefind/client search in v1 | Search is not an active requirement and the launch corpus is three representative articles. | Section indexes and crawlable navigation; add static search only when corpus size makes browsing inadequate |
| Remote web-font services | They add a render dependency, transfer weight, and another third-party request. | Arabic-capable system font stack; self-host one subsetted WOFF2 only if brand/readability testing proves necessary |
| Remark/rehype plugin bundles | Current content requirements need headings, prose, links, and embedded Astro components—not custom Markdown transforms. | Astro's built-in Markdown/MDX pipeline |

## Stack Patterns by Variant

**Default v1:**

- Pre-render every route at build time.
- Use one content collection and encode section as validated frontmatter rather than three parallel pipelines.
- Ship no client JavaScript except the small YouTube facade and Plausible snippet.
- Measure outbound clicks on the explicit YouTube link/button; do not attempt to infer iframe watch time.

**If strict consent rules must prevent any YouTube request before activation:**

- Store each approved poster image locally and configure the facade to use it.
- Keep the `youtube-nocookie.com` iframe click-activated.
- Add this only after the project's legal/privacy requirement is defined: `lite-youtube-embed` otherwise fetches its poster from `i.ytimg.com` before player activation.

**If the owner later needs browser-based editing:**

- Reassess a Git-backed CMS first, because it can preserve static builds and content files.
- Do not add it speculatively; v1 publishing through Markdown/MDX is an explicit product constraint.

**If the site eventually needs request-time personalization or accounts:**

- Treat that as a new architecture milestone and select an Astro deployment adapter then.
- Do not carry a dormant server runtime through v1.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `astro@7.2.7` | Node `>=22.12.0`, npm `>=9.6.5` | Node 24.19.0 LTS and npm 11.17.0 satisfy the official engine range. |
| `@astrojs/mdx@7.0.8` | `astro@^7.0.0` | Exact current major pairing verified from npm peer metadata. |
| `@astrojs/check@0.9.10` | TypeScript `^5.0.0 || ^6.0.0` | Pin `typescript@6.0.3`. TypeScript 7.0.2 is npm `latest` on the research date but lies outside the checker's declared peer range. |
| `@astrojs/sitemap@3.7.3` | Astro integration API | Current official integration release. Validate with the standard `astro build` gate after upgrades. |
| `prettier@3.9.6` | `prettier-plugin-astro@0.14.1` | Current releases on the research date; formatting is development-only and does not affect output. |
| `lite-youtube-embed@0.3.4` | Browser Custom Elements, no framework runtime | Encapsulate the import/markup in one Astro component so future replacement touches one file. |

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Astro static framework and content pipeline | HIGH | Context7 copy of current official Astro docs, official releases, and npm engine/peer metadata |
| Arabic RTL implementation | HIGH | Stable HTML/CSS platform primitives verified in current MDN docs; no library-dependent claim |
| YouTube performance approach | HIGH | Package 0.3.4 metadata and released source verify click activation, `youtube-nocookie.com`, accessible focus handling, and no-script iframe |
| Analytics choice | HIGH | Plausible's official docs explicitly document automatic outbound-link goals, URL reporting/filtering, and dashboard-controlled activation |
| Cloudflare Pages deployment | HIGH | Official Pages Astro guide and build-configuration docs list `npm run build` and `dist` for static Astro deployment |
| Long-term editorial workflow | MEDIUM | Git-authored MDX is an explicit project decision, but owner usability must still be validated with real publishing after launch |

## Sources

All sources accessed **2026-08-26** unless otherwise noted.

- [Astro configuration reference](https://docs.astro.build/en/reference/configuration-reference/) — `output: 'static'`, production `site`, canonical/sitemap URL basis. **HIGH**.
- [Astro islands architecture](https://docs.astro.build/en/concepts/islands/) — static HTML/CSS and zero client JavaScript by default. **HIGH**.
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/) and [content loader reference](https://docs.astro.build/en/reference/content-loader-reference/) — `glob()` loading, schema validation, querying, and Markdown/MDX rendering. Retrieved through Context7 ID `/withastro/docs`. **HIGH**.
- [Official Astro MDX integration](https://docs.astro.build/en/guides/integrations-guide/mdx/) — integration setup and mixed `*.md`/`*.mdx` collections. **HIGH**.
- [Official Astro sitemap integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — build-time sitemap generation and `site` requirement. **HIGH**.
- [Astro 7.2.7 release](https://github.com/withastro/astro/releases/tag/astro%407.2.7) (published 2026-08-25), [`@astrojs/mdx` 7.0.8 release](https://github.com/withastro/astro/releases/tag/%40astrojs/mdx%407.0.8) (published 2026-08-24), and [`@astrojs/sitemap` 3.7.3 release](https://github.com/withastro/astro/releases/tag/%40astrojs/sitemap%403.7.3) (published 2026-05-26). **HIGH**.
- [npm registry: Astro](https://registry.npmjs.org/astro/latest), [MDX](https://registry.npmjs.org/@astrojs/mdx/latest), [sitemap](https://registry.npmjs.org/@astrojs/sitemap/latest), [Astro check](https://registry.npmjs.org/@astrojs/check/latest), and [TypeScript 6.0.3](https://registry.npmjs.org/typescript/6.0.3) — exact versions, engines, and peer ranges. **HIGH**.
- [Node.js official release index](https://nodejs.org/dist/index.json) — Node 24.19.0 LTS Krypton and bundled npm 11.17.0, published 2026-08-03. **HIGH**.
- [MDN `dir`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/dir), [`lang`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/lang), [`<bdi>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi), and [CSS logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values) — native RTL and bidirectional primitives. **HIGH**.
- [`lite-youtube-embed` npm metadata](https://registry.npmjs.org/lite-youtube-embed/0.3.4) and [released source commit](https://github.com/paulirish/lite-youtube-embed/blob/674a402883c668066f940f08e757a11528299ef8/src/lite-yt-embed.js) — version, lazy activation, no-cookie embed URL, accessible iframe focus/title, and no-script fallback. **HIGH**.
- [Plausible outbound-link tracking](https://plausible.io/docs/outbound-link-click-tracking) and [tracking script setup](https://plausible.io/docs/plausible-script) — automatic outbound goals and direct snippet installation; docs last updated 2026-08-14. **HIGH**.
- [Cloudflare Pages Astro guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) and [Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/) — static Astro build command/output and Git deployment behavior; docs last updated 2026-04-21. **HIGH**.
- [Cloudflare Web Analytics overview](https://developers.cloudflare.com/web-analytics/) — traffic/performance analytics scope; docs last updated 2026-04-16. Used only to bound the alternative recommendation. **MEDIUM** because absence of a documented outbound-event feature is not a guarantee that none exists outside the reviewed docs.

---
*Stack research for: مدونة أحمد المنجاوي*
*Researched: 2026-08-26*
