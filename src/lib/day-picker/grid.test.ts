import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DateLib } from './date-lib.js';
import {
	clampMonth,
	createDay,
	getInitialMonth,
	getMonthOptions,
	getMonths,
	getNavMonths,
	getNextMonth,
	getPreviousMonth,
	getWeekdays,
	getYearOptions,
	isSameCalendarDay
} from './grid.js';
import type { CalendarMonth } from './types.js';

const lib = new DateLib();
const monday = new DateLib({ weekStartsOn: 1 });
const d = (year: number, month: number, day: number) => new Date(year, month - 1, day);
const iso = (date: Date | undefined, l = lib) => (date ? l.format(date, 'yyyy-MM-dd') : undefined);
const days = (month: CalendarMonth | undefined) =>
	(month?.weeks ?? []).flatMap((week) => week.days);
const firstAndLast = (month: CalendarMonth | undefined) => [
	days(month)[0]?.isoDate,
	days(month).at(-1)?.isoDate
];

describe('createDay', () => {
	it('describes a day of the displayed month', () => {
		expect(createDay(d(2024, 3, 5), d(2024, 3, 1), lib)).toMatchObject({
			outside: false,
			isoDate: '2024-03-05',
			displayMonthId: '2024-03',
			dateMonthId: '2024-03'
		});
	});

	it('flags a day of another month as outside', () => {
		const day = createDay(d(2024, 2, 27), d(2024, 3, 1), lib);
		expect(day).toMatchObject({
			outside: true,
			isoDate: '2024-02-27',
			displayMonthId: '2024-03',
			dateMonthId: '2024-02'
		});
	});
});

describe('isSameCalendarDay', () => {
	it('compares the date and the displayed month', () => {
		const march = createDay(d(2024, 3, 31), d(2024, 3, 1), lib);
		const april = createDay(d(2024, 3, 31), d(2024, 4, 1), lib);
		expect(isSameCalendarDay(march, createDay(d(2024, 3, 31), d(2024, 3, 1), lib), lib)).toBe(true);
		expect(isSameCalendarDay(march, april, lib)).toBe(false);
		expect(isSameCalendarDay(march, createDay(d(2024, 3, 30), d(2024, 3, 1), lib), lib)).toBe(
			false
		);
	});
});

