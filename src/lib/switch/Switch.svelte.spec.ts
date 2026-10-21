// Assertions follow Base UI v1.8.0
// packages/react/src/switch/root/SwitchRoot.test.tsx and
// packages/react/src/switch/thumb/SwitchThumb.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Sveltery: the switch is a real `<input type="checkbox" role="switch">` over a painted box,
// so `checked`, `disabled` and `required` are the input's own, and native events replace
// `onCheckedChange` (docs/upstream-differences.md).
// Field and Form cases are in src/lib/field/choice-controls.svelte.spec.ts.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { ariaLabelPreferenceCases } from '../../tests/aria-label-preference-cases.js';
import SwitchAttachHarness from '../../tests/SwitchAttachHarness.svelte';
import SwitchBindHarness from '../../tests/SwitchBindHarness.svelte';
import SwitchClickHarness from '../../tests/SwitchClickHarness.svelte';
import SwitchFormHarness from '../../tests/SwitchFormHarness.svelte';
import SwitchLabelHarness from '../../tests/SwitchLabelHarness.svelte';
import SwitchStyleHarness from '../../tests/SwitchStyleHarness.svelte';
import {
	controllableCopyCases,
	controllableRootCases
} from '../../tests/controllable-root-cases.js';
import { Switch } from './index.js';

function input() {
	const element = page.getByRole('switch').element();
	if (!(element instanceof HTMLInputElement)) throw new Error('expected the switch input');
	return element;
}

function box() {
	const element = input().parentElement;
	if (!element) throw new Error('expected the switch box');
	return element;
}

function values() {
	return JSON.parse(page.getByTestId('values').element().textContent ?? '[]') as (string | null)[];
}

const checked = () => input().checked;

