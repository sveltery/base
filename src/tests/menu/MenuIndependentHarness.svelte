<!--
	A filterable menu whose popup holds an independent, open menu.
	Derived from Base UI v1.9.0 packages/react/src/menu/filter-root/MenuFilterRoot.scoping.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Menu } from '#lib';
</script>

<Menu.FilterProvider>
	<Menu.Root open>
		<Menu.Trigger>Parent</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.Input aria-label="Filter parent" />
					<Menu.List>
						<Menu.Item>Parent action</Menu.Item>
					</Menu.List>
					<Menu.Root open>
						<Menu.Trigger>Independent</Menu.Trigger>
						<Menu.Portal>
							<Menu.Positioner>
								<Menu.Popup>
									<Menu.Item>Independent action</Menu.Item>
								</Menu.Popup>
							</Menu.Positioner>
						</Menu.Portal>
					</Menu.Root>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</Menu.FilterProvider>
