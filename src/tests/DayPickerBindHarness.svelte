<script lang="ts">
	import { format } from 'date-fns';
	import { DayPicker } from '#lib/day-picker/index.js';

	let {
		defaultSelected,
		defaultMonth,
		onSelect,
		onMonthChange
	}: {
		defaultSelected?: Date;
		defaultMonth?: Date;
		onSelect?: (selected: Date | undefined, triggerDate: Date) => void;
		onMonthChange?: (month: Date) => void;
	} = $props();

	let selected = $state<Date>();
	let month = $state<Date>();
	const iso = (date: Date | undefined) => (date ? format(date, 'yyyy-MM-dd') : '');
</script>

<DayPicker
	mode="single"
	bind:selected
	bind:month
	{defaultSelected}
	{defaultMonth}
	today={new Date(2025, 5, 18)}
	{onSelect}
	{onMonthChange}
/>
<output data-testid="selected">{iso(selected)}</output>
<output data-testid="month">{iso(month)}</output>
<button type="button" onclick={() => (selected = new Date(2025, 5, 2))}>Owner selects</button>
<button type="button" onclick={() => (month = new Date(2025, 9, 1))}>Owner shows October</button>
