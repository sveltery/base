import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    browserName: 'chromium',
    // Playwright otherwise defaults to launching Chromium without its sandbox.
    launchOptions: { chromiumSandbox: true, executablePath: process.env.DIALOG_CHROMIUM_PATH },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173',
    cwd: './apps/fixtures',
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: false,
  },
});
