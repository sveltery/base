// Derived from Base UI v1.9.0 packages/react/src/internals/resolveValueLabel.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Shared by Select and Combobox. Labels are strings: a Svelte part renders them as text.

import { serializeValue } from '../serializeValue.js';

export interface LabeledItem {
	value: unknown;
	label: string | null | undefined;
}

export interface Group<Item = unknown> {
	[key: string]: unknown;
	items: ReadonlyArray<Item>;
}

export type ItemsInput =
	| Record<string, string | null | undefined>
	| ReadonlyArray<LabeledItem>
	| ReadonlyArray<Group<LabeledItem>>
	| undefined;

type ToString = ((item: never) => string) | undefined;

function isGroup(item: unknown): item is Group {
	return typeof item === 'object' && item != null && Array.isArray((item as Group).items);
}

export function isGroupedItems(
	items: ReadonlyArray<unknown> | undefined
): items is ReadonlyArray<Group> {
	// A group must carry an actual `items` array: key presence alone would misclassify an item
	// with an unrelated or optional `items` field.
	return isGroup(items?.[0]);
}

export function flattenLeafItems<Item>(
	items: readonly Item[] | readonly Group<Item>[]
): readonly Item[] {
	return isGroupedItems(items)
		? (items as readonly Group<Item>[]).flatMap((group) => group.items)
		: (items as readonly Item[]);
}

/** Whether the items hold an item with a null value and a label, which replaces a placeholder. */
export function hasNullItemLabel(items: ItemsInput): boolean {
	if (!Array.isArray(items)) return items != null && 'null' in items;
	return flattenLeafItems<LabeledItem>(items as ReadonlyArray<LabeledItem>).some(
		(item) => item != null && item.value == null && item.label != null
	);
}

function call(toString: ToString, item: unknown): string | undefined {
	return (toString as ((item: unknown) => string) | undefined)?.(item);
}

export function stringifyAsLabel(item: unknown, itemToStringLabel?: ToString): string {
	if (itemToStringLabel && item != null) return call(itemToStringLabel, item) ?? '';
	if (item && typeof item === 'object') {
		if ('label' in item && item.label != null) return String(item.label);
		if ('value' in item) return String(item.value);
	}
	return serializeValue(item);
}

export function stringifyAsValue(item: unknown, itemToStringValue?: ToString): string {
	if (itemToStringValue && item != null) return call(itemToStringValue, item) ?? '';
	if (item && typeof item === 'object' && 'value' in item && 'label' in item) {
		return serializeValue(item.value);
	}
	return serializeValue(item);
}

export function resolveSelectedLabel(
	value: unknown,
	items: ItemsInput,
	itemToStringLabel?: ToString
): string {
	const fallback = () => stringifyAsLabel(value, itemToStringLabel);

	if (itemToStringLabel && value != null) return call(itemToStringLabel, value) ?? '';

	// A custom object with an explicit label takes precedence.
	if (value && typeof value === 'object' && 'label' in value && value.label != null) {
		return String(value.label);
	}

	if (items && !Array.isArray(items)) {
		const record = items as Record<string, string | null | undefined>;
		const key = String(value);
		const label = Object.hasOwn(record, key) ? record[key] : undefined;
		return label ?? fallback();
	}

	if (Array.isArray(items)) {
		const flatItems = flattenLeafItems<LabeledItem>(items as ReadonlyArray<LabeledItem>);

		if (value == null || typeof value !== 'object') {
			const match = flatItems.find((item) => item.value === value);
			if (match && match.label != null) return match.label;
			return fallback();
		}

		// An object without an explicit label matches by its `value` property.
		if ('value' in value) {
			const match = flatItems.find((item) => item && item.value === value.value);
			if (match && match.label != null) return match.label;
		}
	}

	return fallback();
}

export function resolveMultipleLabels(
	values: readonly unknown[],
	items: ItemsInput,
	itemToStringLabel?: ToString
): string {
	return values.map((value) => resolveSelectedLabel(value, items, itemToStringLabel)).join(', ');
}
