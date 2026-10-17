// React 19 server-renders a `<style href precedence>` element into the head, not the body.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import DisableScrollbarStyleHarness from '../../tests/DisableScrollbarStyleHarness.svelte';

describe('scrollbar-hiding style on the server', () => {
	it('renders into the head with the CSP nonce', () => {
		const { head, body } = render(DisableScrollbarStyleHarness, { props: { nonce: 'r4nd0m' } });

		expect(head).toMatch(/<style nonce="r4nd0m">\.base-ui-disable-scrollbar\{/);
		expect(body).not.toContain('<style');
	});

	it('renders nothing when disableStyleElements is true', () => {
		const { head, body } = render(DisableScrollbarStyleHarness, {
			props: { disableStyleElements: true }
		});

		expect(head).not.toContain('<style');
		expect(body).not.toContain('<style');
	});
});
