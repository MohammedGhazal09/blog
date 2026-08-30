import { lstatSync, readFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

export const MAX_MEDIA_BYTES = 2 * 1024 * 1024;

const ARTICLE_PREFIX = "src/content/articles/";
const MEDIA_PREFIX = "public/media/articles/";

function leafAfter(path, prefix) {
  if (!path.startsWith(prefix)) return undefined;
  const leaf = path.slice(prefix.length);
  if (
    !leaf ||
    leaf.startsWith(".") ||
    leaf.includes("..") ||
    /[/\\\u0000-\u001f\u007f]/u.test(leaf)
  ) {
    return undefined;
  }
  return leaf;
}

function existingRegularFile(root, path) {
  const absoluteRoot = resolve(root);
  const absolutePath = resolve(absoluteRoot, path);
  if (!absolutePath.startsWith(`${absoluteRoot}${sep}`)) {
    throw new Error(`CMS path escapes the repository: ${path}`);
  }

  let stat;
  try {
    stat = lstatSync(absolutePath);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return undefined;
    }
    throw error;
  }
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`CMS path must be a regular file: ${path}`);
  }
  return { absolutePath, stat };
}

function hasSignature(buffer, extension) {
  if (extension === "png") {
    return (
      buffer.length >= 8 &&
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    );
  }
  if (extension === "jpg" || extension === "jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }
  return (
    extension === "webp" &&
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  );
}

export function assertAllowedCmsPaths(paths, root = process.cwd()) {
  for (const path of paths) {
    const articleLeaf = leafAfter(path, ARTICLE_PREFIX);
    if (articleLeaf && /\.mdx?$/u.test(articleLeaf)) {
      existingRegularFile(root, path);
      continue;
    }

    const mediaLeaf = leafAfter(path, MEDIA_PREFIX);
    const mediaMatch = mediaLeaf?.match(/^(.+)\.(png|jpg|jpeg|webp)$/u);
    if (!mediaMatch) {
      throw new Error(`CMS pull requests cannot change: ${path}`);
    }

    const file = existingRegularFile(root, path);
    if (!file) continue;
    if (file.stat.size === 0 || file.stat.size > MAX_MEDIA_BYTES) {
      throw new Error(
        `CMS media must be between 1 byte and ${MAX_MEDIA_BYTES} bytes: ${path}`,
      );
    }

    const contents = readFileSync(file.absolutePath);
    if (!hasSignature(contents, mediaMatch[2])) {
      throw new Error(
        `CMS media signature does not match its extension: ${path}`,
      );
    }
  }
}

export function changedPaths(base, head) {
  const sha = /^[0-9a-f]{40,64}$/iu;
  if (!sha.test(base) || !sha.test(head)) {
    throw new Error(
      "CMS validator requires full hexadecimal base and head commit IDs",
    );
  }

  const result = spawnSync(
    "git",
    ["diff", "--name-only", "--no-renames", "-z", `${base}...${head}`],
    { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
  );
  if (result.status !== 0) {
    throw new Error(`Unable to inspect CMS changes: ${result.stderr.trim()}`);
  }
  return result.stdout.split("\0").filter(Boolean);
}

const isMain =
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  try {
    if (process.argv.length !== 4) {
      throw new Error(
        "Usage: node scripts/validate-cms-change.mjs <base-sha> <head-sha>",
      );
    }
    const paths = changedPaths(process.argv[2], process.argv[3]);
    assertAllowedCmsPaths(paths);
    console.log(`CMS change boundary passed for ${paths.length} path(s).`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
