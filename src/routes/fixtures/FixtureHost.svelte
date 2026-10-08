<script lang="ts" generics="Scenario extends string">
	import { onMount, type Component } from 'svelte';

	type MountReference = (
		host: HTMLElement,
		scenario: Scenario,
		onHydrated: () => void
	) => void | (() => void);

	let {
		data,
		Fixture,
		loadReference
	}: {
		data: { reference: boolean; scenario: Scenario };
		Fixture: Component<{ scenario: Scenario }>;
		loadReference: () => Promise<MountReference>;
	} = $props();

	let hydrated = $state(false);
	let host = $state<HTMLDivElement>();

	onMount(() => {
		if (!data.reference) {
			hydrated = true;
			return;
		}
		let cleanup: (() => void) | undefined;
		let stopped = false;
		void loadReference().then((mount) => {
			if (stopped || !host) return;
			const stop = mount(host, data.scenario, () => (hydrated = true));
			cleanup = typeof stop === 'function' ? stop : undefined;
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
		<Fixture scenario={data.scenario} />
	{/if}
</main>
