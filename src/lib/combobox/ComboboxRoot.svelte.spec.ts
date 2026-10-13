// Assertions follow Base UI v1.9.0 packages/react/src/combobox/root/ComboboxRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// IME, the manual unmount lifecycle, the input inside the popup and the dismiss buttons.
// Not ported, React only: popupConformanceTests and popupListConformanceTests (React test-utils
// suites), the React.startTransition case and the two ReactDOM.createPortal cases (a portal
// keeps React-tree event bubbling). `actionsRef` is the
// root's exported `close()` and `unmount()`. `defaultOpen` is `open` without a binding.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { REASONS } from '@sveltery/utils';
import { renderBound } from '../../tests/bound-render.svelte.js';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

const input = () => page.getByTestId('input');
const trigger = () => page.getByTestId('trigger');
const combobox = () => page.getByRole('combobox');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const listbox = () => page.getByRole('listbox');
const apple = [{ value: 'apple', text: 'Apple' }];
const closes = (spy: ReturnType<typeof vi.fn>) => spy.mock.calls.filter(([open]) => !open);

function keyDown(target: Element, key: string, init: KeyboardEventInit & { which?: number } = {}) {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
	if (init.which !== undefined) {
		Object.defineProperty(event, 'which', { value: init.which });
		Object.defineProperty(event, 'keyCode', { value: init.which });
	}
	target.dispatchEvent(event);
}

function isElementOrAncestorInert(element: Element) {
	let current: Element | null = element;
	while (current) {
		if (current.getAttribute('aria-hidden') === 'true' || current.hasAttribute('inert')) {
			return true;
		}
		current = current.parentElement;
	}
	return false;
}

