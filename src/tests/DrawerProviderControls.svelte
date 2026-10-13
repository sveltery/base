<script lang="ts">
	import { findDrawerProvider } from '../lib/drawer/context.svelte.js';

	const provider = findDrawerProvider();
	const manualDrawer = {};
	const missingDrawer = {};
</script>

{#if provider}
	<button onclick={() => provider.setDrawerOpen(manualDrawer, true)}>Register open</button>
	<button onclick={() => provider.setDrawerOpen(manualDrawer, false)}>Register closed</button>
	<button onclick={() => provider.removeDrawer(manualDrawer)}>Remove registered</button>
	<button onclick={() => provider.removeDrawer(missingDrawer)}>Remove missing</button>
	<button onclick={() => provider.setVisualState({ swipeProgress: 0.5, frontmostHeight: 120 })}>
		Set visual state
	</button>
	<button onclick={() => provider.setVisualState({ swipeProgress: 0 })}>Clear progress</button>
	<button onclick={() => provider.setVisualState({ frontmostHeight: 0 })}>Clear height</button>
	<button
		onclick={() =>
			provider.setVisualState({ swipeProgress: Number.NaN, frontmostHeight: Infinity })}
	>
		Set invalid visual state
	</button>
{/if}
