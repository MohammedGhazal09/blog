import { getCollection } from "astro:content";

import { assertPublicArticleApprovals } from "./approval-contract.ts";
import {
  assertLaunchSectionCoverage,
  assertUniqueArticlePaths,
  selectPreviewArticles,
  selectPublicArticles,
} from "./content-contract.ts";

async function getValidatedArticles() {
  const articles = await getCollection("articles");
  assertUniqueArticlePaths(articles);
  assertPublicArticleApprovals(articles);
  return articles;
}

export async function getPublicArticles() {
  const articles = selectPublicArticles(await getValidatedArticles());
  if (import.meta.env.MODE === "launch-readiness") {
    assertLaunchSectionCoverage(articles);
  }
  return articles;
}

export async function getPreviewArticles() {
  return selectPreviewArticles(
    await getValidatedArticles(),
    import.meta.env.DEV,
  );
}
