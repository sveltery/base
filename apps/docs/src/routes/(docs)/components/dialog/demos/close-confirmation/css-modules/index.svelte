<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';
	import { Dialog } from '@sveltery/base/dialog';
	import styles from './index.module.css';

	let dialogOpen = $state(false);
	let confirmationOpen = $state(false);
	let textareaValue = $state('');
	const titleId = $props.id();
</script>

<Dialog.Root
	bind:open={dialogOpen}
	onOpenChange={(open, eventDetails) => {
		if (!open && textareaValue) {
			eventDetails.cancel();
			confirmationOpen = true;
		} else {
			textareaValue = '';
		}
	}}
>
	<Dialog.Trigger class={styles.Button}>Tweet</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Backdrop class={styles.Backdrop} />
		<Dialog.Popup class={styles.Popup}>
			<div class={styles.PopupBody}>
				<Dialog.Title id={titleId} class={styles.Title}>New tweet</Dialog.Title>
				<form
					class={styles.TextareaContainer}
					onsubmit={(event) => {
						event.preventDefault();
						dialogOpen = false;
					}}
				>
					<textarea
						aria-labelledby={titleId}
						required
						class={styles.Textarea}
						placeholder="What’s on your mind?"
						bind:value={textareaValue}></textarea>
					<div class={styles.Actions}>
						<Dialog.Close class={styles.Button}>Cancel</Dialog.Close>
						<button type="submit" class={styles.Button}>Tweet</button>
					</div>
				</form>
			</div>
		</Dialog.Popup>
	</Dialog.Portal>

	<!-- Confirmation dialog -->
	<AlertDialog.Root bind:open={confirmationOpen}>
		<AlertDialog.Portal>
			<AlertDialog.Popup class={styles.Popup}>
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
							dialogOpen = false;
						}}
					>
						Discard
					</button>
				</div>
			</AlertDialog.Popup>
		</AlertDialog.Portal>
	</AlertDialog.Root>
</Dialog.Root>
