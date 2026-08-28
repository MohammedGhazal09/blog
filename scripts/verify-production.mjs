import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

import { sectionRegistry } from "../src/config/registries.ts";
import { productionSiteOrigin } from "../src/lib/site-origin.ts";

const MAX_BODY_BYTES = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 20_000;
const MISSING_PATH = "/مسار-مفقود-للتحقق/";
const ARABIC = /\p{Script=Arabic}/u;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/u;

function finding(findings, code, detail, url) {
  findings.push({ code, ...(url ? { url } : {}), detail });
}

function utcRunId(date) {
  return date.toISOString().replace(/[-:.]/gu, "");
}

async function packageVersion(path) {
  const source = await readFile(path, "utf8");
  return JSON.parse(source).version;
}

async function readBoundedBody(response, findings, url) {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    finding(
      findings,
      "BODY_TOO_LARGE",
      `declared body exceeds ${MAX_BODY_BYTES} bytes`,
      url,
    );
    return undefined;
  }

  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let source = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_BODY_BYTES) {
      await reader.cancel();
      finding(
        findings,
        "BODY_TOO_LARGE",
        `body exceeds ${MAX_BODY_BYTES} bytes`,
        url,
      );
      return undefined;
    }
    source += decoder.decode(value, { stream: true });
  }
  return source + decoder.decode();
}

function cleanSameOriginUrl(raw, origin, findings, sourceUrl) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    finding(findings, "URL_MALFORMED", "URL is not absolute", sourceUrl);
    return undefined;
  }
  if (url.origin !== origin) {
    finding(
      findings,
      "OUT_OF_ORIGIN_URL",
      `URL leaves the verified origin: ${url.origin}`,
      sourceUrl,
    );
    return undefined;
  }
  if (
    raw !== url.href ||
    url.username !== "" ||
    url.password !== "" ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    finding(
      findings,
      "URL_NOT_CLEAN",
      "URL is not an exact clean URL",
      sourceUrl,
    );
    return undefined;
  }
  return url.href;
}

async function fetchStatic({
  url,
  expectedStatus,
  expectedType,
  controlledFixture,
  findings,
  failureCode = "HTTP_STATUS",
}) {
  let response;
  try {
    const init = {
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    };
    response = controlledFixture
      ? await controlledFixture.fetch(url, init)
      : await fetch(url, init);
  } catch (error) {
    finding(
      findings,
      failureCode,
      `request failed: ${error instanceof Error ? error.message : String(error)}`,
      url,
    );
    return undefined;
  }

  if (response.status >= 300 && response.status < 400) {
    finding(
      findings,
      "STATIC_REDIRECT",
      `redirect status ${response.status}`,
      url,
    );
    return undefined;
  }
  if (response.status !== expectedStatus) {
    finding(
      findings,
      failureCode,
      `expected ${expectedStatus}, received ${response.status}`,
      url,
    );
    return undefined;
  }
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!expectedType.some((type) => contentType.includes(type))) {
    finding(
      findings,
      "CONTENT_TYPE",
      `unexpected content type: ${contentType || "missing"}`,
      url,
    );
    return undefined;
  }
  return readBoundedBody(response, findings, url);
}

async function parseXml(page, source, rootName, url, findings) {
  if (/<!DOCTYPE|<!ENTITY/iu.test(source)) {
    finding(
      findings,
      "XML_UNSAFE_DECLARATION",
      "XML declarations may not contain DOCTYPE or entities",
      url,
    );
    return [];
  }
  const parsed = await page.evaluate(
    ({ xml, expectedRoot }) => {
      const document = new DOMParser().parseFromString(xml, "application/xml");
      return {
        parserError: Boolean(document.querySelector("parsererror")),
        root: document.documentElement.localName,
        locations: [...document.querySelectorAll("loc")].map(
          (node) => node.textContent?.trim() ?? "",
        ),
        unexpectedLocations: [...document.querySelectorAll("loc")].filter(
          (node) => node.children.length > 0,
        ).length,
        expectedRoot,
      };
    },
    { xml: source, expectedRoot: rootName },
  );
  if (
    parsed.parserError ||
    parsed.root !== rootName ||
    parsed.unexpectedLocations > 0 ||
    parsed.locations.some((location) => location === "")
  ) {
    finding(findings, "XML_MALFORMED", `invalid ${rootName} document`, url);
    return [];
  }
  if (new Set(parsed.locations).size !== parsed.locations.length) {
    finding(
      findings,
      "XML_DUPLICATE_LOCATION",
      "XML contains duplicate location entries",
      url,
    );
    return [];
  }
  return parsed.locations;
}

