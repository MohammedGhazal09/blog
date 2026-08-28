// @ts-ignore Node built-in types are intentionally not a project dependency.
import { Resolver } from "node:dns/promises";
// @ts-ignore Node built-in types are intentionally not a project dependency.
import { BlockList, isIP } from "node:net";

export const LOCAL_SITE_ORIGIN = "http://127.0.0.1:4322";
export const DNS_RESOLUTION_TIMEOUT_MS = 5_000;

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
  ["100:0:0:1::", 64],
  ["2001::", 23],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["3fff::", 20],
  ["5f00::", 16],
  ["fc00::", 7],
  ["fe80::", 10],
  ["fec0::", 10],
  ["ff00::", 8],
] as const) {
  NON_GLOBAL_ADDRESSES.addSubnet(network, prefix, "ipv6");
}

type ResolveHostname = (
  hostname: string,
  options: { all: true; verbatim: true; signal: AbortSignal },
) => Promise<readonly { address: string; family: number }[]>;

export type VerifiedProductionSite = {
  origin: string;
  hostname: string;
  addresses: readonly { address: string; family: 4 | 6 }[];
};

type PinnedLookupOptions = number | { all?: boolean; family?: number };
type PinnedLookupCallback = (
  error: Error | null,
  address: string | { address: string; family: 4 | 6 }[],
  family?: number,
) => void;

async function resolvePublicAddresses(
  hostname: string,
  { signal }: { signal: AbortSignal },
): Promise<readonly { address: string; family: number }[]> {
  const resolver = new Resolver();
  const cancel = () => resolver.cancel();
  signal.addEventListener("abort", cancel, { once: true });
  try {
    const results = await Promise.allSettled([
      resolver.resolve4(hostname),
      resolver.resolve6(hostname),
    ]);
    const unexpectedFailure = results.find(
      (result) =>
        result.status === "rejected" &&
        !["ENODATA", "ENOTFOUND"].includes(
          typeof result.reason === "object" &&
            result.reason !== null &&
            "code" in result.reason
            ? String(result.reason.code)
            : "",
        ),
    );
    if (unexpectedFailure?.status === "rejected") throw unexpectedFailure.reason;
    return results.flatMap((result, index) =>
      result.status === "fulfilled"
        ? result.value.map((address) => ({ address, family: index === 0 ? 4 : 6 }))
        : [],
    );
  } finally {
    signal.removeEventListener("abort", cancel);
  }
}

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
  resolveHostname: ResolveHostname = resolvePublicAddresses,
  timeoutMs = DNS_RESOLUTION_TIMEOUT_MS,
): Promise<VerifiedProductionSite> {
  const origin = productionSiteOrigin(raw);
  const hostname = new URL(origin).hostname;
  const controller = new AbortController();
  let timer;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(
        new Error(`SITE_ORIGIN DNS resolution timed out after ${timeoutMs} ms`),
      );
      controller.abort();
    }, timeoutMs);
  });
  let addresses;
  try {
    addresses = await Promise.race([
      resolveHostname(hostname, {
        all: true,
        verbatim: true,
        signal: controller.signal,
      }),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
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

  return {
    origin,
    hostname,
    addresses: addresses.map(({ address, family }) => ({
      address,
      family: family as 4 | 6,
    })),
  };
}

export function createPinnedLookup(verified: VerifiedProductionSite) {
  return (
    hostname: string,
    options: PinnedLookupOptions,
    callback: PinnedLookupCallback,
  ): void => {
    const requestedFamily =
      typeof options === "number" ? options : (options.family ?? 0);
    const candidates = verified.addresses.filter(
      ({ family }) => requestedFamily === 0 || family === requestedFamily,
    );
    if (hostname !== verified.hostname || candidates.length === 0) {
      callback(new Error("pinned DNS lookup rejected an unapproved target"), "");
      return;
    }
    if (typeof options === "object" && options.all) {
      callback(
        null,
        candidates.map(({ address, family }) => ({ address, family })),
      );
      return;
    }
    callback(null, candidates[0].address, candidates[0].family);
  };
}

export function chromiumHostResolverRules(
  verified: VerifiedProductionSite,
): string {
  const { address, family } = verified.addresses[0];
  return `MAP ${verified.hostname} ${family === 6 ? `[${address}]` : address}, EXCLUDE localhost`;
}
