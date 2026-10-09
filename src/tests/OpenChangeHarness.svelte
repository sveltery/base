<script lang="ts">
	import { useOpenChangeComplete } from '../lib/internal/useOpenChangeComplete.svelte.js';

	let {
		open = false,
		element = null,
		onComplete
	}: {
		open?: boolean;
		element?: HTMLElement | null;
		onComplete: () => void;
	} = $props();

	useOpenChangeComplete(() => ({
		enabled: true,
		open,
		element,
		onComplete
	}));
</script>
