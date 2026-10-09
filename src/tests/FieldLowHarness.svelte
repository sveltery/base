<script lang="ts">
	import { Field, Form } from '#lib';
	import FieldReleaseProbe from './FieldReleaseProbe.svelte';
	import InertFieldProbe from './InertFieldProbe.svelte';

	let { scenario = 'inert' }: { scenario?: 'inert' | 'release' } = $props();

	let show = $state(true);
	let seen = $state(-1);
</script>

{#if scenario === 'inert'}
	<InertFieldProbe />
	<Field.Control data-testid="control" />
{:else}
	<button type="button" onclick={() => (show = false)}>Hide</button>
	<output data-testid="seen">{seen}</output>
	<Form>
		{#if show}
			<FieldReleaseProbe bind:seen />
		{/if}
	</Form>
{/if}
