// Derived from Base UI v1.9.0 packages/react/src/context-menu/root/ContextMenuRoot.tsx,
// trigger/ContextMenuTrigger.tsx, positioner/ContextMenuPositioner.tsx and index.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { RenderChildren } from '../internal/render-children.js';
import type {
	MenuActions,
	MenuArrowProps,
	MenuArrowState,
	MenuBackdropProps,
	MenuBackdropState,
	MenuChangeEventDetails,
	MenuChangeReason,
	MenuCheckboxItemIndicatorProps,
	MenuCheckboxItemIndicatorState,
	MenuCheckboxItemProps,
	MenuCheckboxItemState,
	MenuGroupLabelProps,
	MenuGroupLabelState,
	MenuGroupProps,
	MenuGroupState,
	MenuItemProps,
	MenuItemState,
	MenuLinkItemProps,
	MenuLinkItemState,
	MenuPopupProps,
	MenuPopupState,
	MenuPortalProps,
	MenuPortalState,
	MenuPositionerProps,
	MenuPositionerState,
	MenuRadioGroupProps,
	MenuRadioGroupState,
	MenuRadioItemIndicatorProps,
	MenuRadioItemIndicatorState,
	MenuRadioItemProps,
	MenuRadioItemState,
	MenuRootProps,
	MenuSubmenuRootProps,
	MenuSubmenuTriggerProps,
	MenuSubmenuTriggerState
} from '../menu/types.js';

export type ContextMenuRootState = Record<string, never>;
export type ContextMenuRootActions = MenuActions;
export type ContextMenuRootChangeEventReason = MenuChangeReason;
export type ContextMenuRootChangeEventDetails = MenuChangeEventDetails;

/**
 * Context menus open from a right click or long press on their trigger area, not from a
 * registered trigger, so the detached-trigger, hover and modal props of `Menu.Root` do not apply.
 * A context menu is always modal.
 */
export interface ContextMenuRootProps extends Omit<
	MenuRootProps,
	'handle' | 'triggerId' | 'modal' | 'closeParentOnEsc' | 'children'
> {
	children?: Snippet;
}

export interface ContextMenuTriggerState {
	/** Whether the context menu is currently open. */
	open: boolean;
}

export interface ContextMenuTriggerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: Snippet<
		[
			props: HTMLAttributes<HTMLDivElement>,
			state: ContextMenuTriggerState,
			children: RenderChildren
		]
	>;
	children?: Snippet;
}

export type ContextMenuPositionerState = MenuPositionerState;

/**
 * `Menu.Positioner` props. Root context menus position against the pointer and always use
 * `position: fixed`, so `positionMethod` is not offered.
 */
export interface ContextMenuPositionerProps extends Omit<
	MenuPositionerProps,
	'positionMethod' | 'side' | 'align' | 'sideOffset' | 'alignOffset' | 'arrowPadding'
> {
	/**
	 * Which side of the anchor to place the popup on. May change to avoid collisions.
	 * Submenus default to `'inline-end'`.
	 * @default 'bottom'
	 */
	side?: MenuPositionerProps['side'];
	/** How to align the popup against the side. @default 'start' */
	align?: MenuPositionerProps['align'];
	/**
	 * Distance between the anchor and the popup in pixels, or a function of the layout.
	 * Defaults to `-5` for root context menus when `side` is not set and `align` is not
	 * `'center'`, and to `0` otherwise.
	 */
	sideOffset?: MenuPositionerProps['sideOffset'];
	/**
	 * Offset along the alignment axis in pixels, or a function of the layout.
	 * Defaults to `2` for root context menus when `side` is not set and `align` is not
	 * `'center'`, and to `0` otherwise.
	 */
	alignOffset?: MenuPositionerProps['alignOffset'];
	/** Minimum distance between the arrow and the popup edges. Root context menus always use `0`. Submenus default to `5`. */
	arrowPadding?: MenuPositionerProps['arrowPadding'];
}

export type {
	MenuBackdropProps as ContextMenuBackdropProps,
	MenuBackdropState as ContextMenuBackdropState,
	MenuPortalProps as ContextMenuPortalProps,
	MenuPortalState as ContextMenuPortalState,
	MenuPopupProps as ContextMenuPopupProps,
	MenuPopupState as ContextMenuPopupState,
	MenuArrowProps as ContextMenuArrowProps,
	MenuArrowState as ContextMenuArrowState,
	MenuGroupProps as ContextMenuGroupProps,
	MenuGroupState as ContextMenuGroupState,
	MenuGroupLabelProps as ContextMenuGroupLabelProps,
	MenuGroupLabelState as ContextMenuGroupLabelState,
	MenuItemProps as ContextMenuItemProps,
	MenuItemState as ContextMenuItemState,
	MenuLinkItemProps as ContextMenuLinkItemProps,
	MenuLinkItemState as ContextMenuLinkItemState,
	MenuCheckboxItemProps as ContextMenuCheckboxItemProps,
	MenuCheckboxItemState as ContextMenuCheckboxItemState,
	MenuCheckboxItemIndicatorProps as ContextMenuCheckboxItemIndicatorProps,
	MenuCheckboxItemIndicatorState as ContextMenuCheckboxItemIndicatorState,
	MenuRadioGroupProps as ContextMenuRadioGroupProps,
	MenuRadioGroupState as ContextMenuRadioGroupState,
	MenuRadioItemProps as ContextMenuRadioItemProps,
	MenuRadioItemState as ContextMenuRadioItemState,
	MenuRadioItemIndicatorProps as ContextMenuRadioItemIndicatorProps,
	MenuRadioItemIndicatorState as ContextMenuRadioItemIndicatorState,
	MenuSubmenuRootProps as ContextMenuSubmenuRootProps,
	MenuSubmenuTriggerProps as ContextMenuSubmenuTriggerProps,
	MenuSubmenuTriggerState as ContextMenuSubmenuTriggerState
};
