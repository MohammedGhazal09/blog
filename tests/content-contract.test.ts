import assert from "node:assert/strict";
import test from "node:test";

import {
  articlePath,
  assertPreviewMode,
  selectPublicArticles,
  validateArticleData,
} from "../src/lib/content-contract.ts";
import {
  approvedMdxComponentNames,
  assertAllowedMdxSource,
} from "../src/lib/mdx-policy.ts";

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

test("approved MDX uses ContractNote without article imports", () => {
  assert.deepEqual(approvedMdxComponentNames, ["ContractNote"]);
  assert.doesNotThrow(() =>
    assertAllowedMdxSource(
      "# عنوان الاختبار\n\n<ContractNote>محتوى معتمد</ContractNote>",
      "approved-contract-note.mdx",
      approvedMdxComponentNames,
    ),
  );
});

const rejectedMdxSources = [
  {
    sourceId: "article-import.mdx",
    source: 'import ContractNote from "../components/ContractNote.astro"\n\n# عنوان',
    expected: /article-import\.mdx.*top-level ESM import/i,
  },
  {
    sourceId: "article-export.mdx",
    source: "export const metadata = {}\n\n# عنوان",
    expected: /article-export\.mdx.*top-level ESM export/i,
  },
  {
    sourceId: "article-script-lower.mdx",
    source: "<script>alert('x')</script>",
    expected: /article-script-lower\.mdx.*script tag/i,
  },
  {
    sourceId: "article-script-case-spacing.mdx",
    source: '<ScRiPt   type="module">alert("x")</ScRiPt>',
    expected: /article-script-case-spacing\.mdx.*script tag/i,
  },
  {
    sourceId: "article-iframe-lower.mdx",
    source: '<iframe src="https://example.com"></iframe>',
    expected: /article-iframe-lower\.mdx.*iframe tag/i,
  },
  {
    sourceId: "article-iframe-case-spacing.mdx",
    source: '<IFRAME   title="اختبار" src="https://example.com"></IFRAME>',
    expected: /article-iframe-case-spacing\.mdx.*iframe tag/i,
  },
  {
    sourceId: "article-unknown-component.mdx",
    source: "<UnknownCard>غير معتمد</UnknownCard>",
    expected: /article-unknown-component\.mdx.*UnknownCard/i,
  },
] as const;

for (const { sourceId, source, expected } of rejectedMdxSources) {
  test(`rejects ${sourceId} with its failed MDX rule or component`, () => {
    assert.throws(
      () => assertAllowedMdxSource(source, sourceId, approvedMdxComponentNames),
      expected,
    );
  });
}

test("frontmatter and code examples do not trigger the MDX policy", () => {
  const source = `---
example: "import Thing from 'thing' <script> <UnknownCard>"
---

# أمثلة توثيقية

\`\`\`mdx
export const example = true
<iframe src="https://example.com"></iframe>
<UnknownCard />
\`\`\`

اكتب \`<script>alert('example')</script>\` أو \`<UnknownCard />\` داخل الشرح.

<ContractNote>ملاحظة معتمدة خارج الأمثلة</ContractNote>
`;

  assert.doesNotThrow(() =>
    assertAllowedMdxSource(source, "code-examples.mdx", approvedMdxComponentNames),
  );
});
