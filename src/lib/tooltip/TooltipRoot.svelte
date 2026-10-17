<!--
	Groups all parts of the tooltip.
	Doesn't render its own HTML element.
	Derived from Base UI v1.9.0 packages/react/src/tooltip/root/TooltipRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`close` and `unmount` are exports. Bind the root with `bind:this`.
	The payload reset effect is not needed: the payload is read from the active trigger.
-->
<script lang="ts" generics="Payload = unknown">
	import { untrack } from 'svelte';
	import { createChangeEventDetails, REASONS } from '@sveltery/utils';
	import { useFloatingParentNodeId } from '@sveltery/floating-ui-svelte';
	import { setTooltipRoot } from './context.svelte.js';
	import { TooltipStore } from './store.svelte.js';
	import TooltipRootInteractions from './TooltipRootInteractions.svelte';
	import type { TooltipInstant, TooltipRootProps } from './types.js';

	let {
		open = $bindable(),
		defaultOpen,
		onOpenChange,
		onOpenChangeComplete,
		disabled = false,
		disableHoverablePopup = false,
		trackCursorAxis = 'none',
		triggerId = $bindable(),
		defaultTriggerId,
		handle,
		children
	}: TooltipRootProps<Payload> = $props();
	// svelte-ignore state_referenced_locally
	if (open === undefined && defaultOpen !== undefined) open = defaultOpen;
	// svelte-ignore state_referenced_locally
	if (triggerId === undefined && defaultTriggerId !== undefined) triggerId = defaultTriggerId;

	const uid = $props.id();
	const nested = useFloatingParentNodeId() != null;

	const store = new TooltipStore({
		readOpen: () => open,
		writeOpen: (next) => {
			open = next;
		},
		floatingId: `base-ui-${uid}`,
		nested,
		readSettings: () => ({ disabled, trackCursorAxis, disableHoverablePopup }),
		readTriggerId: () => triggerId ?? null,
		writeTriggerId: (id) => {
			triggerId = id;
		},
		onOpenChange: () => onOpenChange as TooltipRootProps['onOpenChange'],
		onOpenChangeComplete: () => onOpenChangeComplete
	});
	setTooltipRoot(store);

	$effect(() => {
		const current = handle;
		if (!current) return;
		return current.attach(store);
	});

	$effect.pre(() => {
		if (open === true && disabled) {
			untrack(() => store.setOpen(false, createChangeEventDetails(REASONS.disabled)));
		}
	});

	// Skip animations while moving between triggers of a delay group, and while closing because a
	// neighbour opened. Restore the previous instant type afterwards.
	let previousInstant: TooltipInstant | undefined | null = null;
	$effect(() => {
		const status = store.transitionStatus;
		const instant = store.instantType;
		const delayed =
			(status === 'ending' && store.openChangeReason === REASONS.none) ||
			(status !== 'ending' && store.isInstantPhase);
		if (delayed) {
			if (instant !== 'delay') previousInstant = instant;
			store.instantType = 'delay';
		} else if (previousInstant !== null) {
			store.instantType = previousInstant;
			previousInstant = null;
		}
	});

	const shouldRenderInteractions = $derived(
		store.open || store.mounted || (!disabled && trackCursorAxis !== 'none')
	);

	export function close() {
		store.closeImperative();
	}

	export function unmount() {
		store.forceUnmount();
	}
</script>

{#if shouldRenderInteractions}
	<TooltipRootInteractions {store} {disabled} {trackCursorAxis} />
{/if}
{@render children?.({ payload: store.payload as Payload | undefined })}
