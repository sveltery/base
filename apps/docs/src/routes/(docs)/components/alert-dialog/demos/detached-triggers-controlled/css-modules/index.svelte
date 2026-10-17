<script lang="ts">
	import { AlertDialog, type AlertDialogChangeEventDetails } from '@sveltery/base/alert-dialog';
	import styles from '../../_index.module.css';

	type AlertPayload = { message: string };

	const demoAlertDialog = AlertDialog.createHandle<AlertPayload>();

	let open = $state(false);
	let triggerId = $state<string | null>(null);

	function handleOpenChange(isOpen: boolean, eventDetails: AlertDialogChangeEventDetails) {
		open = isOpen;
		triggerId = eventDetails.trigger?.id ?? null;
	}
</script>

<div class={styles.Container}>
	<AlertDialog.Trigger
		class="{styles.Button} {styles.DangerButton}"
		handle={demoAlertDialog}
		id="alert-trigger-1"
		payload={{ message: 'Discard draft?' }}
	>
		Discard
	</AlertDialog.Trigger>

	<AlertDialog.Trigger
		class="{styles.Button} {styles.DangerButton}"
		handle={demoAlertDialog}
		id="alert-trigger-2"
		payload={{ message: 'Delete project?' }}
	>
		Delete
	</AlertDialog.Trigger>

	<AlertDialog.Trigger
		class={styles.Button}
		handle={demoAlertDialog}
		id="alert-trigger-3"
		payload={{ message: 'Sign out?' }}
	>
		Sign out
	</AlertDialog.Trigger>

	<button
		type="button"
		class={styles.Button}
		onclick={() => {
			triggerId = 'alert-trigger-2';
			open = true;
		}}
	>
		Open programmatically
	</button>
</div>

<AlertDialog.Root handle={demoAlertDialog} {open} onOpenChange={handleOpenChange} {triggerId}>
	{#snippet children({ payload })}
		<AlertDialog.Portal>
			<AlertDialog.Backdrop class={styles.Backdrop} />
			<AlertDialog.Popup class={styles.Popup}>
				<div class={styles.Intro}>
					<AlertDialog.Title class={styles.Title}>
						{payload?.message ?? 'Are you sure?'}
					</AlertDialog.Title>
					<AlertDialog.Description class={styles.Description}>
						This action cannot be undone.
					</AlertDialog.Description>
				</div>
				<div class={styles.Actions}>
					<AlertDialog.Close class={styles.Button}>Cancel</AlertDialog.Close>
					<AlertDialog.Close class="{styles.Button} {styles.DangerButton}"
						>Confirm</AlertDialog.Close
					>
				</div>
			</AlertDialog.Popup>
		</AlertDialog.Portal>
	{/snippet}
</AlertDialog.Root>
