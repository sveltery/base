<!--
	A triggerless menu under a stub menubar parent, opened from a button outside the menu.
-->
<script lang="ts">
	import { Menu, type MenuChangeEventDetails } from '#lib';
	import { FloatingTreeStore } from '@sveltery/floating-ui-svelte';
	import { setMenubarParent } from '#lib/menu/parent.svelte.js';

	let {
		onOpenChange
	}: { onOpenChange?: (open: boolean, details: MenuChangeEventDetails) => void } = $props();

	let open = $state(false);

	setMenubarParent({
		modal: false,
		disabled: false,
		contentElement: null,
		hasSubmenuOpen: false,
		setHasSubmenuOpen() {},
		orientation: 'horizontal',
		mouseUpGate: { allow: false },
		rootId: undefined,
		floatingTree: new FloatingTreeStore(),
		nodeId: 'menubar',
		relayKeyboardEvent() {},
		createItem() {
			return { props: {} };
		}
	});
</script>

<button type="button" onclick={() => (open = true)}>Open</button>
<div data-testid="blank" style="width: 200px; height: 200px"></div>
<Menu.Root bind:open {onOpenChange}>
	<Menu.Portal>
		<Menu.Positioner anchor={document.body}>
			<Menu.Popup>
				<Menu.Item>Item</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
