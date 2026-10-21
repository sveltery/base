# Switch

<Subtitle>
  A control that indicates whether a setting is on or off.
</Subtitle>

<Meta name="description" content="A control that indicates whether a setting is on or off." />

<DemoSwitchHero />

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See [Labeling a switch](#labeling-a-switch) and the [forms guide](/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Switch } from '@sveltery/base/switch';
</script>

<Switch.Root>
	<Switch.Thumb />
</Switch.Root>
```

## Examples

### Labeling a switch

An enclosing `<label>` is the simplest labeling pattern:

```svelte title="Wrapping a label around a switch"
<!-- @highlight -->
<label>
	<Switch.Root />
	Notifications
	<!-- @highlight -->
</label>
```

### Using a sibling label

`<Switch.Root>` renders a real `<input type="checkbox" role="switch">` over its track, so a sibling `<label>` with `for` works as it does in HTML. Pass `id` to name the input:

```svelte title="Sibling label pattern"
<div>
	<label for="notifications-switch">Notifications</label>
	<!-- @highlight-text "id" -->
	<Switch.Root id="notifications-switch">
		<Switch.Thumb />
	</Switch.Root>
</div>
```

### Native attributes and events

Native attributes and handlers go to the input, and `class`, `style` and `host` go to the track you see. Read `event.currentTarget.checked` in `onchange`:

```svelte title="Reading the checked state"
<Switch.Root name="notifications" onchange={(event) => console.log(event.currentTarget.checked)}>
	<Switch.Thumb />
</Switch.Root>
```

Space toggles the switch, as it does a native checkbox. Enter submits the form.

### Form integration

Use [Field](/components/field) to handle label associations and form integration:

```svelte title="Using Switch in a form"
<Form>
	<!-- @highlight -->
	<Field.Root name="notifications">
		<Field.Label>
			<Switch.Root />
			Notifications
		</Field.Label>
	</Field.Root>
</Form>
```

## API reference

<script>
	import { DemoSwitchHero } from './demos/hero';
	import { TypesSwitch } from './types';
</script>

### Root

<TypesSwitch.Root />

### Thumb

<TypesSwitch.Thumb />