async function parseHtml(page, source, url, findings) {
  const parsed = await page.evaluate(
    ({ html, documentUrl }) => {
      const document = new DOMParser().parseFromString(html, "text/html");
      const attributeValues = (selector, attribute) =>
        [...document.querySelectorAll(selector)].map(
          (node) => node.getAttribute(attribute)?.trim() ?? "",
        );
      return {
        lang: document.documentElement.getAttribute("lang") ?? "",
        dir: document.documentElement.getAttribute("dir") ?? "",
        titles: [...document.querySelectorAll("head > title")].map(
          (node) => node.textContent?.trim() ?? "",
        ),
        descriptions: attributeValues('meta[name="description"]', "content"),
        canonicals: attributeValues('link[rel~="canonical"]', "href"),
        robots: attributeValues('meta[name="robots"]', "content"),
        anchors: attributeValues("a[href]", "href"),
        h1: [...document.querySelectorAll("main h1")].map(
          (node) => node.textContent?.trim() ?? "",
        ),
        bodyText:
          document.body?.textContent?.replace(/\s+/gu, " ").trim() ?? "",
        media: [...document.querySelectorAll("[data-video-region]")].map(
          (node) => ({
            youtubeId: node.getAttribute("data-youtube-id") ?? "",
            iframeTitle: node.getAttribute("data-iframe-title") ?? "",
          }),
        ),
        documentUrl,
      };
    },
    { html: source, documentUrl: url },
  );
  if (!parsed.bodyText) {
    finding(findings, "HTML_MALFORMED", "HTML body is empty", url);
  }
  return parsed;
}

async function walkArticleSources(directory) {
  if (!existsSync(directory)) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...(await walkArticleSources(path)));
    else if ([".md", ".mdx"].includes(extname(entry.name).toLowerCase()))
      paths.push(path);
  }
  return paths.sort();
}

