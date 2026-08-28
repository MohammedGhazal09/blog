import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { globSync, readFileSync } from "node:fs";
import test from "node:test";

import { authorRegistry, sectionRegistry } from "../src/config/registries.ts";
import {
  articlePath,
  assertCanonicalArabicSlug,
  assertLaunchSectionCoverage,
  assertPreviewMode,
  assertRegistries,
  assertUniqueArticlePaths,
  publicationDateAt,
  selectPreviewArticles,
  selectPublicArticles,
  validateArticleData,
  type ArticleData,
  type ArticleRecord,
} from "../src/lib/content-contract.ts";
import {
  approvedMdxComponentNames,
  assertAllowedMdxSource,
} from "../src/lib/mdx-policy.ts";
import { plausibleScriptSource } from "../src/lib/measurement.ts";
import { LOCAL_SITE_ORIGIN } from "../src/lib/site-origin.ts";

const fixedToday = "2026-08-26";
const CONTROLLED_PLAUSIBLE_SCRIPT_SRC =
  "https://plausible.io/js/pa-FAKE_TEST_FIXTURE_DO_NOT_DEPLOY.js";

function emittedHtml(): ReadonlyMap<string, string> {
  return new Map(
    globSync("dist/**/*.html")
      .sort()
      .map((path) => [path.replaceAll("\\", "/"), readFileSync(path, "utf8")]),
  );
}

function htmlBody(source: string): string {
  const body = /<body\b[^>]*>[\s\S]*<\/body>/u.exec(source)?.[0];
  assert.ok(body, "emitted HTML must contain one body");
  return body;
}

type LaunchEvidenceRow = Readonly<{
  scope: string;
  gate: string;
  status: string;
  authority: string;
  observed: string;
  realServiceEvidence: string;
  nextAction: string;
}>;

function launchEvidenceRows(markdown: string): readonly LaunchEvidenceRow[] {
  return markdown
    .split("\n")
    .filter((line) => /^\|\s*(?:محلي|خارجي)\s*\|/u.test(line))
    .map((line) => {
      const [
        scope,
        gate,
        status,
        authority,
        observed,
        realServiceEvidence,
        nextAction,
      ] = line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());
      assert.ok(
        nextAction,
        `launch evidence row must have seven cells: ${line}`,
      );
      return {
        scope,
        gate,
        status,
        authority,
        observed,
        realServiceEvidence,
        nextAction,
      };
    });
}

function assertLaunchEvidence(markdown: string): void {
  const rows = launchEvidenceRows(markdown);
  assert.equal(
    rows.length,
    14,
    "launch ledger must contain every required gate",
  );

  const requiredGates = [
    "تثبيت وبناء وفحص الإطلاق المحلي",
    "فحص بيانات الاعتماد في المستودع والمخرجات",
    "ثبات القياس دون تغيير مرئي",
    "إعداد مشروع Cloudflare Pages",
    "نشر الإنتاج وإتاحته",
    "النطاق وDNS وTLS",
    "خاصية Plausible والمقتطف الحالي",
    "مشاهدات الصفحات المجمعة",
    "تفعيل Outbound links والهدف",
    "حدث رابط يوتيوب الحقيقي",
    "خاصية Search Console ذات بادئة URL",
    "إرسال خريطة الموقع",
    "الفهرسة",
    "زيارات الإنتاج",
  ];
  assert.deepEqual(
    rows.map(({ gate }) => gate),
    requiredGates,
  );

  for (const row of rows) {
    assert.match(row.status, /^(?:PASS|FAIL|PENDING|BLOCKED)$/u, row.gate);
    assert.ok(row.authority, `${row.gate}: authority/evidence source required`);
    assert.ok(row.observed, `${row.gate}: observed date/value required`);
    assert.ok(row.nextAction, `${row.gate}: notes/next action required`);

    if (row.status === "PASS") {
      assert.match(row.observed, /\b20\d{2}-\d{2}-\d{2}\b/u, row.gate);
    }

    if (row.scope === "خارجي" && row.status === "PASS") {
      assert.notEqual(row.realServiceEvidence, "—", row.gate);
      assert.doesNotMatch(
        row.realServiceEvidence,
        /fixture|localhost|127\.0\.0\.1|blog\.ahmed-mangawy\.org|source inspection|اعتراض محلي|مصدر محلي/iu,
        row.gate,
      );
    }
  }
}

