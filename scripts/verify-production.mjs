import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { request as httpsRequest } from "node:https";
import { extname, join, resolve } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

import { sectionRegistry } from "../src/config/registries.ts";
import {
  chromiumHostResolverRules,
  createPinnedLookup,
  verifiedProductionSiteOrigin,
} from "../src/lib/site-origin.ts";

const MAX_BODY_BYTES = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 20_000;
const MISSING_PATH = "/مسار-مفقود-للتحقق/";
const ARABIC = /\p{Script=Arabic}/u;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/u;
const LATIN = /[A-Za-z]/u;
const FINAL_READER_IDLE_MS = 5_000;
const PERFORMANCE_NAVIGATION_TIMEOUT_MS = 45_000;
const RENDERED_NAVIGATION_TIMEOUT_MS = 30_000;
const FONT_READY_TIMEOUT_MS = 10_000;
const PERFORMANCE_AUDIT_TIMEOUT_MS = 65_000;
const RENDERED_AUDIT_TIMEOUT_MS = 45_000;
const AUDIT_CLOSE_TIMEOUT_MS = 1_000;
const RUNNER_SETUP_TIMEOUT_MS = 30_000;
const BROWSER_CLOSE_TIMEOUT_MS = 5_000;
const MEDIA_REGION_SELECTOR = "[data-video-region]";
const MEDIA_ACTIVATE_SELECTOR = "[data-video-activate]";
const MEDIA_DIRECT_SELECTOR = ".youtube-cta";
// A reader may pause after the article becomes usable. Keep the no-intent
// transport guard alive long enough to expose delayed eager media work.
const MEDIA_PRE_INTENT_STABILITY_MS = 250;
// Activation may schedule follow-up DOM and navigation work. Observe every
// mutation and request for one bounded interval after the interaction ends.
const MEDIA_POST_ACTIVATION_STABILITY_MS = 250;
const PLAUSIBLE_LOADER =
  /^https:\/\/plausible\.io\/js\/pa-[A-Za-z0-9_-]+\.js$/u;
const REPORT_URL = /\b(?:https?|wss?):\/\/[^\s"'<>]+/giu;
const PAGE_TRANSPORT_MONITORS = new WeakMap();
const PROFILE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  cpuThrottlingRate: 4,
  latencyMs: 562.5,
  downloadThroughputBytesPerSecond: 180_000,
  uploadThroughputBytesPerSecond: 84_375,
  connectionType: "cellular4g",
  performanceNavigationTimeoutMs: PERFORMANCE_NAVIGATION_TIMEOUT_MS,
  renderedNavigationTimeoutMs: RENDERED_NAVIGATION_TIMEOUT_MS,
  fontReadyTimeoutMs: FONT_READY_TIMEOUT_MS,
  performanceAuditTimeoutMs: PERFORMANCE_AUDIT_TIMEOUT_MS,
  renderedAuditTimeoutMs: RENDERED_AUDIT_TIMEOUT_MS,
  runnerSetupTimeoutMs: RUNNER_SETUP_TIMEOUT_MS,
  browserCloseTimeoutMs: BROWSER_CLOSE_TIMEOUT_MS,
  commands: [
    "Network.emulateNetworkConditionsByRule",
    "Network.overrideNetworkState",
    "Emulation.setCPUThrottlingRate",
  ],
};

export function maximumSessionWindowCls(shifts) {
  let maximum = 0;
  let session;
  for (const shift of shifts) {
    if (shift.hadRecentInput) continue;
    const continues =
      session !== undefined &&
      shift.startTime - session.last < 1_000 &&
      shift.startTime - session.first <= 5_000;
    session = continues
      ? {
          ...session,
          last: shift.startTime,
          value: session.value + shift.value,
        }
      : {
          first: shift.startTime,
          last: shift.startTime,
          value: shift.value,
        };
    maximum = Math.max(maximum, session.value);
  }
  return maximum;
}

function median(values) {
  return values.length === 3 && values.every(Number.isFinite)
    ? [...values].sort((first, second) => first - second)[1]
    : null;
}

function comparePublicUrls(first, second) {
  const firstPath = decodeURI(new URL(first).pathname);
  const secondPath = decodeURI(new URL(second).pathname);
  return firstPath < secondPath ? -1 : firstPath > secondPath ? 1 : 0;
}

function isPublicReportQueryValue(url, name, value) {
  return (
    (url.hostname === "www.youtube.com" &&
      url.pathname === "/watch" &&
      name === "v" &&
      YOUTUBE_ID.test(value)) ||
    (url.hostname === "www.youtube-nocookie.com" &&
      /^\/embed\/[A-Za-z0-9_-]{11}$/u.test(url.pathname) &&
      name === "hl" &&
      value === "ar")
  );
}

function reportSafeUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return "[redacted-url]";
  }
  const redactQuery = [...url.searchParams].some(
    ([name, value]) => !isPublicReportQueryValue(url, name, value),
  );
  if (
    url.username === "" &&
    url.password === "" &&
    url.hash === "" &&
    !redactQuery
  )
    return rawUrl;
  url.username = "";
  url.password = "";
  const query = new URLSearchParams();
  let redacted = false;
  for (const [name, value] of url.searchParams) {
    if (isPublicReportQueryValue(url, name, value)) query.append(name, value);
    else redacted = true;
  }
  if (redacted) query.append("redacted", "[REDACTED]");
  url.search = query.toString();
  url.hash = "";
  return url.href;
}

function reportSafeString(value) {
  return value.replace(REPORT_URL, reportSafeUrl);
}

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

export function createPinnedFetch(verifiedSite) {
  const lookup = createPinnedLookup(verifiedSite);
  return (rawUrl, init) =>
    new Promise((resolveRequest, rejectRequest) => {
      const url = new URL(rawUrl);
      if (url.origin !== verifiedSite.origin) {
        rejectRequest(new Error("pinned fetch rejected an off-origin URL"));
        return;
      }
      const request = httpsRequest(
        url,
        {
          method: "GET",
          lookup,
          servername: verifiedSite.hostname,
          rejectUnauthorized: true,
          signal: init.signal,
        },
        (response) => {
          resolveRequest(
            new Response(Readable.toWeb(response), {
              status: response.statusCode,
              headers: response.headers,
            }),
          );
        },
      );
      request.once("error", rejectRequest);
      request.end();
    });
}

export function chromiumLaunchArgs(verifiedSite) {
  return [
    "--no-proxy-server",
    "--proxy-bypass-list=*",
    "--force-webrtc-ip-handling-policy=disable_non_proxied_udp",
    "--webrtc-ip-handling-policy=disable_non_proxied_udp",
    `--host-resolver-rules=${chromiumHostResolverRules(verifiedSite)}`,
  ];
}

