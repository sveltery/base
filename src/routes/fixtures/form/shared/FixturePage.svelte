<!-- A form fixture page: `data-hydrated` once it is live, and its state as JSON in `debug`. -->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	let { debug, children }: { debug: unknown; children: Snippet } = $props();

	let hydrated = $state(false);
	onMount(() => {
		hydrated = true;
	});
</script>

<main data-hydrated={hydrated}>
	{@render children()}
	<pre data-testid="debug">{JSON.stringify(debug ?? null, null, 1)}</pre>
</main>
