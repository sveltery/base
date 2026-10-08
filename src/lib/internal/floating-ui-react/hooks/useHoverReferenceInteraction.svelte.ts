// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/hooks/useHoverReferenceInteraction.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Hover open is a `$state` write in the same turn. There is no `flushSync`.

import { on } from 'svelte/events';
import { createChangeEventDetails, REASONS } from '../../event-details.js';
import { ownerDocument } from '../../owner.js';
import { contains } from '../../shadow-dom.js';
import { PopupStore } from '../../popups/store.svelte.js';
import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import { useFloatingTree } from '../components/FloatingTree.svelte.js';
import { isTargetInsideEnabledTrigger } from '../utils/element.js';
import { isMouseLikePointerType } from '../utils/event.js';
import type { HandleClose } from '../safePolygon.js';
import {
	applySafePolygonPointerEventsMutation,
	clearSafePolygonPointerEventsMutation,
	hoverInteraction
} from './useHoverInteractionSharedState.js';
import { getDelay, getRestMs, isClickLikeOpenEvent } from './useHoverShared.js';

export interface UseHoverReferenceProps {
	enabled?: boolean;
	handleClose?: HandleClose | null;
	restMs?: number | (() => number);
	delay?:
		| number
		| Partial<{ open: number; close: number }>
		| (() => number | Partial<{ open: number; close: number }>);
	move?: boolean;
	mouseOnly?: boolean;
	isActiveTrigger?: boolean;
	shouldOpen?: () => boolean;
	guardStaleOpen?: boolean;
	placement?: () => string | null;
}

function triggersOf(store: FloatingRootStore) {
	return store instanceof PopupStore ? store.triggers : null;
}

