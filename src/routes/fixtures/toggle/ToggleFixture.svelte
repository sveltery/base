<script lang="ts">
	import { untrack } from 'svelte';
	import { Toggle, type ToggleChangeEventDetails } from '#lib';
	import type { ToggleCase } from './cases.js';

	let { scenario }: { scenario: ToggleCase } = $props();

	let owner = $state(false);
	let calls = $state<{ pressed: boolean; reason: string; canceled: boolean }[]>([]);
	const controlled = untrack(() => scenario === 'controlled');

	function changed(pressed: boolean, details: ToggleChangeEventDetails) {
		if (scenario === 'cancel') details.cancel();
		calls.push({ pressed, reason: details.reason, canceled: details.isCanceled });
	}
</script>

{#if controlled}
	<input type="checkbox" aria-label="Owner pressed" bind:checked={owner} />
{/if}
<Toggle
	id="tested-toggle"
	pressed={controlled ? owner : undefined}
	disabled={scenario === 'disabled'}
	onPressedChange={changed}
	onclick={(event) => {
		if (scenario === 'prevent-base') event.preventBaseUIHandler();
	}}>Bold</Toggle
>
<output data-testid="calls">{JSON.stringify(calls)}</output>
