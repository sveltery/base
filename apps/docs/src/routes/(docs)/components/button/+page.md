# Button

<Subtitle>
  A button component that can be rendered as another tag or focusable when disabled.
</Subtitle>

<Meta name="description" content="A button component that can be rendered as another tag or focusable when disabled." />

```svelte demo
<script lang="ts">
	import { Button } from '@sveltery/base/button';
</script>

<Button
	class="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
>
	Submit
</Button>
```

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

```svelte demo
<script lang="ts">
	import { Button } from '@sveltery/base/button';

	let loading = $state(false);
	const labelId = $props.id();
</script>

<Button
	class="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
	disabled={loading}
	focusableWhenDisabled
	aria-labelledby={labelId}
	onclick={() => {
		loading = true;
		setTimeout(() => {
			loading = false;
		}, 4000);
	}}
>
	<span id={labelId}>{loading ? 'Submitting' : 'Submit'}</span>
</Button>
```

## API reference

<ApiPart name="button" part="Button" />

| Attribute       | Description                          |
| --------------- | ------------------------------------ |
| `data-disabled` | Present when the button is disabled. |
