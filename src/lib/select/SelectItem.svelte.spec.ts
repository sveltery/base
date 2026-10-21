// Assertions follow Base UI v1.9.0 packages/react/src/select/item/SelectItem.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported, React only: `describeConformance`. Upstream runs the keyboard, quick selection
// and style hook cases in jsdom only; they run here in Chromium with real timers in place of
// the fake clock. `preventBaseUIHandler()` is `event.preventDefault()` here.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { renderBound } from '../../tests/bound-render.svelte.js';
import { wait } from '../../tests/select-events.js';
import { selectedValues } from '../../tests/select-native.js';
import SelectHarness, { type HarnessItem } from '../../tests/SelectHarness.svelte';

const trigger = () => page.getByTestId('trigger');
const value = () => page.getByTestId('value');
const valueText = () => value().element().textContent;
const option = (name: string) => page.getByRole('option', { name, exact: true });
const listbox = () => page.getByRole('listbox');
const named = (...values: string[]): HarnessItem[] => values.map((entry) => ({ value: entry }));

/** Dispatches the event `fireEvent` would: a pointer event for `pointer*`, a mouse event otherwise. */
function fire(target: Element, type: string, init: PointerEventInit = {}) {
	const bubbles = type !== 'pointerenter' && type !== 'mouseenter';
	const Event = type.startsWith('pointer') ? PointerEvent : MouseEvent;
	target.dispatchEvent(new Event(type, { bubbles, cancelable: true, ...init }));
}

function el(locator: ReturnType<typeof page.getByRole>) {
	return locator.element();
}

async function openWithMouseDown() {
	fire(el(trigger()), 'mousedown');
	await expect.element(listbox()).toBeInTheDocument();
}

function dragOver(item: Element, movementY: number, times = 1) {
	fire(item, 'pointerenter', { pointerType: 'mouse' });
	for (let index = 0; index < times; index += 1) {
		fire(item, 'pointermove', { pointerType: 'mouse', buttons: 1, movementY });
	}
}

