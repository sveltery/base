<script lang="ts">
	import { Toggle, type ToggleChangeEventDetails } from '#lib';
	import type { ToggleCase } from './cases.js';

	let { scenario }: { scenario: ToggleCase } = $props();

	let owner = $state(false);
	let calls = $state<{ pressed: boolean; reason: string; canceled: boolean }[]>([]);

	function changed(pressed: boolean, details: ToggleChangeEventDetails) {
		if (scenario === 'cancel') details.cancel();
		calls.push({ pressed, reason: details.reason, canceled: details.isCanceled });
	}

	function clicked(event: MouseEvent) {
		if (scenario === 'prevented') event.preventDefault();
	}
</script>

{#if scenario === 'bound'}
	<input type="checkbox" aria-label="Owner pressed" bind:checked={owner} />
	<Toggle id="tested-toggle" bind:pressed={owner} onPressedChange={changed}>Bold</Toggle>
{:else}
	<Toggle
		id="tested-toggle"
		disabled={scenario === 'disabled'}
		onPressedChange={changed}
		onclick={clicked}>Bold</Toggle
	>
{/if}
<output data-testid="calls">{JSON.stringify(calls)}</output>
