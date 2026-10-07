<script lang="ts">
	import { Fieldset } from '#lib';

	let { custom = false }: { custom?: boolean } = $props();
	let host = $state<HTMLElement | null>(null);

	function capture(node: HTMLElement) {
		host = node;
		return () => {
			host = null;
		};
	}
</script>

{#if custom}
	<Fieldset.Root {@attach capture}>
		{#snippet render(props)}
			<fieldset {...props} class="custom-host">
				<Fieldset.Legend>Legend</Fieldset.Legend>
			</fieldset>
		{/snippet}
	</Fieldset.Root>
{:else}
	<Fieldset.Root class="default-host" {@attach capture}>
		<Fieldset.Legend>Legend</Fieldset.Legend>
	</Fieldset.Root>
{/if}
<output data-testid="host">{host?.className ?? 'none'}</output>
