import { describe, expect, it } from 'vitest';
import { DateLib } from './date-lib.js';
import { calculateFocusTarget, getNextFocus, keyToMove } from './focus.js';
import { createDay, getMonths } from './grid.js';
import { createGetModifiers, type ModifierContext } from './modifiers.js';
import type { CalendarDay } from './types.js';

const lib = new DateLib();
const d = (year: number, month: number, day: number) => new Date(year, month - 1, day);
const dayOf = (date: Date) => createDay(date, date, lib);

describe('keyToMove', () => {
	it.each([
		['ArrowLeft', false, ['day', 'before']],
		['ArrowRight', false, ['day', 'after']],
		['ArrowUp', false, ['week', 'before']],
		['ArrowDown', false, ['week', 'after']],
		['PageUp', false, ['month', 'before']],
		['PageDown', false, ['month', 'after']],
		['Home', false, ['startOfWeek', 'before']],
		['End', false, ['endOfWeek', 'after']],
		['ArrowLeft', true, ['month', 'before']],
		['ArrowRight', true, ['month', 'after']],
		['ArrowUp', true, ['year', 'before']],
		['ArrowDown', true, ['year', 'after']],
		['PageUp', true, ['year', 'before']],
		['PageDown', true, ['year', 'after']],
		['Home', true, ['startOfWeek', 'before']],
		['End', true, ['endOfWeek', 'after']]
	] as const)('maps %s (shift %s)', (key, shift, expected) => {
		expect(keyToMove(key, shift, 'ltr')).toEqual(expected);
		expect(keyToMove(key, shift, undefined)).toEqual(expected);
	});

	it('swaps left and right in rtl only', () => {
		expect(keyToMove('ArrowLeft', false, 'rtl')).toEqual(['day', 'after']);
		expect(keyToMove('ArrowRight', false, 'rtl')).toEqual(['day', 'before']);
		expect(keyToMove('ArrowLeft', true, 'rtl')).toEqual(['month', 'after']);
		expect(keyToMove('ArrowRight', true, 'rtl')).toEqual(['month', 'before']);
		expect(keyToMove('ArrowUp', false, 'rtl')).toEqual(['week', 'before']);
		expect(keyToMove('PageDown', true, 'rtl')).toEqual(['year', 'after']);
		expect(keyToMove('Home', false, 'rtl')).toEqual(['startOfWeek', 'before']);
	});

	it('ignores other keys', () => {
		for (const key of ['Enter', ' ', 'Tab', 'a', 'Escape'])
			expect(keyToMove(key, false, 'ltr')).toBeUndefined();
	});
});

describe('getNextFocus', () => {
	const next = (
		moveBy: Parameters<typeof getNextFocus>[0],
		moveDir: Parameters<typeof getNextFocus>[1],
		from: Date,
		options: Parameters<typeof getNextFocus>[5] = {},
		navStart?: Date,
		navEnd?: Date
	) => getNextFocus(moveBy, moveDir, dayOf(from), navStart, navEnd, options, lib)?.isoDate;

	it('moves by day, week, month and year', () => {
		expect(next('day', 'after', d(2024, 3, 10))).toBe('2024-03-11');
		expect(next('day', 'before', d(2024, 3, 1))).toBe('2024-02-29');
		expect(next('week', 'after', d(2024, 3, 10))).toBe('2024-03-17');
		expect(next('week', 'before', d(2024, 3, 3))).toBe('2024-02-25');
		expect(next('month', 'after', d(2024, 1, 31))).toBe('2024-02-29');
		expect(next('month', 'before', d(2024, 3, 31))).toBe('2024-02-29');
		expect(next('year', 'after', d(2024, 2, 29))).toBe('2025-02-28');
		expect(next('year', 'before', d(2024, 3, 10))).toBe('2023-03-10');
	});

	it('moves to the start and end of the week', () => {
		expect(next('startOfWeek', 'before', d(2024, 3, 13))).toBe('2024-03-10');
		expect(next('endOfWeek', 'after', d(2024, 3, 13))).toBe('2024-03-16');
	});

	it('follows the week start of the lib and ISOWeek', () => {
		const monday = new DateLib({ weekStartsOn: 1 });
		const from = createDay(d(2024, 3, 13), d(2024, 3, 13), monday);
		expect(
			getNextFocus('startOfWeek', 'before', from, undefined, undefined, {}, monday)?.isoDate
		).toBe('2024-03-11');
		expect(next('startOfWeek', 'before', d(2024, 3, 13), { ISOWeek: true })).toBe('2024-03-11');
		expect(next('endOfWeek', 'after', d(2024, 3, 13), { ISOWeek: true })).toBe('2024-03-17');
	});

	it('returns a day displayed in its own month', () => {
		expect(
			getNextFocus('day', 'after', dayOf(d(2024, 3, 31)), undefined, undefined, {}, lib)
		).toMatchObject({
			isoDate: '2024-04-01',
			displayMonthId: '2024-04',
			outside: false
		});
	});

	it('skips disabled days', () => {
		const disabled = { dayOfWeek: [1, 2] };
		expect(next('day', 'after', d(2024, 3, 10), { disabled })).toBe('2024-03-13');
		expect(next('day', 'before', d(2024, 3, 13), { disabled })).toBe('2024-03-10');
		expect(next('week', 'after', d(2024, 3, 11), { disabled: d(2024, 3, 18) })).toBe('2024-03-25');
	});

	it('skips hidden days', () => {
		expect(next('day', 'after', d(2024, 3, 10), { hidden: [d(2024, 3, 11), d(2024, 3, 12)] })).toBe(
			'2024-03-13'
		);
	});

	it('skips disabled and hidden days in the same move', () => {
		expect(
			next('day', 'after', d(2024, 3, 10), { disabled: d(2024, 3, 11), hidden: d(2024, 3, 12) })
		).toBe('2024-03-13');
	});

	it('stays inside navStart and navEnd', () => {
		const navStart = d(2024, 3, 1);
		const navEnd = d(2024, 3, 31);
		expect(next('month', 'before', d(2024, 3, 3), {}, navStart, navEnd)).toBe('2024-03-01');
		expect(next('day', 'before', d(2024, 3, 1), {}, navStart, navEnd)).toBe('2024-03-01');
		expect(next('week', 'after', d(2024, 3, 29), {}, navStart, navEnd)).toBe('2024-03-31');
		expect(next('year', 'after', d(2024, 3, 10), {}, navStart, navEnd)).toBe('2024-03-31');
	});

	it('gives up when no day can take focus', () => {
		expect(next('day', 'after', d(2024, 3, 10), { disabled: true })).toBeUndefined();
		expect(
			next(
				'day',
				'after',
				d(2024, 3, 30),
				{ disabled: { after: d(2024, 3, 30) } },
				undefined,
				d(2024, 3, 31)
			)
		).toBeUndefined();
	});

	it('finds a day up to a year away', () => {
		expect(next('day', 'after', d(2024, 3, 10), { disabled: { before: d(2025, 3, 1) } })).toBe(
			'2025-03-01'
		);
		expect(
			next('day', 'after', d(2024, 3, 10), { disabled: { before: d(2026, 1, 1) } })
		).toBeUndefined();
	});
});

