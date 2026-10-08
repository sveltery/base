<script lang="ts">
	import { Checkbox } from '#lib';
	import ClickParent from './ClickParent.svelte';

	let { scenario = 'bubble' }: { scenario?: 'bubble' | 'stop' | 'native' | 'native-stop' } =
		$props();
</script>

<ClickParent {scenario}>
	{#snippet children(clicked, native)}
		{#if native}
			<Checkbox.Root nativeButton onclick={clicked}>
				{#snippet render(props)}
					<button {...props}>Checkbox</button>
				{/snippet}
			</Checkbox.Root>
		{:else}
			<Checkbox.Root onclick={clicked}>Checkbox</Checkbox.Root>
		{/if}
	{/snippet}
</ClickParent>
