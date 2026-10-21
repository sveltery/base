<script lang="ts">
	import { Radio } from '#lib';
	import ClickParent from './ClickParent.svelte';

	let { scenario = 'bubble' }: { scenario?: 'bubble' | 'stop' } = $props();
</script>

<ClickParent {scenario}>
	{#snippet children(clicked)}
		<Radio.Root
			value="a"
			aria-label="Radio"
			style="display: inline-block; width: 16px; height: 16px"
			onclick={clicked}
		/>
	{/snippet}
</ClickParent>
