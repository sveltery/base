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
	<Radio.Root value="a" aria-label="Custom" {@attach capture}>
		{#snippet render(props, state: RadioRootState, children)}
			<span {...props} class="custom-host" data-state={state.checked ? 'on' : 'off'}
				>{@render children?.()}</span
			>
		{/snippet}
	</Radio.Root>
{:else}
	<Radio.Root value="a" aria-label="Notifications" class="default-host" {@attach capture} />
{/if}
<output data-testid="host">{host?.tagName ?? 'none'}</output>
