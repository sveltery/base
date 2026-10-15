// Derived from Base UI v1.9.0 packages/react/src/menu/filter-root/useMenuFilterKeyDown.ts,
// packages/react/src/menu/filter-root/moveHighlightFrom.ts and
// packages/react/src/filter-dropdown/utils/refocusOwner.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { isHTMLElement } from '@floating-ui/utils/dom';
import { REASONS, createChangeEventDetails, ownerWindow } from '@sveltery/utils';
import {
	getMaxListIndex,
	getMinListIndex,
	getNextListIndex,
	isCrossOrientationCloseKey,
	isCrossOrientationOpenKey,
	isMainOrientationKey,
	isMainOrientationToEndKey,
	stopEvent
} from '@sveltery/floating-ui-svelte';
import { dispatchClick } from '../internal/click.js';
import type { MenuStore } from './store.svelte.js';
import type { MenuOrientation } from './types.js';

const NO_DISABLED: number[] = [];

let refocusing = false;

/**
 * Hands focus back to the input while the user keeps interacting. Focus handlers that run during
 * the call see `isRefocusingOwner()` and treat the move as a continuation. `focus()` dispatches
 * its events synchronously, so a module flag is enough.
 */
export function refocusOwner(owner: HTMLElement) {
	refocusing = true;
	try {
		owner.focus({ preventScroll: true });
	} finally {
		refocusing = false;
	}
}

export function isRefocusingOwner() {
	return refocusing;
}

export interface MoveHighlightOptions {
	orientation: MenuOrientation;
	rtl: boolean;
	loopFocus: boolean;
	/** Whether the menu's navigation escapes to its input at either end instead of wrapping. */
	allowEscape: boolean;
}

/**
 * Moves the highlight from the item at `fromIndex` one step in the direction of a main-axis arrow key, with the
 * step the menu's own list navigation takes, and returns the newly highlighted item.
 */
export function moveHighlightFrom(
	store: MenuStore,
	fromIndex: number,
	event: KeyboardEvent,
	options: MoveHighlightOptions
): HTMLElement | undefined {
	const items = store.items.elements;
	const { index } = getNextListIndex(items, fromIndex, {
		decrement: !isMainOrientationToEndKey(event.key, options.orientation, options.rtl),
		loopFocus: options.loopFocus,
		allowEscape: options.allowEscape,
		// As the menu's list navigation: `aria-disabled` items stay reachable.
		disabledIndices: NO_DISABLED,
		minIndex: getMinListIndex(items, NO_DISABLED),
		maxIndex: getMaxListIndex(items, NO_DISABLED)
	});
	const next = items[index];
	if (next) {
		store.setActiveIndex(index, REASONS.keyboard, event);
		next.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
	}
	return next ?? undefined;
}

export type MenuFilterKeyAction =
	/** Native text editing in the input. List navigation and parent handlers stay out of it. */
	| 'edit'
	/** The menu's list navigation handles the key. */
	| 'navigate'
	/** A horizontal list is entered from the input with a vertical arrow. */
	| 'enter-list'
	/** The highlighted item handles the key, which opens or closes its submenu. */
	| 'submenu'
	/** The highlighted item is activated. */
	| 'activate'
	/** The popup closes and focus returns to where it came from. */
	| 'close'
	/** The key belongs to an IME composition or leaves the popup (Tab). */
	| 'ignore';

export interface MenuFilterKeyContext {
	orientation: MenuOrientation;
	rtl: boolean;
	hasActiveItem: boolean;
	activeItemOpensSubmenu: boolean;
	/** Whether the input has text. */
	hasValue: boolean;
}

