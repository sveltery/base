// Derived from react-day-picker v9.8.1 src/selection/useSingle.tsx, useMulti.tsx and useRange.tsx, and src/utils/addToRange.ts
// (commit bd55df2e3a4917f4c368020f3ef64f60b6882627). MIT, see THIRD_PARTY_NOTICES.md.

import type { DateLib } from './date-lib.js';
import { isDateRange, rangeContainsModifiers, rangeIncludesDate } from './matchers.js';
import type { DateRange, Matcher, Mode } from './types.js';

export function selectSingle(
	selected: Date | undefined,
	date: Date,
	options: { required?: boolean },
	lib: DateLib
): Date | undefined {
	return !options.required && selected && lib.isSameDay(selected, date) ? undefined : date;
}

export function selectMultiple(
	selected: Date[] | undefined,
	date: Date,
	options: { required?: boolean; min?: number; max?: number },
	lib: DateLib
): Date[] | undefined {
	const { required, min, max } = options;
	const current = selected ?? [];
	if (current.some((day) => lib.isSameDay(day, date))) {
		if (current.length === min || (required && current.length === 1)) return selected;
		return current.filter((day) => !lib.isSameDay(day, date));
	}
	return current.length === max ? [date] : [...current, date];
}

function addToRange(
	date: Date,
	range: DateRange | undefined,
	options: { required?: boolean; min?: number; max?: number },
	lib: DateLib
): DateRange | undefined {
	const { required = false, min = 0, max = 0 } = options;
	const { from, to } = range ?? {};
	let next: DateRange | undefined;

	if (!from && !to) {
		next = { from: date, to: min > 0 ? undefined : date };
	} else if (from && !to) {
		if (lib.isSameDay(from, date)) {
			if (required) next = { from, to: undefined };
		} else if (lib.isBefore(date, from)) {
			next = { from: date, to: from };
		} else {
			next = { from, to: date };
		}
	} else if (from && to) {
		if (lib.isSameDay(from, date) && lib.isSameDay(to, date)) {
			if (required) next = { from, to };
		} else if (lib.isSameDay(from, date)) {
			next = { from, to: min > 0 ? undefined : date };
		} else if (lib.isSameDay(to, date)) {
			next = { from: date, to: min > 0 ? undefined : date };
		} else if (lib.isBefore(date, from)) {
			next = { from: date, to };
		} else {
			next = { from, to: date };
		}
	}

	if (next?.from && next.to) {
		const span = lib.differenceInCalendarDays(next.to, next.from);
		if ((max > 0 && span > max) || (min > 1 && span < min)) next = { from: date, to: undefined };
	}
	return next;
}

export function selectRange(
	selected: DateRange | undefined,
	date: Date,
	options: {
		required?: boolean;
		min?: number;
		max?: number;
		disabled?: Matcher | Matcher[];
		excludeDisabled?: boolean;
	},
	lib: DateLib
): DateRange | undefined {
	const { disabled, excludeDisabled } = options;
	let next = addToRange(date, selected, options, lib);

	if (
		excludeDisabled &&
		disabled &&
		next?.from &&
		next.to &&
		rangeContainsModifiers({ from: next.from, to: next.to }, disabled, lib)
	) {
		next = { from: date, to: undefined };
	}
	return next;
}

export function isSelected(
	mode: Mode | undefined,
	selected: Date | Date[] | DateRange | undefined,
	date: Date,
	lib: DateLib
): boolean {
	switch (mode) {
		case 'single':
			return lib.isDate(selected) && lib.isSameDay(selected, date);
		case 'multiple':
			return Array.isArray(selected) && selected.some((day) => lib.isSameDay(day, date));
		case 'range':
			return isDateRange(selected) && rangeIncludesDate(selected, date, false, lib);
		default:
			return false;
	}
}
