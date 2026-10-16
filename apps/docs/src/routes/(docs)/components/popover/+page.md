# Popover

<Subtitle>
  An accessible popup anchored to a button.
</Subtitle>

<Meta name="description" content="An accessible popup anchored to a button." />

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	const triggerClassName =
		'flex h-8 items-center justify-center border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm font-normal whitespace-nowrap text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 data-pressed:bg-neutral-100 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<Popover.Root>
	<Popover.Trigger class={triggerClassName}>Notifications</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup
				class="relative flex h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] max-w-[500px] flex-col gap-1 origin-[var(--transform-origin)] bg-white dark:bg-neutral-950 p-3 text-neutral-950 dark:text-white outline-none border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
			>
				<Popover.Arrow
					class="relative block w-3 h-1.5 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-white dark:before:bg-neutral-950 before:border before:border-neutral-950 dark:before:border-white before:[transform:translate(-50%,50%)_rotate(45deg)]"
				/>
				<Popover.Title class="text-sm font-bold">Notifications</Popover.Title>
				<Popover.Description class="text-sm text-neutral-600 dark:text-neutral-400">
					You are all caught up. Good job!
				</Popover.Description>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
</script>

<Popover.Root>
	<Popover.Trigger />
	<Popover.Portal>
		<Popover.Backdrop />
		<Popover.Positioner>
			<Popover.Popup>
				<Popover.Arrow />
				<Popover.Viewport>
					<Popover.Title />
					<Popover.Description />
					<Popover.Close />
				</Popover.Viewport>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

## Examples

### Opening on hover

This example shows how you can configure the popover to open on hover using the `openOnHover` prop.

You can use the `delay` prop to specify how long to wait (in milliseconds) before the popover opens on hover.

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	const triggerClassName =
		'flex h-8 items-center justify-center border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm font-normal whitespace-nowrap text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 data-pressed:bg-neutral-100 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<Popover.Root>
	<Popover.Trigger openOnHover class={triggerClassName}>Notifications</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup
				class="relative flex h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] max-w-[500px] flex-col gap-1 origin-[var(--transform-origin)] bg-white dark:bg-neutral-950 p-3 text-neutral-950 dark:text-white outline-none border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
			>
				<Popover.Arrow
					class="relative block w-3 h-1.5 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-white dark:before:bg-neutral-950 before:border before:border-neutral-950 dark:before:border-white before:[transform:translate(-50%,50%)_rotate(45deg)]"
				/>
				<Popover.Title class="text-sm font-bold">Notifications</Popover.Title>
				<Popover.Description class="text-sm text-neutral-600 dark:text-neutral-400">
					You are all caught up. Good job!
				</Popover.Description>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

### Detached triggers

A popover can be controlled by a trigger located either inside or outside the `<Popover.Root>` component.
For simple, one-off interactions, place the `<Popover.Trigger>` inside `<Popover.Root>`, as shown in the example at the top of this page.

However, if defining the popover's content next to its trigger is not practical, you can use a detached trigger.
This involves placing the `<Popover.Trigger>` outside of `<Popover.Root>` and linking them with a `handle` created by the `Popover.createHandle()` function.

The imperative methods on the handle, such as `open()` and `close()`, require a `<Popover.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```svelte title="Detached triggers"
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	const demoPopover = Popover.createHandle();
</script>

<!-- @highlight -->
<!-- @highlight-text "handle={demoPopover}" -->
<Popover.Trigger handle={demoPopover}>Trigger</Popover.Trigger>