describe('Switch', () => {
	it('renders a checkbox input with the switch role inside its box', async () => {
		render(Switch.Root, { 'aria-label': 'Notifications' });
		expect(input().type).toBe('checkbox');
		expect(input().getAttribute('role')).toBe('switch');
		expect(box().tagName).toBe('SPAN');
		await expect.element(page.getByRole('switch')).toHaveAccessibleName('Notifications');
	});

	describe('interactions', () => {
		it('should change its state when clicked', async () => {
			render(Switch.Root);

			expect(checked()).toBe(false);
			input().click();
			await expect.poll(checked).toBe(true);
			await expect.poll(() => box().hasAttribute('data-checked')).toBe(true);
		});

		it('should update its state when changed from outside', async () => {
			render(SwitchBindHarness);
			const owner = page.getByRole('checkbox', { name: 'Owner checked' });

			await owner.click();
			await expect.poll(checked).toBe(true);
			await owner.click();
			await expect.poll(checked).toBe(false);
		});

		it('toggles with Space and leaves Enter to the form', async () => {
			render(Switch.Root);

			input().focus();
			await userEvent.keyboard('{Space}');
			await expect.poll(checked).toBe(true);
			await userEvent.keyboard('{Enter}');
			expect(checked()).toBe(true);
		});

		it('fires native input and change events', async () => {
			const onchange = vi.fn((event: Event) => (event.currentTarget as HTMLInputElement).checked);
			const oninput = vi.fn();
			render(Switch.Root, { onchange, oninput });

			input().click();

			expect(oninput).toHaveBeenCalledTimes(1);
			expect(onchange).toHaveBeenCalledTimes(1);
			expect(onchange.mock.results[0]?.value).toBe(true);
		});

		it('preventDefault in onclick keeps the switch off', async () => {
			render(Switch.Root, { onclick: (event: MouseEvent) => event.preventDefault() });

			input().click();

			expect(checked()).toBe(false);
			await expect.poll(() => box().hasAttribute('data-unchecked')).toBe(true);
		});
	});

	describe('props', () => {
		it('sends native attributes to the input, and class, style and host to the box', async () => {
			render(Switch.Root, {
				'data-testid': 'input',
				title: 'Tip',
				class: 'box',
				style: 'color: red',
				host: { 'data-testid': 'box' }
			});

			expect(page.getByTestId('input').element()).toBe(input());
			expect(input().title).toBe('Tip');
			expect(page.getByTestId('box').element()).toBe(box());
			expect(box().className).toBe('box');
			expect(box().style.color).toBe('red');
		});

		it('sets name and value on the input', async () => {
			render(Switch.Root, { name: 'switch-name', value: '1' });

			expect(input().name).toBe('switch-name');
			expect(input().getAttribute('value')).toBe('1');
			expect(box().hasAttribute('name')).toBe(false);
		});

		it('leaves the value attribute off by default', async () => {
			render(Switch.Root);
			expect(input().hasAttribute('value')).toBe(false);
		});
	});

	describe('prop: onclick', () => {
		it('propagates a single click event to ancestors per user click', async () => {
			render(SwitchClickHarness, { scenario: 'bubble' });

			await page.getByRole('switch').click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('1');
			await expect.poll(checked).toBe(true);
		});

		it('does not propagate to ancestors when stopPropagation() is called', async () => {
			render(SwitchClickHarness, { scenario: 'stop' });

			await page.getByRole('switch').click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('0');
			await expect.poll(checked).toBe(true);
		});
	});

	describe('prop: disabled', () => {
		it('disables the input natively', async () => {
			render(Switch.Root, { disabled: true });
			expect(input().disabled).toBe(true);
			expect(box().hasAttribute('data-disabled')).toBe(true);
		});

		it('should not change its state when clicked', async () => {
			render(Switch.Root, { disabled: true });
			input().click();
			expect(checked()).toBe(false);
		});
	});

	describe('prop: readOnly', () => {
		it('should have the aria-readonly attribute', async () => {
			render(Switch.Root, { readonly: true });
			expect(input().getAttribute('aria-readonly')).toBe('true');
		});

		it('should not have the aria attribute when readOnly is not set', async () => {
			render(Switch.Root);
			expect(input().hasAttribute('aria-readonly')).toBe(false);
		});

		it('should not change its state when clicked', async () => {
			render(Switch.Root, { readonly: true });
			input().click();
			expect(checked()).toBe(false);
		});

		it('should not change its state when its label is clicked', async () => {
			render(SwitchLabelHarness, { scenario: 'readonly' });
			(page.getByTestId('label').element() as HTMLElement).click();
			expect(checked()).toBe(false);
		});
	});

	describe('prop: required', () => {
		it('makes the input required', async () => {
			render(Switch.Root, { required: true });
			expect(input().required).toBe(true);
		});
	});

	it('should place the style hooks on the box and the thumb', async () => {
		render(SwitchStyleHarness);
		const thumb = page.getByTestId('thumb');

		for (const name of ['data-checked', 'data-disabled', 'data-readonly', 'data-required']) {
			expect(box().hasAttribute(name)).toBe(true);
			await expect.element(thumb).toHaveAttribute(name, '');
		}

		await page.getByRole('button', { name: 'Enable' }).click();
		input().click();

		await expect.poll(() => box().hasAttribute('data-unchecked')).toBe(true);
		expect(box().hasAttribute('data-checked')).toBe(false);
		await expect.element(thumb).toHaveAttribute('data-unchecked', '');
	});

	describe('with native label', () => {
		it('should toggle the switch when a wrapping label is clicked', async () => {
			render(SwitchLabelHarness, { scenario: 'wrap' });
			await expect.element(page.getByRole('switch')).toHaveAccessibleName('Toggle');
			(page.getByTestId('label').element() as HTMLElement).click();
			await expect.poll(checked).toBe(true);
		});

		it('should toggle the switch when an explicitly linked label is clicked', async () => {
			render(SwitchLabelHarness, { scenario: 'sibling' });
			await expect.element(page.getByRole('switch')).toHaveAccessibleName('Label');
			await page.getByText('Label').click();
			await expect.poll(checked).toBe(true);
		});

		it('follows a changed id to the label that names it', async () => {
			render(SwitchLabelHarness, { scenario: 'switch-id' });
			await expect.element(page.getByRole('switch')).toHaveAccessibleName('Label A');
			await page.getByRole('button', { name: 'Toggle' }).click();
			await expect.element(page.getByRole('switch')).toHaveAccessibleName('Label B');
		});
	});

	describe('form submission', () => {
		it('should include the switch value in form submission, matching a native checkbox', async () => {
			render(SwitchFormHarness, { scenario: 'plain' });

			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual([null]);

			input().click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual([null, 'on']);
		});

		it('submits to an external form when form is provided', async () => {
			render(SwitchFormHarness, { scenario: 'external' });

			input().click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual(['on']);
		});

		it('submits uncheckedValue to an external form when off', async () => {
			render(SwitchFormHarness, { scenario: 'unchecked-external' });

			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual(['off']);
		});

		it('does not submit uncheckedValue when disabled', async () => {
			render(SwitchFormHarness, { scenario: 'disabled' });

			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual([null]);
		});

		it('submits custom value and uncheckedValue across an off/on/off cycle', async () => {
			render(SwitchFormHarness, { scenario: 'cycle' });

			await page.getByRole('button', { name: 'Submit' }).click();
			input().click();
			await page.getByRole('button', { name: 'Submit' }).click();
			input().click();
			await page.getByRole('button', { name: 'Submit' }).click();

			await expect.poll(() => values()).toEqual(['no', 'yes', 'no']);
		});

		it('triggers native HTML validation on submit', async () => {
			render(SwitchFormHarness, { scenario: 'required' });

			expect(input().validity.valueMissing).toBe(true);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('0');

			input().click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
			expect(values()).toEqual(['on']);
		});
	});

	describe('Thumb', () => {
		it('throws a descriptive error when rendered outside Switch.Root', async () => {
			await expect(async () => {
				await render(Switch.Thumb);
			}).rejects.toThrow(
				'Base UI: SwitchRootContext is missing. Switch parts must be placed within <Switch.Root>.'
			);
		});
	});

	describe('native Svelte', () => {
		it('one-way checked sets the value, clicks override it until the owner changes it', async () => {
			render(SwitchBindHarness, { bound: false });
			const owner = page.getByRole('checkbox', { name: 'Owner checked' });

			await owner.click();
			await expect.poll(checked).toBe(true);
			input().click();
			await expect.poll(checked).toBe(false);
			await expect.element(owner).toBeChecked();
			await owner.click();
			await owner.click();
			await expect.poll(checked).toBe(true);
		});

		it('passes consumer attachments to the input', async () => {
			render(SwitchAttachHarness);
			await expect.element(page.getByTestId('host')).toHaveTextContent('INPUT');
		});

		it('render snippet draws the box with the input inside', async () => {
			render(SwitchAttachHarness, { custom: true });
			const custom = document.querySelector('.custom-host');

			expect(custom?.getAttribute('data-state')).toBe('off');
			expect(input().parentElement).toBe(custom);
			input().click();
			await expect.poll(() => custom?.getAttribute('data-state')).toBe('on');
		});
	});
});

describe('controllable value', () => {
	controllableRootCases('switch');
	controllableCopyCases();
});

describe('Switch labels', () => {
	ariaLabelPreferenceCases('switch');
});
