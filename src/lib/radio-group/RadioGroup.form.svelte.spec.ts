// Assertions follow the Form cases of Base UI v1.9.0 packages/react/src/radio-group/RadioGroup.test.tsx
// and `getFormValue` in RadioGroup.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `createPortal` becomes an attachment that moves the radio out of the `<form>`.
// Cases under "native Svelte" have no upstream counterpart.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import RadioGroupFormHarness from '../../tests/RadioGroupFormHarness.svelte';

function output(name: string) {
	return page.getByTestId(name).element().textContent ?? '';
}

function formData(name: string) {
	return new FormData(page.getByTestId('form').element() as HTMLFormElement).getAll(name);
}

function submit() {
	return page.getByRole('button', { name: 'Submit' }).click();
}

function toggleDisabled() {
	return page.getByRole('button', { name: 'Toggle disabled' }).click();
}

describe('RadioGroup in a Form', () => {
	it('excludes a disabled selected radio from the submitted values, as native form data does', async () => {
		render(RadioGroupFormHarness, { scenario: 'disable' });
		await toggleDisabled();

		expect(formData('test')).toEqual([]);
		await submit();
		expect(output('values')).toBe('{}');
	});

	it('includes a selected radio again when it is re-enabled before form submission', async () => {
		render(RadioGroupFormHarness, { scenario: 'disable' });
		await toggleDisabled();
		expect(formData('test')).toEqual([]);

		await toggleDisabled();
		expect(formData('test')).toEqual(['a']);

		await submit();
		expect(output('values')).toBe('{"test":"a"}');
	});

	it('excludes an initially disabled selected radio from the submitted values, as native form data does', async () => {
		render(RadioGroupFormHarness, { scenario: 'initially-disabled' });

		expect(formData('test')).toEqual([]);
		await submit();
		expect(output('values')).toBe('{}');
	});

	it('projects an enabled selected radio, matching native form data', async () => {
		render(RadioGroupFormHarness, { scenario: 'enabled' });

		expect(formData('choice')).toEqual(['a']);
		await submit();
		expect(output('values')).toBe('{"choice":"a"}');
	});

	it('excludes a radio disabled through an ancestor <fieldset disabled> to match native form data', async () => {
		render(RadioGroupFormHarness, { scenario: 'fieldset' });

		expect(formData('choice')).toEqual([]);
		await submit();
		expect(output('values')).toBe('{}');
	});

	it('includes a selected radio after its ancestor fieldset is enabled', async () => {
		render(RadioGroupFormHarness, { scenario: 'fieldset' });
		expect(formData('choice')).toEqual([]);

		await page.getByRole('button', { name: 'Enable' }).click();
		expect(formData('choice')).toEqual(['a']);

		await submit();
		expect(output('values')).toBe('{"choice":"a"}');
	});

	it('omits a radio associated to another form via the `form` prop', async () => {
		render(RadioGroupFormHarness, { scenario: 'other-form' });

		expect(formData('choice')).toEqual([]);
		await submit();
		expect(output('values')).toBe('{}');
	});

	it('leaves out a radio portaled outside the form element, as native form data does', async () => {
		render(RadioGroupFormHarness, { scenario: 'portal-radio' });

		expect(formData('choice')).toEqual([]);
		await submit();
		expect(output('values')).toBe('{}');
	});

	it('leaves out a group portaled outside the form element, as native form data does', async () => {
		render(RadioGroupFormHarness, { scenario: 'portal-group' });
		await submit();

		expect(output('values')).toBe('{}');
	});

	it('submits nothing when the selected radio in a required group is disabled, matching native validity', async () => {
		render(RadioGroupFormHarness, { scenario: 'required-disabled' });

		expect(formData('choice')).toEqual([]);
		await submit();
		await expect.element(page.getByTestId('error')).not.toBeInTheDocument();
		expect(output('values')).toBe('{}');
	});

	describe('native Svelte', () => {
		it('reports the checked value of a disabled radio when the Field has no Form', async () => {
			render(RadioGroupFormHarness, { scenario: 'no-form' });
			await page.getByTestId('other-control').fill('x');

			await expect.poll(() => output('other')).toBe('"a"');
		});
	});
});
