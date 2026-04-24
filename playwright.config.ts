import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:4001',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run backend:dev',
      url: 'http://localhost:4000/v1/health',
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command:
        'BACKEND_API_URL=http://localhost:4000 BACKEND_FLAG_ONBOARDING=1 BACKEND_FLAG_INVENTORY=1 BACKEND_FLAG_FINANCE=1 BACKEND_FLAG_REPORTS=1 npm run dev',
      url: 'http://localhost:4001/login',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      // Use system-installed Google Chrome to avoid downloading Playwright browsers
      // (some environments block resolving cdn.playwright.dev).
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
})

