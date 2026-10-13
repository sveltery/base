<script lang="ts">
	import { createChangeEventDetails } from '@sveltery/utils';
	import { ClientPointInteraction } from '../useClientPoint.svelte.js';
	import { TestStore } from './TestStore.svelte.js';

	let {
		enabled = true,
		axis,
		registerReference = true
	}: {
		enabled?: boolean;
		axis?: 'x' | 'y' | 'both';
		registerReference?: boolean;
	} = $props();

	export const store = new TestStore();

	const clientPoint = new ClientPointInteraction(store, () => ({
		enabled,
		axis,
		setReference: (reference) => (store.positionReference = reference)
	}));
</script>

<div
	data-testid="reference"
	style="position: fixed; left: 0; top: 0; width: 0; height: 0"
	{...clientPoint.reference}
	{@attach registerReference ? store.registerTrigger : undefined}
>
	Reference
</div>
{#if store.open}
	<div data-testid="floating" {@attach store.registerFloating}>Floating</div>
{/if}
<button data-testid="toggle" onclick={() => (store.open = !store.open)}>toggle</button>
<button
	data-testid="focus-open"
	onclick={() =>
		store.setOpen(
			true,
			createChangeEventDetails(
				'trigger-focus',
				new FocusEvent('focus'),
				store.domReferenceElement ?? undefined
			)
		)}
>
	focus open
</button>
