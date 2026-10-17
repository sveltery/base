# Toolbar

<Subtitle>
  A container for grouping a set of buttons and controls.
</Subtitle>

<Meta name="description" content="A container for grouping a set of buttons and controls." />

<DemoToolbarHero />

## Usage guidelines

To ensure that toolbars are accessible and helpful, follow these guidelines:

- **Use inputs sparingly**: Left and right arrow keys are used to both move the text insertion cursor in an input, and to navigate among controls in horizontal toolbars. When using an input in a horizontal toolbar, use only one and place it as the last element of the toolbar.

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Toolbar } from '@sveltery/base/toolbar';
</script>

<Toolbar.Root>
	<Toolbar.Button />
	<Toolbar.Link />
	<Toolbar.Separator />
	<Toolbar.Group>
		<Toolbar.Button />
		<Toolbar.Button />
	</Toolbar.Group>
	<Toolbar.Input />
</Toolbar.Root>
```

## Examples

### Using with Menu

All Sveltery Base popup components that provide a `Trigger` component can be integrated with a toolbar by passing the trigger to `<Toolbar.Button>` with the `render` snippet:

```svelte title="Using popups with toolbar"
<Toolbar.Root>
	<Menu.Root>
		<!-- @highlight-start -->
		<Toolbar.Button>
			{#snippet render(props, state, children)}
				<Menu.Trigger {...props}>{@render children?.()}</Menu.Trigger>
			{/snippet}
		</Toolbar.Button>
		<!-- @highlight-end -->
		<Menu.Portal>
			<!-- Compose the rest of the menu -->
		</Menu.Portal>
	</Menu.Root>
</Toolbar.Root>
```

This applies to `<AlertDialog>`, `<Dialog>`, `<Menu>`, `<Popover>`, and `<Select>`.

### Using with Tooltip

Unlike other popups, the toolbar item should be passed to the `render` snippet of `<Tooltip.Trigger>`:

```svelte title="Using popups with toolbar"
<Toolbar.Root>
	<Tooltip.Root>
		<!-- @highlight-start -->
		<Tooltip.Trigger>
			{#snippet render(props, state, children)}
				<Toolbar.Button {...props}>{@render children?.()}</Toolbar.Button>
			{/snippet}
		</Tooltip.Trigger>
		<!-- @highlight-end -->
		<Tooltip.Portal>
			<!-- Compose the rest of the tooltip -->
		</Tooltip.Portal>
	</Tooltip.Root>
</Toolbar.Root>
```

### Using with NumberField

To use a NumberField in the toolbar, pass `<NumberField.Input>` to `<Toolbar.Input>` using the `render` snippet:

```svelte title="Using NumberField with toolbar"
<Toolbar.Root>
	<NumberField.Root>
		<NumberField.Group>
			<NumberField.Decrement />
			<!-- @highlight-start -->
			<Toolbar.Input>
				{#snippet render(props)}
					<NumberField.Input {...props} />
				{/snippet}
			</Toolbar.Input>
			<!-- @highlight-end -->
			<NumberField.Increment />
		</NumberField.Group>
	</NumberField.Root>
</Toolbar.Root>
```

## API reference

<script>
	import { DemoToolbarHero } from './demos/hero';
	import { TypesToolbar } from './types';
</script>

### Root

<TypesToolbar.Root />

### Button

<TypesToolbar.Button />

### Link

<TypesToolbar.Link />

### Input

<TypesToolbar.Input />

### Group

<TypesToolbar.Group />

### Separator

<TypesToolbar.Separator />
