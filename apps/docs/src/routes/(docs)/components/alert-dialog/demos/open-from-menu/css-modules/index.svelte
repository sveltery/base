<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';
	import { Menu } from '@sveltery/base/menu';
	import styles from './index.module.css';

	let dialogOpen = $state(false);
</script>

<Menu.Root>
	<Menu.Trigger class={styles.Button}>
		Playlist
		{@render caretDownIcon()}
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class={styles.Positioner} sideOffset={8} align="start">
			<Menu.Popup class={styles.MenuPopup}>
				<Menu.Item class={styles.MenuItem}>Play</Menu.Item>
				<Menu.Item class={styles.MenuItem}>Share</Menu.Item>
				<Menu.Separator class={styles.Separator} />
				<!-- Open the alert dialog when the menu item is clicked -->
				<Menu.Item class={styles.MenuItem} onclick={() => (dialogOpen = true)}>Delete…</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>

<!-- Control the alert dialog state -->
<AlertDialog.Root bind:open={dialogOpen}>
	<AlertDialog.Portal>
		<AlertDialog.Backdrop class={styles.Backdrop} />
		<AlertDialog.Popup class={styles.DialogPopup}>
			<div class={styles.Intro}>
				<AlertDialog.Title class={styles.Title}>Delete playlist?</AlertDialog.Title>
				<AlertDialog.Description class={styles.Description}>
					You can't undo this action.
				</AlertDialog.Description>
			</div>
			<div class={styles.Actions}>
				<AlertDialog.Close class={styles.Button}>Cancel</AlertDialog.Close>
				<AlertDialog.Close data-color="red" class={styles.Button}>Delete</AlertDialog.Close>
			</div>
		</AlertDialog.Popup>
	</AlertDialog.Portal>
</AlertDialog.Root>

{#snippet caretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}
