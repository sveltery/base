<script lang="ts">
	import type { Snippet } from 'svelte';
	import { DismissInteraction, type UseDismissProps } from '../useDismiss.svelte.js';
	import FloatingPortal from '../../components/FloatingPortal.svelte';
	import { setFloatingTree, useFloatingNodeId } from '../../components/FloatingTree.svelte.js';
	import { TestStore } from './TestStore.svelte.js';

	let {
		testId,
		open = false,
		bubbles,
		portaled = false,
		freshTree = false,
		children
	}: {
		testId: string;
		open?: boolean;
		bubbles?: UseDismissProps['bubbles'];
		portaled?: boolean;
		freshTree?: boolean;
		children?: Snippet;
	} = $props();

	// svelte-ignore state_referenced_locally
	setFloatingTree({ fresh: freshTree });
	const store = new TestStore();
	// svelte-ignore state_referenced_locally
	store.open = open;
	useFloatingNodeId(store);
	const dismiss = new DismissInteraction(store, () => ({ bubbles }));
</script>

<button onclick={() => (store.open = true)}>open {testId}</button>
{#snippet popup()}
	<div data-testid={testId} {...dismiss.floating} {@attach store.registerFloating}>
		{@render children?.()}
	</div>
{/snippet}

{#if store.open}
	{#if portaled}
		<FloatingPortal {store} data-testid="{testId}-portal">{@render popup()}</FloatingPortal>
	{:else}
		{@render popup()}
	{/if}
{/if}
