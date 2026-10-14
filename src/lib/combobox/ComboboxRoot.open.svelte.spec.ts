// Assertions follow Base UI v1.9.0 packages/react/src/combobox/root/ComboboxRoot.test.tsx,
// "prop: open", "prop: onOpenChange" and "prop: limit" (commit
// ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// A parent that holds `open` without `onOpenChange` is a bound `open` that refuses writes.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { renderBound } from '../../tests/bound-render.svelte.js';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

const input = () => page.getByTestId('input');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const listbox = () => page.getByRole('listbox');
const absent = (name: string) =>
	[...document.querySelectorAll('[role="option"]')].every(
		(element) => element.textContent?.trim() !== name
	);
const flush = async () => {
	await tick();
	await Promise.resolve();
	await tick();
};
/** A press on `<body>` itself, as upstream's `user.click(document.body)` dispatches it. */
const pressBody = async () => {
	const init = { bubbles: true, cancelable: true, button: 0 };
	document.body.dispatchEvent(new PointerEvent('pointerdown', { ...init, pointerType: 'mouse' }));
	document.body.dispatchEvent(new MouseEvent('mousedown', init));
	document.body.dispatchEvent(new PointerEvent('pointerup', { ...init, pointerType: 'mouse' }));
	document.body.dispatchEvent(new MouseEvent('mouseup', init));
	document.body.dispatchEvent(new MouseEvent('click', init));
	await flush();
};

let animationStyle: HTMLStyleElement | undefined;
afterEach(() => {
	animationStyle?.remove();
	animationStyle = undefined;
});

