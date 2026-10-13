<script lang="ts">
	import type { AriaRole } from 'svelte/elements';
	import { createChangeEventDetails, REASONS, type OpenInteractionType } from '@sveltery/utils';
	import FloatingFocusManager from '../FloatingFocusManager.svelte';
	import FloatingPortal from '../FloatingPortal.svelte';
	import { TestStore } from '../../hooks/__tests__/TestStore.svelte.js';

	let { modal = false, portalOwnerRole }: { modal?: boolean; portalOwnerRole?: AriaRole } =
		$props();

	export const store = new TestStore();
	let reference = $state<HTMLButtonElement | null>(null);

	/** Opens the popup as an interaction of `method` would. `null` is a programmatic open. */
	export function show(method: OpenInteractionType | null) {
		store.openMethod = method;
		store.setOpen(
			true,
			createChangeEventDetails(REASONS.imperativeAction, undefined, reference ?? undefined)
		);
	}

	export function hide() {
		store.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
		store.openMethod = null;
	}
</script>

<button data-testid="before">before</button>
<button data-testid="reference" bind:this={reference} {@attach store.registerTrigger}>
	reference
</button>
<button data-testid="after">after</button>
<FloatingPortal {store} {portalOwnerRole}>
	{#if store.open}
		<FloatingFocusManager {store} {modal}>
			<div data-testid="floating" {@attach store.registerFloating}>
				<button data-testid="inside">inside</button>
			</div>
		</FloatingFocusManager>
	{/if}
</FloatingPortal>
