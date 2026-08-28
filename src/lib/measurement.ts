export function plausibleScriptSource(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0 || raw !== raw.trim()) {
    throw new Error(
      "PLAUSIBLE_SCRIPT_SRC must be an explicit clean Plausible asset URL",
    );
  }

  const url = new URL(raw);
  if (
    url.href !== raw ||
    url.protocol !== "https:" ||
    url.hostname !== "plausible.io" ||
    url.port !== "" ||
    url.username !== "" ||
    url.password !== "" ||
    url.search !== "" ||
    url.hash !== "" ||
    !/^\/js\/pa-[A-Za-z0-9_-]+\.js$/u.test(url.pathname)
  ) {
    throw new Error("PLAUSIBLE_SCRIPT_SRC is not a current Plausible asset URL");
  }

  return url.href;
}
