---
title: Tabs
description: A component for switching between related panels on the same page.
---

```svelte demo
<script lang="ts">
	import { Tabs } from '@sveltery/base/tabs';

	const tab =
		'z-10 flex h-8 items-center justify-center px-3 text-sm font-medium text-gray-600 outline-0 select-none hover:text-gray-900 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[active]:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 dark:data-[active]:text-gray-100';
</script>

<Tabs.Root
	value="overview"
	class="w-80 rounded-md border border-gray-200 text-gray-900 dark:border-gray-700 dark:text-gray-100"
>
	<Tabs.List class="relative z-0 flex gap-1 border-b border-gray-200 px-1 dark:border-gray-700">
		<Tabs.Tab value="overview" class={tab}>Overview</Tabs.Tab>
		<Tabs.Tab value="projects" class={tab}>Projects</Tabs.Tab>
		<Tabs.Tab value="account" class={tab}>Account</Tabs.Tab>
		<Tabs.Indicator
			class="absolute top-1/2 left-0 z-0 h-6 w-[var(--active-tab-width)] -translate-y-1/2 translate-x-[var(--active-tab-left)] rounded-sm bg-gray-100 transition-all duration-200 ease-in-out dark:bg-gray-800"
		/>
	</Tabs.List>
	<Tabs.Panel
		value="overview"
		class="flex h-24 items-center justify-center text-sm outline-0 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800"
	>
		Overview panel
	</Tabs.Panel>
	<Tabs.Panel
		value="projects"
		class="flex h-24 items-center justify-center text-sm outline-0 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800"
	>
		Projects panel
	</Tabs.Panel>
	<Tabs.Panel
		value="account"
		class="flex h-24 items-center justify-center text-sm outline-0 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800"
	>
		Account panel
	</Tabs.Panel>
</Tabs.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Tabs } from '@sveltery/base/tabs';
</script>

<Tabs.Root>
	<Tabs.List>
		<Tabs.Tab />
		<Tabs.Indicator />
	</Tabs.List>
	<Tabs.Panel />
</Tabs.Root>
```

## Examples

### Selected tab

Each `Tabs.Tab` and its `Tabs.Panel` share a `value`. Bind `value` to read and change the selected tab. A value can be any type. The default is `0`. When no tab has the selected value, the root selects the first enabled tab. Set `value` to `null` to select no tab.

```svelte demo
<script lang="ts">
	import { Tabs } from '@sveltery/base/tabs';

	let value = $state('projects');

	const tab =
		'flex h-8 items-center justify-center px-3 text-sm font-medium text-gray-600 outline-0 select-none hover:text-gray-900 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[active]:text-gray-900 data-[active]:shadow-[inset_0_-2px] data-[active]:shadow-gray-900 dark:text-gray-400 dark:hover:text-gray-100 dark:data-[active]:text-gray-100 dark:data-[active]:shadow-gray-100';
</script>

<div class="flex w-80 flex-col gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Tabs.Root bind:value>
		<Tabs.List class="flex gap-1 border-b border-gray-200 dark:border-gray-700">
			<Tabs.Tab value="overview" class={tab}>Overview</Tabs.Tab>
			<Tabs.Tab value="projects" class={tab}>Projects</Tabs.Tab>
			<Tabs.Tab value="account" class={tab}>Account</Tabs.Tab>
		</Tabs.List>
		<Tabs.Panel value="overview" class="py-3">Overview panel</Tabs.Panel>
		<Tabs.Panel value="projects" class="py-3">Projects panel</Tabs.Panel>
		<Tabs.Panel value="account" class="py-3">Account panel</Tabs.Panel>
	</Tabs.Root>
	<button
		type="button"
		class="self-start rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		onclick={() => (value = 'account')}
	>
		Select Account (value: {value})
	</button>
</div>
```

### Vertical tabs

Set `orientation="vertical"` on the root. The up and down arrow keys move between tabs, and the list sets `aria-orientation`. Every part gets `data-orientation="vertical"`.

