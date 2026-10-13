<script lang="ts">
	import type { AriaRole } from 'svelte/elements';
	import { createChangeEventDetails, REASONS, type OpenInteractionType } from '@sveltery/utils';
	import FloatingFocusManager from '../FloatingFocusManager.svelte';
	import FloatingPortal from '../FloatingPortal.svelte';
	import { TestStore } from '../../hooks/__tests__/TestStore.svelte.js';

	let {
		modal = false,
		portalOwnerRole,
		wrapped = false
	}: {
		modal?: boolean;
		portalOwnerRole?: AriaRole;
		/** The floating element is a positioner around a focusable popup with no tabbable content. */
		wrapped?: boolean;
	} = $props();

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

	let returnFocus = $state<true | HTMLElement>(true);

	/** Closes the popup. `returnTo` replaces the return focus target in the same update. */
	export function hide(returnTo?: HTMLElement) {
		if (returnTo) returnFocus = returnTo;
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
		<FloatingFocusManager {store} {modal} {returnFocus}>
			<div data-testid="floating" {@attach store.registerFloating}>
				{#if wrapped}
					<div data-testid="popup" tabindex="-1" data-base-ui-focusable>popup</div>
				{:else}
					<button data-testid="inside">inside</button>
				{/if}
			</div>
		</FloatingFocusManager>
	{/if}
</FloatingPortal>
