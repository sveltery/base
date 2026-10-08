// Derived from the outside-press predicate in Base UI v1.8.0
// packages/react/src/dialog/root/useDialogRoot.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// The ported dismiss hook takes one press mode. A backdrop forces `intentional`.
// `trap-focus` without a backdrop uses `sloppy`. Other dialogs without a backdrop
// use `intentional` for both mouse and touch.

import { contains, getTarget } from '../internal/shadow-dom.js';
import type { DialogStore } from './store.svelte.js';

export type DialogPressMode = 'sloppy' | 'intentional';

export function dialogOutsidePressEvent(store: DialogStore<unknown>): DialogPressMode {
	if (store.internalBackdropElement || store.backdropElement) return 'intentional';
	if (store.modal === 'trap-focus') return 'sloppy';
	return 'intentional';
}

export function dialogOutsidePress(store: DialogStore<unknown>, event: Event) {
	if (!store.outsidePressEnabled) return false;
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
		return true;
	}

	return true;
}

/** Clicks inside the popup are not outside presses, even when they bubble to the viewport. */
export function dialogOwnedOutsidePress(store: DialogStore<unknown>, event: Event) {
	const target = getTarget(event);
	if (contains(store.popupElement, target)) return false;
	return dialogOutsidePress(store, event);
}
