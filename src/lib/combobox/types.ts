// Derived from Base UI v1.9.0 packages/react/src/combobox/**/*.tsx prop and state types
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import type { Snippet } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import type {
	FullAutoFill,
	HTMLAttributes,
	HTMLButtonAttributes,
	HTMLInputAttributes
} from 'svelte/elements';
import type {
	BaseUIChangeEventDetails,
	BaseUIHighlightEventDetails,
	OpenInteractionType,
	REASONS
} from '@sveltery/utils';
import type { FieldRootState } from '../field/types.js';
import type { PortalProps } from '../internal/portal-props.js';
import type { Align, AnchorPositioningParameters, Side } from '../internal/popups/index.js';
import type { RenderChildren } from '../internal/render-children.js';
import type { TransitionStatusValue } from '../internal/useTransitionStatus.svelte.js';
import type { SeparatorProps, SeparatorState } from '../separator/types.js';
import type { ComboboxItemCollection, ComboboxItemsData } from './collection.js';

export type { Align, Side };
export type {
	ComboboxItemCollection,
	ComboboxItemsData,
	ComboboxPrimitiveValue,
	CreateComboboxItemsOptions
} from './collection.js';
export type { Filter as ComboboxFilter, UseFilterOptions as ComboboxFilterOptions } from './filter.js';

export type ComboboxChangeReason =
	| typeof REASONS.triggerPress
	| typeof REASONS.inputPress
	| typeof REASONS.outsidePress
	| typeof REASONS.itemPress
	| typeof REASONS.closePress
	| typeof REASONS.escapeKey
	| typeof REASONS.listNavigation
	| typeof REASONS.focusOut
	| typeof REASONS.inputChange
	| typeof REASONS.inputClear
	| typeof REASONS.clearPress
	| typeof REASONS.chipRemovePress
	| typeof REASONS.cancelOpen
	| typeof REASONS.imperativeAction
	| typeof REASONS.none;

export type ComboboxChangeEventDetails = BaseUIChangeEventDetails<ComboboxChangeReason> & {
	/**
	 * When `reason` is `input-clear` in multiple mode, whether an item press caused the clear.
	 * Automatic cleanup clears omit it.
	 */
	isItemPress?: boolean;
};

export type ComboboxOpenChangeEventDetails = ComboboxChangeEventDetails & {
	/** Keeps the popup mounted until the root's `unmount()` is called. */
	preventUnmountOnClose: () => void;
};

export type ComboboxHighlightReason =
	| typeof REASONS.keyboard
	| typeof REASONS.pointer
	| typeof REASONS.none;

export type ComboboxHighlightEventDetails = BaseUIHighlightEventDetails<
	ComboboxHighlightReason,
	{ index: number }
>;

/** The value of a combobox: one item value or `null`, or an array when `multiple`. */
export type ComboboxValueOf<Value, Multiple extends boolean | undefined> = Multiple extends true
	? Value[]
	: Value | null;

/** Flat items, groups of items, or a `createItems()` collection. */
export type ComboboxItems<Item = unknown, Value = Item> =
	| ComboboxItemsData<Item>
	| ComboboxItemCollection<Item, Value>;

type PartRender<Element extends EventTarget, State> = Snippet<
	[props: HTMLAttributes<Element>, state: State, children: RenderChildren]
>;

