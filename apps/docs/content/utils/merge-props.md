---
title: mergeProps
description: Merges multiple sets of props into one, with special handling for class, style, and event handlers.
---

```svelte demo
<script lang="ts">
	import { mergeProps } from '@sveltery/base/merge-props';

	let log = $state<string[]>([]);

	const internal = {
		class: 'rounded-sm bg-gray-100 text-sm font-medium dark:bg-gray-800',
		style: 'padding-inline: 12px; padding-block: 6px',
		onclick: () => log.push('internal')
	};

	const custom = {
		class: 'hover:bg-gray-200 dark:hover:bg-gray-700',
		style: 'padding-inline: 24px',
		onclick: () => log.push('custom')
	};

	const merged = mergeProps(internal, custom);
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<button type="button" {...merged}>Click me</button>
	<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
		<dt class="font-medium">class</dt>
		<dd><code>{JSON.stringify(merged.class)}</code></dd>
		<dt class="font-medium">style</dt>
		<dd><code>{merged.style}</code></dd>
		<dt class="font-medium">Handlers run</dt>
		<dd><code>{JSON.stringify(log)}</code></dd>
	</dl>
</div>
```

## Usage

`mergeProps` combines several bags of props into one that you can spread onto an element. It works like `Object.assign`, where the rightmost bag wins, with special rules for `class`, `style`, event handlers, and attachments.

```svelte
<script lang="ts">
	import { mergeProps } from '@sveltery/base/merge-props';

	let { children, ...rest } = $props();

	const props = $derived(mergeProps({ class: 'button', onclick: logClick }, rest));
</script>

<button {...merged}>{@render children?.()}</button>
```

The merge rules are:

- **Plain props.** The rightmost bag wins.
- **`class`.** Values stay Svelte class values and merge into an array, with the rightmost bag first. Svelte renders the array as one class list.
- **`style`.** Strings join with `;`, so a later declaration of the same property wins. A style object is ignored.
- **Event handlers.** Handlers have Svelte's lowercase names, such as `onclick`. The rightmost handler runs first, then the handlers to its left. A handler that calls `event.preventDefault()` skips the handlers to its left.
- **Attachments.** Every attachment from every bag is kept, and they run in bag order.
- **Empty bags.** `null` and `undefined` bags are skipped.

## Examples

### Skip the handlers to the left

`mergeProps` runs the rightmost handler first. Call `event.preventDefault()` in that handler to stop the internal handlers to its left. The check also works for events that come from an iframe.

```svelte demo
<script lang="ts">
	import { mergeProps } from '@sveltery/base/merge-props';

	let log = $state<string[]>([]);
	let skip = $state(true);

	const merged = $derived(
		mergeProps(
			{ onclick: () => log.push('internal') },
			{
				onclick: (event: MouseEvent) => {
					log.push('custom');
					if (skip) event.preventDefault();
				}
			}
		)
	);
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-2">
		<input type="checkbox" bind:checked={skip} />
		Call <code>event.preventDefault()</code> in the custom handler
	</label>
	<button
		type="button"
		class="rounded-sm bg-gray-100 px-3 py-1.5 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		{...merged}
	>
		Click me
	</button>
	<p>Handlers run: <code>{JSON.stringify(log)}</code></p>
</div>
```

Parts of `@sveltery/base` use the same signal for the handlers you pass to them. A `preventDefault()` call in your `onclick` on a `Collapsible.Trigger` skips the trigger's own toggle.

### Function bags

A bag can be a function. It receives the props merged so far and returns the props that replace them. Handlers that the function returns are not wrapped, so call the previous handlers yourself if you want to keep them.

```ts
const merged = mergeProps(
	{ class: 'base', onclick: () => console.log('internal') },
	(previous) => ({
		...previous,
		onclick(event: MouseEvent) {
			console.log('before');
			previous.onclick?.(event);
		}
	})
);
```