describe('getMonths', () => {
	it('lays out six weeks from Sunday for March 2024', () => {
		const [month] = getMonths(d(2024, 3, 1), undefined, {}, lib);
		expect(iso(month.date)).toBe('2024-03-01');
		expect(month.weeks.map((week) => week.weekNumber)).toEqual([9, 10, 11, 12, 13, 14]);
		expect(month.weeks.every((week) => week.days.length === 7)).toBe(true);
		expect(firstAndLast(month)).toEqual(['2024-02-25', '2024-04-06']);
	});

	it('marks the days of the neighboring months as outside', () => {
		const [month] = getMonths(d(2024, 3, 1), undefined, {}, lib);
		expect(
			days(month)
				.filter((day) => day.outside)
				.map((day) => day.isoDate)
		).toEqual([
			'2024-02-25',
			'2024-02-26',
			'2024-02-27',
			'2024-02-28',
			'2024-02-29',
			'2024-04-01',
			'2024-04-02',
			'2024-04-03',
			'2024-04-04',
			'2024-04-05',
			'2024-04-06'
		]);
		expect(days(month).every((day) => day.displayMonthId === '2024-03')).toBe(true);
		expect(month.weeks[0].days[0].dateMonthId).toBe('2024-02');
	});

	it('lays out five weeks from Monday', () => {
		const [month] = getMonths(d(2024, 3, 1), undefined, {}, monday);
		expect(month.weeks).toHaveLength(5);
		expect(firstAndLast(month)).toEqual(['2024-02-26', '2024-03-31']);
		expect(month.weeks.map((week) => week.weekNumber)).toEqual([9, 10, 11, 12, 13]);
	});

	it('starts weeks on Monday and numbers them by ISO week with ISOWeek', () => {
		const [month] = getMonths(d(2024, 3, 1), undefined, { ISOWeek: true }, lib);
		expect(firstAndLast(month)).toEqual(['2024-02-26', '2024-03-31']);
		expect(month.weeks.map((week) => week.weekNumber)).toEqual([9, 10, 11, 12, 13]);
	});

	it('numbers the week of Jan 1 by ISO rules with ISOWeek', () => {
		const [month] = getMonths(d(2021, 1, 1), undefined, { ISOWeek: true }, lib);
		expect(firstAndLast(month)).toEqual(['2020-12-28', '2021-01-31']);
		expect(month.weeks.map((week) => week.weekNumber)).toEqual([53, 1, 2, 3, 4]);
	});

	it('shows four weeks for a month that fills them exactly', () => {
		const [month] = getMonths(d(2026, 2, 1), undefined, {}, lib);
		expect(month.weeks).toHaveLength(4);
		expect(firstAndLast(month)).toEqual(['2026-02-01', '2026-02-28']);
	});

	it('pads to six weeks with fixedWeeks', () => {
		const [short] = getMonths(d(2026, 2, 1), undefined, { fixedWeeks: true }, lib);
		expect(short.weeks).toHaveLength(6);
		expect(firstAndLast(short)).toEqual(['2026-02-01', '2026-03-14']);
		const [five] = getMonths(d(2024, 3, 1), undefined, { fixedWeeks: true }, monday);
		expect(five.weeks).toHaveLength(6);
		expect(firstAndLast(five)).toEqual(['2024-02-26', '2024-04-07']);
		const [six] = getMonths(d(2024, 3, 1), undefined, { fixedWeeks: true }, lib);
		expect(six.weeks).toHaveLength(6);
	});

	it('lays out two months, each with its own outside days', () => {
		const [march, april] = getMonths(d(2024, 3, 1), undefined, { numberOfMonths: 2 }, lib);
		expect([iso(march.date), iso(april.date)]).toEqual(['2024-03-01', '2024-04-01']);
		expect(firstAndLast(april)).toEqual(['2024-03-31', '2024-05-04']);
		const shared = days(april)[0];
		expect(shared).toMatchObject({
			isoDate: '2024-03-31',
			outside: true,
			displayMonthId: '2024-04'
		});
	});

	it('pads every month to six weeks with fixedWeeks and several months', () => {
		const months = getMonths(
			d(2026, 2, 1),
			undefined,
			{ numberOfMonths: 3, fixedWeeks: true },
			lib
		);
		expect(months.map((month) => month.weeks.length)).toEqual([6, 6, 6]);
	});

	it('reverses the months with reverseMonths', () => {
		const months = getMonths(
			d(2024, 3, 1),
			undefined,
			{ numberOfMonths: 3, reverseMonths: true },
			lib
		);
		expect(months.map((month) => iso(month.date))).toEqual([
			'2024-05-01',
			'2024-04-01',
			'2024-03-01'
		]);
	});

	it('stops after the last month of the nav range', () => {
		const navEnd = d(2024, 4, 30);
		expect(
			getMonths(d(2024, 3, 1), navEnd, { numberOfMonths: 4 }, lib).map((month) => iso(month.date))
		).toEqual(['2024-03-01', '2024-04-01']);
		expect(getMonths(d(2024, 3, 1), d(2024, 3, 31), { numberOfMonths: 2 }, lib)).toHaveLength(1);
	});

	it('ends the grid on the last day of endMonth', () => {
		const [march] = getMonths(d(2024, 3, 1), d(2024, 3, 31), { endMonth: d(2024, 3, 1) }, lib);
		expect(firstAndLast(march)).toEqual(['2024-02-25', '2024-03-31']);
	});

	it('shows no month when the first month is past the nav range', () => {
		expect(getMonths(d(2024, 6, 1), d(2024, 4, 30), {}, lib)).toEqual([]);
	});

	it('builds the days in the time zone', () => {
		const tokyo = new DateLib({ timeZone: 'Asia/Tokyo' });
		const [month] = getMonths(tokyo.newDate(2024, 2, 1), undefined, {}, tokyo);
		expect(firstAndLast(month)).toEqual(['2024-02-25', '2024-04-06']);
	});
});

