import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { readdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";

import type { Page } from "@playwright/test";

const CONTROLLED_ORIGIN = "https://controlled-mangawy-fixture.dev";
const ARTIFACT_ROOT = resolve(".artifacts/phase-06");
const MISSING_PATH = "/مسار-مفقود-للتحقق/";
const DRAFT_PATH = "/القضايا-العامة/اختبار-عقد-المحتوى/";
const VIDEO_IDS = ["gO9yWa85OBc", "gmL_5XVpLPg", "-z32phpbduk"] as const;
const SECTION_PATHS = [
  "/الردود-والشبهات/",
  "/القضايا-العامة/",
  "/القسم-العلمي/",
] as const;
const ARTICLE_PATHS = [
  "/الردود-والشبهات/أصول-منهجية/",
  "/القضايا-العامة/استقلال-الرأي/",
  "/القسم-العلمي/مقدمة-الإملاء/",
] as const;
const PUBLIC_PATHS = [
  "/",
  ...SECTION_PATHS,
  ...ARTICLE_PATHS,
  "/عن-أحمد-المنجاوي/",
] as const;

type FixtureResponse = {
  status: number;
  contentType: string;
  body: string;
  headers?: Readonly<Record<string, string>>;
};

type ControlledFixture = {
  responses: Map<string, FixtureResponse>;
  browserOverrides: Map<string, FixtureResponse>;
  requests: string[];
  browserRequests: string[];
  browserRouteInstalled: boolean;
  browserRouteInstallCount: number;
  readerIdleMs: number;
  resolveHostname(
    hostname: string,
    options: { all: true; verbatim: true },
  ): Promise<readonly { address: string; family: number }[]>;
  auditKinds?: readonly ("performance" | "media" | "presentation")[];
  performanceSamples: Map<
    string,
    readonly {
      lcp: number | null;
      supported: readonly string[];
      shifts: readonly {
        startTime: number;
        value: number;
        hadRecentInput?: boolean;
      }[];
    }[]
  >;
  fetch(url: string, init: RequestInit): Promise<Response>;
  installBrowserRoutes(page: Page): Promise<void>;
};

type VerificationReport = {
  schemaVersion: number;
  evidenceScope: string;
  transport: string;
  inputOrigin: string;
  normalizedOrigin: string;
  startedAt: string;
  completedAt: string;
  runtime: { node: string; playwright: string; chromium: string };
  routeGraph: {
    sitemapUrls: string[];
    crawledUrls: string[];
    sameOriginLinks: string[];
    externalLinks: string[];
  };
  profile: {
    viewport: { width: number; height: number };
    deviceScaleFactor: number;
    isMobile: boolean;
    hasTouch: boolean;
    cpuThrottlingRate: number;
    latencyMs: number;
    downloadThroughputBytesPerSecond: number;
    uploadThroughputBytesPerSecond: number;
    connectionType: string;
    performanceNavigationTimeoutMs: number;
    renderedNavigationTimeoutMs: number;
    readerIdleMs: number;
    commands: string[];
  };
  selectedPerformanceRoutes: {
    role: string;
    url: string;
    sectionUrl?: string;
  }[];
  performance: {
    url: string;
    runs: {
      iteration: number;
      contextSequence: number;
      lcpMs: number | null;
      cls: number | null;
      observerSupport: string[];
    }[];
    medianLcpMs: number | null;
    medianCls: number | null;
    status: "PASS" | "FAIL";
  }[];
  fieldInp: { status: "PENDING"; authority: "field-only" };
  media: {
    url: string;
    youtubeId: string;
    preIntent: {
      iframeCount: number;
      mediaRequests: string[];
      geometry: { width: number; height: number; ratio: number } | null;
    };
    pointer: {
      iframeCount: number;
      src: string;
      title: string;
      focused: boolean;
      geometryStable: boolean;
    };
    keyboard: {
      iframeCount: number;
      src: string;
      title: string;
      focused: boolean;
      geometryStable: boolean;
    };
    fallback: {
      href: string;
      label: string;
      visible: boolean;
      focusable: boolean;
      sameTab: boolean;
    };
    status: "PASS" | "FAIL";
  }[];
  presentation: {
    url: string;
    latinLeaks: string[];
    axeFindings: { id: string; impact: string | null }[];
    keyboardReachable: boolean;
    visibleFocus: boolean;
    textSpacingLoss: boolean;
    horizontalOverflow: boolean;
    status: "PASS" | "FAIL";
  }[];
  findings: { code: string; url?: string; detail: string }[];
  errors: string[];
  automatedGates: Record<string, "PASS" | "FAIL" | "PENDING">;
  artifactPath: string;
};

function absolute(path: string): string {
  return new URL(path, CONTROLLED_ORIGIN).href;
}

function pageHtml({
  path,
  title,
  description,
  links,
  youtubeId,
}: {
  path: string;
  title: string;
  description: string;
  links: readonly string[];
  youtubeId?: string;
}): string {
  const media = youtubeId
    ? `<section class="media-continuation"><h2>الفيديو المرتبط بالمقال</h2><div class="video-region" data-video-region data-youtube-id="${youtubeId}" data-iframe-title="فيديو المقال: ${title}"><button type="button" data-video-activate>تشغيل الفيديو هنا</button><p role="status" hidden data-video-error>تعذر تشغيل الفيديو هنا. يمكنك مشاهدة الفيديو مباشرة على يوتيوب.</p></div><a class="youtube-cta" href="https://www.youtube.com/watch?v=${youtubeId}">مشاهدة الفيديو على يوتيوب</a></section>`
    : "";
  return `<!doctype html><html lang="ar" dir="rtl"><head><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${absolute(path)}"><style>*{box-sizing:border-box}body{margin:0;font:18px/1.7 sans-serif}header,main{max-inline-size:70ch;margin-inline:auto;padding:1rem}a,button{min-inline-size:44px;min-block-size:44px}a:focus-visible,button:focus-visible,[data-video-region]:focus-within{outline:3px solid #166534;outline-offset:3px}[data-video-region]{aspect-ratio:16/9;inline-size:100%;display:grid;place-items:center;background:#eee}[data-video-region] iframe{border:0;inline-size:100%;block-size:100%}</style></head><body><header><a href="/">مدونة أحمد المنجاوي</a></header><main><h1>${title}</h1>${links.map((href) => `<a href="${href}">رابط عربي</a>`).join("")}${media}</main><script>for(const region of document.querySelectorAll('[data-video-region]')){const button=region.querySelector('[data-video-activate]');button?.addEventListener('click',()=>{if(region.querySelector('iframe'))return;try{const id=region.getAttribute('data-youtube-id');const title=region.getAttribute('data-iframe-title');const iframe=document.createElement('iframe');iframe.title=title;iframe.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?hl=ar';button.replaceWith(iframe);iframe.focus()}catch{button.hidden=true;region.querySelector('[data-video-error]').hidden=false}},{once:true})}</script></body></html>`;
}

function notFoundHtml(): string {
  return `<!doctype html><html lang="ar" dir="rtl"><head><title>الصفحة غير موجودة</title><meta name="description" content="تعذر العثور على الصفحة المطلوبة"><meta name="robots" content="noindex,follow"></head><body><main><h1>الصفحة غير موجودة</h1><a href="/">العودة إلى الصفحة الرئيسية</a></main></body></html>`;
}

function createFixture(): ControlledFixture {
  const responses = new Map<string, FixtureResponse>();
  const set = (
    path: string,
    body: string,
    contentType = "text/html; charset=utf-8",
    status = 200,
  ) => responses.set(absolute(path), { status, contentType, body });

  set(
    "/robots.txt",
    `User-agent: *\nAllow: /\n\nSitemap: ${absolute("/sitemap-index.xml")}\n`,
    "text/plain; charset=utf-8",
  );
  set(
    "/sitemap-index.xml",
    `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${absolute("/sitemap-0.xml")}</loc></sitemap></sitemapindex>`,
    "application/xml; charset=utf-8",
  );
  set(
    "/sitemap-0.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${PUBLIC_PATHS.map((path) => `<url><loc>${absolute(path)}</loc></url>`).join("")}</urlset>`,
    "application/xml; charset=utf-8",
  );

  set(
    "/",
    pageHtml({
      path: "/",
      title: "الرئيسية التجريبية",
      description: "وصف عربي تجريبي للرئيسية",
      links: [...SECTION_PATHS, "/عن-أحمد-المنجاوي/"],
    }),
  );
  SECTION_PATHS.forEach((path, index) =>
    set(
      path,
      pageHtml({
        path,
        title: `القسم التجريبي ${index + 1}`,
        description: `وصف عربي للقسم التجريبي ${index + 1}`,
        links: [ARTICLE_PATHS[index], "/"],
      }),
    ),
  );
  ARTICLE_PATHS.forEach((path, index) =>
    set(
      path,
      pageHtml({
        path,
        title: `المقال التجريبي ${index + 1}`,
        description: `وصف عربي للمقال التجريبي ${index + 1}`,
        links: [SECTION_PATHS[index], "/عن-أحمد-المنجاوي/"],
        youtubeId: VIDEO_IDS[index],
      }),
    ),
  );
  set(
    "/عن-أحمد-المنجاوي/",
    pageHtml({
      path: "/عن-أحمد-المنجاوي/",
      title: "عن الناشر التجريبي",
      description: "وصف عربي تجريبي للناشر",
      links: ["/"],
    }),
  );
  set(MISSING_PATH, notFoundHtml(), "text/html; charset=utf-8", 404);

  const performanceSamples = new Map(
    ["/", SECTION_PATHS[0], ...ARTICLE_PATHS].map((path, routeIndex) => [
      absolute(path),
      [0, 1, 2].map((iteration) => ({
        lcp: 900 + routeIndex * 100 + iteration * 10,
        supported: ["largest-contentful-paint", "layout-shift"],
        shifts: [
          { startTime: 100, value: 0.02 },
          { startTime: 500, value: 0.03 },
          { startTime: 6_000, value: 0.01 },
        ],
      })),
    ]),
  );

  const fixture: ControlledFixture = {
    responses,
    browserOverrides: new Map(),
    requests: [],
    browserRequests: [],
    browserRouteInstalled: false,
    browserRouteInstallCount: 0,
    readerIdleMs: 10,
    async resolveHostname(hostname, options) {
      assert.equal(hostname, new URL(CONTROLLED_ORIGIN).hostname);
      assert.deepEqual(options, { all: true, verbatim: true });
      return [{ address: "93.184.216.34", family: 4 }];
    },
    performanceSamples,
    async fetch(url, init) {
      fixture.requests.push(url);
      assert.equal(init.redirect, "manual");
      const response = responses.get(url);
      if (!response)
        throw new Error(
          `controlled fixture blocked unexpected request: ${url}`,
        );
      return new Response(response.body, {
        status: response.status,
        headers: {
          "content-type": response.contentType,
          ...response.headers,
        },
      });
    },
    async installBrowserRoutes(page) {
      fixture.browserRouteInstalled = true;
      fixture.browserRouteInstallCount += 1;
      await page.route("**/*", async (route) => {
        fixture.browserRequests.push(route.request().url());
        const response =
          fixture.browserOverrides.get(route.request().url()) ??
          responses.get(route.request().url());
        if (!response) return route.abort("blockedbyclient");
        return route.fulfill({
          status: response.status,
          contentType: response.contentType,
          headers: response.headers,
          body: response.body,
        });
      });
    },
  };
  return fixture;
}

async function loadRunner(): Promise<{
  runProductionVerification(
    options?: Record<string, unknown>,
  ): Promise<VerificationReport>;
}> {
  return import("../scripts/verify-production.mjs");
}

async function runControlled(
  fixture: ControlledFixture,
  extra: Record<string, unknown> = {},
): Promise<VerificationReport> {
  const prior = process.env.SITE_ORIGIN;
  process.env.SITE_ORIGIN = CONTROLLED_ORIGIN;
  try {
    const { runProductionVerification } = await loadRunner();
    return await runProductionVerification({
      controlledFixture: fixture,
      ...extra,
    });
  } finally {
    if (prior === undefined) delete process.env.SITE_ORIGIN;
    else process.env.SITE_ORIGIN = prior;
  }
}

let sharedRenderedAudit: Promise<VerificationReport> | undefined;

function runSharedRenderedAudit(): Promise<VerificationReport> {
  sharedRenderedAudit ??= runControlled(createFixture());
  return sharedRenderedAudit;
}

async function cleanupReport(
  report: VerificationReport | undefined,
): Promise<void> {
  if (!report) return;
  const runRoot = resolve(dirname(report.artifactPath));
  assert.ok(
    runRoot.startsWith(resolve(ARTIFACT_ROOT) + "\\") ||
      runRoot.startsWith(resolve(ARTIFACT_ROOT) + "/"),
  );
  await rm(runRoot, { recursive: true, force: true });
}

function replaceResponse(
  fixture: ControlledFixture,
  path: string,
  transform: (response: FixtureResponse) => FixtureResponse,
): void {
  const url = absolute(path);
  const response = fixture.responses.get(url);
  assert.ok(response, `missing fixture response for ${path}`);
  fixture.responses.set(url, transform(response));
}

function expectFinding(report: VerificationReport, code: string): void {
  assert.ok(
    report.findings.some((finding) => finding.code === code),
    `${code} not found in ${JSON.stringify(report.findings)}`,
  );
  assert.equal(report.automatedGates.crawl, "FAIL");
}

test("exact controlled crawl reports sitemap membership and same-origin closure", async () => {
  const fixture = createFixture();
  fixture.auditKinds = [];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    assert.equal(report.evidenceScope, "controlled");
    assert.equal(report.transport, "intercepted-fixture");
    assert.equal(report.inputOrigin, CONTROLLED_ORIGIN);
    assert.equal(report.normalizedOrigin, CONTROLLED_ORIGIN);
    assert.deepEqual(
      report.routeGraph.sitemapUrls.sort(),
      PUBLIC_PATHS.map(absolute).sort(),
    );
    assert.deepEqual(
      report.routeGraph.crawledUrls.sort(),
      PUBLIC_PATHS.map(absolute).sort(),
    );
    assert.deepEqual(
      report.routeGraph.sameOriginLinks.sort(),
      PUBLIC_PATHS.map(absolute).sort(),
    );
    assert.equal(report.findings.length, 0);
    assert.equal(report.automatedGates.crawl, "PASS");
    assert.equal(report.automatedGates["QUAL-05"], "PENDING");
    assert.equal(report.automatedGates["QUAL-06"], "PENDING");
    assert.equal(fixture.browserRouteInstalled, true);
    assert.ok(
      fixture.requests.every(
        (url) => new URL(url).origin === CONTROLLED_ORIGIN,
      ),
    );
    assert.ok(
      report.artifactPath
        .replaceAll("\\", "/")
        .includes(".artifacts/phase-06/controlled/"),
    );
    assert.deepEqual(
      JSON.parse(readFileSync(report.artifactPath, "utf8")),
      report,
    );
  } finally {
    await cleanupReport(report);
  }
});

