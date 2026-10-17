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
import type { RenderSnippet } from '../internal/render-children.js';
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

export interface MenuActions {
	unmount: () => void;
	close: () => void;
}

export interface MenuRootProps<Payload = unknown> {
	/**
	 * Whether the menu is currently open.
	 * @default false
	 */
	open?: boolean;
	/** Event handler called when the menu is opened or closed. */
	onOpenChange?: (open: boolean, details: MenuChangeEventDetails) => void;
	/** Event handler called after any animations complete when the menu is opened or closed. */
	onOpenChangeComplete?: (open: boolean) => void;
	/**
	 * Callback fired when an item is highlighted or unhighlighted.
	 * Receives the highlighted item element (or `undefined` if no item is highlighted) and details
	 * containing the reason for the change, the event, and the item's text label.
	 * The `reason` can be:
	 * - `'keyboard'`: the highlight changed due to keyboard navigation.
	 * - `'pointer'`: the highlight changed due to pointer hovering. The event may be a `MouseEvent`
	 *   rather than a `PointerEvent`.
	 * - `'none'`: the highlight changed for another reason, such as automatic highlighting while
	 *   filtering, the item list changing, or the popup opening or closing.
	 */
	onItemHighlighted?: (
		highlightedItem: HTMLElement | undefined,
		details: MenuHighlightEventDetails
	) => void;
	/**
	 * Whether to loop keyboard focus back to the first item
	 * when the end of the list is reached while using the arrow keys.
	 * @default true
	 */
	loopFocus?: boolean;
	/**
	 * Whether moving the pointer over items should highlight them.
	 * Disabling this prop allows CSS `:hover` to be differentiated from the `:focus` (`data-highlighted`) state.
	 * @default true
	 */
	highlightItemOnHover?: boolean;
	/**
	 * Determines if the menu enters a modal state when open.
	 * - `true`: user interaction is limited to the menu: document page scroll is locked and pointer interactions on outside elements are disabled.
	 * - `false`: user interaction with the rest of the document is allowed.
	 *
	 * On touch devices, a `true` modal blocks outside taps but leaves the page scrollable unless the popup spans nearly the full viewport width, matching native iOS behavior.
	 *
	 * Nested menus ignore this prop, and menus opened by hover are never modal.
	 * @default true
	 */
	modal?: boolean;
	/**
	 * The visual orientation of the menu.
	 * Controls whether roving focus uses up/down or left/right arrow keys.
	 * @default 'vertical'
	 */
	orientation?: MenuOrientation;
	/**
	 * Whether the component should ignore user interaction.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * When in a submenu, determines whether pressing the Escape key
	 * closes the entire menu, or only the current child menu.
	 * @default false
	 */
	closeParentOnEsc?: boolean;
	/**
	 * ID of the trigger that the menu is associated with.
	 * This is useful in conjunction with `bind:open` to create a controlled menu.
	 * There's no need to specify this prop when the menu is uncontrolled (that is, when `open` is not bound).
	 */
	triggerId?: string | null;
	/**
	 * A handle to associate the menu with a trigger.
	 * If specified, allows external triggers to control the menu's open state.
	 */
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
	/**
	 * Whether the component should ignore user interaction.
	 *  @default false
	 */
	disabled?: boolean | null;
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `false` if the rendered element is not a button (for example, `<div>`).
	 * @default true
	 */
	nativeButton?: boolean;
	/** A handle to associate the trigger with a menu. */
	handle?: MenuHandle<Payload>;
	/** A payload to pass to the menu when it is opened. */
	payload?: Payload;
	id?: string | null;
	/** Whether the menu should also open when the trigger is hovered. */
	openOnHover?: boolean;
	/**
	 * How long to wait before the menu may be opened on hover. Specified in milliseconds.
	 *
	 * Requires the `openOnHover` prop.
	 * @default 100
	 */
	delay?: number;
	/**
	 * How long to wait before closing the menu that was opened on hover.
	 * Specified in milliseconds.
	 *
	 * Requires the `openOnHover` prop.
	 * @default 0
	 */
	closeDelay?: number;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLButtonAttributes, state: MenuTriggerState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type MenuPortalState = Record<string, never>;

export interface MenuPortalProps extends PortalProps {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
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
	/**
	 * An element to position the popup against.
	 * By default, the popup will be positioned against the trigger.
	 */
	anchor?: AnchorPositioningParameters['anchor'];
	/**
	 * Determines which CSS `position` property to use.
	 *  @default 'absolute'
	 */
	positionMethod?: AnchorPositioningParameters['positionMethod'];
	/**
	 * Which side of the anchor element to align the popup against.
	 * May automatically change to avoid collisions.
	 *
	 * Submenus and vertical menubars default to `'inline-end'`.
	 * @default 'bottom'
	 */
	side?: Side;
	/**
	 * How to align the popup relative to the specified side.
	 *
	 * Submenus and menubars default to `'start'`.
	 * @default 'center'
	 */
	align?: Align;
	/**
	 * Distance between the anchor and the popup in pixels.
	 * Also accepts a function that returns the distance to read the dimensions of the anchor
	 * and positioner elements, along with its side and alignment.
	 *
	 * The function takes a `data` object parameter with the following properties:
	 * - `data.anchor`: the dimensions of the anchor element with properties `width` and `height`.
	 * - `data.positioner`: the dimensions of the positioner element with properties `width` and `height`.
	 * - `data.side`: which side of the anchor element the positioner is aligned against.
	 * - `data.align`: how the positioner is aligned relative to the specified side.
	 * @default 0
	 */
	sideOffset?: AnchorPositioningParameters['sideOffset'];
	/**
	 * Additional offset along the alignment axis in pixels.
	 * Also accepts a function that returns the offset to read the dimensions of the anchor
	 * and positioner elements, along with its side and alignment.
	 *
	 * The function takes a `data` object parameter with the following properties:
	 * - `data.anchor`: the dimensions of the anchor element with properties `width` and `height`.
	 * - `data.positioner`: the dimensions of the positioner element with properties `width` and `height`.
	 * - `data.side`: which side of the anchor element the positioner is aligned against.
	 * - `data.align`: how the positioner is aligned relative to the specified side.
	 * @default 0
	 */
	alignOffset?: AnchorPositioningParameters['alignOffset'];
	/**
	 * An element or a rectangle that delimits the area that the popup is confined to.
	 *  @default 'clipping-ancestors'
	 */
	collisionBoundary?: AnchorPositioningParameters['collisionBoundary'];
	/**
	 * Additional space to maintain from the edge of the collision boundary.
	 *  @default 5
	 */
	collisionPadding?: AnchorPositioningParameters['collisionPadding'];
	/**
	 * Minimum distance to maintain between the arrow and the edges of the popup.
	 *
	 * Use it to prevent the arrow element from hanging out of the rounded corners of a popup.
	 * @default 5
	 */
	arrowPadding?: number;
	/**
	 * Whether to maintain the popup in the viewport after
	 * the anchor element was scrolled out of view.
	 * @default false
	 */
	sticky?: boolean;
	/**
	 * Whether to disable the popup from tracking any layout shift of its positioning anchor.
	 * @default false
	 */
	disableAnchorTracking?: boolean;
	/**
	 * Determines how to handle collisions when positioning the popup.
	 *
	 * `side` controls overflow on the preferred placement axis (`top`/`bottom` or `left`/`right`):
	 * - `'flip'`: keep the requested side when it fits; otherwise try the opposite side
	 *   (`top` and `bottom`, or `left` and `right`).
	 * - `'shift'`: never change side; keep the requested side and move the popup within
	 *   the clipping boundary so it stays visible.
	 * - `'none'`: do not correct side-axis overflow.
	 *
	 * `align` controls overflow on the alignment axis (`start`/`center`/`end`):
	 * - `'flip'`: keep side, but swap `start` and `end` when the requested alignment overflows.
	 * - `'shift'`: keep side and requested alignment, then nudge the popup along the
	 *   alignment axis to fit.
	 * - `'none'`: do not correct alignment-axis overflow.
	 *
	 * `fallbackAxisSide` controls fallback behavior on the perpendicular axis when the
	 * preferred axis cannot fit:
	 * - `'start'`: allow perpendicular fallback and try the logical start side first
	 *   (`top` before `bottom`, or `left` before `right` in LTR).
	 * - `'end'`: allow perpendicular fallback and try the logical end side first
	 *   (`bottom` before `top`, or `right` before `left` in LTR).
	 * - `'none'`: do not fallback to the perpendicular axis.
	 *
	 * When `side` is `'shift'`, explicitly setting `align` only supports `'shift'` or `'none'`.
	 * If `align` is omitted, it defaults to `'flip'`.
	 */
	collisionAvoidance?: AnchorPositioningParameters['collisionAvoidance'];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, MenuPositionerState>;
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
	 * Determines the element to focus when the menu is closed.
	 *
	 * - `false`: Do not move focus.
	 * - `true`: Move focus based on the default behavior (trigger or previously focused element).
	 * - `HTMLElement`: Move focus to that element.
	 * - `function`: Called with the interaction type (`mouse`, `touch`, `pen`, or `keyboard`).
	 *   Return an element to focus, `true` to use the default behavior, or `false`/`undefined` to do nothing.
	 */
	finalFocus?: FocusTarget;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, MenuPopupState>;
	children?: Snippet;
}

export interface MenuArrowState {
	open: boolean;
	side: Side;
	align: Align;
	uncentered: boolean;
}

export interface MenuArrowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, MenuArrowState>;
	children?: Snippet;
}