describe('Select.Item', () => {
	it('treats a null value as an empty selection in multiple mode', async () => {
		const onchange = vi.fn();
		render(SelectHarness, {
			value: null,
			root: { multiple: true, onchange },
			items: named('one', 'two')
		});

		await userEvent.click(trigger());
		await expect.element(option('one')).toHaveAttribute('aria-selected', 'false');

		await userEvent.click(option('one'));

		await expect.poll(() => selectedValues()).toEqual(['one']);
	});

	it('keeps the selection while grouped items are reordered and inserted', async () => {
		const groups = (first: string[]) => [
			{ label: 'Group one', items: named(...first) },
			{ label: 'Group two', items: named('z') }
		];
		const props = renderBound(SelectHarness, {
			open: true,
			root: { defaultValue: 'b' },
			groups: groups(['b', 'c'])
		});

		props.groups = groups(['a', 'b', 'c']);
		await tick();
		await expect.element(option('a')).toBeInTheDocument();

		props.groups = groups(['c', 'b', 'a']);
		await tick();
		await expect.element(option('b')).toHaveAttribute('data-selected');

		props.groups = groups(['a', 'b', 'c']);
		await tick();
		await expect.element(option('b')).toHaveAttribute('data-selected');
	});

	it('should select the item and close popup when clicked', async () => {
		render(SelectHarness, { items: named('one') });
		expect(valueText()).toBe('');

		fire(el(trigger()), 'click');
		await expect.element(option('one')).toBeInTheDocument();
		fire(el(option('one')), 'click');

		await expect.element(value()).toHaveTextContent('one');
		await expect.element(page.getByTestId('positioner')).not.toBeVisible();
	});

	it('navigating with keyboard should focus item', async () => {
		render(SelectHarness, { items: named('one', 'two', 'three') });

		fire(el(trigger()), 'click');
		await expect.element(listbox()).toBeInTheDocument();
		await expect.element(option('one')).toHaveFocus();

		await userEvent.keyboard('{ArrowDown}');
		await expect.element(option('two')).toHaveFocus();

		await userEvent.keyboard('{ArrowDown}');
		await expect.element(option('three')).toHaveFocus();
	});

	it('should select item when Enter key is pressed', async () => {
		render(SelectHarness, { items: named('one', 'two') });

		fire(el(trigger()), 'click');
		await expect.element(option('one')).toHaveFocus();
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{Enter}');

		await expect.element(value()).toHaveTextContent('two');
	});

	it('should focus disabled items', async () => {
		render(SelectHarness, { items: [{ value: 'one' }, { value: 'two', disabled: true }] });

		(el(trigger()) as HTMLElement).focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(option('one')).toHaveFocus();

		await userEvent.keyboard('{ArrowDown}');
		await expect.element(option('two')).toHaveFocus();
	});

	it('should not select disabled item', async () => {
		const onchange = vi.fn();
		render(SelectHarness, {
			root: { onchange },
			items: [{ value: 'one' }, { value: 'two', disabled: true }]
		});

		await userEvent.click(trigger());
		await userEvent.click(option('two'), { force: true });

		await tick();
		expect(onchange).not.toHaveBeenCalled();
		expect(valueText()).toBe('');
		await expect.element(listbox()).toBeVisible();
	});

	it('should not select disabled item when Enter is pressed', async () => {
		const onchange = vi.fn();
		render(SelectHarness, {
			root: { onchange },
			items: [{ value: 'one' }, { value: 'two', disabled: true }]
		});

		(el(trigger()) as HTMLElement).focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(option('one')).toHaveFocus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(option('two')).toHaveFocus();

		await userEvent.keyboard('{Enter}');

		await tick();
		expect(onchange).not.toHaveBeenCalled();
		expect(valueText()).toBe('');
	});

	it('inherits the disabled state from the root', async () => {
		const onclick = vi.fn();
		render(SelectHarness, {
			open: true,
			root: { disabled: true },
			items: [{ value: 'one', props: { onclick } }]
		});

		await expect.element(option('one')).toHaveAttribute('data-disabled');

		await userEvent.click(option('one'), { force: true });

		expect(onclick).not.toHaveBeenCalled();
		expect(valueText()).toBe('');
	});

	it('should call onClick exactly once for a regular click', async () => {
		const onclick = vi.fn();
		render(SelectHarness, { items: [{ value: 'one', props: { onclick } }, { value: 'two' }] });

		fire(el(trigger()), 'click');
		await expect.element(option('one')).toBeInTheDocument();
		fire(el(option('one')), 'click');

		await expect.element(value()).toHaveTextContent('one');
		expect(onclick).toHaveBeenCalledOnce();
	});

	it('should select an unhighlighted item with the mouse', async () => {
		render(SelectHarness, {
			open: true,
			root: { highlightItemOnHover: false },
			items: named('one', 'two')
		});
		const item = el(option('two'));
		expect(item.hasAttribute('data-highlighted')).toBe(false);

		fire(item, 'pointerdown', { pointerType: 'mouse' });
		fire(item, 'mousedown');
		fire(item, 'mouseup');
		fire(item, 'click', { detail: 1 });

		await expect.element(value()).toHaveTextContent('two');
	});

	it('should highlight a hovered item and commit it with a mouse click', async () => {
		const onchange = vi.fn();
		render(SelectHarness, { root: { onchange }, items: named('one', 'two', 'three') });

		const button = el(trigger());
		fire(button, 'pointerdown', { pointerType: 'mouse' });
		fire(button, 'mousedown');
		fire(button, 'pointerup', { pointerType: 'mouse' });
		fire(button, 'mouseup');
		fire(button, 'click');
		await expect.element(listbox()).toBeInTheDocument();

		const item = el(option('two'));
		fire(item, 'pointerenter', { pointerType: 'mouse' });
		fire(item, 'mousemove');
		await expect.element(option('two')).toHaveAttribute('data-highlighted');

		fire(item, 'pointerdown', { pointerType: 'mouse' });
		fire(item, 'mousedown');
		fire(item, 'pointerup', { pointerType: 'mouse' });
		fire(item, 'mouseup');
		fire(item, 'click');

		await expect.poll(() => onchange.mock.calls.length).toBe(1);
		expect(selectedValues()).toEqual(['two']);
		await expect.element(value()).toHaveTextContent('two');
	});

	it('should ignore an unhighlighted item with a generic virtual click', async () => {
		render(SelectHarness, {
			open: true,
			root: { highlightItemOnHover: false },
			items: named('one', 'two')
		});
		expect(el(option('two')).hasAttribute('data-highlighted')).toBe(false);

		fire(el(option('two')), 'click', { detail: 0 });
		await tick();

		expect(valueText()).toBe('');
	});

	it('should focus the selected item upon opening the popup', async () => {
		render(SelectHarness, { items: named('one', 'two', 'three') });

		fire(el(trigger()), 'click');
		await userEvent.click(option('three'));
		await expect.element(listbox()).not.toBeInTheDocument();
		fire(el(trigger()), 'click');

		await expect.element(option('three')).toHaveFocus();
	});

	it('should allow pointer click after a typeahead sequence that ends with Space', async () => {
		render(SelectHarness, {
			open: true,
			items: [
				{ value: 'one', text: 'Item One' },
				{ value: 'two', text: 'Item Two' }
			]
		});

		await expect.element(option('Item One')).toBeInTheDocument();
		(el(option('Item One')) as HTMLElement).focus();

		await userEvent.keyboard('item t ');
		await expect.element(option('Item Two')).toHaveFocus();

		await userEvent.click(option('Item Two'));

		await expect.element(value()).toHaveTextContent('two');
	});

	describe('quick selection', () => {
		it('calls onClick once for a click made after the opening delay', async () => {
			const onclick = vi.fn();
			render(SelectHarness, {
				positioner: { alignItemWithTrigger: false },
				items: [{ value: 'a' }, { value: 'b', props: { onclick } }]
			});

			await userEvent.click(trigger());
			await expect.element(option('b')).toBeVisible();
			await wait(500);
			await userEvent.click(option('b'));

			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');
			expect(onclick).toHaveBeenCalledTimes(1);
		});

		it('should not select an item on quick mouseup when showing a placeholder (no null item)', async () => {
			const fonts = [
				{ label: 'Sans-serif', value: 'sans' },
				{ label: 'Serif', value: 'serif' },
				{ label: 'Monospace', value: 'mono' },
				{ label: 'Cursive', value: 'cursive' }
			];
			render(SelectHarness, {
				root: { items: fonts },
				valueProps: { placeholder: 'Select font' },
				items: fonts.map((font) => ({ value: font.value, text: font.label }))
			});
			expect(valueText()).toBe('Select font');

			await openWithMouseDown();
			const item = el(option('Sans-serif'));
			fire(item, 'mousemove');
			await wait(250);
			fire(item, 'mouseup');

			await wait(20);
			expect(valueText()).toBe('Select font');
		});

		it('should not select an unselected item within the selected delay when aligned with the trigger', async () => {
			render(SelectHarness, {
				root: { defaultValue: 'one' },
				positioner: { alignItemWithTrigger: true },
				items: named('one', 'two')
			});
			expect(valueText()).toBe('one');

			await openWithMouseDown();
			await wait(250);
			fire(el(option('two')), 'mouseup');

			expect(valueText()).toBe('one');
		});

		it('should call onClick when selecting via drag-to-select (mousedown on trigger, mouseup on item)', async () => {
			const onclick = vi.fn();
			render(SelectHarness, {
				valueProps: { placeholder: 'Select font' },
				items: [{ value: 'one', props: { onclick } }, { value: 'two' }]
			});

			await openWithMouseDown();
			const item = el(option('one'));
			dragOver(item, 2, 4);
			await wait(100);
			fire(item, 'mouseup');

			await expect.element(value()).toHaveTextContent('one');
			expect(onclick).toHaveBeenCalledOnce();
		});

		it('does not fire click handlers on a disabled item during drag-to-select', async () => {
			const onclick = vi.fn();
			render(SelectHarness, {
				valueProps: { placeholder: 'Select font' },
				items: [{ value: 'one', disabled: true, props: { onclick } }, { value: 'two' }]
			});

			await openWithMouseDown();
			const item = el(option('one'));
			dragOver(item, 2, 4);
			await wait(100);
			fire(item, 'mouseup');
			await tick();

			expect(onclick).not.toHaveBeenCalled();
		});

		it('should not select a disabled item via drag-to-select', async () => {
			const onchange = vi.fn();
			render(SelectHarness, {
				root: { onchange },
				valueProps: { placeholder: 'Select font' },
				items: [{ value: 'one', disabled: true }, { value: 'two' }]
			});

			await openWithMouseDown();
			const item = el(option('one'));
			dragOver(item, 2, 4);
			await wait(100);
			fire(item, 'mouseup');
			await tick();

			await tick();
			expect(onchange).not.toHaveBeenCalled();
			expect(valueText()).toBe('Select font');
		});

		it('should not select on mouseup that follows a touch interaction', async () => {
			const onchange = vi.fn();
			render(SelectHarness, {
				root: { onchange },
				valueProps: { placeholder: 'Select font' },
				items: named('one', 'two')
			});

			await openWithMouseDown();
			const item = el(option('one'));
			fire(item, 'pointerenter', { pointerType: 'touch' });
			await wait(500);
			fire(item, 'mouseup');
			await tick();

			await tick();
			expect(onchange).not.toHaveBeenCalled();
			expect(valueText()).toBe('Select font');
		});

		it('should accumulate drag-to-select movement across items', async () => {
			render(SelectHarness, {
				root: { defaultValue: 'one' },
				positioner: { alignItemWithTrigger: true },
				items: named('one', 'two', 'three')
			});

			await openWithMouseDown();
			dragOver(el(option('two')), 4);
			const three = el(option('three'));
			dragOver(three, 4);
			await wait(100);
			fire(three, 'mouseup');

			await expect.element(value()).toHaveTextContent('three');
		});

		it('should select via drag-to-select when hover highlighting is disabled', async () => {
			render(SelectHarness, {
				root: { highlightItemOnHover: false },
				valueProps: { placeholder: 'Select font' },
				items: named('one', 'two')
			});

			await openWithMouseDown();
			const item = el(option('two'));
			dragOver(item, 8);
			expect(item.hasAttribute('data-highlighted')).toBe(false);
			await wait(500);
			fire(item, 'mouseup');

			await expect.element(value()).toHaveTextContent('two');
		});

		it('should not treat small pointer movement as drag-to-select', async () => {
			render(SelectHarness, {
				root: { defaultValue: 'one' },
				positioner: { alignItemWithTrigger: true },
				items: named('one', 'two')
			});
			expect(valueText()).toBe('one');

			await openWithMouseDown();
			const item = el(option('two'));
			dragOver(item, 2);
			await wait(100);
			fire(item, 'mouseup');

			expect(valueText()).toBe('one');
		});

		it('should allow small pointer movement to select after the opening delay', async () => {
			render(SelectHarness, {
				root: { defaultValue: 'one' },
				positioner: { alignItemWithTrigger: true },
				items: named('one', 'two')
			});

			await openWithMouseDown();
			const item = el(option('two'));
			dragOver(item, 2);
			await wait(500);
			fire(item, 'mouseup');

			await expect.element(value()).toHaveTextContent('two');
		});

		it('should ignore an opening click that did not start on the item', async () => {
			render(SelectHarness, {
				root: { highlightItemOnHover: false },
				valueProps: { placeholder: 'Select font' },
				positioner: { alignItemWithTrigger: true },
				items: named('one', 'two')
			});

			fire(el(trigger()), 'pointerdown', { pointerType: 'mouse' });
			await openWithMouseDown();
			const item = el(option('one'));
			fire(item, 'mouseup');
			fire(item, 'click', { detail: 1 });

			expect(valueText()).toBe('Select font');
		});

		it('should not select item when onClick calls preventDefault during drag-to-select', async () => {
			const onclick = vi.fn((event: MouseEvent) => event.preventDefault());
			render(SelectHarness, {
				valueProps: { placeholder: 'Select font' },
				items: [{ value: 'one', props: { onclick } }, { value: 'two' }]
			});

			await openWithMouseDown();
			const item = el(option('one'));
			dragOver(item, 8);
			await wait(500);
			fire(item, 'mouseup');

			expect(onclick).toHaveBeenCalledOnce();
			expect(valueText()).toBe('Select font');
			await expect.element(listbox()).toBeInTheDocument();
		});
	});

	describe('style hooks', () => {
		it('should apply data-highlighted attribute when item is highlighted', async () => {
			render(SelectHarness, { root: { defaultValue: 'a' }, items: named('a', 'b') });

			fire(el(trigger()), 'click');

			await expect.element(option('a')).toHaveAttribute('data-highlighted', '');
			await expect.element(option('b')).not.toHaveAttribute('data-highlighted');
			// The popup focuses the highlighted item a frame after opening. A key pressed before
			// that frame misses the popup, and the late focus then re-highlights 'a'.
			await expect.element(option('a')).toHaveFocus();

			await userEvent.keyboard('{ArrowDown}');

			await expect.element(option('a')).not.toHaveAttribute('data-highlighted');
			await expect.element(option('b')).toHaveAttribute('data-highlighted', '');
		});

		it('should apply data-selected attribute when item is selected', async () => {
			render(SelectHarness, { items: named('a', 'b') });

			fire(el(trigger()), 'click');
			await expect.element(option('a')).toBeInTheDocument();
			fire(el(option('a')), 'click');
			await expect.element(listbox()).not.toBeInTheDocument();

			fire(el(trigger()), 'click');
			await expect.element(option('a')).toHaveAttribute('data-selected', '');
			await expect.element(option('b')).not.toHaveAttribute('data-selected');
		});
	});
});
