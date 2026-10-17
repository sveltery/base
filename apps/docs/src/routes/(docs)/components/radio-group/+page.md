# Radio Group

<Subtitle>
  Provides shared state to a series of radio buttons.
</Subtitle>

<Meta name="description" content="Provides shared state to a series of radio buttons." />

<DemoRadioHero />

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using `<label>` elements, or the `Field` and `Fieldset` components. See [Labeling a radio group](#labeling-a-radio-group) and the [forms guide](/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';
</script>

<RadioGroup>
	<Radio.Root>
		<Radio.Indicator />
	</Radio.Root>
</RadioGroup>
```

## Examples

### Labeling a radio group

Label the group with `aria-labelledby` and a sibling label element:

```svelte title="Using aria-labelledby to label a radio group"
<div id="storage-type-label">Storage type</div>
<RadioGroup aria-labelledby="storage-type-label">
	<!-- ... -->
</RadioGroup>
```

An enclosing `<label>` is the simplest labeling pattern for each radio:

```svelte title="Using an enclosing label to label a radio button"
<!-- @highlight -->
<label>
	<Radio.Root value="ssd" />
	SSD
	<!-- @highlight -->
</label>
```

### Rendering as a native button

By default, `<Radio.Root>` renders a `<span>` element to support enclosing labels. Prefer rendering each radio as a native button when using sibling labels (`for`/`id`).

```svelte title="Sibling label pattern with a native button"
<div id="storage-type">Storage type</div>
<RadioGroup defaultValue="ssd" aria-labelledby="storage-type">
	<div>
		<label for="storage-type-ssd">SSD</label>
		<!-- @highlight-text "nativeButton" -->
		<Radio.Root value="ssd" id="storage-type-ssd" nativeButton>
			<!-- @highlight-start -->
			{#snippet render(props, state, children)}
				<button type="button" {...props}>{@render children?.()}</button>
			{/snippet}
			<!-- @highlight-end -->
			<Radio.Indicator />
		</Radio.Root>
	</div>
</RadioGroup>
```

Native buttons with wrapping labels are supported by using the `render` snippet to avoid invalid HTML, so the hidden input is placed outside the label:

```svelte title="Render snippet"
<div id="storage-type">Storage type</div>
<RadioGroup defaultValue="ssd" aria-labelledby="storage-type">
	<Radio.Root value="ssd" nativeButton>
		<!-- @highlight-start -->
		{#snippet render(props, state, children)}
			<label>
				<button type="button" {...props}>{@render children?.()}</button>
				SSD
			</label>
		{/snippet}
		<!-- @highlight-end -->
	</Radio.Root>
</RadioGroup>
```

### Form integration

Use [Field](/components/field) and [Fieldset](/components/fieldset) for group labeling and form integration:

```svelte title="Using Radio Group in a form"
<Form>
	<!-- @highlight -->
	<Field.Root name="storageType">
		<Fieldset.Root>
			{#snippet render(props, state, children)}
				<RadioGroup {...props}>{@render children?.()}</RadioGroup>
			{/snippet}
			<Fieldset.Legend>Storage type</Fieldset.Legend>
			<Field.Item>
				<Field.Label>
					<Radio.Root value="ssd" />
					SSD
				</Field.Label>
			</Field.Item>
			<Field.Item>
				<Field.Label>
					<Radio.Root value="hdd" />
					HDD
				</Field.Label>
			</Field.Item>
		</Fieldset.Root>
	</Field.Root>
</Form>
```

## API reference

<script>
	import { DemoRadioHero } from './demos/hero';
	import { TypesRadioGroup } from './types';
</script>

### RadioGroup

<TypesRadioGroup.RadioGroup />

### Root

<TypesRadioGroup.Root />

### Indicator

<TypesRadioGroup.Indicator />
