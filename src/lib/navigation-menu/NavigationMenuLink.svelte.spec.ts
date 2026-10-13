// Assertions follow Base UI v1.9.0 packages/react/src/navigation-menu/link/NavigationMenuLink.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream runs the `closeOnClick` cases in JSDOM only. They run in the browser here.
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NavigationMenuLinkHarness from '../../tests/NavigationMenuLinkHarness.svelte';
import { byId, resetBrowserPointer, settlePositioning } from '../../tests/previewCardEvents.js';

afterEach(async () => {
	await resetBrowserPointer();
	await settlePositioning();
});

function trigger() {
	return byId('trigger-1')!;
}

describe('NavigationMenu.Link', () => {
	describe('prop: closeOnClick', () => {
		it('closes the menu when clicking a link when true', async () => {
			render(NavigationMenuLinkHarness, { closeOnClick: true });

			await userEvent.click(trigger());
			await expect.poll(() => byId('popup-1')).not.toBeNull();
			expect(trigger().getAttribute('aria-expanded')).toBe('true');

			await userEvent.click(byId('link-1')!);

			await expect.poll(() => byId('popup-1')).toBeNull();
			expect(trigger().getAttribute('aria-expanded')).toBe('false');
		});

		it('does not close the menu when clicking a link when false', async () => {
			render(NavigationMenuLinkHarness, { closeOnClick: false });

			await userEvent.click(trigger());
			await expect.poll(() => byId('popup-1')).not.toBeNull();

			await userEvent.click(byId('link-1')!);

			expect(byId('popup-1')).not.toBeNull();
			expect(trigger().getAttribute('aria-expanded')).toBe('true');
		});
	});

	describe('prop: active', () => {
		it('when `true`, renders with aria-current="page"', () => {
			render(NavigationMenuLinkHarness, { active: true });
			expect(byId('page-link')!.getAttribute('aria-current')).toBe('page');
			expect(byId('page-link')!.hasAttribute('data-active')).toBe(true);
		});

		it('when `false`, does not render with aria-current="page"', () => {
			render(NavigationMenuLinkHarness, { active: false });
			expect(byId('page-link')!.hasAttribute('aria-current')).toBe(false);
			expect(byId('page-link')!.hasAttribute('data-active')).toBe(false);
		});
	});

	it('keeps the menu open when a link loses focus without a related target', async () => {
		render(NavigationMenuLinkHarness);

		await userEvent.click(trigger());
		await expect.poll(() => byId('link-1')).not.toBeNull();

		const link = byId('link-1')!;
		link.dispatchEvent(new FocusEvent('focus'));
		link.dispatchEvent(new FocusEvent('blur', { relatedTarget: null }));

		expect(byId('link-1')).not.toBeNull();
		expect(trigger().getAttribute('aria-expanded')).toBe('true');
	});
});
