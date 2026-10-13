<script lang="ts">
	import { useDrawerRootState } from '../lib/drawer/root.svelte.js';

	const drawer = useDrawerRootState();
</script>

<button onclick={() => drawer.onNestedSwipeProgressChange(0.5)}>Set nested progress</button>
