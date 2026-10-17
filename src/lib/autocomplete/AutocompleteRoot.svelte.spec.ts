// Assertions follow Base UI v1.9.0 packages/react/src/autocomplete/root/AutocompleteRoot.test.tsx
// up to "prop: onItemHighlighted", and the Autocomplete cases of
// packages/react/src/combobox/root/ComboboxRoot.test.tsx, clear/ComboboxClear.test.tsx,
// trigger/ComboboxTrigger.test.tsx, list/ComboboxList.test.tsx and store.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `actionsRef` is the root's exported `close()` and `unmount()`, `defaultOpen` cases use `open`
// without a binding, which also sets the initial state, and `setProps` is a write to a bound prop.
// Not ported, React only: the React.startTransition unmount case, and the store.test.tsx cases
// that observe React store transactions, `useStore` re-reads and ref callbacks during commit.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { REASONS } from '@sveltery/utils';
import { renderBound } from '../../tests/bound-render.svelte.js';
import AutocompleteHarness from '../../tests/AutocompleteHarness.svelte';

const input = () => page.getByTestId('input');
const combobox = () => page.getByRole('combobox');
const listbox = () => page.getByRole('listbox');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const apple = [{ value: 'apple', text: 'Apple' }];
const alphaBeta = [{ value: 'alpha' }, { value: 'beta' }];
const closes = (spy: ReturnType<typeof vi.fn>) => spy.mock.calls.filter(([open]) => !open);
const flush = async () => {
	await tick();
	await Promise.resolve();
	await tick();
};
const hiddenInput = () => document.querySelector<HTMLInputElement>('input[aria-hidden="true"]')!;

