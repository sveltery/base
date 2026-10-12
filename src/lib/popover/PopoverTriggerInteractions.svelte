<!--
	Click, hover, and focus-guard handlers for one live popover store.
	The trigger button stays mounted. This part appears once that store exists,
	so hover state is written on the store and not on a detached stand-in.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { REASONS } from '@sveltery/utils';
	import {
		safePolygon,
		ClickInteraction,
		useHoverReferenceInteraction
	} from '@sveltery/floating-ui-svelte';
	import { TriggerFocusGuards } from '../internal/popups/index.js';
	import type { PopoverStore } from './store.svelte.js';
	import type { TriggerArmed } from './trigger-armed.js';

	let {
		store,
		disabled,
		openOnHover,
		delay,
		closeDelay,
		triggerEl,
		onArmed
	}: {
		store: PopoverStore;
		disabled: boolean;
		openOnHover: boolean;
		delay: number;
		closeDelay: number;
		triggerEl: () => HTMLElement | null;
		onArmed: (next: TriggerArmed | null) => void;
	} = $props();

	const owner = untrack(() => store);
	const click = new ClickInteraction(owner, () => ({
		enabled: !disabled,
		stickIfOpen: owner.stickIfOpen
	}));
	// One polygon per trigger. The options getter runs on every event.
	const handleClose = safePolygon();
	const hover = useHoverReferenceInteraction(owner, () => ({
		enabled:
			!disabled &&
			openOnHover &&
			(owner.openMethod !== 'touch' || owner.openChangeReason !== REASONS.triggerPress),
		mouseOnly: true,
		move: false,
		handleClose,
		restMs: delay,
		delay: { close: closeDelay },
		placement: () => owner.readPlacement()
	}));
	const guards = new TriggerFocusGuards(owner, triggerEl);

	$effect(() => {
		untrack(() =>
			onArmed?.({
				click: click.reference,
				hover: hover.reference,
				attach: hover.attachReference,
				guards
			})
		);
		return () => untrack(() => onArmed?.(null));
	});
</script>
