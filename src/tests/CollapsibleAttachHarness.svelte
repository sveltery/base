<script lang="ts">
	import { Collapsible } from '#lib';

	let { custom = false }: { custom?: boolean } = $props();
	let host = $state<HTMLElement | null>(null);

	function capture(node: HTMLElement) {
		host = node;
		return () => {
			if (host === node) host = null;
		};
	}
</script>

{#if custom}
	<Collapsible.Root class="from-props" {@attach capture}>
		{#snippet render(props, state, children)}
			<div {...props} data-open-state={state.open} data-custom="true">
				{@render children()}
			</div>
		{/snippet}
		<Collapsible.Trigger>
			{#snippet render(props, state, children)}
				<button {...props} data-panel-open={state.open}>
					{@render children()}
				</button>
			{/snippet}
			Trigger
		</Collapsible.Trigger>
		<Collapsible.Panel>
			{#snippet render(props, state, children)}
				<div {...props} data-panel-phase={state.transitionStatus ?? 'closed'}>
					{@render children()}
				</div>
			{/snippet}
			Panel
		</Collapsible.Panel>
	</Collapsible.Root>
{:else}
	<Collapsible.Root class="default-host" {@attach capture}>
		<Collapsible.Trigger>Trigger</Collapsible.Trigger>
		<Collapsible.Panel>Panel</Collapsible.Panel>
	</Collapsible.Root>
{/if}
<output data-testid="host">{host?.className ?? 'none'}</output>
