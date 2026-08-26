import { getCollection } from "astro:content";

import {
  assertPreviewMode,
  assertUniqueArticlePaths,
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
  assertPreviewMode(import.meta.env.DEV);
  return getValidatedArticles();
}
