import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, type Dirent } from "node:fs";
import { basename, extname, join, relative } from "node:path";

import {
  authorRegistry,
  sectionRegistry,
  type SectionKey,
} from "../src/config/registries.ts";

type PublicCorpusEntry = {
  sectionKey: SectionKey;
  sectionSlug: string;
  articleSlug: string;
  path: string;
};

type JsonObject = Record<string, unknown>;

const ARTICLE_ROOT = "src/content/articles";
const REVIEW_ROOT = "src/content/reviews";
const PRODUCTION_ORIGIN = "http://127.0.0.1:4322";
const AUTHOR_PATH = "/عن-أحمد-المنجاوي/";
const PROOF_PATHS = [
  "/القضايا-العامة/اختبار-عقد-المحتوى/",
  "/القسم-العلمي/اختبار-مكون-ام-دي-اكس/",
] as const;

const orderedSections = Object.entries(sectionRegistry).sort(
  (first, second) => first[1].order - second[1].order,
);
const layoutSource = readFileSync("src/layouts/SiteLayout.astro", "utf8");
const homeSource = readFileSync("src/pages/index.astro", "utf8");
const sectionSource = readFileSync("src/pages/[section]/index.astro", "utf8");
const authorSource = readFileSync("src/pages/عن-أحمد-المنجاوي.astro", "utf8");
const articleSource = readFileSync("src/pages/[section]/[slug].astro", "utf8");

function oracleAssert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function isJsonObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function walkFiles(directory: string, extensions: readonly string[]): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry: Dirent) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? walkFiles(path, extensions)
        : extensions.includes(extname(entry.name).toLowerCase())
          ? [path]
          : [];
    })
    .sort();
}

function sourcePath(path: string): string {
  return relative(".", path).replaceAll("\\", "/");
}

function frontmatter(rawSource: string, path: string): string {
  oracleAssert(
    rawSource.startsWith("---\n") || rawSource.startsWith("---\r\n"),
    `${path}: source must start with frontmatter`,
  );
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(rawSource);
  oracleAssert(match, `${path}: source frontmatter is incomplete`);
  return match[1];
}

function frontmatterScalar(block: string, field: string, path: string): string {
  const matches = [
    ...block.matchAll(new RegExp(`^${field}:\\s*(.+?)\\s*$`, "gmu")),
  ];
  oracleAssert(
    matches.length === 1,
    `${path}: ${field} must occur exactly once`,
  );
  const literal = matches[0][1].trim();
  if (
    (literal.startsWith('"') && literal.endsWith('"')) ||
    (literal.startsWith("'") && literal.endsWith("'"))
  ) {
    return literal.slice(1, -1);
  }
  return literal;
}

function strictFields(
  value: JsonObject,
  expected: readonly string[],
  location: string,
): void {
  oracleAssert(
    Object.keys(value).sort().join("\n") === [...expected].sort().join("\n"),
    `${location}: fields must match the approval contract exactly`,
  );
}

function exactCurrentDate(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (!match) return false;
  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
  return (
    date.getUTCFullYear() === Number(match[1]) &&
    date.getUTCMonth() === Number(match[2]) - 1 &&
    date.getUTCDate() === Number(match[3]) &&
    value <= new Date().toISOString().slice(0, 10)
  );
}

function validateReview(
  value: unknown,
  location: string,
  editorial: boolean,
): void {
  oracleAssert(isJsonObject(value), `${location}: review must be an object`);
  strictFields(
    value,
    editorial
      ? [
          "reviewer",
          "approvedAt",
          "decision",
          "substantive",
          "videoMatchesArticle",
        ]
      : ["reviewer", "approvedAt", "decision"],
    location,
  );
  oracleAssert(
    typeof value.reviewer === "string" && value.reviewer.trim().length > 0,
    `${location}: reviewer must be a non-blank string`,
  );
  oracleAssert(
    exactCurrentDate(value.approvedAt),
    `${location}: approval date must be a current real YYYY-MM-DD date`,
  );
  oracleAssert(
    value.decision === "pass",
    `${location}: decision must be literal pass`,
  );
  if (editorial) {
    oracleAssert(
      value.substantive === true,
      `${location}: substantive must be literal true`,
    );
    oracleAssert(
      value.videoMatchesArticle === true,
      `${location}: videoMatchesArticle must be literal true`,
    );
  }
}

