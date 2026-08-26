import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "article-journey.spec.ts",
  outputDir: ".artifacts/playwright/output",
  snapshotPathTemplate:
    ".artifacts/playwright/snapshots/{testFilePath}/{arg}{ext}",
  reporter: [
    ["html", { outputFolder: ".artifacts/playwright/report", open: "never" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run preview -- --host 127.0.0.1",
    env: { ASTRO_PREVIEW_BACKGROUND: "0" },
    url: "http://127.0.0.1:4321/القضايا-العامة/اختبار-عقد-المحتوى/",
    reuseExistingServer: false,
  },
});
