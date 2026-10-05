import base from './playwright.navigation-menu.config.js';
import { defineConfig } from '@playwright/test';
// Optional engine evidence is independent of the standard secured Chromium gate.
export default defineConfig({
  ...base,
  projects: [{ name: 'webkit', use: { browserName: 'webkit' } }],
});
