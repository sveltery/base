<!--
	A button outside the menu opens it by setting its bound `open` and `triggerId`.
	Derived from Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.test.tsx
	"controlled open interactions" (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
	MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Menu } from '#lib';

	let open = $state(false);
	let triggerId = $state('menu-trigger');
</script>

<button type="button" onclick={() => (open = true)}>Open menu programmatically</button>
<Menu.Root bind:open bind:triggerId>
	<Menu.Trigger id="menu-trigger">Menu trigger</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup>
				<Menu.Item>Close menu</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