test("controlled performance profile selects five roles and preserves fifteen cold raw samples", async () => {
  let report: VerificationReport | undefined;
  try {
    report = await runSharedRenderedAudit();
    assert.deepEqual(report.profile, {
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      cpuThrottlingRate: 4,
      latencyMs: 562.5,
      downloadThroughputBytesPerSecond: 180_000,
      uploadThroughputBytesPerSecond: 84_375,
      connectionType: "cellular4g",
      performanceNavigationTimeoutMs: 45_000,
      renderedNavigationTimeoutMs: 30_000,
      readerIdleMs: 10,
      commands: [
        "Network.emulateNetworkConditionsByRule",
        "Network.overrideNetworkState",
        "Emulation.setCPUThrottlingRate",
      ],
    });
    assert.deepEqual(
      report.selectedPerformanceRoutes.map(({ role, url }) => [role, url]),
      [
        ["homepage", absolute("/")],
        ["section-index", absolute(SECTION_PATHS[0])],
        ["section-article", absolute(ARTICLE_PATHS[0])],
        ["section-article", absolute(ARTICLE_PATHS[2])],
        ["section-article", absolute(ARTICLE_PATHS[1])],
      ],
    );
    assert.equal(report.performance.length, 5);
    assert.equal(report.performance.flatMap(({ runs }) => runs).length, 15);
    assert.equal(
      new Set(
        report.performance.flatMap(({ runs }) =>
          runs.map(({ contextSequence }) => contextSequence),
        ),
      ).size,
      15,
    );
    for (const route of report.performance) {
      assert.equal(route.runs.length, 3);
      assert.ok(
        route.runs.every(({ lcpMs, cls }) => lcpMs !== null && cls === 0.05),
      );
      assert.equal(route.medianLcpMs, route.runs[1].lcpMs);
      assert.equal(route.medianCls, 0.05);
      assert.equal(route.status, "PASS");
    }
    assert.deepEqual(report.fieldInp, {
      status: "PENDING",
      authority: "field-only",
    });
    assert.equal(report.automatedGates.performance, "PASS");
    assert.equal(report.automatedGates["QUAL-05"], "PENDING");
    assert.equal(report.automatedGates["QUAL-06"], "PENDING");
  } finally {
    await cleanupReport(report);
  }
});

