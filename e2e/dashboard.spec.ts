/* eslint-disable playwright/no-wait-for-timeout */

import { expect, test } from "@reearth/e2e/utils";

test("Dashboard can be logged in", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);

  await expect(page.getByText(`${reearth.userName}'s workspace`)).toBeVisible();
});

test("1. Create a project ", async ({ page, reearth }) => {
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

  // logout
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  await page.click("//p[text()='Log out']");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(5000);
});

test("2. show many projects", async ({ page, reearth }) => {
  await reearth.initUser();

  for (let i = 0; i < 10; i++) {
    await reearth.gql(
      `mutation ($workspaceId: ID!, $name: String!) {
        createProject(input: {
          workspaceId: $workspaceId,
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

  // logout
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  await page.click("//p[text()='Log out']");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(5000);
});

test("3. Create a new workspace", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);

  await page.locator(".css-hfefqr > .css-xdawb4").click();

  await page.locator('input[name="name"]').click();
  await page.locator('input[name="name"]').fill("Team Workspace");
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("successfully created workspace!")).toBeVisible();
  await page.waitForTimeout(3000);
  await expect(page.getByText("Team workspace's workspace")).toBeVisible();

  // logout
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  await page.click("//p[text()='Log out']");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(5000);
});

test("4. Create many workspaces", async ({ page, reearth }) => {
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

  // logout
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  await page.click("//p[text()='Log out']");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(5000);
});

test("5. Workspace UI", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);
  await expect(page.getByText("reearth's workspace")).toBeVisible();
  await page.getByRole("link").nth(1).click();
  await page.waitForTimeout(3000);

  // logout
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  await page.click("//p[text()='Log out']");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(5000);
});

test("6. Project Card UI", async ({ page, reearth }) => {
  await reearth.initUser();

  for (let i = 0; i < 10; i++) {
    await reearth.gql(
      `mutation ($workspaceId: ID!, $name: String!) {
        createProject(input: {
          workspaceId: $workspaceId,
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

  // logout
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  await page.click("//p[text()='Log out']");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(5000);
});

test("7. Header", async ({ page, reearth }) => {
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

test.describe("8. For Device UI ", () => {
  // Use device viewport
  test.use({ viewport: { width: 600, height: 900 } });
  test("Device viewport ", async ({ page, reearth }) => {
    await reearth.initUser();
    await reearth.goto(`/dashboard/${reearth.workspaceId}`);

    await expect(page.getByText(`${reearth.userName}'s workspace`)).toBeVisible();
    await page.waitForTimeout(3000);

    //Logout
    await page.locator(".css-gfu9bm").click();
    await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
      strict: true,
    });
    await page.click("//p[text()='Log out']");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(5000);
  });
});

test("9. Setting Page PC", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);
  await expect(page.getByText(`${reearth.userName}'s workspace`)).toBeVisible();

  // Display menu
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  //Click Account Setting
  await page.click("//p[text()='Account Settings']");
  await page.waitForTimeout(3000);

  // logout
  await page.click("a.css-1m66tq4");
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  await page.click("//p[text()='Log out']");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(5000);
});

test.describe("10. Setting Page Devices", () => {
  // Use device viewport
  test.use({ viewport: { width: 600, height: 900 } });
  test("Device", async ({ page, reearth }) => {
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
    //Click Account Setting
    await page.click("//p[text()='Account Settings']");
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

test("11. Account Setting ", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);
  await expect(page.getByText(`${reearth.userName}'s workspace`)).toBeVisible();

  // Display menu
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });

  //Click Account Setting
  await page.click("//p[text()='Account Settings']");
  await page.waitForTimeout(3000);

  //Service language switch
  await page.click("(//div[@class='css-1sg2lsz'])[2]");
  await page.waitForTimeout(1000);
  await page.click("p.css-yq6c8e");
  await page
    .locator("ul.css-bylfny")
    .locator("li", {
      hasText: "日本語",
    })
    .click();
  await page.waitForTimeout(1000);
  await page.locator(".css-1sg2lsz > svg:nth-child(2)").click();

  //Color theme switch
  await page.click("(//div[@class='css-1sg2lsz'])[3]");
  await page.waitForTimeout(1000);
  await page.locator("//p[text()='未設定']").click();
  await page.locator('li:has-text("ダークテーマ")').click();
  await page.waitForTimeout(1000);
  await page.locator(".css-1sg2lsz > svg:nth-child(2)").click();

  //logout
  await page.click("(//div[@class='css-1diyz6t']//div)[3]");
  await page.click("a.css-1m66tq4");
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  // await page.click("//p[text()='Log out']");
  await page.click("(//div[@class='css-bekbuq']//p)[3]");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(5000);
});

test("12. Workspace List setting", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);
  await expect(page.getByText(`${reearth.userName}'s workspace`)).toBeVisible();

  // Display menu
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  //Click Account Setting
  await page.click("//p[text()='Account Settings']");
  await page.waitForTimeout(1000);

  // Click Workspace List
  await page.click("//p[text()='Workspace List']");

  // Create a new Workspace
  await page.click("//button[@class='css-2ner9m']//p[1]");
  await page.locator("input[name='name']").click();
  await page.locator("input[name='name']").fill("Test Workspace");
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("Sucessfully created a workspace!")).toBeVisible();
  await page.waitForTimeout(3000);

  // logout
  await page.click("a.css-1m66tq4");
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  await page.click("//p[text()='Log out']");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(5000);
});

