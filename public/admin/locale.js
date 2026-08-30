(() => {
  const preferenceKey = "sveltia-cms.prefs";
  let preferences = {};

  try {
    const stored = JSON.parse(localStorage.getItem(preferenceKey) ?? "{}");
    if (stored && typeof stored === "object" && !Array.isArray(stored)) {
      preferences = stored;
    }
  } catch {}

  try {
    localStorage.setItem(
      preferenceKey,
      JSON.stringify({ ...preferences, locale: "ar" }),
    );
  } catch {}
})();
