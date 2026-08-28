import assert from "node:assert/strict";
import test from "node:test";

import {
  chromiumHostResolverRules,
  createPinnedLookup,
  productionSiteOrigin,
  verifiedProductionSiteOrigin,
} from "../src/lib/site-origin.ts";

const publicResolver = async () => [{ address: "93.184.216.34", family: 4 }];

const validOrigins = [
  [
    "root HTTPS origin",
    "https://blog.ahmed-mangawy.org",
    "https://blog.ahmed-mangawy.org",
  ],
] as const;

for (const [name, raw, expected] of validOrigins) {
  test(`accepts ${name}`, () => {
    assert.equal(productionSiteOrigin(raw), expected);
  });
}

const invalidOrigins: readonly [string, unknown][] = [
  ["missing value", undefined],
  ["non-string value", 42],
  ["empty value", ""],
  ["whitespace-only value", "   "],
  ["leading whitespace", " https://blog.ahmed-mangawy.org"],
  ["trailing whitespace", "https://blog.ahmed-mangawy.org "],
  ["trailing slash", "https://blog.ahmed-mangawy.org/"],
  ["uppercase host", "https://BLOG.AHMED-MANGAWY.ORG"],
  ["default HTTPS port", "https://blog.ahmed-mangawy.org:443"],
  ["non-default HTTPS port", "https://blog.ahmed-mangawy.org:8443"],
  ["HTTP scheme", "http://blog.ahmed-mangawy.org"],
  ["non-HTTPS scheme", "ftp://blog.ahmed-mangawy.org"],
  ["username", "https://user@blog.ahmed-mangawy.org"],
  ["password", "https://:secret@blog.ahmed-mangawy.org"],
  ["raw empty userinfo", "https://@blog.ahmed-mangawy.org"],
  ["query", "https://blog.ahmed-mangawy.org/?source=test"],
  ["empty query delimiter", "https://blog.ahmed-mangawy.org/?"],
  ["fragment", "https://blog.ahmed-mangawy.org/#top"],
  ["empty fragment delimiter", "https://blog.ahmed-mangawy.org/#"],
  ["non-root path", "https://blog.ahmed-mangawy.org/path"],
  ["non-root directory path", "https://blog.ahmed-mangawy.org/path/"],
  ["trailing-dot host", "https://blog.ahmed-mangawy.org./"],
  ["localhost", "https://localhost"],
  ["localhost subdomain", "https://blog.localhost"],
  ["single-label local DNS name", "https://router"],
  ["multicast DNS suffix", "https://router.local"],
  ["internal suffix", "https://router.internal"],
  ["home ARPA suffix", "https://router.home.arpa"],
  ["loopback IPv4", "https://127.0.0.1"],
  ["public IPv4", "https://203.0.113.10"],
  ["loopback IPv6", "https://[::1]"],
  ["public IPv6", "https://[2001:db8::1]"],
  ["reserved test root", "https://test"],
  ["reserved test subdomain", "https://blog.test"],
  ["reserved invalid root", "https://invalid"],
  ["reserved invalid subdomain", "https://blog.invalid"],
  ["reserved example root", "https://example"],
  ["reserved example subdomain", "https://blog.example"],
  ["reserved example.com", "https://example.com"],
  ["reserved example.com subdomain", "https://blog.example.com"],
  ["reserved example.net", "https://example.net"],
  ["reserved example.net subdomain", "https://blog.example.net"],
  ["reserved example.org", "https://example.org"],
  ["reserved example.org subdomain", "https://blog.example.org"],
  ["relative value", "blog.ahmed-mangawy.org"],
  ["missing hostname", "https:///"],
  ["malformed URL", "not a URL"],
];

for (const [name, raw] of invalidOrigins) {
  test(`rejects ${name}`, () => {
    assert.throws(() => productionSiteOrigin(raw));
  });
}

for (const [name, address, family] of [
  ["private IPv4 DNS answer", "192.168.1.1", 4],
  ["link-local IPv4 DNS answer", "169.254.1.1", 4],
  ["documentation IPv4 DNS answer", "203.0.113.1", 4],
  ["private IPv6 DNS answer", "fd00::1", 6],
  ["link-local IPv6 DNS answer", "fe80::1", 6],
  ["documentation IPv6 DNS answer", "2001:db8::1", 6],
  ["deprecated site-local IPv6 DNS answer", "fec0::1", 6],
  ["discard-only IPv6 DNS answer", "100:0:0:1::1", 6],
] as const) {
  test(`rejects ${name}`, async () => {
    await assert.rejects(() =>
      verifiedProductionSiteOrigin(
        "https://blog.ahmed-mangawy.org",
        async () => [{ address, family }],
      ),
    );
  });
}

test("pins the approved DNS answer for Node and Chromium", async () => {
  let resolverCalls = 0;
  const verified = await verifiedProductionSiteOrigin(
    "https://blog.ahmed-mangawy.org",
    async () => {
      resolverCalls += 1;
      return resolverCalls === 1
        ? [{ address: "93.184.216.34", family: 4 }]
        : [{ address: "192.168.1.1", family: 4 }];
    },
  );
  const resolved = await new Promise<{ address: string; family: number }>(
    (resolveLookup, rejectLookup) =>
      createPinnedLookup(verified)(verified.hostname, {}, (error, address, family) => {
        if (error) rejectLookup(error);
        else resolveLookup({ address: String(address), family: family ?? 0 });
      }),
  );

  assert.equal(resolverCalls, 1);
  assert.deepEqual(resolved, { address: "93.184.216.34", family: 4 });
  assert.equal(
    chromiumHostResolverRules(verified),
    "MAP blog.ahmed-mangawy.org 93.184.216.34, EXCLUDE localhost",
  );
  assert.equal(chromiumHostResolverRules(verified).includes("192.168.1.1"), false);
});

test("aborts a stalled DNS resolver at the configured deadline", async () => {
  let aborted = false;
  const started = Date.now();
  await assert.rejects(
    () =>
      verifiedProductionSiteOrigin(
        "https://blog.ahmed-mangawy.org",
        async (_hostname, { signal }) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener(
              "abort",
              () => {
                aborted = true;
                reject(new Error("resolver aborted"));
              },
              { once: true },
            );
          }),
        25,
      ),
    /SITE_ORIGIN DNS resolution timed out after 25 ms/u,
  );
  assert.ok(Date.now() - started < 1_000);
  assert.equal(aborted, true);
});
