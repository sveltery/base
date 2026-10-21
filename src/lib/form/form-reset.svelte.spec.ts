// Native form reset. Base UI keeps React state on reset, so these cases follow
// Svelte's `bind:value` and `bind:checked` instead and have no upstream counterpart.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FormResetHarness from '../../tests/FormResetHarness.svelte';

function form() {
	return page.getByTestId('form').element() as HTMLFormElement;
}

function formData() {
	return [...new FormData(form())];
}

function state() {
	return JSON.parse(page.getByTestId('state').element().textContent ?? '{}');
}

function extra() {
	return JSON.parse(page.getByTestId('extra').element().textContent ?? '{}');
}

const ways = {
	'form.reset()': async () => form().reset(),
	'a reset button': () => page.getByRole('button', { name: 'Reset' }).click()
};

describe('form reset', () => {
	for (const [way, reset] of Object.entries(ways)) {
		describe(`after ${way}`, () => {
			it('restores a Checkbox to defaultChecked and submits it', async () => {
				render(FormResetHarness, { scenario: 'checkbox' });
				const control = page.getByTestId('control');
				await control.click();
				await expect.poll(state).toEqual({ checked: false });
				expect(formData()).toEqual([]);

				await reset();
				await expect.poll(state).toEqual({ checked: true });
				await expect.element(control).toBeChecked();
				expect(formData()).toEqual([['tos', 'on']]);
			});

			it('restores a Switch to defaultChecked and submits it', async () => {
				render(FormResetHarness, { scenario: 'switch' });
				const control = page.getByTestId('control');
				await control.click();
				await expect.poll(state).toEqual({ checked: false });

				await reset();
				await expect.poll(state).toEqual({ checked: true });
				await expect.element(control).toBeChecked();
				expect(formData()).toEqual([['alerts', 'on']]);
			});

			it('restores a RadioGroup to defaultValue and submits it', async () => {
				render(FormResetHarness, { scenario: 'radio-group' });
				await page.getByTestId('pro').click();
				await expect.poll(state).toEqual({ picked: 'pro' });
				expect(formData()).toEqual([['plan', 'pro']]);

				await reset();
				await expect.poll(state).toEqual({ picked: 'free' });
				await expect.element(page.getByTestId('free')).toHaveAttribute('aria-checked', 'true');
				await expect.element(page.getByTestId('pro')).toHaveAttribute('aria-checked', 'false');
				expect(formData()).toEqual([['plan', 'free']]);
			});

			it('restores a CheckboxGroup to defaultValue and submits it', async () => {
				render(FormResetHarness, { scenario: 'checkbox-group' });
				await page.getByTestId('kit').click();
				await expect.poll(state).toEqual({ tags: ['svelte', 'kit'] });

				await reset();
				await expect.poll(state).toEqual({ tags: ['svelte'] });
				await expect.element(page.getByTestId('kit')).not.toBeChecked();
				expect(formData()).toEqual([['tags', 'svelte']]);
			});

			it('restores a Slider to defaultValue and submits it', async () => {
				render(FormResetHarness, { scenario: 'slider' });
				const slider = page.getByRole('slider');
				(slider.element() as HTMLElement).focus();
				await userEvent.keyboard('{ArrowRight}');
				await expect.poll(state).toEqual({ volume: 31 });

				await reset();
				await expect.poll(state).toEqual({ volume: 30 });
				await expect.element(slider).toHaveValue('30');
				await expect.element(slider).toHaveAttribute('aria-valuenow', '30');
				expect(formData()).toEqual([['volume', '30']]);
			});

			it('restores a range Slider to defaultValue and submits it', async () => {
				render(FormResetHarness, { scenario: 'range-slider' });
				(page.getByRole('slider').first().element() as HTMLElement).focus();
				await userEvent.keyboard('{ArrowRight}');
				await expect.poll(state).toEqual({ volume: [21, 80] });

				await reset();
				await expect.poll(state).toEqual({ volume: [20, 80] });
				expect(formData()).toEqual([
					['volume', '20'],
					['volume', '80']
				]);
			});

			it('restores Field.Control to defaultValue', async () => {
				render(FormResetHarness, { scenario: 'input' });
				const control = page.getByTestId('control');
				await control.fill('changed');
				await expect.poll(state).toEqual({ text: 'changed' });

				await reset();
				await expect.poll(state).toEqual({ text: 'hello' });
				await expect.element(control).toHaveValue('hello');
				expect(formData()).toEqual([['email', 'hello']]);
			});

			it('restores an Input outside a Field to defaultValue', async () => {
				render(FormResetHarness, { scenario: 'bare-input' });
				const control = page.getByTestId('control');
				await control.fill('changed');
				await expect.poll(state).toEqual({ text: 'changed' });

				await reset();
				await expect.poll(state).toEqual({ text: 'hello' });
				await expect.element(control).toHaveValue('hello');
				expect(formData()).toEqual([['note', 'hello']]);
			});

			it('restores a NumberField to defaultValue and submits it', async () => {
				render(FormResetHarness, { scenario: 'number-field' });
				await page.getByRole('button', { name: 'Increase' }).click();
				await expect.poll(state).toEqual({ seats: 6 });

				await reset();
				await expect.poll(state).toEqual({ seats: 5 });
				await expect.element(page.getByTestId('control')).toHaveValue('5');
				expect(formData()).toEqual([['seats', '5']]);
			});

			it('restores an OTPField to defaultValue and submits it', async () => {
				render(FormResetHarness, { scenario: 'otp-field' });
				await page.getByTestId('slot-2').click();
				await userEvent.keyboard('3');
				await expect.poll(state).toEqual({ code: '123' });

				await reset();
				await expect.poll(state).toEqual({ code: '12' });
				await expect.element(page.getByTestId('slot-0')).toHaveValue('1');
				await expect.element(page.getByTestId('slot-2')).toHaveValue('');
				expect(formData()).toEqual([['code', '12']]);
			});

			it('restores controls outside the form that join it through the form prop', async () => {
				render(FormResetHarness, { scenario: 'outside-form' });
				await page.getByTestId('pro').click();
				(page.getByRole('slider').element() as HTMLElement).focus();
				await userEvent.keyboard('{ArrowRight}');
				await page.getByTestId('kit').click();
				await expect.poll(state).toEqual({ picked: 'pro', volume: 31, tags: ['svelte', 'kit'] });
				expect(formData()).toEqual([
					['plan', 'pro'],
					['volume', '31'],
					['tags', 'svelte'],
					['tags', 'kit']
				]);

				await reset();
				await expect.poll(state).toEqual({ picked: 'free', volume: 30, tags: ['svelte'] });
				await expect.element(page.getByTestId('free')).toHaveAttribute('aria-checked', 'true');
				await expect.element(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '30');
				await expect.element(page.getByTestId('kit')).not.toBeChecked();
				expect(formData()).toEqual([
					['plan', 'free'],
					['volume', '30'],
					['tags', 'svelte']
				]);
			});

			it('restores a bound range Slider with no defaultValue to its thumbs at min', async () => {
				render(FormResetHarness, { scenario: 'bound-range-slider' });
				(page.getByRole('slider').first().element() as HTMLElement).focus();
				await userEvent.keyboard('{ArrowRight}');
				await expect.poll(extra).toEqual({ price: [21, 80] });

				await reset();
				await expect.poll(extra).toEqual({ price: [0, 0] });
				await expect
					.element(page.getByRole('slider').first())
					.toHaveAttribute('aria-valuenow', '0');
				await expect.element(page.getByRole('slider').last()).toHaveAttribute('aria-valuenow', '0');
				expect(formData()).toEqual([
					['price', '0'],
					['price', '0']
				]);
			});

			it('clears Field dirty, touched, validity and Form errors', async () => {
				render(FormResetHarness, { scenario: 'field-state' });
				const field = page.getByTestId('field');
				await page.getByTestId('control').fill('bad');
				await userEvent.tab();
				await expect.element(field).toHaveAttribute('data-dirty', '');
				await expect.element(field).toHaveAttribute('data-touched', '');
				await expect.element(field).toHaveAttribute('data-invalid', '');
				await expect.element(page.getByTestId('error')).toHaveTextContent('Not allowed');

				await reset();
				await expect.element(field).not.toHaveAttribute('data-dirty');
				await expect.element(field).not.toHaveAttribute('data-touched');
				await expect.element(field).not.toHaveAttribute('data-invalid');
				await expect.element(field).not.toHaveAttribute('data-filled');
				await expect.element(page.getByTestId('error')).not.toBeInTheDocument();
				expect(formData()).toEqual([['email', '']]);
			});

			it('clears a server error from the Form', async () => {
				render(FormResetHarness, { scenario: 'field-state' });
				const field = page.getByTestId('field');
				await page.getByRole('button', { name: 'Server error' }).click();
				await expect.element(field).toHaveAttribute('data-invalid', '');

				await reset();
				await expect.element(field).not.toHaveAttribute('data-invalid');
			});

			it('clears Field state for a Checkbox', async () => {
				render(FormResetHarness, { scenario: 'checkbox-field-state' });
				const field = page.getByTestId('field');
				await page.getByTestId('control').click();
				await userEvent.tab();
				await expect.element(field).toHaveAttribute('data-dirty', '');
				await expect.element(field).toHaveAttribute('data-touched', '');
				await expect.element(field).toHaveAttribute('data-filled', '');

				await reset();
				await expect.poll(state).toEqual({ checked: false });
				await expect.element(field).not.toHaveAttribute('data-dirty');
				await expect.element(field).not.toHaveAttribute('data-touched');
				await expect.element(field).not.toHaveAttribute('data-filled');
			});
		});
	}

	it('submits one value per uncheckedValue control as soon as form.reset() returns', async () => {
		render(FormResetHarness, { scenario: 'unchecked-value' });
		await page.getByTestId('control').click();
		await page.getByTestId('switch').click();
		await expect.poll(state).toEqual({ checked: false });
		await expect.poll(extra).toEqual({ alerts: true });
		expect(formData()).toEqual([
			['news', 'no'],
			['alerts', 'on']
		]);

		form().reset();
		expect(formData()).toEqual([
			['news', 'on'],
			['alerts', 'off']
		]);
		await expect.poll(state).toEqual({ checked: true });
		await expect.poll(extra).toEqual({ alerts: false });
		await expect.element(page.getByTestId('control')).toBeChecked();
		expect(formData()).toEqual([
			['news', 'on'],
			['alerts', 'off']
		]);
	});

	it('keeps the uncheckedValue inputs out of sight when page CSS shows checkboxes', async () => {
		const css = document.head.appendChild(document.createElement('style'));
		css.textContent = "form input[type='checkbox'] { display: inline-block; }";
		try {
			render(FormResetHarness, { scenario: 'unchecked-value' });
			await page.getByTestId('control').click();
			await page.getByTestId('switch').click();
			const shown = [...form().querySelectorAll<HTMLInputElement>('input[type="checkbox"]')]
				.filter((input) => getComputedStyle(input).display !== 'none')
				.map((input) => input.value);
			expect(shown).toEqual(['on', 'on']);
		} finally {
			css.remove();
		}
	});

	it('keeps the values and Field state when the reset is canceled', async () => {
		render(FormResetHarness, { scenario: 'checkbox-field-state' });
		const field = page.getByTestId('field');
		await page.getByTestId('control').click();
		await expect.element(field).toHaveAttribute('data-dirty', '');
		form().addEventListener('reset', (event) => event.preventDefault());

		form().reset();
		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(state()).toEqual({ checked: true });
		await expect.element(field).toHaveAttribute('data-dirty', '');
	});
});
