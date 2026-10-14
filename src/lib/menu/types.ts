import type { Attachment } from 'svelte/attachments';
import type { Snippet } from 'svelte';
import type {
	HTMLAnchorAttributes,
	HTMLAttributes,
	HTMLButtonAttributes,
	HTMLInputAttributes
} from 'svelte/elements';
import type {
	REASONS,
	BaseUIChangeEventDetails,
	BaseUIHighlightEventDetails
} from '@sveltery/utils';
import type { PortalProps } from '../internal/portal-props.js';
import type { Align, Side, AnchorPositioningParameters } from '../internal/popups/index.js';
import type { RenderChildren } from '../internal/render-children.js';
import type { TransitionStatusValue } from '../internal/useTransitionStatus.svelte.js';
import type {
	MenuFilterChangeEventDetails,
	MenuFilterChangeReason,
	MenuFilterFunction
} from './filter-root.svelte.js';
import type { MenuHandle } from './handle.svelte.js';

export type { Filter, GetFilterParameters } from './filter.js';
export type { MenuFilterChangeEventDetails, MenuFilterChangeReason, MenuFilterFunction };

export type { Align, Side };

export type MenuChangeReason =
	| typeof REASONS.triggerHover
	| typeof REASONS.triggerFocus
	| typeof REASONS.triggerPress
	| typeof REASONS.outsidePress
	| typeof REASONS.focusOut
	| typeof REASONS.listNavigation
	| typeof REASONS.escapeKey
	| typeof REASONS.itemPress
	| typeof REASONS.closePress
	| typeof REASONS.siblingOpen
	| typeof REASONS.cancelOpen
	| typeof REASONS.imperativeAction
	| typeof REASONS.none;

export type MenuChangeEventDetails = BaseUIChangeEventDetails<MenuChangeReason> & {
	/** Keeps the popup mounted until `unmount()` is called on the root. */
	preventUnmountOnClose: () => void;
};

export type MenuHighlightReason =
	typeof REASONS.keyboard | typeof REASONS.pointer | typeof REASONS.none;

export type MenuHighlightEventDetails = BaseUIHighlightEventDetails<
	MenuHighlightReason,
	{
		/** The highlighted item's `label` prop, or its text content when the prop is not set. */
		label: string | undefined;
	}
>;

export type MenuOrientation = 'horizontal' | 'vertical';
export type MenuInstant = 'dismiss' | 'click' | 'group' | 'trigger-change';

type FocusTarget =
	boolean | HTMLElement | null | ((interaction: string) => void | boolean | HTMLElement | null);

type PartRender<Element extends EventTarget, State> = Snippet<
	[props: HTMLAttributes<Element>, state: State, children: RenderChildren]
>;

export interface MenuActions {
	unmount: () => void;
	close: () => void;
}

export interface MenuRootProps<Payload = unknown> {
	/**
	 * Whether the menu is open.
	 * Use `bind:open` to share it with the parent.
	 * A value passed without `bind:` holds until the parent changes it.
	 * @default false
	 */
	open?: boolean;
	/** Called before the open state changes. Call `eventDetails.cancel()` to veto it. */
	onOpenChange?: (open: boolean, details: MenuChangeEventDetails) => void;
	/** Called after the open or close animation finishes. */
	onOpenChangeComplete?: (open: boolean) => void;
	/**
	 * Called when an item is highlighted or unhighlighted.
	 * Receives the highlighted item element, or `undefined` when no item is highlighted,
	 * and details with the reason, the event, and the item's text label.
	 * The reason is `'keyboard'`, `'pointer'`, or `'none'` for anything else, such as the
	 * list changing or the popup opening or closing.
	 */
	onItemHighlighted?: (
		highlightedItem: HTMLElement | undefined,
		details: MenuHighlightEventDetails
	) => void;
	/**
	 * Whether to loop keyboard focus back to the first item at the end of the list.
	 * @default true
	 */
	loopFocus?: boolean;
	/**
	 * Whether moving the pointer over items highlights them.
	 * Turn it off to tell CSS `:hover` apart from `[data-highlighted]`.
	 * @default true
	 */
	highlightItemOnHover?: boolean;
	/**
	 * Whether the menu limits interaction to itself while open: page scroll is locked and
	 * outside pointer interaction is blocked. Nested menus ignore it, and menus opened by hover
	 * are never modal.
	 * @default true
	 */
	modal?: boolean;
	/**
	 * The visual orientation of the menu. Controls whether the up/down or left/right arrow keys move
	 * the highlight.
	 * @default 'vertical'
	 */
	orientation?: MenuOrientation;
	/**
	 * Whether the menu ignores user interaction.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * In a submenu, whether Escape closes the whole menu or only the submenu.
	 * @default false
	 */
	closeParentOnEsc?: boolean;
	/**
	 * Id of the trigger that owns the menu. A string wins over the trigger that opened it.
	 */
	triggerId?: string | null;
	/** Associates detached triggers and imperative `open` and `close`. */
	handle?: MenuHandle<Payload>;
	children?: Snippet<[{ payload: Payload | undefined }]>;
}