test("controlled media audit covers every article intent path and direct fallback", async () => {
  let report: VerificationReport | undefined;
  try {
    report = await runSharedRenderedAudit();
    assert.deepEqual(
      report.media.map(({ url }) => url).sort(),
      ARTICLE_PATHS.map(absolute).sort(),
    );
    for (const article of report.media) {
      assert.equal(article.preIntent.iframeCount, 0);
      assert.deepEqual(article.preIntent.mediaRequests, []);
      assert.ok(
        Math.abs((article.preIntent.geometry?.ratio ?? 0) - 16 / 9) < 0.02,
      );
      for (const activation of [article.pointer, article.keyboard]) {
        assert.equal(activation.iframeCount, 1);
        assert.equal(
          activation.src,
          `https://www.youtube-nocookie.com/embed/${article.youtubeId}?hl=ar`,
        );
        assert.match(activation.title, /\p{Script=Arabic}/u);
        assert.equal(activation.focused, true);
        assert.equal(activation.geometryStable, true);
      }
      assert.deepEqual(article.fallback, {
        href: `https://www.youtube.com/watch?v=${article.youtubeId}`,
        label: "مشاهدة الفيديو على يوتيوب",
        visible: true,
        focusable: true,
        sameTab: true,
      });
      assert.equal(article.status, "PASS");
    }
    assert.equal(report.automatedGates.media, "PASS");
  } finally {
    await cleanupReport(report);
  }
});

