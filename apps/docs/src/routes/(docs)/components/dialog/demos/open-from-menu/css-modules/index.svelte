<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';
	import { Menu } from '@sveltery/base/menu';
	import styles from './index.module.css';

	let dialogOpen = $state(false);
</script>

<Menu.Root>
	<Menu.Trigger class={styles.Button}>
		Playlist
		<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
			<path d="M12 6H4l4 4.5z" />
		</svg>
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class={styles.Positioner} sideOffset={8} align="start">
			<Menu.Popup class={styles.MenuPopup}>
				<Menu.Item class={styles.MenuItem}>Play</Menu.Item>
				<Menu.Item class={styles.MenuItem}>Share</Menu.Item>
				<Menu.Separator class={styles.Separator} />
				<!-- Open the dialog when the menu item is clicked -->
				<Menu.Item class={styles.MenuItem} onclick={() => (dialogOpen = true)}>Details…</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>

<!-- Control the dialog state -->
<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Portal>
		<Dialog.Backdrop class={styles.Backdrop} />
		<Dialog.Popup class={styles.DialogPopup}>
			<div class={styles.Intro}>
				<Dialog.Title class={styles.Title}>Playlist details</Dialog.Title>
				<Dialog.Description class={styles.Description}>
					This playlist contains 24 songs and was last updated today.
				</Dialog.Description>
			</div>
			<div class={styles.Actions}>
				<Dialog.Close class={styles.Button}>Close</Dialog.Close>
			</div>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
