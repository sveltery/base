// Assertions follow Base UI v1.9.0 packages/react/src/combobox/root/ComboboxRoot.test.tsx,
// "does not render aria-orientation on the listbox role" through "prop: multiple" (commit
// ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { REASONS } from '@sveltery/utils';
import { renderBound } from '../../tests/bound-render.svelte.js';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';
import type { ComboboxChangeEventDetails } from './types.js';

const input = () => page.getByTestId('input');
const trigger = () => page.getByTestId('trigger');
const popup = () => page.getByTestId('popup');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const listbox = () => page.getByRole('listbox');
const fruits = ['apple', 'apricot', 'banana'];
const staticFruits = fruits.map((value) => ({ value }));
const flush = async () => {
	await tick();
	await Promise.resolve();
	await tick();
};
const hover = (element: Element) =>
	element.dispatchEvent(new PointerEvent('mousemove', { bubbles: true, pointerType: 'mouse' }));

let animationStyle: HTMLStyleElement | undefined;
function animateClose() {
	animationStyle = document.createElement('style');
	animationStyle.textContent = `
		@keyframes combobox-close-test { to { opacity: 0; } }
		[data-testid="popup"][data-ending-style] { animation: combobox-close-test 10s linear; }
	`;
	document.head.append(animationStyle);
}
afterEach(() => {
	animationStyle?.remove();
	animationStyle = undefined;
});

function renderGrid(rows: string[][], root: Record<string, unknown> = {}, extra = {}) {
	const onItemHighlighted = vi.fn();
	render(ComboboxHarness, {
		open: true,
		rows,
		root: { grid: true, onItemHighlighted, ...root },
		...extra
	});
	const last = () => onItemHighlighted.mock.lastCall?.[0];
	return { onItemHighlighted, last };
}

async function press(key: string, last: () => unknown, expected: string) {
	await userEvent.keyboard(key);
	await expect.poll(last).toBe(expected);
}

