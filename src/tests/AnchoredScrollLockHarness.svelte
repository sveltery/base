<script lang="ts">
	import { useAnchoredPopupScrollLock } from '#lib/internal/popups/index.js';

	let {
		enabled = false,
		touchOpen = false,
		wide = false
	}: { enabled?: boolean; touchOpen?: boolean; wide?: boolean } = $props();

	let positioner = $state<HTMLElement | null>(null);

	useAnchoredPopupScrollLock(() => ({
		enabled,
		touchOpen,
		positionerElement: positioner,
		referenceElement: positioner
	}));
</script>

<div
	bind:this={positioner}
	data-testid="positioner"
	style:width={wide ? '100vw' : '40px'}
	style:height="20px"
></div>
