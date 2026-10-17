import type { Snippet } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import type { FullAutoFill, HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { FieldRootState } from '../field/types.js';
import type { ItemsInput } from '../internal/listbox/resolveValueLabel.js';
import type { PortalProps } from '../internal/portal-props.js';
import type { Align, AnchorPositioningParameters, Side } from '../internal/popups/index.js';
import type { RenderSnippet } from '../internal/render-children.js';
import type { TransitionStatusValue } from '../internal/useTransitionStatus.svelte.js';
import type { SeparatorProps, SeparatorState } from '../separator/types.js';

export type { Align, Side };
export type { ItemsInput as SelectItems };

export type SelectChangeReason =
	| typeof REASONS.triggerPress
	| typeof REASONS.outsidePress
	| typeof REASONS.escapeKey
	| typeof REASONS.windowResize
	| typeof REASONS.itemPress
	| typeof REASONS.focusOut
	| typeof REASONS.listNavigation
	| typeof REASONS.cancelOpen
	| typeof REASONS.imperativeAction
	| typeof REASONS.none;

export type SelectChangeEventDetails = BaseUIChangeEventDetails<SelectChangeReason>;

export type SelectOpenChangeEventDetails = SelectChangeEventDetails & {
	/** Keeps the popup mounted until the root's `unmount()` is called. */
	preventUnmountOnClose: () => void;
};

/** The value of a select: one item value or `null`, or an array when `multiple`. */
export type SelectValueOf<Value, Multiple extends boolean | undefined> = Multiple extends true
	? Value[]
	: Value | null;

export interface SelectRootProps<Value = unknown, Multiple extends boolean | undefined = false> {
	/** The value of the select. */
	value?: SelectValueOf<Value, Multiple>;
	/**
	 * The uncontrolled value of the select when it's initially rendered.
	 *
	 * To render a controlled select, use `bind:value` instead.
	 * @default null, or [] when `multiple`
	 */
	defaultValue?: SelectValueOf<Value, Multiple>;
	/** Event handler called when the value of the select changes. */
	onValueChange?: (
		value: SelectValueOf<Value, Multiple>,
		eventDetails: SelectChangeEventDetails
	) => void;
	/**
	 * Whether the select popup is currently open.
	 * @default false
	 */
	open?: boolean;
	/** Event handler called when the select popup is opened or closed. */
	onOpenChange?: (open: boolean, eventDetails: SelectOpenChangeEventDetails) => void;
	/**
	 * Event handler called after any animations complete when the select popup is opened or closed.
	 */
	onOpenChangeComplete?: (open: boolean) => void;
	/** Identifies the field when a form is submitted. */
	name?: string;
	/**
	 * Identifies the form that owns the hidden input.
	 * Useful when the select is rendered outside the form.
	 */
	form?: string;
	/** Provides a hint to the browser for autofill. */
	autocomplete?: FullAutoFill | null;
	/** The id of the Select. */
	id?: string;
	/**
	 * Whether the user must choose a value before submitting a form.
	 * @default false
	 */
	required?: boolean;
	/**
	 * Whether the user should be unable to choose a different option from the select popup.
	 * @default false
	 */
	readonly?: boolean;
	/**
	 * Whether the component should ignore user interaction.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Whether multiple items can be selected.
	 * @default false
	 */
	multiple?: Multiple;
	/**
	 * Whether moving the pointer over items should highlight them.
	 * Disabling this prop allows CSS `:hover` to be differentiated from the `:focus` (`data-highlighted`) state.
	 * @default true
	 */
	highlightItemOnHover?: boolean;
	/**
	 * Determines if the select enters a modal state when open.
	 * - `true`: user interaction is limited to the select: document page scroll is locked and pointer interactions on outside elements are disabled.
	 * - `false`: user interaction with the rest of the document is allowed.
	 *
	 * On touch devices, a `true` modal blocks outside taps but leaves the page scrollable unless the popup spans nearly the full viewport width, matching native iOS behavior.
	 * @default true
	 */
	modal?: boolean;
	/**
	 * Data structure of the items rendered in the select popup.
	 * When specified, `<Select.Value>` renders the label of the selected item instead of the raw value.
	 */
	items?: ItemsInput;
	/**
	 * When the item values are objects (`<Select.Item value={object}>`), this function converts the object value to a string representation for display in the trigger.
	 * If the shape of the object is `{ value, label }`, the label will be used automatically without needing to specify this prop.
	 */
	itemToStringLabel?: (itemValue: Value) => string;
	/**
	 * When the item values are objects (`<Select.Item value={object}>`), this function converts the object value to a string representation for form submission.
	 * If the shape of the object is `{ value, label }`, the value will be used automatically without needing to specify this prop.
	 */
	itemToStringValue?: (itemValue: Value) => string;
	/**
	 * Custom comparison logic used to determine if a select item value matches the current selected value. Useful when item values are objects without matching referentially.
	 * Defaults to `Object.is` comparison.
	 * @default Object.is
	 */
	isItemEqualToValue?: (itemValue: Value, value: Value) => boolean;
	children?: Snippet;
}

export interface SelectLabelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, FieldRootState>;
	children?: Snippet;
}

