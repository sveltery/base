<script lang="ts">
	import { Progress } from '#lib';

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
	<Progress.Root value={33} {@attach capture}>
		<Progress.Track>
			<Progress.Indicator data-testid="indicator">
				{#snippet render(props, state)}
					<span {...props} data-indicator-status={state.status}></span>
				{/snippet}
			</Progress.Indicator>
		</Progress.Track>
	</Progress.Root>
{:else}
	<Progress.Root value={33} class="default-host" {@attach capture}>
		<Progress.Label>Downloading</Progress.Label>
		<Progress.Track>
			<Progress.Indicator data-testid="indicator" />
		</Progress.Track>
	</Progress.Root>
{/if}
<output data-testid="host">{host?.tagName.toLowerCase() ?? 'none'}:{host?.className ?? ''}</output>
