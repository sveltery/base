<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		scenario = 'bubble',
		children
	}: {
		scenario?: 'bubble' | 'stop' | 'native' | 'native-stop';
		children: Snippet<[(event: MouseEvent) => void, boolean]>;
	} = $props();

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
	{@render children(clicked, native)}
</div>
<output data-testid="parent-clicks">{parentClicks}</output>
