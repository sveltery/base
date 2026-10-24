// Derived from react-day-picker v9.8.1 src/helpers/getDataAttributes.tsx and the day cell attributes in
// src/DayPicker.tsx (commit bd55df2e3a4917f4c368020f3ef64f60b6882627). MIT, see THIRD_PARTY_NOTICES.md.

export const DayPickerDataAttributes = {
	/**
	 * Present when a selection mode is set.
	 * @type {'single' | 'multiple' | 'range'}
	 */
	mode: 'data-mode',
	/**
	 * Present when `required` is set on a selection mode.
	 */
	required: 'data-required',
	/**
	 * Present when more than one month is shown.
	 */
	multipleMonths: 'data-multiple-months',
	/**
	 * Present when week numbers are shown.
	 */
	weekNumbers: 'data-week-numbers',
	/**
	 * Present when `navLayout` is set.
	 * @type {'around' | 'after'}
	 */
	navLayout: 'data-nav-layout',
	/**
	 * On a day cell. The day's date, as `yyyy-MM-dd`.
	 */
	day: 'data-day',
	/**
	 * On a day cell. The month of an outside day, as `yyyy-MM`.
	 */
	month: 'data-month',
	/**
	 * On a day cell. Present when the day is selected.
	 */
	selected: 'data-selected',
	/**
	 * On a day cell. Present when the day is disabled.
	 */
	disabled: 'data-disabled',
	/**
	 * On a day cell. Present when the day is hidden.
	 */
	hidden: 'data-hidden',
	/**
	 * On a day cell. Present when the day belongs to the month before or after.
	 */
	outside: 'data-outside',
	/**
	 * On a day cell. Present when the day has focus.
	 */
	focused: 'data-focused',
	/**
	 * On a day cell. Present when the day is today.
	 */
	today: 'data-today'
} as const;
