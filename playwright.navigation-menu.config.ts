import base from './playwright.config.js';
import { defineConfig } from '@playwright/test';
export default defineConfig({
  ...base,
  testMatch: /navigation-menu(?:-conformance|-source-sequences|-parts)?\.spec\.ts/,
  projects: [
    { name: 'secured-chromium', use: { browserName: 'chromium', launchOptions: { chromiumSandbox: true } } },
  ],
});
