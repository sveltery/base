<script lang="ts">
	import { Dialog, Menu, Menubar } from '#lib';
	let { log }: { log: string[] } = $props();
	const rec = (name: string) => (open: boolean, d: { reason: string }) =>
		log.push(`${name}:${open ? 'open' : 'close'}:${d.reason}`);
	const file = Menu.createHandle();
	const edit = Menu.createHandle();
	let open = $state(true);
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Popup>
			<Menubar data-testid="menubar">
				<Menu.Trigger handle={file} data-testid="file-trigger">File</Menu.Trigger>
				<Menu.Trigger handle={edit} data-testid="edit-trigger">Edit</Menu.Trigger>
			</Menubar>
			<Menu.Root handle={file} onOpenChange={rec('file')}>
				<Menu.Portal>
					<Menu.Positioner>
						<Menu.Popup data-testid="file"><Menu.Item>New</Menu.Item></Menu.Popup>
					</Menu.Positioner>
				</Menu.Portal>
			</Menu.Root>
			<Menu.Root handle={edit} onOpenChange={rec('edit')}>
				<Menu.Portal>
					<Menu.Positioner>
						<Menu.Popup data-testid="edit"><Menu.Item>Copy</Menu.Item></Menu.Popup>
					</Menu.Positioner>
				</Menu.Portal>
			</Menu.Root>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
