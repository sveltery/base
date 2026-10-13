// Ported in part from Base UI v1.9.0 packages/react/src/combobox/items/createItems.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The rendering cases live in createItems.svelte.spec.ts.

import { describe, expect, it, vi } from 'vitest';
import { resetLogged } from '@sveltery/utils';
import { defaultItemEquality } from '../internal/listbox/itemEquality.js';
import { createItems, filterItems, findCollectionItem, isItemCollection } from './collection.js';
import { getFilter } from './filter.js';

interface User {
	id: number;
	name: string;
}

const users: User[] = [
	{ id: 1, name: 'Alice' },
	{ id: 2, name: 'Bob' },
	{ id: 3, name: 'Carol' }
];

const getUserId = (user: User) => user.id;
const getUserName = (user: User) => user.name;
const contains = getFilter({ locale: 'en' }).contains;
const filter = (item: unknown, query: string, itemToString?: (item: never) => string) =>
	contains(item, query, itemToString as never);

describe('createItems', () => {
	it('does not call the accessors when creating a flat collection', () => {
		const getValue = vi.fn(getUserId);
		const getLabel = vi.fn(getUserName);

		createItems(users, { getValue, getLabel });

		expect(getValue).not.toHaveBeenCalled();
		expect(getLabel).not.toHaveBeenCalled();
	});

	it('does not call the accessors when creating a grouped collection', () => {
		const getValue = vi.fn(getUserId);
		const getLabel = vi.fn(getUserName);

		createItems([{ value: 'Team', items: users }], { getValue, getLabel });

		expect(getValue).not.toHaveBeenCalled();
		expect(getLabel).not.toHaveBeenCalled();
	});

	it('resolves labels only for the values that need them', () => {
		const getLabel = vi.fn(getUserName);
		const collection = createItems(users, { getValue: getUserId, getLabel });

		expect(collection.label(3, defaultItemEquality)).toBe('Carol');
		expect(getLabel.mock.calls.map(([item]) => item)).toEqual([users[2]]);
	});

	it('projects leaf items of grouped data and keeps the groups as data', () => {
		const getValue = vi.fn(getUserId);
		const teams = [
			{ value: 'Engineering', items: [users[0], users[1]] },
			{ value: 'Design', items: [users[2]] }
		];
		const collection = createItems(teams, { getValue, getLabel: getUserName });

		expect(collection.data).toBe(teams);
		expect(collection.hasValue(2, defaultItemEquality)).toBe(true);
		expect(new Set(getValue.mock.calls.map(([item]) => item.id))).toEqual(new Set([1, 2, 3]));
	});

	it('labels a value outside the collection with the fallback, else as itself', () => {
		const collection = createItems(users, { getValue: getUserId, getLabel: getUserName });

		expect(collection.label(9, defaultItemEquality)).toBe('9');
		expect(collection.label(9, defaultItemEquality, (value) => `User ${value}`)).toBe('User 9');
		expect(collection.hasValue(9, defaultItemEquality)).toBe(false);
	});

	it('resolves a value that only a custom comparer matches', () => {
		const collection = createItems(users, { getValue: getUserId, getLabel: getUserName });
		const looseEquality = (a: number, b: number) => String(a) === String(b);

		expect(collection.label('2' as unknown as number, looseEquality)).toBe('Bob');
	});

	it('keeps the first item of a duplicated value and reports it in development', () => {
		resetLogged();
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		try {
			const collection = createItems(
				[
					{ id: 1, name: 'First' },
					{ id: 1, name: 'Second' }
				],
				{ getValue: getUserId, getLabel: getUserName }
			);
			expect(collection.label(1, defaultItemEquality)).toBe('First');
			expect(errorSpy).toHaveBeenCalledTimes(1);
			expect(String(errorSpy.mock.calls[0][0])).toContain('derived the value 1');
		} finally {
			errorSpy.mockRestore();
		}
	});

	it('passes undefined data through as the absence of items', () => {
		const collection = createItems(undefined as User[] | undefined, {
			getValue: getUserId,
			getLabel: getUserName
		});

		expect(collection.data).toBe(undefined);
		expect(collection.hasValue(1, defaultItemEquality)).toBe(false);
	});

	it('is told apart from plain item arrays and objects', () => {
		expect(isItemCollection(createItems(users, { getValue: getUserId, getLabel: getUserName }))).toBe(
			true
		);
		expect(isItemCollection(users)).toBe(false);
		expect(isItemCollection({ a: 'A' })).toBe(false);
	});
});

describe('findCollectionItem', () => {
	it('finds by key, and by comparer only when one is given', () => {
		const map = new Map<unknown, string>([
			[1, 'one'],
			[2, 'two']
		]);
		const looseEquality = (a: unknown, b: unknown) => String(a) === String(b);

		expect(findCollectionItem(map, 2, defaultItemEquality)).toBe('two');
		expect(findCollectionItem(map, '2', defaultItemEquality)).toBe(undefined);
		expect(findCollectionItem(map, '2', looseEquality)).toBe('two');
	});
});

describe('filterItems', () => {
	const fruits = ['Apple', 'Banana', 'Cherry', 'Apricot'];

	it('keeps every item for an empty query, up to the limit', () => {
		expect(filterItems(fruits, { query: '', filter, limit: -1 })).toBe(fruits);
		expect(filterItems(fruits, { query: '', filter, limit: 2 })).toEqual(['Apple', 'Banana']);
	});

	it('keeps matching items and stops at the limit', () => {
		expect(filterItems(fruits, { query: 'ap', filter, limit: -1 })).toEqual(['Apple', 'Apricot']);
		expect(filterItems(fruits, { query: 'a', filter, limit: 2 })).toEqual(['Apple', 'Banana']);
	});

	it('filters objects through itemToString', () => {
		expect(
			filterItems(users, {
				query: 'car',
				filter,
				limit: -1,
				itemToString: getUserName as (item: never) => string
			})
		).toEqual([users[2]]);
	});

	it('drops groups without a match and applies the limit across groups', () => {
		const groups = [
			{ value: 'Fruits', items: ['Apple', 'Banana'] },
			{ value: 'Vegetables', items: ['Carrot', 'Asparagus'] },
			{ value: 'Grains', items: ['Rice'] }
		];

		expect(filterItems(groups, { query: 'a', filter, limit: -1 })).toEqual([
			{ value: 'Fruits', items: ['Apple', 'Banana'] },
			{ value: 'Vegetables', items: ['Carrot', 'Asparagus'] }
		]);
		expect(filterItems(groups, { query: 'a', filter, limit: 3 })).toEqual([
			{ value: 'Fruits', items: ['Apple', 'Banana'] },
			{ value: 'Vegetables', items: ['Carrot'] }
		]);
		expect(filterItems(groups, { query: '', filter, limit: 1 })).toEqual([
			{ value: 'Fruits', items: ['Apple'] }
		]);
	});
});
