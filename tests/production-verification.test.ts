import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createSocket } from "node:dgram";
import { existsSync, readFileSync } from "node:fs";
import { readdir, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import { chromium, type Page } from "@playwright/test";

const CONTROLLED_ORIGIN = "https://controlled-mangawy-fixture.dev";
const CONTROLLED_PLAUSIBLE_SCRIPT_SRC =
  "https://plausible.io/js/pa-FAKE_TEST_FIXTURE_DO_NOT_DEPLOY.js";
const PLAUSIBLE_EVENT_ENDPOINT = "https://plausible.io/api/event";
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
const UNTRUSTED_TLS_KEY = `-----BEGIN PRIVATE KEY-----
MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIA2GK0mXHrZl0GWkYy
UjqzE44KedmA02JAy3+uyQk64Iq5LaOmKCFZf7nu2Q1PfKl4Ewn23uv+njl0tiXW
Vq4B1XahgYkDgYYABAFSXEEgv58hS6AkQlcZtUMRYkWL+DWt7WPqhf4PQDc4ZvOD
fVysYtuNOQ1EOX5guHEeeQd+eOa9nXkHjpRpLBn78wHCiwmAt4sTFrLaw9tSNc/q
pfQGQaS3KXpNDxastLHUy9R4bPf/aawn8Q8sycxsr2zFqsKTigR7XJWlkNes5/L9
eg==
-----END PRIVATE KEY-----`;
const UNTRUSTED_TLS_CERT = `-----BEGIN CERTIFICATE-----
MIIBpDCCAQagAwIBAgIJAL/3zxwtYjSFMAoGCCqGSM49BAMCMBQxEjAQBgNVBAMT
CWxvY2FsaG9zdDAeFw0yNjA4MjcwODQzMzVaFw0yNjA5MjcwODQzMzVaMBQxEjAQ
BgNVBAMTCWxvY2FsaG9zdDCBmzAQBgcqhkjOPQIBBgUrgQQAIwOBhgAEAVJcQSC/
nyFLoCRCVxm1QxFiRYv4Na3tY+qF/g9ANzhm84N9XKxi2405DUQ5fmC4cR55B354
5r2deQeOlGksGfvzAcKLCYC3ixMWstrD21I1z+ql9AZBpLcpek0PFqy0sdTL1Hhs
9/9prCfxDyzJzGyvbMWqwpOKBHtclaWQ16zn8v16MAoGCCqGSM49BAMCA4GLADCB
hwJBT9RF+imScEKKoPI4z00g9olPXTwQLUT++4le+q/oTyxj1cHDbDokrpjuv8A1
hIgxYeOC2POtkWAQAnNAwHdqSF0CQgGH1CaxJeVmPqNea1vDa42PTTHMzHvyQN5s
OgXaRjBRl67Cul7MGxF2UAL0rPv01pFdxLng78ZZmQmFikyqkofiAw==
-----END CERTIFICATE-----`;

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
  fontReadyTimeoutMs?: number;
  performanceAuditTimeoutMs?: number;
  renderedAuditTimeoutMs?: number;
  runnerSetupTimeoutMs?: number;
  browserCloseTimeoutMs?: number;
  dnsResolutionTimeoutMs?: number;
  beforeAuditPageSetup?(label: string): Promise<void>;
  beforeAuditPageClose?(label: string): Promise<void>;
  beforeBrowserClose?(): Promise<void>;
  resolveHostname(
    hostname: string,
    options: { all: true; verbatim: true; signal: AbortSignal },
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
  plausibleLoader: string | null;
  startedAt: string;
  completedAt: string;
  runtime: { node: string; playwright: string; chromium: string };
  routeGraph: {
    sitemapUrls: string[];
    crawledUrls: string[];
    sameOriginLinks: string[];
    externalLinks: string[];
    browserRemoteAddresses: string[];
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
    fontReadyTimeoutMs: number;
    performanceAuditTimeoutMs: number;
    renderedAuditTimeoutMs: number;
    runnerSetupTimeoutMs: number;
    browserCloseTimeoutMs: number;
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
      maxIframeCount: number;
      intentBoundaryClean: boolean;
      src: string;
      title: string;
      focused: boolean;
      geometryStable: boolean;
      mediaRequests: string[];
    };
    keyboard: {
      iframeCount: number;
      maxIframeCount: number;
      intentBoundaryClean: boolean;
      src: string;
      title: string;
      focused: boolean;
      geometryStable: boolean;
      mediaRequests: string[];
    };
    fallback: {
      iframeCount: number;
      maxIframeCount: number;
      href: string;
      label: string;
      visible: boolean;
      focusable: boolean;
      sameTab: boolean;
      mediaRequests: string[];
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
  return `<!doctype html><html lang="ar" dir="rtl"><head><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${absolute(path)}"><style>*{box-sizing:border-box}body{margin:0;font:18px/1.7 sans-serif}header,main{max-inline-size:70ch;margin-inline:auto;padding:1rem}a,button{min-inline-size:44px;min-block-size:44px}a:focus-visible,button:focus-visible,[data-video-region]:focus-within{outline:3px solid #166534;outline-offset:3px}[data-video-region]{aspect-ratio:16/9;inline-size:100%;display:grid;place-items:center;background:#eee}[data-video-region] iframe{border:0;inline-size:100%;block-size:100%}</style><script defer src="${CONTROLLED_PLAUSIBLE_SCRIPT_SRC}"></script></head><body><header><a href="/">مدونة أحمد المنجاوي</a></header><main><h1>${title}</h1>${links.map((href) => `<a href="${href}">رابط عربي</a>`).join("")}${media}</main><script>for(const region of document.querySelectorAll('[data-video-region]')){const button=region.querySelector('[data-video-activate]');button?.addEventListener('click',()=>{if(region.querySelector('iframe'))return;try{const id=region.getAttribute('data-youtube-id');const title=region.getAttribute('data-iframe-title');const iframe=document.createElement('iframe');iframe.title=title;iframe.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?hl=ar';button.replaceWith(iframe);iframe.focus()}catch{button.hidden=true;region.querySelector('[data-video-error]').hidden=false}},{once:true})}</script></body></html>`;
}

function notFoundHtml(): string {
  return `<!doctype html><html lang="ar" dir="rtl"><head><title>الصفحة غير موجودة</title><meta name="description" content="تعذر العثور على الصفحة المطلوبة"><meta name="robots" content="noindex,follow"><script defer src="${CONTROLLED_PLAUSIBLE_SCRIPT_SRC}"></script></head><body><main><h1>الصفحة غير موجودة</h1><a href="/">العودة إلى الصفحة الرئيسية</a></main></body></html>`;
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
      assert.equal(options.all, true);
      assert.equal(options.verbatim, true);
      assert.ok(options.signal instanceof AbortSignal);
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
  chromiumLaunchArgs(verifiedSite: {
    hostname: string;
    addresses: readonly { address: string; family: 4 | 6 }[];
  }): string[];
  runProductionVerification(
    options?: Record<string, unknown>,
  ): Promise<VerificationReport>;
}> {
  return import("../scripts/verify-production.mjs");
}

type LocalServer =
  ReturnType<typeof createServer> | ReturnType<typeof createHttpsServer>;

async function listen(server: LocalServer): Promise<number> {
  await new Promise<void>((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  return address.port;
}

async function closeServer(server: LocalServer): Promise<void> {
  await new Promise<void>((resolveClose, rejectClose) =>
    server.close((error) => (error ? rejectClose(error) : resolveClose())),
  );
}

async function runTlsDisabledChild(source: string): Promise<{
  code: number | null;
  stdout: string;
  stderr: string;
}> {
  const child = spawn(process.execPath, ["--input-type=module", "-e", source], {
    env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8").on("data", (value) => (stdout += value));
  child.stderr.setEncoding("utf8").on("data", (value) => (stderr += value));
  const code = await new Promise<number | null>((resolveExit, rejectExit) => {
    child.once("error", rejectExit);
    child.once("exit", resolveExit);
  });
  return { code, stdout, stderr };
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
      fontReadyTimeoutMs: 10_000,
      performanceAuditTimeoutMs: 65_000,
      renderedAuditTimeoutMs: 45_000,
      runnerSetupTimeoutMs: 30_000,
      browserCloseTimeoutMs: 5_000,
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
        assert.equal(activation.maxIframeCount, 1);
        assert.equal(activation.intentBoundaryClean, true);
        assert.equal(
          activation.src,
          `https://www.youtube-nocookie.com/embed/${article.youtubeId}?hl=ar`,
        );
        assert.match(activation.title, /\p{Script=Arabic}/u);
        assert.equal(activation.focused, true);
        assert.equal(activation.geometryStable, true);
        assert.deepEqual(activation.mediaRequests, [activation.src]);
      }
      assert.deepEqual(article.fallback, {
        iframeCount: 1,
        maxIframeCount: 1,
        href: `https://www.youtube.com/watch?v=${article.youtubeId}`,
        label: "مشاهدة الفيديو على يوتيوب",
        visible: true,
        focusable: true,
        sameTab: true,
        mediaRequests: [
          `https://www.youtube-nocookie.com/embed/${article.youtubeId}?hl=ar`,
        ],
      });
      assert.equal(article.status, "PASS");
    }
    assert.equal(report.automatedGates.media, "PASS");
  } finally {
    await cleanupReport(report);
  }
});

test("delayed eager media during the pre-intent dwell fails the article and media gate", async () => {
  const fixture = createFixture();
  const articleUrl = absolute(ARTICLE_PATHS[0]);
  const expectedSrc = `https://www.youtube-nocookie.com/embed/${VIDEO_IDS[0]}?hl=ar`;
  const delayedEagerMedia = `<script>setTimeout(()=>{const region=document.querySelector('[data-video-region]');if(region.querySelector('iframe'))return;const iframe=document.createElement('iframe');iframe.src=${JSON.stringify(expectedSrc)};region.append(iframe)},100)</script>`;
  replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
    ...response,
    body: response.body.replace("</body>", `${delayedEagerMedia}</body>`),
  }));
  fixture.auditKinds = ["media"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    const article = report.media.find(({ url }) => url === articleUrl);
    assert.ok(article);
    assert.ok(
      report.findings.some(
        ({ code, url }) => code === "MEDIA_PRE_INTENT" && url === articleUrl,
      ),
      JSON.stringify({ findings: report.findings, article }),
    );
    assert.equal(article.status, "FAIL");
    assert.equal(report.automatedGates.media, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

test("focus-only media activation is not relabeled as Enter intent", async () => {
  const fixture = createFixture();
  const articleUrl = absolute(ARTICLE_PATHS[0]);
  replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
    ...response,
    body: response.body.replace(
      "button?.addEventListener('click'",
      "button?.addEventListener('focus'",
    ),
  }));
  fixture.auditKinds = ["media"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    const article = report.media.find(({ url }) => url === articleUrl);
    assert.ok(article);
    assert.ok(
      report.findings.some(
        ({ code, url }) => code === "MEDIA_ACTIVATION" && url === articleUrl,
      ),
      JSON.stringify({ findings: report.findings, article }),
    );
    assert.equal(article.keyboard.intentBoundaryClean, false);
    assert.equal(article.status, "FAIL");
    assert.equal(report.automatedGates.media, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

test("hover-only media activation is not relabeled as click intent", async () => {
  const fixture = createFixture();
  const articleUrl = absolute(ARTICLE_PATHS[0]);
  const articleResponse = fixture.responses.get(articleUrl);
  assert.ok(articleResponse);
  const expectedSrc = `https://www.youtube-nocookie.com/embed/${VIDEO_IDS[0]}?hl=ar`;
  const hoverOnlyActivation = `<script>{const region=document.querySelector('[data-video-region]');const button=region.querySelector('[data-video-activate]');button.addEventListener('pointermove',()=>{if(region.querySelector('iframe'))return;const iframe=document.createElement('iframe');iframe.title=region.getAttribute('data-iframe-title');iframe.src=${JSON.stringify(expectedSrc)};region.append(iframe);iframe.focus()},{once:true})}</script>`;
  const mutatedResponse = {
    ...articleResponse,
    body: articleResponse.body.replace(
      "</body>",
      `${hoverOnlyActivation}</body>`,
    ),
  };
  fixture.beforeAuditPageSetup = async (label) => {
    if (label === "media pointer pass")
      fixture.browserOverrides.set(articleUrl, mutatedResponse);
    else fixture.browserOverrides.delete(articleUrl);
  };
  fixture.auditKinds = ["media"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    const article = report.media.find(({ url }) => url === articleUrl);
    assert.ok(article);
    assert.ok(
      report.findings.some(
        ({ code, url }) => code === "MEDIA_ACTIVATION" && url === articleUrl,
      ),
      JSON.stringify({ findings: report.findings, article }),
    );
    assert.equal(article.pointer.intentBoundaryClean, false);
    assert.equal(article.status, "FAIL");
    assert.equal(report.automatedGates.media, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

test("a synthetic click during pointer movement cannot authorize media", async () => {
  const fixture = createFixture();
  const articleUrl = absolute(ARTICLE_PATHS[0]);
  const articleResponse = fixture.responses.get(articleUrl);
  assert.ok(articleResponse);
  const syntheticClick = `<script>document.querySelector('[data-video-activate]').addEventListener('pointermove',(event)=>event.currentTarget.click(),{once:true})</script>`;
  const mutatedResponse = {
    ...articleResponse,
    body: articleResponse.body.replace("</body>", `${syntheticClick}</body>`),
  };
  fixture.beforeAuditPageSetup = async (label) => {
    if (label === "media pointer pass")
      fixture.browserOverrides.set(articleUrl, mutatedResponse);
    else fixture.browserOverrides.delete(articleUrl);
  };
  fixture.auditKinds = ["media"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    const article = report.media.find(({ url }) => url === articleUrl);
    assert.ok(article);
    assert.ok(
      report.findings.some(
        ({ code, url }) => code === "MEDIA_ACTIVATION" && url === articleUrl,
      ),
      JSON.stringify({ findings: report.findings, article }),
    );
    assert.equal(article.pointer.intentBoundaryClean, false);
    assert.equal(article.status, "FAIL");
    assert.equal(report.automatedGates.media, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

test("a synthetic Enter from focus cannot authorize media", async () => {
  const fixture = createFixture();
  const articleUrl = absolute(ARTICLE_PATHS[0]);
  const articleResponse = fixture.responses.get(articleUrl);
  assert.ok(articleResponse);
  const syntheticEnter = `<script>{const region=document.querySelector('[data-video-region]');const button=region.querySelector('[data-video-activate]');button.addEventListener('keydown',(event)=>{if(event.key!=='Enter'||region.querySelector('iframe'))return;const iframe=document.createElement('iframe');iframe.title=region.getAttribute('data-iframe-title');iframe.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(region.getAttribute('data-youtube-id'))+'?hl=ar';button.replaceWith(iframe);iframe.focus()});button.addEventListener('focus',()=>button.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})),{once:true})}</script>`;
  const mutatedResponse = {
    ...articleResponse,
    body: articleResponse.body.replace("</body>", `${syntheticEnter}</body>`),
  };
  fixture.beforeAuditPageSetup = async (label) => {
    if (label === "media keyboard pass")
      fixture.browserOverrides.set(articleUrl, mutatedResponse);
    else fixture.browserOverrides.delete(articleUrl);
  };
  fixture.auditKinds = ["media"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    const article = report.media.find(({ url }) => url === articleUrl);
    assert.ok(article);
    assert.ok(
      report.findings.some(
        ({ code, url }) => code === "MEDIA_ACTIVATION" && url === articleUrl,
      ),
      JSON.stringify({ findings: report.findings, article }),
    );
    assert.equal(article.keyboard.intentBoundaryClean, false);
    assert.equal(article.status, "FAIL");
    assert.equal(report.automatedGates.media, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

test("duplicate exact iframe navigations fail media even when one iframe is removed before observation", async () => {
  const fixture = createFixture();
  replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
    ...response,
    body: response.body.replace(
      "button.replaceWith(iframe);iframe.focus()",
      "button.replaceWith(iframe);const duplicate=iframe.cloneNode();region.append(duplicate);setTimeout(()=>duplicate.remove(),10);iframe.focus()",
    ),
  }));
  fixture.auditKinds = ["media"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    const article = report.media.find(
      ({ url }) => url === absolute(ARTICLE_PATHS[0]),
    );
    assert.ok(article);
    assert.ok(
      report.findings.some(({ code }) => code === "MEDIA_ACTIVATION"),
      JSON.stringify(report.findings),
    );
    const expectedSrc = `https://www.youtube-nocookie.com/embed/${article.youtubeId}?hl=ar`;
    for (const activation of [article.pointer, article.keyboard]) {
      assert.equal(activation.iframeCount, 1);
      assert.equal(activation.maxIframeCount, 2);
      assert.deepEqual(activation.mediaRequests, [expectedSrc, expectedSrc]);
    }
    assert.equal(article.fallback.iframeCount, 1);
    assert.equal(article.fallback.maxIframeCount, 2);
    assert.deepEqual(article.fallback.mediaRequests, [
      expectedSrc,
      expectedSrc,
    ]);
    assert.equal(article.status, "FAIL");
    assert.equal(report.automatedGates.media, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

test("a synchronously appended and removed iframe is retained in the reported maximum", async () => {
  const fixture = createFixture();
  const articleUrl = absolute(ARTICLE_PATHS[0]);
  replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
    ...response,
    body: response.body.replace(
      "button.replaceWith(iframe);iframe.focus()",
      "button.replaceWith(iframe);const duplicate=iframe.cloneNode();region.append(duplicate);duplicate.remove();iframe.focus()",
    ),
  }));
  fixture.auditKinds = ["media"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    const article = report.media.find(({ url }) => url === articleUrl);
    assert.ok(article);
    assert.ok(
      report.findings.some(
        ({ code, url }) => code === "MEDIA_ACTIVATION" && url === articleUrl,
      ),
      JSON.stringify({ findings: report.findings, article }),
    );
    assert.equal(article.pointer.iframeCount, 1);
    assert.equal(article.pointer.maxIframeCount, 2);
    assert.equal(article.status, "FAIL");
    assert.equal(report.automatedGates.media, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

test("an empty wrapper followed by its sole iframe keeps the maximum at one", async () => {
  const fixture = createFixture();
  const articleUrl = absolute(ARTICLE_PATHS[0]);
  replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
    ...response,
    body: response.body.replace(
      "button.replaceWith(iframe);iframe.focus()",
      "const wrapper=document.createElement('div');button.replaceWith(wrapper);wrapper.append(iframe);iframe.focus()",
    ),
  }));
  fixture.auditKinds = ["media"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    const article = report.media.find(({ url }) => url === articleUrl);
    assert.ok(article);
    assert.equal(article.pointer.maxIframeCount, 1);
    assert.equal(article.keyboard.maxIframeCount, 1);
    assert.equal(article.fallback.maxIframeCount, 1);
    assert.equal(article.status, "PASS");
    assert.equal(report.automatedGates.media, "PASS");
  } finally {
    await cleanupReport(report);
  }
});

test("a prebuilt nested duplicate removed synchronously reaches a maximum of two", async () => {
  const fixture = createFixture();
  const articleUrl = absolute(ARTICLE_PATHS[0]);
  replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
    ...response,
    body: response.body.replace(
      "button.replaceWith(iframe);iframe.focus()",
      "button.replaceWith(iframe);const wrapper=document.createElement('div');const duplicate=iframe.cloneNode();wrapper.append(duplicate);region.append(wrapper);duplicate.remove();iframe.focus()",
    ),
  }));
  fixture.auditKinds = ["media"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    const article = report.media.find(({ url }) => url === articleUrl);
    assert.ok(article);
    assert.ok(
      report.findings.some(
        ({ code, url }) => code === "MEDIA_ACTIVATION" && url === articleUrl,
      ),
      JSON.stringify({ findings: report.findings, article }),
    );
    assert.equal(article.pointer.iframeCount, 1);
    assert.equal(article.pointer.maxIframeCount, 2);
    assert.equal(article.status, "FAIL");
    assert.equal(report.automatedGates.media, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

test("reparenting one iframe inside the media region does not create a false peak", async () => {
  const fixture = createFixture();
  const articleUrl = absolute(ARTICLE_PATHS[0]);
  replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
    ...response,
    body: response.body.replace(
      "button.replaceWith(iframe);iframe.focus()",
      "button.replaceWith(iframe);const wrapper=document.createElement('div');region.append(wrapper);wrapper.append(iframe);iframe.focus()",
    ),
  }));
  fixture.auditKinds = ["media"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    const article = report.media.find(({ url }) => url === articleUrl);
    assert.ok(article);
    assert.equal(article.pointer.maxIframeCount, 1);
    assert.equal(article.keyboard.maxIframeCount, 1);
    assert.equal(article.fallback.maxIframeCount, 1);
    assert.equal(article.status, "PASS");
    assert.equal(report.automatedGates.media, "PASS");
  } finally {
    await cleanupReport(report);
  }
});

for (const [name, mutation] of [
  [
    "innerHTML",
    "const wrapper=document.createElement('div');region.append(wrapper);wrapper.innerHTML='<iframe data-transient-duplicate></iframe>';wrapper.remove();",
  ],
  [
    "insertAdjacentHTML",
    "region.insertAdjacentHTML('beforeend','<iframe data-transient-duplicate></iframe>');region.querySelector('[data-transient-duplicate]').remove();",
  ],
  [
    "Range.insertNode",
    "const duplicate=document.createElement('iframe');duplicate.dataset.transientDuplicate='';const range=document.createRange();range.selectNodeContents(region);range.collapse(false);range.insertNode(duplicate);duplicate.remove();",
  ],
] as const) {
  test(`a transient duplicate inserted through ${name} reaches a maximum of two`, async () => {
    const fixture = createFixture();
    const articleUrl = absolute(ARTICLE_PATHS[0]);
    replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
      ...response,
      body: response.body.replace(
        "button.replaceWith(iframe);iframe.focus()",
        `button.replaceWith(iframe);${mutation}iframe.focus()`,
      ),
    }));
    fixture.auditKinds = ["media"];
    let report: VerificationReport | undefined;
    try {
      report = await runControlled(fixture);
      const article = report.media.find(({ url }) => url === articleUrl);
      assert.ok(article);
      assert.ok(
        report.findings.some(
          ({ code, url }) => code === "MEDIA_ACTIVATION" && url === articleUrl,
        ),
        JSON.stringify({ findings: report.findings, article }),
      );
      assert.equal(article.pointer.iframeCount, 1);
      assert.equal(article.pointer.maxIframeCount, 2);
      assert.equal(article.status, "FAIL");
      assert.equal(report.automatedGates.media, "FAIL");
    } finally {
      await cleanupReport(report);
    }
  });
}

test("replaceChildren with a one-iframe document fragment keeps the maximum at one", async () => {
  const fixture = createFixture();
  const articleUrl = absolute(ARTICLE_PATHS[0]);
  replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
    ...response,
    body: response.body.replace(
      "button.replaceWith(iframe);iframe.focus()",
      "const fragment=document.createDocumentFragment();fragment.append(iframe);region.replaceChildren(fragment);iframe.focus()",
    ),
  }));
  fixture.auditKinds = ["media"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    const article = report.media.find(({ url }) => url === articleUrl);
    assert.ok(article);
    assert.equal(article.pointer.maxIframeCount, 1);
    assert.equal(article.keyboard.maxIframeCount, 1);
    assert.equal(article.fallback.maxIframeCount, 1);
    assert.equal(article.status, "PASS");
    assert.equal(report.automatedGates.media, "PASS");
  } finally {
    await cleanupReport(report);
  }
});

for (const [name, auditLabel, resultKey, findingCode] of [
  ["pointer", "media pointer pass", "pointer", "MEDIA_ACTIVATION"],
  ["Enter", "media keyboard pass", "keyboard", "MEDIA_ACTIVATION"],
  ["fallback", "media fallback pass", "fallback", "MEDIA_FALLBACK"],
] as const) {
  test(`${name} media duplicates scheduled beyond 50 ms fail the article and media gate`, async () => {
    const fixture = createFixture();
    const articleUrl = absolute(ARTICLE_PATHS[0]);
    const articleResponse = fixture.responses.get(articleUrl);
    assert.ok(articleResponse);
    const expectedSrc = `https://www.youtube-nocookie.com/embed/${VIDEO_IDS[0]}?hl=ar`;
    const duplicateAfterOldSnapshot = `<script>document.querySelector('[data-video-activate]').addEventListener('click',()=>setTimeout(()=>{const region=document.querySelector('[data-video-region]');const duplicate=document.createElement('iframe');duplicate.src=${JSON.stringify(expectedSrc)};region.append(duplicate);setTimeout(()=>duplicate.remove(),20)},100))</script>`;
    const mutatedResponse = {
      ...articleResponse,
      body: articleResponse.body.replace(
        "</body>",
        `${duplicateAfterOldSnapshot}</body>`,
      ),
    };
    fixture.beforeAuditPageSetup = async (label) => {
      if (label === auditLabel)
        fixture.browserOverrides.set(articleUrl, mutatedResponse);
      else fixture.browserOverrides.delete(articleUrl);
    };
    fixture.auditKinds = ["media"];
    let report: VerificationReport | undefined;
    try {
      report = await runControlled(fixture);
      const article = report.media.find(({ url }) => url === articleUrl);
      assert.ok(article);
      assert.ok(
        report.findings.some(
          ({ code, url }) => code === findingCode && url === articleUrl,
        ),
        JSON.stringify(report.findings),
      );
      const observation = article[resultKey];
      assert.equal(observation.iframeCount, 1);
      assert.equal(observation.maxIframeCount, 2);
      assert.deepEqual(observation.mediaRequests, [expectedSrc, expectedSrc]);
      assert.equal(article.status, "FAIL");
      assert.equal(report.automatedGates.media, "FAIL");
    } finally {
      await cleanupReport(report);
    }
  });
}

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

test("presentation detects visible form and accessibility value leakage", async () => {
  const fixture = createFixture();
  replaceResponse(fixture, "/", (response) => ({
    ...response,
    body: response.body.replace(
      "</main>",
      '<label>بحث<input aria-label="بحث" aria-description="ControlHelp" value="EnglishValue" placeholder="SettingsNow"></label><label>اختيار<select aria-label="اختيار"><option selected>SelectedNow</option></select></label></main>',
    ),
  }));
  fixture.auditKinds = ["presentation"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    const homepage = report.presentation.find(
      ({ url }) => url === absolute("/"),
    );
    assert.ok(homepage);
    for (const leak of [
      "EnglishValue",
      "SettingsNow",
      "SelectedNow",
      "ControlHelp",
    ])
      assert.ok(homepage.latinLeaks.includes(leak), JSON.stringify(homepage));
    assert.equal(homepage.status, "FAIL");
    assert.ok(
      report.findings.some(({ code }) => code === "PRESENTATION_LATIN"),
    );
    assert.equal(report.automatedGates.presentation, "FAIL");
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
    name: "eleven-character visible Latin leakage",
    code: "PRESENTATION_LATIN",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace("</main>", "<p>EnglishText</p></main>"),
      })),
  },
  {
    name: "eleven-character accessibility tree Latin leakage",
    code: "PRESENTATION_LATIN",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace(
          "<main>",
          '<main aria-label="SettingsNow">',
        ),
      })),
  },
  {
    name: "URL-prefixed visible English leakage",
    code: "PRESENTATION_LATIN",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace(
          "</main>",
          "<p>https://example.com/ English settings</p></main>",
        ),
      })),
  },
  {
    name: "URL-prefixed accessible English leakage",
    code: "PRESENTATION_LATIN",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        body: response.body.replace(
          "<main>",
          '<main aria-label="https://example.com/ English settings">',
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

test("media hostname spoofing is blocked without intentional-media classification", async () => {
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
    assert.equal(
      report.findings.some(({ code }) => code === "MEDIA_PRE_INTENT"),
      false,
    );
    assert.ok(
      report.findings.some(({ code }) => code === "BROWSER_ORIGIN_ESCAPE"),
    );
    assert.equal(
      fixture.browserRequests.some((url) =>
        url.includes("youtube.evil.invalid"),
      ),
      false,
    );
    assert.equal(report.automatedGates.media, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

for (const [name, requestUrl] of [
  [
    "wrong-video Google media",
    "https://i.ytimg.com/vi/WRONG_VIDEO_ID/default.jpg",
  ],
  ["unrelated Google API", "https://fonts.googleapis.com/css2?family=Roboto"],
] as const) {
  test(`${name} after activation fails media without transport contact`, async () => {
    const fixture = createFixture();
    replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
      ...response,
      body: response.body.replace(
        "</body>",
        `<script>document.querySelector('[data-video-activate]').addEventListener('click',()=>fetch(${JSON.stringify(requestUrl)}))</script></body>`,
      ),
    }));
    fixture.auditKinds = ["media"];
    let report: VerificationReport | undefined;
    try {
      report = await runControlled(fixture);
      const parsedRequest = new URL(requestUrl);
      assert.ok(
        report.findings.some(
          ({ code, detail }) =>
            code === "BROWSER_ORIGIN_ESCAPE" &&
            detail.includes(`${parsedRequest.origin}${parsedRequest.pathname}`),
        ),
        JSON.stringify(report.findings),
      );
      assert.equal(
        fixture.browserRequests.some((url) => url === requestUrl),
        false,
      );
      assert.equal(
        report.media.find(({ url }) => url === absolute(ARTICLE_PATHS[0]))
          ?.status,
        "FAIL",
      );
      assert.equal(report.automatedGates.media, "FAIL");
    } finally {
      await cleanupReport(report);
    }
  });
}

test("the exact Plausible loader is statically validated and contained without third-party contact", async () => {
  const fixture = createFixture();
  fixture.auditKinds = ["presentation"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    assert.equal(
      report.findings.some(
        ({ code }) =>
          code === "PLAUSIBLE_LOADER" || code === "BROWSER_ORIGIN_ESCAPE",
      ),
      false,
      JSON.stringify(report.findings),
    );
    assert.equal(
      fixture.browserRequests.some(
        (url) => new URL(url).origin === "https://plausible.io",
      ),
      false,
    );
    assert.equal(report.plausibleLoader, CONTROLLED_PLAUSIBLE_SCRIPT_SRC);
    assert.equal(report.automatedGates.presentation, "PASS");
  } finally {
    await cleanupReport(report);
  }
});

test("a manual Plausible event POST is blocked, reported, and fails its presentation gate", async () => {
  const fixture = createFixture();
  const homepage = fixture.responses.get(absolute("/"));
  assert.ok(homepage);
  fixture.browserOverrides.set(absolute("/"), {
    ...homepage,
    body: homepage.body.replace(
      "</body>",
      `<script>fetch(${JSON.stringify(PLAUSIBLE_EVENT_ENDPOINT)},{method:"POST",body:"{}"}).catch(()=>{})</script></body>`,
    ),
  });
  fixture.auditKinds = ["presentation"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    assert.ok(
      report.findings.some(
        ({ code, detail, url }) =>
          code === "BROWSER_ORIGIN_ESCAPE" &&
          detail.includes(PLAUSIBLE_EVENT_ENDPOINT) &&
          url === absolute("/"),
      ),
      JSON.stringify(report.findings),
    );
    assert.equal(
      fixture.browserRequests.includes(PLAUSIBLE_EVENT_ENDPOINT),
      false,
    );
    assert.equal(report.automatedGates.presentation, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

for (const [name, attributes] of [
  ["an inert type", 'defer type="application/json"'],
  ["nomodule", "defer nomodule"],
  ["async plus defer", "async defer"],
  ["integrity metadata", 'defer integrity="sha256-invalid"'],
] as const) {
  test(`a Plausible loader with ${name} fails the executable analytics contract`, async () => {
    const fixture = createFixture();
    replaceResponse(fixture, "/", (response) => ({
      ...response,
      body: response.body.replace(
        `<script defer src="${CONTROLLED_PLAUSIBLE_SCRIPT_SRC}"></script>`,
        `<script ${attributes} src="${CONTROLLED_PLAUSIBLE_SCRIPT_SRC}"></script>`,
      ),
    }));
    fixture.auditKinds = [];
    let report: VerificationReport | undefined;
    try {
      report = await runControlled(fixture);
      expectFinding(report, "PLAUSIBLE_LOADER");
      assert.equal(report.plausibleLoader, null);
    } finally {
      await cleanupReport(report);
    }
  });
}

for (const [name, delayMs] of [
  ["immediate", 0],
  ["delayed", 150],
] as const) {
  test(`${name} dynamic duplicate Plausible loaders fail presentation without third-party contact`, async () => {
    const fixture = createFixture();
    const homepage = fixture.responses.get(absolute("/"));
    assert.ok(homepage);
    const appendDuplicate = `const loader=document.createElement("script");loader.defer=true;loader.src=${JSON.stringify(CONTROLLED_PLAUSIBLE_SCRIPT_SRC)};document.head.append(loader)`;
    fixture.browserOverrides.set(absolute("/"), {
      ...homepage,
      body: homepage.body.replace(
        "</body>",
        `<script>${delayMs === 0 ? `addEventListener("load",()=>{${appendDuplicate}},{once:true})` : `setTimeout(()=>{${appendDuplicate}},${delayMs})`}</script></body>`,
      ),
    });
    fixture.auditKinds = ["presentation"];
    let report: VerificationReport | undefined;
    try {
      report = await runControlled(fixture);
      assert.ok(
        report.findings.some(
          ({ code, url }) =>
            code === "PLAUSIBLE_LOADER_REQUEST" && url === absolute("/"),
        ),
        JSON.stringify(report.findings),
      );
      assert.equal(
        fixture.browserRequests.some(
          (url) => new URL(url).origin === "https://plausible.io",
        ),
        false,
      );
      assert.equal(
        report.presentation.find(({ url }) => url === absolute("/"))?.status,
        "FAIL",
      );
      assert.equal(report.automatedGates.presentation, "FAIL");
    } finally {
      await cleanupReport(report);
    }
  });
}

test("mixed exact Plausible loader tokens across routes fail the common-loader contract", async () => {
  const fixture = createFixture();
  const alternateLoader =
    "https://plausible.io/js/pa-OTHER_TEST_FIXTURE_DO_NOT_DEPLOY.js";
  replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
    ...response,
    body: response.body.replace(
      CONTROLLED_PLAUSIBLE_SCRIPT_SRC,
      alternateLoader,
    ),
  }));
  fixture.auditKinds = [];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    expectFinding(report, "PLAUSIBLE_LOADER");
    assert.equal(report.plausibleLoader, null);
  } finally {
    await cleanupReport(report);
  }
});

test("an unrelated off-origin script fails without reaching the controlled transport", async () => {
  const fixture = createFixture();
  replaceResponse(fixture, "/", (response) => ({
    ...response,
    body: response.body.replace(
      "</head>",
      '<script src="https://scripts.evil.invalid/unrelated.js"></script></head>',
    ),
  }));
  fixture.auditKinds = ["presentation"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    assert.ok(
      report.findings.some(
        ({ code, detail }) =>
          code === "BROWSER_ORIGIN_ESCAPE" &&
          detail.includes("scripts.evil.invalid"),
      ),
      JSON.stringify(report.findings),
    );
    assert.equal(
      fixture.browserRequests.some((url) =>
        url.includes("scripts.evil.invalid"),
      ),
      false,
    );
    assert.equal(report.automatedGates.presentation, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

test("a non-exact Plausible loader fails the static analytics contract", async () => {
  const fixture = createFixture();
  replaceResponse(fixture, "/", (response) => ({
    ...response,
    body: response.body.replace(
      CONTROLLED_PLAUSIBLE_SCRIPT_SRC,
      "https://plausible.io/js/script.js",
    ),
  }));
  fixture.auditKinds = [];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    expectFinding(report, "PLAUSIBLE_LOADER");
    assert.equal(report.automatedGates.crawl, "FAIL");
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
  fixture.resolveHostname = async () => [{ address: "192.168.1.1", family: 4 }];
  const before = existsSync(ARTIFACT_ROOT) ? await readdir(ARTIFACT_ROOT) : [];
  await assert.rejects(() => runControlled(fixture));
  assert.deepEqual(fixture.requests, []);
  assert.equal(fixture.browserRouteInstalled, false);
  const after = existsSync(ARTIFACT_ROOT) ? await readdir(ARTIFACT_ROOT) : [];
  assert.deepEqual(after, before);
});

test("Chromium uses the pinned destination directly even when a proxy is configured", async () => {
  let proxyContacts = 0;
  const destination = createServer((_request, response) => response.end("ok"));
  const proxy = createServer((_request, response) => {
    proxyContacts += 1;
    response.statusCode = 502;
    response.end("proxy must not be used");
  });
  const destinationPort = await listen(destination);
  const proxyPort = await listen(proxy);
  const { chromiumLaunchArgs } = await loadRunner();
  const browser = await chromium.launch({
    headless: true,
    args: [
      `--proxy-server=http://127.0.0.1:${proxyPort}`,
      ...chromiumLaunchArgs({
        hostname: "direct.test",
        addresses: [{ address: "127.0.0.1", family: 4 }],
      }),
    ],
  });
  try {
    const page = await browser.newPage();
    const response = await page.goto(`http://direct.test:${destinationPort}/`, {
      waitUntil: "load",
    });
    assert.equal(response?.status(), 200);
    assert.equal(proxyContacts, 0);
  } finally {
    await browser.close();
    await closeServer(proxy);
    await closeServer(destination);
  }
});

test("off-origin WebSockets are blocked before a local handshake", async () => {
  let handshakes = 0;
  const destination = createServer();
  destination.on("upgrade", (_request, socket) => {
    handshakes += 1;
    socket.destroy();
  });
  const destinationPort = await listen(destination);
  const fixture = createFixture();
  const homepage = fixture.responses.get(absolute("/"));
  assert.ok(homepage);
  fixture.browserOverrides.set(absolute("/"), {
    ...homepage,
    body: homepage.body.replace(
      "</main>",
      `<script>new WebSocket("ws://127.0.0.1:${destinationPort}/private")</script></main>`,
    ),
  });
  fixture.auditKinds = ["presentation"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    assert.ok(
      report.findings.some(
        ({ code, detail }) =>
          code === "BROWSER_ORIGIN_ESCAPE" && detail.includes("WebSocket"),
      ),
      JSON.stringify(report.findings),
    );
    assert.equal(handshakes, 0);
    assert.equal(report.automatedGates.presentation, "FAIL");
  } finally {
    await cleanupReport(report);
    await closeServer(destination);
  }
});

for (const [kind, path] of [
  ["performance", "/"],
  ["media", ARTICLE_PATHS[0]],
] as const) {
  test(`a delayed off-origin fetch fails the named ${kind} result without contact`, async () => {
    let contacts = 0;
    const destination = createServer((_request, response) => {
      contacts += 1;
      response.end("must not be contacted");
    });
    const port = await listen(destination);
    const fixture = createFixture();
    replaceResponse(fixture, path, (response) => ({
      ...response,
      body: response.body.replace(
        "</body>",
        `<script>setTimeout(()=>fetch("http://127.0.0.1:${port}/delayed"),${kind === "performance" ? 50 : 20})</script></body>`,
      ),
    }));
    fixture.auditKinds = [kind];
    if (kind === "performance") fixture.readerIdleMs = 200;
    let report: VerificationReport | undefined;
    try {
      report = await runControlled(fixture);
      assert.equal(contacts, 0);
      assert.ok(
        report.findings.some(
          ({ code, detail }) =>
            code === "BROWSER_ORIGIN_ESCAPE" && detail.includes("/delayed"),
        ),
        JSON.stringify(report.findings),
      );
      const result =
        kind === "performance"
          ? report.performance.find(({ url }) => url === absolute(path))
          : report.media.find(({ url }) => url === absolute(path));
      assert.equal(result?.status, "FAIL");
      assert.equal(report.automatedGates[kind], "FAIL");
    } finally {
      await cleanupReport(report);
      await closeServer(destination);
    }
  });
}

test("a delayed WebSocket fails presentation without a local handshake", async () => {
  let handshakes = 0;
  const destination = createServer();
  destination.on("upgrade", (_request, socket) => {
    handshakes += 1;
    socket.destroy();
  });
  const port = await listen(destination);
  const fixture = createFixture();
  replaceResponse(fixture, "/", (response) => ({
    ...response,
    body: response.body.replace(
      "</body>",
      `<script>setTimeout(()=>new WebSocket("ws://127.0.0.1:${port}/delayed"),100)</script></body>`,
    ),
  }));
  fixture.auditKinds = ["presentation"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    assert.equal(handshakes, 0);
    assert.ok(
      report.findings.some(
        ({ code, detail }) =>
          code === "BROWSER_ORIGIN_ESCAPE" &&
          detail.includes("WebSocket") &&
          detail.includes("/delayed"),
      ),
      JSON.stringify(report.findings),
    );
    assert.equal(
      report.presentation.find(({ url }) => url === absolute("/"))?.status,
      "FAIL",
    );
    assert.equal(report.automatedGates.presentation, "FAIL");
  } finally {
    await cleanupReport(report);
    await closeServer(destination);
  }
});

test("WebRTC is disabled before page code can send a local UDP packet", async () => {
  const udp = createSocket("udp4");
  let packets = 0;
  udp.on("message", () => (packets += 1));
  await new Promise<void>((resolveBind) =>
    udp.bind(0, "127.0.0.1", resolveBind),
  );
  const address = udp.address();
  assert.equal(typeof address, "object");

  const fixture = createFixture();
  const homepage = fixture.responses.get(absolute("/"));
  assert.ok(homepage);
  fixture.browserOverrides.set(absolute("/"), {
    ...homepage,
    body: homepage.body.replace(
      "</main>",
      `<script>const peer=new RTCPeerConnection({iceServers:[{urls:"stun:127.0.0.1:${address.port}"}]});peer.createDataChannel("probe");peer.createOffer().then((offer)=>peer.setLocalDescription(offer))</script></main>`,
    ),
  });
  fixture.auditKinds = ["presentation"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    await new Promise((resolveWait) => setTimeout(resolveWait, 200));
    assert.equal(packets, 0);
    assert.equal(report.automatedGates.presentation, "PASS");
  } finally {
    await cleanupReport(report);
    udp.close();
  }
});

test("pinned HTTPS rejects an untrusted certificate even when Node TLS rejection is disabled", async () => {
  let successfulRequests = 0;
  const endpoint = createHttpsServer(
    { key: UNTRUSTED_TLS_KEY, cert: UNTRUSTED_TLS_CERT },
    (_request, response) => {
      successfulRequests += 1;
      response.end("unsafe response");
    },
  );
  const port = await listen(endpoint);
  const runnerUrl = pathToFileURL(
    resolve("scripts/verify-production.mjs"),
  ).href;
  const origin = `https://localhost:${port}`;
  try {
    const child = await runTlsDisabledChild(`
      const { createPinnedFetch } = await import(${JSON.stringify(runnerUrl)});
      const fetchPinned = createPinnedFetch({
        origin: ${JSON.stringify(origin)},
        hostname: "localhost",
        addresses: [{ address: "127.0.0.1", family: 4 }],
      });
      try {
        await fetchPinned(${JSON.stringify(`${origin}/`)}, {
          signal: AbortSignal.timeout(2_000),
        });
        console.error("untrusted response accepted");
        process.exitCode = 1;
      } catch {
        console.log("untrusted response rejected");
      }
    `);
    assert.equal(child.code, 0, child.stderr);
    assert.match(child.stdout, /untrusted response rejected/u);
    assert.equal(successfulRequests, 0);
  } finally {
    await closeServer(endpoint);
  }
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
      report.media.find(({ url }) => url === absolute(missingMediaPath))
        ?.status,
      "FAIL",
    );
    assert.equal(report.automatedGates.media, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

for (const [name, invalidId] of [
  ["empty", ""],
  ["short", "short"],
  ["invalid-character", "bad$id*here!"],
] as const) {
  test(`${name} YouTube identity fails both crawl and media gates`, async () => {
    const fixture = createFixture();
    replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
      ...response,
      body: response.body.replaceAll(VIDEO_IDS[0], invalidId),
    }));
    fixture.auditKinds = ["media"];
    let report: VerificationReport | undefined;
    try {
      report = await runControlled(fixture);
      expectFinding(report, "YOUTUBE_IDENTITY");
      assert.ok(report.findings.some(({ code }) => code === "MEDIA_IDENTITY"));
      assert.equal(
        report.media.find(({ url }) => url === absolute(ARTICLE_PATHS[0]))
          ?.status,
        "FAIL",
      );
      assert.equal(report.automatedGates.crawl, "FAIL");
      assert.equal(report.automatedGates.media, "FAIL");
    } finally {
      await cleanupReport(report);
    }
  });
}

test("stalled DNS resolution is aborted before browser, fetch, route, or artifact I/O", async () => {
  const fixture = createFixture();
  fixture.dnsResolutionTimeoutMs = 25;
  let aborted = false;
  fixture.resolveHostname = async (_hostname, { signal }) =>
    new Promise((_resolve, reject) => {
      signal.addEventListener(
        "abort",
        () => {
          aborted = true;
          reject(new Error("resolver aborted"));
        },
        { once: true },
      );
    });
  const before = existsSync(ARTIFACT_ROOT) ? await readdir(ARTIFACT_ROOT) : [];
  const started = Date.now();
  await assert.rejects(
    () => runControlled(fixture),
    /SITE_ORIGIN DNS resolution timed out/u,
  );
  assert.ok(Date.now() - started < 1_000);
  assert.equal(aborted, true);
  assert.deepEqual(fixture.requests, []);
  assert.equal(fixture.browserRouteInstalled, false);
  const after = existsSync(ARTIFACT_ROOT) ? await readdir(ARTIFACT_ROOT) : [];
  assert.deepEqual(after, before);
});

for (const [name, markup] of [
  [
    "image",
    '<img src="https://127.0.0.1:4443/private-image" alt="صورة تجريبية">',
  ],
  [
    "fetch",
    '<script>fetch("https://127.0.0.1:4443/private-fetch").catch(()=>{})</script>',
  ],
  [
    "child iframe",
    '<iframe src="https://127.0.0.1:4443/private-frame" title="إطار تجريبي"></iframe>',
  ],
] as const) {
  test(`off-origin ${name} requests are blocked before destination contact`, async () => {
    const fixture = createFixture();
    const homepage = fixture.responses.get(absolute("/"));
    assert.ok(homepage);
    fixture.browserOverrides.set(absolute("/"), {
      ...homepage,
      body: homepage.body.replace("</main>", `${markup}</main>`),
    });
    fixture.auditKinds = ["presentation"];
    let report: VerificationReport | undefined;
    try {
      report = await runControlled(fixture);
      assert.ok(
        report.findings.some(({ code }) => code === "BROWSER_ORIGIN_ESCAPE"),
        JSON.stringify(report.findings),
      );
      assert.equal(
        fixture.browserRequests.some((url) =>
          url.startsWith("https://127.0.0.1:4443/"),
        ),
        false,
      );
      assert.equal(report.automatedGates.presentation, "FAIL");
    } finally {
      await cleanupReport(report);
    }
  });
}

test("an unavailable sitemap article fails both crawl and media coverage", async () => {
  const fixture = createFixture();
  replaceResponse(fixture, ARTICLE_PATHS[0], (response) => ({
    ...response,
    status: 503,
  }));
  fixture.auditKinds = ["media"];
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    expectFinding(report, "HTTP_STATUS");
    assert.ok(report.findings.some(({ code }) => code === "MEDIA_IDENTITY"));
    assert.equal(report.media.length, ARTICLE_PATHS.length);
    assert.equal(
      report.media.find(({ url }) => url === absolute(ARTICLE_PATHS[0]))
        ?.status,
      "FAIL",
    );
    assert.equal(report.plausibleLoader, null);
    assert.equal(report.automatedGates.media, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

test("stalled font readiness returns a failed performance report within its bound", async () => {
  const fixture = createFixture();
  const homepage = fixture.responses.get(absolute("/"));
  assert.ok(homepage);
  fixture.browserOverrides.set(absolute("/"), {
    ...homepage,
    body: homepage.body.replace(
      "</body>",
      "<script>Object.defineProperty(document.fonts,'ready',{value:new Promise(()=>{})})</script></body>",
    ),
  });
  fixture.auditKinds = ["performance"];
  fixture.fontReadyTimeoutMs = 50;
  const started = Date.now();
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    assert.ok(Date.now() - started < 8_000);
    assert.ok(
      report.findings.some(
        ({ code, detail }) =>
          code === "PERFORMANCE_NAVIGATION" &&
          detail.includes("font readiness timed out"),
      ),
    );
    assert.equal(report.automatedGates.performance, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

test("a non-terminating rendered page task returns a failed report within the audit deadline", async () => {
  const fixture = createFixture();
  const homepage = fixture.responses.get(absolute("/"));
  assert.ok(homepage);
  fixture.browserOverrides.set(absolute("/"), {
    ...homepage,
    body: homepage.body.replace(
      "</body>",
      "<script>addEventListener('load',()=>{document.querySelectorAll=()=>{for(;;){}}})</script></body>",
    ),
  });
  fixture.auditKinds = ["presentation"];
  fixture.renderedAuditTimeoutMs = 100;
  const started = Date.now();
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    assert.ok(Date.now() - started < 8_000);
    assert.ok(
      report.findings.some(
        ({ code, detail, url }) =>
          code === "PRESENTATION_NAVIGATION" &&
          url === absolute("/") &&
          detail.includes("presentation page audit timed out after 100 ms"),
      ),
      JSON.stringify({ findings: report.findings, errors: report.errors }),
    );
    assert.equal(
      report.presentation.find(({ url }) => url === absolute("/"))?.status,
      "FAIL",
    );
    assert.equal(report.errors.length, 0);
    assert.equal(report.automatedGates.presentation, "FAIL");
    assert.equal(existsSync(report.artifactPath), true);
  } finally {
    await cleanupReport(report);
  }
});

test("a non-terminating performance task fails its run within the audit deadline", async () => {
  const fixture = createFixture();
  const homepage = fixture.responses.get(absolute("/"));
  assert.ok(homepage);
  fixture.browserOverrides.set(absolute("/"), {
    ...homepage,
    body: homepage.body.replace(
      "</body>",
      "<script>addEventListener('load',()=>{Object.defineProperty(globalThis,'__phase6Vitals',{get(){for(;;){}}})})</script></body>",
    ),
  });
  fixture.performanceSamples.delete(absolute("/"));
  fixture.auditKinds = ["performance"];
  fixture.performanceAuditTimeoutMs = 100;
  const started = Date.now();
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    assert.ok(Date.now() - started < 8_000);
    assert.ok(
      report.findings.some(
        ({ code, detail, url }) =>
          code === "PERFORMANCE_NAVIGATION" &&
          url === absolute("/") &&
          detail.includes("performance run") &&
          detail.includes("timed out after 100 ms"),
      ),
      JSON.stringify({ findings: report.findings, errors: report.errors }),
    );
    assert.equal(
      report.performance.find(({ url }) => url === absolute("/"))?.status,
      "FAIL",
    );
    assert.equal(report.automatedGates.performance, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

test("a non-terminating media task fails its article within the audit deadline", async () => {
  const fixture = createFixture();
  const articleUrl = absolute(ARTICLE_PATHS[0]);
  const article = fixture.responses.get(articleUrl);
  assert.ok(article);
  fixture.browserOverrides.set(articleUrl, {
    ...article,
    body: article.body.replace(
      "</body>",
      "<script>addEventListener('load',()=>{document.querySelectorAll=()=>{for(;;){}}})</script></body>",
    ),
  });
  fixture.auditKinds = ["media"];
  fixture.renderedAuditTimeoutMs = 100;
  const started = Date.now();
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    assert.ok(Date.now() - started < 8_000);
    assert.ok(
      report.findings.some(
        ({ code, detail, url }) =>
          code === "MEDIA_NAVIGATION" &&
          url === articleUrl &&
          detail.includes("timed out after 100 ms"),
      ),
      JSON.stringify({ findings: report.findings, errors: report.errors }),
    );
    assert.equal(
      report.media.find(({ url }) => url === articleUrl)?.status,
      "FAIL",
    );
    assert.equal(report.errors.length, 0);
    assert.equal(report.automatedGates.media, "FAIL");
  } finally {
    await cleanupReport(report);
  }
});

for (const stage of ["setup", "cleanup"] as const) {
  test(`stalled audit ${stage} returns a failed media result within the hard deadline`, async () => {
    const fixture = createFixture();
    fixture.auditKinds = ["media"];
    fixture.renderedAuditTimeoutMs = 100;
    let stalled = false;
    const stallOnce = async (label: string) => {
      if (stalled || label !== "media pre-intent pass") return;
      stalled = true;
      await new Promise(() => {});
    };
    if (stage === "setup") fixture.beforeAuditPageSetup = stallOnce;
    else fixture.beforeAuditPageClose = stallOnce;
    const started = Date.now();
    let report: VerificationReport | undefined;
    try {
      report = await runControlled(fixture);
      assert.ok(Date.now() - started < 8_000);
      assert.ok(
        report.findings.some(
          ({ code, detail, url }) =>
            code === "MEDIA_NAVIGATION" &&
            url === absolute(ARTICLE_PATHS[0]) &&
            detail.includes("media pre-intent pass timed out after 100 ms"),
        ),
        JSON.stringify({ findings: report.findings, errors: report.errors }),
      );
      assert.equal(
        report.media.find(({ url }) => url === absolute(ARTICLE_PATHS[0]))
          ?.status,
        "FAIL",
      );
      assert.equal(report.automatedGates.media, "FAIL");
    } finally {
      await cleanupReport(report);
    }
  });
}

test("stalled final browser close returns a failed runner report within its deadline", async () => {
  const fixture = createFixture();
  fixture.auditKinds = [];
  fixture.browserCloseTimeoutMs = 100;
  fixture.beforeBrowserClose = async () => new Promise<void>(() => {});
  const started = Date.now();
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    assert.ok(Date.now() - started < 8_000);
    assert.ok(
      report.errors.some((detail) =>
        detail.includes("browser close timed out after 100 ms"),
      ),
      JSON.stringify(report.errors),
    );
    assert.equal(report.automatedGates.runner, "FAIL");
    assert.equal(report.automatedGates.crawl, "FAIL");
    assert.equal(existsSync(report.artifactPath), true);
  } finally {
    await cleanupReport(report);
  }
});

for (const [name, path, emptyBody, code] of [
  [
    "empty sitemap index",
    "/sitemap-index.xml",
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>',
    "SITEMAP_CHILDREN",
  ],
  [
    "empty child urlset",
    "/sitemap-0.xml",
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
    "SITEMAP_URLS",
  ],
] as const) {
  test(`${name} cannot report a passing crawl gate`, async () => {
    const fixture = createFixture();
    fixture.auditKinds = [];
    replaceResponse(fixture, path, (response) => ({
      ...response,
      body: emptyBody,
    }));
    let report: VerificationReport | undefined;
    try {
      report = await runControlled(fixture);
      expectFinding(report, code);
      assert.equal(report.automatedGates.crawl, "FAIL");
    } finally {
      await cleanupReport(report);
    }
  });
}

const failureCases: readonly {
  name: string;
  code: string;
  mutate(fixture: ControlledFixture): void;
  assertPlausibleLoaderNull?: boolean;
}[] = [
  {
    name: "substring-only discovery content type",
    code: "CONTENT_TYPE",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-index.xml", (response) => ({
        ...response,
        contentType: "application/notxml",
      })),
  },
  {
    name: "substring-only HTML content type",
    code: "CONTENT_TYPE",
    mutate: (fixture) =>
      replaceResponse(fixture, "/", (response) => ({
        ...response,
        contentType: "text/html-malformed",
      })),
  },
  {
    name: "Googlebot-specific disallow rule",
    code: "ROBOTS_SITEMAP",
    mutate: (fixture) =>
      replaceResponse(fixture, "/robots.txt", (response) => ({
        ...response,
        body: `${response.body}\nUser-agent: Googlebot\nDisallow: /\n`,
      })),
  },
  {
    name: "Bingbot-specific disallow rule",
    code: "ROBOTS_SITEMAP",
    mutate: (fixture) =>
      replaceResponse(fixture, "/robots.txt", (response) => ({
        ...response,
        body: `${response.body}\nUser-agent: Bingbot\nDisallow: /\n`,
      })),
  },
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
    name: "unavailable child sitemap",
    code: "HTTP_STATUS",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-0.xml", (response) => ({
        ...response,
        status: 503,
      })),
    assertPlausibleLoaderNull: true,
  },
  {
    name: "malformed sitemap XML",
    code: "XML_MALFORMED",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-0.xml", (response) => ({
        ...response,
        body: "<urlset><url><loc>broken",
      })),
    assertPlausibleLoaderNull: true,
  },
  {
    name: "direct sitemap-index location outside an entry",
    code: "XML_MALFORMED",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-index.xml", (response) => ({
        ...response,
        body: response.body.replace(
          /<sitemap><loc>([^<]+)<\/loc><\/sitemap>/u,
          "<loc>$1</loc>",
        ),
      })),
  },
  {
    name: "direct sitemap location outside an entry",
    code: "XML_MALFORMED",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-0.xml", (response) => ({
        ...response,
        body: response.body.replace(
          /<url><loc>([^<]+)<\/loc><\/url>/u,
          "<loc>$1</loc>",
        ),
      })),
  },
  {
    name: "duplicate locations inside one sitemap entry",
    code: "XML_MALFORMED",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-0.xml", (response) => ({
        ...response,
        body: response.body.replace(
          /<url><loc>([^<]+)<\/loc><\/url>/u,
          "<url><loc>$1</loc><loc>$1</loc></url>",
        ),
      })),
  },
  {
    name: "unexpected sitemap entry wrapper",
    code: "XML_MALFORMED",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-0.xml", (response) => ({
        ...response,
        body: response.body.replace(
          /<url><loc>([^<]+)<\/loc><\/url>/u,
          "<wrapper><url><loc>$1</loc></url></wrapper>",
        ),
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
    assertPlausibleLoaderNull: true,
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
    name: "404 role in sitemap",
    code: "NOT_FOUND_CONTRACT",
    mutate: (fixture) =>
      replaceResponse(fixture, "/sitemap-0.xml", (response) => ({
        ...response,
        body: response.body.replace(
          "</urlset>",
          `<url><loc>${absolute(MISSING_PATH)}</loc></url></urlset>`,
        ),
      })),
    assertPlausibleLoaderNull: true,
  },
  {
    name: "incorrect 404",
    code: "NOT_FOUND_CONTRACT",
    mutate: (fixture) =>
      replaceResponse(fixture, MISSING_PATH, (response) => ({
        ...response,
        status: 200,
      })),
    assertPlausibleLoaderNull: true,
  },
  {
    name: "missing 404",
    code: "NOT_FOUND_CONTRACT",
    mutate: (fixture) => {
      fixture.responses.delete(absolute(MISSING_PATH));
    },
    assertPlausibleLoaderNull: true,
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
      if (scenario.assertPlausibleLoaderNull)
        assert.equal(report.plausibleLoader, null);
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

test("report serialization removes URL credentials and sensitive values everywhere", async () => {
  const fixture = createFixture();
  const credentialUser = "report-user";
  const credentialPassword = "report-password";
  const queryNameSecret = "query-name-secret";
  const querySecret = "query-secret";
  const requestSecret = "request-secret";
  const socketSecret = "socket-secret";
  const errorSecret = "error-secret";
  const fragmentSecret = "fragment-secret";
  const externalUrl = `https://${credentialUser}:${credentialPassword}@outside-fixture.dev/private?${queryNameSecret}=${querySecret}#${fragmentSecret}`;
  const requestUrl = `https://outside-fixture.dev/api?api_key=${requestSecret}`;
  const socketUrl = `wss://outside-fixture.dev/socket?session=${socketSecret}`;
  replaceResponse(fixture, "/", (response) => ({
    ...response,
    body: response.body.replace(
      "</body>",
      `<a href="${externalUrl}">رابط خارجي</a><script>fetch(${JSON.stringify(requestUrl)}).catch(()=>{});new WebSocket(${JSON.stringify(socketUrl)})</script></body>`,
    ),
  }));
  fixture.auditKinds = ["presentation"];
  const installBrowserRoutes = fixture.installBrowserRoutes;
  let closeBrowser: (() => Promise<void>) | undefined;
  fixture.installBrowserRoutes = async (page) => {
    await installBrowserRoutes(page);
    closeBrowser = async () => {
      await page.context().browser()?.close();
    };
  };
  fixture.beforeBrowserClose = async () => {
    await closeBrowser?.();
    throw new Error(
      `cleanup failed at https://outside-fixture.dev/cleanup?token=${errorSecret}`,
    );
  };
  let report: VerificationReport | undefined;
  try {
    report = await runControlled(fixture);
    const serialized = JSON.stringify(report);
    const artifact = readFileSync(report.artifactPath, "utf8");
    for (const secret of [
      credentialUser,
      credentialPassword,
      queryNameSecret,
      querySecret,
      requestSecret,
      socketSecret,
      errorSecret,
      fragmentSecret,
    ]) {
      assert.equal(serialized.includes(secret), false, secret);
      assert.equal(artifact.includes(secret), false, secret);
    }
    const safeExternal = report.routeGraph.externalLinks.find((url) =>
      url.includes("outside-fixture.dev/private"),
    );
    assert.ok(safeExternal);
    const parsedExternal = new URL(safeExternal);
    assert.equal(parsedExternal.username, "");
    assert.equal(parsedExternal.password, "");
    assert.deepEqual(
      [...parsedExternal.searchParams],
      [["redacted", "[REDACTED]"]],
    );
    assert.equal(parsedExternal.hash, "");
    assert.ok(serialized.includes("%5BREDACTED%5D"));
    assert.ok(
      report.findings.some(({ code }) => code === "BROWSER_ORIGIN_ESCAPE"),
    );
    assert.ok(report.errors.some((error) => error.includes("%5BREDACTED%5D")));
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
    assert.ok(
      runner.includes(selector),
      `runner selector missing: ${selector}`,
    );
    assert.ok(
      player.includes(componentMarker),
      `component contract missing: ${componentMarker}`,
    );
  }
  assert.match(
    runner,
    /verifiedProductionSiteOrigin\(\s*process\.env\.SITE_ORIGIN/u,
  );
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
