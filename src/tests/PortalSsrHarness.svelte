<script lang="ts">
	import { Dialog, Popover } from '#lib';
</script>

<Dialog.Root defaultOpen>
	<Dialog.Trigger>Open dialog</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Popup>DialogBody</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>

<Popover.Root defaultOpen>
	<Popover.Trigger>Open popover</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner>
			<Popover.Popup>PopoverBody</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
