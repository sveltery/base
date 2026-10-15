<script lang="ts">
	import { ContextMenu, Menu } from '#lib';
	let { log }: { log: string[] } = $props();
</script>

<ContextMenu.Root
	onOpenChange={(open, d) => log.push(`ctx:${open ? 'open' : 'close'}:${d.reason}`)}
>
	<ContextMenu.Trigger data-testid="area">Area</ContextMenu.Trigger>
	<Menu.Trigger data-testid="button">Open</Menu.Trigger>
	<ContextMenu.Portal>
		<ContextMenu.Positioner>
			<ContextMenu.Popup data-testid="ctx"
				><ContextMenu.Item>C1</ContextMenu.Item></ContextMenu.Popup
			>
		</ContextMenu.Positioner>
	</ContextMenu.Portal>
</ContextMenu.Root>
<div data-testid="blank" style="height: 40px"></div>
