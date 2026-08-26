import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";
import { preflightArticleSources } from "./src/lib/mdx-policy.ts";

preflightArticleSources(new URL("./src/content/articles/", import.meta.url));

export default defineConfig({
  output: "static",
  trailingSlash: "always",
  integrations: [mdx()],
});