function disableWebRtc() {
  for (const name of ["RTCPeerConnection", "webkitRTCPeerConnection"])
    Object.defineProperty(globalThis, name, {
      value: undefined,
      configurable: false,
      writable: false,
    });
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
  networkFetch,
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
      : await networkFetch(url, init);
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
  const contentType = response.headers.get("content-type") ?? "";
  const mediaType = contentType.split(";", 1)[0].trim().toLowerCase();
  if (!expectedType.includes(mediaType)) {
    finding(
      findings,
      "CONTENT_TYPE",
      `unexpected content type: ${contentType.toLowerCase() || "missing"}`,
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
      const root = document.documentElement;
      const expectedEntry = expectedRoot === "sitemapindex" ? "sitemap" : "url";
      const hasNonWhitespaceText = (node) =>
        [...node.childNodes].some(
          (child) =>
            child.nodeType === Node.TEXT_NODE &&
            (child.textContent?.trim() ?? "") !== "",
        );
      const entries = [...root.children];
      const structureValid =
        root.namespaceURI === "http://www.sitemaps.org/schemas/sitemap/0.9" &&
        !hasNonWhitespaceText(root) &&
        entries.every((entry) => {
          const children = [...entry.children];
          const location = children[0];
          return (
            entry.localName === expectedEntry &&
            entry.namespaceURI === root.namespaceURI &&
            !hasNonWhitespaceText(entry) &&
            children.length === 1 &&
            location.localName === "loc" &&
            location.namespaceURI === root.namespaceURI &&
            location.children.length === 0 &&
            (location.textContent?.trim() ?? "") !== ""
          );
        });
      return {
        parserError: Boolean(document.querySelector("parsererror")),
        root: root.localName,
        structureValid,
        locations: structureValid
          ? entries.map((entry) => entry.children[0].textContent.trim())
          : [],
        expectedRoot,
      };
    },
    { xml: source, expectedRoot: rootName },
  );
  if (
    parsed.parserError ||
    parsed.root !== rootName ||
    !parsed.structureValid
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
        scripts: [...document.querySelectorAll("script[src]")].map((node) => ({
          src: node.getAttribute("src")?.trim() ?? "",
          defer: node.hasAttribute("defer"),
          attributes: [...node.attributes].map(({ name, value }) => ({
            name,
            value,
          })),
        })),
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

function validatedPlausibleLoader(document, url, findings) {
  const loaders = document.scripts.filter(({ src }) =>
    PLAUSIBLE_LOADER.test(src),
  );
  const plausibleScripts = document.scripts.filter(
    ({ src }) => new URL(src, url).origin === "https://plausible.io",
  );
  if (plausibleScripts.length === 0) return undefined;
  if (
    loaders.length !== 1 ||
    !loaders[0].defer ||
    loaders[0].attributes.length !== 2 ||
    loaders[0].attributes.some(
      ({ name }) => name !== "src" && name !== "defer",
    ) ||
    plausibleScripts.some(({ src }) => !PLAUSIBLE_LOADER.test(src))
  ) {
    finding(
      findings,
      "PLAUSIBLE_LOADER",
      "page must contain one exact Plausible property loader with only src and defer attributes",
      url,
    );
    return undefined;
  }
  return loaders[0].src;
}

function isApprovedPlausibleRequest(request, loader) {
  if (!loader) return false;
  return (
    request.url() === loader &&
    request.method() === "GET" &&
    request.resourceType() === "script"
  );
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

const SECTION_SLUGS = new Set(
  Object.values(sectionRegistry).map(({ slug }) => slug),
);

function isArticleUrl(url, origin) {
  const parsed = new URL(url);
  if (parsed.origin !== origin) return false;
  const segments = decodeURI(parsed.pathname).split("/").filter(Boolean);
  return segments.length === 2 && SECTION_SLUGS.has(segments[0]);
}

function articleUrls(origin, documents) {
  return [...documents.keys()]
    .filter((url) => isArticleUrl(url, origin))
    .sort(comparePublicUrls);
}

function validateSitemapCoverage(origin, urls, findings, sitemapIndexUrl) {
  if (urls.length === 0) {
    finding(
      findings,
      "SITEMAP_URLS",
      "sitemap discovery produced zero public URLs",
      sitemapIndexUrl,
    );
  }
  const missing = [];
  const discovered = new Set(urls);
  const homepage = new URL("/", origin).href;
  if (!discovered.has(homepage)) missing.push("homepage");
  for (const { slug } of Object.values(sectionRegistry)) {
    const sectionUrl = new URL(`/${slug}/`, origin).href;
    if (!discovered.has(sectionUrl)) missing.push(`section:${slug}`);
    if (
      !urls.some((url) => {
        if (!isArticleUrl(url, origin)) return false;
        return (
          decodeURI(new URL(url).pathname).split("/").filter(Boolean)[0] ===
          slug
        );
      })
    ) {
      missing.push(`article:${slug}`);
    }
  }
  if (missing.length > 0) {
    finding(
      findings,
      "SITEMAP_COVERAGE",
      `sitemap is missing required route coverage: ${missing.join(", ")}`,
      sitemapIndexUrl,
    );
  }
  return urls.length > 0 && missing.length === 0;
}

function validateArticle(document, url, origin, findings) {
  if (!isArticleUrl(url, origin)) return;
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
  if (!document.anchors.includes(expected)) {
    finding(
      findings,
      "YOUTUBE_ANCHOR",
      "article must contain a matching direct YouTube anchor",
      url,
    );
  }
}

function selectPerformanceRoutes(origin, documents, findings) {
  const homepage = new URL("/", origin).href;
  const articles = articleUrls(origin, documents);
  const bySection = new Map();
  for (const articleUrl of articles) {
    const segments = decodeURI(new URL(articleUrl).pathname)
      .split("/")
      .filter(Boolean);
    if (segments.length !== 2) continue;
    const sectionUrl = new URL(`/${segments[0]}/`, origin).href;
    if (!documents.has(sectionUrl)) continue;
    const sectionArticles = bySection.get(sectionUrl) ?? [];
    sectionArticles.push(articleUrl);
    bySection.set(sectionUrl, sectionArticles);
  }
  const sections = [...bySection.keys()].sort(comparePublicUrls);
  if (!documents.has(homepage) || sections.length !== 3) {
    finding(
      findings,
      "PERFORMANCE_SELECTION",
      "performance sampling requires homepage and exactly three discovered article sections",
      homepage,
    );
    return [];
  }
  const selected = [
    { role: "homepage", url: homepage },
    { role: "section-index", url: sections[0] },
    ...sections.map((sectionUrl) => ({
      role: "section-article",
      sectionUrl,
      url: [...bySection.get(sectionUrl)].sort(comparePublicUrls)[0],
    })),
  ];
  if (
    selected.length !== 5 ||
    new Set(selected.map(({ url }) => url)).size !== 5
  ) {
    finding(
      findings,
      "PERFORMANCE_SELECTION",
      "performance sampling did not produce five distinct route roles",
      homepage,
    );
    return [];
  }
  return selected;
}

function installVitalsObserver() {
  const state = { lcp: null, cls: 0, shifts: [], supported: [] };
  globalThis.__phase6Vitals = state;
  const supported = PerformanceObserver.supportedEntryTypes;
  if (supported.includes("largest-contentful-paint")) {
    state.supported.push("largest-contentful-paint");
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) state.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  }
  if (supported.includes("layout-shift")) {
    state.supported.push("layout-shift");
    let session;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.hadRecentInput) continue;
        state.shifts.push({
          startTime: entry.startTime,
          value: entry.value,
        });
        const continues =
          session &&
          entry.startTime - session.last < 1_000 &&
          entry.startTime - session.first <= 5_000;
        session = continues
          ? {
              ...session,
              last: entry.startTime,
              value: session.value + entry.value,
            }
          : {
              first: entry.startTime,
              last: entry.startTime,
              value: entry.value,
            };
        state.cls = Math.max(state.cls, session.value);
      }
    }).observe({ type: "layout-shift", buffered: true });
  }
}

async function installControlledRoutes(page, controlledFixture) {
  if (controlledFixture) await controlledFixture.installBrowserRoutes(page);
}

async function navigateSameOrigin({
  page,
  url,
  origin,
  timeout,
  findings,
  browserTransport,
  intentionalBlockedRequest = async () => false,
  onUnexpectedRequest = () => {},
}) {
  const unexpectedRequests = [];
  const plausibleLoaderRequests = [];
  const responseChecks = [];
  const responseListener = (response) => {
    if (new URL(response.url()).origin !== origin) return;
    responseChecks.push(
      response
        .serverAddr()
        .then((server) => {
          if (!server) {
            if (browserTransport.requireRemoteAddress)
              unexpectedRequests.push(
                `missing remote address: ${response.url()}`,
              );
            return;
          }
          browserTransport.remoteAddresses.add(
            `${server.ipAddress}:${server.port}`,
          );
          if (
            !browserTransport.approvedAddresses.has(
              server.ipAddress.toLowerCase(),
            )
          )
            unexpectedRequests.push(
              `unapproved remote address ${server.ipAddress}: ${response.url()}`,
            );
        })
        .catch((error) => {
          if (browserTransport.requireRemoteAddress)
            unexpectedRequests.push(
              `remote address unavailable for ${response.url()}: ${error instanceof Error ? error.message : String(error)}`,
            );
        }),
    );
  };
  const guard = async (route) => {
    const request = route.request();
    const destination = new URL(request.url());
    if (destination.origin === origin) return route.fallback();
    if (request.url() === browserTransport.plausibleLoader)
      plausibleLoaderRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
      });
    const approvedPlausibleRequest = isApprovedPlausibleRequest(
      request,
      browserTransport.plausibleLoader,
    );
    const approvedIntentionalRequest = approvedPlausibleRequest
      ? false
      : await intentionalBlockedRequest(request);
    if (!approvedPlausibleRequest && !approvedIntentionalRequest) {
      unexpectedRequests.push(destination.href);
      onUnexpectedRequest(request);
      finding(
        findings,
        "BROWSER_ORIGIN_ESCAPE",
        `blocked off-origin ${request.resourceType()} request: ${destination.href}`,
        url,
      );
    }
    return route.abort("blockedbyclient");
  };
  await page.context().routeWebSocket("**/*", async (webSocket) => {
    const destination = webSocket.url();
    unexpectedRequests.push(`websocket request: ${destination}`);
    finding(
      findings,
      "BROWSER_ORIGIN_ESCAPE",
      `blocked WebSocket request: ${destination}`,
      url,
    );
    await webSocket.close({ code: 1008, reason: "WebSockets are not allowed" });
  });
  await page.context().route("**/*", guard);
  await page.route("**/*", guard);
  page.on("response", responseListener);
  PAGE_TRANSPORT_MONITORS.set(page, async () => {
    page.off("response", responseListener);
    await Promise.allSettled(responseChecks);
    if (
      browserTransport.plausibleLoader &&
      (plausibleLoaderRequests.length !== 1 ||
        plausibleLoaderRequests[0].method !== "GET" ||
        plausibleLoaderRequests[0].resourceType !== "script")
    ) {
      const detail = `expected one exact Plausible GET script request, observed ${JSON.stringify(plausibleLoaderRequests)}`;
      finding(findings, "PLAUSIBLE_LOADER_REQUEST", detail, url);
      unexpectedRequests.push(detail);
    }
    for (const detail of unexpectedRequests.filter((value) =>
      value.includes("remote address"),
    ))
      finding(findings, "BROWSER_REMOTE_ADDRESS", detail, url);
    if (unexpectedRequests.length > 0)
      throw new Error(
        `blocked off-origin browser requests: ${unexpectedRequests.join(", ")}`,
      );
  });
  await page.goto(url, { waitUntil: "load", timeout });
  await page.waitForTimeout(0);
  if (page.url() !== url) {
    finding(
      findings,
      "BROWSER_DESTINATION",
      `browser finished at ${page.url()}`,
      url,
    );
    throw new Error(`browser did not finish at the requested URL: ${url}`);
  }
}

