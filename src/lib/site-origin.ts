// @ts-ignore Node built-in types are intentionally not a project dependency.
import { lookup } from "node:dns/promises";
// @ts-ignore Node built-in types are intentionally not a project dependency.
import { BlockList, isIP } from "node:net";

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

const LOCAL_ROOTS = ["local", "internal", "home.arpa"] as const;
const NON_GLOBAL_ADDRESSES = new BlockList();

for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  NON_GLOBAL_ADDRESSES.addSubnet(network, prefix, "ipv4");
}

for (const [network, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["64:ff9b::", 96],
  ["64:ff9b:1::", 48],
  ["100::", 64],
  ["2001::", 23],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["3fff::", 20],
  ["5f00::", 16],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const) {
  NON_GLOBAL_ADDRESSES.addSubnet(network, prefix, "ipv6");
}

type ResolveHostname = (
  hostname: string,
  options: { all: true; verbatim: true },
) => Promise<readonly { address: string; family: number }[]>;

export function productionSiteOrigin(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0 || raw !== raw.trim()) {
    throw new Error("SITE_ORIGIN must be an explicit clean HTTPS origin");
  }

  const url = new URL(raw);
  const hostname = url.hostname.replace(/^\[|\]$/gu, "");
  const isReserved = RESERVED_ROOTS.some(
    (root) => hostname === root || hostname.endsWith(`.${root}`),
  );
  const isLocal = LOCAL_ROOTS.some(
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
    url.port !== "" ||
    raw !== url.origin ||
    url.hostname.endsWith(".") ||
    isIP(hostname) !== 0 ||
    !hostname.includes(".") ||
    isReserved ||
    isLocal
  ) {
    throw new Error("SITE_ORIGIN is not a safe production origin");
  }

  return url.origin;
}

export async function verifiedProductionSiteOrigin(
  raw: unknown,
  resolveHostname: ResolveHostname = lookup,
): Promise<string> {
  const origin = productionSiteOrigin(raw);
  const hostname = new URL(origin).hostname;
  const addresses = await resolveHostname(hostname, {
    all: true,
    verbatim: true,
  });
  if (
    addresses.length === 0 ||
    addresses.some(({ address, family }) => {
      const detectedFamily = isIP(address);
      return (
        detectedFamily === 0 ||
        detectedFamily !== family ||
        address.toLowerCase().startsWith("::ffff:") ||
        NON_GLOBAL_ADDRESSES.check(
          address,
          detectedFamily === 4 ? "ipv4" : "ipv6",
        )
      );
    })
  ) {
    throw new Error(
      "SITE_ORIGIN does not resolve exclusively to global addresses",
    );
  }

  return origin;
}
