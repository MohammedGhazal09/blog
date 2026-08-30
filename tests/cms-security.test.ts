import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";

import {
  assertAllowedCmsPaths,
  MAX_MEDIA_BYTES,
} from "../scripts/validate-cms-change.mjs";
import oauthWorker from "../workers/sveltia-cms-auth/src/index.js";

test("admin shell, pinned bundle, OAuth-only config, and security headers stay intact", () => {
  const index = readFileSync("public/admin/index.html", "utf8");
  const accessibility = readFileSync(
    "public/admin/accessibility.js",
    "utf8",
  );
  const locale = readFileSync("public/admin/locale.js", "utf8");
  const config = readFileSync("public/admin/config.yml", "utf8");
  const headers = readFileSync("public/_headers", "utf8");
  const bundle = readFileSync("public/admin/sveltia-cms.js");
  const wrangler = readFileSync(
    "workers/sveltia-cms-auth/wrangler.toml",
    "utf8",
  );

  assert.match(index, /<html lang="ar" dir="rtl">/u);
  assert.match(index, /<link rel="icon" href="\/favicon\.svg" \/>/u);
  assert.match(index, /src="\/admin\/locale\.js"/u);
  assert.match(index, /src="\/admin\/sveltia-cms\.js"/u);
  assert.match(index, /src="\/admin\/accessibility\.js"/u);
  assert.match(index, /data-cfasync="false"/u);
  assert.ok(
    index.indexOf("/admin/locale.js") <
      index.indexOf("/admin/sveltia-cms.js"),
  );
  assert.ok(
    index.indexOf("/admin/sveltia-cms.js") <
      index.indexOf("/admin/accessibility.js"),
  );
  assert.doesNotMatch(index, /type="module"|sveltia-cms\.css/u);
  assert.match(accessibility, /button\[aria-readonly\]/u);
  assert.match(accessibility, /maximum-scale\|user-scalable/u);
  assert.match(locale, /sveltia-cms\.prefs/u);
  assert.match(locale, /locale: "ar"/u);
  assert.match(config, /auth_methods: \[oauth\]/u);
  assert.match(config, /auth_scope: repo/u);
  assert.match(config, /publish_mode: editorial_workflow/u);
  assert.match(config, /base_url: https:\/\/cms-auth\.example\.invalid/u);
  assert.doesNotMatch(
    config,
    /(?:client_secret|access_token|password)\s*:/iu,
  );
  assert.match(config, /name: draft[\s\S]*?default: true/u);
  assert.match(wrangler, /ALLOWED_DOMAINS = "cms\.example\.invalid"/u);
  assert.match(wrangler, /GITHUB_CLIENT_ID = "replace-before-deploy"/u);
  assert.doesNotMatch(wrangler, /GITHUB_CLIENT_SECRET|client_secret/iu);
  assert.match(headers, /default-src 'none'/u);
  assert.match(
    headers,
    /Cross-Origin-Opener-Policy: same-origin-allow-popups/u,
  );
  assert.match(headers, /X-Robots-Tag: noindex, nofollow, noarchive/u);
  assert.equal(bundle.length, 2_002_028);
  assert.equal(
    createHash("sha256").update(bundle).digest("hex"),
    "124148170fdddf18351d9771697b6b8c17ea12220a029895fa87dd90aadd797b",
  );
});

test("admin locale bootstrap pins Arabic while preserving valid preferences", () => {
  const script = readFileSync("public/admin/locale.js", "utf8");

  for (const [stored, expectedTheme] of [
    [JSON.stringify({ locale: "en-US", theme: "dark" }), "dark"],
    ["not-json", undefined],
  ] as const) {
    let saved = "";
    runInNewContext(script, {
      localStorage: {
        getItem: () => stored,
        setItem: (_key: string, value: string) => {
          saved = value;
        },
      },
    });

    assert.deepEqual(JSON.parse(saved), {
      ...(expectedTheme ? { theme: expectedTheme } : {}),
      locale: "ar",
    });
  }
});