<!-- @highlight -->
<!-- @highlight-text "handle={demoPopover}" -->
<Popover.Root handle={demoPopover}>...</Popover.Root>
```

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	const demoPopover = Popover.createHandle();

	const triggerClassName =
		'flex h-8 items-center justify-center border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm font-normal whitespace-nowrap text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 data-pressed:bg-neutral-100 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<Popover.Trigger class={triggerClassName} handle={demoPopover}>Notifications</Popover.Trigger>

<Popover.Root handle={demoPopover}>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup
				class="relative flex h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] max-w-[500px] flex-col gap-1 origin-[var(--transform-origin)] bg-white dark:bg-neutral-950 p-3 text-neutral-950 dark:text-white outline-none border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
			>
				<Popover.Arrow
					class="relative block w-3 h-1.5 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-white dark:before:bg-neutral-950 before:border before:border-neutral-950 dark:before:border-white before:[transform:translate(-50%,50%)_rotate(45deg)]"
				/>
				<Popover.Title class="text-sm font-bold">Notifications</Popover.Title>
				<Popover.Description class="text-sm text-neutral-600 dark:text-neutral-400">
					You are all caught up. Good job!
				</Popover.Description>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

### Multiple triggers

A single popover can be opened by multiple trigger elements.
You can achieve this by using the same `handle` for several detached triggers, or by placing multiple `<Popover.Trigger>` components inside a single `<Popover.Root>`.

```svelte title="Multiple triggers within the Root part"
<Popover.Root>
	<Popover.Trigger>Trigger 1</Popover.Trigger>
	<Popover.Trigger>Trigger 2</Popover.Trigger>
	...
</Popover.Root>
```

```svelte title="Multiple detached triggers"
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	const demoPopover = Popover.createHandle();
</script>

<Popover.Trigger handle={demoPopover}>Trigger 1</Popover.Trigger>

<Popover.Trigger handle={demoPopover}>Trigger 2</Popover.Trigger>

<Popover.Root handle={demoPopover}>...</Popover.Root>
```

The popover can render different content depending on which trigger opened it.
This is achieved by passing a `payload` to the `<Popover.Trigger>` and using the `children` snippet of `<Popover.Root>`, which receives the `payload`.

The payload can be strongly typed by providing a type argument to the `createHandle()` function:

```svelte title="Detached triggers with payload"
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	// @highlight
	const demoPopover = Popover.createHandle<{ text: string }>();
</script>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<Popover.Trigger handle={demoPopover} payload={{ text: 'Trigger 1' }}>Trigger 1</Popover.Trigger>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<Popover.Trigger handle={demoPopover} payload={{ text: 'Trigger 2' }}>Trigger 2</Popover.Trigger>

<Popover.Root handle={demoPopover}>
	{#snippet children({ payload })}
		<!-- @highlight-text "payload" -->
		<Popover.Portal>
			<Popover.Positioner sideOffset={8}>
				<Popover.Popup>
					<Popover.Arrow />
					<Popover.Title>Popover</Popover.Title>
					{#if payload !== undefined}
						<!-- @highlight-text "payload" -->
						<Popover.Description>
							This has been opened by {payload.text}
							<!-- @highlight-text "payload" -->
						</Popover.Description>
					{/if}
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	{/snippet}
</Popover.Root>
```

### Controlled mode with multiple triggers

You can control the popover's open state externally by binding the `open` prop on `<Popover.Root>`.
This allows you to manage the popover's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active by binding the `triggerId` prop on `<Popover.Root>` and setting the `id` prop on each `<Popover.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop. `bind:triggerId` follows the trigger that opens or closes the popover.
The `onOpenChange` callback also receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	const demoPopover = Popover.createHandle();

	let open = $state(false);
	let triggerId = $state<string | null>(null);

	const triggerClassName =
		'flex h-8 items-center justify-center border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm font-normal whitespace-nowrap text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 data-pressed:bg-neutral-100 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<div class="flex gap-2 flex-wrap justify-center">
	<Popover.Trigger class={triggerClassName} handle={demoPopover} id="trigger-1">
		Trigger 1
	</Popover.Trigger>

	<Popover.Trigger class={triggerClassName} handle={demoPopover} id="trigger-2">
		Trigger 2
	</Popover.Trigger>

	<Popover.Trigger class={triggerClassName} handle={demoPopover} id="trigger-3">
		Trigger 3
	</Popover.Trigger>

	<button
		type="button"
		class="flex h-8 items-center justify-center border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm font-normal whitespace-nowrap text-neutral-950 dark:text-white select-none hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-700 disabled:border-neutral-500 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		onclick={() => {
			triggerId = 'trigger-2';
			open = true;
		}}
	>
		Open programmatically
	</button>
</div>

