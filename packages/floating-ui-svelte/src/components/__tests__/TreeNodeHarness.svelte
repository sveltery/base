<script lang="ts">
	import { setFloatingTree, useFloatingNodeId } from '../FloatingTree.svelte.js';
	import type { FloatingTreeStore } from '../FloatingTreeStore.js';
	import DismissNode from '../../hooks/__tests__/DismissNode.svelte';
	import TreeNodeHarness from './TreeNodeHarness.svelte';

	let {
		externalTree,
		child = true,
		fresh = false,
		freshChild = false
	}: {
		externalTree?: FloatingTreeStore;
		child?: boolean;
		fresh?: boolean;
		/** Renders a nested harness that starts its own tree. */
		freshChild?: boolean;
	} = $props();

	// svelte-ignore state_referenced_locally
	export const tree = externalTree ?? setFloatingTree({ fresh });
	// svelte-ignore state_referenced_locally
	export const nodeId = useFloatingNodeId(undefined, externalTree);

	let inner = $state<TreeNodeHarness>();
	export const getInner = () => inner;
</script>

{#if child}
	<DismissNode testId="child" />
{/if}
{#if freshChild}
	<TreeNodeHarness fresh child bind:this={inner} />
{/if}
