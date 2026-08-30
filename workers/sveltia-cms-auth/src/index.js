/**
 * Based on sveltia/sveltia-cms-auth at commit
 * 25f56e1ed4a96cb25fcb96469c9c99fb6d3713bc (source blob
 * 8c4c3beb721245c30b43e8b5e8444be7038f1789).
 *
 * Local hardening: GitHub/repo scope only, exact hostname allowlists only,
 * fail closed when the allowlist is absent, fixed github.com endpoints, and
 * no-store/CSP response headers. See THIRD_PARTY_NOTICES.md.
 */

const supportedProviders = ["github"];

const providerScopes = {
  github: {
    default: "repo",
    separator: ",",
    allowed: ["repo"],
  },
};

const responseSecurityHeaders = {
  "Cache-Control": "no-store",
  "Content-Security-Policy":
    "default-src 'none'; script-src 'unsafe-inline'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

const getScope = (provider, requested) => {
  const { default: fallback, separator, allowed } = providerScopes[provider];
  const scopes = (requested ?? "").split(/[\s,]+/).filter(Boolean);

  if (!scopes.length) {
    return fallback;
  }

  if (scopes.every((scope) => allowed.includes(scope))) {
    return scopes.join(separator);
  }

  console.warn(
    `Ignoring the unsupported "${requested}" scope for ${provider}; requesting "${fallback}".`,
  );

  return fallback;
};

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Only exact ASCII hostnames are accepted. Wildcards, schemes, paths and
 * ports are rejected so a typo cannot broaden token release.
 */
const hostnamePattern =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

const getDomainPatterns = (allowedDomains) => {
  if (typeof allowedDomains !== "string") return [];

  const domains = allowedDomains
    .split(",")
    .map((str) => str.trim().toLowerCase());

  if (
    !domains.length ||
    domains.some((domain) => !hostnamePattern.test(domain))
  ) {
    return [];
  }

  return domains.map((domain) => `^${escapeRegExp(domain)}$`);
};

const serialize = (value) =>
  JSON.stringify(value ?? null).replaceAll("<", "\\u003c");

const outputHTML = ({
  provider = "unknown",
  token,
  error,
  errorCode,
  env = {},
}) => {
  const state = error ? "error" : "success";
  const content = error ? { provider, error, errorCode } : { provider, token };

  return new Response(
    `
      <!doctype html><html><body><script>
        (() => {
          const trustedPatterns = ${serialize(getDomainPatterns(env.ALLOWED_DOMAINS))};

          const isTrusted = (origin) => {
            try {
              const { hostname, port, protocol } = new URL(origin);

              return protocol === 'https:' && !port &&
                trustedPatterns.some((pattern) => new RegExp(pattern).test(hostname));
            } catch {
              return false;
            }
          };

          window.addEventListener('message', ({ data, origin, source }) => {
            if (source !== window.opener || data !== 'authorizing:${provider}') {
              return;
            }

            if (!trustedPatterns.length || !isTrusted(origin)) {
              return;
            }

            window.opener?.postMessage(
              'authorization:${provider}:${state}:${JSON.stringify(content)}',
              origin
            );
          });
          window.opener?.postMessage('authorizing:${provider}', '*');
        })();
      </script></body></html>
    `,
    {
      headers: {
        ...responseSecurityHeaders,
        "Content-Type": "text/html;charset=UTF-8",
        "Set-Cookie":
          "__Host-sveltia-csrf=deleted; HttpOnly; Max-Age=0; Path=/; SameSite=Lax; Secure",
      },
    },
  );
};

const handleAuth = async (request, env) => {
  const { searchParams } = new URL(request.url);
  const {
    provider,
    site_id: domain,
    scope: requestedScope,
  } = Object.fromEntries(searchParams);

  if (!provider || !supportedProviders.includes(provider)) {
    return outputHTML({
      env,
      error: "Your Git backend is not supported by the authenticator.",
      errorCode: "UNSUPPORTED_BACKEND",
    });
  }

  const scope = getScope(provider, requestedScope);
  const { ALLOWED_DOMAINS, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = env;
  const domainPatterns = getDomainPatterns(ALLOWED_DOMAINS);

  if (
    !domainPatterns.some((pattern) =>
      new RegExp(pattern).test((domain ?? "").toLowerCase()),
    )
  ) {
    return outputHTML({
      env,
      provider,
      error: "Your domain is not allowed to use the authenticator.",
      errorCode: "UNSUPPORTED_DOMAIN",
    });
  }

  const csrfToken = globalThis.crypto.randomUUID().replaceAll("-", "");

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return outputHTML({
      env,
      provider,
      error: "OAuth app client ID or secret is not configured.",
      errorCode: "MISCONFIGURED_CLIENT",
    });
  }

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope,
    state: csrfToken,
  });

  return new Response("", {
    status: 302,
    headers: {
      ...responseSecurityHeaders,
      Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
      "Set-Cookie":
        `__Host-sveltia-csrf=${provider}_${csrfToken}; ` +
        "HttpOnly; Path=/; Max-Age=600; SameSite=Lax; Secure",
    },
  });
};

