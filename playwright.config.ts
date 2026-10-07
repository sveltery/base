import { defineConfig } from '@playwright/test';

const port = Number(process.env.E2E_PORT ?? 4173);

export default defineConfig({
	testMatch: '**/*.e2e.{ts,js}',
	outputDir: process.env.E2E_OUTPUT_DIR ?? 'test-results',
	reporter: [['list']],
	workers: 1,
	retries: 0,
	use: {
		baseURL: `http://127.0.0.1:${port}`,
		browserName: 'chromium',
		launchOptions: { chromiumSandbox: true },
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure'
	},
	webServer: {
		// Run vite directly: `pnpm exec` detaches the server, so Playwright cannot stop it.
		command: `pnpm run build && node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${port} --strictPort`,
		url: `http://127.0.0.1:${port}`,
		reuseExistingServer: false,
		timeout: 180_000
	}
});
