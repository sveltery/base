// Derived from Base UI v1.9.0 packages/react/src/menu/filter-root/useMenuFilterPopup.ts,
// MenuFilterPopup.tsx and useVirtualFocusParentHandoff.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream sees a portaled submenu's events because they bubble through React's tree. Here a
// submenu popup relays its `focusin` to the parent popup, which calls `focusIn` with its own
// element.

import { DEV } from 'esm-env';
import { untrack } from 'svelte';
import { isElement, isHTMLElement } from '@floating-ui/utils/dom';
import { REASONS, activeElement, contains, getTarget, ownerDocument, warn } from '@sveltery/utils';
import { isCrossOrientationCloseKey } from '@sveltery/floating-ui-svelte';
import { isRefocusingOwner, isTypeableElement, refocusOwner } from './filter-keydown.js';
import type { MenuStore } from './store.svelte.js';
import type { MenuChangeReason, MenuOrientation } from './types.js';

/** Focus and pointer handling of a filterable menu's popup, which never takes focus itself. */
export class MenuFilterPopupBehavior {
	/** Focus that entered a nested popup by keyboard or click stays there while the pointer
	 * crosses this popup. */
	#nestedFocus: Element | null = null;
	/** A tap fires compatibility mouse events, which must not raise the on-screen keyboard. */
	#pointerType = 'mouse';

	constructor(
		private readonly store: MenuStore,
		private readonly read: () => { orientation: MenuOrientation; rtl: boolean }
	) {
		if (DEV) {
			$effect(() => {
				if (!store.open) return;
				untrack(() => {
					if (store.focusOwner === null) {
						warn(
							'A filterable menu opened without a <Menu.Input>. Render the input inside ' +
								'<Menu.Popup>, or drop <Menu.FilterProvider> for a menu that does not filter.'
						);
					}
				});
			});
		}
	}

	/** Whether a popup open lets the input take focus, and the focus target when it does. */
	initialFocus(): false | (() => HTMLElement | false) {
		const store = this.store;
		const reason = store.openChangeReason;
		const mayFocusInput =
			store.parent.type !== 'menu' ||
			(store.open &&
				(store.openMethod === 'keyboard' ||
					reason === REASONS.listNavigation ||
					reason === REASONS.triggerHover ||
					reason === REASONS.triggerPress));
		if (!mayFocusInput) return false;
		return () => {
			const openedByHover = store.open && store.openChangeReason === REASONS.triggerHover;
			// A tap would raise the on-screen keyboard, but a screen reader press still reports a
			// touch and needs the input focused.
			const touchOpen =
				(store.openMethod === 'touch' || store.openMethod === 'pen') && !store.virtualPress;
			if (openedByHover || touchOpen) return false;
			return store.focusOwner ?? false;
		};
	}

