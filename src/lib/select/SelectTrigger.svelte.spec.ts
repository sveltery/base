// Assertions follow Base UI v1.9.0 packages/react/src/select/trigger/SelectTrigger.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported, React only: `describeConformance` (ref forwarding and render-prop cloning).
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Select } from '#lib';
import { fireHeldPress, wait } from '../../tests/select-events.js';
import SelectHarness from '../../tests/SelectHarness.svelte';

const trigger = () => page.getByTestId('trigger');
const value = () => page.getByTestId('value');
const listbox = () => page.getByRole('listbox');
const ab = [{ value: 'a' }, { value: 'b' }];

afterEach(() => {
	document.body.style.padding = '';
});

describe('Select.Trigger', () => {
	it('throws a descriptive error when rendered outside <Select.Root>', () => {
		expect(() => render(Select.Trigger)).toThrow(
			'Base UI: SelectRootContext is missing. Select parts must be placed within <Select.Root>.'
		);
	});

	it('closes an aligned popup when focus lands on the trigger so it is not obscured', async () => {
		document.body.style.padding = '200px 0 0 0';
		const onOpenChange = vi.fn();
		render(SelectHarness, {
			open: true,
			root: { defaultValue: 'a', onOpenChange },
			positioner: { alignItemWithTrigger: true },
			items: ab
		});

		await expect.element(page.getByTestId('positioner')).toHaveAttribute('data-side', 'none');

		trigger().element().dispatchEvent(new FocusEvent('focus'));

		await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');
		expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'none' }));
	});

	it('keeps a non-aligned popup open when focus lands on the trigger', async () => {
		const onOpenChange = vi.fn();
		render(SelectHarness, {
			open: true,
			root: { onOpenChange },
			positioner: { alignItemWithTrigger: false },
			items: [{ value: 'a' }]
		});

		trigger().element().dispatchEvent(new FocusEvent('focus'));
		await wait(20);

		await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	describe('releasing the opening press', () => {
		async function pressTrigger() {
			render(SelectHarness, {
				positioner: { alignItemWithTrigger: false },
				items: [{ value: 'a' }]
			});
			const element = trigger().element() as HTMLElement;
			element.getBoundingClientRect = () =>
				DOMRect.fromRect({ x: 100, y: 100, width: 100, height: 40 });

			element.dispatchEvent(
				new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0 })
			);
			element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, detail: 1 }));
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');
			await wait(20);
		}

		function release(clientX: number, clientY: number) {
			document.body.dispatchEvent(
				new MouseEvent('mouseup', { bubbles: true, button: 0, clientX, clientY })
			);
		}

		it('keeps the popup open when the press slips up to 5px off the trigger', async () => {
			await pressTrigger();

			release(96, 120);
			await wait(20);

			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');
		});

		it('closes the popup when the press is dragged off the trigger and released', async () => {
			await pressTrigger();

			release(94, 120);

			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');
		});
	});

	describe('disabled state', () => {
		it('is removed from the tab order when disabled and not rendered as a button', async () => {
			render(SelectHarness, { root: { disabled: true }, triggerAsDiv: true });

			await expect.element(trigger()).toHaveAttribute('tabindex', '-1');
		});

		it('cannot be focused when disabled', async () => {
			render(SelectHarness, { root: { defaultValue: 'b' }, trigger: { disabled: true }, items: ab });
			await expect.element(trigger()).toHaveAttribute('data-disabled');

			await userEvent.keyboard('{Tab}');

			await expect.element(trigger()).not.toHaveFocus();
		});

		it('does not toggle the popup when disabled', async () => {
			const onOpenChange = vi.fn();
			render(SelectHarness, {
				root: { defaultValue: 'b', onOpenChange },
				trigger: { disabled: true },
				items: ab
			});

			(trigger().element() as HTMLElement).click();
			await wait(20);

			await expect.element(listbox()).not.toBeInTheDocument();
			expect(onOpenChange).not.toHaveBeenCalled();
		});
	});

	describe('placeholder state', () => {
		it('should have the data-placeholder attribute when provided `null` value', async () => {
			render(SelectHarness, { value: null, items: [{ value: 'a' }] });

			await expect.element(trigger()).toHaveAttribute('data-placeholder');
			await expect.element(value()).toHaveAttribute('data-placeholder');
		});

		it('should have the data-placeholder attribute when provided custom property with `itemToStringValue`', async () => {
			const methods = [
				{ id: '', name: 'Default' },
				{ id: 'standard', name: 'Standard' },
				{ id: 'express', name: 'Express' },
				{ id: 'overnight', name: 'Overnight' }
			];
			type Method = (typeof methods)[number];
			render(SelectHarness, {
				root: {
					defaultValue: methods[0],
					itemToStringValue: (item: Method) => item.id,
					itemToStringLabel: (item: Method) => item.name
				}
			});

			await expect.element(trigger()).toHaveAttribute('data-placeholder');
			await expect.element(value()).toHaveAttribute('data-placeholder');
			expect(value().element().textContent).toBe('Default');
		});

		it('should have the data-placeholder attribute when provided { value: null }', async () => {
			render(SelectHarness, { root: { items: [{ label: 'Select font', value: null }] } });

			await expect.element(trigger()).toHaveAttribute('data-placeholder');
			await expect.element(value()).toHaveAttribute('data-placeholder');
			expect(value().element().textContent).toBe('Select font');
		});

		it('should not have the data-placeholder attribute when provided a value', async () => {
			render(SelectHarness, { root: { defaultValue: 'a' } });

			await expect.element(trigger()).not.toHaveAttribute('data-placeholder');
			await expect.element(value()).not.toHaveAttribute('data-placeholder');
		});

		it('should not have the data-placeholder attribute when multiple mode has a default value', async () => {
			render(SelectHarness, { root: { multiple: true, defaultValue: ['a'] } });

			await expect.element(trigger()).not.toHaveAttribute('data-placeholder');
			await expect.element(value()).not.toHaveAttribute('data-placeholder');
		});
	});

	describe('style hooks', () => {
		it('sets data-popup-side to the current popup side', async () => {
			render(SelectHarness, {
				positioner: { side: 'right', alignItemWithTrigger: false },
				items: [{ value: 'apple' }]
			});
			await expect.element(trigger()).not.toHaveAttribute('data-popup-side');

			await userEvent.click(trigger());
			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(trigger()).toHaveAttribute('data-popup-side', 'right');

			await fireHeldPress(document.body, 0);
			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(trigger()).not.toHaveAttribute('data-popup-side');
		});

		it('sets data-popup-side to the resolved side when alignItemWithTrigger is active', async () => {
			document.body.style.padding = '100px 0 0 10px';
			render(SelectHarness, {
				root: { defaultValue: 'apple' },
				trigger: { style: 'width:120px;height:36px' },
				popup: { style: 'max-height:none' },
				items: [{ value: 'apple' }, { value: 'orange' }]
			});

			await userEvent.click(trigger());

			await expect.element(page.getByTestId('positioner')).toHaveAttribute('data-side', 'none');
			await expect.element(trigger()).toHaveAttribute('data-popup-side', 'bottom');
		});

		it('should have the data-popup-open and data-pressed attributes when open', async () => {
			render(SelectHarness);

			await userEvent.click(page.getByRole('combobox'));

			await expect.element(trigger()).toHaveAttribute('data-popup-open');
			await expect.element(trigger()).toHaveAttribute('data-pressed');
		});
	});

	describe('prop: required', () => {
		it('sets aria-required attribute when required', async () => {
			render(SelectHarness, { root: { required: true } });

			await expect.element(trigger()).toHaveAttribute('aria-required', 'true');
		});
	});
});
