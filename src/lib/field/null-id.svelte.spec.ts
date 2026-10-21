import type { ComponentProps } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NullIdFieldHarness from '../../tests/NullIdFieldHarness.svelte';

type Scenario = ComponentProps<typeof NullIdFieldHarness>['scenario'];

/** The element Field.Label points at: the hidden input of a radio, else the control. */
function labelledElement(scenario: Scenario) {
	const control = page.getByTestId('control').element();
	if (scenario !== 'radio') return control;
	const input = control.nextElementSibling;
	if (!(input instanceof HTMLInputElement)) throw new Error('expected a hidden input');
	return input;
}

describe('id={null} on a Field control', () => {
	for (const scenario of [
		'switch',
		'radio',
		'number-field',
		'otp-field',
		'field-control',
		'select',
		'combobox'
	] as const) {
		it(`${scenario} keeps Field.Label pointing at its control`, async () => {
			render(NullIdFieldHarness, { scenario });
			const label = page.getByTestId('label').element() as HTMLLabelElement;
			const id = labelledElement(scenario).id;

			expect(id.startsWith('base-ui-')).toBe(true);
			expect(label.getAttribute('for')).toBe(id);
		});
	}

	for (const scenario of ['switch', 'radio'] as const) {
		it(`${scenario} is checked by a click on Field.Label`, async () => {
			render(NullIdFieldHarness, { scenario });
			await page.getByTestId('label').click();
			const control = page.getByTestId('control').element();
			if (control instanceof HTMLInputElement) await expect.poll(() => control.checked).toBe(true);
			else
				await expect.element(page.getByTestId('control')).toHaveAttribute('aria-checked', 'true');
		});
	}

	for (const scenario of ['number-field', 'otp-field', 'field-control'] as const) {
		it(`${scenario} is focused by a click on Field.Label`, async () => {
			render(NullIdFieldHarness, { scenario });
			await page.getByTestId('label').click();
			await expect.element(page.getByTestId('control')).toHaveFocus();
		});
	}
});
