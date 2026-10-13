<script lang="ts">
	import { AlertDialog, type AlertDialogHandle } from '#lib';
	import AlertDialogStateProbe from './AlertDialogStateProbe.svelte';

	let { handle }: { handle: AlertDialogHandle } = $props();
</script>

<AlertDialog.Trigger {handle}>Open</AlertDialog.Trigger>
<AlertDialog.Root {handle}>
	<AlertDialogStateProbe />
	<AlertDialog.Portal>
		<AlertDialog.Popup>Content</AlertDialog.Popup>
	</AlertDialog.Portal>
</AlertDialog.Root>
