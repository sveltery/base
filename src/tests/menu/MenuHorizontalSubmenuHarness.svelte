<script lang="ts">
	import { Menu } from '#lib';
	let { log }: { log: string[] } = $props();
	const rec = (name: string) => (open: boolean, d: { reason: string }) =>
		log.push(`${name}:${open ? 'open' : 'close'}:${d.reason}`);
</script>

<Menu.Root open orientation="horizontal" onOpenChange={rec('menu')}>
	<Menu.Trigger>Open</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup data-testid="menu">
				<Menu.Item data-testid="first">First</Menu.Item>
				<Menu.SubmenuRoot onOpenChange={rec('sub')}>
					<Menu.SubmenuTrigger data-testid="sub-trigger">More</Menu.SubmenuTrigger>
					<Menu.Portal>
						<Menu.Positioner>
							<Menu.Popup data-testid="sub">
								<Menu.Item data-testid="child">Child</Menu.Item>
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.SubmenuRoot>
				<Menu.Item data-testid="last">Last</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
