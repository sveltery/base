<script lang="ts">
	import { Checkbox } from '#lib';
	import ClickParent from './ClickParent.svelte';

	let { scenario = 'bubble' }: { scenario?: 'bubble' | 'stop' } = $props();
</script>

<ClickParent {scenario}>
	{#snippet children(clicked)}
		<Checkbox.Root
			aria-label="Checkbox"
			style="display: inline-block; width: 16px; height: 16px"
			onclick={clicked}
		/>
	{/snippet}
</ClickParent>