function scalar(frontmatter, field) {
  const match = new RegExp(`^${field}:\\s*(.+?)\\s*$`, "mu").exec(frontmatter);
  if (!match) return undefined;
  const raw = match[1].trim();
  return raw.replace(/^(["'])(.*)\1$/u, "$2");
}

async function repositoryDraftPaths() {
  const paths = [];
  for (const path of await walkArticleSources("src/content/articles")) {
    const source = await readFile(path, "utf8");
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/u.exec(source)?.[1];
    if (!frontmatter || scalar(frontmatter, "draft") !== "true") continue;
    const sectionKey = scalar(frontmatter, "section");
    const slug = scalar(frontmatter, "slug");
    const section = sectionRegistry[sectionKey];
    if (section && slug) paths.push(`/${section.slug}/${slug}/`);
  }
  return paths;
}

function validatePublicDocument({ document, url, origin, findings }) {
  if (document.lang !== "ar" || document.dir !== "rtl") {
    finding(
      findings,
      "ARABIC_RTL_IDENTITY",
      "document must use lang=ar and dir=rtl",
      url,
    );
  }
  if (document.titles.length !== 1 || document.descriptions.length !== 1) {
    finding(
      findings,
      "METADATA_COUNT",
      "document must contain one title and one description",
      url,
    );
  }
  const title = document.titles[0] ?? "";
  const description = document.descriptions[0] ?? "";
  if (
    !title ||
    !description ||
    !ARABIC.test(title) ||
    !ARABIC.test(description)
  ) {
    finding(
      findings,
      "METADATA_NOT_ARABIC",
      "title and description must be nonempty Arabic text",
      url,
    );
  }
  if (document.canonicals.length !== 1) {
    finding(
      findings,
      "CANONICAL_COUNT",
      "document must contain one canonical",
      url,
    );
  } else {
    const canonical = cleanSameOriginUrl(
      document.canonicals[0],
      origin,
      findings,
      url,
    );
    if (canonical && canonical !== url) {
      finding(
        findings,
        "CANONICAL_MISMATCH",
        "canonical must equal the page URL",
        url,
      );
    }
  }
  if (
    document.robots.some((value) => /(?:^|,)\s*noindex\s*(?:,|$)/iu.test(value))
  ) {
    finding(findings, "PUBLIC_NOINDEX", "public page contains noindex", url);
  }
  if (document.h1.length !== 1) {
    finding(
      findings,
      "HEADING_COUNT",
      "public page must contain one main h1",
      url,
    );
  }
  return { title, description };
}

function validateArticle(document, url, findings) {
  if (document.media.length === 0) return;
  if (document.media.length !== 1) {
    finding(
      findings,
      "YOUTUBE_IDENTITY",
      "article must contain one media region",
      url,
    );
    return;
  }
  const { youtubeId, iframeTitle } = document.media[0];
  if (!YOUTUBE_ID.test(youtubeId) || !ARABIC.test(iframeTitle)) {
    finding(findings, "YOUTUBE_IDENTITY", "invalid media identity", url);
    return;
  }
  const expected = `https://www.youtube.com/watch?v=${encodeURIComponent(youtubeId)}`;
  if (document.anchors.filter((href) => href === expected).length !== 1) {
    finding(
      findings,
      "YOUTUBE_ANCHOR",
      "article must contain one matching direct YouTube anchor",
      url,
    );
  }
}

async function writeReport(report, scope, started) {
  const runDirectory = join(
    ".artifacts",
    "phase-06",
    scope === "controlled" ? "controlled" : "production",
    utcRunId(started),
  );
  await mkdir(runDirectory, { recursive: true });
  const artifactPath = join(runDirectory, "report.json");
  report.artifactPath = artifactPath;
  await writeFile(artifactPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}

export async function runProductionVerification(options = {}) {
  const normalizedOrigin = productionSiteOrigin(process.env.SITE_ORIGIN);
  const inputOrigin = process.env.SITE_ORIGIN;

  const controlledFixture = options.controlledFixture;
  const evidenceScope = controlledFixture ? "controlled" : "final-origin";
  const transport = controlledFixture ? "intercepted-fixture" : "network";
  const started = new Date();
  const findings = [];
  const errors = [];
  const routeGraph = {
    sitemapUrls: [],
    crawledUrls: [],
    sameOriginLinks: [],
    externalLinks: [],
  };
  const documents = new Map();
  let browser;
  let chromiumVersion = "unavailable";

  try {
    browser = await chromium.launch({ headless: true });
    chromiumVersion = browser.version();
    const context = await browser.newContext();
    const page = await context.newPage();
    if (controlledFixture) await controlledFixture.installBrowserRoutes(page);

    const robotsUrl = new URL("/robots.txt", normalizedOrigin).href;
    const sitemapIndexUrl = new URL("/sitemap-index.xml", normalizedOrigin)
      .href;
    const robots = await fetchStatic({
      url: robotsUrl,
      expectedStatus: 200,
      expectedType: ["text/plain"],
      controlledFixture,
      findings,
    });
    if (robots !== undefined) {
      const sitemapDirectives = robots
        .split(/\r?\n/gu)
        .filter((line) => /^Sitemap:\s*/iu.test(line))
        .map((line) => line.replace(/^Sitemap:\s*/iu, "").trim());
      if (
        sitemapDirectives.length !== 1 ||
        sitemapDirectives[0] !== sitemapIndexUrl ||
        !/^User-agent:\s*\*$/imu.test(robots) ||
        !/^Allow:\s*\/$/imu.test(robots)
      ) {
        finding(
          findings,
          "ROBOTS_SITEMAP",
          "robots must allow the site and name the exact sitemap index",
          robotsUrl,
        );
      }
    }

    const sitemapIndex = await fetchStatic({
      url: sitemapIndexUrl,
      expectedStatus: 200,
      expectedType: ["xml"],
      controlledFixture,
      findings,
    });
    const childSitemaps = sitemapIndex
      ? await parseXml(
          page,
          sitemapIndex,
          "sitemapindex",
          sitemapIndexUrl,
          findings,
        )
      : [];
    const cleanChildren = childSitemaps
      .map((url) =>
        cleanSameOriginUrl(url, normalizedOrigin, findings, sitemapIndexUrl),
      )
      .filter(Boolean);
    for (const childUrl of cleanChildren) {
      if (!/^\/sitemap-[0-9]+\.xml$/u.test(new URL(childUrl).pathname)) {
        finding(
          findings,
          "SITEMAP_PATH",
          "child sitemap path is outside the expected family",
          childUrl,
        );
        continue;
      }
      const child = await fetchStatic({
        url: childUrl,
        expectedStatus: 200,
        expectedType: ["xml"],
        controlledFixture,
        findings,
      });
      if (!child) continue;
      const locations = await parseXml(
        page,
        child,
        "urlset",
        childUrl,
        findings,
      );
      for (const raw of locations) {
        const clean = cleanSameOriginUrl(
          raw,
          normalizedOrigin,
          findings,
          childUrl,
        );
        if (clean) routeGraph.sitemapUrls.push(clean);
      }
    }
    if (
      new Set(routeGraph.sitemapUrls).size !== routeGraph.sitemapUrls.length
    ) {
      finding(
        findings,
        "XML_DUPLICATE_LOCATION",
        "public URL occurs in more than one sitemap entry",
        sitemapIndexUrl,
      );
      routeGraph.sitemapUrls = [...new Set(routeGraph.sitemapUrls)];
    }

    const drafts = new Set(await repositoryDraftPaths());
    for (const url of routeGraph.sitemapUrls) {
      const pathname = decodeURI(new URL(url).pathname);
      if (drafts.has(pathname)) {
        finding(
          findings,
          "DRAFT_LEAK",
          "repository draft appears in sitemap",
          url,
        );
        continue;
      }
      if (pathname === MISSING_PATH) {
        finding(
          findings,
          "NOT_FOUND_CONTRACT",
          "404 route appears in sitemap",
          url,
        );
        continue;
      }
      const source = await fetchStatic({
        url,
        expectedStatus: 200,
        expectedType: ["text/html", "application/xhtml+xml"],
        controlledFixture,
        findings,
      });
      if (source === undefined) continue;
      routeGraph.crawledUrls.push(url);
      const document = await parseHtml(page, source, url, findings);
      documents.set(url, document);
      validatePublicDocument({
        document,
        url,
        origin: normalizedOrigin,
        findings,
      });
      validateArticle(document, url, findings);
    }

    const titleOwners = new Map();
    const descriptionOwners = new Map();
    const queue = [];
    const sameOriginLinks = new Set();
    const externalLinks = new Set();
    for (const [url, document] of documents) {
      const title = document.titles[0] ?? "";
      const description = document.descriptions[0] ?? "";
      for (const [value, owners] of [
        [title, titleOwners],
        [description, descriptionOwners],
      ]) {
        if (value && owners.has(value)) {
          finding(
            findings,
            "METADATA_NOT_UNIQUE",
            `metadata duplicates ${owners.get(value)}`,
            url,
          );
        } else if (value) owners.set(value, url);
      }
      for (const href of document.anchors) {
        let destination;
        try {
          destination = new URL(href, url);
        } catch {
          finding(findings, "URL_MALFORMED", "anchor URL is malformed", url);
          continue;
        }
        if (
          ![/^https?:$/u].some((pattern) => pattern.test(destination.protocol))
        )
          continue;
        if (destination.origin !== normalizedOrigin) {
          externalLinks.add(destination.href);
          continue;
        }
        if (
          destination.search !== "" ||
          destination.hash !== "" ||
          destination.username !== "" ||
          destination.password !== ""
        ) {
          finding(
            findings,
            "URL_NOT_CLEAN",
            "internal anchor is not clean",
            url,
          );
          continue;
        }
        sameOriginLinks.add(destination.href);
        if (!documents.has(destination.href)) queue.push(destination.href);
      }
    }
    routeGraph.sameOriginLinks = [...sameOriginLinks];
    routeGraph.externalLinks = [...externalLinks];

    for (const linkUrl of [...new Set(queue)]) {
      const pathname = decodeURI(new URL(linkUrl).pathname);
      if (drafts.has(pathname)) {
        finding(
          findings,
          "DRAFT_LEAK",
          "repository draft is publicly linked",
          linkUrl,
        );
        continue;
      }
      const source = await fetchStatic({
        url: linkUrl,
        expectedStatus: 200,
        expectedType: ["text/html", "application/xhtml+xml"],
        controlledFixture,
        findings,
        failureCode: "BROKEN_INTERNAL_LINK",
      });
      if (source === undefined) continue;
      if (!routeGraph.sitemapUrls.includes(linkUrl)) {
        finding(
          findings,
          "LINK_NOT_IN_SITEMAP",
          "indexable internal destination is absent from sitemap",
          linkUrl,
        );
      }
      routeGraph.crawledUrls.push(linkUrl);
    }

    const missingUrl = new URL(MISSING_PATH, normalizedOrigin).href;
    const missing = await fetchStatic({
      url: missingUrl,
      expectedStatus: 404,
      expectedType: ["text/html", "application/xhtml+xml"],
      controlledFixture,
      findings,
      failureCode: "NOT_FOUND_CONTRACT",
    });
    if (missing !== undefined) {
      const document = await parseHtml(page, missing, missingUrl, findings);
      if (
        document.lang !== "ar" ||
        document.dir !== "rtl" ||
        document.canonicals.length !== 0 ||
        document.h1.length !== 1 ||
        !ARABIC.test(document.bodyText) ||
        !document.robots.some(
          (value) => value.toLowerCase() === "noindex,follow",
        )
      ) {
        finding(
          findings,
          "NOT_FOUND_CONTRACT",
          "missing route must be an Arabic RTL noindex,follow 404 without canonical",
          missingUrl,
        );
      }
    }
    await context.close();
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  } finally {
    await browser?.close();
  }

  routeGraph.sitemapUrls.sort();
  routeGraph.crawledUrls = [...new Set(routeGraph.crawledUrls)].sort();
  routeGraph.sameOriginLinks.sort();
  routeGraph.externalLinks.sort();
  const completedAt = new Date().toISOString();
  const report = {
    schemaVersion: 1,
    evidenceScope,
    transport,
    inputOrigin,
    normalizedOrigin,
    startedAt: started.toISOString(),
    completedAt,
    runtime: {
      node: process.version,
      playwright: await packageVersion(
        "node_modules/@playwright/test/package.json",
      ),
      chromium: chromiumVersion,
    },
    routeGraph,
    findings,
    errors,
    automatedGates: {
      runner: errors.length === 0 ? "PASS" : "FAIL",
      crawl: findings.length === 0 && errors.length === 0 ? "PASS" : "FAIL",
      "QUAL-05": "PENDING",
      "QUAL-06": "PENDING",
    },
    artifactPath: "",
  };
  return writeReport(report, evidenceScope, started);
}

function printSummary(report) {
  const issueCount = report.findings.length + report.errors.length;
  console.log(`المنشأ: ${report.normalizedOrigin}`);
  console.log(`الصفحات: ${report.routeGraph.crawledUrls.length}`);
  console.log(`الملاحظات: ${issueCount}`);
  console.log(`التقرير: ${report.artifactPath}`);
  console.log(
    `نطاق الإثبات: ${report.evidenceScope === "controlled" ? "اختبار مضبوط فقط" : "رصد للمنشأ النهائي يحتاج مراجعة بشرية"}`,
  );
}

const isMain =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  try {
    const report = await runProductionVerification();
    printSummary(report);
    if (report.findings.length > 0 || report.errors.length > 0)
      process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
