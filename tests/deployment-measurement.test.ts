import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createServer, type Server } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import test from "node:test";

import { chromium, type Browser, type Page } from "@playwright/test";

const CONTROLLED_ORIGIN = "https://blog.ahmed-mangawy.org";
const CONTROLLED_PLAUSIBLE_SCRIPT_SRC =
  "https://plausible.io/js/pa-FAKE_TEST_FIXTURE_DO_NOT_DEPLOY.js";
const ARTICLE_PATH = "/القضايا-العامة/الاستقلال-في-الخلافات-العامة/";
const PLAUSIBLE_EVENT_ENDPOINT = "https://plausible.io/api/event";
const DIST_ROOT = resolve("dist");

type WiringAttempt = {
  name: string;
  props?: { url?: string };
};

const vendorStub = `
const send = (payload) => fetch("${PLAUSIBLE_EVENT_ENDPOINT}", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
  keepalive: true,
});
send({ name: "pageview", url: location.href });
document.addEventListener("click", (event) => {
  const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!(link instanceof HTMLAnchorElement)) return;
  const destination = new URL(link.href);
  if (destination.origin === location.origin) return;
  send({ name: "Outbound Link: Click", props: { url: destination.href } });
}, true);
`;

function npmRun(script: string, extraEnv: NodeJS.ProcessEnv = {}) {
  const npmCli = process.env.npm_execpath;
  assert.ok(npmCli, "npm_execpath must identify the pinned npm CLI");
  return spawnSync(process.execPath, [npmCli, "run", script], {
    encoding: "utf8",
    env: { ...process.env, ...extraEnv },
  });
}

function output(result: ReturnType<typeof npmRun>): string {
  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
}

function contentType(path: string): string {
  return (
    {
      ".css": "text/css; charset=utf-8",
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".svg": "image/svg+xml",
      ".xml": "application/xml; charset=utf-8",
    }[extname(path)] ?? "application/octet-stream"
  );
}

async function serveDist(): Promise<{ origin: string; server: Server }> {
  const server = createServer((request, response) => {
    const pathname = decodeURIComponent(
      new URL(request.url ?? "/", "http://local").pathname,
    );
    let path = resolve(DIST_ROOT, `.${pathname}`);
    if (!path.startsWith(`${DIST_ROOT}${sep}`) && path !== DIST_ROOT) {
      response.writeHead(400).end();
      return;
    }
    if (existsSync(path) && statSync(path).isDirectory())
      path = resolve(path, "index.html");
    let status = 200;
    if (!existsSync(path)) {
      path = resolve(DIST_ROOT, "404.html");
      status = 404;
    }
    response.writeHead(status, { "content-type": contentType(path) });
    response.end(readFileSync(path));
  });
  await new Promise<void>((resolveListen) =>
    server.listen(0, "127.0.0.1", resolveListen),
  );
  const address = server.address();
  assert.ok(address && typeof address === "object");
  return { origin: `http://127.0.0.1:${address.port}`, server };
}

async function closeServer(server: Server | undefined): Promise<void> {
  if (!server) return;
  await new Promise<void>((resolveClose, reject) =>
    server.close((error) => (error ? reject(error) : resolveClose())),
  );
}

async function waitFor(condition: () => boolean): Promise<void> {
  const deadline = Date.now() + 5_000;
  while (!condition()) {
    if (Date.now() >= deadline)
      throw new Error("timed out waiting for wiring attempt");
    await new Promise((resolveWait) => setTimeout(resolveWait, 25));
  }
}

async function installControlledVendor(
  page: Page,
  attempts: WiringAttempt[],
): Promise<void> {
  await page.route(CONTROLLED_PLAUSIBLE_SCRIPT_SRC, (route) =>
    route.fulfill({ body: vendorStub, contentType: "text/javascript" }),
  );
  await page.route(PLAUSIBLE_EVENT_ENDPOINT, async (route) => {
    attempts.push(route.request().postDataJSON() as WiringAttempt);
    await route.fulfill({ status: 202, body: "ok" });
  });
}

