<script lang="ts">
	import { Checkbox, type CheckboxRootState } from '#lib';

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
	<Checkbox.Root {@attach capture}>
		{#snippet render(props, state: CheckboxRootState)}
			<span {...props} class="custom-host" data-state={state.checked ? 'on' : 'off'}>Custom</span>
		{/snippet}
	</Checkbox.Root>
{:else}
	<Checkbox.Root class="default-host" {@attach capture}>Notifications</Checkbox.Root>
{/if}
<output data-testid="host">{host?.className ?? 'none'}</output>
