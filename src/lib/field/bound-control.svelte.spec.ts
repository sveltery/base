// Composite controls inside a Field bound to a form source. No Base UI equivalent: the source is
// a stand-in for a SvelteKit remote form, with Kit's name encoding and `input` handling.
import { flushSync } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { resetLogged } from '@sveltery/utils';
import BoundControlHarness from '../../tests/BoundControlHarness.svelte';
import { FakeRemoteForm } from '../../tests/fake-remote-form.svelte.js';

function form() {
	return page.getByTestId('form').element() as HTMLFormElement;
}

function names() {
	return Array.from(form().querySelectorAll('input[name]'), (input) => input.getAttribute('name'));
}

function submitted(source: FakeRemoteForm) {
	return source.decode(new FormData(form()));
}

afterEach(() => {
	resetLogged();
	vi.restoreAllMocks();
});

describe('bound Checkbox and Switch', () => {
	for (const [scenario, path] of [
		['checkbox', 'agree'],
		['switch', 'alerts']
	] as const) {
		describe(scenario, () => {
			it('submits a boolean under the encoded name, with no unchecked value', async () => {
				const source = new FakeRemoteForm();
				render(BoundControlHarness, { source, scenario });

				expect(names()).toEqual([`b:${path}/fake`]);
				expect(form().querySelector('input[name]')?.hasAttribute('value')).toBe(false);
				expect(submitted(source)).toEqual({});

				await page.getByTestId('control').click();
				await expect.element(page.getByTestId('control')).toHaveAttribute('aria-checked', 'true');
				expect(submitted(source)).toEqual({ [path]: true });
				expect(source.input[path]).toBe(true);

				await page.getByTestId('control').click();
				expect(source.input[path]).toBe(false);
				expect(submitted(source)).toEqual({});
			});

			it('follows a value set on the source', async () => {
				const source = new FakeRemoteForm();
				render(BoundControlHarness, { source, scenario });

				source.field(path).set(true as never);
				await expect.element(page.getByTestId('control')).toHaveAttribute('aria-checked', 'true');
				expect(submitted(source)).toEqual({ [path]: true });

				source.field(path).set(false as never);
				await expect.element(page.getByTestId('control')).toHaveAttribute('aria-checked', 'false');
				expect(submitted(source)).toEqual({});
			});

			it('starts from the source value, and a reset restores the default', async () => {
				const source = new FakeRemoteForm('fake', { [path]: true });
				render(BoundControlHarness, { source, scenario });

				await expect.element(page.getByTestId('control')).toHaveAttribute('aria-checked', 'true');
				expect(submitted(source)).toEqual({ [path]: true });

				form().reset();
				await expect.element(page.getByTestId('control')).toHaveAttribute('aria-checked', 'false');
				expect(submitted(source)).toEqual({});
				expect(source.input[path]).toBe(undefined);
			});
		});
	}
});

describe('bound RadioGroup', () => {
	it('submits the picked option under the encoded name', async () => {
		const source = new FakeRemoteForm();
		render(BoundControlHarness, { source, scenario: 'radio-group' });

		expect(names()).toEqual(['plan/fake', 'plan/fake']);
		expect(submitted(source)).toEqual({ plan: 'free' });

		await page.getByTestId('pro').click();
		await expect.element(page.getByTestId('pro')).toHaveAttribute('aria-checked', 'true');
		expect(submitted(source)).toEqual({ plan: 'pro' });
		expect(source.input.plan).toBe('pro');
	});

	it('follows a value set on the source', async () => {
		const source = new FakeRemoteForm();
		render(BoundControlHarness, { source, scenario: 'radio-group' });

		source.field('plan').set('pro' as never);
		await expect.element(page.getByTestId('pro')).toHaveAttribute('aria-checked', 'true');
		await expect.element(page.getByTestId('free')).toHaveAttribute('aria-checked', 'false');
		expect(submitted(source)).toEqual({ plan: 'pro' });
	});

	it('starts from the source value, and a reset restores the default', async () => {
		const source = new FakeRemoteForm('fake', { plan: 'pro' });
		render(BoundControlHarness, { source, scenario: 'radio-group' });

		await expect.element(page.getByTestId('pro')).toHaveAttribute('aria-checked', 'true');
		expect(submitted(source)).toEqual({ plan: 'pro' });

		form().reset();
		await expect.element(page.getByTestId('free')).toHaveAttribute('aria-checked', 'true');
		expect(submitted(source)).toEqual({ plan: 'free' });
		await expect.poll(() => source.input.plan).toBe('free');
	});
});