```svelte demo
<script lang="ts">
	import { Tabs } from '@sveltery/base/tabs';

	const tab =
		'flex h-8 items-center px-3 text-sm font-medium text-gray-600 outline-0 select-none hover:text-gray-900 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[active]:text-gray-900 data-[active]:shadow-[inset_-2px_0] data-[active]:shadow-gray-900 dark:text-gray-400 dark:hover:text-gray-100 dark:data-[active]:text-gray-100 dark:data-[active]:shadow-gray-100';
</script>

<Tabs.Root
	value="general"
	orientation="vertical"
	class="flex w-80 text-gray-900 dark:text-gray-100"
>
	<Tabs.List class="flex flex-col border-r border-gray-200 dark:border-gray-700">
		<Tabs.Tab value="general" class={tab}>General</Tabs.Tab>
		<Tabs.Tab value="security" class={tab}>Security</Tabs.Tab>
		<Tabs.Tab value="billing" class={tab}>Billing</Tabs.Tab>
	</Tabs.List>
	<Tabs.Panel value="general" class="flex-1 px-4 py-2 text-sm">General settings</Tabs.Panel>
	<Tabs.Panel value="security" class="flex-1 px-4 py-2 text-sm">Security settings</Tabs.Panel>
	<Tabs.Panel value="billing" class="flex-1 px-4 py-2 text-sm">Billing settings</Tabs.Panel>
</Tabs.Root>
```

### Activate on focus

By default, the arrow keys move focus and Enter or Space selects the focused tab. Set `activateOnFocus` on the list to select a tab as soon as it receives focus. Set `loopFocus={false}` to stop the arrow keys from wrapping at the ends.

```svelte
<Tabs.List activateOnFocus loopFocus={false}>…</Tabs.List>
```

### Disabled tab

A disabled tab cannot be selected, but it stays in the arrow key order so keyboard users can find it. The tab gets `data-disabled` and `aria-disabled`.

```svelte demo
<script lang="ts">
	import { Tabs } from '@sveltery/base/tabs';

	const tab =
		'flex h-8 items-center px-3 text-sm font-medium text-gray-600 outline-0 select-none hover:text-gray-900 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[active]:text-gray-900 data-[active]:shadow-[inset_0_-2px] data-[active]:shadow-gray-900 data-[disabled]:cursor-not-allowed data-[disabled]:text-gray-400 dark:text-gray-400 dark:hover:text-gray-100 dark:data-[active]:text-gray-100 dark:data-[active]:shadow-gray-100 dark:data-[disabled]:text-gray-600';
</script>

<Tabs.Root value="overview" class="w-80 text-gray-900 dark:text-gray-100">
	<Tabs.List class="flex gap-1 border-b border-gray-200 dark:border-gray-700">
		<Tabs.Tab value="overview" class={tab}>Overview</Tabs.Tab>
		<Tabs.Tab value="reports" disabled class={tab}>Reports</Tabs.Tab>
		<Tabs.Tab value="account" class={tab}>Account</Tabs.Tab>
	</Tabs.List>
	<Tabs.Panel value="overview" class="py-3 text-sm">Overview panel</Tabs.Panel>
	<Tabs.Panel value="reports" class="py-3 text-sm">Reports panel</Tabs.Panel>
	<Tabs.Panel value="account" class="py-3 text-sm">Account panel</Tabs.Panel>
</Tabs.Root>
```

### Animated panels

A panel stays mounted while it plays its exit transition. During the transition it has `data-starting-style` or `data-ending-style`. Every part has `data-activation-direction`, which tells you whether the new tab is to the `left` or `right` (or `up` or `down` for vertical tabs) of the previous one. Use it to slide panels in from the matching side.

