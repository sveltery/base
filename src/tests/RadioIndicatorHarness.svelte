<script lang="ts">
	import { untrack } from 'svelte';
	import { Radio } from '#lib';

	let {
		keepMounted = false,
		count = 1,
		css = '',
		indicatorClass = '',
		initiallyChecked = false
	}: {
		keepMounted?: boolean;
		count?: number;
		css?: string;
		indicatorClass?: string;
		initiallyChecked?: boolean;
	} = $props();

	let value = $state(untrack(() => (initiallyChecked ? '' : 'off')));
</script>

{#if css}
	<svelte:element this={"style"}>{css}</svelte:element>
{/if}
<button type="button" onclick={() => (value = value === '' ? 'off' : '')}>Toggle</button>
{#each Array.from({ length: count }, (_, index) => index) as index (index)}
	<Radio.Root {value}>
		<Radio.Indicator
			data-testid={count === 1 ? 'indicator' : `indicator-${index}`}
			class={indicatorClass}
			{keepMounted}
		/>
	</Radio.Root>
{/each}