test("Arabic owner runbook locks the exact deployment and measurement path", () => {
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");

  for (const exact of [
    "main",
    "None",
    "24.19.0",
    "11.17.0",
    "SKIP_DEPENDENCY_INSTALL=1",
    "npm ci && npm run check && npm run launch:ready",
    "dist",
    "SITE_ORIGIN",
    "PLAUSIBLE_SCRIPT_SRC",
    "Outbound links",
    "Outbound Link: Click",
    "url",
    "/sitemap-index.xml",
  ]) {
    assert.ok(readme.includes(exact), `README must include ${exact}`);
  }

  assert.match(readme, /خاصية[^\n]*بادئة URL/u);
  assert.match(readme, /إعادة نشر|التراجع/u);
  assert.match(readme, /لا[^\n]*(?:فهرسة|الفهرسة)/u);
  assert.match(readme, /نقرة[^\n]*رابط/u);
  assert.doesNotMatch(readme, /مشاهدة فيديو|تشغيل فيديو|وقت المشاهدة/u);
  assert.doesNotMatch(
    readme,
    /script\.outbound-links\.js|wrangler|GitHub Actions/iu,
  );
  assert.doesNotMatch(readme, /(?:أنشئ|اقرأ|افتح)[^\n]{0,40}\.env/iu);
});

test("launch evidence separates local readiness from real external authority", () => {
  const evidence = readFileSync(
    new URL(
      "../.planning/phases/05-deployment-and-measurement/05-LAUNCH-EVIDENCE.md",
      import.meta.url,
    ),
    "utf8",
  );
  assertLaunchEvidence(evidence);

  const fabricatedExternalPass = evidence.replace(
    /\| خارجي \|([^\n|]+)\| PENDING \|/u,
    "| خارجي |$1| PASS |",
  );
  assert.throws(() => assertLaunchEvidence(fabricatedExternalPass));
});

test("accepts only the exact current Plausible asset shape", () => {
  assert.equal(
    plausibleScriptSource(CONTROLLED_PLAUSIBLE_SCRIPT_SRC),
    CONTROLLED_PLAUSIBLE_SCRIPT_SRC,
  );

  const invalidSources: readonly [string, unknown][] = [
    ["missing", undefined],
    ["non-string", 42],
    ["empty", ""],
    ["padded", ` ${CONTROLLED_PLAUSIBLE_SCRIPT_SRC}`],
    ["HTTP", CONTROLLED_PLAUSIBLE_SCRIPT_SRC.replace("https:", "http:")],
    ["credentials", "https://user@plausible.io/js/pa-token.js"],
    ["alternate host", "https://analytics.example.com/js/pa-token.js"],
    ["explicit port", "https://plausible.io:443/js/pa-token.js"],
    ["query", "https://plausible.io/js/pa-token.js?cache=1"],
    ["fragment", "https://plausible.io/js/pa-token.js#fragment"],
    [
      "legacy outbound script",
      "https://plausible.io/js/script.outbound-links.js",
    ],
    ["generic script", "https://plausible.io/js/script.js"],
    ["missing pa token", "https://plausible.io/js/pa-.js"],
    ["encoded path", "https://plausible.io/js/%70a-token.js"],
    ["non-js", "https://plausible.io/js/pa-token.css"],
  ];

  for (const [name, raw] of invalidSources) {
    assert.throws(() => plausibleScriptSource(raw), undefined, name);
  }
});

