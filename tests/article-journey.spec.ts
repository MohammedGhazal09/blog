import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";

type ArticleFixture = {
  format: "Markdown" | "MDX";
  path: string;
  title: string;
  section: string;
  summary: string;
  introduction: string;
  firstHeading: string;
  nestedHeading: string;
  conclusion: string;
  hasOptionalProvenance: boolean;
};

const articles: readonly ArticleFixture[] = [
  {
    format: "Markdown",
    path: "/القضايا-العامة/اختبار-عقد-المحتوى/",
    title: "اختبار عقد المحتوى",
    section: "القضايا العامة",
    summary:
      "هذه خلاصة تجريبية تثبت ظهور المحتوى العام في مساره العربي الصريح.",
    introduction:
      "تبدأ هذه المادة بمقدمة عربية كاملة تشرح غرض سجل الاختبار للقارئ.",
    firstHeading: "لماذا يوجد هذا السجل؟",
    nestedHeading: "ما الذي يثبته؟",
    conclusion:
      "يكتمل اختبار الرحلة عندما يستطيع القارئ قراءة هذه المادة بترتيبها الدلالي ثم الانتقال إلى الفيديو المطابق من رابط عربي واضح ودائم.",
    hasOptionalProvenance: true,
  },
  {
    format: "MDX",
    path: "/القسم-العلمي/اختبار-مكون-ام-دي-اكس/",
    title: "اختبار مكون إم دي إكس",
    section: "القسم العلمي",
    summary: "هذه خلاصة تجريبية تثبت عمل المكون المعتمد عبر عقد المحتوى نفسه.",
    introduction:
      "تبدأ هذه المادة بمقدمة عربية كاملة تشرح غرض سجل إم دي إكس للقارئ.",
    firstHeading: "لماذا يوجد سجل إم دي إكس؟",
    nestedHeading: "ما الذي يثبته؟",
    conclusion:
      "يكتمل اختبار إم دي إكس عندما يقرأ القارئ المادة كاملة ثم يصل إلى رابط الفيديو المطابق من دون اعتماد على المكوّن المعتمد أو JavaScript.",
    hasOptionalProvenance: false,
  },
];

const routeSource = readFileSync("src/pages/[section]/[slug].astro", "utf8");
const playerSource = readFileSync("src/components/YouTubePlayer.astro", "utf8");

function isYouTubeFamilyRequest(url: string): boolean {
  const hostname = new URL(url).hostname;
  return ["youtube", "youtu.be", "ytimg", "googlevideo"].some((host) =>
    hostname.includes(host),
  );
}

async function openArticle(page: Page, fixture: ArticleFixture): Promise<void> {
  await page.goto(fixture.path);
  await expect(page.locator("main > article")).toBeVisible();
}

