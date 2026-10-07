<script lang="ts">
	import { Radio } from '#lib';

	let { scenario = 'bubble' }: { scenario?: 'bubble' | 'stop' | 'native' | 'native-stop' } =
		$props();

	let parentClicks = $state(0);
	const stop = $derived(scenario === 'stop' || scenario === 'native-stop');
	const native = $derived(scenario === 'native' || scenario === 'native-stop');

	function clicked(event: MouseEvent) {
		if (stop) event.stopPropagation();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div data-testid="parent" onclick={() => (parentClicks += 1)}>
	{#if native}
		<Radio.Root value="a" nativeButton onclick={clicked}>
			{#snippet render(props)}
				<button {...props}>Radio</button>
			{/snippet}
		</Radio.Root>
	{:else}
		<Radio.Root value="a" onclick={clicked}>Radio</Radio.Root>
	{/if}
</div>
<output data-testid="parent-clicks">{parentClicks}</output>
