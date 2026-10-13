<script lang="ts">
	import { NavigationMenu } from '#lib';

	let {
		keepMounted = false,
		keepMountedPortal = false,
		twoItems = false
	}: { keepMounted?: boolean; keepMountedPortal?: boolean; twoItems?: boolean } = $props();
</script>

<NavigationMenu.Root>
	<NavigationMenu.List data-testid="list">
		<NavigationMenu.Item value="item-1">
			<NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
			<NavigationMenu.Content {keepMounted} data-testid="content-1">
				<NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
			</NavigationMenu.Content>
		</NavigationMenu.Item>
		{#if twoItems}
			<NavigationMenu.Item value="item-2">
				<NavigationMenu.Trigger data-testid="trigger-2">Item 2</NavigationMenu.Trigger>
				<NavigationMenu.Content {keepMounted} data-testid="content-2">
					<NavigationMenu.Link href="#link-2">Link 2</NavigationMenu.Link>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		{/if}
	</NavigationMenu.List>
	<NavigationMenu.Portal keepMounted={keepMountedPortal}>
		<NavigationMenu.Positioner>
			<NavigationMenu.Popup>
				<NavigationMenu.Viewport data-testid="viewport" />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
</NavigationMenu.Root>
