---
title: Accordion
description: A set of collapsible panels with headings.
---

```svelte demo
<script lang="ts">
	import { Accordion } from '@sveltery/base/accordion';

	const items = [
		{
			value: 'what',
			title: 'What is Base UI?',
			body: 'Base UI is a library of headless, accessible UI components.'
		},
		{
			value: 'start',
			title: 'How do I get started?',
			body: 'Install the package, import a component, and style its parts with your own CSS.'
		},
		{
			value: 'project',
			title: 'Can I use it for my project?',
			body: 'Yes. Base UI is free and open source under the MIT license.'
		}
	];
</script>

<Accordion.Root class="w-80 text-gray-900 dark:text-gray-100">
	{#each items as item (item.value)}
		<Accordion.Item value={item.value} class="border-b border-gray-200 dark:border-gray-700">
			<Accordion.Header>
				<Accordion.Trigger
					class="group flex w-full items-center justify-between gap-4 py-2 text-left text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-blue-800"
				>
					{item.title}
					<svg
						viewBox="0 0 12 12"
						class="size-3 shrink-0 transition-transform duration-150 group-data-[panel-open]:rotate-45"
						fill="currentColor"
						aria-hidden="true"
					>
						<path d="M6.75 0H5.25V5.25H0V6.75H5.25V12H6.75V6.75H12V5.25H6.75V0Z" />
					</svg>
				</Accordion.Trigger>
			</Accordion.Header>
			<Accordion.Panel
				class="h-[var(--accordion-panel-height)] overflow-hidden text-sm text-gray-600 transition-[height] duration-150 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0 dark:text-gray-400"
			>
				<p class="pb-3">{item.body}</p>
			</Accordion.Panel>
		</Accordion.Item>
	{/each}
</Accordion.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Accordion } from '@sveltery/base/accordion';
</script>

<Accordion.Root>
	<Accordion.Item>
		<Accordion.Header>
			<Accordion.Trigger />
		</Accordion.Header>
		<Accordion.Panel />
	</Accordion.Item>
</Accordion.Root>
```

## Examples

### Open multiple panels

By default, opening an item closes the open one. Set `multiple` on the root to let each item open and close on its own.

```svelte demo
<script lang="ts">
	import { Accordion } from '@sveltery/base/accordion';

	const items = [
		{ value: 'shipping', title: 'Shipping', body: 'Orders ship within two business days.' },
		{ value: 'returns', title: 'Returns', body: 'You can return any item within 30 days.' },
		{
			value: 'tracking',
			title: 'Tracking',
			body: 'We email a tracking link when your order ships.'
		}
	];
</script>

<Accordion.Root multiple class="w-80 text-gray-900 dark:text-gray-100">
	{#each items as item (item.value)}
		<Accordion.Item value={item.value} class="border-b border-gray-200 dark:border-gray-700">
			<Accordion.Header>
				<Accordion.Trigger
					class="flex w-full justify-between py-2 text-left text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-blue-800"
				>
					{item.title}
				</Accordion.Trigger>
			</Accordion.Header>
			<Accordion.Panel
				class="h-[var(--accordion-panel-height)] overflow-hidden text-sm text-gray-600 transition-[height] duration-150 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0 dark:text-gray-400"
			>
				<p class="pb-3">{item.body}</p>
			</Accordion.Panel>
		</Accordion.Item>
	{/each}
</Accordion.Root>
```

### Open state

Bind `value` to read and change which items are open. The value is an array of the open items' `value` props, in the order they opened. Without `bind:`, the accordion manages its own state, and a value you pass sets the initial state.

```svelte demo
<script lang="ts">
	import { Accordion } from '@sveltery/base/accordion';

	let value = $state<unknown[]>(['b']);
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<p>Open items: {value.length ? value.join(', ') : 'none'}</p>
	<div class="flex gap-2">
		<button
			type="button"
			class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
			onclick={() => (value = ['a', 'b', 'c'])}
		>
			Open all
		</button>
		<button
			type="button"
			class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
			onclick={() => (value = [])}
		>
			Close all
		</button>
	</div>
	<Accordion.Root multiple bind:value class="w-80">
		{#each ['a', 'b', 'c'] as id (id)}
			<Accordion.Item value={id} class="border-b border-gray-200 dark:border-gray-700">
				<Accordion.Header>
					<Accordion.Trigger
						class="flex w-full justify-between py-2 text-left font-medium hover:underline focus-visible:outline-2 focus-visible:outline-blue-800"
					>
						Item {id.toUpperCase()}
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Panel
					class="h-[var(--accordion-panel-height)] overflow-hidden text-gray-600 transition-[height] duration-150 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0 dark:text-gray-400"
				>
					<p class="pb-3">Content of item {id.toUpperCase()}.</p>
				</Accordion.Panel>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
</div>
```

### Hidden until found

Set `hiddenUntilFound` on the root or on a panel to keep closed panels in the DOM. The browser's find-in-page can then find their text and open the panel. A closed panel uses `hidden="until-found"`, so its content stays hidden from view and from assistive technology until it opens.

```svelte
<Accordion.Root hiddenUntilFound>…</Accordion.Root>
```

Set `keepMounted` to keep closed panels in the DOM without making them searchable. `hiddenUntilFound` overrides `keepMounted`.

### Disabled items

Set `disabled` on the root to disable every item, or on one item to disable only that item. A disabled trigger ignores clicks but stays focusable.

