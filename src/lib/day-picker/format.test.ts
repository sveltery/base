import { es } from 'date-fns/locale';
import { describe, expect, it } from 'vitest';
import { DateLib } from './date-lib.js';
import { defaultFormatters, defaultLabels } from './format.js';
import type { Modifiers } from './types.js';

const lib = new DateLib();
const march10 = new Date(2024, 2, 10);
const none: Modifiers = {
	disabled: false,
	hidden: false,
	outside: false,
	today: false,
	focused: false,
	selected: false,
	range_start: false,
	range_middle: false,
	range_end: false
};

describe('defaultFormatters', () => {
	it('formats the caption as month and year', () => {
		expect(defaultFormatters.formatCaption(march10, lib)).toBe('March 2024');
		expect(defaultFormatters.formatCaption(march10, new DateLib({ locale: es }))).toBe(
			'marzo 2024'
		);
	});

	it('formats the day of the month', () => {
		expect(defaultFormatters.formatDay(march10, lib)).toBe('10');
		expect(defaultFormatters.formatDay(new Date(2024, 2, 5), lib)).toBe('5');
	});

	it('formats the dropdown options', () => {
		expect(defaultFormatters.formatMonthDropdown(march10, lib)).toBe('March');
		expect(defaultFormatters.formatYearDropdown(march10, lib)).toBe('2024');
	});

	it('formats the weekday name with two letters', () => {
		expect(defaultFormatters.formatWeekdayName(march10, lib)).toBe('Su');
		expect(defaultFormatters.formatWeekdayName(march10, new DateLib({ locale: es }))).toBe('do');
	});

	it('pads the week number to two digits', () => {
		expect(defaultFormatters.formatWeekNumber(3, lib)).toBe('03');
		expect(defaultFormatters.formatWeekNumber(12, lib)).toBe('12');
		expect(defaultFormatters.formatWeekNumber(53, lib)).toBe('53');
	});

	it('has an empty week number header', () => {
		expect(defaultFormatters.formatWeekNumberHeader()).toBe('');
	});
});

describe('defaultLabels', () => {
	it('describes a day button', () => {
		expect(defaultLabels.labelDayButton(march10, none, lib)).toBe('Sunday, March 10th, 2024');
		expect(defaultLabels.labelDayButton(march10, { ...none, today: true }, lib)).toBe(
			'Today, Sunday, March 10th, 2024'
		);
		expect(defaultLabels.labelDayButton(march10, { ...none, selected: true }, lib)).toBe(
			'Sunday, March 10th, 2024, selected'
		);
		expect(
			defaultLabels.labelDayButton(march10, { ...none, today: true, selected: true }, lib)
		).toBe('Today, Sunday, March 10th, 2024, selected');
	});

	it('describes a grid cell without the selection', () => {
		expect(defaultLabels.labelGridcell(march10, none, lib)).toBe('Sunday, March 10th, 2024');
		expect(defaultLabels.labelGridcell(march10, { ...none, today: true }, lib)).toBe(
			'Today, Sunday, March 10th, 2024'
		);
		expect(defaultLabels.labelGridcell(march10, { ...none, selected: true }, lib)).toBe(
			'Sunday, March 10th, 2024'
		);
	});

	it('describes the grid by month and year', () => {
		expect(defaultLabels.labelGrid(march10, lib)).toBe('March 2024');
	});

	it('labels the controls', () => {
		expect(defaultLabels.labelMonthDropdown()).toBe('Choose the Month');
		expect(defaultLabels.labelYearDropdown()).toBe('Choose the Year');
		expect(defaultLabels.labelNext(march10)).toBe('Go to the Next Month');
		expect(defaultLabels.labelNext(undefined)).toBe('Go to the Next Month');
		expect(defaultLabels.labelPrevious(march10)).toBe('Go to the Previous Month');
		expect(defaultLabels.labelNav()).toBe('');
	});

	it('labels weekdays and week numbers', () => {
		expect(defaultLabels.labelWeekday(march10, lib)).toBe('Sunday');
		expect(defaultLabels.labelWeekNumber(4)).toBe('Week 4');
		expect(defaultLabels.labelWeekNumberHeader()).toBe('Week Number');
	});
});
