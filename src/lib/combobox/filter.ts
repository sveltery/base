// Derived from Base UI v1.9.0 packages/react/src/internals/filter.ts,
// packages/react/src/combobox/root/utils/index.ts and root/utils/useFilter.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `useFilter` is a plain function: its result has no React identity to memoize.

import { stringifyAsLabel } from '../internal/listbox/resolveValueLabel.js';
import { stringifyLocale } from '../internal/stringifyLocale.js';

export interface FilterOptions extends Intl.CollatorOptions {
	/**
	 * The locale to use for string comparison.
	 * Defaults to the user's runtime locale.
	 */
	locale?: Intl.LocalesArgument;
}

export interface Filter {
	/** Returns whether the item matches the query anywhere. */
	contains: <Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean;
	/** Returns whether the item starts with the query. */
	startsWith: <Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean;
	/** Returns whether the item ends with the query. */
	endsWith: <Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean;
}

/** `itemToString` for filtering. `selected` labels a selected value when it differs. */
export type FilterItemToString = ((item: never) => string) & {
	selected?: (value: unknown) => string;
};

const filterCache = new Map<string, Filter>();

/** A collator-backed filter, cached per locale and options. */
export function getFilter(options: FilterOptions = {}): Filter {
	const { locale, ...restOptions } = options;
	const collatorOptions: Intl.CollatorOptions = {
		usage: 'search',
		sensitivity: 'base',
		ignorePunctuation: true,
		...restOptions
	};

	const cacheKey = `${stringifyLocale(locale)}|${JSON.stringify(collatorOptions)}`;
	const cached = filterCache.get(cacheKey);
	if (cached) return cached;

	const collator = new Intl.Collator(locale, collatorOptions);

	const filter: Filter = {
		contains(item, query, itemToString) {
			if (!query) return true;
			const itemString = stringifyAsLabel(item, itemToString as never);
			for (let i = 0; i <= itemString.length - query.length; i += 1) {
				if (collator.compare(itemString.slice(i, i + query.length), query) === 0) return true;
			}
			return false;
		},
		startsWith(item, query, itemToString) {
			if (!query) return true;
			const itemString = stringifyAsLabel(item, itemToString as never);
			return collator.compare(itemString.slice(0, query.length), query) === 0;
		},
		endsWith(item, query, itemToString) {
			if (!query) return true;
			const itemString = stringifyAsLabel(item, itemToString as never);
			const queryLength = query.length;
			return (
				itemString.length >= queryLength &&
				collator.compare(itemString.slice(itemString.length - queryLength), query) === 0
			);
		}
	};

	filterCache.set(cacheKey, filter);
	return filter;
}

/**
 * The default id of `Combobox.Popup` when the input is inside it. The trigger points
 * `aria-controls` at it.
 */
export function getComboboxPopupId(rootId: string | null | undefined) {
	return rootId == null ? undefined : `${rootId}-popup`;
}

/** Matches an item's label against the query. Nullish items never match. */
export function createCollatorItemFilter(
	collatorFilter: Filter,
	itemToStringLabel?: FilterItemToString | ((item: never) => string)
) {
	return (item: unknown, query: string) => {
		if (item == null) return false;
		return collatorFilter.contains(item, query, itemToStringLabel as never);
	};
}

/**
 * For single selection: every item matches an empty query or a query equal to the selected
 * label, so the whole list can be browsed after a selection.
 */
export function createSingleSelectionCollatorFilter(
	collatorFilter: Filter,
	itemToStringLabel?: FilterItemToString | ((item: never) => string),
	selectedValue?: unknown
) {
	return (item: unknown, query: string) => {
		if (item == null) return false;
		if (!query) return true;

		const selectedValueToString =
			(itemToStringLabel as FilterItemToString | undefined)?.selected ?? itemToStringLabel;
		const selectedString =
			selectedValue != null ? stringifyAsLabel(selectedValue, selectedValueToString as never) : '';

		if (
			selectedString &&
			collatorFilter.contains(selectedString, query) &&
			selectedString.length === query.length
		) {
			return true;
		}

		return collatorFilter.contains(item, query, itemToStringLabel as never);
	};
}

export interface UseFilterOptions extends FilterOptions {
	/**
	 * Whether the combobox selects several values.
	 * @default false
	 */
	multiple?: boolean;
	/** The selected value. While the query matches its label, every item stays visible. */
	value?: unknown;
}

/**
 * Matches items against a query with `Intl.Collator`. Pass its `contains` to the root's
 * `filter`, or filter items yourself for `filteredItems`. Call it in a `$derived` when
 * `value` changes.
 */
export function useFilter(options: UseFilterOptions = {}): Filter {
	const { multiple = false, value, ...collatorOptions } = options;
	const coreFilter = getFilter(collatorOptions);

	return {
		...coreFilter,
		contains(item, query, itemToString) {
			if (multiple) return createCollatorItemFilter(coreFilter, itemToString)(item, query);
			return createSingleSelectionCollatorFilter(coreFilter, itemToString, value)(item, query);
		}
	};
}
