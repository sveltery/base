<script lang="ts">
	import { DelayGroupMember } from '../../components/delay-group.svelte.js';
	import { HoverReferenceInteraction } from '../useHoverReferenceInteraction.svelte.js';
	import { TestStore } from './TestStore.svelte.js';

	let { label }: { label: string } = $props();

	const store = new TestStore();
	const member = new DelayGroupMember(store, () => ({ open: store.open }));
	const hover = new HoverReferenceInteraction(store, () => ({ delay: () => member.delay }));
</script>

<button
	data-testid="reference-{label}"
	data-instant-phase={member.isInstantPhase ? '' : undefined}
	data-has-provider={member.hasProvider}
	{...hover.reference}
	{@attach store.registerTrigger}
>
	{label}
</button>
{#if store.open}
	<div data-testid="floating-{label}">{label}</div>
{/if}
