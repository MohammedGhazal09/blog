import {
  authorRegistry,
  sectionRegistry,
  type AuthorRecord,
  type SectionRecord,
} from "../config/registries.ts";

export type ArticleData = {
  title: string;
  description: string;
  summary: string;
  section: string;
  author: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  draft: boolean;
  youtubeId: string;
};

export type ArticleRecord = {
  id: string;
  data: ArticleData;
};

type SectionRegistry = Readonly<Record<string, SectionRecord>>;
type AuthorRegistry = Readonly<Record<string, AuthorRecord>>;

type ValidationOptions = {
  sections?: SectionRegistry;
  authors?: AuthorRegistry;
  today?: string;
};

const ASCII_KEY = /^[A-Za-z][A-Za-z0-9]*$/;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DIGIT = /^[0-9\u0660-\u0669\u06F0-\u06F9]$/u;
const ARABIC_MARK =
  /^[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF]$/u;

function fail(location: string, rule: string): never {
  throw new Error(`${location}: ${rule}`);
}

function isArabicLetter(character: string): boolean {
  return /\p{Letter}/u.test(character) && /\p{Script=Arabic}/u.test(character);
}

function isAllowedSegment(segment: string): boolean {
  const characters = [...segment];
  if (
    characters.length === 0 ||
    (!isArabicLetter(characters[0]) && !DIGIT.test(characters[0]))
  ) {
    return false;
  }

  return characters.every(
    (character) =>
      isArabicLetter(character) ||
      DIGIT.test(character) ||
      ARABIC_MARK.test(character),
  );
}

function assertNonEmpty(
  value: unknown,
  source: string,
  field: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`${source}.${field}`, "must be a non-empty string");
  }
}

function assertDateOnly(
  value: unknown,
  source: string,
  field: string,
): asserts value is string {
  if (typeof value !== "string")
    fail(`${source}.${field}`, "must be a YYYY-MM-DD string");
  const match = DATE_ONLY.exec(value);
  if (!match)
    fail(`${source}.${field}`, "must use exact YYYY-MM-DD date-only syntax");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    fail(`${source}.${field}`, "must be a real calendar date");
  }
}

export function assertCanonicalArabicSlug(
  value: string,
  location: string,
): void {
  if (typeof value !== "string" || value.length === 0)
    fail(location, "slug must not be empty");
  if (value.normalize("NFC") !== value)
    fail(location, "slug must already be Unicode NFC");
  if (/\p{Cc}|\p{Cf}/u.test(value))
    fail(location, "slug contains a control or format character");
  if (/[\\/.%]/u.test(value))
    fail(location, "slug contains an unsafe separator, dot, or escape form");
  if (value.includes("--") || value.startsWith("-") || value.endsWith("-")) {
    fail(location, "slug must use single internal hyphen separators");
  }
  if (!value.split("-").every(isAllowedSegment)) {
    fail(
      location,
      "slug must contain only Arabic letters/marks or Arabic/ASCII digits",
    );
  }
}

export function assertRegistries(
  sections: SectionRegistry = sectionRegistry,
  authors: AuthorRegistry = authorRegistry,
): void {
  const orders = new Map<number, string>();
  const slugs = new Map<string, string>();

  for (const [key, section] of Object.entries(sections)) {
    if (!ASCII_KEY.test(key))
      fail(`sections.${key}`, "registry key must be stable ASCII camel-case");
    assertNonEmpty(section.label, `sections.${key}`, "label");
    assertNonEmpty(section.description, `sections.${key}`, "description");
    assertCanonicalArabicSlug(section.slug, `sections.${key}.slug`);
    if (!Number.isInteger(section.order) || section.order < 1) {
      fail(
        `sections.${key}.order`,
        "navigation order must be a positive integer",
      );
    }
    if (orders.has(section.order)) {
      fail(
        `sections.${key}.order`,
        `navigation order collides with ${orders.get(section.order)}`,
      );
    }
    if (slugs.has(section.slug)) {
      fail(
        `sections.${key}.slug`,
        `public slug collides with ${slugs.get(section.slug)}`,
      );
    }
    orders.set(section.order, key);
    slugs.set(section.slug, key);
  }

  for (const [key, author] of Object.entries(authors)) {
    if (!ASCII_KEY.test(key))
      fail(`authors.${key}`, "registry key must be stable ASCII camel-case");
    assertNonEmpty(author.name, `authors.${key}`, "name");
  }
}

