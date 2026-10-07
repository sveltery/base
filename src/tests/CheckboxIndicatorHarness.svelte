<script lang="ts">
	import { Checkbox } from '#lib';

	let {
		checked = $bindable(false),
		indeterminate = false,
		keepMounted = false,
		count = 1,
		css = '',
		indicatorClass = ''
	}: {
		checked?: boolean;
		indeterminate?: boolean;
		keepMounted?: boolean;
		count?: number;
		css?: string;
		indicatorClass?: string;
	} = $props();
</script>

{#if css}
	<svelte:element this={"style"}>{css}</svelte:element>
{/if}
<button type="button" onclick={() => (checked = !checked)}>Toggle</button>
{#each Array.from({ length: count }, (_, index) => index) as index (index)}
	<Checkbox.Root bind:checked {indeterminate}>
		<Checkbox.Indicator
			data-testid={count === 1 ? 'indicator' : `indicator-${index}`}
			class={indicatorClass}
			{keepMounted}
		/>
	</Checkbox.Root>
{/each}