test("publication date uses Riyadh civil day when UTC is still yesterday", () => {
  const instant = new Date("2026-08-26T21:30:00.000Z");

  assert.equal(instant.toISOString().slice(0, 10), "2026-08-26");
  assert.equal(publicationDateAt(instant), "2026-08-27");
});

const validData: ArticleData = {
  title: "اختبار عقد المحتوى",
  description: "سجل صالح يثبت عقد المحتوى في المرحلة الأولى.",
  summary: "الخلاصة التجريبية لعقد المحتوى.",
  section: "generalIssues",
  author: "ahmedElMangawy",
  slug: "اختبار-عقد-المحتوى",
  publishedAt: "2026-08-01",
  draft: false,
  youtubeId: "dQw4w9WgXcQ",
};

function article(
  data: Partial<ArticleData> = {},
  id = "contract-markdown",
): ArticleRecord {
  return { id, data: { ...validData, ...data } };
}

function assertDiagnostic(
  action: () => unknown,
  expectedParts: readonly string[],
): void {
  assert.throws(action, (error: unknown) => {
    assert.ok(error instanceof Error);
    for (const part of expectedParts)
      assert.match(error.message, new RegExp(part, "iu"));
    return true;
  });
}

test("valid Arabic slugs accept diacritics and Arabic or ASCII digits", () => {
  for (const slug of ["مَسْأَلَة-١٢", "درس-12"]) {
    assert.doesNotThrow(() => assertCanonicalArabicSlug(slug, "fixture.slug"));
  }
});

const rejectedSlugs = [
  ["non-NFC", "ا\u0654ختبار", "Unicode NFC"],
  ["slash", "اختبار/عقد", "unsafe separator"],
  ["backslash", "اختبار\\عقد", "unsafe separator"],
  ["dot", "اختبار.عقد", "dot"],
  ["dot segment", "اختبار-..-عقد", "dot"],
  ["percent escape", "اختبار%20عقد", "escape"],
  ["C0 control", "اختبار\u001fعقد", "control"],
  ["C1 control", "اختبار\u0085عقد", "control"],
  ["bidi control", "اختبار\u202eعقد", "format"],
  ["format control", "اختبار\u200dعقد", "format"],
  ["repeated hyphen", "اختبار--عقد", "single internal hyphen"],
  ["leading hyphen", "-اختبار", "single internal hyphen"],
  ["trailing hyphen", "اختبار-", "single internal hyphen"],
  ["empty", "", "must not be empty"],
  ["Latin", "اختبار-test", "only Arabic"],
  ["punctuation", "اختبار،عقد", "only Arabic"],
] as const;

for (const [name, slug, rule] of rejectedSlugs) {
  test(`rejects ${name} slug input with its location and rule`, () => {
    assertDiagnostic(
      () => assertCanonicalArabicSlug(slug, `slug-fixture:${name}.slug`),
      [`slug-fixture:${name}\\.slug`, rule],
    );
  });
}

test("title-only edits keep one singular-trailing-slash path", () => {
  const original = article();
  const renamed = article({ title: "عنوان مختلف" });

  validateArticleData(original.data, original.id, { today: fixedToday });
  assert.equal(articlePath(original), "/القضايا-العامة/اختبار-عقد-المحتوى/");
  assert.equal(articlePath(renamed), articlePath(original));
  assert.equal(articlePath(original).endsWith("//"), false);
});

test("complete-path collisions report the path and both owners", () => {
  const first = article({}, "content/first.md");
  const second = article({ title: "عنوان آخر" }, "content/second.mdx");

  assertDiagnostic(
    () => assertUniqueArticlePaths([first, second]),
    [
      "/القضايا-العامة/اختبار-عقد-المحتوى/",
      "route collision",
      "content/first\\.md",
      "content/second\\.mdx",
    ],
  );
});