const handleCallback = async (request, env) => {
  const { searchParams } = new URL(request.url);
  const { code, state } = Object.fromEntries(searchParams);

  const [, provider, csrfToken] =
    request.headers
      .get("Cookie")
      ?.match(
        /(?:^|;\s*)__Host-sveltia-csrf=([a-z-]+?)_([0-9a-f]{32})(?:;|$)/,
      ) ?? [];

  if (!provider || !supportedProviders.includes(provider)) {
    return outputHTML({
      env,
      error: "Your Git backend is not supported by the authenticator.",
      errorCode: "UNSUPPORTED_BACKEND",
    });
  }

  if (!code || !state) {
    return outputHTML({
      env,
      provider,
      error: "Failed to receive an authorization code. Please try again later.",
      errorCode: "AUTH_CODE_REQUEST_FAILED",
    });
  }

  if (!csrfToken || state !== csrfToken) {
    return outputHTML({
      env,
      provider,
      error: "Potential CSRF attack detected. Authentication flow aborted.",
      errorCode: "CSRF_DETECTED",
    });
  }

  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = env;

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return outputHTML({
      env,
      provider,
      error: "OAuth app client ID or secret is not configured.",
      errorCode: "MISCONFIGURED_CLIENT",
    });
  }

  let response;
  let token = "";
  let error = "";

  try {
    response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
      }),
    });
  } catch {
    // The generic response below intentionally reveals no provider detail.
  }

  if (!response) {
    return outputHTML({
      env,
      provider,
      error: "Failed to request an access token. Please try again later.",
      errorCode: "TOKEN_REQUEST_FAILED",
    });
  }

  if (!response.ok) {
    return outputHTML({
      env,
      provider,
      error: "Failed to request an access token. Please try again later.",
      errorCode: "TOKEN_REQUEST_FAILED",
    });
  }

  try {
    ({ access_token: token, error } = await response.json());
  } catch {
    return outputHTML({
      env,
      provider,
      error: "Server responded with malformed data. Please try again later.",
      errorCode: "MALFORMED_RESPONSE",
    });
  }

  if (typeof token !== "string" || !token) {
    return outputHTML({
      env,
      provider,
      error: "Server did not return an access token. Please try again later.",
      errorCode: error ? "TOKEN_REQUEST_FAILED" : "MALFORMED_RESPONSE",
    });
  }

  return outputHTML({ env, provider, token });
};

export default {
  async fetch(request, env) {
    if (getDomainPatterns(env.ALLOWED_DOMAINS).length === 0) {
      return new Response("OAuth domain allowlist is not configured.", {
        status: 503,
        headers: responseSecurityHeaders,
      });
    }

    const { pathname } = new URL(request.url);

    if (
      request.method === "GET" &&
      ["/auth", "/oauth/authorize"].includes(pathname)
    ) {
      return handleAuth(request, env);
    }

    if (
      request.method === "GET" &&
      ["/callback", "/oauth/redirect"].includes(pathname)
    ) {
      return handleCallback(request, env);
    }

    return new Response("", { status: 404, headers: responseSecurityHeaders });
  },
};
