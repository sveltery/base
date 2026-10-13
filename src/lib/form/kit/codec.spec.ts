// Kit's remote-form encoding without the `/form_id` suffix. Cases follow SvelteKit 3.0.1's
// form-utils behavior: `parseFloat` numbers, `on` booleans, `[]` arrays, rejected names.
import { describe, expect, it } from 'vitest';
import {
	convertFormData,
	createFieldProxy,
	flattenIssues,
	FormDataError,
	normalizeIssue,
	parseFormKey,
	type FieldStore
} from './codec.js';

function formData(entries: [string, string | File][]) {
	const data = new FormData();
	for (const [key, value] of entries) data.append(key, value);
	return data;
}

describe('parseFormKey', () => {
	it('reads the type prefix and array suffix', () => {
		expect(parseFormKey('n:age')).toEqual({ name: 'age', type: 'number', isArray: false });
		expect(parseFormKey('b:agree')).toEqual({ name: 'agree', type: 'boolean', isArray: false });
		expect(parseFormKey('tags[]')).toEqual({ name: 'tags', type: null, isArray: true });
		expect(parseFormKey('n:scores[]')).toEqual({ name: 'scores', type: 'number', isArray: true });
		expect(parseFormKey('items[0].name')).toEqual({
			name: 'items[0].name',
			type: null,
			isArray: false
		});
	});

	it('reads image coordinates as numbers on the point', () => {
		expect(parseFormKey('i:pos.x')).toEqual({ name: 'pos.x', type: 'number', isArray: false });
	});
});

describe('convertFormData', () => {
	it('decodes numbers, booleans, arrays and nested paths', () => {
		const data = formData([
			['email', 'a@b.co'],
			['n:age', '30.5abc'],
			['n:empty', ''],
			['b:agree', 'on'],
			['b:other', 'true'],
			['tags[]', 'svelte'],
			['tags[]', 'kit'],
			['address.city', 'Oslo'],
			['items[1].name', 'second'],
			['i:pos.x', '4'],
			['i:pos.y', '7']
		]);
		expect(convertFormData(data)).toEqual({
			email: 'a@b.co',
			age: 30.5,
			empty: undefined,
			agree: true,
			other: false,
			tags: ['svelte', 'kit'],
			address: { city: 'Oslo' },
			items: [undefined, { name: 'second' }],
			pos: { x: 4, y: 7 }
		});
	});

	it('skips an empty file input and keeps a chosen file', () => {
		const file = new File(['hi'], 'hi.txt');
		const result = convertFormData(
			formData([
				['avatar', new File([], '')],
				['doc', file]
			])
		);
		expect(Object.keys(result)).toEqual(['doc']);
		expect(result.doc).toBe(file);
	});

	it.each([
		['__proto__.polluted', 'Invalid key `__proto__`'],
		['constructor.prototype.x', 'Invalid key `constructor`'],
		['g-recaptcha-response', 'Invalid field name `g-recaptcha-response`'],
		['items[x]', 'Invalid field name `items[x]`']
	])('rejects the name %s', (name, message) => {
		expect(() => convertFormData(formData([[name, 'yes']]))).toThrow(message);
		expect(({} as Record<string, unknown>).polluted).toBe(undefined);
	});

	it('rejects a repeated name without []', () => {
		const data = formData([
			['email', 'a'],
			['email', 'b']
		]);
		expect(() => convertFormData(data)).toThrow(FormDataError);
		expect(() => convertFormData(data)).toThrow('`email` has 2 values');
	});

	it('rejects an object path that an array path already took', () => {
		const data = formData([
			['items[0]', 'a'],
			['items.name', 'b']
		]);
		expect(() => convertFormData(data)).toThrow('Invalid array key `name`');
	});

	it('skips names that cannot be fields when not strict', () => {
		const data = formData([
			['email', 'a@b.co'],
			['g-recaptcha-response', 'token'],
			['__proto__.x', 'yes']
		]);
		expect(convertFormData(data, { strict: false })).toEqual({ email: 'a@b.co' });
	});
});

