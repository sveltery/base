<script lang="ts">
	import AnchoredPopupHarness from '../../../tests/AnchoredPopupHarness.svelte';
	import OverlayFoundationHarness from '../../../tests/OverlayFoundationHarness.svelte';
	import type { OverlayFoundationCase } from './cases.js';

	let { scenario }: { scenario: OverlayFoundationCase } = $props();
</script>

{#if scenario === 'placed' || scenario === 'hover'}
	<AnchoredPopupHarness {scenario} />
{:else}
	<OverlayFoundationHarness {scenario} />
{/if}
