<script lang="ts">
	import { Drawer } from '../lib/drawer/index.js';
	import DrawerNestedProgressControl from './DrawerNestedProgressControl.svelte';

	let { childOpen = true }: { childOpen?: boolean } = $props();

	// Upstream's controlled `open` with no setter: the click on the control is an outside press
	// for the child, which must not close it.
	function ignore() {}
</script>

<Drawer.Root open={true} modal={false}>
	<Drawer.Portal>
		<Drawer.Viewport>
			<Drawer.Popup data-testid="parent-popup">
				<Drawer.Root bind:open={() => childOpen, ignore} modal={false}>
					<Drawer.Portal keepMounted>
						<Drawer.Viewport>
							<Drawer.Popup>Child drawer</Drawer.Popup>
						</Drawer.Viewport>
					</Drawer.Portal>
					<DrawerNestedProgressControl />
				</Drawer.Root>
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