	#trackPointerType = (event: PointerEvent) => {
		this.#pointerType = event.pointerType || 'mouse';
	};

	#restoreInputFocus(event: MouseEvent, enteredTrigger: boolean) {
		const owner = this.store.focusOwner;
		const popup = event.currentTarget as HTMLElement;
		if (!this.store.open || !owner) return;
		const active = activeElement(ownerDocument(popup));
		if (active === owner || contains(popup, active)) return;

		// The composed path holds this popup only when the pointer is really over it, and a
		// closing popup must not re-capture focus during its exit transition.
		let submenuTrigger: HTMLElement | null = null;
		const nearestPopup = event.composedPath().find((node) => {
			if (!isHTMLElement(node)) return false;
			if (node.getAttribute('role') === 'dialog' || node.hasAttribute('data-rootownerid')) {
				return true;
			}
			if (node.hasAttribute('aria-haspopup')) submenuTrigger = node;
			return false;
		});
		if (nearestPopup !== popup) return;

		// A nested popup that took focus keeps it while the pointer moves over this popup.
		// Entering a submenu trigger returns focus to this popup's input.
		if (this.#nestedFocus && !(enteredTrigger && submenuTrigger)) return;
		if (
			enteredTrigger &&
			submenuTrigger &&
			isElement(event.relatedTarget) &&
			contains(submenuTrigger, event.relatedTarget)
		) {
			return;
		}
		refocusOwner(owner);
	}

	/** `focusin` on the popup, or relayed from a portaled submenu. */
	focusIn(event: FocusEvent, popup: HTMLElement) {
		const owner = this.store.focusOwner;
		const target = getTarget(event);
		if (target === owner) {
			this.#nestedFocus = null;
		} else if (isHTMLElement(target) && !contains(popup, target) && !isRefocusingOwner()) {
			this.#nestedFocus = target;
		}
		// Focus that lands on the popup itself, the focus manager's fallback, moves to the input.
		if (this.store.open && target === popup) owner?.focus({ preventScroll: true });
	}

	/** `keydown` on the popup, or relayed from a portaled submenu. */
	keyDown(event: KeyboardEvent) {
		const owner = this.store.focusOwner;
		const target = getTarget(event);
		if (target === owner || isTypeableElement(target)) return;
		const { orientation, rtl } = this.read();
		if (isCrossOrientationCloseKey(event.key, orientation, rtl, false)) {
			owner?.focus({ preventScroll: true });
			// Keeps a nested popup's key from the parent.
			event.stopPropagation();
		}
	}

	readonly props = {
		// The input owns virtual focus.
		'aria-activedescendant': undefined,
		// Not valid on a dialog. The list carries the orientation.
		'aria-orientation': undefined,
		onmousedown: (event: MouseEvent) => {
			// Keep focus on the input when the popup's own background is pressed.
			if (getTarget(event) === event.currentTarget) event.preventDefault();
		},
		onpointerdown: this.#trackPointerType,
		// `pointerover` precedes the compatibility `mouseover`, so a mouse entering right after a
		// tap is recognized before the handoff.
		onpointerover: this.#trackPointerType,
		onpointermove: this.#trackPointerType,
		onmousemove: (event: MouseEvent) => {
			if (this.#pointerType === 'mouse') this.#restoreInputFocus(event, false);
		},
		onmouseover: (event: MouseEvent) => {
			if (this.#pointerType === 'mouse' && this.#nestedFocus) this.#restoreInputFocus(event, true);
		},
		onfocusin: (event: FocusEvent) => this.focusIn(event, event.currentTarget as HTMLElement),
		onkeydown: (event: KeyboardEvent) => this.keyDown(event)
	};
}

/**
 * A plain submenu whose parent is filterable. The parent keeps real focus on its input, so its
 * trigger never blurs. The submenu hands focus and the parent's highlight back itself.
 */
export function useVirtualFocusParentHandoff(store: MenuStore) {
	const parent = store.parent;
	if (store.virtualFocus || parent.type !== 'menu' || !parent.store.virtualFocus) return null;
	const parentStore = parent.store;

	function returnToParent(trigger: Element | null, reason: MenuChangeReason | null) {
		const owner = parentStore.focusOwner;
		if (store.open || !parentStore.open || !owner) return;
		if (contains(store.popupElement, activeElement(ownerDocument(owner)))) {
			owner.focus({ preventScroll: true });
		}
		if (
			(reason === REASONS.listNavigation || reason === REASONS.escapeKey) &&
			parentStore.activeIndex == null
		) {
			// The closing key is gone by this microtask, so there is no event to report.
			parentStore.highlightItem(trigger, REASONS.none);
		}
	}

	$effect(() => {
		if (store.open) return;
		untrack(() => {
			// A parent closing in the same update can clear the trigger, so read it now.
			const trigger = store.activeTriggerElement;
			const reason = store.openChangeReason;
			queueMicrotask(() => returnToParent(trigger, reason));
		});
	});

	return {
		get returnElement() {
			return parentStore.focusOwner;
		},
		/** Real focus entering this submenu is when a plain parent's trigger would blur. */
		focusIn() {
			if (parentStore.activeIndex != null) parentStore.setActiveIndex(null, REASONS.none);
		}
	};
}