function readSidecars(): readonly { path: string; value: unknown }[] {
  return walkFiles(REVIEW_ROOT, [".json"]).map((path) => {
    let value: unknown;
    try {
      value = JSON.parse(readFileSync(path, "utf8"));
    } catch {
      throw new Error(
        `${sourcePath(path)}: review sidecar must contain valid JSON`,
      );
    }
    return { path, value };
  });
}

function expectedPublicCorpus(): readonly PublicCorpusEntry[] {
  const sidecars = readSidecars();
  const articleIds = new Set<string>();
  const articleSlugs = new Set<string>();
  const routes = new Set<string>();
  const usedSidecars = new Set<string>();
  const sources = new Set<string>();
  const corpus: PublicCorpusEntry[] = [];

  for (const path of walkFiles(ARTICLE_ROOT, [".md", ".mdx"])) {
    const normalizedSource = sourcePath(path);
    oracleAssert(
      !sources.has(normalizedSource),
      `${normalizedSource}: duplicate article source`,
    );
    sources.add(normalizedSource);

    const rawBytes = readFileSync(path);
    const metadata = frontmatter(rawBytes.toString("utf8"), normalizedSource);
    const draft = frontmatterScalar(metadata, "draft", normalizedSource);
    oracleAssert(
      draft === "true" || draft === "false",
      `${normalizedSource}: draft must be a literal boolean`,
    );
    if (draft === "true") continue;

    const sectionKey = frontmatterScalar(
      metadata,
      "section",
      normalizedSource,
    ) as SectionKey;
    const articleSlug = frontmatterScalar(metadata, "slug", normalizedSource);
    oracleAssert(
      Object.hasOwn(sectionRegistry, sectionKey),
      `${normalizedSource}: section must be registered`,
    );

    const candidates = sidecars.filter(({ value }) => {
      return (
        isJsonObject(value) &&
        value.source === normalizedSource &&
        value.articleSlug === articleSlug
      );
    });
    oracleAssert(
      candidates.length === 1,
      `${normalizedSource}: public source must have exactly one matching sidecar`,
    );
    const sidecar = candidates[0];
    oracleAssert(
      !usedSidecars.has(sidecar.path),
      `${normalizedSource}: review sidecar is duplicated`,
    );
    usedSidecars.add(sidecar.path);
    oracleAssert(
      isJsonObject(sidecar.value),
      `${normalizedSource}: sidecar must be an object`,
    );
    strictFields(
      sidecar.value,
      [
        "articleId",
        "articleSlug",
        "source",
        "sha256",
        "classification",
        "editorial",
        "religiousAccuracy",
      ],
      `${normalizedSource}: sidecar`,
    );
    oracleAssert(
      typeof sidecar.value.articleId === "string" &&
        sidecar.value.articleId.trim().length > 0,
      `${normalizedSource}: sidecar articleId must be a non-blank string`,
    );
    oracleAssert(
      basename(sidecar.path) ===
        `${encodeURIComponent(sidecar.value.articleId)}.json`,
      `${normalizedSource}: sidecar filename must match articleId`,
    );
    oracleAssert(
      sidecar.value.articleSlug === articleSlug,
      `${normalizedSource}: sidecar articleSlug must match source`,
    );
    oracleAssert(
      sidecar.value.source === normalizedSource,
      `${normalizedSource}: sidecar source must match raw source path`,
    );
    oracleAssert(
      sidecar.value.classification === "launch",
      `${normalizedSource}: classification must be literal launch`,
    );
    oracleAssert(
      typeof sidecar.value.sha256 === "string" &&
        /^[0-9a-f]{64}$/u.test(sidecar.value.sha256),
      `${normalizedSource}: sha256 must be lowercase 64-character hex`,
    );
    oracleAssert(
      sidecar.value.sha256 ===
        createHash("sha256").update(rawBytes).digest("hex"),
      `${normalizedSource}: sha256 must match exact raw source bytes`,
    );
    validateReview(
      sidecar.value.editorial,
      `${normalizedSource}: editorial`,
      true,
    );
    validateReview(
      sidecar.value.religiousAccuracy,
      `${normalizedSource}: religiousAccuracy`,
      false,
    );

    const articleId = sidecar.value.articleId as string;
    const section = sectionRegistry[sectionKey];
    const route = `/${section.slug}/${articleSlug}/`;
    oracleAssert(
      !articleIds.has(articleId),
      `${normalizedSource}: duplicate public articleId`,
    );
    oracleAssert(
      !articleSlugs.has(articleSlug),
      `${normalizedSource}: duplicate public article slug`,
    );
    oracleAssert(
      !routes.has(route),
      `${normalizedSource}: duplicate public article route`,
    );
    articleIds.add(articleId);
    articleSlugs.add(articleSlug);
    routes.add(route);
    corpus.push({
      sectionKey,
      sectionSlug: section.slug,
      articleSlug,
      path: route,
    });
  }

  return corpus;
}

