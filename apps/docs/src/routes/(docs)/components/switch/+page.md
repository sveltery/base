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

### Rendering as a native button

By default, `<Switch.Root>` renders a `<span>` element to support enclosing labels. Prefer rendering the switch as a native button when using sibling labels (`for`/`id`).

```svelte title="Sibling label pattern with a native button"
<div>
	<label for="notifications-switch">Notifications</label>
	<!-- @highlight-text "nativeButton" -->
	<Switch.Root id="notifications-switch" nativeButton>
		<!-- @highlight-start -->
		{#snippet render(props, state, children)}
			<button type="button" {...props}>{@render children?.()}</button>
		{/snippet}
		<!-- @highlight-end -->
		<Switch.Thumb />
	</Switch.Root>
</div>
```

Native buttons with wrapping labels are supported by using the `render` snippet to avoid invalid HTML, so the hidden input is placed outside the label:

```svelte title="Render snippet"
<Switch.Root nativeButton>
	<!-- @highlight-start -->
	{#snippet render(props, state, children)}
		<label>
			<button type="button" {...props}>{@render children?.()}</button>
			Notifications
		</label>
	{/snippet}
	<!-- @highlight-end -->
</Switch.Root>
```

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
