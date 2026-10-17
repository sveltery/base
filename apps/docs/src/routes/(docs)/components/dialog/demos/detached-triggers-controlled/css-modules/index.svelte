<script lang="ts">
	import { Dialog, type DialogChangeEventDetails } from '@sveltery/base/dialog';
	import styles from '../../_index.module.css';

	const demoDialog = Dialog.createHandle<number>();

	let open = $state(false);
	let triggerId = $state<string | null>(null);

	function handleOpenChange(isOpen: boolean, eventDetails: DialogChangeEventDetails) {
		open = isOpen;
		triggerId = eventDetails.trigger?.id ?? null;
	}
</script>

<div class={styles.Container}>
	<Dialog.Trigger class={styles.Button} handle={demoDialog} id="trigger-1" payload={1}>
		Open 1
	</Dialog.Trigger>

	<Dialog.Trigger class={styles.Button} handle={demoDialog} id="trigger-2" payload={2}>
		Open 2
	</Dialog.Trigger>

	<Dialog.Trigger class={styles.Button} handle={demoDialog} id="trigger-3" payload={3}>
		Open 3
	</Dialog.Trigger>

	<button
		class={styles.Button}
		type="button"
		onclick={() => {
			triggerId = 'trigger-2';
			open = true;
		}}
	>
		Open programmatically
	</button>
</div>

<Dialog.Root handle={demoDialog} {open} onOpenChange={handleOpenChange} {triggerId}>
	{#snippet children({ payload })}
		<Dialog.Portal>
			<Dialog.Backdrop class={styles.Backdrop} />
			<Dialog.Popup class={styles.Popup}>
				{#if payload !== undefined}
					<Dialog.Title class={styles.Title}>Dialog {payload}</Dialog.Title>
				{/if}
				<div class={styles.Actions}>
					<Dialog.Close class={styles.Button}>Close</Dialog.Close>
				</div>
			</Dialog.Popup>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