function autofill(element: HTMLInputElement, value: string) {
	element.value = value;
	element.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('Autocomplete.Root', () => {
	it('exposes the orientation attribute rendered by Separator', async () => {
		render(AutocompleteHarness, { open: true, staticItems: alphaBeta, separator: true });
		await expect
			.element(page.getByTestId('separator'))
			.toHaveAttribute('data-orientation', 'horizontal');
	});

	describe('manual unmount lifecycle', () => {
		const popupRoot = { openOnInputClick: true };

		it('automatically unmounts and completes closing once', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(AutocompleteHarness, {
				staticItems: apple,
				root: { ...popupRoot, onOpenChangeComplete }
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
			const view = render(AutocompleteHarness, {
				open: true,
				staticItems: apple,
				root: {
					...popupRoot,
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
			const view = render(AutocompleteHarness, {
				open: true,
				staticItems: apple,
				root: {
					...popupRoot,
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
			render(AutocompleteHarness, {
				open: true,
				staticItems: apple,
				root: {
					...popupRoot,
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
			const view = render(AutocompleteHarness, {
				open: true,
				staticItems: apple,
				root: {
					...popupRoot,
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
			const view = render(AutocompleteHarness, {
				open: true,
				staticItems: apple,
				root: { ...popupRoot, onOpenChangeComplete }
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
			const view = render(AutocompleteHarness, {
				open: true,
				staticItems: apple,
				root: {
					...popupRoot,
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
			const view = render(AutocompleteHarness, {
				open: true,
				staticItems: apple,
				root: { ...popupRoot, onOpenChangeComplete }
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
			const props = renderBound(AutocompleteHarness, {
				open: true,
				staticItems: apple,
				api: (api) => (methods = api),
				root: {
					...popupRoot,
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
			const view = render(AutocompleteHarness, {
				staticItems: apple,
				root: { ...popupRoot, onOpenChange }
			});

			view.component.close();
			await tick();
			expect(onOpenChange).not.toHaveBeenCalled();
			await expect.element(combobox()).toHaveAttribute('aria-expanded', 'false');
		});

		it('completes closing once when unmount() is called twice in one batch', async () => {
			const onOpenChangeComplete = vi.fn();
			const view = render(AutocompleteHarness, {
				open: true,
				staticItems: apple,
				root: {
					...popupRoot,
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

	describe('keyboard interactions', () => {
		it('closes the popup on Tab after choosing with Enter and typing again', async () => {
			render(AutocompleteHarness, {
				items: ['alpha', 'alpine', 'beta'],
				root: { autoHighlight: true },
				outside: true
			});

			await userEvent.type(input(), 'al');
			await expect.element(option('alpha')).toHaveAttribute('data-highlighted');

			await userEvent.keyboard('{Enter}');
			await expect.element(input()).toHaveValue('alpha');
			await expect.element(listbox()).not.toBeInTheDocument();

			await userEvent.clear(input());
			await userEvent.type(input(), 'a');
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.keyboard('{Tab}');
			await expect.element(listbox()).not.toBeInTheDocument();
		});
	});

	describe('input inside the popup', () => {
		it('commits a keyboard choice, restores trigger focus and keeps it on reopen', async () => {
			render(AutocompleteHarness, {
				items: ['alpha', 'alpine', 'beta'],
				inputInside: true,
				root: { autoHighlight: true }
			});
			const trigger = page.getByTestId('trigger');

			await userEvent.click(trigger);
			await expect.element(input()).toHaveFocus();
			await userEvent.keyboard('al');
			await expect.element(option('alpha')).toHaveAttribute('data-highlighted');
			await userEvent.keyboard('{Enter}');

			await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
			await expect.element(trigger).toHaveFocus();
			await expect.element(trigger).toHaveTextContent('alpha');

			await userEvent.click(trigger);
			await expect.element(input()).toHaveValue('alpha');
			await expect.element(option('alpha')).toBeInTheDocument();

			await userEvent.keyboard('{Escape}');
			await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
		});

		it('keeps the typed value when the popup is dismissed with Escape', async () => {
			const onValueChange = vi.fn();
			render(AutocompleteHarness, {
				items: ['alpha', 'alpine', 'beta'],
				inputInside: true,
				root: { onValueChange }
			});
			const trigger = page.getByTestId('trigger');

			await userEvent.click(trigger);
			await expect.element(input()).toHaveFocus();
			await userEvent.keyboard('al');
			await userEvent.keyboard('{Escape}');

			await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
			await expect.element(trigger).toHaveFocus();
			await expect.element(trigger).toHaveTextContent('al');
			expect(onValueChange.mock.lastCall?.[0]).toBe('al');

			await userEvent.click(trigger);
			await expect.element(input()).toHaveValue('al');
			await expect.element(option('alpha')).toBeInTheDocument();
			await expect.element(option('alpine')).toBeInTheDocument();
			await expect.element(option('beta')).not.toBeInTheDocument();

			await userEvent.keyboard('{Escape}');
			await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
		});
	});

	describe('browser autofill', () => {
		it('fills the input from the hidden input', async () => {
			render(AutocompleteHarness, {
				staticItems: alphaBeta,
				field: { name: 'auto' },
				root: { defaultValue: '' }
			});

			autofill(hiddenInput(), 'beta');
			await flush();

			await expect.element(input()).toHaveValue('beta');
		});

		it.each(['readonly', 'disabled'] as const)(
			'ignores hidden-input autofill when %s',
			async (prop) => {
				const onValueChange = vi.fn();
				render(AutocompleteHarness, {
					staticItems: alphaBeta,
					field: { name: 'auto' },
					root: { defaultValue: '', [prop]: true, onValueChange }
				});

				autofill(hiddenInput(), 'beta');
				await flush();

				expect(onValueChange).not.toHaveBeenCalled();
				await expect.element(input()).toHaveValue('');
			}
		);
	});

	describe('readonly', () => {
		it('opens the list with the arrow keys but does not commit an item press', async () => {
			const onValueChange = vi.fn();
			render(AutocompleteHarness, {
				staticItems: alphaBeta,
				root: { defaultValue: '', readonly: true, onValueChange }
			});

			await userEvent.click(input());
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(listbox()).toHaveAttribute('aria-readonly', 'true');

			await userEvent.click(option('beta'));

			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(input()).toHaveValue('');
		});

		it('does not fill the input with the highlighted item', async () => {
			render(AutocompleteHarness, {
				staticItems: alphaBeta,
				root: { defaultValue: '', readonly: true, mode: 'both' }
			});

			// Focused without a pointer event so the highlight is reported as keyboard-driven.
			input().element().focus();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');

			await expect.element(option('alpha')).toHaveAttribute('data-highlighted');
			await expect.element(input()).toHaveValue('');
		});

		it('drops a pending inline completion when readonly is turned on', async () => {
			const props = renderBound(AutocompleteHarness, {
				staticItems: alphaBeta,
				root: { defaultValue: '', mode: 'both' as const }
			});

			await userEvent.click(input());
			await userEvent.keyboard('a');
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input()).toHaveValue('alpha');

			props.root = { ...props.root, readonly: true };
			await expect.element(input()).toHaveValue('a');

			// The suppressed completion must not come back when editing is restored.
			props.root = { ...props.root, readonly: false };
			await flush();
			await expect.element(input()).toHaveValue('a');
		});

		it('exposes aria-autocomplete="none"', async () => {
			render(AutocompleteHarness, {
				staticItems: alphaBeta,
				root: { defaultValue: '', readonly: true, mode: 'both' }
			});

			await expect.element(input()).toHaveAttribute('aria-autocomplete', 'none');
		});

		it('sets aria-readonly on the listbox', async () => {
			render(AutocompleteHarness, {
				open: true,
				noInput: true,
				staticItems: [{ value: 'a' }],
				root: { readonly: true }
			});

			await expect.element(listbox()).toHaveAttribute('aria-readonly', 'true');
		});
	});

	it('puts the name on the visible input and leaves the hidden input unnamed', async () => {
		render(AutocompleteHarness, {
			staticItems: alphaBeta,
			root: { name: 'search' },
			input: { autocomplete: 'on' }
		});

		await expect.element(combobox()).toHaveAttribute('name', 'search');
		await expect.element(combobox()).toHaveAttribute('autocomplete', 'on');
		const hidden = hiddenInput();
		expect(hidden.hasAttribute('name')).toBe(false);
		expect(hidden.id).not.toBe('');
		expect(hidden.hasAttribute('autocomplete')).toBe(false);
	});

	it('gives the name to the hidden input when the input is inside the popup', async () => {
		render(AutocompleteHarness, {
			items: ['alpha', 'beta'],
			inputInside: true,
			portal: { keepMounted: true },
			root: { name: 'search' }
		});

		await expect.element(input()).not.toHaveAttribute('name');
		const named = document.querySelectorAll('[name="search"]');
		expect(named).toHaveLength(1);
		expect(named[0]).toHaveAttribute('aria-hidden', 'true');
	});

	it('does not expose data-placeholder on Trigger or InputGroup', async () => {
		render(AutocompleteHarness, {
			items: ['alpha', 'beta'],
			inputGroup: true,
			trigger: true,
			root: { openOnInputClick: true }
		});
		const group = page.getByTestId('input-group');
		const trigger = page.getByTestId('trigger');

		await expect.element(group).not.toHaveAttribute('data-placeholder');
		await expect.element(trigger).not.toHaveAttribute('data-placeholder');

		await userEvent.type(input(), 'al');

		await expect.element(group).not.toHaveAttribute('data-placeholder');
		await expect.element(trigger).not.toHaveAttribute('data-placeholder');
	});

	it('renders and clears the typed value with Clear', async () => {
		render(AutocompleteHarness, { clear: true, root: { defaultValue: 'apple' } });

		await expect.element(combobox()).toHaveValue('apple');
		await userEvent.click(page.getByTestId('clear'));

		await expect.element(combobox()).toHaveValue('');
		await expect.element(combobox()).toHaveFocus();
	});

	it('validates the input text when the trigger is blurred', async () => {
		const validate = vi.fn();
		render(AutocompleteHarness, {
			noInput: true,
			trigger: true,
			popupLess: true,
			field: { validationMode: 'onBlur', validate },
			root: { defaultValue: 'query' }
		});
		const trigger = page.getByTestId('trigger').element() as HTMLElement;

		trigger.dispatchEvent(new FocusEvent('focus'));
		trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		trigger.dispatchEvent(new FocusEvent('blur'));
		trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
		await flush();

		expect(validate).toHaveBeenCalledWith('query', expect.anything());
	});

	it('validates the input when focus leaves its popup', async () => {
		const validate = vi.fn();
		render(AutocompleteHarness, {
			open: true,
			inputInside: true,
			field: { validationMode: 'onBlur', validate },
			root: { defaultValue: 'query' }
		});
		await expect.element(input()).toBeInTheDocument();

		await userEvent.click(document.body);

		await expect.poll(() => validate).toHaveBeenCalledWith('query', expect.anything());
	});

	it('restores the first highlight after an always-highlighted query becomes empty', async () => {
		render(AutocompleteHarness, {
			open: true,
			inline: true,
			items: ['apple'],
			root: { autoHighlight: 'always' }
		});

		await userEvent.type(combobox(), 'z');
		await expect.element(page.getByRole('option')).not.toBeInTheDocument();

		await userEvent.clear(combobox());

		await expect.element(option('apple')).toHaveAttribute('data-highlighted');
	});

	describe('submitOnItemClick without a form', () => {
		it('fills the input when no form owns the autocomplete', async () => {
			render(AutocompleteHarness, {
				open: true,
				staticItems: [{ value: 'apple' }],
				root: { submitOnItemClick: true }
			});

			(option('apple').element() as HTMLElement).click();
			await expect.element(combobox()).toHaveValue('apple');
		});

		it('fills the input when requestSubmit is unavailable', async () => {
			render(AutocompleteHarness, {
				open: true,
				nativeForm: true,
				staticItems: [{ value: 'apple' }],
				root: { submitOnItemClick: true }
			});
			const form = page.getByTestId('form').element();
			Object.defineProperty(form, 'requestSubmit', { configurable: true, value: undefined });

			(option('apple').element() as HTMLElement).click();
			await expect.element(combobox()).toHaveValue('apple');
		});
	});

	describe('prop: onItemHighlighted', () => {
		it('passes native mouse and pointer events for pointer highlights', async () => {
			const onItemHighlighted = vi.fn();
			render(AutocompleteHarness, {
				open: true,
				staticItems: apple,
				root: { onItemHighlighted }
			});

			const item = option('Apple').element();
			const hoverEvent = new MouseEvent('mousemove', { bubbles: true });
			item.dispatchEvent(hoverEvent);
			await expect
				.poll(() => onItemHighlighted.mock.lastCall)
				.toEqual(['apple', expect.objectContaining({ reason: 'pointer', event: hoverEvent })]);
			expect(onItemHighlighted.mock.lastCall?.[1].event).toBe(hoverEvent);

			// React derives `onPointerLeave` from `pointerout`; Svelte listens for `pointerleave`.
			const leaveEvent = new PointerEvent('pointerleave', { pointerType: 'mouse' });
			item.dispatchEvent(leaveEvent);
			await expect
				.poll(() => onItemHighlighted.mock.lastCall)
				.toEqual([undefined, expect.objectContaining({ reason: 'pointer', event: leaveEvent })]);
			expect(onItemHighlighted.mock.lastCall?.[1].event).toBe(leaveEvent);
		});
	});
});
