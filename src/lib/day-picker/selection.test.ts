import { describe, expect, it } from 'vitest';
import { DateLib } from './date-lib.js';
import { isSelected, selectMultiple, selectRange, selectSingle } from './selection.js';
import type { DateRange } from './types.js';

const lib = new DateLib();
const d = (day: number, hours = 0) => new Date(2024, 2, day, hours);
const iso = (date: Date | undefined) => (date ? lib.format(date, 'yyyy-MM-dd') : undefined);
const isoAll = (dates: Date[] | undefined) => dates?.map(iso);
const isoRange = (range: DateRange | undefined) =>
	range && { from: iso(range.from), to: iso(range.to) };

describe('selectSingle', () => {
	it('selects a date', () => {
		expect(iso(selectSingle(undefined, d(10), {}, lib))).toBe('2024-03-10');
		expect(iso(selectSingle(d(5), d(10), {}, lib))).toBe('2024-03-10');
	});

	it('clears the selection when the selected day is clicked', () => {
		expect(selectSingle(d(10), d(10, 15), {}, lib)).toBeUndefined();
	});

	it('keeps the date selected when required', () => {
		expect(iso(selectSingle(d(10), d(10, 15), { required: true }, lib))).toBe('2024-03-10');
	});
});

describe('selectMultiple', () => {
	it('adds a date', () => {
		expect(isoAll(selectMultiple(undefined, d(10), {}, lib))).toEqual(['2024-03-10']);
		expect(isoAll(selectMultiple([d(10)], d(12), {}, lib))).toEqual(['2024-03-10', '2024-03-12']);
	});

	it('removes a date that is selected', () => {
		expect(isoAll(selectMultiple([d(10), d(12)], d(10, 9), {}, lib))).toEqual(['2024-03-12']);
		expect(selectMultiple([d(10)], d(10), {}, lib)).toEqual([]);
	});

	it('does not change the input array', () => {
		const selected = [d(10), d(12)];
		selectMultiple(selected, d(10), {}, lib);
		selectMultiple(selected, d(14), {}, lib);
		expect(isoAll(selected)).toEqual(['2024-03-10', '2024-03-12']);
	});

	it('returns the same selection when min is reached', () => {
		const selected = [d(10), d(12)];
		expect(selectMultiple(selected, d(10), { min: 2 }, lib)).toBe(selected);
		expect(isoAll(selectMultiple(selected, d(10), { min: 1 }, lib))).toEqual(['2024-03-12']);
	});

	it('returns the same selection when the last date is required', () => {
		const selected = [d(10)];
		expect(selectMultiple(selected, d(10), { required: true }, lib)).toBe(selected);
		expect(isoAll(selectMultiple([d(10), d(12)], d(10), { required: true }, lib))).toEqual([
			'2024-03-12'
		]);
	});

	it('starts a new selection when max is reached', () => {
		expect(isoAll(selectMultiple([d(10), d(12)], d(14), { max: 2 }, lib))).toEqual(['2024-03-14']);
		expect(isoAll(selectMultiple([d(10)], d(14), { max: 2 }, lib))).toEqual([
			'2024-03-10',
			'2024-03-14'
		]);
	});

	it('removes a selected date even when max is reached', () => {
		expect(isoAll(selectMultiple([d(10), d(12)], d(12), { max: 2 }, lib))).toEqual(['2024-03-10']);
	});
});

