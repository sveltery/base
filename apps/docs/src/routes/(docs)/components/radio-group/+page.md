# Radio Group

<Subtitle>
  Provides shared state to a series of radio buttons.
</Subtitle>

<Meta name="description" content="Provides shared state to a series of radio buttons." />

```svelte demo
<script lang="ts">
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';

	const id = $props.id();
</script>

<RadioGroup
	aria-labelledby={id}
	defaultValue="fuji-apple"
	class="flex flex-col items-start gap-1 text-neutral-950 dark:text-white"
>
	<div class="text-sm font-bold" {id}>Best apple</div>

	<label class="flex items-center gap-2 text-sm font-normal text-neutral-950 dark:text-white">
		<Radio.Root
			value="fuji-apple"
			class="flex size-4 shrink-0 items-center justify-center border rounded-full p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Radio.Indicator
				class="flex items-center justify-center data-unchecked:hidden before:size-2 before:rounded-full before:bg-current"
			/>
		</Radio.Root>
		Fuji
	</label>

	<label class="flex items-center gap-2 text-sm font-normal text-neutral-950 dark:text-white">
		<Radio.Root
			value="gala-apple"
			class="flex size-4 shrink-0 items-center justify-center border rounded-full p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Radio.Indicator
				class="flex items-center justify-center data-unchecked:hidden before:size-2 before:rounded-full before:bg-current"
			/>
		</Radio.Root>
		Gala
	</label>

	<label class="flex items-center gap-2 text-sm font-normal text-neutral-950 dark:text-white">
		<Radio.Root
			value="granny-smith-apple"
			class="flex size-4 shrink-0 items-center justify-center border rounded-full p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Radio.Indicator
				class="flex items-center justify-center data-unchecked:hidden before:size-2 before:rounded-full before:bg-current"
			/>
		</Radio.Root>
		Granny Smith
	</label>
</RadioGroup>
```

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

### RadioGroup

<ApiPart name="radio-group" part="RadioGroup" />

| Attribute       | Description                               |
| --------------- | ----------------------------------------- |
| `data-disabled` | Present when the radio group is disabled. |

### Root

<ApiPart name="radio" part="Root" />

| Attribute        | Description                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `data-checked`   | Present when the radio is checked.                                          |
| `data-unchecked` | Present when the radio is not checked.                                      |
| `data-disabled`  | Present when the radio is disabled.                                         |
| `data-readonly`  | Present when the radio is readonly.                                         |
| `data-required`  | Present when the radio is required.                                         |
| `data-valid`     | Present when the radio is in a valid state (when wrapped in Field.Root).    |
| `data-invalid`   | Present when the radio is in an invalid state (when wrapped in Field.Root). |
| `data-dirty`     | Present when the radio's value has changed (when wrapped in Field.Root).    |
| `data-touched`   | Present when the radio has been touched (when wrapped in Field.Root).       |
| `data-filled`    | Present when the radio is checked (when wrapped in Field.Root).             |
| `data-focused`   | Present when the radio is focused (when wrapped in Field.Root).             |

### Indicator

<ApiPart name="radio" part="Indicator" />

| Attribute             | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `data-checked`        | Present when the radio is checked.                                          |
| `data-unchecked`      | Present when the radio is not checked.                                      |
| `data-disabled`       | Present when the radio is disabled.                                         |
| `data-readonly`       | Present when the radio is readonly.                                         |
| `data-required`       | Present when the radio is required.                                         |
| `data-valid`          | Present when the radio is in a valid state (when wrapped in Field.Root).    |
| `data-invalid`        | Present when the radio is in an invalid state (when wrapped in Field.Root). |
| `data-dirty`          | Present when the radio's value has changed (when wrapped in Field.Root).    |
| `data-touched`        | Present when the radio has been touched (when wrapped in Field.Root).       |
| `data-filled`         | Present when the radio is checked (when wrapped in Field.Root).             |
| `data-focused`        | Present when the radio is focused (when wrapped in Field.Root).             |
| `data-starting-style` | Present when the radio indicator begins animating in.                       |
| `data-ending-style`   | Present when the radio indicator is animating out.                          |