### Merge many bags

`mergeProps` takes up to six bags. Use `mergePropsN` for a list of any length.

```ts
import { mergePropsN } from '@sveltery/base/merge-props';

const merged = mergePropsN([base, theme, size, variant, state, rest, extra]);
```

## Custom parts and useRender

Base UI's `useRender` hook has no counterpart in Sveltery Base. A custom part is a Svelte component that merges its own props into the props it receives, spreads the result onto its element, and takes a `render` snippet. The snippet receives `(props, state, children)`, the same arguments as the `render` snippet of a library part.

```svelte
<!-- MyButton.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { mergeProps } from '@sveltery/base/merge-props';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		render?: Snippet<
			[props: Record<string, unknown>, state: object, children: Snippet | undefined]
		>;
		children?: Snippet;
	}

	let { render, children, ...rest }: Props = $props();

	const merged = $derived(mergeProps({ type: 'button' as const, 'data-my-button': '' }, rest));
</script>

{#if render}
	{@render render(merged, {}, children)}
{:else}
	<button {...merged}>{@render children?.()}</button>
{/if}
```

Put your own props first and the consumer's props last. The consumer's `class`, `style`, and handlers then merge with yours, and the consumer's other props win.

## Differences from Base UI

- Skip handlers with `event.preventDefault()`. There is no `preventBaseUIHandler()`, and `makeEventPreventable` is not exported.
- Handlers have Svelte's lowercase names, such as `onclick`. A prop named `onClick` is a plain prop, so the rightmost one wins instead of chaining.
- `class` is a Svelte class value, and the result is an array with the rightmost bag first. Base UI concatenates `className` strings. `mergeClassNames` is not exported.
- `style` is a CSS string, not an object. Base UI merges style objects by property.
- There is no `ref` to merge. Attachments replace refs, and `mergeProps` keeps all of them.
- A bag can be a function, as in Base UI. Base UI does not wrap the handlers that function returns, and neither does this port.
- `mergeProps` takes up to six bags. Base UI takes five.
- `useRender` has no counterpart. See the section above for the Svelte pattern.

## API reference

### mergeProps

Merges up to six bags of props. Each bag is an object, a function of the props merged so far, `null`, or `undefined`. The result has the type `T` of the last bag.

```ts
function mergeProps<T extends object>(a: T | null | undefined | PropsGetter): T;
function mergeProps<T extends object>(a: Input, b: T | null | undefined | PropsGetter): T;
// …the same shape for three, four, and five bags
function mergeProps<T extends object>(
	a: Input,
	b: Input,
	c: Input,
	d: Input,
	e: Input,
	f: T | null | undefined | PropsGetter
): T;

type Input = object | null | undefined | PropsGetter;
```

| Parameter | Type                                         | Description                                                                                                      |
| --------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `a`       | `object \| PropsGetter \| null \| undefined` | The first bag. It has the lowest priority. This parameter is required.                                           |
| `b`–`f`   | `object \| PropsGetter \| null \| undefined` | Later bags. Each overrides the bags before it. Each is optional, but the last one you pass sets the return type. |
| Returns   | `T`                                          | The merged props, ready to spread onto an element.                                                               |

### mergePropsN

Merges a list of bags. It does the same work as `mergeProps` and takes any number of bags. Use it when you have more than six.

```ts
function mergePropsN<T extends object>(bags: readonly Input[]): T;
```

| Parameter | Type                                                      | Description                                                  |
| --------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| `bags`    | `readonly (object \| PropsGetter \| null \| undefined)[]` | The bags to merge, in priority order from lowest to highest. |
| Returns   | `T`                                                       | The merged props.                                            |

### PropsGetter

The type of a function bag. It receives a copy of the props merged so far. Its return value replaces them. Returning `null` or `undefined` clears them.

```ts
type PropsGetter = (previous: Record<PropertyKey, unknown>) => object | null | undefined;
```
