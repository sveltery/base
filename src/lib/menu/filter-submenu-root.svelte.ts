// Derived from Base UI v1.9.0 packages/react/src/menu/filter-submenu-root/MenuFilterSubmenuRoot.tsx
// and packages/react/src/menu/submenu-root/MenuSubmenuRootContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `MenuSubmenuRootContext` becomes the `submenu` field of the submenu's store, which its trigger
// and popup read.

import { untrack } from 'svelte';
import { isHTMLElement } from '@floating-ui/utils/dom';
import {
	REASONS,
	activeElement,
	contains,
	createChangeEventDetails,
	ownerDocument
} from '@sveltery/utils';
import {
	isCrossOrientationCloseKey,
	isCrossOrientationOpenKey,
	isMainOrientationKey,
	stopEvent
} from '@sveltery/floating-ui-svelte';
import { isKeyboardOpen } from './constants.js';
import type { MenuRootContext } from './context.svelte.js';
import { moveHighlightFrom } from './filter-keydown.js';
import type { MenuStore } from './store.svelte.js';
import type { MenuChangeEventDetails, MenuOrientation } from './types.js';

/** What a filterable submenu adds to its trigger and popup. */
export interface MenuSubmenuNavigation {
	/** The element that receives focus when the submenu closes. */
	getReturnElement(): HTMLElement | null;
	onTriggerKeyDown(event: KeyboardEvent): void;
	onPopupKeyDown(event: KeyboardEvent): void;
}

type ParentReference = { reference: HTMLElement; trigger: HTMLElement };

/**
 * Entry into and exit from a filterable submenu, which depend on both menus' orientations.
 * Construct it before the submenu's store, to wrap `onOpenChange`, then `attach` the store.
 */
export class MenuFilterSubmenu implements MenuSubmenuNavigation {
	#parentReference: ParentReference | null = null;
	#store: MenuStore | null = null;
	#orientation: () => MenuOrientation = () => 'vertical';

	constructor(
		private readonly parent: MenuRootContext,
		private readonly rtl: () => boolean
	) {}

