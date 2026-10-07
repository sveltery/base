<script lang="ts">
	import { Radio, type RadioRootState } from '#lib';

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
	<Radio.Root value="" {@attach capture}>
		{#snippet render(props, state: RadioRootState)}
			<span {...props} class="custom-host" data-state={state.checked ? 'on' : 'off'}>Custom</span>
		{/snippet}
	</Radio.Root>
{:else}
	<Radio.Root value="a" class="default-host" {@attach capture}>Notifications</Radio.Root>
{/if}
<output data-testid="host">{host?.className ?? 'none'}</output>
