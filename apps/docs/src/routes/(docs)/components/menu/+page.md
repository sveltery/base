# Menu

<Subtitle>
  A list of actions in a dropdown, enhanced with keyboard navigation.
</Subtitle>

<Meta name="description" content="A list of actions in a dropdown, enhanced with keyboard navigation." />

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const itemClass =
		"flex cursor-default py-2 pr-8 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-disabled:text-neutral-500 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white dark:data-disabled:text-neutral-400";
</script>

<Menu.Root>
	<Menu.Trigger
		class="flex h-8 items-center justify-center gap-1.5 rounded-none border border-neutral-950 bg-white pl-3 pr-2 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-pressed:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
	>
		Song <svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="currentColor"
			style="display: block"
			aria-hidden="true"><path d="M12 6H4l4 4.5z" /></svg
		>
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class="outline-hidden" sideOffset={8} align="start">
			<Menu.Popup
				class="relative origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Menu.Item class={itemClass}>Add to Library</Menu.Item>
				<Menu.Item class={itemClass}>Add to Playlist</Menu.Item>
				<Menu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
				<Menu.Item class={itemClass}>Play Next</Menu.Item>
				<Menu.Item class={itemClass}>Play Last</Menu.Item>
				<Menu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
				<Menu.Item class={itemClass}>Favorite</Menu.Item>
				<Menu.Item class={itemClass}>Share</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
</script>

<Menu.FilterProvider>
	<Menu.Root>
		<Menu.Trigger />
		<Menu.Portal>
			<Menu.Backdrop />
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.Arrow />
					<Menu.Input />
					<Menu.Clear />
					<Menu.Empty />

					<Menu.List>
						<Menu.Item />
						<Menu.LinkItem />
						<Menu.Separator />

						<Menu.SubmenuRoot>
							<Menu.SubmenuTrigger />
						</Menu.SubmenuRoot>

						<Menu.Group>
							<Menu.GroupLabel />
						</Menu.Group>

						<Menu.RadioGroup>
							<Menu.GroupLabel />
							<Menu.RadioItem>
								<Menu.RadioItemIndicator />
							</Menu.RadioItem>
						</Menu.RadioGroup>

						<Menu.CheckboxItem>
							<Menu.CheckboxItemIndicator />
						</Menu.CheckboxItem>
					</Menu.List>

					<Menu.Viewport />
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</Menu.FilterProvider>
```

## Examples

### Open on hover

To create a menu that opens on hover, add the `openOnHover` prop to `<Menu.Trigger>`. You can additionally configure how quickly the menu opens on hover using the `delay` prop.

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const itemClass =
		"flex cursor-default py-2 pr-8 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-disabled:text-neutral-500 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white dark:data-disabled:text-neutral-400";
</script>

<Menu.Root>
	<Menu.Trigger
		openOnHover
		class="flex h-8 items-center justify-center gap-1.5 rounded-none border border-neutral-950 bg-white pl-3 pr-2 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-pressed:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
	>
		Add to playlist <svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="currentColor"
			style="display: block"
			aria-hidden="true"><path d="M12 6H4l4 4.5z" /></svg
		>
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class="outline-hidden" sideOffset={8} align="start">
			<Menu.Popup
				class="relative origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Menu.Item class={itemClass}>Get Up!</Menu.Item>
				<Menu.Item class={itemClass}>Inside Out</Menu.Item>
				<Menu.Item class={itemClass}>Night Beats</Menu.Item>
				<Menu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
				<Menu.Item class={itemClass}>New playlist…</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

### Checkbox items

Use the `<Menu.CheckboxItem>` part to create a menu item that can toggle a setting on or off.

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	let showMinimap = $state(true);
	let showSearch = $state(true);
	let showSidebar = $state(false);

	const checkboxItemClass =
		"grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 py-2 pr-8 pl-2.5 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-disabled:text-neutral-500 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white dark:data-disabled:text-neutral-400";
</script>

<Menu.Root>
	<Menu.Trigger
		class="flex h-8 items-center justify-center gap-1.5 rounded-none border border-neutral-950 bg-white pl-3 pr-2 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-pressed:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
	>
		Workspace <svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="currentColor"
			style="display: block"
			aria-hidden="true"><path d="M12 6H4l4 4.5z" /></svg
		>
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class="outline-hidden" sideOffset={8} align="start">
			<Menu.Popup
				class="relative origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Menu.CheckboxItem bind:checked={showMinimap} class={checkboxItemClass}>
					<Menu.CheckboxItemIndicator class="col-start-1">
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							style="display: block"
							aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
						>
					</Menu.CheckboxItemIndicator>
					<span class="col-start-2">Minimap</span>
				</Menu.CheckboxItem>
				<Menu.CheckboxItem bind:checked={showSearch} class={checkboxItemClass}>
					<Menu.CheckboxItemIndicator class="col-start-1">
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							style="display: block"
							aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
						>
					</Menu.CheckboxItemIndicator>
					<span class="col-start-2">Search</span>
				</Menu.CheckboxItem>
				<Menu.CheckboxItem bind:checked={showSidebar} class={checkboxItemClass}>
					<Menu.CheckboxItemIndicator class="col-start-1">
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							style="display: block"
							aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
						>
					</Menu.CheckboxItemIndicator>
					<span class="col-start-2">Sidebar</span>
				</Menu.CheckboxItem>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

### Radio items

Use the `<Menu.RadioGroup>` and `<Menu.RadioItem>` parts to create menu items that work like radio buttons.

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	let value = $state('date');

	const radioItemClass =
		"grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 py-2 pr-8 pl-2.5 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-disabled:text-neutral-500 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white dark:data-disabled:text-neutral-400";
</script>

<Menu.Root>
	<Menu.Trigger
		class="flex h-8 items-center justify-center gap-1.5 rounded-none border border-neutral-950 bg-white pl-3 pr-2 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-pressed:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
	>
		Sort <svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="currentColor"
			style="display: block"
			aria-hidden="true"><path d="M12 6H4l4 4.5z" /></svg
		>
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class="outline-hidden" sideOffset={8} align="start">
			<Menu.Popup
				class="relative origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Menu.RadioGroup bind:value>
					<Menu.RadioItem value="date" class={radioItemClass}>
						<Menu.RadioItemIndicator class="col-start-1">
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								style="display: block"
								aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
							>
						</Menu.RadioItemIndicator>
						<span class="col-start-2">Date</span>
					</Menu.RadioItem>
					<Menu.RadioItem value="name" class={radioItemClass}>
						<Menu.RadioItemIndicator class="col-start-1">
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								style="display: block"
								aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
							>
						</Menu.RadioItemIndicator>
						<span class="col-start-2">Name</span>
					</Menu.RadioItem>
					<Menu.RadioItem value="type" class={radioItemClass}>
						<Menu.RadioItemIndicator class="col-start-1">
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								style="display: block"
								aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
							>
						</Menu.RadioItemIndicator>
						<span class="col-start-2">Type</span>
					</Menu.RadioItem>
				</Menu.RadioGroup>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

### Close on click

Use the `closeOnClick` prop to change whether the menu closes when an item is clicked.

```svelte title="Control whether the menu closes on click"
<!-- Close the menu when a checkbox item is clicked -->
<Menu.CheckboxItem closeOnClick />

