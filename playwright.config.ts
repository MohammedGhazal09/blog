import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: ".artifacts/playwright/output",
  snapshotPathTemplate:
    ".artifacts/playwright/snapshots/{testFilePath}/{arg}{ext}",
  reporter: [
    ["html", { outputFolder: ".artifacts/playwright/report", open: "never" }],
  ],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "development-proof",
      testMatch: "article-journey.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://127.0.0.1:4321",
      },
    },
    {
      name: "production-discovery",
      testMatch: ["discovery.spec.ts", "search-discovery.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://127.0.0.1:4322",
      },
    },
  ],
  webServer: [
    {
      command: "npm run dev -- --host 127.0.0.1 --port 4321",
      env: {
        ASTRO_DEV_BACKGROUND: "0",
        ASTRO_PREVIEW_BACKGROUND: "0",
      },
      url: "http://127.0.0.1:4321/القضايا-العامة/اختبار-عقد-المحتوى/",
      reuseExistingServer: false,
    },
    {
      command: "npm run preview -- --host 127.0.0.1 --port 4322",
      env: {
        ASTRO_DEV_BACKGROUND: "0",
        ASTRO_PREVIEW_BACKGROUND: "0",
      },
      url: "http://127.0.0.1:4322/",
      reuseExistingServer: false,
    },
  ],
});
