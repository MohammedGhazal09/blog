// @ts-expect-error Node built-in types are intentionally not a project dependency.
import { readdirSync, readFileSync } from "node:fs";
// @ts-expect-error Node built-in types are intentionally not a project dependency.
import { relative, resolve } from "node:path";
// @ts-expect-error Node built-in types are intentionally not a project dependency.
import { fileURLToPath } from "node:url";

export const approvedMdxComponentNames = ["ContractNote"] as const;

export type ApprovedMdxComponentName = (typeof approvedMdxComponentNames)[number];

function sourceWithoutExamples(source: string): string {
  const withoutFrontmatter = source.replace(
    /^\uFEFF?---[^\r\n]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/,
    "",
  );
  const lines = withoutFrontmatter.split(/\r?\n/);
  let fence: { marker: string; length: number } | undefined;

  return lines
    .map((line) => {
      const match = line.match(/^[ \t]{0,3}(`{3,}|~{3,})/);
      if (fence) {
        if (
          match &&
          match[1][0] === fence.marker &&
          match[1].length >= fence.length
        ) {
          fence = undefined;
        }
        return "";
      }
      if (match) {
        fence = { marker: match[1][0], length: match[1].length };
        return "";
      }
      return line.replace(/(`+)[^\r\n]*?\1/g, "");
    })
    .join("\n");
}

export function assertAllowedMdxSource(
  source: string,
  sourceId: string,
  allowedNames: readonly string[] = approvedMdxComponentNames,
): void {
  const inspected = sourceWithoutExamples(source);

  if (/^[ \t]{0,3}import\b/m.test(inspected)) {
    throw new Error(`${sourceId}: forbidden top-level ESM import`);
  }
  if (/^[ \t]{0,3}export\b/m.test(inspected)) {
    throw new Error(`${sourceId}: forbidden top-level ESM export`);
  }
  if (/<\s*script\b/i.test(inspected)) {
    throw new Error(`${sourceId}: forbidden script tag`);
  }
  if (/<\s*iframe\b/i.test(inspected)) {
    throw new Error(`${sourceId}: forbidden iframe tag`);
  }

  const allowed = new Set(allowedNames);
  for (const match of inspected.matchAll(/<\s*\/?\s*([A-Z][A-Za-z0-9_$.-]*)\b/g)) {
    const componentName = match[1];
    if (!allowed.has(componentName)) {
      throw new Error(`${sourceId}: unapproved MDX component ${componentName}`);
    }
  }
}

export function preflightArticleSources(directory: string | URL): void {
  const root =
    typeof directory === "string" ? resolve(directory) : fileURLToPath(directory);

  const visit = (currentDirectory: string): void => {
    for (const entry of readdirSync(currentDirectory, { withFileTypes: true })) {
      const path = resolve(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        visit(path);
      } else if (entry.isFile() && /\.(?:md|mdx)$/i.test(entry.name)) {
        const sourceId = relative(root, path).replaceAll("\\", "/");
        assertAllowedMdxSource(readFileSync(path, "utf8"), sourceId);
      }
    }
  };

  visit(root);
}
