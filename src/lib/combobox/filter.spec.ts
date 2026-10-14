// Ported from Base UI v1.9.0 packages/react/src/internals/filter.test.ts,
// combobox/root/utils/index.test.ts and combobox/root/utils/useFilter.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { describe, expect, it } from 'vitest';
import {
	createCollatorItemFilter,
	createSingleSelectionCollatorFilter,
	getComboboxPopupId,
	getFilter,
	useFilter
} from './filter.js';

describe('getFilter', () => {
	it('caches different locales separately', () => {
		expect(getFilter({ locale: new Intl.Locale('fr-FR') })).not.toBe(
			getFilter({ locale: new Intl.Locale('en-US') })
		);
	});

	it('caches equivalent locale inputs', () => {
		expect(getFilter({ locale: new Intl.Locale('fr-FR') })).toBe(getFilter({ locale: 'fr-FR' }));
	});

	it('matches locale-aware substrings without accent sensitivity', () => {
		expect(getFilter({ locale: 'en-US' }).contains('Résumé', 'resume')).toBe(true);
	});
});

describe('Combobox root utilities', () => {
	const filter = getFilter({ locale: 'en' });

	it('derives a popup id only when the root has an id', () => {
		expect(getComboboxPopupId('fruit')).toBe('fruit-popup');
		expect(getComboboxPopupId(null)).toBe(undefined);
		expect(getComboboxPopupId(undefined)).toBe(undefined);
	});

	it('rejects nullish items and filters primitives and projected objects', () => {
		const primitiveFilter = createCollatorItemFilter(filter);
		const objectFilter = createCollatorItemFilter(filter, (item: { name: string }) => item.name);

		expect(primitiveFilter(null, 'app')).toBe(false);
		expect(primitiveFilter(undefined, 'app')).toBe(false);
		expect(primitiveFilter('Apple', 'app')).toBe(true);
		expect(objectFilter({ name: 'Banana' }, 'nan')).toBe(true);
	});

	it('shows all items for an empty query and rejects nullish items', () => {
		const itemFilter = createSingleSelectionCollatorFilter(filter);

		expect(itemFilter(null, 'app')).toBe(false);
		expect(itemFilter(undefined, 'app')).toBe(false);
		expect(itemFilter('Apple', '')).toBe(true);
	});

	it('shows all items when the query exactly matches the selected label', () => {
		expect(createSingleSelectionCollatorFilter(filter, undefined, 'Apple')('Banana', 'apple')).toBe(
			true
		);
	});

	it('otherwise filters the current item', () => {
		const itemFilter = createSingleSelectionCollatorFilter(filter, undefined, 'Apple');

		expect(itemFilter('Banana', 'app')).toBe(false);
		expect(itemFilter('Banana', 'nan')).toBe(true);
	});
});

describe('useFilter', () => {
	it('uses default options when called without arguments', () => {
		expect(useFilter().contains('Apple', 'app')).toBe(true);
	});

	it('matches the start and end of an item label', () => {
		const filter = useFilter({ locale: 'en' });

		expect(filter.startsWith('Éclair', 'ec')).toBe(true);
		expect(filter.startsWith('Éclair', 'clair')).toBe(false);
		expect(filter.startsWith('Éclair', '')).toBe(true);
		expect(filter.startsWith('Tea', 'teapot')).toBe(false);
		expect(filter.endsWith('Crème brûlée', 'BRULEE')).toBe(true);
		expect(filter.endsWith('Crème brûlée', 'crème')).toBe(false);
		expect(filter.endsWith('Crème brûlée', '')).toBe(true);
		expect(filter.endsWith('Tea', 'iced tea')).toBe(false);
		expect(filter.startsWith({ label: 'Banana' }, 'ban', (item) => item.label)).toBe(true);
	});

	it('filters selected and unselected items in single and multiple modes', () => {
		const single = useFilter({ locale: 'en', multiple: false, value: 'Apple' });
		expect(single.contains('Banana', 'apple')).toBe(true);
		expect(single.contains('Banana', 'nan')).toBe(true);

		const multiple = useFilter({ locale: 'en', multiple: true, value: 'Apple' });
		expect(multiple.contains('Banana', 'apple')).toBe(false);
		expect(multiple.contains('Banana', 'nan')).toBe(true);
	});
});
