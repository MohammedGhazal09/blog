import ContractNote from "./ContractNote.astro";
import type { ApprovedMdxComponentName } from "../lib/mdx-policy.ts";

export const mdxComponents = {
  ContractNote,
} satisfies Record<ApprovedMdxComponentName, unknown>;
