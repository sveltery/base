<!--
	Upstream MenuRoot.test.tsx "opening a dialog from an item": a menu item opens a dialog.
	Derived from Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Dialog, Menu } from '#lib';

	let { onDialogOpenChange }: { onDialogOpenChange: (open: boolean, reason: string) => void } =
		$props();

	let dialogOpen = $state(false);
</script>

<Menu.Root>
	<Menu.Trigger>Open menu</Menu.Trigger>
	<!-- `keepMounted` keeps the released item connected, like a closing transition does. The browser
	only sends the gesture's click to the common ancestor while the release target is in the DOM. -->
	<Menu.Portal keepMounted>
		<Menu.Positioner>
			<Menu.Popup>
				<Menu.Item onclick={() => (dialogOpen = true)}>Open dialog</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
<Dialog.Root
	bind:open={dialogOpen}
	onOpenChange={(next, details) => onDialogOpenChange(next, details.reason)}
>
	<Dialog.Portal>
		<Dialog.Backdrop style="position: fixed; inset: 0" />
		<Dialog.Popup data-testid="dialog-popup">Dialog</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
