<script lang="ts">
	import { Progress } from '@sveltery/base/progress';

	let value = $state(20);

	// Simulate changes
	$effect(() => {
		const interval = setInterval(() => {
			value = Math.min(100, Math.round(value + Math.random() * 25));
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

<Progress.Root class="grid w-60 max-w-full grid-cols-2 gap-y-2" {value}>
	<Progress.Label class="text-sm font-normal text-neutral-950 dark:text-white">
		Export data
	</Progress.Label>
	<Progress.Value class="text-right text-sm text-neutral-950 dark:text-white" />
	<Progress.Track class="col-span-2 h-1 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
		<Progress.Indicator class="bg-neutral-950 transition-[width] duration-500 dark:bg-white" />
	</Progress.Track>
</Progress.Root>