function builtArticlePathsForSection(sectionSlug: string): string[] {
  const sectionDirectory = join("dist", sectionSlug);
  if (!existsSync(sectionDirectory)) return [];
  return readdirSync(sectionDirectory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        existsSync(join(sectionDirectory, entry.name, "index.html")),
    )
    .map((entry) => `/${sectionSlug}/${entry.name}/`)
    .sort();
}

async function renderedArticlePathsForSection(page: Page): Promise<string[]> {
  return page
    .locator(".article-list h2 > a")
    .evaluateAll((anchors) =>
      anchors
        .map((anchor) =>
          decodeURI(new URL((anchor as HTMLAnchorElement).href).pathname),
        )
        .sort(),
    );
}

function readOutputTree(directory: string): string {
  return walkFiles(directory, [".html", ".css", ".js", ".json", ".xml", ".txt"])
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
}

function internalReviewerValues(): (publicText: string) => boolean {
  const values = new Set<string>();
  for (const { value } of readSidecars()) {
    if (!isJsonObject(value)) continue;
    for (const review of [value.editorial, value.religiousAccuracy]) {
      if (
        isJsonObject(review) &&
        typeof review.reviewer === "string" &&
        review.reviewer.trim().length > 0
      ) {
        values.add(review.reviewer);
      }
    }
  }
  return (publicText: string) =>
    [...values].some((reviewer) => publicText.includes(reviewer));
}

const containsInternalReviewer = internalReviewerValues();

