import { type PlaywrightTestConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const localHost = "http://localhost:3000";
const isLocal =
  !process.env.REEARTH_WEB_E2E_BASEURL || process.env.REEARTH_WEB_E2E_BASEURL.includes(localHost);

const config: PlaywrightTestConfig = {
  ...(isLocal
    ? {
        webServer: {
          command: "yarn start",
          url: localHost,
        },
      }
    : {}),
  use: {
    baseURL: process.env.REEARTH_WEB_E2E_BASEURL || localHost,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  testDir: "e2e",
  globalSetup: "./e2e/utils/setup.ts",
  reporter: process.env.CI ? "github" : "list",
};

export default config;
