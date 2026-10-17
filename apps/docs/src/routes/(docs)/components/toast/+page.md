# Toast

<Subtitle>
  Generates toast notifications.
</Subtitle>

<Meta name="description" content="Generates toast notifications." />

```svelte demo
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';

	const toastManager = Toast.createToastManager();
	let count = 0;

	function createToast() {
		count += 1;
		toastManager.add({
			title: `Toast ${count} created`,
			description: 'This is a toast notification.'
		});
	}
</script>

<Toast.Provider {toastManager}>
	<button
		type="button"
		class="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 disabled:border-neutral-500 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		onclick={createToast}
	>
		Create toast
	</button>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-[1rem] bottom-[1rem] z-1 mx-auto w-[calc(100vw-2rem)] sm:right-[2rem] sm:bottom-[2rem] sm:w-[22.5rem]"
		>
			{@const manager = Toast.getToastManager()}
			{#each manager.toasts as toast (toast.id)}
				<Toast.Root
					{toast}
					class="[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 w-full origin-bottom [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 select-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-ending-style:opacity-0 data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-limited:opacity-0 data-starting-style:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] h-[var(--height)] data-expanded:h-[var(--toast-height)] [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]"
				>
					<Toast.Content
						class="flex items-center gap-4 p-3 overflow-hidden transition-opacity duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100"
					>
						<div class="flex min-w-0 flex-1 flex-col gap-1">
							<Toast.Title class="text-sm font-bold" />
							<Toast.Description class="text-sm" />
						</div>
						<Toast.Close
							class="flex h-8 shrink-0 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
							>Dismiss</Toast.Close
						>
					</Toast.Content>
				</Toast.Root>
			{/each}
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';
</script>

<Toast.Provider>
	<Toast.Portal>
		<Toast.Viewport>
			<!-- Stacked toasts -->
			<Toast.Root>
				<Toast.Content>
					<Toast.Title />
					<Toast.Description />
					<Toast.Action />
					<Toast.Close />
				</Toast.Content>
			</Toast.Root>

			<!-- Anchored toasts -->
			<Toast.Positioner>
				<Toast.Root>
					<Toast.Arrow />
					<Toast.Content>
						<Toast.Title />
						<Toast.Description />
						<Toast.Action />
						<Toast.Close />
					</Toast.Content>
				</Toast.Root>
			</Toast.Positioner>
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

## General usage

- `<Toast.Provider>` can be wrapped around your entire app, ensuring all toasts are rendered in the same viewport.
- <kbd>F6</kbd> lets users jump into the toast viewport landmark region to navigate toasts with
  keyboard focus.
- The `data-base-ui-swipe-ignore` attribute can be manually added to elements inside of a toast to prevent swipe-to-dismiss gestures on them. Interactive elements are automatically prevented.
- `Toast.getToastManager()` returns the `toasts` to render and the methods that change them. It reads the context of the `<Toast.Provider>`, so call it while a component initializes inside the provider. The demos on this page are single components, so they call it in a `{@const}` tag inside `<Toast.Viewport>` instead.

## Global manager

A global toast manager can be created by passing the `toastManager` prop to the `<Toast.Provider>`.
This enables you to queue a toast from anywhere in the app (such as in functions outside a component) while still using the same toast renderer.

The created `toastManager` exposes the same `add`, `close`, `update`, and `promise` methods as `Toast.getToastManager()`. Unlike `Toast.getToastManager()`, it does not return the reactive `toasts` array, since it lives outside the component tree.

```ts title="Creating a manager instance"
const toastManager = Toast.createToastManager();
```

```svelte title="Using the instance"
<Toast.Provider {toastManager}>
```

## Stacking and animations

The `--toast-index` CSS variable can be used to determine the stacking order of the toasts.
The 0th index toast appears at the front.

```css title="z-index stacking"
.Toast {
	z-index: calc(1000 - var(--toast-index));
	transform: scale(calc(max(0, 1 - (var(--toast-index) * 0.1))));
}
```

The `--toast-offset-y` CSS variable can be used to determine the vertical offset of the toasts when positioned absolutely with a translation offset — this is usually used with the `data-expanded` attribute, present when the toast viewport is being hovered or has focus.

```css title="Expanded offset"
.Toast[data-expanded] {
	transform: translateY(var(--toast-offset-y));
}
```

While the stack is collapsed, each toast's height can be clamped to the frontmost toast's height using the `--toast-frontmost-height` CSS variable, and `<Toast.Content>` is used to hide the content of the toasts behind it.
The `data-behind` attribute marks content that sits behind the frontmost toast and pairs with the `data-expanded` attribute so the content fades back in when the viewport expands:

```css title="Collapsed content"
.Toast {
	height: var(--toast-frontmost-height, var(--toast-height));
}

