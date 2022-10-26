import { test, expect } from "@playwright/test";

import { initUser } from "./utils";

test("dasboard can be logged in", async ({ page }) => {
  const { userName, teamId } = await initUser();
  await page.goto(`/dashboard/${teamId}`);

  await expect(page.getByText(`${userName}'s workspace`)).toBeVisible();
});