export interface MenuBackdropState {
	open: boolean;
	transitionStatus: TransitionStatusValue;
}

export interface MenuBackdropProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, MenuBackdropState>;
	children?: Snippet;
}

export interface MenuViewportState {
	/** Direction from the previous trigger to the new one, such as `'right down'`. */
	activationDirection: string | undefined;
	transitioning: boolean;
	instant: MenuInstant | undefined;
}

export interface MenuViewportProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, MenuViewportState>;
	children?: Snippet;
}

interface ItemCommonProps {
	/**
	 * Overrides the text used for keyboard text navigation and filtering.
	 * Falls back to the rendered text when not provided.
	 */
	label?: string;
	id?: string | null;
}

export interface MenuItemState {
	disabled: boolean;
	highlighted: boolean;
}

export interface MenuItemProps
	extends ItemCommonProps, Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
	/**
	 * Whether the component should ignore user interaction.
	 *  @default false
	 */
	disabled?: boolean | null;
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `true` if the rendered element is a native button.
	 * @default false
	 */
	nativeButton?: boolean;
	/**
	 * Whether to close the menu when the item is clicked.
	 * @default true
	 */
	closeOnClick?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, MenuItemState>;
	children?: Snippet;
}

export interface MenuLinkItemState {
	highlighted: boolean;
}

