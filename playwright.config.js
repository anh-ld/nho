// @ts-check
import { defineConfig, devices } from "@playwright/test";

const URL = "http://localhost:5173";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  webServer: {
    command: "npm run dev",
    url: URL,
    reuseExistingServer: !process.env.CI,
    timeout: 2000,
  },
  testMatch: "*.e2e.*",
  testDir: "./example",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    trace: "on-first-retry",
    baseURL: URL,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
