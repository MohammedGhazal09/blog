// @ts-ignore Node built-in types are intentionally not a project dependency.
import { isIP } from "node:net";

export const LOCAL_SITE_ORIGIN = "http://127.0.0.1:4322";

const RESERVED_ROOTS = [
  "localhost",
  "test",
  "invalid",
  "example",
  "example.com",
  "example.net",
  "example.org",
] as const;

export function productionSiteOrigin(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0 || raw !== raw.trim()) {
    throw new Error("SITE_ORIGIN must be an explicit clean HTTPS origin");
  }

  const url = new URL(raw);
  const hostname = url.hostname.replace(/^\[|\]$/gu, "");
  const isReserved = RESERVED_ROOTS.some(
    (root) => hostname === root || hostname.endsWith(`.${root}`),
  );

  if (
    url.protocol !== "https:" ||
    raw.includes("@") ||
    raw.includes("?") ||
    raw.includes("#") ||
    url.username !== "" ||
    url.password !== "" ||
    url.pathname !== "/" ||
    url.search !== "" ||
    url.hash !== "" ||
    url.hostname.endsWith(".") ||
    isIP(hostname) !== 0 ||
    isReserved
  ) {
    throw new Error("SITE_ORIGIN is not a safe production origin");
  }

  return url.origin;
}