```svelte demo
<script lang="ts">
	import { Tabs } from '@sveltery/base/tabs';

	const tab =
		'z-10 flex h-8 items-center justify-center px-3 text-sm font-medium text-gray-600 outline-0 select-none hover:text-gray-900 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[active]:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 dark:data-[active]:text-gray-100';

	const panel =
		'flex h-24 w-full items-center justify-center text-sm transition-[transform,opacity] duration-300 ease-out data-[ending-style]:absolute data-[ending-style]:inset-0 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[starting-style]:data-[activation-direction=left]:-translate-x-1/2 data-[starting-style]:data-[activation-direction=right]:translate-x-1/2 data-[ending-style]:data-[activation-direction=left]:translate-x-1/2 data-[ending-style]:data-[activation-direction=right]:-translate-x-1/2';
</script>

<Tabs.Root
	value="overview"
	class="w-80 rounded-md border border-gray-200 text-gray-900 dark:border-gray-700 dark:text-gray-100"
>
	<Tabs.List class="relative z-0 flex gap-1 border-b border-gray-200 px-1 dark:border-gray-700">
		<Tabs.Tab value="overview" class={tab}>Overview</Tabs.Tab>
		<Tabs.Tab value="projects" class={tab}>Projects</Tabs.Tab>
		<Tabs.Tab value="account" class={tab}>Account</Tabs.Tab>
		<Tabs.Indicator
			class="absolute top-1/2 left-0 z-0 h-6 w-[var(--active-tab-width)] -translate-y-1/2 translate-x-[var(--active-tab-left)] rounded-sm bg-gray-100 transition-all duration-200 ease-in-out dark:bg-gray-800"
		/>
	</Tabs.List>
	<div class="relative overflow-hidden">
		<Tabs.Panel value="overview" class={panel}>Overview panel</Tabs.Panel>
		<Tabs.Panel value="projects" class={panel}>Projects panel</Tabs.Panel>
		<Tabs.Panel value="account" class={panel}>Account panel</Tabs.Panel>
	</div>
</Tabs.Root>
```

### Keep panels mounted

A hidden panel is removed from the DOM after its exit transition. Set `keepMounted` on a panel to keep it in the DOM while hidden. A hidden panel has the `hidden` attribute, `data-hidden`, and `inert`. The panel below keeps the text you type when you switch tabs.

```svelte demo
<script lang="ts">
	import { Tabs } from '@sveltery/base/tabs';

	const tab =
		'flex h-8 items-center px-3 text-sm font-medium text-gray-600 outline-0 select-none hover:text-gray-900 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[active]:text-gray-900 data-[active]:shadow-[inset_0_-2px] data-[active]:shadow-gray-900 dark:text-gray-400 dark:hover:text-gray-100 dark:data-[active]:text-gray-100 dark:data-[active]:shadow-gray-100';
</script>

<Tabs.Root value="notes" class="w-80 text-gray-900 dark:text-gray-100">
	<Tabs.List class="flex gap-1 border-b border-gray-200 dark:border-gray-700">
		<Tabs.Tab value="notes" class={tab}>Notes</Tabs.Tab>
		<Tabs.Tab value="draft" class={tab}>Draft</Tabs.Tab>
	</Tabs.List>
	<Tabs.Panel value="notes" keepMounted class="py-3 text-sm">
		<textarea
			class="w-full rounded-sm border border-gray-200 p-2 dark:border-gray-700"
			rows="2"
			placeholder="Type here. The text survives a tab change."></textarea>
	</Tabs.Panel>
	<Tabs.Panel value="draft" keepMounted class="py-3 text-sm">Draft panel</Tabs.Panel>
</Tabs.Root>
```

### Links

To render tabs as links, set `nativeButton={false}` and pass a `render` snippet. Spread `props` onto the anchor and render `children` inside it.

```svelte demo
<script lang="ts">
	import { Tabs } from '@sveltery/base/tabs';

	const tab =
		'flex h-8 items-center px-3 text-sm font-medium text-gray-600! no-underline! outline-0 select-none hover:text-gray-900! focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[active]:text-gray-900! data-[active]:shadow-[inset_0_-2px] data-[active]:shadow-gray-900 dark:text-gray-400! dark:hover:text-gray-100! dark:data-[active]:text-gray-100! dark:data-[active]:shadow-gray-100';
</script>

<Tabs.Root value="overview" class="w-80 text-gray-900 dark:text-gray-100">
	<Tabs.List class="flex gap-1 border-b border-gray-200 dark:border-gray-700">
		{#each ['overview', 'projects', 'account'] as name (name)}
			<Tabs.Tab value={name} nativeButton={false} class={tab}>
				{#snippet render(props, state, children)}
					<a {...props} href="/components/tabs" onclick={(event) => event.preventDefault()}>
						{@render children?.()}
					</a>
				{/snippet}
				{name[0].toUpperCase() + name.slice(1)}
			</Tabs.Tab>
		{/each}
	</Tabs.List>
	<Tabs.Panel value="overview" class="py-3 text-sm">Overview panel</Tabs.Panel>
	<Tabs.Panel value="projects" class="py-3 text-sm">Projects panel</Tabs.Panel>
	<Tabs.Panel value="account" class="py-3 text-sm">Account panel</Tabs.Panel>
</Tabs.Root>
```

