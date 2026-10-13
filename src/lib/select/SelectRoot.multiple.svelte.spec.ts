// Assertions follow Base UI v1.9.0 packages/react/src/select/root/SelectRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Covers `prop: multiple`, `prop: isItemEqualToValue`, `prop: highlightItemOnHover`, `groups`,
// `item-aligned popup interaction`, `opening` and `closing`. Not ported, React only: `trigger
// render cost` counts React renders of the trigger.
// Multiple values submit through one hidden `<select multiple>`, so the serialization cases
// read its selected options instead of counting `<input>` elements.
import { tick, type ComponentProps } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { renderBound } from '../../tests/bound-render.svelte.js';
import { nextFrame, wait } from '../../tests/select-events.js';
import SelectHarness, { type HarnessItem } from '../../tests/SelectHarness.svelte';

const trigger = () => page.getByTestId('trigger');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const listbox = () => page.getByRole('listbox');
const named = (...values: string[]): HarnessItem[] => values.map((value) => ({ value }));
const abc = named('a', 'b', 'c');
const hiddenInput = () => document.querySelector<HTMLInputElement>('input[aria-hidden="true"]')!;
const submittedOptions = (name: string) =>
	[...document.querySelectorAll<HTMLSelectElement>(`select[name="${name}"]`)].flatMap((select) =>
		[...select.selectedOptions].map((entry) => entry.value)
	);

type HarnessProps = ComponentProps<typeof SelectHarness>;

function live(initial: HarnessProps) {
	return renderBound(SelectHarness, initial, { value: undefined, open: false });
}

async function update(props: HarnessProps, next: Partial<HarnessProps>) {
	Object.assign(props, next);
	await tick();
}

async function openSelect() {
	await userEvent.click(trigger());
	await expect.element(listbox()).toBeVisible();
}

async function closeWithEscape() {
	await userEvent.keyboard('{Escape}');
	await expect.element(listbox()).not.toBeInTheDocument();
}

function focusTrigger() {
	(trigger().element() as HTMLElement).focus();
}

function expectNothingSelected() {
	for (const element of document.querySelectorAll('[role="option"]')) {
		expect(element.hasAttribute('data-selected')).toBe(false);
	}
}

