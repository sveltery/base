<script lang="ts">
	import { Dialog, Menu } from '#lib';

	let dialogOpen = $state(false);
</script>

<button data-testid="before">before</button>
<Menu.Root>
	<Menu.Trigger data-testid="menu-trigger">Open menu</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup>
				<Menu.Item onclick={() => (dialogOpen = true)}>Open dialog</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Portal>
		<Dialog.Popup data-testid="dialog-popup">
			<button data-testid="in-dialog">Inside dialog</button>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
