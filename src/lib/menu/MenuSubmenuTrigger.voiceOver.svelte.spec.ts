// Assertions follow Base UI v1.9.0
// packages/react/src/menu/submenu-trigger/MenuSubmenuTrigger.voiceOver.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Kept in its own file so the platform mock does not reach the other submenu specs.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuHarness from '../../tests/menu/MenuHarness.svelte';
import { items } from '../../tests/menu/types.js';

vi.mock('@sveltery/utils', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@sveltery/utils')>();
	return {
		...actual,
		platform: {
			...actual.platform,
			screenReader: { ...actual.platform.screenReader, voiceOver: true }
		}
	};
});

const props = {
	triggerLabel: 'Open menu',
	items: [
		{
			type: 'submenu' as const,
			label: 'More',
			popupProps: { 'data-testid': 'submenu' },
			items: items('Alpha', 'Beta')
		}
	]
};

function submenuTrigger() {
	return page.getByRole('menuitem', { name: 'More' });
}

function submenu() {
	return page.getByTestId('submenu').query();
}

async function focusSubmenuTrigger() {
	await userEvent.keyboard('{Tab}');
	await userEvent.keyboard('{Enter}');
	await expect.poll(() => document.activeElement).toBe(submenuTrigger().query());
	return submenuTrigger().element();
}

describe('Menu.SubmenuTrigger with VoiceOver', () => {
	it('omits the expanded state when the submenu is opened with ArrowRight', async () => {
		render(MenuHarness, props);
		const trigger = await focusSubmenuTrigger();
		expect(trigger.getAttribute('aria-expanded')).toBe('false');

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(submenu).not.toBeNull();
		await expect
			.poll(() => document.activeElement)
			.toBe(page.getByRole('menuitem', { name: 'Alpha' }).query());
		expect(trigger.hasAttribute('aria-expanded')).toBe(false);
		expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
	});

	it('omits the expanded state when the submenu is opened with Enter', async () => {
		render(MenuHarness, props);
		const trigger = await focusSubmenuTrigger();

		await userEvent.keyboard('{Enter}');
		await expect.poll(submenu).not.toBeNull();
		await expect
			.poll(() => document.activeElement)
			.toBe(page.getByRole('menuitem', { name: 'Alpha' }).query());
		expect(trigger.hasAttribute('aria-expanded')).toBe(false);
	});

	it('keeps the expanded state when the submenu is opened with a pointer', async () => {
		render(MenuHarness, props);
		await userEvent.click(page.getByRole('button', { name: 'Open menu' }));
		await userEvent.click(submenuTrigger());
		await expect.poll(submenu).not.toBeNull();
		expect(submenuTrigger().element().getAttribute('aria-expanded')).toBe('true');
	});
});
