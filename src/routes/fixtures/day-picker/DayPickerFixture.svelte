<script lang="ts">
	import { format } from 'date-fns';
	import { DayPicker, type DateRange } from '#lib/day-picker/index.js';
	import { today, type DayPickerCase } from './cases.js';

	let { scenario }: { scenario: DayPickerCase } = $props();

	const iso = (date: Date | undefined) => (date ? format(date, 'yyyy-MM-dd') : '');

	let single = $state<Date | undefined>(today);
	let range = $state<DateRange>();
	let multiple = $state<Date[]>();
	let month = $state<Date>();
</script>

{#if scenario === 'single'}
	<DayPicker
		mode="single"
		bind:selected={single}
		{today}
		disabled={[new Date(2025, 5, 19), { dayOfWeek: [0] }]}
	/>
	<output data-testid="selected">{iso(single)}</output>
{:else if scenario === 'range'}
	<DayPicker
		mode="range"
		bind:selected={range}
		{today}
		numberOfMonths={2}
		disabled={{ before: new Date(2025, 5, 5) }}
	/>
	<output data-testid="selected">{range ? `${iso(range.from)} to ${iso(range.to)}` : ''}</output>
{:else if scenario === 'multiple'}
	<DayPicker mode="multiple" bind:selected={multiple} {today} max={2} />
	<output data-testid="selected">{multiple?.map(iso).join(', ') ?? ''}</output>
{:else if scenario === 'dropdown'}
	<DayPicker
		bind:month
		{today}
		captionLayout="dropdown"
		startMonth={new Date(2024, 0)}
		endMonth={new Date(2026, 11)}
	/>
	<output data-testid="month">{iso(month)}</output>
{:else}
	<DayPicker
		{today}
		defaultMonth={new Date(2025, 1)}
		showOutsideDays
		showWeekNumber
		fixedWeeks
		ISOWeek
	/>
{/if}
