<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setFloatingPopupScope } from '../../components/FloatingPortal.svelte';
	import type { FloatingRootStore } from '../../components/FloatingRootStore.svelte.js';

	let { store, children }: { store: FloatingRootStore; children: Snippet } = $props();

	// svelte-ignore state_referenced_locally
	setFloatingPopupScope(store);
</script>

{@render children()}
