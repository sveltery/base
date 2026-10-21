// The server render of Select's hidden `<select>`, which is what a form without JavaScript submits.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import RemoteControlHarness from '../../tests/RemoteControlHarness.svelte';
import SelectHarness from '../../tests/SelectHarness.svelte';
import { kitFields } from '../../tests/kit-fields.js';

const html = (body: string) => body.replace(/<!--.*?-->/g, '');
const hiddenSelect = (body: string) =>
	html(body).match(/<select[^>]*aria-hidden="true"[^>]*>.*?<\/select>/s)?.[0] ?? '';
const selectedOptions = (select: string) =>
	[...select.matchAll(/<option([^>]*)>/g)]
		.filter(([, attributes]) => /\sselected/.test(attributes))
		.map(([, attributes]) => attributes.match(/value="([^"]*)"/)?.[1]);

describe('Select SSR', () => {
	it('marks the current option selected', () => {
		const select = hiddenSelect(
			render(SelectHarness, {
				props: { value: 'b', root: { name: 'letter' }, items: [{ value: 'a' }, { value: 'b' }] }
			}).body
		);
		expect(select).toMatch(/^<select[^>]*name="letter"/);
		expect(selectedOptions(select)).toEqual(['b']);
		expect(select).not.toContain('value=""');
	});

	it('selects an empty first option while there is no value', () => {
		const select = hiddenSelect(
			render(SelectHarness, { props: { root: { name: 'letter', defaultValue: null } } }).body
		);
		expect(select).toMatch(/<select[^>]*>\s*<option value=""[^>]*selected/);
	});

	it('marks every current value of a multiple select', () => {
		const select = hiddenSelect(
			render(SelectHarness, {
				props: { value: ['a', 'c'], root: { name: 'letters', multiple: true } }
			}).body
		);
		expect(select).toMatch(/^<select[^>]*multiple/);
		expect(selectedOptions(select)).toEqual(['a', 'c']);
	});

	it('leaves required for the browser, because the popup needs JavaScript to open', () => {
		const select = hiddenSelect(
			render(SelectHarness, { props: { root: { name: 'letter', required: true } } }).body
		);
		expect(select).not.toMatch(/\srequired/);
	});

	it('puts native select attributes on the hidden select', () => {
		const select = hiddenSelect(
			render(SelectHarness, {
				props: {
					root: { name: 'letter', form: 'outer', autocomplete: 'country', 'data-native': 'yes' }
				}
			}).body
		);
		expect(select).toContain('form="outer"');
		expect(select).toContain('autocomplete="country"');
		expect(select).toContain('data-native="yes"');
	});

	describe('in a remote form', () => {
		it('takes the spread name and echoes the value the form holds', () => {
			const fields = kitFields({ language: 'fr' });
			const select = hiddenSelect(
				render(RemoteControlHarness, {
					props: {
						fields,
						name: 'language',
						control: 'select',
						spread: fields.language.as('select')
					}
				}).body
			);
			expect(select).toMatch(/name="language\/form"/);
			expect(selectedOptions(select)).toEqual(['fr']);
		});

		it('names an array field and marks each value of a select multiple spread', () => {
			const fields = kitFields({ languages: ['en', 'de'] });
			const select = hiddenSelect(
				render(RemoteControlHarness, {
					props: {
						fields,
						name: 'languages',
						control: 'select multiple',
						spread: fields.languages.as('select multiple')
					}
				}).body
			);
			expect(select).toMatch(/name="languages\[\]\/form"/);
			expect(selectedOptions(select)).toEqual(['en', 'de']);
		});

		it('binds a bare select to the field Field.Root names', () => {
			const fields = kitFields({ language: 'de' });
			const select = hiddenSelect(
				render(RemoteControlHarness, {
					props: { fields, name: 'language', control: 'select' }
				}).body
			);
			expect(select).toMatch(/name="language\/form"/);
			expect(selectedOptions(select)).toEqual(['de']);
		});

		it('binds a bare multiple select to the array field', () => {
			const fields = kitFields({ languages: ['fr'] });
			const select = hiddenSelect(
				render(RemoteControlHarness, {
					props: { fields, name: 'languages', control: 'select multiple' }
				}).body
			);
			expect(select).toMatch(/name="languages\[\]\/form"/);
			expect(selectedOptions(select)).toEqual(['fr']);
		});

		it('renders one element that submits under the name', () => {
			const fields = kitFields({ language: 'fr' });
			const body = html(
				render(RemoteControlHarness, {
					props: { fields, name: 'language', control: 'select' }
				}).body
			);
			expect(body.match(/name="language\/form"/g)).toHaveLength(1);
		});
	});
});