describe('bound RadioGroup with non-string values', () => {
	it('keeps a picked option checked once the source holds its serialized value', async () => {
		const source = new FakeRemoteForm();
		render(BoundControlHarness, { source, scenario: 'number-radio-group' });

		await page.getByTestId('two').click();
		await expect.poll(() => source.input.seats).toBe('2');
		await expect.element(page.getByTestId('two')).toHaveAttribute('aria-checked', 'true');
		expect(submitted(source)).toEqual({ seats: '2' });
	});

	it('checks the option a source value names', async () => {
		const source = new FakeRemoteForm('fake', { seats: '2' });
		render(BoundControlHarness, { source, scenario: 'number-radio-group' });

		await expect.element(page.getByTestId('two')).toHaveAttribute('aria-checked', 'true');

		source.field('seats').set('1' as never);
		await expect.element(page.getByTestId('one')).toHaveAttribute('aria-checked', 'true');
		await expect.element(page.getByTestId('two')).toHaveAttribute('aria-checked', 'false');
		expect(submitted(source)).toEqual({ seats: '1' });
	});
});

describe('bound CheckboxGroup', () => {
	it('submits the ticked options as an array under the encoded name', async () => {
		const source = new FakeRemoteForm();
		render(BoundControlHarness, { source, scenario: 'checkbox-group' });

		expect(names()).toEqual(['tags[]/fake', 'tags[]/fake']);
		expect(submitted(source)).toEqual({ tags: ['svelte'] });

		await page.getByTestId('kit').click();
		await expect.element(page.getByTestId('kit')).toHaveAttribute('aria-checked', 'true');
		expect(submitted(source)).toEqual({ tags: ['svelte', 'kit'] });
		expect(source.input.tags).toEqual(['svelte', 'kit']);

		await page.getByTestId('svelte').click();
		expect(source.input.tags).toEqual(['kit']);
	});

	it('follows a value set on the source', async () => {
		const source = new FakeRemoteForm();
		render(BoundControlHarness, { source, scenario: 'checkbox-group' });

		source.field('tags').set(['kit'] as never);
		await expect.element(page.getByTestId('kit')).toHaveAttribute('aria-checked', 'true');
		await expect.element(page.getByTestId('svelte')).toHaveAttribute('aria-checked', 'false');
		expect(submitted(source)).toEqual({ tags: ['kit'] });
	});

	it('starts from the source value, and a reset restores the default', async () => {
		const source = new FakeRemoteForm('fake', { tags: ['kit'] });
		render(BoundControlHarness, { source, scenario: 'checkbox-group' });

		await expect.element(page.getByTestId('kit')).toHaveAttribute('aria-checked', 'true');
		await expect.element(page.getByTestId('svelte')).toHaveAttribute('aria-checked', 'false');
		expect(submitted(source)).toEqual({ tags: ['kit'] });

		form().reset();
		await expect.element(page.getByTestId('svelte')).toHaveAttribute('aria-checked', 'true');
		await expect.element(page.getByTestId('kit')).toHaveAttribute('aria-checked', 'false');
		expect(submitted(source)).toEqual({ tags: ['svelte'] });
		await expect.poll(() => source.input.tags).toEqual(['svelte']);
	});
});

