import { expect, test } from "./utils";

test("dasboard can be logged in", async ({ page, reearth }) => {
  const { userName, teamId, token } = await reearth.initUser();
  await reearth.gotoAndLogin(`/dashboard/${teamId}`, token);

  await expect(page.getByText(`${userName}'s workspace`)).toBeVisible();
});
