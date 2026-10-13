---
title: Composition
description: A guide to composing Sveltery Base parts with your own elements and components.
order: 3
---

## The render snippet

Each part renders one HTML element by default. Its `render` prop replaces that element with markup you write. Base UI's `render` prop takes a React element or a function. Svelte has no element objects to clone, so in Sveltery Base `render` is always a [snippet](https://svelte.dev/docs/svelte/snippet).

The snippet receives three arguments:

- `props` are the attributes, event handlers, and attachments that the part would put on its own element. Spread them onto the element you render.
- `state` is the part's state, the same object its data attributes come from.
- `children` is the content to render inside your element, or `undefined` when there is none. Render it with `{@render children?.()}`.

`Accordion.Header` renders an `<h3>` by default. This snippet renders an `<h2>` instead, so the heading fits the outline of the page:

```svelte demo
<script lang="ts">
	import { Accordion } from '@sveltery/base/accordion';
</script>

<Accordion.Root class="w-72 text-gray-900 dark:text-gray-100">
	<Accordion.Item class="border-b border-gray-200 dark:border-gray-700">
		<Accordion.Header>
			{#snippet render(props, state, children)}
				<h2 {...props} class="m-0">{@render children?.()}</h2>
			{/snippet}
			<Accordion.Trigger
				class="w-full py-2 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-blue-800"
			>
				What is Sveltery Base?
			</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel class="pb-3 text-sm text-gray-600 dark:text-gray-400">
			A Svelte 5 port of Base UI, a library of unstyled components.
		</Accordion.Panel>
	</Accordion.Item>
</Accordion.Root>
```

Each part renders the most suitable element by default. Replace it only when a specific case needs another element.

## Spread every prop

`props` holds everything the part needs on its element: the role, the ARIA attributes, the ids, the `class` and `style` you passed to the part, the event handlers, and the attachments the part uses to read its element. Spread the whole object. A part whose element misses an attachment cannot measure, position, or focus that element.

Attributes after the spread override the values in `props`. Attributes before it are overridden. To change an event handler while keeping the part's own handler, combine both with [`mergeProps`](#merge-props).

Children are not a prop in Svelte, so `props` cannot carry them. Base UI passes them as `props.children`. Sveltery Base passes them as the third argument. Some parts add their own content to `children`. For example, `Meter.Value` passes the formatted value, and `Field.Error` passes the error message.

`children` is `undefined` when you passed no children and the part adds none. Call it as `children?.()`, or show a fallback:

```svelte
<Field.Error>
	{#snippet render(props, state, children)}
		<div {...props}>
			{#if children}{@render children()}{:else}Check this field.{/if}
		</div>
	{/snippet}
</Field.Error>
```

## Render a different kind of element

A part that acts as a button, such as `Collapsible.Trigger` or [Button](/components/button), expects its element to be a native `<button>`. When your snippet renders another element, set `nativeButton={false}`. The part then adds `role="button"`, puts the element in the tab order, and handles <kbd>Enter</kbd> and <kbd>Space</kbd> the way a native button does:

```svelte demo
<script lang="ts">
	import { Button } from '@sveltery/base/button';

	let clicks = $state(0);
</script>

<Button nativeButton={false} onclick={() => (clicks += 1)}>
	{#snippet render(props, state, children)}
		<span
			{...props}
			class="cursor-default rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
		>
			{@render children?.()}
		</span>
	{/snippet}
	Clicked {clicks} times
</Button>
```

In development, the part logs an error when the element does not match `nativeButton`. Keep a native `<button>` when you can.

## Compose your own components

A snippet can render one of your Svelte components instead of an element. The component must spread every prop it receives onto its element, so that the attachments in `props` reach the element:

```svelte
<!-- MyButton.svelte -->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let { children, size = 'md', ...rest }: HTMLButtonAttributes & { size?: 'sm' | 'md' } = $props();
</script>

<button {...rest} data-size={size}>{@render children?.()}</button>
```

```svelte
<Popover.Trigger>
	{#snippet render(props, state, children)}
		<MyButton {...props} size="sm">{@render children?.()}</MyButton>
	{/snippet}
	Open
</Popover.Trigger>
```

## Compose two parts

Nest parts the same way. The snippet of the outer part renders the inner part and spreads `props` onto it. The inner part merges those props with its own and renders one element that has the behavior of both.

This `Collapsible.Trigger` renders a [Button](/components/button). The one `<button>` element toggles the panel and has the behavior of Button:

```svelte demo
<script lang="ts">
	import { Button } from '@sveltery/base/button';
	import { Collapsible } from '@sveltery/base/collapsible';
</script>

<Collapsible.Root class="flex w-56 flex-col gap-2 text-sm text-gray-900 dark:text-gray-100">
	<Collapsible.Trigger
		class="h-9 rounded-md border border-gray-200 bg-gray-50 px-3.5 font-medium select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[panel-open]:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
	>
		{#snippet render(props, state, children)}
			<Button {...props}>{@render children?.()}</Button>
		{/snippet}
		Recovery keys
	</Collapsible.Trigger>
	<Collapsible.Panel class="rounded-md bg-gray-100 px-3 py-2 dark:bg-gray-800">
		alien-bean-pasta
	</Collapsible.Panel>
</Collapsible.Root>
```

## Merge props

`mergeProps` combines several prop objects into one. Import it from `@sveltery/base/merge-props`. Use it when your snippet adds an event handler, a class, or a style to the props of a part:

```svelte
<script lang="ts">
	import { mergeProps } from '@sveltery/base/merge-props';
</script>

<Collapsible.Trigger>
	{#snippet render(props, state, children)}
		<button {...mergeProps(props, { class: 'Trigger', onclick: () => console.log('toggled') })}>
			{@render children?.()}
		</button>
	{/snippet}
</Collapsible.Trigger>
```

The merge follows these rules:

- For a plain prop, the rightmost object wins.
- Event handlers are chained. The rightmost handler runs first. If it calls `event.preventDefault()`, the handlers to its left do not run, so the part's own handler is skipped.
- `class` values are combined into one class list.
- `style` strings are combined. For the same property, the rightmost declaration wins.
- Attachments from every object are kept.

An object can also be a function. It receives the props merged so far and returns the props to use instead. Its handlers are not chained for you.

`mergePropsN` takes an array of prop objects instead of separate arguments.

Event handler names are Svelte's lowercase names, such as `onclick`. Base UI's `event.preventBaseUIHandler()` does not exist. Call `event.preventDefault()` to skip the part's handler.
