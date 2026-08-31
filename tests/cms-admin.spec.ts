import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Arabic RTL CMS login loads from pinned local assets with OAuth only", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  const failedLocalRequests: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    if (new URL(request.url()).hostname === "127.0.0.1") {
      failedLocalRequests.push(request.url());
    }
  });

  const response = await page.goto("/admin/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page).toHaveTitle("إدارة مدونة أحمد المنجاوي");
  await expect(
    page.locator('meta[name="robots"][content="noindex, nofollow, noarchive"]'),
  ).toHaveCount(1);
  expect(
    await page
      .locator('meta[name="robots"]')
      .evaluateAll((nodes) =>
        nodes.every((node) =>
          (node.getAttribute("content") ?? "")
            .split(/\s*,\s*/u)
            .includes("noindex"),
        ),
      ),
  ).toBe(true);

  const adminMain = page.locator("main#nc-root");
  await expect(adminMain).toHaveCount(1);
  const login = adminMain.getByRole("button", {
    name: /تسجيل الدخول باستخدام\s*\p{Cf}*GitHub\p{Cf}*/u,
  });
  await expect(login).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByText("رمز الوصول الشخصي", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("إدارة مدونة أحمد المنجاوي", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await login.focus();
  await expect(login).toBeFocused();
  await page.waitForTimeout(250);
  const loginFocus = await login.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      height: element.getBoundingClientRect().height,
      outlineColor: style.outlineColor,
      outlineWidth: Number.parseFloat(style.outlineWidth),
    };
  });
  expect(loginFocus.height).toBeGreaterThanOrEqual(44);
  expect(loginFocus.outlineWidth).toBeGreaterThanOrEqual(2);
  expect(loginFocus.outlineColor).not.toBe("rgba(0, 0, 0, 0)");
  await expect(page.locator("button[aria-readonly]")).toHaveCount(0);
  expect(
    await page
      .locator('meta[name="viewport"]')
      .evaluateAll((nodes) =>
        nodes.every(
          (node) =>
            !/(?:maximum-scale|user-scalable)\s*=/iu.test(
              node.getAttribute("content") ?? "",
            ),
        ),
      ),
  ).toBe(true);

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);

  const script = page.locator('script[src="/admin/sveltia-cms.js"]');
  await expect(script).toHaveAttribute("data-cfasync", "false");
  await expect(script).not.toHaveAttribute("type", "module");
  expect(pageErrors).toEqual([]);
  expect(failedLocalRequests).toEqual([]);
});
