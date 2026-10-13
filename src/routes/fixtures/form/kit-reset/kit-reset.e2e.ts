// SvelteKit 3.0.1 keeps a remote form's edited input after a user clicks a reset button.
// Base's Form replays the reset, in src/lib/form/kit-reset-replay.ts.
import { expect, test } from '@playwright/test';
import { debug, open } from '../shared/helpers.js';

test('a reset button inside a Base Form leaves the source at the defaults', async ({ page }) => {
	await open(page, '/fixtures/form/kit-reset');
	const input = page.getByRole('textbox', { name: 'Base name' });
	await expect(input).toHaveValue('Draft');
	await input.fill('Edited');
	await expect.poll(async () => (await debug(page)).base).toEqual({ name: 'Edited' });
	await page.getByRole('button', { name: 'Reset base' }).click();
	await expect(input).toHaveValue('Draft');
	await expect.poll(async () => (await debug(page)).base).toEqual({ name: 'Draft' });
});

test('Kit fixed the reset bug: delete src/lib/form/kit-reset-replay.ts', async ({ page }) => {
	await open(page, '/fixtures/form/kit-reset');
	const input = page.getByRole('textbox', { name: 'Raw name' });
	await input.fill('Edited');
	await expect.poll(async () => (await debug(page)).raw).toEqual({ name: 'Edited' });
	await page.getByRole('button', { name: 'Reset raw' }).click();
	await expect(input).toHaveValue('Draft');
	// Give Kit's input listener time to catch up, so a slow fix is not mistaken for the bug.
	await page.waitForTimeout(200);
	expect(
		(await debug(page)).raw,
		'Kit fixed the reset bug: delete src/lib/form/kit-reset-replay.ts and this canary'
	).toEqual({ name: 'Edited' });
});
