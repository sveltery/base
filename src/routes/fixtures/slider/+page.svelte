<script lang="ts">
	import { onMount } from 'svelte';
	import SliderFixture from './SliderFixture.svelte';

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
		void import('./react-reference.js').then(({ mountSliderReference }) => {
			if (stopped || !host) return;
			cleanup = mountSliderReference(host, data.scenario, () => (hydrated = true));
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
		<SliderFixture scenario={data.scenario} />
	{/if}
</main>
