<!--
	A plain menu whose items sit in `Menu.List`, opened by two detached triggers.
	Derived from Base UI v1.9.0 packages/react/src/menu/list/MenuList.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Menu } from '#lib';

	const handle = Menu.createHandle();
</script>

<Menu.Trigger {handle}>First</Menu.Trigger>
<Menu.Trigger {handle}>Second</Menu.Trigger>
<Menu.Root {handle}>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup>
				<Menu.List data-testid="list">
					<Menu.Item>Rename</Menu.Item>
				</Menu.List>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
