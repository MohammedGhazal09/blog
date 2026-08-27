import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { existsSync, readdirSync, readFileSync, type Dirent } from "node:fs";
import { extname, join } from "node:path";

import {
  authorRegistry,
  sectionRegistry,
  type SectionKey,
} from "../src/config/registries.ts";

type PageIdentity = {
  path: string;
  title: string;
  description: string;
  h1: string;
  ogType: "article" | "website";
};

type ArticleSource = {
  path: string;
  title: string;
  description: string;
  draft: boolean;
  youtubeId: string;
};

const ARTICLE_ROOT = "src/content/articles";
const ORIGIN = "http://127.0.0.1:4322";
const SITE_NAME = "مدونة أحمد المنجاوي";
const HOME_DESCRIPTION =
  "مقالات عربية في الردود والشبهات والقضايا العامة والعلوم الشرعية، مرتبطة بالمحتوى الموافق لها على يوتيوب.";
const AUTHOR_DESCRIPTION =
  "تنشر المدونة مقالات عربية في الردود والشبهات والقضايا العامة والعلوم الشرعية، وتربط كل مقال بالمحتوى الموافق له على يوتيوب.";
const NOT_FOUND_TITLE = `الصفحة غير موجودة | ${SITE_NAME}`;
const NOT_FOUND_DESCRIPTION = "تعذر العثور على الصفحة المطلوبة.";
const NOT_FOUND_PATHS = ["/مسار-مفقود/", "/موضوع/غير-موجود/"] as const;
const ARABIC = /[\u0600-\u06ff]/u;

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function walkFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry: Dirent) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? walkFiles(path)
        : [".md", ".mdx"].includes(extname(entry.name).toLowerCase())
          ? [path]
          : [];
    })
    .sort();
}

function frontmatter(source: string, path: string): string {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(source);
  invariant(match, `${path}: missing frontmatter`);
  return match[1];
}

function scalar(block: string, field: string, path: string): string {
  const matches = [
    ...block.matchAll(new RegExp(`^${field}:\\s*(.+?)\\s*$`, "gmu")),
  ];
  invariant(matches.length === 1, `${path}: expected one ${field}`);
  const literal = matches[0][1].trim();
  return (literal.startsWith('"') && literal.endsWith('"')) ||
    (literal.startsWith("'") && literal.endsWith("'"))
    ? literal.slice(1, -1)
    : literal;
}

function articleSources(): readonly ArticleSource[] {
  return walkFiles(ARTICLE_ROOT).map((path) => {
    const metadata = frontmatter(readFileSync(path, "utf8"), path);
    const draft = scalar(metadata, "draft", path);
    invariant(draft === "true" || draft === "false", `${path}: invalid draft`);
    const sectionKey = scalar(metadata, "section", path) as SectionKey;
    invariant(
      Object.hasOwn(sectionRegistry, sectionKey),
      `${path}: bad section`,
    );
    const section = sectionRegistry[sectionKey];
    const slug = scalar(metadata, "slug", path);
    return {
      path: `/${section.slug}/${slug}/`,
      title: scalar(metadata, "title", path),
      description: scalar(metadata, "description", path),
      draft: draft === "true",
      youtubeId: scalar(metadata, "youtubeId", path),
    };
  });
}

function expectedIdentities(): readonly PageIdentity[] {
  const sections = Object.values(sectionRegistry).sort(
    (first, second) => first.order - second.order,
  );
  const articles = articleSources()
    .filter(({ draft }) => !draft)
    .map(({ path, title, description }) => ({
      path,
      title: `${title} | ${SITE_NAME}`,
      description,
      h1: title,
      ogType: "article" as const,
    }));
  return [
    {
      path: "/",
      title: SITE_NAME,
      description: HOME_DESCRIPTION,
      h1: "أقسام المدونة",
      ogType: "website",
    },
    ...sections.map((section) => ({
      path: `/${section.slug}/`,
      title: `${section.label} | ${SITE_NAME}`,
      description: section.description,
      h1: section.label,
      ogType: "website" as const,
    })),
    {
      path: "/عن-أحمد-المنجاوي/",
      title: `عن ${authorRegistry.ahmedElMangawy.name} | ${SITE_NAME}`,
      description: AUTHOR_DESCRIPTION,
      h1: `عن ${authorRegistry.ahmedElMangawy.name}`,
      ogType: "website",
    },
    ...articles,
  ];
}

