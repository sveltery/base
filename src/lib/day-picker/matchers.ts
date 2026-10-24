// Derived from react-day-picker v9.8.1 src/utils/dateMatchModifiers.ts, rangeIncludesDate.ts, rangeContainsModifiers.ts, rangeContainsDayOfWeek.ts, rangeOverlaps.ts and typeguards.ts
// (commit bd55df2e3a4917f4c368020f3ef64f60b6882627). MIT, see THIRD_PARTY_NOTICES.md.

import type { DateLib } from './date-lib.js';
import type {
	DateAfter,
	DateBefore,
	DateInterval,
	DateRange,
	DayOfWeek,
	Matcher
} from './types.js';

type Span = { from: Date; to: Date };

const hasKey = (value: unknown, key: string): boolean =>
	typeof value === 'object' && value !== null && key in value;

export const isDateRange = (value: unknown): value is DateRange => hasKey(value, 'from');
const isDateInterval = (value: unknown): value is DateInterval =>
	hasKey(value, 'before') && hasKey(value, 'after');
const isDateAfter = (value: unknown): value is DateAfter => hasKey(value, 'after');
const isDateBefore = (value: unknown): value is DateBefore => hasKey(value, 'before');
const isDayOfWeek = (value: unknown): value is DayOfWeek => hasKey(value, 'dayOfWeek');
const isDatesArray = (value: unknown, lib: DateLib): value is Date[] =>
	Array.isArray(value) && value.every(lib.isDate);

const toList = <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value]);

export function rangeIncludesDate(
	range: DateRange,
	date: Date,
	excludeEnds: boolean,
	lib: DateLib
): boolean {
	let { from, to } = range;
	if (from && to) {
		if (lib.differenceInCalendarDays(to, from) < 0) [from, to] = [to, from];
		const margin = excludeEnds ? 1 : 0;
		return (
			lib.differenceInCalendarDays(date, from) >= margin &&
			lib.differenceInCalendarDays(to, date) >= margin
		);
	}
	if (excludeEnds) return false;
	const end = to ?? from;
	return end ? lib.isSameDay(end, date) : false;
}

export function dateMatchModifiers(
	date: Date,
	matchers: Matcher | Matcher[],
	lib: DateLib
): boolean {
	return toList(matchers).some((matcher) => {
		if (typeof matcher === 'boolean') return matcher;
		if (lib.isDate(matcher)) return lib.isSameDay(date, matcher);
		if (isDatesArray(matcher, lib)) return matcher.includes(date);
		if (isDateRange(matcher)) return rangeIncludesDate(matcher, date, false, lib);
		if (isDayOfWeek(matcher)) return toList(matcher.dayOfWeek).includes(date.getDay());
		if (isDateInterval(matcher)) {
			const isDayBefore = lib.differenceInCalendarDays(matcher.before, date) > 0;
			const isDayAfter = lib.differenceInCalendarDays(matcher.after, date) < 0;
			return lib.isAfter(matcher.before, matcher.after)
				? isDayAfter && isDayBefore
				: isDayBefore || isDayAfter;
		}
		if (isDateAfter(matcher)) return lib.differenceInCalendarDays(date, matcher.after) > 0;
		if (isDateBefore(matcher)) return lib.differenceInCalendarDays(matcher.before, date) > 0;
		if (typeof matcher === 'function') return matcher(date);
		return false;
	});
}

const rangeOverlaps = (a: Span, b: Span, lib: DateLib): boolean =>
	rangeIncludesDate(a, b.from, false, lib) ||
	rangeIncludesDate(a, b.to, false, lib) ||
	rangeIncludesDate(b, a.from, false, lib) ||
	rangeIncludesDate(b, a.to, false, lib);

function rangeContainsDayOfWeek(range: Span, dayOfWeek: number | number[], lib: DateLib): boolean {
	const days = toList(dayOfWeek);
	const lastOffset = Math.min(lib.differenceInCalendarDays(range.to, range.from), 6);
	for (let offset = 0; offset <= lastOffset; offset++) {
		if (days.includes(lib.addDays(range.from, offset).getDay())) return true;
	}
	return false;
}

export function rangeContainsModifiers(
	range: Span,
	matchers: Matcher | Matcher[],
	lib: DateLib
): boolean {
	const list = toList(matchers);
	const touchesEnds = (matcher: Matcher) =>
		dateMatchModifiers(range.from, matcher, lib) || dateMatchModifiers(range.to, matcher, lib);

	const matchesStatic = list.some((matcher) => {
		if (typeof matcher === 'function') return false;
		if (typeof matcher === 'boolean') return matcher;
		if (lib.isDate(matcher)) return rangeIncludesDate(range, matcher, false, lib);
		if (isDatesArray(matcher, lib))
			return matcher.some((day) => rangeIncludesDate(range, day, false, lib));
		if (isDateRange(matcher))
			return matcher.from && matcher.to
				? rangeOverlaps(range, { from: matcher.from, to: matcher.to }, lib)
				: false;
		if (isDayOfWeek(matcher)) return rangeContainsDayOfWeek(range, matcher.dayOfWeek, lib);
		if (isDateInterval(matcher)) {
			if (!lib.isAfter(matcher.before, matcher.after)) return touchesEnds(matcher);
			return rangeOverlaps(
				range,
				{ from: lib.addDays(matcher.after, 1), to: lib.addDays(matcher.before, -1) },
				lib
			);
		}
		if (isDateAfter(matcher) || isDateBefore(matcher)) return touchesEnds(matcher);
		return false;
	});
	if (matchesStatic) return true;

	const fns = list.filter((matcher) => typeof matcher === 'function');
	if (fns.length === 0) return false;
	const totalDays = lib.differenceInCalendarDays(range.to, range.from);
	for (let offset = 0; offset <= totalDays; offset++) {
		const day = lib.addDays(range.from, offset);
		if (fns.some((fn) => fn(day))) return true;
	}
	return false;
}
