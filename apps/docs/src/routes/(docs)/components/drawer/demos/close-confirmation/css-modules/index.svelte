<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';
	import { Drawer } from '@sveltery/base/drawer';
	import styles from './index.module.css';

	let drawerOpen = $state(false);
	let confirmationOpen = $state(false);
	let textareaValue = $state('');
	const titleId = $props.id();
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
	<Drawer.Trigger class={styles.Button}>Tweet</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Backdrop class={styles.Backdrop} />
		<Drawer.Viewport class={styles.Viewport}>
			<Drawer.Popup class="{styles.Popup} {confirmationOpen ? styles.PopupDimmed : ''}">
				<Drawer.Content class={styles.Content}>
					<Drawer.Title id={titleId} class={styles.Title}>New tweet</Drawer.Title>
					<form
						class={styles.TextareaContainer}
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
							class={styles.Textarea}
							placeholder="What’s on your mind?"
							bind:value={textareaValue}></textarea>
						<div class={styles.Actions}>
							<Drawer.Close class={styles.Button}>Cancel</Drawer.Close>
							<button type="submit" class={styles.Button}>Tweet</button>
						</div>
					</form>
				</Drawer.Content>
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>

	<!-- Confirmation dialog -->
	<AlertDialog.Root bind:open={confirmationOpen}>
		<AlertDialog.Portal>
			<AlertDialog.Popup class={styles.AlertPopup}>
				<div class={styles.Intro}>
					<AlertDialog.Title class={styles.Title}>Discard tweet?</AlertDialog.Title>
					<AlertDialog.Description class={styles.Description}>
						Your tweet will be lost.
					</AlertDialog.Description>
				</div>
				<div class={styles.Actions}>
					<AlertDialog.Close class={styles.Button}>Go back</AlertDialog.Close>
					<button
						type="button"
						class={styles.Button}
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
