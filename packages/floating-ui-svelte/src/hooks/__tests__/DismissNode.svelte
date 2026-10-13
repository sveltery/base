<script lang="ts">
	import type { Snippet } from 'svelte';
	import { DismissInteraction, type UseDismissProps } from '../useDismiss.svelte.js';
	import { setFloatingTree, useFloatingNodeId } from '../../components/FloatingTree.svelte.js';
	import { TestStore } from './TestStore.svelte.js';

	let {
		testId,
		open = false,
		bubbles,
		children
	}: {
		testId: string;
		open?: boolean;
		bubbles?: UseDismissProps['bubbles'];
		children?: Snippet;
	} = $props();

	setFloatingTree();
	const store = new TestStore();
	// svelte-ignore state_referenced_locally
	store.open = open;
	useFloatingNodeId(store);
	const dismiss = new DismissInteraction(store, () => ({ bubbles }));
</script>

<button onclick={() => (store.open = true)}>open {testId}</button>
{#if store.open}
	<div data-testid={testId} {...dismiss.floating} {@attach store.registerFloating}>
		{@render children?.()}
	</div>
{/if}
