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
