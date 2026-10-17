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

### Rendering as a native button

By default, `<Checkbox.Root>` renders a `<span>` element to support enclosing labels. Prefer rendering the checkbox as a native button when using sibling labels (`for`/`id`). Set `nativeButton` and render a `<button>` with the `render` snippet.

```svelte title="Sibling label pattern with a native button"
<div>
	<label for="notifications-checkbox">Enable notifications</label>
	<!-- @highlight-text "nativeButton" -->
	<Checkbox.Root id="notifications-checkbox" nativeButton>
		<!-- @highlight-text "render" -->
		{#snippet render(props, _state, children)}
			<button type="button" {...props}>{@render children?.()}</button>
		{/snippet}
		<Checkbox.Indicator />
	</Checkbox.Root>
</div>
```

Native buttons with wrapping labels are supported by using the `render` snippet to avoid invalid HTML, so the hidden input is placed outside the label:

```svelte title="Render callback"
<Checkbox.Root nativeButton>
	<!-- @highlight-start -->
	{#snippet render(props, _state, children)}
		<label>
			<button type="button" {...props}>{@render children?.()}</button>
			Enable notifications
		</label>
	{/snippet}
	<!-- @highlight-end -->
</Checkbox.Root>
```

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
