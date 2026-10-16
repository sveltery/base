---
title: Composition
description: A guide to composing Sveltery Base components with your own Svelte components.
order: 3
---

## Composing custom Svelte components

Use the `render` prop to compose a Sveltery Base part with your own Svelte components.
In Sveltery Base, `render` is a [snippet](https://svelte.dev/docs/svelte/snippet). It receives the props to spread onto your element, the part's state, and the part's children.

For example, most triggers render a `<button>` by default.
The code snippet below shows how to use a custom button instead.

```svelte title="index.svelte"
<Menu.Trigger>
	{#snippet render(props, state, children)}
		<MyButton {...props} size="md">{@render children?.()}</MyButton>
	{/snippet}
	Open menu
</Menu.Trigger>
```

The custom component must spread all the received props on its underlying DOM node. Svelte has no refs to forward. The part reads its element through an attachment inside `props`, so the spread is what connects the part to the element.

```svelte title="MyButton.svelte"
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let { children, size = 'md', ...rest }: HTMLButtonAttributes & { size?: 'sm' | 'md' } = $props();
</script>

<button {...rest} data-size={size}>{@render children?.()}</button>
```

## Composing multiple components

In situations where you need to compose multiple Sveltery Base components with custom Svelte components, `render` snippets can be nested as deeply as necessary.
Working with Tooltip is a common example.

```svelte title="index.svelte"
<Dialog.Root>
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet render(tooltipProps)}
				<Dialog.Trigger {...tooltipProps}>
					{#snippet render(dialogProps)}
						<Menu.Trigger {...dialogProps}>
							{#snippet render(menuProps, state, children)}
								<MyButton {...menuProps} size="md">{@render children?.()}</MyButton>
							{/snippet}
							Open menu
						</Menu.Trigger>
					{/snippet}
				</Dialog.Trigger>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Portal>...</Tooltip.Portal>
	</Tooltip.Root>
	<Dialog.Portal>...</Dialog.Portal>
</Dialog.Root>
```

## Changing the default rendered element

You can also use the `render` prop to override the rendered element of the component.

For example, `<Accordion.Header>` renders an `<h3>` element by default.
The code snippet below shows how to render it as an `<h2>` element so that it fits the heading hierarchy of the page.

```svelte title="index.svelte"
<script lang="ts">
	import { Accordion } from '@sveltery/base/accordion';
</script>

<Accordion.Root>
	<Accordion.Item>
		<Accordion.Header>
			{#snippet render(props, state, children)}
				<h2 {...props}>{@render children?.()}</h2>
			{/snippet}
			<Accordion.Trigger>What is Sveltery Base?</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel>Sveltery Base is a library of unstyled Svelte components.</Accordion.Panel>
	</Accordion.Item>
</Accordion.Root>
```

Each Sveltery Base component renders the most appropriate element by default, and in most cases, rendering a different element is recommended only on a case-by-case basis.

## Render function

Base UI's `render` prop takes either a React element or a function. Svelte has no element objects to clone, so a Sveltery Base `render` snippet always works like Base UI's render function.

```svelte title="switch.svelte"
<Switch.Thumb>
	{#snippet render(props, state)}
		<span {...props}>
			{#if state.checked}<CheckedIcon />{:else}<UncheckedIcon />{/if}
		</span>
	{/snippet}
</Switch.Thumb>
```

Using a snippet gives you complete control over spreading props and also allows you to render different content based on the component's state.
