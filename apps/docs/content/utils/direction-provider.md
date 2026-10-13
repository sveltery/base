---
title: Direction Provider
description: Enables right-to-left (RTL) behavior for Sveltery Base components.
---

```svelte demo
<script lang="ts">
	import { DirectionProvider } from '@sveltery/base/direction-provider';
	import { Slider } from '@sveltery/base/slider';
</script>

<DirectionProvider direction="rtl">
	<div dir="rtl" class="w-64">
		<Slider.Root defaultValue={25}>
			<Slider.Control class="flex w-full touch-none items-center py-3 select-none">
				<Slider.Track class="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700">
					<Slider.Indicator class="rounded-sm bg-gray-700 dark:bg-gray-300" />
					<Slider.Thumb
						aria-label="Volume"
						class="size-4 rounded-full bg-white outline-1 outline-gray-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800 dark:bg-gray-900 dark:outline-gray-600"
					/>
				</Slider.Track>
			</Slider.Control>
		</Slider.Root>
	</div>
</DirectionProvider>
```

## Anatomy

Import the provider and wrap your app or a group of components:

```svelte
<script lang="ts">
	import { DirectionProvider } from '@sveltery/base/direction-provider';
</script>

<DirectionProvider direction="rtl">
	<!-- Your app or a group of components -->
</DirectionProvider>
```

The provider changes how the components inside it behave in right-to-left text. It does not change your HTML or CSS. Set the `dir="rtl"` attribute or the `direction: rtl` style yourself.

## Examples

### Switch the direction

`direction` is a live prop. When it changes, every component inside the provider follows. This example switches the direction of a set of tabs. In `rtl`, the left arrow key moves to the next tab.

```svelte demo
<script lang="ts">
	import { DirectionProvider, type TextDirection } from '@sveltery/base/direction-provider';
	import { Tabs } from '@sveltery/base/tabs';

	let direction = $state<TextDirection>('ltr');

	const tab =
		'flex h-8 items-center px-3 text-sm font-medium text-gray-600 outline-0 select-none hover:text-gray-900 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[active]:text-gray-900 data-[active]:shadow-[inset_0_-2px] data-[active]:shadow-gray-900 dark:text-gray-400 dark:hover:text-gray-100 dark:data-[active]:text-gray-100 dark:data-[active]:shadow-gray-100';
</script>

<div class="flex flex-col gap-3 text-sm text-gray-900 dark:text-gray-100">
	<div class="flex gap-4">
		<label class="flex items-center gap-2">
			<input type="radio" name="direction" value="ltr" bind:group={direction} />
			ltr
		</label>
		<label class="flex items-center gap-2">
			<input type="radio" name="direction" value="rtl" bind:group={direction} />
			rtl
		</label>
	</div>
	<DirectionProvider {direction}>
		<div dir={direction} class="w-80">
			<Tabs.Root value="one">
				<Tabs.List class="flex gap-1 border-b border-gray-200 dark:border-gray-700">
					<Tabs.Tab value="one" class={tab}>One</Tabs.Tab>
					<Tabs.Tab value="two" class={tab}>Two</Tabs.Tab>
					<Tabs.Tab value="three" class={tab}>Three</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value="one" class="py-3">First panel</Tabs.Panel>
				<Tabs.Panel value="two" class="py-3">Second panel</Tabs.Panel>
				<Tabs.Panel value="three" class="py-3">Third panel</Tabs.Panel>
			</Tabs.Root>
		</div>
	</DirectionProvider>
</div>
```

### Read the direction

Use `useDirection` when you build a component that renders outside your app root, such as a portal. The `dir` attribute on your app does not reach a portaled element, so copy the direction onto it.

Call `useDirection` while the component initializes. It returns an object with a `direction` property. Read the property in the template, in `$derived`, or in an event handler. The property stays current when the provider's `direction` changes.

```svelte
<script lang="ts">
	import { useDirection } from '@sveltery/base/direction-provider';

	const reading = useDirection();
	const arrow = $derived(reading.direction === 'rtl' ? '←' : '→');
</script>

<div dir={reading.direction}>Next {arrow}</div>
```

Outside a provider, `useDirection` returns `ltr`.

## Differences from Base UI

- `useDirection()` returns an object, not a string. Read `reading.direction` instead of using the return value directly. This keeps the value live when the provider's `direction` changes, because Svelte cannot track a plain string that a function returned.
- Call `useDirection()` during component initialization, not inside an event handler or an effect.
- Components read the direction only from the provider. They do not read the `dir` attribute or the CSS `direction` of an element. Wrap your app in a `DirectionProvider` for RTL behavior, even when you also set `dir`.
- The provider renders no element and has no state. It does not set `dir` for you.
- These components read the provider today: Tabs, Toolbar, Slider, Radio Group, OTP Field, Scroll Area, and the Popover viewport.

## API reference

### DirectionProvider

<ApiPart name="direction-provider" part="DirectionProvider" />

The provider renders no element, so it has no data attributes or CSS variables.

### useDirection

```ts
function useDirection(): DirectionReading;

interface DirectionReading {
	readonly direction: TextDirection;
}
```

Returns the direction of the nearest `DirectionProvider`, or `{ direction: 'ltr' }` when there is none. Call it during component initialization.

### TextDirection

```ts
type TextDirection = 'ltr' | 'rtl';
```
