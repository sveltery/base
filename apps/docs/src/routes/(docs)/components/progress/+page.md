# Progress

<Subtitle>
  Displays the status of a task that takes a long time.
</Subtitle>

<Meta name="description" content="Displays the status of a task that takes a long time." />

<DemoProgressHero />

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
	import { DemoProgressHero } from './demos/hero';
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