test("controlled Arabic RTL accessibility and reflow audit covers every route plus 404", async () => {
  let report: VerificationReport | undefined;
  try {
    report = await runSharedRenderedAudit();
    assert.deepEqual(
      report.presentation.map(({ url }) => url).sort(),
      [...PUBLIC_PATHS.map(absolute), absolute(MISSING_PATH)].sort(),
    );
    for (const page of report.presentation) {
      assert.deepEqual(page.latinLeaks, []);
      assert.deepEqual(page.axeFindings, []);
      assert.equal(page.keyboardReachable, true);
      assert.equal(page.visibleFocus, true);
      assert.equal(page.textSpacingLoss, false);
      assert.equal(page.horizontalOverflow, false);
      assert.equal(page.status, "PASS");
    }
    assert.equal(report.automatedGates.presentation, "PASS");
  } finally {
    await cleanupReport(report);
  }
});

const renderedAuditCases: readonly {
  name: string;
  code: string;
  mutate(fixture: ControlledFixture): void;
}[] = [
  {
    name: "performance selection with fewer than three article sections",
    code: "PERFORMANCE_SELECTION",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-0.xml", (response) => ({
        ...response,
        body: response.body.replace(
          `<url><loc>${absolute(ARTICLE_PATHS[2])}</loc></url>`,
          "",
        ),
      })),
  },
  {
    name: "performance missing LCP metric",
    code: "PERFORMANCE_METRIC",
    mutate: (fixture) => {
      const samples = fixture.performanceSamples.get(absolute("/"));
      assert.ok(samples);
      fixture.performanceSamples.set(absolute("/"), [
        { ...samples[0], lcp: null },
        samples[1],
        samples[2],
      ]);
    },
  },
  {
    name: "performance unsupported CLS observer",
    code: "PERFORMANCE_OBSERVER",
    mutate: (fixture) => {
      const samples = fixture.performanceSamples.get(absolute("/"));
      assert.ok(samples);
      fixture.performanceSamples.set(absolute("/"), [
        {
          ...samples[0],
          supported: ["largest-contentful-paint"],
        },
        samples[1],
        samples[2],
      ]);
    },
  },
  {
    name: "performance median over threshold",
    code: "PERFORMANCE_THRESHOLD",
    mutate: (fixture) => {
      const samples = fixture.performanceSamples.get(absolute("/"));
      assert.ok(samples);
      fixture.performanceSamples.set(
        absolute("/"),
        samples.map((sample, index) => ({
          ...sample,
          lcp: 2_600 + index,
        })),
      );
    },
  },
  {
    name: "media eager exact-suffix request",
    code: "MEDIA_PRE_INTENT",
    mutate: (fixture) =>
      replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
        ...response,
        body: response.body.replace(
          "</main>",
          '<img src="https://i.ytimg.com/vi/gO9yWa85OBc/default.jpg" alt="صورة الفيديو"></main>',
        ),
      })),
  },
  {
    name: "media incorrect pointer and keyboard activation",
    code: "MEDIA_ACTIVATION",
    mutate: (fixture) =>
      replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
        ...response,
        body: response.body.replace(
          "encodeURIComponent(id)+'?hl=ar'",
          "encodeURIComponent(id)+'?hl=ar&autoplay=1'",
        ),
      })),
  },
  {
    name: "media unstable geometry",
    code: "MEDIA_GEOMETRY",
    mutate: (fixture) =>
      replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
        ...response,
        body: response.body.replace(
          "button.replaceWith(iframe)",
          "region.style.aspectRatio='1/1';button.replaceWith(iframe)",
        ),
      })),
  },
  {
    name: "media unusable blocked-player fallback",
    code: "MEDIA_FALLBACK",
    mutate: (fixture) =>
      replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
        ...response,
        body: response.body.replace(
          '<a class="youtube-cta"',
          '<a hidden class="youtube-cta"',
        ),
      })),
  },
  {
    name: "Arabic RTL rendered identity drift",
    code: "PRESENTATION_IDENTITY",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace(
          '<html lang="ar" dir="rtl">',
          '<html lang="en" dir="ltr">',
        ),
      })),
  },
  {
    name: "Arabic visible Latin leakage",
    code: "PRESENTATION_LATIN",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace("</main>", "<p>English leak</p></main>"),
      })),
  },
  {
    name: "accessibility tree Latin leakage",
    code: "PRESENTATION_LATIN",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace(
          "<main>",
          '<main aria-label="English main">',
        ),
      })),
  },
  {
    name: "accessibility missing landmark and heading sequence",
    code: "PRESENTATION_SEMANTICS",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body
          .replace("<main><h1>", "<div><h3>")
          .replace("</main>", "</div>"),
      })),
  },
  {
    name: "accessibility serious Axe finding",
    code: "PRESENTATION_AXE",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace("</main>", "<button></button></main>"),
      })),
  },
  {
    name: "accessibility keyboard focus failure",
    code: "PRESENTATION_KEYBOARD",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace(
          '<a href="/">مدونة أحمد المنجاوي</a>',
          '<a href="/" tabindex="-1">مدونة أحمد المنجاوي</a>',
        ),
      })),
  },
  {
    name: "reflow horizontal overflow at 320 CSS pixels",
    code: "PRESENTATION_REFLOW",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace("<h1>", '<h1 style="inline-size:600px">'),
      })),
  },
  {
    name: "accessibility text spacing loss",
    code: "PRESENTATION_TEXT_SPACING",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace(
          "</main>",
          '<p style="block-size:1em;overflow:hidden">نص عربي طويل لاختبار بقاء المحتوى كاملًا بعد توسيع المسافات بين الكلمات والأسطر والحروف.</p></main>',
        ),
      })),
  },
];

