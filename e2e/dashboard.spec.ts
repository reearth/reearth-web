import { expect, test } from "./utils";

test("dasboard can be logged in", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.teamId}`);

  await expect(page.getByText(`${reearth.userName}'s workspace`)).toBeVisible();
});
