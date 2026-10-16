---
title: TypeScript
description: A guide to using TypeScript with Sveltery Base.
order: 6
---

## Type names

Base UI uses namespaces to organize types, such as `Tooltip.Root.Props`. Sveltery Base exports each type by name instead, and the name joins the component and the part. `Tooltip.Root.Props` is `TooltipRootProps`. Import the types from the component's entry point, next to the component. Most parts have two core interfaces:

- `Props` (such as `TooltipRootProps`)
- `State` (such as `TooltipTriggerState`)

### Props

When creating wrapping components, you can use the `Props` type to accept all of the underlying Sveltery Base props for the component.

```svelte title="Prop types"
<!-- MyTooltip.svelte -->
<script lang="ts">
	import { Tooltip, type TooltipRootProps } from '@sveltery/base/tooltip';

	let { open = $bindable(), ...props }: TooltipRootProps = $props();
</script>

<Tooltip.Root bind:open {...props} />
```

Declare a bindable prop such as `open` with `$bindable()` and pass it on with `bind:`, so that `bind:open` on your component reaches the root. Svelte's `ComponentProps<typeof Tooltip.Root>` gives the same props type.

### State

The `State` type is the internal state of the component.
For example, `Positioner` components (such as `<Popover.Positioner>`) have state that describes the position of the element in relation to their anchor.

```svelte title="Positioner state"
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Popover, type PopoverPositionerState } from '@sveltery/base/popover';
</script>

{#snippet renderPositioner(
	props: HTMLAttributes<HTMLDivElement>,
	state: PopoverPositionerState,
	children: Snippet | undefined
)}
	<div {...props}>
		<ul>
			<li>The popover is {state.open ? 'open' : 'closed'}</li>
			<li>I am on the {state.side} side of the anchor</li>
			<li>I am aligned at the {state.align} of the side</li>
			<li>The anchor is {state.anchorHidden ? 'hidden' : 'visible'}</li>
		</ul>
		{@render children?.()}
	</div>
{/snippet}

<Popover.Positioner render={renderPositioner} />
```

### Events

Types relating to custom Sveltery Base events are also exported, named after the component.

- `ChangeEventDetails` (such as `ComboboxChangeEventDetails`) is the object passed to change handlers like `onValueChange`.
- `OpenChangeEventDetails` (such as `ComboboxOpenChangeEventDetails`) is the object passed to `onOpenChange` on components whose `ChangeEventDetails` is shared with other handlers. It extends `ChangeEventDetails` with `preventUnmountOnClose()`.
- `ChangeReason` (such as `ComboboxChangeReason`) is the union of possible reason strings for a change event.

```ts title="Change event types"
import type {
	ComboboxChangeEventDetails,
	ComboboxOpenChangeEventDetails
} from '@sveltery/base/combobox';

function onValueChange(value: string | null, eventDetails: ComboboxChangeEventDetails) {
	console.log(value, eventDetails);
}

function onOpenChange(open: boolean, eventDetails: ComboboxOpenChangeEventDetails) {
	console.log(open, eventDetails);
}
```

### Other accessible types

Depending on the component API, other types are also exported by the components.
The following list is non-exhaustive, and each of these are documented where necessary.

- Popups expose imperative methods through `bind:this` on the root, in place of Base UI's `actionsRef` prop. For example, `MenuActions` gives access to the shape of what `bind:this` on `<Menu.Root>` returns.
- The `toast` object on `<Toast.Root>` is a complex object with many properties. `ToastObject` gives access to this interface.
- Components that have a `render` prop type it as a snippet in their `Props` interface. Sveltery Base has no `useRender` hook, so there is no `useRender.ComponentProps` type. Index a part's props instead, such as `PopoverPositionerProps['render']`, to reuse the snippet type.
