// Type tests, checked by `pnpm check`. Nothing here runs.
// They follow Base UI v1.9.0 packages/react/src/autocomplete/root/AutocompleteRoot.spec.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// A generic Svelte component infers its generics from its props as `root()` does, and
// svelte-check ignores `@ts-expect-error` in templates.
import { expectTypeOf } from 'vitest';
import { Combobox } from '../combobox/index.js';
import type { AutocompleteHighlightEventDetails, AutocompleteRootItemsProps } from './types.js';

function root<Items extends readonly unknown[] = readonly unknown[]>(
	props: AutocompleteRootItemsProps<Items>
) {
	return props;
}

const objectItems = [
	{ value: 'a', label: 'apple' },
	{ value: 'b', label: 'banana' },
	{ value: 'c', label: 'cherry' }
];

const objectItemsReadonly = [
	{ value: 'a', label: 'apple' },
	{ value: 'b', label: 'banana' }
] as const;

const groupItemsReadonly = [
	{ value: 'fruits', items: [{ value: 'a', label: 'apple' }] },
	{ value: 'vegetables', items: [{ value: 'd', label: 'daikon' }] }
] as const;

// itemToStringValue takes the item type of `items`, the nested item for groups.
root({ items: objectItems, itemToStringValue: (item) => item.value });
root({ items: groupItemsReadonly, itemToStringValue: (item) => item.label });
root({
	items: groupItemsReadonly,
	// @ts-expect-error item is the nested item of a group, not the group itself
	itemToStringValue: (item) => item.items
});

// The value is the input text.
root({
	items: objectItems,
	defaultValue: 'a',
	onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<string>()
});
root({
	items: objectItemsReadonly,
	value: 'a',
	onValueChange: (value) => value.startsWith('a')
});
// @ts-expect-error value is the input text, not an item
root({ items: objectItems, value: objectItems[0] });
root({
	defaultValue: 'javascript',
	onValueChange: (value) => {
		// @ts-expect-error a string has no pop()
		value.pop();
	}
});

const collection = Combobox.createItems(objectItems, {
	getValue: (item) => item.value,
	getLabel: (item) => item.label
});
// @ts-expect-error Autocomplete has no item type parameter, so collections are not accepted.
root({ items: collection });

root({
	onItemHighlighted: (_item, details: AutocompleteHighlightEventDetails) => {
		if (details.reason === 'pointer') {
			expectTypeOf(details.event).toEqualTypeOf<MouseEvent | PointerEvent>();
		} else if (details.reason === 'keyboard') {
			expectTypeOf(details.event).toEqualTypeOf<KeyboardEvent>();
		} else {
			expectTypeOf(details.event).toEqualTypeOf<Event>();
		}
	}
});
