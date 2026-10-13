// Derived from Base UI v1.9.0 packages/react/src/combobox/items/createItems.ts,
// items/itemCollection.ts and the `filteredItems` memo of root/AriaCombobox.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { error } from '@sveltery/utils';
import {
	compareItemEquality,
	defaultItemEquality,
	type ItemEqualityComparer
} from '../internal/listbox/itemEquality.js';
import {
	flattenLeafItems,
	isGroupedItems,
	stringifyAsLabel,
	type Group
} from '../internal/listbox/resolveValueLabel.js';

export type ComboboxPrimitiveValue = string | number | bigint | boolean;

/** Flat items, or groups of items: any object with an `items` array marks a group. */
export type ComboboxItemsData<Item> = readonly Item[] | readonly Group<Item>[];

export interface CreateComboboxItemsOptions<
	Item,
	Value extends ComboboxPrimitiveValue = ComboboxPrimitiveValue
> {
	/**
	 * Projects an item to the primitive value that identifies it, used as the item's selection
	 * value. Each item must derive a unique value.
	 */
	getValue: (item: Item) => Value;
	/** Projects an item to the label shown in the input and matched against the query. */
	getLabel: (item: Item) => string;
}

const COLLECTION = Symbol('ComboboxItemCollection');

/** A collection from `createItems()`. Pass it to the root's `items`. */
export interface ComboboxItemCollection<Item = unknown, Value = Item> {
	readonly [COLLECTION]: true;
	/** Source items with their flat or grouped structure, or `undefined` while loading. */
	readonly data: ComboboxItemsData<Item> | undefined;
	/** Projects a source item to its selection value. */
	value(item: Item): Value;
	/** Whether a selection value belongs to the collection's data. */
	hasValue(value: Value, isEqual: ItemEqualityComparer<Value>): boolean;
	/** A source item's label. */
	itemLabel(item: Item): string;
	/** A selection value's label, also for values whose item is not rendered. */
	label(
		value: Value,
		isEqual: ItemEqualityComparer<Value>,
		fallback?: (value: Value) => string
	): string;
}

export function isItemCollection(items: unknown): items is ComboboxItemCollection {
	return items != null && typeof items === 'object' && COLLECTION in items;
}

export function findCollectionItem<Item, Value>(
	valueToItem: Map<Value, Item>,
	itemValue: Value,
	isEqual: ItemEqualityComparer<Value>
): Item | undefined {
	const exactItem = valueToItem.get(itemValue);
	if (exactItem !== undefined || isEqual === defaultItemEquality) return exactItem;
	for (const [derivedValue, item] of valueToItem) {
		if (compareItemEquality(derivedValue, itemValue, isEqual)) return item;
	}
	return undefined;
}

/** Maps each value to its item. The first item of a duplicated value wins. */
export function mapValuesToItems<Item, Value>(
	values: readonly Value[],
	items: readonly Item[]
): Map<Value, Item> {
	const map = new Map<Value, Item>();
	values.forEach((value, index) => {
		if (!map.has(value)) map.set(value, items[index]);
	});
	return map;
}

/**
 * Creates a collection for the root's `items`: each item's selection value and label come from
 * `getValue` and `getLabel`, derived on first use. Items cannot have an `items` array, which marks
 * a group. Create a static collection at module scope and a dynamic one in `$derived`.
 */
export function createItems<Item, Value extends ComboboxPrimitiveValue>(
	data: ComboboxItemsData<Item> | undefined,
	options: CreateComboboxItemsOptions<Item, Value>
): ComboboxItemCollection<Item, Value> {
	const { getValue, getLabel } = options;
	let valueToItem: Map<Value, Item> | null = null;

	function derived() {
		if (valueToItem) return valueToItem;
		const map = new Map<Value, Item>();
		for (const item of data ? flattenLeafItems<Item>(data) : []) {
			if (item == null) continue;
			const value = getValue(item);
			if (!map.has(value)) {
				map.set(value, item);
			} else {
				error(
					`Two items passed to createItems() derived the value ${String(value)}, so selection and label resolution cannot tell them apart.`,
					'Return a unique value from `getValue`.'
				);
			}
		}
		valueToItem = map;
		return map;
	}

	return {
		[COLLECTION]: true,
		data,
		value: (item) => (item == null ? (item as unknown as Value) : getValue(item)),
		hasValue: (value, isEqual) => findCollectionItem(derived(), value, isEqual) !== undefined,
		itemLabel: getLabel,
		label(value, isEqual, fallback) {
			const item = findCollectionItem(derived(), value, isEqual);
			if (item !== undefined) return getLabel(item);
			return stringifyAsLabel(value, fallback as never);
		}
	};
}

export type ItemFilter = (
	item: unknown,
	query: string,
	itemToString?: (item: never) => string
) => boolean;

export interface FilterItemsOptions {
	query: string;
	filter: ItemFilter;
	/** The maximum number of items, or -1 for no limit. */
	limit: number;
	itemToString?: (item: never) => string;
}

/**
 * The items that match `query`, in their flat or grouped shape, at most `limit` of them. Groups
 * with no matching item are dropped. An empty query keeps every item.
 */
export function filterItems<Item>(
	items: ComboboxItemsData<Item>,
	{ query, filter, limit, itemToString }: FilterItemsOptions
): ComboboxItemsData<Item> {
	const matches = (item: Item) => query === '' || filter(item, query, itemToString);

	if (isGroupedItems(items)) {
		const groups: Group<Item>[] = [];
		let count = 0;
		for (const group of items as readonly Group<Item>[]) {
			if (limit > -1 && count >= limit) break;
			const remaining = limit > -1 ? limit - count : Infinity;
			const taken: Item[] = [];
			for (const item of group.items) {
				if (taken.length >= remaining) break;
				if (matches(item)) taken.push(item);
			}
			if (taken.length > 0) {
				groups.push({ ...group, items: taken });
				count += taken.length;
			}
		}
		return groups;
	}

	const flat = items as readonly Item[];
	if (query === '') return limit > -1 ? flat.slice(0, limit) : flat;

	const result: Item[] = [];
	for (const item of flat) {
		if (limit > -1 && result.length >= limit) break;
		if (matches(item)) result.push(item);
	}
	return result;
}
