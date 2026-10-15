<script lang="ts">
	import { Menu, Menubar } from '#lib';
	import type { MenuHandle } from '#lib';
	let {
		log,
		file,
		more,
		ctl
	}: { log: string[]; file: MenuHandle; more: MenuHandle; ctl: { show: boolean } } = $props();
	const rec = (name: string) => (open: boolean, d: { reason: string }) =>
		log.push(`${name}:${open ? 'open' : 'close'}:${d.reason}`);
</script>

<Menubar>
	<Menu.Root handle={file} onOpenChange={rec('file')}>
		<Menu.Trigger id="file-trigger" data-testid="file-trigger">File</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup data-testid="file">
					<Menu.Item>New</Menu.Item>
					{#if ctl.show}
						<Menu.Trigger handle={more} data-testid="more-trigger">More</Menu.Trigger>
					{/if}
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</Menubar>
<Menu.Root handle={more} onOpenChange={rec('more')}>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup data-testid="more"><Menu.Item>M1</Menu.Item></Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