describe('getNavMonths', () => {
	it('has no bounds by default', () => {
		expect(getNavMonths({}, lib)).toEqual([undefined, undefined]);
		expect(getNavMonths({ captionLayout: 'label' }, lib)).toEqual([undefined, undefined]);
		expect(getNavMonths({ captionLayout: 'dropdown-months' }, lib)).toEqual([undefined, undefined]);
	});

	it('spans from the first day of startMonth to the last day of endMonth', () => {
		const [start, end] = getNavMonths(
			{ startMonth: d(2024, 3, 15), endMonth: d(2024, 8, 20) },
			lib
		);
		expect([iso(start), iso(end)]).toEqual(['2024-03-01', '2024-08-31']);
	});

	it('defaults to 100 years back through this year for the year dropdowns', () => {
		for (const captionLayout of ['dropdown', 'dropdown-years'] as const) {
			const [start, end] = getNavMonths({ captionLayout, today: d(2024, 6, 15) }, lib);
			expect([iso(start), iso(end)]).toEqual(['1924-01-01', '2024-12-31']);
		}
	});

	it('keeps a given bound next to a default one', () => {
		const [start, end] = getNavMonths(
			{ captionLayout: 'dropdown', startMonth: d(2000, 5, 5), today: d(2024, 6, 15) },
			lib
		);
		expect([iso(start), iso(end)]).toEqual(['2000-05-01', '2024-12-31']);
	});
});

describe('getInitialMonth', () => {
	const today = d(2024, 6, 15);

	it('prefers month, then defaultMonth, then today', () => {
		expect(
			iso(getInitialMonth(d(2023, 1, 20), d(2022, 2, 2), { today }, undefined, undefined, lib))
		).toBe('2023-01-01');
		expect(
			iso(getInitialMonth(undefined, d(2022, 2, 20), { today }, undefined, undefined, lib))
		).toBe('2022-02-01');
		expect(iso(getInitialMonth(undefined, undefined, { today }, undefined, undefined, lib))).toBe(
			'2024-06-01'
		);
	});

	it('moves back so every displayed month fits before navEnd', () => {
		const navEnd = d(2024, 6, 30);
		expect(
			iso(getInitialMonth(d(2024, 6, 10), undefined, { numberOfMonths: 2 }, undefined, navEnd, lib))
		).toBe('2024-05-01');
		expect(
			iso(getInitialMonth(d(2024, 9, 10), undefined, { numberOfMonths: 1 }, undefined, navEnd, lib))
		).toBe('2024-06-01');
		expect(
			iso(getInitialMonth(d(2024, 3, 10), undefined, { numberOfMonths: 2 }, undefined, navEnd, lib))
		).toBe('2024-03-01');
	});

	it('moves forward to navStart', () => {
		expect(iso(getInitialMonth(d(2023, 1, 10), undefined, {}, d(2024, 2, 1), undefined, lib))).toBe(
			'2024-02-01'
		);
	});
});

describe('getPreviousMonth and getNextMonth', () => {
	const navStart = d(2024, 1, 1);
	const navEnd = d(2024, 6, 30);

	it('steps one month', () => {
		expect(iso(getPreviousMonth(d(2024, 3, 1), navStart, {}, lib))).toBe('2024-02-01');
		expect(iso(getNextMonth(d(2024, 3, 1), navEnd, {}, lib))).toBe('2024-04-01');
	});

	it('steps without bounds', () => {
		expect(iso(getPreviousMonth(d(2024, 3, 1), undefined, {}, lib))).toBe('2024-02-01');
		expect(iso(getNextMonth(d(2024, 12, 1), undefined, {}, lib))).toBe('2025-01-01');
	});

	it('stops at the edges of the nav range', () => {
		expect(getPreviousMonth(d(2024, 1, 1), navStart, {}, lib)).toBeUndefined();
		expect(iso(getPreviousMonth(d(2024, 2, 1), navStart, {}, lib))).toBe('2024-01-01');
		expect(getNextMonth(d(2024, 6, 1), navEnd, {}, lib)).toBeUndefined();
		expect(iso(getNextMonth(d(2024, 5, 1), navEnd, {}, lib))).toBe('2024-06-01');
	});

	it('stops when the last displayed month is at the end of the nav range', () => {
		expect(getNextMonth(d(2024, 5, 1), navEnd, { numberOfMonths: 2 }, lib)).toBeUndefined();
		expect(iso(getNextMonth(d(2024, 4, 1), navEnd, { numberOfMonths: 2 }, lib))).toBe('2024-05-01');
	});

	it('steps by the number of months with pagedNavigation', () => {
		expect(
			iso(getNextMonth(d(2024, 1, 1), navEnd, { numberOfMonths: 2, pagedNavigation: true }, lib))
		).toBe('2024-03-01');
		expect(
			iso(
				getPreviousMonth(d(2024, 5, 1), navStart, { numberOfMonths: 2, pagedNavigation: true }, lib)
			)
		).toBe('2024-03-01');
	});

	it('returns nothing with disableNavigation', () => {
		expect(
			getPreviousMonth(d(2024, 3, 1), navStart, { disableNavigation: true }, lib)
		).toBeUndefined();
		expect(getNextMonth(d(2024, 3, 1), navEnd, { disableNavigation: true }, lib)).toBeUndefined();
	});
});