<!-- Keep the menu open when an item is clicked -->
<Menu.Item closeOnClick={false} />
```

### Group labels

Use the `<Menu.GroupLabel>` part to add a label to a `<Menu.Group>` or `<Menu.RadioGroup>`.

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	let value = $state('date');
	let showMinimap = $state(true);
	let showSearch = $state(true);
	let showSidebar = $state(false);

	const itemClass =
		"grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 py-2 pr-8 pl-2.5 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-disabled:text-neutral-500 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white dark:data-disabled:text-neutral-400";
	const groupLabelClass =
		'py-2 pr-8 pl-[2.125rem] text-sm leading-4 text-neutral-500 select-none dark:text-neutral-400';
</script>

<Menu.Root>
	<Menu.Trigger
		class="flex h-8 items-center justify-center gap-1.5 rounded-none border border-neutral-950 bg-white pl-3 pr-2 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-pressed:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
	>
		View <svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="currentColor"
			style="display: block"
			aria-hidden="true"><path d="M12 6H4l4 4.5z" /></svg
		>
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class="outline-hidden" sideOffset={8} align="start">
			<Menu.Popup
				class="relative origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Menu.RadioGroup bind:value>
					<Menu.GroupLabel class={groupLabelClass}>Sort</Menu.GroupLabel>
					<Menu.RadioItem value="date" class={itemClass}>
						<Menu.RadioItemIndicator class="col-start-1">
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								style="display: block"
								aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
							>
						</Menu.RadioItemIndicator>
						<span class="col-start-2">Date</span>
					</Menu.RadioItem>
					<Menu.RadioItem value="name" class={itemClass}>
						<Menu.RadioItemIndicator class="col-start-1">
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								style="display: block"
								aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
							>
						</Menu.RadioItemIndicator>
						<span class="col-start-2">Name</span>
					</Menu.RadioItem>
					<Menu.RadioItem value="type" class={itemClass}>
						<Menu.RadioItemIndicator class="col-start-1">
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								style="display: block"
								aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
							>
						</Menu.RadioItemIndicator>
						<span class="col-start-2">Type</span>
					</Menu.RadioItem>
				</Menu.RadioGroup>

				<Menu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />

				<Menu.Group>
					<Menu.GroupLabel class={groupLabelClass}>Workspace</Menu.GroupLabel>
					<Menu.CheckboxItem bind:checked={showMinimap} class={itemClass}>
						<Menu.CheckboxItemIndicator class="col-start-1">
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								style="display: block"
								aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
							>
						</Menu.CheckboxItemIndicator>
						<span class="col-start-2">Minimap</span>
					</Menu.CheckboxItem>
					<Menu.CheckboxItem bind:checked={showSearch} class={itemClass}>
						<Menu.CheckboxItemIndicator class="col-start-1">
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								style="display: block"
								aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
							>
						</Menu.CheckboxItemIndicator>
						<span class="col-start-2">Search</span>
					</Menu.CheckboxItem>
					<Menu.CheckboxItem bind:checked={showSidebar} class={itemClass}>
						<Menu.CheckboxItemIndicator class="col-start-1">
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								style="display: block"
								aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
							>
						</Menu.CheckboxItemIndicator>
						<span class="col-start-2">Sidebar</span>
					</Menu.CheckboxItem>
				</Menu.Group>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

### Nested menu

To create a submenu, nest another menu inside the parent menu with `<Menu.SubmenuRoot>`. Use the `<Menu.SubmenuTrigger>` part for the menu item that opens the nested menu.

```svelte title="Adding a submenu"
<Menu.Root>
	<Menu.Trigger />
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup>
				<Menu.Item />

				<!-- @highlight-start -->
				<!-- Submenu -->
				<Menu.SubmenuRoot>
					<!-- @highlight -->
					<Menu.SubmenuTrigger />
					<Menu.Portal>
						<Menu.Positioner>
							<Menu.Popup>
								<!-- Submenu items -->
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.SubmenuRoot>
				<!-- @highlight-end -->
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const popupClass =
		'relative origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none';
	const itemClass =
		"flex cursor-default py-2 pr-6 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-disabled:text-neutral-500 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white dark:data-disabled:text-neutral-400";
	const submenuTriggerClass =
		"flex cursor-default items-center justify-between gap-4 py-2 pr-2 pl-4 text-sm leading-4 outline-hidden select-none data-popup-open:relative data-popup-open:z-0 data-popup-open:before:absolute data-popup-open:before:inset-x-1 data-popup-open:before:inset-y-0 data-popup-open:before:z-[-1] data-popup-open:before:bg-neutral-100 data-popup-open:before:content-[''] data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-highlighted:data-popup-open:before:bg-neutral-950 data-disabled:text-neutral-500 dark:data-popup-open:before:bg-neutral-800 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white dark:data-highlighted:data-popup-open:before:bg-white dark:data-disabled:text-neutral-400";

	function getOffset({ side }: { side: string }) {
		return side === 'top' || side === 'bottom' ? 4 : -4;
	}
</script>

