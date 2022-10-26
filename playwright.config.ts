import { type PlaywrightTestConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const config: PlaywrightTestConfig = {
  use: {
    baseURL: process.env.REEARTH_WEB_E2E_BASEURL || "http://localhost:3000/",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  reporter: process.env.CI ? "github" : "list",
};

export default config;