```svelte demo
<script lang="ts">
	import { Accordion } from '@sveltery/base/accordion';
</script>

<Accordion.Root class="w-80 text-sm text-gray-900 dark:text-gray-100">
	<Accordion.Item value="plan" class="border-b border-gray-200 dark:border-gray-700">
		<Accordion.Header>
			<Accordion.Trigger
				class="flex w-full justify-between py-2 text-left font-medium hover:underline focus-visible:outline-2 focus-visible:outline-blue-800"
			>
				Plan
			</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel keepMounted class="text-gray-600 dark:text-gray-400">
			<p class="pb-3">You are on the free plan.</p>
		</Accordion.Panel>
	</Accordion.Item>
	<Accordion.Item value="billing" disabled class="border-b border-gray-200 dark:border-gray-700">
		<Accordion.Header>
			<Accordion.Trigger
				class="flex w-full justify-between py-2 text-left font-medium data-[disabled]:text-gray-400 dark:data-[disabled]:text-gray-600"
			>
				Billing
			</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel class="text-gray-600 dark:text-gray-400">
			<p class="pb-3">Billing details.</p>
		</Accordion.Panel>
	</Accordion.Item>
</Accordion.Root>
```

### Veto a change

`onValueChange` on the root and `onOpenChange` on an item run before the open values change. Call `eventDetails.cancel()` to keep the accordion as it is.

```svelte
<Accordion.Root
	onValueChange={(value, eventDetails) => {
		if (value.length === 0) eventDetails.cancel();
	}}
>
	…
</Accordion.Root>
```

### Animate the panel

The panel sets `--accordion-panel-height` and `--accordion-panel-width` to its measured size. Transition `height` to the variable, and use `[data-starting-style]` and `[data-ending-style]` for the closed size:

```css
.panel {
	height: var(--accordion-panel-height);
	overflow: hidden;
	transition: height 150ms ease-out;
}

.panel[data-starting-style],
.panel[data-ending-style] {
	height: 0;
}
```

## Differences from Base UI

- `value` is one bindable prop. Use `bind:value` instead of `value`, `defaultValue`, and `onValueChange` together. There is no `defaultValue` prop: pass `value` without `bind:` to set the initial state. `Accordion.Item` has no `defaultValue` either. Only form controls keep `defaultValue` and `defaultChecked`.
- `onValueChange` and `onOpenChange` run before the state changes. Call `eventDetails.cancel()` to keep the accordion as it is.
- `multiple` defaults to `false`, so opening an item closes the others.
- `orientation` and `loopFocus` do not move focus. Arrow keys do not move focus between triggers. `orientation` still sets `data-orientation`.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- Handlers use lowercase names, such as `onclick`. Call `event.preventDefault()` in a handler on `Accordion.Trigger` to skip the trigger's own handling.
- Refs are not supported. Use `bind:this` or an attachment on the part.

## API reference

### Root

<ApiPart name="accordion" part="Root" />

| Attribute          | Description                                         |
| ------------------ | --------------------------------------------------- |
| `data-orientation` | The `orientation` prop: `vertical` or `horizontal`. |
| `data-disabled`    | Present when the accordion is disabled.             |

### Item

<ApiPart name="accordion" part="Item" />

| Attribute          | Description                                                         |
| ------------------ | ------------------------------------------------------------------- |
| `data-open`        | Present when the item is open.                                      |
| `data-closed`      | Present when the item is closed.                                    |
| `data-hidden`      | Present when the item is closed and its panel has finished closing. |
| `data-disabled`    | Present when the item or the accordion is disabled.                 |
| `data-orientation` | The `orientation` prop of the root.                                 |
| `data-index`       | The index of the item in DOM order.                                 |

### Header

<ApiPart name="accordion" part="Header" />

| Attribute          | Description                                                         |
| ------------------ | ------------------------------------------------------------------- |
| `data-open`        | Present when the item is open.                                      |
| `data-closed`      | Present when the item is closed.                                    |
| `data-hidden`      | Present when the item is closed and its panel has finished closing. |
| `data-disabled`    | Present when the item or the accordion is disabled.                 |
| `data-orientation` | The `orientation` prop of the root.                                 |
| `data-index`       | The index of the item in DOM order.                                 |

### Trigger

<ApiPart name="accordion" part="Trigger" />

| Attribute          | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `data-panel-open`  | Present when the item is open.                                              |
| `data-hidden`      | Present when the item is closed and its panel has finished closing.         |
| `data-disabled`    | Present when the item or the accordion is disabled.                         |
| `data-orientation` | The `orientation` prop of the root.                                         |
| `data-index`       | The index of the item in DOM order. The trigger of the first item omits it. |

### Panel

<ApiPart name="accordion" part="Panel" />

| Attribute             | Description                                                         |
| --------------------- | ------------------------------------------------------------------- |
| `data-open`           | Present when the item is open.                                      |
| `data-closed`         | Present when the item is closed.                                    |
| `data-hidden`         | Present when the item is closed and its panel has finished closing. |
| `data-disabled`       | Present when the item or the accordion is disabled.                 |
| `data-orientation`    | The `orientation` prop of the root.                                 |
| `data-index`          | The index of the item in DOM order.                                 |
| `data-starting-style` | Present when the panel is animating in.                             |
| `data-ending-style`   | Present when the panel is animating out.                            |

| CSS variable               | Description                                                       |
| -------------------------- | ----------------------------------------------------------------- |
| `--accordion-panel-height` | The panel's height in pixels while it measures, otherwise `auto`. |
| `--accordion-panel-width`  | The panel's width in pixels while it measures, otherwise `auto`.  |