export interface MenuLinkItemProps
	extends ItemCommonProps, Omit<HTMLAnchorAttributes, 'children' | 'id'> {
	/**
	 * Whether to close the menu when the item is clicked.
	 * @default false
	 */
	closeOnClick?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
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
	 * Whether the checkbox item is currently ticked.
	 *
	 * To render an uncontrolled checkbox item, pass `checked` without `bind:`.
	 * @default false
	 */
	checked?: boolean;
	/** Event handler called when the checkbox item is ticked or unticked. */
	onCheckedChange?: (checked: boolean, details: MenuChangeEventDetails) => void;
	/**
	 * Whether the component should ignore user interaction.
	 *  @default false
	 */
	disabled?: boolean | null;
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `true` if the rendered element is a native button.
	 *  @default false
	 */
	nativeButton?: boolean;
	/**
	 * Whether to close the menu when the item is clicked.
	 * @default false
	 */
	closeOnClick?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, MenuCheckboxItemState>;
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
	/**
	 * Whether to keep the HTML element in the DOM when the checkbox item is not checked.
	 * @default false
	 */
	keepMounted?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLSpanElement, MenuItemIndicatorState>;
	children?: Snippet;
}

export type MenuCheckboxItemIndicatorProps = MenuItemIndicatorProps;
export interface MenuRadioItemIndicatorProps extends Omit<MenuItemIndicatorProps, 'keepMounted'> {
	/** Whether to keep the HTML element in the DOM when the radio item is inactive. */
	keepMounted?: boolean;
}

export type MenuGroupState = Record<string, never>;

export interface MenuGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, MenuGroupState>;
	children?: Snippet;
}

export type MenuGroupLabelState = Record<string, never>;

export interface MenuGroupLabelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, MenuGroupLabelState>;
	children?: Snippet;
}

export interface MenuRadioGroupState {
	disabled: boolean;
}