for (const scenario of renderedAuditCases) {
  test(`controlled ${scenario.name}`, async () => {
    const fixture = createFixture();
    scenario.mutate(fixture);
    fixture.auditKinds = [
      scenario.code.startsWith("PERFORMANCE_")
        ? "performance"
        : scenario.code.startsWith("MEDIA_")
          ? "media"
          : "presentation",
    ];
    let report: VerificationReport | undefined;
    try {
      report = await runControlled(fixture);
      assert.ok(
        report.findings.some(({ code }) => code === scenario.code),
        `${scenario.code} not found in ${JSON.stringify(report.findings)}`,
      );
    } finally {
      await cleanupReport(report);
    }
  });
}

test("media hostname matching ignores substring spoofing", async () => {
  const fixture = createFixture();
  fixture.auditKinds = ["media"];
  replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
    ...response,
    body: response.body.replace(
      "</main>",
      '<img src="https://youtube.evil.invalid/asset.png" alt="صورة تجريبية"></main>',
    ),
  }));
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    assert.deepEqual(report.media[0].preIntent.mediaRequests, []);
    assert.equal(
      report.findings.some(({ code }) => code === "MEDIA_PRE_INTENT"),
      false,
    );
  } finally {
    await cleanupReport(report);
  }
});

test("invalid or absent origin fails before fixture, browser, or artifact I/O", async () => {
  const { runProductionVerification } = await loadRunner();
  const before = existsSync(ARTIFACT_ROOT) ? await readdir(ARTIFACT_ROOT) : [];
  for (const raw of [
    undefined,
    `${CONTROLLED_ORIGIN}/`,
    "https://CONTROLLED-MANGAWY-FIXTURE.DEV",
    `${CONTROLLED_ORIGIN}:443`,
    `${CONTROLLED_ORIGIN}:8443`,
    "https://user@controlled-mangawy-fixture.dev",
    `${CONTROLLED_ORIGIN}/path`,
    `${CONTROLLED_ORIGIN}?query=1`,
    `${CONTROLLED_ORIGIN}#fragment`,
    "https://127.0.0.1",
    "https://localhost",
    "https://router",
    "https://router.local",
    "https://router.internal",
    "https://router.home.arpa",
    "https://fixture.example",
  ]) {
    const fixture = createFixture();
    const prior = process.env.SITE_ORIGIN;
    if (raw === undefined) delete process.env.SITE_ORIGIN;
    else process.env.SITE_ORIGIN = raw;
    try {
      await assert.rejects(() =>
        runProductionVerification({ controlledFixture: fixture }),
      );
      assert.deepEqual(fixture.requests, []);
      assert.equal(fixture.browserRouteInstalled, false);
    } finally {
      if (prior === undefined) delete process.env.SITE_ORIGIN;
      else process.env.SITE_ORIGIN = prior;
    }
  }
  const after = existsSync(ARTIFACT_ROOT) ? await readdir(ARTIFACT_ROOT) : [];
  assert.deepEqual(after, before);
});

