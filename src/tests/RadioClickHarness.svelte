<script lang="ts">
	import { Radio } from '#lib';
	import ClickParent from './ClickParent.svelte';

	let { scenario = 'bubble' }: { scenario?: 'bubble' | 'stop' | 'native' | 'native-stop' } =
		$props();
</script>

<ClickParent {scenario}>
	{#snippet children(clicked, native)}
		{#if native}
			<Radio.Root value="a" nativeButton onclick={clicked}>
				{#snippet render(props)}
					<button {...props}>Radio</button>
				{/snippet}
			</Radio.Root>
		{:else}
			<Radio.Root value="a" onclick={clicked}>Radio</Radio.Root>
		{/if}
	{/snippet}
</ClickParent>
