// Assertions follow Base UI v1.9.0 packages/react/src/combobox/root/ComboboxRoot.test.tsx,
// "dialog pattern" (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see
// THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxDialogHarness from '../../tests/ComboboxDialogHarness.svelte';

const combobox = () => page.getByRole('combobox');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const dialog = () => page.getByRole('dialog');
const dialogInput = () => page.getByTestId('dialog-input');
const flush = async () => {
	await tick();
	await Promise.resolve();
	await tick();
};
const keydown = (target: Element, key: string) =>
	target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('Combobox.Root', () => {
	describe('dialog pattern', () => {
		it.each([
			[false, ''],
			[false, 'Ba'],
			[true, ''],
			[true, 'Ba']
		] as const)(
			'clears the highlight when a keepMounted dialog closes (multiple=%s, query="%s")',
			async (multiple, query) => {
				const onItemHighlighted = vi.fn();
				const onValueChange = vi.fn();
				render(ComboboxDialogHarness, {
					pattern: 'keep-mounted',
					multiple,
					onItemHighlighted,
					onValueChange
				});

				const trigger = page.getByRole('button', { name: 'Choose fruit' });
				await userEvent.click(trigger);
				await expect.element(combobox()).toHaveFocus();
				if (query) await userEvent.type(combobox(), query);
				await userEvent.keyboard(query ? '{ArrowDown}' : '{ArrowDown}{ArrowDown}');
				await expect.element(option('Banana')).toHaveAttribute('data-highlighted');
				onItemHighlighted.mockClear();

				await userEvent.keyboard('{Enter}');
				await expect.element(dialog()).not.toBeInTheDocument();
				expect(onValueChange).toHaveBeenLastCalledWith(multiple ? ['Banana'] : 'Banana');
				expect(onItemHighlighted.mock.calls.map(([value]) => value)).toEqual([undefined]);

				async function reopenAndNavigate(closeWithEscape = false) {
					await userEvent.click(trigger);
					await expect.element(combobox()).toHaveFocus();
					await expect.element(combobox()).not.toHaveAttribute('aria-activedescendant');
					onValueChange.mockClear();
					await userEvent.keyboard('{Enter}');
					expect(onValueChange).not.toHaveBeenCalled();
					await userEvent.keyboard('{ArrowDown}');
					if (closeWithEscape) await userEvent.keyboard('{Escape}');
					else await userEvent.click(page.getByRole('button', { name: 'Done' }));
					await expect.element(dialog()).not.toBeInTheDocument();
				}

				await reopenAndNavigate(true);
				await reopenAndNavigate();
				await reopenAndNavigate();
			}
		);

		it('clears the highlight when an inline list in an unbound dialog unmounts', async () => {
			render(ComboboxDialogHarness, { pattern: 'unbound' });

			const trigger = page.getByRole('button', { name: 'Choose fruit' });
			trigger.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));
			await expect.element(combobox()).toHaveFocus();
			keydown(combobox().element(), 'ArrowDown');
			keydown(combobox().element(), 'ArrowDown');
			await expect.element(option('Banana')).toHaveAttribute('data-highlighted');

			keydown(combobox().element(), 'Escape');
			await expect.element(dialog()).not.toBeInTheDocument();

			trigger.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));
			await expect.element(combobox()).toHaveFocus();
			await expect.element(combobox()).not.toHaveAttribute('aria-activedescendant');
			keydown(combobox().element(), 'ArrowDown');
			await expect.element(option('Apple')).toHaveAttribute('data-highlighted');
		});

		it('does not let pending dialog initial focus steal focus from an async-enabled combobox', async () => {
			// Keeps the dialog's initial-focus frame pending until after the combobox click.
			const frameCallbacks = new Map<number, FrameRequestCallback>();
			let frameId = 0;
			const requestSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
				frameId += 1;
				frameCallbacks.set(frameId, callback);
				return frameId;
			});
			const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
				frameCallbacks.delete(id);
			});

			try {
				render(ComboboxDialogHarness, { pattern: 'async' });
				const fruit = page.getByLabelText('Fruit', { exact: true });

				await expect.element(fruit).toBeEnabled();
				await userEvent.click(fruit);
				await expect.element(page.getByRole('listbox')).toBeVisible();

				const callbacks = [...frameCallbacks.values()];
				frameCallbacks.clear();
				callbacks.forEach((callback) => callback(performance.now()));
				await flush();

				await expect.element(fruit).toHaveFocus();
				await expect.element(page.getByRole('listbox')).toBeVisible();
			} finally {
				requestSpy.mockRestore();
				cancelSpy.mockRestore();
			}
		});

		describe('multiple', () => {
			async function selectAppleWhileFiltering() {
				render(ComboboxDialogHarness, { pattern: 'multiple', open: true });
				await expect.element(dialogInput()).toBeInTheDocument();

				await userEvent.type(dialogInput(), 'ap');
				await expect.element(option('Banana')).not.toBeInTheDocument();
				await expect.element(option('Apple')).toBeInTheDocument();
				await expect.element(option('Apricot')).toBeInTheDocument();

				await userEvent.click(option('Apple'));

				await expect.element(dialogInput()).toHaveValue('');
				await expect.element(option('Banana')).toBeInTheDocument();
				await expect.element(dialogInput()).toHaveAttribute('aria-activedescendant');
			}

			it('clears input after filtering, removes filter and highlight', async () => {
				await selectAppleWhileFiltering();
			});

			it('still filters after selecting an item', async () => {
				await selectAppleWhileFiltering();

				await userEvent.type(dialogInput(), 'ap');
				await expect.element(option('Banana')).not.toBeInTheDocument();
			});

			it('retains highlight on selected item when not filtering', async () => {
				render(ComboboxDialogHarness, { pattern: 'multiple', open: true });
				await expect.element(dialogInput()).toBeInTheDocument();

				dialogInput().element().focus();
				await userEvent.keyboard('{ArrowDown}');
				await expect
					.element(dialogInput())
					.toHaveAttribute('aria-activedescendant', option('Apple').element().id);

				await userEvent.keyboard('{Enter}');
				await expect
					.element(dialogInput())
					.toHaveAttribute('aria-activedescendant', option('Apple').element().id);
			});
		});

		describe('single', () => {
			async function selectApple() {
				render(ComboboxDialogHarness, { pattern: 'single' });

				const trigger = page.getByTestId('dialog-trigger');
				await userEvent.click(trigger);

				await expect.element(page.getByRole('dialog', { name: 'Fruit chooser' })).toBeInTheDocument();
				await userEvent.type(dialogInput(), 'ap');
				await userEvent.click(option('Apple'));

				await expect
					.element(page.getByRole('dialog', { name: 'Fruit chooser' }))
					.not.toBeInTheDocument();
				return trigger;
			}

			it('closes the dialog after selecting an item and updates the trigger value', async () => {
				const trigger = await selectApple();
				await expect.element(trigger).toHaveTextContent('Apple');
			});

			it('clears the filter input when re-opening after a selection', async () => {
				const trigger = await selectApple();

				await userEvent.click(trigger);
				await expect.element(page.getByRole('dialog', { name: 'Fruit chooser' })).toBeInTheDocument();

				await expect.element(dialogInput()).toHaveValue('');
				await expect.element(option('Banana')).toBeInTheDocument();
			});

			it('restores highlight when the input regains focus', async () => {
				render(ComboboxDialogHarness, { pattern: 'single', open: true });
				await expect.element(dialogInput()).toBeInTheDocument();

				dialogInput().element().focus();
				await userEvent.keyboard('{ArrowDown}');

				const apple = option('Apple');
				await expect.element(dialogInput()).toHaveAttribute('aria-activedescendant', apple.element().id);
				await expect.element(apple).toHaveAttribute('data-highlighted');

				const done = page.getByRole('button', { name: 'Done' }).element();
				const input = dialogInput().element();
				input.dispatchEvent(new FocusEvent('blur', { relatedTarget: done }));
				input.dispatchEvent(new FocusEvent('focusout', { relatedTarget: done, bubbles: true }));
				done.dispatchEvent(new FocusEvent('focus'));
				await flush();

				await expect.element(dialogInput()).not.toHaveAttribute('aria-activedescendant');
				await expect.element(apple).not.toHaveAttribute('data-highlighted');

				done.dispatchEvent(new FocusEvent('blur', { relatedTarget: input }));
				input.dispatchEvent(new FocusEvent('focus'));
				input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

				await expect.element(dialogInput()).toHaveAttribute('aria-activedescendant', apple.element().id);
				await expect.element(apple).toHaveAttribute('data-highlighted');
			});
		});
	});
});
