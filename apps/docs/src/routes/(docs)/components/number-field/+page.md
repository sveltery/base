# Number Field

<Subtitle>
  A numeric input element with increment and decrement buttons, and a scrub area.
</Subtitle>

<Meta name="description" content="A numeric input element with increment and decrement buttons, and a scrub area." />

<DemoNumberFieldHero />

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See the [forms guide](/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { NumberField } from '@sveltery/base/number-field';
</script>

<NumberField.Root>
	<NumberField.ScrubArea>
		<NumberField.ScrubAreaCursor />
	</NumberField.ScrubArea>
	<NumberField.Group>
		<NumberField.Decrement />
		<NumberField.Input />
		<NumberField.Increment />
	</NumberField.Group>
</NumberField.Root>
```

## Examples

### Native attributes and events

`<NumberField.Root>` renders a hidden `<input type="number">` that submits the value. Native input attributes and handlers on the root, such as `name`, `form`, `required`, `oninput` and `onchange`, go to that input. `class` and `style` stay on the root element, and `host` sends any other attribute there:

```svelte title="Reading the value"
<NumberField.Root
	name="quantity"
	bind:value={quantity}
	onchange={(event) => save(event.currentTarget.valueAsNumber)}
	host={{ 'data-section': 'cart' }}
>
	<!-- ... -->
</NumberField.Root>
```

The hidden input fires `input` whenever the value changes, and `change` when it is committed: on blur after typing, after a key press or a step button, or when a scrub ends. Read the value from `valueAsNumber`, which is `NaN` while the field is empty.

`readonly` stops edits through every part. The visible input reports it with `aria-readonly` instead of `readonly`, so Field still validates it, `required` included.

### Form integration

To use a number field in a form, pass its `name` to `<NumberField.Root>`, or put it in a named `<Field.Root>`:

```svelte title="Using NumberField in a form"
<Form>
	<Field.Root name="quantity">
		<Field.Label>Quantity</Field.Label>
		<!-- @highlight -->
		<NumberField.Root min={1} defaultValue={1}>
			<NumberField.Group>
				<NumberField.Decrement />
				<NumberField.Input />
				<NumberField.Increment />
			</NumberField.Group>
		</NumberField.Root>
		<Field.Error />
	</Field.Root>
</Form>
```

With a SvelteKit remote form, spread the field's `number` props on the root. The spread names the hidden input and holds its value as a string, so the server renders it and the field follows the form whenever the form changes it, as after a failed submit. A spread of another input kind is a type error:

```svelte title="Using NumberField in a remote form"
<Form form={order}>
	<Field.Root name="quantity">
		<Field.Label>Quantity</Field.Label>
		<!-- @highlight -->
		<NumberField.Root {...order.fields.quantity.as('number', 1)} min={1}>
			<!-- ... -->
		</NumberField.Root>
		<Field.Error />
	</Field.Root>
</Form>
```

Without a spread, a number field in a named Field of a remote form binds itself to the field, and starts at the value the form holds. The browser checks `required` only once JavaScript runs, because without it nobody can type into the field.

## API reference

<script>
	import { DemoNumberFieldHero } from './demos/hero';
	import { TypesNumberField } from './types';
</script>

### Root

<TypesNumberField.Root />

### ScrubArea

<TypesNumberField.ScrubArea />

### ScrubAreaCursor

<TypesNumberField.ScrubAreaCursor />

### Group

<TypesNumberField.Group />

### Decrement

<TypesNumberField.Decrement />

### Input

<TypesNumberField.Input />

### Increment

<TypesNumberField.Increment />
