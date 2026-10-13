// Assertions follow Base UI v1.9.0 packages/react/src/combobox/{popup,group,group-label,
// collection,item-indicator}/*.test.tsx and the context tests in {root,item,group,positioner}
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported, React only: `describeConformance` for every part (including the Arrow, Backdrop,
// Icon and Portal tests, which hold nothing else), the Label `captureOwnerStack` and production
// warning cases (the Label warning itself is asserted in ComboboxRoot.form.svelte.spec.ts), and
// ComboboxPortalContext (the positioner does not require a portal here). The root store holds
// what upstream splits into the floating and derived-items contexts, so one root case covers them.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Combobox } from '#lib';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';
import ComboboxPartsHarness from '../../tests/ComboboxPartsHarness.svelte';

const popup = () => page.getByTestId('popup');

describe('Combobox.Popup', () => {
	it('exposes the open state as a data attribute', async () => {
		render(ComboboxHarness, { open: true });

		await expect.element(popup()).toHaveAttribute('data-open');
	});

	it('has role="presentation" when the input is outside the popup', async () => {
		render(ComboboxHarness, { open: true, items: ['Apple'] });

		await expect.element(popup()).toHaveAttribute('role', 'presentation');
	});

	it('has role="dialog" when the input is inside the popup', async () => {
		render(ComboboxHarness, { open: true, inputInside: true, items: ['Apple'] });

		await expect.element(popup()).toHaveAttribute('role', 'dialog');
	});

	it('focuses the popup instead of its input when opened by touch', async () => {
		render(ComboboxPartsHarness, { scenario: 'touch-popup' });
		const trigger = page.getByTestId('trigger').element();

		trigger.dispatchEvent(
			new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'touch' })
		);
		// A tap's compatibility mousedown has a click count, unlike a keyboard-synthesized one.
		trigger.dispatchEvent(
			new MouseEvent('mousedown', { bubbles: true, cancelable: true, detail: 1 })
		);

		await expect.element(popup()).toHaveFocus();
		await expect.element(page.getByTestId('input')).not.toHaveFocus();
	});

	it('honors initialFocus={false}', async () => {
		render(ComboboxPartsHarness, {
			scenario: 'touch-popup',
			popupProps: { initialFocus: false }
		});
		const trigger = page.getByTestId('trigger').element() as HTMLElement;

		trigger.focus();
		trigger.click();

		await expect.element(page.getByTestId('input')).toBeInTheDocument();
		await expect.element(page.getByTestId('trigger')).toHaveFocus();
	});

	it.each(['Escape', 'Tab'])(
		'keeps focus off the options when %s closes the popup before its open focus lands',
		async (key) => {
			render(ComboboxHarness, {
				inputInside: true,
				staticItems: [{ value: 'a' }, { value: 'b' }],
				root: { defaultValue: 'b' }
			});
			const trigger = page.getByTestId('trigger').element() as HTMLElement;
			trigger.focus();

			trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
			await userEvent.keyboard(`{${key}}`);
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(document.activeElement?.getAttribute('role')).not.toBe('option');
		}
	);

	it('returns focus to an explicitly provided element when the popup closes', async () => {
		render(ComboboxHarness, {
			open: true,
			around: true,
			staticItems: [{ value: 'a' }],
			popup: { finalFocus: () => page.getByTestId('outside').element() as HTMLElement }
		});
		await expect.element(popup()).toBeInTheDocument();

		await userEvent.keyboard('{Escape}');

		await expect.element(page.getByTestId('outside')).toHaveFocus();
	});
});

describe('Combobox.Group', () => {
	it('renders a group labelled by its label', async () => {
		render(ComboboxHarness, {
			open: true,
			staticGroups: [{ label: 'Fruits', items: [{ value: 'apple' }, { value: 'banana' }] }]
		});

		await expect.element(page.getByRole('group')).toHaveAttribute('aria-labelledby');
		await expect.element(page.getByText('Fruits')).toBeVisible();
	});

	it('associates the label with the group', async () => {
		render(ComboboxHarness, {
			open: true,
			staticGroups: [{ label: 'Vegetables', items: [{ value: 'carrot' }, { value: 'lettuce' }] }]
		});

		const label = page.getByText('Vegetables').element();
		await expect.element(page.getByRole('group')).toHaveAttribute('aria-labelledby', label.id);
	});
});

describe('Combobox.GroupLabel', () => {
	it('is hidden from the accessibility tree by default', async () => {
		render(ComboboxPartsHarness, { scenario: 'group-labels' });

		await expect.element(page.getByText('Old')).toHaveAttribute('aria-hidden', 'true');
	});

	it('allows overriding aria-hidden', async () => {
		render(ComboboxPartsHarness, {
			scenario: 'group-labels',
			labelProps: { 'aria-hidden': undefined }
		});

		await expect.element(page.getByText('Old')).not.toHaveAttribute('aria-hidden');
	});

	it('uses a provided id in aria-labelledby', async () => {
		render(ComboboxPartsHarness, { scenario: 'group-labels' });

		await expect.element(page.getByRole('group')).toHaveAttribute('aria-labelledby', 'old-label');
	});

	it('does not let an older label cleanup clear a newer label', async () => {
		const view = render(ComboboxPartsHarness, { scenario: 'group-labels', labels: 'old' });
		const group = page.getByRole('group');
		await expect.element(group).toHaveAttribute('aria-labelledby', 'old-label');

		await view.rerender({ labels: 'both' });
		await expect.element(group).toHaveAttribute('aria-labelledby', 'new-label');

		await view.rerender({ labels: 'new' });
		await expect.element(group).toHaveAttribute('aria-labelledby', 'new-label');
	});
});

