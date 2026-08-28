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
  requests: string[];
  browserRouteInstalled: boolean;
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
    ? `<section><div data-video-region data-youtube-id="${youtubeId}" data-iframe-title="فيديو المقال: ${title}"></div><a href="https://www.youtube.com/watch?v=${youtubeId}">مشاهدة الفيديو على يوتيوب</a></section>`
    : "";
  return `<!doctype html><html lang="ar" dir="rtl"><head><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${absolute(path)}"></head><body><header><a href="/">مدونة أحمد المنجاوي</a></header><main><h1>${title}</h1>${links.map((href) => `<a href="${href}">رابط عربي</a>`).join("")}${media}</main></body></html>`;
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

  const fixture: ControlledFixture = {
    responses,
    requests: [],
    browserRouteInstalled: false,
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
      await page.route("**/*", async (route) => {
        const response = responses.get(route.request().url());
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
  assert.match(runner, /productionSiteOrigin\(process\.env\.SITE_ORIGIN\)/u);
  assert.match(runner, /redirect:\s*["']manual["']/u);
  assert.doesNotMatch(
    runner,
    /dotenv|outputPath|evidenceScope\s*[:=]\s*options|06-PRODUCTION-EVIDENCE/u,
  );
});
