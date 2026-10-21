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
2. Thumbs take their index in the value array from the order they render. Specify a numeric `index` for a thumb that renders out of order

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

### Native attributes and events

Each `<Slider.Thumb>` renders an `<input type="range">` that submits its value. Native input attributes and handlers on `<Slider.Root>`, such as `name`, `form`, `required`, `oninput` and `onchange`, go to every thumb's input, and the ones on `<Slider.Thumb>` go to that thumb's input. `class` and `style` stay on the element you see, and `host` sends any other attribute there:

```svelte title="Reading the value"
<Slider.Root
	name="volume"
	bind:value={volume}
	onchange={(event) => save(event.currentTarget.valueAsNumber)}
	host={{ 'data-section': 'audio' }}
>
	<!-- ... -->
</Slider.Root>
```

The input fires `input` while the value moves, and `change` when it settles: on release, or after a key press, as a native range input does.

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
			<Slider.Root host={props} defaultValue={[25, 75]}>
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

The fieldset's props go through `host`, because props spread on `<Slider.Root>` go to the thumb inputs.

With a SvelteKit remote form, spread the field's `range` props. One thumb takes the spread on `<Slider.Root>`. A range takes one spread per thumb, because a tuple field has no `.as()` of its own. Each spread names its input and holds its value, which moves the thumb whenever the form changes it, as after a failed submit. A spread of another input kind is a type error:

```svelte title="Using Slider in a remote form"
<Form form={search}>
	<Field.Root name="volume">
		<Field.Label>Volume</Field.Label>
		<!-- @highlight -->
		<Slider.Root {...search.fields.volume.as('range', 50)}>
			<!-- ... -->
		</Slider.Root>
	</Field.Root>
	<Field.Root name="price">
		<Slider.Root min={0} max={1000} defaultValue={[0, 1000]}>
			<Slider.Control>
				<Slider.Track>
					<Slider.Indicator />
					<!-- @highlight-start -->
					<Slider.Thumb {...search.fields.price[0].as('range', 0)} aria-label="Minimum price" />
					<Slider.Thumb {...search.fields.price[1].as('range', 1000)} aria-label="Maximum price" />
					<!-- @highlight-end -->
				</Slider.Track>
			</Slider.Control>
		</Slider.Root>
		<Field.Error />
	</Field.Root>
</Form>
```

The thumbs' spreads come after the root renders, so give `<Slider.Root>` the same `defaultValue` for the server HTML to paint the indicator before the first submit. After a failed submit, the root reads the field's values and paints it. Without a spread, thumbs in a named Field bind themselves to the field: a number `defaultValue` binds the field, and an array binds `price[0]`, `price[1]` and so on.

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
