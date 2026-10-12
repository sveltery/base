<script lang="ts">
	import { CSPProvider, Slider } from '#lib';

	let { nonce, provider = true }: { nonce?: string; provider?: boolean } = $props();
</script>

{#snippet slider()}
	<Slider.Root defaultValue={30} thumbAlignment="edge">
		<Slider.Control>
			<Slider.Track>
				<Slider.Thumb />
			</Slider.Track>
		</Slider.Control>
	</Slider.Root>
{/snippet}

{#if provider}
	<CSPProvider {nonce}>{@render slider()}</CSPProvider>
{:else}
	{@render slider()}
{/if}
