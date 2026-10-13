<script lang="ts">
	import { useDrawerRootState } from '../lib/drawer/root.svelte.js';

	const drawer = useDrawerRootState();
</script>

<output data-testid="snap-point-probe"
	>{JSON.stringify({
		resolvedSnapPoints: drawer.resolvedSnapPoints,
		activeSnapPointOffset: drawer.activeSnapPointOffset
	})}</output
>
