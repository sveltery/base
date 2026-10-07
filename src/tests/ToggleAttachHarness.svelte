<script lang="ts">
	import { Toggle } from '#lib';

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
	<Toggle {@attach capture}>
		{#snippet render(props, state)}
			<button {...props} class="custom-host" data-state={state.pressed ? 'on' : 'off'}
				>Custom</button
			>
		{/snippet}
	</Toggle>
{:else}
	<Toggle class="default-host" {@attach capture}>Bold</Toggle>
{/if}
<output data-testid="host">{host?.className ?? 'none'}</output>
