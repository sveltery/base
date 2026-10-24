import { describe, expect, it } from 'vitest';
import { DateLib } from './date-lib.js';
import {
	dateMatchModifiers,
	isDateRange,
	rangeContainsModifiers,
	rangeIncludesDate
} from './matchers.js';

const lib = new DateLib();
const d = (month: number, day: number, hours = 0) => new Date(2024, month - 1, day, hours);
const matches = (date: Date, matcher: Parameters<typeof dateMatchModifiers>[1]) =>
	dateMatchModifiers(date, matcher, lib);

describe('isDateRange', () => {
	it('recognizes objects with a from key', () => {
		expect(isDateRange({ from: d(3, 1), to: d(3, 5) })).toBe(true);
		expect(isDateRange({ from: undefined })).toBe(true);
		expect(isDateRange({ before: d(3, 1) })).toBe(false);
		expect(isDateRange(d(3, 1))).toBe(false);
		expect(isDateRange(undefined)).toBe(false);
	});
});

describe('rangeIncludesDate', () => {
	const range = { from: d(3, 10), to: d(3, 20) };

	it('includes the ends by default', () => {
		expect(rangeIncludesDate(range, d(3, 10, 23), false, lib)).toBe(true);
		expect(rangeIncludesDate(range, d(3, 20), false, lib)).toBe(true);
		expect(rangeIncludesDate(range, d(3, 15), false, lib)).toBe(true);
		expect(rangeIncludesDate(range, d(3, 9), false, lib)).toBe(false);
		expect(rangeIncludesDate(range, d(3, 21), false, lib)).toBe(false);
	});

	it('can exclude the ends', () => {
		expect(rangeIncludesDate(range, d(3, 10), true, lib)).toBe(false);
		expect(rangeIncludesDate(range, d(3, 20), true, lib)).toBe(false);
		expect(rangeIncludesDate(range, d(3, 11), true, lib)).toBe(true);
	});

	it('reads an inverted range as its reverse', () => {
		expect(rangeIncludesDate({ from: d(3, 20), to: d(3, 10) }, d(3, 15), false, lib)).toBe(true);
		expect(rangeIncludesDate({ from: d(3, 20), to: d(3, 10) }, d(3, 25), false, lib)).toBe(false);
	});

	it('matches only the set end of a half-open range', () => {
		expect(rangeIncludesDate({ from: d(3, 10), to: undefined }, d(3, 10), false, lib)).toBe(true);
		expect(rangeIncludesDate({ from: d(3, 10), to: undefined }, d(3, 11), false, lib)).toBe(false);
		expect(rangeIncludesDate({ from: undefined, to: d(3, 10) }, d(3, 10), false, lib)).toBe(true);
		expect(rangeIncludesDate({ from: d(3, 10), to: undefined }, d(3, 10), true, lib)).toBe(false);
		expect(rangeIncludesDate({ from: undefined }, d(3, 10), false, lib)).toBe(false);
	});
});

describe('dateMatchModifiers', () => {
	it('matches booleans', () => {
		expect(matches(d(3, 10), true)).toBe(true);
		expect(matches(d(3, 10), false)).toBe(false);
	});

	it('matches a date by calendar day', () => {
		expect(matches(d(3, 10, 22), d(3, 10, 1))).toBe(true);
		expect(matches(d(3, 11), d(3, 10))).toBe(false);
	});

	it('matches an array of dates', () => {
		expect(matches(d(3, 12), [d(3, 10), d(3, 12)])).toBe(true);
		expect(matches(d(3, 11), [d(3, 10), d(3, 12)])).toBe(false);
	});

	it('matches a date range with both ends included', () => {
		const range = { from: d(3, 10), to: d(3, 12) };
		expect([9, 10, 11, 12, 13].map((day) => matches(d(3, day), range))).toEqual([
			false,
			true,
			true,
			true,
			false
		]);
	});

	it('matches days of the week', () => {
		expect(matches(d(3, 10), { dayOfWeek: 0 })).toBe(true);
		expect(matches(d(3, 11), { dayOfWeek: 0 })).toBe(false);
		expect(matches(d(3, 16), { dayOfWeek: [0, 6] })).toBe(true);
		expect(matches(d(3, 13), { dayOfWeek: [0, 6] })).toBe(false);
	});

	it('matches before and after with the boundary day excluded', () => {
		expect([9, 10, 11].map((day) => matches(d(3, day), { before: d(3, 10) }))).toEqual([
			true,
			false,
			false
		]);
		expect([9, 10, 11].map((day) => matches(d(3, day), { after: d(3, 10) }))).toEqual([
			false,
			false,
			true
		]);
	});

	it('matches the days strictly between a closed interval', () => {
		const interval = { after: d(3, 10), before: d(3, 20) };
		expect([10, 11, 19, 20].map((day) => matches(d(3, day), interval))).toEqual([
			false,
			true,
			true,
			false
		]);
		expect(matches(d(3, 5), interval)).toBe(false);
		expect(matches(d(3, 25), interval)).toBe(false);
	});

	it('matches the days outside an open interval', () => {
		const interval = { before: d(3, 10), after: d(3, 20) };
		expect([5, 9, 10, 15, 20, 21, 25].map((day) => matches(d(3, day), interval))).toEqual([
			true,
			true,
			false,
			false,
			false,
			true,
			true
		]);
	});

	it('calls function matchers', () => {
		expect(matches(d(3, 10), (date) => date.getDate() === 10)).toBe(true);
		expect(matches(d(3, 11), (date) => date.getDate() === 10)).toBe(false);
	});

	it('matches when any matcher of a list matches', () => {
		expect(matches(d(3, 13), [{ dayOfWeek: 0 }, d(3, 13)])).toBe(true);
		expect(matches(d(3, 14), [{ dayOfWeek: 0 }, d(3, 13)])).toBe(false);
		expect(matches(d(3, 14), [])).toBe(false);
	});
});

