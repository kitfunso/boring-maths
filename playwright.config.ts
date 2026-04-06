import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for boring-math E2E smoke tests.
 *
 * - Runs against the Astro dev server on port 4321
 * - Tests Chromium and Firefox (WebKit skipped on Windows)
 * - Retries once in CI to reduce flakiness
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  /* Cap workers to avoid overwhelming the Astro dev server */
  workers: process.env.CI ? 1 : 4,
  reporter: 'html',
  timeout: 60_000,

  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
