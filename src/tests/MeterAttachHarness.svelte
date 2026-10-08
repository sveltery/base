<script lang="ts">
	import { Meter } from '#lib';

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
	<Meter.Root value={25} class="from-props" {@attach capture}>
		{#snippet render(props, state, children)}
			<div {...props} data-state-keys={Object.keys(state).length} data-custom="true">
				{@render children?.()}
			</div>
		{/snippet}
		<Meter.Label>Level</Meter.Label>
	</Meter.Root>
{:else}
	<Meter.Root value={25} class="default-host" {@attach capture}>
		<Meter.Label>Level</Meter.Label>
	</Meter.Root>
{/if}
<output data-testid="host">{host?.className ?? 'none'}</output>
