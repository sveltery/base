<script lang="ts">
	import { Button } from '#lib';
	import type { ButtonCase } from './cases.js';

	let { scenario }: { scenario: ButtonCase } = $props();

	let clicks = $state<{ detail: number; shiftKey: boolean }[]>([]);
	let moves = $state(0);

	function clicked(event: MouseEvent) {
		clicks.push({ detail: event.detail, shiftKey: event.shiftKey });
	}

	function moved() {
		moves += 1;
	}

	function preventKey(event: KeyboardEvent) {
		if (scenario === 'prevented') event.preventDefault();
	}

	const custom = $derived(
		scenario === 'custom' || scenario === 'custom-disabled' || scenario === 'prevented'
	);
	const label = $derived(scenario === 'link' ? 'Go' : 'Save');
</script>

{#if scenario === 'link'}
	<Button id="tested-button" nativeButton={false} onclick={clicked}>
		{#snippet render(props)}
			<a {...props} href="#target">{label}</a>
		{/snippet}
	</Button>
	<div style="height: 200vh"></div>
{:else if custom}
	<Button
		id="tested-button"
		nativeButton={false}
		disabled={scenario === 'custom-disabled'}
		onclick={clicked}
		onkeydown={preventKey}
		onkeyup={preventKey}
	>
		{#snippet render(props)}
			<span {...props}>{label}</span>
		{/snippet}
	</Button>
{:else}
	<Button
		id="tested-button"
		disabled={scenario === 'disabled' || scenario === 'focusable'}
		focusableWhenDisabled={scenario === 'focusable'}
		onclick={clicked}
		onmousemove={moved}>{label}</Button
	>
{/if}
<output data-testid="clicks">{JSON.stringify(clicks)}</output>
<output data-testid="moves">{moves}</output>
