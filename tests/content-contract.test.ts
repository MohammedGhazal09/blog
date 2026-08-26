import assert from "node:assert/strict";
import test from "node:test";

import {
  articlePath,
  assertPreviewMode,
  selectPublicArticles,
  validateArticleData,
} from "../src/lib/content-contract.ts";

const validArticle = {
  id: "contract-markdown",
  data: {
    title: "اختبار عقد المحتوى",
    description: "سجل صالح يثبت عقد المحتوى في المرحلة الأولى.",
    summary: "الخلاصة التجريبية لعقد المحتوى.",
    section: "generalIssues",
    author: "ahmedElMangawy",
    slug: "اختبار-عقد-المحتوى",
    publishedAt: "2026-08-01",
    draft: false,
    youtubeId: "dQw4w9WgXcQ",
  },
};

test("valid Arabic article data keeps an explicit title-independent path", () => {
  assert.doesNotThrow(() =>
    validateArticleData(validArticle.data, validArticle.id, { today: "2026-08-26" }),
  );
  assert.equal(articlePath(validArticle), "/القضايا-العامة/اختبار-عقد-المحتوى/");
  assert.equal(
    articlePath({
      ...validArticle,
      data: { ...validArticle.data, title: "عنوان مختلف" },
    }),
    articlePath(validArticle),
  );
});

test("production and explicit development preview keep draft visibility separate", () => {
  const draft = {
    ...validArticle,
    id: "contract-draft",
    data: { ...validArticle.data, slug: "مسودة-اختبار-العقد", draft: true },
  };

  assert.deepEqual(selectPublicArticles([validArticle, draft]), [validArticle]);
  assert.doesNotThrow(() => assertPreviewMode(true));
  assert.throws(() => assertPreviewMode(false), /preview.*development/i);
});
