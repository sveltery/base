<script lang="ts">
	import type { AriaRole } from 'svelte/elements';
	import { createChangeEventDetails, REASONS, type OpenInteractionType } from '@sveltery/utils';
	import FloatingFocusManager from '../FloatingFocusManager.svelte';
	import FloatingPortal from '../FloatingPortal.svelte';
	import { TestStore } from '../../hooks/__tests__/TestStore.svelte.js';

	let {
		modal = false,
		portalOwnerRole,
		wrapped = false,
		returnUnlessOutsidePress = false,
		keepMounted = false,
		container,
		returnFocus: returnFocusProp
	}: {
		modal?: boolean;
		portalOwnerRole?: AriaRole;
		/** The floating element is a positioner around a focusable popup with no tabbable content. */
		wrapped?: boolean;
		returnUnlessOutsidePress?: boolean;
		/** The popup stays mounted after a close until `unmount`, as during an exit animation. */
		keepMounted?: boolean;
		container?: HTMLElement;
		/** Replaces the harness's own return focus value. */
		returnFocus?: (closeType: OpenInteractionType | null) => HTMLElement | null;
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

	let returnTo = $state<true | HTMLElement>(true);
	// A consumer that decides from the close reason, as Menu does after an outside press.
	const returnFocus = $derived(
		returnFocusProp ??
			(returnUnlessOutsidePress ? store.lastReason !== REASONS.outsidePress : returnTo)
	);

	/** Closes the popup. `target` replaces the return focus target in the same update. */
	export function hide(target?: HTMLElement) {
		if (target) returnTo = target;
		store.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
		store.openMethod = null;
	}

	/** Closes the popup as `reason` would, from `event` and an optional `trigger` element. */
	export function close(reason: string, event: Event, trigger?: Element) {
		store.setOpen(false, createChangeEventDetails(reason, event, trigger));
	}

	let mounted = $state(false);
	$effect.pre(() => {
		if (store.open) mounted = true;
	});

	/** Ends a `keepMounted` exit. */
	export function unmount() {
		mounted = false;
	}
</script>

<button data-testid="before">before</button>
<button data-testid="reference" bind:this={reference} {@attach store.registerTrigger}>
	reference
</button>
<button data-testid="after">after</button>
<FloatingPortal {store} {portalOwnerRole} {container}>
	{#if store.open || (keepMounted && mounted)}
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