async function xmlLocations(page: Page, source: string): Promise<string[]> {
  return page.evaluate((xml) => {
    const document = new DOMParser().parseFromString(xml, "application/xml");
    if (document.querySelector("parsererror")) throw new Error("invalid XML");
    return [...document.querySelectorAll("loc")].map(
      (location) => location.textContent?.trim() ?? "",
    );
  }, source);
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  expect(
    await page.evaluate(
      () =>
        [...document.querySelectorAll("header, main, h1, p, a")]
          .filter((node) => getComputedStyle(node).display !== "none")
          .every((node) => {
            const box = node.getBoundingClientRect();
            return (
              box.left >= -1 &&
              box.right <= document.documentElement.clientWidth + 1 &&
              getComputedStyle(node).overflowX !== "hidden"
            );
          }) &&
        document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

test("metadata identity is exact, unique, escaped, and self-canonical", async ({
  page,
}) => {
  const identities = expectedIdentities();
  expect(identities).toHaveLength(8);
  expect(new Set(identities.map(({ title }) => title)).size).toBe(8);
  expect(new Set(identities.map(({ description }) => description)).size).toBe(
    8,
  );

  for (const identity of identities) {
    expect((await page.goto(identity.path))?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("head > title")).toHaveCount(1);
    await expect(page).toHaveTitle(identity.title);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      identity.description,
    );
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator("main h1")).toHaveText(identity.h1);
    expect(identity.title).toMatch(ARABIC);
    expect(identity.description).toMatch(ARABIC);
    expect(identity.h1).toMatch(ARABIC);

    const canonical = new URL(identity.path, ORIGIN).href;
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      canonical,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);

    const properties = {
      "og:title": identity.title,
      "og:description": identity.description,
      "og:url": canonical,
      "og:type": identity.ogType,
      "og:site_name": SITE_NAME,
      "og:locale": "ar_AR",
    } as const;
    for (const [property, content] of Object.entries(properties)) {
      const tag = page.locator(`meta[property="${property}"]`);
      await expect(tag).toHaveCount(1);
      await expect(tag).toHaveAttribute("content", content);
    }

    const twitter = {
      "twitter:card": "summary",
      "twitter:title": identity.title,
      "twitter:description": identity.description,
    } as const;
    for (const [name, content] of Object.entries(twitter)) {
      const tag = page.locator(`meta[name="${name}"]`);
      await expect(tag).toHaveCount(1);
      await expect(tag).toHaveAttribute("content", content);
    }

    await expect(
      page.locator(
        'meta[property^="article:"], meta[property="og:image"], meta[name="twitter:image"], meta[name="twitter:site"], meta[name="twitter:creator"], meta[name="keywords"], script[type="application/ld+json"]',
      ),
    ).toHaveCount(0);
  }
});

test("metadata identity has one source boundary and no override surface", () => {
  const layout = readFileSync("src/layouts/SiteLayout.astro", "utf8");
  expect(layout).toMatch(/new URL\(Astro\.url\.pathname, Astro\.site\)/u);
  expect(layout).not.toMatch(/set:html/u);
  for (const path of [
    "src/pages/index.astro",
    "src/pages/[section]/index.astro",
    "src/pages/[section]/[slug].astro",
    "src/pages/عن-أحمد-المنجاوي.astro",
  ]) {
    const source = readFileSync(path, "utf8");
    expect(source).not.toMatch(
      /rel=["']canonical|property=["']og:|name=["']twitter:|canonical=|origin=/u,
    );
  }
});

test("sitemap and robots parse to the exact public route graph", async ({
  page,
  request,
}) => {
  const indexResponse = await request.get("/sitemap-index.xml");
  expect(indexResponse.status()).toBe(200);
  expect(indexResponse.headers()["content-type"]).toContain("xml");
  const indexLocations = await xmlLocations(page, await indexResponse.text());
  expect(indexLocations).toEqual([`${ORIGIN}/sitemap-0.xml`]);

  const sitemapResponse = await request.get(indexLocations[0]);
  expect(sitemapResponse.status()).toBe(200);
  const sitemapSource = await sitemapResponse.text();
  const locations = await xmlLocations(page, sitemapSource);
  expect(new Set(locations).size).toBe(locations.length);
  expect([...locations].sort()).toEqual(
    expectedIdentities()
      .map(({ path }) => new URL(path, ORIGIN).href)
      .sort(),
  );
  expect(locations).not.toContain(`${ORIGIN}/404/`);

  const robotsResponse = await request.get("/robots.txt");
  expect(robotsResponse.status()).toBe(200);
  expect(robotsResponse.headers()["content-type"]).toContain("text/plain");
  expect(await robotsResponse.text()).toBe(
    `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap-index.xml\n`,
  );

  const excluded = articleSources().filter(({ draft }) => draft);
  const crawlerOutput = `${sitemapSource}\n${await robotsResponse.text()}`;
  for (const article of excluded) {
    expect(crawlerOutput).not.toContain(article.path);
    expect(crawlerOutput).not.toContain(article.title);
    expect(crawlerOutput).not.toContain(article.youtubeId);
  }
});

test("unknown slash routes use the exact non-indexable Arabic 404", async ({
  page,
}) => {
  for (const path of NOT_FOUND_PATHS) {
    expect((await page.goto(path))?.status()).toBe(404);
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page).toHaveTitle(NOT_FOUND_TITLE);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      NOT_FOUND_DESCRIPTION,
    );
    await expect(page.locator("body > header")).toHaveCount(1);
    await expect(page.locator("body > main")).toHaveCount(1);
    await expect(page.locator("main > h1")).toHaveText("الصفحة غير موجودة");
    await expect(page.locator("main > p")).toHaveText(NOT_FOUND_DESCRIPTION);
    await expect(page.locator("body a")).toHaveCount(2);
    await expect(page.locator('body a[href="/"]')).toHaveCount(2);
    await expect(page.locator("main > a")).toHaveText(
      "العودة إلى الصفحة الرئيسية",
    );
    await expect(page.locator("main > a")).not.toHaveAttribute("target", /.+/u);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex,follow",
    );
    await expect(
      page.locator(
        'link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"]',
      ),
    ).toHaveCount(0);
  }
});

