// React react-day-picker 9.8.1 counterpart of DayPickerFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { DayPicker, type DateRange } from 'react-day-picker';
import { mountApp } from '../react-fixture.js';
import { today, type DayPickerCase } from './cases.js';

const iso = (date: Date | undefined) => (date ? format(date, 'yyyy-MM-dd') : '');

function output(testid: string, text: string) {
	return h('output', { 'data-testid': testid }, text);
}

export function mountDayPickerReference(
	node: HTMLElement,
	scenario: DayPickerCase,
	onReady: () => void
) {
	function App() {
		const [single, setSingle] = useState<Date | undefined>(today);
		const [range, setRange] = useState<DateRange>();
		const [multiple, setMultiple] = useState<Date[]>();
		const [month, setMonth] = useState<Date>();
		useEffect(onReady, []);

		if (scenario === 'single') {
			return h(
				Fragment,
				null,
				h(DayPicker, {
					mode: 'single',
					selected: single,
					onSelect: setSingle,
					today,
					disabled: [new Date(2025, 5, 19), { dayOfWeek: [0] }]
				}),
				output('selected', iso(single))
			);
		}
		if (scenario === 'range') {
			return h(
				Fragment,
				null,
				h(DayPicker, {
					mode: 'range',
					selected: range,
					onSelect: setRange,
					today,
					numberOfMonths: 2,
					disabled: { before: new Date(2025, 5, 5) }
				}),
				output('selected', range ? `${iso(range.from)} to ${iso(range.to)}` : '')
			);
		}
		if (scenario === 'multiple') {
			return h(
				Fragment,
				null,
				h(DayPicker, {
					mode: 'multiple',
					selected: multiple,
					onSelect: setMultiple,
					today,
					max: 2
				}),
				output('selected', multiple?.map(iso).join(', ') ?? '')
			);
		}
		if (scenario === 'dropdown') {
			return h(
				Fragment,
				null,
				h(DayPicker, {
					month,
					onMonthChange: setMonth,
					today,
					captionLayout: 'dropdown',
					startMonth: new Date(2024, 0),
					endMonth: new Date(2026, 11)
				}),
				output('month', iso(month))
			);
		}
		return h(DayPicker, {
			today,
			defaultMonth: new Date(2025, 1),
			showOutsideDays: true,
			showWeekNumber: true,
			fixedWeeks: true,
			ISOWeek: true
		});
	}

	return mountApp(node, App);
}