<Popover.Root handle={demoPopover} bind:open bind:triggerId>
	<Popover.Portal>
		<Popover.Positioner
			class="h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)]"
			sideOffset={8}
		>
			<Popover.Popup
				class="relative flex h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] max-w-[500px] flex-col gap-1 origin-[var(--transform-origin)] bg-white dark:bg-neutral-950 p-3 text-neutral-950 dark:text-white outline-none border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
			>
				<Popover.Arrow
					class="relative block w-3 h-1.5 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-white dark:before:bg-neutral-950 before:border before:border-neutral-950 dark:before:border-white before:[transform:translate(-50%,50%)_rotate(45deg)]"
				/>
				<Popover.Title class="text-sm font-bold">Notifications</Popover.Title>
				<Popover.Description class="text-sm text-neutral-600 dark:text-neutral-400">
					You are all caught up. Good job!
				</Popover.Description>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

### Animating the Popover

You can animate a popover as it moves between different trigger elements.
This includes animating its position, size, and content.

#### Position and Size

To animate the popover's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

#### Content

The popover also supports content transitions.
This is useful when different triggers display different content within the same popover.

To enable content animations, wrap the content in the `<Popover.Viewport>` part.
This part provides features to create direction-aware animations.
It renders a `div` with a `data-activation-direction` attribute that indicates the new trigger's position relative to the previous one. The value is a space-separated set of up to two tokens (one per axis) — `left` or `right` for the horizontal axis and `up` or `down` for the vertical axis (for example, `right down`). Match a single token with the `~=` attribute selector, such as `[data-activation-direction~='right']`.

Inside the `<Popover.Viewport>`, the content is further wrapped in `div`s with data attributes to help with styling:

- `data-current`: The currently visible content when no transitions are present or the incoming content.
- `data-previous`: The outgoing content during a transition.

You can use these attributes to style the enter and exit animations.

```svelte demo
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Popover } from '@sveltery/base/popover';
	import { Avatar } from '@sveltery/base/avatar';

	const demoPopover = Popover.createHandle<Snippet>();

	const triggerClassName =
		'flex h-8 items-center justify-center border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm font-normal whitespace-nowrap text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 data-pressed:bg-neutral-100 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
	const linkClassName =
		'text-neutral-950 dark:text-white underline underline-offset-[0.16em] decoration-[1px] hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

{#snippet notificationsPanel()}
	<div class="flex flex-col gap-1">
		<Popover.Title class="text-sm font-bold">Notifications</Popover.Title>
		<Popover.Description class="text-sm text-neutral-600 dark:text-neutral-400">
			You are all caught up. Good job!
		</Popover.Description>
	</div>
{/snippet}

{#snippet activityPanel()}
	<div class="flex flex-col gap-1">
		<Popover.Title class="text-sm font-bold">Activity</Popover.Title>
		<Popover.Description class="text-sm text-neutral-600 dark:text-neutral-400">
			Nothing interesting happened recently.
		</Popover.Description>
	</div>
{/snippet}

{#snippet profilePanel()}
	<div class="grid w-max grid-cols-[auto_auto] gap-x-2">
		<Popover.Title class="col-start-2 col-end-3 row-start-1 row-end-2 text-sm font-bold">
			Jason Eventon
		</Popover.Title>
		<Avatar.Root
			class="col-start-1 col-end-2 row-start-1 row-end-3 inline-flex h-12 w-12 items-center justify-center overflow-hidden bg-neutral-200 dark:bg-neutral-800 align-middle text-sm leading-none font-bold text-neutral-950 dark:text-white select-none"
		>
			<Avatar.Image
				src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80"
				width="48"
				height="48"
				class="h-full w-full object-cover"
			/>
		</Avatar.Root>
		<span
			class="col-start-2 col-end-3 row-start-2 row-end-3 text-sm text-neutral-600 dark:text-neutral-400"
		>
			Pro plan
		</span>
		<div class="col-start-1 col-end-3 row-start-3 row-end-4 flex flex-col gap-2 pt-2 text-sm">
			<a href="#top" class={linkClassName}>Profile settings</a>
			<a href="#top" class={linkClassName}>Log out</a>
		</div>
	</div>
{/snippet}

<div class="flex gap-2">
	<Popover.Trigger class={triggerClassName} handle={demoPopover} payload={notificationsPanel}>
		Notifications
	</Popover.Trigger>

	<Popover.Trigger class={triggerClassName} handle={demoPopover} payload={activityPanel}>
		Activity
	</Popover.Trigger>

	<Popover.Trigger class={triggerClassName} handle={demoPopover} payload={profilePanel}>
		Profile
	</Popover.Trigger>

	<Popover.Root handle={demoPopover}>
		{#snippet children({ payload })}
			<Popover.Portal>
				<Popover.Positioner
					sideOffset={8}
					class="h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom,transform] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none"
				>
					<Popover.Popup
						class="relative flex h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] max-w-[31.25rem] flex-col gap-1 origin-[var(--transform-origin)] bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white outline-none border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[width,height,opacity,scale] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:scale-90 data-ending-style:opacity-0 data-instant:transition-none data-starting-style:scale-90 data-starting-style:opacity-0"
					>
						<Popover.Arrow
							class="relative block w-3 h-1.5 overflow-clip transition-[left] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-white dark:before:bg-neutral-950 before:border before:border-neutral-950 dark:before:border-white before:[transform:translate(-50%,50%)_rotate(45deg)]"
						/>

						<Popover.Viewport
							class="
								relative h-full w-full overflow-clip p-2
								[&_[data-current]]:w-[calc(var(--popup-width)-1rem)]
								[&_[data-current]]:translate-x-0
								[&_[data-current]]:opacity-100
								[&_[data-current]]:transition-[translate,opacity]
								[&_[data-current]]:duration-[350ms,175ms]
								[&_[data-current]]:ease-[cubic-bezier(0.22,1,0.36,1)]
								data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:-translate-x-1/2
								data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:opacity-0
								data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:translate-x-1/2
								data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:opacity-0
								[&_[data-previous]]:w-[calc(var(--popup-width)-1rem)]
								[&_[data-previous]]:translate-x-0
								[&_[data-previous]]:opacity-100
								[&_[data-previous]]:transition-[translate,opacity]
								[&_[data-previous]]:duration-[350ms,175ms]
								[&_[data-previous]]:ease-[cubic-bezier(0.22,1,0.36,1)]
								data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:translate-x-1/2
								data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:opacity-0
								data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:-translate-x-1/2
								data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:opacity-0"
						>
							{@render payload?.()}
						</Popover.Viewport>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		{/snippet}
	</Popover.Root>
</div>
```

