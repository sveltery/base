# Button

<Subtitle>
  A button component that can be rendered as another tag or focusable when disabled.
</Subtitle>

<Meta name="description" content="A button component that can be rendered as another tag or focusable when disabled." />

<DemoButtonHero />

## Usage guidelines

- **Submit buttons**: Unlike the native button element, `type="submit"` must be specified on Button for it to act as a submit button.
- **Links**: The Button component enforces button semantics (`role="button"`, keyboard interaction, disabled state). It should not be used for links. See [Rendering links as buttons](#rendering-links-as-buttons) below.

## Anatomy

Import the component:

```svelte title="Anatomy"
<script lang="ts">
	import { Button } from '@sveltery/base/button';
</script>

<Button />
```

## Examples

### Rendering as another tag

The button can remain keyboard accessible while being rendered as another tag, such as a `<div>`, by specifying `nativeButton={false}`. In Svelte, `render` is a snippet. Spread `props` onto the element and render `children` inside it.

```svelte title="Custom tag button"
<script lang="ts">
	import { Button } from '@sveltery/base/button';
</script>

<!-- @highlight-text "nativeButton={false}" -->
<Button nativeButton={false}>
	{#snippet render(props, state, children)}
		<div {...props}>{@render children?.()}</div>
	{/snippet}
	Button that can contain complex children
</Button>
```

### Rendering links as buttons

The Button component enforces button semantics. `nativeButton={false}` signals that the rendered tag is not a `<button>`, but it must still be a tag that can receive button semantics (`role="button"`, keyboard interaction handlers). Links (`<a>`) have their own semantics and should not be rendered as buttons through the `render` prop.

If a link needs to look like a button visually, style the `<a>` element directly with CSS rather than using the Button component.

### Loading states

For buttons that enter a loading state after activation, specify `focusableWhenDisabled` so focus remains on the button while it is disabled. Because some browser and screen reader combinations do not reliably announce changes to a focused button's descendant text, use [`aria-labelledby`](https://www.w3.org/TR/accname-1.2/#computation-steps) to make the changing text the button's explicit accessible name.

<DemoButtonLoading />

## API reference

<script>
	import { DemoButtonHero } from './demos/hero';
	import { DemoButtonLoading } from './demos/loading';
	import { TypesButton } from './types';
</script>

<TypesButton />