<Menu.Root>
	<Menu.Trigger
		class="flex h-8 items-center justify-center gap-1.5 rounded-none border border-neutral-950 bg-white pl-3 pr-2 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-pressed:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
	>
		Song <svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="currentColor"
			style="display: block"
			aria-hidden="true"><path d="M12 6H4l4 4.5z" /></svg
		>
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class="outline-hidden" sideOffset={8} align="start">
			<Menu.Popup class={popupClass}>
				<Menu.Item class={itemClass}>Add to Library</Menu.Item>

				<Menu.SubmenuRoot>
					<Menu.SubmenuTrigger class={submenuTriggerClass}>
						Add to Playlist <svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="currentColor"
							style="display: block"
							aria-hidden="true"><path d="M6 12V4l4.5 4z" /></svg
						>
					</Menu.SubmenuTrigger>
					<Menu.Portal>
						<Menu.Positioner class="outline-hidden" sideOffset={getOffset} alignOffset={getOffset}>
							<Menu.Popup class={popupClass}>
								<Menu.Item class={itemClass}>Add to Library</Menu.Item>
								<Menu.Item class={itemClass}>Add to Playlist</Menu.Item>
								<Menu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
								<Menu.Item class={itemClass}>Play Next</Menu.Item>
								<Menu.Item class={itemClass}>Play Last</Menu.Item>
								<Menu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
								<Menu.Item class={itemClass}>Favorite</Menu.Item>
								<Menu.Item class={itemClass}>Share</Menu.Item>
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.SubmenuRoot>

				<Menu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />

				<Menu.Item class={itemClass}>Play Next</Menu.Item>
				<Menu.Item class={itemClass}>Play Last</Menu.Item>
				<Menu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
				<Menu.Item class={itemClass}>Favorite</Menu.Item>
				<Menu.Item class={itemClass}>Share</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

### Navigate to another page

Use the `<Menu.LinkItem>` part to create a link.

```svelte title="A menu item that opens a link"
<Menu.LinkItem href="/projects">Go to Projects</Menu.LinkItem>
```

### Open a dialog

In order to open a dialog using a menu, control the dialog state and open it imperatively using the `onclick` handler on the menu item.

```svelte title="Connecting a dialog to a menu"
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';
	import { Menu } from '@sveltery/base/menu';

	let dialogOpen = $state(false);
</script>

<Menu.Root>
	<Menu.Trigger>Open menu</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup>
				<!-- @highlight-start -->
				<!-- Open the dialog when the menu item is clicked -->
				<Menu.Item onclick={() => (dialogOpen = true)}>Open dialog</Menu.Item>
				<!-- @highlight-end -->
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>

<!-- @highlight-start -->
<!-- Control the dialog state -->
<Dialog.Root bind:open={dialogOpen}>
	<!-- @highlight-end -->
	<Dialog.Portal>
		<Dialog.Backdrop />
		<Dialog.Popup>
			<!-- Rest of the dialog -->
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
```

### Detached triggers

A menu can be opened by a trigger that lives either inside or outside the `<Menu.Root>`.
Keep the trigger inside `<Menu.Root>` for simple, tightly coupled layouts like the hero demo at the top of this page.
When the trigger and menu content need to live in different parts of the tree (for example, in a card list that controls a menu rendered near the document root), create a `handle` with `Menu.createHandle()` and pass it to both the trigger and the root.

Note that only top-level menus can have detached triggers.
Submenus must have their triggers defined within the `SubmenuRoot` part.

The imperative methods on the handle, such as `open()` and `close()`, require a `<Menu.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle (before one mounts, or after it unmounts) are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```svelte title="Detached triggers"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const demoMenu = Menu.createHandle();
</script>

<!-- @highlight -->
<!-- @highlight-text "handle={demoMenu}" -->
<Menu.Trigger handle={demoMenu}>Actions</Menu.Trigger>

<!-- @highlight -->
<!-- @highlight-text "handle={demoMenu}" -->
<Menu.Root handle={demoMenu}>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup>
				<Menu.Item>Edit</Menu.Item>
				<Menu.Item>Share</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const demoMenu = Menu.createHandle();

	const popupClass =
		'relative origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none';
	const itemClass =
		"flex cursor-default py-2 pr-8 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-disabled:text-neutral-500 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white dark:data-disabled:text-neutral-400";
</script>

<Menu.Trigger
	handle={demoMenu}
	aria-label="Project actions"
	class="flex size-8 items-center justify-center rounded-none border border-neutral-950 bg-white text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-pressed:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
>
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="currentColor"
		style="display: block"
		aria-hidden="true"
	>
		<circle cx="3" cy="8" r="1" />
		<circle cx="8" cy="8" r="1" />
		<circle cx="13" cy="8" r="1" />
	</svg>
</Menu.Trigger>

<Menu.Root handle={demoMenu}>
	<Menu.Portal>
		<Menu.Positioner sideOffset={8} align="start" class="outline-hidden">
			<Menu.Popup class={popupClass}>
				<Menu.Item class={itemClass}>Rename</Menu.Item>
				<Menu.Item class={itemClass}>Duplicate</Menu.Item>
				<Menu.Item class={itemClass}>Move to folder</Menu.Item>
				<Menu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
				<Menu.Item class={itemClass}>Archive</Menu.Item>
				<Menu.Item class="{itemClass} text-red-600">Delete</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

### Multiple triggers

One menu can be opened by several triggers.
You can either render multiple `<Menu.Trigger>` components inside the same `<Menu.Root>`, or attach several detached triggers to the same `handle`.

```svelte title="Multiple triggers within the Root part"
<Menu.Root>
	<Menu.Trigger>Row actions</Menu.Trigger>
	<Menu.Trigger>Quick actions</Menu.Trigger>
	<!-- Rest of the menu -->
</Menu.Root>
```

```svelte title="Multiple detached triggers"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const projectMenu = Menu.createHandle();
</script>

<Menu.Trigger handle={projectMenu}>Row actions</Menu.Trigger>
<Menu.Trigger handle={projectMenu}>Quick actions</Menu.Trigger>

<Menu.Root handle={projectMenu}>
	<!-- Rest of the menu -->
</Menu.Root>
```

Menus can render different content depending on which trigger opened them.
Pass a `payload` prop to each `<Menu.Trigger>` and read it via the `children` snippet on `<Menu.Root>`.
Provide a type argument to `createHandle()` to strongly type the payload.

```svelte title="Detached triggers with payload"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const menus = {
		file: ['New', 'Open', 'Save'],
		edit: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste']
	};

	// @highlight
	const demoMenu = Menu.createHandle<{ items: string[] }>();
</script>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<Menu.Trigger handle={demoMenu} payload={{ items: menus.file }}>File</Menu.Trigger>
<!-- @highlight -->
<!-- @highlight-text "payload" -->
<Menu.Trigger handle={demoMenu} payload={{ items: menus.edit }}>Edit</Menu.Trigger>

<Menu.Root handle={demoMenu}>
	{#snippet children({ payload })}
		<!-- @highlight-text "payload" -->
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.Viewport>
						{#each payload?.items ?? [] as item (item)}
							<!-- @highlight-text "payload" -->
							<Menu.Item>{item}</Menu.Item>
						{/each}
					</Menu.Viewport>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	{/snippet}
</Menu.Root>
```

### Controlled mode with multiple triggers

