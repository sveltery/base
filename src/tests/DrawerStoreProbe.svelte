<script lang="ts">
	import { untrack } from 'svelte';
	import type { DialogStore } from '../lib/dialog/store.svelte.js';
	import { useDrawerRootState } from '../lib/drawer/root.svelte.js';

	let { onStore }: { onStore: (store: DialogStore<unknown>) => void } = $props();

	const store = useDrawerRootState().store;
	untrack(() => onStore(store));
</script>
