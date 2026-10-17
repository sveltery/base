# Context Menu

<Subtitle>
  A menu that appears at the pointer on right click or long press.
</Subtitle>

<Meta name="description" content="A menu that appears at the pointer on right click or long press." />

```svelte demo
<script lang="ts">
	import { ContextMenu } from '@sveltery/base/context-menu';

	const itemClass =
		"flex cursor-default py-2 pr-8 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-disabled:text-neutral-500 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white dark:data-disabled:text-neutral-400";
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger
		class="flex aspect-5/3 w-full max-w-64 items-center justify-center rounded-none border border-neutral-950 bg-white text-neutral-950 select-none text-sm dark:border-white dark:bg-neutral-950 dark:text-white"
	>
		Right click here
	</ContextMenu.Trigger>
	<ContextMenu.Portal>
		<ContextMenu.Positioner class="outline-hidden">
			<ContextMenu.Popup
				class="origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<ContextMenu.Item class={itemClass}>Add to Library</ContextMenu.Item>
				<ContextMenu.Item class={itemClass}>Add to Playlist</ContextMenu.Item>
				<ContextMenu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
				<ContextMenu.Item class={itemClass}>Play Next</ContextMenu.Item>
				<ContextMenu.Item class={itemClass}>Play Last</ContextMenu.Item>
				<ContextMenu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
				<ContextMenu.Item class={itemClass}>Favorite</ContextMenu.Item>
				<ContextMenu.Item class={itemClass}>Share</ContextMenu.Item>
			</ContextMenu.Popup>
		</ContextMenu.Positioner>
	</ContextMenu.Portal>
</ContextMenu.Root>
```

## Usage guidelines

- **Use context menus as an enhancement**: Don't make a context menu the only way to perform actions. Users may not discover or be able to open a context menu, especially on touch devices or with assistive technology. Always provide visible controls for the actions that are available in the context menu.

## Anatomy

Import the components and place them together:

```svelte title="Anatomy"
<script lang="ts">
	import { ContextMenu } from '@sveltery/base/context-menu';
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger />
	<ContextMenu.Portal>
		<ContextMenu.Backdrop />
		<ContextMenu.Positioner>
			<ContextMenu.Popup>
				<ContextMenu.Arrow />
				<ContextMenu.Item />
				<ContextMenu.LinkItem />
				<ContextMenu.Separator />

				<ContextMenu.SubmenuRoot>
					<ContextMenu.SubmenuTrigger />
				</ContextMenu.SubmenuRoot>

				<ContextMenu.Group>
					<ContextMenu.GroupLabel />
				</ContextMenu.Group>

				<ContextMenu.RadioGroup>
					<ContextMenu.RadioItem>
						<ContextMenu.RadioItemIndicator />
					</ContextMenu.RadioItem>
				</ContextMenu.RadioGroup>

				<ContextMenu.CheckboxItem>
					<ContextMenu.CheckboxItemIndicator />
				</ContextMenu.CheckboxItem>
			</ContextMenu.Popup>
		</ContextMenu.Positioner>
	</ContextMenu.Portal>
</ContextMenu.Root>
```

## Examples

