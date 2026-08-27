import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import test from "node:test";

import { authorRegistry, sectionRegistry } from "../src/config/registries.ts";
import {
  assertPublicArticleApprovals,
  type ApprovalArticleRecord,
  type ArticleApprovalSidecar,
} from "../src/lib/approval-contract.ts";
import {
  articlePath,
  assertCanonicalArabicSlug,
  assertLaunchSectionCoverage,
  assertPreviewMode,
  assertRegistries,
  assertUniqueArticlePaths,
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

const fixedToday = "2026-08-26";

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
    const data = { ...validData, references: [entry] } as unknown as ArticleData;
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
      () =>
        validateArticleData(data, `article:${name}`, { today: fixedToday }),
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

type ApprovalFixture = {
  article: ApprovalArticleRecord;
  reviewRoot: string;
  sidecarPath: string;
  sourcePath: string;
  source: string;
  sidecar: ArticleApprovalSidecar;
};

function withApprovalFixture(
  action: (fixture: ApprovalFixture) => void,
): void {
  const artifactRoot = resolve(".artifacts/tests");
  mkdirSync(artifactRoot, { recursive: true });
  const root = mkdtempSync(join(artifactRoot, "approval-contract-"));

  try {
    const sourcePath = join(root, "article.md");
    const reviewRoot = join(root, "reviews");
    mkdirSync(reviewRoot);
    writeFileSync(sourcePath, "---\ntitle: اختبار\n---\n\nنص عربي.\n");

    const source = relative(process.cwd(), sourcePath).replaceAll("\\", "/");
    const articleRecord = {
      ...article({}, "approval-fixture"),
      filePath: sourcePath,
    };
    const sidecar: ArticleApprovalSidecar = {
      articleId: articleRecord.id,
      articleSlug: articleRecord.data.slug,
      source,
      sha256: createHash("sha256")
        .update(readFileSync(sourcePath))
        .digest("hex"),
      classification: "launch",
      editorial: {
        reviewer: "editorial-fixture-reviewer",
        approvedAt: "2026-08-25",
        decision: "pass",
        substantive: true,
        videoMatchesArticle: true,
      },
      religiousAccuracy: {
        reviewer: "religious-fixture-reviewer",
        approvedAt: "2026-08-25",
        decision: "pass",
      },
    };

    action({
      article: articleRecord,
      reviewRoot,
      sidecarPath: join(
        reviewRoot,
        `${encodeURIComponent(articleRecord.id)}.json`,
      ),
      sourcePath,
      source,
      sidecar,
    });
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

function writeSidecar(path: string, sidecar: unknown): void {
  writeFileSync(path, JSON.stringify(sidecar));
}

function assertApprovalDiagnostic(
  fixture: ApprovalFixture,
  sidecar: unknown,
  expectedParts: readonly string[],
): void {
  writeSidecar(fixture.sidecarPath, sidecar);
  assertDiagnostic(
    () =>
      assertPublicArticleApprovals([fixture.article], {
        reviewRoot: fixture.reviewRoot,
        today: fixedToday,
      }),
    [fixture.article.id, ...expectedParts],
  );
}

test("accepts exact source bytes with current editorial and religious pass records", () => {
  withApprovalFixture((fixture) => {
    writeSidecar(fixture.sidecarPath, fixture.sidecar);
    assert.doesNotThrow(() =>
      assertPublicArticleApprovals([fixture.article], {
        reviewRoot: fixture.reviewRoot,
        today: fixedToday,
      }),
    );
  });
});

test("draft records bypass approval lookup and do not require filePath", () => {
  withApprovalFixture((fixture) => {
    const draft = article({ draft: true }, "draft-without-sidecar");
    assert.doesNotThrow(() =>
      assertPublicArticleApprovals([draft], {
        reviewRoot: join(fixture.reviewRoot, "does-not-exist"),
        today: fixedToday,
      }),
    );
  });
});

test("public records reject a missing sidecar", () => {
  withApprovalFixture((fixture) => {
    assertDiagnostic(
      () =>
        assertPublicArticleApprovals([fixture.article], {
          reviewRoot: fixture.reviewRoot,
          today: fixedToday,
        }),
      [fixture.article.id, "sidecar", "missing"],
    );
  });
});

test("public records reject invalid sidecar JSON", () => {
  withApprovalFixture((fixture) => {
    writeFileSync(fixture.sidecarPath, "{ invalid json");
    assertDiagnostic(
      () =>
        assertPublicArticleApprovals([fixture.article], {
          reviewRoot: fixture.reviewRoot,
          today: fixedToday,
        }),
      [fixture.article.id, "JSON"],
    );
  });
});

for (const [name, root] of [
  ["null", null],
  ["array", []],
  ["primitive", "approval"],
] as const) {
  test(`rejects ${name} sidecar roots as non-objects`, () => {
    withApprovalFixture((fixture) => {
      assertApprovalDiagnostic(fixture, root, ["object"]);
    });
  });
}

for (const field of [
  "articleId",
  "articleSlug",
  "source",
  "sha256",
  "classification",
  "editorial",
  "religiousAccuracy",
] as const) {
  test(`rejects a sidecar missing required ${field}`, () => {
    withApprovalFixture((fixture) => {
      const invalid = structuredClone(fixture.sidecar) as Record<
        string,
        unknown
      >;
      delete invalid[field];
      assertApprovalDiagnostic(fixture, invalid, [field, "required"]);
    });
  });
}

for (const [review, field] of [
  ["editorial", "reviewer"],
  ["editorial", "approvedAt"],
  ["editorial", "decision"],
  ["editorial", "substantive"],
  ["editorial", "videoMatchesArticle"],
  ["religiousAccuracy", "reviewer"],
  ["religiousAccuracy", "approvedAt"],
  ["religiousAccuracy", "decision"],
] as const) {
  test(`rejects a sidecar missing required ${review}.${field}`, () => {
    withApprovalFixture((fixture) => {
      const invalid = structuredClone(fixture.sidecar) as unknown as Record<
        string,
        Record<string, unknown>
      >;
      delete invalid[review][field];
      assertApprovalDiagnostic(fixture, invalid, [review, field, "required"]);
    });
  });
}

for (const [name, mutate, expectedParts] of [
  [
    "top-level unknown field",
    (sidecar: Record<string, unknown>) => {
      sidecar.extra = true;
    },
    ["extra", "unknown"],
  ],
  [
    "editorial unknown field",
    (sidecar: Record<string, unknown>) => {
      (sidecar.editorial as Record<string, unknown>).extra = true;
    },
    ["editorial", "extra", "unknown"],
  ],
  [
    "religious unknown field",
    (sidecar: Record<string, unknown>) => {
      (sidecar.religiousAccuracy as Record<string, unknown>).extra = true;
    },
    ["religiousAccuracy", "extra", "unknown"],
  ],
] as const) {
  test(`rejects ${name}`, () => {
    withApprovalFixture((fixture) => {
      const invalid = structuredClone(fixture.sidecar) as unknown as Record<
        string,
        unknown
      >;
      mutate(invalid);
      assertApprovalDiagnostic(fixture, invalid, expectedParts);
    });
  });
}

for (const [name, digest] of [
  ["short", "abc"],
  ["non-hex", "z".repeat(64)],
  ["uppercase", "A".repeat(64)],
] as const) {
  test(`rejects ${name} SHA-256 syntax`, () => {
    withApprovalFixture((fixture) => {
      assertApprovalDiagnostic(
        fixture,
        { ...fixture.sidecar, sha256: digest },
        ["sha256", "lowercase", "64"],
      );
    });
  });
}

test("rejects a public article without a loader-provided filePath", () => {
  withApprovalFixture((fixture) => {
    const articleWithoutPath = article({}, fixture.article.id);
    assertDiagnostic(
      () =>
        assertPublicArticleApprovals([articleWithoutPath], {
          reviewRoot: fixture.reviewRoot,
          today: fixedToday,
        }),
      [fixture.article.id, "filePath"],
    );
  });
});

for (const [name, source] of [
  ["outside path", "../outside.md"],
  ["different source", ".artifacts/different-article.md"],
] as const) {
  test(`rejects ${name} sidecar source`, () => {
    withApprovalFixture((fixture) => {
      assertApprovalDiagnostic(
        fixture,
        { ...fixture.sidecar, source },
        ["source", "match"],
      );
    });
  });
}

for (const [name, replacement, field] of [
  ["article ID", "another-entry", "articleId"],
  ["article slug", "سجل-آخر", "articleSlug"],
] as const) {
  test(`rejects a mismatched ${name}`, () => {
    withApprovalFixture((fixture) => {
      assertApprovalDiagnostic(
        fixture,
        { ...fixture.sidecar, [field]: replacement },
        [field, "match"],
      );
    });
  });
}

test("rejects non-launch approval classification", () => {
  withApprovalFixture((fixture) => {
    assertApprovalDiagnostic(
      fixture,
      { ...fixture.sidecar, classification: "proof" },
      ["classification", "launch"],
    );
  });
});

for (const review of ["editorial", "religiousAccuracy"] as const) {
  test(`rejects blank ${review} reviewer`, () => {
    withApprovalFixture((fixture) => {
      const invalid = structuredClone(fixture.sidecar);
      invalid[review].reviewer = "   ";
      assertApprovalDiagnostic(fixture, invalid, [review, "reviewer", "blank"]);
    });
  });

  for (const [name, approvedAt, rule] of [
    ["invalid", "2026-02-30", "real calendar"],
    ["malformed", "2026-8-25", "YYYY-MM-DD"],
    ["future", "2026-08-27", "future"],
  ] as const) {
    test(`rejects ${name} ${review} approvedAt`, () => {
      withApprovalFixture((fixture) => {
        const invalid = structuredClone(fixture.sidecar);
        invalid[review].approvedAt = approvedAt;
        assertApprovalDiagnostic(fixture, invalid, [
          review,
          "approvedAt",
          rule,
        ]);
      });
    });
  }

  test(`rejects non-pass ${review} decision`, () => {
    withApprovalFixture((fixture) => {
      const invalid = structuredClone(fixture.sidecar) as unknown as Record<
        string,
        Record<string, unknown>
      >;
      invalid[review].decision = "fail";
      assertApprovalDiagnostic(fixture, invalid, [review, "decision", "pass"]);
    });
  });
}

for (const field of ["substantive", "videoMatchesArticle"] as const) {
  test(`rejects false editorial ${field}`, () => {
    withApprovalFixture((fixture) => {
      const invalid = structuredClone(fixture.sidecar) as unknown as Record<
        string,
        Record<string, unknown>
      >;
      invalid.editorial[field] = false;
      assertApprovalDiagnostic(fixture, invalid, [
        "editorial",
        field,
        "true",
      ]);
    });
  });
}

test("rejects a stale digest after a one-byte source edit", () => {
  withApprovalFixture((fixture) => {
    writeSidecar(fixture.sidecarPath, fixture.sidecar);
    writeFileSync(fixture.sourcePath, `${readFileSync(fixture.sourcePath)}x`);
    assertDiagnostic(
      () =>
        assertPublicArticleApprovals([fixture.article], {
          reviewRoot: fixture.reviewRoot,
          today: fixedToday,
        }),
      [fixture.article.id, "sha256", "match"],
    );
  });
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
    assertDiagnostic(() => assertLaunchSectionCoverage(entries), [
      missingKey,
      sectionRegistry[missingKey as keyof typeof sectionRegistry].label,
    ]);
  });
}

test("launch coverage aggregates multiple missing sections in registry order", () => {
  assert.throws(
    () =>
      assertLaunchSectionCoverage([coverageArticle("scholarship", "٣")]),
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

test("non-launch classification fails before section coverage can run", () => {
  withApprovalFixture((fixture) => {
    writeSidecar(fixture.sidecarPath, {
      ...fixture.sidecar,
      classification: "proof",
    });
    let coverageReached = false;
    assert.throws(() => {
      assertPublicArticleApprovals([fixture.article], {
        reviewRoot: fixture.reviewRoot,
        today: fixedToday,
      });
      coverageReached = true;
      assertLaunchSectionCoverage([fixture.article]);
    });
    assert.equal(coverageReached, false);
  });
});

test("launch readiness exits nonzero for every missing registered section", () => {
  const npmCli = process.env.npm_execpath;
  assert.ok(npmCli, "npm_execpath must identify the pinned npm CLI");
  const result = spawnSync(
    process.execPath,
    [npmCli, "run", "launch:ready"],
    { encoding: "utf8" },
  );
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;

  assert.notEqual(result.status, 0);
  assert.doesNotMatch(output, /Missing script/iu);
  for (const [key, section] of Object.entries(sectionRegistry)) {
    assert.match(output, new RegExp(key, "u"));
    assert.match(output, new RegExp(section.label, "u"));
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
    assertAllowedMdxSource(
      source,
      "code-examples.mdx",
    ),
  );
});
