<script lang="ts">
	import { useOpenChangeComplete } from '../lib/internal/useOpenChangeComplete.svelte.js';

	let {
		open = false,
		element = null,
		batch = undefined,
		onComplete
	}: {
		open?: boolean;
		element?: HTMLElement | null;
		batch?: boolean;
		onComplete: () => void;
	} = $props();

	useOpenChangeComplete(() => ({
		enabled: true,
		open,
		element,
		onComplete,
		...(batch === undefined ? {} : { batch })
	}));
</script>
