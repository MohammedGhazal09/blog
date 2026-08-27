import assert from "node:assert/strict";
import test from "node:test";

import { productionSiteOrigin } from "../src/lib/site-origin.ts";

const validOrigins = [
  ["root HTTPS origin", "https://blog.ahmed-mangawy.org", "https://blog.ahmed-mangawy.org"],
  ["trailing slash", "https://blog.ahmed-mangawy.org/", "https://blog.ahmed-mangawy.org"],
  ["uppercase host", "https://BLOG.AHMED-MANGAWY.ORG", "https://blog.ahmed-mangawy.org"],
  ["default HTTPS port", "https://blog.ahmed-mangawy.org:443", "https://blog.ahmed-mangawy.org"],
  ["non-default HTTPS port", "https://blog.ahmed-mangawy.org:8443", "https://blog.ahmed-mangawy.org:8443"],
] as const;

for (const [name, raw, expected] of validOrigins) {
  test(`normalizes ${name}`, () => {
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
