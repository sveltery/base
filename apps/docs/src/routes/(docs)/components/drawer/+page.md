# Drawer

<Subtitle>
  A panel that slides in from the edge of the screen.
</Subtitle>

<Meta name="description" content="A panel that slides in from the edge of the screen." />

```svelte demo
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';

	const button =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<Drawer.Root swipeDirection="right">
	<Drawer.Trigger class={button}>Open drawer</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Backdrop
			class="[--backdrop-opacity:0.2] [--bleed:3rem] dark:[--backdrop-opacity:0.7] fixed inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:absolute"
		/>
		<Drawer.Viewport
			class="[--viewport-padding:0px] supports-[-webkit-touch-callout:none]:[--viewport-padding:0.625rem] fixed inset-0 flex items-stretch justify-end p-(--viewport-padding)"
		>
			<Drawer.Popup
				class="[--bleed:3rem] supports-[-webkit-touch-callout:none]:[--bleed:0px] h-full w-[calc(20rem+3rem)] max-w-[calc(100vw-3rem+3rem)] -mr-[3rem] border-l border-neutral-950 bg-white p-6 pr-[calc(1.5rem+3rem)] text-neutral-950 outline-none shadow-[0.25rem_0.25rem_0] shadow-black/12 overflow-y-auto overscroll-contain touch-auto [transform:translateX(var(--drawer-swipe-movement-x))] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-ending-style:[transform:translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-starting-style:[transform:translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:mr-0 supports-[-webkit-touch-callout:none]:w-[20rem] supports-[-webkit-touch-callout:none]:max-w-[calc(100vw-3rem)] supports-[-webkit-touch-callout:none]:border supports-[-webkit-touch-callout:none]:pr-6 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Drawer.Content class="mx-auto w-full max-w-[32rem]">
					<Drawer.Title class="mb-1 text-base font-bold">Drawer</Drawer.Title>
					<Drawer.Description class="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
						This is a drawer that slides in from the side. You can swipe to dismiss it.
					</Drawer.Description>
					<div class="flex justify-end gap-3">
						<Drawer.Close class={button}>Close</Drawer.Close>
					</div>
				</Drawer.Content>
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
```

## Usage guidelines

- **Drawer extends [Dialog](/components/dialog):** It adds gesture support, snap points, and indent effects. If you don't need these, use Dialog instead. A panel that slides in from the edge of the screen and doesn't need gesture support is a positioned Dialog.

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';
</script>

<Drawer.Provider>
	<Drawer.IndentBackground />
	<Drawer.Indent>
		<Drawer.Root>
			<Drawer.Trigger />
			<Drawer.SwipeArea />
			<Drawer.Portal>
				<Drawer.Backdrop />
				<Drawer.Viewport>
					<Drawer.Popup>
						<Drawer.Content>
							<Drawer.Title />
							<Drawer.Description />
							<Drawer.Close />
						</Drawer.Content>
					</Drawer.Popup>
				</Drawer.Viewport>
			</Drawer.Portal>
		</Drawer.Root>
	</Drawer.Indent>
</Drawer.Provider>
```

Drawer supports swipe gestures to dismiss. Set `swipeDirection` to control which direction dismisses the drawer. `<Drawer.Content>` allows text selection of its children without swipe interference when using a mouse pointer.

Add `data-base-ui-swipe-ignore` to a descendant to opt it out of swipe dismissal for all input types. If the element only handles touch drags along one axis, such as a JavaScript carousel, set the value to `x` or `y` so touch drags along the other axis still swipe the drawer.

Use `<Drawer.VirtualKeyboardProvider>` when a bottom sheet contains form fields and you want Base UI to manage keyboard-aware focus and scroll handling for software keyboards. Drawers without this provider are unaffected.

## Examples

### State

By default, Drawer is an uncontrolled component that manages its own state.

```svelte title="Uncontrolled drawer"
<Drawer.Root>
	<Drawer.Trigger>Open</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Viewport>
			<Drawer.Popup>
				<Drawer.Content>
					<Drawer.Title>Example drawer</Drawer.Title>
					<Drawer.Close>Close</Drawer.Close>
				</Drawer.Content>
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
```

Use `bind:open` and the `onOpenChange` callback if you need to access or control the state of the drawer. Without `bind:`, the drawer manages its own state.

```svelte title="Controlled drawer"
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';

	let open = $state(false);
</script>

<Drawer.Root bind:open>
	<Drawer.Trigger>Open</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Viewport>
			<Drawer.Popup>
				<Drawer.Content>
					<Drawer.Title>Example drawer</Drawer.Title>
					<Drawer.Close>Close</Drawer.Close>
				</Drawer.Content>
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
```

### Position

Positioning is handled by your styles. `swipeDirection` defaults to `"down"` for bottom sheets. Use `"up"`, `"left"`, or `"right"` for other drawer positions.

```svelte title="Swipe directions"
<Drawer.Root swipeDirection="right"></Drawer.Root>
```

```svelte demo
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';

	const button =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<Drawer.Root>
	<Drawer.Trigger class={button}>Open bottom drawer</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Backdrop
			class="[--backdrop-opacity:0.2] [--bleed:3rem] dark:[--backdrop-opacity:0.7] fixed inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:absolute"
		/>
		<Drawer.Viewport class="fixed inset-0 flex items-end justify-center">
			<Drawer.Popup
				class="-mb-[3rem] w-full max-h-[calc(80vh+3rem)] border-t border-neutral-950 bg-white px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px)+3rem)] pt-4 text-neutral-950 outline-none shadow-[0.25rem_0.25rem_0] shadow-black/12 overflow-y-auto overscroll-contain touch-auto [transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-ending-style:[transform:translateY(calc(100%-3rem+2px))] data-starting-style:[transform:translateY(calc(100%-3rem+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<div class="mx-auto mb-4 h-1 w-12 bg-neutral-300 dark:bg-neutral-700"></div>
				<Drawer.Content class="mx-auto w-full max-w-[32rem]">
					<Drawer.Title class="mb-1 text-base font-bold text-center">Notifications</Drawer.Title>
					<Drawer.Description
						class="mb-6 text-sm text-neutral-600 text-center dark:text-neutral-400"
					>
						You are all caught up. Good job!
					</Drawer.Description>
					<div class="flex justify-center gap-3">
						<Drawer.Close class={button}>Close</Drawer.Close>
					</div>
				</Drawer.Content>
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
```

### Nested drawers

Use the `[data-nested-drawer-open]` selector and the `--nested-drawers` CSS variable to style drawers when a nested drawer is open.

This demo stacks nested drawers using a constant peek so the frontmost drawer stays anchored to the bottom while the ones behind it are scaled down and lifted. It also uses the `--drawer-height` and `--drawer-frontmost-height` CSS variables to handle varying drawer heights.

```svelte demo
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';

	const button =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';

	const popupClassName =
		"[--bleed:3rem] [--peek:1rem] [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-step:0.05] [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))] [--scale-base:calc(max(0,1-(var(--nested-drawers)*var(--stack-step))))] [--scale:clamp(0,calc(var(--scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--shrink:calc(1-var(--scale))] [--height:max(0px,calc(var(--drawer-frontmost-height,var(--drawer-height))-var(--bleed)))] group/popup relative -mx-px -mb-[3rem] w-[calc(100%+2px)] max-h-[calc(80vh+3rem)] [height:var(--drawer-height,auto)] border border-neutral-950 border-b-0 bg-white px-6 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px)+3rem)] text-neutral-950 outline-none shadow-[0.25rem_0.25rem_0] shadow-black/12 overflow-y-auto overscroll-contain touch-auto [transform-origin:50%_calc(100%-var(--bleed))] [transform:translateY(calc(var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--shrink)*var(--height))))_scale(var(--scale))] after:pointer-events-none after:absolute after:inset-0 after:bg-transparent after:content-[''] after:transition-[background-color] after:duration-[450ms] after:ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-swiping:duration-0 data-nested-drawer-swiping:duration-0 data-starting-style:[transform:translateY(calc(100%-var(--bleed)+2px))] data-ending-style:[transform:translateY(calc(100%-var(--bleed)+2px))] data-ending-style:opacity-[0.9999] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-ending-style:data-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-ending-style:data-nested-drawer-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-nested-drawer-open:h-[calc(var(--height)+var(--bleed))] data-nested-drawer-open:overflow-hidden data-nested-drawer-open:after:bg-black/5 dark:border-white dark:border-b-0 dark:bg-neutral-950 dark:text-white dark:shadow-none [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),height_450ms_cubic-bezier(0.32,0.72,0,1),opacity_450ms_cubic-bezier(0.32,0.72,0,1)]";

	const contentClassName =
		'mx-auto w-full max-w-[32rem] transition-opacity duration-[300ms] ease-[cubic-bezier(0.45,1.005,0,1.005)] group-data-nested-drawer-open/popup:opacity-0 group-data-nested-drawer-swiping/popup:opacity-100';

	const handleClassName =
		'mx-auto mb-4 h-1 w-12 bg-neutral-300 transition-opacity duration-[200ms] group-data-nested-drawer-open/popup:opacity-0 group-data-nested-drawer-swiping/popup:opacity-100 dark:bg-neutral-700';
