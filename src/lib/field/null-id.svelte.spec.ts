import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NullIdFieldHarness from '../../tests/NullIdFieldHarness.svelte';

/** The element Field.Label points at. A radio's test id is on its input. */
function labelledElement() {
	return page.getByTestId('control').element();
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
			const id = labelledElement().id;

			expect(id.startsWith('base-ui-')).toBe(true);
			expect(label.getAttribute('for')).toBe(id);
		});
	}

	for (const scenario of ['switch', 'radio'] as const) {
		it(`${scenario} is checked by a click on Field.Label`, async () => {
			render(NullIdFieldHarness, { scenario });
			await page.getByTestId('label').click();
			await expect.element(page.getByTestId('control')).toBeChecked();
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
