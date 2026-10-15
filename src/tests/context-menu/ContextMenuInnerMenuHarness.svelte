<!--
	A plain menu inside a context menu's popup.
-->
<script lang="ts">
	import { ContextMenu, Menu } from '#lib';
	let { log }: { log: string[] } = $props();
</script>

<ContextMenu.Root
	onOpenChange={(open, d) => log.push(`ctx:${open ? 'open' : 'close'}:${d.reason}`)}
>
	<ContextMenu.Trigger data-testid="area" style="display: block; height: 80px"
		>Area</ContextMenu.Trigger
	>
	<ContextMenu.Portal>
		<ContextMenu.Positioner>
			<ContextMenu.Popup data-testid="ctx">
				<ContextMenu.Item>C1</ContextMenu.Item>
				<Menu.Root
					onOpenChange={(open, d) => log.push(`inner:${open ? 'open' : 'close'}:${d.reason}`)}
				>
					<Menu.Trigger data-testid="inner-trigger">More</Menu.Trigger>
					<Menu.Portal>
						<Menu.Positioner>
							<Menu.Popup data-testid="inner">
								<Menu.Item data-testid="inner-item">I1</Menu.Item>
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.Root>
			</ContextMenu.Popup>
		</ContextMenu.Positioner>
	</ContextMenu.Portal>
</ContextMenu.Root>