const requiredFieldFailures = [
  ["title", undefined, "non-empty string"],
  ["description", "", "non-empty string"],
  ["summary", "   ", "non-empty string"],
  ["section", undefined, "non-empty string"],
  ["author", undefined, "non-empty string"],
  ["slug", undefined, "non-empty string"],
  ["publishedAt", undefined, "YYYY-MM-DD string"],
  ["draft", undefined, "explicit boolean"],
  ["youtubeId", undefined, "11-character YouTube video ID"],
] as const;

for (const [field, value, rule] of requiredFieldFailures) {
  test(`rejects missing or empty required ${field} with source, field, and rule`, () => {
    const invalid = article(
      { [field]: value } as Partial<ArticleData>,
      `article:missing-${field}`,
    );
    assertDiagnostic(
      () =>
        validateArticleData(invalid.data, invalid.id, { today: fixedToday }),
      [`article:missing-${field}\\.${field}`, rule],
    );
  });
}

for (const field of ["title", "description", "summary"] as const) {
  test(`rejects Latin-only reader-facing article ${field}`, () => {
    const invalid = article(
      { [field]: "Latin only metadata" },
      `article:Latin-${field}`,
    );

    assertDiagnostic(
      () =>
        validateArticleData(invalid.data, invalid.id, { today: fixedToday }),
      [`article:Latin-${field}\\.${field}`, "Arabic-facing"],
    );
  });
}

for (const field of ["label", "description"] as const) {
  test(`rejects Latin-only reader-facing section ${field}`, () => {
    const sections = {
      ...sectionRegistry,
      generalIssues: {
        ...sectionRegistry.generalIssues,
        [field]: "Latin only metadata",
      },
    };

    assertDiagnostic(
      () => assertRegistries(sections, authorRegistry),
      [`sections\\.generalIssues\\.${field}`, "Arabic-facing"],
    );
  });
}

test("rejects Latin-only reader-facing author names", () => {
  const authors = {
    ...authorRegistry,
    ahmedElMangawy: { name: "Ahmed El-Mangawy" },
  };

  assertDiagnostic(
    () => assertRegistries(sectionRegistry, authors),
    ["authors\\.ahmedElMangawy\\.name", "Arabic-facing"],
  );
});

const semanticFailures = [
  [
    "unknown section",
    { section: "missingSection" },
    "section",
    "unknown registry key",
  ],
  [
    "unknown author",
    { author: "missingAuthor" },
    "author",
    "unknown registry key",
  ],
  [
    "inherited section key",
    { section: "toString" },
    "section",
    "unknown registry key",
  ],
  [
    "inherited author key",
    { author: "constructor" },
    "author",
    "unknown registry key",
  ],
  [
    "date syntax",
    { publishedAt: "2026-8-01" },
    "publishedAt",
    "exact YYYY-MM-DD",
  ],
  [
    "impossible date",
    { publishedAt: "2026-02-30" },
    "publishedAt",
    "real calendar date",
  ],
  [
    "invalid update date",
    { updatedAt: "2026-13-01" },
    "updatedAt",
    "real calendar date",
  ],
  [
    "update before publication",
    { publishedAt: "2026-08-02", updatedAt: "2026-08-01" },
    "updatedAt",
    "earlier than publishedAt",
  ],
  [
    "future public date",
    { publishedAt: "2026-08-27" },
    "publishedAt",
    "cannot be scheduled",
  ],
  [
    "future public update",
    { updatedAt: "2026-08-27" },
    "updatedAt",
    "cannot claim a future update",
  ],
  [
    "malformed YouTube ID",
    { youtubeId: "invalid/id" },
    "youtubeId",
    "11-character",
  ],
] as const;

for (const [name, data, field, rule] of semanticFailures) {
  test(`rejects ${name} with source, field, and rule`, () => {
    const invalid = article(data, `article:${name}`);
    assertDiagnostic(
      () =>
        validateArticleData(invalid.data, invalid.id, { today: fixedToday }),
      [`article:${name}\\.${field}`, rule],
    );
  });
}

