<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
	import styles from './index.module.css';
</script>

<Menu.Root>
	<Menu.Trigger class={styles.Button}>
		Song {@render caretDownIcon()}
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class={styles.Positioner} sideOffset={({ side }) => (side === 'top' ? 12 : 8)}>
			<Menu.Popup class={styles.Popup}>
				<Menu.Arrow class={styles.Arrow} />
				<Menu.Item class={styles.Item}>Add to Library</Menu.Item>
				<Menu.Item class={styles.Item}>Add to Playlist</Menu.Item>
				<Menu.Separator class={styles.Separator} />
				<Menu.Item class={styles.Item}>Play Next</Menu.Item>
				<Menu.Item class={styles.Item}>Play Last</Menu.Item>
				<Menu.Separator class={styles.Separator} />
				<Menu.Item class={styles.Item}>Favorite</Menu.Item>
				<Menu.Item class={styles.Item}>Share</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>

{#snippet caretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}