## Differences from Base UI

- `value` is one bindable prop. Use `bind:value` instead of `value` and `onValueChange` together. There is no `defaultValue` prop: pass `value` without `bind:` to set the initial tab, and the tabs keep their own state after that.
- `onValueChange` runs before the value changes. Call `eventDetails.cancel()` to keep the current tab. `cancel()` stops a change with the reason `none`, which is a click or keyboard activation. It does not stop the automatic changes with the reasons `disabled` and `missing`. `eventDetails.activationDirection` tells you where the next tab sits relative to the current one.
- The root moves the selection to the first enabled tab when the selected tab becomes disabled or is removed, whether or not you pass `value`. Base UI keeps a controlled value. A value you pass at mount stays selected while its tab is disabled or not yet rendered, until it has named an enabled tab once. Base UI holds only a disabled `defaultValue` tab.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`. `children` is undefined when no content is passed, so call `children?.()`.
- Handlers use Svelte's lowercase names, such as `onclick` and `onkeydown`. Call `event.preventDefault()` in a handler on `Tabs.Tab` to skip the tab's own handler.
- A disabled tab ignores Enter and Space, but the arrow keys still move focus through it.
- The arrow keys follow the reading direction from a [Direction Provider](/utils/direction-provider). In `rtl`, the left arrow moves to the next tab.
- `Tabs.Indicator` accepts `renderBeforeHydration` and ignores it. It renders no script before hydration, so the indicator appears after the page hydrates. Nothing scrolls the focused tab into view, and the parts take no `ref`.

## API reference

### Root

<ApiPart name="tabs" part="Root" />

| Attribute                   | Description                                                                    |
| --------------------------- | ------------------------------------------------------------------------------ |
| `data-orientation`          | `horizontal` or `vertical`.                                                    |
| `data-activation-direction` | `left`, `right`, `up`, `down`, or `none`, relative to the previous active tab. |

### List

<ApiPart name="tabs" part="List" />

| Attribute                   | Description                                                                    |
| --------------------------- | ------------------------------------------------------------------------------ |
| `data-orientation`          | `horizontal` or `vertical`.                                                    |
| `data-activation-direction` | `left`, `right`, `up`, `down`, or `none`, relative to the previous active tab. |

### Tab

<ApiPart name="tabs" part="Tab" />

| Attribute                   | Description                                                                    |
| --------------------------- | ------------------------------------------------------------------------------ |
| `data-orientation`          | `horizontal` or `vertical`.                                                    |
| `data-activation-direction` | `left`, `right`, `up`, `down`, or `none`, relative to the previous active tab. |
| `data-active`               | Present when the tab is selected.                                              |
| `data-disabled`             | Present when the tab is disabled.                                              |

### Panel

<ApiPart name="tabs" part="Panel" />

| Attribute                   | Description                                                                    |
| --------------------------- | ------------------------------------------------------------------------------ |
| `data-orientation`          | `horizontal` or `vertical`.                                                    |
| `data-activation-direction` | `left`, `right`, `up`, `down`, or `none`, relative to the previous active tab. |
| `data-hidden`               | Present when the panel is hidden.                                              |
| `data-index`                | The panel's position among the mounted panels in the root.                     |
| `data-starting-style`       | Present when the panel is animating in.                                        |
| `data-ending-style`         | Present when the panel is animating out.                                       |

### Indicator

<ApiPart name="tabs" part="Indicator" />

| Attribute                   | Description                                                                    |
| --------------------------- | ------------------------------------------------------------------------------ |
| `data-orientation`          | `horizontal` or `vertical`.                                                    |
| `data-activation-direction` | `left`, `right`, `up`, `down`, or `none`, relative to the previous active tab. |

| CSS variable          | Description                                             |
| --------------------- | ------------------------------------------------------- |
| `--active-tab-left`   | Distance from the left of the list to the active tab.   |
| `--active-tab-right`  | Distance from the right of the list to the active tab.  |
| `--active-tab-top`    | Distance from the top of the list to the active tab.    |
| `--active-tab-bottom` | Distance from the bottom of the list to the active tab. |
| `--active-tab-width`  | The active tab's width.                                 |
| `--active-tab-height` | The active tab's height.                                |