async function expectArabicDocument(
  page: Page,
  heading?: string,
): Promise<void> {
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("main")).toHaveCount(1);
  const h1 = page.getByRole("main").getByRole("heading", { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toBeVisible();
  if (heading) await expect(h1).toHaveText(heading);
}

async function expectSharedHeader(page: Page): Promise<void> {
  const header = page.locator("body > header");
  const main = page.locator("body > main");
  const link = header.getByRole("link", {
    name: "مدونة أحمد المنجاوي",
    exact: true,
  });
  await expect(header).toHaveCount(1);
  await expect(link).toHaveCount(1);
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", "/");
  await expect(link).not.toHaveAttribute("target", /.+/u);
  expect(
    await header.evaluate(
      (node, later) =>
        Boolean(later) &&
        Boolean(
          node.compareDocumentPosition(later as Node) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      await main.elementHandle(),
    ),
  ).toBe(true);
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  expect(
    await page.evaluate(() => {
      const documentFits =
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth;
      const visibleContentFits = [
        ...document.querySelectorAll(
          "header, main, h1, h2, p, li, a, time, article",
        ),
      ]
        .filter((node) => {
          const style = getComputedStyle(node);
          return style.display !== "none" && style.visibility !== "hidden";
        })
        .every((node) => {
          const box = node.getBoundingClientRect();
          const style = getComputedStyle(node);
          return (
            box.width > 0 &&
            box.left >= -1 &&
            box.right <= document.documentElement.clientWidth + 1 &&
            style.overflowX !== "hidden" &&
            style.textOverflow !== "ellipsis"
          );
        });
      return documentFits && visibleContentFits;
    }),
  ).toBe(true);
}

function structuralPaths(corpus: readonly PublicCorpusEntry[]): string[] {
  return [
    "/",
    ...orderedSections.map(([, section]) => `/${section.slug}/`),
    AUTHOR_PATH,
    ...corpus.map((entry) => entry.path),
  ];
}

test("homepage mirrors the registered Arabic discovery graph", async ({
  page,
  request,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).origin).toBe(PRODUCTION_ORIGIN);
  await expectArabicDocument(page, "أقسام المدونة");
  await expectSharedHeader(page);
  await expect(page.locator(".discovery-list")).toHaveCount(1);

  const entries = page.locator(".discovery-list > li");
  await expect(entries).toHaveCount(orderedSections.length);
  for (const [index, [, section]] of orderedSections.entries()) {
    const entry = entries.nth(index);
    const link = entry.getByRole("heading", { level: 2 }).getByRole("link");
    await expect(link).toHaveText(section.label);
    await expect(link).toHaveAttribute("href", `/${section.slug}/`);
    await expect(link).not.toHaveAttribute("target", /.+/u);
    await expect(entry.locator("p")).toHaveText(section.description);
    expect((await request.get(`/${section.slug}/`)).status()).toBe(200);
  }
});

test("source oracle, generated routes, and rendered indexes agree independently", async ({
  page,
  request,
}) => {
  const corpus = expectedPublicCorpus();

  for (const [sectionKey, section] of orderedSections) {
    const expected = corpus
      .filter((entry) => entry.sectionKey === sectionKey)
      .map((entry) => entry.path)
      .sort();
    const built = builtArticlePathsForSection(section.slug);
    await page.goto(`/${section.slug}/`);
    const rendered = await renderedArticlePathsForSection(page);

    expect(
      built,
      "raw-source oracle must equal generated article routes",
    ).toEqual(expected);
    expect(
      rendered,
      "raw-source oracle must equal rendered section article links",
    ).toEqual(expected);
    expect(
      rendered,
      "generated article routes must equal rendered section article links",
    ).toEqual(built);

    await expectArabicDocument(page, section.label);
    await expectSharedHeader(page);
    await expect(page.locator(".section-description")).toHaveText(
      section.description,
    );
    if (expected.length === 0) {
      await expect(page.locator(".article-list")).toHaveCount(0);
      await expect(page.locator(".empty-state")).toHaveText(
        "لا توجد مقالات منشورة في هذا القسم بعد.",
      );
    } else {
      const items = page.locator(".article-list > li");
      await expect(items).toHaveCount(expected.length);
      const observedOrder: { date: string; slug: string }[] = [];
      for (const item of await items.all()) {
        const link = item.locator("h2 > a");
        const description = item.locator(":scope > p");
        const time = item.locator(":scope > time");
        await expect(link).toBeVisible();
        await expect(link).not.toHaveAttribute("target", /.+/u);
        await expect(description).toBeVisible();
        await expect(description).not.toBeEmpty();
        await expect(time).toBeVisible();
        await expect(time.locator("bdi[dir='auto']")).toHaveCount(1);
        const href = decodeURI(
          new URL((await link.getAttribute("href"))!, page.url()).pathname,
        );
        const date = (await time.getAttribute("datetime"))!;
        const slug = href.split("/").filter(Boolean).at(-1)!;
        observedOrder.push({ date, slug });
        expect((await request.get(href)).status()).toBe(200);
      }
      expect(observedOrder).toEqual(
        [...observedOrder].sort((first, second) => {
          if (first.date > second.date) return -1;
          if (first.date < second.date) return 1;
          if (first.slug < second.slug) return -1;
          if (first.slug > second.slug) return 1;
          return 0;
        }),
      );
    }
  }
});

test("author output is truthful and unsupported claims are absent", async ({
  page,
}) => {
  await page.goto(AUTHOR_PATH);
  await expectArabicDocument(page, `عن ${authorRegistry.ahmedElMangawy.name}`);
  await expectSharedHeader(page);
  await expect(page.getByRole("main").locator("p")).toHaveText(
    "تنشر المدونة مقالات عربية في الردود والشبهات والقضايا العامة والعلوم الشرعية، وتربط كل مقال بالمحتوى الموافق له على يوتيوب.",
  );
  const home = page.getByRole("main").getByRole("link", {
    name: "العودة إلى الصفحة الرئيسية",
    exact: true,
  });
  await expect(home).toHaveAttribute("href", "/");
  await expect(home).not.toHaveAttribute("target", /.+/u);
  expect(await page.getByRole("main").innerText()).not.toMatch(
    /سيرة|خبرة|انتساب|مؤهل|اعتماد|حساب اجتماعي|قناة|biography|expertise|affiliation|credential|social profile|reviewer/iu,
  );
  await expect(
    page.locator("main :is(h2, h3, dl, img, svg, [class*='social'])"),
  ).toHaveCount(0);
});

test("public routes contain no proof, review, or reviewer trace", async ({
  page,
}) => {
  for (const proofPath of PROOF_PATHS) {
    expect((await page.goto(proofPath))?.status()).toBe(404);
  }
  expect((await page.goto("/قسم-غير-مسجل/"))?.status()).toBe(404);

  const builtText = readOutputTree("dist");
  expect(builtText).not.toMatch(
    /اختبار عقد المحتوى|اختبار مكون إم دي إكس|example\.com|dQw4w9WgXcQ/iu,
  );
  expect(builtText).not.toMatch(
    /articleId|sha256|classification|editorial|religiousAccuracy|reviewer|approvedAt/iu,
  );
  expect(builtText).not.toMatch(
    /تمت المراجعة|تمت الموافقة|مقال معتمد|مادة معتمدة/iu,
  );
  expect(
    containsInternalReviewer(builtText),
    "public build must not contain an internal reviewer identity",
  ).toBe(false);

  const corpus = expectedPublicCorpus();
  for (const path of structuralPaths(corpus)) {
    await page.goto(path);
    const html = await page.locator("body").innerHTML();
    expect(html).not.toMatch(
      /articleId|sha256|classification|editorial|religiousAccuracy|reviewer|approvedAt/iu,
    );
    expect(
      containsInternalReviewer(html),
      "public DOM must not contain an internal reviewer identity",
    ).toBe(false);
  }
});

test("every public article links to working section and author facts", async ({
  page,
  request,
}) => {
  for (const article of expectedPublicCorpus()) {
    await page.goto(article.path);
    await expectArabicDocument(page);
    await expectSharedHeader(page);
    const facts = page.locator(".article-facts");
    const section = sectionRegistry[article.sectionKey];
    const sectionLink = facts.getByRole("link", { name: section.label });
    const authorLink = facts.getByRole("link", {
      name: authorRegistry.ahmedElMangawy.name,
    });
    await expect(sectionLink).toHaveAttribute("href", `/${section.slug}/`);
    await expect(authorLink).toHaveAttribute("href", AUTHOR_PATH);
    await expect(sectionLink).not.toHaveAttribute("target", /.+/u);
    await expect(authorLink).not.toHaveAttribute("target", /.+/u);
    expect((await request.get(`/${section.slug}/`)).status()).toBe(200);
    expect((await request.get(AUTHOR_PATH)).status()).toBe(200);
  }
});

test("the complete static graph works with JavaScript disabled", async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: PRODUCTION_ORIGIN,
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  await page.goto("/");
  const firstSection = orderedSections[0][1];
  await page.getByRole("link", { name: firstSection.label }).click();
  expect(decodeURI(new URL(page.url()).pathname)).toBe(
    `/${firstSection.slug}/`,
  );
  await page.getByRole("banner").getByRole("link").click();
  await expect(page).toHaveURL(`${PRODUCTION_ORIGIN}/`);

  await page.goto(AUTHOR_PATH);
  await page.getByRole("link", { name: "العودة إلى الصفحة الرئيسية" }).click();
  await expect(page).toHaveURL(`${PRODUCTION_ORIGIN}/`);

  const firstArticle = expectedPublicCorpus()[0];
  if (firstArticle) {
    await page
      .getByRole("link", {
        name: sectionRegistry[firstArticle.sectionKey].label,
      })
      .click();
    await page.locator(".article-list h2 > a").first().click();
    await expect(page.locator("main > article")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "مشاهدة الفيديو على يوتيوب" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "تشغيل الفيديو هنا" }),
    ).toHaveCount(0);
    await page
      .locator(".article-facts")
      .getByRole("link", { name: authorRegistry.ahmedElMangawy.name })
      .click();
    await page
      .getByRole("link", { name: "العودة إلى الصفحة الرئيسية" })
      .click();
    await expect(page).toHaveURL(`${PRODUCTION_ORIGIN}/`);
  }
  await context.close();
});