test("accepts omitted, empty, and valid structured references", () => {
  const referenceSets = [
    undefined,
    [],
    [
      {
        label: "مرجع عربي موثوق",
        url: "https://example.com/reference",
      },
    ],
  ] as const;

  for (const references of referenceSets) {
    const data = { ...validData, references } as ArticleData;
    assert.doesNotThrow(() =>
      validateArticleData(data, "article:valid-references", {
        today: fixedToday,
      }),
    );
  }
});

test("rejects non-array references with source and field diagnostics", () => {
  const data = {
    ...validData,
    references: "مرجع غير منظم",
  } as unknown as ArticleData;

  assertDiagnostic(
    () =>
      validateArticleData(data, "article:non-array-references", {
        today: fixedToday,
      }),
    ["article:non-array-references\\.references", "array"],
  );
});

for (const [name, entry] of [
  ["null", null],
  ["string", "مرجع"],
  ["array", []],
] as const) {
  test(`rejects ${name} reference entries with source and index diagnostics`, () => {
    const data = {
      ...validData,
      references: [entry],
    } as unknown as ArticleData;
    assertDiagnostic(
      () =>
        validateArticleData(data, `article:${name}-reference`, {
          today: fixedToday,
        }),
      [`article:${name}-reference\\.references\\.0`, "object"],
    );
  });
}

for (const [name, reference, field, rule] of [
  [
    "blank label",
    { label: "   ", url: "https://example.com/reference" },
    "label",
    "non-empty string",
  ],
  [
    "Latin-only label",
    { label: "Reference", url: "https://example.com/reference" },
    "label",
    "Arabic-facing",
  ],
  [
    "missing URL",
    { label: "مرجع عربي", url: undefined },
    "url",
    "non-empty string",
  ],
] as const) {
  test(`rejects ${name} with source, index, field, and rule`, () => {
    const data = {
      ...validData,
      references: [reference],
    } as unknown as ArticleData;
    assertDiagnostic(
      () => validateArticleData(data, `article:${name}`, { today: fixedToday }),
      [`article:${name}\\.references\\.0\\.${field}`, rule],
    );
  });
}

for (const [name, url] of [
  ["malformed", "not a URL"],
  ["relative", "/reference"],
  ["HTTP", "http://example.com/reference"],
  ["JavaScript", "javascript:alert(1)"],
  ["credentials", "https://user:password@example.com/reference"],
] as const) {
  test(`rejects ${name} reference URLs with source, index, field, and rule`, () => {
    const data = {
      ...validData,
      references: [{ label: "مرجع عربي", url }],
    } as unknown as ArticleData;
    assertDiagnostic(
      () =>
        validateArticleData(data, `article:${name}-reference-url`, {
          today: fixedToday,
        }),
      [
        `article:${name}-reference-url\\.references\\.0\\.url`,
        "absolute HTTPS URL without credentials",
      ],
    );
  });
}

test("future publication and update are allowed while the record remains a draft", () => {
  const futureDraft = article({
    publishedAt: "2026-08-27",
    updatedAt: "2026-08-28",
    draft: true,
  });
  assert.doesNotThrow(() =>
    validateArticleData(futureDraft.data, futureDraft.id, {
      today: fixedToday,
    }),
  );
});

test("public selection excludes drafts and explicit development preview includes both", () => {
  const publicArticle = article();
  const draftArticle = article(
    { slug: "مسودة-اختبار-العقد", draft: true },
    "contract-draft",
  );
  const allArticles = [publicArticle, draftArticle];

  assert.deepEqual(selectPublicArticles(allArticles), [publicArticle]);
  assert.deepEqual(selectPreviewArticles(allArticles, true), [
    publicArticle,
    draftArticle,
  ]);
});

test("preview mode fails closed outside development", () => {
  assertDiagnostic(() => assertPreviewMode(false), ["preview", "development"]);
  assertDiagnostic(
    () => selectPreviewArticles([article()], false),
    ["preview", "development"],
  );
});

function coverageArticle(section: string, id = section): ArticleRecord {
  return article({ section, slug: `مقالة-${id}` }, `coverage-${id}`);
}

