import { defineConfig, devices } from '@playwright/test';
import { loadConfig } from '@core/config/AppConfig';

const config = loadConfig();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }], ['allure-playwright', { resultsDir: 'allure-results' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'ui',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], baseURL: config.ui.baseUrl },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: config.api.baseUrl },
    },
  ],
});
