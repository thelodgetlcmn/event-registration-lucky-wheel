import { expect, test } from "@playwright/test";

test("registration page renders the primary form", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "ลงทะเบียนเข้าร่วมงาน" })).toBeVisible();
  await expect(page.getByLabel("ชื่อ")).toBeVisible();
  await expect(page.getByLabel("นามสกุล")).toBeVisible();
  await expect(page.getByRole("button", { name: "ลงทะเบียน" })).toBeVisible();
});
