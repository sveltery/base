// The server HTML a remote form submits without JavaScript.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import RemoteControlHarness from '../../tests/RemoteControlHarness.svelte';
import { kitFields } from '../../tests/kit-fields.js';

const html = (body: string) => body.replace(/<!--.*?-->/g, '');
const numberInputs = (body: string) =>
	[...html(body).matchAll(/<input[^>]*type="number"[^>]*>/g)].map(([tag]) => ({
		name: tag.match(/\sname="([^"]*)"/)?.[1],
		value: tag.match(/\svalue="([^"]*)"/)?.[1],
		tag
	}));
const visibleInput = (body: string) =>
	html(body).match(/<input[^>]*data-testid="input"[^>]*>/)?.[0] ?? '';

describe('NumberField SSR in a remote form', () => {
	it('reads the string value of a number spread', () => {
		const fields = kitFields({ seats: 4 });
		const body = render(RemoteControlHarness, {
			props: { fields, name: 'seats', control: 'number', spread: fields.seats.as('number') }
		}).body;
		expect(numberInputs(body).map(({ name, value }) => [name, value])).toEqual([
			['n:seats/form', '4']
		]);
		expect(visibleInput(body)).toContain('value="4"');
	});

	it('starts a spread at the default it carries while the field is empty', () => {
		const fields = kitFields({});
		const body = render(RemoteControlHarness, {
			props: { fields, name: 'seats', control: 'number', spread: fields.seats.as('number', 2) }
		}).body;
		expect(numberInputs(body).map(({ value }) => value)).toEqual(['2']);
		expect(visibleInput(body)).toContain('value="2"');
	});

	it('binds a bare number field to the field, and the echo beats the default', () => {
		const fresh = render(RemoteControlHarness, {
			props: { fields: kitFields({}), name: 'seats', control: 'number', props: { defaultValue: 3 } }
		}).body;
		expect(numberInputs(fresh).map(({ name, value }) => [name, value])).toEqual([
			['n:seats/form', '3']
		]);

		const echoed = render(RemoteControlHarness, {
			props: {
				fields: kitFields({ seats: 7 }),
				name: 'seats',
				control: 'number',
				props: { defaultValue: 3 }
			}
		}).body;
		expect(numberInputs(echoed).map(({ value }) => value)).toEqual(['7']);
		expect(visibleInput(echoed)).toContain('value="7"');
	});

	it('renders one input per name', () => {
		const fields = kitFields({});
		const body = html(
			render(RemoteControlHarness, {
				props: { fields, name: 'seats', control: 'number', spread: fields.seats.as('number') }
			}).body
		);
		expect(body.match(/name="n:seats\/form"/g)).toHaveLength(1);
	});

	it('leaves required to the browser, where the visible input can be filled', () => {
		const fields = kitFields({});
		const body = render(RemoteControlHarness, {
			props: {
				fields,
				name: 'seats',
				control: 'number',
				spread: fields.seats.as('number'),
				props: { required: true }
			}
		}).body;
		const [hidden] = numberInputs(body);
		expect(hidden.tag).not.toMatch(/\srequired/);
	});

	it('sends native props to the hidden input and class to the root', () => {
		const fields = kitFields({});
		const body = render(RemoteControlHarness, {
			props: {
				fields,
				name: 'seats',
				control: 'number',
				spread: fields.seats.as('number'),
				props: { form: 'outer', 'data-native': 'yes', class: 'number-root' }
			}
		}).body;
		const [hidden] = numberInputs(body);
		expect(hidden.tag).toContain('form="outer"');
		expect(hidden.tag).toContain('data-native="yes"');
		expect(hidden.tag).not.toContain('number-root');
		expect(html(body).match(/<div[^>]*data-testid="number-field"[^>]*>/)?.[0]).toContain(
			'class="number-root"'
		);
	});
});
