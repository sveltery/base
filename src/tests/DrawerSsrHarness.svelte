<script lang="ts">
	import { Drawer } from '#lib';

	let { open }: { open: boolean } = $props();
</script>

<Drawer.Provider>
	<Drawer.IndentBackground data-testid="background" />
	<Drawer.Indent data-testid="indent">
		<Drawer.Root {open}>
			<Drawer.Trigger>Open drawer</Drawer.Trigger>
			<Drawer.SwipeArea data-testid="swipe-area" />
			<Drawer.VirtualKeyboardProvider>
				<Drawer.Portal>
					<Drawer.Backdrop />
					<Drawer.Viewport>
						<Drawer.Popup>
							<Drawer.Content>
								<Drawer.Title>DrawerTitle</Drawer.Title>
							</Drawer.Content>
						</Drawer.Popup>
					</Drawer.Viewport>
				</Drawer.Portal>
			</Drawer.VirtualKeyboardProvider>
		</Drawer.Root>
	</Drawer.Indent>
</Drawer.Provider>
