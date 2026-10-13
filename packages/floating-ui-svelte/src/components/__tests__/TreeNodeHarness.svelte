<script lang="ts">
	import { setFloatingTree, useFloatingNodeId } from '../FloatingTree.svelte.js';
	import type { FloatingTreeStore } from '../FloatingTreeStore.js';
	import DismissNode from '../../hooks/__tests__/DismissNode.svelte';

	let { externalTree, child = true }: { externalTree?: FloatingTreeStore; child?: boolean } =
		$props();

	// svelte-ignore state_referenced_locally
	export const tree = externalTree ?? setFloatingTree();
	// svelte-ignore state_referenced_locally
	export const nodeId = useFloatingNodeId(undefined, externalTree);
</script>

{#if child}
	<DismissNode testId="child" />
{/if}