export interface MenuTriggerState {
	/** Whether the menu is open and was opened by this trigger. */
	open: boolean;
	disabled: boolean;
}

export interface MenuTriggerProps<Payload = unknown> extends Omit<
	HTMLButtonAttributes,
	'children' | 'disabled' | 'id'
> {
	/** @default false */
	disabled?: boolean | null;
	/**
	 * Whether the host is a native `<button>`.
	 * Set `false` when `render` supplies a non-button element.
	 * @default true
	 */
	nativeButton?: boolean;
	handle?: MenuHandle<Payload>;
	/** A payload passed to the menu while this trigger owns it. */
	payload?: Payload;
	id?: string | null;
	/** Whether the menu also opens when the trigger is hovered. */
	openOnHover?: boolean;
	/** Hover open delay in milliseconds. Requires `openOnHover`. @default 100 */
	delay?: number;
	/** Hover close delay in milliseconds. Requires `openOnHover`. @default 0 */
	closeDelay?: number;
	render?: Snippet<
		[props: HTMLButtonAttributes, state: MenuTriggerState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type MenuPortalState = Record<string, never>;

export interface MenuPortalProps extends PortalProps {
	/**
	 * Replace the portal element. The snippet receives host props, an empty state, and the children.
	 * Host props include the move attachment.
	 */
	render?: Snippet<
		[
			props: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>>,
			state: MenuPortalState,
			children: RenderChildren
		]
	>;
}

export interface MenuPositionerState {
	open: boolean;
	side: Side;
	align: Align;
	anchorHidden: boolean;
	/** Whether the menu is a submenu. */
	nested: boolean;
	instant: MenuInstant | undefined;
}

export interface MenuPositionerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** An element to position the popup against. Defaults to the trigger. */
	anchor?: AnchorPositioningParameters['anchor'];
	/** @default 'absolute' */
	positionMethod?: AnchorPositioningParameters['positionMethod'];
	/**
	 * Which side of the anchor to place the popup on. May change to avoid collisions.
	 * Submenus and vertical menubars default to `'inline-end'`.
	 * @default 'bottom'
	 */
	side?: Side;
	/**
	 * How to align the popup against the side. Submenus and menubars default to `'start'`.
	 * @default 'center'
	 */
	align?: Align;
	/** Distance between the anchor and the popup in pixels, or a function of the layout. @default 0 */
	sideOffset?: AnchorPositioningParameters['sideOffset'];
	/** Offset along the alignment axis in pixels, or a function of the layout. @default 0 */
	alignOffset?: AnchorPositioningParameters['alignOffset'];
	/** @default 'clipping-ancestors' */
	collisionBoundary?: AnchorPositioningParameters['collisionBoundary'];
	/** @default 5 */
	collisionPadding?: AnchorPositioningParameters['collisionPadding'];
	/** Minimum distance between the arrow and the popup edges. @default 5 */
	arrowPadding?: number;
	/** Whether the popup stays in the viewport after the anchor scrolls out of view. @default false */
	sticky?: boolean;
	/** Whether to stop tracking layout shifts of the anchor. @default false */
	disableAnchorTracking?: boolean;
	/**
	 * How to handle collisions. Root menus default to `{ fallbackAxisSide: 'none' }`
	 * and submenus to `{ fallbackAxisSide: 'end' }`.
	 */
	collisionAvoidance?: AnchorPositioningParameters['collisionAvoidance'];
	render?: PartRender<HTMLDivElement, MenuPositionerState>;
	children?: Snippet;
}

export interface MenuPopupState {
	open: boolean;
	side: Side;
	align: Align;
	transitionStatus: TransitionStatusValue;
	/** Whether the menu is a submenu. */
	nested: boolean;
	instant: MenuInstant | undefined;
}

export interface MenuPopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Element to focus when the menu closes.
	 * `false` leaves focus. `true` uses the default (the trigger).
	 * A function receives the close interaction and returns an element, `true`, or `false`.
	 */
	finalFocus?: FocusTarget;
	render?: PartRender<HTMLDivElement, MenuPopupState>;
	children?: Snippet;
}