test("launch coverage accepts all three registered sections", () => {
  assert.doesNotThrow(() =>
    assertLaunchSectionCoverage([
      coverageArticle("refutations", "١"),
      coverageArticle("generalIssues", "٢"),
      coverageArticle("scholarship", "٣"),
    ]),
  );
});

for (const missingKey of Object.keys(sectionRegistry)) {
  test(`launch coverage rejects the single missing ${missingKey} section`, () => {
    const entries = Object.keys(sectionRegistry)
      .filter((key) => key !== missingKey)
      .map((key, index) => coverageArticle(key, String(index + 1)));
    assertDiagnostic(
      () => assertLaunchSectionCoverage(entries),
      [
        missingKey,
        sectionRegistry[missingKey as keyof typeof sectionRegistry].label,
      ],
    );
  });
}

test("launch coverage aggregates multiple missing sections in registry order", () => {
  assert.throws(
    () => assertLaunchSectionCoverage([coverageArticle("scholarship", "٣")]),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      const first = error.message.indexOf("refutations");
      const second = error.message.indexOf("generalIssues");
      assert.ok(first >= 0);
      assert.ok(second > first);
      assert.match(error.message, /الردود والشبهات/u);
      assert.match(error.message, /القضايا العامة/u);
      return true;
    },
  );
});

test("foreign section keys cannot satisfy registered launch coverage", () => {
  assertDiagnostic(
    () => assertLaunchSectionCoverage([coverageArticle("foreignSection")]),
    ["refutations", "generalIssues", "scholarship"],
  );
});

test("duplicate articles in one section cannot satisfy another section", () => {
  assertDiagnostic(
    () =>
      assertLaunchSectionCoverage([
        coverageArticle("generalIssues", "١"),
        coverageArticle("generalIssues", "٢"),
      ]),
    ["refutations", "scholarship"],
  );
});

