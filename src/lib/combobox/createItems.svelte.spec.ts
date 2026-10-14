// Assertions follow Base UI v1.9.0 packages/react/src/combobox/items/createItems.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The rendering cases. The lazy normalization cases without a render live in collection.spec.ts,
// and the server-rendered label case in ssr.spec.ts. Not ported: the two `virtualized` cases,
// since `virtualized` is not ported.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Combobox } from '#lib';
import { renderBound } from '../../tests/bound-render.svelte.js';
import ComboboxItemsHarness from '../../tests/ComboboxItemsHarness.svelte';

interface User {
	id: number;
	name: string;
}

const users: User[] = [
	{ id: 1, name: 'Alice' },
	{ id: 2, name: 'Bob' },
	{ id: 3, name: 'Carol' }
];

interface ApiUser {
	id: string;
	name: string;
	role: string;
	email: string;
}

const apiUsers: ApiUser[] = [
	{ id: 'user-1', name: 'Alice', role: 'Engineer', email: 'alice@example.com' },
	{ id: 'user-2', name: 'Bob', role: 'Product manager', email: 'bob@example.com' },
	{ id: 'user-3', name: 'Carol', role: 'Designer', email: 'carol@example.com' }
];

interface Person {
	id: string;
	name: string;
}

const getUserId = (user: User) => user.id;
const getUserName = (user: User) => user.name;
const userItems = Combobox.createItems(users, { getValue: getUserId, getLabel: getUserName });
const apiCollection = (data: ApiUser[] | undefined) =>
	Combobox.createItems(data, { getValue: (user) => user.id, getLabel: (user) => user.name });
// Created once and reused by more than one root, the way a module-scope collection is.
const sharedPersonItems = Combobox.createItems([] as Person[], {
	getValue: (person: Person) => person.id,
	getLabel: (person: Person) => person.name
});

const input = () => page.getByTestId('input');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const optionCount = () => document.querySelectorAll('[role="option"]').length;
const absent = (name: string) =>
	[...document.querySelectorAll('[role="option"]')].every(
		(element) => element.textContent?.trim() !== name
	);

