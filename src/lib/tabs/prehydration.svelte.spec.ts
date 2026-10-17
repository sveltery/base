// The server spec (tabs-ssr.spec.ts) covers the script body in server-rendered HTML.
import { page } from 'vitest/browser';
import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TabsHarness from '../../tests/TabsHarness.svelte';

it('renders no prehydration script in a client-only mount', async () => {
	render(TabsHarness, {
		passValue: true,
		value: 0,
		showIndicator: true,
		indicatorBeforeHydration: true
	});
	const indicator = page.getByTestId('indicator').element();
	expect(indicator.nextElementSibling).toBeNull();
});
