import { test, expect } from "@playwright/test";

test("루트 접속 시 로케일 프리픽스로 리다이렉트", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(ko|en|ja)$/);
  await expect(page.getByRole("heading", { name: "nextjs-16-project-template" })).toBeVisible();
});

test("미인증 상태에서 /admin 접근 시 로그인으로 리다이렉트", async ({ page }) => {
  await page.goto("/ko/admin");
  await expect(page).toHaveURL(/\/ko\/login/);
});