describe('Select.Root', () => {
	afterEach(() => {
		document.body.style.padding = '';
	});

	describe('prop: multiple', () => {
		it('removes selections that no longer exist', async () => {
			const props = live({ root: { multiple: true, defaultValue: ['a', 'c'] }, items: abc });

			await openSelect();
			await expect.element(option('a')).toHaveAttribute('data-selected', '');
			await expect.element(option('c')).toHaveAttribute('data-selected', '');
			await closeWithEscape();

			await update(props, { items: named('a', 'b') });
			await openSelect();
			await expect.element(option('a')).toHaveAttribute('data-selected', '');
			await expect.element(option('c')).not.toBeInTheDocument();
			await closeWithEscape();

			await update(props, { items: named('b') });
			await openSelect();
			await expect.element(option('b')).toBeVisible();
			expectNothingSelected();
		});

		it('removes selections replaced without changing the item count', async () => {
			const onValueChange = vi.fn();
			const props = live({
				value: ['a', 'c'],
				open: true,
				root: { multiple: true, onValueChange },
				items: abc
			});

			await expect.element(option('a')).toHaveAttribute('data-selected', '');
			await expect.element(option('c')).toHaveAttribute('data-selected', '');

			await update(props, { items: named('a', 'b', 'd') });

			await expect.poll(() => onValueChange.mock.lastCall?.[0]).toEqual(['a']);
			await expect.element(option('a')).toHaveAttribute('data-selected', '');
			await expect.element(option('d')).not.toHaveAttribute('data-selected');
		});

		it('should allow multiple selections when multiple is true', async () => {
			const onValueChange = vi.fn();
			live({ value: [], root: { multiple: true, onValueChange }, items: abc });

			await openSelect();
			await userEvent.click(option('a'));
			expect(onValueChange.mock.calls[0][0]).toEqual(['a']);
			await expect.element(option('a')).toHaveAttribute('data-selected', '');

			await userEvent.click(option('b'));
			expect(onValueChange.mock.calls[1][0]).toEqual(['a', 'b']);
			await expect.element(option('a')).toHaveAttribute('data-selected', '');
			await expect.element(option('b')).toHaveAttribute('data-selected', '');
			await expect.element(listbox()).toBeVisible();
		});

		it('keeps the selection when items are added and none of the selected ones are removed', async () => {
			const onValueChange = vi.fn();
			const props = live({
				open: true,
				root: { multiple: true, defaultValue: ['a'], onValueChange },
				items: named('a', 'b')
			});
			await expect.element(option('a')).toHaveAttribute('data-selected', '');

			await update(props, { items: abc });
			await expect.element(option('c')).toBeInTheDocument();

			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(option('a')).toHaveAttribute('data-selected', '');
		});

		it('should deselect items when clicked again in multiple mode', async () => {
			const onValueChange = vi.fn();
			live({ value: ['a', 'b'], root: { multiple: true, onValueChange }, items: abc });

			await openSelect();
			await expect.element(option('a')).toHaveAttribute('data-selected', '');
			await expect.element(option('b')).toHaveAttribute('data-selected', '');

			await userEvent.click(option('a'));

			expect(onValueChange.mock.calls[0][0]).toEqual(['b']);
			await expect.element(option('a')).not.toHaveAttribute('data-selected');
			await expect.element(option('b')).toHaveAttribute('data-selected', '');
		});

		it('should update selected items when the controlled value prop changes while open', async () => {
			const props = live({ value: ['a', 'b'], root: { multiple: true }, items: abc });

			await openSelect();
			await expect.element(option('a')).toHaveAttribute('data-selected', '');
			await expect.element(option('b')).toHaveAttribute('data-selected', '');

			await update(props, { value: ['b'] });

			await expect.element(option('b')).toHaveAttribute('data-selected', '');
			await expect.element(option('a')).not.toHaveAttribute('data-selected');
		});

		it('keeps the active index on a deselected item in multiple mode', async () => {
			// A fixed trigger width keeps the popup under the pointer as the value text grows.
			// Otherwise Chromium reports the item leaving the pointer, which clears the highlight.
			live({
				value: ['a'],
				root: { multiple: true },
				trigger: { style: 'width:120px' },
				items: abc
			});

			await openSelect();
			await userEvent.click(option('b'));
			await expect.element(option('b')).toHaveAttribute('data-highlighted');

			await userEvent.click(option('b'));
			await expect.element(option('b')).toHaveAttribute('data-highlighted');
		});

		it('highlights the first selected item in rendered order regardless of value order', async () => {
			render(SelectHarness, { root: { multiple: true, defaultValue: ['b', 'a', 'c'] }, items: abc });

			await openSelect();

			await expect.element(option('a')).toHaveAttribute('data-highlighted');
			await expect.element(option('b')).not.toHaveAttribute('data-highlighted');
			await expect.element(option('c')).not.toHaveAttribute('data-highlighted');
		});

		it('re-elects the anchor when the anchor item value changes in place', async () => {
			const props = live({ root: { multiple: true, defaultValue: ['a', 'c'] }, items: abc });

			await openSelect();
			await closeWithEscape();

			await update(props, { items: named('x', 'b', 'c') });
			await openSelect();

			await expect.element(option('c')).toHaveAttribute('data-highlighted');
			await expect.element(option('x')).not.toHaveAttribute('data-highlighted');
		});

		it('moves the anchor to the next selected item when the anchor item leaves the list', async () => {
			const props = live({ root: { multiple: true, defaultValue: ['a', 'b', 'c'] }, items: abc });

			await openSelect();
			await closeWithEscape();

			await update(props, { items: named('b', 'c') });
			await openSelect();

			await expect.element(option('b')).toHaveAttribute('data-highlighted');
			await expect.element(option('c')).not.toHaveAttribute('data-highlighted');
		});

		it('re-anchors backwards when a new isItemEqualToValue identity re-runs every item', async () => {
			const options = [0, 1, 2, 3].map((id) => ({ value: { id }, text: `opt-${id}` }));
			const root = () => ({
				multiple: true,
				isItemEqualToValue: (a: { id: number }, b: { id: number }) => a.id === b.id
			});
			const props = live({
				value: [{ id: 2 }, { id: 3 }],
				root: root(),
				items: options,
				formatValue: () => 'value'
			});

			await openSelect();
			await expect.element(option('opt-2')).toHaveAttribute('data-highlighted');
			await closeWithEscape();

			await update(props, { value: [{ id: 0 }, { id: 1 }], root: root() });
			await openSelect();

			await expect.element(option('opt-0')).toHaveAttribute('data-highlighted');
			await expect.element(option('opt-1')).not.toHaveAttribute('data-highlighted');
		});

		it('aligns the first selected item with the trigger when alignItemWithTrigger is active', async () => {
			document.body.style.padding = '120px 0 0 32px';
			render(SelectHarness, {
				root: { multiple: true, defaultValue: ['opt-10', 'opt-30'] },
				trigger: { style: 'width:160px;height:36px' },
				popup: { style: 'max-height:none;min-height:100px' },
				items: Array.from({ length: 40 }, (_, index) => ({ value: `opt-${index}` }))
			});

			await openSelect();

			const anchor = option('opt-10');
			await expect.element(anchor).toHaveAttribute('data-highlighted');
			await expect.element(page.getByTestId('popup')).toHaveAttribute('data-side', 'none');

			const center = (element: Element) => {
				const rect = element.getBoundingClientRect();
				return rect.top + rect.height / 2;
			};
			await expect
				.poll(() => Math.abs(center(anchor.element()) - center(trigger().element())))
				.toBeLessThanOrEqual(1);
		});

		it('anchors to the first selected item when opened with the keyboard', async () => {
			render(SelectHarness, { root: { multiple: true, defaultValue: ['b', 'c'] }, items: abc });

			await userEvent.keyboard('{Tab}');
			await expect.element(trigger()).toHaveFocus();
			await userEvent.keyboard('{ArrowDown}');

			await expect.element(option('b')).toHaveAttribute('data-highlighted');
			await expect.element(option('c')).not.toHaveAttribute('data-highlighted');
		});

		it('continues arrow navigation from the anchor rather than the top of the list', async () => {
			render(SelectHarness, {
				root: { multiple: true, defaultValue: ['b', 'c'] },
				items: named('a', 'b', 'c', 'd')
			});

			await openSelect();
			await expect.element(option('b')).toHaveAttribute('data-highlighted');
			await expect.element(option('b')).toHaveFocus();

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('c')).toHaveAttribute('data-highlighted');

			await userEvent.keyboard('{ArrowUp}');
			await expect.element(option('b')).toHaveAttribute('data-highlighted');
		});

		it('keeps the highlight on an item deselected with the keyboard', async () => {
			render(SelectHarness, { root: { multiple: true, defaultValue: ['b', 'c'] }, items: abc });

			await openSelect();
			await expect.element(option('b')).toHaveAttribute('data-highlighted');
			await expect.element(option('b')).toHaveFocus();

			await userEvent.keyboard('{Enter}');
			await expect.element(option('b')).toHaveAttribute('aria-selected', 'false');
			await expect.element(option('b')).toHaveAttribute('data-highlighted');
		});

		it('anchors to the first selected item in rendered order across groups', async () => {
			render(SelectHarness, {
				root: { multiple: true, defaultValue: ['spinach', 'plum'] },
				groups: [
					{ label: 'Vegetables', items: named('artichoke', 'spinach') },
					{ label: 'Fruits', items: named('apple', 'plum') }
				]
			});

			await openSelect();

			await expect.element(option('spinach')).toHaveAttribute('data-highlighted');
			await expect.element(option('plum')).not.toHaveAttribute('data-highlighted');
		});

		it('scrolls the first selected item into view on open', async ({ onTestFinished }) => {
			const scrollIntoView = vi.spyOn(HTMLElement.prototype, 'scrollIntoView');
			onTestFinished(() => scrollIntoView.mockRestore());
			render(SelectHarness, {
				root: { multiple: true, defaultValue: ['item 80', 'item 90'] },
				positioner: { alignItemWithTrigger: false },
				popup: { style: 'max-height:200px;overflow-y:auto' },
				items: Array.from({ length: 100 }, (_, index) => ({ value: `item ${index}` }))
			});

			scrollIntoView.mockClear();
			await openSelect();

			const selected = option('item 80');
			await expect.element(selected).toHaveAttribute('data-highlighted');
			await expect.poll(() => scrollIntoView.mock.contexts).toContain(selected.element());
		});

		it('should handle defaultValue as array in multiple mode', async () => {
			render(SelectHarness, { root: { multiple: true, defaultValue: ['a', 'c'] }, items: abc });

			await openSelect();

			await expect.element(option('a')).toHaveAttribute('data-selected', '');
			await expect.element(option('b')).not.toHaveAttribute('data-selected');
			await expect.element(option('c')).toHaveAttribute('data-selected', '');
		});

		it('should serialize multiple values correctly for form submission', async () => {
			render(SelectHarness, { value: ['a', 'c'], root: { multiple: true, name: 'select' }, items: abc });

			expect(submittedOptions('select')).toEqual(['a', 'c']);
		});

		it('does not submit multiple values when disabled', async () => {
			const form = document.createElement('form');
			document.body.append(form);
			try {
				render(SelectHarness, {
					target: form,
					props: {
						value: ['a', 'c'],
						root: { multiple: true, disabled: true, name: 'select' },
						items: abc
					}
				});

				expect(new FormData(form).getAll('select')).toEqual([]);
			} finally {
				form.remove();
			}
		});

		it('should serialize empty array as empty string in multiple mode', async () => {
			render(SelectHarness, { root: { multiple: true, name: 'select' }, items: abc });

			expect(submittedOptions('select')).toEqual([]);
			expect(hiddenInput().value).toBe('');
		});

		it('does not mark the hidden input as required when selection exists', async () => {
			render(SelectHarness, {
				value: ['a'],
				root: { multiple: true, required: true, name: 'select' }
			});

			expect(hiddenInput().hasAttribute('required')).toBe(false);
		});

		it('keeps the hidden input required when no selection exists', async () => {
			render(SelectHarness, { value: [], root: { multiple: true, required: true, name: 'select' } });

			expect(hiddenInput().hasAttribute('required')).toBe(true);
		});

		it('should not close popup when selecting items in multiple mode', async () => {
			render(SelectHarness, { root: { multiple: true }, items: abc });

			await openSelect();
			await userEvent.click(option('a'));
			await expect.element(listbox()).toBeVisible();

			await userEvent.click(option('b'));
			await expect.element(listbox()).toBeVisible();
		});

		it('should close popup in single select mode', async () => {
			render(SelectHarness, { items: abc });

			await openSelect();
			await userEvent.click(option('a'));

			await expect.element(listbox()).not.toBeInTheDocument();
		});

		it('should update selected items when value prop changes', async () => {
			const props = live({ value: ['a'], root: { multiple: true }, items: abc });

			await openSelect();
			await expect.element(option('a')).toHaveAttribute('data-selected', '');
			await expect.element(option('b')).not.toHaveAttribute('data-selected');

			await update(props, { value: ['a', 'b', 'c'] });

			await expect.element(option('a')).toHaveAttribute('data-selected', '');
			await expect.element(option('b')).toHaveAttribute('data-selected', '');
			await expect.element(option('c')).toHaveAttribute('data-selected', '');
		});
	});

	describe('prop: isItemEqualToValue', () => {
		const users = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];
		type User = (typeof users)[number];
		const userItems = users.map((user) => ({ value: user, text: user.name }));
		const byId = {
			itemToStringLabel: (item: User) => item.name,
			itemToStringValue: (item: User) => String(item.id),
			isItemEqualToValue: (item: User, value: User) => item.id === value.id
		};

		it('matches object values using the provided comparator', async () => {
			render(SelectHarness, { value: { id: 2, name: 'Bob' }, root: byId, items: userItems });
			await expect.element(trigger()).toHaveTextContent('Bob');

			await userEvent.click(trigger());

			await expect.element(option('Bob')).toHaveAttribute('data-selected', '');
		});

		it('matches object values when the popup is mounted on the initial render', async () => {
			render(SelectHarness, {
				open: true,
				value: { id: 2, name: 'Bob' },
				root: byId,
				items: userItems
			});

			await expect.element(option('Bob')).toHaveAttribute('data-selected', '');
			await expect.element(option('Alice')).not.toHaveAttribute('data-selected');
		});

		it('passes item as the first comparator argument in multiple mode', async () => {
			const tagged = users.map((user) => ({ ...user, source: 'item' }));
			render(SelectHarness, {
				open: true,
				root: {
					multiple: true,
					defaultValue: [{ id: 2, name: 'Bob', source: 'selected' }],
					itemToStringLabel: (item: User) => item.name,
					itemToStringValue: (item: User) => String(item.id),
					isItemEqualToValue: (item: { id: number; source: string }, value: typeof item) =>
						item.id === value.id && item.source === 'item' && value.source === 'selected'
				},
				items: tagged.map((user) => ({ value: user, text: user.name }))
			});

			await expect.element(option('Bob')).toHaveAttribute('data-selected', '');

			(option('Bob').element() as HTMLElement).click();

			await expect.element(option('Bob')).not.toHaveAttribute('data-selected');
		});
	});

	describe('prop: highlightItemOnHover', () => {
		it('highlights an item on mouse move by default', async () => {
			render(SelectHarness, { open: true, items: abc });

			await userEvent.hover(option('b'));

			await expect.element(option('b')).toHaveAttribute('data-highlighted');
		});

		it('highlights the first item after opening when alignItemWithTrigger is active and no value is selected', async () => {
			document.body.style.padding = '120px 0 0 24px';
			render(SelectHarness, {
				trigger: { style: 'width:120px;height:36px' },
				valueProps: { placeholder: 'Pick one' },
				popup: { style: 'max-height:none' },
				items: abc
			});

			const element = trigger().element();
			element.dispatchEvent(
				new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', detail: 1 })
			);
			element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, detail: 1 }));

			await expect.element(option('a')).toHaveAttribute('data-highlighted');
		});

		it('does not highlight items from mouse movement when disabled', async () => {
			render(SelectHarness, { open: true, root: { highlightItemOnHover: false }, items: abc });

			await userEvent.hover(option('b'));
			await wait(50);

			await expect.element(option('b')).not.toHaveAttribute('data-highlighted');
		});

		it('does not remove highlight when mousing out of popup when disabled', async () => {
			render(SelectHarness, {
				open: true,
				root: { highlightItemOnHover: false },
				items: abc
			});

			await userEvent.hover(option('a'));
			await expect.element(listbox()).toHaveFocus();

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('a')).toHaveAttribute('data-highlighted');

			await userEvent.unhover(listbox());
			await wait(50);
			await expect.element(option('a')).toHaveAttribute('data-highlighted');
		});
	});

	describe('groups', () => {
		it('navigates across groups without stopping on labels or separators', async () => {
			render(SelectHarness, {
				positioner: { alignItemWithTrigger: false },
				separator: true,
				groups: [
					{ label: 'Fruits', items: named('apple', 'banana') },
					{ label: 'Vegetables', items: named('carrot', 'leek') }
				]
			});

			focusTrigger();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('apple')).toHaveFocus();

			await userEvent.keyboard('{ArrowDown}{ArrowDown}');
			await expect.element(option('carrot')).toHaveFocus();

			await userEvent.keyboard('{End}');
			await expect.element(option('leek')).toHaveFocus();

			await userEvent.keyboard('{Home}');
			await expect.element(option('apple')).toHaveFocus();
		});
	});

	describe('item-aligned popup interaction', () => {
		const items = Array.from({ length: 30 }, (_, index) => ({ value: `Item ${index}` }));

		async function settleFrames() {
			await nextFrame();
			await nextFrame();
		}

		function hoverInPlace(item: HTMLElement) {
			const init = { bubbles: true, pointerType: 'mouse', movementX: 1, movementY: 1 };
			item.dispatchEvent(new PointerEvent('pointerover', init));
			item.dispatchEvent(new PointerEvent('pointerenter', { ...init, bubbles: false }));
			item.dispatchEvent(new PointerEvent('pointermove', init));
			item.dispatchEvent(new MouseEvent('mousemove', init));
		}

		function popupGeometry() {
			const popup = page.getByTestId('popup').element() as HTMLElement;
			const rect = popup.getBoundingClientRect();
			return { top: rect.top, height: rect.height, scrollTop: popup.scrollTop };
		}

		it('does not move the popup or its list when hovering items at its edges', async () => {
			document.body.style.padding = '240px 0 0 0';
			render(SelectHarness, {
				root: { defaultValue: 'Item 15' },
				trigger: { style: 'height:30px' },
				popup: { style: 'max-height:200px' },
				itemStyle: 'height:30px',
				items
			});

			await userEvent.click(trigger());
			await expect.element(option('Item 15')).toHaveFocus();
			await settleFrames();
			const before = popupGeometry();
			const popupRect = page.getByTestId('popup').element().getBoundingClientRect();
			const options = [...document.querySelectorAll<HTMLElement>('[role="option"]')];
			const topEdge = options.find(
				(entry) => entry.getBoundingClientRect().bottom > popupRect.top
			)!;
			const bottomEdge = options
				.filter((entry) => entry.getBoundingClientRect().top < popupRect.bottom)
				.at(-1)!;

			// Playwright's hover scrolls a partly hidden item into view first, which would move the
			// list by itself. Synthetic pointer moves leave the scroll position alone.
			for (const item of [bottomEdge, topEdge]) {
				hoverInPlace(item);
				await expect.element(item).toHaveAttribute('data-highlighted');
				await settleFrames();
				expect(popupGeometry()).toEqual(before);
			}
		});

		it('keeps the highlighted item visible while keyboard navigation grows the popup', async () => {
			render(SelectHarness, {
				root: { defaultValue: 'Item 1' },
				trigger: { style: 'position:fixed;left:20px;bottom:160px;height:30px' },
				popup: { style: 'max-height:400px' },
				itemStyle: 'height:30px',
				items
			});

			focusTrigger();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('Item 1')).toHaveFocus();
			await settleFrames();
			const positioner = page.getByTestId('positioner').element();
			const initialHeight = positioner.getBoundingClientRect().height;

			function isInsidePopup(name: string) {
				const popupRect = page.getByTestId('popup').element().getBoundingClientRect();
				const itemRect = option(name).element().getBoundingClientRect();
				return itemRect.top >= popupRect.top - 1 && itemRect.bottom <= popupRect.bottom + 1;
			}

			async function navigate(from: number, to: number) {
				await userEvent.keyboard('{ArrowDown}'.repeat(to - from));
				await expect.element(option(`Item ${to}`)).toHaveFocus();
				await settleFrames();
			}

			await navigate(1, 9);
			expect(positioner.getBoundingClientRect().height).toBeGreaterThan(initialHeight);
			expect(isInsidePopup('Item 0')).toBe(true);
			expect(isInsidePopup('Item 9')).toBe(true);

			await navigate(9, 25);
			expect(positioner.getBoundingClientRect().height).toBeGreaterThan(initialHeight + 100);
			expect(isInsidePopup('Item 25')).toBe(true);
		});
	});

	describe('opening', () => {
		it('does not carry an ArrowUp opening over to a later pointer opening', async () => {
			const props = live({
				value: 'b',
				positioner: { alignItemWithTrigger: false },
				items: abc
			});

			focusTrigger();
			await userEvent.keyboard('{ArrowUp}');
			await expect.element(option('b')).toHaveFocus();
			await userEvent.keyboard('{Escape}');
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');

			await update(props, { value: null });
			await userEvent.click(trigger());
			await expect.element(listbox()).toHaveFocus();
			await wait(50);

			await expect.element(option('c')).not.toHaveAttribute('data-highlighted');
		});
	});

	describe('closing', () => {
		it('keeps the highlight on the item while the popup animates out', async () => {
			const style = document.createElement('style');
			style.textContent = `
				@keyframes select-test-exit { to { opacity: 0; } }
				[data-testid="popup"][data-ending-style] { animation: select-test-exit 10s; }
			`;
			document.head.append(style);
			try {
				render(SelectHarness, { positioner: { alignItemWithTrigger: false }, items: named('a', 'b') });

				focusTrigger();
				await userEvent.keyboard('{ArrowDown}');
				await expect.element(option('a')).toHaveFocus();
				await userEvent.keyboard('{ArrowDown}');
				await expect.element(option('b')).toHaveFocus();

				await userEvent.keyboard('{Escape}');

				await expect.element(page.getByTestId('popup')).toHaveAttribute('data-ending-style');
				expect(option('b').element().hasAttribute('data-highlighted')).toBe(true);

				option('a')
					.element()
					.dispatchEvent(
						new MouseEvent('mousemove', { bubbles: true, movementX: 1, movementY: 1 })
					);
				expect(option('b').element().hasAttribute('data-highlighted')).toBe(true);
			} finally {
				style.remove();
			}
		});
	});
});