## API reference

### Root

<ApiPart name="popover" part="Root" />

### Trigger

<ApiPart name="popover" part="Trigger" />

| Attribute         | Description                                     |
| ----------------- | ----------------------------------------------- |
| `data-popup-open` | Present when the corresponding popover is open. |
| `data-pressed`    | Present when the trigger is pressed.            |
| `data-disabled`   | Present when the trigger is disabled.           |

### Backdrop

<ApiPart name="popover" part="Backdrop" />

| Attribute             | Description                                 |
| --------------------- | ------------------------------------------- |
| `data-open`           | Present when the popup is open.             |
| `data-closed`         | Present when the popup is closed.           |
| `data-starting-style` | Present when the popup begins animating in. |
| `data-ending-style`   | Present when the popup is animating out.    |

### Portal

<ApiPart name="popover" part="Portal" />

### Positioner

<ApiPart name="popover" part="Positioner" />

| Attribute            | Description                                                           |
| -------------------- | --------------------------------------------------------------------- |
| `data-open`          | Present when the popup is open.                                       |
| `data-closed`        | Present when the popup is closed.                                     |
| `data-anchor-hidden` | Present when the anchor is hidden.                                    |
| `data-align`         | Indicates how the popup is aligned relative to specified side.        |
| `data-side`          | Indicates which side the popup is positioned relative to the trigger. |

| CSS Variable          | Description                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `--anchor-height`     | The anchor's height.                                                                                                          |
| `--anchor-width`      | The anchor's width.                                                                                                           |
| `--available-height`  | The available height between the trigger and the edge of the viewport.                                                        |
| `--available-width`   | The available width between the trigger and the edge of the viewport.                                                         |
| `--positioner-height` | The height of the popover's positioner. It is important to set `height` to this value when using CSS to animate size changes. |
| `--positioner-width`  | The width of the popover's positioner. It is important to set `width` to this value when using CSS to animate size changes.   |
| `--transform-origin`  | The coordinates that this element is anchored to. Used for animations and transitions.                                        |

