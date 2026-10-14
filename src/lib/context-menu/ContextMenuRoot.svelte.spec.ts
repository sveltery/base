// Assertions follow Base UI v1.9.0 packages/react/src/context-menu/root/ContextMenuRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream mocks macOS, where the mouseup that ends a right click can activate an item.
// Kept in its own file so the platform mock does not reach the other context menu specs.
import { tick } from 'svelte';
import { userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ContextMenuHarness from '../../tests/context-menu/ContextMenuHarness.svelte';
import { contextMenu, rightMouseUp } from '../../tests/context-menu/events.js';
import { enterWithMouse, mouse } from '../../tests/menu/mouse.js';
import { parkPointer } from '../../tests/pointer.js';
import type { ContextMenuRootChangeEventDetails } from './types.js';

vi.mock('@sveltery/utils', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@sveltery/utils')>();
	return {
		...actual,
		platform: {
			...actual.platform,
			os: { ...actual.platform.os, mac: true, apple: true }
		}
	};
});

function byTestId(id: string) {
	return document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
}

function get(id: string) {
	const element = byTestId(id);
	if (!element) throw new Error(`no element with data-testid="${id}"`);
	return element;
}

type Call = [boolean, string];

function recorder() {
	const calls: Call[] = [];
	const onOpenChange = (open: boolean, details: ContextMenuRootChangeEventDetails) => {
		calls.push([open, details.reason]);
	};
	return { calls, onOpenChange };
}

beforeEach(parkPointer);

describe('ContextMenu.Root', () => {
	describe('interactions', () => {
		it('closes nested submenus when releasing the context menu pointer over an item', async () => {
			const root = recorder();
			const submenu = recorder();
			render(ContextMenuHarness, {
				scenario: 'submenu',
				rootProps: { onOpenChange: root.onOpenChange },
				submenuProps: { onOpenChange: submenu.onOpenChange }
			});

			contextMenu(get('trigger'), { clientX: 10, clientY: 10 });
			await expect.poll(() => byTestId('popup')).not.toBeNull();

			enterWithMouse(get('submenu-trigger'));
			await expect.poll(() => byTestId('submenu-popup'), { timeout: 2000 }).not.toBeNull();

			rightMouseUp(get('submenu-item'));
			await expect.poll(() => byTestId('submenu-popup')).toBeNull();
			await expect.poll(() => byTestId('popup')).toBeNull();

			expect(submenu.calls.at(-1)).toEqual([false, 'item-press']);
			expect(root.calls.at(-1)).toEqual([false, 'item-press']);
		});

		it('does not activate a submenu trigger when releasing the context menu pointer over it', async () => {
			const submenu = recorder();
			render(ContextMenuHarness, {
				scenario: 'submenu',
				submenuProps: { onOpenChange: submenu.onOpenChange },
				submenuTriggerProps: { openOnHover: false }
			});

			contextMenu(get('trigger'), { clientX: 20, clientY: 20 });
			await expect.poll(() => byTestId('popup')).not.toBeNull();

			mouse(document.body, 'pointermove', { clientX: 24, clientY: 24 });
			rightMouseUp(get('submenu-trigger'), { clientX: 24, clientY: 24 });
			await tick();

			expect(byTestId('submenu-popup')).toBeNull();
			expect(submenu.calls).toEqual([]);
		});

		it('ignores mouseup directly under the cursor when the context menu spawns there', async () => {
			const { calls, onOpenChange } = recorder();
			render(ContextMenuHarness, {
				rootProps: { onOpenChange },
				positionerProps: { alignOffset: 0 }
			});

			contextMenu(get('trigger'), { clientX: 12, clientY: 12 });
			await expect.poll(() => byTestId('popup')).not.toBeNull();

			rightMouseUp(get('item'), { clientX: 12, clientY: 12 });
			await tick();

			expect(byTestId('popup')).not.toBeNull();
			expect(calls).toEqual([[true, 'trigger-press']]);
		});

		it('ignores mouseup directly under the cursor when alignOffset is negative', async () => {
			const { calls, onOpenChange } = recorder();
			render(ContextMenuHarness, {
				rootProps: { onOpenChange },
				positionerProps: { alignOffset: -5 }
			});

			contextMenu(get('trigger'), { clientX: 18, clientY: 18 });
			await expect.poll(() => byTestId('popup')).not.toBeNull();

			rightMouseUp(get('item'), { clientX: 18, clientY: 18 });
			await tick();

			expect(byTestId('popup')).not.toBeNull();
			expect(calls).toEqual([[true, 'trigger-press']]);
		});

		it('allows mouseup after leaving the initial cursor point', async () => {
			const { calls, onOpenChange } = recorder();
			render(ContextMenuHarness, {
				rootProps: { onOpenChange },
				positionerProps: { alignOffset: 0 }
			});

			contextMenu(get('trigger'), { clientX: 20, clientY: 20 });
			await expect.poll(() => byTestId('popup')).not.toBeNull();

			mouse(document.body, 'pointermove', { clientX: 24, clientY: 24 });
			rightMouseUp(get('item'), { clientX: 24, clientY: 24 });

			await expect.poll(() => byTestId('popup')).toBeNull();
			expect(calls.at(-1)).toEqual([false, 'item-press']);
		});

		it('does not open when disabled', async () => {
			const { calls, onOpenChange } = recorder();
			render(ContextMenuHarness, { rootProps: { disabled: true, onOpenChange } });

			contextMenu(get('trigger'), { clientX: 10, clientY: 10 });
			await tick();

			expect(byTestId('popup')).toBeNull();
			expect(calls).toEqual([]);
		});
	});

	it('returns focus to the focused surface when closing with Shift+Tab', async () => {
		render(ContextMenuHarness, { scenario: 'surface-button' });
		const surface = document.querySelector('button') as HTMLButtonElement;
		expect(surface.textContent).toBe('Surface');

		await userEvent.tab();
		expect(document.activeElement).toBe(surface);

		contextMenu(surface, { clientX: 20, clientY: 20 });
		await expect.poll(() => document.activeElement?.getAttribute('role')).toBe('menu');

		await userEvent.tab({ shift: true });
		await expect.poll(() => document.querySelector('[role="menu"]')).toBeNull();
		expect(document.activeElement).toBe(surface);
	});

	describe('prop: collisionAvoidance', () => {
		it('flips to the opposite side when side: flip is set and there is no space', async () => {
			const y = window.innerHeight - 20;
			render(ContextMenuHarness, {
				scenario: 'popup-only',
				open: true,
				positionerProps: {
					collisionAvoidance: { side: 'flip' },
					style: 'width: 150px; height: 100px',
					anchor: {
						getBoundingClientRect: () => DOMRect.fromRect({ width: 0, height: 0, x: 100, y })
					}
				}
			});

			await expect.poll(() => byTestId('positioner')?.getAttribute('data-side')).toBe('top');
		});
	});
});