.ToastContent {
	transition: opacity 0.25s;
}

/* @highlight-text "data-behind" */
.ToastContent[data-behind] {
	opacity: 0;
}

/* @highlight-text "data-expanded" */
.ToastContent[data-expanded] {
	opacity: 1;
}
```

The `--toast-swipe-movement-x` and `--toast-swipe-movement-y` CSS variables are used to determine the swipe movement of the toasts in order to add a translation offset.

```css title="Swipe offset"
.Toast {
	transform: scale(calc(max(0, 1 - (var(--toast-index) * 0.1))))
		translateX(var(--toast-swipe-movement-x)) /* @highlight-text "--toast-swipe-movement-x" */
		/* @highlight-text "--toast-swipe-movement-y" */
		translateY(calc(var(--toast-swipe-movement-y) + (var(--toast-index) * -20%)));
}
```

The `data-swipe-direction` attribute can be used to determine the swipe direction of the toasts to add a translation offset upon dismissal.

```css title="Swipe direction"
&[data-ending-style] {
	opacity: 0;

	/* @highlight-text "data-swipe-direction" */
	&[data-swipe-direction='up'] {
		transform: translateY(calc(var(--toast-swipe-movement-y) - 150%));
	}
	/* @highlight-text "data-swipe-direction" */
	&[data-swipe-direction='down'] {
		transform: translateY(calc(var(--toast-swipe-movement-y) + 150%));
	}
	/* Note: --offset-y is defined locally in these examples and derives from
   --toast-offset-y, --toast-index, and swipe movement values */
	/* @highlight-text "data-swipe-direction" */
	&[data-swipe-direction='left'] {
		transform: translateX(calc(var(--toast-swipe-movement-x) - 150%)) translateY(var(--offset-y));
	}
	/* @highlight-text "data-swipe-direction" */
	&[data-swipe-direction='right'] {
		transform: translateX(calc(var(--toast-swipe-movement-x) + 150%)) translateY(var(--offset-y));
	}
}
```

The `data-limited` attribute indicates that the toast exceeded the `limit` option.
Limited toasts remain mounted with the HTML `inert` attribute, so this is useful for hiding them or animating them differently.

The `updateKey` property increments when a toast is updated or upserted.
This can be used to replay attention-grabbing styles by switching animation names or, when remounting is acceptable, by including it in a `{#key}` block.

## Examples

### Anchored toasts

Toasts can be anchored to a specific element using `<Toast.Positioner>` and the `positionerProps` option when adding a toast. This is useful for showing contextual feedback like transient "Copied" toasts that appear near the button that triggered the action.

Anchored toasts should be rendered in a separate `<Toast.Provider>` from stacked toasts. A global toast manager can be created for each to manage them separately throughout your app:

```svelte title="Mixing stacked and anchored toasts"
<script module lang="ts">
	import { Toast } from '@sveltery/base/toast';

	export const anchoredToastManager = Toast.createToastManager();
	export const stackedToastManager = Toast.createToastManager();
</script>

<script lang="ts">
	import AnchoredToasts from './AnchoredToasts.svelte';
	import StackedToasts from './StackedToasts.svelte';
</script>

<Toast.Provider toastManager={anchoredToastManager}>
	<AnchoredToasts />
</Toast.Provider>
<Toast.Provider toastManager={stackedToastManager}>
	<StackedToasts />
</Toast.Provider>

<!-- App content -->
```

```svelte title="AnchoredToasts.svelte"
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';

	const toastManager = Toast.getToastManager();
</script>

<Toast.Portal>
	<Toast.Viewport>
		{#each toastManager.toasts as toast (toast.id)}
			<Toast.Positioner {toast}>
				<Toast.Root {toast}>
					<!-- ... -->
				</Toast.Root>
			</Toast.Positioner>
		{/each}
	</Toast.Viewport>
</Toast.Portal>
```

```svelte title="StackedToasts.svelte"
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';

	const toastManager = Toast.getToastManager();
</script>

<Toast.Portal>
	<Toast.Viewport>
		{#each toastManager.toasts as toast (toast.id)}
			<Toast.Root {toast}>
				<!-- ... -->
			</Toast.Root>
		{/each}
	</Toast.Viewport>
</Toast.Portal>
```

```svelte demo
<script lang="ts">
	import { Button } from '@sveltery/base/button';
	import { Toast } from '@sveltery/base/toast';
	import { Tooltip } from '@sveltery/base/tooltip';

	const anchoredToastManager = Toast.createToastManager();
	const stackedToastManager = Toast.createToastManager();

	let copied = $state(false);

	function handleCopy(event: MouseEvent) {
		copied = true;

		anchoredToastManager.add({
			description: 'Copied',
			positionerProps: {
				anchor: event.currentTarget as HTMLElement,
				sideOffset: 10
			},
			timeout: 1500,
			onClose() {
				copied = false;
			}
		});
	}

	function createStackedToast() {
		stackedToastManager.add({
			description: 'Copied'
		});
	}
</script>

<Tooltip.Provider>
	<Toast.Provider toastManager={anchoredToastManager}>
		<Toast.Portal>
			<Toast.Viewport class="outline-0">
				{@const manager = Toast.getToastManager()}
				{#each manager.toasts as toast (toast.id)}
					<Toast.Positioner {toast} class="z-[calc(1000-var(--toast-index))]">
						<Toast.Root
							{toast}
							class="relative flex flex-col w-max border border-neutral-950 bg-white px-2 py-1 text-sm text-neutral-950 origin-[var(--transform-origin)] shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[scale,opacity] duration-100 ease-out data-ending-style:opacity-0 data-ending-style:scale-[0.98] data-instant:transition-none data-starting-style:opacity-0 data-starting-style:scale-[0.98] dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
						>
							<Toast.Arrow
								class="relative block w-3 h-1.5 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-white dark:before:bg-neutral-950 before:border before:border-neutral-950 dark:before:border-white before:[transform:translate(-50%,50%)_rotate(45deg)]"
							/>
							<Toast.Content>
								<Toast.Description />
							</Toast.Content>
						</Toast.Root>
					</Toast.Positioner>
				{/each}
			</Toast.Viewport>
		</Toast.Portal>
	</Toast.Provider>
	<Toast.Provider toastManager={stackedToastManager}>
		<Toast.Portal>
			<Toast.Viewport
				class="fixed top-auto right-[1rem] bottom-[1rem] z-1 mx-auto w-[calc(100vw-2rem)] sm:right-[2rem] sm:bottom-[2rem] sm:w-[22.5rem]"
			>
				{@const manager = Toast.getToastManager()}
				{#each manager.toasts as toast (toast.id)}
					<Toast.Root
						{toast}
						class="[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 w-full origin-bottom [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 select-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-ending-style:opacity-0 data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-limited:opacity-0 data-starting-style:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] h-[var(--height)] data-expanded:h-[var(--toast-height)] [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]"
					>
						<Toast.Content
							class="flex items-center gap-4 p-3 overflow-hidden transition-opacity duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100"
						>
							<div class="flex min-w-0 flex-1 flex-col gap-1">
								<Toast.Title class="text-sm font-bold" />
								<Toast.Description class="text-sm" />
							</div>
							<Toast.Close
								class="flex h-8 shrink-0 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
								>Dismiss</Toast.Close
							>
						</Toast.Content>
					</Toast.Root>
				{/each}
			</Toast.Viewport>
		</Toast.Portal>
	</Toast.Provider>

	<div class="flex items-center gap-2">
		<Tooltip.Root disabled={copied}>
			<Tooltip.Trigger
				closeOnClick={false}
				onclick={handleCopy}
				class="flex h-8 w-8 items-center justify-center rounded-none border border-neutral-950 bg-white text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
			>
				{#snippet render(props, _state, children)}
					<Button {...props} disabled={copied} focusableWhenDisabled aria-label="Copy to clipboard">
						{@render children?.()}
					</Button>
				{/snippet}
				{#if copied}
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						style="display: block"
					>
						<path d="m2.5 8.5 4 4 7-9" />
					</svg>
				{:else}
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						style="display: block"
					>
						<rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
						<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
					</svg>
				{/if}
			</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Positioner sideOffset={10}>
					<Tooltip.Popup
						class="relative flex flex-col border border-neutral-950 bg-white px-2 py-1 text-sm text-neutral-950 origin-[var(--transform-origin)] shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[scale,opacity] duration-100 ease-out data-ending-style:opacity-0 data-ending-style:scale-[0.98] data-instant:transition-none data-starting-style:opacity-0 data-starting-style:scale-[0.98] dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
					>
						<Tooltip.Arrow
							class="relative block w-3 h-1.5 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-white dark:before:bg-neutral-950 before:border before:border-neutral-950 dark:before:border-white before:[transform:translate(-50%,50%)_rotate(45deg)]"
						/>
						Copy
					</Tooltip.Popup>
				</Tooltip.Positioner>
			</Tooltip.Portal>
		</Tooltip.Root>
		<button
			type="button"
			class="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 disabled:border-neutral-500 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
			onclick={createStackedToast}
		>
			Stacked toast
		</button>
	</div>
</Tooltip.Provider>
```

### Custom position

The position of the toasts is controlled by your own CSS.
To change the toasts' position, you can modify the `Toast.Viewport` and `Toast.Root` classes.
A more general component could accept a `data-position` attribute, which the CSS handles for each variation.
The following shows a top-center position:

```svelte demo
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';

	const toastManager = Toast.createToastManager();
	let count = 0;

	function createToast() {
		count += 1;
		toastManager.add({
			title: `Toast ${count} created`,
			description: 'This is a toast notification.'
		});
	}
</script>

<Toast.Provider {toastManager}>
	<button
		type="button"
		class="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 disabled:border-neutral-500 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		onclick={createToast}
	>
		Create toast
	</button>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-[1rem] right-0 bottom-auto left-0 z-1 mx-auto w-[calc(100vw-2rem)] max-w-[22.5rem]"
		>
			{@const manager = Toast.getToastManager()}
			{#each manager.toasts as toast (toast.id)}
				<Toast.Root
					{toast}
					swipeDirection="up"
					class="[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)+(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))] absolute top-0 right-0 left-0 z-[calc(1000-var(--toast-index))] mx-auto w-full origin-top [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 select-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none after:absolute after:bottom-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-ending-style:opacity-0 data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-limited:opacity-0 data-starting-style:[transform:translateY(-150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)] data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] h-[var(--height)] data-expanded:h-[var(--toast-height)] [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]"
				>
					<Toast.Content
						class="flex items-center gap-4 p-3 overflow-hidden transition-opacity duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100"
					>
						<div class="flex min-w-0 flex-1 flex-col gap-1">
							<Toast.Title class="text-sm font-bold" />
							<Toast.Description class="text-sm" />
						</div>
						<Toast.Close
							class="flex h-8 shrink-0 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
							>Dismiss</Toast.Close
						>
					</Toast.Content>
				</Toast.Root>
			{/each}
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

### Undo action

When adding a toast, the `actionProps` option can be used to define props for an action button inside of it—this enables the ability to undo an action associated with the toast.

```svelte demo
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';

	const toastManager = Toast.createToastManager();

	function action() {
		const id = toastManager.add({
			title: 'Action performed',
			description: 'You can undo this action.',
			type: 'success',
			timeout: 10000,
			actionProps: {
				children: 'Undo',
				onclick() {
					toastManager.close(id);
					toastManager.add({
						title: 'Action undone'
					});
				}
			}
		});
	}
</script>

<Toast.Provider {toastManager}>
	<button
		type="button"
		class="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 disabled:border-neutral-500 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		onclick={action}
	>
		Perform action
	</button>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-[1rem] bottom-[1rem] z-1 mx-auto w-[calc(100vw-2rem)] sm:right-[2rem] sm:bottom-[2rem] sm:w-[22.5rem]"
		>
			{@const manager = Toast.getToastManager()}
			{#each manager.toasts as toast (toast.id)}
				<Toast.Root
					{toast}
					class="[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 w-full origin-bottom [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 select-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-ending-style:opacity-0 data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-limited:opacity-0 data-starting-style:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] h-[var(--height)] data-expanded:h-[var(--toast-height)] [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]"
				>
					<Toast.Content
						class="flex items-center gap-4 p-3 overflow-hidden transition-opacity duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100"
					>
						<div class="flex min-w-0 flex-1 flex-col items-start gap-3">
							<div class="flex flex-col gap-1">
								<Toast.Title
									class="text-sm font-bold data-[type=success]:text-green-700 data-[type=error]:text-red-700 dark:data-[type=success]:text-green-400 dark:data-[type=error]:text-red-400"
								/>
								<Toast.Description
									class="text-sm data-[type=success]:text-green-700 data-[type=error]:text-red-700 dark:data-[type=success]:text-green-400 dark:data-[type=error]:text-red-400"
								/>
							</div>
							<Toast.Action
								class="flex h-8 shrink-0 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
							/>
						</div>
					</Toast.Content>
				</Toast.Root>
			{/each}
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

### Promise

An asynchronous toast can be created with three possible states: `loading`, `success`, and `error`.
The `type` string matches these states to change the styling.
Each of the states also accepts the [method options](#toastmanagerupdateoptions) object for more granular control.

```svelte demo
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';

	const toastManager = Toast.createToastManager();

	function runPromise() {
		toastManager.promise(
			// Simulate an API request with a promise that resolves after 2 seconds
			new Promise<string>((resolve, reject) => {
				const shouldSucceed = Math.random() > 0.3; // 70% success rate
				setTimeout(() => {
					if (shouldSucceed) {
						resolve('operation completed');
					} else {
						reject(new Error('operation failed'));
					}
				}, 2000);
			}),
			{
				loading: 'Loading data…',
				success: (data: string) => `Success: ${data}`,
				error: (err: Error) => `Error: ${err.message}`
			}
		);
	}
</script>

<Toast.Provider {toastManager}>
	<button
		type="button"
		class="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 disabled:border-neutral-500 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		onclick={runPromise}
	>
		Run promise
	</button>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-[1rem] bottom-[1rem] z-1 mx-auto w-[calc(100vw-2rem)] sm:right-[2rem] sm:bottom-[2rem] sm:w-[22.5rem]"
		>
			{@const manager = Toast.getToastManager()}
			{#each manager.toasts as toast (toast.id)}
				<Toast.Root
					{toast}
					class="[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 w-full origin-bottom [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 select-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-ending-style:opacity-0 data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-limited:opacity-0 data-starting-style:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] h-[var(--height)] data-expanded:h-[var(--toast-height)] [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]"
				>
					<Toast.Content
						class="flex items-center gap-4 p-3 overflow-hidden transition-opacity duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100"
					>
						<div class="flex min-w-0 flex-1 flex-col gap-1">
							<Toast.Title
								class="text-sm font-bold data-[type=success]:text-green-700 data-[type=error]:text-red-700 dark:data-[type=success]:text-green-400 dark:data-[type=error]:text-red-400"
							/>
							<Toast.Description
								class="text-sm data-[type=success]:text-green-700 data-[type=error]:text-red-700 dark:data-[type=success]:text-green-400 dark:data-[type=error]:text-red-400"
							/>
						</div>
						<Toast.Close
							class="flex h-8 shrink-0 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
							>Dismiss</Toast.Close
						>
					</Toast.Content>
				</Toast.Root>
			{/each}
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

### Custom

A toast with custom data can be created by passing any typed object interface to the `data` option.
This enables you to pass any data (including functions) you need to the toast and access it in the toast's rendering logic.

```svelte demo
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';
	import type { ToastObject } from '@sveltery/base/toast';

	interface CustomToastData {
		userId: string;
	}

	function isCustomToast(toast: ToastObject): toast is ToastObject<CustomToastData> {
		return toast.data?.userId !== undefined;
	}

	const toastManager = Toast.createToastManager();

	function action() {
		const data: CustomToastData = {
			userId: '123'
		};

		toastManager.add({
			title: 'Toast with custom data',
			data
		});
	}
</script>

<Toast.Provider {toastManager}>
	<button
		type="button"
		class="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 disabled:border-neutral-500 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		onclick={action}
	>
		Create custom toast
	</button>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-[1rem] bottom-[1rem] z-1 mx-auto w-[calc(100vw-2rem)] sm:right-[2rem] sm:bottom-[2rem] sm:w-[22.5rem]"
		>
			{@const manager = Toast.getToastManager()}
			{#each manager.toasts as toast (toast.id)}
				<Toast.Root
					{toast}
					class="[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 w-full origin-bottom [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 select-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-ending-style:opacity-0 data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-limited:opacity-0 data-starting-style:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] h-[var(--height)] data-expanded:h-[var(--toast-height)] [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]"
				>
					<Toast.Content
						class="flex items-center gap-4 p-3 overflow-hidden transition-opacity duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100"
					>
						<div class="flex min-w-0 flex-1 flex-col gap-1">
							<Toast.Title class="text-sm font-bold">{toast.title}</Toast.Title>
							{#if isCustomToast(toast) && toast.data}
								<Toast.Description class="text-sm"
									>data.userId is {toast.data.userId}</Toast.Description
								>
							{:else}
								<Toast.Description class="text-sm" />
							{/if}
						</div>
						<Toast.Close
							class="flex h-8 shrink-0 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
							>Dismiss</Toast.Close
						>
					</Toast.Content>
				</Toast.Root>
			{/each}
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

### Deduplicated toast

When you upsert the same toast by `id`, the `updateKey` property increments so a custom renderer can replay a visual animation. This demo alternates CSS animation names from `updateKey`, which keeps the same toast mounted while replaying the pulse.

```svelte demo
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';

	const toastManager = Toast.createToastManager();

	const root =
		"[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 w-full origin-bottom [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 select-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-ending-style:opacity-0 data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-limited:opacity-0 data-starting-style:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] h-[var(--height)] data-expanded:h-[var(--toast-height)] [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]";

	function createToast() {
		toastManager.add({
			id: 'save-status',
			title: 'Draft saved',
			description: 'Click again while it is visible to replay the pulse.'
		});
	}
</script>

<Toast.Provider {toastManager}>
	<button
		type="button"
		class="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 disabled:border-neutral-500 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		onclick={createToast}
	>
		Save draft
	</button>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-[1rem] bottom-[1rem] z-1 mx-auto w-[calc(100vw-2rem)] sm:right-[2rem] sm:bottom-[2rem] sm:w-[22.5rem]"
		>
			{@const manager = Toast.getToastManager()}
			{#each manager.toasts as toast (toast.id)}
				{@const pulse = toast.updateKey
					? toast.updateKey % 2 === 0
						? 'animate-[pulse-even_0.28s_ease]'
						: 'animate-[pulse-odd_0.28s_ease]'
					: ''}
				<Toast.Root {toast} class="{root} {pulse}">
					<Toast.Content
						class="flex items-center gap-4 p-3 overflow-hidden transition-opacity duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100"
					>
						<div class="flex min-w-0 flex-1 flex-col gap-1">
							<Toast.Title class="text-sm font-bold" />
							<Toast.Description class="text-sm" />
						</div>
						<Toast.Close
							class="flex h-8 shrink-0 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
							>Dismiss</Toast.Close
						>
					</Toast.Content>
				</Toast.Root>
			{/each}
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>

<style>
	/* Alternate animation names so repeated updates restart the same pulse. */
	@keyframes -global-pulse-even {
		0%,
		100% {
			scale: 1;
		}
		50% {
			scale: 1.04;
		}
	}

	@keyframes -global-pulse-odd {
		0%,
		100% {
			scale: 1;
		}
		50% {
			scale: 1.04;
		}
	}
</style>
```

### Varying heights

Toasts with varying heights are stacked by clamping every toast's height to the frontmost toast at index 0 using the `--toast-frontmost-height` CSS variable, while the `data-behind` attribute hides the content of the toasts behind it.
Avoid sizing `<Toast.Content>` to the root's height (such as `height: 100%`), as resizing it alongside the root cancels the root's height transition.

```svelte demo
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';

	const toastManager = Toast.createToastManager();
	let count = 0;

	const TEXTS = [
		'Short message.',
		'A bit longer message that spans two lines.',
		'This is a longer description that intentionally takes more vertical space to demonstrate stacking with varying heights.',
		'An even longer description that should span multiple lines so we can verify the clamped collapsed height and smooth expansion animation when hovering or focusing the viewport.'
	];

	function createToast() {
		count += 1;
		const description = TEXTS[Math.floor(Math.random() * TEXTS.length)];
		toastManager.add({
			title: `Toast ${count} created`,
			description
		});
	}
</script>

<Toast.Provider {toastManager}>
	<button
		type="button"
		class="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 disabled:border-neutral-500 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		onclick={createToast}
	>
		Create varying height toast
	</button>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-[1rem] bottom-[1rem] z-1 mx-auto w-[calc(100vw-2rem)] sm:right-[2rem] sm:bottom-[2rem] sm:w-[22.5rem]"
		>
			{@const manager = Toast.getToastManager()}
			{#each manager.toasts as toast (toast.id)}
				<Toast.Root
					{toast}
					class="[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 w-full origin-bottom [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 select-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-ending-style:opacity-0 data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-limited:opacity-0 data-starting-style:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] h-[var(--height)] data-expanded:h-[var(--toast-height)] [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]"
				>
					<Toast.Content
						class="flex items-center gap-4 p-3 overflow-hidden transition-opacity duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100"
					>
						<div class="flex min-w-0 flex-1 flex-col gap-1">
							<Toast.Title class="text-sm font-bold" />
							<Toast.Description class="text-sm" />
						</div>
						<Toast.Close
							class="flex h-8 shrink-0 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
							>Dismiss</Toast.Close
						>
					</Toast.Content>
				</Toast.Root>
			{/each}
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

## API reference

<script>
	import { TypesToast, TypesToastAdditional } from './types';
</script>

### Provider

<TypesToast.Provider />

### Portal

<TypesToast.Portal />

### Viewport

<TypesToast.Viewport />

### Root

<TypesToast.Root />

### Content

<TypesToast.Content />

### Title

<TypesToast.Title />

### Description

<TypesToast.Description />

### Action

<TypesToast.Action />

### Close

<TypesToast.Close />

### Positioner

<TypesToast.Positioner />

### Arrow

<TypesToast.Arrow />

## getToastManager

Manages toasts, called inside of a `<Toast.Provider>`.

```ts title="Usage"
const toastManager = Toast.getToastManager();
```

Read `toasts` from the returned object each time you need the list. Destructuring it copies the array once and stops it updating.

**Return value**

`GetToastManagerReturnValue`

| Property  | Type                                                                                      | Description                                                                  |
| --------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `toasts`  | `ToastObject[]`                                                                           | The array of toasts. A read-only getter.                                     |
| `add`     | `(options: ToastManagerAddOptions) => string`                                             | Creates a toast and returns its id.                                          |
| `close`   | `(toastId?: string) => void`                                                              | Closes a toast, or every toast when no id is passed.                         |
| `update`  | `(toastId: string, options: ToastManagerUpdate) => void`                                  | Updates a toast with new options.                                            |
| `promise` | `(promise: Promise<Value>, options: ToastManagerPromiseOptions<Value>) => Promise<Value>` | Creates an asynchronous toast with `loading`, `success`, and `error` states. |

### `add` method

Creates a toast by adding it to the toast list.

If you pass an `id` that already exists, the existing toast is updated in place instead of creating a duplicate.

Returns a `toastId` that can be used to update or close the toast later.

```ts title="Usage"
const toastId = toastManager.add({
	description: 'Hello, world!'
});
```

```svelte title="Example"
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';

	// @highlight
	const toastManager = Toast.createToastManager();
</script>

<Toast.Provider {toastManager}>
	<button
		type="button"
		onclick={() => {
			// @highlight-start
			toastManager.add({
				description: 'Hello, world!'
			});
			// @highlight-end
		}}
	>
		Add toast
	</button>
</Toast.Provider>
```

For high priority toasts, the `title` and `description` strings are what are used to announce the toast to screen readers.
Screen readers do not announce any extra content rendered inside `<Toast.Root>`, including the `<Toast.Title>` or `<Toast.Description>` components, unless they intentionally navigate to the toast viewport.

### `update` method

Updates the toast with new options.

```ts title="Usage"
toastManager.update(toastId, {
	description: 'New description'
});
```

Options replace the corresponding values of the toast, including custom `data`, which is replaced as a whole. To derive the update from the current state of the toast, pass a function instead. It receives the current toast and returns the options to apply. Custom `data` is `undefined` when the toast has none yet:

```ts title="Deriving the update from the current toast"
toastManager.update(toastId, (prevToast) => ({
	data: prevToast.data && { ...prevToast.data, progress: 100 }
}));
```

### `close` method

Closes the toast, removing it from the toast list after any animations complete.

```ts title="Usage"
toastManager.close(toastId);
```

Or you can close all toasts at once by not passing an ID:

```ts title="Close all toasts"
toastManager.close();
```

### `promise` method

Creates an asynchronous toast with three possible states: `loading`, `success`, and `error`.

```ts title="Description configuration"
const promise = toastManager.promise(
	new Promise((resolve) => {
		setTimeout(() => resolve('world!'), 1000);
	}),
	{
		// Each are a shortcut for the `description` option
		loading: 'Loading…',
		success: (data) => `Hello ${data}`,
		error: (err) => `Error: ${err}`
	}
);
```

Each state also accepts the [method options](#toastmanagerupdateoptions) object to granularly control the toast for each state:

```ts title="Method options configuration"
const promise = toastManager.promise(
	new Promise((resolve) => {
		setTimeout(() => resolve('world!'), 1000);
	}),
	{
		loading: {
			title: 'Loading…',
			description: 'The promise is loading.'
		},
		success: {
			title: 'Success',
			description: 'The promise resolved successfully.'
		},
		error: {
			title: 'Error',
			description: 'The promise rejected.',
			actionProps: {
				children: 'Contact support',
				onclick() {
					// Redirect to support page
				}
			}
		}
	}
);
```

See full [`promise` method](#promise-method)

## Additional types

<TypesToastAdditional showAdditionalTypes={['toastmanagerupdateoptions']} />