test("native keyboard order and focus styling remain exact", async ({
  page,
}) => {
  const corpus = expectedPublicCorpus();
  for (const path of structuralPaths(corpus)) {
    await page.goto(path);
    expect(
      await page
        .locator("[tabindex]")
        .evaluateAll((nodes) =>
          nodes.every((node) => Number(node.getAttribute("tabindex")) <= 0),
        ),
    ).toBe(true);
    for (const link of await page.locator("a").all()) {
      expect(await link.evaluate((node) => node.tagName)).toBe("A");
      await expect(link).not.toHaveAttribute("target", /.+/u);
      await link.focus();
      expect(
        await link.evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            outlineColor: style.outlineColor,
            outlineStyle: style.outlineStyle,
            outlineWidth: style.outlineWidth,
            outlineOffset: style.outlineOffset,
            textDecorationLine: style.textDecorationLine,
          };
        }),
      ).toEqual({
        outlineColor: "rgb(22, 101, 52)",
        outlineStyle: "solid",
        outlineWidth: "3px",
        outlineOffset: "3px",
        textDecorationLine: "underline",
      });
    }
  }

  await page.goto("/");
  const headerHome = page.getByRole("banner").getByRole("link");
  const firstSectionLink = page
    .locator(".discovery-list")
    .getByRole("link")
    .first();
  await page.keyboard.press("Tab");
  await expect(headerHome).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(firstSectionLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(
    `${PRODUCTION_ORIGIN}/${orderedSections[0][1].slug}/`,
  );
});

