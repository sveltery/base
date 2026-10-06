import { defineConfig } from '@playwright/test';
import componentConfig from './playwright.config.js';
export default defineConfig({
  ...componentConfig,
  testDir: './tests/docs-browser',
  testMatch: 'docs-standalone.spec.ts',
  outputDir: '.checks/docs-browser/test-results',
  use: { ...componentConfig.use, baseURL: 'http://127.0.0.1:5178' },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5178 --strictPort',
    cwd: './apps/docs',
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    url: 'http://127.0.0.1:5178/docs/',
    reuseExistingServer: false,
  },
});