describe('clampMonth', () => {
	const navStart = d(2024, 3, 1);
	const navEnd = d(2024, 8, 31);

	it('goes to the first day of the month', () => {
		expect(iso(clampMonth(d(2024, 5, 17), navStart, navEnd, lib))).toBe('2024-05-01');
	});

	it('stays inside the nav range', () => {
		expect(iso(clampMonth(d(2023, 5, 17), navStart, navEnd, lib))).toBe('2024-03-01');
		expect(iso(clampMonth(d(2025, 5, 17), navStart, navEnd, lib))).toBe('2024-08-01');
	});

	it('is unbounded without a nav range', () => {
		expect(iso(clampMonth(d(1999, 5, 17), undefined, undefined, lib))).toBe('1999-05-01');
	});
});

describe('getWeekdays', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(d(2024, 3, 13));
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it('lists the week of today from the locale week start', () => {
		expect(getWeekdays(lib, false).map((day) => iso(day))).toEqual([
			'2024-03-10',
			'2024-03-11',
			'2024-03-12',
			'2024-03-13',
			'2024-03-14',
			'2024-03-15',
			'2024-03-16'
		]);
		expect(iso(getWeekdays(monday, false)[0], monday)).toBe('2024-03-11');
	});

	it('starts on Monday with ISOWeek', () => {
		const weekdays = getWeekdays(lib, true);
		expect([iso(weekdays[0]), iso(weekdays[6])]).toEqual(['2024-03-11', '2024-03-17']);
	});
});

describe('getMonthOptions', () => {
	const format = (month: Date) => lib.format(month, 'LLLL');

	it('lists the twelve months of the displayed year', () => {
		const options = getMonthOptions(d(2024, 3, 1), undefined, undefined, format, lib);
		expect(options.map((option) => option.value)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
		expect(options[0].label).toBe('January');
		expect(options[11].label).toBe('December');
		expect(options.some((option) => option.disabled)).toBe(false);
	});

	it('disables the months outside the nav range', () => {
		const options = getMonthOptions(d(2024, 3, 1), d(2024, 3, 15), d(2024, 10, 31), format, lib);
		expect(options.filter((option) => option.disabled).map((option) => option.label)).toEqual([
			'January',
			'February',
			'November',
			'December'
		]);
	});

	it('disables a whole year that is out of range', () => {
		const options = getMonthOptions(d(2023, 3, 1), d(2024, 1, 1), undefined, format, lib);
		expect(options.every((option) => option.disabled)).toBe(true);
	});
});

describe('getYearOptions', () => {
	const format = (year: Date) => lib.format(year, 'yyyy');

	it('has no options for an open range', () => {
		expect(getYearOptions(undefined, d(2024, 1, 1), format, lib)).toBeUndefined();
		expect(getYearOptions(d(2022, 1, 1), undefined, format, lib)).toBeUndefined();
	});

	it('lists the years of the nav range', () => {
		expect(getYearOptions(d(2022, 5, 1), d(2024, 2, 29), format, lib)).toEqual([
			{ value: 2022, label: '2022', disabled: false },
			{ value: 2023, label: '2023', disabled: false },
			{ value: 2024, label: '2024', disabled: false }
		]);
	});

	it('lists the years of the default dropdown range', () => {
		const [start, end] = getNavMonths({ captionLayout: 'dropdown', today: d(2024, 6, 15) }, lib);
		const options = getYearOptions(start, end, format, lib);
		expect(options).toHaveLength(101);
		expect([options?.[0].label, options?.at(-1)?.label]).toEqual(['1924', '2024']);
	});
});
