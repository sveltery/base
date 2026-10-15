<script lang="ts">
	import { CSPProvider, Tabs } from '#lib';

	let {
		nonce,
		provider = true,
		renderBeforeHydration = true
	}: {
		nonce?: string;
		provider?: boolean;
		renderBeforeHydration?: boolean;
	} = $props();
</script>

{#snippet root()}
	<Tabs.Root value="one">
		<Tabs.List>
			<Tabs.Tab value="one">One</Tabs.Tab>
			<Tabs.Indicator {renderBeforeHydration} />
		</Tabs.List>
	</Tabs.Root>
{/snippet}

{#if provider}
	<CSPProvider {nonce}>{@render root()}</CSPProvider>
{:else}
	{@render root()}
{/if}
