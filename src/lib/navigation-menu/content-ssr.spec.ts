// Assertions follow the server-side rendering cases of Base UI v1.9.0
// packages/react/src/navigation-menu/content/NavigationMenuContent.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import NavigationMenuContentHarness from '../../tests/NavigationMenuContentHarness.svelte';

function count(body: string, text: string) {
	return body.split(text).length - 1;
}

describe('NavigationMenu.Content server-side rendering', () => {
	it('keeps the content mounted (hidden) in the DOM when keepMounted is true', () => {
		const { body } = render(NavigationMenuContentHarness, { props: { keepMounted: true } });
		expect(count(body, 'data-testid="content-1"')).toBe(1);
		const tag = body.match(/<div[^>]*data-testid="content-1"[^>]*>/)?.[0];
		expect(tag).toMatch(/\shidden(=""|\s|>)/);
	});

	it('does not keep the content mounted in the DOM when keepMounted is false', () => {
		const { body } = render(NavigationMenuContentHarness, { props: { keepMounted: false } });
		expect(count(body, 'data-testid="content-1"')).toBe(0);
	});
});
