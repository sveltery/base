<!--
	A menu with one submenu, for the enter transition specs.
	Derived from Base UI v1.9.0 packages/react/src/menu/popup/MenuPopupEnterTransition.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { Menu } from '#lib';

	let {
		open,
		keepMounted = false,
		submenuOpen,
		leadingItem = true,
		showSubmenuPopup = true,
		css = '',
		onOpenChange
	}: {
		/** The root's initial `open`. */
		open?: boolean;
		keepMounted?: boolean;
		/** The submenu root's `open`. */
		submenuOpen?: boolean;
		leadingItem?: boolean;
		showSubmenuPopup?: boolean;
		css?: string;
		onOpenChange?: (open: boolean, details: { reason: string; event?: Event }) => void;
	} = $props();

	// Owned here, so a rerender that changes other props leaves the menu's own writes alone.
	let rootOpen = $state(untrack(() => open));
</script>

<svelte:element this={"style"}>{css}</svelte:element>

<Menu.Root bind:open={rootOpen} {onOpenChange}>
	<Menu.Trigger>Trigger</Menu.Trigger>
	<Menu.Portal {keepMounted}>
		<Menu.Positioner>
			<Menu.Popup data-testid="menu-popup">
				{#if leadingItem}<Menu.Item>Item</Menu.Item>{/if}
				<Menu.SubmenuRoot open={submenuOpen}>
					<Menu.SubmenuTrigger>Submenu</Menu.SubmenuTrigger>
					{#if showSubmenuPopup}
						<Menu.Portal>
							<Menu.Positioner>
								<Menu.Popup data-testid="submenu-popup">
									<Menu.Item>Sub item</Menu.Item>
								</Menu.Popup>
							</Menu.Positioner>
						</Menu.Portal>
					{/if}
				</Menu.SubmenuRoot>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