test("13. Workspace detail setting", async ({ page, reearth }) => {
  await reearth.initUser();

  // Create many workspace with graphql connection
  for (let i = 0; i < 5; i++) {
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
        name: `Test Workspace${i}`,
      },
    );
  }
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);
  await expect(page.getByText(`${reearth.userName}'s workspace`)).toBeVisible();

  // Display menu
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  //Click Account Setting
  await page.click("//p[text()='Account Settings']");
  await page.waitForTimeout(1000);

  // Click Workspace List
  await page.click("//p[text()='Workspace List']");
  await page.waitForTimeout(3000);

  // Change workspace Name
  await page.click("//p[text()='Test Workspace0']");
  await page.waitForTimeout(1000);
  await page.click("//div[@class='css-1diyz6t']//div[1]");
  await page.waitForTimeout(1000);
  await page.locator("input.css-1ptp0fq").press("Enter");
  await page.locator("input.css-1ptp0fq").fill("Test Workspace");
  await page.waitForTimeout(1000);
  await page.locator(".css-1sg2lsz > svg:nth-child(2)").click();

  // Delete Workspace
  await page.click("//p[text()='Test Workspace']");
  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: "Delete workspace" }).click();
  await page.locator("input.css-rmv8ry").click();
  await page.locator("input.css-rmv8ry").fill("Test Workspace");
  await page.locator('input[type="text"]').press("Enter");
  await page.getByRole("button", { name: "I am sure I want to delete this workspace." }).click();
  await expect(page.getByText("Workspace was successfully deleted.")).toBeVisible();

  // logout
  await page.click("a.css-1m66tq4");
  await page.locator(".css-gfu9bm").click();
  await page.hover("div[class='css-gfu9bm'] p[class='css-1ohhn6c']", {
    strict: true,
  });
  await page.click("//p[text()='Log out']");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);
});

test("14. Members management", async ({ page, reearth }) => {
  await reearth.initUser();

  // Create many workspace with graphql connection
  for (let x = 0; x < 5; x++) {
    await reearth.gql(
      ` mutation CreateTeam($name: String!){
      createTeam(input:{
        name: $name
      }){
        team{
          id
          name
          members{
            user{
              id
              name
              email
            }
          }
        }
        
      }
    }`,
      {
        name: `Test Members${x}`,
      },
    );
  }
  await reearth.goto(`/dashboard/${reearth.workspaceId}`);
  await expect(page.getByText(`${reearth.userName}'s workspace`)).toBeVisible();

  await page.locator('header:has-text("rreearth") svg').click();
  await page.waitForTimeout(1000);

  //Click Account Setting
  await page.getByRole("link", { name: "Account Settings" }).click();
  await page.waitForTimeout(1000);

  await page.getByRole("link", { name: "reearth" }).click();
  await page.waitForTimeout(1000);

  // Click Workspace List
  await page.getByRole("link", { name: "Workspace List" }).click();
  await page.waitForTimeout(1000);

  // Click Workspace
  await page.getByText("Test Members0").click();
  await page.waitForTimeout(1000);

  //Return to Test Members0 menu
  await page.locator('header:has-text("rreearthTest Members0")').getByRole("link").click();
  await page.waitForTimeout(1000);

  // Logout
  await page.locator('header:has-text("rreearthTest Members0") svg').click();
  await page.locator('li:has-text("Log out") div').click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);
});
