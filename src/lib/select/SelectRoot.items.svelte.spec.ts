// Assertions follow Base UI v1.9.0 packages/react/src/select/root/SelectRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Covers the `dynamic items` and `typeahead` describe blocks.
import { tick, type ComponentProps } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { renderBound } from '../../tests/bound-render.svelte.js';
import SelectHarness, { type HarnessItem } from '../../tests/SelectHarness.svelte';

const trigger = () => page.getByTestId('trigger');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const listbox = () => page.getByRole('listbox');
const valueText = () => (page.getByTestId('value').element() as HTMLElement).textContent;
const named = (...values: string[]): HarnessItem[] => values.map((value) => ({ value }));

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

function focusTrigger() {
	(trigger().element() as HTMLElement).focus();
}

function expectNothingSelected() {
	for (const element of document.querySelectorAll('[role="option"]')) {
		expect(element.hasAttribute('data-selected')).toBe(false);
	}
}

describe('Select.Root', () => {
	describe('dynamic items', () => {
		it('skips null items when navigating', async () => {
			const all = named(
				'Add to Library',
				'Add to Playlist',
				'Play Next',
				'Play Last',
				'Favorite',
				'Share'
			);
			const filtered = named('Add to Library', 'Favorite', 'Share');
			const props = live({
				items: all,
				root: {
					onOpenChange(next: boolean) {
						if (next) setTimeout(() => Object.assign(props, { items: filtered }), 0);
					},
					onOpenChangeComplete(next: boolean) {
						if (!next) Object.assign(props, { items: all });
					}
				}
			});

			focusTrigger();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(listbox()).toBeVisible();
			await expect.element(option('Play Next')).not.toBeInTheDocument();

			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');

			await expect.element(option('Share')).toHaveFocus();
		});

		it('unselects the selected item if removed', async () => {
			const props = live({ value: 'a', items: named('a', 'b', 'c') });

			focusTrigger();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('a')).toHaveAttribute('data-selected');
			await expect.element(page.getByTestId('value')).toHaveTextContent('a');

			await update(props, { items: named('b', 'c') });
			await expect.element(option('b')).not.toHaveAttribute('data-selected');

			await update(props, { items: named('a', 'b', 'c') });
			await expect.element(option('a')).not.toHaveAttribute('data-selected');
		});

		it('resets the value when the selected item is replaced and the item count is unchanged', async () => {
			const onValueChange = vi.fn();
			const props = live({
				value: 'c',
				root: { onValueChange },
				items: named('a', 'b', 'c')
			});
			await expect.element(trigger()).toHaveTextContent('c');

			await openSelect();
			await update(props, { items: named('a', 'b', 'd') });

			await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe(null);
			await expect.element(trigger()).not.toHaveTextContent('c');
		});

		it('resets the value when every item is replaced and the item count is unchanged', async () => {
			const onValueChange = vi.fn();
			const props = live({
				value: 'c',
				root: { onValueChange },
				items: named('a', 'b', 'c')
			});

			await openSelect();
			await update(props, { items: named('x', 'y', 'z') });

			await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe(null);
		});

		it('keeps the value when the items are only reordered', async () => {
			const onValueChange = vi.fn();
			const props = live({
				value: 'c',
				root: { onValueChange },
				items: named('a', 'b', 'c')
			});

			await openSelect();
			await update(props, { items: named('c', 'a', 'b') });

			await expect.element(option('c')).toHaveAttribute('data-selected', '');
			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(trigger()).toHaveTextContent('c');
		});

		it('resets to default when the selected item is removed from the list', async () => {
			const props = live({
				root: { defaultValue: 'b' },
				items: named('a', 'b', 'c'),
				around: true
			});

			await openSelect();
			await userEvent.click(option('c'));
			await expect.element(trigger()).toHaveTextContent('c');

			await update(props, { items: named('a', 'b') });
			await expect.element(trigger()).toHaveTextContent('b');

			await openSelect();
			await expect.element(option('b')).toHaveAttribute('data-selected', '');
		});

		it('resets via onValueChange and does not break in controlled mode when the selected item is removed', async () => {
			const props = live({ value: 'c', items: named('a', 'b', 'c') });
			await expect.element(trigger()).toHaveTextContent('c');

			await update(props, { items: named('a', 'b') });
			await openSelect();

			await expect.element(option('a')).toBeVisible();
			expectNothingSelected();
		});

		describe('aligned positioning after the options are replaced', () => {
			const group = (prefix: string) =>
				Array.from({ length: 40 }, (_, index) => ({ value: `${prefix}-${index}` }));
			const setup = {
				trigger: { style: 'width:160px;height:36px' },
				valueProps: { placeholder: 'Pick one' },
				popup: { style: 'max-height:none;min-height:100px' }
			};

			afterEach(() => {
				document.body.style.padding = '';
			});

			async function expectTopAligned() {
				await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');
				const list = listbox().element() as HTMLElement;
				await expect.poll(() => list.scrollTop).toBe(0);
				const positioner = page.getByTestId('positioner').element();
				const first = option('b-0').element();
				await expect
					.poll(() => first.getBoundingClientRect().top >= positioner.getBoundingClientRect().top)
					.toBe(true);
			}

			async function pickDeepOption() {
				await openSelect();
				await userEvent.click(option('a-35'));
				await expect.element(listbox()).not.toBeInTheDocument();
			}

			it('resets after a controlled value reset and option replacement', async () => {
				document.body.style.padding = '120px 0 0 32px';
				const props = live({ ...setup, value: null, items: group('a') });

				await pickDeepOption();
				await update(props, { items: group('b'), value: null });
				await openSelect();

				await expectTopAligned();
			});

			it('resets when value reset, option replacement, and controlled open happen together', async () => {
				document.body.style.padding = '120px 0 0 32px';
				const props = live({ ...setup, value: null, items: group('a') });

				await pickDeepOption();
				await update(props, { items: group('b'), value: null, open: true });

				await expectTopAligned();
			});

			it('resets when a stale controlled value, option replacement, and controlled open happen together', async () => {
				document.body.style.padding = '120px 0 0 32px';
				const props = live({ ...setup, value: null, items: group('a') });

				await pickDeepOption();
				await update(props, { items: group('b'), open: true });

				await expectTopAligned();
			});
		});

		it('falls back to null when both selected and initial default are removed (uncontrolled)', async () => {
			const props = live({
				root: { defaultValue: 'b' },
				items: named('a', 'b', 'c')
			});

			await openSelect();
			await userEvent.click(option('c'));
			await expect.element(listbox()).not.toBeInTheDocument();

			await update(props, { items: named('a', 'c') });
			await update(props, { items: named('a') });

			await expect.element(page.getByTestId('value')).toHaveTextContent('');

			await openSelect();
			expectNothingSelected();
		});

		it('falls back to null when both selected and initial default are removed (controlled)', async () => {
			const props = live({ value: 'c', items: named('a', 'b', 'c') });

			await update(props, { items: named('a', 'c') });
			await update(props, { items: named('a') });
			await openSelect();

			await expect.element(option('a')).toBeVisible();
			expectNothingSelected();
		});
	});

	describe('typeahead', () => {
		it('matches an item by its label when the rendered text differs', async () => {
			render(SelectHarness, {
				positioner: { alignItemWithTrigger: false },
				items: [
					{ value: 'us', label: 'United States', text: 'Option 1' },
					{ value: 'fr', label: 'France', text: 'Option 2' },
					{ value: 'ca', label: 'Canada', text: 'Option 3' }
				]
			});

			focusTrigger();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(option('Option 1')).toHaveFocus();

			await userEvent.keyboard('fr');
			await expect.element(option('Option 2')).toHaveFocus();
		});

		it('starts a new search after focus leaves the select', async () => {
			render(SelectHarness, { items: named('apple', 'banana', 'avocado'), around: true });

			focusTrigger();
			await userEvent.keyboard('b');
			expect(valueText()).toBe('banana');

			(page.getByTestId('outside').element() as HTMLElement).focus();
			focusTrigger();
			await userEvent.keyboard('a');

			expect(valueText()).toBe('avocado');
		});

		it('does not trigger selection when Space is pressed during text navigation', async () => {
			const onclick = vi.fn();
			const onValueChange = vi.fn();
			render(SelectHarness, {
				open: true,
				root: { onValueChange },
				items: [
					{ value: 'one', text: 'Item One', props: { onclick } },
					{ value: 'two', text: 'Item Two', props: { onclick } }
				]
			});

			await expect.element(option('Item One')).toBeVisible();
			(option('Item One').element() as HTMLElement).focus();

			await userEvent.keyboard('Item T');

			expect(onclick).not.toHaveBeenCalled();
			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(option('Item Two')).toHaveFocus();
		});

		it('skips disabled items and commits the next match via typeahead on a closed trigger', async () => {
			render(SelectHarness, {
				value: null,
				items: [{ value: 'apricot', disabled: true }, { value: 'avocado' }]
			});

			focusTrigger();
			await userEvent.keyboard('a');
			expect(valueText()).toBe('avocado');
		});

		it('commits typeahead on a closed trigger when items are provided', async () => {
			render(SelectHarness, {
				value: null,
				root: { items: { apple: 'Apple', cherry: 'Cherry' } },
				items: [
					{ value: 'apple', text: 'Apple' },
					{ value: 'cherry', text: 'Cherry' }
				]
			});

			focusTrigger();
			await userEvent.keyboard('c');
			expect(valueText()).toBe('Cherry');
		});

		it('commits nothing when the only typeahead match is disabled (closed trigger)', async () => {
			render(SelectHarness, {
				value: null,
				items: [{ value: 'cherry' }, { value: 'banana', disabled: true }]
			});

			focusTrigger();
			await userEvent.keyboard('b');
			expect(valueText()).toBe('');
		});

		it('does not let a disabled double-letter item block rapid cycling among enabled matches', async () => {
			render(SelectHarness, {
				value: null,
				items: [{ value: 'aaron', disabled: true }, { value: 'apple' }, { value: 'avocado' }]
			});

			focusTrigger();
			await userEvent.keyboard('a');
			expect(valueText()).toBe('apple');
			await userEvent.keyboard('a');
			expect(valueText()).toBe('avocado');
		});

		it('skips disabled items when highlighting via typeahead on an open popup', async () => {
			render(SelectHarness, {
				open: true,
				items: [{ value: 'apricot', disabled: true }, { value: 'avocado' }]
			});

			await expect.element(option('apricot')).toBeVisible();
			(option('avocado').element() as HTMLElement).focus();

			await userEvent.keyboard('a');

			await expect.element(option('avocado')).toHaveAttribute('data-highlighted');
			await expect.element(option('apricot')).not.toHaveAttribute('data-highlighted');
		});

		it('starts from the first match after value reset (closed)', async () => {
			const props = live({
				value: null,
				items: [
					{ value: 'a1', text: 'A1' },
					{ value: 'a2', text: 'A2' }
				]
			});

			focusTrigger();
			await userEvent.keyboard('a');
			expect(valueText()).toBe('a1');

			(trigger().element() as HTMLElement).blur();
			await update(props, { value: null });
			focusTrigger();
			await userEvent.keyboard('a');
			expect(valueText()).toBe('a1');
		});

		it('does not jump matches after a closed-state value reset', async () => {
			const props = live({ value: 'dog', items: named('car', 'cat', 'dog') });
			expect(valueText()).toBe('dog');

			await update(props, { value: 'car' });
			await expect.element(page.getByTestId('value')).toHaveTextContent('car');

			focusTrigger();
			await userEvent.keyboard('c');
			expect(valueText()).toBe('cat');

			await userEvent.keyboard('a');
			expect(valueText()).toBe('cat');
		});
	});
});