describe('Combobox.Collection', () => {
	it('renders the filtered items', async () => {
		render(ComboboxHarness, { open: true, items: ['alpha', 'beta', 'alpine'] });

		await expect.element(page.getByTestId('item-alpha')).toBeInTheDocument();
		await expect.element(page.getByTestId('item-beta')).toBeInTheDocument();
		await expect.element(page.getByTestId('item-alpine')).toBeInTheDocument();
	});

	it('renders nothing when a nested group has no items', async () => {
		render(ComboboxPartsHarness, { scenario: 'group-without-items' });

		await expect.element(page.getByTestId('group')).toBeInTheDocument();
		expect(page.getByTestId('group').element().textContent?.trim()).toBe('');
		expect(page.getByTestId('group').element().children).toHaveLength(0);
	});
});

describe('Combobox.ItemIndicator', () => {
	const indicator = () => page.getByTestId('indicator');

	it('updates a kept-mounted indicator when its item becomes unselected', async () => {
		render(ComboboxHarness, {
			open: true,
			indicator: true,
			indicatorProps: { keepMounted: true },
			portal: { keepMounted: true },
			staticItems: [{ value: 'apple' }, { value: 'banana' }],
			root: { defaultValue: 'apple' }
		});
		const apple = page.getByTestId('indicator-apple');
		await expect.element(apple).toHaveAttribute('data-selected');

		await userEvent.click(page.getByRole('option', { name: 'banana' }));

		await expect.element(apple).not.toHaveAttribute('data-selected');
	});

	it('mounts only while selected without keepMounted', async () => {
		const view = render(ComboboxPartsHarness, { scenario: 'indicator', value: 'b' });
		await expect.element(page.getByRole('listbox')).toBeInTheDocument();
		expect(indicator().elements()).toHaveLength(0);

		await view.rerender({ value: 'a' });
		await expect.element(indicator()).toHaveAttribute('data-selected');
		await expect.element(indicator()).toHaveAttribute('aria-hidden', 'true');
		await expect.element(indicator()).not.toHaveAttribute('selected');

		await view.rerender({ value: 'b' });
		await expect.element(indicator()).not.toBeInTheDocument();

		await view.rerender({ value: 'a' });
		await expect.element(indicator()).toHaveAttribute('data-selected');
	});

	it('keeps the same element across selection changes with keepMounted', async () => {
		const view = render(ComboboxPartsHarness, {
			scenario: 'indicator',
			value: 'b',
			keepMounted: true
		});
		await expect.element(indicator()).toBeInTheDocument();
		const element = indicator().element();
		expect(element).not.toHaveAttribute('data-selected');

		await view.rerender({ value: 'a' });
		await expect.element(indicator()).toHaveAttribute('data-selected');
		expect(indicator().element()).toBe(element);

		await view.rerender({ value: 'b' });
		await expect.element(indicator()).not.toHaveAttribute('data-selected');
		expect(indicator().element()).toBe(element);
		await expect.element(indicator()).not.toHaveAttribute('data-ending-style');

		await view.rerender({ value: 'a' });
		await expect.element(indicator()).toHaveAttribute('data-selected');
		expect(indicator().element()).toBe(element);
	});
});

describe('Combobox contexts', () => {
	it('throws outside Combobox.Root', () => {
		expect(() => render(Combobox.Item, { value: 'a' })).toThrow(
			'Base UI: ComboboxRootContext is missing. Combobox parts must be placed within <Combobox.Root>.'
		);
	});

	it.each([
		{
			orphan: 'indicator' as const,
			message:
				'Base UI: ComboboxItemContext is missing. ComboboxItem parts must be placed within <Combobox.Item>.'
		},
		{
			orphan: 'group-label' as const,
			message:
				'Base UI: ComboboxGroupContext is missing. ComboboxGroup parts must be placed within <Combobox.Group>.'
		},
		{
			orphan: 'popup' as const,
			message:
				'Base UI: <Combobox.Popup> and <Combobox.Arrow> must be used within the <Combobox.Positioner> component'
		},
		{
			orphan: 'arrow' as const,
			message:
				'Base UI: <Combobox.Popup> and <Combobox.Arrow> must be used within the <Combobox.Positioner> component'
		}
	])('throws when $orphan is outside its provider', ({ orphan, message }) => {
		expect(() => render(ComboboxPartsHarness, { scenario: 'orphan', orphan })).toThrow(message);
	});
});
