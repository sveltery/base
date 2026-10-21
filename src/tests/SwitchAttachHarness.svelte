<script lang="ts">
	import { Switch } from '#lib';

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
	<Switch.Root {@attach capture}>
		{#snippet render(props, state, children)}
			<span {...props} class="custom-host" data-state={state.checked ? 'on' : 'off'}
				>{@render children?.()}</span
			>
		{/snippet}
	</Switch.Root>
{:else}
	<Switch.Root class="default-host" {@attach capture}>Notifications</Switch.Root>
{/if}
<output data-testid="host">{host?.tagName ?? 'none'}</output>