test("private DNS answers fail before fixture, browser, artifact, or route I/O", async () => {
  const fixture = createFixture();
  fixture.resolveHostname = async () => [
    { address: "192.168.1.1", family: 4 },
  ];
  const before = existsSync(ARTIFACT_ROOT) ? await readdir(ARTIFACT_ROOT) : [];
  await assert.rejects(() => runControlled(fixture));
  assert.deepEqual(fixture.requests, []);
  assert.equal(fixture.browserRouteInstalled, false);
  const after = existsSync(ARTIFACT_ROOT) ? await readdir(ARTIFACT_ROOT) : [];
  assert.deepEqual(after, before);
});

test("browser-only redirects are blocked before the destination is contacted", async () => {
  const fixture = createFixture();
  const outside = "https://outside-fixture.dev/redirect-target";
  const original = fixture.responses.get(absolute("/"));
  assert.ok(original);
  fixture.browserOverrides.set(absolute("/"), {
    ...original,
    body: original.body.replace(
      "</head>",
      `<meta http-equiv="refresh" content="0;url=${outside}"></head>`,
    ),
  });
  fixture.auditKinds = ["presentation"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    assert.ok(
      report.findings.some(({ code }) => code === "BROWSER_ORIGIN_ESCAPE"),
      JSON.stringify({
        findings: report.findings,
        errors: report.errors,
        browserRequests: fixture.browserRequests,
      }),
    );
    assert.equal(fixture.browserRequests.includes(outside), false);
    assert.equal(report.automatedGates.presentation, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

test("every registered article route fails crawl and media when its media is absent", async () => {
  const fixture = createFixture();
  const missingMediaPath = "/الردود-والشبهات/مقال-بلا-وسائط/";
  replaceResponse(fixture, "/sitemap-0.xml", (response) => ({
    ...response,
    body: response.body.replace(
      "</urlset>",
      `<url><loc>${absolute(missingMediaPath)}</loc></url></urlset>`,
    ),
  }));
  fixture.responses.set(absolute(missingMediaPath), {
    status: 200,
    contentType: "text/html; charset=utf-8",
    body: pageHtml({
      path: missingMediaPath,
      title: "مقال تجريبي بلا وسائط",
      description: "وصف عربي لمقال تجريبي بلا وسائط",
      links: [SECTION_PATHS[0], "/"],
    }),
  });
  fixture.auditKinds = ["media"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    expectFinding(report, "YOUTUBE_IDENTITY");
    assert.ok(report.findings.some(({ code }) => code === "MEDIA_IDENTITY"));
    assert.equal(report.media.length, ARTICLE_PATHS.length + 1);
    assert.equal(
      report.media.find(({ url }) => url === absolute(missingMediaPath))?.status,
      "FAIL",
    );
    assert.equal(report.automatedGates.media, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

const failureCases: readonly {
  name: string;
  code: string;
  mutate(fixture: ControlledFixture): void;
}[] = [
  {
    name: "redirecting discovery response",
    code: "STATIC_REDIRECT",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-index.xml", (response) => ({
        ...response,
        status: 301,
        headers: { location: absolute("/sitemap-0.xml") },
      })),
  },
  {
    name: "malformed sitemap XML",
    code: "XML_MALFORMED",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-0.xml", (response) => ({
        ...response,
        body: "<urlset><url><loc>broken",
      })),
  },
  {
    name: "duplicate sitemap location",
    code: "XML_DUPLICATE_LOCATION",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-0.xml", (response) => ({
        ...response,
        body: response.body.replace(
          "</urlset>",
          `<url><loc>${absolute("/")}</loc></url></urlset>`,
        ),
      })),
  },
  {
    name: "entity-bearing sitemap",
    code: "XML_UNSAFE_DECLARATION",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-0.xml", (response) => ({
        ...response,
        body: `<!DOCTYPE urlset [<!ENTITY xxe "unsafe">]>${response.body}`,
      })),
  },
  {
    name: "oversized sitemap",
    code: "BODY_TOO_LARGE",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-0.xml", (response) => ({
        ...response,
        headers: { "content-length": "5242881" },
      })),
  },
  {
    name: "out-of-origin sitemap location",
    code: "OUT_OF_ORIGIN_URL",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-0.xml", (response) => ({
        ...response,
        body: response.body.replace(
          absolute("/"),
          "https://outside-fixture.dev/",
        ),
      })),
  },
  {
    name: "non-200 public page",
    code: "HTTP_STATUS",
    mutate: (fixture) =>
      replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
        ...response,
        status: 503,
      })),
  },
  {
    name: "broken same-origin link",
    code: "BROKEN_INTERNAL_LINK",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace(
          "</main>",
          '<a href="/رابط-مكسور/">رابط مكسور</a></main>',
        ),
      })),
  },
  {
    name: "wrong canonical",
    code: "CANONICAL_MISMATCH",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace(
          `href="${absolute("/")}"`,
          `href="${absolute(SECTION_PATHS[0])}"`,
        ),
      })),
  },
  {
    name: "multiple canonicals",
    code: "CANONICAL_COUNT",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace(
          "</head>",
          `<link rel="canonical" href="${absolute("/")}"></head>`,
        ),
      })),
  },
  {
    name: "duplicate metadata across public pages",
    code: "METADATA_NOT_UNIQUE",
    mutate: (fixture) => {
      const first = fixture.responses.get(absolute(SECTION_PATHS[0]));
      assert.ok(first);
      replaceResponse(fixture, SECTION_PATHS[1], (response) => ({
        ...response,
        body: response.body.replace(
          /<title>[^<]+<\/title>/u,
          first.body.match(/<title>[^<]+<\/title>/u)?.[0] ?? "",
        ),
      }));
    },
  },
  {
    name: "non-Arabic metadata",
    code: "METADATA_NOT_ARABIC",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace("الرئيسية التجريبية", "English title"),
      })),
  },
  {
    name: "public noindex",
    code: "PUBLIC_NOINDEX",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace(
          "</head>",
          '<meta name="robots" content="noindex"></head>',
        ),
      })),
  },
  {
    name: "draft leakage",
    code: "DRAFT_LEAK",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-0.xml", (response) => ({
        ...response,
        body: response.body.replace(
          "</urlset>",
          `<url><loc>${absolute(DRAFT_PATH)}</loc></url></urlset>`,
        ),
      })),
  },
  {
    name: "incorrect 404",
    code: "NOT_FOUND_CONTRACT",
    mutate: (fixture) =>
      replaceResponse(fixture, MISSING_PATH, (response) => ({
        ...response,
        status: 200,
      })),
  },
];

