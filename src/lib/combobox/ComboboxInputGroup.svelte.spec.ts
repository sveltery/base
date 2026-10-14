// Assertions follow Base UI v1.9.0
// packages/react/src/combobox/input-group/ComboboxInputGroup.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `describeConformance` (React only). The padding press lands on the group's own
// padding instead of a nested `<span>`, and `fireEvent` calls dispatch the same DOM events.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';
import ComboboxPartsHarness from '../../tests/ComboboxPartsHarness.svelte';

const input = () => page.getByTestId('input');
const group = () => page.getByTestId('input-group');
const listbox = () => page.getByRole('listbox');
const mouseDown = (target: Element) =>
	target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));

function renderGroup(root: Record<string, unknown> = {}, extra: Record<string, unknown> = {}) {
	return render(ComboboxHarness, {
		inputGroup: true,
		inputGroupProps: { style: 'padding: 10px' },
		chips: true,
		chipRemove: false,
		value: ['a'],
		staticItems: [{ value: 'a' }, { value: 'b' }],
		root: { multiple: true, ...root },
		...extra
	});
}

describe('Combobox.InputGroup', () => {
	it('does not dismiss the popup when pressing inside the group', async () => {
		render(ComboboxHarness, {
			inputGroup: true,
			inputGroupProps: { style: 'padding: 10px' },
			trigger: true,
			staticItems: [{ value: 'a' }, { value: 'b' }]
		});

		await userEvent.click(page.getByTestId('trigger'));
		await expect.element(listbox()).toBeInTheDocument();

		await userEvent.click(group(), { position: { x: 2, y: 2 } });

		await expect.element(listbox()).toBeInTheDocument();
	});

	it('focuses the input and opens when pressing the padding around chips', async () => {
		renderGroup();

		mouseDown(group().element());

		await expect.element(input()).toHaveFocus();
		await expect.element(listbox()).toBeInTheDocument();
	});

	it('does not handle a chip press a second time when the chips are inside the group', async () => {
		const onOpenChange = vi.fn();
		renderGroup({ onOpenChange });

		mouseDown(page.getByTestId('chip-a').element());

		expect(onOpenChange).toHaveBeenCalledTimes(1);
	});

	it('focuses the input without opening when openOnInputClick is false', async () => {
		renderGroup({ openOnInputClick: false });

		mouseDown(group().element());

		await expect.element(input()).toHaveFocus();
		expect(listbox().elements()).toHaveLength(0);
	});

	it('does not focus or open when disabled by Field.Root', async () => {
		render(ComboboxPartsHarness, { scenario: 'field-disabled-chips' });

		mouseDown(group().element());

		await expect.element(input()).not.toHaveFocus();
		expect(listbox().elements()).toHaveLength(0);
	});

	it('focuses the input and opens while read-only', async () => {
		renderGroup({ readonly: true });

		mouseDown(group().element());

		await expect.element(input()).toHaveFocus();
		await expect.element(listbox()).toBeInTheDocument();
	});

	it('has role="group"', async () => {
		render(ComboboxHarness, { inputGroup: true });

		await expect.element(page.getByRole('group')).toBeInTheDocument();
	});
});
