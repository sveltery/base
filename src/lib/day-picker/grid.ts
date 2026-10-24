// Derived from react-day-picker v9.8.1 src/helpers/getInitialMonth.ts, getNavMonth.ts, getDisplayMonths.ts, getDates.ts, getMonths.ts, getPreviousMonth.ts, getNextMonth.ts, getWeekdays.ts, getMonthOptions.ts, getYearOptions.ts and src/classes/CalendarDay.ts
// (commit bd55df2e3a4917f4c368020f3ef64f60b6882627). MIT, see THIRD_PARTY_NOTICES.md.

import type { DateLib } from './date-lib.js';
import type {
	CalendarDay,
	CalendarMonth,
	CalendarWeek,
	DropdownOption,
	GridOptions
} from './types.js';

const DAYS_PER_WEEK = 7;
const FIXED_WEEKS_DAYS = 6 * DAYS_PER_WEEK;

export function createDay(date: Date, displayMonth: Date, lib: DateLib): CalendarDay {
	return {
		date,
		displayMonth,
		outside: !lib.isSameMonth(date, displayMonth),
		isoDate: lib.format(date, 'yyyy-MM-dd'),
		displayMonthId: lib.format(displayMonth, 'yyyy-MM'),
		dateMonthId: lib.format(date, 'yyyy-MM')
	};
}

export function isSameCalendarDay(a: CalendarDay, b: CalendarDay, lib: DateLib): boolean {
	return lib.isSameDay(a.date, b.date) && lib.isSameMonth(a.displayMonth, b.displayMonth);
}

export function getNavMonths(
	options: GridOptions,
	lib: DateLib
): [start: Date | undefined, end: Date | undefined] {
	const { startMonth, endMonth, captionLayout } = options;
	const hasYearDropdown = captionLayout === 'dropdown' || captionLayout === 'dropdown-years';
	const today = options.today ?? lib.today();

	const start = startMonth
		? lib.startOfMonth(startMonth)
		: hasYearDropdown
			? lib.startOfYear(lib.addYears(today, -100))
			: undefined;
	const end = endMonth
		? lib.endOfMonth(endMonth)
		: hasYearDropdown
			? lib.endOfYear(today)
			: undefined;
	return [start && lib.startOfDay(start), end && lib.startOfDay(end)];
}

export function getInitialMonth(
	month: Date | undefined,
	defaultMonth: Date | undefined,
	options: GridOptions,
	navStart: Date | undefined,
	navEnd: Date | undefined,
	lib: DateLib
): Date {
	const { numberOfMonths = 1 } = options;
	let initial = month ?? defaultMonth ?? options.today ?? lib.today();
	if (navEnd && lib.differenceInCalendarMonths(navEnd, initial) < numberOfMonths - 1) {
		initial = lib.addMonths(navEnd, -(numberOfMonths - 1));
	}
	if (navStart && lib.differenceInCalendarMonths(initial, navStart) < 0) {
		initial = navStart;
	}
	return lib.startOfMonth(initial);
}

function getDisplayMonths(
	firstMonth: Date,
	navEnd: Date | undefined,
	options: GridOptions,
	lib: DateLib
): Date[] {
	const { numberOfMonths = 1 } = options;
	const months: Date[] = [];
	for (let i = 0; i < numberOfMonths; i++) {
		const month = lib.addMonths(firstMonth, i);
		if (navEnd && month > navEnd) break;
		months.push(month);
	}
	return months;
}

function getDates(
	displayMonths: Date[],
	maxDate: Date | undefined,
	options: GridOptions,
	lib: DateLib
): Date[] {
	const firstMonth = displayMonths[0];
	const lastMonth = displayMonths[displayMonths.length - 1];
	const { ISOWeek, fixedWeeks } = options;
	const startWeekFirstDate = ISOWeek ? lib.startOfISOWeek(firstMonth) : lib.startOfWeek(firstMonth);
	const endWeekLastDate = ISOWeek
		? lib.endOfISOWeek(lib.endOfMonth(lastMonth))
		: lib.endOfWeek(lib.endOfMonth(lastMonth));
	const nOfDays = lib.differenceInCalendarDays(endWeekLastDate, startWeekFirstDate);
	const nOfMonths = lib.differenceInCalendarMonths(lastMonth, firstMonth) + 1;

	const dates: Date[] = [];
	for (let i = 0; i <= nOfDays; i++) {
		const date = lib.addDays(startWeekFirstDate, i);
		if (maxDate && lib.isAfter(date, maxDate)) break;
		dates.push(date);
	}

	const extraDates = FIXED_WEEKS_DAYS * nOfMonths;
	if (fixedWeeks && dates.length < extraDates) {
		const daysToAdd = extraDates - dates.length;
		for (let i = 0; i < daysToAdd; i++) dates.push(lib.addDays(dates[dates.length - 1], 1));
	}
	return dates;
}

