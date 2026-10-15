// Assertions follow Base UI v1.9.0 packages/react/src/checkbox-group/CheckboxGroup.test.tsx
// ("Form values") and `getFormValue` in CheckboxGroup.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The three portal cases are not ported: they render through ReactDOM.createPortal.
// Cases under "native Svelte" have no upstream counterpart.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CheckboxGroupFormHarness from '../../tests/CheckboxGroupFormHarness.svelte';

function output(name: string) {
	return page.getByTestId(name).element().textContent ?? '';
}

function submit() {
	return page.getByRole('button', { name: 'Submit' }).click();
}

describe('CheckboxGroup in a Form', () => {
	it('projects selected enabled checkboxes while preserving the logical validation value', async () => {
		render(CheckboxGroupFormHarness, { scenario: 'enable' });
		await submit();

		expect(output('validated')).toBe('["apple","banana"] {"fruits":["apple"],"other":"value"}');
		expect(output('other')).toBe('["apple"]');
		expect(output('values')).toBe('{"fruits":["apple"],"other":"value"}');

		await page.getByRole('button', { name: 'Enable' }).click();
		await submit();

		expect(output('validated')).toBe(
			'["apple","banana"] {"fruits":["apple","banana"],"other":"value"}'
		);
		expect(output('other')).toBe('["apple","banana"]');
		expect(output('values')).toBe('{"fruits":["apple","banana"],"other":"value"}');
	});

	it('omits selected unmounted checkboxes while retaining group state across remounts', async () => {
		render(CheckboxGroupFormHarness, { scenario: 'remount' });
		const toggle = page.getByRole('button', { name: 'Toggle' });

		await toggle.click();
		await submit();
		expect(output('values')).toBe('{"fruits":["apple"],"other":"value"}');

		await toggle.click();
		await expect.element(page.getByTestId('banana')).toHaveAttribute('aria-checked', 'true');

		await submit();
		expect(output('values')).toBe('{"fruits":["apple","banana"],"other":"value"}');
	});

	it('preserves the logical field-name value when Checkbox.Root has no value prop', async () => {
		render(CheckboxGroupFormHarness, { scenario: 'no-value' });
		await submit();

		expect(output('values')).toBe('{"fruits":["fruits"]}');
	});

	it('updates duplicate-value registrations before submitting', async () => {
		render(CheckboxGroupFormHarness, { scenario: 'duplicates' });
		await page.getByRole('button', { name: 'Trim' }).click();
		await submit();

		expect(output('values')).toBe('{"items":["two"]}');
	});

	it('omits selected checkboxes associated with another form', async () => {
		render(CheckboxGroupFormHarness, { scenario: 'other-form' });
		await submit();

		expect(output('values')).toBe('{"fruits":["apple"],"other":"value"}');
	});

	it('omits checkboxes disabled by a fieldset', async () => {
		render(CheckboxGroupFormHarness, { scenario: 'fieldset' });
		await submit();

		expect(output('other')).toBe('["apple"]');
		expect(output('values')).toBe('{"fruits":["apple"],"other":"value"}');
	});

	describe('native Svelte', () => {
		it('reports the whole value when the Field has no Form', async () => {
			render(CheckboxGroupFormHarness, { scenario: 'no-form' });
			(page.getByTestId('cherry').element() as HTMLElement).click();

			await expect
				.poll(() => output('validated'))
				.toBe('["apple","banana","cherry"] {"fruits":["apple","banana","cherry"]}');
		});

		it('submits and validates only checked values of enabled inputs in the same form', async () => {
			render(CheckboxGroupFormHarness);
			await submit();

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
});
