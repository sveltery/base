<!--
	Dismiss and cursor tracking for one tooltip root.
	Derived from the TooltipInteractions part of Base UI v1.9.0
	packages/react/src/tooltip/root/TooltipRoot.tsx and the `referencePress` option of
	packages/react/src/floating-ui-react/hooks/useDismiss.ts
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The shared DismissInteraction has no `referencePress`, so the trigger press close lives here.
	The trigger's own pointerdown handler runs first and records its `closeOnClick`.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createChangeEventDetails, REASONS } from '@sveltery/utils';
	import { ClientPointInteraction, DismissInteraction } from '@sveltery/floating-ui-svelte';
	import { mergeProps } from '../internal/mergeProps.js';
	import type { TooltipStore } from './store.svelte.js';
	import type { TrackCursorAxis } from './types.js';

	let {
		store,
		disabled,
		trackCursorAxis
	}: { store: TooltipStore; disabled: boolean; trackCursorAxis: TrackCursorAxis } = $props();

	const owner = untrack(() => store);
	const dismiss = new DismissInteraction(owner, () => ({ enabled: !disabled }));
	const clientPoint = new ClientPointInteraction(owner, () => ({
		enabled: !disabled && trackCursorAxis !== 'none',
		axis: trackCursorAxis === 'none' ? undefined : trackCursorAxis,
		setReference: (reference) => {
			owner.positionReference = reference;
		}
	}));

	function closeOnReferencePress(event: MouseEvent | PointerEvent) {
		if (disabled || !owner.closeOnClick) return;
		owner.setOpen(false, createChangeEventDetails(REASONS.triggerPress, event));
	}

	const triggerProps = mergeProps(clientPoint.reference, dismiss.reference, {
		onpointerdown: closeOnReferencePress,
		onclick: closeOnReferencePress
	}) as HTMLAttributes<HTMLElement>;

	$effect(() => {
		owner.rootTriggerProps = triggerProps;
		owner.popupProps = dismiss.floating as HTMLAttributes<HTMLElement>;
		return () => {
			if (owner.rootTriggerProps === triggerProps) owner.rootTriggerProps = undefined;
			owner.popupProps = undefined;
		};
	});
</script>
