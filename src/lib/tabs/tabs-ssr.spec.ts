// Upstream TabsIndicator renders PrehydrationScript, which reads `useCSPContext().nonce`.
// Base UI v1.9.0 commit ad7ecda5296b0295b41a51ecb01fce6204acd099.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import TabsSsrHarness from '../../tests/TabsSsrHarness.svelte';

describe('Tabs.Indicator SSR prehydration script', () => {
	it('follows the indicator with the real script', () => {
		const body = render(TabsSsrHarness, { props: { provider: false } }).body;

		expect(body).toMatch(
			/<span role="presentation" hidden=""[^>]*><!----><\/span>(?:<!--[^>]*-->|\s)*<script>!function\(\)\{const t=document\.currentScript\.previousElementSibling;/
		);
	});

	it('carries the CSPProvider nonce', () => {
		const body = render(TabsSsrHarness, { props: { nonce: 'r4nd0m' } }).body;

		expect(body).toContain('<script nonce="r4nd0m">!function(){');
	});

	it('escapes the nonce as an attribute value', () => {
		const body = render(TabsSsrHarness, { props: { nonce: 'a"b&c' } }).body;

		expect(body).toContain('<script nonce="a&quot;b&amp;c">!function(){');
	});

	it('has no nonce without a provider', () => {
		const body = render(TabsSsrHarness, { props: { provider: false } }).body;

		expect(body).toContain('<script>!function(){');
	});

	it('renders no script without renderBeforeHydration', () => {
		const body = render(TabsSsrHarness, {
			props: { nonce: 'r4nd0m', renderBeforeHydration: false }
		}).body;

		expect(body).toContain('role="presentation"');
		expect(body).not.toContain('<script');
	});

	it('renders neither indicator nor script without a value', () => {
		const body = render(TabsSsrHarness, { props: { value: null } }).body;

		expect(body).toContain('role="tab"');
		expect(body).not.toContain('role="presentation"');
		expect(body).not.toContain('<script');
	});
});
