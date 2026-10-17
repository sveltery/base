// The server spec (slider-ssr.spec.ts) covers the script body in server-rendered HTML.
import { page } from 'vitest/browser';
import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SliderHarness from '../../tests/SliderHarness.svelte';

it('renders no prehydration script in a client-only mount', async () => {
	render(SliderHarness, { defaultValue: 20, thumbAlignment: 'edge' });
	expect(page.getByTestId('thumb').element().querySelector('script')).toBeNull();
});