async function applyPerformanceProfile(context, page, controlled) {
  if (controlled) return;
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  const conditions = {
    urlPattern: "",
    latency: PROFILE.latencyMs,
    downloadThroughput: PROFILE.downloadThroughputBytesPerSecond,
    uploadThroughput: PROFILE.uploadThroughputBytesPerSecond,
    connectionType: PROFILE.connectionType,
  };
  await cdp.send("Network.emulateNetworkConditionsByRule", {
    offline: false,
    matchedNetworkConditions: [conditions],
  });
  await cdp.send("Network.overrideNetworkState", {
    offline: false,
    latency: conditions.latency,
    downloadThroughput: conditions.downloadThroughput,
    uploadThroughput: conditions.uploadThroughput,
    connectionType: conditions.connectionType,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", {
    rate: PROFILE.cpuThrottlingRate,
  });
}

async function waitForFontReadiness(page, timeoutMs) {
  let timer;
  try {
    await Promise.race([
      page.evaluate(() => document.fonts?.ready),
      new Promise((_, reject) => {
        timer = setTimeout(
          () =>
            reject(new Error(`font readiness timed out after ${timeoutMs} ms`)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function auditPerformance({
  browser,
  origin,
  selectedRoutes,
  controlledFixture,
  readerIdleMs,
  fontReadyTimeoutMs,
  auditTimeoutMs,
  findings,
  browserTransport,
}) {
  const results = [];
  let contextSequence = 0;
  for (const { url } of selectedRoutes) {
    const runs = [];
    for (let iteration = 0; iteration < 3; iteration += 1) {
      contextSequence += 1;
      try {
        const run = await withAuditPage({
          browser,
          controlledFixture,
          contextOptions: {
            deviceScaleFactor: PROFILE.deviceScaleFactor,
            isMobile: PROFILE.isMobile,
            hasTouch: PROFILE.hasTouch,
          },
          prepareContext: (context) =>
            context.addInitScript(installVitalsObserver),
          timeoutMs: auditTimeoutMs,
          label: `performance run ${iteration + 1}`,
          task: async ({ context, page }) => {
            await applyPerformanceProfile(
              context,
              page,
              Boolean(controlledFixture),
            );
            await navigateSameOrigin({
              page,
              url,
              origin,
              timeout: PERFORMANCE_NAVIGATION_TIMEOUT_MS,
              findings,
              browserTransport,
            });
            await waitForFontReadiness(page, fontReadyTimeoutMs);
            await page.waitForTimeout(readerIdleMs);
            const controlledSample =
              controlledFixture?.performanceSamples?.get(url)?.[iteration];
            const observed = controlledSample
              ? {
                  lcp: controlledSample.lcp,
                  cls: maximumSessionWindowCls(controlledSample.shifts),
                  supported: [...controlledSample.supported],
                }
              : await page.evaluate(() => globalThis.__phase6Vitals);
            const observerSupport = observed?.supported ?? [];
            const lcpMs = Number.isFinite(observed?.lcp) ? observed.lcp : null;
            const cls = Number.isFinite(observed?.cls) ? observed.cls : null;
            if (
              !observerSupport.includes("largest-contentful-paint") ||
              !observerSupport.includes("layout-shift")
            ) {
              finding(
                findings,
                "PERFORMANCE_OBSERVER",
                `run ${iteration + 1} lacks required observer support`,
                url,
              );
            }
            if (lcpMs === null || cls === null) {
              finding(
                findings,
                "PERFORMANCE_METRIC",
                `run ${iteration + 1} has a missing or non-finite metric`,
                url,
              );
            }
            return {
              iteration: iteration + 1,
              contextSequence,
              lcpMs,
              cls,
              observerSupport,
            };
          },
        });
        runs.push(run);
      } catch (error) {
        finding(
          findings,
          "PERFORMANCE_NAVIGATION",
          `run ${iteration + 1} failed: ${error instanceof Error ? error.message : String(error)}`,
          url,
        );
        runs.push({
          iteration: iteration + 1,
          contextSequence,
          lcpMs: null,
          cls: null,
          observerSupport: [],
        });
      }
    }
    const medianLcpMs = median(runs.map(({ lcpMs }) => lcpMs));
    const medianCls = median(runs.map(({ cls }) => cls));
    const passed =
      medianLcpMs !== null &&
      medianCls !== null &&
      medianLcpMs <= 2_500 &&
      medianCls <= 0.1 &&
      runs.every(
        ({ observerSupport }) =>
          observerSupport.includes("largest-contentful-paint") &&
          observerSupport.includes("layout-shift"),
      );
    if (!passed && medianLcpMs !== null && medianCls !== null) {
      finding(
        findings,
        "PERFORMANCE_THRESHOLD",
        `median LCP ${medianLcpMs} ms and CLS ${medianCls}`,
        url,
      );
    }
    results.push({
      url,
      runs,
      medianLcpMs,
      medianCls,
      status: passed ? "PASS" : "FAIL",
    });
  }
  return results;
}

async function bestEffortCloseAuditPage(page, context) {
  if (!page && !context) return;
  const closing = Promise.allSettled([
    page?.close({ runBeforeUnload: false }),
    context?.close(),
  ]);
  let timer;
  try {
    await Promise.race([
      closing,
      new Promise((resolveClose) => {
        timer = setTimeout(resolveClose, AUDIT_CLOSE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function closeAuditPage(page, context) {
  await page?.close({ runBeforeUnload: false });
  await context?.close();
}

async function finishBrowserTransport(page) {
  const finish = PAGE_TRANSPORT_MONITORS.get(page);
  PAGE_TRANSPORT_MONITORS.delete(page);
  await finish?.();
}

async function withHardDeadline({ timeoutMs, label, task, onTimeout }) {
  let timer;
  try {
    return await Promise.race([
      task(),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          onTimeout?.();
          reject(new Error(`${label} timed out after ${timeoutMs} ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function withAuditPage({
  browser,
  controlledFixture,
  contextOptions,
  prepareContext,
  timeoutMs,
  label,
  task,
}) {
  let context;
  let page;
  return withHardDeadline({
    timeoutMs,
    label,
    onTimeout: () => {
      void bestEffortCloseAuditPage(page, context)
        .then(() => finishBrowserTransport(page))
        .catch(() => {});
    },
    task: async () => {
      await controlledFixture?.beforeAuditPageSetup?.(label);
      context = await browser.newContext({
        viewport: PROFILE.viewport,
        serviceWorkers: "block",
        ...contextOptions,
      });
      await context.addInitScript(disableWebRtc);
      await prepareContext?.(context);
      page = await context.newPage();
      await installControlledRoutes(page, controlledFixture);
      let result;
      let failure;
      try {
        result = await task({ context, page });
      } catch (error) {
        failure = error;
      }
      await controlledFixture?.beforeAuditPageClose?.(label);
      await closeAuditPage(page, context).catch((error) => (failure ??= error));
      await finishBrowserTransport(page).catch((error) => (failure ??= error));
      if (failure) throw failure;
      return result;
    },
  });
}

function exactMediaIntent(expectedSrc, requests) {
  let consumeEventAuthorization = async () => false;
  let pendingEventAuthorization;
  let trustedEventBoundaryReached = false;
  let preActivationRequestCount = 0;
  return {
    bindEventAuthorizationConsumer(consumer) {
      consumeEventAuthorization = consumer;
    },
    async classify(request) {
      if (request.url() !== expectedSrc) return false;
      requests.push(request.url());
      if (!trustedEventBoundaryReached) {
        pendingEventAuthorization ??= consumeEventAuthorization().catch(
          () => false,
        );
        const consumed = await pendingEventAuthorization;
        pendingEventAuthorization = undefined;
        if (consumed) trustedEventBoundaryReached = true;
      }
      const eventAuthorized = trustedEventBoundaryReached;
      if (!eventAuthorized) preActivationRequestCount += 1;
      const approved =
        eventAuthorized &&
        request.method() === "GET" &&
        request.resourceType() === "document" &&
        request.isNavigationRequest();
      return approved;
    },
    preActivationRequestCount() {
      return preActivationRequestCount;
    },
  };
}

async function bindExactMediaEventIntent(intent, page, trigger, type, key) {
  await trigger.evaluate(
    (node, eventContract) => {
      const marker = Symbol.for("mangawy.production.media-intent-event");
      const state = {
        expectedSequence: 1,
        sequence: 0,
        consumedSequence: 0,
        type: eventContract.type,
        key: eventContract.key ?? null,
        target: node,
        eventTarget: null,
      };
      document[marker] = state;
      node.addEventListener(
        eventContract.type,
        (event) => {
          if (
            !event.isTrusted ||
            event.type !== eventContract.type ||
            event.target !== node ||
            state.sequence !== state.expectedSequence - 1
          )
            return;
          if (
            eventContract.key &&
            (event.key !== eventContract.key || event.repeat)
          )
            return;
          state.eventTarget = event.target;
          state.sequence = state.expectedSequence;
        },
        { capture: true },
      );
    },
    { type, key },
  );
  intent.bindEventAuthorizationConsumer(() =>
    page.evaluate(() => {
      const marker = Symbol.for("mangawy.production.media-intent-event");
      const state = document[marker];
      if (
        !state ||
        state.sequence !== state.expectedSequence ||
        state.consumedSequence !== state.expectedSequence - 1 ||
        state.eventTarget !== state.target
      )
        return false;
      state.consumedSequence = state.expectedSequence;
      return true;
    }),
  );
}

async function mediaGeometry(region) {
  const box = await region.boundingBox();
  return box
    ? { width: box.width, height: box.height, ratio: box.width / box.height }
    : null;
}

async function startMediaStabilityObservation(region) {
  await region.evaluate((node) => {
    const key = Symbol.for("mangawy.production.media-stability");
    const state = {
      maxIframeCount: node.querySelectorAll("iframe").length,
      mutationCount: 0,
      observer: undefined,
      restorers: [],
      sample: undefined,
    };
    state.sample = () => {
      state.maxIframeCount = Math.max(
        state.maxIframeCount,
        node.querySelectorAll("iframe").length,
      );
    };
    const instrumentMethod = (prototype, method) => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, method);
      if (!descriptor || typeof descriptor.value !== "function") return;
      Object.defineProperty(prototype, method, {
        ...descriptor,
        value: function (...args) {
          try {
            return Reflect.apply(descriptor.value, this, args);
          } finally {
            state.sample();
          }
        },
      });
      state.restorers.push(() =>
        Object.defineProperty(prototype, method, descriptor),
      );
    };
    const instrumentSetter = (prototype, property) => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
      if (!descriptor || typeof descriptor.set !== "function") return;
      Object.defineProperty(prototype, property, {
        ...descriptor,
        set(value) {
          try {
            return Reflect.apply(descriptor.set, this, [value]);
          } finally {
            state.sample();
          }
        },
      });
      state.restorers.push(() =>
        Object.defineProperty(prototype, property, descriptor),
      );
    };
    for (const method of [
      "appendChild",
      "insertBefore",
      "removeChild",
      "replaceChild",
    ])
      instrumentMethod(Node.prototype, method);
    for (const prototype of [
      Document.prototype,
      DocumentFragment.prototype,
      Element.prototype,
    ])
      for (const method of ["append", "prepend", "replaceChildren"])
        instrumentMethod(prototype, method);
    for (const prototype of [
      CharacterData.prototype,
      DocumentType.prototype,
      Element.prototype,
    ])
      for (const method of ["before", "after", "replaceWith", "remove"])
        instrumentMethod(prototype, method);
    for (const method of [
      "insertAdjacentElement",
      "insertAdjacentHTML",
      "setHTML",
      "setHTMLUnsafe",
    ])
      instrumentMethod(Element.prototype, method);
    for (const property of ["innerHTML", "outerHTML"])
      instrumentSetter(Element.prototype, property);
    for (const method of [
      "deleteContents",
      "extractContents",
      "insertNode",
      "surroundContents",
    ])
      instrumentMethod(Range.prototype, method);
    state.observer = new MutationObserver((records) => {
      state.mutationCount += records.length;
    });
    state.observer.observe(node, {
      attributes: true,
      attributeFilter: ["src"],
      childList: true,
      subtree: true,
    });
    node[key] = state;
  });
}

async function completeMediaStabilityObservation(region) {
  return region.evaluate(async (node, durationMs) => {
    const key = Symbol.for("mangawy.production.media-stability");
    const state = node[key];
    try {
      await new Promise((resolveWait) => setTimeout(resolveWait, durationMs));
      state.sample();
      return {
        iframeCount: node.querySelectorAll("iframe").length,
        maxIframeCount: state.maxIframeCount,
        mutationCount: state.mutationCount,
      };
    } finally {
      state.observer.disconnect();
      let restorationFailure;
      for (const restore of state.restorers.reverse()) {
        try {
          restore();
        } catch (error) {
          restorationFailure ??= error;
        }
      }
      delete node[key];
      if (restorationFailure) throw restorationFailure;
    }
  }, MEDIA_POST_ACTIVATION_STABILITY_MS);
}

function geometryStable(before, after) {
  return Boolean(
    before &&
    after &&
    Math.abs(before.width - after.width) <= 1 &&
    Math.abs(before.height - after.height) <= 1 &&
    Math.abs(before.ratio - 16 / 9) <= 0.02 &&
    Math.abs(after.ratio - 16 / 9) <= 0.02,
  );
}

async function activationObservation(
  browser,
  controlledFixture,
  origin,
  url,
  key,
  findings,
  browserTransport,
  auditTimeoutMs,
  expectedSrc,
) {
  const requests = [];
  const intent = exactMediaIntent(expectedSrc, requests);
  let invalidActivationFindingRecorded = false;
  return withAuditPage({
    browser,
    controlledFixture,
    timeoutMs: auditTimeoutMs,
    label: `media ${key ? "keyboard" : "pointer"} pass`,
    task: async ({ page }) => {
      await navigateSameOrigin({
        page,
        url,
        origin,
        timeout: RENDERED_NAVIGATION_TIMEOUT_MS,
        findings,
        browserTransport,
        intentionalBlockedRequest: intent.classify,
        onUnexpectedRequest: (request) => {
          if (
            invalidActivationFindingRecorded ||
            !request.isNavigationRequest() ||
            request.resourceType() !== "document"
          )
            return;
          invalidActivationFindingRecorded = true;
          finding(
            findings,
            "MEDIA_ACTIVATION",
            `activation requested a non-exact iframe URL: ${request.url()}`,
            url,
          );
        },
      });
      const region = page.locator(MEDIA_REGION_SELECTOR);
      const trigger = region.locator(MEDIA_ACTIVATE_SELECTOR);
      const before = await mediaGeometry(region);
      await startMediaStabilityObservation(region);
      if (key) {
        await bindExactMediaEventIntent(intent, page, trigger, "keydown", key);
        await trigger.focus();
        await page.waitForTimeout(MEDIA_PRE_INTENT_STABILITY_MS);
        await page.keyboard.press(key);
      } else {
        await bindExactMediaEventIntent(intent, page, trigger, "click");
        const box = await trigger.boundingBox();
        if (!box) throw new Error("media pointer trigger has no hit target");
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(MEDIA_PRE_INTENT_STABILITY_MS);
        await page.mouse.down();
        await page.mouse.up();
      }
      const stability = await completeMediaStabilityObservation(region);
      const iframe = region.locator("iframe");
      const after = await mediaGeometry(region);
      return {
        iframeCount: stability.iframeCount,
        maxIframeCount: stability.maxIframeCount,
        intentBoundaryClean: intent.preActivationRequestCount() === 0,
        src:
          (await iframe
            .first()
            .getAttribute("src")
            .catch(() => null)) ?? "",
        title:
          (await iframe
            .first()
            .getAttribute("title")
            .catch(() => null)) ?? "",
        focused: await iframe
          .first()
          .evaluate((node) => document.activeElement === node)
          .catch(() => false),
        geometryStable: geometryStable(before, after),
        mediaRequests: requests,
      };
    },
  });
}

function failedMediaResult(url, youtubeId = "") {
  return {
    url,
    youtubeId,
    preIntent: { iframeCount: 0, mediaRequests: [], geometry: null },
    pointer: {
      iframeCount: 0,
      maxIframeCount: 0,
      intentBoundaryClean: false,
      src: "",
      title: "",
      focused: false,
      geometryStable: false,
      mediaRequests: [],
    },
    keyboard: {
      iframeCount: 0,
      maxIframeCount: 0,
      intentBoundaryClean: false,
      src: "",
      title: "",
      focused: false,
      geometryStable: false,
      mediaRequests: [],
    },
    fallback: {
      iframeCount: 0,
      maxIframeCount: 0,
      href: "",
      label: "",
      visible: false,
      focusable: false,
      sameTab: false,
      mediaRequests: [],
    },
    status: "FAIL",
  };
}

async function auditMedia({
  browser,
  origin,
  articleUrls,
  documents,
  controlledFixture,
  findings,
  browserTransport,
  auditTimeoutMs,
}) {
  const results = [];
  for (const url of articleUrls.sort(comparePublicUrls)) {
    const articleIdentity = documents.get(url)?.media[0];
    if (!articleIdentity || !YOUTUBE_ID.test(articleIdentity.youtubeId)) {
      finding(
        findings,
        "MEDIA_IDENTITY",
        "article cannot be rendered-audited without one valid YouTube identity",
        url,
      );
      results.push(failedMediaResult(url, articleIdentity?.youtubeId));
      continue;
    }
    try {
      const youtubeId = articleIdentity.youtubeId;
      const expectedTitle = articleIdentity.iframeTitle;
      const expectedSrc = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?hl=ar`;
      const expectedHref = `https://www.youtube.com/watch?v=${encodeURIComponent(youtubeId)}`;
      const preRequests = [];
      const preIntentClassifier = exactMediaIntent(expectedSrc, preRequests);
      const expectedPreIntentUrls = new Set([
        expectedSrc,
        `https://i.ytimg.com/vi/${encodeURIComponent(youtubeId)}/default.jpg`,
      ]);
      let eagerMediaFindingRecorded = false;
      const preIntent = await withAuditPage({
        browser,
        controlledFixture,
        timeoutMs: auditTimeoutMs,
        label: "media pre-intent pass",
        task: async ({ page }) => {
          await navigateSameOrigin({
            page,
            url,
            origin,
            timeout: RENDERED_NAVIGATION_TIMEOUT_MS,
            findings,
            browserTransport,
            intentionalBlockedRequest: preIntentClassifier.classify,
            onUnexpectedRequest: (request) => {
              if (!expectedPreIntentUrls.has(request.url())) return;
              preRequests.push(request.url());
              if (eagerMediaFindingRecorded) return;
              eagerMediaFindingRecorded = true;
              finding(
                findings,
                "MEDIA_PRE_INTENT",
                "article made an off-origin request before media intent",
                url,
              );
            },
          });
          await page.waitForTimeout(MEDIA_PRE_INTENT_STABILITY_MS);
          const region = page.locator(MEDIA_REGION_SELECTOR);
          return {
            iframeCount: await page.locator("iframe").count(),
            mediaRequests: preRequests,
            geometry: await mediaGeometry(region),
          };
        },
      });

      const pointer = await activationObservation(
        browser,
        controlledFixture,
        origin,
        url,
        undefined,
        findings,
        browserTransport,
        auditTimeoutMs,
        expectedSrc,
      );
      const keyboard = await activationObservation(
        browser,
        controlledFixture,
        origin,
        url,
        "Enter",
        findings,
        browserTransport,
        auditTimeoutMs,
        expectedSrc,
      );

      const fallbackRequests = [];
      const fallbackIntent = exactMediaIntent(expectedSrc, fallbackRequests);
      const fallback = await withAuditPage({
        browser,
        controlledFixture,
        timeoutMs: auditTimeoutMs,
        label: "media fallback pass",
        task: async ({ page }) => {
          await navigateSameOrigin({
            page,
            url,
            origin,
            timeout: RENDERED_NAVIGATION_TIMEOUT_MS,
            findings,
            browserTransport,
            intentionalBlockedRequest: fallbackIntent.classify,
          });
          const region = page.locator(MEDIA_REGION_SELECTOR);
          const trigger = page.locator(MEDIA_ACTIVATE_SELECTOR);
          await startMediaStabilityObservation(region);
          await bindExactMediaEventIntent(
            fallbackIntent,
            page,
            trigger,
            "click",
          );
          const box = await trigger.boundingBox();
          if (!box) throw new Error("media fallback trigger has no hit target");
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.waitForTimeout(MEDIA_PRE_INTENT_STABILITY_MS);
          await page.mouse.down();
          await page.mouse.up();
          const stability = await completeMediaStabilityObservation(region);
          const link = page.locator(MEDIA_DIRECT_SELECTOR);
          await link.focus().catch(() => {});
          return {
            iframeCount: stability.iframeCount,
            maxIframeCount: stability.maxIframeCount,
            href: (await link.getAttribute("href")) ?? "",
            label: (await link.innerText()).trim(),
            visible: await link.isVisible(),
            focusable: await link
              .evaluate(
                (node) => document.activeElement === node && node.tabIndex >= 0,
              )
              .catch(() => false),
            sameTab: (await link.getAttribute("target")) === null,
            mediaRequests: fallbackRequests,
          };
        },
      });

      const hasOneExactMediaRequest = (observation) =>
        observation.mediaRequests.length === 1 &&
        observation.mediaRequests[0] === expectedSrc;
      const validActivation = (observation) => {
        if (
          observation.iframeCount !== 1 ||
          observation.maxIframeCount !== 1 ||
          !observation.intentBoundaryClean ||
          observation.src !== expectedSrc ||
          !hasOneExactMediaRequest(observation)
        )
          return false;
        const parsed = new URL(observation.src);
        return (
          parsed.hostname === "www.youtube-nocookie.com" &&
          parsed.searchParams.get("hl") === "ar" &&
          parsed.searchParams.get("autoplay") !== "1" &&
          observation.title === expectedTitle &&
          ARABIC.test(observation.title) &&
          observation.focused
        );
      };
      const preIntentPassed =
        preIntent.iframeCount === 0 &&
        preIntent.mediaRequests.length === 0 &&
        preIntent.geometry !== null &&
        Math.abs(preIntent.geometry.ratio - 16 / 9) <= 0.02;
      const fallbackPassed =
        fallback.iframeCount === 1 &&
        fallback.maxIframeCount === 1 &&
        fallback.href === expectedHref &&
        ARABIC.test(fallback.label) &&
        fallback.visible &&
        fallback.focusable &&
        fallback.sameTab &&
        hasOneExactMediaRequest(fallback);
      if (!preIntentPassed) {
        finding(
          findings,
          preIntent.mediaRequests.length > 0 || preIntent.iframeCount > 0
            ? "MEDIA_PRE_INTENT"
            : "MEDIA_GEOMETRY",
          "article loaded media before intent or lacked reserved 16:9 geometry",
          url,
        );
      }
      if (!validActivation(pointer) || !validActivation(keyboard)) {
        finding(
          findings,
          "MEDIA_ACTIVATION",
          "pointer and Enter must create one exact focused Arabic no-cookie iframe without autoplay",
          url,
        );
      }
      if (!pointer.geometryStable || !keyboard.geometryStable) {
        finding(
          findings,
          "MEDIA_GEOMETRY",
          "media region changed geometry after activation",
          url,
        );
      }
      if (!fallbackPassed) {
        finding(
          findings,
          "MEDIA_FALLBACK",
          "blocked player must preserve one visible focusable exact same-tab direct link",
          url,
        );
      }
      const passed =
        preIntentPassed &&
        validActivation(pointer) &&
        validActivation(keyboard) &&
        pointer.geometryStable &&
        keyboard.geometryStable &&
        fallbackPassed;
      results.push({
        url,
        youtubeId,
        preIntent,
        pointer: {
          iframeCount: pointer.iframeCount,
          maxIframeCount: pointer.maxIframeCount,
          intentBoundaryClean: pointer.intentBoundaryClean,
          src: pointer.src,
          title: pointer.title,
          focused: pointer.focused,
          geometryStable: pointer.geometryStable,
          mediaRequests: pointer.mediaRequests,
        },
        keyboard: {
          iframeCount: keyboard.iframeCount,
          maxIframeCount: keyboard.maxIframeCount,
          intentBoundaryClean: keyboard.intentBoundaryClean,
          src: keyboard.src,
          title: keyboard.title,
          focused: keyboard.focused,
          geometryStable: keyboard.geometryStable,
          mediaRequests: keyboard.mediaRequests,
        },
        fallback,
        status: passed ? "PASS" : "FAIL",
      });
    } catch (error) {
      finding(
        findings,
        "MEDIA_NAVIGATION",
        error instanceof Error ? error.message : String(error),
        url,
      );
      results.push(failedMediaResult(url, articleIdentity.youtubeId));
    }
  }
  return results;
}

function isAllowedLatinValue(value) {
  const trimmed = value.trim();
  if (trimmed === "") return true;
  try {
    const url = new URL(trimmed);
    return ["http:", "https:"].includes(url.protocol) && url.href === trimmed;
  } catch {
    return false;
  }
}

async function latinLeaks(page, context) {
  const domValues = await page.evaluate(() => {
    const visibleText = [];
    const isVisible = (node) => {
      if (node.closest("[hidden], [aria-hidden='true']")) return false;
      const style = getComputedStyle(node);
      return style.display !== "none" && style.visibility !== "hidden";
    };
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    while (walker.nextNode()) {
      const parent = walker.currentNode.parentElement;
      if (parent && !parent.closest("script, style") && isVisible(parent))
        visibleText.push(walker.currentNode.textContent ?? "");
    }
    const formValues = [
      ...document.querySelectorAll("input, textarea, select"),
    ].flatMap((control) => {
      if (!isVisible(control)) return [];
      if (control instanceof HTMLSelectElement)
        return [...control.selectedOptions].map(
          (option) => option.label || option.textContent || "",
        );
      return [control.getAttribute("placeholder") ?? "", control.value];
    });
    return [
      ...visibleText,
      ...formValues,
      document.title,
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content") ?? "",
      ...[...document.querySelectorAll("[alt], [title], [aria-label]")].flatMap(
        (node) =>
          ["alt", "title", "aria-label"].map(
            (name) => node.getAttribute(name) ?? "",
          ),
      ),
    ];
  });
  const cdp = await context.newCDPSession(page);
  const tree = await cdp.send("Accessibility.getFullAXTree");
  const axValues = tree.nodes
    .filter((node) => !node.ignored)
    .flatMap((node) => [
      node.name?.value,
      node.value?.value,
      node.description?.value,
    ])
    .filter((value) => typeof value === "string");
  return [...new Set([...domValues, ...axValues])]
    .map((value) => value.replace(/\s+/gu, " ").trim())
    .filter((value) => LATIN.test(value) && !isAllowedLatinValue(value));
}

async function auditPresentation({
  browser,
  origin,
  urls,
  controlledFixture,
  findings,
  browserTransport,
  auditTimeoutMs,
}) {
  const results = [];
  for (const url of urls) {
    try {
      const result = await withAuditPage({
        browser,
        controlledFixture,
        contextOptions: { viewport: { width: 320, height: 844 } },
        timeoutMs: auditTimeoutMs,
        label: "presentation page audit",
        task: async ({ context, page }) => {
          await navigateSameOrigin({
            page,
            url,
            origin,
            timeout: RENDERED_NAVIGATION_TIMEOUT_MS,
            findings,
            browserTransport,
          });
          const identity = await page.locator("html").evaluate((node) => ({
            lang: node.getAttribute("lang"),
            dir: node.getAttribute("dir"),
          }));
          const semantics = await page.evaluate(() => {
            const levels = [
              ...document.querySelectorAll("h1,h2,h3,h4,h5,h6"),
            ].map((heading) => Number(heading.tagName.slice(1)));
            return {
              mainCount: document.querySelectorAll("main").length,
              h1Count: document.querySelectorAll("main h1").length,
              headingsDoNotSkip: levels.every(
                (level, index) => index === 0 || level - levels[index - 1] <= 1,
              ),
            };
          });
          const leaks = await latinLeaks(page, context);
          const interactive = page.locator(
            "a[href]:visible, button:visible, input:visible, select:visible, textarea:visible, [tabindex]:visible",
          );
          const interactiveCount = await interactive.count();
          let keyboardReachable = true;
          let visibleFocus = true;
          for (let index = 0; index < interactiveCount; index += 1) {
            const element = interactive.nth(index);
            const tabIndex = await element.evaluate((node) => node.tabIndex);
            if (tabIndex < 0) keyboardReachable = false;
            await element.focus().catch(() => {});
            const focus = await element
              .evaluate((node) => {
                const style = getComputedStyle(node);
                return {
                  active: document.activeElement === node,
                  visible:
                    style.outlineStyle !== "none" &&
                    Number.parseFloat(style.outlineWidth) > 0,
                };
              })
              .catch(() => ({ active: false, visible: false }));
            keyboardReachable &&= focus.active;
            visibleFocus &&= focus.visible;
          }
          const horizontalOverflow = await page.evaluate(
            () =>
              document.documentElement.scrollWidth >
                document.documentElement.clientWidth + 1 ||
              [...document.body.querySelectorAll("*")]
                .filter((node) => {
                  const style = getComputedStyle(node);
                  const box = node.getBoundingClientRect();
                  return (
                    style.display !== "none" && box.width > 0 && box.height > 0
                  );
                })
                .some((node) => {
                  const box = node.getBoundingClientRect();
                  return (
                    box.left < -1 ||
                    box.right > document.documentElement.clientWidth + 1
                  );
                }),
          );
          await page.addStyleTag({
            content:
              "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-block-end:2em!important}",
          });
          const textSpacingLoss = await page.evaluate(() =>
            [...document.querySelectorAll("p,li,a,button,h1,h2,h3,h4,h5,h6")]
              .filter((node) => getComputedStyle(node).display !== "none")
              .some((node) => {
                const style = getComputedStyle(node);
                return (
                  ["hidden", "clip"].includes(style.overflow) &&
                  (node.scrollHeight > node.clientHeight + 1 ||
                    node.scrollWidth > node.clientWidth + 1)
                );
              }),
          );
          const axe = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze();
          const axeFindings = axe.violations
            .filter(
              ({ impact }) => impact === "serious" || impact === "critical",
            )
            .map(({ id, impact }) => ({ id, impact }));

          if (identity.lang !== "ar" || identity.dir !== "rtl")
            finding(
              findings,
              "PRESENTATION_IDENTITY",
              "rendered page must use Arabic RTL identity",
              url,
            );
          if (leaks.length > 0)
            finding(
              findings,
              "PRESENTATION_LATIN",
              `reader-facing Latin leakage: ${leaks.join(" | ")}`,
              url,
            );
          if (
            semantics.mainCount !== 1 ||
            semantics.h1Count !== 1 ||
            !semantics.headingsDoNotSkip
          )
            finding(
              findings,
              "PRESENTATION_SEMANTICS",
              "page must contain one main, one h1, and non-skipping headings",
              url,
            );
          if (!keyboardReachable || !visibleFocus)
            finding(
              findings,
              "PRESENTATION_KEYBOARD",
              "every visible control must be keyboard reachable with visible focus",
              url,
            );
          if (axeFindings.length > 0)
            finding(
              findings,
              "PRESENTATION_AXE",
              `serious or critical Axe findings: ${axeFindings.map(({ id }) => id).join(", ")}`,
              url,
            );
          if (textSpacingLoss)
            finding(
              findings,
              "PRESENTATION_TEXT_SPACING",
              "text spacing stress caused content loss",
              url,
            );
          if (horizontalOverflow)
            finding(
              findings,
              "PRESENTATION_REFLOW",
              "page overflows horizontally at 320 CSS pixels",
              url,
            );
          const passed =
            identity.lang === "ar" &&
            identity.dir === "rtl" &&
            leaks.length === 0 &&
            semantics.mainCount === 1 &&
            semantics.h1Count === 1 &&
            semantics.headingsDoNotSkip &&
            keyboardReachable &&
            visibleFocus &&
            axeFindings.length === 0 &&
            !textSpacingLoss &&
            !horizontalOverflow;
          return {
            url,
            latinLeaks: leaks,
            axeFindings,
            keyboardReachable,
            visibleFocus,
            textSpacingLoss,
            horizontalOverflow,
            status: passed ? "PASS" : "FAIL",
          };
        },
      });
      results.push(result);
    } catch (error) {
      finding(
        findings,
        "PRESENTATION_NAVIGATION",
        error instanceof Error ? error.message : String(error),
        url,
      );
      results.push({
        url,
        latinLeaks: [],
        axeFindings: [],
        keyboardReachable: false,
        visibleFocus: false,
        textSpacingLoss: false,
        horizontalOverflow: false,
        status: "FAIL",
      });
    }
  }
  return results;
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
  const serialized = JSON.stringify(
    report,
    (_key, value) =>
      typeof value === "string" ? reportSafeString(value) : value,
    2,
  );
  const safeReport = JSON.parse(serialized);
  await writeFile(artifactPath, `${serialized}\n`, "utf8");
  return safeReport;
}

export async function runProductionVerification(options = {}) {
  const controlledFixture = options.controlledFixture;
  const verifiedSite = await verifiedProductionSiteOrigin(
    process.env.SITE_ORIGIN,
    controlledFixture?.resolveHostname,
    controlledFixture?.dnsResolutionTimeoutMs,
  );
  const normalizedOrigin = verifiedSite.origin;
  const networkFetch = createPinnedFetch(verifiedSite);
  const inputOrigin = process.env.SITE_ORIGIN;

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
    browserRemoteAddresses: [],
  };
  const documents = new Map();
  const readerIdleMs = controlledFixture
    ? Math.max(0, Number(controlledFixture.readerIdleMs ?? 0))
    : FINAL_READER_IDLE_MS;
  const fontReadyTimeoutMs = controlledFixture
    ? Math.max(
        1,
        Number(controlledFixture.fontReadyTimeoutMs ?? FONT_READY_TIMEOUT_MS),
      )
    : FONT_READY_TIMEOUT_MS;
  const performanceAuditTimeoutMs = controlledFixture
    ? Math.max(
        1,
        Number(
          controlledFixture.performanceAuditTimeoutMs ??
            PERFORMANCE_AUDIT_TIMEOUT_MS,
        ),
      )
    : PERFORMANCE_AUDIT_TIMEOUT_MS;
  const renderedAuditTimeoutMs = controlledFixture
    ? Math.max(
        1,
        Number(
          controlledFixture.renderedAuditTimeoutMs ?? RENDERED_AUDIT_TIMEOUT_MS,
        ),
      )
    : RENDERED_AUDIT_TIMEOUT_MS;
  const runnerSetupTimeoutMs = controlledFixture
    ? Math.max(
        1,
        Number(
          controlledFixture.runnerSetupTimeoutMs ?? RUNNER_SETUP_TIMEOUT_MS,
        ),
      )
    : RUNNER_SETUP_TIMEOUT_MS;
  const browserCloseTimeoutMs = controlledFixture
    ? Math.max(
        1,
        Number(
          controlledFixture.browserCloseTimeoutMs ?? BROWSER_CLOSE_TIMEOUT_MS,
        ),
      )
    : BROWSER_CLOSE_TIMEOUT_MS;
  const profile = {
    ...PROFILE,
    readerIdleMs,
    fontReadyTimeoutMs,
    performanceAuditTimeoutMs,
    renderedAuditTimeoutMs,
    runnerSetupTimeoutMs,
    browserCloseTimeoutMs,
  };
  const auditKinds = new Set(
    controlledFixture?.auditKinds ?? ["performance", "media", "presentation"],
  );
  let selectedPerformanceRoutes = [];
  let discoveredArticleUrls = [];
  let performance = [];
  let media = [];
  let presentation = [];
  let crawlPassed = false;
  let browser;
  let chromiumVersion = "unavailable";
  const browserTransport = {
    approvedAddresses: new Set(
      verifiedSite.addresses.map(({ address }) => address.toLowerCase()),
    ),
    remoteAddresses: new Set(),
    requireRemoteAddress: !controlledFixture,
    plausibleLoaders: new Map(),
    plausibleLoader: undefined,
  };

  try {
    browser = await chromium.launch({
      headless: true,
      args: chromiumLaunchArgs(verifiedSite),
    });
    chromiumVersion = browser.version();
    let setupContext;
    let setupPage;
    const { context, page } = await withHardDeadline({
      timeoutMs: runnerSetupTimeoutMs,
      label: "crawl browser setup",
      onTimeout: () => {
        void bestEffortCloseAuditPage(setupPage, setupContext);
      },
      task: async () => {
        setupContext = await browser.newContext({ serviceWorkers: "block" });
        await setupContext.addInitScript(disableWebRtc);
        setupPage = await setupContext.newPage();
        if (controlledFixture)
          await controlledFixture.installBrowserRoutes(setupPage);
        return { context: setupContext, page: setupPage };
      },
    });

    const robotsUrl = new URL("/robots.txt", normalizedOrigin).href;
    const sitemapIndexUrl = new URL("/sitemap-index.xml", normalizedOrigin)
      .href;
    const robots = await fetchStatic({
      url: robotsUrl,
      expectedStatus: 200,
      expectedType: ["text/plain"],
      controlledFixture,
      networkFetch,
      findings,
    });
    if (robots !== undefined) {
      const normalizedRobots = robots.replace(/\r\n?/gu, "\n");
      const expectedRobots = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapIndexUrl}\n`;
      if (normalizedRobots !== expectedRobots) {
        finding(
          findings,
          "ROBOTS_SITEMAP",
          "robots must exactly match the generated global-allow policy",
          robotsUrl,
        );
      }
    }

    const sitemapIndex = await fetchStatic({
      url: sitemapIndexUrl,
      expectedStatus: 200,
      expectedType: ["application/xml", "text/xml"],
      controlledFixture,
      networkFetch,
      findings,
    });
    let sitemapDiscoveryComplete = sitemapIndex !== undefined;
    const indexFindingCount = findings.length;
    const childSitemaps = sitemapIndex
      ? await parseXml(
          page,
          sitemapIndex,
          "sitemapindex",
          sitemapIndexUrl,
          findings,
        )
      : [];
    if (findings.length !== indexFindingCount) sitemapDiscoveryComplete = false;
    const cleanChildren = childSitemaps
      .map((url) =>
        cleanSameOriginUrl(url, normalizedOrigin, findings, sitemapIndexUrl),
      )
      .filter(Boolean);
    if (
      cleanChildren.length === 0 ||
      cleanChildren.length !== childSitemaps.length
    )
      sitemapDiscoveryComplete = false;
    if (cleanChildren.length === 0) {
      finding(
        findings,
        "SITEMAP_CHILDREN",
        "sitemap index contains zero valid child sitemaps",
        sitemapIndexUrl,
      );
    }
    for (const childUrl of cleanChildren) {
      if (!/^\/sitemap-[0-9]+\.xml$/u.test(new URL(childUrl).pathname)) {
        sitemapDiscoveryComplete = false;
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
        expectedType: ["application/xml", "text/xml"],
        controlledFixture,
        networkFetch,
        findings,
      });
      if (!child) {
        sitemapDiscoveryComplete = false;
        continue;
      }
      const childFindingCount = findings.length;
      const locations = await parseXml(
        page,
        child,
        "urlset",
        childUrl,
        findings,
      );
      if (findings.length !== childFindingCount)
        sitemapDiscoveryComplete = false;
      for (const raw of locations) {
        const clean = cleanSameOriginUrl(
          raw,
          normalizedOrigin,
          findings,
          childUrl,
        );
        if (clean) routeGraph.sitemapUrls.push(clean);
        else sitemapDiscoveryComplete = false;
      }
    }
    if (
      new Set(routeGraph.sitemapUrls).size !== routeGraph.sitemapUrls.length
    ) {
      sitemapDiscoveryComplete = false;
      finding(
        findings,
        "XML_DUPLICATE_LOCATION",
        "public URL occurs in more than one sitemap entry",
        sitemapIndexUrl,
      );
      routeGraph.sitemapUrls = [...new Set(routeGraph.sitemapUrls)];
    }
    const sitemapCoverageValid = validateSitemapCoverage(
      normalizedOrigin,
      routeGraph.sitemapUrls,
      findings,
      sitemapIndexUrl,
    );

    const drafts = new Set(await repositoryDraftPaths());
    const publicDocumentUrls = new Set();
    let sitemapContainsIneligibleRole = false;
    for (const url of routeGraph.sitemapUrls) {
      const pathname = decodeURI(new URL(url).pathname);
      if (drafts.has(pathname)) {
        sitemapContainsIneligibleRole = true;
        finding(
          findings,
          "DRAFT_LEAK",
          "repository draft appears in sitemap",
          url,
        );
        continue;
      }
      if (pathname === MISSING_PATH) {
        sitemapContainsIneligibleRole = true;
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
        networkFetch,
        findings,
      });
      if (source === undefined) continue;
      routeGraph.crawledUrls.push(url);
      const document = await parseHtml(page, source, url, findings);
      documents.set(url, document);
      publicDocumentUrls.add(url);
      const plausibleLoader = validatedPlausibleLoader(document, url, findings);
      if (plausibleLoader)
        browserTransport.plausibleLoaders.set(url, plausibleLoader);
      validatePublicDocument({
        document,
        url,
        origin: normalizedOrigin,
        findings,
      });
      validateArticle(document, url, normalizedOrigin, findings);
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
        networkFetch,
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
    const missingRoleDistinct = !routeGraph.sitemapUrls.includes(missingUrl);
    let notFoundDocumentValid = false;
    const missing = await fetchStatic({
      url: missingUrl,
      expectedStatus: 404,
      expectedType: ["text/html", "application/xhtml+xml"],
      controlledFixture,
      networkFetch,
      findings,
      failureCode: "NOT_FOUND_CONTRACT",
    });
    if (missing !== undefined) {
      const document = await parseHtml(page, missing, missingUrl, findings);
      documents.set(missingUrl, document);
      const plausibleLoader = validatedPlausibleLoader(
        document,
        missingUrl,
        findings,
      );
      if (plausibleLoader)
        browserTransport.plausibleLoaders.set(missingUrl, plausibleLoader);
      const violatesNotFoundDocumentContract =
        document.lang !== "ar" ||
        document.dir !== "rtl" ||
        document.canonicals.length !== 0 ||
        document.h1.length !== 1 ||
        !ARABIC.test(document.bodyText) ||
        !document.robots.some(
          (value) => value.toLowerCase() === "noindex,follow",
        );
      if (violatesNotFoundDocumentContract) {
        finding(
          findings,
          "NOT_FOUND_CONTRACT",
          "missing route must be an Arabic RTL noindex,follow 404 without canonical",
          missingUrl,
        );
      } else notFoundDocumentValid = true;
    }
    const plausibleLoaderUrls = [...browserTransport.plausibleLoaders.values()];
    const uniquePlausibleLoaders = new Set(plausibleLoaderUrls);
    const expectedPlausibleDocuments = new Set([
      ...routeGraph.sitemapUrls,
      missingUrl,
    ]);
    const publicDocumentsComplete =
      publicDocumentUrls.size === routeGraph.sitemapUrls.length &&
      routeGraph.sitemapUrls.every((url) => publicDocumentUrls.has(url));
    const loaderAuthorityComplete =
      sitemapDiscoveryComplete &&
      sitemapCoverageValid &&
      !sitemapContainsIneligibleRole &&
      missingRoleDistinct &&
      notFoundDocumentValid &&
      publicDocumentsComplete;
    const hasExactPlausibleDocuments =
      loaderAuthorityComplete &&
      documents.size === expectedPlausibleDocuments.size &&
      browserTransport.plausibleLoaders.size ===
        expectedPlausibleDocuments.size &&
      [...expectedPlausibleDocuments].every(
        (url) =>
          documents.has(url) && browserTransport.plausibleLoaders.has(url),
      );
    if (hasExactPlausibleDocuments && uniquePlausibleLoaders.size === 1) {
      browserTransport.plausibleLoader = plausibleLoaderUrls[0];
    } else if (browserTransport.plausibleLoaders.size > 0) {
      finding(
        findings,
        "PLAUSIBLE_LOADER",
        "analytics must be absent everywhere or every public sitemap document and the 404 must use one common exact Plausible property loader",
        normalizedOrigin,
      );
    }
    await withHardDeadline({
      timeoutMs: runnerSetupTimeoutMs,
      label: "crawl browser cleanup",
      onTimeout: () => {
        void bestEffortCloseAuditPage(page, context);
      },
      task: () => closeAuditPage(page, context),
    });

    selectedPerformanceRoutes = selectPerformanceRoutes(
      normalizedOrigin,
      documents,
      findings,
    );
    crawlPassed = findings.length === 0;
    if (
      auditKinds.has("performance") &&
      selectedPerformanceRoutes.length === 5
    ) {
      performance = await auditPerformance({
        browser,
        origin: normalizedOrigin,
        selectedRoutes: selectedPerformanceRoutes,
        controlledFixture,
        readerIdleMs,
        fontReadyTimeoutMs,
        auditTimeoutMs: performanceAuditTimeoutMs,
        findings,
        browserTransport,
      });
    }
    discoveredArticleUrls = routeGraph.sitemapUrls.filter((url) =>
      isArticleUrl(url, normalizedOrigin),
    );
    if (auditKinds.has("media")) {
      media = await auditMedia({
        browser,
        origin: normalizedOrigin,
        articleUrls: discoveredArticleUrls,
        documents,
        controlledFixture,
        findings,
        browserTransport,
        auditTimeoutMs: renderedAuditTimeoutMs,
      });
    }
    if (auditKinds.has("presentation")) {
      presentation = await auditPresentation({
        browser,
        origin: normalizedOrigin,
        urls: [...routeGraph.sitemapUrls, missingUrl].sort(comparePublicUrls),
        controlledFixture,
        findings,
        browserTransport,
        auditTimeoutMs: renderedAuditTimeoutMs,
      });
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  } finally {
    if (browser) {
      try {
        await withHardDeadline({
          timeoutMs: browserCloseTimeoutMs,
          label: "browser close",
          onTimeout: () => {
            void browser.close().catch(() => {});
          },
          task: async () => {
            await controlledFixture?.beforeBrowserClose?.();
            await browser.close();
          },
        });
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
  }

  routeGraph.sitemapUrls.sort();
  routeGraph.crawledUrls = [...new Set(routeGraph.crawledUrls)].sort();
  routeGraph.sameOriginLinks.sort();
  routeGraph.externalLinks.sort();
  routeGraph.browserRemoteAddresses = [
    ...browserTransport.remoteAddresses,
  ].sort();
  const completedAt = new Date().toISOString();
  const report = {
    schemaVersion: 1,
    evidenceScope,
    transport,
    inputOrigin,
    normalizedOrigin,
    plausibleLoader: browserTransport.plausibleLoader ?? null,
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
    profile,
    selectedPerformanceRoutes,
    performance,
    fieldInp: { status: "PENDING", authority: "field-only" },
    media,
    presentation,
    findings,
    errors,
    automatedGates: {
      runner: errors.length === 0 ? "PASS" : "FAIL",
      crawl: crawlPassed && errors.length === 0 ? "PASS" : "FAIL",
      performance: !auditKinds.has("performance")
        ? "PENDING"
        : performance.length === 5 &&
            performance.every(({ status }) => status === "PASS") &&
            errors.length === 0
          ? "PASS"
          : "FAIL",
      media: !auditKinds.has("media")
        ? "PENDING"
        : media.length === discoveredArticleUrls.length &&
            discoveredArticleUrls.length > 0 &&
            media.every(({ status }) => status === "PASS") &&
            errors.length === 0
          ? "PASS"
          : "FAIL",
      presentation: !auditKinds.has("presentation")
        ? "PENDING"
        : presentation.length === routeGraph.sitemapUrls.length + 1 &&
            presentation.every(({ status }) => status === "PASS") &&
            errors.length === 0
          ? "PASS"
          : "FAIL",
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
  console.log(
    `عينات الأداء: ${report.performance.flatMap(({ runs }) => runs).length}/15`,
  );
  console.log(
    `البوابات الآلية: الزحف ${report.automatedGates.crawl}، الأداء ${report.automatedGates.performance}، الوسائط ${report.automatedGates.media}، العرض ${report.automatedGates.presentation}`,
  );
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
