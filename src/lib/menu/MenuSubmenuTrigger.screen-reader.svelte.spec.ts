// Assertions follow Base UI v1.9.0
// packages/react/src/menu/submenu-trigger/MenuSubmenuTrigger.screenReaderPress.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The filterable submenu cases are out of scope with the filter parts.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuHarness from '../../tests/menu/MenuHarness.svelte';
import { items } from '../../tests/menu/types.js';

function byTestId(id: string) {
	return document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
}

async function frames(count = 2) {
	for (let i = 0; i < count; i += 1) {
		await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
		await tick();
	}
}

function screenReaderMouseDown(element: Element) {
	element.dispatchEvent(
		new PointerEvent('pointerdown', {
			bubbles: true,
			cancelable: true,
			pointerType: 'mouse',
			width: 1,
			height: 1,
			pressure: 0,
			detail: 0,
			buttons: 0
		})
	);
	element.dispatchEvent(
		new MouseEvent('mousedown', { bubbles: true, cancelable: true, detail: 0 })
	);
}

// Chrome performs a screen reader activation as a synthetic mouse press: a zero-pressure 1x1
// `pointerdown`, then `mousedown`, then a `detail: 0` click.
function screenReaderPress(element: Element) {
	screenReaderMouseDown(element);
	element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 0 }));
}

function test(triggerProps: Record<string, unknown> = {}, rootProps: Record<string, unknown> = {}) {
	return {
		triggerLabel: 'Open menu',
		popupProps: { 'data-testid': 'parent-menu' },
		items: [
			{
				type: 'submenu' as const,
				label: 'More',
				rootProps,
				triggerProps: { 'data-testid': 'submenu-trigger', ...triggerProps },
				popupProps: { 'data-testid': 'submenu' },
				items: items('Alpha', 'Beta')
			}
		]
	};
}

async function openParent() {
	await userEvent.click(page.getByRole('button', { name: 'Open menu' }));
	await expect.poll(() => byTestId('submenu-trigger')).not.toBeNull();
	return byTestId('submenu-trigger')!;
}

describe('Menu.SubmenuTrigger with a screen reader press', () => {
	it('toggles the submenu on repeated screen reader activation with the default openOnHover', async () => {
		render(MenuHarness, test());
		const submenuTrigger = await openParent();
		screenReaderPress(submenuTrigger);
		await expect.poll(() => byTestId('submenu')).not.toBeNull();
		await frames();
		screenReaderPress(submenuTrigger);
		await expect.poll(() => byTestId('submenu')).toBeNull();
		expect(byTestId('parent-menu')).not.toBeNull();
		await frames();
		screenReaderPress(submenuTrigger);
		await expect.poll(() => byTestId('submenu')).not.toBeNull();
		await frames();
		expect(byTestId('parent-menu')).not.toBeNull();
	});

	it('does not close the submenu on the trailing click of a screen reader press with openOnHover false', async () => {
		render(MenuHarness, test({ openOnHover: false }));
		const submenuTrigger = await openParent();
		screenReaderMouseDown(submenuTrigger);
		await expect.poll(() => byTestId('submenu')).not.toBeNull();
		submenuTrigger.dispatchEvent(
			new MouseEvent('click', { bubbles: true, cancelable: true, detail: 0 })
		);
		await frames();
		expect(byTestId('submenu')).not.toBeNull();
	});

	it('opens on a screen reader press without waiting a frame', async () => {
		render(MenuHarness, test());
		const submenuTrigger = await openParent();
		screenReaderMouseDown(submenuTrigger);
		await tick();
		expect(byTestId('submenu')).not.toBeNull();
	});

	it('reports the trigger, not a pressed descendant, as the opener', async () => {
		const onOpenChange = vi.fn();
		render(MenuHarness, test({}, { onOpenChange }));
		const submenuTrigger = await openParent();
		const icon = document.createElement('span');
		icon.textContent = '▸';
		submenuTrigger.append(icon);
		screenReaderPress(icon);
		await expect.poll(() => byTestId('submenu')).not.toBeNull();
		expect(onOpenChange).toHaveBeenCalledWith(
			true,
			expect.objectContaining({ trigger: submenuTrigger })
		);
	});

	it('ignores an ordinary mouse press with the default openOnHover', async () => {
		render(MenuHarness, test());
		const submenuTrigger = await openParent();
		// A real mouse press has a pressed button even when it reports no pressure.
		submenuTrigger.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true,
				pointerType: 'mouse',
				width: 1,
				height: 1,
				pressure: 0,
				detail: 0,
				buttons: 1
			})
		);
		submenuTrigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		submenuTrigger.dispatchEvent(
			new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 })
		);
		await frames();
		expect(byTestId('submenu')).toBeNull();
	});
});
