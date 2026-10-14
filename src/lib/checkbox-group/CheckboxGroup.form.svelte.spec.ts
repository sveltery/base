// Covers Base UI v1.9.0 packages/react/src/checkbox-group/CheckboxGroup.tsx `getFormValue`
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CheckboxGroupFormHarness from '../../tests/CheckboxGroupFormHarness.svelte';

function output(name: string) {
	return page.getByTestId(name).element().textContent ?? '';
}

describe('CheckboxGroup in a Form', () => {
	it('submits and validates only checked values of enabled inputs in the same form', async () => {
		render(CheckboxGroupFormHarness);
		await page.getByRole('button', { name: 'Submit' }).click();

		expect(output('values')).toBe('{"colors":["red"]}');
		expect(output('validated')).toBe('["red","green","blue"] {"colors":["red"]}');
		expect(output('form-data')).toBe('[["colors","red"]]');
	});

	it('measures dirty against the whole value, not the submitted one', async () => {
		render(CheckboxGroupFormHarness);
		const blue = page.getByTestId('blue').element() as HTMLElement;
		blue.click();
		await expect.element(page.getByTestId('group')).toHaveAttribute('data-dirty');
		blue.click();
		await expect.element(page.getByTestId('group')).not.toHaveAttribute('data-dirty');
	});
});
