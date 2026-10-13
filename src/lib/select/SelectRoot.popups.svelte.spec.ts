// Assertions follow Base UI v1.9.0 packages/react/src/select/root/SelectRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Modal backdrop, touch, scroll lock, unmount(), scroll arrows, nesting in a popover, disabled,
// read-only and id cases. Not ported: the requestAnimationFrame-mocked touch reopen case
// (React scheduling) and `strict` (React StrictMode).
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SelectFieldHarness from '../../tests/SelectFieldHarness.svelte';
import SelectHarness from '../../tests/SelectHarness.svelte';
import SelectInPopoverHarness from '../../tests/SelectInPopoverHarness.svelte';
import {
	fireHeldPress,
	nextFrame,
	pressWithTouch,
	scrollGeometry,
	scrollLocked,
	wait
} from '../../tests/select-events.js';

const ab = [{ value: 'a' }, { value: 'b' }];
const trigger = () => page.getByTestId('trigger');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const listbox = () => page.getByRole('listbox');
const hiddenInput = () => document.querySelector<HTMLInputElement>('input[aria-hidden="true"]')!;

describe('Select.Root', () => {
	describe('prop: modal', () => {
		it('renders an internal backdrop when true', async () => {
			render(SelectHarness, { root: { modal: true }, items: [{ value: '1' }], around: true });
			await userEvent.click(trigger());
			await expect.element(listbox()).toBeVisible();
			const positioner = page.getByTestId('positioner').element();
			expect(positioner.previousElementSibling?.getAttribute('role')).toBe('presentation');
		});

		it('does not render an internal backdrop when false', async () => {
			render(SelectHarness, { root: { modal: false }, items: [{ value: '1' }], around: true });
			await userEvent.click(trigger());
			await expect.element(listbox()).toBeVisible();
			expect(page.getByTestId('positioner').element().previousElementSibling).toBeNull();
		});
	});

	describe('touch', () => {
		it('keeps touch positioning during the close transition', async () => {
			const style = document.createElement('style');
			style.textContent = `
				@keyframes select-close-test { to { opacity: 0; } }
				[data-testid="popup"][data-ending-style] { animation: select-close-test 100ms linear; }
			`;
			document.head.append(style);
			try {
				render(SelectHarness, { items: [{ value: 'Item' }] });
				pressWithTouch(trigger().element());
				await expect.element(listbox()).toBeVisible();
				const positioner = page.getByTestId('positioner').element() as HTMLElement;
				await expect.poll(() => getComputedStyle(positioner).position).toBe('absolute');

				pressWithTouch(trigger().element());
				await expect.element(page.getByTestId('popup')).toHaveAttribute('data-ending-style');
				expect(getComputedStyle(positioner).position).toBe('absolute');
			} finally {
				style.remove();
			}
		});

		it('keeps the selected item highlighted when reopening after a touch-driven mouseleave', async () => {
			render(SelectHarness, { items: [{ value: 'a' }, { value: 'b' }, { value: 'c' }] });
			pressWithTouch(trigger().element());
			await expect.element(listbox()).toBeVisible();

			const optionB = option('b').element();
			optionB.dispatchEvent(
				new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' })
			);
			optionB.dispatchEvent(new MouseEvent('click', { bubbles: true }));
			optionB.dispatchEvent(
				new MouseEvent('mouseleave', { bubbles: true, clientX: -1, clientY: -1 })
			);
			await expect.element(listbox()).not.toBeInTheDocument();

			pressWithTouch(trigger().element());
			await expect.element(option('b')).toHaveAttribute('data-highlighted');
		});

		it('locks scroll when a touch-opened popup covers the viewport width', async () => {
			render(SelectHarness, {
				root: { modal: true },
				items: [{ value: '1' }],
				positioner: { style: 'width: calc(100vw - 10px)' }
			});
			pressWithTouch(trigger().element());
			await expect.element(listbox()).toBeVisible();
			await expect.poll(scrollLocked).toBe(true);
		});

		it('does not lock scroll when a touch-opened popup is narrower than the viewport', async () => {
			render(SelectHarness, {
				root: { modal: true },
				items: [{ value: '1' }],
				positioner: { style: 'width: 240px' }
			});
			pressWithTouch(trigger().element());
			await expect.element(listbox()).toBeVisible();
			await nextFrame();
			expect(scrollLocked()).toBe(false);
		});
	});

	describe('unmount()', () => {
		it('unmounts the select', async () => {
			const view = render(SelectHarness, {
				root: { onOpenChange: (_open, details) => details.preventUnmountOnClose() },
				items: [{ value: '1' }]
			});
			await userEvent.click(trigger());
			await expect.element(listbox()).toBeVisible();

			await userEvent.click(trigger());
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');
			await expect.element(listbox()).toBeInTheDocument();

			await nextFrame();
			view.component.unmount();
			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('clears scroll arrow visibility', async () => {
			const view = render(SelectHarness, {
				root: { onOpenChange: (_open, details) => details.preventUnmountOnClose() },
				positioner: { alignItemWithTrigger: false },
				list: true,
				listProps: scrollGeometry({ scrollTop: 20, scrollHeight: 100, clientHeight: 50 }),
				scrollArrows: true,
				scrollArrowProps: { keepMounted: true },
				items: [
					{ value: 'one', text: 'One' },
					{ value: 'two', text: 'Two' }
				]
			});
			await userEvent.click(trigger());
			await expect.element(listbox()).toBeVisible();
			listbox().element().dispatchEvent(new Event('scroll'));

			const upArrow = page.getByTestId('scroll-up').element();
			const downArrow = page.getByTestId('scroll-down').element();
			await expect.poll(() => upArrow.hasAttribute('data-visible')).toBe(true);
			await expect.poll(() => downArrow.hasAttribute('data-visible')).toBe(true);

			await userEvent.click(trigger());
			await nextFrame();
			view.component.unmount();

			await expect.poll(() => upArrow.hasAttribute('data-visible')).toBe(false);
			await expect.poll(() => downArrow.hasAttribute('data-visible')).toBe(false);
		});

		it('does not leave a tabbable option while closed and kept mounted after tabbing out', async () => {
			render(SelectHarness, {
				around: true,
				root: {
					defaultValue: '1',
					modal: false,
					onOpenChange: (_open, details) => details.preventUnmountOnClose()
				},
				items: [{ value: '1' }, { value: '2' }]
			});
			await userEvent.click(trigger());
			const first = option('1').element() as HTMLElement;
			first.focus();
			await expect.element(option('1')).toHaveFocus();
			expect(first.getAttribute('tabindex')).toBe('0');

			await userEvent.tab();
			await expect.element(page.getByTestId('after')).toHaveFocus();
			expect(document.querySelector('[role="listbox"]')?.hasAttribute('data-open')).toBe(false);
			expect(first.getAttribute('tabindex')).toBe('-1');
		});
	});

	describe('scroll arrows', () => {
		it('normalizes overlapping fractional scroll ranges', async () => {
			let scrollTop = 0.4;
			render(SelectHarness, {
				open: true,
				positioner: { alignItemWithTrigger: false },
				list: true,
				listProps: scrollGeometry({
					scrollTop: {
						get: () => scrollTop,
						set: (value) => {
							scrollTop = value;
						}
					},
					scrollHeight: 60.6,
					clientHeight: 60
				}),
				scrollArrows: true,
				scrollArrowProps: { keepMounted: true },
				items: [
					{ value: 'one', text: 'One' },
					{ value: 'two', text: 'Two' },
					{ value: 'three', text: 'Three' }
				]
			});
			const upArrow = page.getByTestId('scroll-up').element();
			const downArrow = page.getByTestId('scroll-down').element();

			await expect.poll(() => upArrow.hasAttribute('data-visible')).toBe(true);
			expect(downArrow.hasAttribute('data-visible')).toBe(false);

			scrollTop = 0.2;
			listbox().element().dispatchEvent(new Event('scroll'));

			// One scroll handler updates both arrows.
			await expect.poll(() => downArrow.hasAttribute('data-visible')).toBe(true);
			expect(upArrow.hasAttribute('data-visible')).toBe(false);
		});

		it('keeps a scroll arrow mounted while its exit animation runs', async () => {
			let scrollTop = 0;
			const style = document.createElement('style');
			style.textContent = `
				@keyframes select-scroll-arrow-close-test { to { opacity: 0; } }
				[data-testid="scroll-down"][data-ending-style] {
					animation: select-scroll-arrow-close-test 100ms linear;
				}
			`;
			document.head.append(style);
			try {
				render(SelectHarness, {
					open: true,
					positioner: { alignItemWithTrigger: false },
					list: true,
					listProps: scrollGeometry({
						scrollTop: {
							get: () => scrollTop,
							set: (value) => {
								scrollTop = value;
							}
						},
						scrollHeight: 100,
						clientHeight: 60
					}),
					scrollArrows: true,
					items: [
						{ value: 'one', text: 'One' },
						{ value: 'two', text: 'Two' },
						{ value: 'three', text: 'Three' }
					]
				});
				await expect.element(page.getByTestId('scroll-down')).toHaveAttribute('data-visible');

				scrollTop = 40;
				listbox().element().dispatchEvent(new Event('scroll'));

				await expect.element(page.getByTestId('scroll-down')).toHaveAttribute('data-ending-style');
				await expect.element(page.getByTestId('scroll-down')).not.toBeInTheDocument();
			} finally {
				style.remove();
			}
		});
	});

	describe('inside a popover', () => {
		it('dismisses the popover with one outside press after reopening an aligned select', async () => {
			render(SelectInPopoverHarness, { defaultValue: 'gala' });
			const selectTrigger = page.getByTestId('select-trigger');
			await expect.element(selectTrigger).toBeVisible();

			await userEvent.click(selectTrigger);
			await expect.element(option('Gala')).toBeVisible();
			await userEvent.click(option('Fuji'));
			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(page.getByTestId('popover-popup')).toBeVisible();

			await fireHeldPress(document.body);
			await expect.element(page.getByTestId('popover-popup')).not.toBeInTheDocument();
		});

		it('dismisses the popover after reopening a selected aligned select', async () => {
			render(SelectInPopoverHarness, { popoverOpen: false, withList: true });
			await userEvent.click(page.getByRole('button', { name: 'Open popover' }));
			await expect.element(page.getByTestId('popover-popup')).toBeVisible();

			await userEvent.click(page.getByTestId('select-trigger'));
			await userEvent.click(option('Gala'));
			await expect.element(listbox()).not.toBeInTheDocument();

			await userEvent.click(page.getByTestId('select-trigger'));
			await userEvent.click(option('Fuji'));
			await expect.element(listbox()).not.toBeInTheDocument();

			await fireHeldPress(document.body);
			await expect.element(page.getByTestId('popover-popup')).not.toBeInTheDocument();
		});

		it('keeps a modal popover open when choosing a non-modal aligned select item', async () => {
			render(SelectInPopoverHarness, { popoverModal: true, selectModal: false });
			await userEvent.click(page.getByTestId('select-trigger'));
			await expect.element(listbox()).toBeVisible();
			await userEvent.click(option('Fuji'));
			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(page.getByTestId('popover-popup')).toBeVisible();
		});

		it('does not bubble Escape from a non-modal select to the popover', async () => {
			render(SelectInPopoverHarness, { selectModal: false, alignItemWithTrigger: false });
			await userEvent.click(page.getByTestId('select-trigger'));
			await expect.element(listbox()).toBeVisible();
			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(page.getByTestId('popover-popup')).toBeVisible();
		});

		it('returns focus to the opener when a select is opened programmatically', async () => {
			render(SelectInPopoverHarness, { programmatic: true, alignItemWithTrigger: false });
			const opener = page.getByRole('button', { name: 'Open select programmatically' });
			await userEvent.click(opener);
			await expect.element(listbox()).toBeVisible();
			await userEvent.click(option('Fuji'));
			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(opener).toHaveFocus();
			await expect.element(page.getByTestId('popover-popup')).toBeVisible();
		});

		it('does not consume the next outside press after a drag from the select trigger', async () => {
			render(SelectInPopoverHarness, {});
			const selectTrigger = page.getByTestId('select-trigger').element();
			const rect = selectTrigger.getBoundingClientRect();
			const start = {
				bubbles: true,
				cancelable: true,
				button: 0,
				buttons: 1,
				clientX: rect.left + rect.width / 2,
				clientY: rect.top + rect.height / 2
			};
			selectTrigger.dispatchEvent(
				new PointerEvent('pointerdown', { ...start, pointerType: 'mouse' })
			);
			selectTrigger.dispatchEvent(new MouseEvent('mousedown', start));
			await expect.element(listbox()).toBeVisible();
			await wait(0);

			const end = { bubbles: true, cancelable: true, button: 0, clientX: 400, clientY: 20 };
			const endTarget = document.elementFromPoint(400, 20) as Element;
			endTarget.dispatchEvent(
				new PointerEvent('pointermove', { ...end, buttons: 1, pointerType: 'mouse' })
			);
			endTarget.dispatchEvent(new MouseEvent('mousemove', { ...end, buttons: 1 }));
			endTarget.dispatchEvent(
				new PointerEvent('pointerup', { ...end, buttons: 0, pointerType: 'mouse' })
			);
			endTarget.dispatchEvent(new MouseEvent('mouseup', { ...end, buttons: 0 }));

			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(page.getByTestId('popover-popup')).toBeVisible();

			await fireHeldPress(document.body, 0);
			await expect.element(page.getByTestId('popover-popup')).not.toBeInTheDocument();
		});
	});

	describe('prop: disabled', () => {
		it('sets the disabled state', async () => {
			const onOpenChange = vi.fn();
			render(SelectHarness, {
				root: { defaultValue: 'b', onOpenChange, disabled: true },
				items: ab
			});
			const element = trigger().element();
			expect(element.hasAttribute('disabled')).toBe(true);
			expect(element.hasAttribute('data-disabled')).toBe(true);

			await userEvent.tab();
			expect(document.activeElement).not.toBe(element);

			await userEvent.click(trigger(), { force: true });
			expect(onOpenChange).not.toHaveBeenCalled();
		});

		it('updates the disabled state when the prop changes', async () => {
			const onOpenChange = vi.fn();
			const view = render(SelectHarness, {
				root: { defaultValue: 'b', onOpenChange, disabled: true },
				items: ab
			});
			const element = trigger().element();
			expect(element.hasAttribute('disabled')).toBe(true);
			await userEvent.click(trigger(), { force: true });
			expect(onOpenChange).not.toHaveBeenCalled();

			await view.rerender({ root: { defaultValue: 'b', onOpenChange, disabled: false } });
			await expect.element(trigger()).not.toHaveAttribute('disabled');
			await expect.element(trigger()).not.toHaveAttribute('data-disabled');

			await userEvent.tab();
			await expect.element(trigger()).toHaveFocus();

			await userEvent.click(trigger());
			await expect.poll(() => onOpenChange.mock.calls.length).toBe(1);
		});
	});

	describe('prop: readonly', () => {
		it('sets the read-only state', async () => {
			render(SelectHarness, { root: { defaultValue: 'b', readonly: true }, items: ab });
			await expect.element(trigger()).toHaveAttribute('aria-readonly', 'true');
			await expect.element(trigger()).toHaveAttribute('data-readonly');
			await userEvent.tab();
			await expect.element(trigger()).toHaveFocus();
		});

		it('opens the popup when clicked', async () => {
			const onOpenChange = vi.fn();
			render(SelectHarness, { root: { onOpenChange, readonly: true }, items: ab });
			await userEvent.click(trigger());
			await expect.element(listbox()).toHaveAttribute('aria-readonly', 'true');
			expect(onOpenChange).toHaveBeenCalledTimes(1);
		});

		it('marks the listbox read-only when rendered with Select.List', async () => {
			render(SelectHarness, { root: { readonly: true }, list: true, items: [{ value: 'a' }] });
			await userEvent.click(trigger());
			await expect.element(listbox()).toHaveAttribute('aria-readonly', 'true');
		});

		it.each([
			{ name: 'ArrowDown', key: '{ArrowDown}' },
			{ name: 'Enter', key: '{Enter}' },
			{ name: 'Space', key: '[Space]' }
		])('opens the popup with $name', async ({ key }) => {
			const onOpenChange = vi.fn();
			render(SelectHarness, { root: { onOpenChange, readonly: true }, items: ab });
			(trigger().element() as HTMLElement).focus();
			await userEvent.keyboard(key);
			await expect.element(listbox()).toBeVisible();
			expect(onOpenChange).toHaveBeenCalledTimes(1);
		});

		it('does not commit a value when an item is clicked', async () => {
			const onValueChange = vi.fn();
			render(SelectHarness, { root: { onValueChange, readonly: true }, items: ab });
			await userEvent.click(trigger());
			await userEvent.click(option('b'));
			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(option('b')).not.toHaveAttribute('data-selected');
			expect(page.getByTestId('value').element().textContent).toBe('');
		});

		it('does not commit a value with Enter on a highlighted item', async () => {
			const onValueChange = vi.fn();
			render(SelectHarness, { root: { onValueChange, readonly: true }, items: ab });
			(trigger().element() as HTMLElement).focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(listbox()).toBeVisible();
			await userEvent.keyboard('{Enter}');
			expect(onValueChange).not.toHaveBeenCalled();
			expect(page.getByTestId('value').element().textContent).toBe('');
		});

		it('does not commit a value with typeahead on a closed trigger', async () => {
			const onValueChange = vi.fn();
			render(SelectHarness, {
				root: { onValueChange, readonly: true },
				items: [{ value: 'apple' }, { value: 'banana' }]
			});
			(trigger().element() as HTMLElement).focus();
			await userEvent.keyboard('b');
			await tick();
			expect(onValueChange).not.toHaveBeenCalled();
			expect(page.getByTestId('value').element().textContent).toBe('');
		});

		it('moves the highlight with typeahead while the popup is open', async () => {
			const onValueChange = vi.fn();
			render(SelectHarness, {
				open: true,
				root: { onValueChange, readonly: true },
				items: [{ value: 'apple' }, { value: 'banana' }]
			});
			await expect.element(option('apple')).toBeVisible();
			(option('apple').element() as HTMLElement).focus();
			await userEvent.keyboard('b');
			await expect.element(option('banana')).toHaveAttribute('data-highlighted');
			expect(onValueChange).not.toHaveBeenCalled();
			expect(page.getByTestId('value').element().textContent).toBe('');
		});
	});

	describe('prop: id', () => {
		it('sets the id on the trigger', async () => {
			render(SelectHarness, { root: { id: 'test-id' }, items: ab });
			await expect.element(trigger()).toHaveAttribute('id', 'test-id');
		});

		it('sets a hidden input id when name is not provided', async () => {
			render(SelectHarness, { root: { id: 'test-id' } });
			expect(hiddenInput().id).toBe('test-id-hidden-input');
			expect(hiddenInput().hasAttribute('name')).toBe(false);
		});

		it('does not set a hidden input id when name is provided', async () => {
			render(SelectHarness, { root: { id: 'test-id', name: 'country' } });
			expect(hiddenInput().getAttribute('name')).toBe('country');
			expect(hiddenInput().hasAttribute('id')).toBe(false);
		});
	});

	describe('with a Field.Root parent', () => {
		it('applies the root id to the trigger', async () => {
			render(SelectFieldHarness, { fieldLabel: 'Label', select: { root: { id: 'test-id' } } });
			await expect.element(trigger()).toHaveAttribute('id', 'test-id');
			await expect.element(page.getByTestId('field-label')).toHaveAttribute('for', 'test-id');
		});

		it('takes disabled from Field.Root', async () => {
			render(SelectFieldHarness, { field: { disabled: true }, select: { items: ab } });
			await expect.element(trigger()).toHaveAttribute('disabled');
		});

		it('takes name from Field.Root', async () => {
			render(SelectFieldHarness, { field: { name: 'field-select' }, select: { items: ab } });
			expect(hiddenInput().getAttribute('name')).toBe('field-select');
		});
	});

	it('resets the selected index when the value is set to null without a null item', async () => {
		const view = render(SelectHarness, {
			value: null,
			formatValue: (value) => (value == null ? 'initial' : String(value)),
			items: [{ value: '1' }, { value: '2' }]
		});
		await view.rerender({ value: '1' });
		await expect.element(page.getByTestId('value')).toHaveTextContent('1');
		await view.rerender({ value: '2' });
		await expect.element(page.getByTestId('value')).toHaveTextContent('2');
		await view.rerender({ value: null });
		await expect.element(page.getByTestId('value')).toHaveTextContent('initial');

		await userEvent.click(trigger());
		await expect.element(option('2')).not.toHaveAttribute('data-selected');
	});

	it('does not mount the popup on a programmatic value change', async () => {
		const withItems = render(SelectHarness, {
			value: null,
			root: { items: { a: 'Apple', b: 'Banana' } },
			valueProps: { 'data-testid': 'items-value' },
			trigger: { 'data-testid': 'items-trigger' },
			items: [
				{ value: 'a', text: 'Apple' },
				{ value: 'b', text: 'Banana' }
			]
		});
		const plain = render(SelectHarness, {
			value: null,
			valueProps: { 'data-testid': 'plain-value' },
			trigger: { 'data-testid': 'plain-trigger' },
			items: ab
		});
		expect(document.querySelectorAll('[role="listbox"]')).toHaveLength(0);

		await withItems.rerender({ value: 'b' });
		await plain.rerender({ value: 'b' });

		// The label resolves without the list, with or without `items`.
		expect(document.querySelectorAll('[role="listbox"]')).toHaveLength(0);
		await expect.element(page.getByTestId('items-value')).toHaveTextContent('Banana');
		await expect.element(page.getByTestId('plain-value')).toHaveTextContent('b');
	});
});
