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
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure'
	},
	// Every test runs in Chromium. `*.engines.e2e.ts` also runs in Firefox and WebKit: they check
	// browser behavior the components rely on, such as cancelling the `invalid` bubble.
	projects: [
		{
			name: 'chromium',
			use: { browserName: 'chromium', launchOptions: chromiumLaunchOptions }
		},
		{ name: 'firefox', testMatch: '**/*.engines.e2e.ts', use: { browserName: 'firefox' } },
		{ name: 'webkit', testMatch: '**/*.engines.e2e.ts', use: { browserName: 'webkit' } }
	],
	webServer: {
		// Fixtures import src/lib directly, so the app build is enough; `pnpm run build` also packages
		// the library. Run vite directly: `pnpm exec` detaches the server, so Playwright cannot stop it.
		command: `node node_modules/vite/bin/vite.js build && node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${port} --strictPort`,
		url: `http://127.0.0.1:${port}`,
		reuseExistingServer: false,
		timeout: 180_000
	}
});