/** Props AriaCombobox and every root built on it share. */
export interface ComboboxSharedRootProps<Value = unknown, Item = Value> {
	/**
	 * The text in the input. Use `bind:inputValue` to share it with the parent.
	 * Without a binding it starts from `defaultInputValue`.
	 */
	inputValue?: string;
	/** The text the input starts with. */
	defaultInputValue?: string;
	/** Called before the input value changes. Call `eventDetails.cancel()` to keep the text. */
	onInputValueChange?: (inputValue: string, eventDetails: ComboboxChangeEventDetails) => void;
	/**
	 * Whether the popup is open. Use `bind:open` to share it with the parent.
	 * @default false
	 */
	open?: boolean;
	/** Called before the popup opens or closes. Call `eventDetails.cancel()` to veto it. */
	onOpenChange?: (open: boolean, eventDetails: ComboboxOpenChangeEventDetails) => void;
	/** Called after the open or close animations finish. */
	onOpenChangeComplete?: (open: boolean) => void;
	/** Called when an item is highlighted or the highlight is cleared (`undefined`). */
	onItemHighlighted?: (
		itemValue: Value | undefined,
		eventDetails: ComboboxHighlightEventDetails
	) => void;
	/** Identifies the field when a form is submitted. */
	name?: string;
	/** Id of the form the hidden inputs belong to, for a combobox rendered outside it. */
	form?: string;
	/** The id of the component. */
	id?: string;
	/**
	 * Whether a value must be chosen before the form submits.
	 * @default false
	 */
	required?: boolean;
	/**
	 * Whether the user can browse the items but not choose a different one.
	 * @default false
	 */
	readonly?: boolean;
	/**
	 * Whether the component ignores user interaction.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Whether the popup opens when the input is pressed.
	 * @default true
	 */
	openOnInputClick?: boolean;
	/**
	 * Whether the highlighted item stays highlighted when the pointer leaves the list.
	 * @default false
	 */
	keepHighlight?: boolean;
	/**
	 * Whether moving the pointer over items highlights them.
	 * Set `false` to tell CSS `:hover` apart from the `data-highlighted` state.
	 * @default true
	 */
	highlightItemOnHover?: boolean;
	/**
	 * Whether the arrow keys loop from the last item back to the input and then the first item.
	 * @default true
	 */
	loopFocus?: boolean;
	/**
	 * Whether items are laid out in a grid of `Combobox.Row`s. The arrow keys move across rows
	 * and columns.
	 * @default false
	 */
	grid?: boolean;
	/** The items of the list: flat, grouped, or a `createItems()` collection. */
	items?: ComboboxItems<Item, Value>;
	/**
	 * Items filtered by the consumer. The list shows them instead of filtering `items` itself.
	 * With a `createItems()` collection, pass source items.
	 */
	filteredItems?: ComboboxItemsData<Item>;
	/**
	 * Matches an item against the query. `null` disables filtering.
	 * Receives the source item of a `createItems()` collection.
	 */
	filter?: ((item: Item, query: string, itemToString?: (item: Item) => string) => boolean) | null;
	/**
	 * Converts an object value to the label shown in the input and matched against the query.
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
	/**
	 * Whether the list renders inline instead of in a popup. Set `open` with it.
	 * @default false
	 */
	inline?: boolean;
	/**
	 * Whether the popup is modal while open: page scroll is locked and outside pointer
	 * interaction is blocked.
	 * @default false
	 */
	modal?: boolean;
	/**
	 * The maximum number of items the list shows. `-1` shows all.
	 * @default -1
	 */
	limit?: number;
	/** The locale used to compare strings. Defaults to the runtime locale. */
	locale?: Intl.LocalesArgument;
	/**
	 * Whether pressing an item submits the owning form.
	 * @default false
	 */
	submitOnItemClick?: boolean;
	children?: Snippet;
}

export interface ComboboxRootProps<
	Value = unknown,
	Multiple extends boolean | undefined = false,
	Item = Value
> extends ComboboxSharedRootProps<Value, Item> {
	/**
	 * The selected value. Use `bind:value` to share it with the parent.
	 * Without a binding it starts from `defaultValue`.
	 */
	value?: ComboboxValueOf<Value, Multiple>;
	/**
	 * The value the combobox starts with and the value a form reset restores.
	 * @default null, or [] when `multiple`
	 */
	defaultValue?: ComboboxValueOf<Value, Multiple>;
	/** Called before the value changes. Call `eventDetails.cancel()` to keep the current value. */
	onValueChange?: (
		value: ComboboxValueOf<Value, Multiple>,
		eventDetails: ComboboxChangeEventDetails
	) => void;
	/**
	 * Whether several items can be selected.
	 * @default false
	 */
	multiple?: Multiple;
	/** A hint for browser autofill, on the hidden input. */
	autocomplete?: FullAutoFill | null;
	/**
	 * Whether the first matching item is highlighted while filtering.
	 * @default false
	 */
	autoHighlight?: boolean;
}

/**
 * The core every combobox-like root wraps. Combobox maps `value` and `multiple` onto it.
 * Autocomplete wraps it with `selectionMode: 'none'`.
 */
export interface AriaComboboxProps<Value = unknown, Item = Value>
	extends ComboboxSharedRootProps<Value, Item> {
	/** How selection is remembered: one value, several, or none (input value only). */
	selectionMode: 'single' | 'multiple' | 'none';
	/** The selected value. Use `bind:selectedValue` to share it with the parent. */
	selectedValue?: unknown;
	/** The selected value an empty binding starts from and a form reset restores. */
	defaultSelectedValue?: unknown;
	/** Called before the selected value changes. Call `eventDetails.cancel()` to keep it. */
	onSelectedValueChange?: (value: never, eventDetails: ComboboxChangeEventDetails) => void;
	/**
	 * Whether the first matching item is highlighted automatically. `'always'` highlights it as
	 * soon as the list opens.
	 * @default false
	 */
	autoHighlight?: boolean | 'always';
	/**
	 * How the list filters and whether the input completes inline, as `aria-autocomplete`.
	 * @default 'list'
	 */
	autoComplete?: 'list' | 'both' | 'inline' | 'none';
	/** A hint for browser autofill, on the hidden input. */
	formAutoComplete?: FullAutoFill | null;
	/**
	 * With `selectionMode: 'none'`, whether pressing an item fills the input.
	 * @default true
	 */
	fillInputOnItemPress?: boolean;
	/** The query the list is filtered by, when it differs from the input value. */
	filterQuery?: string;
}

