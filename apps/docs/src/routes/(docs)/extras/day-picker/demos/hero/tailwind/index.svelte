<script lang="ts">
	import { DayPicker } from '@sveltery/base/day-picker';

	let selected = $state<Date>();
</script>

<DayPicker
	mode="single"
	bind:selected
	class="relative text-sm text-neutral-950 dark:text-white"
	classNames={{
		month_caption: 'flex h-8 items-center px-1 font-medium',
		nav: 'absolute top-0 right-0 flex gap-1',
		button_previous:
			'flex size-8 items-center justify-center rounded-md fill-current hover:bg-neutral-100 aria-disabled:opacity-40 dark:hover:bg-neutral-800',
		button_next:
			'flex size-8 items-center justify-center rounded-md fill-current hover:bg-neutral-100 aria-disabled:opacity-40 dark:hover:bg-neutral-800',
		chevron: 'size-4',
		weekday: 'size-9 text-xs font-normal text-neutral-500',
		day: 'size-9 p-0 text-center',
		day_button:
			'size-9 rounded-md hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-neutral-950 disabled:opacity-40 dark:hover:bg-neutral-800 dark:focus-visible:outline-white',
		today: 'font-semibold',
		selected:
			'[&>button]:bg-neutral-950 [&>button]:text-white dark:[&>button]:bg-white dark:[&>button]:text-neutral-950',
		outside: 'text-neutral-400'
	}}
/>
