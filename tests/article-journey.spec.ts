import { expect, test } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";

const markdownPath =
  "/القضايا-العامة/اختبار-عقد-المحتوى/";

test("complete Markdown reader", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
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

  const bodyStyle = await page.locator("body").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      color: style.color,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
    };
  });
  expect(bodyStyle).toEqual({
    backgroundColor: "rgb(255, 253, 248)",
    color: "rgb(28, 25, 23)",
    fontSize: "18px",
    fontWeight: "400",
    lineHeight: "34.2px",
  });

  await directLink.focus();
  const directLinkStyle = await directLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      minBlockSize: style.minBlockSize,
      outlineColor: style.outlineColor,
      outlineWidth: style.outlineWidth,
    };
  });
  expect(directLinkStyle).toEqual({
    backgroundColor: "rgb(22, 101, 52)",
    minBlockSize: "44px",
    outlineColor: "rgb(22, 101, 52)",
    outlineWidth: "3px",
  });

  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  }

  const routeSource = readFileSync(
    "src/pages/[section]/[slug].astro",
    "utf8",
  );
  const playerSource = readFileSync(
    "src/components/YouTubePlayer.astro",
    "utf8",
  );
  expect(routeSource.match(/<h1\b/giu)).toHaveLength(1);
  expect(`${routeSource}\n${playerSource}`).not.toMatch(
    /<iframe\b|<link[^>]+rel=["']preconnect|<script[^>]+src=|poster=|target=/giu,
  );
  expect(
    existsSync(
      "dist/القضايا-العامة/مسودة-اختبار-العقد/index.html",
    ),
  ).toBe(false);
  expect(
    existsSync(
      "dist/القضايا-العامة/اختبار-عقد-المحتوى/index.html",
    ),
  ).toBe(true);
  expect(
    existsSync(
      "dist/القسم-العلمي/اختبار-مكون-ام-دي-اكس/index.html",
    ),
  ).toBe(true);

  await context.close();
});
