// @ts-ignore Node built-in types are intentionally not a project dependency.
import { createHash } from "node:crypto";
// @ts-ignore Node built-in types are intentionally not a project dependency.
import { existsSync, readFileSync } from "node:fs";
// @ts-ignore Node built-in types are intentionally not a project dependency.
import { isAbsolute, relative, resolve } from "node:path";

import type { ArticleRecord } from "./content-contract.ts";

export type ReviewDecision = {
  reviewer: string;
  approvedAt: string;
  decision: "pass";
};

export type ArticleApprovalSidecar = {
  articleId: string;
  articleSlug: string;
  source: string;
  sha256: string;
  classification: "launch";
  editorial: ReviewDecision & {
    substantive: true;
    videoMatchesArticle: true;
  };
  religiousAccuracy: ReviewDecision;
};

export type ApprovalArticleRecord = ArticleRecord & {
  filePath?: string;
};

type ApprovalOptions = {
  reviewRoot?: string;
  today?: string;
};

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const SHA256 = /^[0-9a-f]{64}$/;

function fail(articleId: string, rule: string): never {
  throw new Error(`${articleId}: approval ${rule}`);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertObject(
  value: unknown,
  articleId: string,
  location: string,
): asserts value is Record<string, unknown> {
  if (!isObject(value)) fail(articleId, `${location} must be an object`);
}

function assertExactFields(
  value: Record<string, unknown>,
  expected: readonly string[],
  articleId: string,
  location: string,
): void {
  for (const field of expected) {
    if (!Object.hasOwn(value, field)) {
      fail(articleId, `${location}.${field} is required`);
    }
  }
  for (const field of Object.keys(value)) {
    if (!expected.includes(field)) {
      fail(articleId, `${location}.${field} is an unknown field`);
    }
  }
}

function assertString(
  value: unknown,
  articleId: string,
  location: string,
): asserts value is string {
  if (typeof value !== "string") {
    fail(articleId, `${location} must be a string`);
  }
}

function assertNonBlank(
  value: unknown,
  articleId: string,
  location: string,
): asserts value is string {
  assertString(value, articleId, location);
  if (value.trim().length === 0) fail(articleId, `${location} must not be blank`);
}

function assertDate(
  value: unknown,
  articleId: string,
  location: string,
  today: string,
): asserts value is string {
  assertString(value, articleId, location);
  const match = DATE_ONLY.exec(value);
  if (!match) fail(articleId, `${location} must use exact YYYY-MM-DD syntax`);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    fail(articleId, `${location} must be a real calendar date`);
  }
  if (value > today) fail(articleId, `${location} must not be in the future`);
}

function assertReviewDecision(
  value: unknown,
  articleId: string,
  location: "sidecar.editorial" | "sidecar.religiousAccuracy",
  today: string,
): asserts value is Record<string, unknown> {
  assertObject(value, articleId, location);
  const editorialFields = [
    "reviewer",
    "approvedAt",
    "decision",
    "substantive",
    "videoMatchesArticle",
  ] as const;
  const religiousFields = ["reviewer", "approvedAt", "decision"] as const;
  assertExactFields(
    value,
    location === "sidecar.editorial" ? editorialFields : religiousFields,
    articleId,
    location,
  );
  assertNonBlank(value.reviewer, articleId, `${location}.reviewer`);
  assertDate(value.approvedAt, articleId, `${location}.approvedAt`, today);
  if (value.decision !== "pass") {
    fail(articleId, `${location}.decision must be literal pass`);
  }

  if (location === "sidecar.editorial") {
    if (value.substantive !== true) {
      fail(articleId, `${location}.substantive must be literal true`);
    }
    if (value.videoMatchesArticle !== true) {
      fail(articleId, `${location}.videoMatchesArticle must be literal true`);
    }
  }
}

function repositorySource(filePath: string, articleId: string): string {
  const projectRoot = resolve(".");
  const absolutePath = resolve(filePath);
  const source = relative(projectRoot, absolutePath);
  if (
    source.length === 0 ||
    source === ".." ||
    source.startsWith("../") ||
    source.startsWith("..\\") ||
    isAbsolute(source)
  ) {
    fail(articleId, "filePath must resolve inside the project");
  }
  return source.replaceAll("\\", "/");
}

function validateSidecar(
  value: unknown,
  article: ApprovalArticleRecord,
  source: string,
  today: string,
): asserts value is ArticleApprovalSidecar {
  const articleId = article.id;
  assertObject(value, articleId, "sidecar");
  assertExactFields(
    value,
    [
      "articleId",
      "articleSlug",
      "source",
      "sha256",
      "classification",
      "editorial",
      "religiousAccuracy",
    ],
    articleId,
    "sidecar",
  );

  assertString(value.articleId, articleId, "sidecar.articleId");
  if (value.articleId !== article.id) {
    fail(articleId, "sidecar.articleId must match the article ID");
  }
  assertString(value.articleSlug, articleId, "sidecar.articleSlug");
  if (value.articleSlug !== article.data.slug) {
    fail(articleId, "sidecar.articleSlug must match the article slug");
  }
  assertString(value.source, articleId, "sidecar.source");
  if (value.source !== source) {
    fail(articleId, "sidecar.source must match the article source");
  }
  assertString(value.sha256, articleId, "sidecar.sha256");
  if (!SHA256.test(value.sha256)) {
    fail(articleId, "sidecar.sha256 must be lowercase 64-character hex");
  }
  if (value.classification !== "launch") {
    fail(articleId, "sidecar.classification must be literal launch");
  }

  assertReviewDecision(value.editorial, articleId, "sidecar.editorial", today);
  assertReviewDecision(
    value.religiousAccuracy,
    articleId,
    "sidecar.religiousAccuracy",
    today,
  );
}

export function assertPublicArticleApprovals(
  entries: readonly ApprovalArticleRecord[],
  options: ApprovalOptions = {},
): void {
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  assertDate(today, "approval-options", "today", today);
  const reviewRoot = resolve(
    options.reviewRoot ?? resolve("src/content/reviews"),
  );

  for (const article of entries) {
    if (article.data.draft) continue;
    if (typeof article.filePath !== "string" || article.filePath.length === 0) {
      fail(article.id, "public article requires loader-provided filePath");
    }

    const source = repositorySource(article.filePath, article.id);
    const sidecarPath = resolve(
      reviewRoot,
      `${encodeURIComponent(article.id)}.json`,
    );
    if (!existsSync(sidecarPath)) {
      fail(article.id, "sidecar is missing");
    }

    let sidecar: unknown;
    try {
      sidecar = JSON.parse(readFileSync(sidecarPath, "utf8"));
    } catch {
      fail(article.id, "sidecar contains invalid JSON");
    }
    validateSidecar(sidecar, article, source, today);

    const digest = createHash("sha256")
      .update(readFileSync(article.filePath))
      .digest("hex");
    if (digest !== sidecar.sha256) {
      fail(article.id, "sidecar.sha256 must match exact source bytes");
    }
  }
}