test("launch readiness wires controlled identity and analytics without changing bodies", () => {
  const npmCli = process.env.npm_execpath;
  assert.ok(npmCli, "npm_execpath must identify the pinned npm CLI");
  const controlledOrigin = "https://blog.ahmed-mangawy.org";
  const launchScript = readFileSync(
    new URL("../scripts/launch-ready.mjs", import.meta.url),
    "utf8",
  );
  assert.match(
    launchScript,
    /build\(\{\s*site,\s*mode:\s*["']launch-readiness["']\s*\}\)/u,
  );
  assert.match(
    launchScript,
    /plausibleScriptSource\(\s*process\.env\.PLAUSIBLE_SCRIPT_SRC,?\s*\)/u,
  );

  const layoutSource = readFileSync(
    new URL("../src/layouts/SiteLayout.astro", import.meta.url),
    "utf8",
  );
  assert.match(
    layoutSource,
    /import\.meta\.env\.MODE\s*===\s*["']launch-readiness["']/u,
  );
  assert.match(layoutSource, /<script\s+is:inline\s+defer\s+src=/u);

  const playerSource = readFileSync(
    new URL("../src/components/YouTubePlayer.astro", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    playerSource,
    /plausible|Outbound Link: Click|onclick|preventDefault|data-(?:analytics|track)/iu,
  );

  const applicationSource = globSync("src/**/*.{astro,ts}")
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  assert.doesNotMatch(
    applicationSource,
    /Outbound Link: Click|plausible\s*\(|data-(?:analytics|track)/iu,
  );

  try {
    const ordinaryResult = spawnSync(
      process.execPath,
      [npmCli, "run", "build"],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          PLAUSIBLE_SCRIPT_SRC: CONTROLLED_PLAUSIBLE_SCRIPT_SRC,
        },
      },
    );
    const ordinaryOutput = `${ordinaryResult.stdout ?? ""}\n${ordinaryResult.stderr ?? ""}`;
    assert.equal(ordinaryResult.status, 0, ordinaryOutput);
    const ordinaryHtml = emittedHtml();
    assert.ok(ordinaryHtml.has("dist/404.html"));
    for (const [path, source] of ordinaryHtml) {
      assert.doesNotMatch(source, /plausible\.io/iu, path);
    }

    const result = spawnSync(
      process.execPath,
      [npmCli, "run", "launch:ready"],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          SITE_ORIGIN: controlledOrigin,
          PLAUSIBLE_SCRIPT_SRC: CONTROLLED_PLAUSIBLE_SCRIPT_SRC,
        },
      },
    );
    const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;

    assert.equal(result.status, 0, output);
    assert.doesNotMatch(output, /Missing script/iu);

    const launchHtml = emittedHtml();
    assert.deepEqual([...launchHtml.keys()], [...ordinaryHtml.keys()]);
    for (const [path, source] of launchHtml) {
      const loaders = source.match(
        /<script\b(?=[^>]*\bdefer\b)(?=[^>]*\bsrc="https:\/\/plausible\.io\/js\/pa-[A-Za-z0-9_-]+\.js")[^>]*><\/script>/gu,
      );
      assert.equal(loaders?.length, 1, `${path}: one deferred loader`);
      assert.ok(
        loaders?.[0].includes(`src="${CONTROLLED_PLAUSIBLE_SCRIPT_SRC}"`),
        `${path}: controlled fixture source`,
      );
      assert.doesNotMatch(source, /script\.outbound-links\.js/iu, path);
      assert.equal(
        htmlBody(source),
        htmlBody(ordinaryHtml.get(path) ?? ""),
        `${path}: body must remain byte-identical`,
      );
    }

    const generated = {
      home: readFileSync(
        new URL("../dist/index.html", import.meta.url),
        "utf8",
      ),
      sitemapIndex: readFileSync(
        new URL("../dist/sitemap-index.xml", import.meta.url),
        "utf8",
      ),
      sitemap: readFileSync(
        new URL("../dist/sitemap-0.xml", import.meta.url),
        "utf8",
      ),
      robots: readFileSync(
        new URL("../dist/robots.txt", import.meta.url),
        "utf8",
      ),
    };

    assert.ok(
      generated.home.includes(
        `<link rel="canonical" href="${controlledOrigin}/">`,
      ),
    );
    assert.ok(
      generated.home.includes(
        `<meta property="og:url" content="${controlledOrigin}/">`,
      ),
    );
    assert.ok(
      generated.sitemapIndex.includes(
        `<loc>${controlledOrigin}/sitemap-0.xml</loc>`,
      ),
    );
    assert.ok(generated.sitemap.includes(`<loc>${controlledOrigin}/</loc>`));
    assert.equal(
      generated.robots,
      `User-agent: *\nAllow: /\n\nSitemap: ${controlledOrigin}/sitemap-index.xml\n`,
    );

    for (const [name, body] of Object.entries(generated)) {
      assert.ok(
        body.includes(controlledOrigin),
        `${name} must use launch origin`,
      );
      assert.equal(
        body.includes(LOCAL_SITE_ORIGIN),
        false,
        `${name} must not retain the local origin`,
      );
    }
  } finally {
    const ordinaryEnv = { ...process.env };
    delete ordinaryEnv.SITE_ORIGIN;
    delete ordinaryEnv.PLAUSIBLE_SCRIPT_SRC;
    const restored = spawnSync(process.execPath, [npmCli, "run", "build"], {
      encoding: "utf8",
      env: ordinaryEnv,
    });
    const restoreOutput = `${restored.stdout ?? ""}\n${restored.stderr ?? ""}`;

    assert.equal(restored.status, 0, restoreOutput);
    assert.ok(
      readFileSync(
        new URL("../dist/index.html", import.meta.url),
        "utf8",
      ).includes(`<link rel="canonical" href="${LOCAL_SITE_ORIGIN}/">`),
    );
    for (const [path, source] of emittedHtml()) {
      assert.doesNotMatch(source, /plausible\.io/iu, path);
    }
  }
});

test("the authoritative registries validate all three canonical sections", () => {
  assert.deepEqual(Object.keys(sectionRegistry), [
    "refutations",
    "generalIssues",
    "scholarship",
  ]);
  assert.deepEqual(Object.keys(authorRegistry), ["ahmedElMangawy"]);
  assert.doesNotThrow(() => assertRegistries());
});

test("a fourth registered section validates and derives a path through the same contract", () => {
  const extendedSections = {
    ...sectionRegistry,
    futureLessons: {
      label: "دروس مستقبلية",
      description: "قسم تجريبي يثبت قابلية توسيع السجل.",
      slug: "دروس-مستقبلية",
      order: 4,
    },
  };
  const futureArticle = article(
    { section: "futureLessons", slug: "سلسلة-٤" },
    "future-section-article",
  );

  assert.doesNotThrow(() =>
    validateArticleData(futureArticle.data, futureArticle.id, {
      sections: extendedSections,
      today: fixedToday,
    }),
  );
  assert.equal(
    articlePath(futureArticle, extendedSections),
    "/دروس-مستقبلية/سلسلة-٤/",
  );
});

test("approved MDX uses ContractNote without article imports", () => {
  assert.deepEqual(approvedMdxComponentNames, ["ContractNote"]);
  assert.doesNotThrow(() =>
    assertAllowedMdxSource(
      "# عنوان الاختبار\n\n<ContractNote>محتوى معتمد</ContractNote>",
      "approved-contract-note.mdx",
    ),
  );
});

const rejectedMdxSources = [
  [
    "article-import.mdx",
    'import Thing from "thing"\n\n# عنوان',
    "top-level MDX ESM",
  ],
  [
    "article-export.mdx",
    "export const metadata = {}\n\n# عنوان",
    "top-level MDX ESM",
  ],
  [
    "article-script.mdx",
    '<ScRiPt   type="module">alert("x")</ScRiPt>',
    "script",
  ],
  [
    "article-iframe.mdx",
    '<IFRAME   title="اختبار" src="https://example.com"></IFRAME>',
    "iframe",
  ],
  [
    "article-event-handler.mdx",
    '<img src="missing" onerror="alert(document.domain)" />',
    "intrinsic/raw HTML element img",
  ],
  ["article-expression.mdx", "{1 + 1}", "forbidden MDX expression"],
  [
    "article-component-expression.mdx",
    "<ContractNote>{globalThis}</ContractNote>",
    "forbidden MDX expression",
  ],
  [
    "article-component-attribute.mdx",
    '<ContractNote class="note">غير معتمد</ContractNote>',
    "does not accept attributes",
  ],
  [
    "article-unsafe-link.mdx",
    "[رابط](javascript:alert(document.domain))",
    "forbidden URL protocol javascript:",
  ],
  [
    "article-unknown-component.mdx",
    "<UnknownCard>غير معتمد</UnknownCard>",
    "UnknownCard",
  ],
] as const;

for (const [sourceId, source, rule] of rejectedMdxSources) {
  test(`rejects ${sourceId} with its source and failed MDX rule`, () => {
    assertDiagnostic(
      () => assertAllowedMdxSource(source, sourceId),
      [sourceId.replace(".", "\\."), rule],
    );
  });
}

test("frontmatter, fenced examples, and inline code do not trigger the MDX policy", () => {
  const source = `---
example: "import Thing from 'thing' <script> <UnknownCard>"
---

# أمثلة توثيقية

\`\`\`mdx
export const example = true
<iframe src="https://example.com"></iframe>
<UnknownCard />
\`\`\`

اكتب \`<script>alert('example')</script>\` أو \`<UnknownCard />\` داخل الشرح.

<ContractNote>ملاحظة معتمدة خارج الأمثلة</ContractNote>
`;

  assert.doesNotThrow(() =>
    assertAllowedMdxSource(source, "code-examples.mdx"),
  );
});
