// Derived from react-day-picker v9.8.1 src/helpers/createGetModifiers.ts
// (commit bd55df2e3a4917f4c368020f3ef64f60b6882627). MIT, see THIRD_PARTY_NOTICES.md.

import type { DateLib } from './date-lib.js';
import { dateMatchModifiers } from './matchers.js';
import type { CalendarDay, DayFlag, Matcher, Modifiers } from './types.js';

export interface ModifierContext {
	disabled?: Matcher | Matcher[];
	hidden?: Matcher | Matcher[];
	modifiers?: Record<string, Matcher | Matcher[] | undefined>;
	showOutsideDays?: boolean;
	today: Date;
	navStart?: Date;
	navEnd?: Date;
}

export function createGetModifiers(days: CalendarDay[], context: ModifierContext, lib: DateLib) {
	const { disabled, hidden, modifiers, showOutsideDays, today, navStart, navEnd } = context;
	const computedNavStart = navStart && lib.startOfMonth(navStart);
	const computedNavEnd = navEnd && lib.endOfMonth(navEnd);

	const internalModifiersMap: Record<Exclude<DayFlag, 'focused'>, Set<CalendarDay>> = {
		outside: new Set(),
		disabled: new Set(),
		hidden: new Set(),
		today: new Set()
	};
	const customModifiersMap: Record<string, Set<CalendarDay>> = {};

	for (const day of days) {
		const { date, outside } = day;
		const isBeforeNavStart = !!computedNavStart && lib.isBefore(date, computedNavStart);
		const isAfterNavEnd = !!computedNavEnd && lib.isAfter(date, computedNavEnd);
		const isDisabled = !!disabled && dateMatchModifiers(date, disabled, lib);
		const isHidden =
			(!!hidden && dateMatchModifiers(date, hidden, lib)) ||
			isBeforeNavStart ||
			isAfterNavEnd ||
			(!showOutsideDays && outside);

		if (outside) internalModifiersMap.outside.add(day);
		if (isDisabled) internalModifiersMap.disabled.add(day);
		if (isHidden) internalModifiersMap.hidden.add(day);
		if (lib.isSameDay(date, today)) internalModifiersMap.today.add(day);

		for (const [name, matcher] of Object.entries(modifiers ?? {})) {
			if (!matcher || !dateMatchModifiers(date, matcher, lib)) continue;
			(customModifiersMap[name] ??= new Set()).add(day);
		}
	}

	return (day: CalendarDay): Modifiers => {
		const dayFlags: Record<DayFlag, boolean> = {
			focused: false,
			disabled: false,
			hidden: false,
			outside: false,
			today: false
		};
		for (const [name, matched] of Object.entries(internalModifiersMap))
			dayFlags[name as DayFlag] = matched.has(day);
		const customModifiers: Partial<Record<string, boolean>> = {};
		for (const [name, matched] of Object.entries(customModifiersMap))
			customModifiers[name] = matched.has(day);
		return { ...dayFlags, ...customModifiers };
	};
}
