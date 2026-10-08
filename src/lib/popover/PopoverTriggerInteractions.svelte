<!--
	Click, hover, and focus-guard handlers for one live popover store.
	The trigger button stays mounted. This part appears once that store exists,
	so hover state is written on the store and not on a detached stand-in.
-->
<script lang="ts">
	import { REASONS } from '../internal/event-details.js';
	import {
		safePolygon,
		useClick,
		useHoverReferenceInteraction
	} from '../internal/floating-ui/index.js';
	import { useTriggerFocusGuards } from '../internal/popups/index.js';
	import type { PopoverStore } from './store.svelte.js';
	import type { TriggerArmed } from './trigger-armed.js';

	let {
		store,
		disabled,
		openOnHover,
		delay,
		closeDelay,
		triggerEl,
		armed = $bindable(null)
	}: {
		store: PopoverStore;
		disabled: boolean;
		openOnHover: boolean;
		delay: number;
		closeDelay: number;
		triggerEl: () => HTMLElement | null;
		armed: TriggerArmed | null;
	} = $props();

	const click = useClick(store, () => ({
		enabled: !disabled,
		stickIfOpen: store.stickIfOpen
	}));
	const hover = useHoverReferenceInteraction(store, () => ({
		enabled:
			!disabled &&
			openOnHover &&
			(store.openMethod !== 'touch' || store.openChangeReason !== REASONS.triggerPress),
		mouseOnly: true,
		move: false,
		handleClose: safePolygon(),
		restMs: delay,
		delay: { close: closeDelay },
		placement: () => store.readPlacement()
	}));
	const guards = useTriggerFocusGuards(store, triggerEl);

	armed = {
		click: click.reference,
		hover: hover.reference,
		attach: hover.attachReference,
		guards
	};
</script>
