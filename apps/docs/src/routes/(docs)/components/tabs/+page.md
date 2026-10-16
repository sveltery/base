# Tabs

<Subtitle>
  A component for toggling between related panels on the same page.
</Subtitle>

<Meta name="description" content="A component for toggling between related panels on the same page." />

```svelte demo
<script lang="ts">
	import { Tabs } from '@sveltery/base/tabs';

	const tabClassName =
		'flex h-[calc(2rem+1px)] items-center justify-center bg-transparent px-2 py-0 font-inherit text-sm font-normal leading-5 break-keep whitespace-nowrap text-neutral-600 outline-none select-none hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-active:text-neutral-950 dark:text-neutral-300 dark:hover:text-white dark:data-active:text-white';

	const panelClassName =
		'col-start-1 row-start-1 flex w-full items-center justify-center bg-white p-4 text-center text-sm text-neutral-950 outline-none focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:bg-neutral-950 dark:text-white [[hidden]]:hidden';
</script>

<Tabs.Root class="w-full max-w-xs" value="overview">
	<Tabs.List class="relative z-1 -mb-px flex gap-1">
		<Tabs.Tab class={tabClassName} value="overview">Overview</Tabs.Tab>
		<Tabs.Tab class={tabClassName} value="projects">Projects</Tabs.Tab>
		<Tabs.Tab class={tabClassName} value="account">Account</Tabs.Tab>
		<Tabs.Indicator
			class="absolute top-0 left-0 -z-1 h-full w-(--active-tab-width) translate-x-(--active-tab-left) border-x border-t border-neutral-950 bg-white transition-[translate,width] duration-150 ease-in-out dark:border-white dark:bg-neutral-950"
		/>
	</Tabs.List>
	<div class="grid w-full min-h-32 grid-cols-1 border border-neutral-950 dark:border-white">
		<Tabs.Panel class={panelClassName} value="overview">
			<p>Workspace stats and activity.</p>
		</Tabs.Panel>
		<Tabs.Panel class={panelClassName} value="projects">
			<p>Milestones and deadlines.</p>
		</Tabs.Panel>
		<Tabs.Panel class={panelClassName} value="account">
			<p>Profile and preferences.</p>
		</Tabs.Panel>
	</div>
</Tabs.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
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

### Animated panels

Animate panels as they activate using the `data-starting-style` and `data-ending-style` attributes.
The `data-activation-direction` attribute indicates which direction the newly active tab is relative to the previously active one, letting panels slide in from the correct side.

```svelte demo
<script lang="ts">
	import { Tabs } from '@sveltery/base/tabs';

	const tabClassName =
		'flex h-[calc(2rem+1px)] items-center justify-center bg-transparent px-2 py-0 font-inherit text-sm font-normal leading-5 break-keep whitespace-nowrap text-neutral-600 outline-none select-none hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-active:text-neutral-950 dark:text-neutral-300 dark:hover:text-white dark:data-active:text-white';

	const panelClassName =
		'col-start-1 row-start-1 flex w-full items-center justify-center p-4 text-center text-sm text-neutral-950 outline-none focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:text-white [transition:opacity_175ms_ease,translate_350ms_cubic-bezier(0.22,1,0.36,1)] data-starting-style:opacity-0 data-ending-style:opacity-0 motion-safe:data-starting-style:data-[activation-direction=left]:translate-x-[-50%] motion-safe:data-starting-style:data-[activation-direction=right]:translate-x-[50%] motion-safe:data-ending-style:data-[activation-direction=left]:translate-x-[50%] motion-safe:data-ending-style:data-[activation-direction=right]:translate-x-[-50%]';
</script>

<Tabs.Root class="w-full max-w-xs" value="overview">
	<Tabs.List class="relative z-1 -mb-px flex gap-1">
		<Tabs.Tab class={tabClassName} value="overview">Overview</Tabs.Tab>
		<Tabs.Tab class={tabClassName} value="projects">Projects</Tabs.Tab>
		<Tabs.Tab class={tabClassName} value="account">Account</Tabs.Tab>
		<Tabs.Indicator
			class="absolute top-0 left-0 -z-1 h-full w-(--active-tab-width) translate-x-(--active-tab-left) border-x border-t border-neutral-950 bg-white transition-[translate,width] duration-150 ease-in-out dark:border-white dark:bg-neutral-950"
		/>
	</Tabs.List>
	<div
		class="relative grid min-h-32 w-full grid-cols-1 overflow-hidden border border-neutral-950 bg-white dark:border-white dark:bg-neutral-950"
	>
		<Tabs.Panel class={panelClassName} value="overview">
			<p>Workspace stats and activity.</p>
		</Tabs.Panel>
		<Tabs.Panel class={panelClassName} value="projects">
			<p>Milestones and deadlines.</p>
		</Tabs.Panel>
		<Tabs.Panel class={panelClassName} value="account">
			<p>Profile and preferences.</p>
		</Tabs.Panel>
	</div>
</Tabs.Root>
```

### Links

Use the `render` snippet and set `nativeButton={false}` on `<Tabs.Tab>` to render tabs as anchor elements.

```svelte title="Tabs as links"
<script lang="ts">
	import { Tabs } from '@sveltery/base/tabs';
</script>

<Tabs.Root>
	<Tabs.List>
		<!-- @highlight-start -->
		<!-- @highlight-text "nativeButton={false}" -->
		<Tabs.Tab nativeButton={false} value="overview">
			<!-- @highlight-text "render" -->
			{#snippet render(props, state, children)}
				<a href="/overview" {...props}>{@render children?.()}</a>
			{/snippet}
			Overview
		</Tabs.Tab>
		<!-- @highlight-end -->
	</Tabs.List>
	<!-- ... -->
</Tabs.Root>
```

## API reference

<script>
	import { TypesTabs } from './types';
</script>

### Root

<TypesTabs.Root />

### List

<TypesTabs.List />

### Tab

<TypesTabs.Tab />

### Indicator

<TypesTabs.Indicator />

### Panel

<TypesTabs.Panel />