describe('issues', () => {
	it('normalizes path segments and files each issue under its ancestors', () => {
		const city = normalizeIssue({ message: 'Unknown city', path: [{ key: 'address' }, 'city'] });
		const root = normalizeIssue({ message: 'Wrong password' });
		expect(city).toEqual({
			name: 'address.city',
			path: ['address', 'city'],
			message: 'Unknown city'
		});
		expect(root).toEqual({ name: '', path: [], message: 'Wrong password' });

		const flat = flattenIssues([city, root]);
		expect(Object.keys(flat)).toEqual(['$', 'address', 'address.city']);
		expect(flat.$.map((issue) => issue.message)).toEqual(['Unknown city', 'Wrong password']);
		expect(flat.address.map((issue) => issue.message)).toEqual(['Unknown city']);
	});
});

function store(
	input: Record<string, unknown>,
	issues: { message: string; path: (string | number)[] }[] = []
): FieldStore {
	const dirty: Record<string, boolean> = {};
	return {
		get: () => input,
		set: () => {},
		issues: () => flattenIssues(issues.map(normalizeIssue)),
		touched: () => ({ 'address.city': true }),
		dirty: () => dirty
	};
}

type Handle = {
	as(type: string, value?: unknown, checked?: boolean): Record<string, unknown>;
	issues(): unknown;
	allIssues(): unknown;
	value(): unknown;
	touched(): boolean;
};

describe('createFieldProxy', () => {
	it('builds Kit-encoded input props that read the current value', () => {
		const fields = createFieldProxy(
			store({ email: 'a@b.co', age: 30, agree: true, tags: ['kit'], plan: 'pro' }, [
				{ message: 'Invalid email', path: ['email'] }
			])
		) as Record<string, Handle>;

		expect({ ...fields.email.as('email') }).toEqual({
			name: 'email',
			'aria-invalid': 'true',
			type: 'email',
			defaultValue: undefined,
			value: 'a@b.co'
		});
		expect({ ...fields.age.as('number') }).toEqual({
			name: 'n:age',
			'aria-invalid': undefined,
			type: 'number',
			defaultValue: undefined,
			value: '30'
		});
		expect({ ...fields.agree.as('checkbox') }).toEqual({
			name: 'b:agree',
			'aria-invalid': undefined,
			type: 'checkbox',
			defaultChecked: undefined,
			checked: true
		});
		expect({ ...fields.tags.as('checkbox', 'svelte') }).toMatchObject({
			name: 'tags[]',
			value: 'svelte',
			checked: false
		});
		expect({ ...fields.tags.as('checkbox', 'kit') }).toMatchObject({ checked: true });
		expect({ ...fields.plan.as('radio', 'pro') }).toMatchObject({
			name: 'plan',
			type: 'radio',
			value: 'pro',
			checked: true
		});
		expect({ ...fields.count.as('hidden', 3) }).toMatchObject({ name: 'n:count', value: 3 });
		expect({ ...fields.name.as('text', 'Ada') }).toMatchObject({
			name: 'name',
			defaultValue: 'Ada',
			value: 'Ada'
		});
	});

	it('reports own issues, prefix issues and nested touched state', () => {
		const fields = createFieldProxy(
			store({ address: { city: 'Oslo' } }, [
				{ message: 'Unknown city', path: ['address', 'city'] },
				{ message: 'Bad addressee', path: ['addressee'] }
			])
		) as Record<string, Handle> & Handle;

		expect(fields.address.issues()).toBe(undefined);
		expect(fields.address.allIssues()).toEqual([
			{ path: ['address', 'city'], message: 'Unknown city' }
		]);
		expect((fields.address as unknown as Record<string, Handle>).city.issues()).toEqual([
			{ path: ['address', 'city'], message: 'Unknown city' }
		]);
		expect(fields.allIssues()).toHaveLength(2);
		expect(fields.address.touched()).toBe(true);
		expect(fields.addressee.touched()).toBe(false);
		expect(fields.address.value()).toEqual({ city: 'Oslo' });
	});
});
