---
title: Switch
description: A control that indicates whether a setting is on or off.
---

```svelte demo
<script lang="ts">
	import { Switch } from '@sveltery/base/switch';
</script>

<label class="flex items-center gap-2 text-sm font-normal text-neutral-950 dark:text-white">
	<Switch.Root
		defaultChecked
		class="flex h-5 w-9 shrink-0 border border-neutral-950 bg-white p-0.5 transition-colors duration-150 ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 data-checked:bg-neutral-950 dark:border-white dark:bg-neutral-950 dark:focus-visible:outline-white dark:data-checked:bg-white"
	>
		<Switch.Thumb
			class="size-3.5 bg-neutral-950 transition-[translate,background-color] duration-150 ease-[ease] data-checked:translate-x-4 data-checked:bg-white dark:bg-white dark:data-checked:bg-neutral-950"
		/>
	</Switch.Root>
	Notifications
</label>
```

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

### Root

<ApiPart name="switch" part="Root" />

| Attribute        | Description                                                                  |
| ---------------- | ---------------------------------------------------------------------------- |
| `data-checked`   | Present when the switch is checked.                                          |
| `data-unchecked` | Present when the switch is not checked.                                      |
| `data-disabled`  | Present when the switch is disabled.                                         |
| `data-readonly`  | Present when the switch is readonly.                                         |
| `data-required`  | Present when the switch is required.                                         |
| `data-valid`     | Present when the switch is in a valid state (when wrapped in Field.Root).    |
| `data-invalid`   | Present when the switch is in an invalid state (when wrapped in Field.Root). |
| `data-dirty`     | Present when the switch's value has changed (when wrapped in Field.Root).    |
| `data-touched`   | Present when the switch has been touched (when wrapped in Field.Root).       |
| `data-filled`    | Present when the switch is active (when wrapped in Field.Root).              |
| `data-focused`   | Present when the switch is focused (when wrapped in Field.Root).             |

### Thumb

<ApiPart name="switch" part="Thumb" />

| Attribute        | Description                                                                  |
| ---------------- | ---------------------------------------------------------------------------- |
| `data-checked`   | Present when the switch is checked.                                          |
| `data-unchecked` | Present when the switch is not checked.                                      |
| `data-disabled`  | Present when the switch is disabled.                                         |
| `data-readonly`  | Present when the switch is readonly.                                         |
| `data-required`  | Present when the switch is required.                                         |
| `data-valid`     | Present when the switch is in a valid state (when wrapped in Field.Root).    |
| `data-invalid`   | Present when the switch is in an invalid state (when wrapped in Field.Root). |
| `data-dirty`     | Present when the switch's value has changed (when wrapped in Field.Root).    |
| `data-touched`   | Present when the switch has been touched (when wrapped in Field.Root).       |
| `data-filled`    | Present when the switch is active (when wrapped in Field.Root).              |
| `data-focused`   | Present when the switch is focused (when wrapped in Field.Root).             |