</script>

<Drawer.Root>
	<Drawer.Trigger class={button}>Open drawer stack</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Backdrop
			class="[--backdrop-opacity:0.2] [--bleed:3rem] dark:[--backdrop-opacity:0.7] fixed inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:absolute"
		/>
		<Drawer.Viewport class="fixed inset-0 flex items-end justify-center">
			<Drawer.Popup class={popupClassName}>
				<div class={handleClassName}></div>
				<Drawer.Content class={contentClassName}>
					<Drawer.Title class="mb-1 text-base font-bold text-center">Account</Drawer.Title>
					<Drawer.Description
						class="mb-6 text-sm text-neutral-600 text-center dark:text-neutral-400"
					>
						Nested drawers can be styled to stack, while each drawer remains independently focus
						managed.
					</Drawer.Description>

					<div class="flex items-center justify-end gap-4">
						<div class="mr-auto">
							<Drawer.Root>
								<Drawer.Trigger class={button}>Security settings</Drawer.Trigger>
								<Drawer.Portal>
									<Drawer.Viewport class="fixed inset-0 flex items-end justify-center">
										<Drawer.Popup class={popupClassName}>
											<div class={handleClassName}></div>
											<Drawer.Content class={contentClassName}>
												<Drawer.Title class="mb-1 text-base font-bold text-center">
													Security
												</Drawer.Title>
												<Drawer.Description
													class="mb-6 text-sm text-neutral-600 text-center dark:text-neutral-400"
												>
													Review sign-in activity and update your security preferences.
												</Drawer.Description>

												<ul class="mb-6 list-disc pl-5 text-neutral-700 dark:text-neutral-300">
													<li>Passkeys enabled</li>
													<li>2FA via authenticator app</li>
													<li>3 signed-in devices</li>
												</ul>

												<div class="flex items-center justify-end gap-4">
													<div class="mr-auto">
														<Drawer.Root>
															<Drawer.Trigger class={button}>Advanced options</Drawer.Trigger>
															<Drawer.Portal>
																<Drawer.Viewport
																	class="fixed inset-0 flex items-end justify-center"
																>
																	<Drawer.Popup class={popupClassName}>
																		<div class={handleClassName}></div>
																		<Drawer.Content class={contentClassName}>
																			<Drawer.Title class="mb-1 text-base font-bold text-center">
																				Advanced
																			</Drawer.Title>
																			<Drawer.Description
																				class="mb-6 text-sm text-neutral-600 text-center dark:text-neutral-400"
																			>
																				This drawer is taller to demonstrate variable-height
																				stacking.
																			</Drawer.Description>

																			<div class="grid gap-2 mb-4">
																				<label
																					class="text-sm font-bold text-neutral-700 dark:text-neutral-300"
																					for="device-name-tw"
																				>
																					Device name
																				</label>
																				<input
																					id="device-name-tw"
																					class="h-8 w-full border border-neutral-950 bg-white px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
																					value="Personal laptop"
																				/>
																			</div>

																			<div class="grid gap-2 mb-4">
																				<label
																					class="text-sm font-bold text-neutral-700 dark:text-neutral-300"
																					for="notes-tw"
																				>
																					Notes
																				</label>
																				<textarea
																					id="notes-tw"
																					class="min-h-32 w-full resize-y border border-neutral-950 bg-white p-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
																					rows="3"
																					>Rotate recovery codes and revoke older sessions.</textarea
																				>
																			</div>

																			<div class="flex justify-end">
																				<Drawer.Close class={button}>Done</Drawer.Close>
																			</div>
																		</Drawer.Content>
																	</Drawer.Popup>
																</Drawer.Viewport>
															</Drawer.Portal>
														</Drawer.Root>
													</div>

													<Drawer.Close class={button}>Close</Drawer.Close>
												</div>
											</Drawer.Content>
										</Drawer.Popup>
									</Drawer.Viewport>
								</Drawer.Portal>
							</Drawer.Root>
						</div>

						<Drawer.Close class={button}>Close</Drawer.Close>
					</div>
				</Drawer.Content>
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
```

### Snap points

Use `snapPoints` to snap a bottom sheet drawer to preset heights. Numbers between 0 and 1 represent fractions of the viewport height, and numbers greater than 1 are treated as pixel values. String values support `px` and `rem` units (for example, `'148px'` or `'30rem'`).

```svelte title="Snap points"
<script lang="ts">
	import { Drawer, type DrawerSnapPoint } from '@sveltery/base/drawer';

	const snapPoints: DrawerSnapPoint[] = ['148px', 1];
	let snapPoint = $state<DrawerSnapPoint | null>(snapPoints[0]);
</script>

<Drawer.Root {snapPoints} bind:snapPoint>
	<!-- ... -->
