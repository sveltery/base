<script lang="ts">
	import { Separator } from '#lib';

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
	<Separator orientation="vertical" {@attach capture}>
		{#snippet render(props, state)}
			<div {...props} class="custom-host" data-state={state.orientation}>Custom</div>
		{/snippet}
	</Separator>
{:else}
	<Separator class="default-host" {@attach capture} />
{/if}
<output data-testid="host">{host?.className ?? 'none'}</output>
