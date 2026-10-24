// Derived from react-day-picker v9.8.1 src/helpers/getDefaultClassNames.ts and src/UI.ts
// (commit bd55df2e3a4917f4c368020f3ef64f60b6882627). MIT, see THIRD_PARTY_NOTICES.md.

import type { ClassNames, DayFlag, SelectionState, UI } from './types.js';

const keys: (UI | DayFlag | SelectionState)[] = [
	'root',
	'chevron',
	'day',
	'day_button',
	'caption_label',
	'dropdowns',
	'dropdown',
	'dropdown_root',
	'footer',
	'month_grid',
	'month_caption',
	'months_dropdown',
	'month',
	'months',
	'nav',
	'button_next',
	'button_previous',
	'week',
	'weeks',
	'weekday',
	'weekdays',
	'week_number',
	'week_number_header',
	'years_dropdown',
	'disabled',
	'hidden',
	'outside',
	'focused',
	'today',
	'selected',
	'range_start',
	'range_middle',
	'range_end'
];

/** react-day-picker's `rdp-*` class for every part and modifier. */
export const defaultClassNames = Object.fromEntries(
	keys.map((key) => [key, `rdp-${key}`])
) as ClassNames;