for (const scenario of failureCases) {
  test(`controlled crawl rejects ${scenario.name}`, async () => {
    const fixture = createFixture();
    fixture.auditKinds = [];
    scenario.mutate(fixture);
    let report: VerificationReport | undefined;
    try {
      report = await runControlled(fixture);
      expectFinding(report, scenario.code);
    } finally {
      await cleanupReport(report);
    }
  });
}

test("external YouTube destinations are recorded but never crawled", async () => {
  const fixture = createFixture();
  fixture.auditKinds = [];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    assert.equal(report.findings.length, 0);
    assert.equal(report.routeGraph.externalLinks.length, ARTICLE_PATHS.length);
    assert.ok(
      report.routeGraph.externalLinks.every((url) =>
        url.startsWith("https://www.youtube.com/watch?v="),
      ),
    );
    assert.ok(
      fixture.requests.every(
        (url) => new URL(url).origin === CONTROLLED_ORIGIN,
      ),
    );
  } finally {
    await cleanupReport(report);
  }
});

test("controlled authority cannot be caller-promoted or redirected", async () => {
  const fixture = createFixture();
  fixture.auditKinds = [];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture, {
      evidenceScope: "final-origin",
      transport: "network",
      outputPath: resolve(".planning/forbidden-report.json"),
    });
    assert.equal(report.evidenceScope, "controlled");
    assert.equal(report.transport, "intercepted-fixture");
    assert.equal(report.automatedGates["QUAL-05"], "PENDING");
    assert.equal(report.automatedGates["QUAL-06"], "PENDING");
    assert.equal(existsSync(resolve(".planning/forbidden-report.json")), false);
    const serialized = JSON.stringify(report);
    for (const forbidden of [
      "responseBody",
      "requestHeaders",
      "responseHeaders",
      "cookies",
      "credentials",
      "tokens",
    ]) {
      assert.equal(serialized.includes(`\"${forbidden}\"`), false);
    }
  } finally {
    await cleanupReport(report);
  }
});

