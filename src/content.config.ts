import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

import { validateArticleData } from "./lib/content-contract.ts";

const nonEmpty = z.string().refine((value) => value.trim().length > 0, "must not be empty");

const articles = defineCollection({
  loader: glob({ base: "./src/content/articles", pattern: "**/*.{md,mdx}" }),
  schema: z
    .object({
      title: nonEmpty,
      description: nonEmpty,
      summary: nonEmpty,
      section: nonEmpty,
      author: nonEmpty,
      slug: nonEmpty,
      publishedAt: z.string(),
      updatedAt: z.string().optional(),
      draft: z.boolean(),
      youtubeId: z.string(),
    })
    .superRefine((data, context) => {
      try {
        validateArticleData(data, `article:${data.slug || "unknown"}`);
      } catch (error) {
        context.addIssue({
          code: "custom",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }),
});

export const collections = { articles };