function withRepository(run: (root: string) => void) {
  const root = mkdtempSync(join(tmpdir(), "mangawy-cms-"));
  try {
    mkdirSync(join(root, "src/content/articles"), { recursive: true });
    mkdirSync(join(root, "public/media/articles"), { recursive: true });
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("CMS path boundary accepts direct articles and genuine safe raster media", () => {
  withRepository((root) => {
    writeFileSync(
      join(root, "src/content/articles/مقالة.md"),
      "---\ndraft: true\n---\n",
    );
    writeFileSync(
      join(root, "public/media/articles/pixel.png"),
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]),
    );

    assert.doesNotThrow(() =>
      assertAllowedCmsPaths(
        [
          "src/content/articles/مقالة.md",
          "src/content/articles/deleted.mdx",
          "public/media/articles/pixel.png",
        ],
        root,
      ),
    );
  });
});

test("CMS path boundary rejects code, nesting, unsafe formats, and disguised media", () => {
  withRepository((root) => {
    writeFileSync(
      join(root, "public/media/articles/fake.png"),
      Buffer.from([0xff, 0xd8, 0xff]),
    );

    for (const path of [
      "src/pages/index.astro",
      "src/content/articles/nested/post.md",
      "src/content/articles/.hidden.md",
      "public/media/articles/vector.svg",
      "public/media/articles/page.html",
      "public/media/articles/fake.png",
    ]) {
      assert.throws(() => assertAllowedCmsPaths([path], root), path);
    }
  });
});