Control a menu's open state externally with `bind:open` on `<Menu.Root>`.
When more than one trigger can open the menu, track the active trigger with `bind:triggerId` on `<Menu.Root>` and matching `id` props on each `<Menu.Trigger>`.
The `onOpenChange` callback receives `eventDetails`, which includes the DOM element that initiated the change as `trigger`, so you can react when the user activates a different trigger.

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const MENUS = {
		library: [
			{ label: 'Add to library', onclick: () => console.log('Adding to library') },
			{ label: 'Add to favorites', onclick: () => console.log('Adding to favorites') }
		],
		playback: [
			{ label: 'Play', onclick: () => console.log('Playing') },
			{ label: 'Add to queue', onclick: () => console.log('Adding to queue') }
		],
		share: [
			{ label: 'Share', onclick: () => console.log('Sharing') },
			{ label: 'Copy link', onclick: () => console.log('Copying') }
		]
	};

	type MenuKey = keyof typeof MENUS;

	const demoMenu = Menu.createHandle<MenuKey>();

	let open = $state(false);
	let activeTrigger = $state<string | null>(null);

	const itemClass =
		"flex cursor-default py-2 pr-8 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-disabled:text-neutral-500 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white dark:data-disabled:text-neutral-400";
	const triggerClass =
		'flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white active:bg-neutral-200 data-pressed:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:data-pressed:bg-neutral-800';
	const popupClass =
		'relative origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none';
</script>

<div class="flex flex-wrap items-center gap-2">
	<Menu.Trigger handle={demoMenu} payload="library" id="menu-trigger-1" class={triggerClass}>
		Library
	</Menu.Trigger>
	<Menu.Trigger handle={demoMenu} payload="playback" id="menu-trigger-2" class={triggerClass}>
		Playback
	</Menu.Trigger>
	<Menu.Trigger handle={demoMenu} payload="share" id="menu-trigger-3" class={triggerClass}>
		Share
	</Menu.Trigger>

	<button
		type="button"
		class={triggerClass}
		onclick={() => {
			activeTrigger = 'menu-trigger-2';
			open = true;
		}}
	>
		Open playback (controlled)
	</button>
</div>

<Menu.Root handle={demoMenu} bind:open bind:triggerId={activeTrigger}>
	{#snippet children({ payload })}
		<Menu.Portal>
			<Menu.Positioner sideOffset={8} align="start" class="outline-hidden">
				<Menu.Popup class={popupClass}>
					{#if payload}
						{#each MENUS[payload] as item (item.label)}
							<Menu.Item class={itemClass} onclick={item.onclick}>
								{item.label}
							</Menu.Item>
						{/each}
					{/if}
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	{/snippet}
</Menu.Root>
```

### Arrow

Use the `<Menu.Arrow>` part inside the popup to visually connect the menu to its trigger.

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const itemClass =
		"flex cursor-default py-2 pr-8 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white";
</script>

<Menu.Root>
	<Menu.Trigger
		class="flex h-8 items-center justify-center gap-1.5 rounded-none border border-neutral-950 bg-white pl-3 pr-2 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-pressed:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
	>
		Song <svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="currentColor"
			style="display: block"
			aria-hidden="true"><path d="M12 6H4l4 4.5z" /></svg
		>
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class="outline-hidden" sideOffset={({ side }) => (side === 'top' ? 12 : 8)}>
			<Menu.Popup
				class="relative origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Menu.Arrow
					class="relative block h-1.5 w-3 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:absolute before:bottom-0 before:left-1/2 before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:[transform:translate(-50%,50%)_rotate(45deg)] before:border before:border-neutral-950 before:bg-white before:content-[''] dark:before:border-white dark:before:bg-neutral-950"
				/>
				<Menu.Item class={itemClass}>Add to Library</Menu.Item>
				<Menu.Item class={itemClass}>Add to Playlist</Menu.Item>
				<Menu.Separator class="m-1 h-px bg-neutral-950 dark:bg-white" />
				<Menu.Item class={itemClass}>Play Next</Menu.Item>
				<Menu.Item class={itemClass}>Play Last</Menu.Item>
				<Menu.Separator class="m-1 h-px bg-neutral-950 dark:bg-white" />
				<Menu.Item class={itemClass}>Favorite</Menu.Item>
				<Menu.Item class={itemClass}>Share</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

### Animating the Menu

When one menu is opened by multiple detached triggers, you can animate the menu as it moves between triggers.
This includes animating position, size, and content.

#### Position and Size

To animate the menu's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

#### Content

The menu also supports content transitions.
This is useful when different triggers display different content within the same menu.

To enable content animations, wrap the menu content in the `<Menu.Viewport>` part.
This part renders a `div` with `data-activation-direction`, containing up to two space-separated tokens (a horizontal `left` or `right` value and a vertical `up` or `down` value), so you can make direction-aware animations.

Inside `<Menu.Viewport>`, content is wrapped in `div`s with transition data attributes:

- `data-current`: The currently visible content when no transitions are present or the incoming content.
- `data-previous`: The outgoing content during a transition.

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const MENUS = {
		library: {
			heading: 'Library',
			groups: [
				['Add to library', 'Add to favorites'],
				['Create playlist', 'Create station']
			]
		},
		playback: {
			heading: 'Playback',
			groups: [
				['Play now', 'Add to queue'],
				['Play next', 'Play last', 'Sleep timer']
			]
		},
		share: {
			heading: 'Share',
			groups: [
				['Copy link', 'Copy embed code'],
				['Share to contacts', 'Share to social']
			]
		}
	};

	type MenuKey = keyof typeof MENUS;

	const demoMenu = Menu.createHandle<MenuKey>();

	const triggerClass = `
		flex h-8 items-center justify-center
		rounded-none border border-neutral-950 bg-white
		px-3 text-sm font-normal text-neutral-950
		select-none
		hover:bg-neutral-100 active:bg-neutral-200 data-pressed:bg-neutral-100
		dark:border-white dark:bg-neutral-950 dark:text-white
		dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:data-pressed:bg-neutral-800
		focus-visible:outline focus-visible:outline-2
		focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white
	`;
	const itemClass = `
		flex cursor-default py-2 pr-8 pl-4
		text-sm leading-4 outline-none select-none
		data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white
		data-highlighted:before:absolute data-highlighted:before:inset-x-1
		data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1]
		data-highlighted:before:bg-neutral-950 data-highlighted:before:content-['']
		dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white
	`;
	const positionerClass = `
		outline-none
		h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)]
		transition-[top,left,right,bottom,transform]
		duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)]
		data-instant:transition-none
	`;
	const popupClass = `
		relative h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] py-1
		origin-[var(--transform-origin)] border border-neutral-950
		bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-none
		transition-[width,height,opacity,scale]
		duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)]
		data-starting-style:scale-90 data-starting-style:opacity-0
		data-ending-style:scale-90 data-ending-style:opacity-0
		data-instant:transition-none
		dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none
	`;
	const viewportClass = `
		relative h-full w-full overflow-clip
		p-0
		[&_[data-current]]:w-[var(--popup-width)]
		[&_[data-current]]:translate-x-0 [&_[data-current]]:opacity-100
		[&_[data-current]]:transition-[translate,opacity]
		[&_[data-current]]:duration-[350ms,175ms]
		[&_[data-current]]:ease-[cubic-bezier(0.22,1,0.36,1)]
		data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:-translate-x-1/2
		data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:opacity-0
		data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:translate-x-1/2
		data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:opacity-0
		[&_[data-previous]]:w-[var(--popup-width)]
		[&_[data-previous]]:translate-x-0 [&_[data-previous]]:opacity-100
		[&_[data-previous]]:transition-[translate,opacity]
		[&_[data-previous]]:duration-[350ms,175ms]
		[&_[data-previous]]:ease-[cubic-bezier(0.22,1,0.36,1)]
		data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:translate-x-1/2
		data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:opacity-0
		data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:-translate-x-1/2
		data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:opacity-0
	`;
</script>

<div class="flex flex-wrap items-center gap-2">
	<Menu.Trigger handle={demoMenu} payload="library" class={triggerClass}>Library</Menu.Trigger>
	<Menu.Trigger handle={demoMenu} payload="playback" class={triggerClass}>Playback</Menu.Trigger>
	<Menu.Trigger handle={demoMenu} payload="share" class={triggerClass}>Share</Menu.Trigger>

	<Menu.Root handle={demoMenu} modal={false}>
		{#snippet children({ payload })}
			<Menu.Portal>
				<Menu.Positioner sideOffset={8} align="start" class={positionerClass}>
					<Menu.Popup class={popupClass}>
						<Menu.Viewport class={viewportClass}>
							{#if payload}
								{#each MENUS[payload].groups as group, groupIndex (groupIndex)}
									<Menu.Group>
										{#if groupIndex === 0}
											<Menu.GroupLabel
												class="px-4 py-2 text-sm leading-4 text-neutral-500 select-none dark:text-neutral-400"
											>
												{MENUS[payload].heading}
											</Menu.GroupLabel>
										{/if}
										{#each group as item (item)}
											<Menu.Item class={itemClass}>{item}</Menu.Item>
										{/each}
									</Menu.Group>
									{#if groupIndex < MENUS[payload].groups.length - 1}
										<Menu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
									{/if}
								{/each}
							{/if}
						</Menu.Viewport>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		{/snippet}
	</Menu.Root>
</div>
```