describe('Combobox.Root', () => {
	it('does not render aria-orientation on the listbox role', async () => {
		render(ComboboxHarness, { inline: true, open: true, staticItems: [{ value: '1' }] });
		await expect.element(listbox()).not.toHaveAttribute('aria-orientation');
	});

	describe('prop: grid', () => {
		const twoByThree = [
			['1', '2', '3'],
			['4', '5', '6']
		];

		it('sets grid roles when grid is enabled and rows are used', async () => {
			renderGrid(twoByThree);
			await expect.element(page.getByRole('grid')).toBeInTheDocument();
			expect(page.getByRole('gridcell').elements()).toHaveLength(6);
		});

		it('arrow keys navigate across rows and columns in grid mode', async () => {
			const { last } = renderGrid(twoByThree);
			await userEvent.click(input());
			await expect.element(page.getByRole('grid')).toBeInTheDocument();

			await press('{ArrowDown}', last, '1');
			await press('{ArrowRight}', last, '2');
			await press('{ArrowRight}', last, '3');
			await press('{ArrowDown}', last, '6');
			await press('{ArrowLeft}', last, '5');
			await press('{ArrowUp}', last, '2');
		});

		it('does not re-report the highlight on keys the grid does not handle', async () => {
			const { onItemHighlighted, last } = renderGrid([
				['1', '2'],
				['3', '4']
			]);
			await userEvent.click(input());
			await expect.element(page.getByRole('grid')).toBeInTheDocument();

			await press('{ArrowDown}', last, '1');
			onItemHighlighted.mockClear();

			// A modifier alone is not navigation; the grid navigator returns the unchanged index.
			await userEvent.keyboard('{Shift}');
			await flush();
			expect(onItemHighlighted).not.toHaveBeenCalled();

			await press('{ArrowRight}', last, '2');
			expect(onItemHighlighted).toHaveBeenCalledTimes(1);
		});

		it('moves the input caret on ArrowLeft when no item is highlighted in grid mode', async () => {
			const { onItemHighlighted } = renderGrid([['1', '2']]);
			const element = input().element() as HTMLInputElement;
			await userEvent.click(input());
			await expect.element(page.getByRole('grid')).toBeInTheDocument();

			await userEvent.type(input(), 'abc');
			expect(element.value).toBe('abc');
			expect(element.selectionStart).toBe(3);

			await userEvent.keyboard('{ArrowLeft}');

			expect(element.selectionStart).toBe(2);
			expect(element.selectionEnd).toBe(2);
			expect(onItemHighlighted).not.toHaveBeenCalled();
		});

		it('moves the input caret on ArrowRight when no item is highlighted in grid mode', async () => {
			const { onItemHighlighted } = renderGrid([['1', '2']]);
			const element = input().element() as HTMLInputElement;
			await userEvent.click(input());
			await expect.element(page.getByRole('grid')).toBeInTheDocument();

			await userEvent.type(input(), 'abc');
			element.setSelectionRange(1, 1);
			expect(element.selectionStart).toBe(1);

			await userEvent.keyboard('{ArrowRight}');

			expect(element.selectionStart).toBe(2);
			expect(element.selectionEnd).toBe(2);
			expect(onItemHighlighted).not.toHaveBeenCalled();
		});

		it('keeps grid navigation when autoHighlight surfaces an item before typing arrow keys', async () => {
			const { last } = renderGrid([['1', '2']], { autoHighlight: true });
			await userEvent.click(input());
			await expect.element(page.getByRole('grid')).toBeInTheDocument();

			await userEvent.type(input(), 'a');
			await expect.poll(last).toBe('1');

			await press('{ArrowRight}', last, '2');
		});

		it('mirrors horizontal grid navigation in RTL mode', async () => {
			const { last } = renderGrid(twoByThree, {}, { direction: 'rtl' });
			await userEvent.click(input());
			await expect.element(page.getByRole('grid')).toBeInTheDocument();

			await press('{ArrowDown}', last, '1');
			await press('{ArrowLeft}', last, '2');
			await press('{ArrowLeft}', last, '3');
			await press('{ArrowRight}', last, '2');
		});

		it('supports uneven rows navigation', async () => {
			const { last } = renderGrid([
				['1', '2', '3'],
				['4', '5'],
				['6', '7', '8', '9', '10']
			]);
			await userEvent.click(input());
			await expect.element(page.getByRole('grid')).toBeInTheDocument();

			await press('{ArrowDown}', last, '1');
			await press('{ArrowRight}', last, '2');
			await press('{ArrowRight}', last, '3');
			// Down from the last column to a shorter row clamps to its last item.
			await press('{ArrowDown}', last, '5');
			await press('{ArrowUp}', last, '2');
			await press('{ArrowDown}', last, '5');
			await press('{ArrowDown}', last, '7');
			await press('{ArrowLeft}', last, '6');
			await press('{ArrowUp}', last, '4');
		});

		it('supports uneven rows navigation within groups', async () => {
			const onItemHighlighted = vi.fn();
			render(ComboboxHarness, {
				open: true,
				rowGroups: [
					{ rows: [['1', '2', '3']] },
					{ rows: [['4', '5']] },
					{ rows: [['6', '7', '8', '9', '10']] }
				],
				root: { grid: true, onItemHighlighted }
			});
			const last = () => onItemHighlighted.mock.lastCall?.[0];
			await userEvent.click(input());
			await expect.element(page.getByRole('grid')).toBeInTheDocument();

			await press('{ArrowDown}', last, '1');
			await press('{ArrowRight}', last, '2');
			await press('{ArrowRight}', last, '3');
			await press('{ArrowDown}', last, '5');
			await press('{ArrowUp}', last, '2');
			await press('{ArrowDown}', last, '5');
			await press('{ArrowDown}', last, '7');
		});

		it('does not render aria-orientation on the grid role', async () => {
			renderGrid([['1', '2']]);
			await expect.element(page.getByRole('grid')).not.toHaveAttribute('aria-orientation');
		});

		it('renders groups with the rowgroup role', async () => {
			render(ComboboxHarness, {
				open: true,
				rowGroups: [{ label: 'Fruits', rows: [['1', '2']] }],
				root: { grid: true }
			});

			await expect.element(page.getByRole('rowgroup')).toHaveAccessibleName('Fruits');
			expect(document.querySelector('[role="group"]')).toBeNull();
		});
	});

	describe('prop: multiple', () => {
		it('"single" selects and closes, then reopens with selection focused', async () => {
			render(ComboboxHarness, {
				open: true,
				staticItems: [{ value: 'a' }, { value: 'b' }, { value: 'c' }]
			});

			await userEvent.click(option('b'));
			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(input()).toHaveValue('b');

			await userEvent.click(input());
			await expect.element(option('b')).toHaveAttribute('aria-selected', 'true');
		});

		it('"single" keeps the popup open when selection is canceled', async () => {
			const onValueChange = vi.fn((_value: unknown, details: { cancel(): void }) => {
				details.cancel();
			});
			render(ComboboxHarness, {
				open: true,
				staticItems: [{ value: 'a' }, { value: 'b' }],
				root: { onValueChange }
			});

			await userEvent.click(option('b'));

			expect(onValueChange).toHaveBeenCalled();
			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(input()).not.toHaveValue('b');
		});

		it('"multiple" clears uncontrolled input after select when filtering', async () => {
			render(ComboboxHarness, {
				staticItems: [{ value: 'apple' }, { value: 'banana' }],
				root: { multiple: true }
			});

			await userEvent.type(input(), 'app');
			await userEvent.click(option('apple'));
			await expect.element(input()).toHaveValue('');
		});

		it('keeps the active item when the post-selection input clear is canceled', async () => {
			const onInputValueChange = vi.fn(
				(_value: string, details: { reason: string; cancel(): void }) => {
					if (details.reason === REASONS.inputClear) details.cancel();
				}
			);
			render(ComboboxHarness, {
				open: true,
				inputInside: true,
				items: fruits,
				root: { multiple: true, onInputValueChange }
			});

			await userEvent.type(input(), 'app');
			const apple = option('apple');
			await expect.element(apple).toBeInTheDocument();
			hover(apple.element());
			await expect.element(apple).toHaveAttribute('data-highlighted');

			const ariaMutations: MutationRecord[] = [];
			const observer = new MutationObserver((records) => ariaMutations.push(...records));
			observer.observe(input().element(), {
				attributes: true,
				attributeFilter: ['aria-activedescendant']
			});

			apple.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));
			await flush();
			observer.disconnect();

			expect(onInputValueChange.mock.lastCall?.[1].reason).toBe(REASONS.inputClear);
			await expect.element(input()).toHaveValue('app');
			await expect.element(apple).toHaveAttribute('data-highlighted');
			await expect.element(input()).toHaveAttribute('aria-activedescendant', apple.element().id);
			expect(ariaMutations).toHaveLength(0);
		});

		it('keeps the filter text when the "item-press" close is canceled (input outside popup)', async () => {
			render(ComboboxHarness, {
				staticItems: staticFruits,
				root: {
					multiple: true,
					onOpenChange: (open: boolean, details: { reason: string; cancel(): void }) => {
						if (!open && details.reason === REASONS.itemPress) details.cancel();
					}
				}
			});

			await userEvent.type(input(), 'app');
			await userEvent.click(option('apple'));
			await flush();

			await expect.element(input()).toHaveValue('app');
			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(option('apple')).toHaveAttribute('aria-selected', 'true');

			await userEvent.keyboard('{Escape}');

			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(input()).toHaveValue('');
		});

		it('marks the close-path clear as an item press only when an item press closed the popup (input outside popup)', async () => {
			const onInputValueChange = vi.fn();
			render(ComboboxHarness, {
				staticItems: staticFruits,
				root: { multiple: true, onInputValueChange }
			});

			await userEvent.type(input(), 'app');
			onInputValueChange.mockClear();

			await userEvent.click(option('apple'));
			await flush();

			await expect.element(input()).toHaveValue('');
			expect(onInputValueChange.mock.calls.find((call) => call[0] === '')?.[1].isItemPress).toBe(
				true
			);

			await userEvent.type(input(), 'app');
			onInputValueChange.mockClear();

			await userEvent.keyboard('{Escape}');
			await flush();

			await expect.element(input()).toHaveValue('');
			expect(onInputValueChange.mock.calls.find((call) => call[0] === '')?.[1].isItemPress).toBe(
				false
			);
		});

		const cancelItemPressClear = (_value: string, details: ComboboxChangeEventDetails) => {
			if (details.isItemPress) details.cancel();
		};

		it('keeps the filter text when the selection clear is canceled (input inside popup)', async () => {
			render(ComboboxHarness, {
				open: true,
				inputInside: true,
				staticItems: staticFruits,
				root: { multiple: true, onInputValueChange: cancelItemPressClear }
			});

			await userEvent.type(input(), 'app');
			await userEvent.click(option('apple'));
			await flush();

			await expect.element(input()).toHaveValue('app');
			await expect.element(listbox()).toBeInTheDocument();
		});

		it('keeps the filter text in an inline list when the selection clear is canceled', async () => {
			render(ComboboxHarness, {
				inline: true,
				open: true,
				staticItems: staticFruits,
				root: { multiple: true, onInputValueChange: cancelItemPressClear }
			});

			await userEvent.type(input(), 'app');
			await userEvent.click(option('apple'));
			await flush();

			await expect.element(input()).toHaveValue('app');
			await expect.element(option('apple')).toHaveAttribute('aria-selected', 'true');
		});

		it('still clears the kept filter text once the popup closes', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				staticItems: staticFruits,
				root: { multiple: true, onInputValueChange: cancelItemPressClear }
			});

			await userEvent.click(trigger());
			await expect.element(input()).toHaveFocus();

			await userEvent.type(input(), 'app');
			await userEvent.click(option('apple'));
			await flush();
			await expect.element(input()).toHaveValue('app');

			// The cleanup clear after the close carries no `isItemPress`, so it is not canceled.
			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();

			await userEvent.click(trigger());
			await expect.element(input()).toHaveValue('');
		});

		it('clears the input with the "input-clear" reason and the item click event on pointer selection', async () => {
			const onInputValueChange = vi.fn();
			render(ComboboxHarness, {
				open: true,
				inputInside: true,
				staticItems: staticFruits,
				root: { multiple: true, onInputValueChange }
			});

			await userEvent.type(input(), 'app');
			onInputValueChange.mockClear();

			await userEvent.click(option('apple'));
			await flush();

			expect(onInputValueChange).toHaveBeenCalledWith(
				'',
				expect.objectContaining({ reason: REASONS.inputClear })
			);
			expect(onInputValueChange.mock.lastCall?.[1].event?.type).toBe('click');
			expect(onInputValueChange.mock.lastCall?.[1].isItemPress).toBe(true);
		});

		it('clears the input with the "input-clear" reason and the originating keydown event on keyboard selection', async () => {
			const onInputValueChange = vi.fn();
			render(ComboboxHarness, {
				open: true,
				inputInside: true,
				staticItems: staticFruits,
				root: { multiple: true, onInputValueChange }
			});

			await userEvent.type(input(), 'app');
			await expect.element(option('apple')).toBeInTheDocument();

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('apple')).toHaveAttribute('data-highlighted');

			onInputValueChange.mockClear();
			await userEvent.keyboard('{Enter}');
			await flush();

			expect(onInputValueChange).toHaveBeenCalledWith(
				'',
				expect.objectContaining({ reason: REASONS.inputClear })
			);
			expect(onInputValueChange.mock.lastCall?.[1].event?.type).toBe('keydown');
			expect(onInputValueChange.mock.lastCall?.[1].isItemPress).toBe(true);
		});

		it('keeps the filter text when a drag-select release commits the selection', async () => {
			const onInputValueChange = vi.fn(cancelItemPressClear);
			render(ComboboxHarness, {
				open: true,
				inputInside: true,
				staticItems: staticFruits,
				root: { multiple: true, onInputValueChange }
			});

			await userEvent.type(input(), 'app');
			const apple = option('apple');
			await expect.element(apple).toBeInTheDocument();
			hover(apple.element());
			await expect.element(apple).toHaveAttribute('data-highlighted');

			// The press started outside the item (drag-select), so the commit happens on mouseup.
			apple.element().dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
			await flush();

			await expect.element(input()).toHaveValue('app');
			await expect.element(apple).toHaveAttribute('aria-selected', 'true');
			expect(onInputValueChange.mock.lastCall?.[1].isItemPress).toBe(true);
		});

		it('clears the pending filter with the "input-clear" reason when reopening interrupts the close animation', async () => {
			animateClose();
			const onInputValueChange = vi.fn(cancelItemPressClear);
			render(ComboboxHarness, {
				inputInside: true,
				items: fruits,
				root: { multiple: true, onInputValueChange }
			});

			await userEvent.click(trigger());
			await expect.element(input()).toHaveFocus();

			await userEvent.type(input(), 'app');
			await userEvent.keyboard('{Escape}');
			await expect.element(popup()).toHaveAttribute('data-ending-style');

			const callsBeforeReopen = onInputValueChange.mock.calls.length;
			await userEvent.click(trigger());

			await expect.element(input()).toHaveValue('');

			const cleanupCall = onInputValueChange.mock.calls
				.slice(callsBeforeReopen)
				.find((call) => call[0] === '');
			expect(cleanupCall).not.toBe(undefined);
			expect(cleanupCall?.[1].reason).toBe(REASONS.inputClear);
			expect(cleanupCall?.[1].isItemPress).toBe(undefined);
			expect(cleanupCall?.[1].event.type).toBe('base-ui');
		});

		it('releases the frozen query when reopening during the close animation with the input outside the popup', async () => {
			animateClose();
			render(ComboboxHarness, { trigger: true, items: fruits, root: { multiple: true } });

			await userEvent.type(input(), 'app');
			await userEvent.keyboard('{Escape}');
			await expect.element(popup()).toHaveAttribute('data-ending-style');

			await userEvent.click(trigger());

			await expect.element(input()).toHaveValue('');
			await expect.element(option('banana')).toBeInTheDocument();
		});

		it('does not close popup when filtering with input inside popup in multiple mode', async () => {
			render(ComboboxHarness, { inputInside: true, items: fruits, root: { multiple: true } });

			await userEvent.click(trigger());
			await expect.element(input()).toBeInTheDocument();
			await userEvent.type(input(), 'app');
			await userEvent.click(option('apple'));

			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(input()).toHaveValue('');
		});

		it('keeps the popup input focused through keyboard selection and restores the last selection', async () => {
			render(ComboboxHarness, { inputInside: true, items: fruits, root: { multiple: true } });

			await userEvent.click(trigger());
			await expect.element(input()).toBeInTheDocument();
			await userEvent.type(input(), 'ban');
			await userEvent.keyboard('{ArrowDown}{Enter}');

			await expect.element(page.getByRole('dialog')).toBeInTheDocument();
			await expect.element(input()).toHaveFocus();
			await expect.element(input()).toHaveValue('');
			await expect.element(trigger()).toHaveTextContent('banana');
			await expect.element(option('banana')).toHaveAttribute('aria-selected', 'true');

			await userEvent.keyboard('{Escape}');
			await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
			await expect.element(trigger()).toHaveFocus();

			await userEvent.click(trigger());

			await expect.element(input()).toHaveValue('');
			await expect.element(option('banana')).toHaveAttribute('aria-selected', 'true');
			await expect.element(option('banana')).toHaveAttribute('data-highlighted');
		});

		it('keeps filtered popup content stable while closing with input inside popup', async () => {
			animateClose();
			render(ComboboxHarness, {
				inputInside: true,
				items: fruits,
				empty: 'No matches',
				popup: { 'aria-label': 'Fruits' },
				root: { multiple: true }
			});

			await userEvent.click(trigger());
			await expect.element(input()).toBeInTheDocument();
			await userEvent.type(input(), 'zz');

			await expect.element(page.getByTestId('empty')).toHaveTextContent('No matches');
			expect(document.querySelector('[role="option"]')).toBeNull();

			await userEvent.keyboard('{Escape}');
			await expect.element(popup()).toHaveAttribute('data-ending-style');

			await expect.element(page.getByTestId('empty')).toHaveTextContent('No matches');
			expect(document.querySelector('[role="option"]')).toBeNull();

			popup()
				.element()
				.getAnimations()
				.forEach((animation) => animation.finish());
			await expect.element(popup()).not.toBeInTheDocument();

			await userEvent.click(trigger());
			await expect.element(input()).toHaveValue('');
			await expect.element(option('apple')).toBeInTheDocument();
		});

		it('keeps filtered popup content stable when input changes during the close animation', async () => {
			animateClose();
			render(ComboboxHarness, { inputInside: true, items: fruits, root: { multiple: true } });

			await userEvent.click(trigger());
			await expect.element(input()).toBeInTheDocument();
			await userEvent.type(input(), 'ap');
			await userEvent.keyboard('{Escape}');
			await expect.element(popup()).toHaveAttribute('data-ending-style');

			const element = input().element() as HTMLInputElement;
			element.value = '';
			element.dispatchEvent(
				new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' })
			);
			await flush();

			await expect.element(option('apple')).toBeInTheDocument();
			await expect.element(option('apricot')).toBeInTheDocument();
			expect(document.querySelector('[role="option"][data-testid="item-banana"]')).toBeNull();
		});

		it('clears the deferred popup input when reopening during close animation', async () => {
			animateClose();
			render(ComboboxHarness, {
				inputInside: true,
				items: fruits,
				empty: 'No matches',
				popup: { 'aria-label': 'Fruits' },
				root: { multiple: true }
			});

			await userEvent.click(trigger());
			await expect.element(input()).toBeInTheDocument();
			await userEvent.type(input(), 'zz');
			await expect.element(page.getByTestId('empty')).toHaveTextContent('No matches');

			await userEvent.keyboard('{Escape}');
			await expect.element(popup()).toHaveAttribute('data-ending-style');

			await userEvent.click(trigger());
			await expect.element(popup()).not.toHaveAttribute('data-ending-style');

			await expect.element(input()).toHaveValue('');
			await expect.element(option('apple')).toBeInTheDocument();
			await expect.element(option('banana')).toBeInTheDocument();
		});

		it('does not emit another clear when controlled input is already empty on interrupted close', async () => {
			animateClose();
			const onInputValueChange = vi.fn();
			const props: { inputValue: string } = renderBound(ComboboxHarness, {
				inputValue: '',
				inputInside: true,
				items: ['apple', 'banana'],
				root: {
					multiple: true,
					onInputValueChange: (value: string) => onInputValueChange(value),
					onOpenChange: (open: boolean) => {
						if (!open) props.inputValue = '';
					}
				}
			}) as never;

			await userEvent.click(trigger());
			await expect.element(input()).toBeInTheDocument();
			await userEvent.type(input(), 'zz');
			await userEvent.keyboard('{Escape}');

			await expect.element(popup()).toHaveAttribute('data-ending-style');
			await expect.element(input()).toHaveValue('');

			const callsBeforeReopen = onInputValueChange.mock.calls.length;
			await userEvent.click(trigger());

			await expect.element(popup()).not.toHaveAttribute('data-ending-style');
			await expect.element(input()).toHaveValue('');
			expect(onInputValueChange).toHaveBeenCalledTimes(callsBeforeReopen);
		});

		it('"multiple" clears typed input on close when no selection made', async () => {
			const onInput = vi.fn();
			render(ComboboxHarness, {
				open: true,
				staticItems: [{ value: 'apple' }, { value: 'banana' }],
				root: { multiple: true, onInputValueChange: onInput }
			});

			await userEvent.type(input(), 'app');
			await userEvent.keyboard('{Escape}');

			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(input()).toHaveValue('');
			expect(onInput.mock.lastCall?.[0]).toBe('');
			expect(onInput.mock.lastCall?.[1].reason).toBe(REASONS.inputClear);
		});

		it('does not clear popup input after canceled multiple value changes', async () => {
			const onInputValueChange = vi.fn();
			const onValueChange = vi.fn((_value: unknown, details: { cancel(): void }) =>
				details.cancel()
			);
			render(ComboboxHarness, {
				inputInside: true,
				staticItems: staticFruits,
				root: { multiple: true, onInputValueChange, onValueChange }
			});

			await userEvent.click(trigger());
			await expect.element(option('apple')).toBeInTheDocument();
			await userEvent.type(input(), 'app');
			onInputValueChange.mockClear();

			await userEvent.click(option('apple'));

			expect(onValueChange).toHaveBeenCalled();
			await expect.element(input()).toHaveValue('app');
			expect(onInputValueChange).not.toHaveBeenCalled();
		});

		it('"single" clears typed input on close when no selection made (input outside popup)', async () => {
			const onInput = vi.fn();
			render(ComboboxHarness, {
				open: true,
				staticItems: [{ value: 'apple' }, { value: 'banana' }],
				root: { onInputValueChange: onInput }
			});

			await userEvent.type(input(), 'zz');
			await userEvent.keyboard('{Escape}');

			await expect.element(listbox()).not.toBeInTheDocument();
			await expect.element(input()).toHaveValue('');
			expect(onInput.mock.lastCall?.[0]).toBe('');
			expect(onInput.mock.lastCall?.[1].reason).toBe(REASONS.inputClear);
		});
	});
});
