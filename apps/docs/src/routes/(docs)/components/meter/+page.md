# Meter

<Subtitle>
  A graphical display of a numeric value within a range.
</Subtitle>

<Meta name="description" content="A graphical display of a numeric value within a range." />

<DemoMeterHero />

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Meter } from '@sveltery/base/meter';
</script>

<Meter.Root>
	<Meter.Label />
	<Meter.Track>
		<Meter.Indicator />
	</Meter.Track>
	<Meter.Value />
</Meter.Root>
```

## API reference

<script>
	import { DemoMeterHero } from './demos/hero';
	import { TypesMeter } from './types';
</script>

### Root

<TypesMeter.Root />

### Track

<TypesMeter.Track />

### Indicator

<TypesMeter.Indicator />

### Value

<TypesMeter.Value />

### Label

<TypesMeter.Label />