export interface SelectTriggerState extends FieldRootState {
	/** Whether the popup is open. */
	open: boolean;
	/** Whether the select is read-only. */
	readOnly: boolean;
	/** The side the popup is placed on, while it is mounted. */
	popupSide: Side | null;
	/** The selected value. */
	value: unknown;
	/** Whether the select has no value. */
	placeholder: boolean;
}

export interface SelectTriggerProps extends Omit<
	HTMLButtonAttributes,
	'children' | 'disabled' | 'id'
> {
	/** Whether the component should ignore user interaction. */
	disabled?: boolean | null;
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `false` if the rendered element is not a button (for example, `<div>`).
	 * @default true
	 */
	nativeButton?: boolean;
	/** The trigger's id. Defaults to the root's id. */
	id?: string | null;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLButtonAttributes, state: SelectTriggerState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface SelectValueState {
	/** The selected value. */
	value: unknown;
	/** Whether the placeholder shows. */
	placeholder: boolean;
}

export interface SelectValueProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/**
	 * The placeholder value to display when no value is selected.
	 * This is overridden by `children` if specified, or by a null item's label in `items`.
	 */
	placeholder?: string;
	/** Formats the selected value. Treat the value as read-only. */
	children?: Snippet<[value: unknown]>;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLSpanElement>, state: SelectValueState, children: RenderChildren]
	>;
}

export interface SelectIconState {
	/** Whether the popup is open. */
	open: boolean;
}

export interface SelectIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLSpanElement, SelectIconState>;
	children?: Snippet;
}

export type SelectPortalState = Record<string, never>;

export interface SelectPortalProps extends Omit<PortalProps, 'keepMounted'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[
			props: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>>,
			state: SelectPortalState,
			children: RenderChildren
		]
	>;
}

export interface SelectBackdropState {
	/** Whether the popup is open. */
	open: boolean;
	transitionStatus: TransitionStatusValue;
}

export interface SelectBackdropProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, SelectBackdropState>;
	children?: Snippet;
}

export interface SelectPositionerState {
	/** Whether the popup is open. */
	open: boolean;
	/** The side of the anchor the popup is placed on. `none` while it overlaps the trigger. */
	side: Side | 'none';
	/** The alignment of the popup relative to the anchor. */
	align: Align;
	/** Whether the anchor is hidden. */
	anchorHidden: boolean;
}

export interface SelectPositionerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Whether the positioner overlaps the trigger so the selected item's text is aligned with the trigger's value text. This only applies to mouse input and is automatically disabled if there is not enough space.
	 * @default true
	 */
	alignItemWithTrigger?: boolean;
	/**
	 * An element to position the popup against.
	 * By default, the popup will be positioned against the trigger.
	 */
	anchor?: AnchorPositioningParameters['anchor'];
	/**
	 * Determines which CSS `position` property to use.
	 * @default 'absolute'
	 */
	positionMethod?: AnchorPositioningParameters['positionMethod'];
	/**
	 * Which side of the anchor element to align the popup against.
	 * May automatically change to avoid collisions.
	 * @default 'bottom'
	 */
	side?: Side;
	/**
	 * How to align the popup relative to the specified side.
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
	 * @default 'clipping-ancestors'
	 */
	collisionBoundary?: AnchorPositioningParameters['collisionBoundary'];
	/**
	 * Additional space to maintain from the edge of the collision boundary.
	 * @default 5
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
	/** Whether to disable the popup from tracking any layout shift of its positioning anchor. */
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
	render?: RenderSnippet<HTMLDivElement, SelectPositionerState>;
	children?: Snippet;
}

