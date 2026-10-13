<script lang="ts">
	import { Drawer, type DrawerSnapPoint } from '../lib/drawer/index.js';
	import DrawerSnapPointProbe from './DrawerSnapPointProbe.svelte';

	let {
		snapPoints,
		snapPoint = undefined,
		popupHeight = 300,
		viewportHeight = 400
	}: {
		snapPoints: DrawerSnapPoint[];
		snapPoint?: DrawerSnapPoint | null;
		popupHeight?: number;
		viewportHeight?: number;
	} = $props();
</script>

<Drawer.Root open={true} modal={false} {snapPoints} {snapPoint}>
	<DrawerSnapPointProbe />
	<Drawer.Portal>
		<Drawer.Viewport style={`height: ${viewportHeight}px`}>
			<Drawer.Popup data-testid="popup" style={`height: ${popupHeight}px`}>Drawer</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
