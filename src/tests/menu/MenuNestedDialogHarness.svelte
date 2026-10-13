<!--
	A dialog or alert dialog nested in a menu popup, opened by an item that keeps the menu open.
	Derived from Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.test.tsx "nested popups"
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { AlertDialog, Dialog, Menu } from '#lib';

	let { kind }: { kind: 'dialog' | 'alert-dialog' } = $props();

	let open = $state(false);
</script>

<Menu.Root>
	<Menu.Trigger data-testid="menu-trigger">Open Menu</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup data-testid="menu-popup">
				<Menu.Item>Item 1</Menu.Item>
				<Menu.Item closeOnClick={false} data-testid="dialog-trigger" onclick={() => (open = true)}>
					Open Dialog
				</Menu.Item>
				{#if kind === 'dialog'}
					<Dialog.Root bind:open>
						<Dialog.Portal>
							<Dialog.Popup data-testid="dialog-popup">
								<button type="button" data-testid="dialog-button">Dialog Button</button>
								<Dialog.Close data-testid="dialog-close">Close</Dialog.Close>
							</Dialog.Popup>
						</Dialog.Portal>
					</Dialog.Root>
				{:else}
					<AlertDialog.Root bind:open>
						<AlertDialog.Portal>
							<AlertDialog.Backdrop data-testid="alert-dialog-backdrop" />
							<AlertDialog.Popup data-testid="dialog-popup">
								<AlertDialog.Close data-testid="dialog-close">Close</AlertDialog.Close>
							</AlertDialog.Popup>
						</AlertDialog.Portal>
					</AlertDialog.Root>
				{/if}
				<Menu.Item>Item 2</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
