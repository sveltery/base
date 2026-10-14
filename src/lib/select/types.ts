import type { Snippet } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import type { FullAutoFill, HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { FieldRootState } from '../field/types.js';
import type { ItemsInput } from '../internal/listbox/resolveValueLabel.js';
import type { PortalProps } from '../internal/portal-props.js';
import type { Align, AnchorPositioningParameters, Side } from '../internal/popups/index.js';
import type { RenderChildren } from '../internal/render-children.js';
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

type PartRender<Element extends EventTarget, State> = Snippet<
	[props: HTMLAttributes<Element>, state: State, children: RenderChildren]
>;

export interface SelectRootProps<Value = unknown, Multiple extends boolean | undefined = false> {
	/**
	 * The selected value. Use `bind:value` to share it with the parent.
	 * Without a binding it starts from `defaultValue`.
	 */
	value?: SelectValueOf<Value, Multiple>;
	/**
	 * The value the select starts with and the value a form reset restores.
	 * @default null, or [] when `multiple`
	 */
	defaultValue?: SelectValueOf<Value, Multiple>;
	/** Called before the value changes. Call `eventDetails.cancel()` to keep the current value. */
	onValueChange?: (
		value: SelectValueOf<Value, Multiple>,
		eventDetails: SelectChangeEventDetails
	) => void;
	/**
	 * Whether the popup is open. Use `bind:open` to share it with the parent.
	 * @default false
	 */
	open?: boolean;
	/** Called before the popup opens or closes. Call `eventDetails.cancel()` to veto it. */
	onOpenChange?: (open: boolean, eventDetails: SelectOpenChangeEventDetails) => void;
	/** Called after the open or close animations finish. */
	onOpenChangeComplete?: (open: boolean) => void;
	/** Identifies the field when a form is submitted. */
	name?: string;
	/** Id of the form the hidden inputs belong to, for a select rendered outside it. */
	form?: string;
	/** A hint for browser autofill, on the hidden input. */
	autocomplete?: FullAutoFill | null;
	/** The id of the select. The trigger takes it. */
	id?: string;
	/**
	 * Whether a value must be chosen before the form submits.
	 * @default false
	 */
	required?: boolean;
	/**
	 * Whether the user can browse the options but not choose a different one.
	 * @default false
	 */
	readonly?: boolean;
	/**
	 * Whether the select ignores user interaction.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Whether several items can be selected.
	 * @default false
	 */
	multiple?: Multiple;
	/**
	 * Whether moving the pointer over items highlights them.
	 * Set `false` to tell CSS `:hover` apart from the `data-highlighted` state.
	 * @default true
	 */
	highlightItemOnHover?: boolean;
	/**
	 * Whether the select is modal while open: page scroll is locked and outside pointer
	 * interaction is blocked. On touch devices the page stays scrollable unless the popup spans
	 * nearly the full viewport width.
	 * @default true
	 */
	modal?: boolean;
	/**
	 * The items of the popup, so `Select.Value` shows the selected item's label instead of its
	 * value: a record of labels by value, an array of `{ value, label }`, or groups of them.
	 */
	items?: ItemsInput;
	/**
	 * Converts an object value to the label `Select.Value` shows.
	 * A `{ value, label }` object uses its `label` without it.
	 */
	itemToStringLabel?: (itemValue: Value) => string;
	/**
	 * Converts an object value to the string a form submits.
	 * A `{ value, label }` object uses its `value` without it.
	 */
	itemToStringValue?: (itemValue: Value) => string;
	/**
	 * Whether an item value matches the selected value. Use it for object values that are not
	 * the same reference.
	 * @default Object.is
	 */
	isItemEqualToValue?: (itemValue: Value, value: Value) => boolean;
	children?: Snippet;
}

export interface SelectLabelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
	render?: PartRender<HTMLDivElement, FieldRootState>;
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
	/** Whether the trigger ignores user interaction. */
	disabled?: boolean;
	/**
	 * Whether the host is a native `<button>`.
	 * Set `false` when `render` supplies a non-button element.
	 * @default true
	 */
	nativeButton?: boolean;
	/** The trigger's id. Defaults to the root's id. */
	id?: string;
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
	 * Shown while nothing is selected. `children`, or a `null` item's label in `items`,
	 * replaces it.
	 */
	placeholder?: string;
	/** Formats the selected value. Treat the value as read-only. */
	children?: Snippet<[value: unknown]>;
	render?: Snippet<
		[props: HTMLAttributes<HTMLSpanElement>, state: SelectValueState, children: RenderChildren]
	>;
}

