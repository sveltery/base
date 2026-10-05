import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    maxWorkers: 1,
    fileParallelism: false,
    retry: 0,
    projects: [
      {
        extends: './vite.config.ts',
        test: {
          name: 'server',
          environment: 'node',
          include: ['tests/*.test.ts'],
        },
      },
      {
        extends: './vite.config.ts',
        resolve: { conditions: ['browser'] },
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['tests/dom/*.test.ts'],
        },
      },
      {
        extends: './vite.config.ts',
        test: {
          name: 'client',
          expect: { requireAssertions: true },
          include: ['tests/browser/*.svelte.test.ts'],
          browser: {
            enabled: true,
            provider: playwright({
              launchOptions: {
                chromiumSandbox: true,
                executablePath: process.env.DIALOG_CHROMIUM_PATH,
              },
            }),
            instances: [{ browser: 'chromium', headless: true }],
          },
        },
      },
    ],
  },
});
