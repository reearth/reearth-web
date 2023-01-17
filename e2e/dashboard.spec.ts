/* eslint-disable playwright/no-wait-for-timeout */

import { expect, test } from "@reearth/e2e/utils";

test("Dashboard can be logged in", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);

  await expect(page.getByText(`${reearth.userName}'s workspace`)).toBeVisible();
});

test("show many projects", async ({ page, reearth }) => {
  await reearth.initUser();

  for (let i = 0; i < 10; i++) {
    await reearth.gql(
      `mutation ($workspaceId: ID!, $name: String!) {
        createProject(input: {
          teamId: $workspaceId,
          visualizer: CESIUM
          name: $name
        }) {
          project {
            id
            name
          }
        }
      }`,
      {
        name: `Project${i}`,
        workspaceId: reearth.workspaceId,
      },
    );
  }

  await reearth.goto(`/dashboard/${reearth.workspaceId}`);
  await expect(page.getByText("Project9")).toBeVisible();
  await page.getByTestId("dashboard-wrapper").evaluate(node => node.scrollTo(0, node.scrollHeight));

  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(`Project${i}`)).toBeVisible();
  }
});

test("Can create a project ", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);

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

test("Create a new workspace", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);

  await page.locator(".css-hfefqr > .css-xdawb4").click();

  await page.locator('input[name="name"]').click();
  await page.locator('input[name="name"]').fill("Team Workspace");
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("successfully created workspace!")).toBeVisible();
  await page.waitForTimeout(3000);
  await expect(page.getByText("Team workspace's workspace")).toBeVisible();
});

test("Create many workspace", async ({ page, reearth }) => {
  await reearth.initUser();
  for (let i = 0; i < 2; i++) {
    await reearth.gql(
      `mutation CreateTeam($name: String!) {
      createTeam(input:{
        name: $name
      }){
        team{
          id
          name
        }
      }
    }`,
      {
        name: `graphql${i}`,
      },
    );
  }
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);
  await expect(page.getByText(`${reearth.userName}'s workspace`)).toBeVisible();
  await page.waitForTimeout(3000);
});

test("Workspace ", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);
  await expect(page.getByText("reearth's workspace")).toBeVisible();
  await page.getByRole("link").nth(1).click();
  await page.waitForTimeout(3000);
});

test("Header", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);
  await expect(page.getByText("reearth's workspace")).toBeVisible();

  // Display menu Switch workspace
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  await page.waitForTimeout(1000);
  await page.locator("(//p[text()='reearth'])[2]").click();

  // Manage Workspace
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  await page.waitForTimeout(1000);
  await page.locator("(//p[@class='css-1ohhn6c'])[3]").click();

  // logout
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  await page.click("//p[text()='Log out']");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(5000);
});

test.describe("Devices", () => {
  // Use device viewport
  test.use({ viewport: { width: 600, height: 900 } });
  test("Device viewport ", async ({ page, reearth }) => {
    await reearth.initUser();
    await reearth.goto(`/dashboard/${reearth.workspaceId}`);

    console.log(await page.viewportSize()?.width);
    console.log(await page.viewportSize()?.height);

    await expect(page.getByText(`${reearth.userName}'s workspace`)).toBeVisible();
    await page.waitForTimeout(3000);

    await page.locator(".css-gfu9bm").click();
    await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
      strict: true,
    });
    await page.click("//p[text()='Log out']");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(5000);
  });
});
