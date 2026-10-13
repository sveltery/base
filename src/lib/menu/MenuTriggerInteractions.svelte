<!--
	Click, hover, and focus-guard handlers for one live menu store.
	The trigger button stays mounted. This part appears once that store exists.
	Derived from Base UI v1.9.0 packages/react/src/menu/trigger/MenuTrigger.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import {
		safePolygon,
		ClickInteraction,
		HoverReferenceInteraction
	} from '@sveltery/floating-ui-svelte';
	import { TriggerFocusGuards } from '../internal/popups/index.js';
	import type { MenubarParentContext } from './parent.svelte.js';
	import type { MenuStore } from './store.svelte.js';
	import type { TriggerArmed } from './trigger-armed.js';

	let {
		store,
		menubar,
		disabled,
		openOnHover,
		opened,
		mountedByThis,
		delay,
		closeDelay,
		triggerEl,
		onArmed
	}: {
		store: MenuStore;
		menubar: MenubarParentContext | undefined;
		disabled: boolean;
		openOnHover: boolean;
		opened: boolean;
		mountedByThis: boolean;
		delay: number;
		closeDelay: number;
		triggerEl: () => HTMLElement | null;
		onArmed: (next: TriggerArmed | null) => void;
	} = $props();

	const owner = untrack(() => store);
	const click = new ClickInteraction(owner, () => ({
		enabled: !disabled,
		event: opened && menubar ? 'click' : 'mousedown',
		toggle: true,
		ignoreMouse: false,
		stickIfOpen: menubar ? false : owner.stickIfOpen
	}));
	// One polygon per trigger. The options getter runs on every event.
	const handleClose = safePolygon({ blockPointerEvents: !untrack(() => menubar) });
	const hover = new HoverReferenceInteraction(owner, () => ({
		enabled: openOnHover && !disabled && (!menubar || (menubar.hasSubmenuOpen && !mountedByThis)),
		mouseOnly: true,
		move: false,
		handleClose,
		restMs: menubar ? undefined : delay,
		delay: { close: closeDelay },
		placement: () => owner.placement,
		// A detached trigger sits outside the menu's floating tree.
		externalTree: owner.tree ?? undefined
	}));
	const guards = new TriggerFocusGuards(
		owner,
		untrack(() => triggerEl)
	);

	$effect(() => {
		untrack(() =>
			onArmed({
				click: click.reference,
				hover: hover.reference,
				attach: hover.attachReference,
				guards
			})
		);
		return () => untrack(() => onArmed(null));
	});
</script>
