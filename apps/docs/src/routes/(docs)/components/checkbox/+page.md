# Checkbox

<Subtitle>
  An easily stylable checkbox component.
</Subtitle>

<Meta name="description" content="An easily stylable checkbox component." />

```svelte demo
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
</script>

<label class="flex items-center gap-2 text-sm font-normal text-neutral-950 dark:text-white">
	<Checkbox.Root
		defaultChecked
		class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
	>
		<Checkbox.Indicator class="flex data-unchecked:hidden">
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				style="display: block"
			>
				<path d="m2.5 8.5 4 4 7-9" />
			</svg>
		</Checkbox.Indicator>
	</Checkbox.Root>
	Enable notifications
</label>
```

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

### Root

<ApiPart name="checkbox" part="Root" />

| Attribute            | Description                                                                    |
| -------------------- | ------------------------------------------------------------------------------ |
| `data-checked`       | Present when the checkbox is checked.                                          |
| `data-unchecked`     | Present when the checkbox is not checked.                                      |
| `data-disabled`      | Present when the checkbox is disabled.                                         |
| `data-readonly`      | Present when the checkbox is readonly.                                         |
| `data-required`      | Present when the checkbox is required.                                         |
| `data-valid`         | Present when the checkbox is in a valid state (when wrapped in Field.Root).    |
| `data-invalid`       | Present when the checkbox is in an invalid state (when wrapped in Field.Root). |
| `data-dirty`         | Present when the checkbox's value has changed (when wrapped in Field.Root).    |
| `data-touched`       | Present when the checkbox has been touched (when wrapped in Field.Root).       |
| `data-filled`        | Present when the checkbox is checked (when wrapped in Field.Root).             |
| `data-focused`       | Present when the checkbox is focused (when wrapped in Field.Root).             |
| `data-indeterminate` | Present when the checkbox is in an indeterminate state.                        |
| `data-parent`        | Present when the checkbox is a parent checkbox.                                |

### Indicator

<ApiPart name="checkbox" part="Indicator" />

| Attribute             | Description                                                                    |
| --------------------- | ------------------------------------------------------------------------------ |
| `data-checked`        | Present when the checkbox is checked.                                          |
| `data-unchecked`      | Present when the checkbox is not checked.                                      |
| `data-disabled`       | Present when the checkbox is disabled.                                         |
| `data-readonly`       | Present when the checkbox is readonly.                                         |
| `data-required`       | Present when the checkbox is required.                                         |
| `data-valid`          | Present when the checkbox is in a valid state (when wrapped in Field.Root).    |
| `data-invalid`        | Present when the checkbox is in an invalid state (when wrapped in Field.Root). |
| `data-dirty`          | Present when the checkbox's value has changed (when wrapped in Field.Root).    |
| `data-touched`        | Present when the checkbox has been touched (when wrapped in Field.Root).       |
| `data-filled`         | Present when the checkbox is checked (when wrapped in Field.Root).             |
| `data-focused`        | Present when the checkbox is focused (when wrapped in Field.Root).             |
| `data-indeterminate`  | Present when the checkbox is in an indeterminate state.                        |
| `data-starting-style` | Present when the checkbox indicator begins animating in.                       |
| `data-ending-style`   | Present when the checkbox indicator is animating out.                          |