### Filtering

Wrap `<Menu.Root>` in `<Menu.FilterProvider>`, add `<Menu.Input>` to the popup, and put the items inside `<Menu.List>`.

```svelte title="Filterable menu"
<Menu.FilterProvider>
	<Menu.Root>
		<Menu.Trigger>Actions</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.Input aria-label="Filter actions" />
					<Menu.Clear>Clear</Menu.Clear>
					<Menu.Empty>No results.</Menu.Empty>
					<Menu.List>
						<Menu.Item>Rename</Menu.Item>
						<Menu.Item>Delete</Menu.Item>
					</Menu.List>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</Menu.FilterProvider>
```

Label the input with `aria-label`, `aria-labelledby`, or a visible `<label>`.
Type to narrow the actions, then use the arrow keys to move through matching items.

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	let sort = $state('date');
	let showDetails = $state(true);
	let showSidebar = $state(false);
	let keepOffline = $state(false);

	const popupClass =
		'min-w-[max(14rem,var(--anchor-width))] origin-[var(--transform-origin)] overflow-hidden border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[scale,opacity] duration-100 ease-out outline-hidden data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none';
	const inputContainerClass =
		'flex items-center border-b border-neutral-300 has-data-highlighted:border-neutral-950 has-data-highlighted:ring-1 has-data-highlighted:ring-neutral-950 has-data-highlighted:ring-inset dark:border-neutral-700 dark:has-data-highlighted:border-white dark:has-data-highlighted:ring-white';
	const inputClass =
		'min-h-8 w-0 flex-1 bg-transparent px-2.5 text-sm any-pointer-coarse:text-base leading-none outline-hidden placeholder:text-neutral-500 dark:placeholder:text-neutral-400';
	const clearClass =
		'flex size-8 items-center justify-center bg-transparent outline-hidden focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
	const emptyClass = 'p-3 text-sm text-neutral-500 dark:text-neutral-400';
	// Filtered groups stay mounted with `hidden`.
	const listBaseClass =
		'overflow-y-auto py-1 outline-hidden scroll-py-1 not-has-[>:not([hidden])]:py-0';
	const listClass = `${listBaseClass} max-h-[min(22rem,var(--available-height))] [&>[data-filter-section]:not([hidden])~[data-filter-section]:not([hidden])>[data-filter-separator]]:block`;
	const submenuListClass = `${listBaseClass} max-h-[min(28rem,var(--available-height))]`;
	const itemBaseClass =
		"cursor-default py-2 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white";
	const itemClass = `${itemBaseClass} flex pr-8`;
	const choiceItemClass = `${itemBaseClass} grid grid-cols-[1rem_1fr] items-center gap-2 pr-8 pl-2.5`;
	const submenuTriggerClass = `${itemBaseClass} flex items-center justify-between gap-4 pr-2 data-popup-open:relative data-popup-open:z-0 data-popup-open:before:absolute data-popup-open:before:inset-x-1 data-popup-open:before:inset-y-0 data-popup-open:before:z-[-1] data-popup-open:before:bg-neutral-100 data-popup-open:before:content-[''] data-highlighted:data-popup-open:before:bg-neutral-950 dark:data-popup-open:before:bg-neutral-800 dark:data-highlighted:data-popup-open:before:bg-white`;
	const groupLabelClass =
		'pt-1.5 pr-8 pb-1 pl-4 text-xs leading-4 font-medium text-neutral-500 select-none dark:text-neutral-400';
	const separatorClass = 'mx-1 my-1 hidden h-px bg-neutral-300 dark:bg-neutral-700';

	const sharingOptions = [
		'Email',
		'Messages',
		'AirDrop',
		'Copy link',
		'Invite collaborators',
		'Publish to web',
		'Send a copy'
	];

	const folderOptions = [
		'Desktop',
		'Documents',
		'Downloads',
		'Projects',
		'Archive',
		'Shared',
		'Trash'
	];

	const exportOptions = [
		'PDF document',
		'Word document',
		'Plain text',
		'Rich text',
		'Markdown',
		'HTML page',
		'Image'
	];

	function getSubmenuOffset({ side }: { side: string }) {
		return side === 'top' || side === 'bottom' ? 4 : -4;
	}
