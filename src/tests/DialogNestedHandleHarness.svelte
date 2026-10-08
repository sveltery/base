<script lang="ts">
	import { Dialog, type DialogHandle } from '#lib';

	let { handle }: { handle: DialogHandle<string> } = $props();
</script>

<Dialog.Root open>
	<Dialog.Portal>
		<Dialog.Popup>
			<Dialog.Title>Parent</Dialog.Title>
			<Dialog.Trigger {handle}>Open child</Dialog.Trigger>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
<Dialog.Root {handle}>
	<Dialog.Portal>
		<Dialog.Popup data-testid="child-popup">
			<Dialog.Title>Child</Dialog.Title>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
