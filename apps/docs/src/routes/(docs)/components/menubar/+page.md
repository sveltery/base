# Menubar

<Subtitle>
  A menu bar providing commands and options for your application.
</Subtitle>

<Meta name="description" content="A menu bar providing commands and options for your application." />

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
	import { Menubar } from '@sveltery/base/menubar';

	const trigger =
		'h-8 border-0 bg-transparent px-3 font-[inherit] text-sm font-normal text-neutral-950 select-none data-pressed:bg-neutral-100 data-disabled:text-neutral-500 dark:text-white dark:focus-visible:bg-neutral-800 dark:data-pressed:bg-neutral-800 dark:data-disabled:text-neutral-400 focus-visible:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 focus-visible:relative dark:focus-visible:outline-white';
	const popup =
		'origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-instant:transition-none data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none';
	const item =
		"flex cursor-default items-center justify-between gap-4 py-2 pr-4 pl-4 text-sm leading-4 font-normal outline-none select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white";
	const submenuTrigger =
		"flex cursor-default items-center justify-between gap-4 py-2 pr-2 pl-4 text-sm leading-4 font-normal outline-none select-none data-popup-open:relative data-popup-open:z-0 data-popup-open:before:absolute data-popup-open:before:inset-x-1 data-popup-open:before:inset-y-0 data-popup-open:before:z-[-1] data-popup-open:before:bg-neutral-100 data-popup-open:before:content-[''] data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-highlighted:data-popup-open:before:bg-neutral-950 dark:data-popup-open:before:bg-neutral-800 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white dark:data-highlighted:data-popup-open:before:bg-white";

	function handleClick(event: MouseEvent) {
		console.log(`${(event.currentTarget as HTMLElement).textContent?.trim()} clicked`);
	}
</script>

<Menubar class="flex items-center">
	<Menu.Root>
		<Menu.Trigger class={trigger}>File</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner class="outline-none" sideOffset={4}>
				<Menu.Popup class={popup}>
					<Menu.Item onclick={handleClick} class={item}>New</Menu.Item>
					<Menu.Item onclick={handleClick} class={item}>Open</Menu.Item>
					<Menu.Item onclick={handleClick} class={item}>Save</Menu.Item>

					<Menu.SubmenuRoot>
						<Menu.SubmenuTrigger class={submenuTrigger}>
							Export
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="currentColor"
								style="display: block"
							>
								<path d="M6 12V4l4.5 4z" />
							</svg>
						</Menu.SubmenuTrigger>
						<Menu.Portal>
							<Menu.Positioner class="outline-none" sideOffset={-4} alignOffset={-4}>
								<Menu.Popup class={popup}>
									<Menu.Item onclick={handleClick} class={item}>PDF</Menu.Item>
									<Menu.Item onclick={handleClick} class={item}>PNG</Menu.Item>
									<Menu.Item onclick={handleClick} class={item}>SVG</Menu.Item>
								</Menu.Popup>
							</Menu.Positioner>
						</Menu.Portal>
					</Menu.SubmenuRoot>

					<Menu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
					<Menu.Item onclick={handleClick} class={item}>Print</Menu.Item>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>

	<Menu.Root>
		<Menu.Trigger class={trigger}>Edit</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner class="outline-none" sideOffset={4}>
				<Menu.Popup class={popup}>
					<Menu.Item onclick={handleClick} class={item}>Cut</Menu.Item>
					<Menu.Item onclick={handleClick} class={item}>Copy</Menu.Item>
					<Menu.Item onclick={handleClick} class={item}>Paste</Menu.Item>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>

	<Menu.Root>
		<Menu.Trigger class={trigger}>View</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner class="outline-none" sideOffset={4}>
				<Menu.Popup class={popup}>
					<Menu.Item onclick={handleClick} class={item}>Zoom In</Menu.Item>
					<Menu.Item onclick={handleClick} class={item}>Zoom Out</Menu.Item>

					<Menu.SubmenuRoot>
						<Menu.SubmenuTrigger class={submenuTrigger}>
							Layout
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="currentColor"
								style="display: block"
							>
								<path d="M6 12V4l4.5 4z" />
							</svg>
						</Menu.SubmenuTrigger>
						<Menu.Portal>
							<Menu.Positioner class="outline-none" sideOffset={-4} alignOffset={-4}>
								<Menu.Popup class={popup}>
									<Menu.Item onclick={handleClick} class={item}>Single Page</Menu.Item>
									<Menu.Item onclick={handleClick} class={item}>Two Pages</Menu.Item>
									<Menu.Item onclick={handleClick} class={item}>Continuous</Menu.Item>
								</Menu.Popup>
							</Menu.Positioner>
						</Menu.Portal>
					</Menu.SubmenuRoot>

					<Menu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
					<Menu.Item onclick={handleClick} class={item}>Full Screen</Menu.Item>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>

	<Menu.Root disabled>
		<Menu.Trigger class={trigger}>Help</Menu.Trigger>
	</Menu.Root>
</Menubar>
```

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
	import { Menubar } from '@sveltery/base/menubar';
</script>

<Menubar>
	<Menu.Root>
		<Menu.Trigger />
		<Menu.Portal>
			<Menu.Backdrop />
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.Arrow />
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
						<Menu.RadioItem>
							<Menu.RadioItemIndicator />
						</Menu.RadioItem>
					</Menu.RadioGroup>

					<Menu.CheckboxItem>
						<Menu.CheckboxItemIndicator />
					</Menu.CheckboxItem>

					<Menu.Viewport />
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</Menubar>
```

## API reference

<script>
	import { TypesMenubar } from './types';
</script>

<TypesMenubar />