export interface MenuRadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * The value of the radio item that should be currently selected.
	 *
	 * To render an uncontrolled radio group, pass `value` without `bind:`.
	 */
	value?: unknown;
	/** Function called when the selected value changes. */
	onValueChange?: (value: unknown, details: MenuChangeEventDetails) => void;
	/**
	 * Whether the component should ignore user interaction.
	 *  @default false
	 */
	disabled?: boolean | null;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, MenuRadioGroupState>;
	children?: Snippet;
}

export interface MenuRadioItemState {
	disabled: boolean;
	highlighted: boolean;
	checked: boolean;
}

export interface MenuRadioItemProps
	extends ItemCommonProps, Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
	/**
	 * Value of the radio item.
	 * This is the value that will be set in the Menu.RadioGroup when the item is selected.
	 */
	value: unknown;
	/**
	 * Whether the component should ignore user interaction.
	 *  @default false
	 */
	disabled?: boolean | null;
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `true` if the rendered element is a native button.
	 *  @default false
	 */
	nativeButton?: boolean;
	/**
	 * Whether to close the menu when the item is clicked.
	 * @default false
	 */
	closeOnClick?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, MenuRadioItemState>;
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
	/**
	 * Whether the component should ignore user interaction.
	 *  @default false
	 */
	disabled?: boolean | null;
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `true` if the rendered element is a native button.
	 *  @default false
	 */
	nativeButton?: boolean;
	/**
	 * Whether the menu should also open when the trigger is hovered.
	 * @default true
	 */
	openOnHover?: boolean;
	/**
	 * How long to wait before the menu may be opened on hover. Specified in milliseconds.
	 *
	 * Requires the `openOnHover` prop.
	 * @default 100
	 */
	delay?: number;
	/**
	 * How long to wait before closing the menu that was opened on hover.
	 * Specified in milliseconds.
	 *
	 * Requires the `openOnHover` prop.
	 * @default 0
	 */
	closeDelay?: number;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, MenuSubmenuTriggerState>;
	children?: Snippet;
}

export interface MenuFilterProviderProps {
	/**
	 * The filter query.
	 * When the popup closes, `onValueChange` is called with an empty query.
	 *
	 * To render an uncontrolled filter, pass `value` without `bind:`.
	 * @default ''
	 */
	value?: string;
	/** Event handler called when the filter query changes. */
	onValueChange?: (value: string, details: MenuFilterChangeEventDetails) => void;
	/**
	 * MenuFilter function used to match items against the query. Receives each item's `label` (or its rendered text) and the trimmed query, and keeps the item when it returns `true`. By default, items match when they contain the query, ignoring case, accents, and punctuation. Pass `null` when rendering filtered items yourself.
	 */
	filter?: MenuFilterFunction | null;
	/**
	 * Whether filtering highlights the first matching item automatically.
	 * - `true`: highlight it while the query is not empty.
	 * - `'always'`: highlight it even when the query is empty.
	 *
	 * Opening the menu from the keyboard highlights the first item either way, and the arrow keys
	 * can move the highlight to another item. With either value, the arrow keys wrap within the
	 * list rather than returning to the input, and with `'always'` a pointer highlight stays when
	 * the pointer leaves.
	 * @default false
	 */
	autoHighlight?: boolean | 'always';
	/**
	 * The locale the default `filter` uses for string comparison.
	 * Defaults to the user's runtime locale.
	 */
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
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<[props: HTMLInputAttributes, state: MenuInputState, children: RenderChildren]>;
}

export interface MenuClearState {
	disabled: boolean;
}

export interface MenuClearProps extends Omit<HTMLButtonAttributes, 'children' | 'disabled'> {
	/**
	 * Whether the component should ignore user interaction.
	 *  @default false
	 */
	disabled?: boolean | null;
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `false` if the rendered element is not a button (for example, `<div>`).
	 * @default true
	 */
	nativeButton?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<[props: HTMLButtonAttributes, state: MenuClearState, children: RenderChildren]>;
	children?: Snippet;
}

export type MenuEmptyState = Record<string, never>;

export interface MenuEmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, MenuEmptyState>;
	children?: Snippet;
}

export type MenuListState = Record<string, never>;

export interface MenuListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, MenuListState>;
	children?: Snippet;
}
