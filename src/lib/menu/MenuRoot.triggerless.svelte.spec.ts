// Assertions follow Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.triggerless.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: the frame mocks of the external-anchor case, which pin React's deferred focus
// order, and the floating node id comparison of the late-trigger case, which reads React store
// internals. Both cases keep their user-facing assertions.
import { page, userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuHarness from '../../tests/menu/MenuHarness.svelte';
import MenuTriggerlessHarness from '../../tests/menu/MenuTriggerlessHarness.svelte';
import type { MenuItemSpec } from '../../tests/menu/types.js';
import { parkPointer } from '../../tests/pointer.js';

function menuItem(name: string) {
	return page.getByRole('menuitem', { name, exact: true });
}

function queryItem(name: string) {
	return menuItem(name).query();
}

function focused() {
	return document.activeElement;
}

async function focusItem(name: string) {
	await expect.poll(() => queryItem(name)).not.toBeNull();
	const item = menuItem(name).element() as HTMLElement;
	item.focus();
	return item;
}

function submenu(
	label: string,
	leaf: string,
	{ openOnHover = false, ...rootProps }: { openOnHover?: boolean; [prop: string]: unknown } = {}
): MenuItemSpec {
	return {
		type: 'submenu',
		label,
		rootProps,
		triggerProps: { openOnHover, delay: 0 },
		items: [{ type: 'item', label: leaf }]
	};
}

function triggerless(items: MenuItemSpec[], extra: Record<string, unknown> = {}) {
	const { onOpenChange, direction, keepMounted } = extra as {
		onOpenChange?: unknown;
		direction?: 'ltr' | 'rtl';
		keepMounted?: boolean;
	};
	return {
		open: true,
		trigger: false as const,
		direction,
		rootProps: { modal: false, onOpenChange },
		portalProps: { keepMounted },
		positionerProps: { anchor: document.body },
		items
	};
}

describe('Menu.Root without a trigger', () => {
	beforeEach(parkPointer);

	describe.each(['ltr', 'rtl'] as const)('%s', (direction) => {
		it.each([false, true])(
			'keeps nested Escape and focus local, keepMounted=%s',
			async (keepMounted) => {
				const changed = vi.fn();
				render(
					MenuHarness,
					triggerless([submenu('More', 'Leaf')], { onOpenChange: changed, direction, keepMounted })
				);
				const more = await focusItem('More');
				const root = page.getByRole('menu').element();
				await userEvent.keyboard(direction === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}');
				await expect.poll(focused).toBe(queryItem('Leaf'));
				expect(changed).not.toHaveBeenCalled();
				expect(root.hasAttribute('data-open')).toBe(true);

				await userEvent.keyboard('{Escape}');
				await expect.poll(() => queryItem('Leaf')).toBeNull();
				expect(focused()).toBe(more);
				expect(changed).not.toHaveBeenCalled();

				await userEvent.keyboard('{Escape}');
				await expect.poll(() => page.getByRole('menu').query()).toBeNull();
				expect(changed).toHaveBeenCalledTimes(1);
				expect(changed).toHaveBeenCalledWith(
					false,
					expect.objectContaining({ reason: 'escape-key' })
				);
				expect(root.isConnected).toBe(keepMounted);
			}
		);
	});

	it.each([false, true])(
		'supports an external anchor across reopen, keepMounted=%s',
		async (keepMounted) => {
			const changed = vi.fn();
			render(MenuTriggerlessHarness, {
				scenario: 'anchor',
				keepMounted,
				onOpenChange: (open, details) => changed(open, details.reason)
			});
			const anchor = page.getByRole('button', { name: 'Open' }).element();

			for (let round = 0; round < 2; round += 1) {
				await userEvent.click(anchor);
				await focusItem('More');
				await userEvent.keyboard('{ArrowRight}');
				await expect.poll(focused).toBe(queryItem('Nested'));
				expect(changed).not.toHaveBeenCalled();

				await userEvent.click(menuItem('Nested'));
				await expect.poll(() => page.getByRole('menu').query()).toBeNull();
				expect(changed.mock.calls).toEqual([[false, 'item-press']]);
				await expect.poll(focused).toBe(anchor);
				changed.mockClear();
			}
		}
	);

	// Upstream keeps a portaled submenu open while focus moves into its parent without a press
	// outside it (`markInsideReactTree`). Here the highlight that follows the pointer onto
	// "Second" moves focus there and closes "First" with `focus-out` before the click.
	it.todo('closes a sibling submenu without closing the root on click');

	it('closes a sibling submenu without closing the root on hover', async () => {
		const changed = vi.fn();
		const firstChanged = vi.fn();
		render(
			MenuHarness,
			triggerless(
				[
					submenu('First', 'First item', { openOnHover: true, onOpenChange: firstChanged }),
					submenu('Second', 'Second item', { openOnHover: true })
				],
				{ onOpenChange: changed }
			)
		);
		await userEvent.hover(await focusItem('First'));
		await expect.poll(() => queryItem('First item')).not.toBeNull();
		firstChanged.mockClear();

		await userEvent.hover(menuItem('Second'));
		await expect.poll(() => queryItem('Second item')).not.toBeNull();
		await expect.poll(() => queryItem('First item')).toBeNull();
		expect(firstChanged).toHaveBeenCalledTimes(1);
		expect(firstChanged.mock.calls[0][0]).toBe(false);
		expect(firstChanged.mock.calls[0][1].reason).toMatch(/^(trigger-hover|sibling-open)$/);
		expect(changed).not.toHaveBeenCalled();
	});

	it('keeps an initially open submenu attached to the root', async () => {
		const changed = vi.fn();
		const completed = vi.fn();
		render(
			MenuHarness,
			triggerless([submenu('More', 'Nested', { open: true, onOpenChangeComplete: completed })], {
				onOpenChange: changed
			})
		);
		await expect.poll(() => completed.mock.calls).toContainEqual([true]);
		expect(page.getByRole('menu').elements()).toHaveLength(2);
		expect(changed).not.toHaveBeenCalled();
	});

	it.each([false, true])(
		'preserves real trigger registration, initially present=%s',
		async (initialTrigger) => {
			const changed = vi.fn();
			render(MenuTriggerlessHarness, {
				scenario: 'late-trigger',
				initialTrigger,
				onOpenChange: changed
			});
			await focusItem('More');
			await userEvent.keyboard('{F2}');
			await expect.poll(() => page.getByRole('button', { name: 'Options' }).query()).not.toBeNull();
			const trigger = page.getByRole('button', { name: 'Options' }).element();

			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(focused).toBe(queryItem('Nested'));
			expect(changed).not.toHaveBeenCalled();

			await userEvent.keyboard('{Escape}');
			await expect.poll(() => queryItem('Nested')).toBeNull();
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => page.getByRole('menu').query()).toBeNull();
			await expect.poll(focused).toBe(trigger);
		}
	);
});