### Popup

<ApiPart name="popover" part="Popup" />

| Attribute             | Description                                                           |
| --------------------- | --------------------------------------------------------------------- |
| `data-open`           | Present when the popup is open.                                       |
| `data-closed`         | Present when the popup is closed.                                     |
| `data-align`          | Indicates how the popup is aligned relative to specified side.        |
| `data-instant`        | Present if animations should be instant.                              |
| `data-side`           | Indicates which side the popup is positioned relative to the trigger. |
| `data-starting-style` | Present when the popup begins animating in.                           |
| `data-ending-style`   | Present when the popup is animating out.                              |

| CSS Variable     | Description              |
| ---------------- | ------------------------ |
| `--popup-height` | The height of the popup. |
| `--popup-width`  | The width of the popup.  |

### Arrow

<ApiPart name="popover" part="Arrow" />

| Attribute         | Description                                                           |
| ----------------- | --------------------------------------------------------------------- |
| `data-open`       | Present when the popup is open.                                       |
| `data-closed`     | Present when the popup is closed.                                     |
| `data-uncentered` | Present when the popover arrow is uncentered.                         |
| `data-align`      | Indicates how the popup is aligned relative to specified side.        |
| `data-side`       | Indicates which side the popup is positioned relative to the trigger. |

### Title

<ApiPart name="popover" part="Title" />

### Description

<ApiPart name="popover" part="Description" />

### Close

<ApiPart name="popover" part="Close" />

### Viewport

<ApiPart name="popover" part="Viewport" />

The `Viewport` is optional — reach for it only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When used, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

| Attribute                   | Description                                                                                                                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-activation-direction` | Indicates the direction from which the popup was activated. This can be used to create directional animations based on how the popup was triggered. Contains space-separated values for both horizontal and vertical axes. |
| `data-current`              | Applied to the direct child of the viewport when no transitions are present or the new content when it's entering.                                                                                                         |
| `data-instant`              | Present if animations should be instant.                                                                                                                                                                                   |
| `data-previous`             | Applied to the direct child of the viewport that contains the exiting content when transitions are present.                                                                                                                |
| `data-transitioning`        | Indicates that the viewport is currently transitioning between old and new content.                                                                                                                                        |

| CSS Variable     | Description                                                                                                                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--popup-height` | The height of the parent popup. This variable is placed on the 'previous' container and stores the height of the popup when the previous content was rendered. It can be used to freeze the dimensions of the popup when animating between different content. |
| `--popup-width`  | The width of the parent popup. This variable is placed on the 'previous' container and stores the width of the popup when the previous content was rendered. It can be used to freeze the dimensions of the popup when animating between different content.   |

## createHandle

Creates a new handle to connect a `Popover.Root` with detached `Popover.Trigger` components.

**Return value**

`Popover.Handle<Payload>`

<!-- @exclude-table-of-contents -->

### Handle

Controls a Popover imperatively and associates detached `Popover.Trigger` components with a `Popover.Root`. Create one with `Popover.createHandle()` and pass it to the `handle` prop of the root and of any triggers rendered outside of it.

The imperative methods take effect only while a root using this handle is mounted; calls made before a root attaches (or after it unmounts) are ignored.

**Properties**

| Property  | Type                   | Modifiers | Description                                                                                     |
| --------- | ---------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| `isOpen`  | `boolean`              | readonly  | Whether the popover is currently open. Returns `false` while no root is attached to the handle. |
| `payload` | `Payload \| undefined` | readonly  | The payload of the trigger that opened the popover.                                             |

**Methods**

| Method    | Parameters                  | Returns | Description                                                                                                                                                                                                                                                                |
| --------- | --------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`    | `triggerId: string \| null` | `void`  | Opens the popover and associates it with the trigger with the given id. It throws when no trigger with that id is registered, because the popover needs a trigger to anchor to. This method should only be called in an event handler or an effect (not during rendering). |
| `close`   |                             | `void`  | Closes the popover. This method should only be called in an event handler or an effect (not during rendering).                                                                                                                                                             |
| `unmount` |                             | `void`  | Ends the closing phase of the popover immediately.                                                                                                                                                                                                                         |
