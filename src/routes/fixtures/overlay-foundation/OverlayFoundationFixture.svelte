<script lang="ts">
	import OverlayFoundationHarness from '../../../tests/OverlayFoundationHarness.svelte';
	import type { OverlayFoundationCase } from './cases.js';

	let { scenario }: { scenario: OverlayFoundationCase } = $props();
</script>

<OverlayFoundationHarness {scenario} />