describe('calculateFocusTarget', () => {
	const march = d(2024, 3, 1);
	const days = getMonths(march, undefined, {}, lib)[0].weeks.flatMap((week) => week.days);
	const pick = (iso: string): CalendarDay => {
		const day = days.find((candidate) => candidate.isoDate === iso && !candidate.outside);
		if (!day) throw new Error(`no ${iso}`);
		return day;
	};
	const target = (
		overrides: Partial<ModifierContext> & { selected?: Date; lastFocused?: CalendarDay } = {}
	): string | undefined => {
		const { selected, lastFocused, ...context } = overrides;
		const getModifiers = createGetModifiers(
			days,
			{ today: d(2024, 3, 13), showOutsideDays: true, ...context },
			lib
		);
		return calculateFocusTarget(
			days,
			getModifiers,
			(date) => !!selected && lib.isSameDay(selected, date),
			lastFocused,
			lib
		)?.isoDate;
	};

	it('prefers today', () => {
		expect(target()).toBe('2024-03-13');
	});

	it('prefers the selected day to today', () => {
		expect(target({ selected: d(2024, 3, 20) })).toBe('2024-03-20');
	});

	it('prefers the last focused day to the selected day', () => {
		expect(target({ selected: d(2024, 3, 20), lastFocused: pick('2024-03-05') })).toBe(
			'2024-03-05'
		);
	});

	it('prefers a focused modifier to the last focused day', () => {
		expect(target({ lastFocused: pick('2024-03-05'), modifiers: { focused: d(2024, 3, 7) } })).toBe(
			'2024-03-07'
		);
	});

	it('takes the first of equal candidates', () => {
		expect(target({ modifiers: { focused: [d(2024, 3, 9), d(2024, 3, 7)] } })).toBe('2024-03-07');
	});

	it('skips disabled, hidden and outside days', () => {
		expect(target({ selected: d(2024, 3, 20), disabled: d(2024, 3, 20) })).toBe('2024-03-13');
		expect(
			target({ lastFocused: pick('2024-03-05'), hidden: d(2024, 3, 5), selected: d(2024, 3, 20) })
		).toBe('2024-03-20');
		expect(target({ selected: d(2024, 2, 29) })).toBe('2024-03-13');
	});

	it('ignores a last focused day that is the same date shown in another month', () => {
		const outside = days.find((day) => day.isoDate === '2024-02-29');
		expect(target({ lastFocused: outside })).toBe('2024-03-13');
	});

	it('falls back to the first focusable day', () => {
		expect(target({ today: d(2023, 1, 1) })).toBe('2024-03-01');
		expect(target({ today: d(2023, 1, 1), disabled: [d(2024, 3, 1), d(2024, 3, 2)] })).toBe(
			'2024-03-03'
		);
	});

	it('has no target when no day is focusable', () => {
		expect(target({ disabled: true })).toBeUndefined();
		expect(
			calculateFocusTarget(
				[],
				createGetModifiers([], { today: march }, lib),
				() => false,
				undefined,
				lib
			)
		).toBeUndefined();
	});
});
