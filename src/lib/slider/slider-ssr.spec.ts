// Upstream PrehydrationScript reads `useCSPContext().nonce` for the edge-alignment script.
// Base UI v1.8.0 commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import SliderSsrHarness from '../../tests/SliderSsrHarness.svelte';

describe('Slider SSR prehydration script', () => {
	it('carries the CSPProvider nonce', () => {
		const body = render(SliderSsrHarness, { props: { nonce: 'r4nd0m' } }).body;

		expect(body).toContain('<script nonce="r4nd0m">!function(){');
	});

	it('escapes the nonce as an attribute value', () => {
		const body = render(SliderSsrHarness, { props: { nonce: 'a"b&c' } }).body;

		expect(body).toContain('<script nonce="a&quot;b&amp;c">!function(){');
	});

	it('has no nonce without a provider', () => {
		const body = render(SliderSsrHarness, { props: { provider: false } }).body;

		expect(body).toContain('<script>!function(){');
	});

	it('renders the script only in the last thumb', () => {
		const body = render(SliderSsrHarness, { props: { range: true } }).body;

		expect(body.match(/<script/g)).toHaveLength(1);
		expect(body.indexOf('<script')).toBeGreaterThan(body.indexOf('data-testid="thumb-1"'));
	});

	it('renders no script for center or edge-client-only alignment', () => {
		for (const thumbAlignment of ['center', 'edge-client-only'] as const) {
			const body = render(SliderSsrHarness, { props: { thumbAlignment } }).body;

			expect(body).not.toContain('<script');
		}
	});
});
