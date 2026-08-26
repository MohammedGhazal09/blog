import { expect, test } from "@playwright/test";

const markdownPath =
  "/القضايا-العامة/اختبار-عقد-المحتوى/";

test("complete Markdown reader", async ({ page }) => {
  await page.goto(markdownPath);

  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("اختبار عقد المحتوى");

  const article = page.locator("main > article");
  await expect(article).toContainText("القسم:");
  await expect(article).toContainText("القضايا العامة");
  await expect(article).toContainText("الكاتب:");
  await expect(article).toContainText("أحمد المنجاوي");
  await expect(article).toContainText("نُشر في:");

  const summaryHeading = page.getByRole("heading", {
    level: 2,
    name: "الخلاصة",
  });
  await expect(summaryHeading).toBeVisible();
  await expect(summaryHeading.locator("xpath=following-sibling::p[1]")).toContainText(
    "هذه خلاصة تجريبية تثبت ظهور المحتوى العام في مساره العربي الصريح.",
  );

  const introduction = article.getByText(
    "تبدأ هذه المادة بمقدمة عربية كاملة تشرح غرض سجل الاختبار للقارئ.",
    { exact: true },
  );
  const conclusion = page.getByRole("heading", {
    level: 2,
    name: "الخاتمة",
  });
  await expect(introduction).toBeVisible();
  await expect(conclusion).toBeVisible();
  expect(
    await introduction.evaluate(
      (node, later) =>
        Boolean(later) &&
        Boolean(node.compareDocumentPosition(later as Node) & Node.DOCUMENT_POSITION_FOLLOWING),
      await conclusion.elementHandle(),
    ),
  ).toBe(true);

  const directLink = page.getByRole("link", {
    name: "مشاهدة الفيديو على يوتيوب",
  });
  await expect(directLink).toHaveAttribute(
    "href",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  );
  await expect(directLink).not.toHaveAttribute("target", /.+/);
});
