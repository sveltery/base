<!--
	Hover, focus, and inline-rect handlers for one live preview card store.
	The trigger link stays mounted. This part appears once that store exists,
	so hover state is written on the store and not on a detached stand-in.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import {
		FocusInteraction,
		HoverReferenceInteraction,
		safePolygon
	} from '@sveltery/floating-ui-svelte';
	import { getInlineRectTriggerProps } from './inline-rect.js';
	import type { PreviewCardStore } from './store.svelte.js';
	import type { TriggerArmed } from './trigger-armed.js';

	let {
		store,
		delay,
		closeDelay,
		isOpen,
		onArmed
	}: {
		store: PreviewCardStore;
		delay: number;
		closeDelay: number;
		isOpen: () => boolean;
		onArmed: (next: TriggerArmed | null) => void;
	} = $props();

	const owner = untrack(() => store);
	// One polygon per trigger. The options getter runs on every event.
	const handleClose = safePolygon();
	const hover = new HoverReferenceInteraction(owner, () => ({
		mouseOnly: true,
		move: false,
		handleClose,
		delay: () => ({ open: delay, close: closeDelay }),
		placement: () => owner.readPlacement()
	}));
	const focus = new FocusInteraction(owner, () => ({ delay: () => delay }));
	const inline = getInlineRectTriggerProps(owner.inlineHover, () => isOpen());

	$effect(() => {
		untrack(() =>
			onArmed({
				hover: hover.reference,
				focus: focus.reference,
				inline,
				attach: hover.attachReference
			})
		);
		return () => untrack(() => onArmed(null));
	});
</script>