export function validateArticleData(
  data: ArticleData,
  source: string,
  options: ValidationOptions = {},
): void {
  const sections = options.sections ?? sectionRegistry;
  const authors = options.authors ?? authorRegistry;
  const today = options.today ?? new Date().toISOString().slice(0, 10);

  assertRegistries(sections, authors);
  assertNonEmpty(data.title, source, "title");
  assertNonEmpty(data.description, source, "description");
  assertNonEmpty(data.summary, source, "summary");
  assertNonEmpty(data.section, source, "section");
  assertNonEmpty(data.author, source, "author");
  assertNonEmpty(data.slug, source, "slug");
  if (!(data.section in sections))
    fail(`${source}.section`, `unknown registry key: ${data.section}`);
  if (!(data.author in authors))
    fail(`${source}.author`, `unknown registry key: ${data.author}`);
  assertCanonicalArabicSlug(data.slug, `${source}.slug`);
  assertDateOnly(data.publishedAt, source, "publishedAt");
  assertDateOnly(today, source, "today");

  if (data.updatedAt !== undefined) {
    assertDateOnly(data.updatedAt, source, "updatedAt");
    if (data.updatedAt < data.publishedAt) {
      fail(`${source}.updatedAt`, "must not be earlier than publishedAt");
    }
  }
  if (typeof data.draft !== "boolean")
    fail(`${source}.draft`, "must be an explicit boolean");
  if (!data.draft && data.publishedAt > today) {
    fail(
      `${source}.publishedAt`,
      "public articles cannot be scheduled in the future",
    );
  }
  if (typeof data.youtubeId !== "string" || !YOUTUBE_ID.test(data.youtubeId)) {
    fail(`${source}.youtubeId`, "must be an 11-character YouTube video ID");
  }
}

export function articlePath(
  article: ArticleRecord,
  sections: SectionRegistry = sectionRegistry,
): string {
  const section = sections[article.data.section];
  if (!section)
    fail(
      `${article.id}.section`,
      `unknown registry key: ${article.data.section}`,
    );
  assertCanonicalArabicSlug(
    section.slug,
    `sections.${article.data.section}.slug`,
  );
  assertCanonicalArabicSlug(article.data.slug, `${article.id}.slug`);
  return `/${section.slug}/${article.data.slug}/`;
}

export function pathParamsFor(
  article: ArticleRecord,
  sections: SectionRegistry = sectionRegistry,
): { section: string; slug: string } {
  const section = sections[article.data.section];
  if (!section)
    fail(
      `${article.id}.section`,
      `unknown registry key: ${article.data.section}`,
    );
  assertCanonicalArabicSlug(
    section.slug,
    `sections.${article.data.section}.slug`,
  );
  assertCanonicalArabicSlug(article.data.slug, `${article.id}.slug`);
  return { section: section.slug, slug: article.data.slug };
}

export function assertUniqueArticlePaths(
  entries: readonly ArticleRecord[],
  sections: SectionRegistry = sectionRegistry,
): void {
  const owners = new Map<string, string>();
  for (const entry of entries) {
    const path = articlePath(entry, sections);
    const prior = owners.get(path);
    if (prior) fail(path, `route collision between ${prior} and ${entry.id}`);
    owners.set(path, entry.id);
  }
}

export function selectPublicArticles<T extends ArticleRecord>(
  entries: readonly T[],
): T[] {
  return entries.filter((entry) => entry.data.draft === false);
}

export function assertPreviewMode(isDevelopment: boolean): void {
  if (!isDevelopment)
    throw new Error(
      "preview content is available only in explicit development mode",
    );
}

export function selectPreviewArticles<T extends ArticleRecord>(
  entries: readonly T[],
  isDevelopment: boolean,
): T[] {
  assertPreviewMode(isDevelopment);
  return [...entries];
}
