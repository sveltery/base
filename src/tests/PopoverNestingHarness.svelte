<script lang="ts">
	import { Combobox, Menu, Popover, type PopoverRootProps } from '#lib';

	let {
		nested,
		container,
		onOpenChange
	}: {
		/** What the popover's popup holds. `none` renders the default content. */
		nested: 'menu' | 'combobox' | 'none';
		/** The popover's portal container. The menu portals into the same `<dialog>` either way. */
		container?: HTMLElement | ShadowRoot;
		onOpenChange?: PopoverRootProps['onOpenChange'];
	} = $props();

	let dialogNode = $state<HTMLDialogElement>();
</script>

{#snippet popover()}
	<Popover.Root open={nested !== 'menu'} {onOpenChange}>
		<Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
		{#if nested === 'combobox'}<input data-testid="focus-target" />{/if}
		<Popover.Portal
			container={nested === 'menu' ? dialogNode : container}
			keepMounted={nested === 'combobox'}
		>
			<Popover.Positioner>
				<Popover.Popup data-testid="popover-popup">
					{#if nested === 'menu'}
						<Menu.Root>
							<Menu.Trigger>Open nested</Menu.Trigger>
							<Menu.Portal container={dialogNode}>
								<Menu.Positioner>
									<Menu.Popup data-testid="menu-popup">
										<Menu.Item closeOnClick={false}>Item</Menu.Item>
									</Menu.Popup>
								</Menu.Positioner>
							</Menu.Portal>
						</Menu.Root>
					{:else if nested === 'combobox'}
						<Combobox.Root items={['a', 'b']}>
							<Combobox.Input data-testid="combobox-input" />
							<Combobox.Portal>
								<Combobox.Positioner>
									<Combobox.Popup>
										<Combobox.List>
											<Combobox.Item value="a">a</Combobox.Item>
											<Combobox.Item value="b">b</Combobox.Item>
										</Combobox.List>
									</Combobox.Popup>
								</Combobox.Positioner>
							</Combobox.Portal>
						</Combobox.Root>
					{:else}
						Content
					{/if}
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{/snippet}

{#if nested === 'menu'}
	<dialog open bind:this={dialogNode}>{@render popover()}</dialog>
{:else}
	<button data-testid="outside">Outside</button>
	{@render popover()}
{/if}
