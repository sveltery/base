import { defineConfig } from '@playwright/test';
import { chromiumLaunchOptions } from './scripts/chromium.js';

const port = Number(process.env.E2E_PORT ?? 4173);

export default defineConfig({
	testMatch: '**/*.e2e.{ts,js}',
	outputDir: process.env.E2E_OUTPUT_DIR ?? 'test-results',
	reporter: [['list']],
	fullyParallel: true,
	retries: 0,
	use: {
		baseURL: `http://127.0.0.1:${port}`,
		browserName: 'chromium',
		launchOptions: chromiumLaunchOptions,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure'
	},
	webServer: {
		// Fixtures import src/lib directly, so the app build is enough; `pnpm run build` also packages
		// the library. Run vite directly: `pnpm exec` detaches the server, so Playwright cannot stop it.
		command: `node node_modules/vite/bin/vite.js build && node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${port} --strictPort`,
		url: `http://127.0.0.1:${port}`,
		reuseExistingServer: false,
		timeout: 180_000
	}
});
