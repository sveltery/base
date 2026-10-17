<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
	import styles from '../../_index.module.css';

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
</script>

<div class={styles.Container}>
	<Menu.Trigger class={styles.Button} handle={demoMenu} id="menu-trigger-1" payload="library">
		Library
	</Menu.Trigger>
	<Menu.Trigger class={styles.Button} handle={demoMenu} id="menu-trigger-2" payload="playback">
		Playback
	</Menu.Trigger>
	<Menu.Trigger class={styles.Button} handle={demoMenu} id="menu-trigger-3" payload="share">
		Share
	</Menu.Trigger>

	<button
		type="button"
		class={styles.Button}
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
			<Menu.Positioner class={styles.Positioner} sideOffset={8} align="start">
				<Menu.Popup class={styles.Popup}>
					{#if payload}
						{#each MENUS[payload] as item (item.label)}
							<Menu.Item class={styles.Item} onclick={item.onclick}>
								{item.label}
							</Menu.Item>
						{/each}
					{/if}
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	{/snippet}
</Menu.Root>
