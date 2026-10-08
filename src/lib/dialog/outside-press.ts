// Derived from the outside-press predicate in Base UI v1.8.0
// packages/react/src/dialog/root/useDialogRoot.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// One listener decides outside press. Mouse and touch use separate modes.
// A backdrop is intentional for both. Without one, touch is sloppy and mouse
// is sloppy only for trap-focus.

import { on } from 'svelte/events';
import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
import { ownerDocument } from '../internal/owner.js';
import { contains, getTarget } from '../internal/shadow-dom.js';
import type { DialogStore } from './store.svelte.js';

export type DialogPressMode = 'sloppy' | 'intentional';
type PointerKind = 'mouse' | 'touch';

export function dialogPressMode(
	store: DialogStore<unknown>,
	pointer: PointerKind
): DialogPressMode {
	if (store.internalBackdropElement || store.backdropElement) return 'intentional';
	if (pointer === 'touch') return 'sloppy';
	return store.modal === 'trap-focus' ? 'sloppy' : 'intentional';
}

export function dialogOutsidePress(store: DialogStore<unknown>, event: Event) {
	if ('button' in event && (event as MouseEvent).button !== 0) return false;

	if ('touches' in event) {
		const touch = event as TouchEvent;
		if (touch.type === 'touchend') {
			if (touch.changedTouches.length !== 1 || touch.touches.length !== 0) return false;
		} else if (touch.touches.length !== 1) {
			return false;
		}
	}

	if (store.nestedOpenDialogCount !== 0 || store.disablePointerDismissal) return false;

	const target = getTarget(event);
	if (!(target instanceof Element)) return false;
	if (contains(store.popupElement, target)) return false;

	if (store.modal) {
		const internalBackdrop = store.internalBackdropElement;
		const backdrop = store.backdropElement;
		if (internalBackdrop || backdrop) {
			return (
				target === internalBackdrop ||
				target === backdrop ||
				(contains(target, store.popupElement) && !target.hasAttribute('data-base-ui-portal'))
			);
		}
	}

	return true;
}

function pointerKind(event: Event, current: PointerKind): PointerKind {
	if (event instanceof PointerEvent) {
		return event.pointerType === 'touch' ? 'touch' : 'mouse';
	}
	if (event.type.startsWith('touch')) return 'touch';
	return current;
}

/** Document listener. Backdrop, viewport, and the internal backdrop do not decide. */
export function installDialogOutsidePress(store: DialogStore<unknown>) {
	let sawPressWhileOpen = false;
	let pointer: PointerKind = 'mouse';
	const doc = ownerDocument(store.popupElement);

	function close(event: Event) {
		if (!store.open || !dialogOutsidePress(store, event)) return;
		store.setOpen(false, createChangeEventDetails(REASONS.outsidePress, event));
	}

	function onPointerDown(event: PointerEvent) {
		pointer = pointerKind(event, pointer);
		if (event.button !== 0) return;
		// Every primary press, including one after close. A press that starts
		// inside the popup does not count, so dragging onto the viewport does not close.
		// Lasting fix: useDismiss contains against the floating element and tracks
		// pressStartedInside. Then this listener can go. The shared hook still treats
		// the portal host as inside, which would keep backdrop and viewport presses.
		sawPressWhileOpen = store.open && !contains(store.popupElement, getTarget(event));
		if (dialogPressMode(store, pointer) !== 'sloppy' || pointer === 'touch') return;
		close(event);
	}

	function onClick(event: MouseEvent) {
		pointer = pointerKind(event, pointer);
		if (dialogPressMode(store, pointer) !== 'intentional' || !sawPressWhileOpen) return;
		close(event);
	}

	function onTouchEnd(event: TouchEvent) {
		pointer = 'touch';
		if (dialogPressMode(store, 'touch') !== 'sloppy') return;
		close(event);
	}

	const stopPointer = on(doc, 'pointerdown', onPointerDown);
	const stopClick = on(doc, 'click', onClick);
	const stopTouch = on(doc, 'touchend', onTouchEnd);
	return () => {
		stopPointer();
		stopClick();
		stopTouch();
		sawPressWhileOpen = false;
	};
}
