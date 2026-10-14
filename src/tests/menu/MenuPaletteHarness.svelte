<!--
	A filterable menu that mounts open inside a dialog, as a command palette.
	Derived from Base UI v1.9.0 packages/react/src/menu/filter-root/MenuFilterRoot.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Dialog, Menu, ScrollArea } from '#lib';
</script>

<Dialog.Root>
	<Dialog.Trigger>Open palette</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Popup aria-label="Command palette">
			<Menu.FilterProvider autoHighlight="always">
				<Menu.Root open>
					<Menu.Portal>
						<Menu.Positioner>
							<Menu.Popup>
								<Menu.Input aria-label="Search commands" />
								<Dialog.Close>Close palette</Dialog.Close>
								<ScrollArea.Root>
									<ScrollArea.Viewport>
										<ScrollArea.Content>
											<Menu.List>
												<Menu.Group>
													<Menu.GroupLabel>Suggestions</Menu.GroupLabel>
													<Menu.Item>Linear</Menu.Item>
													<Menu.Item>Figma</Menu.Item>
												</Menu.Group>
											</Menu.List>
										</ScrollArea.Content>
									</ScrollArea.Viewport>
									<ScrollArea.Scrollbar>
										<ScrollArea.Thumb />
									</ScrollArea.Scrollbar>
								</ScrollArea.Root>
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.Root>
			</Menu.FilterProvider>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