async function expectBefore(first: Locator, second: Locator): Promise<void> {
  const secondHandle = await second.elementHandle();
  expect(secondHandle).not.toBeNull();
  expect(
    await first.evaluate(
      (node, later) =>
        Boolean(later) &&
        Boolean(
          node.compareDocumentPosition(later as Node) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      secondHandle,
    ),
  ).toBe(true);
}

for (const fixture of articles) {
  test.describe(fixture.format, () => {
    test("Arabic surface uses exact reader-facing copy", async ({ page }) => {
      await openArticle(page, fixture);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        fixture.title,
      );
      await expect(page.locator("dt")).toContainText([
        "القسم:",
        "الكاتب:",
        "نُشر في:",
      ]);
      await expect(
        page.getByRole("heading", { level: 2, name: "الخلاصة" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", {
          level: 2,
          name: "الفيديو المرتبط بالمقال",
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "مشاهدة الفيديو على يوتيوب" }),
      ).toBeVisible();

      const controlNames = await page
        .locator("a, button, [role='status']")
        .allTextContents();
      for (const name of controlNames) {
        expect(name.trim()).not.toMatch(
          /\b(?:watch|video|play|loading|error|references?)\b/iu,
        );
      }
    });

    test("Arabic document semantics expose one ordered RTL article", async ({
      page,
    }) => {
      await openArticle(page, fixture);

      await expect(page.locator("html")).toHaveAttribute("lang", "ar");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("main > article")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);

      const levels = await page
        .locator(
          "article h1, article h2, article h3, article h4, article h5, article h6",
        )
        .evaluateAll((headings) =>
          headings.map((heading) => Number(heading.tagName.slice(1))),
        );
      expect(levels[0]).toBe(1);
      for (let index = 1; index < levels.length; index += 1) {
        expect(levels[index] - levels[index - 1]).toBeLessThanOrEqual(1);
      }
    });

    test("complete text-first journey survives disabled JavaScript", async ({
      browser,
    }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await openArticle(page, fixture);

      const title = page.getByRole("heading", {
        level: 1,
        name: fixture.title,
      });
      const facts = page.locator(".article-facts");
      const summary = page.locator(".article-summary");
      const introduction = page.getByText(fixture.introduction, {
        exact: true,
      });
      const firstHeading = page.getByRole("heading", {
        level: 2,
        name: fixture.firstHeading,
      });
      const nestedHeading = page.getByRole("heading", {
        level: 3,
        name: fixture.nestedHeading,
      });
      const conclusionHeading = page.getByRole("heading", {
        level: 2,
        name: "الخاتمة",
      });
      const conclusion = page.getByText(fixture.conclusion, { exact: true });
      const media = page.locator(".media-continuation");

      for (const element of [
        title,
        facts,
        summary,
        introduction,
        firstHeading,
        nestedHeading,
        conclusionHeading,
        conclusion,
        media,
      ]) {
        await expect(element).toBeVisible();
      }

      await expectBefore(title, facts);
      await expectBefore(facts, summary);
      await expectBefore(summary, introduction);
      await expectBefore(introduction, firstHeading);
      await expectBefore(firstHeading, nestedHeading);
      await expectBefore(nestedHeading, conclusionHeading);
      await expectBefore(conclusionHeading, conclusion);
      if (fixture.hasOptionalProvenance) {
        const references = page.locator(".article-references");
        await expectBefore(conclusion, references);
        await expectBefore(references, media);
      } else {
        await expectBefore(conclusion, media);
      }

      await expect(
        page.getByRole("button", { name: "تشغيل الفيديو هنا" }),
      ).toHaveCount(0);
      await expect(page.getByRole("status")).toHaveCount(0);
      await expect(page.locator("iframe")).toHaveCount(0);
      await expect(
        page.getByRole("link", { name: "مشاهدة الفيديو على يوتيوب" }),
      ).toHaveAttribute("href", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      await context.close();
    });

    test("intent-gated player creates one focused privacy-enhanced iframe", async ({
      page,
      request,
    }) => {
      const rawResponse = await request.get(fixture.path);
      const rawHtml = await rawResponse.text();
      expect(rawHtml).toMatch(/<button[^>]+hidden[^>]+data-video-activate/iu);
      expect(rawHtml).not.toMatch(/<iframe\b/iu);

      const youtubeRequests: string[] = [];
      page.on("request", (pendingRequest) => {
        if (isYouTubeFamilyRequest(pendingRequest.url())) {
          youtubeRequests.push(pendingRequest.url());
        }
      });
      await page.route("https://www.youtube-nocookie.com/**", (route) =>
        route.abort(),
      );

      await openArticle(page, fixture);

      const region = page.locator("[data-video-region]");
      const trigger = region.getByRole("button", {
        name: "تشغيل الفيديو هنا",
      });
      await expect(
        page.getByText("لن يُحمَّل مشغّل يوتيوب إلا بعد اختيارك التشغيل.", {
          exact: true,
        }),
      ).toBeVisible();
      await expect(trigger).toBeVisible();
      await expect(page.locator("iframe")).toHaveCount(0);
      expect(youtubeRequests).toEqual([]);

      const before = await region.boundingBox();
      const detachedTrigger = await trigger.elementHandle();
      expect(before).not.toBeNull();
      expect(before!.width).toBeGreaterThan(0);
      expect(before!.height).toBeGreaterThan(0);
      expect(before!.width / before!.height).toBeCloseTo(16 / 9, 1);

      await trigger.click();

      const iframe = region.locator("iframe");
      await expect(iframe).toHaveCount(1);
      await expect(iframe).toHaveAttribute(
        "title",
        `فيديو المقال: ${fixture.title}`,
      );
      const iframeUrl = new URL((await iframe.getAttribute("src"))!);
      expect(iframeUrl.hostname).toBe("www.youtube-nocookie.com");
      expect(iframeUrl.pathname).toBe("/embed/dQw4w9WgXcQ");
      expect(iframeUrl.searchParams.get("hl")).toBe("ar");
      expect(iframeUrl.searchParams.get("autoplay")).not.toBe("1");
      await expect(iframe).toBeFocused();

      const after = await region.boundingBox();
      expect(after).not.toBeNull();
      expect(Math.abs(after!.width - before!.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(after!.height - before!.height)).toBeLessThanOrEqual(1);

      await detachedTrigger!.evaluate((button) =>
        (button as HTMLButtonElement).click(),
      );
      await expect(iframe).toHaveCount(1);
      expect(
        youtubeRequests.filter((url) =>
          url.startsWith("https://www.youtube-nocookie.com/embed/"),
        ),
      ).toHaveLength(1);
    });

    test("direct YouTube link remains a static same-tab sibling", async ({
      page,
    }) => {
      await openArticle(page, fixture);

      const region = page.locator("[data-video-region]");
      const directLink = page.getByRole("link", {
        name: "مشاهدة الفيديو على يوتيوب",
      });
      await expect(directLink).toHaveAttribute(
        "href",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      );
      await expect(directLink).not.toHaveAttribute("target", /.+/u);
      expect(
        await region.evaluate(
          (node, link) => {
            if (!(link instanceof HTMLAnchorElement)) return false;
            return (
              !node.contains(link) &&
              Boolean(
                node.compareDocumentPosition(link) &
                Node.DOCUMENT_POSITION_FOLLOWING,
              )
            );
          },
          await directLink.elementHandle(),
        ),
      ).toBe(true);
    });

    test("degraded player preserves the complete Arabic fallback", async ({
      browser,
    }) => {
      const noScriptContext = await browser.newContext({
        javaScriptEnabled: false,
      });
      const noScriptPage = await noScriptContext.newPage();
      await openArticle(noScriptPage, fixture);
      await expect(
        noScriptPage.getByText(fixture.introduction, { exact: true }),
      ).toBeVisible();
      await expect(
        noScriptPage.getByText(fixture.conclusion, { exact: true }),
      ).toBeVisible();
      await expect(
        noScriptPage.getByRole("button", { name: "تشغيل الفيديو هنا" }),
      ).toHaveCount(0);
      await expect(noScriptPage.getByRole("status")).toHaveCount(0);
      await expect(noScriptPage.locator("iframe")).toHaveCount(0);
      await expect(
        noScriptPage.getByRole("link", {
          name: "مشاهدة الفيديو على يوتيوب",
        }),
      ).toHaveAttribute("href", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      await noScriptContext.close();

      const blockedContext = await browser.newContext();
      const blockedPage = await blockedContext.newPage();
      await blockedPage.route("https://www.youtube-nocookie.com/**", (route) =>
        route.abort(),
      );
      await openArticle(blockedPage, fixture);
      await blockedPage
        .getByRole("button", { name: "تشغيل الفيديو هنا" })
        .click();
      await expect(
        blockedPage.locator("[data-video-region] iframe"),
      ).toHaveCount(1);
      await expect(
        blockedPage.getByText(fixture.conclusion, { exact: true }),
      ).toBeVisible();
      await expect(
        blockedPage.getByRole("link", {
          name: "مشاهدة الفيديو على يوتيوب",
        }),
      ).toHaveAttribute("href", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      await blockedContext.close();

      const failedContext = await browser.newContext();
      await failedContext.addInitScript(() => {
        const createElement = document.createElement.bind(document);
        document.createElement = ((
          tagName: string,
          options?: ElementCreationOptions,
        ) => {
          if (tagName.toLowerCase() === "iframe") {
            throw new Error("Controlled iframe construction failure");
          }
          return createElement(tagName, options);
        }) as typeof document.createElement;
      });
      const failedPage = await failedContext.newPage();
      await failedPage.setViewportSize({ width: 320, height: 900 });
      await openArticle(failedPage, fixture);

      const failedRegion = failedPage.locator("[data-video-region]");
      const failedTrigger = failedRegion.getByRole("button", {
        name: "تشغيل الفيديو هنا",
      });
      await failedTrigger.click();

      const status = failedPage.getByRole("status");
      await expect(status).toHaveText(
        "تعذّر تشغيل الفيديو هنا. يمكنك مشاهدة الفيديو مباشرةً على يوتيوب.",
      );
      await expect(status).toBeVisible();
      await expect(failedTrigger).toBeHidden();
      await expect(failedPage.locator("iframe")).toHaveCount(0);
      await expect(
        failedPage.getByRole("link", {
          name: "مشاهدة الفيديو على يوتيوب",
        }),
      ).toHaveAttribute("href", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");

      const regionBox = await failedRegion.boundingBox();
      const statusBox = await status.boundingBox();
      expect(regionBox).not.toBeNull();
      expect(statusBox).not.toBeNull();
      expect(statusBox!.x).toBeGreaterThanOrEqual(regionBox!.x);
      expect(statusBox!.x + statusBox!.width).toBeLessThanOrEqual(
        regionBox!.x + regionBox!.width,
      );
      expect(
        Math.abs(
          statusBox!.y +
            statusBox!.height / 2 -
            (regionBox!.y + regionBox!.height / 2),
        ),
      ).toBeLessThanOrEqual(1);
      await failedContext.close();
    });

    test("keyboard uses native activation and local focus traversal", async ({
      browser,
    }) => {
      for (const key of ["Enter", "Space"] as const) {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.route("https://www.youtube-nocookie.com/**", (route) =>
          route.abort(),
        );
        await openArticle(page, fixture);

        const region = page.locator("[data-video-region]");
        const trigger = region.getByRole("button", {
          name: "تشغيل الفيديو هنا",
        });
        const directLink = page.getByRole("link", {
          name: "مشاهدة الفيديو على يوتيوب",
        });
        expect(await page.locator("[tabindex]").count()).toBe(0);
        expect(await trigger.evaluate((node) => node.tagName)).toBe("BUTTON");
        await expect(trigger).toHaveAttribute("type", "button");
        expect(await trigger.evaluate((node) => node.tabIndex)).toBe(0);

        await trigger.focus();
        const triggerBox = await trigger.boundingBox();
        expect(triggerBox).not.toBeNull();
        expect(triggerBox!.width).toBeGreaterThanOrEqual(44);
        expect(triggerBox!.height).toBeGreaterThanOrEqual(44);
        expect(
          await trigger.evaluate((node) => {
            const style = getComputedStyle(node);
            return {
              color: style.outlineColor,
              style: style.outlineStyle,
              width: style.outlineWidth,
              offset: style.outlineOffset,
            };
          }),
        ).toEqual({
          color: "rgb(22, 101, 52)",
          style: "solid",
          width: "3px",
          offset: "3px",
        });

        await page.keyboard.press(key);
        const iframe = region.locator("iframe");
        await expect(iframe).toBeFocused();
        expect(
          await region.evaluate((node) => {
            const style = getComputedStyle(node);
            return {
              color: style.outlineColor,
              style: style.outlineStyle,
              width: style.outlineWidth,
              offset: style.outlineOffset,
            };
          }),
        ).toEqual({
          color: "rgb(22, 101, 52)",
          style: "solid",
          width: "3px",
          offset: "3px",
        });
        await page.keyboard.press("Tab");
        await expect(directLink).toBeFocused();
        const linkBox = await directLink.boundingBox();
        expect(linkBox).not.toBeNull();
        expect(linkBox!.width).toBeGreaterThanOrEqual(44);
        expect(linkBox!.height).toBeGreaterThanOrEqual(44);
        expect(
          await directLink.evaluate((node) => {
            const style = getComputedStyle(node);
            return {
              color: style.outlineColor,
              style: style.outlineStyle,
              width: style.outlineWidth,
              offset: style.outlineOffset,
            };
          }),
        ).toEqual({
          color: "rgb(22, 101, 52)",
          style: "solid",
          width: "3px",
          offset: "3px",
        });
        await page.keyboard.press("Shift+Tab");
        await expect(iframe).toBeFocused();
        await context.close();
      }
    });

    test("provenance is registry-backed and optional as one semantic unit", async ({
      page,
    }) => {
      await openArticle(page, fixture);

      const facts = page.locator(".article-facts");
      await expect(facts.getByText("القسم:", { exact: true })).toHaveCount(1);
      await expect(
        facts.getByText(fixture.section, { exact: true }),
      ).toHaveCount(1);
      await expect(facts.getByText("الكاتب:", { exact: true })).toHaveCount(1);
      await expect(
        facts.getByText("أحمد المنجاوي", { exact: true }),
      ).toHaveCount(1);
      await expect(facts.getByText("نُشر في:", { exact: true })).toHaveCount(1);
      await expect(facts.locator("time bdi[dir='auto']").first()).toBeVisible();

      const updateLabel = facts.getByText("حُدّثت المادة في:", { exact: true });
      const references = page.locator(".article-references");
      if (fixture.hasOptionalProvenance) {
        await expect(updateLabel).toHaveCount(1);
        await expect(facts.locator("time")).toHaveCount(2);
        await expect(references).toHaveCount(1);
        await expect(references.locator(":scope > h2 + ul")).toHaveCount(1);
        const referenceLink = references.getByRole("link", {
          name: "مرجع اختبار تقني آمن",
        });
        await expect(referenceLink).toHaveAttribute(
          "href",
          "https://example.com/reference",
        );
        await expect(referenceLink).not.toHaveAttribute("target", /.+/u);
      } else {
        await expect(updateLabel).toHaveCount(0);
        await expect(facts.locator("time")).toHaveCount(1);
        await expect(references).toHaveCount(0);
        await expect(
          page.getByRole("heading", { level: 2, name: "المراجع" }),
        ).toHaveCount(0);
      }
    });

    test("summary is labelled and precedes authored content", async ({
      page,
    }) => {
      await openArticle(page, fixture);

      const summaryHeading = page.getByRole("heading", {
        level: 2,
        name: "الخلاصة",
      });
      const summaryText = summaryHeading.locator(
        "xpath=following-sibling::p[1]",
      );
      await expect(summaryText).toHaveText(fixture.summary);
      await expectBefore(
        summaryText,
        page.getByText(fixture.introduction, { exact: true }),
      );
    });

    test("bidi isolates dates URLs and identifiers without disturbing Arabic", async ({
      page,
    }) => {
      await openArticle(page, fixture);

      await expect(page.locator("time bdi[dir='auto']").first()).toBeVisible();
      for (const value of ["https://example.com/articles/123", "dQw4w9WgXcQ"]) {
        const code = page.locator("code").filter({ hasText: value });
        await expect(code).toHaveText(value);
        expect(
          await code.evaluate((node) => {
            const style = getComputedStyle(node);
            return {
              direction: style.direction,
              unicodeBidi: style.unicodeBidi,
            };
          }),
        ).toEqual({ direction: "ltr", unicodeBidi: "isolate" });
      }

      const introduction = page.getByText(fixture.introduction, {
        exact: true,
      });
      expect(
        await introduction.evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            direction: style.direction,
            letterSpacing: style.letterSpacing,
            overflow: style.overflow,
            textOverflow: style.textOverflow,
          };
        }),
      ).toEqual({
        direction: "rtl",
        letterSpacing: "normal",
        overflow: "visible",
        textOverflow: "clip",
      });
      await expect(page.locator("article")).toContainText("العِلْمُ نُورٌ");
      await expect(page.locator("article")).toContainText("١٢٣");
      await expect(page.locator("article")).toContainText("123");
    });

    test("reflow preserves one readable column at every locked width", async ({
      page,
    }) => {
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await openArticle(page, fixture);

        expect(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
          ),
        ).toBe(true);
        expect(
          Number.parseFloat(
            await page
              .locator("body")
              .evaluate((node) => getComputedStyle(node).fontSize),
          ),
        ).toBeGreaterThanOrEqual(16);

        const cta = page.getByRole("link", {
          name: "مشاهدة الفيديو على يوتيوب",
        });
        const ctaBox = await cta.boundingBox();
        expect(ctaBox).not.toBeNull();
        expect(ctaBox!.height).toBeGreaterThanOrEqual(44);
        expect(ctaBox!.width).toBeGreaterThanOrEqual(44);

        const layout = await page.locator("article").evaluate((article) => {
          const articleBox = article.getBoundingClientRect();
          return {
            maxInlineSize: getComputedStyle(article).maxInlineSize,
            columnCount: getComputedStyle(article).columnCount,
            children: [...article.children]
              .filter(
                (child) =>
                  !(child instanceof HTMLScriptElement) &&
                  !(child instanceof HTMLStyleElement),
              )
              .map((child) => {
                const box = child.getBoundingClientRect();
                const style = getComputedStyle(child);
                return {
                  minInlineSize: style.minInlineSize,
                  display: style.display,
                  visibility: style.visibility,
                  withinColumn:
                    box.left >= articleBox.left - 1 &&
                    box.right <= articleBox.right + 1,
                };
              }),
          };
        });
        expect(layout.columnCount).toBe("auto");
        expect(Number.parseFloat(layout.maxInlineSize)).toBeLessThanOrEqual(
          700,
        );
        expect(
          layout.children.every(
            (child) =>
              child.minInlineSize === "0px" &&
              child.display !== "none" &&
              child.visibility === "visible" &&
              child.withinColumn,
          ),
        ).toBe(true);

        const readableNodes = page.locator(
          "article h1:not([hidden]), article h2:not([hidden]), article h3:not([hidden]), article p:not([hidden]), article li:not([hidden]), article blockquote:not([hidden]), article a:not([hidden])",
        );
        for (const node of await readableNodes.all()) {
          await expect(node).toBeVisible();
        }
      }
    });

    test("accessibility has no in-scope serious or critical axe violations", async ({
      page,
    }) => {
      await openArticle(page, fixture);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .disableRules(["document-title"])
        .analyze();
      expect(
        results.violations.filter(
          ({ impact }) => impact === "serious" || impact === "critical",
        ),
      ).toEqual([]);

      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(
        page.getByRole("article").getByRole("heading", { level: 1 }),
      ).toHaveText(fixture.title);
      await expect(
        page.getByRole("link", { name: "مشاهدة الفيديو على يوتيوب" }),
      ).toHaveAttribute("href", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    test("quality matches the locked type palette focus and spacing contract", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 900 });
      await openArticle(page, fixture);

      const styles = await page.evaluate(() => {
        const read = (selector: string) => {
          const node = document.querySelector(selector);
          if (!(node instanceof HTMLElement)) throw new Error(selector);
          const style = getComputedStyle(node);
          return {
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            color: style.color,
            backgroundColor: style.backgroundColor,
          };
        };
        return {
          body: read("body"),
          h1: read("h1"),
          h2: read(".article-summary h2"),
          h3: read("article h3"),
          label: read(".article-facts"),
          summary: read(".article-summary"),
          mainPadding: {
            block: getComputedStyle(document.querySelector("main")!)
              .paddingBlock,
            inline: getComputedStyle(document.querySelector("main")!)
              .paddingInline,
          },
          summaryPadding: getComputedStyle(
            document.querySelector(".article-summary")!,
          ).padding,
          allFontSizes: [
            ...new Set(
              [document.body, ...document.querySelectorAll("article *")].map(
                (node) => getComputedStyle(node).fontSize,
              ),
            ),
          ].sort(),
          allFontWeights: [
            ...new Set(
              [document.body, ...document.querySelectorAll("article *")].map(
                (node) => getComputedStyle(node).fontWeight,
              ),
            ),
          ].sort(),
        };
      });

      expect(styles.body).toEqual({
        fontSize: "18px",
        fontWeight: "400",
        lineHeight: "34.2px",
        color: "rgb(28, 25, 23)",
        backgroundColor: "rgb(255, 253, 248)",
      });
      expect(styles.h1).toMatchObject({
        fontSize: "32px",
        fontWeight: "700",
        lineHeight: "41.6px",
      });
      expect(styles.h2).toMatchObject({
        fontSize: "24px",
        fontWeight: "700",
        lineHeight: "33.6px",
      });
      expect(styles.h3).toMatchObject({
        fontSize: "18px",
        fontWeight: "700",
        lineHeight: "34.2px",
      });
      expect(styles.label).toMatchObject({
        fontSize: "14px",
        fontWeight: "700",
        lineHeight: "22.4px",
        color: "rgb(87, 83, 78)",
      });
      expect(styles.summary.backgroundColor).toBe("rgb(245, 241, 232)");
      expect(styles.mainPadding).toEqual({ block: "32px", inline: "16px" });
      expect(styles.summaryPadding).toBe("16px");
      expect(styles.allFontSizes).toEqual(["14px", "18px", "24px", "32px"]);
      expect(styles.allFontWeights).toEqual(["400", "700"]);

      const directLink = page.getByRole("link", {
        name: "مشاهدة الفيديو على يوتيوب",
      });
      await directLink.focus();
      expect(
        await directLink.evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            backgroundColor: style.backgroundColor,
            color: style.color,
            textDecorationLine: style.textDecorationLine,
            minBlockSize: style.minBlockSize,
            outlineColor: style.outlineColor,
            outlineWidth: style.outlineWidth,
            outlineOffset: style.outlineOffset,
          };
        }),
      ).toEqual({
        backgroundColor: "rgb(22, 101, 52)",
        color: "rgb(255, 253, 248)",
        textDecorationLine: "underline",
        minBlockSize: "44px",
        outlineColor: "rgb(22, 101, 52)",
        outlineWidth: "3px",
        outlineOffset: "3px",
      });

      await page.setViewportSize({ width: 768, height: 900 });
      expect(
        await page.evaluate(() => ({
          mainBlock: getComputedStyle(document.querySelector("main")!)
            .paddingBlock,
          mainInline: getComputedStyle(document.querySelector("main")!)
            .paddingInline,
          summary: getComputedStyle(document.querySelector(".article-summary")!)
            .padding,
        })),
      ).toEqual({ mainBlock: "64px", mainInline: "24px", summary: "24px" });

      expect(routeSource).toMatch(/max-inline-size:\s*70ch/iu);
      expect(routeSource).not.toMatch(
        /overflow-x\s*:\s*hidden|@font-face|box-shadow|(?:linear|radial)-gradient|border-radius|grid-template-columns|column-count|<img\b|<svg\b/iu,
      );
      expect(routeSource.match(/<h1\b/giu)).toHaveLength(1);
      expect(`${routeSource}\n${playerSource}`).not.toMatch(
        /<iframe\b|<link[^>]+rel=["']preconnect|<script[^>]+src=|poster=|target=/giu,
      );
      expect(await page.locator("body").innerHTML()).not.toMatch(
        /generalIssues|scholarship|ahmedElMangawy|sectionRegistry|authorRegistry/iu,
      );
      expect(
        existsSync("dist/القضايا-العامة/مسودة-اختبار-العقد/index.html"),
      ).toBe(false);
      expect(
        existsSync("dist/القضايا-العامة/اختبار-عقد-المحتوى/index.html"),
      ).toBe(true);
      expect(
        existsSync("dist/القسم-العلمي/اختبار-مكون-ام-دي-اكس/index.html"),
      ).toBe(true);
    });
  });
}
