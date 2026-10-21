# Checkbox

<Subtitle>
  An easily stylable checkbox component.
</Subtitle>

<Meta name="description" content="An easily stylable checkbox component." />

<DemoCheckboxBasic />

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See [Labeling a checkbox](#labeling-a-checkbox) and the [forms guide](/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
</script>

<Checkbox.Root>
	<Checkbox.Indicator />
</Checkbox.Root>
```

## Examples

### Labeling a checkbox

An enclosing `<label>` is the simplest labeling pattern:

```svelte title="Wrapping a label around a checkbox"
<!-- @highlight -->
<label>
	<Checkbox.Root />
	Accept terms and conditions
	<!-- @highlight -->
</label>
```

### Using a sibling label

`<Checkbox.Root>` renders a real `<input type="checkbox">` over its box, so a sibling `<label>` with `for` works as it does in HTML. Pass `id` to name the input:

```svelte title="Sibling label pattern"
<div>
	<label for="notifications-checkbox">Enable notifications</label>
	<!-- @highlight-text "id" -->
	<Checkbox.Root id="notifications-checkbox">
		<Checkbox.Indicator />
	</Checkbox.Root>
</div>
```

### Native attributes and events

Native attributes and handlers such as `name`, `oninput`, `onchange` and `aria-*` go to the input. `class` and `style` go to the box you see, and `host` takes any other attribute for the box. The input submits with the form and fires real `input` and `change` events, so read `event.currentTarget.checked` instead of a change callback:

```svelte title="Reading the checked state"
<Checkbox.Root name="notifications" onchange={(event) => console.log(event.currentTarget.checked)}>
	<Checkbox.Indicator />
</Checkbox.Root>
```

To stop a change, call `event.preventDefault()` in `onclick`, as with a native checkbox.

### Form integration

Use [Field](/components/field) to handle label associations and form integration:

```svelte title="Using Checkbox in a form"
<Form>
	<!-- @highlight -->
	<Field.Root name="stayLoggedIn">
		<Field.Label>
			<Checkbox.Root />
			Stay logged in for 7 days
		</Field.Label>
	</Field.Root>
</Form>
```

## API reference

<script>
	import { DemoCheckboxBasic } from './demos/hero';
	import { TypesCheckbox } from './types';
</script>

### Root

<TypesCheckbox.Root />

### Indicator

<TypesCheckbox.Indicator />
