// Derived from react-day-picker v9.8.1 src/classes/DateLib.ts
// (commit bd55df2e3a4917f4c368020f3ef64f60b6882627). MIT, see THIRD_PARTY_NOTICES.md.

import { TZDate } from '@date-fns/tz';
import type { Interval } from 'date-fns';
import {
	addDays,
	addMonths,
	addWeeks,
	addYears,
	differenceInCalendarDays,
	differenceInCalendarMonths,
	eachMonthOfInterval,
	endOfISOWeek,
	endOfMonth,
	endOfWeek,
	endOfYear,
	format,
	getISOWeek,
	getMonth,
	getWeek,
	getYear,
	isAfter,
	isBefore,
	isDate,
	isSameDay,
	isSameMonth,
	isSameYear,
	max,
	min,
	setMonth,
	setYear,
	startOfDay,
	startOfISOWeek,
	startOfMonth,
	startOfWeek,
	startOfYear
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { DateLibLike, DateLibOptions } from './types.js';

/** date-fns bound to a locale, week settings and an optional time zone. Members are arrow functions so they can be destructured. */
export class DateLib implements DateLibLike {
	readonly options: DateLibOptions;
	readonly #fns: Pick<DateLibOptions, 'locale' | 'weekStartsOn' | 'firstWeekContainsDate'>;

	constructor(options: DateLibOptions = {}) {
		this.options = { ...options, locale: options.locale ?? enUS };
		const { locale, weekStartsOn, firstWeekContainsDate } = this.options;
		this.#fns = { locale, weekStartsOn, firstWeekContainsDate };
	}

	today = (): Date => {
		const { timeZone } = this.options;
		return timeZone ? TZDate.tz(timeZone) : new Date();
	};

	newDate = (year: number, monthIndex: number, date: number): Date => {
		const { timeZone } = this.options;
		return timeZone
			? new TZDate(year, monthIndex, date, timeZone)
			: new Date(year, monthIndex, date);
	};

	toZone = (date: Date): Date => {
		const { timeZone } = this.options;
		if (!timeZone) return date;
		return date instanceof TZDate && date.timeZone === timeZone ? date : new TZDate(date, timeZone);
	};

	addDays = addDays<Date, Date>;
	addWeeks = addWeeks<Date, Date>;
	addMonths = addMonths<Date, Date>;
	addYears = addYears<Date, Date>;
	differenceInCalendarDays = differenceInCalendarDays;
	differenceInCalendarMonths = differenceInCalendarMonths;
	startOfMonth = startOfMonth<Date, Date>;
	endOfMonth = endOfMonth<Date, Date>;
	startOfISOWeek = startOfISOWeek<Date, Date>;
	endOfISOWeek = endOfISOWeek<Date, Date>;
	startOfYear = startOfYear<Date, Date>;
	endOfYear = endOfYear<Date, Date>;
	startOfDay = startOfDay<Date, Date>;
	isSameDay = isSameDay;
	isSameMonth = isSameMonth;
	isSameYear = isSameYear;
	isBefore = isBefore;
	isAfter = isAfter;
	isDate: (value: unknown) => value is Date = isDate;
	getISOWeek = getISOWeek;
	setMonth = setMonth<Date, Date>;
	setYear = setYear<Date, Date>;
	max = (dates: Date[]): Date => max(dates);
	min = (dates: Date[]): Date => min(dates);

	startOfWeek = (date: Date): Date => startOfWeek(date, this.#fns);
	endOfWeek = (date: Date): Date => endOfWeek(date, this.#fns);
	getWeek = (date: Date): number => getWeek(date, this.#fns);
	getMonth = (date: Date): number => getMonth(date);
	getYear = (date: Date): number => getYear(date);
	format = (date: Date, pattern: string): string => format(date, pattern, this.#fns);
	eachMonthOfInterval = (interval: Interval): Date[] => eachMonthOfInterval(interval);
}