</script>

{#snippet filterableSubmenu(
	label: string,
	inputLabel: string,
	placeholder: string,
	emptyText: string,
	options: readonly string[]
)}
	<Menu.FilterProvider>
		<Menu.SubmenuRoot>
			<Menu.SubmenuTrigger class={submenuTriggerClass}>
				{label}
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="currentColor"
					style="display: block"
					aria-hidden="true"><path d="M6 12V4l4.5 4z" /></svg
				>
			</Menu.SubmenuTrigger>
			<Menu.Portal>
				<Menu.Positioner
					class="outline-hidden"
					sideOffset={getSubmenuOffset}
					alignOffset={getSubmenuOffset}
				>
					<Menu.Popup class={popupClass}>
						<div class={inputContainerClass}>
							<Menu.Input class={inputClass} aria-label={inputLabel} {placeholder} />
							<Menu.Clear class={clearClass}>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									style="display: block"
									aria-hidden="true"
								>
									<path d="m3.5 3.5 9 9m0-9-9 9" />
								</svg>
							</Menu.Clear>
						</div>
						<Menu.Empty class={emptyClass}>{emptyText}</Menu.Empty>
						<Menu.List class={submenuListClass}>
							{#each options as option (option)}
								<Menu.Item class={itemClass}>{option}</Menu.Item>
							{/each}
						</Menu.List>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.SubmenuRoot>
	</Menu.FilterProvider>
{/snippet}

<Menu.FilterProvider>
	<Menu.Root>
		<Menu.Trigger
			class="flex h-8 items-center justify-center gap-1.5 rounded-none border border-neutral-950 bg-white pr-2 pl-3 text-sm leading-none font-normal whitespace-nowrap text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-pressed:bg-neutral-100 data-disabled:border-neutral-500 data-disabled:text-neutral-500 focus-visible:-outline-offset-1 focus-visible:outline-2 focus-visible:outline-neutral-950 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-pressed:bg-neutral-800 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 dark:focus-visible:outline-white"
		>
			Actions <svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="currentColor"
				style="display: block"
				aria-hidden="true"><path d="M12 6H4l4 4.5z" /></svg
			>
		</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner class="outline-hidden" sideOffset={8} align="start">
				<Menu.Popup class={popupClass}>
					<div class={inputContainerClass}>
						<Menu.Input class={inputClass} aria-label="Filter actions" placeholder="e.g. Save" />
						<Menu.Clear class={clearClass}>
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								style="display: block"
								aria-hidden="true"
							>
								<path d="m3.5 3.5 9 9m0-9-9 9" />
							</svg>
						</Menu.Clear>
					</div>
					<Menu.Empty class={emptyClass}>No actions found.</Menu.Empty>
					<Menu.List class={listClass}>
						<Menu.Group data-filter-section>
							<Menu.GroupLabel class={groupLabelClass}>File</Menu.GroupLabel>
							<Menu.Item class={itemClass}>New file</Menu.Item>
							<Menu.Item class={itemClass}>Open file</Menu.Item>
							<Menu.Item class={itemClass}>Save</Menu.Item>
							<Menu.Item class={itemClass}>Save as</Menu.Item>
							<Menu.Item class={itemClass}>Duplicate</Menu.Item>
							<Menu.Item class={itemClass}>Rename</Menu.Item>
						</Menu.Group>
						<Menu.Group data-filter-section>
							<Menu.GroupLabel class={groupLabelClass}>Organize</Menu.GroupLabel>
							{@render filterableSubmenu(
								'Move to folder',
								'Filter folders',
								'e.g. Projects',
								'No folders found.',
								folderOptions
							)}
							<Menu.SubmenuRoot>
								<Menu.SubmenuTrigger class={submenuTriggerClass}>
									Share
									<svg
										width="16"
										height="16"
										viewBox="0 0 16 16"
										fill="currentColor"
										style="display: block"
										aria-hidden="true"><path d="M6 12V4l4.5 4z" /></svg
									>
								</Menu.SubmenuTrigger>
								<Menu.Portal>
									<Menu.Positioner
										class="outline-hidden"
										sideOffset={getSubmenuOffset}
										alignOffset={getSubmenuOffset}
									>
										<Menu.Popup class={popupClass}>
											<Menu.List class={submenuListClass}>
												{#each sharingOptions as option (option)}
													<Menu.Item class={itemClass}>{option}</Menu.Item>
												{/each}
											</Menu.List>
										</Menu.Popup>
									</Menu.Positioner>
								</Menu.Portal>
							</Menu.SubmenuRoot>
							{@render filterableSubmenu(
								'Export',
								'Filter export formats',
								'e.g. PDF',
								'No export formats found.',
								exportOptions
							)}
							<Menu.Item class={itemClass}>Download a copy</Menu.Item>
							<Menu.Item class={itemClass}>Delete</Menu.Item>
						</Menu.Group>

						<Menu.RadioGroup data-filter-section bind:value={sort}>
							<Menu.Separator data-filter-separator class={separatorClass} />
							<Menu.GroupLabel class={groupLabelClass}>Sort by</Menu.GroupLabel>
							{#each [['date', 'Date modified'], ['name', 'Name'], ['size', 'Size']] as [value, label] (value)}
								<Menu.RadioItem class={choiceItemClass} {value}>
									<Menu.RadioItemIndicator class="col-start-1">
										<svg
											width="16"
											height="16"
											viewBox="0 0 16 16"
											fill="none"
											stroke="currentColor"
											style="display: block"
											aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
										>
									</Menu.RadioItemIndicator>
									<span class="col-start-2 min-w-0">{label}</span>
								</Menu.RadioItem>
							{/each}
						</Menu.RadioGroup>

						<Menu.Group data-filter-section>
							<Menu.Separator data-filter-separator class={separatorClass} />
							<Menu.GroupLabel class={groupLabelClass}>View</Menu.GroupLabel>
							<Menu.CheckboxItem class={choiceItemClass} bind:checked={showDetails}>
								<Menu.CheckboxItemIndicator class="col-start-1">
									<svg
										width="16"
										height="16"
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										style="display: block"
										aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
									>
								</Menu.CheckboxItemIndicator>
								<span class="col-start-2 min-w-0">Show details</span>
							</Menu.CheckboxItem>
							<Menu.CheckboxItem class={choiceItemClass} bind:checked={showSidebar}>
								<Menu.CheckboxItemIndicator class="col-start-1">
									<svg
										width="16"
										height="16"
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										style="display: block"
										aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
									>
								</Menu.CheckboxItemIndicator>
								<span class="col-start-2 min-w-0">Show sidebar</span>
							</Menu.CheckboxItem>
							<Menu.CheckboxItem class={choiceItemClass} bind:checked={keepOffline}>
								<Menu.CheckboxItemIndicator class="col-start-1">
									<svg
										width="16"
										height="16"
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										style="display: block"
										aria-hidden="true"><path d="m2.5 8.5 4 4 7-9" /></svg
									>
								</Menu.CheckboxItemIndicator>
								<span class="col-start-2 min-w-0">Keep available offline</span>
							</Menu.CheckboxItem>
						</Menu.Group>
					</Menu.List>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</Menu.FilterProvider>
```

#### Matching items

Items match their text by default. Use `label` to override it.

```svelte title="Labels"
<Menu.Item label="Move to folder">Move</Menu.Item>
```

Groups with no matching items get the `hidden` attribute and stay mounted. If your styles set `display` on a group, add a `[hidden]` rule so it still hides.

```css title="Hiding styled groups"
.Group {
	display: flex;
}

.Group[hidden] {
	display: none;
}
```

`<Menu.Empty>` appears when no items match.

By default, an item matches when its text contains the query, ignoring case, accents, and punctuation.
Use `filter` to replace the matching. It receives each item's text and the trimmed query, and keeps the item when it returns `true`.
`Menu.useFilter` provides the same locale-aware comparisons.

```svelte title="Custom matching"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const { startsWith } = Menu.useFilter();
</script>

<Menu.FilterProvider filter={startsWith}>
	<Menu.Root><!-- menu parts --></Menu.Root>
</Menu.FilterProvider>
```

For external filtering, pass `filter={null}` and render the results yourself, omitting empty groups.

```svelte title="External filtering"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const { contains } = Menu.useFilter();
	let query = $state('');
	const results = $derived(actions.filter((action) => contains(action.label, query)));
</script>

<Menu.FilterProvider filter={null} bind:value={query}>
	<Menu.Root><!-- render `results` --></Menu.Root>
</Menu.FilterProvider>
```

#### Controlling the query

`bind:value` on `<Menu.FilterProvider>` controls the query, and `onValueChange` reports each change.
It resets to an empty string when the menu closes, reported with the `'popup-close'` reason. Cancel that change to keep the query.

#### Highlighting

Use `autoHighlight` to highlight the first match while filtering, or `autoHighlight="always"` to highlight it even when the query is empty.
The highlighted item has the `data-highlighted` attribute, and `onItemHighlighted` on `<Menu.Root>` reports each change.

#### Focus and keyboard

Opening the menu with a click or the keyboard focuses the input. Opening it on hover, touch, or with a pen does not, so the on-screen keyboard stays hidden.
The arrow keys move the highlight while the input keeps focus. <kbd>Tab</kbd> closes the menu, and <kbd>Shift</kbd>+<kbd>Tab</kbd> returns focus to the trigger.
The popup is a `dialog` that holds the `searchbox` input and the `menu` list.

#### Submenus

Wrap each searchable `<Menu.SubmenuRoot>` in its own `<Menu.FilterProvider>`.
Submenus without a provider remain unfiltered.

#### Filtering with detached triggers

Use the same `Menu.createHandle()` handle for the root and its detached trigger:

```svelte title="Detached trigger"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const handle = Menu.createHandle();
</script>

<Menu.Trigger {handle}>Actions</Menu.Trigger>
<Menu.FilterProvider>
	<Menu.Root {handle}><!-- menu parts --></Menu.Root>
</Menu.FilterProvider>
```

## API reference

### FilterProvider

<ApiPart name="menu" part="FilterProvider" />

### Root

<ApiPart name="menu" part="Root" />

### Trigger

<ApiPart name="menu" part="Trigger" />

| Attribute         | Description                                  |
| ----------------- | -------------------------------------------- |
| `data-popup-open` | Present when the corresponding menu is open. |
| `data-pressed`    | Present when the trigger is pressed.         |
| `data-disabled`   | Present when the trigger is disabled.        |

### Portal

<ApiPart name="menu" part="Portal" />

### Backdrop

<ApiPart name="menu" part="Backdrop" />

| Attribute             | Description                                |
| --------------------- | ------------------------------------------ |
| `data-open`           | Present when the menu is open.             |
| `data-closed`         | Present when the menu is closed.           |
| `data-starting-style` | Present when the menu begins animating in. |
| `data-ending-style`   | Present when the menu is animating out.    |

### Positioner

<ApiPart name="menu" part="Positioner" />

| Attribute            | Description                                                          |
| -------------------- | -------------------------------------------------------------------- |
| `data-open`          | Present when the menu popup is open.                                 |
| `data-closed`        | Present when the menu popup is closed.                               |
| `data-anchor-hidden` | Present when the anchor is hidden.                                   |
| `data-align`         | Indicates how the popup is aligned relative to the specified side.   |
| `data-side`          | Indicates which side the popup is positioned relative to the anchor. |

| CSS Variable          | Description                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--anchor-height`     | The anchor's height.                                                                                                       |
| `--anchor-width`      | The anchor's width.                                                                                                        |
| `--available-height`  | The available height between the anchor and the edge of the viewport.                                                      |
| `--available-width`   | The available width between the anchor and the edge of the viewport.                                                       |
| `--positioner-height` | The height of the menu's positioner. It is important to set `height` to this value when using CSS to animate size changes. |
| `--positioner-width`  | The width of the menu's positioner. It is important to set `width` to this value when using CSS to animate size changes.   |
| `--transform-origin`  | The coordinates that this element is anchored to. Used for animations and transitions.                                     |

### Popup

<ApiPart name="menu" part="Popup" />

| Attribute             | Description                                                          |
| --------------------- | -------------------------------------------------------------------- |
| `data-open`           | Present when the menu is open.                                       |
| `data-closed`         | Present when the menu is closed.                                     |
| `data-align`          | Indicates how the popup is aligned relative to specified side.       |
| `data-instant`        | Present if animations should be instant.                             |
| `data-side`           | Indicates which side the popup is positioned relative to the anchor. |
| `data-starting-style` | Present when the menu begins animating in.                           |
| `data-ending-style`   | Present when the menu is animating out.                              |

### Viewport

<ApiPart name="menu" part="Viewport" />

The `Viewport` is optional. Reach for it only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When used, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

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

### Arrow

<ApiPart name="menu" part="Arrow" />

| Attribute         | Description                                                          |
| ----------------- | -------------------------------------------------------------------- |
| `data-open`       | Present when the menu popup is open.                                 |
| `data-closed`     | Present when the menu popup is closed.                               |
| `data-uncentered` | Present when the menu arrow is uncentered.                           |
| `data-align`      | Indicates how the popup is aligned relative to specified side.       |
| `data-side`       | Indicates which side the popup is positioned relative to the anchor. |

### Input

<ApiPart name="menu" part="Input" />

| Attribute          | Description                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| `data-highlighted` | Present while the input shows its focus ring. Cleared when keyboard navigation highlights an item. |

### Clear

<ApiPart name="menu" part="Clear" />

| Attribute       | Description                          |
| --------------- | ------------------------------------ |
| `data-disabled` | Present when the button is disabled. |

### Empty

<ApiPart name="menu" part="Empty" />

### List

<ApiPart name="menu" part="List" />

### Item

<ApiPart name="menu" part="Item" />

| Attribute          | Description                                |
| ------------------ | ------------------------------------------ |
| `data-highlighted` | Present when the menu item is highlighted. |
| `data-disabled`    | Present when the menu item is disabled.    |

### LinkItem

<ApiPart name="menu" part="LinkItem" />

| Attribute          | Description                           |
| ------------------ | ------------------------------------- |
| `data-highlighted` | Present when the link is highlighted. |

### SubmenuRoot

<ApiPart name="menu" part="SubmenuRoot" />

### SubmenuTrigger

<ApiPart name="menu" part="SubmenuTrigger" />

| Attribute          | Description                                      |
| ------------------ | ------------------------------------------------ |
| `data-popup-open`  | Present when the corresponding submenu is open.  |
| `data-highlighted` | Present when the submenu trigger is highlighted. |
| `data-disabled`    | Present when the submenu trigger is disabled.    |

### Group

<ApiPart name="menu" part="Group" />

### GroupLabel

<ApiPart name="menu" part="GroupLabel" />

### RadioGroup

<ApiPart name="menu" part="RadioGroup" />

### RadioItem

<ApiPart name="menu" part="RadioItem" />

| Attribute          | Description                                       |
| ------------------ | ------------------------------------------------- |
| `data-checked`     | Present when the menu radio item is selected.     |
| `data-unchecked`   | Present when the menu radio item is not selected. |
| `data-highlighted` | Present when the menu radio item is highlighted.  |
| `data-disabled`    | Present when the menu radio item is disabled.     |

### RadioItemIndicator

<ApiPart name="menu" part="RadioItemIndicator" />

| Attribute             | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `data-checked`        | Present when the menu radio item is selected.         |
| `data-unchecked`      | Present when the menu radio item is not selected.     |
| `data-disabled`       | Present when the menu radio item is disabled.         |
| `data-starting-style` | Present when the radio indicator begins animating in. |
| `data-ending-style`   | Present when the radio indicator is animating out.    |

### CheckboxItem

<ApiPart name="menu" part="CheckboxItem" />

| Attribute          | Description                                         |
| ------------------ | --------------------------------------------------- |
| `data-checked`     | Present when the menu checkbox item is checked.     |
| `data-unchecked`   | Present when the menu checkbox item is not checked. |
| `data-highlighted` | Present when the menu checkbox item is highlighted. |
| `data-disabled`    | Present when the menu checkbox item is disabled.    |

### CheckboxItemIndicator

<ApiPart name="menu" part="CheckboxItemIndicator" />

| Attribute             | Description                                         |
| --------------------- | --------------------------------------------------- |
| `data-checked`        | Present when the menu checkbox item is checked.     |
| `data-unchecked`      | Present when the menu checkbox item is not checked. |
| `data-disabled`       | Present when the menu checkbox item is disabled.    |
| `data-starting-style` | Present when the indicator begins animating in.     |
| `data-ending-style`   | Present when the indicator is animating out.        |

### Separator

<ApiPart name="menu" part="Separator" />

| Attribute          | Description                                 |
| ------------------ | ------------------------------------------- |
| `data-orientation` | Indicates the orientation of the separator. |

## useFilter

When filtering items yourself, `Menu.useFilter` matches text according to the user's locale.

**Parameters**

`GetFilterParameters`

| Prop     | Type                   | Description                                                                                                                  |
| -------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `locale` | `Intl.LocalesArgument` | The locale to use for string comparison. Defaults to the user's runtime locale. Any `Intl.CollatorOptions` are accepted too. |

**Return value**

`Filter`

| Property     | Type                                                                                  | Description                                          |
| ------------ | ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `contains`   | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Returns whether the item matches the query anywhere. |
| `startsWith` | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Returns whether the item starts with the query.      |
| `endsWith`   | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Returns whether the item ends with the query.        |

## createHandle

Creates a new handle to connect a `Menu.Root` with detached `Menu.Trigger` components.

**Return value**

`Menu.Handle<Payload>`

<!-- @exclude-table-of-contents -->

### Handle

Controls a Menu imperatively and associates detached `Menu.Trigger` components with a `Menu.Root`.
Create one with `Menu.createHandle()` and pass it to the `handle` prop of the root and of any triggers rendered outside of it.

The imperative methods take effect only while a root using this handle is mounted. Calls made before a root attaches (or after it unmounts) are ignored.

**Properties**

| Property  | Type                   | Modifiers | Description                                                                                  |
| --------- | ---------------------- | --------- | -------------------------------------------------------------------------------------------- |
| `isOpen`  | `boolean`              | readonly  | Whether the menu is currently open. Returns `false` while no root is attached to the handle. |
| `payload` | `Payload \| undefined` | readonly  | The payload of the trigger that owns the menu.                                               |

**Methods**

| Method    | Parameters          | Returns | Description                                                                                                                                                     |
| --------- | ------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`    | `triggerId: string` | `void`  | Opens the menu and associates it with the trigger with the given id. This method should only be called in an event handler or an effect (not during rendering). |
| `close`   |                     | `void`  | Closes the menu. This method should only be called in an event handler or an effect (not during rendering).                                                     |
| `unmount` |                     | `void`  | Ends the closing phase of the menu after an externally controlled closing animation finishes.                                                                   |