describe('bound NumberField', () => {
	function input() {
		return page.getByTestId('control');
	}

	it('submits a number under the encoded name', async () => {
		const source = new FakeRemoteForm();
		render(BoundControlHarness, { source, scenario: 'number-field' });

		expect(names()).toEqual(['n:seats/fake']);
		expect(submitted(source)).toEqual({ seats: 1 });

		await input().fill('12');
		await expect.poll(() => source.input.seats).toBe(12);
		expect(submitted(source)).toEqual({ seats: 12 });
	});

	it('follows a value set on the source, and clears for an empty one', async () => {
		const source = new FakeRemoteForm();
		render(BoundControlHarness, { source, scenario: 'number-field' });

		source.field('seats').set(7 as never);
		await expect.element(input()).toHaveValue('7');
		expect(submitted(source)).toEqual({ seats: 7 });

		source.field('seats').set(undefined as never);
		await expect.element(input()).toHaveValue('');
		expect(submitted(source)).toStrictEqual({ seats: undefined });
	});

	it('can be cleared by the user, and stays cleared', async () => {
		const source = new FakeRemoteForm('fake', { seats: 5 });
		render(BoundControlHarness, { source, scenario: 'number-field' });
		await expect.element(input()).toHaveValue('5');

		await input().fill('');
		await expect.poll(() => Object.hasOwn(source.input, 'seats')).toBe(true);
		await expect.poll(() => source.input.seats).toBe(undefined);
		await page.getByTestId('form').click({ position: { x: 1, y: 1 } });
		await expect.element(input()).toHaveValue('');
		expect(submitted(source)).toStrictEqual({ seats: undefined });
	});

	it('starts from the source value, and a reset restores the default', async () => {
		const source = new FakeRemoteForm('fake', { seats: 5 });
		render(BoundControlHarness, { source, scenario: 'number-field' });

		await expect.element(input()).toHaveValue('5');
		expect(submitted(source)).toEqual({ seats: 5 });

		form().reset();
		await expect.element(input()).toHaveValue('1');
		expect(submitted(source)).toEqual({ seats: 1 });
		await expect.poll(() => source.input.seats).toBe(1);
	});
});

describe('bound Slider', () => {
	function thumb() {
		return page.getByRole('slider');
	}

	it('submits a number under the encoded name', async () => {
		const source = new FakeRemoteForm();
		render(BoundControlHarness, { source, scenario: 'slider' });

		expect(names()).toEqual(['n:volume/fake']);
		expect(submitted(source)).toEqual({ volume: 30 });

		(thumb().element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => source.input.volume).toBe(31);
		expect(submitted(source)).toEqual({ volume: 31 });
	});

	it('follows a value set on the source, and returns to its default for an empty one', async () => {
		const source = new FakeRemoteForm();
		render(BoundControlHarness, { source, scenario: 'slider' });

		source.field('volume').set(70 as never);
		await expect.element(thumb()).toHaveAttribute('aria-valuenow', '70');
		expect(submitted(source)).toEqual({ volume: 70 });

		source.field('volume').set(undefined as never);
		await expect.element(thumb()).toHaveAttribute('aria-valuenow', '30');
		expect(submitted(source)).toEqual({ volume: 30 });
	});

	it('starts from the source value, and a reset restores the default', async () => {
		const source = new FakeRemoteForm('fake', { volume: 70 });
		render(BoundControlHarness, { source, scenario: 'slider' });

		await expect.element(thumb()).toHaveAttribute('aria-valuenow', '70');
		expect(submitted(source)).toEqual({ volume: 70 });

		form().reset();
		await expect.element(thumb()).toHaveAttribute('aria-valuenow', '30');
		expect(submitted(source)).toEqual({ volume: 30 });
		await expect.poll(() => source.input.volume).toBe(30);
	});

	it('logs a dev error for a range value', async () => {
		const log = vi.spyOn(console, 'error').mockImplementation(() => {});
		render(BoundControlHarness, { source: new FakeRemoteForm(), scenario: 'range-slider' });
		await expect
			.poll(() => log.mock.calls.map((call) => call[0]))
			.toEqual([
				'Base UI: A Slider with several thumbs is inside a Field.Root bound to a form source. ' +
					'A bound Slider submits one number, so give it a single value.'
			]);
	});
});

