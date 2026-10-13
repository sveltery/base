// Derived from Base UI v1.9.0 packages/react/src/drawer/popup/DrawerPopupCssVars.ts,
// popup/DrawerPopupDataAttributes.ts, backdrop/DrawerBackdropCssVars.ts,
// viewport/DrawerViewportCssVars.ts, swipe-area/DrawerSwipeAreaDataAttributes.ts,
// content/drawerContentAttribute.ts, and the parts' state mappings
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { popupStateMapping } from '../internal/popupStateMapping.js';
import {
	transitionStatusMapping,
	type StateAttributesMapping
} from '../internal/state-attributes.js';
import type { TransitionStatusValue } from '../internal/useTransitionStatus.svelte.js';
import type { SwipeDirection } from '../internal/useSwipeDismiss.svelte.js';

export const DrawerPopupCssVars = {
	/** The number of nested drawers that are open. */
	nestedDrawers: '--nested-drawers',
	/** The height of the drawer popup. */
	height: '--drawer-height',
	/** The height of the frontmost open drawer in the nested drawer stack. */
	frontmostHeight: '--drawer-frontmost-height',
	/** The swipe movement on the X axis. */
	swipeMovementX: '--drawer-swipe-movement-x',
	/** The swipe movement on the Y axis. */
	swipeMovementY: '--drawer-swipe-movement-y',
	/** The snap point offset used to translate the drawer. */
	snapPointOffset: '--drawer-snap-point-offset',
	/** A scalar (0.1 to 1) that scales the swipe release transition duration. */
	swipeStrength: '--drawer-swipe-strength'
} as const;

export const DrawerBackdropCssVars = {
	/** The swipe progress of the drawer gesture. */
	swipeProgress: '--drawer-swipe-progress'
} as const;

export const DrawerViewportCssVars = {
	/** The software keyboard inset. Set only inside `Drawer.VirtualKeyboardProvider`. */
	keyboardInset: '--drawer-keyboard-inset'
} as const;

export const DrawerPopupDataAttributes = {
	open: 'data-open',
	closed: 'data-closed',
	startingStyle: 'data-starting-style',
	endingStyle: 'data-ending-style',
	/** Present at the expanded (full-height) snap point. */
	expanded: 'data-expanded',
	/** Present when a nested drawer is open. */
	nestedDrawerOpen: 'data-nested-drawer-open',
	/** Present when a nested drawer is being swiped. */
	nestedDrawerSwiping: 'data-nested-drawer-swiping',
	/** Present when the drawer is dismissed by swiping. */
	swipeDismiss: 'data-swipe-dismiss',
	/** `up`, `down`, `left`, or `right`. */
	swipeDirection: 'data-swipe-direction',
	/** Present while the drawer is being swiped. */
	swiping: 'data-swiping'
} as const;

export const DrawerSwipeAreaDataAttributes = {
	open: 'data-open',
	closed: 'data-closed',
	disabled: 'data-disabled',
	swipeDirection: 'data-swipe-direction',
	swiping: 'data-swiping'
} as const;

export const DRAWER_CONTENT_ATTRIBUTE = 'data-drawer-content';

export interface DrawerPopupStateFields {
	open: boolean;
	transitionStatus: TransitionStatusValue;
	expanded: boolean;
	nested: boolean;
	nestedDrawerOpen: boolean;
	nestedDrawerSwiping: boolean;
	swipeDirection: SwipeDirection;
	swiping: boolean;
}

export const drawerPopupStateAttributesMapping: StateAttributesMapping<DrawerPopupStateFields> = {
	open: popupStateMapping.open,
	transitionStatus: transitionStatusMapping.transitionStatus,
	expanded: (value) => (value ? { [DrawerPopupDataAttributes.expanded]: '' } : null),
	nestedDrawerOpen: (value) =>
		value ? { [DrawerPopupDataAttributes.nestedDrawerOpen]: '' } : null,
	nestedDrawerSwiping: (value) =>
		value ? { [DrawerPopupDataAttributes.nestedDrawerSwiping]: '' } : null,
	swipeDirection: (value) => ({ [DrawerPopupDataAttributes.swipeDirection]: value }),
	swiping: (value) => (value ? { [DrawerPopupDataAttributes.swiping]: '' } : null)
};

export const drawerSwipeAreaStateAttributesMapping: StateAttributesMapping<{
	open: boolean;
	swiping: boolean;
	swipeDirection: SwipeDirection;
	disabled: boolean;
}> = {
	open: popupStateMapping.open,
	swiping: (value) => (value ? { [DrawerSwipeAreaDataAttributes.swiping]: '' } : null),
	swipeDirection: (value) => ({ [DrawerSwipeAreaDataAttributes.swipeDirection]: value }),
	disabled: (value) => (value ? { [DrawerSwipeAreaDataAttributes.disabled]: '' } : null)
};

export const drawerIndentStateAttributesMapping: StateAttributesMapping<{ active: boolean }> = {
	active: (value): Record<string, string> =>
		value ? { 'data-active': '' } : { 'data-inactive': '' }
};

/**
 * Sets inline style properties one by one, so a swipe's imperative writes survive.
 * `undefined` removes a property this helper set before, and puts back the value the
 * consumer's own `style` gives it. Returns the keys it set.
 */
export function applyStyleProperties(
	element: HTMLElement,
	styles: Record<string, string | undefined>,
	previous: ReadonlySet<string>,
	consumerStyle: string | null | undefined
): Set<string> {
	const written = new Set<string>();
	let declared: CSSStyleDeclaration | undefined;
	const release = (name: string) => {
		if (!declared) {
			declared = element.ownerDocument.createElement('div').style;
			declared.cssText = consumerStyle ?? '';
		}
		const value = declared.getPropertyValue(name);
		if (value) element.style.setProperty(name, value);
		else element.style.removeProperty(name);
	};
	for (const [name, value] of Object.entries(styles)) {
		if (value === undefined) {
			if (previous.has(name)) release(name);
			continue;
		}
		element.style.setProperty(name, value);
		written.add(name);
	}
	for (const name of previous) {
		if (!(name in styles)) release(name);
	}
	return written;
}
