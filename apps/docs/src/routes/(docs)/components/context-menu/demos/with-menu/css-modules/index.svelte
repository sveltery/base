<script lang="ts">
	import { ContextMenu } from '@sveltery/base/context-menu';
	import { Menu } from '@sveltery/base/menu';
	import styles from './index.module.css';

	const actions = ['Preview', 'Download', 'Copy link', 'Rename'];
</script>

{#snippet sharedMenuItems(type: 'menu' | 'context-menu' = 'menu')}
	{@const Item = type === 'context-menu' ? ContextMenu.Item : Menu.Item}
	{@const Separator = type === 'context-menu' ? ContextMenu.Separator : Menu.Separator}
	{#each actions as action (action)}
		<Item class={styles.Item}>{action}</Item>
	{/each}
	<Separator class={styles.Separator} />
	<Item class="{styles.Item} {styles.ItemDestructive}">Delete</Item>
{/snippet}

<div class={styles.Card}>
	<ContextMenu.Root>
		<ContextMenu.Trigger>
			<img
				width="512"
				height="288"
				class={styles.Image}
				src="https://images.unsplash.com/photo-1619615391095-dfa29e1672ef?q=80&w=512&h=288"
				alt=""
			/>
			<div class={styles.Content}>
				<p class={styles.Title}>Station Hofplein</p>
				<p class={styles.Metadata}>JPG, 2.4 MB</p>
			</div>
		</ContextMenu.Trigger>

		<ContextMenu.Portal>
			<ContextMenu.Positioner class={styles.Positioner}>
				<ContextMenu.Popup class={styles.Popup}>
					{@render sharedMenuItems('context-menu')}
				</ContextMenu.Popup>
			</ContextMenu.Positioner>
		</ContextMenu.Portal>
	</ContextMenu.Root>

	<Menu.Root>
		<Menu.Trigger aria-label="Image actions" class={styles.MenuTrigger}>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
				<path
					d="M9.5 13c0 .8284-.67157 1.5-1.5 1.5s-1.5-.6716-1.5-1.5.67157-1.5 1.5-1.5 1.5.6716 1.5 1.5m0-5c0 .82843-.67157 1.5-1.5 1.5S6.5 8.82843 6.5 8 7.17157 6.5 8 6.5s1.5.67157 1.5 1.5m0-5c0 .82843-.67157 1.5-1.5 1.5S6.5 3.82843 6.5 3 7.17157 1.5 8 1.5s1.5.67157 1.5 1.5"
				/>
			</svg>
		</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner align="end" sideOffset={8} class={styles.Positioner}>
				<Menu.Popup class={styles.Popup}>
					{@render sharedMenuItems()}
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</div>
