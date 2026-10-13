<!-- A toast list next to a modal dialog whose popup adds the toasts. -->
<script lang="ts">
	import {
		Dialog,
		Toast,
		type GetToastManagerReturnValue,
		type ToastManagerAddOptions
	} from '#lib';
	import ToastHarnessList from './ToastHarnessList.svelte';

	let { open = false, addOptions }: { open?: boolean; addOptions: ToastManagerAddOptions } =
		$props();

	let manager = $state<GetToastManagerReturnValue>();
	// svelte-ignore state_referenced_locally
	let dialogOpen = $state(open);
</script>

<Toast.Provider>
	<ToastHarnessList addButton={false} onManager={(value) => (manager = value)} />
	<button type="button" onclick={() => (dialogOpen = true)}>open dialog</button>
	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Portal>
			<Dialog.Backdrop />
			<Dialog.Popup>
				<button type="button" onclick={() => manager?.add(addOptions)}>add</button>
				<Dialog.Close>Close</Dialog.Close>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
</Toast.Provider>