describe('bound OTPField', () => {
	function slots() {
		return [0, 1, 2, 3].map(
			(index) => (page.getByTestId(`slot-${index}`).element() as HTMLInputElement).value
		);
	}

	it('submits the code as a string under the encoded name', async () => {
		const source = new FakeRemoteForm();
		render(BoundControlHarness, { source, scenario: 'otp-field' });

		expect(names()).toEqual(['code/fake']);
		expect(submitted(source)).toEqual({ code: '12' });

		await page.getByTestId('slot-2').click();
		await userEvent.keyboard('3');
		await expect.poll(() => source.input.code).toBe('123');
		expect(submitted(source)).toEqual({ code: '123' });
	});

	it('follows a value set on the source, and empties for an empty one', async () => {
		const source = new FakeRemoteForm();
		render(BoundControlHarness, { source, scenario: 'otp-field' });

		source.field('code').set('9876' as never);
		await expect.poll(slots).toEqual(['9', '8', '7', '6']);
		expect(submitted(source)).toEqual({ code: '9876' });

		source.field('code').set(undefined as never);
		await expect.poll(slots).toEqual(['', '', '', '']);
		expect(submitted(source)).toEqual({ code: '' });
	});

	it('starts from the source value, and a reset restores the default', async () => {
		const source = new FakeRemoteForm('fake', { code: '4321' });
		render(BoundControlHarness, { source, scenario: 'otp-field' });

		await expect.poll(slots).toEqual(['4', '3', '2', '1']);
		expect(submitted(source)).toEqual({ code: '4321' });

		form().reset();
		await expect.poll(slots).toEqual(['1', '2', '', '']);
		expect(submitted(source)).toEqual({ code: '12' });
		await expect.poll(() => source.input.code).toBe('12');
	});
});

describe('attachments from as()', () => {
	for (const { scenario, edit, reports } of [
		{
			scenario: 'checkbox',
			edit: () => page.getByTestId('control').click(),
			reports: [{ name: 'b:agree/fake', value: 'true' }]
		},
		{
			scenario: 'switch',
			edit: () => page.getByTestId('control').click(),
			reports: [{ name: 'b:alerts/fake', value: 'true' }]
		},
		{
			scenario: 'radio-group',
			edit: () => page.getByTestId('pro').click(),
			reports: [{ name: 'plan/fake', value: 'true' }]
		},
		{
			scenario: 'checkbox-group',
			edit: () => page.getByTestId('kit').click(),
			reports: [{ name: 'tags[]/fake', value: 'true' }]
		},
		{
			scenario: 'number-field',
			edit: () => page.getByTestId('control').fill('12'),
			reports: [{ name: 'n:seats/fake', value: '12' }]
		},
		{
			scenario: 'slider',
			edit: async () => {
				(page.getByRole('slider').element() as HTMLElement).focus();
				await userEvent.keyboard('{ArrowRight}');
			},
			reports: [{ name: 'n:volume/fake', value: '31' }]
		},
		{
			scenario: 'otp-field',
			edit: async () => {
				await page.getByTestId('slot-2').click();
				await userEvent.keyboard('3');
			},
			reports: [{ name: 'code/fake', value: '123' }]
		}
	] as const) {
		it(`reach the native input of a bound ${scenario}`, async () => {
			const source = new FakeRemoteForm('fake', {}, { attachment: true });
			render(BoundControlHarness, { source, scenario });
			await edit();
			await expect.poll(() => source.reports).toEqual(reports);
		});
	}
});