export type ComboboxLabelState = FieldRootState;

export interface ComboboxLabelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
	render?: PartRender<HTMLDivElement, ComboboxLabelState>;
	children?: Snippet;
}

export interface ComboboxValueProps {
	/** Shown while nothing is selected. `children` replaces it. */
	placeholder?: string;
	/** Formats the selected value. Treat the value as read-only. */
	children?: Snippet<[value: unknown]>;
}

interface ControlState extends FieldRootState {
	/** Whether the popup is open. */
	open: boolean;
	/** Whether the control ignores user interaction. */
	disabled: boolean;
	/** Whether the combobox is read-only. */
	readOnly: boolean;
	/** The side the popup is placed on, while it is mounted. */
	popupSide: Side | null;
	/** Whether the filtered list has no items. */
	listEmpty: boolean;
}

export type ComboboxInputState = ControlState;

export interface ComboboxInputProps extends Omit<
	HTMLInputAttributes,
	'children' | 'disabled' | 'value' | 'type'
> {
	/**
	 * Whether the input ignores user interaction.
	 * @default false
	 */
	disabled?: boolean;
	render?: Snippet<
		[props: HTMLInputAttributes, state: ComboboxInputState, children: RenderChildren]
	>;
}

export interface ComboboxInputGroupState extends ControlState {
	/** Whether nothing is selected. */
	placeholder: boolean;
}

export interface ComboboxInputGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, ComboboxInputGroupState>;
	children?: Snippet;
}

export interface ComboboxTriggerState extends ControlState {
	/** Whether nothing is selected. */
	placeholder: boolean;
}

export interface ComboboxTriggerProps extends Omit<
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
	/** The trigger's id. With the input inside the popup, defaults to the root's id. */
	id?: string;
	render?: Snippet<
		[props: HTMLButtonAttributes, state: ComboboxTriggerState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface ComboboxListState {
	/** Whether the filtered list has no items. */
	empty: boolean;
}

export interface ComboboxListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, ComboboxListState>;
	/** The list content, or a snippet rendered for each filtered item or group. */
	children?: Snippet | Snippet<[item: never, index: number]>;
}

export type ComboboxStatusState = Record<string, never>;

export interface ComboboxStatusProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, ComboboxStatusState>;
	children?: Snippet;
}

export type ComboboxPortalState = Record<string, never>;

export interface ComboboxPortalProps extends PortalProps {
	/** Replace the portal element. Host props include the move attachment. */
	render?: Snippet<
		[
			props: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>>,
			state: ComboboxPortalState,
			children: RenderChildren
		]
	>;
}

export interface ComboboxBackdropState {
	/** Whether the popup is open. */
	open: boolean;
	transitionStatus: TransitionStatusValue;
}

export interface ComboboxBackdropProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, ComboboxBackdropState>;
	children?: Snippet;
}

export interface ComboboxPositionerState {
	/** Whether the popup is open. */
	open: boolean;
	/** The side of the anchor the popup is placed on. */
	side: Side;
	/** The alignment of the popup relative to the anchor. */
	align: Align;
	/** Whether the anchor is hidden. */
	anchorHidden: boolean;
	/** Whether the filtered list has no items. */
	empty: boolean;
}

export interface ComboboxPositionerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** An element to position the popup against. Defaults to the input group, input or trigger. */
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
	 * @default false
	 */
	disableAnchorTracking?: boolean;
	/** How the popup avoids collisions. Dropdowns flip on the side axis and shift on the other. */
	collisionAvoidance?: AnchorPositioningParameters['collisionAvoidance'];
	render?: PartRender<HTMLDivElement, ComboboxPositionerState>;
	children?: Snippet;
}

export type ComboboxFocusTarget =
	| boolean
	| HTMLElement
	| null
	| ((interactionType: OpenInteractionType | null) => void | boolean | HTMLElement | null);

export interface ComboboxPopupState {
	/** Whether the popup is open. */
	open: boolean;
	/** The side of the anchor the popup is placed on. */
	side: Side;
	/** The alignment of the popup relative to the anchor. */
	align: Align;
	/** Whether the anchor is hidden. */
	anchorHidden: boolean;
	transitionStatus: TransitionStatusValue;
	/** Whether the filtered list has no items. */
	empty: boolean;
}

