<!--
	Hover, focus, delay-group, and nested-trigger handlers for one live tooltip store.
	Derived from Base UI v1.9.0 packages/react/src/tooltip/trigger/TooltipTrigger.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The trigger element stays mounted. This part appears once a store exists, so the hover and
	delay-group state is written on that store and not on a detached stand-in.
	Upstream calls `preventBaseUIHandler()` in its focus handler for a nested trigger. Focus
	events cannot be canceled, so the focus handler is skipped here instead.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		contains,
		createChangeEventDetails,
		getTarget,
		REASONS,
		ScopedTimeout
	} from '@sveltery/utils';
	import {
		DelayGroupMember,
		FocusInteraction,
		HoverReferenceInteraction,
		safePolygon
	} from '@sveltery/floating-ui-svelte';
	import { mergeProps } from '../internal/mergeProps.js';
	import { OPEN_DELAY, TOOLTIP_TRIGGER_IDENTIFIER } from './constants.js';
	import { useTooltipProviderDelay } from './context.svelte.js';
	import type { TooltipStore } from './store.svelte.js';
	import type { TooltipTriggerArmed } from './trigger-armed.js';

	let {
		store,
		triggerId,
		disabled,
		delay,
		closeDelay,
		closeOnClick,
		triggerEl,
		onArmed
	}: {
		store: TooltipStore;
		triggerId: string;
		disabled: boolean;
		delay: number | undefined;
		closeDelay: number | undefined;
		closeOnClick: boolean;
		triggerEl: () => HTMLElement | null;
		onArmed: (next: TooltipTriggerArmed | null) => void;
	} = $props();

	const owner = untrack(() => store);
	const providerDelay = useTooltipProviderDelay();
	const member = new DelayGroupMember(owner, () => ({ open: owner.openedBy(triggerId) }));

	$effect(() => owner.trackInstantPhase(() => member.isInstantPhase));

	let nestedTriggerHovered = false;
	// Kept apart from the hover hook's pointer type so mouseleave can clear it.
	let pointerType: string | undefined;
	const nestedTriggerOpenTimeout = new ScopedTimeout();

	function openDelay() {
		// Adjacent tooltips open instantly while the group is active.
		if (member.hasProvider && member.currentId != null) return 0;
		return delay ?? providerDelay() ?? OPEN_DELAY;
	}

	function groupCloseDelay() {
		const value = member.delay;
		return (typeof value === 'number' ? value : value.close) ?? 0;
	}

	const polygon = safePolygon();
	const hover = new HoverReferenceInteraction(owner, () => ({
		enabled: !disabled,
		mouseOnly: true,
		move: false,
		handleClose: !owner.disableHoverablePopup && owner.trackCursorAxis !== 'both' ? polygon : null,
		restMs: openDelay,
		delay: () => ({
			close: closeDelay == null && member.hasProvider ? groupCloseDelay() : (closeDelay ?? 0)
		}),
		shouldOpen: () => !nestedTriggerHovered,
		placement: () => owner.placement
	}));
	const focus = new FocusInteraction(owner, () => ({ enabled: !disabled }));

	function targetElement(event: Event) {
		const target = getTarget(event);
		return target instanceof Element ? target : null;
	}

	/** Upstream `closest` from the shadow DOM helpers: it walks out of shadow roots and slots. */
	function closestTrigger(node: Node | null) {
		let current: Node | null = node;
		while (current) {
			if (current instanceof Element && current.matches(`[${TOOLTIP_TRIGGER_IDENTIFIER}]`)) {
				return current;
			}
			current =
				(current as Element).assignedSlot ??
				current.parentNode ??
				(current instanceof ShadowRoot ? current.host : null);
		}
		return null;
	}

	function isEnabledNestedTriggerTarget(target: Element | null) {
		const trigger = triggerEl();
		if (!trigger || !target) return false;
		const nearest = closestTrigger(target);
		return nearest !== null && nearest !== trigger && contains(trigger, nearest);
	}

	function detectNestedTriggerHover(target: Element | null) {
		const hovered = isEnabledNestedTriggerTarget(target);
		nestedTriggerHovered = hovered;
		if (hovered) {
			const shared = owner.hoverInteraction;
			shared?.openChangeTimeout.clear();
			shared?.restTimeout.clear();
			if (shared) shared.restTimeoutPending = false;
			nestedTriggerOpenTimeout.clear();
		}
		return hovered;
	}

	function isMouseLike(type: string | undefined) {
		return type === 'mouse' || type === 'pen' || type === '' || type === undefined;
	}

	function onNestedTriggerHover(event: MouseEvent) {
		const wasHovered = nestedTriggerHovered;
		const target = targetElement(event);
		const hovered = detectNestedTriggerHover(target);
		const trigger = triggerEl();
		const insideTrigger = trigger != null && target != null && contains(trigger, target);

		// Only close hover-opened parents. Focus and click opens keep their own interaction.
		if (hovered && owner.open && owner.openChangeReason === REASONS.triggerHover) {
			owner.setOpen(false, createChangeEventDetails(REASONS.triggerHover, event));
			return;
		}

		if (
			wasHovered &&
			!hovered &&
			insideTrigger &&
			!disabled &&
			!owner.open &&
			trigger &&
			isMouseLike(pointerType)
		) {
			const open = () => {
				if (!nestedTriggerHovered && !disabled && !owner.open) {
					owner.setOpen(true, createChangeEventDetails(REASONS.triggerHover, event, trigger));
				}
			};
			// With `move: false` the hover hook only sees enter and leave on the parent trigger.
			// Leaving a nested child for the parent area fires nothing it reacts to.
			const wait = openDelay();
			if (wait === 0) {
				nestedTriggerOpenTimeout.clear();
				open();
			} else {
				nestedTriggerOpenTimeout.start(wait, open);
			}
		}
	}

	const base = mergeProps(hover.reference, {
		...focus.reference,
		onfocusin(event: FocusEvent) {
			if (isEnabledNestedTriggerTarget(targetElement(event))) return;
			focus.reference.onfocusin(event);
		}
	}) as HTMLAttributes<HTMLElement>;

	const local: HTMLAttributes<HTMLElement> = {
		onmouseleave() {
			nestedTriggerHovered = false;
			nestedTriggerOpenTimeout.clear();
			pointerType = undefined;
		},
		onpointerenter(event: PointerEvent) {
			pointerType = event.pointerType;
		},
		onpointerdown(event: PointerEvent) {
			pointerType = event.pointerType;
			owner.pressTrigger(closeOnClick);
			if (closeOnClick && !owner.open) owner.cancelPendingOpen(event);
		},
		onclick(event: MouseEvent) {
			if (closeOnClick && !owner.open) owner.cancelPendingOpen(event);
		}
	};

	// A native listener, not a delegated `onmouseover`. Svelte finds delegated handlers through
	// `composedPath()`, so an event with an empty path would skip this one.
	function attachTrigger(node: HTMLElement) {
		const detachHover = (hover.attachReference as (node: HTMLElement) => () => void)(node);
		node.addEventListener('mouseover', onNestedTriggerHover);
		return () => {
			node.removeEventListener('mouseover', onNestedTriggerHover);
			detachHover?.();
		};
	}

	$effect(() => {
		untrack(() =>
			onArmed({
				base,
				local,
				attach: attachTrigger
			})
		);
		return () => untrack(() => onArmed(null));
	});
</script>
