import { expect, test } from "@reearth/e2e/utils";

test("Dashboard can be logged in", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.teamId}`);

  await expect(page.getByText(`${reearth.userName}'s workspace`)).toBeVisible();
});
test("Can create a project ", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.teamId}`);

  await page.locator(".css-xdawb4").first().click();

  await page.locator('input[name="name"]').click();

  await page.locator('input[name="name"]').fill("Test");

  await page.locator('textarea[name="description"]').click();
  await page.locator('textarea[name="description"]').fill("test description");
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("Test")).toBeVisible();
  await expect(page.getByText("test description")).toBeVisible();
  await page.locator(".css-19kfshh").first().click();
});
