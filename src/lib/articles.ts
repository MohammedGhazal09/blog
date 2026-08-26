import { getCollection } from "astro:content";

import {
  assertUniqueArticlePaths,
  selectPreviewArticles,
  selectPublicArticles,
} from "./content-contract.ts";

async function getValidatedArticles() {
  const articles = await getCollection("articles");
  assertUniqueArticlePaths(articles);
  return articles;
}

export async function getPublicArticles() {
  return selectPublicArticles(await getValidatedArticles());
}

export async function getPreviewArticles() {
  return selectPreviewArticles(
    await getValidatedArticles(),
    import.meta.env.DEV,
  );
}
