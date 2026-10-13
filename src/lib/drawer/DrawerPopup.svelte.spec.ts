// Assertions follow Base UI v1.9.0 packages/react/src/drawer/popup/DrawerPopup.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: describeConformance, which no spec in this port runs, and the popup height probe,
// which calls the root context's `onNestedFrontmostHeightChange` directly. The nested drawer
// height tests below cover what that height drives. The owner-stack warning test and the
// passive-effect ordering test are React specific. Their DOM assertions are kept.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { resetLogged } from '@sveltery/utils';
import DrawerPopupScenarios from '../../tests/DrawerPopupScenarios.svelte';
import { Drawer } from './index.js';

function testId(id: string) {
	return document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
}

function nestedDrawers(element: HTMLElement) {
	return element.style.getPropertyValue('--nested-drawers');
}

let cleanupStyle: (() => void) | undefined;
afterEach(() => {
	cleanupStyle?.();
	cleanupStyle = undefined;
});

function addStyle(css: string) {
	const element = document.createElement('style');
	element.textContent = css;
	document.head.append(element);
	cleanupStyle = () => element.remove();
}

/** Records the parent's nested state and `--drawer-height` on every attribute change. */
function recordParent(parent: HTMLElement) {
	const mutations: Array<{ hasNested: boolean; drawerHeight: string }> = [];
	const observer = new MutationObserver(() => {
		mutations.push({
			hasNested: parent.hasAttribute('data-nested-drawer-open'),
			drawerHeight: parent.style.getPropertyValue('--drawer-height')
		});
	});
	observer.observe(parent, {
		attributeFilter: ['data-nested-drawer-open', 'style'],
		attributes: true
	});
	return { mutations, stop: () => observer.disconnect() };
}

/** Records every `--nested-drawers` value the parent popup shows. */
function recordNestedCounts(parent: HTMLElement) {
	const counts = [nestedDrawers(parent)];
	const observer = new MutationObserver(() => counts.push(nestedDrawers(parent)));
	observer.observe(parent, { attributeFilter: ['style'], attributes: true });
	return { counts, stop: () => observer.disconnect() };
}

const nestedHeightStyle = `
	.animation-test-parent-popup {
		height: var(--drawer-height, auto);
		overflow: hidden;
		transition: height 100ms linear;
	}
	.animation-test-parent-popup[data-nested-drawer-open] {
		height: var(--drawer-frontmost-height, var(--drawer-height));
	}
	.animation-test-parent-content {
		display: block;
		height: 160px;
	}
	.animation-test-child-content {
		display: block;
		height: 64px;
	}
`;

const exitAnimationStyle = `
	@keyframes test-drawer-exit {
		to {
			opacity: 0;
		}
	}
	.animation-test-child-popup[data-ending-style] {
		animation: test-drawer-exit 100ms;
	}
`;