test("controlled Plausible seam observes one direct CTA attempt and no player attempt", async () => {
  const launch = npmRun("launch:ready", {
    SITE_ORIGIN: CONTROLLED_ORIGIN,
    PLAUSIBLE_SCRIPT_SRC: CONTROLLED_PLAUSIBLE_SCRIPT_SRC,
  });
  assert.equal(launch.status, 0, output(launch));

  let server: Server | undefined;
  let browser: Browser | undefined;
  try {
    const served = await serveDist();
    server = served.server;
    browser = await chromium.launch({ headless: true });

    const directAttempts: WiringAttempt[] = [];
    const directPage = await browser.newPage();
    await installControlledVendor(directPage, directAttempts);
    let directDestination = "";
    await directPage.route("https://www.youtube.com/watch?*", async (route) => {
      directDestination = route.request().url();
      await route.fulfill({
        contentType: "text/html; charset=utf-8",
        body: "<!doctype html><title>controlled YouTube navigation</title>",
      });
    });
    await directPage.goto(`${served.origin}${ARTICLE_PATH}`);
    await waitFor(
      () => directAttempts.filter(({ name }) => name === "pageview").length === 1,
    );
    await directPage
      .getByRole("link", { name: "مشاهدة الفيديو على يوتيوب" })
      .click();
    await waitFor(
      () =>
        directAttempts.filter(({ name }) => name === "Outbound Link: Click")
          .length === 1 && directDestination !== "",
    );
    const outbound = directAttempts.filter(
      ({ name }) => name === "Outbound Link: Click",
    );
    assert.equal(outbound.length, 1);
    assert.equal(outbound[0].props?.url, directDestination);

    const playerAttempts: WiringAttempt[] = [];
    const playerPage = await browser.newPage();
    await installControlledVendor(playerPage, playerAttempts);
    await playerPage.route("https://www.youtube-nocookie.com/**", (route) =>
      route.fulfill({ contentType: "text/html", body: "<!doctype html>" }),
    );
    await playerPage.goto(`${served.origin}${ARTICLE_PATH}`);
    await waitFor(() =>
      playerAttempts.some(({ name }) => name === "pageview"),
    );
    await playerPage
      .getByRole("button", { name: "تشغيل الفيديو هنا" })
      .click();
    await playerPage.locator("iframe").waitFor();
    assert.equal(
      playerAttempts.filter(({ name }) => name === "Outbound Link: Click")
        .length,
      0,
    );

    const blockedPage = await browser.newPage();
    let blockedAssetRequests = 0;
    let blockedDirectDestination = "";
    await blockedPage.route(CONTROLLED_PLAUSIBLE_SCRIPT_SRC, (route) => {
      blockedAssetRequests += 1;
      return route.abort("blockedbyclient");
    });
    await blockedPage.route("https://www.youtube-nocookie.com/**", (route) =>
      route.fulfill({ contentType: "text/html", body: "<!doctype html>" }),
    );
    await blockedPage.route("https://www.youtube.com/watch?*", async (route) => {
      blockedDirectDestination = route.request().url();
      await route.fulfill({
        contentType: "text/html; charset=utf-8",
        body: "<!doctype html><title>controlled YouTube navigation</title>",
      });
    });
    await blockedPage.goto(`${served.origin}${ARTICLE_PATH}`);
    assert.equal(blockedAssetRequests, 1);
    await assert.doesNotReject(async () => {
      assert.equal(
        await blockedPage.locator("html").getAttribute("lang"),
        "ar",
      );
      assert.equal(
        await blockedPage.locator("html").getAttribute("dir"),
        "rtl",
      );
      assert.match(
        await blockedPage.locator("body").innerText(),
        /[\u0600-\u06ff]/u,
      );
      const player = blockedPage.getByRole("button", {
        name: "تشغيل الفيديو هنا",
      });
      await player.focus();
      assert.equal(
        await player.evaluate((node) => node === document.activeElement),
        true,
      );
      await player.click();
      await blockedPage.locator("iframe").waitFor();
      const direct = blockedPage.getByRole("link", {
        name: "مشاهدة الفيديو على يوتيوب",
      });
      await direct.focus();
      assert.equal(
        await direct.evaluate((node) => node === document.activeElement),
        true,
      );
      await direct.click();
      await waitFor(() => blockedDirectDestination !== "");
    });
  } finally {
    await browser?.close();
    await closeServer(server);
    const ordinaryEnv = { ...process.env };
    delete ordinaryEnv.SITE_ORIGIN;
    delete ordinaryEnv.PLAUSIBLE_SCRIPT_SRC;
    const npmCli = process.env.npm_execpath;
    assert.ok(npmCli, "npm_execpath must identify the pinned npm CLI");
    const restored = spawnSync(process.execPath, [npmCli, "run", "build"], {
      encoding: "utf8",
      env: ordinaryEnv,
    });
    assert.equal(restored.status, 0, output(restored));
    assert.match(
      readFileSync("dist/index.html", "utf8"),
      /http:\/\/127\.0\.0\.1:4322/u,
    );
    for (const path of ["dist/index.html", "dist/404.html"])
      assert.doesNotMatch(readFileSync(path, "utf8"), /plausible\.io/iu);
  }
});