	get #parentStore() {
		return this.parent.store;
	}

	get #parentVirtualFocus() {
		return this.parent.store.virtualFocus;
	}

	#enter(trigger: HTMLElement, event: KeyboardEvent | undefined) {
		const focused = this.#parentVirtualFocus
			? this.#parentStore.focusOwner
			: activeElement(ownerDocument(trigger));
		if (isHTMLElement(focused)) {
			this.#parentReference = { reference: focused, trigger };
			this.#parentStore.setActiveIndex(null, event ? REASONS.keyboard : REASONS.none, event);
		}
	}

	#highlightTrigger(trigger: HTMLElement, event: Event | undefined) {
		this.#parentStore.highlightItem(trigger, REASONS.keyboard, event);
	}

	#exit(event: KeyboardEvent) {
		const reference = this.#parentReference;
		if (!reference) return;
		reference.reference.focus({ preventScroll: true });
		this.#highlightTrigger(reference.trigger, event);
	}

	/** Wraps the consumer's `onOpenChange`. */
	handleOpenChange(
		open: boolean,
		details: MenuChangeEventDetails,
		consumer: ((open: boolean, details: MenuChangeEventDetails) => void) | undefined
	) {
		consumer?.(open, details);
		if (details.isCanceled) return;
		const trigger = details.trigger;
		if (!open) {
			if (details.reason === REASONS.escapeKey && isHTMLElement(trigger)) {
				this.#highlightTrigger(trigger, details.event);
				// The popup returns focus through `getReturnElement`, so point it at the element that
				// can hold real focus: the parent's input, not its untabbable trigger.
				this.#parentReference = {
					reference: this.#parentVirtualFocus ? (this.#parentStore.focusOwner ?? trigger) : trigger,
					trigger
				};
			}
			return;
		}
		this.#parentReference = null;
		if (isHTMLElement(trigger) && isKeyboardOpen(details.reason, details.event)) {
			// A keyboard click reports its click, which is not the key that opened the submenu.
			this.#enter(trigger, details.reason === REASONS.listNavigation ? details.event : undefined);
		}
	}

	/** Connects the submenu's store. Call during the submenu root's init. */
	attach(store: MenuStore, orientation: () => MenuOrientation) {
		this.#store = store;
		this.#orientation = orientation;
		store.submenu = this;

		// A hover close skips the focus manager's return focus, which would strand the input's
		// focus on the body once the popup unmounts.
		let wasMounted = false;
		$effect(() => {
			const mounted = store.mounted;
			untrack(() => {
				const previous = wasMounted;
				wasMounted = mounted;
				if (mounted || !previous) return;
				const returnElement = this.getReturnElement();
				if (!returnElement || !this.#parentStore.open) return;
				const doc = ownerDocument(returnElement);
				const active = activeElement(doc);
				if (active === doc.body || contains(store.popupElement, active)) {
					returnElement.focus({ preventScroll: true });
				}
			});
		});
	}

	#ownReturnElement(): HTMLElement | null {
		return (
			this.#parentReference?.reference ??
			(this.#parentVirtualFocus ? this.#parentStore.focusOwner : null) ??
			null
		);
	}

	getReturnElement(): HTMLElement | null {
		const own = this.#ownReturnElement();
		if (own) return own;
		// A plain parent has no input to return to. Focus the trigger this submenu opened from.
		const [trigger] = this.#store?.triggers.elements() ?? [];
		return isHTMLElement(trigger) ? trigger : null;
	}

	#moveInParent(from: HTMLElement, event: KeyboardEvent) {
		const parentStore = this.#parentStore;
		const item = moveHighlightFrom(parentStore, parentStore.items.indexOf(from), event, {
			orientation: this.parent.orientation,
			rtl: this.rtl(),
			loopFocus: this.parent.loopFocus,
			allowEscape: this.#parentVirtualFocus && this.parent.allowEscape
		});
		if (!this.#parentVirtualFocus) item?.focus({ preventScroll: true });
	}

	#close(event: KeyboardEvent) {
		const store = this.#store;
		if (!store?.open) return;
		// The key can reach this popup re-dispatched on its highlighted item, so it cannot bubble
		// to the parent. A close key that also navigates the parent moves it from here.
		stopEvent(event);
		const trigger = store.activeTriggerElement;
		const details = createChangeEventDetails(REASONS.listNavigation, event);
		store.setOpen(false, details as never);
		if (!details.isCanceled) this.#exit(event);

		// `#exit` bails when the submenu was opened by pointer, so return focus here.
		const returnElement = this.#ownReturnElement() ?? trigger;
		if (
			!store.open &&
			isHTMLElement(returnElement) &&
			activeElement(ownerDocument(returnElement)) !== returnElement
		) {
			returnElement.focus();
		}
		if (
			!store.open &&
			isHTMLElement(trigger) &&
			isMainOrientationKey(event.key, this.parent.orientation)
		) {
			this.#moveInParent(trigger, event);
		}
	}

	onTriggerKeyDown = (event: KeyboardEvent) => {
		const store = this.#store;
		const current = event.currentTarget as HTMLElement;
		if (!store) return;
		const parentOrientation = this.parent.orientation;
		if (isMainOrientationKey(event.key, parentOrientation)) {
			this.#moveInParent(current, event);
			stopEvent(event);
			return;
		}

		const open = store.open;
		const rtl = this.rtl();
		if (open && isCrossOrientationCloseKey(event.key, this.#orientation(), rtl, false)) {
			this.#close(event);
			return;
		}
		if (!isCrossOrientationOpenKey(event.key, parentOrientation, rtl)) return;
		stopEvent(event);

		if (open) {
			// Re-entering an open submenu hands the cursor to its input and keeps the highlight.
			this.#enter(current, event);
			store.focusOwner?.focus({ preventScroll: true });
			return;
		}
		store.setOpen(true, createChangeEventDetails(REASONS.listNavigation, event, current) as never);
	};

	onPopupKeyDown = (event: KeyboardEvent) => {
		// A key that composes text in the input must not close the submenu.
		if (event.which === 229) return;
		if (isCrossOrientationCloseKey(event.key, this.#orientation(), this.rtl(), false)) {
			this.#close(event);
		}
	};
}