export interface MenuArrowState {
	open: boolean;
	side: Side;
	align: Align;
	uncentered: boolean;
}

export interface MenuArrowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, MenuArrowState>;
	children?: Snippet;
}

export interface MenuBackdropState {
	open: boolean;
	transitionStatus: TransitionStatusValue;
}

export interface MenuBackdropProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, MenuBackdropState>;
	children?: Snippet;
}

export interface MenuViewportState {
	/** Direction from the previous trigger to the new one, such as `'right down'`. */
	activationDirection: string | undefined;
	transitioning: boolean;
	instant: MenuInstant | undefined;
}

export interface MenuViewportProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, MenuViewportState>;
	children?: Snippet;
}

interface ItemCommonProps {
	/** Text used by keyboard typeahead. Defaults to the item's text content. */
	label?: string;
	id?: string | null;
}

export interface MenuItemState {
	disabled: boolean;
	highlighted: boolean;
}

export interface MenuItemProps
	extends ItemCommonProps, Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
	/** @default false */
	disabled?: boolean | null;
	/**
	 * Whether the host is a native `<button>`. Set `true` when `render` supplies a button.
	 * @default false
	 */
	nativeButton?: boolean;
	/** Whether clicking the item closes the menu. @default true */
	closeOnClick?: boolean;
	render?: PartRender<HTMLDivElement, MenuItemState>;
	children?: Snippet;
}

export interface MenuLinkItemState {
	highlighted: boolean;
}

export interface MenuLinkItemProps
	extends ItemCommonProps, Omit<HTMLAnchorAttributes, 'children' | 'id'> {
	/** Whether clicking the link closes the menu. @default false */
	closeOnClick?: boolean;
	render?: Snippet<
		[props: HTMLAnchorAttributes, state: MenuLinkItemState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface MenuCheckboxItemState {
	disabled: boolean;
	highlighted: boolean;
	checked: boolean;
}

export interface MenuCheckboxItemProps
	extends ItemCommonProps, Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
	/**
	 * Whether the item is ticked.
	 * Use `bind:checked` to share it with the parent.
	 * @default false
	 */
	checked?: boolean;
	/** Called before the checked state changes. Call `eventDetails.cancel()` to veto it. */
	onCheckedChange?: (checked: boolean, details: MenuChangeEventDetails) => void;
	/** @default false */
	disabled?: boolean | null;
	/** @default false */
	nativeButton?: boolean;
	/** Whether clicking the item closes the menu. @default false */
	closeOnClick?: boolean;
	render?: PartRender<HTMLDivElement, MenuCheckboxItemState>;
	children?: Snippet;
}

export interface MenuItemIndicatorState {
	checked: boolean;
	disabled: boolean;
	highlighted: boolean;
	transitionStatus: TransitionStatusValue;
}

export type MenuCheckboxItemIndicatorState = MenuItemIndicatorState;
export type MenuRadioItemIndicatorState = MenuItemIndicatorState;

export interface MenuItemIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/** Whether to keep the element in the DOM while the item is not checked. @default false */
	keepMounted?: boolean;
	render?: PartRender<HTMLSpanElement, MenuItemIndicatorState>;
	children?: Snippet;
}

export type MenuCheckboxItemIndicatorProps = MenuItemIndicatorProps;
export type MenuRadioItemIndicatorProps = MenuItemIndicatorProps;

export type MenuGroupState = Record<string, never>;

export interface MenuGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, MenuGroupState>;
	children?: Snippet;
}

export type MenuGroupLabelState = Record<string, never>;

export interface MenuGroupLabelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, MenuGroupLabelState>;
	children?: Snippet;
}

export interface MenuRadioGroupState {
	disabled: boolean;
}