describe('rangeContainsModifiers', () => {
	const range = { from: d(3, 10), to: d(3, 14) };
	const contains = (matcher: Parameters<typeof rangeContainsModifiers>[1]) =>
		rangeContainsModifiers(range, matcher, lib);

	it('handles booleans', () => {
		expect(contains(true)).toBe(true);
		expect(contains(false)).toBe(false);
	});

	it('finds a date or dates inside the range, ends included', () => {
		expect(contains(d(3, 12))).toBe(true);
		expect(contains(d(3, 14))).toBe(true);
		expect(contains(d(3, 15))).toBe(false);
		expect(contains([d(3, 1), d(3, 11)])).toBe(true);
		expect(contains([d(3, 1), d(3, 20)])).toBe(false);
	});

	it('finds an overlapping date range', () => {
		expect(contains({ from: d(3, 14), to: d(3, 20) })).toBe(true);
		expect(contains({ from: d(3, 1), to: d(3, 31) })).toBe(true);
		expect(contains({ from: d(3, 1), to: d(3, 9) })).toBe(false);
		expect(contains({ from: d(3, 12), to: undefined })).toBe(false);
	});

	it('finds a day of the week', () => {
		expect(contains({ dayOfWeek: 0 })).toBe(true);
		expect(contains({ dayOfWeek: [5, 6] })).toBe(false);
		expect(contains({ dayOfWeek: [3, 4] })).toBe(true);
		expect(rangeContainsModifiers({ from: d(3, 11), to: d(3, 11) }, { dayOfWeek: 0 }, lib)).toBe(
			false
		);
	});

	it('finds a day of the week in a range longer than a week', () => {
		expect(rangeContainsModifiers({ from: d(3, 11), to: d(3, 31) }, { dayOfWeek: 6 }, lib)).toBe(
			true
		);
	});

	it('finds days in a closed interval', () => {
		expect(contains({ after: d(3, 13), before: d(3, 20) })).toBe(true);
		expect(contains({ after: d(3, 14), before: d(3, 20) })).toBe(false);
		expect(contains({ after: d(3, 1), before: d(3, 11) })).toBe(true);
		expect(contains({ after: d(3, 1), before: d(3, 10) })).toBe(false);
	});

	it('finds days in an open interval', () => {
		expect(contains({ before: d(3, 11), after: d(3, 13) })).toBe(true);
		expect(contains({ before: d(3, 9), after: d(3, 15) })).toBe(false);
	});

	it('finds days before or after a date', () => {
		expect(contains({ before: d(3, 11) })).toBe(true);
		expect(contains({ before: d(3, 10) })).toBe(false);
		expect(contains({ after: d(3, 13) })).toBe(true);
		expect(contains({ after: d(3, 14) })).toBe(false);
	});

	it('tests every day with function matchers', () => {
		expect(contains((date) => date.getDate() === 12)).toBe(true);
		expect(contains((date) => date.getDate() === 15)).toBe(false);
		expect(contains([(date) => date.getDate() === 99, (date) => date.getDate() === 14])).toBe(true);
	});
});