describe('Combobox.Root', () => {
	describe('prop: open', () => {
		it('controls the open state', async () => {
			const props = renderBound(ComboboxHarness, {
				open: false,
				refuseOpen: true,
				trigger: true,
				staticItems: [{ value: 'a' }]
			});

			await userEvent.click(input());
			await flush();
			expect(document.querySelector('[role="listbox"]')).toBeNull();

			props.open = true;
			await expect.element(listbox()).toBeInTheDocument();

			await pressBody();
			await flush();
			await expect.element(listbox()).toBeInTheDocument();
		});

		it('keeps filtering responsive after selection when inline and open is controlled', async () => {
			render(ComboboxHarness, {
				inline: true,
				open: true,
				refuseOpen: true,
				items: ['Apple', 'Apricot', 'Banana', 'Grape', 'Orange']
			});

			await userEvent.type(input(), 'ap');
			await expect.element(option('Banana')).not.toBeInTheDocument();

			await userEvent.click(option('Apple'));

			await userEvent.clear(input());
			await userEvent.type(input(), 'ba');
			await expect.element(option('Banana')).toBeInTheDocument();
		});

		it('releases filtering when a controlled popup ignores a close request', async () => {
			const onOpenChange = vi.fn();
			render(ComboboxHarness, {
				open: true,
				refuseOpen: true,
				inputInside: true,
				items: ['Apple', 'Apricot', 'Banana', 'Grape', 'Orange'],
				root: { onOpenChange }
			});

			await userEvent.type(input(), 'ap');
			await expect.element(option('Banana')).not.toBeInTheDocument();

			await userEvent.click(option('Apple'));

			expect(onOpenChange.mock.lastCall?.[0]).toBe(false);
			await expect.element(page.getByRole('dialog')).toBeInTheDocument();

			await userEvent.clear(input());
			await userEvent.type(input(), 'ba');

			await expect.element(input()).toHaveValue('ba');
			await expect.element(option('Banana')).toBeInTheDocument();
			expect(absent('Apple')).toBe(true);
		});

		it('keeps filtered content stable when a controlled close is deferred', async () => {
			animationStyle = document.createElement('style');
			animationStyle.textContent = `
				@keyframes combobox-close-test { to { opacity: 0; } }
				[data-testid="popup"][data-ending-style] { animation: combobox-close-test 10s linear; }
			`;
			document.head.append(animationStyle);

			const props: { open?: boolean; refuseOpen?: boolean } = renderBound(ComboboxHarness, {
				open: true,
				refuseOpen: true,
				items: ['Apple', 'Apricot', 'Banana'],
				root: {
					onOpenChange: (next: boolean) => {
						if (next) return;
						setTimeout(() => {
							props.refuseOpen = false;
							props.open = false;
						}, 50);
					}
				}
			});

			await userEvent.type(input(), 'ap');
			await userEvent.click(option('Apple'));

			await expect.element(page.getByTestId('popup')).toHaveAttribute('data-ending-style');

			await expect.element(input()).toHaveValue('Apple');
			await expect.element(option('Apple')).toBeInTheDocument();
			await expect.element(option('Apricot')).toBeInTheDocument();
		});
	});

	describe('prop: onOpenChange', () => {
		it('fires when opening and closing', async () => {
			const onOpenChange = vi.fn();
			render(ComboboxHarness, {
				trigger: true,
				staticItems: [{ value: 'a' }],
				root: { onOpenChange }
			});

			await userEvent.click(input());
			await expect.poll(() => onOpenChange.mock.calls.length).toBeGreaterThan(0);
			expect(onOpenChange.mock.lastCall?.[0]).toBe(true);

			await pressBody();
			await expect.poll(() => onOpenChange.mock.lastCall?.[0]).toBe(false);
		});
	});

	describe('prop: limit', () => {
		const optionCount = () => document.querySelectorAll('[role="option"]').length;

		it('keeps the selected index unset when the selected item is outside the rendered limit', async () => {
			render(ComboboxHarness, {
				items: ['apple', 'banana', 'cherry', 'date'],
				probe: true,
				root: { limit: 2, defaultValue: 'date' }
			});

			await expect.element(page.getByTestId('selected-index')).toHaveTextContent('null');

			await userEvent.click(input());

			await expect.poll(optionCount).toBe(2);
			await expect.element(page.getByTestId('selected-index')).toHaveTextContent('null');
			await expect.element(option('apple')).not.toHaveAttribute('data-highlighted');
			await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
		});

		it('limits the number of items displayed when no groups are used', async () => {
			render(ComboboxHarness, {
				open: true,
				items: ['apple', 'banana', 'cherry', 'date', 'elderberry'],
				root: { limit: 3 }
			});

			await expect.element(option('apple')).toBeInTheDocument();
			await expect.element(option('banana')).toBeInTheDocument();
			await expect.element(option('cherry')).toBeInTheDocument();
			expect(absent('date')).toBe(true);
			expect(absent('elderberry')).toBe(true);
		});

		it('limits the number of items displayed when groups are used', async () => {
			render(ComboboxHarness, {
				open: true,
				items: [
					{ value: 'citrus', items: ['orange', 'lemon', 'lime'] },
					{ value: 'berries', items: ['strawberry', 'blueberry', 'raspberry'] }
				],
				root: { limit: 4 }
			});

			await expect.element(option('orange')).toBeInTheDocument();
			await expect.element(option('lemon')).toBeInTheDocument();
			await expect.element(option('lime')).toBeInTheDocument();
			await expect.element(option('strawberry')).toBeInTheDocument();
			expect(absent('blueberry')).toBe(true);
			expect(absent('raspberry')).toBe(true);

			await expect.element(page.getByText('citrus')).toBeInTheDocument();
			await expect.element(page.getByText('berries')).toBeInTheDocument();
		});

		it('respects limit when filtering items', async () => {
			render(ComboboxHarness, {
				open: true,
				items: ['apple', 'apricot', 'avocado', 'banana', 'blueberry'],
				root: { limit: 2 }
			});

			await userEvent.type(input(), 'a');
			await flush();

			await expect.element(option('apple')).toBeInTheDocument();
			await expect.element(option('apricot')).toBeInTheDocument();
			expect(absent('avocado')).toBe(true);
			expect(absent('banana')).toBe(true);
			expect(absent('blueberry')).toBe(true);
		});

		it('stops filtering grouped items once the limit is reached', async () => {
			const filter = vi.fn((itemValue: string, query: string) => itemValue.startsWith(query));
			render(ComboboxHarness, {
				open: true,
				items: [
					{ value: 'groupA', items: ['banana', 'apple', 'apricot', 'avocado'] },
					{ value: 'groupB', items: ['artichoke', 'banana', 'blueberry'] }
				],
				root: { filter, limit: 2 }
			});

			filter.mockClear();
			await userEvent.type(input(), 'a');
			await flush();

			const filteredItemValues = filter.mock.calls.map(([itemValue]) => itemValue);
			expect(filteredItemValues).not.toContain('avocado');
			expect(filteredItemValues).not.toContain('artichoke');
			await expect.element(option('apple')).toBeInTheDocument();
			await expect.element(option('apricot')).toBeInTheDocument();
			expect(absent('avocado')).toBe(true);
			expect(absent('artichoke')).toBe(true);
		});

		it('shows all items when limit is -1 (default)', async () => {
			render(ComboboxHarness, {
				open: true,
				items: ['apple', 'banana', 'cherry', 'date', 'elderberry'],
				root: { limit: -1 }
			});

			await expect.poll(optionCount).toBe(5);
		});

		it('handles limit of 0 gracefully', async () => {
			render(ComboboxHarness, {
				open: true,
				items: ['apple', 'banana', 'cherry'],
				root: { limit: 0 }
			});

			await expect.element(listbox()).toBeInTheDocument();
			expect(optionCount()).toBe(0);
		});

		it('preserves order of items when applying limit across groups', async () => {
			render(ComboboxHarness, {
				open: true,
				items: [
					{ value: 'groupA', items: ['A1', 'A2'] },
					{ value: 'groupB', items: ['B1', 'B2', 'B3'] }
				],
				root: { limit: 3 }
			});

			await expect.element(option('A1')).toBeInTheDocument();
			expect(
				[...document.querySelectorAll('[role="option"]')].map((e) => e.textContent?.trim())
			).toEqual(['A1', 'A2', 'B1']);
		});

		it('does not limit items when not using items prop', async () => {
			render(ComboboxHarness, {
				open: true,
				staticItems: ['apple', 'banana', 'cherry', 'date', 'elderberry'].map((value) => ({
					value
				})),
				root: { limit: 2 }
			});

			await expect.poll(optionCount).toBe(5);
		});

		it('updates displayed items when limit changes', async () => {
			const props = renderBound(ComboboxHarness, {
				open: true,
				items: ['apple', 'banana', 'cherry', 'date'],
				root: { limit: 2 }
			});

			await expect.element(option('apple')).toBeInTheDocument();
			await expect.element(option('banana')).toBeInTheDocument();
			expect(absent('cherry')).toBe(true);
			expect(absent('date')).toBe(true);

			props.root = { limit: 3 };
			await flush();

			await expect.element(option('cherry')).toBeInTheDocument();
			expect(absent('date')).toBe(true);
		});
	});
});