test("all structural routes reflow across the locked widths", async ({
  page,
}) => {
  const corpus = expectedPublicCorpus();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of structuralPaths(corpus)) {
      await page.goto(path);
      await expectArabicDocument(page);
      await expectNoHorizontalOverflow(page);
    }
  }
});

test("discovery pages issue no remote assets or runtime fetches", async ({
  page,
}) => {
  let unexpectedRequests = 0;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.origin !== PRODUCTION_ORIGIN ||
      request.resourceType() === "fetch" ||
      request.resourceType() === "xhr"
    ) {
      unexpectedRequests += 1;
    }
  });
  for (const path of [
    "/",
    ...orderedSections.map(([, section]) => `/${section.slug}/`),
    AUTHOR_PATH,
  ]) {
    await page.goto(path);
  }
  expect(
    unexpectedRequests,
    "discovery and author pages must not load remote assets or runtime data",
  ).toBe(0);
});

test("the flat visual token contract stays exact", async ({ page }) => {
  const discoverySource = `${layoutSource}\n${homeSource}\n${sectionSource}\n${authorSource}`;
  const allSource = `${discoverySource}\n${articleSource}`;
  expect(
    [...discoverySource.matchAll(/font-size:\s*([^;]+);/giu)]
      .map((match) => match[1].trim())
      .sort(),
  ).toEqual(["0.875rem", "1.125rem", "1.5rem", "2rem"]);
  expect(
    [
      ...new Set(
        [...discoverySource.matchAll(/font-weight:\s*([^;]+);/giu)].map(
          (match) => match[1].trim(),
        ),
      ),
    ].sort(),
  ).toEqual(["400", "700"]);
  for (const token of [
    "#fffdf8",
    "#f5f1e8",
    "#166534",
    "#14532d",
    "#1c1917",
    "#57534e",
    "#78716c",
  ]) {
    expect(allSource.toLowerCase()).toContain(token);
  }
  expect(layoutSource).toMatch(/max-inline-size:\s*70ch/iu);
  expect(
    discoverySource.match(/@media\s*\(min-width:\s*48rem\)/giu),
  ).toHaveLength(1);
  expect(allSource).not.toMatch(
    /overflow-x\s*:\s*hidden|@font-face|box-shadow|(?:linear|radial)-gradient|border-radius|line-clamp|animation\s*:|transition\s*:|<img\b|<svg\b|class=["'][^"']*card/iu,
  );

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");
  const computedTokens = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const h1 = getComputedStyle(document.querySelector("h1")!);
    const h2 = getComputedStyle(document.querySelector("h2")!);
    const main = getComputedStyle(document.querySelector("main")!);
    const headerLink = getComputedStyle(document.querySelector("header a")!);
    return {
      body: [body.fontSize, body.fontWeight, body.color, body.backgroundColor],
      h1: [h1.fontSize, h1.fontWeight],
      h2: [h2.fontSize, h2.fontWeight],
      mainMaxInlineSize: main.maxInlineSize,
      mainPadding: [main.paddingBlock, main.paddingInline],
      headerMinBlockSize: headerLink.minBlockSize,
    };
  });
  expect(computedTokens).toMatchObject({
    body: ["18px", "400", "rgb(28, 25, 23)", "rgb(255, 253, 248)"],
    h1: ["32px", "700"],
    h2: ["24px", "700"],
    mainPadding: ["32px", "16px"],
    headerMinBlockSize: "44px",
  });
  const mainMaxInlineSize = Number.parseFloat(computedTokens.mainMaxInlineSize);
  expect(mainMaxInlineSize).toBeGreaterThan(0);
  expect(mainMaxInlineSize).toBeLessThanOrEqual(700);
  await page.setViewportSize({ width: 768, height: 900 });
  expect(
    await page.locator("main").evaluate((node) => {
      const style = getComputedStyle(node);
      return [style.paddingBlock, style.paddingInline];
    }),
  ).toEqual(["64px", "24px"]);
});

test("structural routes have native semantics and no serious axe findings", async ({
  page,
}) => {
  for (const path of structuralPaths(expectedPublicCorpus())) {
    await page.goto(path);
    await expectArabicDocument(page);
    await expectSharedHeader(page);
    if (
      path === "/" ||
      orderedSections.some(([, section]) => path === `/${section.slug}/`)
    ) {
      await expect(
        page.locator("main [role], main [aria-label], main [aria-labelledby]"),
      ).toHaveCount(0);
    }
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .disableRules(["document-title"])
      .analyze();
    expect(
      results.violations.filter(
        ({ impact }) => impact === "serious" || impact === "critical",
      ),
    ).toEqual([]);
  }
});
