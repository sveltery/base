<script lang="ts">
	import { CSPProvider, Slider } from '#lib';

	let {
		nonce,
		provider = true,
		thumbAlignment = 'edge',
		range = false
	}: {
		nonce?: string;
		provider?: boolean;
		thumbAlignment?: 'center' | 'edge' | 'edge-client-only';
		range?: boolean;
	} = $props();
</script>

{#snippet slider()}
	<Slider.Root defaultValue={range ? [20, 40] : 30} {thumbAlignment}>
		<Slider.Control>
			<Slider.Track>
				{#if range}
					<Slider.Thumb index={0} data-testid="thumb-0" />
					<Slider.Thumb index={1} data-testid="thumb-1" />
				{:else}
					<Slider.Thumb />
				{/if}
			</Slider.Track>
		</Slider.Control>
	</Slider.Root>
{/snippet}

{#if provider}
	<CSPProvider {nonce}>{@render slider()}</CSPProvider>
{:else}
	{@render slider()}
{/if}
