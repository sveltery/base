/**
 * Chromium launch options shared by Vitest browser tests and Playwright e2e.
 * Chromium cannot sandbox when it runs as root, as in most containers.
 * `CHROMIUM_EXECUTABLE_PATH` runs a preinstalled Chromium when Playwright's own revision is absent.
 */
export const chromiumLaunchOptions = {
	chromiumSandbox: process.getuid?.() !== 0,
	executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined
};
