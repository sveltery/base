// Derived from react-day-picker v9.8.1 src/helpers/calculateFocusTarget.ts, getFocusableDate.ts and getNextFocus.tsx, and the keyboard map in src/DayPicker.tsx
// (commit bd55df2e3a4917f4c368020f3ef64f60b6882627). MIT, see THIRD_PARTY_NOTICES.md.

import type { DateLib } from './date-lib.js';
import { createDay, isSameCalendarDay } from './grid.js';
import { dateMatchModifiers } from './matchers.js';
import type { CalendarDay, Matcher, Modifiers, MoveFocusBy, MoveFocusDir } from './types.js';

export function keyToMove(
	key: string,
	shiftKey: boolean,
	dir: 'ltr' | 'rtl' | undefined
): [MoveFocusBy, MoveFocusDir] | undefined {
	const rtl = dir === 'rtl';
	switch (key) {
		case 'ArrowLeft':
			return [shiftKey ? 'month' : 'day', rtl ? 'after' : 'before'];
		case 'ArrowRight':
			return [shiftKey ? 'month' : 'day', rtl ? 'before' : 'after'];
		case 'ArrowDown':
			return [shiftKey ? 'year' : 'week', 'after'];
		case 'ArrowUp':
			return [shiftKey ? 'year' : 'week', 'before'];
		case 'PageUp':
			return [shiftKey ? 'year' : 'month', 'before'];
		case 'PageDown':
			return [shiftKey ? 'year' : 'month', 'after'];
		case 'Home':
			return ['startOfWeek', 'before'];
		case 'End':
			return ['endOfWeek', 'after'];
		default:
			return undefined;
	}
}

function getFocusableDate(
	moveBy: MoveFocusBy,
	moveDir: MoveFocusDir,
	refDate: Date,
	navStart: Date | undefined,
	navEnd: Date | undefined,
	ISOWeek: boolean | undefined,
	lib: DateLib
): Date {
	const step = moveDir === 'after' ? 1 : -1;
	const moved = {
		day: () => lib.addDays(refDate, step),
		week: () => lib.addWeeks(refDate, step),
		month: () => lib.addMonths(refDate, step),
		year: () => lib.addYears(refDate, step),
		startOfWeek: () => (ISOWeek ? lib.startOfISOWeek(refDate) : lib.startOfWeek(refDate)),
		endOfWeek: () => (ISOWeek ? lib.endOfISOWeek(refDate) : lib.endOfWeek(refDate))
	}[moveBy]();

	if (moveDir === 'before' && navStart) return lib.max([navStart, moved]);
	if (moveDir === 'after' && navEnd) return lib.min([navEnd, moved]);
	return moved;
}

const MAX_ATTEMPTS = 365;

export function getNextFocus(
	moveBy: MoveFocusBy,
	moveDir: MoveFocusDir,
	refDay: CalendarDay,
	navStart: Date | undefined,
	navEnd: Date | undefined,
	options: { disabled?: Matcher | Matcher[]; hidden?: Matcher | Matcher[]; ISOWeek?: boolean },
	lib: DateLib
): CalendarDay | undefined {
	const { disabled, hidden, ISOWeek } = options;
	let date = refDay.date;
	for (let attempt = 0; attempt <= MAX_ATTEMPTS; attempt++) {
		date = getFocusableDate(moveBy, moveDir, date, navStart, navEnd, ISOWeek, lib);
		const blocked =
			(disabled && dateMatchModifiers(date, disabled, lib)) ||
			(hidden && dateMatchModifiers(date, hidden, lib));
		if (!blocked) return createDay(date, date, lib);
	}
	return undefined;
}

export function calculateFocusTarget(
	days: CalendarDay[],
	getModifiers: (day: CalendarDay) => Modifiers,
	isSelected: (date: Date) => boolean,
	lastFocused: CalendarDay | undefined,
	lib: DateLib
): CalendarDay | undefined {
	const priorityOf = (day: CalendarDay, modifiers: Modifiers) => {
		if (modifiers.focused) return 3;
		if (lastFocused && isSameCalendarDay(lastFocused, day, lib)) return 2;
		if (isSelected(day.date)) return 1;
		return modifiers.today ? 0 : -1;
	};

	let target: CalendarDay | undefined;
	let targetPriority = -1;
	let firstFocusable: CalendarDay | undefined;
	for (const day of days) {
		const modifiers = getModifiers(day);
		if (modifiers.disabled || modifiers.hidden || modifiers.outside) continue;
		firstFocusable ??= day;
		const priority = priorityOf(day, modifiers);
		if (priority > targetPriority) {
			target = day;
			targetPriority = priority;
		}
	}
	return target ?? firstFocusable;
}