describe('Combobox.Root', () => {
	it('exposes the orientation attribute rendered by Separator', async () => {
		render(ComboboxHarness, {
			open: true,
			staticItems: [{ value: 'a' }, { value: 'b' }],
			separator: true
		});
		await expect
			.element(page.getByTestId('separator'))
			.toHaveAttribute('data-orientation', 'horizontal');
	});

	describe('IME composition', () => {
		it('does not select the highlighted item with an Enter that commits IME text', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, { items: ['a', 'b', 'c'], root: { onValueChange } });
			input().element().focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('a')).toHaveAttribute('data-highlighted');

			keyDown(input().element(), 'Enter', { which: 229 });
			await tick();

			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(input()).toHaveAttribute('aria-expanded', 'true');
			await expect.element(option('a')).toHaveAttribute('data-highlighted');
		});

		it('does not move the highlight with arrow keys that pick an IME candidate', async () => {
			render(ComboboxHarness, { items: ['a', 'b', 'c'] });
			input().element().focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('a')).toHaveAttribute('data-highlighted');

			keyDown(input().element(), 'ArrowDown', { which: 229 });
			await tick();

			await expect.element(option('a')).toHaveAttribute('data-highlighted');
		});
	});

	describe('manual unmount lifecycle', () => {
		it('automatically unmounts and completes closing once', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(ComboboxHarness, {
				staticItems: apple,
				root: { onOpenChangeComplete }
			});

			expect(onOpenChangeComplete).not.toHaveBeenCalled();
			await userEvent.click(combobox());
			await expect.element(listbox()).toBeVisible();
			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();
			expect(closes(onOpenChangeComplete)).toHaveLength(1);

			// Calling unmount after the automatic unmount must not repeat the completion.
			view.component.unmount();
			await tick();
			expect(closes(onOpenChangeComplete)).toHaveLength(1);
		});

		it('keeps the popup mounted until unmount() completes closing', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(ComboboxHarness, {
				open: true,
				staticItems: apple,
				root: {
					onOpenChangeComplete,
					onOpenChange: (open, details) => {
						if (!open) details.preventUnmountOnClose();
					}
				}
			});

			await userEvent.click(option('Apple'));
			await expect.element(listbox()).toBeInTheDocument();
			expect(onOpenChangeComplete).not.toHaveBeenCalledWith(false);
			view.component.unmount();
			await tick();
			await expect.element(listbox()).not.toBeInTheDocument();
			expect(closes(onOpenChangeComplete)).toHaveLength(1);

			await view.rerender({ open: true });
			await expect.element(listbox()).toBeVisible();
			await view.rerender({ open: false });
			await expect.element(listbox()).not.toBeInTheDocument();
			expect(closes(onOpenChangeComplete)).toHaveLength(2);
		});

		it('clears the opt-out when a bound reopen interrupts a pending unmount', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(ComboboxHarness, {
				open: true,
				staticItems: apple,
				root: {
					onOpenChangeComplete,
					onOpenChange: (open, details) => {
						if (!open) details.preventUnmountOnClose();
					}
				}
			});

			await userEvent.click(option('Apple'));
			await expect.element(listbox()).toBeInTheDocument();
			expect(onOpenChangeComplete).not.toHaveBeenCalledWith(false);
			await view.rerender({ open: true });
			await view.rerender({ open: false });
			await expect.element(listbox()).not.toBeInTheDocument();
			expect(closes(onOpenChangeComplete)).toHaveLength(1);
		});

		it('ignores an opt-out on a canceled close', async () => {
			let cancel = true;
			render(ComboboxHarness, {
				open: true,
				staticItems: apple,
				root: {
					onOpenChange: (open, details) => {
						if (!open && cancel) {
							details.preventUnmountOnClose();
							details.cancel();
						}
					}
				}
			});

			await userEvent.click(option('Apple'));
			await expect.element(combobox()).toHaveAttribute('aria-expanded', 'true');
			await expect.element(listbox()).toBeInTheDocument();
			cancel = false;
			await userEvent.click(option('Apple'));
			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('closes through close() so onOpenChange can opt out', async () => {
			const reasons: string[] = [];
			const view = render(ComboboxHarness, {
				open: true,
				staticItems: apple,
				root: {
					onOpenChange: (open, details) => {
						reasons.push(details.reason);
						if (!open) details.preventUnmountOnClose();
					}
				}
			});

			view.component.close();
			await tick();
			expect(reasons).toEqual([REASONS.imperativeAction]);
			await expect.element(combobox()).toHaveAttribute('aria-expanded', 'false');
			await expect.element(listbox()).toBeInTheDocument();

			view.component.unmount();
			await tick();
			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('ignores unmount() while the popup is open', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(ComboboxHarness, {
				open: true,
				staticItems: apple,
				root: { onOpenChangeComplete }
			});
			const popup = listbox().element();

			view.component.unmount();
			await tick();

			expect(listbox().element()).toBe(popup);
			expect(onOpenChangeComplete).not.toHaveBeenCalledWith(false);
			await expect.element(combobox()).toHaveAttribute('aria-expanded', 'true');
		});

		it('unmounts when close() and unmount() are called in one batch', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(ComboboxHarness, {
				open: true,
				staticItems: apple,
				root: {
					onOpenChangeComplete,
					onOpenChange: (open, details) => {
						if (!open) details.preventUnmountOnClose();
					}
				}
			});

			view.component.close();
			view.component.unmount();
			await tick();

			await expect.element(listbox()).not.toBeInTheDocument();
			expect(closes(onOpenChangeComplete)).toHaveLength(1);
		});

		it('still unmounts on a later close after unmount() was called while open', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(ComboboxHarness, {
				open: true,
				staticItems: apple,
				root: { onOpenChangeComplete }
			});

			// A stale exit-animation callback can call `unmount()` after a quick reopen.
			view.component.unmount();
			await tick();
			await expect.element(listbox()).toBeInTheDocument();

			input().element().focus();
			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();
			expect(onOpenChangeComplete).toHaveBeenLastCalledWith(false);
		});

		it('still unmounts on a later close after unmount() and a reopen in one batch', async () => {
			const onOpenChangeComplete = vi.fn();
			let reopenOnComplete = true;
			let optOut = true;
			let methods: { close(): void; unmount(): void } | undefined;
			const props = renderBound(ComboboxHarness, {
				open: true,
				staticItems: apple,
				api: (api) => (methods = api),
				root: {
					onOpenChange: (nextOpen, details) => {
						if (!nextOpen && optOut) details.preventUnmountOnClose();
					},
					onOpenChangeComplete: (nextOpen) => {
						onOpenChangeComplete(nextOpen);
						// An exit-animation callback that reopens right after it unmounts.
						if (!nextOpen && reopenOnComplete) {
							reopenOnComplete = false;
							props.open = true;
						}
					}
				}
			});

			methods!.close();
			await tick();
			await expect.element(listbox()).toBeInTheDocument();

			methods!.unmount();
			await tick();
			await expect.element(listbox()).toBeInTheDocument();
			expect(closes(onOpenChangeComplete)).toHaveLength(1);

			optOut = false;
			await userEvent.click(option('Apple'));
			await expect.element(listbox()).not.toBeInTheDocument();
			expect(closes(onOpenChangeComplete)).toHaveLength(2);
		});

		it('does not call onOpenChange when close() is called while closed', async () => {
			const onOpenChange = vi.fn();
			const view = render(ComboboxHarness, { staticItems: apple, root: { onOpenChange } });

			view.component.close();
			await tick();
			expect(onOpenChange).not.toHaveBeenCalled();
			await expect.element(combobox()).toHaveAttribute('aria-expanded', 'false');
		});

		it('completes closing once when unmount() is called twice in one batch', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(ComboboxHarness, {
				open: true,
				staticItems: apple,
				root: {
					onOpenChangeComplete,
					onOpenChange: (open, details) => {
						if (!open) details.preventUnmountOnClose();
					}
				}
			});

			await userEvent.click(option('Apple'));
			await expect.element(listbox()).toBeInTheDocument();

			view.component.unmount();
			view.component.unmount();
			await tick();
			await expect.element(listbox()).not.toBeInTheDocument();
			expect(closes(onOpenChangeComplete)).toHaveLength(1);
		});
	});

	it('does not focus the input when closing via a trigger click (input inside popup)', async () => {
		render(ComboboxHarness, {
			items: ['One', 'Two', 'Three'],
			inputInside: true,
			input: { 'aria-label': 'combobox-input' }
		});

		await userEvent.click(trigger());
		await expect.element(listbox()).toBeVisible();
		await expect.element(input()).toHaveFocus();

		await userEvent.click(trigger());
		await expect.element(trigger()).toHaveFocus();
	});

	describe('input inside popup composition', () => {
		it('selects with the keyboard, restores focus, and resets the query on reopen', async () => {
			render(ComboboxHarness, {
				items: ['Apple', 'Banana', 'Cherry'],
				inputInside: true,
				valueProps: { placeholder: 'Select a fruit' },
				popup: { 'aria-label': 'Fruits' }
			});

			await userEvent.click(trigger());
			await expect.element(input()).toHaveFocus();

			await userEvent.type(input(), 'ban');
			await userEvent.keyboard('{ArrowDown}{Enter}');

			await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
			await expect.element(trigger()).toHaveFocus();
			await expect.element(trigger()).toHaveTextContent('Banana');

			await userEvent.click(trigger());
			await expect.element(input()).toHaveValue('');
			await expect.element(option('Banana')).toHaveAttribute('aria-selected', 'true');
			await expect.element(option('Banana')).toHaveAttribute('data-highlighted');
		});

		it('discards an uncommitted query on Escape and preserves the selection', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, {
				items: ['Apple', 'Banana', 'Cherry'],
				inputInside: true,
				root: { defaultValue: 'Apple', onValueChange },
				popup: { 'aria-label': 'Fruits' }
			});

			await userEvent.click(trigger());
			await userEvent.type(input(), 'ban');
			await userEvent.keyboard('{Escape}');

			await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
			await expect.element(trigger()).toHaveFocus();
			await expect.element(trigger()).toHaveTextContent('Apple');
			expect(onValueChange).not.toHaveBeenCalled();

			await userEvent.click(trigger());
			await expect.element(input()).toHaveValue('');
			await expect.element(option('Apple')).toHaveAttribute('aria-selected', 'true');
			await expect.element(option('Banana')).toBeInTheDocument();
		});

		it('keeps filtering responsive when the selection close is canceled', async () => {
			render(ComboboxHarness, {
				items: ['Apple', 'Apricot', 'Banana'],
				inputInside: true,
				valueProps: { placeholder: 'Select a fruit' },
				root: {
					onOpenChange: (open, details) => {
						if (!open) details.cancel();
					}
				}
			});

			await userEvent.click(trigger());
			await userEvent.type(input(), 'ap');
			await userEvent.click(option('Apple'));

			await expect.element(page.getByRole('dialog')).toBeInTheDocument();
			await expect.element(trigger()).toHaveTextContent('Apple');

			await userEvent.clear(input());
			await userEvent.type(input(), 'ba');

			await expect.element(option('Banana')).toBeInTheDocument();
			await expect.element(option('Apple')).not.toBeInTheDocument();
		});

		it('clears a single-select query and restores the selection when reopening during the close animation', async () => {
			const style = document.createElement('style');
			style.textContent = `@keyframes combobox-close-test { to { opacity: 0; } }
				[data-testid="popup"][data-ending-style] { animation: combobox-close-test 10s linear; }`;
			document.head.append(style);
			try {
				render(ComboboxHarness, {
					items: ['Apple', 'Banana'],
					inputInside: true,
					probe: true,
					empty: 'No matches',
					root: { defaultValue: 'Banana' }
				});

				await userEvent.click(trigger());
				await userEvent.clear(input());
				await userEvent.type(input(), 'banana');
				await userEvent.keyboard('{Escape}');

				const popup = page.getByTestId('popup');
				await expect.element(popup).toHaveAttribute('data-ending-style');

				await userEvent.click(trigger());

				await expect.element(popup).not.toHaveAttribute('data-ending-style');
				await expect.element(page.getByTestId('selected-index')).toHaveTextContent('1');
				await expect.element(input()).toHaveValue('');
				await expect.element(option('Apple')).toBeInTheDocument();
				await expect.element(option('Banana')).toHaveAttribute('data-highlighted');
				await expect
					.element(input())
					.toHaveAttribute('aria-activedescendant', option('Banana').element().id);
			} finally {
				style.remove();
			}
		});

		it('preserves a typed query when input reopens single-select during the close animation', async () => {
			const style = document.createElement('style');
			style.textContent = `@keyframes combobox-close-test { to { opacity: 0; } }
				[data-testid="popup"][data-ending-style] { animation: combobox-close-test 10s linear; }`;
			document.head.append(style);
			try {
				render(ComboboxHarness, {
					items: ['Apple', 'Banana'],
					inputInside: true,
					empty: 'No matches'
				});

				await userEvent.click(trigger());
				await userEvent.type(input(), 'ap');
				await userEvent.keyboard('{Escape}');

				const popup = page.getByTestId('popup');
				await expect.element(popup).toHaveAttribute('data-ending-style');

				input().element().focus();
				await userEvent.keyboard('b');

				await expect.element(popup).not.toHaveAttribute('data-ending-style');
				await expect.element(input()).toHaveValue('apb');
				await expect.element(page.getByTestId('empty')).toHaveTextContent('No matches');
				await expect.element(page.getByRole('option')).not.toBeInTheDocument();
			} finally {
				style.remove();
			}
		});
	});

	it('does not aria-hide the input group when the input is outside the popup', async () => {
		render(ComboboxHarness, {
			staticItems: [{ value: 'apple' }, { value: 'banana' }],
			inputGroup: true,
			trigger: true
		});

		await userEvent.click(input());
		await expect.element(listbox()).toBeVisible();
		await tick();

		await expect.element(input()).toHaveFocus();
		await expect
			.element(page.getByTestId('input-group'))
			.not.toHaveAttribute('aria-hidden', 'true');
	});

	it('dismisses the popup when clicking a plain wrapper around the input', async () => {
		render(ComboboxHarness, {
			staticItems: [{ value: 'apple' }, { value: 'banana' }],
			inputWrapper: true,
			trigger: true,
			triggerProps: { 'aria-label': 'Open' }
		});

		await userEvent.click(page.getByRole('button', { name: 'Open' }));
		await expect.element(listbox()).toBeVisible();

		await userEvent.click(page.getByTestId('pad'));
		await expect.element(listbox()).not.toBeInTheDocument();
	});

	it('does not dismiss when pressing content inside a nested popover', async () => {
		render(ComboboxHarness, {
			open: true,
			inputInside: true,
			staticItems: apple,
			popupExtra: 'popover'
		});

		await userEvent.click(page.getByRole('button', { name: 'Open nested popover' }));
		await userEvent.click(page.getByRole('button', { name: 'Nested focusable content' }));

		await expect.element(listbox()).toBeInTheDocument();
	});

	it('wraps modal focus from popup controls back to the input', async () => {
		render(ComboboxHarness, {
			open: true,
			inputInside: true,
			staticItems: apple,
			root: { modal: true },
			popupExtra: 'button'
		});

		input().element().focus();
		await userEvent.tab();
		await expect.element(page.getByRole('button', { name: 'Extra control' })).toHaveFocus();

		await userEvent.tab();
		await expect.element(input()).toHaveFocus();
	});

	it('does not loop when items becomes undefined', async () => {
		const props = renderBound(ComboboxHarness, { open: true, items: [] as string[] });

		props.items = undefined;
		await tick();

		await expect.element(input()).toHaveAttribute('aria-expanded', 'true');
	});

	// Upstream hides outside content with a modal focus manager. Here the focus manager is not
	// modal while the input is outside the popup, so outside content stays exposed.
	it('keeps the trigger and outside content exposed while open with the input outside the popup', async () => {
		render(ComboboxHarness, { items: ['Apple', 'Banana'], trigger: true, around: true });

		await userEvent.click(input());
		await expect.element(listbox()).toBeVisible();

		expect(isElementOrAncestorInert(page.getByTestId('outside').element())).toBe(false);
		expect(isElementOrAncestorInert(trigger().element())).toBe(false);
	});

	it('does not render the start dismiss button while closed', async () => {
		render(ComboboxHarness, { items: ['Apple', 'Banana'] });

		await expect.element(page.getByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
	});

	it('renders internal dismiss buttons before the input and after the popup', async () => {
		render(ComboboxHarness, {
			open: true,
			inputInside: true,
			items: ['Apple', 'Banana'],
			root: { modal: true },
			popup: { 'aria-label': 'Demo' },
			input: { 'aria-label': 'Combobox input' },
			around: true
		});

		const popup = page.getByTestId('popup').element();
		const field = page.getByRole('combobox', { name: 'Combobox input' }).element();
		const [start, end] = page.getByRole('button', { name: 'Dismiss' }).elements();

		expect(field.previousElementSibling).toBe(start);
		expect(popup.nextElementSibling).toBe(end);
		expect(start).not.toHaveAttribute('tabindex');
		expect(end).not.toHaveAttribute('tabindex');
		await expect
			.poll(() => isElementOrAncestorInert(page.getByTestId('outside').element()))
			.toBe(true);

		(end as HTMLElement).click();
		await expect.element(listbox()).not.toBeInTheDocument();
	});

	it('renders an internal dismiss button for the input-outside-popup pattern', async () => {
		render(ComboboxHarness, { items: ['Apple', 'Banana'] });

		await userEvent.click(input());

		const popup = page.getByTestId('popup').element();
		const [start, end] = page.getByRole('button', { name: 'Dismiss' }).elements();

		expect(input().element().previousElementSibling).toBe(start);
		expect(popup.nextElementSibling).toBe(end);
		expect(start).not.toHaveAttribute('tabindex');
		expect(end).not.toHaveAttribute('tabindex');

		(start as HTMLElement).click();
		await expect.element(listbox()).not.toBeInTheDocument();
	});
});
