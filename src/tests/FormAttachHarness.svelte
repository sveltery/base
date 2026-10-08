<script lang="ts">
	import { Form } from '#lib';

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
	<Form class="from-props" {@attach capture}>
		{#snippet render(props, state, children)}
			<form {...props} data-state-keys={Object.keys(state).length} data-custom="true">
				{@render children?.()}
			</form>
		{/snippet}
		<span>Inside</span>
	</Form>
{:else}
	<Form class="default-host" {@attach capture}>
		<span>Inside</span>
	</Form>
{/if}
<output data-testid="host">{host?.className ?? 'none'}</output>