export interface ComboboxPopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * The element to focus when the popup opens. With the input inside the popup, the default
	 * focuses the input, or the popup on touch.
	 */
	initialFocus?: ComboboxFocusTarget;
	/**
	 * The element to focus when the popup closes. With the input inside the popup, the default
	 * focuses the trigger. Otherwise focus stays where it is.
	 */
	finalFocus?: ComboboxFocusTarget;
	render?: PartRender<HTMLDivElement, ComboboxPopupState>;
	children?: Snippet;
}

export interface ComboboxArrowState {
	/** Whether the popup is open. */
	open: boolean;
	/** The side of the anchor the popup is placed on. */
	side: Side;
	/** The alignment of the popup relative to the anchor. */
	align: Align;
	/** Whether the arrow cannot be centered on the anchor. */
	uncentered: boolean;
}

export interface ComboboxArrowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, ComboboxArrowState>;
	children?: Snippet;
}

export type ComboboxIconState = Record<string, never>;

export interface ComboboxIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	render?: PartRender<HTMLSpanElement, ComboboxIconState>;
	children?: Snippet;
}

export type ComboboxGroupState = Record<string, never>;

export interface ComboboxGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** The group's items, which a `Combobox.Collection` inside renders. */
	items?: readonly unknown[];
	render?: PartRender<HTMLDivElement, ComboboxGroupState>;
	children?: Snippet;
}

export type ComboboxGroupLabelState = Record<string, never>;

export interface ComboboxGroupLabelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, ComboboxGroupLabelState>;
	children?: Snippet;
}

export interface ComboboxItemState {
	/** Whether the item ignores user interaction. */
	disabled: boolean;
	/** Whether the item is selected. */
	selected: boolean;
	/** Whether the item is highlighted. */
	highlighted: boolean;
}

export interface ComboboxItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
	/**
	 * The value this item selects.
	 * @default null
	 */
	value?: unknown;
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
	render?: PartRender<HTMLDivElement, ComboboxItemState>;
	children?: Snippet;
}

export interface ComboboxItemIndicatorState {
	/** Whether the item is selected. */
	selected: boolean;
	transitionStatus: TransitionStatusValue;
}

export interface ComboboxItemIndicatorProps extends Omit<
	HTMLAttributes<HTMLSpanElement>,
	'children'
> {
	/**
	 * Whether the indicator stays in the DOM while the item is not selected.
	 * @default false
	 */
	keepMounted?: boolean;
	render?: PartRender<HTMLSpanElement, ComboboxItemIndicatorState>;
	children?: Snippet;
}

export type ComboboxChipsState = Record<string, never>;

export interface ComboboxChipsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, ComboboxChipsState>;
	children?: Snippet;
}

export interface ComboboxChipState {
	/** Whether the combobox ignores user interaction. */
	disabled: boolean;
}

export interface ComboboxChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, ComboboxChipState>;
	children?: Snippet;
}

export interface ComboboxChipRemoveState {
	/** Whether the button ignores user interaction. */
	disabled: boolean;
}

export interface ComboboxChipRemoveProps extends Omit<
	HTMLButtonAttributes,
	'children' | 'disabled'
> {
	/**
	 * Whether the button ignores user interaction.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Whether the host is a native `<button>`.
	 * @default true
	 */
	nativeButton?: boolean;
	render?: Snippet<
		[props: HTMLButtonAttributes, state: ComboboxChipRemoveState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type ComboboxRowState = Record<string, never>;

export interface ComboboxRowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, ComboboxRowState>;
	children?: Snippet;
}

export interface ComboboxCollectionProps {
	/** Rendered for each filtered item, or each item of the surrounding `Combobox.Group`. */
	children: Snippet<[item: never, index: number]>;
}

export type ComboboxEmptyState = Record<string, never>;

export interface ComboboxEmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, ComboboxEmptyState>;
	/** Shown while the filtered list has no items. */
	children?: Snippet;
}

export interface ComboboxClearState {
	/** Whether the popup is open. */
	open: boolean;
	/** Whether the button ignores user interaction. */
	disabled: boolean;
	/** Whether there is something to clear. */
	visible: boolean;
	transitionStatus: TransitionStatusValue;
}

export interface ComboboxClearProps extends Omit<HTMLButtonAttributes, 'children' | 'disabled'> {
	/**
	 * Whether the button ignores user interaction.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Whether the host is a native `<button>`.
	 * @default true
	 */
	nativeButton?: boolean;
	/**
	 * Whether the button stays in the DOM while there is nothing to clear.
	 * @default false
	 */
	keepMounted?: boolean;
	render?: Snippet<
		[props: HTMLButtonAttributes, state: ComboboxClearState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type ComboboxSeparatorProps = SeparatorProps;
export type ComboboxSeparatorState = SeparatorState;