export type SelectFocusTarget =
	boolean | HTMLElement | null | ((closeType: string) => void | boolean | HTMLElement | null);

export interface SelectPopupState {
	/** The side of the anchor the popup is placed on. */
	side: Side | 'none';
	/** The alignment of the popup relative to the anchor. */
	align: Align;
	/** Whether the popup is open. */
	open: boolean;
	transitionStatus: TransitionStatusValue;
}

export interface SelectPopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Determines the element to focus when the select popup is closed.
	 *
	 * - `false`: Do not move focus.
	 * - `true`: Move focus based on the default behavior (trigger or previously focused element).
	 * - `HTMLElement`: Move focus to that element.
	 * - `function`: Called with the interaction type (`mouse`, `touch`, `pen`, or `keyboard`).
	 *   Return an element to focus, `true` to use the default behavior, or `false`/`undefined` to do nothing.
	 */
	finalFocus?: SelectFocusTarget;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, SelectPopupState>;
	children?: Snippet;
}

export type SelectListState = Record<string, never>;

export interface SelectListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, SelectListState>;
	children?: Snippet;
}

export interface SelectItemState {
	/** Whether the item ignores user interaction. */
	disabled: boolean;
	/** Whether the item is selected. */
	selected: boolean;
	/** Whether the item is highlighted. */
	highlighted: boolean;
}

export interface SelectItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
	/**
	 * A unique value that identifies this select item.
	 * @default null
	 */
	value?: unknown;
	/**
	 * Specifies the text label to use when the item is matched during keyboard text navigation.
	 *
	 * Defaults to the item text content if not provided.
	 */
	label?: string;
	/**
	 * Whether the component should ignore user interaction.
	 * @default false
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
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, SelectItemState>;
	children?: Snippet;
}

export interface SelectItemIndicatorState {
	/** Whether the item is selected. */
	selected: boolean;
	transitionStatus: TransitionStatusValue;
}

export interface SelectItemIndicatorProps extends Omit<
	HTMLAttributes<HTMLSpanElement>,
	'children'
> {
	/**
	 * Whether to keep the HTML element in the DOM when the item is not selected.
	 * @default false
	 */
	keepMounted?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLSpanElement, SelectItemIndicatorState>;
	children?: Snippet;
}

export type SelectItemTextState = Record<string, never>;

export interface SelectItemTextProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, SelectItemTextState>;
	children?: Snippet;
}

export interface SelectArrowState {
	/** Whether the popup is open. */
	open: boolean;
	/** The side of the anchor the popup is placed on. */
	side: Side | 'none';
	/** The alignment of the popup relative to the anchor. */
	align: Align;
	/** Whether the arrow cannot be centered on the anchor. */
	uncentered: boolean;
}

export interface SelectArrowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, SelectArrowState>;
	children?: Snippet;
}

export interface SelectScrollArrowState {
	/** Which way the arrow scrolls. */
	direction: 'up' | 'down';
	/** Whether the list can scroll that way. */
	visible: boolean;
	/** The side of the anchor the popup is placed on. */
	side: Side | 'none';
	transitionStatus: TransitionStatusValue;
}

export interface SelectScrollArrowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Whether to keep the HTML element in the DOM while the select popup is not scrollable.
	 * @default false
	 */
	keepMounted?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, SelectScrollArrowState>;
	children?: Snippet;
}

export type SelectGroupState = Record<string, never>;

export interface SelectGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, SelectGroupState>;
	children?: Snippet;
}

export type SelectGroupLabelState = Record<string, never>;

export interface SelectGroupLabelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, SelectGroupLabelState>;
	children?: Snippet;
}

export type SelectSeparatorProps = SeparatorProps;
export type SelectSeparatorState = SeparatorState;