describe('selectRange', () => {
	const select = (
		selected: DateRange | undefined,
		day: number,
		options: Parameters<typeof selectRange>[2] = {}
	) => isoRange(selectRange(selected, d(day), options, lib));

	it('starts a one day range with the first click', () => {
		expect(select(undefined, 10)).toEqual({ from: '2024-03-10', to: '2024-03-10' });
		expect(select({ from: undefined, to: undefined }, 10)).toEqual({
			from: '2024-03-10',
			to: '2024-03-10'
		});
	});

	it('starts an open range with the first click when min is set', () => {
		expect(select(undefined, 10, { min: 2 })).toEqual({ from: '2024-03-10', to: undefined });
	});

	it('ends the range with a click after the start', () => {
		expect(select({ from: d(10), to: undefined }, 15)).toEqual({
			from: '2024-03-10',
			to: '2024-03-15'
		});
	});

	it('ends the range with a click before the start', () => {
		expect(select({ from: d(10), to: undefined }, 5)).toEqual({
			from: '2024-03-05',
			to: '2024-03-10'
		});
	});

	it('clears an open range clicked on its start unless required', () => {
		expect(select({ from: d(10), to: undefined }, 10)).toBeUndefined();
		expect(select({ from: d(10), to: undefined }, 10, { required: true })).toEqual({
			from: '2024-03-10',
			to: undefined
		});
	});

	it('clears the start when min is set unless required', () => {
		expect(select({ from: d(10), to: undefined }, 10, { min: 1 })).toBeUndefined();
		expect(select({ from: d(10), to: undefined }, 10, { min: 1, required: true })).toEqual({
			from: '2024-03-10',
			to: undefined
		});
	});

	it('moves the end when a full range gets a click after its start', () => {
		expect(select({ from: d(10), to: d(15) }, 12)).toEqual({
			from: '2024-03-10',
			to: '2024-03-12'
		});
		expect(select({ from: d(10), to: d(15) }, 20)).toEqual({
			from: '2024-03-10',
			to: '2024-03-20'
		});
	});

	it('moves the start when a full range gets a click before it', () => {
		expect(select({ from: d(10), to: d(15) }, 5)).toEqual({ from: '2024-03-05', to: '2024-03-15' });
	});

	it('shrinks a full range to a day when its start or end is clicked', () => {
		expect(select({ from: d(10), to: d(15) }, 10)).toEqual({
			from: '2024-03-10',
			to: '2024-03-10'
		});
		expect(select({ from: d(10), to: d(15) }, 15)).toEqual({
			from: '2024-03-15',
			to: '2024-03-15'
		});
	});

	it('reopens a full range when its start or end is clicked and min is set', () => {
		expect(select({ from: d(10), to: d(15) }, 10, { min: 1 })).toEqual({
			from: '2024-03-10',
			to: undefined
		});
		expect(select({ from: d(10), to: d(15) }, 15, { min: 1 })).toEqual({
			from: '2024-03-15',
			to: undefined
		});
	});

	it('clears a one day range when its day is clicked unless required', () => {
		expect(select({ from: d(10), to: d(10) }, 10)).toBeUndefined();
		expect(select({ from: d(10), to: d(10) }, 10, { required: true })).toEqual({
			from: '2024-03-10',
			to: '2024-03-10'
		});
	});

	it('restarts at the click when the range is longer than max', () => {
		expect(select({ from: d(10), to: undefined }, 20, { max: 3 })).toEqual({
			from: '2024-03-20',
			to: undefined
		});
		expect(select({ from: d(10), to: undefined }, 13, { max: 3 })).toEqual({
			from: '2024-03-10',
			to: '2024-03-13'
		});
		expect(select({ from: d(10), to: undefined }, 14, { max: 3 })).toEqual({
			from: '2024-03-14',
			to: undefined
		});
		expect(select({ from: d(10), to: d(12) }, 20, { max: 3 })).toEqual({
			from: '2024-03-20',
			to: undefined
		});
	});

	it('restarts at the click when the range is shorter than min', () => {
		expect(select({ from: d(10), to: undefined }, 11, { min: 3 })).toEqual({
			from: '2024-03-11',
			to: undefined
		});
		expect(select({ from: d(10), to: undefined }, 13, { min: 3 })).toEqual({
			from: '2024-03-10',
			to: '2024-03-13'
		});
		expect(select({ from: d(10), to: undefined }, 12, { min: 3 })).toEqual({
			from: '2024-03-12',
			to: undefined
		});
	});

	describe('excludeDisabled', () => {
		const disabled = { dayOfWeek: 0 };

		it('restarts at the click when the range would contain a disabled day', () => {
			expect(
				select({ from: d(8), to: undefined }, 12, { disabled, excludeDisabled: true })
			).toEqual({ from: '2024-03-12', to: undefined });
		});

		it('keeps a range without disabled days', () => {
			expect(
				select({ from: d(11), to: undefined }, 12, { disabled, excludeDisabled: true })
			).toEqual({ from: '2024-03-11', to: '2024-03-12' });
		});

		it('keeps a range with disabled days when not excluded', () => {
			expect(select({ from: d(8), to: undefined }, 12, { disabled })).toEqual({
				from: '2024-03-08',
				to: '2024-03-12'
			});
			expect(select({ from: d(8), to: undefined }, 12, { excludeDisabled: true })).toEqual({
				from: '2024-03-08',
				to: '2024-03-12'
			});
		});

		it('restarts with function and date matchers', () => {
			const options = { excludeDisabled: true };
			expect(
				select({ from: d(8), to: undefined }, 12, {
					...options,
					disabled: (date) => date.getDate() === 10
				})
			).toEqual({
				from: '2024-03-12',
				to: undefined
			});
			expect(select({ from: d(8), to: undefined }, 12, { ...options, disabled: [d(9)] })).toEqual({
				from: '2024-03-12',
				to: undefined
			});
		});

		it('does not change the selected range', () => {
			const selected = { from: d(8), to: undefined };
			selectRange(selected, d(12), { disabled, excludeDisabled: true }, lib);
			expect(isoRange(selected)).toEqual({ from: '2024-03-08', to: undefined });
		});
	});
});

describe('isSelected', () => {
	it('is false without a mode or selection', () => {
		expect(isSelected(undefined, d(10), d(10), lib)).toBe(false);
		expect(isSelected('single', undefined, d(10), lib)).toBe(false);
		expect(isSelected('multiple', undefined, d(10), lib)).toBe(false);
		expect(isSelected('range', undefined, d(10), lib)).toBe(false);
	});

	it('matches a single date by calendar day', () => {
		expect(isSelected('single', d(10), d(10, 20), lib)).toBe(true);
		expect(isSelected('single', d(10), d(11), lib)).toBe(false);
	});

	it('matches any date of a multiple selection', () => {
		expect(isSelected('multiple', [d(10), d(12)], d(12), lib)).toBe(true);
		expect(isSelected('multiple', [d(10), d(12)], d(11), lib)).toBe(false);
	});

	it('matches the days of a range, ends included', () => {
		const range = { from: d(10), to: d(12) };
		expect([9, 10, 11, 12, 13].map((day) => isSelected('range', range, d(day), lib))).toEqual([
			false,
			true,
			true,
			true,
			false
		]);
	});

	it('matches only the start of an open range', () => {
		expect(isSelected('range', { from: d(10), to: undefined }, d(10), lib)).toBe(true);
		expect(isSelected('range', { from: d(10), to: undefined }, d(11), lib)).toBe(false);
	});

	it('ignores a selection of another mode', () => {
		expect(isSelected('single', [d(10)], d(10), lib)).toBe(false);
		expect(isSelected('multiple', d(10), d(10), lib)).toBe(false);
		expect(isSelected('range', d(10), d(10), lib)).toBe(false);
	});
});
