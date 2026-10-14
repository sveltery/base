<script lang="ts">
	import { ContextMenu, Dialog, Menu, NavigationMenu, Popover, PreviewCard } from '#lib';

	let {
		outer,
		inBox = false,
		reasons = []
	}: {
		outer: 'popover' | 'dialog' | 'menu' | 'preview-card' | 'navigation-menu';
		inBox?: boolean;
		reasons?: string[];
	} = $props();

	let box = $state<HTMLElement | null>(null);
	const onOpenChange = (open: boolean, details: { reason: string }) => {
		if (!open) reasons.push(details.reason);
	};
</script>

{#snippet contextMenu()}
	<ContextMenu.Root>
		<ContextMenu.Trigger data-testid="ctx-trigger">Card</ContextMenu.Trigger>
		<ContextMenu.Portal container={inBox ? box : undefined}>
			<ContextMenu.Positioner>
				<ContextMenu.Popup data-testid="ctx-menu">
					<ContextMenu.Item data-testid="ctx-item">Item</ContextMenu.Item>
				</ContextMenu.Popup>
			</ContextMenu.Positioner>
		</ContextMenu.Portal>
	</ContextMenu.Root>
{/snippet}

<div data-testid="box" bind:this={box}></div>
{#if outer === 'popover'}
	<Popover.Root {onOpenChange}>
		<Popover.Trigger data-testid="outer-trigger">Open</Popover.Trigger>
		<Popover.Portal>
			<Popover.Positioner>
				<Popover.Popup data-testid="outer">{@render contextMenu()}</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{:else if outer === 'dialog'}
	<Dialog.Root {onOpenChange}>
		<Dialog.Trigger data-testid="outer-trigger">Open</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup data-testid="outer">{@render contextMenu()}</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else if outer === 'menu'}
	<Menu.Root {onOpenChange}>
		<Menu.Trigger data-testid="outer-trigger">Open</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup data-testid="outer">
					<Menu.Item data-testid="outer-item">Rename</Menu.Item>
					{@render contextMenu()}
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
{:else if outer === 'preview-card'}
	<PreviewCard.Root open {onOpenChange}>
		<PreviewCard.Trigger href="#" data-testid="outer-trigger">Link</PreviewCard.Trigger>
		<PreviewCard.Portal>
			<PreviewCard.Positioner>
				<PreviewCard.Popup data-testid="outer">{@render contextMenu()}</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	</PreviewCard.Root>
{:else}
	<NavigationMenu.Root
		value="item"
		onValueChange={(value, details) => {
			if (value == null) reasons.push(details.reason);
		}}
	>
		<NavigationMenu.List>
			<NavigationMenu.Item value="item">
				<NavigationMenu.Trigger data-testid="outer-trigger">Item</NavigationMenu.Trigger>
				<NavigationMenu.Content data-testid="outer">{@render contextMenu()}</NavigationMenu.Content>
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
{/if}