</Drawer.Root>
```

Apply the snap point offset in your styles when using vertical drawers:

```css title="Snap point offset"
.DrawerPopup {
	transform: translateY(calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y)));
}
```

```svelte demo
<script lang="ts">
	import { Drawer, type DrawerSnapPoint } from '@sveltery/base/drawer';

	const TOP_MARGIN_REM = 1;
	const VISIBLE_SNAP_POINTS_REM = [30];

	function toViewportSnapPoint(heightRem: number) {
		return `${heightRem + TOP_MARGIN_REM}rem`;
	}

	const snapPoints: DrawerSnapPoint[] = [...VISIBLE_SNAP_POINTS_REM.map(toViewportSnapPoint), 1];

	const button =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<Drawer.Root {snapPoints}>
	<Drawer.Trigger class={button}>Open snap drawer</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Backdrop
			class="[--backdrop-opacity:0.2] [--bleed:3rem] dark:[--backdrop-opacity:0.7] fixed inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:absolute"
		/>
		<Drawer.Viewport
			class="fixed inset-0 flex items-end justify-center touch-none [--bleed:3rem] after:pointer-events-none after:fixed after:inset-x-0 after:bottom-0 after:h-[var(--bleed)] after:bg-white after:content-[''] data-closed:after:opacity-0 dark:after:bg-neutral-950"
		>
			<Drawer.Popup
				class="relative z-1 flex w-full max-h-[calc(100dvh-var(--top-margin))] min-h-0 flex-col overflow-visible border-t border-neutral-950 bg-white text-neutral-950 outline-none touch-none shadow-[0.25rem_0.25rem_0] shadow-black/12 [padding-bottom:max(0px,calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))] [transform:translateY(calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))] transition-[transform,box-shadow] duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[var(--bleed)] after:bg-[inherit] after:content-[''] data-ending-style:[transform:translateY(calc(100%+2px))] data-starting-style:[transform:translateY(calc(100%+2px))] data-starting-style:[padding-bottom:0] data-ending-style:[padding-bottom:0] data-starting-style:shadow-[0.25rem_0.25rem_0] data-starting-style:shadow-black/0 data-ending-style:shadow-[0.25rem_0.25rem_0] data-ending-style:shadow-black/0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
				style="--top-margin: {TOP_MARGIN_REM}rem"
			>
				<div
					class="shrink-0 border-b border-neutral-300 px-6 pt-3.5 pb-4 touch-none select-none dark:border-neutral-700"
				>
					<div class="mx-auto mb-2.5 h-1 w-12 shrink-0 bg-neutral-300 dark:bg-neutral-700"></div>
					<Drawer.Title class="cursor-default text-center text-base font-bold">
						Snap points
					</Drawer.Title>
				</div>
				<Drawer.Content
					class="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-auto px-6 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
				>
					<div class="mx-auto w-full max-w-90">
						<Drawer.Description
							class="mb-4 text-sm text-neutral-600 text-center dark:text-neutral-400"
						>
							Drag the sheet to snap between a compact peek and a near full-height view.
						</Drawer.Description>
						<div class="grid gap-3 mb-6" aria-hidden="true">
							{#each Array.from({ length: 20 }, (_, index) => index) as index (index)}
								<div class="h-12 bg-neutral-200 dark:bg-neutral-700"></div>
							{/each}
						</div>
						<div class="flex items-center justify-end gap-3">
							<Drawer.Close class={button}>Close</Drawer.Close>
						</div>
					</div>
				</Drawer.Content>
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
```

By default, the drawer can skip snap points when swiping quickly. Specify the `snapToSequentialPoints` prop to disable velocity-based skipping so the snap target is determined by drag distance (you can still drag past multiple points).

### Virtual keyboard aware

Wrap a bottom sheet in `<Drawer.VirtualKeyboardProvider>` to make it react to software keyboards when it contains form controls. When the keyboard opens, the provider scrolls the body to keep the focused field visible.

- **Keep the popup frame stable:** place header and footer content outside a plain scrollable body.
- **Lift a pinned footer input:** if a footer contains its own input, reserve a footer slot below the scroll area and offset it by `var(--drawer-keyboard-inset, 0px)`. The demo switches the focused footer to `position: fixed` — positioned against the popup, since its `transform` contains fixed descendants — and adds the inset to its bottom padding.
- **Always include the `0px` fallback:** the provider only sets `--drawer-keyboard-inset` while the keyboard is aligned, so a bare `var(--drawer-keyboard-inset)` is invalid before the first alignment and after cleanup.

```svelte title="Virtual keyboard aware drawer"
<Drawer.Root>
	<Drawer.VirtualKeyboardProvider>
		<!-- ... -->
	</Drawer.VirtualKeyboardProvider>
</Drawer.Root>
```

```svelte demo
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';

	const fields = [
		['Name', 'Ada Lovelace'],
		['Phone', '+1 (555) 123-4567'],
		['Street address', '12 Computing Way'],
		['Apartment', 'Unit 4B'],
		['City', 'San Francisco'],
		['Postal code', '94107'],
		['Delivery window', 'After 6 PM'],
		['Backup contact', 'Grace Hopper']
	];

	const button =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<Drawer.Root>
	<Drawer.Trigger class={button}>Open keyboard-aware drawer</Drawer.Trigger>
	<Drawer.VirtualKeyboardProvider>
		<Drawer.Portal>
			<Drawer.Backdrop
				class="[--backdrop-opacity:0.2] [--bleed:3rem] dark:[--backdrop-opacity:0.7] fixed inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:absolute"
			/>
			<Drawer.Viewport
				class="fixed inset-0 flex items-end justify-center touch-none [--bleed:3rem] after:pointer-events-none after:fixed after:inset-x-0 after:bottom-0 after:h-[var(--bleed)] after:bg-white after:content-[''] data-closed:after:opacity-0 has-[[data-swiping]]:after:opacity-0 dark:after:bg-neutral-950"
			>
				<Drawer.Popup
					class="relative z-1 -mb-[var(--bleed)] flex h-[calc(100%-1rem+var(--bleed))] max-h-[calc(100%-1rem+var(--bleed))] w-full flex-col overflow-visible border-t border-neutral-950 bg-white text-neutral-950 outline-none touch-none shadow-[0.25rem_0.25rem_0] shadow-black/12 [--bleed:3rem] [--footer-reserved-height:calc(5.25rem+var(--bleed))] [transform:translateY(var(--drawer-swipe-movement-y))] transition-[transform,box-shadow] duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform data-swiping:select-none data-ending-style:[transform:translateY(calc(100%-var(--bleed)+2px))] data-starting-style:[transform:translateY(calc(100%-var(--bleed)+2px))] data-starting-style:shadow-[0.25rem_0.25rem_0] data-starting-style:shadow-black/0 data-ending-style:shadow-[0.25rem_0.25rem_0] data-ending-style:shadow-black/0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
				>
					<div
						class="relative shrink-0 border-b border-neutral-300 px-6 py-4 touch-none select-none dark:border-neutral-700"
					>
						<div
							class="absolute top-2 left-1/2 h-1 w-12 shrink-0 -translate-x-1/2 bg-neutral-300 dark:bg-neutral-700"
						></div>
						<div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
							<Drawer.Close
								class="flex h-8 min-w-0 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none justify-self-start hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
							>
								Cancel
							</Drawer.Close>
							<Drawer.Title class="cursor-default text-center text-base font-bold">
								Delivery details
							</Drawer.Title>
							<Drawer.Close
								class="flex h-8 min-w-0 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none justify-self-end hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
							>
								Save
							</Drawer.Close>
						</div>
					</div>

					<Drawer.Content
						class="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-auto px-6 pt-4 pb-6"
					>
						<div class="mx-auto grid w-full max-w-90 gap-3">
							{#each fields as [label, placeholder] (label)}
								<label class="flex w-full flex-col items-start gap-1">
									<span class="text-sm font-bold text-neutral-950 dark:text-white">
										{label}
									</span>
									<input
										class="h-8 w-full border border-neutral-950 bg-white px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
										{placeholder}
										type="text"
									/>
								</label>
							{/each}

							<label class="flex w-full flex-col items-start gap-1">
								<span class="text-sm font-bold text-neutral-950 dark:text-white">Instructions</span>
								<textarea
									class="min-h-22 w-full resize-y border border-neutral-950 bg-white px-2 py-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
									placeholder="Gate code, drop-off spot, or anything else the driver should know"
								></textarea>
							</label>
						</div>
					</Drawer.Content>

					<div
						class="relative min-h-[var(--footer-reserved-height)] shrink-0 transition-[min-height] duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:min-h-[calc(var(--footer-reserved-height)+var(--drawer-keyboard-inset,0px))] motion-reduce:transition-none"
					>
						<div
							class="absolute right-0 bottom-0 left-0 z-1 border-t border-neutral-950 bg-white px-6 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px)+var(--bleed))] transition-[bottom,padding-bottom] duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-[bottom,padding-bottom] focus-within:fixed focus-within:z-3 focus-within:bottom-0 focus-within:pb-[calc(0.625rem+env(safe-area-inset-bottom,0px)+var(--bleed)+var(--drawer-keyboard-inset,0px))] focus-within:[transform:translate3d(0,0,0)] motion-reduce:transition-none dark:border-white dark:bg-neutral-950"
						>
							<label class="mx-auto flex w-full max-w-90 flex-col gap-1">
								<span class="text-sm font-bold text-neutral-950 dark:text-white">
									Delivery note
								</span>
								<input
									class="h-10 w-full border border-neutral-950 bg-white px-2.5 text-sm font-normal text-neutral-950 placeholder:text-neutral-500 any-pointer-coarse:text-base focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400 dark:focus:outline-white"
									placeholder="Add a note for the driver"
									type="text"
								/>
							</label>
						</div>
					</div>
				</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.VirtualKeyboardProvider>
</Drawer.Root>
```

### Indent effect

Scale the background down when any drawer opens by wrapping your app in `<Drawer.Provider>` and use `<Drawer.IndentBackground>` + `<Drawer.Indent>` at the top of your tree. Any `<Drawer.Root>` within the provider notifies it when it mounts, which activates the indent parts (they receive `[data-active]` state attributes).

```svelte demo
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';

	let portalContainer = $state<HTMLDivElement | null>(null);

	const button =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<Drawer.Provider>
	<div bind:this={portalContainer} class="[--bleed:3rem] relative w-full overflow-hidden">
		<Drawer.IndentBackground class="absolute inset-0 bg-black dark:bg-neutral-300" />
		<Drawer.Indent
			class="[--indent-radius:calc(1rem*(1-var(--drawer-swipe-progress)))] [--indent-transition:calc(1-clamp(0,calc(var(--drawer-swipe-progress)*100000),1))] relative min-h-80 border border-neutral-950 bg-white p-4 text-neutral-950 [transition:transform_0.4s_cubic-bezier(0.32,0.72,0,1),border-radius_0.25s_cubic-bezier(0.32,0.72,0,1)] origin-[center_top] will-change-transform [transform:scale(1)_translateY(0)] [transition-duration:calc(400ms*var(--indent-transition)),calc(250ms*var(--indent-transition))] data-active:transform-[scale(calc(0.98+(0.02*var(--drawer-swipe-progress))))_translateY(calc(0.5rem*(1-var(--drawer-swipe-progress))))] data-active:rounded-tl-(--indent-radius) data-active:rounded-tr-(--indent-radius) dark:border-white dark:bg-neutral-950 dark:text-white"
		>
			<div class="flex min-h-80 items-center justify-center">
				<Drawer.Root modal={false}>
					<Drawer.Trigger class={button}>Open drawer</Drawer.Trigger>
					<Drawer.Portal container={portalContainer}>
						<Drawer.Backdrop
							class="[--backdrop-opacity:0.2] [--bleed:3rem] dark:[--backdrop-opacity:0.7] absolute inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:absolute"
						/>
						<Drawer.Viewport class="absolute inset-0 flex items-end justify-center">
							<Drawer.Popup
								class="w-full max-h-[calc(80vh+var(--bleed))] -mb-[var(--bleed)] border-t border-neutral-950 bg-white px-6 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px)+var(--bleed))] text-neutral-950 outline-none shadow-[0.25rem_0.25rem_0] shadow-black/12 overflow-y-auto overscroll-contain transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] [transform:translateY(var(--drawer-swipe-movement-y))] data-swiping:select-none data-ending-style:[transform:translateY(calc(100%-var(--bleed)+2px))] data-starting-style:[transform:translateY(calc(100%-var(--bleed)+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
							>
								<div class="mx-auto mb-4 h-1 w-12 bg-neutral-300 dark:bg-neutral-700"></div>
								<Drawer.Content class="mx-auto w-full max-w-[32rem]">
									<Drawer.Title class="mt-0 mb-1 text-base font-bold text-center">
										Notifications
									</Drawer.Title>
									<Drawer.Description
										class="mb-6 text-sm text-neutral-600 text-center dark:text-neutral-400"
									>
										You are all caught up. Good job!
									</Drawer.Description>
									<div class="flex justify-center gap-3">
										<Drawer.Close class={button}>Close</Drawer.Close>
									</div>
								</Drawer.Content>
							</Drawer.Popup>
						</Drawer.Viewport>
					</Drawer.Portal>
				</Drawer.Root>
			</div>
		</Drawer.Indent>
	</div>
</Drawer.Provider>
```

### Non-modal

Set `modal={false}` to opt out of focus trapping and `disablePointerDismissal` to keep the drawer open on outside clicks.

```svelte demo
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';

	const button =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<Drawer.Root swipeDirection="right" modal={false} disablePointerDismissal>
	<Drawer.Trigger class={button}>Open non-modal drawer</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Viewport
			class="[--viewport-padding:0px] supports-[-webkit-touch-callout:none]:[--viewport-padding:0.625rem] fixed inset-0 flex items-stretch justify-end p-(--viewport-padding) pointer-events-none"
		>
			<Drawer.Popup
				class="[--bleed:3rem] supports-[-webkit-touch-callout:none]:[--bleed:0px] pointer-events-auto h-full w-[calc(20rem+3rem)] max-w-[calc(100vw-3rem+3rem)] -mr-[3rem] border-l border-neutral-950 bg-white p-6 pr-[calc(1.5rem+3rem)] text-neutral-950 outline-none shadow-[0.25rem_0.25rem_0] shadow-black/12 overflow-y-auto overscroll-contain touch-auto [transform:translateX(var(--drawer-swipe-movement-x))] transition-[transform,box-shadow] duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-ending-style:shadow-[0.25rem_0.25rem_0] data-ending-style:shadow-black/0 data-ending-style:[transform:translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-starting-style:shadow-[0.25rem_0.25rem_0] data-starting-style:shadow-black/0 data-starting-style:[transform:translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:mr-0 supports-[-webkit-touch-callout:none]:w-[20rem] supports-[-webkit-touch-callout:none]:max-w-[calc(100vw-3rem)] supports-[-webkit-touch-callout:none]:border supports-[-webkit-touch-callout:none]:pr-6 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Drawer.Content class="mx-auto w-full max-w-[32rem]">
					<Drawer.Title class="mb-1 text-base font-bold">Non-modal drawer</Drawer.Title>
					<Drawer.Description class="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
						This drawer does not trap focus and ignores outside clicks. Use the close button or
						swipe to dismiss it.
					</Drawer.Description>
					<div class="flex justify-end gap-3">
						<Drawer.Close class={button}>Close</Drawer.Close>
					</div>
				</Drawer.Content>
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
```

### Mobile navigation

You can build a full-screen mobile navigation sheet using Drawer parts, including a flick-to-dismiss from the top gesture.

```svelte demo
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';
	import { ScrollArea } from '@sveltery/base/scroll-area';

	const ITEMS = [
		{ href: '/overview', label: 'Overview' },
		{ href: '/components', label: 'Components' },
		{ href: '/utils', label: 'Utilities' },
		{ href: '/overview/releases', label: 'Releases' }
	] as const;

	const LONG_LIST = [
		{ href: '/components/accordion', label: 'Accordion' },
		{ href: '/components/alert-dialog', label: 'Alert Dialog' },
		{ href: '/components/autocomplete', label: 'Autocomplete' },
		{ href: '/components/avatar', label: 'Avatar' },
		{ href: '/components/button', label: 'Button' },
		{ href: '/components/checkbox', label: 'Checkbox' },
		{ href: '/components/checkbox-group', label: 'Checkbox Group' },
		{ href: '/components/collapsible', label: 'Collapsible' },
		{ href: '/components/combobox', label: 'Combobox' },
		{ href: '/components/context-menu', label: 'Context Menu' },
		{ href: '/components/dialog', label: 'Dialog' },
		{ href: '/components/drawer', label: 'Drawer' },
		{ href: '/components/field', label: 'Field' },
		{ href: '/components/fieldset', label: 'Fieldset' },
		{ href: '/components/form', label: 'Form' },
		{ href: '/components/input', label: 'Input' },
		{ href: '/components/menu', label: 'Menu' },
		{ href: '/components/menubar', label: 'Menubar' },
		{ href: '/components/meter', label: 'Meter' },
		{ href: '/components/navigation-menu', label: 'Navigation Menu' },
		{ href: '/components/number-field', label: 'Number Field' },
		{ href: '/components/otp-field', label: 'OTP Field' },
		{ href: '/components/popover', label: 'Popover' },
		{ href: '/components/preview-card', label: 'Preview Card' },
		{ href: '/components/progress', label: 'Progress' },
		{ href: '/components/radio-group', label: 'Radio Group' },
		{ href: '/components/scroll-area', label: 'Scroll Area' },
		{ href: '/components/select', label: 'Select' },
		{ href: '/components/separator', label: 'Separator' },
		{ href: '/components/slider', label: 'Slider' },
		{ href: '/components/switch', label: 'Switch' },
		{ href: '/components/tabs', label: 'Tabs' },
		{ href: '/components/toast', label: 'Toast' },
		{ href: '/components/toggle', label: 'Toggle' },
		{ href: '/components/toggle-group', label: 'Toggle Group' },
		{ href: '/components/toolbar', label: 'Toolbar' },
		{ href: '/components/tooltip', label: 'Tooltip' }
	] as const;

	const button =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';

	const link =
		'flex h-12 w-full items-center border border-neutral-950 bg-white px-4 text-sm text-neutral-950 no-underline hover:bg-neutral-100 active:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<Drawer.Root>
	<Drawer.Trigger class={button}>Open mobile menu</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Backdrop
			class="[--backdrop-opacity:1] dark:[--backdrop-opacity:0.7] fixed inset-0 min-h-dvh bg-[linear-gradient(to_bottom,rgb(0_0_0/5%)_0,rgb(0_0_0/10%)_50%)] opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-600 ease-[var(--ease-out-fast)] supports-[-webkit-touch-callout:none]:absolute data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-350 data-ending-style:ease-[cubic-bezier(0.375,0.015,0.545,0.455)]"
		/>
		<Drawer.Viewport class="group fixed inset-0">
			<ScrollArea.Root
				style="position: static"
				class="h-full overscroll-contain transition-transform duration-600 ease-[cubic-bezier(0.45,1.005,0,1.005)] group-data-starting-style:translate-y-[100dvh] group-data-ending-style:pointer-events-none"
			>
				<ScrollArea.Viewport class="h-full overscroll-contain touch-auto">
					<ScrollArea.Content
						class="flex min-h-full items-end justify-center pt-8 min-[42rem]:px-16 min-[42rem]:py-16"
					>
						<Drawer.Popup
							class="group w-full max-w-[42rem] outline-none transition-transform duration-600 ease-[cubic-bezier(0.45,1.005,0,1.005)] [transform:translateY(var(--drawer-swipe-movement-y))] data-swiping:select-none data-ending-style:[transform:translateY(calc(max(100dvh,100%)+2px))] data-ending-style:duration-350 data-ending-style:ease-[cubic-bezier(0.375,0.015,0.545,0.455)] motion-reduce:transition-none"
						>
							<nav
								aria-label="Navigation"
								class="relative flex flex-col border-t border-neutral-950 bg-white px-6 pt-4 pb-6 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-shadow duration-350 ease-[cubic-bezier(0.375,0.015,0.545,0.455)] group-data-ending-style:shadow-[0.25rem_0.25rem_0] group-data-ending-style:shadow-black/0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none min-[42rem]:border"
							>
								<div class="grid grid-cols-[1fr_auto_1fr] items-start">
									<div aria-hidden="true" class="h-9 w-9"></div>
									<div
										class="h-1 w-12 justify-self-center bg-neutral-300 dark:bg-neutral-700"
									></div>
									<Drawer.Close
										aria-label="Close menu"
										class="flex h-8 w-8 items-center justify-center justify-self-end border-0 bg-transparent text-neutral-950 hover:bg-neutral-100 active:bg-neutral-200 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
									>
										<svg
											width="16"
											height="16"
											viewBox="0 0 16 16"
											fill="none"
											stroke="currentColor"
											stroke-linecap="square"
											stroke-linejoin="round"
											style="display: block"
										>
											<path d="m2.5 2.5 11 11m-11 0 11-11" />
										</svg>
									</Drawer.Close>
								</div>

								<Drawer.Content class="w-full">
									<Drawer.Title class="m-0 mb-1 text-base font-bold">Menu</Drawer.Title>
									<Drawer.Description
										class="m-0 mb-5 text-sm text-neutral-600 dark:text-neutral-400"
									>
										Scroll the long list. Flick down from the top to dismiss.
									</Drawer.Description>

									<div class="pb-8">
										<ul class="grid list-none gap-1 p-0 m-0">
											{#each ITEMS as item (item.label)}
												<li class="flex">
													<a class={link} href={item.href}>{item.label}</a>
												</li>
											{/each}
										</ul>

										<ul aria-label="Component links" class="mt-6 grid list-none gap-1 p-0 m-0">
											{#each LONG_LIST as item (item.label)}
												<li class="flex">
													<a class={link} href={item.href}>{item.label}</a>
												</li>
											{/each}
										</ul>
									</div>
								</Drawer.Content>
							</nav>
						</Drawer.Popup>
					</ScrollArea.Content>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar
					class="pointer-events-none absolute m-px flex w-4 justify-center bg-black/12 dark:bg-white/12 opacity-0 transition-opacity duration-250 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-75 data-scrolling:delay-[0ms] hover:pointer-events-auto hover:opacity-100 hover:duration-75 hover:delay-[0ms] data-ending-style:opacity-0 data-ending-style:duration-250"
				>
					<ScrollArea.Thumb class="w-full bg-neutral-950 dark:bg-white" />
				</ScrollArea.Scrollbar>
			</ScrollArea.Root>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
```

### Swipe to open

Place `<Drawer.SwipeArea>` along the edge of the viewport to enable swipe-to-open gestures.

```svelte demo
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';

	let portalContainer = $state<HTMLDivElement | null>(null);

	const button =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<div
	bind:this={portalContainer}
	class="relative min-h-80 w-full overflow-hidden border border-neutral-950 bg-white text-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white"
>
	<Drawer.Root swipeDirection="right" modal={false}>
		<Drawer.SwipeArea
			class="absolute inset-y-0 right-0 z-[1] w-10 border-l-2 border-dashed border-blue-800 bg-blue-800/10 dark:border-blue-500 dark:bg-blue-500/10"
		>
			<span
				class="pointer-events-none absolute right-0 top-1/2 z-0 mr-2 -translate-y-1/2 -rotate-90 origin-center whitespace-nowrap text-xs font-bold tracking-[0.12em] text-blue-800 uppercase dark:text-blue-500"
			>
				Swipe here
			</span>
		</Drawer.SwipeArea>
		<div class="flex min-h-80 flex-col items-center justify-center gap-3 p-4 text-center">
			<p class="text-sm text-neutral-600 text-center dark:text-neutral-400 pr-12">
				Swipe from the right edge to open the drawer.
			</p>
		</div>
		<Drawer.Portal container={portalContainer}>
			<Drawer.Backdrop
				class="[--backdrop-opacity:0.2] [--bleed:3rem] dark:[--backdrop-opacity:0.7] absolute inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:absolute"
			/>
			<Drawer.Viewport
				class="[--viewport-padding:0px] supports-[-webkit-touch-callout:none]:[--viewport-padding:0.625rem] absolute inset-0 z-20 flex items-stretch justify-end p-(--viewport-padding)"
			>
				<Drawer.Popup
					class="[--bleed:3rem] supports-[-webkit-touch-callout:none]:[--bleed:0px] h-full w-[calc(20rem+3rem)] max-w-[calc(100vw-3rem+3rem)] -mr-[3rem] border-l border-neutral-950 bg-white p-6 pr-[calc(1.5rem+3rem)] text-neutral-950 outline-none shadow-[0.25rem_0.25rem_0] shadow-black/12 overflow-y-auto touch-auto [transform:translateX(var(--drawer-swipe-movement-x))] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-ending-style:[transform:translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-starting-style:[transform:translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:mr-0 supports-[-webkit-touch-callout:none]:w-[20rem] supports-[-webkit-touch-callout:none]:max-w-[calc(100vw-3rem)] supports-[-webkit-touch-callout:none]:border supports-[-webkit-touch-callout:none]:pr-6 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
				>
					<Drawer.Content class="mx-auto w-full max-w-[32rem]">
						<Drawer.Title class="mb-1 text-base font-bold">Library</Drawer.Title>
						<Drawer.Description class="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
							Swipe from the edge whenever you want to jump back into your playlists.
						</Drawer.Description>
						<div class="flex justify-end gap-3">
							<Drawer.Close class={button}>Close</Drawer.Close>
						</div>
					</Drawer.Content>
				</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.Root>
</div>
```

### Close confirmation

This example shows a nested confirmation dialog that opens if the text entered in the drawer is going to be discarded.

To implement this, both the drawer and the confirmation dialog should be controlled. The confirmation dialog may be opened when the `onOpenChange` callback of the drawer receives a request to close while there is text in the textarea. This way, the confirmation is automatically shown when the user clicks the backdrop, presses the Esc key, clicks a close button, or dismisses the drawer with a swipe gesture.

Use `eventDetails.cancel()` in `onOpenChange` to prevent the drawer from closing while the confirmation prompt is shown.

```svelte demo
<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';
	import { Drawer } from '@sveltery/base/drawer';

	let drawerOpen = $state(false);
	let confirmationOpen = $state(false);
	let textareaValue = $state('');
	const titleId = $props.id();

	const button =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<Drawer.Root
	swipeDirection="right"
	bind:open={drawerOpen}
	onOpenChange={(open, eventDetails) => {
		// Show the close confirmation if there’s text in the textarea
		if (!open && textareaValue) {
			eventDetails.cancel();
			confirmationOpen = true;
			return;
		}
		if (!open) {
			// Reset the textarea value
			textareaValue = '';
		}
	}}
>
	<Drawer.Trigger class={button}>Tweet</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Backdrop
			class="[--backdrop-opacity:0.2] dark:[--backdrop-opacity:0.7] fixed inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:absolute"
		/>
		<Drawer.Viewport
			class="[--viewport-padding:0px] supports-[-webkit-touch-callout:none]:[--viewport-padding:0.625rem] fixed inset-0 flex items-stretch justify-end p-(--viewport-padding)"
		>
			<Drawer.Popup
				class="relative [--bleed:3rem] supports-[-webkit-touch-callout:none]:[--bleed:0px] h-full w-[calc(20rem+3rem)] max-w-[calc(100vw-3rem+3rem)] -mr-[3rem] border-l border-neutral-950 bg-white p-6 pr-[calc(1.5rem+3rem)] text-neutral-950 outline-none shadow-[0.25rem_0.25rem_0] shadow-black/12 overflow-y-auto overscroll-contain touch-auto [transform:translateX(var(--drawer-swipe-movement-x))] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-ending-style:[transform:translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-starting-style:[transform:translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:mr-0 supports-[-webkit-touch-callout:none]:w-[20rem] supports-[-webkit-touch-callout:none]:max-w-[calc(100vw-3rem)] supports-[-webkit-touch-callout:none]:border supports-[-webkit-touch-callout:none]:pr-6 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none after:absolute after:inset-0 after:bg-black/5 after:opacity-0 after:transition-opacity after:duration-100 after:ease-out after:pointer-events-none {confirmationOpen
					? 'after:opacity-100'
					: ''}"
			>
				<Drawer.Content class="mx-auto flex flex-col gap-4 w-full max-w-[32rem]">
					<Drawer.Title id={titleId} class="text-base font-bold">New tweet</Drawer.Title>
					<form
						class="flex flex-col gap-4"
						onsubmit={(event) => {
							event.preventDefault();
							// Close the drawer when submitting
							textareaValue = '';
							drawerOpen = false;
						}}
					>
						<textarea
							aria-labelledby={titleId}
							required
							class="min-h-32 w-full border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 p-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white"
							placeholder="What’s on your mind?"
							bind:value={textareaValue}></textarea>
						<div class="flex justify-end gap-3">
							<Drawer.Close class={button}>Cancel</Drawer.Close>
							<button type="submit" class={button}>Tweet</button>
						</div>
					</form>
				</Drawer.Content>
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>

	<!-- Confirmation dialog -->
	<AlertDialog.Root bind:open={confirmationOpen}>
		<AlertDialog.Portal>
			<AlertDialog.Popup
				class="fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[translate,scale,opacity] duration-100 ease-out data-ending-style:translate-y-[calc(-50%+0.25rem)] data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-starting-style:translate-y-[calc(-50%+0.25rem)] data-starting-style:scale-[0.96] data-starting-style:opacity-0"
			>
				<div class="flex flex-col gap-1">
					<AlertDialog.Title class="text-base font-bold">Discard tweet?</AlertDialog.Title>
					<AlertDialog.Description class="text-sm text-neutral-600 dark:text-neutral-400">
						Your tweet will be lost.
					</AlertDialog.Description>
				</div>
				<div class="flex justify-end gap-3">
					<AlertDialog.Close class={button}>Go back</AlertDialog.Close>
					<button
						type="button"
						class={button}
						onclick={() => {
							confirmationOpen = false;
							textareaValue = '';
							drawerOpen = false;
						}}
					>
						Discard
					</button>
				</div>
			</AlertDialog.Popup>
		</AlertDialog.Portal>
	</AlertDialog.Root>
</Drawer.Root>
```

### Action sheet with separate destructive action

This demo builds an action sheet with a grouped list of actions plus a separate destructive action button.

```svelte demo
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';

	const ACTIONS = ['Unfollow', 'Mute', 'Add to Favourites', 'Add to Close Friends', 'Restrict'];

	let open = $state(false);

	const button =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<Drawer.Root bind:open>
	<Drawer.Trigger class={button}>Open action sheet</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Backdrop
			class="[--backdrop-opacity:0.4] fixed inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:absolute dark:[--backdrop-opacity:0.7]"
		/>
		<Drawer.Viewport class="fixed inset-0 flex items-end justify-center">
			<Drawer.Popup
				class="pointer-events-none flex w-full max-w-[20rem] flex-col gap-3 px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] outline-none focus-visible:outline-none [transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-starting-style:[transform:translateY(calc(100%+1rem+2px))] data-ending-style:[transform:translateY(calc(100%+1rem+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]"
			>
				<Drawer.Content
					class="pointer-events-auto overflow-hidden border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
				>
					<Drawer.Title class="sr-only">Profile actions</Drawer.Title>
					<Drawer.Description class="sr-only">Choose an action for this user.</Drawer.Description>

					<ul
						class="m-0 list-none divide-y divide-neutral-950 p-0 dark:divide-white"
						aria-label="Profile actions"
					>
						{#each ACTIONS as action, index (action)}
							<li>
								{#if index === 0}
									<Drawer.Close class="sr-only">Close action sheet</Drawer.Close>
								{/if}
								<button
									type="button"
									class="h-10 w-full border-0 bg-transparent px-5 text-center text-sm text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 focus-visible:bg-neutral-100 focus-visible:outline-none dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:focus-visible:bg-neutral-800"
									onclick={() => (open = false)}
								>
									{action}
								</button>
							</li>
						{/each}
					</ul>
				</Drawer.Content>
				<div
					class="pointer-events-auto overflow-hidden border border-neutral-950 bg-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:border-white dark:bg-neutral-950 dark:shadow-none"
				>
					<button
						type="button"
						class="h-10 w-full border-0 bg-transparent px-5 text-center text-sm text-red-700 select-none dark:text-red-400 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:bg-neutral-100 focus-visible:outline-none dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:focus-visible:bg-neutral-800"
						onclick={() => (open = false)}
					>
						Block User
					</button>
				</div>
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
```

### Detached triggers

A drawer can be controlled by a trigger located either inside or outside the `<Drawer.Root>` component. For simple, one-off interactions, place the `<Drawer.Trigger>` inside `<Drawer.Root>`.

However, if defining the drawer's content next to its trigger is not practical, you can use a detached trigger. This involves placing the `<Drawer.Trigger>` outside of `<Drawer.Root>` and linking them with a `handle` created by the `Drawer.createHandle()` function.

The imperative methods on the handle, such as `open()` and `openWithPayload()`, require a `<Drawer.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```svelte title="Detached triggers"
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';

	const demoDrawer = Drawer.createHandle();
</script>

<!-- @highlight -->
<!-- @highlight-text "handle={demoDrawer}" -->
<Drawer.Trigger handle={demoDrawer}>Open</Drawer.Trigger>

<!-- @highlight -->
<!-- @highlight-text "handle={demoDrawer}" -->
<Drawer.Root handle={demoDrawer}>...</Drawer.Root>
```

The drawer can render different content depending on which trigger opened it. This is achieved by passing a `payload` to the `<Drawer.Trigger>` and using the snippet-as-a-child pattern in `<Drawer.Root>`.

```svelte title="Detached triggers with payload"
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';

	// @highlight
	const demoDrawer = Drawer.createHandle<{ title: string }>();
</script>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<Drawer.Trigger handle={demoDrawer} payload={{ title: 'Profile' }}>Profile</Drawer.Trigger>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<Drawer.Trigger handle={demoDrawer} payload={{ title: 'Settings' }}>Settings</Drawer.Trigger>

<Drawer.Root handle={demoDrawer}>
	<!-- @highlight-text "payload" -->
	{#snippet children({ payload })}
		<Drawer.Portal>
			<Drawer.Popup>
				<Drawer.Content>
					<!-- @highlight-text "payload" -->
					<Drawer.Title>{payload?.title}</Drawer.Title>
				</Drawer.Content>
			</Drawer.Popup>
		</Drawer.Portal>
	{/snippet}
</Drawer.Root>
```

### Stacking and animations

Use CSS transitions or animations to animate drawer opening, closing, swipe interactions, and nested stacking. The `data-starting-style` attribute is applied when a drawer starts to open, and `data-ending-style` is applied when it starts to close.

The `--nested-drawers` CSS variable can be used to determine stack depth. The frontmost drawer has index `0`.

```css title="Stack depth"
.DrawerPopup {
	--stack-step: 0.05;
	--stack-scale: calc(1 - (var(--nested-drawers) * var(--stack-step)));
	transform: translateY(var(--drawer-swipe-movement-y)) scale(var(--stack-scale));
}
```

When stacked drawers have varying heights, use the `--drawer-height` and `--drawer-frontmost-height` variables to keep collapsed drawers aligned with the frontmost one.

```css title="Variable-height stacking"
.DrawerPopup {
	--bleed: 3rem;
	--stack-height: max(
		0px,
		calc(var(--drawer-frontmost-height, var(--drawer-height)) - var(--bleed))
	);
	height: var(--drawer-height, auto);
}

.DrawerPopup[data-nested-drawer-open] {
	height: calc(var(--stack-height) + var(--bleed));
	overflow: hidden;
}
```

The `data-nested-drawer-open` attribute marks drawers behind the frontmost drawer. Use it with `data-nested-drawer-swiping` to dim or hide parent drawer content while keeping it visible during nested swipe interactions.

```css title="Nested content visibility"
.DrawerContent {
	transition: opacity 300ms;
}

/* @highlight-text "data-nested-drawer-open" */
.DrawerPopup[data-nested-drawer-open] .DrawerContent {
	opacity: 0;
}

/* @highlight-text "data-nested-drawer-open" "data-nested-drawer-swiping" */
.DrawerPopup[data-nested-drawer-open][data-nested-drawer-swiping] .DrawerContent {
	opacity: 1;
}
```

The `--drawer-swipe-movement-x`, `--drawer-swipe-movement-y`, and `--drawer-snap-point-offset` CSS variables can be used to create smooth drag and snap offsets:

```css title="Swipe and snap offset"
.DrawerPopup[data-swipe-direction='right'] {
	/* @highlight-text "--drawer-swipe-movement-x" */
	transform: translateX(var(--drawer-swipe-movement-x));
}

.DrawerPopup[data-swipe-direction='down'] {
	/* @highlight-text "--drawer-swipe-movement-y" */
	transform: translateY(calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y)));
}
```

The `data-swipe-direction` attribute can be used with `data-ending-style` to animate directional dismissal:

```css title="Swipe dismissal direction"
/* @highlight-text "data-swipe-direction" */
.DrawerPopup[data-ending-style][data-swipe-direction='right'] {
	transform: translateX(100%);
}

/* @highlight-text "data-swipe-direction" */
.DrawerPopup[data-ending-style][data-swipe-direction='down'] {
	transform: translateY(100%);
}
```

Use `--drawer-swipe-progress` to fade the backdrop as the drawer is swiped, and `--drawer-swipe-strength` to scale release transition durations based on swipe velocity.

```css title="Backdrop and release timing"
.DrawerBackdrop {
	--backdrop-opacity: 0.2;
	opacity: calc(var(--backdrop-opacity) * (1 - var(--drawer-swipe-progress)));
}

.DrawerPopup[data-ending-style],
.DrawerBackdrop[data-ending-style] {
	transition-duration: calc(var(--drawer-swipe-strength) * 400ms);
}

.DrawerPopup[data-swiping],
.DrawerBackdrop[data-swiping] {
	transition-duration: 0ms;
}
```

## API reference

### Provider

<ApiPart name="drawer" part="Provider" />

### IndentBackground

<ApiPart name="drawer" part="IndentBackground" />

| Attribute       | Description                                     |
| --------------- | ----------------------------------------------- |
| `data-active`   | Present when a drawer in the provider is open.  |
| `data-inactive` | Present when no drawer in the provider is open. |

### Indent

<ApiPart name="drawer" part="Indent" />

| Attribute       | Description                                     |
| --------------- | ----------------------------------------------- |
| `data-active`   | Present when a drawer in the provider is open.  |
| `data-inactive` | Present when no drawer in the provider is open. |

| CSS variable              | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| `--drawer-swipe-progress` | The frontmost drawer's swipe progress, from `0` to `1`. |
| `--drawer-height`         | The frontmost drawer's height, while a drawer is open.  |

### Root

<ApiPart name="drawer" part="Root" />

### Trigger

<ApiPart name="drawer" part="Trigger" />

| Attribute         | Description                                    |
| ----------------- | ---------------------------------------------- |
| `data-popup-open` | Present when the corresponding dialog is open. |
| `data-disabled`   | Present when the trigger is disabled.          |

### SwipeArea

<ApiPart name="drawer" part="SwipeArea" />

| Attribute              | Description                              |
| ---------------------- | ---------------------------------------- |
| `data-open`            | Present when the drawer is open.         |
| `data-closed`          | Present when the drawer is closed.       |
| `data-disabled`        | Present when the swipe area is disabled. |
| `data-swipe-direction` | Indicates the swipe direction.           |
| `data-swiping`         | Present when the drawer is being swiped. |

### VirtualKeyboardProvider

<ApiPart name="drawer" part="VirtualKeyboardProvider" />

### Portal

<ApiPart name="drawer" part="Portal" />

### Backdrop

<ApiPart name="drawer" part="Backdrop" />

| Attribute             | Description                                  |
| --------------------- | -------------------------------------------- |
| `data-open`           | Present when the drawer is open.             |
| `data-closed`         | Present when the drawer is closed.           |
| `data-starting-style` | Present when the drawer begins animating in. |
| `data-ending-style`   | Present when the drawer is animating out.    |

| CSS variable              | Description                               |
| ------------------------- | ----------------------------------------- |
| `--drawer-swipe-progress` | The swipe progress of the drawer gesture. |

### Viewport

<ApiPart name="drawer" part="Viewport" />

| Attribute             | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `data-open`           | Present when the drawer is open.                         |
| `data-closed`         | Present when the drawer is closed.                       |
| `data-nested`         | Present when the drawer is nested within another drawer. |
| `data-starting-style` | Present when the drawer begins animating in.             |
| `data-ending-style`   | Present when the drawer is animating out.                |

| CSS variable              | Description                                                                                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--drawer-keyboard-inset` | The software keyboard inset, measured from the bottom edge of the layout viewport. Present only when the drawer is wrapped in `Drawer.VirtualKeyboardProvider`. |

### Popup

<ApiPart name="drawer" part="Popup" />

| Attribute                    | Description                                                          |
| ---------------------------- | -------------------------------------------------------------------- |
| `data-open`                  | Present when the drawer is open.                                     |
| `data-closed`                | Present when the drawer is closed.                                   |
| `data-expanded`              | Present when the drawer is at the expanded (full-height) snap point. |
| `data-nested-drawer-open`    | Present when a nested drawer is open.                                |
| `data-nested-drawer-swiping` | Present when a nested drawer is being swiped.                        |
| `data-swipe-direction`       | Indicates the swipe direction.                                       |
| `data-swipe-dismiss`         | Present when the drawer is dismissed by swiping.                     |
| `data-swiping`               | Present when the drawer is being swiped.                             |
| `data-starting-style`        | Present when the drawer begins animating in.                         |
| `data-ending-style`          | Present when the drawer is animating out.                            |

| CSS variable                 | Description                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `--drawer-frontmost-height`  | The height of the frontmost open drawer in the current nested drawer stack.  |
| `--drawer-height`            | The height of the drawer popup.                                              |
| `--drawer-snap-point-offset` | The snap point offset used for translating the drawer.                       |
| `--drawer-swipe-movement-x`  | The swipe movement on the X axis.                                            |
| `--drawer-swipe-movement-y`  | The swipe movement on the Y axis.                                            |
| `--drawer-swipe-strength`    | A scalar (0.1-1) used to scale the swipe release transition duration in CSS. |
| `--nested-drawers`           | The number of nested drawers that are currently open.                        |

### Content

<ApiPart name="drawer" part="Content" />

### Title

<ApiPart name="drawer" part="Title" />

### Description

<ApiPart name="drawer" part="Description" />

### Close

<ApiPart name="drawer" part="Close" />

| Attribute       | Description                          |
| --------------- | ------------------------------------ |
| `data-disabled` | Present when the button is disabled. |

## createHandle

Creates a new handle to connect a `Drawer.Root` with detached `Drawer.Trigger` components.

**Return value**

`Drawer.Handle<Payload>`

<!-- @exclude-table-of-contents -->

### Handle

Controls a Drawer imperatively and associates detached `Drawer.Trigger` components with a `Drawer.Root`. Create one with `Drawer.createHandle()` and pass it to the `handle` prop of the root and of any triggers rendered outside of it.

The imperative methods take effect only while a root using this handle is mounted; calls made before a root attaches (or after it unmounts) are ignored.

**Properties**

| Property  | Type                   | Modifiers | Description                                                                                    |
| --------- | ---------------------- | --------- | ---------------------------------------------------------------------------------------------- |
| `isOpen`  | `boolean`              | readonly  | Whether the drawer is currently open. Returns `false` while no root is attached to the handle. |
| `payload` | `Payload \| undefined` | readonly  | The payload of the trigger that opened the drawer, or the one passed to `openWithPayload()`.   |

**Methods**

| Method            | Parameters                  | Returns | Description                                                                                                                                                                  |
| ----------------- | --------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`            | `triggerId: string \| null` | `void`  | Opens the drawer, optionally associating it with a trigger. This method should only be called in an event handler or an effect (not during rendering).                       |
| `openWithPayload` | `payload: Payload`          | `void`  | Opens the drawer with the given payload, without associating it with any trigger. This method should only be called in an event handler or an effect (not during rendering). |
| `close`           |                             | `void`  | Closes the drawer. This method should only be called in an event handler or an effect (not during rendering).                                                                |
| `unmount`         |                             | `void`  | Removes the popup at once, without waiting for the exit animation.                                                                                                           |