export function useHoverReferenceInteraction(
	store: FloatingRootStore,
	props: () => UseHoverReferenceProps = () => ({})
) {
	const tree = useFloatingTree();
	const instance = hoverInteraction(store);
	let hoverCloseActive = false;
	let sawMove = false;
	let stopMove: (() => void) | undefined;

	function options() {
		const value = props();
		return {
			enabled: value.enabled ?? true,
			handleClose: value.handleClose ?? null,
			restMs: value.restMs ?? 0,
			delay: value.delay ?? 0,
			move: value.move ?? true,
			mouseOnly: value.mouseOnly ?? false,
			isActiveTrigger: value.isActiveTrigger ?? true,
			shouldOpen: value.shouldOpen,
			guardStaleOpen: value.guardStaleOpen ?? false,
			placement: value.placement
		};
	}

	function clickLike() {
		return isClickLikeOpenEvent(store.data.openEvent?.type, instance.interactedInside);
	}

	function allowOpen() {
		return options().shouldOpen?.() !== false;
	}

	function cleanupMouseMove() {
		stopMove?.();
		stopMove = undefined;
		instance.handler = undefined;
	}

	$effect(() => {
		if (!options().enabled) return;
		function onOpenChange(payload?: unknown) {
			const details = payload as { open?: boolean; reason?: string } | undefined;
			if (!details?.open) {
				hoverCloseActive = details?.reason === REASONS.triggerHover;
				cleanupMouseMove();
				instance.openChangeTimeout.clear();
				instance.restTimeout.clear();
				instance.blockMouseMove = true;
				instance.restTimeoutPending = false;
			} else {
				hoverCloseActive = false;
			}
		}
		store.events.on('openchange', onOpenChange);
		return () => {
			store.events.off('openchange', onOpenChange);
			cleanupMouseMove();
			instance.dispose();
		};
	});

	function closeWithDelay(event: MouseEvent, runElse = true) {
		const closeDelay = getDelay(options().delay, 'close', instance.pointerType);
		if (closeDelay) {
			instance.openChangeTimeout.start(closeDelay, () => {
				store.setOpen(false, createChangeEventDetails(REASONS.triggerHover, event));
				tree?.events.emit('floating.closed', event);
			});
		} else if (runElse) {
			instance.openChangeTimeout.clear();
			store.setOpen(false, createChangeEventDetails(REASONS.triggerHover, event));
			tree?.events.emit('floating.closed', event);
		}
	}

	function onMouseEnter(event: MouseEvent) {
		const current = options();
		if (!current.enabled) return;
		if (event.currentTarget instanceof Element) store.domReferenceElement = event.currentTarget;
		instance.openChangeTimeout.clear();
		instance.blockMouseMove = false;
		if (current.mouseOnly && !isMouseLikePointerType(instance.pointerType)) return;
		const restMsValue = getRestMs(current.restMs);
		const openDelay = getDelay(current.delay, 'open', instance.pointerType);
		const triggerNode =
			event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
		const isOpen = store.isOpen();
		const closing =
			!isOpen &&
			store instanceof PopupStore &&
			store.transitionStatus === 'ending' &&
			hoverCloseActive;
		if (closing && allowOpen()) {
			store.setOpen(true, createChangeEventDetails(REASONS.triggerHover, event, triggerNode));
			return;
		}
		if (restMsValue > 0 && !openDelay) return;
		if (openDelay) {
			instance.openChangeTimeout.start(openDelay, () => {
				if (!store.isOpen() && allowOpen()) {
					store.setOpen(true, createChangeEventDetails(REASONS.triggerHover, event, triggerNode));
				}
			});
		} else if (!isOpen && allowOpen()) {
			store.setOpen(true, createChangeEventDetails(REASONS.triggerHover, event, triggerNode));
		}
	}

	function onMouseLeave(event: MouseEvent) {
		const current = options();
		if (!current.enabled) return;
		if (clickLike()) {
			clearSafePolygonPointerEventsMutation(instance);
			return;
		}
		cleanupMouseMove();
		instance.restTimeout.clear();
		instance.restTimeoutPending = false;
		const triggers = triggersOf(store);
		if (triggers && isTargetInsideEnabledTrigger(event.relatedTarget, triggers.elements())) return;
		const handleClose = current.handleClose;
		if (handleClose && store.domReferenceElement && store.floatingElement) {
			if (!store.isOpen()) instance.openChangeTimeout.clear();
			const currentTrigger = store.domReferenceElement;
			const handler = handleClose({
				x: event.clientX,
				y: event.clientY,
				placement: current.placement?.() ?? null,
				elements: { domReference: store.domReferenceElement, floating: store.floatingElement },
				tree,
				nodeId: store.nodeId ?? undefined,
				onClose() {
					clearSafePolygonPointerEventsMutation(instance);
					cleanupMouseMove();
					if (options().enabled && !clickLike() && currentTrigger === store.domReferenceElement) {
						closeWithDelay(event, true);
					}
				}
			});
			instance.handler = handler;
			stopMove = on(ownerDocument(store.domReferenceElement), 'mousemove', handler);
			handler(event);
			return;
		}
		const shouldClose =
			instance.pointerType === 'touch'
				? !contains(
						store.floatingElement,
						event.relatedTarget instanceof Node ? event.relatedTarget : null
					)
				: true;
		if (shouldClose) closeWithDelay(event);
	}

	function onMouseOut(event: MouseEvent) {
		if (!(event.currentTarget instanceof Element)) return;
		if (contains(event.currentTarget, event.relatedTarget)) return;
		instance.openChangeTimeout.clear();
		instance.restTimeout.clear();
		instance.restTimeoutPending = false;
	}

	function onMouseMove(event: MouseEvent) {
		const current = options();
		if (!current.enabled) return;
		const trigger = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
		if (current.mouseOnly && !isMouseLikePointerType(instance.pointerType)) return;
		if (
			store.isOpen() &&
			instance.handleCloseOptions?.blockPointerEvents &&
			trigger &&
			store.floatingElement
		) {
			applySafePolygonPointerEventsMutation(instance, {
				scopeElement: instance.handleCloseOptions.getScope?.() ?? trigger.ownerDocument.body,
				referenceElement: trigger,
				floatingElement: store.floatingElement
			});
		}
		const restMsValue = getRestMs(current.restMs);
		if (store.isOpen() || restMsValue === 0) return;
		if (instance.restTimeoutPending && event.movementX ** 2 + event.movementY ** 2 < 2) return;
		instance.restTimeout.clear();
		const open = () => {
			instance.restTimeoutPending = false;
			if (clickLike()) return;
			if (!instance.blockMouseMove && !store.isOpen() && allowOpen()) {
				store.setOpen(
					true,
					createChangeEventDetails(REASONS.triggerHover, event, trigger ?? undefined)
				);
			}
		};
		if (instance.pointerType === 'touch') open();
		else {
			instance.restTimeoutPending = true;
			instance.restTimeout.start(restMsValue, open);
		}
	}

	function onPointer(event: PointerEvent) {
		instance.pointerType = event.pointerType;
	}

	return {
		reference: {
			onpointerdown: onPointer,
			onpointerenter: onPointer,
			onmouseenter: onMouseEnter,
			onmouseleave: onMouseLeave,
			onmousemove(event: MouseEvent) {
				const current = options();
				if (current.move && !sawMove) {
					sawMove = true;
					onMouseEnter(event);
				}
				onMouseMove(event);
			},
			onmouseout(event: MouseEvent) {
				if (options().guardStaleOpen) onMouseOut(event);
			}
		}
	};
}