/** What a key does while the filter input owns the keyboard. */
export function getMenuFilterKeyAction(
	event: KeyboardEvent,
	context: MenuFilterKeyContext
): MenuFilterKeyAction {
	const { orientation, rtl, hasActiveItem, activeItemOpensSubmenu, hasValue } = context;
	const { key } = event;
	// Enter that commits an IME composition belongs to the input.
	if (event.which === 229) return 'ignore';
	if (key === 'Tab') return event.shiftKey ? 'close' : 'ignore';
	if (key === 'Enter') return hasActiveItem ? 'activate' : 'navigate';

	const isArrow = key.startsWith('Arrow');
	const isBoundary = key === 'Home' || key === 'End';

	// Modified arrows and boundary keys edit text, like a modified character.
	if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
		return isArrow || isBoundary || key.length === 1 ? 'edit' : 'navigate';
	}
	// Characters stay out of parent handlers such as typeahead.
	if (key.length === 1) return 'edit';
	// Home and End move the caret while the input has text, and jump to the ends of the list
	// otherwise once an item is highlighted.
	if (isBoundary) return hasActiveItem && !hasValue ? 'navigate' : 'edit';
	if (!isArrow) return 'navigate';

	if (isMainOrientationKey(key, orientation)) {
		// Left and Right move the caret of a non-empty input while nothing is highlighted.
		return orientation === 'horizontal' && !hasActiveItem && hasValue ? 'edit' : 'navigate';
	}

	// A highlighted submenu trigger takes the cross-axis keys to open or close its submenu.
	if (
		activeItemOpensSubmenu &&
		(isCrossOrientationOpenKey(key, orientation, rtl) ||
			isCrossOrientationCloseKey(key, orientation, rtl, false))
	) {
		return 'submenu';
	}
	if (orientation === 'horizontal' && !hasActiveItem) return 'enter-list';
	// Otherwise the cross-axis keys move the caret. On an empty input they fall through so they
	// can still close a submenu.
	return hasValue ? 'edit' : 'navigate';
}

export interface MenuFilterKeyDownContext {
	readonly store: MenuStore;
	readonly orientation: MenuOrientation;
	readonly rtl: boolean;
}

/**
 * Routes keys for a filterable menu's input, which holds real focus while the list is navigated
 * with `aria-activedescendant`. Navigation runs the menu's list navigation handler directly.
 */
export function handleMenuFilterKeyDown(
	context: MenuFilterKeyDownContext,
	event: KeyboardEvent,
	hasValue: boolean
) {
	const { store, orientation, rtl } = context;
	// As a plain menu, ignore keys while the popup animates out with the input still focused.
	if (!store.open) return;
	const activeItem = store.highlightedItem;
	const navigate = store.inputProps.onkeydown as ((event: KeyboardEvent) => void) | undefined;
	const action = getMenuFilterKeyAction(event, {
		orientation,
		rtl,
		hasActiveItem: activeItem != null,
		activeItemOpensSubmenu: activeItem?.hasAttribute('aria-haspopup') ?? false,
		hasValue
	});

	switch (action) {
		case 'edit':
			event.stopPropagation();
			// Typing ends pointer modality, so a result change that moves the highlighted item out
			// from under a resting pointer keeps the highlight.
			if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
				navigate?.(event);
			}
			break;
		case 'navigate':
			// The popup's list navigation must not move the virtual cursor a second time.
			if (isMainOrientationKey(event.key, orientation)) event.stopPropagation();
			navigate?.(event);
			break;
		case 'enter-list': {
			event.stopPropagation();
			const items = store.items.elements;
			const index =
				event.key === 'ArrowDown'
					? getMinListIndex(items, NO_DISABLED)
					: getMaxListIndex(items, NO_DISABLED);
			if (items[index]) {
				event.preventDefault();
				store.setActiveIndex(index, REASONS.keyboard, event);
			}
			break;
		}
		case 'submenu': {
			// The item's own handlers decide, since opening depends on both menus' orientations.
			stopEvent(event);
			const KeyboardEventConstructor = ownerWindow(activeItem).KeyboardEvent;
			activeItem!.dispatchEvent(new KeyboardEventConstructor(event.type, event));
			break;
		}
		case 'activate':
			event.preventDefault();
			dispatchClick(activeItem!, event);
			break;
		case 'close': {
			// Shift+Tab closes the popup and returns focus. A submenu returns to the element that held
			// focus in its parent, which is the parent's input when the parent is filterable too.
			stopEvent(event);
			const returnElement =
				(store.parent.type === 'menu' && store.submenu?.getReturnElement()) ||
				store.activeTriggerElement;
			const details = createChangeEventDetails(REASONS.focusOut, event);
			store.setOpen(false, details as never);
			if (!details.isCanceled && isHTMLElement(returnElement)) returnElement.focus();
			break;
		}
		default:
			break;
	}
}