test("CMS media boundary rejects empty, oversized, and symbolic-link files", (context) => {
  withRepository((root) => {
    const media = join(root, "public/media/articles");
    writeFileSync(join(media, "empty.webp"), "");
    writeFileSync(
      join(media, "large.jpg"),
      Buffer.alloc(MAX_MEDIA_BYTES + 1, 0xff),
    );
    assert.throws(() =>
      assertAllowedCmsPaths(["public/media/articles/empty.webp"], root),
    );
    assert.throws(() =>
      assertAllowedCmsPaths(["public/media/articles/large.jpg"], root),
    );

    writeFileSync(
      join(root, "outside.png"),
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
    try {
      symlinkSync(join(root, "outside.png"), join(media, "link.png"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EPERM") {
        context.diagnostic(
          "Symlink creation requires Windows Developer Mode; Linux CI covers it.",
        );
        return;
      }
      throw error;
    }
    assert.throws(() =>
      assertAllowedCmsPaths(["public/media/articles/link.png"], root),
    );
  });
});

const oauthEnv = {
  ALLOWED_DOMAINS: "admin.example.com",
  GITHUB_CLIENT_ID: "client-id",
  GITHUB_CLIENT_SECRET: "client-secret",
};

function callbackMessages(
  html: string,
  origin: string,
  sameOpener = true,
): readonly { message: string; targetOrigin: string }[] {
  const script = /<script>([\s\S]*?)<\/script>/u.exec(html)?.[1];
  assert.ok(script, "OAuth callback must contain its handoff script");

  const messages: { message: string; targetOrigin: string }[] = [];
  let listener:
    | ((event: { data: string; origin: string; source: unknown }) => void)
    | undefined;
  const opener = {
    postMessage(message: string, targetOrigin: string) {
      messages.push({ message, targetOrigin });
    },
  };
  const window = {
    opener,
    addEventListener(
      type: string,
      handler: (event: {
        data: string;
        origin: string;
        source: unknown;
      }) => void,
    ) {
      assert.equal(type, "message");
      listener = handler;
    },
  };

  runInNewContext(script, { URL, window });
  assert.ok(listener, "OAuth callback must register its message listener");
  messages.length = 0;
  listener({
    data: "authorizing:github",
    origin,
    source: sameOpener ? opener : {},
  });
  return messages;
}

test("OAuth Worker fails closed without an exact hostname allowlist", async () => {
  for (const ALLOWED_DOMAINS of [
    "",
    "*.example.com",
    "https://admin.example.com",
    "admin.example.com,*.example.com",
    "admin.example.com,",
  ]) {
    const response = await oauthWorker.fetch(
      new Request(
        "https://auth.example.com/auth?provider=github&site_id=admin.example.com",
      ),
      { ...oauthEnv, ALLOWED_DOMAINS },
    );
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.match(
      response.headers.get("content-security-policy") ?? "",
      /default-src 'none'/u,
    );
  }
});

test("OAuth Worker permits only GitHub repo scope and an allowlisted caller", async () => {
  const allowed = await oauthWorker.fetch(
    new Request(
      "https://auth.example.com/auth?provider=github&site_id=admin.example.com&scope=repo",
    ),
    oauthEnv,
  );
  assert.equal(allowed.status, 302);
  const location = new URL(allowed.headers.get("location") ?? "");
  assert.equal(location.origin, "https://github.com");
  assert.equal(location.pathname, "/login/oauth/authorize");
  assert.equal(location.searchParams.get("scope"), "repo");
  assert.match(
    allowed.headers.get("set-cookie") ?? "",
    /^__Host-sveltia-csrf=github_[0-9a-f]{32}; HttpOnly; Path=\/; Max-Age=600; SameSite=Lax; Secure$/u,
  );

  const deniedDomain = await oauthWorker.fetch(
    new Request(
      "https://auth.example.com/auth?provider=github&site_id=attacker.example",
    ),
    oauthEnv,
  );
  assert.match(await deniedDomain.text(), /UNSUPPORTED_DOMAIN/u);

  const deniedProvider = await oauthWorker.fetch(
    new Request(
      "https://auth.example.com/auth?provider=gitlab&site_id=admin.example.com",
    ),
    oauthEnv,
  );
  assert.match(await deniedProvider.text(), /UNSUPPORTED_BACKEND/u);
});

test("OAuth callback rejects CSRF mismatch before token exchange", async () => {
  const response = await oauthWorker.fetch(
    new Request(
      "https://auth.example.com/callback?code=code&state=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      {
        headers: {
          Cookie: "__Host-sveltia-csrf=github_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
      },
    ),
    oauthEnv,
  );
  assert.match(await response.text(), /CSRF_DETECTED/u);
});

test("OAuth callback exchanges at fixed GitHub endpoint and releases token through origin check", async () => {
  const originalFetch = globalThis.fetch;
  let requestUrl = "";
  let requestBody = "";
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestBody = String(init?.body ?? "");
    return Response.json({ access_token: "test-oauth-token" });
  };

  try {
    const state = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const response = await oauthWorker.fetch(
      new Request(
        `https://auth.example.com/callback?code=code&state=${state}`,
        {
          headers: { Cookie: `__Host-sveltia-csrf=github_${state}` },
        },
      ),
      oauthEnv,
    );
    const body = await response.text();
    assert.equal(requestUrl, "https://github.com/login/oauth/access_token");
    assert.match(requestBody, /"client_secret":"client-secret"/u);
    assert.match(body, /test-oauth-token/u);
    assert.ok(body.includes(String.raw`["^admin\\.example\\.com$"]`));
    const allowedMessages = callbackMessages(body, "https://admin.example.com");
    assert.equal(allowedMessages.length, 1);
    assert.equal(allowedMessages[0]?.targetOrigin, "https://admin.example.com");
    assert.match(allowedMessages[0]?.message ?? "", /test-oauth-token/u);

    for (const [origin, sameOpener] of [
      ["http://admin.example.com", true],
      ["https://admin.example.com:8443", true],
      ["https://sub.admin.example.com", true],
      ["https://admin.example.com", false],
    ] as const) {
      assert.deepEqual(callbackMessages(body, origin, sameOpener), []);
    }
    assert.match(response.headers.get("set-cookie") ?? "", /Max-Age=0/u);
    assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("OAuth callback rejects failed or tokenless exchanges", async () => {
  const originalFetch = globalThis.fetch;
  const state = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const request = () =>
    new Request(`https://auth.example.com/callback?code=code&state=${state}`, {
      headers: { Cookie: `__Host-sveltia-csrf=github_${state}` },
    });

  try {
    globalThis.fetch = async () =>
      Response.json({ message: "upstream failure" }, { status: 502 });
    const failed = await oauthWorker.fetch(request(), oauthEnv);
    assert.match(await failed.text(), /TOKEN_REQUEST_FAILED/u);

    globalThis.fetch = async () => Response.json({});
    const tokenless = await oauthWorker.fetch(request(), oauthEnv);
    assert.match(await tokenless.text(), /MALFORMED_RESPONSE/u);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
