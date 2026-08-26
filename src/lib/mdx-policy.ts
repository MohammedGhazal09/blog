// @ts-ignore Node built-in types are intentionally not a project dependency.
import { readdirSync, readFileSync } from "node:fs";
// @ts-ignore Node built-in types are intentionally not a project dependency.
import { relative, resolve } from "node:path";
// @ts-ignore Node built-in types are intentionally not a project dependency.
import { fileURLToPath } from "node:url";
import { createProcessor } from "@mdx-js/mdx";

export const approvedMdxComponentNames = ["ContractNote"] as const;

export type ApprovedMdxComponentName = (typeof approvedMdxComponentNames)[number];

type MdxNode = {
  type: string;
  name?: string | null;
  url?: string;
  attributes?: readonly unknown[];
  children?: readonly MdxNode[];
};

const mdxParser = createProcessor();
const allowedComponents: ReadonlySet<string> = new Set(
  approvedMdxComponentNames,
);
const allowedUrlProtocols = new Set(["http:", "https:", "mailto:"]);

function sourceWithoutFrontmatter(source: string): string {
  return source.replace(
    /^\uFEFF?---[^\r\n]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/,
    "",
  );
}

export function assertAllowedMdxSource(
  source: string,
  sourceId: string,
): void {
  let root: MdxNode;
  try {
    root = mdxParser.parse(sourceWithoutFrontmatter(source)) as MdxNode;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`${sourceId}: invalid MDX syntax: ${detail}`);
  }

  const visit = (node: MdxNode): void => {
    if (node.type === "mdxjsEsm") {
      throw new Error(`${sourceId}: forbidden top-level MDX ESM`);
    }
    if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
      throw new Error(`${sourceId}: forbidden MDX expression`);
    }
    if (node.type === "html") {
      throw new Error(`${sourceId}: forbidden raw HTML`);
    }
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
      if (typeof node.name !== "string" || !allowedComponents.has(node.name)) {
        const name = node.name ?? "fragment";
        const kind = /^[a-z]/.test(name)
          ? "intrinsic/raw HTML element"
          : "unapproved MDX component";
        throw new Error(`${sourceId}: forbidden ${kind} ${name}`);
      }
      if ((node.attributes?.length ?? 0) > 0) {
        throw new Error(
          `${sourceId}: approved MDX component ${node.name} does not accept attributes`,
        );
      }
    }
    if (
      (node.type === "link" ||
        node.type === "image" ||
        node.type === "definition") &&
      node.url
    ) {
      const protocol = URL.parse(node.url, "https://content.invalid")?.protocol;
      if (!protocol || !allowedUrlProtocols.has(protocol)) {
        throw new Error(
          `${sourceId}: forbidden URL protocol ${protocol ?? "invalid"}`,
        );
      }
    }

    node.children?.forEach(visit);
  };

  visit(root);
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