test("source wiring keeps production verification isolated and dependency-free", () => {
  const packageSource = readFileSync("package.json", "utf8");
  const packageData = JSON.parse(packageSource) as {
    scripts: Record<string, string>;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  assert.equal(
    packageData.scripts["verify:production"],
    "node scripts/verify-production.mjs",
  );
  assert.ok(
    packageData.scripts.test.includes("tests/production-verification.test.ts"),
  );
  assert.equal(packageData.scripts.verify.includes("verify:production"), false);
  assert.equal(
    packageData.scripts["test:browser"].includes("verify:production"),
    false,
  );
  assert.deepEqual(
    Object.keys(packageData.dependencies).sort(),
    ["@astrojs/mdx", "@astrojs/sitemap", "@mdx-js/mdx", "astro"].sort(),
  );
  assert.deepEqual(
    Object.keys(packageData.devDependencies).sort(),
    [
      "@astrojs/check",
      "@axe-core/playwright",
      "@playwright/test",
      "typescript",
    ].sort(),
  );
  const runner = readFileSync("scripts/verify-production.mjs", "utf8");
  const player = readFileSync("src/components/YouTubePlayer.astro", "utf8");
  for (const [selector, componentMarker] of [
    ["[data-video-region]", "data-video-region"],
    ["[data-video-activate]", "data-video-activate"],
    [".youtube-cta", 'class="youtube-cta"'],
  ]) {
    assert.ok(runner.includes(selector), `runner selector missing: ${selector}`);
    assert.ok(
      player.includes(componentMarker),
      `component contract missing: ${componentMarker}`,
    );
  }
  assert.match(runner, /productionSiteOrigin\(process\.env\.SITE_ORIGIN\)/u);
  assert.match(runner, /redirect:\s*["']manual["']/u);
  assert.doesNotMatch(
    runner,
    /dotenv|outputPath|evidenceScope\s*[:=]\s*options|06-PRODUCTION-EVIDENCE/u,
  );
  assert.match(runner, /const FINAL_READER_IDLE_MS = 5_000/u);
  assert.match(
    runner,
    /controlledFixture[\s\S]+controlledFixture\.readerIdleMs[\s\S]+FINAL_READER_IDLE_MS/u,
  );
  assert.match(runner, /Network\.emulateNetworkConditionsByRule/u);
  assert.match(runner, /Network\.overrideNetworkState/u);
  assert.match(runner, /maximumSessionWindowCls/u);
  assert.doesNotMatch(
    runner,
    /ignoreHTTPSErrors|launchPersistentContext|httpCredentials|extraHTTPHeaders|storageState|proxy\s*:/u,
  );
});

test("evidence ledger keeps every external and requirement authority pending", () => {
  const path =
    ".planning/phases/06-production-launch-verification/06-PRODUCTION-EVIDENCE.md";
  const source = readFileSync(path, "utf8");
  const rows = source
    .split(/\r?\n/u)
    .filter((line) => line.startsWith("|") && !/^\|\s*-+/u.test(line))
    .slice(1)
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim()),
    );
  assert.ok(rows.length >= 14);
  assert.ok(rows.every((row) => row.length === 7));
  assert.ok(
    rows.every((row) =>
      ["PASS", "FAIL", "PENDING", "BLOCKED"].includes(row[2]),
    ),
  );
  const controlled = rows.find((row) => row[1] === "صحة أداة التحقق المضبوطة");
  assert.ok(controlled);
  assert.equal(controlled[2], "PASS");
  assert.match(controlled[3], /Node `v24\.19\.0` وnpm `11\.17\.0`/u);
  assert.match(controlled[5], /\.artifacts\/phase-06\/controlled\//u);
  for (const gate of [
    "اعتماد الأصل النهائي الدقيق",
    "زحف الأصل النهائي",
    "قياسات LCP وCLS الإنتاجية",
    "الوسائط قبل التفاعل وبعده",
    "العربية وRTL وإمكانية الوصول وإعادة التدفق",
    "التكبير الأصلي 200%",
    "INP وبيانات Core Web Vitals الحقلية",
    "Cloudflare والنشر وDNS وTLS",
    "ملكية Search Console وإرسال خريطة الموقع",
    "مشاهدات Plausible المجمعة",
    "نقرة رابط يوتيوب في Plausible",
    "`QUAL-05`",
    "`QUAL-06`",
  ]) {
    const row = rows.find((candidate) => candidate[1] === gate);
    assert.ok(row, `missing ledger row: ${gate}`);
    assert.equal(row[2], "PENDING", gate);
    assert.notEqual(row[3], "", gate);
    assert.notEqual(row[6], "", gate);
  }
  assert.match(source, /لا تعدّل الأداة هذا الملف/u);
  assert.match(
    source,
    /إنشاء إطار يوتيوب[\s\S]+لا يثبت السماح بالتشغيل أو بدءه أو اكتماله/u,
  );
});

test("Arabic README documents the isolated process-local production operator path", () => {
  const source = readFileSync("README.md", "utf8");
  assert.match(source, /## التحقق الاختياري من الأصل النهائي/u);
  assert.match(source, /Node\.js `24\.19\.0` وnpm `11\.17\.0`/u);
  assert.match(source, /\$approvedOrigin = Read-Host/u);
  assert.match(source, /\$env:SITE_ORIGIN = \$approvedOrigin/u);
  assert.match(source, /npm run verify:production/u);
  assert.match(source, /Remove-Item Env:SITE_ORIGIN/u);
  assert.match(
    source,
    /\.artifacts\/phase-06\/production\/\{UTC-run-id\}\/report\.json/u,
  );
  assert.match(source, /15 عينة/u);
  assert.match(source, /INP حقيقة حقلية منفصلة/u);
  assert.match(source, /لا يثبت إنشاء الإطار تشغيل الفيديو/u);
  assert.match(source, /التكبير الأصلي للمتصفح بنسبة 200%/u);
  assert.match(source, /Cloudflare أو Search Console أو Plausible/u);
  assert.doesNotMatch(source, /\.env(?:\b|\.)|dotenv/iu);
});

test("ordinary verification and artifact boundaries cannot invoke or promote production", () => {
  const packageData = JSON.parse(readFileSync("package.json", "utf8")) as {
    scripts: Record<string, string>;
  };
  for (const command of ["test", "test:browser", "verify"]) {
    assert.equal(
      packageData.scripts[command].includes("verify:production"),
      false,
      command,
    );
  }
  const runner = readFileSync("scripts/verify-production.mjs", "utf8");
  assert.match(
    runner,
    /\.artifacts["'],\s*["']phase-06["'],\s*scope === ["']controlled["']/u,
  );
  assert.doesNotMatch(runner, /06-PRODUCTION-EVIDENCE|\.planning\/phases/u);
  assert.match(runner, /"QUAL-05": "PENDING"/u);
  assert.match(runner, /"QUAL-06": "PENDING"/u);
  assert.match(
    runner,
    /fieldInp: \{ status: "PENDING", authority: "field-only" \}/u,
  );
});

test("controlled report generation never mutates the reviewer evidence ledger", async () => {
  const ledgerPath =
    ".planning/phases/06-production-launch-verification/06-PRODUCTION-EVIDENCE.md";
  const before = readFileSync(ledgerPath, "utf8");
  const fixture = createFixture();
  fixture.auditKinds = [];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    assert.equal(report.evidenceScope, "controlled");
    assert.equal(report.automatedGates["QUAL-05"], "PENDING");
    assert.equal(report.automatedGates["QUAL-06"], "PENDING");
    assert.equal(readFileSync(ledgerPath, "utf8"), before);
  } finally {
    await cleanupReport(report);
  }
});