test("slashless unknown route remains a true 404", async ({ request }) => {
  expect((await request.get("/مسار-مفقود")).status()).toBe(404);
});

test("404 recovery works without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: ORIGIN,
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  expect((await page.goto(NOT_FOUND_PATHS[0]))?.status()).toBe(404);
  await expect(page.locator("main > h1")).toHaveText("الصفحة غير موجودة");
  await page
    .getByRole("main")
    .getByRole("link", { name: "العودة إلى الصفحة الرئيسية" })
    .click();
  await expect(page).toHaveURL(`${ORIGIN}/`);
  await context.close();
});

test("404 keyboard order, focus, reflow, accessibility, and network stay native", async ({
  page,
}) => {
  let unexpectedRequests = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== ORIGIN) unexpectedRequests += 1;
  });
  await page.goto(NOT_FOUND_PATHS[0]);

  const headerLink = page.getByRole("banner").getByRole("link");
  const recovery = page.getByRole("main").getByRole("link");
  await page.keyboard.press("Tab");
  await expect(headerLink).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(recovery).toBeFocused();
  expect(
    await recovery.evaluate((node) => {
      const style = getComputedStyle(node);
      return [
        style.outlineColor,
        style.outlineWidth,
        style.outlineOffset,
        style.minBlockSize,
        style.minInlineSize,
      ];
    }),
  ).toEqual(["rgb(22, 101, 52)", "3px", "3px", "44px", "44px"]);
  await page.screenshot({
    path: ".artifacts/playwright/evidence/404-focus.png",
    fullPage: true,
  });

  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(NOT_FOUND_PATHS[0]);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `.artifacts/playwright/evidence/404-${width}px.png`,
      fullPage: true,
    });
  }

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    results.violations.filter(
      ({ impact }) => impact === "serious" || impact === "critical",
    ),
  ).toEqual([]);
  expect(unexpectedRequests).toBe(0);
});

test("every document uses one inert local SVG favicon", async ({
  page,
  request,
}) => {
  for (const path of [
    ...expectedIdentities().map(({ path }) => path),
    NOT_FOUND_PATHS[0],
  ]) {
    await page.goto(path);
    const icon = page.locator('link[rel="icon"]');
    await expect(icon).toHaveCount(1);
    await expect(icon).toHaveAttribute("type", "image/svg+xml");
    await expect(icon).toHaveAttribute("href", "/favicon.svg");
  }

  const response = await request.get("/favicon.svg");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/svg+xml");
  const source = await response.text();
  expect(Buffer.byteLength(source)).toBeLessThan(2048);
  const namespaces = source.match(
    /xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/gu,
  );
  expect(namespaces).toHaveLength(1);
  expect(source.replace(namespaces?.[0] ?? "", "")).not.toMatch(
    /<\/?(?:script|style|text|foreignObject|image|use|animate|filter)\b|\bon\w+\s*=|(?:href|src)\s*=|url\(|data:|https?:|@font-face/iu,
  );

  const parsed = await page.evaluate((svg) => {
    const document = new DOMParser().parseFromString(svg, "image/svg+xml");
    if (document.querySelector("parsererror")) throw new Error("invalid SVG");
    const root = document.documentElement;
    const elements = [...document.querySelectorAll("*")];
    return {
      root: root.localName,
      viewBox: root.getAttribute("viewBox"),
      elements: elements.map((element) => element.localName),
      attributes: elements.flatMap((element) =>
        [...element.attributes].map((attribute) => attribute.name),
      ),
      colors: elements.flatMap((element) =>
        [element.getAttribute("fill"), element.getAttribute("stroke")].filter(
          (color): color is string => color !== null,
        ),
      ),
    };
  }, source);
  expect(parsed.root).toBe("svg");
  expect(
    parsed.elements.every((element) => ["svg", "path"].includes(element)),
  ).toBe(true);
  expect(
    parsed.attributes.every((attribute) =>
      [
        "xmlns",
        "viewBox",
        "d",
        "fill",
        "stroke",
        "stroke-width",
        "stroke-linejoin",
      ].includes(attribute),
    ),
  ).toBe(true);
  expect(new Set(parsed.colors)).toEqual(new Set(["#FFFDF8", "#166534"]));
  const viewBox = parsed.viewBox?.split(/\s+/u).map(Number) ?? [];
  expect(viewBox).toHaveLength(4);
  expect(viewBox.every(Number.isFinite)).toBe(true);
  expect(viewBox[2]).toBeGreaterThan(0);
  expect(viewBox[2]).toBe(viewBox[3]);

  for (const size of [16, 32]) {
    await page.setViewportSize({ width: size, height: size });
    await page.goto("/favicon.svg");
    await page.screenshot({
      path: `.artifacts/playwright/evidence/favicon-${size}px.png`,
    });
  }
});
