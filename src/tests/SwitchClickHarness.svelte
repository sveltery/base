<script lang="ts">
	import { Switch } from '#lib';
	import ClickParent from './ClickParent.svelte';

	let { scenario = 'bubble' }: { scenario?: 'bubble' | 'stop' | 'native' | 'native-stop' } =
		$props();
</script>

<ClickParent {scenario}>
	{#snippet children(clicked, native)}
		{#if native}
			<Switch.Root nativeButton onclick={clicked}>
				{#snippet render(props)}
					<button {...props}>Switch</button>
				{/snippet}
			</Switch.Root>
		{:else}
			<Switch.Root onclick={clicked}>Switch</Switch.Root>
		{/if}
	{/snippet}
</ClickParent>