describe('Combobox.createItems', () => {
	describe('collection', () => {
		it('rejects an items object that is not a collection', async () => {
			const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			try {
				expect(() => render(ComboboxItemsHarness, { collection: { a: 'A' } })).toThrow(
					/not a collection/
				);
			} finally {
				errorSpy.mockRestore();
			}
		});

		it('treats undefined data as the absence of items rather than as an empty list', async () => {
			const pending = Combobox.createItems(undefined as User[] | undefined, {
				getValue: getUserId,
				getLabel: getUserName
			});
			render(ComboboxItemsHarness, {
				collection: pending,
				open: true,
				root: { filteredItems: users, defaultValue: 2 }
			});

			await expect.poll(optionCount).toBe(users.length);
		});
	});

	describe('integration', () => {
		it('uses the derived value for selection and resolves the label while closed', async () => {
			const onValueChange = vi.fn();
			render(ComboboxItemsHarness, { collection: userItems, open: true, root: { onValueChange } });

			await userEvent.click(option('Bob'));

			expect(onValueChange.mock.lastCall?.[0]).toBe(2);
			await expect.element(input()).toHaveValue('Bob');
		});

		it('supports rich API-loaded items with primitive ID values end to end', async () => {
			const saveAssignee = vi.fn();
			const props = renderBound(ComboboxItemsHarness, {
				collection: apiCollection(undefined),
				value: null as string | null,
				open: true,
				list: 'popup',
				itemText: (user: ApiUser) => user.name,
				detail: (user: ApiUser) => [user.role, user.email],
				root: { onValueChange: (id: string | null) => saveAssignee(id) }
			});
			expect(optionCount()).toBe(0);

			props.collection = apiCollection(apiUsers);
			props.value = 'user-2';

			const bob = page.getByRole('option', { name: /Bob/ });
			await expect.element(bob).toBeInTheDocument();
			await expect.element(input()).toHaveValue('Bob');
			await expect.element(bob).toHaveAttribute('aria-selected', 'true');
			await expect.element(bob).toHaveTextContent('Product manager');
			await expect.element(bob).toHaveTextContent('bob@example.com');

			await userEvent.clear(input());
			await userEvent.type(input(), 'car');

			const carol = page.getByRole('option', { name: /Carol/ });
			await expect.element(carol).toHaveTextContent('Designer');
			await expect.element(carol).toHaveTextContent('carol@example.com');
			await expect.element(page.getByRole('option', { name: /Bob/ })).not.toBeInTheDocument();

			await userEvent.click(carol);

			expect(saveAssignee).toHaveBeenCalledWith('user-3');
			await expect.element(input()).toHaveValue('Carol');
			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();

			await userEvent.click(input());

			await expect
				.element(page.getByRole('option', { name: /Carol/ }))
				.toHaveAttribute('aria-selected', 'true');
		});

		it('keeps separately fetched selected metadata outside paginated search results', async () => {
			interface Employee {
				id: string;
				name: string;
				department: string;
			}
			const selectedEmployee: Employee = {
				id: 'employee-100000',
				name: 'Grace Hopper',
				department: 'Platform'
			};
			const firstPage: Employee[] = [
				{ id: 'employee-1', name: 'Ada Lovelace', department: 'Research' },
				{ id: 'employee-2', name: 'Alan Turing', department: 'Security' }
			];
			// A search endpoint can return a different object for the same selected ID.
			const pageContainingSelection: Employee[] = [
				{ id: 'employee-100000', name: 'Grace Hopper', department: 'Platform' },
				{ id: 'employee-3', name: 'Margaret Hamilton', department: 'Flight software' }
			];
			const collectionFor = (results: Employee[]) =>
				Combobox.createItems(
					[selectedEmployee, ...results.filter((employee) => employee.id !== selectedEmployee.id)],
					{ getValue: (employee) => employee.id, getLabel: (employee) => employee.name }
				);
			const onValueChange = vi.fn();
			const props = renderBound(ComboboxItemsHarness, {
				collection: collectionFor(firstPage),
				value: selectedEmployee.id,
				open: true,
				valueText: true,
				detail: (employee: Employee) => [employee.department],
				root: { filteredItems: firstPage, onValueChange }
			});
			await expect.element(input()).toHaveValue('Grace Hopper');

			await userEvent.click(input());
			await userEvent.keyboard('{Control>}a{/Control}a');

			expect(absent('Grace HopperPlatform')).toBe(true);
			await expect.poll(optionCount).toBe(2);
			onValueChange.mockClear();

			props.collection = collectionFor(pageContainingSelection);
			props.root = { filteredItems: pageContainingSelection, onValueChange };

			const visibleSelection = page.getByRole('option', { name: /Grace Hopper/ });
			await expect.element(visibleSelection).toHaveAttribute('aria-selected', 'true');
			expect(visibleSelection.elements()).toHaveLength(1);

			props.collection = collectionFor(firstPage);
			props.root = { filteredItems: firstPage, onValueChange };

			await expect
				.element(page.getByRole('option', { name: /Grace Hopper/ }))
				.not.toBeInTheDocument();
			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(page.getByTestId('value')).toHaveTextContent('Grace Hopper');
		});

		it('falls back to the raw selected ID when API results are cleared', async () => {
			const props: { collection: unknown } = renderBound(ComboboxItemsHarness, {
				collection: apiCollection(apiUsers),
				value: null as string | null,
				open: true,
				list: 'popup',
				itemText: (user: ApiUser) => user.name,
				root: {
					onValueChange: () => {
						props.collection = apiCollection(undefined);
					}
				}
			});

			await userEvent.click(option('Carol'));

			await expect.element(input()).toHaveValue('user-3');
			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		});

		it('keeps nullish entries out of the accessors and out of filtered results', async () => {
			// A hole in otherwise well-typed data, which is how it reaches a collection in practice.
			const sourceItems = [null, users[0]] as unknown as User[];
			const getValue = vi.fn(getUserId);
			render(ComboboxItemsHarness, {
				collection: Combobox.createItems(sourceItems, { getValue, getLabel: getUserName }),
				open: true,
				root: { filteredItems: [users[0]], defaultValue: 1 }
			});
			await expect.element(input()).toHaveValue('Alice');

			await userEvent.type(input(), 'a');

			await expect.poll(optionCount).toBe(1);
			await expect.element(option('Alice')).toBeInTheDocument();
			expect(getValue.mock.calls.every(([item]) => item != null)).toBe(true);
		});

		it('treats a non-array items field as item data rather than as a group', async () => {
			const onValueChange = vi.fn();
			// Only an actual `items` array marks a group; unrelated or optional fields stay item data.
			const records = [
				{ id: 1, name: 'Alice', items: undefined },
				{ id: 2, name: 'Bob', items: 3 }
			];
			render(ComboboxItemsHarness, {
				collection: Combobox.createItems(records, {
					getValue: (record) => record.id,
					getLabel: (record) => record.name
				}),
				open: true,
				root: { onValueChange }
			});
			await expect.poll(optionCount).toBe(2);

			await userEvent.click(option('Bob'));

			expect(onValueChange.mock.lastCall?.[0]).toBe(2);
			await expect.element(input()).toHaveValue('Bob');
		});

		it('treats an array-valued items field as a group when its declared type is unknown', async () => {
			const records = [{ id: 'people', items: [users[0]] as unknown }];
			render(ComboboxItemsHarness, {
				// @ts-expect-error A broad `items` field is rejected because its runtime value may be an array.
				collection: Combobox.createItems(records, { getValue: getUserId, getLabel: getUserName }),
				list: 'none',
				root: { defaultValue: 1 }
			});

			await expect.element(input()).toHaveValue('Alice');
		});

		it('renders a sentinel item for the empty selection like any other item', async () => {
			const withSentinel = [{ id: 'none', name: 'None' }, ...apiUsers];
			render(ComboboxItemsHarness, {
				collection: Combobox.createItems(withSentinel, {
					getValue: (item) => item.id,
					getLabel: (item) => item.name
				}),
				list: 'none',
				root: { defaultValue: 'none' }
			});

			await expect.element(input()).toHaveValue('None');
		});

		it('resolves the label of an initially selected value', async () => {
			render(ComboboxItemsHarness, { collection: userItems, root: { defaultValue: 3 } });

			await expect.element(input()).toHaveValue('Carol');
		});

		it('renders an empty list while the data is undefined and fills in once it loads', async () => {
			const collectionOf = (data: User[] | undefined) =>
				Combobox.createItems(data, { getValue: getUserId, getLabel: getUserName });
			const props = renderBound(ComboboxItemsHarness, {
				collection: collectionOf(undefined),
				open: true
			});
			await expect.element(input()).toBeInTheDocument();
			expect(optionCount()).toBe(0);

			props.collection = collectionOf(users);

			await expect.poll(optionCount).toBe(3);
		});

		it('resolves and degrades the selected label as the data loads and shrinks', async () => {
			const collectionOf = (data: User[] | undefined) =>
				Combobox.createItems(data, { getValue: getUserId, getLabel: getUserName });
			const props = renderBound(ComboboxItemsHarness, {
				collection: collectionOf(undefined),
				list: 'none',
				root: { defaultValue: 3 }
			});
			await expect.element(input()).toHaveValue('3');

			props.collection = collectionOf(users);
			await expect.element(input()).toHaveValue('Carol');

			props.collection = collectionOf([users[0]]);
			await expect.element(input()).toHaveValue('3');
		});

		it('highlights an initially selected derived value when opened', async () => {
			render(ComboboxItemsHarness, {
				collection: userItems,
				list: 'popup',
				root: { defaultValue: 3 }
			});

			await userEvent.click(input());

			await expect.element(option('Carol')).toHaveAttribute('data-highlighted');
		});

		it('highlights an initially selected derived value on mount when inline', async () => {
			render(ComboboxItemsHarness, {
				collection: userItems,
				open: true,
				root: { inline: true, defaultValue: 3 }
			});

			await expect.element(option('Carol')).toHaveAttribute('data-highlighted');
			await expect
				.element(input())
				.toHaveAttribute('aria-activedescendant', option('Carol').element().id);
		});

		it('renders the selected label via Combobox.Value', async () => {
			render(ComboboxItemsHarness, {
				collection: userItems,
				list: 'none',
				valueText: true,
				root: { defaultValue: 1 }
			});

			await expect.element(page.getByTestId('value')).toHaveTextContent('Alice');
		});

		it('filters items by their derived labels', async () => {
			render(ComboboxItemsHarness, { collection: userItems, open: true });

			await userEvent.type(input(), 'bo');

			await expect.element(option('Bob')).toBeInTheDocument();
			expect(absent('Alice')).toBe(true);
		});

		it('keeps filtering on the collection label when itemToStringLabel is provided', async () => {
			render(ComboboxItemsHarness, {
				collection: userItems,
				open: true,
				root: { itemToStringLabel: (id: number) => `User ${id}` }
			});

			await userEvent.type(input(), 'bo');

			await expect.element(option('Bob')).toBeInTheDocument();
			expect(absent('Alice')).toBe(true);
		});

		it('falls back to itemToStringLabel only for values the collection cannot resolve', async () => {
			// The prop covers what the data is missing; items the collection owns keep their
			// `getLabel` result, so a cache only has to know about the values that left the data.
			const labelCache = new Map([[99, 'Archived user']]);
			const props = renderBound(ComboboxItemsHarness, {
				collection: userItems,
				value: 2,
				list: 'none',
				valueText: true,
				root: { itemToStringLabel: (id: number) => labelCache.get(id) ?? `User ${id}` }
			});
			await expect.element(input()).toHaveValue('Bob');
			await expect.element(page.getByTestId('value')).toHaveTextContent('Bob');

			props.value = 99;

			await expect.element(input()).toHaveValue('Archived user');
			await expect.element(page.getByTestId('value')).toHaveTextContent('Archived user');
		});

		it('uses the root locale for filtering', async () => {
			const cities = ['Isparta', 'İzmir'];
			render(ComboboxItemsHarness, {
				collection: Combobox.createItems(cities, {
					getValue: (city) => city,
					getLabel: (city) => city
				}),
				itemValue: (city: string) => city,
				itemText: (city: string) => city,
				open: true,
				root: { locale: 'tr' }
			});

			await userEvent.type(input(), 'i');

			await expect.element(option('İzmir')).toBeInTheDocument();
			expect(absent('Isparta')).toBe(true);
		});

		it('updates a selected label when a stable accessor returns a new result', async () => {
			let language: 'en' | 'es' = 'en';
			const items = Combobox.createItems(users, {
				getValue: getUserId,
				getLabel: (user) => (language === 'es' && user.id === 1 ? 'Alicia' : user.name)
			});
			const props = renderBound(ComboboxItemsHarness, {
				collection: items,
				list: 'popup',
				valueText: true,
				root: { defaultValue: 1, locale: 'en' }
			});
			await expect.element(input()).toHaveValue('Alice');
			await expect.element(page.getByTestId('value')).toHaveTextContent('Alice');

			language = 'es';
			props.root = { defaultValue: 1, locale: 'es' };

			await expect.element(input()).toHaveValue('Alicia');
			await expect.element(page.getByTestId('value')).toHaveTextContent('Alicia');

			await userEvent.click(input());

			await expect.poll(optionCount).toBe(users.length);
		});

		it('resolves a value that only a custom comparer matches from the collection', async () => {
			render(ComboboxItemsHarness, {
				collection: Combobox.createItems(users, {
					getValue: (user) => user.name.toLowerCase(),
					getLabel: getUserName
				}),
				itemValue: (user: User) => user.name.toLowerCase(),
				open: true,
				root: {
					filteredItems: [users[0]],
					defaultValue: 'BOB',
					isItemEqualToValue: (item: string, value: string) =>
						item.toLowerCase() === value.toLowerCase()
				}
			});

			await expect.poll(optionCount).toBe(users.length);
			await expect.element(option('Bob')).toHaveAttribute('aria-selected', 'true');
			await expect.element(input()).toHaveValue('Bob');
		});

		it('passes source items to a custom root filter', async () => {
			const filter = vi.fn((user: User) => user.id === 2);
			render(ComboboxItemsHarness, { collection: userItems, open: true, root: { filter } });

			await userEvent.type(input(), 'x');

			await expect.element(option('Bob')).toBeInTheDocument();
			expect(absent('Alice')).toBe(true);
			expect(filter.mock.calls.every(([item]) => users.includes(item))).toBe(true);
			expect(new Set(filter.mock.calls.map(([item]) => item.id))).toEqual(new Set([1, 2, 3]));
		});

		it('labels a derived selection when useFilter receives its value', async () => {
			render(ComboboxItemsHarness, {
				collection: Combobox.createItems(users, {
					getValue: getUserId,
					getLabel: (user) => user.name.trim()
				}),
				open: true,
				root: { filter: Combobox.useFilter({ value: 2 }).contains, defaultValue: 2 }
			});

			await userEvent.clear(input());
			await userEvent.type(input(), 'ali');

			await expect.element(option('Alice')).toBeInTheDocument();
			expect(absent('Bob')).toBe(true);
		});

		it('lets a custom root filter match source fields that are neither the value nor the label', async () => {
			const contacts = [
				{ id: 1, name: 'Alice', email: 'alice@example.com' },
				{ id: 2, name: 'Bob', email: 'bob@other.com' }
			];
			render(ComboboxItemsHarness, {
				collection: Combobox.createItems(contacts, {
					getValue: (contact) => contact.id,
					getLabel: (contact) => contact.name
				}),
				open: true,
				root: {
					filter: (contact: (typeof contacts)[number], query: string) =>
						contact.email.includes(query)
				}
			});

			await userEvent.type(input(), 'other.com');

			await expect.element(option('Bob')).toBeInTheDocument();
			expect(absent('Alice')).toBe(true);
		});

		it('labels a selected value that is not in the collection as itself', async () => {
			render(ComboboxItemsHarness, {
				collection: Combobox.createItems(users, {
					getValue: getUserId,
					getLabel: (user) => user.name.toUpperCase()
				}),
				list: 'none',
				root: { defaultValue: 99 }
			});

			await expect.element(input()).toHaveValue('99');
		});

		it('uses the default label fallback outside the collection', async () => {
			render(ComboboxItemsHarness, {
				collection: Combobox.createItems<User, number | string>(users, {
					getValue: getUserId,
					getLabel: getUserName
				}),
				list: 'none',
				root: { defaultValue: 'New tag' }
			});

			await expect.element(input()).toHaveValue('New tag');
		});

		it('uses derived labels for closed trigger typeahead', async () => {
			render(ComboboxItemsHarness, {
				collection: Combobox.createItems(users, {
					getValue: getUserId,
					getLabel: (user) => (user.id === 2 ? 'Zebra' : 'Yak')
				}),
				list: 'popup',
				noInput: true,
				trigger: true
			});
			const trigger = page.getByTestId('trigger');

			(trigger.element() as HTMLElement).focus();
			await userEvent.keyboard('z');

			await expect.element(trigger).toHaveTextContent('Zebra');
			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		});

		it('does not stringify null when no value is selected', async () => {
			render(ComboboxItemsHarness, {
				collection: userItems,
				list: 'none',
				noInput: true,
				valueText: true,
				root: { itemToStringLabel: (id: number) => `User ${id}` }
			});

			expect(page.getByTestId('value').element().textContent?.trim()).toBe('');
		});

		it('does not treat source value fields as derived selections', async () => {
			const sourceItems = [{ id: 1, value: null, label: 'No discount' }];
			render(ComboboxItemsHarness, {
				collection: Combobox.createItems(sourceItems, {
					getValue: (item) => item.id,
					getLabel: (item) => item.label
				}),
				list: 'none',
				noInput: true,
				valueText: true,
				placeholder: 'Choose an option'
			});

			await expect.element(page.getByTestId('placeholder')).toHaveTextContent('Choose an option');
			expect(page.getByTestId('value').element().textContent?.trim()).toBe('');
		});

		it('toggles derived values in multiple mode', async () => {
			const onValueChange = vi.fn();
			render(ComboboxItemsHarness, {
				collection: userItems,
				open: true,
				root: { multiple: true, onValueChange }
			});

			await userEvent.click(option('Bob'));
			expect(onValueChange.mock.lastCall?.[0]).toEqual([2]);
			await expect.element(option('Bob')).toHaveAttribute('aria-selected', 'true');

			await userEvent.click(option('Carol'));
			expect(onValueChange.mock.lastCall?.[0]).toEqual([2, 3]);

			await userEvent.click(option('Bob'));
			expect(onValueChange.mock.lastCall?.[0]).toEqual([3]);
			await expect.element(option('Bob')).toHaveAttribute('aria-selected', 'false');
		});

		it('serializes derived values in multiple mode', async () => {
			render(ComboboxItemsHarness, {
				collection: userItems,
				list: 'none',
				noInput: true,
				root: { multiple: true, name: 'users', defaultValue: [1, 2] }
			});

			await expect
				.poll(() => {
					const select = document.querySelector<HTMLSelectElement>('select[name="users"]');
					return select ? [...select.selectedOptions].map((entry) => entry.value) : [];
				})
				.toEqual(['1', '2']);
		});

		it('serializes a derived value in single mode', async () => {
			render(ComboboxItemsHarness, {
				collection: userItems,
				list: 'none',
				noInput: true,
				root: { name: 'user', defaultValue: 2 }
			});

			expect(document.querySelector<HTMLInputElement>('input[name="user"]')?.value).toBe('2');
		});

		it('serializes the derived value with itemToStringValue', async () => {
			render(ComboboxItemsHarness, {
				collection: userItems,
				list: 'none',
				noInput: true,
				root: { name: 'user', defaultValue: 2, itemToStringValue: (id: number) => `user-${id}` }
			});

			expect(document.querySelector<HTMLInputElement>('input[name="user"]')?.value).toBe('user-2');
		});

		it.each([
			['the serialized derived value', '2'],
			['a derived label', 'Bob']
		])('matches browser autofill against %s', async (_, autofilledValue) => {
			const onValueChange = vi.fn();
			render(ComboboxItemsHarness, {
				collection: userItems,
				list: 'none',
				root: { name: 'user', onValueChange }
			});
			const hidden = document.querySelector<HTMLInputElement>('input[name="user"]')!;

			hidden.value = autofilledValue;
			hidden.dispatchEvent(new Event('input', { bubbles: true }));

			await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe(2);
			await expect.element(input()).toHaveValue('Bob');
		});

		it('passes the derived value to the Combobox.Value children', async () => {
			const renderValue = vi.fn((itemValue: unknown) => String(itemValue));
			render(ComboboxItemsHarness, {
				collection: userItems,
				list: 'none',
				noInput: true,
				valueText: true,
				renderValue,
				root: { defaultValue: 2 }
			});

			await expect.element(page.getByTestId('value')).toHaveTextContent('2');
			expect(renderValue).toHaveBeenCalledWith(2);
		});

		it('renders every selected label via Combobox.Value in multiple mode', async () => {
			render(ComboboxItemsHarness, {
				collection: userItems,
				list: 'none',
				noInput: true,
				valueText: true,
				root: { multiple: true, defaultValue: [1, 2] }
			});

			await expect.element(page.getByTestId('value')).toHaveTextContent('Alice, Bob');
		});

		it('labels a selection that arrives together with its externally filtered item', async () => {
			// One response carries both the result window and the persisted selection, so the label
			// is resolved in the same update that first projects the item it comes from.
			const props = renderBound(ComboboxItemsHarness, {
				collection: apiCollection([]),
				value: null as string | null,
				list: 'none',
				valueText: true,
				root: { filteredItems: [] as ApiUser[] }
			});

			props.root = { filteredItems: [apiUsers[0]] };
			props.value = 'user-1';

			await expect.element(input()).toHaveValue('Alice');
			await expect.element(page.getByTestId('value')).toHaveTextContent('Alice');
		});

		it('re-labels an unchanged selection when its item arrives in a later external window', async () => {
			const props = renderBound(ComboboxItemsHarness, {
				collection: apiCollection([]),
				value: 'user-1',
				list: 'none',
				root: { filteredItems: [] as ApiUser[] }
			});
			// Nothing can resolve the label yet, so it degrades to the raw value.
			await expect.element(input()).toHaveValue('user-1');

			props.root = { filteredItems: [apiUsers[0]] };

			await expect.element(input()).toHaveValue('Alice');
		});

		it('labels a defaultValue whose item only exists in the externally filtered window', async () => {
			render(ComboboxItemsHarness, {
				collection: apiCollection([]),
				list: 'none',
				root: { filteredItems: apiUsers, defaultValue: 'user-1' }
			});

			await expect.element(input()).toHaveValue('Alice');
		});

		it('uses the custom comparer to label a value from the externally filtered window', async () => {
			render(ComboboxItemsHarness, {
				collection: Combobox.createItems([users[0]], {
					getValue: (user) => user.name.toLowerCase(),
					getLabel: getUserName
				}),
				itemValue: (user: User) => user.name.toLowerCase(),
				open: true,
				root: {
					filteredItems: [users[1]],
					defaultValue: 'BOB',
					isItemEqualToValue: (item: string, value: string) =>
						item.toLowerCase() === value.toLowerCase()
				}
			});

			await expect.element(option('Bob')).toHaveAttribute('aria-selected', 'true');
			await expect.element(input()).toHaveValue('Bob');
		});

		it('keeps an external result visible when the selected item is absent from known data', async () => {
			render(ComboboxItemsHarness, {
				collection: apiCollection([apiUsers[1]]),
				itemText: (user: ApiUser) => user.name,
				open: true,
				root: { filteredItems: [apiUsers[0]], defaultValue: 'user-1' }
			});

			await expect.element(input()).toHaveValue('Alice');
			await expect.element(option('Alice')).toBeInTheDocument();
			expect(absent('Bob')).toBe(true);
		});

		it('projects externally filtered source items into the derived value domain', async () => {
			const onValueChange = vi.fn();
			render(ComboboxItemsHarness, {
				collection: userItems,
				open: true,
				root: { filteredItems: [users[2]], onValueChange }
			});
			await expect.poll(optionCount).toBe(1);

			await userEvent.click(option('Carol'));

			expect(onValueChange.mock.lastCall?.[0]).toBe(3);
		});

		it('degrades the label of an externally filtered item after its window is gone', async () => {
			const externalUser = { id: 99, name: 'External user' };
			const props = renderBound(ComboboxItemsHarness, {
				collection: Combobox.createItems(users.slice(0, 1), {
					getValue: getUserId,
					getLabel: getUserName
				}),
				open: true,
				root: { filteredItems: [externalUser] as User[] }
			});

			await userEvent.click(option('External user'));
			await expect.element(input()).toHaveValue('External user');

			// Nothing from a past window is remembered: keep the item in the data or supply
			// `itemToStringLabel` to keep the label.
			props.root = { filteredItems: [] };

			await expect.element(input()).toHaveValue('99');
		});

		it('relabels a borrowed value when a later window carries a fresher item', async () => {
			const props = renderBound(ComboboxItemsHarness, {
				collection: Combobox.createItems(users.slice(0, 1), {
					getValue: getUserId,
					getLabel: getUserName
				}),
				value: 99,
				list: 'none',
				root: { filteredItems: [{ id: 99, name: 'Ann' }] }
			});
			await expect.element(input()).toHaveValue('Ann');

			// The same record comes back renamed: the label must follow the newer item, not the
			// first one the collection happened to borrow.
			props.root = { filteredItems: [{ id: 99, name: 'Anna' }] };

			await expect.element(input()).toHaveValue('Anna');
		});

		it('resolves each root against its own external window when the collection is shared', async () => {
			const props = renderBound(ComboboxItemsHarness, {
				collection: sharedPersonItems,
				value: 'user-1',
				list: 'none',
				root: { filteredItems: [{ id: 'user-1', name: 'Alice' }] as Person[] },
				second: { filteredItems: [{ id: 'user-1', name: 'Alicia' }], value: 'user-1' }
			});
			const inputB = page.getByTestId('input-b');
			await expect.element(input()).toHaveValue('Alice');
			await expect.element(inputB).toHaveValue('Alicia');

			// Window items never touch the shared collection: with its own window gone, the first
			// root degrades to the raw value rather than picking up the sibling's label.
			props.root = { filteredItems: [] };

			await expect.element(input()).toHaveValue('user-1');
			await expect.element(inputB).toHaveValue('Alicia');
		});

		it('labels multiple selected values from the current external window', async () => {
			const props = renderBound(ComboboxItemsHarness, {
				collection: sharedPersonItems,
				value: ['user-1', 'user-2'],
				list: 'none',
				valueText: true,
				root: {
					multiple: true,
					filteredItems: [
						{ id: 'user-1', name: 'Alice' },
						{ id: 'user-2', name: 'Bob' }
					] as Person[]
				}
			});
			await expect.element(page.getByTestId('value')).toHaveTextContent('Alice, Bob');

			// Each selected value degrades independently when its item leaves the window.
			props.root = { multiple: true, filteredItems: [{ id: 'user-2', name: 'Bob' }] };

			await expect.element(page.getByTestId('value')).toHaveTextContent('user-1, Bob');
		});

		it('opens a reordered external list at the selected value in rendered-list coordinates', async () => {
			const onItemHighlighted = vi.fn();
			render(ComboboxItemsHarness, {
				collection: userItems,
				list: 'popup',
				root: {
					filteredItems: [users[2], users[0]],
					multiple: true,
					defaultValue: [1],
					onItemHighlighted
				}
			});

			await userEvent.click(input());

			await expect.element(option('Alice')).toHaveAttribute('data-highlighted');
			await expect.element(option('Carol')).not.toHaveAttribute('data-highlighted');
			expect(onItemHighlighted.mock.lastCall?.[0]).toBe(1);
		});

		it.each([
			{ derivedValue: 0, label: 'Zero' },
			{ derivedValue: '', label: 'Empty string' },
			{ derivedValue: false, label: 'False' },
			{ derivedValue: 10n, label: 'Bigint' }
		] as const)('resolves $label as a primitive selection', async ({ derivedValue, label }) => {
			const sourceItems = [{ value: derivedValue, label }];
			render(ComboboxItemsHarness, {
				collection: Combobox.createItems(sourceItems, {
					getValue: (item) => item.value,
					getLabel: (item) => item.label
				}),
				itemValue: (item: (typeof sourceItems)[number]) => item.value,
				itemText: (item: (typeof sourceItems)[number]) => item.label,
				open: true,
				valueText: true,
				root: { defaultValue: derivedValue, name: 'choice' }
			});

			await expect.element(input()).toHaveValue(label);
			await expect.element(page.getByTestId('value')).toHaveTextContent(label);
			await expect.element(option(label)).toHaveAttribute('aria-selected', 'true');
			expect(document.querySelector<HTMLInputElement>('input[name="choice"]')?.value).toBe(
				String(derivedValue)
			);
		});

		it('resolves a duplicated derived value to the same label regardless of lookup order', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const duplicated = [
				{ id: 1, name: 'First' },
				{ id: 2, name: 'Bob' },
				{ id: 1, name: 'Clone' },
				{ id: 2, name: 'Copy' }
			];
			try {
				// Resolving an absent value first exercises the fallback path, which must not change
				// what the duplicated value resolves to: the first occurrence always wins.
				const props = renderBound(ComboboxItemsHarness, {
					collection: Combobox.createItems(duplicated, {
						getValue: getUserId,
						getLabel: getUserName
					}),
					value: 99,
					list: 'none'
				});
				props.value = 1;

				await expect.element(input()).toHaveValue('First');
				const messages = consoleErrorSpy.mock.calls.map(([message]) => String(message));
				expect(
					messages.some((message) =>
						message.includes('Two items passed to createItems() derived the value 1')
					)
				).toBe(true);
				expect(
					messages.some((message) =>
						message.includes('Two items passed to createItems() derived the value 2')
					)
				).toBe(true);
			} finally {
				consoleErrorSpy.mockRestore();
			}
		});

		it('selects the derived value with the keyboard', async () => {
			const onValueChange = vi.fn();
			render(ComboboxItemsHarness, {
				collection: userItems,
				list: 'popup',
				root: { onValueChange }
			});

			await userEvent.click(input());
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			expect(onValueChange.mock.lastCall?.[0]).toBe(1);
		});

		it('uses explicit item values in the derived value domain', async () => {
			const onValueChange = vi.fn();
			render(ComboboxItemsHarness, {
				collection: userItems,
				explicitItems: users,
				open: true,
				root: { onValueChange }
			});

			await userEvent.click(option('Bob'));

			expect(onValueChange.mock.lastCall?.[0]).toBe(2);
		});

		it('stops filtering when the limit is reached', async () => {
			const manyUsers = Array.from({ length: 100 }, (_, id) => ({ id, name: `Alice ${id}` }));
			const filter = vi.fn((user: User) => user.id >= 0);
			render(ComboboxItemsHarness, {
				collection: Combobox.createItems(manyUsers, {
					getValue: getUserId,
					getLabel: getUserName
				}),
				open: true,
				root: { filter, limit: 2 }
			});
			filter.mockClear();

			await userEvent.type(input(), 'a');

			await expect.poll(optionCount).toBe(2);
			expect(new Set(filter.mock.calls.map(([item]) => item.id))).toEqual(new Set([0, 1]));
		});
	});

	describe('lazy normalization', () => {
		it('only projects the leaf items of the data', async () => {
			const getValue = vi.fn(getUserId);
			const collection = Combobox.createItems(users, { getValue, getLabel: getUserName });
			render(ComboboxItemsHarness, { collection, open: true, root: { defaultValue: 3 } });

			await expect.element(input()).toHaveValue('Carol');
			expect(new Set(getValue.mock.calls.map(([item]) => item))).toEqual(new Set(users));

			await userEvent.clear(input());
			await userEvent.type(input(), 'car');

			await expect.element(option('Carol')).toBeInTheDocument();
			expect(absent('Alice')).toBe(true);
			expect(new Set(getValue.mock.calls.map(([item]) => item))).toEqual(new Set(users));
		});

		it('resolves labels only for the values that need them', async () => {
			const getLabel = vi.fn(getUserName);
			const collection = Combobox.createItems(users, { getValue: getUserId, getLabel });
			render(ComboboxItemsHarness, { collection, list: 'none', root: { defaultValue: 3 } });

			await expect.element(input()).toHaveValue('Carol');
			expect(new Set(getLabel.mock.calls.map(([item]) => item))).toEqual(new Set([users[2]]));
		});
	});

	describe('grouped items', () => {
		const teams = [
			{ value: 'Engineering', items: [users[0], users[1]] },
			{ value: 'Design', items: [users[2]] }
		];
		const grouped = (root: Record<string, unknown> = {}, open = false) => ({
			collection: Combobox.createItems(teams, { getValue: getUserId, getLabel: getUserName }),
			grouped: true,
			open,
			root
		});

		it('uses the derived value for selection and resolves the label while closed', async () => {
			const onValueChange = vi.fn();
			render(ComboboxItemsHarness, grouped({ onValueChange }, true));

			await userEvent.click(option('Bob'));

			expect(onValueChange.mock.lastCall?.[0]).toBe(2);
			await expect.element(input()).toHaveValue('Bob');
		});

		it('resolves the label of an initially selected value', async () => {
			render(ComboboxItemsHarness, grouped({ defaultValue: 3 }));

			await expect.element(input()).toHaveValue('Carol');
		});

		it('filters items by their derived labels and drops empty groups', async () => {
			render(ComboboxItemsHarness, grouped({}, true));

			await userEvent.type(input(), 'car');

			await expect.element(option('Carol')).toBeInTheDocument();
			expect(absent('Alice')).toBe(true);
			await expect.element(page.getByText('Engineering')).not.toBeInTheDocument();
			await expect.element(page.getByText('Design')).toBeInTheDocument();
		});

		it('passes leaf source items to a custom root filter', async () => {
			const filter = vi.fn((user: User) => user.id === 3);
			render(ComboboxItemsHarness, grouped({ filter }, true));

			await userEvent.type(input(), 'x');

			await expect.element(option('Carol')).toBeInTheDocument();
			expect(absent('Alice')).toBe(true);
			expect(filter.mock.calls.every(([item]) => 'name' in item)).toBe(true);
			expect(new Set(filter.mock.calls.map(([item]) => item.id))).toEqual(new Set([1, 2, 3]));
		});

		it('applies the limit across groups and drops the emptied ones', async () => {
			render(ComboboxItemsHarness, grouped({ limit: 1 }, true));

			await expect.poll(optionCount).toBe(1);
			await expect.element(page.getByText('Engineering')).toBeInTheDocument();
			await expect.element(page.getByText('Design')).not.toBeInTheDocument();
		});

		it('projects externally filtered grouped source items into the derived value domain', async () => {
			const onValueChange = vi.fn();
			render(
				ComboboxItemsHarness,
				grouped({ filteredItems: [{ value: 'Design', items: [users[2]] }], onValueChange }, true)
			);
			await expect.poll(optionCount).toBe(1);

			await userEvent.click(option('Carol'));

			expect(onValueChange.mock.lastCall?.[0]).toBe(3);
		});

		it('resets an emptied external result when reopening a grouped selection', async () => {
			const props = renderBound(ComboboxItemsHarness, {
				...grouped({ defaultValue: 3, filteredItems: [{ value: 'Design', items: [users[2]] }] }),
				list: 'popup' as const
			});
			await expect.element(input()).toHaveValue('Carol');

			props.root = { defaultValue: 3, filteredItems: [] };
			await userEvent.click(input());

			await expect.poll(optionCount).toBe(3);
			await expect.element(option('Carol')).toHaveAttribute('aria-selected', 'true');
		});

		it('resets an initially empty external result when opening a grouped selection', async () => {
			render(ComboboxItemsHarness, {
				...grouped({ defaultValue: 3, filteredItems: [] }),
				list: 'popup'
			});
			await expect.element(input()).toHaveValue('Carol');

			await userEvent.click(input());

			await expect.poll(optionCount).toBe(3);
			await expect.element(option('Carol')).toHaveAttribute('aria-selected', 'true');
		});

		it('only applies accessors to group items', async () => {
			const getValue = vi.fn((user: User) => user.id);
			const getLabel = vi.fn((user: User) => user.name);
			render(ComboboxItemsHarness, {
				collection: Combobox.createItems(teams, { getValue, getLabel }),
				grouped: true,
				groupLabels: false,
				open: true
			});

			// Filtering and resolving a selection force both accessors over the collection's leaves.
			await userEvent.type(input(), 'a');
			await userEvent.click(option('Carol'));

			expect(new Set(getValue.mock.calls.map(([item]) => item.id))).toEqual(new Set([1, 2, 3]));
			expect(new Set(getLabel.mock.calls.map(([item]) => item.name))).toEqual(
				new Set(['Alice', 'Bob', 'Carol'])
			);
		});
	});
});