export function getMonths(
	firstMonth: Date,
	navEnd: Date | undefined,
	options: GridOptions,
	lib: DateLib
): CalendarMonth[] {
	const { ISOWeek, fixedWeeks, endMonth, reverseMonths } = options;
	const displayMonths = getDisplayMonths(firstMonth, navEnd, options, lib);
	if (!displayMonths.length) return [];
	const dates = getDates(displayMonths, endMonth && lib.endOfMonth(endMonth), options, lib);

	const months = displayMonths.map((month): CalendarMonth => {
		const firstDateOfFirstWeek = ISOWeek ? lib.startOfISOWeek(month) : lib.startOfWeek(month);
		const lastDateOfLastWeek = ISOWeek
			? lib.endOfISOWeek(lib.endOfMonth(month))
			: lib.endOfWeek(lib.endOfMonth(month));
		const monthDates = dates.filter(
			(date) => date >= firstDateOfFirstWeek && date <= lastDateOfLastWeek
		);

		if (fixedWeeks && monthDates.length < FIXED_WEEKS_DAYS) {
			const daysToAdd = FIXED_WEEKS_DAYS - monthDates.length;
			monthDates.push(
				...dates.filter(
					(date) => date > lastDateOfLastWeek && date <= lib.addDays(lastDateOfLastWeek, daysToAdd)
				)
			);
		}

		const weeks: CalendarWeek[] = [];
		for (const date of monthDates) {
			const weekNumber = ISOWeek ? lib.getISOWeek(date) : lib.getWeek(date);
			const day = createDay(date, month, lib);
			const week = weeks.find((candidate) => candidate.weekNumber === weekNumber);
			if (week) week.days.push(day);
			else weeks.push({ weekNumber, days: [day] });
		}
		return { date: month, weeks };
	});
	return reverseMonths ? months.reverse() : months;
}

export function getPreviousMonth(
	firstMonth: Date,
	navStart: Date | undefined,
	options: GridOptions,
	lib: DateLib
): Date | undefined {
	if (options.disableNavigation) return undefined;
	const offset = options.pagedNavigation ? (options.numberOfMonths ?? 1) : 1;
	const month = lib.startOfMonth(firstMonth);
	if (navStart && lib.differenceInCalendarMonths(month, navStart) <= 0) return undefined;
	return lib.addMonths(month, -offset);
}

export function getNextMonth(
	firstMonth: Date,
	navEnd: Date | undefined,
	options: GridOptions,
	lib: DateLib
): Date | undefined {
	if (options.disableNavigation) return undefined;
	const { numberOfMonths = 1 } = options;
	if (navEnd && lib.differenceInCalendarMonths(navEnd, firstMonth) < numberOfMonths)
		return undefined;
	return lib.addMonths(lib.startOfMonth(firstMonth), options.pagedNavigation ? numberOfMonths : 1);
}

export function clampMonth(
	month: Date,
	navStart: Date | undefined,
	navEnd: Date | undefined,
	lib: DateLib
): Date {
	let clamped = lib.startOfMonth(month);
	if (navStart && clamped < lib.startOfMonth(navStart)) clamped = lib.startOfMonth(navStart);
	if (navEnd && clamped > lib.startOfMonth(navEnd)) clamped = lib.startOfMonth(navEnd);
	return clamped;
}

export function getWeekdays(lib: DateLib, ISOWeek: boolean | undefined): Date[] {
	const today = lib.today();
	const start = ISOWeek ? lib.startOfISOWeek(today) : lib.startOfWeek(today);
	return Array.from({ length: DAYS_PER_WEEK }, (_, offset) => lib.addDays(start, offset));
}

export function getMonthOptions(
	displayMonth: Date,
	navStart: Date | undefined,
	navEnd: Date | undefined,
	format: (month: Date) => string,
	lib: DateLib
): DropdownOption[] {
	const months = lib.eachMonthOfInterval({
		start: lib.startOfYear(displayMonth),
		end: lib.endOfYear(displayMonth)
	});
	return months.map((month) => ({
		value: lib.getMonth(month),
		label: format(month),
		disabled: Boolean(
			(navStart && month < lib.startOfMonth(navStart)) ||
			(navEnd && month > lib.startOfMonth(navEnd))
		)
	}));
}

export function getYearOptions(
	navStart: Date | undefined,
	navEnd: Date | undefined,
	format: (year: Date) => string,
	lib: DateLib
): DropdownOption[] | undefined {
	if (!navStart || !navEnd) return undefined;
	const firstNavYear = lib.startOfYear(navStart);
	const lastNavYear = lib.endOfYear(navEnd);
	const years: Date[] = [];
	let year = firstNavYear;
	while (lib.isBefore(year, lastNavYear) || lib.isSameYear(year, lastNavYear)) {
		years.push(year);
		year = lib.addYears(year, 1);
	}
	return years.map((year) => ({ value: lib.getYear(year), label: format(year), disabled: false }));
}
