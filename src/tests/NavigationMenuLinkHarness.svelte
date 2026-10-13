<script lang="ts">
	import { NavigationMenu } from '#lib';

	let { closeOnClick = false, active }: { closeOnClick?: boolean; active?: boolean } = $props();
</script>

<NavigationMenu.Root>
	<NavigationMenu.List>
		<NavigationMenu.Item value="item-1">
			<NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
			<NavigationMenu.Content data-testid="popup-1">
				<NavigationMenu.Link href="#link-1" data-testid="link-1" {closeOnClick}>
					Link 1
				</NavigationMenu.Link>
			</NavigationMenu.Content>
		</NavigationMenu.Item>
		<NavigationMenu.Item>
			<NavigationMenu.Link href="#page" data-testid="page-link" {active}>Page</NavigationMenu.Link>
		</NavigationMenu.Item>
	</NavigationMenu.List>

	<NavigationMenu.Portal>
		<NavigationMenu.Positioner>
			<NavigationMenu.Popup>
				<NavigationMenu.Viewport />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
</NavigationMenu.Root>