[Menu](/components/menu#examples) displays additional demos, many of which apply to the context menu as well.

### Using with Menu

A context menu should supplement a primary way to perform the same actions. This image card exposes actions through a visible menu button and reuses them in the context menu for right-click and long-press users.

```svelte demo
<script lang="ts">
	import { ContextMenu } from '@sveltery/base/context-menu';
	import { Menu } from '@sveltery/base/menu';

	const popupClass =
		'origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none';
	const itemClass =
		"flex cursor-default py-2 pr-8 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-disabled:text-neutral-500 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white dark:data-disabled:text-neutral-400";

	const actions = ['Preview', 'Download', 'Copy link', 'Rename'];
</script>

{#snippet sharedMenuItems(type: 'menu' | 'context-menu' = 'menu')}
	{@const Item = type === 'context-menu' ? ContextMenu.Item : Menu.Item}
	{@const Separator = type === 'context-menu' ? ContextMenu.Separator : Menu.Separator}
	{#each actions as action (action)}
		<Item class={itemClass}>{action}</Item>
	{/each}
	<Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
	<Item class="{itemClass} text-red-700">Delete</Item>
{/snippet}

<div
	class="group relative w-full max-w-64 overflow-hidden border border-neutral-950 bg-white text-left text-neutral-950 select-none dark:border-white dark:bg-neutral-950 dark:text-white"
>
	<ContextMenu.Root>
		<ContextMenu.Trigger>
			<img
				width="512"
				height="288"
				class="h-36 w-full object-cover"
				src="https://images.unsplash.com/photo-1619615391095-dfa29e1672ef?q=80&w=512&h=288"
				alt=""
			/>
			<div class="p-2">
				<p class="text-sm leading-5">Station Hofplein</p>
				<p class="text-xs leading-4 text-neutral-500 dark:text-neutral-400">JPG, 2.4 MB</p>
			</div>
		</ContextMenu.Trigger>

		<ContextMenu.Portal>
			<ContextMenu.Positioner class="outline-hidden">
				<ContextMenu.Popup class={popupClass}>
					{@render sharedMenuItems('context-menu')}
				</ContextMenu.Popup>
			</ContextMenu.Positioner>
		</ContextMenu.Portal>
	</ContextMenu.Root>

	<Menu.Root>
		<Menu.Trigger
			aria-label="Image actions"
			class="absolute top-2 right-2 flex size-8 items-center justify-center border border-neutral-950 bg-white text-neutral-950 opacity-0 select-none group-hover:opacity-100 data-pressed:opacity-100 any-pointer-coarse:opacity-100 hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-pressed:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-pressed:bg-neutral-800 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
				<path
					d="M9.5 13c0 .8284-.67157 1.5-1.5 1.5s-1.5-.6716-1.5-1.5.67157-1.5 1.5-1.5 1.5.6716 1.5 1.5m0-5c0 .82843-.67157 1.5-1.5 1.5S6.5 8.82843 6.5 8 7.17157 6.5 8 6.5s1.5.67157 1.5 1.5m0-5c0 .82843-.67157 1.5-1.5 1.5S6.5 3.82843 6.5 3 7.17157 1.5 8 1.5s1.5.67157 1.5 1.5"
				/>
			</svg>
		</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner align="end" sideOffset={8} class="outline-hidden">
				<Menu.Popup class={popupClass}>
					{@render sharedMenuItems()}
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</div>
```

### Nested menu

To create a submenu, create a `<ContextMenu.SubmenuRoot>` inside the parent context menu. Use the `<ContextMenu.SubmenuTrigger>` part for the menu item that opens the nested menu.

```svelte demo
<script lang="ts">
	import { ContextMenu } from '@sveltery/base/context-menu';

	const popupClass =
		'origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none';
	const itemClass =
		"flex cursor-default py-2 pr-6 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-disabled:text-neutral-500 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white dark:data-disabled:text-neutral-400";
	const submenuTriggerClass =
		"flex cursor-default items-center justify-between gap-4 py-2 pr-2 pl-4 text-sm leading-4 outline-hidden select-none data-popup-open:relative data-popup-open:z-0 data-popup-open:before:absolute data-popup-open:before:inset-x-1 data-popup-open:before:inset-y-0 data-popup-open:before:z-[-1] data-popup-open:before:bg-neutral-100 data-popup-open:before:content-[''] data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-highlighted:data-popup-open:before:bg-neutral-950 data-disabled:text-neutral-500 dark:data-popup-open:before:bg-neutral-800 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white dark:data-highlighted:data-popup-open:before:bg-white dark:data-disabled:text-neutral-400";
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger
		class="flex aspect-5/3 w-full max-w-64 items-center justify-center rounded-none border border-neutral-950 bg-white text-neutral-950 select-none text-sm dark:border-white dark:bg-neutral-950 dark:text-white"
	>
		Right click here
	</ContextMenu.Trigger>
	<ContextMenu.Portal>
		<ContextMenu.Positioner class="outline-hidden">
			<ContextMenu.Popup class={popupClass}>
				<ContextMenu.Item class={itemClass}>Add to Library</ContextMenu.Item>

				<ContextMenu.SubmenuRoot>
					<ContextMenu.SubmenuTrigger class={submenuTriggerClass}>
						Add to Playlist
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="currentColor"
							style="display: block"
						>
							<path d="M6 12V4l4.5 4z" />
						</svg>
					</ContextMenu.SubmenuTrigger>
					<ContextMenu.Portal>
						<ContextMenu.Positioner class="outline-hidden" alignOffset={-4} sideOffset={-4}>
							<ContextMenu.Popup class={popupClass}>
								<ContextMenu.Item class={itemClass}>Get Up!</ContextMenu.Item>
								<ContextMenu.Item class={itemClass}>Inside Out</ContextMenu.Item>
								<ContextMenu.Item class={itemClass}>Night Beats</ContextMenu.Item>
								<ContextMenu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
								<ContextMenu.Item class={itemClass}>New playlist…</ContextMenu.Item>
							</ContextMenu.Popup>
						</ContextMenu.Positioner>
					</ContextMenu.Portal>
				</ContextMenu.SubmenuRoot>

				<ContextMenu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />

				<ContextMenu.Item class={itemClass}>Play Next</ContextMenu.Item>
				<ContextMenu.Item class={itemClass}>Play Last</ContextMenu.Item>
				<ContextMenu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
				<ContextMenu.Item class={itemClass}>Favorite</ContextMenu.Item>
				<ContextMenu.Item class={itemClass}>Share</ContextMenu.Item>
			</ContextMenu.Popup>
		</ContextMenu.Positioner>
	</ContextMenu.Portal>
</ContextMenu.Root>
```

## API reference

<script>
	import { TypesContextMenu } from './types';
</script>

### Root

<TypesContextMenu.Root />

### Trigger

<TypesContextMenu.Trigger />

### Portal

<TypesContextMenu.Portal />

### Backdrop

<TypesContextMenu.Backdrop />

### Positioner

<TypesContextMenu.Positioner />

### Popup

<TypesContextMenu.Popup />

### Arrow

<TypesContextMenu.Arrow />

### Item

<TypesContextMenu.Item />

### LinkItem

<TypesContextMenu.LinkItem />

### SubmenuRoot

<TypesContextMenu.SubmenuRoot />

### SubmenuTrigger

<TypesContextMenu.SubmenuTrigger />

### Group

<TypesContextMenu.Group />

### GroupLabel

<TypesContextMenu.GroupLabel />

### RadioGroup

<TypesContextMenu.RadioGroup />

### RadioItem

<TypesContextMenu.RadioItem />

### RadioItemIndicator

<TypesContextMenu.RadioItemIndicator />

### CheckboxItem

<TypesContextMenu.CheckboxItem />

### CheckboxItemIndicator

<TypesContextMenu.CheckboxItemIndicator />

### Separator

<TypesContextMenu.Separator />
