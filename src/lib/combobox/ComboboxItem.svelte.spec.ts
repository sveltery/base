// Assertions follow Base UI v1.9.0 packages/react/src/combobox/item/ComboboxItem.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `preventBaseUIHandler()` is `event.preventDefault()` here. Not ported: `describeConformance`
// and the React.memo re-render case (React only), the link cases (upstream runs them only in
// JSDOM, where a link click does not navigate), the `virtualized` cases and the explicit `index`
// cases (neither prop is ported). The hover case of "prop: index" runs with plain items.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

const input = () => page.getByTestId('input');
const listbox = () => page.getByRole('listbox');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const oneTwo = [{ value: 'one' }, { value: 'two' }];

describe('Combobox.Item', () => {
	it('selects the item and closes in single mode', async () => {
		render(ComboboxHarness, { open: true, staticItems: oneTwo });

		(option('two').element() as HTMLElement).click();

		await expect.element(input()).toHaveValue('two');
		await expect.element(listbox()).not.toBeInTheDocument();
	});

	describe('prop: onclick', () => {
		it('calls onclick when clicked with a pointer', async () => {
			const onclick = vi.fn();
			render(ComboboxHarness, {
				staticItems: [
					{ value: 'apple', props: { onclick } },
					{ value: 'banana', props: { onclick } }
				],
				root: { openOnInputClick: true }
			});

			await userEvent.click(input());
			await userEvent.click(option('banana'));

			expect(onclick).toHaveBeenCalledTimes(1);
		});

		it('calls onclick when selected with Enter', async () => {
			const onclick = vi.fn();
			render(ComboboxHarness, {
				staticItems: oneTwo.map((item) => ({ ...item, props: { onclick } })),
				root: { openOnInputClick: true }
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			expect(onclick).toHaveBeenCalledTimes(1);
		});

		it('does not select the item when onclick prevents the Base UI handler', async () => {
			const onclick = vi.fn((event: MouseEvent) => event.preventDefault());
			render(ComboboxHarness, {
				open: true,
				staticItems: [{ value: 'one', props: { onclick } }, { value: 'two' }]
			});

			await userEvent.click(option('one'));

			expect(onclick).toHaveBeenCalledTimes(1);
			await expect.element(input()).toHaveValue('');
			await expect.element(listbox()).toBeInTheDocument();
		});
	});

	it('does not select a disabled item', async () => {
		render(ComboboxHarness, {
			open: true,
			staticItems: [{ value: 'one' }, { value: 'two', disabled: true }]
		});

		(option('two').element() as HTMLElement).click();

		await expect.element(input()).toHaveValue('');
	});

	it('inherits the disabled state from the root', async () => {
		const onclick = vi.fn();
		render(ComboboxHarness, {
			open: true,
			staticItems: [{ value: 'one', props: { onclick } }],
			root: { disabled: true }
		});
		await expect.element(option('one')).toHaveAttribute('data-disabled');

		(option('one').element() as HTMLElement).click();

		expect(onclick).not.toHaveBeenCalled();
		await expect.element(input()).toHaveValue('');
	});

	it('selects the highlighted item on Enter', async () => {
		render(ComboboxHarness, { staticItems: oneTwo });

		await userEvent.click(input());
		await expect.element(listbox()).toBeInTheDocument();
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{Enter}');

		await expect.element(input()).toHaveValue('one');
		await expect.element(listbox()).not.toBeInTheDocument();
	});

	it('keeps the input focused after selecting an item with touch', async () => {
		render(ComboboxHarness, { open: true, staticItems: oneTwo });
		await userEvent.click(input());
		await expect.element(input()).toHaveFocus();
		const two = option('two').element();

		const touch = {
			bubbles: true,
			cancelable: true,
			button: 0,
			pointerType: 'touch',
			isPrimary: true
		};
		two.dispatchEvent(new PointerEvent('pointerdown', touch));
		two.dispatchEvent(new PointerEvent('pointerup', touch));
		two.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		two.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		two.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		await expect.element(input()).toHaveValue('two');
		await expect.element(input()).toHaveFocus();
	});

	it('prevents the default mousedown so pointer selection does not take focus from the input', async () => {
		render(ComboboxHarness, { open: true, staticItems: oneTwo });
		const mouseDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 });

		option('two').element().dispatchEvent(mouseDown);

		expect(mouseDown.defaultPrevented).toBe(true);
	});

	it('toggles the selection and stays open in multiple mode', async () => {
		render(ComboboxHarness, {
			staticItems: [{ value: 'a' }, { value: 'b' }],
			root: { multiple: true }
		});

		await userEvent.click(input());
		await expect.element(listbox()).toBeInTheDocument();

		await userEvent.click(option('a'));
		await expect.element(option('a')).toHaveAttribute('aria-selected', 'true');
		await expect.element(listbox()).toBeInTheDocument();

		await userEvent.click(option('a'));
		await expect.element(option('a')).not.toHaveAttribute('aria-selected', 'true');
	});

	it('reflects the selected value with aria-selected when reopening', async () => {
		render(ComboboxHarness, { staticItems: oneTwo, root: { defaultValue: 'two' } });

		await userEvent.click(input());

		await expect.element(option('two')).toHaveAttribute('aria-selected', 'true');
	});

	it('updates the highlight on hover', async () => {
		render(ComboboxHarness, {
			open: true,
			items: ['apple', 'banana', 'cherry'],
			root: { autoHighlight: true }
		});
		await expect.element(listbox()).toBeInTheDocument();

		await userEvent.hover(option('banana'));
		await expect.element(option('banana')).toHaveAttribute('data-highlighted');

		await userEvent.hover(option('cherry'));
		await expect.element(option('cherry')).toHaveAttribute('data-highlighted');
		await expect.element(option('banana')).not.toHaveAttribute('data-highlighted');
	});
});