describe('inside a real Field.Root bound with `field`', () => {
	for (const { scenario, initial, edit, after } of [
		{
			scenario: 'checkbox',
			initial: {},
			edit: () => page.getByTestId('control').click(),
			after: { agree: true }
		},
		{
			scenario: 'switch',
			initial: {},
			edit: () => page.getByTestId('control').click(),
			after: { alerts: true }
		},
		{
			scenario: 'radio-group',
			initial: { plan: 'free' },
			edit: () => page.getByTestId('pro').click(),
			after: { plan: 'pro' }
		},
		{
			scenario: 'checkbox-group',
			initial: { tags: ['svelte'] },
			edit: () => page.getByTestId('kit').click(),
			after: { tags: ['svelte', 'kit'] }
		},
		{
			scenario: 'number-field',
			initial: { seats: 1 },
			edit: () => page.getByTestId('control').fill('12'),
			after: { seats: 12 }
		},
		{
			scenario: 'slider',
			initial: { volume: 30 },
			edit: async () => {
				(page.getByRole('slider').element() as HTMLElement).focus();
				await userEvent.keyboard('{ArrowRight}');
			},
			after: { volume: 31 }
		},
		{
			scenario: 'otp-field',
			initial: { code: '12' },
			edit: async () => {
				await page.getByTestId('slot-2').click();
				await userEvent.keyboard('3');
			},
			after: { code: '123' }
		}
	] as const) {
		it(`binds a ${scenario}`, async () => {
			const log = vi.spyOn(console, 'error').mockImplementation(() => {});
			const source = new FakeRemoteForm();
			render(BoundControlHarness, { source, scenario, real: true });

			expect(submitted(source)).toEqual(initial);
			await edit();
			await expect.poll(() => submitted(source)).toEqual(after);
			await expect.poll(() => ({ ...source.input })).toEqual(after);
			expect(log.mock.calls).toEqual([]);
		});
	}

	it('dev-checks the kind against the real Field.Root type', async () => {
		const log = vi.spyOn(console, 'error').mockImplementation(() => {});
		render(BoundControlHarness, {
			source: new FakeRemoteForm(),
			scenario: 'number-field',
			type: 'range',
			real: true
		});
		await expect
			.poll(() => log.mock.calls.map((call) => call[0]))
			.toEqual([
				'Base UI: A number control is inside a Field.Root declared as type="range". ' +
					'Set type="number" on the Field.Root, or use a control of kind "range".'
			]);
	});
});

describe('dev kind check', () => {
	for (const [scenario, kind, declared] of [
		['checkbox', 'checkbox', 'switch'],
		['switch', 'switch', 'checkbox'],
		['radio-group', 'radio', 'text'],
		['checkbox-group', 'checkbox', 'select multiple'],
		['number-field', 'number', 'range'],
		['slider', 'range', 'number'],
		['otp-field', 'text', 'number']
	] as const) {
		it(`logs when a ${kind} control sits in a Field declared as ${declared}`, async () => {
			const log = vi.spyOn(console, 'error').mockImplementation(() => {});
			render(BoundControlHarness, { source: new FakeRemoteForm(), scenario, type: declared });
			flushSync();
			await expect
				.poll(() => log.mock.calls.map((call) => call[0]))
				.toEqual([
					`Base UI: A ${kind} control is inside a Field.Root declared as type="${declared}". ` +
						`Set type="${kind}" on the Field.Root, or use a control of kind "${declared}".`
				]);
		});
	}

	it('stays quiet when the kinds agree', async () => {
		const log = vi.spyOn(console, 'error').mockImplementation(() => {});
		const source = new FakeRemoteForm();
		render(BoundControlHarness, { source, scenario: 'switch' });
		await page.getByTestId('control').click();
		expect(source.input.alerts).toBe(true);
		expect(log.mock.calls).toEqual([]);
	});
});

// SvelteKit renders a failed submit without JavaScript from the raw FormData strings.
describe('a source holding the strings a submit without JavaScript echoes', () => {
	it('checks a Checkbox and a Switch for "on"', async () => {
		for (const [scenario, path] of [
			['checkbox', 'agree'],
			['switch', 'alerts']
		] as const) {
			const source = new FakeRemoteForm('fake', { [path]: 'on' });
			const { unmount } = render(BoundControlHarness, { source, scenario });
			await expect.element(page.getByTestId('control')).toHaveAttribute('aria-checked', 'true');
			expect(submitted(source)).toEqual({ [path]: true });
			unmount();
		}
	});

	it('starts a NumberField and a Slider from a numeric string', async () => {
		const seats = new FakeRemoteForm('fake', { seats: '5' });
		const numberField = render(BoundControlHarness, { source: seats, scenario: 'number-field' });
		await expect.element(page.getByTestId('control')).toHaveValue('5');
		expect(submitted(seats)).toEqual({ seats: 5 });
		numberField.unmount();

		const volume = new FakeRemoteForm('fake', { volume: '70' });
		render(BoundControlHarness, { source: volume, scenario: 'slider' });
		await expect.element(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '70');
		expect(submitted(volume)).toEqual({ volume: 70 });
	});
});
