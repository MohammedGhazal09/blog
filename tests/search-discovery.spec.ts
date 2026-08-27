import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
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

type BodyBaseline = {
  textDigest: string;
  headings: readonly string[];
  lists: readonly string[];
  links: readonly string[];
};

const ARTICLE_ROOT = "src/content/articles";
const LOCAL_PREVIEW_ORIGIN = "http://127.0.0.1:4322";
const EXPECTED_SITE_ORIGIN =
  process.env.EXPECTED_SITE_ORIGIN ?? "http://127.0.0.1:4322";
const SITE_NAME = "مدونة أحمد المنجاوي";
const HOME_DESCRIPTION =
  "مقالات عربية في الردود والشبهات والقضايا العامة والعلوم الشرعية، مرتبطة بالمحتوى الموافق لها على يوتيوب.";
const AUTHOR_DESCRIPTION =
  "تنشر المدونة مقالات عربية في الردود والشبهات والقضايا العامة والعلوم الشرعية، وتربط كل مقال بالمحتوى الموافق له على يوتيوب.";
const NOT_FOUND_TITLE = `الصفحة غير موجودة | ${SITE_NAME}`;
const NOT_FOUND_DESCRIPTION = "تعذر العثور على الصفحة المطلوبة.";
const NOT_FOUND_PATHS = ["/مسار-مفقود/", "/موضوع/غير-موجود/"] as const;
const ARABIC = /[\u0600-\u06ff]/u;
const BODY_FONT_FAMILY =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Tahoma, Arial, sans-serif';

