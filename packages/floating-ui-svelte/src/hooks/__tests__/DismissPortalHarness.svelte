<script lang="ts">
	import DismissNode from './DismissNode.svelte';

	let { inBox = false }: { inBox?: boolean } = $props();
	let box = $state<HTMLElement>();
</script>

<div data-testid="box" bind:this={box}></div>
<DismissNode testId="outer" open portaled>
	<DismissNode testId="inner" portaled freshTree container={inBox ? box : undefined}>
		<button>test button</button>
	</DismissNode>
</DismissNode>
