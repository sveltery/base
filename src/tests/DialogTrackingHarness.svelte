<script lang="ts">
	import { Dialog } from '#lib';

	let closeTracked = $state<boolean | undefined>();
</script>

<Dialog.Root
	onOpenChange={(next) => {
		if (!next) closeTracked = $effect.tracking();
	}}
>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Popup>
			<Dialog.Title>Title</Dialog.Title>
			<Dialog.Close>Close</Dialog.Close>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
<output data-testid="close-tracking">{String(closeTracked)}</output>