describe('Drawer.Popup', () => {
	it('warns in development when not rendered within a viewport', async () => {
		resetLogged();
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

		try {
			render(DrawerPopupScenarios, { scenario: 'no-viewport' });

			await expect
				.poll(() => consoleError.mock.calls.map(([message]) => message))
				.toContain(
					'Base UI: <Drawer.Popup> expected to be rendered within <Drawer.Viewport>. ' +
						'Omitting the viewport disables drawer swipe handling and touch scroll locking. ' +
						'Wrap <Drawer.Popup> in <Drawer.Viewport>.'
				);
		} finally {
			consoleError.mockRestore();
		}
	});

	it('defaults initial focus to the popup element', async () => {
		render(DrawerPopupScenarios, { scenario: 'focus' });

		(page.getByRole('button', { name: 'Open' }).element() as HTMLElement).click();

		await expect.poll(() => document.activeElement?.getAttribute('data-testid')).toBe('popup');
		expect(document.activeElement).not.toBe(testId('popup-input'));
	});

	it('leaves focus on the trigger when initial focus is disabled', async () => {
		render(DrawerPopupScenarios, { scenario: 'focus', initialFocus: false });
		const trigger = page.getByRole('button', { name: 'Open' });

		await trigger.click();

		await expect.element(page.getByRole('dialog')).toBeVisible();
		expect(document.activeElement).toBe(trigger.element());
	});

	// React events bubble through the portal to the wrapper upstream. A DOM event leaves the portal
	// for the document, where Svelte delegates the popup's handler, so the listener sits on window.
	it('stops composite navigation keys from escaping the popup', async () => {
		const onKeyDown = vi.fn();
		render(DrawerPopupScenarios, { scenario: 'composite-keys' });
		window.addEventListener('keydown', onKeyDown);
		const field = page.getByRole('textbox', { name: 'Field' }).element() as HTMLInputElement;
		field.focus();

		try {
			field.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
			expect(onKeyDown).not.toHaveBeenCalled();

			field.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
			expect(onKeyDown).toHaveBeenCalled();
		} finally {
			window.removeEventListener('keydown', onKeyDown);
		}
	});

	it('applies a negative snap point offset to upward drawers', async () => {
		render(DrawerPopupScenarios, { scenario: 'upward-snap' });

		await expect
			.poll(() => testId('popup')?.style.getPropertyValue('--drawer-snap-point-offset'))
			.toBe('-200px');
		expect(testId('popup')).toHaveAttribute('data-swipe-direction', 'up');
	});

	it('does not throw when a popup render snippet produces no element', async () => {
		expect(() => render(DrawerPopupScenarios, { scenario: 'render-nothing' })).not.toThrow();
		await expect.element(page.getByTestId('viewport')).toBeInTheDocument();
	});

	it('ignores a queued measurement after the popup unmounts', async () => {
		const callbacks: ResizeObserverCallback[] = [];
		const OriginalResizeObserver = globalThis.ResizeObserver;
		globalThis.ResizeObserver = class {
			constructor(callback: ResizeObserverCallback) {
				callbacks.push(callback);
			}
			observe() {}
			unobserve() {}
			disconnect() {}
		};

		try {
			const screen = render(DrawerPopupScenarios, { scenario: 'toggle-popup' });
			await expect.element(page.getByTestId('popup')).toBeVisible();
			const queued = callbacks.slice();

			await screen.rerender({ showPopup: false });
			expect(testId('popup')).toBeNull();

			expect(() => {
				for (const callback of queued) callback([], {} as ResizeObserver);
			}).not.toThrow();
		} finally {
			globalThis.ResizeObserver = OriginalResizeObserver;
		}
	});

	describe('nested drawers', () => {
		it('includes border size in frontmost height CSS variable for nested drawers', async () => {
			render(DrawerPopupScenarios, { scenario: 'nested-border' });
			const parent = testId('parent-popup')!;
			const child = testId('child-popup')!;

			await expect
				.poll(() => parent.style.getPropertyValue('--drawer-frontmost-height'))
				.toBe(`${child.offsetHeight}px`);
			expect(child.offsetHeight).toBeGreaterThan(child.scrollHeight);
		});

		it('reports nested presence and frontmost height when a nested drawer opens', async () => {
			const screen = render(DrawerPopupScenarios, { scenario: 'nested-open' });
			await expect.element(page.getByTestId('parent-popup')).toBeInTheDocument();

			await screen.rerender({ childOpen: true });

			const parent = testId('parent-popup')!;
			await expect.poll(() => nestedDrawers(parent)).toBe('1');
			expect(parent).toHaveAttribute('data-nested-drawer-open', '');
			await expect
				.poll(() => parent.style.getPropertyValue('--drawer-frontmost-height'))
				.toBe('100px');
		});

		it('keeps the parent nested state when a closed handle-backed nested drawer mounts', async () => {
			render(DrawerPopupScenarios, { scenario: 'nested-handle', handle: Drawer.createHandle() });
			const parent = testId('parent-popup')!;

			await expect.element(page.getByTestId('parent-popup')).toHaveAttribute(
				'data-nested-drawer-open'
			);
			expect(nestedDrawers(parent)).toBe('1');
		});

		it.each([
			['dialogs', 'nested-dialog', 'Open dialog', 'dialog-popup'],
			['alert dialogs', 'nested-alert-dialog', 'Open alert dialog', 'alert-dialog-popup']
		] as const)(
			'does not treat %s inside nested drawers as nested drawers',
			async (_label, scenario, opener, popupId) => {
				render(DrawerPopupScenarios, { scenario });
				const parent = testId('parent-popup')!;
				const child = testId('child-popup')!;
				const recorder = recordNestedCounts(parent);

				await expect.poll(() => nestedDrawers(parent)).toBe('1');
				expect(nestedDrawers(child)).toBe('0');
				expect(child).not.toHaveAttribute('data-nested-drawer-open');

				(page.getByRole('button', { name: opener }).element() as HTMLElement).click();

				await expect.element(page.getByTestId(popupId)).toBeVisible();
				await expect.poll(() => nestedDrawers(parent)).toBe('1');
				expect(nestedDrawers(child)).toBe('0');
				expect(child).not.toHaveAttribute('data-nested-drawer-open');

				recorder.stop();
				expect(recorder.counts).not.toContain('2');
			}
		);

		it('clears parent nested drawer state as soon as a nested drawer closes', async () => {
			render(DrawerPopupScenarios, { scenario: 'nested-trigger', childKeepMounted: true });
			const parent = testId('parent-popup')!;
			const child = testId('child-popup')!;

			expect(nestedDrawers(parent)).toBe('0');
			expect(parent).not.toHaveAttribute('data-nested-drawer-open');

			(page.getByRole('button', { name: 'Open nested drawer' }).element() as HTMLElement).click();

			await expect.poll(() => nestedDrawers(parent)).toBe('1');
			expect(parent).toHaveAttribute('data-nested-drawer-open', '');

			(page.getByRole('button', { name: 'Close nested drawer' }).element() as HTMLElement).click();
			await tick();

			expect(child).toBeInTheDocument();
			expect(nestedDrawers(parent)).toBe('0');
			expect(parent).not.toHaveAttribute('data-nested-drawer-open');
		});

		it('clears parent nested drawer state when a nested drawer starts closing before unmount', async () => {
			addStyle(exitAnimationStyle);
			render(DrawerPopupScenarios, {
				scenario: 'nested-trigger',
				childOpen: true,
				childClass: 'animation-test-child-popup'
			});
			const parent = testId('parent-popup')!;

			await expect.poll(() => nestedDrawers(parent)).toBe('1');
			expect(parent).toHaveAttribute('data-nested-drawer-open', '');

			(page.getByRole('button', { name: 'Close nested drawer' }).element() as HTMLElement).click();

			await expect.element(page.getByTestId('child-popup')).toHaveAttribute('data-ending-style');
			expect(nestedDrawers(parent)).toBe('0');
			expect(parent).not.toHaveAttribute('data-nested-drawer-open');

			await expect.poll(() => testId('child-popup')).toBeNull();
		});

		it('keeps a fixed height applied while a nested drawer closes', async () => {
			addStyle(nestedHeightStyle + exitAnimationStyle);
			render(DrawerPopupScenarios, {
				scenario: 'nested-trigger',
				parentClass: 'animation-test-parent-popup',
				childClass: 'animation-test-child-popup'
			});
			const parent = testId('parent-popup')!;

			(page.getByRole('button', { name: 'Open nested drawer' }).element() as HTMLElement).click();
			await expect.element(page.getByTestId('parent-popup')).toHaveAttribute(
				'data-nested-drawer-open',
				''
			);
			await expect.poll(() => parent.style.getPropertyValue('--drawer-height')).not.toBe('');

			const recorder = recordParent(parent);
			(page.getByRole('button', { name: 'Close nested drawer' }).element() as HTMLElement).click();

			await expect.element(page.getByTestId('child-popup')).toHaveAttribute('data-ending-style');
			await expect
				.element(page.getByTestId('parent-popup'))
				.not.toHaveAttribute('data-nested-drawer-open');
			await expect.poll(() => parent.style.getPropertyValue('--drawer-height')).not.toBe('');
			await expect
				.poll(() =>
					recorder.mutations.some((mutation) => !mutation.hasNested && mutation.drawerHeight !== '')
				)
				.toBe(true);
			recorder.stop();

			await expect.poll(() => testId('child-popup')).toBeNull();
		});

		it('restores a fixed height before nested state when reopening a nested drawer', async () => {
			addStyle(nestedHeightStyle);
			render(DrawerPopupScenarios, {
				scenario: 'nested-trigger',
				parentClass: 'animation-test-parent-popup'
			});
			const parent = testId('parent-popup')!;

			(page.getByRole('button', { name: 'Open nested drawer' }).element() as HTMLElement).click();
			await expect.element(page.getByTestId('parent-popup')).toHaveAttribute(
				'data-nested-drawer-open',
				''
			);

			(page.getByRole('button', { name: 'Close nested drawer' }).element() as HTMLElement).click();
			await expect
				.element(page.getByTestId('parent-popup'))
				.not.toHaveAttribute('data-nested-drawer-open');
			await expect.poll(() => testId('child-popup')).toBeNull();

			const recorder = recordParent(parent);
			(page.getByRole('button', { name: 'Open nested drawer' }).element() as HTMLElement).click();

			await expect.element(page.getByTestId('parent-popup')).toHaveAttribute(
				'data-nested-drawer-open',
				''
			);
			await expect
				.poll(() => recorder.mutations.find((mutation) => mutation.hasNested)?.drawerHeight)
				.not.toBe('');
			recorder.stop();
		});
	});

	it('closes with Escape after focus moves into the popup', async () => {
		render(DrawerPopupScenarios, { scenario: 'focus' });
		(page.getByRole('button', { name: 'Open' }).element() as HTMLElement).click();
		await expect.poll(() => document.activeElement?.getAttribute('data-testid')).toBe('popup');
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => testId('popup')).toBeNull();
	});
});
