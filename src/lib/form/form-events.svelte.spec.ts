// Form's submit gate and the events non-native controls fire on their named inputs.
// Base UI blocks an invalid submit with `preventDefault()` in a bubble listener and its
// composites fire no events on their hidden inputs, so these cases follow HTML instead.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FormEventsHarness from '../../tests/FormEventsHarness.svelte';

function log() {
	return JSON.parse(page.getByTestId('log').element().textContent ?? '[]') as string[];
}

function pointer(target: Element, type: string, clientX: number) {
	target.dispatchEvent(
		new PointerEvent(type, {
			bubbles: true,
			cancelable: true,
			button: 0,
			buttons: type === 'pointerup' ? 0 : 1,
			clientX,
			clientY: 5,
			pointerId: 1,
			pointerType: 'mouse'
		})
	);
}

function submits() {
	return page.getByTestId('submits').element().textContent;
}

function blocked() {
	return page.getByTestId('blocked').element().textContent;
}

describe('submit gate', () => {
	it('prevents an invalid submit and still runs a later submit listener', async () => {
		render(FormEventsHarness, { scenario: 'gate' });
		await page.getByRole('button', { name: 'Submit' }).click();
		await expect.element(page.getByTestId('control')).toHaveFocus();
		expect(submits()).toBe('[true]');

		await page.getByTestId('control').fill('a@b.c');
		await page.getByRole('button', { name: 'Submit' }).click();
		await expect.poll(submits).toBe('[true,false]');
	});

	it('lets a formnovalidate submitter skip validation', async () => {
		render(FormEventsHarness, { scenario: 'gate' });
		await page.getByRole('button', { name: 'Skip validation' }).click();
		await expect.poll(submits).toBe('[false]');
		await expect.element(page.getByTestId('control')).not.toHaveAttribute('data-invalid');
	});

	it('tells a later submit listener whether it blocked this submit', async () => {
		render(FormEventsHarness, { scenario: 'gate' });
		const submit = page.getByRole('button', { name: 'Submit' });
		await submit.click();
		await expect.poll(blocked).toBe('[true]');
		await page.getByTestId('control').fill('a@b.c');
		await submit.click();
		await expect.poll(blocked).toBe('[true,false]');
		await page.getByTestId('control').fill('');
		await submit.click();
		await expect.poll(blocked).toBe('[true,false,true]');
		await page.getByRole('button', { name: 'Skip validation' }).click();
		await expect.poll(blocked).toBe('[true,false,true,false]');
	});

	it('sets novalidate once mounted', async () => {
		render(FormEventsHarness, { scenario: 'gate' });
		await expect.element(page.getByTestId('form')).toHaveAttribute('novalidate');
	});
});

describe('events on named inputs', () => {
	it('fires input and change from a Slider thumb on a key press', async () => {
		render(FormEventsHarness, { scenario: 'slider' });
		(page.getByRole('slider').element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(log).toEqual(['input volume=31', 'change volume=31']);
	});

	it('fires input on each Slider drag step and change on release', async () => {
		render(FormEventsHarness, { scenario: 'slider' });
		const control = page.getByTestId('slider-control').element();
		vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, 0, 100, 10));
		pointer(control, 'pointerdown', 55);
		await expect.poll(log).toEqual(['input volume=55']);
		pointer(control, 'pointermove', 60);
		await expect.poll(log).toEqual(['input volume=55', 'input volume=60']);
		pointer(control, 'pointerup', 60);
		await expect.poll(log).toEqual(['input volume=55', 'input volume=60', 'change volume=60']);
	});

	it('fires input and change from the NumberField hidden input on a step', async () => {
		render(FormEventsHarness, { scenario: 'number-field' });
		await page.getByRole('button', { name: 'Increase' }).click();
		await expect.poll(log).toEqual(['input seats=6', 'change seats=6']);
	});

	it('fires no change from a NumberField whose owner keeps its value', async () => {
		render(FormEventsHarness, { scenario: 'kept-number-field' });
		await page.getByRole('button', { name: 'Increase' }).click();
		await expect.poll(log).toEqual(['committed 6']);
		await expect.element(page.getByTestId('control')).toHaveValue('5');
	});

	it('fires input while typing in a NumberField and change on blur', async () => {
		render(FormEventsHarness, { scenario: 'number-field' });
		await page.getByTestId('control').fill('12');
		await expect.poll(log).toEqual(['input seats=12']);
		await page.getByRole('button', { name: 'Elsewhere' }).click();
		await expect.poll(log).toEqual(['input seats=12', 'change seats=12']);
	});

	it('fires input from the OTPField hidden input per slot and change on leaving it', async () => {
		render(FormEventsHarness, { scenario: 'otp-field' });
		await page.getByTestId('slot-0').click();
		await userEvent.keyboard('12');
		await expect.poll(log).toEqual(['input code=1', 'input code=12']);
		await page.getByRole('button', { name: 'Elsewhere' }).click();
		await expect.poll(log).toEqual(['input code=1', 'input code=12', 'change code=12']);
	});

	it('fires input and change from a Checkbox', async () => {
		render(FormEventsHarness, { scenario: 'checkbox' });
		await page.getByTestId('control').click();
		await expect.poll(log).toEqual(['input tos=true', 'change tos=true']);
	});

	it('fires input and change from a Switch', async () => {
		render(FormEventsHarness, { scenario: 'switch' });
		await page.getByTestId('control').click();
		await expect.poll(log).toEqual(['input alerts=true', 'change alerts=true']);
	});

	it('fires input and change from each child a parent checkbox toggles', async () => {
		render(FormEventsHarness, { scenario: 'checkbox-parent' });
		await page.getByTestId('parent').click();
		await expect.poll(log).toEqual(['input tag-b=true', 'change tag-b=true']);
		await page.getByTestId('parent').click();
		await expect
			.poll(log)
			.toEqual([
				'input tag-b=true',
				'change tag-b=true',
				'input tag-a=false',
				'change tag-a=false',
				'input tag-b=false',
				'change tag-b=false'
			]);
	});

	it('fires input and change from the radio a RadioGroup selects', async () => {
		render(FormEventsHarness, { scenario: 'radio-group' });
		await page.getByTestId('pro').click();
		await expect.poll(log).toEqual(['input plan=true', 'change plan=true']);
	});
});
