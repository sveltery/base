# Slider

<Subtitle>
  An easily stylable range input.
</Subtitle>

<Meta name="description" content="An easily stylable range input." />

<DemoSliderHero />

## Usage guidelines

- **Form controls must have an accessible name**: Prefer `<Slider.Label>`, or provide an `aria-label` on each `<Slider.Thumb>` when no visible label is rendered. See [Labeling a slider](#labeling-a-slider) and the [forms guide](/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Slider } from '@sveltery/base/slider';
</script>

<Slider.Root>
	<Slider.Label />
	<Slider.Value />
	<Slider.Control>
		<Slider.Track>
			<Slider.Indicator />
			<Slider.Thumb />
		</Slider.Track>
	</Slider.Control>
</Slider.Root>
```

## Examples

### Labeling a slider

A single-thumb slider without a visible label (such as a volume control) can be labeled using `aria-label` on `<Slider.Thumb>`:

```svelte title="Slider with invisible label"
<Slider.Root>
	<Slider.Control>
		<Slider.Track>
			<Slider.Indicator />
			<!-- @highlight -->
			<Slider.Thumb aria-label="Volume" />
		</Slider.Track>
	</Slider.Control>
</Slider.Root>
```

A visible label can be created using `<Slider.Label>`:

```svelte title="Slider with visible label"
<Slider.Root>
	<!-- @highlight -->
	<Slider.Label>Volume</Slider.Label>
	<Slider.Control>
		<Slider.Track>
			<Slider.Indicator />
			<Slider.Thumb />
		</Slider.Track>
	</Slider.Control>
</Slider.Root>
```

For a multi-thumb range slider with a visible label, add `aria-label` on each `<Slider.Thumb>` to distinguish them:

```svelte title="Labeling multi-thumb range sliders"
<Slider.Root defaultValue={[25, 75]}>
	<Slider.Label>Price range</Slider.Label>
	<Slider.Control>
		<Slider.Track>
			<Slider.Indicator />
			<!-- @highlight-start -->
			<Slider.Thumb index={0} aria-label="Minimum price" />
			<Slider.Thumb index={1} aria-label="Maximum price" />
			<!-- @highlight-end -->
		</Slider.Track>
	</Slider.Control>
</Slider.Root>
```

### Range slider

To create a range slider:

1. Pass an array of values and place a `<Slider.Thumb>` for each value in the array
2. Additionally for server-side rendering, specify a numeric `index` for each thumb that corresponds to the index of its value in the value array

Thumbs can be configured to behave differently when they collide during pointer interactions using the `thumbCollisionBehavior` prop on `<Slider.Root>`.

<DemoSliderRangeSlider />

### Steps

Use the `step` prop to snap the value to multiples of a given increment, and `largeStep` to control the increment when using Page Up/Page Down or Shift + Arrow Up/Arrow Down.

<DemoSliderSteps />

### Marks

Render your own tick marks, positioning each mark along the track as a percentage of the value range.

<DemoSliderMarks />

Marks are independent of the value's granularity—pair them with the [`step`](#steps) prop to snap the thumb to each mark.

### Thumb alignment

Set `thumbAlignment="edge"` to inset the thumb such that its edge aligns with the edge of the control when the value is at `min` or `max`, without overflowing the control like the default `"center"` alignment.

A client-only alternative `thumbAlignment="edge-client-only"` can be used to reduce bundle size but only renders after Svelte hydration.

<DemoSliderEdgeAlignment />

### Vertical

Set `orientation="vertical"` on `<Slider.Root>` to build a vertical slider.

<DemoSliderVertical />

### Form integration

To use a slider in a form, pass the slider `name` to `<Slider.Root>`:

```svelte title="Using Slider in a form"
<Form>
	<!-- @highlight -->
	<Slider.Root name="volume">
		<Slider.Label>Volume</Slider.Label>
		<Slider.Control>
			<Slider.Track>
				<Slider.Indicator />
				<Slider.Thumb />
			</Slider.Track>
		</Slider.Control>
	</Slider.Root>
</Form>
```

For grouped multi-thumb range sliders in forms, [Fieldset](/components/fieldset) can provide the shared visible label while each thumb keeps its own `aria-label`:

```svelte title="Using Fieldset with a multi-thumb slider"
<Field.Root>
	<!-- @highlight-start -->
	<Fieldset.Root>
		{#snippet render(props, state, children)}
			<Slider.Root {...props} defaultValue={[25, 75]}>
				{@render children?.()}
			</Slider.Root>
		{/snippet}
		<Fieldset.Legend>Price range</Fieldset.Legend>
		<!-- @highlight-end -->
		<Slider.Control>
			<Slider.Track>
				<Slider.Indicator />
				<!-- @highlight-start -->
				<Slider.Thumb index={0} aria-label="Minimum price" />
				<Slider.Thumb index={1} aria-label="Maximum price" />
				<!-- @highlight-end -->
			</Slider.Track>
		</Slider.Control>
	</Fieldset.Root>
</Field.Root>
```

## API reference

<script>
	import { DemoSliderHero } from './demos/hero';
	import { DemoSliderRangeSlider } from './demos/range-slider';
	import { DemoSliderSteps } from './demos/steps';
	import { DemoSliderMarks } from './demos/marks';
	import { DemoSliderEdgeAlignment } from './demos/edge-alignment';
	import { DemoSliderVertical } from './demos/vertical';
	import { TypesSlider } from './types';
</script>

### Root

<TypesSlider.Root />

### Label

<TypesSlider.Label />

### Value

<TypesSlider.Value />

### Control

<TypesSlider.Control />

### Track

<TypesSlider.Track />

### Indicator

<TypesSlider.Indicator />

### Thumb

<TypesSlider.Thumb />
