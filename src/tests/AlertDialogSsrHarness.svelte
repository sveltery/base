<script lang="ts">
	import { AlertDialog } from '#lib';

	let { open }: { open: boolean } = $props();
</script>

<AlertDialog.Root {open}>
	<AlertDialog.Trigger>Open alert</AlertDialog.Trigger>
	<AlertDialog.Portal>
		<AlertDialog.Popup>
			<AlertDialog.Title>AlertTitle</AlertDialog.Title>
		</AlertDialog.Popup>
	</AlertDialog.Portal>
</AlertDialog.Root>
