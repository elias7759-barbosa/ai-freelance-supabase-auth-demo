import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  use: { baseURL: process.env.E2E_BASE_URL || 'http://localhost:3007', trace: 'off', screenshot: 'off', video: 'off' },
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: process.env.E2E_PRODUCTION ? 'npm run start -- --port 3007' : 'npm run dev -- --port 3007',
    url: 'http://localhost:3007',
    reuseExistingServer: !process.env.CI,
    timeout: 90_000,
  },
});
