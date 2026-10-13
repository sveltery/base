// Scenario 2: a form action with parseForm on the server and actionForm on the page.
import { expect, test } from '@playwright/test';
import { describeSignup } from '../shared/signup-specs.js';

describeSignup('action');

test('prototype-polluting field names are rejected', async ({ page, baseURL }) => {
	const headers = { origin: baseURL!, accept: 'application/json', 'x-sveltekit-action': 'true' };
	const polluted = await page.request.post('/fixtures/form/action', {
		form: { '__proto__.polluted': 'yes', email: 'a@b.co', name: 'Al', 'n:age': '30' },
		headers
	});
	expect(polluted.status()).toBe(400);
	const ok = await page.request.post('/fixtures/form/action', {
		form: { email: 'a@b.co', name: 'Al', 'n:age': '30' },
		headers
	});
	expect(await ok.json()).toMatchObject({ type: 'success', status: 200 });
});