// These digests lock Phase 3 reader-visible copy; change them only with an
// explicitly accepted content/UI revision.
const BODY_BASELINES = {
  "/": {
    textDigest:
      "6ab7e9de6343da86720d5088a51fff8670cc9a78015d48034ebb584f89667885",
    headings: [
      "h1:أقسام المدونة",
      "h2:الردود والشبهات",
      "h2:القضايا العامة",
      "h2:القسم العلمي",
    ],
    lists: ["ul.discovery-list:3"],
    links: [
      "مدونة أحمد المنجاوي=>/",
      "الردود والشبهات=>/الردود-والشبهات/",
      "القضايا العامة=>/القضايا-العامة/",
      "القسم العلمي=>/القسم-العلمي/",
    ],
  },
  "/الردود-والشبهات/": {
    textDigest:
      "6577f8a49fdc140f43d45830362aaec5f95cf94e12264d2c89bb214e64420933",
    headings: ["h1:الردود والشبهات", "h2:أصول منهجية في الرد على الشبهات"],
    lists: ["ul.article-list:1"],
    links: [
      "مدونة أحمد المنجاوي=>/",
      "أصول منهجية في الرد على الشبهات=>/الردود-والشبهات/أصول-منهجية-في-الرد-على-الشبهات/",
    ],
  },
  "/القضايا-العامة/": {
    textDigest:
      "a14a46bfb007e5968f6c84c33db94266f638c4c1b361b282a63b68cc50640a56",
    headings: ["h1:القضايا العامة", "h2:الاستقلال في الخلافات العامة"],
    lists: ["ul.article-list:1"],
    links: [
      "مدونة أحمد المنجاوي=>/",
      "الاستقلال في الخلافات العامة=>/القضايا-العامة/الاستقلال-في-الخلافات-العامة/",
    ],
  },
  "/القسم-العلمي/": {
    textDigest:
      "c4756109c8ddc95f1575cc72964a47574ca9b024215e5e2d546dc2bc17b94174",
    headings: ["h1:القسم العلمي", "h2:مدخل إلى علم الإملاء"],
    lists: ["ul.article-list:1"],
    links: [
      "مدونة أحمد المنجاوي=>/",
      "مدخل إلى علم الإملاء=>/القسم-العلمي/مدخل-إلى-علم-الإملاء/",
    ],
  },
  "/عن-أحمد-المنجاوي/": {
    textDigest:
      "5a6e3b87b22b8382d5fd4d45abca2e39328f5ebea5aa2f9fd0ef45c701637322",
    headings: ["h1:عن أحمد المنجاوي"],
    lists: [],
    links: ["مدونة أحمد المنجاوي=>/", "العودة إلى الصفحة الرئيسية=>/"],
  },
  "/الردود-والشبهات/أصول-منهجية-في-الرد-على-الشبهات/": {
    textDigest:
      "a7da5ad53c45cce6c0865decb5b12ccc6d10597b09333e90cd9069e998db2748",
    headings: [
      "h1:أصول منهجية في الرد على الشبهات",
      "h2:الخلاصة",
      "h2:فهم الشبهة قبل مناقشتها",
      "h2:بناء جواب موثق ومتناسب",
      "h2:لغة الرد وأثرها",
      "h2:الخاتمة",
      "h2:المراجع",
      "h2:الفيديو المرتبط بالمقال",
    ],
    lists: ["ul.:3"],
    links: [
      "مدونة أحمد المنجاوي=>/",
      "الردود والشبهات=>/الردود-والشبهات/",
      "أحمد المنجاوي=>/عن-أحمد-المنجاوي/",
      "القرآن الكريم: سورة النحل، الآية ١٢٥=>https://quran.com/16/125",
      "القرآن الكريم: سورة المائدة، الآية ٨=>https://quran.com/5/8",
      "فيديو: أصول أهل السنة في الرد على الشيعة وغيرهم من أهل البدع=>https://www.youtube.com/watch?v=gO9yWa85OBc",
      "مشاهدة الفيديو على يوتيوب=>https://www.youtube.com/watch?v=gO9yWa85OBc",
    ],
  },
  "/القضايا-العامة/الاستقلال-في-الخلافات-العامة/": {
    textDigest:
      "e6943d7b1bcb6b9b114f601d62d5d08f4d7ad81e4a8bea90eb3026a4b9b5ab02",
    headings: [
      "h1:الاستقلال في الخلافات العامة",
      "h2:الخلاصة",
      "h2:الموقف من المسألة ليس انتماءً كاملًا",
      "h2:التحقق قبل الحكم",
      "h2:العدل في أجواء الاستقطاب",
      "h2:كيف يُعلن الموقف بوضوح؟",
      "h2:الخاتمة",
      "h2:المراجع",
      "h2:الفيديو المرتبط بالمقال",
    ],
    lists: ["ul.:2"],
    links: [
      "مدونة أحمد المنجاوي=>/",
      "القضايا العامة=>/القضايا-العامة/",
      "أحمد المنجاوي=>/عن-أحمد-المنجاوي/",
      "القرآن الكريم: سورة المائدة، الآية ٨=>https://quran.com/5/8",
      "فيديو: تنبيه مهم حول علاقتي مع الأطراف المتنازعة=>https://www.youtube.com/watch?v=gmL_5XVpLPg",
      "مشاهدة الفيديو على يوتيوب=>https://www.youtube.com/watch?v=gmL_5XVpLPg",
    ],
  },
  "/القسم-العلمي/مدخل-إلى-علم-الإملاء/": {
    textDigest:
      "27a12406d0d331dcc6dfb58fa69e3fd5623af15204c70259e176df957e8d6bf5",
    headings: [
      "h1:مدخل إلى علم الإملاء",
      "h2:الخلاصة",
      "h2:ما علم الإملاء؟",
      "h2:أبرز موضوعاته",
      "h2:لماذا نتعلمه؟",
      "h2:مسار عملي للتعلم",
      "h2:الخاتمة",
      "h2:المراجع",
      "h2:الفيديو المرتبط بالمقال",
    ],
    lists: ["ul.:5", "ul.:2"],
    links: [
      "مدونة أحمد المنجاوي=>/",
      "القسم العلمي=>/القسم-العلمي/",
      "أحمد المنجاوي=>/عن-أحمد-المنجاوي/",
      "معجم مجمع اللغة العربية بالقاهرة: الإملاء=>https://www.arabicacademy.gov.eg/ar/محرك-البحث/الإملاء",
      "فيديو: تعريف علم الإملاء وموضوعاته وأهميته=>https://www.youtube.com/watch?v=-z32phpbduk",
      "مشاهدة الفيديو على يوتيوب=>https://www.youtube.com/watch?v=-z32phpbduk",
    ],
  },
} as const satisfies Record<string, BodyBaseline>;

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

    const canonical = new URL(identity.path, EXPECTED_SITE_ORIGIN).href;
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

