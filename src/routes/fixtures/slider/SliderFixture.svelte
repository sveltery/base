<script lang="ts">
	import { Slider } from '#lib';
	import type { SliderCase } from './cases.js';

	let { scenario }: { scenario: SliderCase } = $props();

	let value = $state(30);
</script>

{#if scenario === 'plain'}
	<Slider.Root locale="en-US" defaultValue={30} data-testid="root">
		<Slider.Control data-testid="control">
			<Slider.Thumb />
		</Slider.Control>
	</Slider.Root>
{:else if scenario === 'labelled'}
	<Slider.Root locale="en-US" defaultValue={30} data-testid="root">
		<Slider.Label data-testid="label">Volume</Slider.Label>
		<Slider.Control>
			<Slider.Thumb />
		</Slider.Control>
	</Slider.Root>
{:else if scenario === 'range'}
	<Slider.Root locale="en-US" defaultValue={[40, 65]}>
		<Slider.Value data-testid="value" />
		<Slider.Control>
			<Slider.Thumb index={0} />
			<Slider.Thumb index={1} />
		</Slider.Control>
	</Slider.Root>
{:else if scenario === 'bound'}
	<Slider.Root locale="en-US" bind:value>
		<Slider.Control>
			<Slider.Thumb />
		</Slider.Control>
	</Slider.Root>
	<output data-testid="value">{value}</output>
{:else if scenario === 'disabled'}
	<Slider.Root locale="en-US" defaultValue={30} disabled data-testid="root">
		<Slider.Control>
			<Slider.Thumb />
		</Slider.Control>
	</Slider.Root>
{:else}
	<Slider.Root locale="en-US" orientation="vertical" defaultValue={30}>
		<Slider.Control>
			<Slider.Thumb />
		</Slider.Control>
	</Slider.Root>
{/if}
