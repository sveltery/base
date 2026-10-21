<script lang="ts">
	import { Switch } from '#lib';
	import ClickParent from './ClickParent.svelte';

	let { scenario = 'bubble' }: { scenario?: 'bubble' | 'stop' } = $props();
</script>

<ClickParent {scenario}>
	{#snippet children(clicked)}
		<Switch.Root
			aria-label="Switch"
			style="display: inline-block; width: 16px; height: 16px"
			onclick={clicked}
		/>
	{/snippet}
</ClickParent>
