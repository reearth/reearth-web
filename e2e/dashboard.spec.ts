import { expect, test } from "@reearth/e2e/utils";

test("dasboard can be logged in", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);

  await expect(page.getByText(`${reearth.userName}'s workspace`)).toBeVisible();
});

test("can create a project", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);

  await page.getByRole("button", { name: "New project" }).click();

  await page.locator('input[name="name"]').fill("Test");

  await page.locator('textarea[name="description"]').fill("test description");

  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("Test")).toBeVisible();
  await expect(page.getByText("test description2")).toBeVisible();
});
