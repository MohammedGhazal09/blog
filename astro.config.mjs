import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { preflightArticleSources } from "./src/lib/mdx-policy.ts";
import { LOCAL_SITE_ORIGIN } from "./src/lib/site-origin.ts";

preflightArticleSources(new URL("./src/content/articles/", import.meta.url));

export default defineConfig({
  site: LOCAL_SITE_ORIGIN,
  output: "static",
  trailingSlash: "always",
  integrations: [mdx(), sitemap()],
});
