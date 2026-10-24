<script lang="ts">
	import { DayPicker } from '#lib/day-picker/index.js';
</script>

<DayPicker
	mode="single"
	today={new Date(2025, 5, 18)}
	showWeekNumber
	data-testid="calendar"
	class="extra"
	classNames={{ day: 'cell' }}
	modifiers={{ booked: new Date(2025, 5, 10) }}
	modifiersClassNames={{ booked: 'is-booked' }}
>
	{#snippet root({ props: { children, ...props } })}
		<div {...props} role="region" aria-label="Calendar">{@render children()}</div>
	{/snippet}
	{#snippet dayButton({ props, text, modifiers })}
		<button {...props} data-booked={modifiers.booked || undefined}>[{text}]</button>
	{/snippet}
	{#snippet chevron({ orientation })}
		<span data-testid="chevron">{orientation}</span>
	{/snippet}
	{#snippet weekNumber({ props, text })}
		<th {...props}>W{text}</th>
	{/snippet}
	{#snippet footer()}
		Pick a day
	{/snippet}
</DayPicker>