export interface MenuRadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * The value of the selected radio item.
	 * Use `bind:value` to share it with the parent.
	 */
	value?: unknown;
	/** Called before the value changes. Call `eventDetails.cancel()` to veto it. */
	onValueChange?: (value: unknown, details: MenuChangeEventDetails) => void;
	/** @default false */
	disabled?: boolean | null;
	render?: PartRender<HTMLDivElement, MenuRadioGroupState>;
	children?: Snippet;
}

export interface MenuRadioItemState {
	disabled: boolean;
	highlighted: boolean;
	checked: boolean;
}

export interface MenuRadioItemProps
	extends ItemCommonProps, Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
	/** The value the radio group takes when this item is selected. */
	value: unknown;
	/** @default false */
	disabled?: boolean | null;
	/** @default false */
	nativeButton?: boolean;
	/** Whether clicking the item closes the menu. @default false */
	closeOnClick?: boolean;
	render?: PartRender<HTMLDivElement, MenuRadioItemState>;
	children?: Snippet;
}

export interface MenuSubmenuRootProps extends Omit<
	MenuRootProps,
	'modal' | 'handle' | 'triggerId' | 'children'
> {
	children?: Snippet;
}

export interface MenuSubmenuTriggerState {
	disabled: boolean;
	highlighted: boolean;
	/** Whether the submenu is open. */
	open: boolean;
}

export interface MenuSubmenuTriggerProps
	extends ItemCommonProps, Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
	/** @default false */
	disabled?: boolean | null;
	/** @default false */
	nativeButton?: boolean;
	/** Whether the submenu opens when the trigger is hovered. @default true */
	openOnHover?: boolean;
	/** Hover open delay in milliseconds. @default 100 */
	delay?: number;
	/** Hover close delay in milliseconds. @default 0 */
	closeDelay?: number;
	render?: PartRender<HTMLDivElement, MenuSubmenuTriggerState>;
	children?: Snippet;
}

export interface MenuFilterProviderProps {
	/**
	 * The filter query.
	 * Use `bind:value` to share it with the parent.
	 * A value passed without `bind:` is the initial query. Closing the popup clears the query.
	 * @default ''
	 */
	value?: string;
	/** Called before the query changes. Call `eventDetails.cancel()` to veto it. */
	onValueChange?: (value: string, details: MenuFilterChangeEventDetails) => void;
	/**
	 * Matches items against the query. Receives each item's `label` (or its rendered text) and the
	 * trimmed query, and keeps the item when it returns `true`.
	 * By default, items match when they contain the query, ignoring case, accents and punctuation.
	 * Pass `null` when rendering filtered items yourself.
	 */
	filter?: MenuFilterFunction | null;
	/**
	 * Whether filtering highlights the first matching item.
	 * `true` highlights it while the query is not empty, and `'always'` also when it is empty.
	 * With either value the arrow keys wrap within the list instead of returning to the input.
	 * @default false
	 */
	autoHighlight?: boolean | 'always';
	/** The locale the default `filter` compares with. Defaults to the runtime locale. */
	locale?: Intl.LocalesArgument;
	children?: Snippet;
}

export interface MenuInputState {
	/**
	 * Whether the input shows its focus ring.
	 * Cleared when keyboard navigation highlights an item.
	 */
	highlighted: boolean;
}

export interface MenuInputProps extends Omit<
	HTMLInputAttributes,
	'children' | 'disabled' | 'id' | 'value'
> {
	id?: string | null;
	/** @default false */
	disabled?: boolean | null;
	render?: Snippet<[props: HTMLInputAttributes, state: MenuInputState, children: RenderChildren]>;
}

export interface MenuClearState {
	disabled: boolean;
}

export interface MenuClearProps extends Omit<HTMLButtonAttributes, 'children' | 'disabled'> {
	/** @default false */
	disabled?: boolean | null;
	/**
	 * Whether the host is a native `<button>`.
	 * Set `false` when `render` supplies a non-button element.
	 * @default true
	 */
	nativeButton?: boolean;
	render?: Snippet<[props: HTMLButtonAttributes, state: MenuClearState, children: RenderChildren]>;
	children?: Snippet;
}

export type MenuEmptyState = Record<string, never>;

export interface MenuEmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, MenuEmptyState>;
	children?: Snippet;
}

export type MenuListState = Record<string, never>;

export interface MenuListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, MenuListState>;
	children?: Snippet;
}