test("all eight indexable bodies preserve the Phase 3 visual and semantic contract", async ({
  page,
}) => {
  const identities = expectedIdentities();
  const baselineByPath = BODY_BASELINES as Record<string, BodyBaseline>;
  expect(Object.keys(baselineByPath).sort()).toEqual(
    identities.map(({ path }) => path).sort(),
  );

  const allFontSizes = new Set<string>();
  const allFontWeights = new Set<string>();

  for (const identity of identities) {
    const baseline = baselineByPath[identity.path];
    invariant(baseline, `${identity.path}: missing body baseline`);
    await page.setViewportSize({ width: 390, height: 900 });
    expect((await page.goto(identity.path))?.status()).toBe(200);

    const bodyText = (await page.locator("body").innerText()).replaceAll(
      "\r\n",
      "\n",
    );
    expect(createHash("sha256").update(bodyText).digest("hex")).toBe(
      baseline.textDigest,
    );

    const mobile = await page.evaluate(() => {
      const normalize = (value: string | null): string =>
        value?.replace(/\s+/gu, " ").trim() ?? "";
      const visible = [...document.body.querySelectorAll("*")].filter(
        (element) => {
          const style = getComputedStyle(element);
          const box = element.getBoundingClientRect();
          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            box.width > 0 &&
            box.height > 0
          );
        },
      );
      const header = document.querySelector("header");
      const main = document.querySelector("main");
      if (!(header instanceof HTMLElement) || !(main instanceof HTMLElement))
        throw new Error("shared shell missing");

      const measure = document.createElement("div");
      measure.style.cssText =
        "position:fixed;visibility:hidden;display:block;inline-size:70ch";
      document.body.append(measure);
      const seventyCh = Number.parseFloat(getComputedStyle(measure).inlineSize);
      measure.remove();

      const headerStyle = getComputedStyle(header);
      const mainStyle = getComputedStyle(main);
      const headerBox = header.getBoundingClientRect();
      const mainBox = main.getBoundingClientRect();
      const shellContainsChildren = visible.every((element) => {
        const shell = element.closest("header, main");
        if (!(shell instanceof HTMLElement) || shell === element) return true;
        const shellBox = shell.getBoundingClientRect();
        const box = element.getBoundingClientRect();
        return box.left >= shellBox.left - 1 && box.right <= shellBox.right + 1;
      });

      return {
        landmarks: [...document.body.children].map((node) =>
          node.tagName.toLowerCase(),
        ),
        headings: [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map(
          (node) =>
            `${node.tagName.toLowerCase()}:${normalize(node.textContent)}`,
        ),
        lists: [...document.querySelectorAll("main ul, main ol")].map(
          (node) =>
            `${node.tagName.toLowerCase()}.${normalize(node.getAttribute("class"))}:${node.children.length}`,
        ),
        links: [...document.querySelectorAll("a")].map(
          (node) =>
            `${normalize(node.textContent)}=>${node.getAttribute("href")}`,
        ),
        h1Count: document.querySelectorAll("h1").length,
        fontFamilies: [
          ...new Set(visible.map((node) => getComputedStyle(node).fontFamily)),
        ].sort(),
        fontSizes: [
          ...new Set(visible.map((node) => getComputedStyle(node).fontSize)),
        ].sort(),
        fontWeights: [
          ...new Set(visible.map((node) => getComputedStyle(node).fontWeight)),
        ].sort(),
        body: {
          color: getComputedStyle(document.body).color,
          background: getComputedStyle(document.body).backgroundColor,
          fontFamily: getComputedStyle(document.body).fontFamily,
          lineHeight: getComputedStyle(document.body).lineHeight,
        },
        seventyCh,
        main: {
          maxInlineSize: Number.parseFloat(mainStyle.maxInlineSize),
          paddingBlock: mainStyle.paddingBlock,
          paddingInline: mainStyle.paddingInline,
          left: mainBox.left,
          width: mainBox.width,
        },
        header: {
          borderBlockEnd: headerStyle.borderBlockEnd,
          paddingInline: headerStyle.paddingInline,
          left: headerBox.left,
          width: headerBox.width,
        },
        shellContainsChildren,
        documentWidth: [
          document.documentElement.scrollWidth,
          document.documentElement.clientWidth,
        ],
        bodyMetadataNodes: document.body.querySelectorAll(
          "title, meta, link[rel='canonical'], link[rel='icon'], img[src='/favicon.svg'], object[data='/favicon.svg'], embed[src='/favicon.svg']",
        ).length,
      };
    });

    expect(mobile.landmarks).toEqual(["header", "main"]);
    expect(mobile.headings).toEqual(baseline.headings);
    expect(mobile.lists).toEqual(baseline.lists);
    expect(mobile.links).toEqual(baseline.links);
    expect(mobile.h1Count).toBe(1);
    expect(mobile.fontFamilies).toEqual([BODY_FONT_FAMILY]);
    expect(mobile.body).toEqual({
      color: "rgb(28, 25, 23)",
      background: "rgb(255, 253, 248)",
      fontFamily: BODY_FONT_FAMILY,
      lineHeight: "34.2px",
    });
    expect(Math.abs(mobile.main.maxInlineSize - mobile.seventyCh)).toBeLessThan(
      0.1,
    );
    expect(mobile.main.paddingBlock).toBe("32px");
    expect(mobile.main.paddingInline).toBe("16px");
    expect(mobile.header.borderBlockEnd).toBe("1px solid rgb(120, 113, 108)");
    expect(mobile.header.paddingInline).toBe("16px");
    expect(Math.abs(mobile.header.left - mobile.main.left)).toBeLessThan(0.1);
    expect(Math.abs(mobile.header.width - mobile.main.width)).toBeLessThan(0.1);
    expect(mobile.shellContainsChildren).toBe(true);
    expect(mobile.documentWidth).toEqual([390, 390]);
    expect(mobile.bodyMetadataNodes).toBe(0);
    mobile.fontSizes.forEach((size) => allFontSizes.add(size));
    mobile.fontWeights.forEach((weight) => allFontWeights.add(weight));

    for (const link of await page.locator("a").all()) {
      await expect(link).not.toHaveAttribute("target", /.+/u);
      expect(
        await link.evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            color: style.color,
            textDecorationLine: style.textDecorationLine,
          };
        }),
      ).toMatchObject({ textDecorationLine: "underline" });
      expect(
        await link.evaluate((node) => getComputedStyle(node).color),
      ).toMatch(/rgb\((?:22, 101, 52|255, 253, 248)\)/u);
      await link.focus();
      expect(
        await link.evaluate((node) => {
          const style = getComputedStyle(node);
          return [
            style.outlineColor,
            style.outlineStyle,
            style.outlineWidth,
            style.outlineOffset,
          ];
        }),
      ).toEqual(["rgb(22, 101, 52)", "solid", "3px", "3px"]);
    }
    const headerLink = page.locator("header a");
    await headerLink.hover();
    expect(
      await headerLink.evaluate(
        (node) => getComputedStyle(node).textDecorationThickness,
      ),
    ).toBe("3px");

    await page.setViewportSize({ width: 768, height: 900 });
    const desktop = await page.evaluate(() => {
      const header = document.querySelector("header");
      const main = document.querySelector("main");
      if (!(header instanceof HTMLElement) || !(main instanceof HTMLElement))
        throw new Error("shared shell missing");
      const headerStyle = getComputedStyle(header);
      const mainStyle = getComputedStyle(main);
      const headerBox = header.getBoundingClientRect();
      const mainBox = main.getBoundingClientRect();
      return {
        mainPadding: [mainStyle.paddingBlock, mainStyle.paddingInline],
        headerPadding: headerStyle.paddingInline,
        alignment: [
          headerBox.left,
          headerBox.width,
          mainBox.left,
          mainBox.width,
        ],
        contained: [...document.querySelectorAll("header *, main *")]
          .filter((element) => {
            const style = getComputedStyle(element);
            const box = element.getBoundingClientRect();
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              box.width > 0 &&
              box.height > 0
            );
          })
          .every((element) => {
            const shell = element.closest("header, main");
            if (!(shell instanceof HTMLElement)) return false;
            const box = element.getBoundingClientRect();
            const shellBox = shell.getBoundingClientRect();
            return (
              box.left >= shellBox.left - 1 && box.right <= shellBox.right + 1
            );
          }),
        documentWidth: [
          document.documentElement.scrollWidth,
          document.documentElement.clientWidth,
        ],
      };
    });
    expect(desktop.mainPadding).toEqual(["64px", "24px"]);
    expect(desktop.headerPadding).toBe("24px");
    expect(Math.abs(desktop.alignment[0] - desktop.alignment[2])).toBeLessThan(
      0.1,
    );
    expect(Math.abs(desktop.alignment[1] - desktop.alignment[3])).toBeLessThan(
      0.1,
    );
    expect(desktop.contained).toBe(true);
    expect(desktop.documentWidth).toEqual([768, 768]);
  }

  expect([...allFontSizes].sort()).toEqual(["14px", "18px", "24px", "32px"]);
  expect([...allFontWeights].sort()).toEqual(["400", "700"]);
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
  expect(indexLocations).toEqual([`${EXPECTED_SITE_ORIGIN}/sitemap-0.xml`]);

  const sitemapResponse = await request.get("/sitemap-0.xml");
  expect(sitemapResponse.status()).toBe(200);
  const sitemapSource = await sitemapResponse.text();
  const locations = await xmlLocations(page, sitemapSource);
  expect(new Set(locations).size).toBe(locations.length);
  expect([...locations].sort()).toEqual(
    expectedIdentities()
      .map(({ path }) => new URL(path, EXPECTED_SITE_ORIGIN).href)
      .sort(),
  );
  expect(locations).not.toContain(`${EXPECTED_SITE_ORIGIN}/404/`);

  const robotsResponse = await request.get("/robots.txt");
  expect(robotsResponse.status()).toBe(200);
  expect(robotsResponse.headers()["content-type"]).toContain("text/plain");
  expect(await robotsResponse.text()).toBe(
    `User-agent: *\nAllow: /\n\nSitemap: ${EXPECTED_SITE_ORIGIN}/sitemap-index.xml\n`,
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
    baseURL: LOCAL_PREVIEW_ORIGIN,
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  expect((await page.goto(NOT_FOUND_PATHS[0]))?.status()).toBe(404);
  await expect(page.locator("main > h1")).toHaveText("الصفحة غير موجودة");
  await page
    .getByRole("main")
    .getByRole("link", { name: "العودة إلى الصفحة الرئيسية" })
    .click();
  await expect(page).toHaveURL(`${LOCAL_PREVIEW_ORIGIN}/`);
  await context.close();
});

test("404 keyboard order, focus, reflow, accessibility, and network stay native", async ({
  page,
}) => {
  let unexpectedRequests = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== LOCAL_PREVIEW_ORIGIN)
      unexpectedRequests += 1;
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
