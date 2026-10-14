// The server spec (slider-ssr.spec.ts) covers the script body in server-rendered HTML.
import { page } from 'vitest/browser';
import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SliderHarness from '../../tests/SliderHarness.svelte';

it('renders an empty prehydration script in the browser', async () => {
	render(SliderHarness, { defaultValue: 20, thumbAlignment: 'edge' });
	const script = page.getByTestId('thumb').element().querySelector('script');
	expect(script?.outerHTML).toBe('<script></script>');
});
