<script lang="ts">
	import { onMount } from 'svelte';
	import DirectionProviderFixture from './DirectionProviderFixture.svelte';

	let { data } = $props();
	let hydrated = $state(false);
	let host = $state<HTMLDivElement>();

	onMount(() => {
		if (!data.reference) {
			hydrated = true;
			return;
		}
		let cleanup: (() => void) | undefined;
		let stopped = false;
		void import('./react-reference.js').then(({ mountDirectionProviderReference }) => {
			if (stopped || !host) return;
			cleanup = mountDirectionProviderReference(host, data.scenario, () => (hydrated = true));
		});
		return () => {
			stopped = true;
			cleanup?.();
		};
	});
</script>

<main data-hydrated={hydrated} data-framework={data.reference ? 'react' : 'svelte'}>
	{#if data.reference}
		<div bind:this={host}></div>
	{:else}
		<DirectionProviderFixture scenario={data.scenario} />
	{/if}
</main>
