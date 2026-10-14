<script lang="ts">
	import { ContextMenu, Menu, Menubar } from '#lib';
	let { log, scenario }: { log: string[]; scenario: 'context-menu' | 'menu' } = $props();
	const rec = (name: string) => (open: boolean, d: { reason: string }) =>
		log.push(`${name}:${open ? 'open' : 'close'}:${d.reason}`);
</script>

<Menubar>
	<Menu.Root onOpenChange={rec('file')}>
		<Menu.Trigger data-testid="file-trigger">File</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup data-testid="file">
					<Menu.Item>New</Menu.Item>
					{#if scenario === 'context-menu'}
						<ContextMenu.Root onOpenChange={rec('ctx')}>
							<ContextMenu.Trigger data-testid="ctx-trigger">Card</ContextMenu.Trigger>
							<ContextMenu.Portal>
								<ContextMenu.Positioner>
									<ContextMenu.Popup data-testid="ctx"
										><ContextMenu.Item>C1</ContextMenu.Item></ContextMenu.Popup
									>
								</ContextMenu.Positioner>
							</ContextMenu.Portal>
						</ContextMenu.Root>
					{:else}
						<Menu.Root onOpenChange={rec('inner')}>
							<Menu.Trigger data-testid="inner-trigger">Inner</Menu.Trigger>
							<Menu.Portal>
								<Menu.Positioner>
									<Menu.Popup data-testid="inner"><Menu.Item>I1</Menu.Item></Menu.Popup>
								</Menu.Positioner>
							</Menu.Portal>
						</Menu.Root>
					{/if}
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
	<Menu.Root onOpenChange={rec('edit')}>
		<Menu.Trigger data-testid="edit-trigger">Edit</Menu.Trigger>
		<Menu.Portal
			><Menu.Positioner
				><Menu.Popup data-testid="edit"><Menu.Item>Copy</Menu.Item></Menu.Popup></Menu.Positioner
			></Menu.Portal
		>
	</Menu.Root>
</Menubar>
