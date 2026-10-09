<script lang="ts">
	import InternalBackdrop from '../lib/internal/InternalBackdrop.svelte';

	let cutout = $state<HTMLElement | null>(null);
</script>

<div data-testid="scroller" style="height: 40px; overflow: auto">
	<div style="height: 240px">
		<div
			bind:this={cutout}
			data-testid="cutout"
			style="width: 30px; height: 20px; margin-top: 80px"
		></div>
	</div>
</div>
<InternalBackdrop {cutout} data-testid="backdrop" />