export interface SelectIconState {
	/** Whether the popup is open. */
	open: boolean;
}

export interface SelectIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	render?: PartRender<HTMLSpanElement, SelectIconState>;
	children?: Snippet;
}

export type SelectPortalState = Record<string, never>;

export interface SelectPortalProps extends Omit<PortalProps, 'keepMounted'> {
	/** Replace the portal element. Host props include the move attachment. */
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
	render?: PartRender<HTMLDivElement, SelectBackdropState>;
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
	 * Whether the positioner overlaps the trigger so the selected item's text lines up with the
	 * trigger's value. Mouse and keyboard only. It turns itself off when there is not enough space.
	 * @default true
	 */
	alignItemWithTrigger?: boolean;
	/** An element to position the popup against. Defaults to the trigger. */
	anchor?: AnchorPositioningParameters['anchor'];
	/**
	 * Which CSS `position` the positioner uses.
	 * @default 'absolute'
	 */
	positionMethod?: AnchorPositioningParameters['positionMethod'];
	/**
	 * Which side of the anchor to place the popup on. It can flip to avoid collisions.
	 * @default 'bottom'
	 */
	side?: Side;
	/**
	 * How to align the popup on its side.
	 * @default 'center'
	 */
	align?: Align;
	/**
	 * Distance between the anchor and the popup in pixels, or a function of the anchor and
	 * positioner sizes, side and alignment.
	 * @default 0
	 */
	sideOffset?: AnchorPositioningParameters['sideOffset'];
	/**
	 * Offset along the alignment axis in pixels, or a function like `sideOffset`.
	 * @default 0
	 */
	alignOffset?: AnchorPositioningParameters['alignOffset'];
	/**
	 * The area the popup is confined to.
	 * @default 'clipping-ancestors'
	 */
	collisionBoundary?: AnchorPositioningParameters['collisionBoundary'];
	/**
	 * Space to keep from the edge of the collision boundary.
	 * @default 5
	 */
	collisionPadding?: AnchorPositioningParameters['collisionPadding'];
	/**
	 * Minimum distance between the arrow and the edges of the popup.
	 * @default 5
	 */
	arrowPadding?: number;
	/**
	 * Whether the popup stays in the viewport after the anchor scrolls out of view.
	 * @default false
	 */
	sticky?: boolean;
	/**
	 * Whether the popup stops following layout shifts of its anchor.
	 * Defaults to `true` while the popup overlaps the trigger.
	 */
	disableAnchorTracking?: boolean;
	/**
	 * How the popup avoids collisions. Dropdowns flip on the side axis and shift on the
	 * alignment axis.
	 */
	collisionAvoidance?: AnchorPositioningParameters['collisionAvoidance'];
	render?: PartRender<HTMLDivElement, SelectPositionerState>;
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
	 * The element to focus when the popup closes. `false` does not move focus, `true` uses the
	 * default (the trigger), and a function receives the close interaction type.
	 */
	finalFocus?: SelectFocusTarget;
	render?: PartRender<HTMLDivElement, SelectPopupState>;
	children?: Snippet;
}

export type SelectListState = Record<string, never>;

export interface SelectListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, SelectListState>;
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
	 * The value this item selects.
	 * @default null
	 */
	value?: unknown;
	/**
	 * The text typeahead matches. Defaults to the item text.
	 */
	label?: string;
	/**
	 * Whether the item ignores user interaction.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Whether the host is a native `<button>`.
	 * @default false
	 */
	nativeButton?: boolean;
	render?: PartRender<HTMLDivElement, SelectItemState>;
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
	 * Whether the indicator stays in the DOM while the item is not selected.
	 * @default false
	 */
	keepMounted?: boolean;
	render?: PartRender<HTMLSpanElement, SelectItemIndicatorState>;
	children?: Snippet;
}

export type SelectItemTextState = Record<string, never>;

export interface SelectItemTextProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, SelectItemTextState>;
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
	render?: PartRender<HTMLDivElement, SelectArrowState>;
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
	 * Whether the arrow stays in the DOM while the list cannot scroll that way.
	 * @default false
	 */
	keepMounted?: boolean;
	render?: PartRender<HTMLDivElement, SelectScrollArrowState>;
	children?: Snippet;
}

export type SelectGroupState = Record<string, never>;

export interface SelectGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, SelectGroupState>;
	children?: Snippet;
}

export type SelectGroupLabelState = Record<string, never>;

export interface SelectGroupLabelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, SelectGroupLabelState>;
	children?: Snippet;
}

export type SelectSeparatorProps = SeparatorProps;
export type SelectSeparatorState = SeparatorState;
