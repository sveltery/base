# Progress

<Subtitle>
  Displays the status of a task that takes a long time.
</Subtitle>

<Meta name="description" content="Displays the status of a task that takes a long time." />

```svelte demo
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
```

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Progress } from '@sveltery/base/progress';
</script>

<Progress.Root>
	<Progress.Label />
	<Progress.Track>
		<Progress.Indicator />
	</Progress.Track>
	<Progress.Value />
</Progress.Root>
```

## API reference

<script>
	import { TypesProgress } from './types';
</script>

### Root

<TypesProgress.Root />

### Track

<TypesProgress.Track />

### Indicator

<TypesProgress.Indicator />

### Value

<TypesProgress.Value />

### Label

<TypesProgress.Label />
