// Derived from Base UI v1.9.0 packages/react/src/internals/filter.ts and `stringifyAsLabel` of
// packages/react/src/internals/resolveValueLabel.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { serializeValue } from '../internal/serializeValue.js';
import { stringifyLocale } from '../internal/stringifyLocale.js';

export interface GetFilterParameters extends Intl.CollatorOptions {
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

function stringifyAsLabel<Item>(item: Item, itemToString?: (item: Item) => string): string {
	if (itemToString && item != null) return itemToString(item) ?? '';
	if (item && typeof item === 'object') {
		if ('label' in item && item.label != null) return String(item.label);
		if ('value' in item) return String(item.value);
	}
	return serializeValue(item);
}

const filterCache = new Map<string, Filter>();

/** Locale-aware matchers that ignore case, accents and punctuation by default. */
export function getFilter(options: GetFilterParameters = {}): Filter {
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
			const text = stringifyAsLabel(item, itemToString);
			for (let i = 0; i <= text.length - query.length; i += 1) {
				if (collator.compare(text.slice(i, i + query.length), query) === 0) return true;
			}
			return false;
		},
		startsWith(item, query, itemToString) {
			if (!query) return true;
			const text = stringifyAsLabel(item, itemToString);
			return collator.compare(text.slice(0, query.length), query) === 0;
		},
		endsWith(item, query, itemToString) {
			if (!query) return true;
			const text = stringifyAsLabel(item, itemToString);
			return (
				text.length >= query.length &&
				collator.compare(text.slice(text.length - query.length), query) === 0
			);
		}
	};

	filterCache.set(cacheKey, filter);
	return filter;
}
