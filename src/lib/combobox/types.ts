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
import type { RenderSnippet } from '../internal/render-children.js';
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
export type {
	Filter as ComboboxFilter,
	UseFilterOptions as ComboboxFilterOptions
} from './filter.js';

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
	typeof REASONS.keyboard | typeof REASONS.pointer | typeof REASONS.none;

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
	ComboboxItemsData<Item> | ComboboxItemCollection<Item, Value>;

/** Props AriaCombobox and every root built on it share. */
export interface ComboboxSharedRootProps<Value = unknown, Item = Value> {
	/** The input value of the combobox. */
	inputValue?: string;
	/**
	 * The uncontrolled input value when initially rendered.
	 *
	 * To render a controlled input, use `bind:inputValue` instead.
	 */
	defaultInputValue?: string;
	/** Event handler called when the input value changes. */
	onInputValueChange?: (inputValue: string, eventDetails: ComboboxChangeEventDetails) => void;
	/**
	 * Whether the popup is currently open.
	 * @default false
	 */
	open?: boolean;
	/** Event handler called when the popup is opened or closed. */
	onOpenChange?: (open: boolean, eventDetails: ComboboxOpenChangeEventDetails) => void;
	/** Event handler called after any animations complete when the popup is opened or closed. */
	onOpenChangeComplete?: (open: boolean) => void;
	/**
	 * Callback fired when an item is highlighted or unhighlighted.
	 * Receives the highlighted item value (or `undefined` if no item is highlighted) and event details with a `reason` property describing why the highlight changed.
	 * The `reason` can be:
	 * - `'keyboard'`: the highlight changed due to keyboard navigation.
	 * - `'pointer'`: the highlight changed due to pointer hovering. The event may be a `MouseEvent`
	 *   rather than a `PointerEvent`.
	 * - `'none'`: the highlight changed for another reason, such as typing, `autoHighlight`, the
	 *   item list changing, or the popup opening or closing.
	 */
	onItemHighlighted?: (
		itemValue: Value | undefined,
		eventDetails: ComboboxHighlightEventDetails
	) => void;
	/** Identifies the field when a form is submitted. */
	name?: string;
	/**
	 * Identifies the form that owns the internal input.
	 * Useful when the combobox is rendered outside the form.
	 */
	form?: string;
	/** The id of the component. */
	id?: string;
	/**
	 * Whether the user must choose a value before submitting a form.
	 * @default false
	 */
	required?: boolean;
	/**
	 * Whether the user should be unable to choose a different option from the popup.
	 * @default false
	 */
	readonly?: boolean;
	/**
	 * Whether the component should ignore user interaction.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Whether the popup opens when clicking the input.
	 * @default true
	 */
	openOnInputClick?: boolean;
	/**
	 * Whether moving the pointer over items should highlight them.
	 * Disabling this prop allows CSS `:hover` to be differentiated from the `:focus` (`data-highlighted`) state.
	 * @default true
	 */
	highlightItemOnHover?: boolean;
	/**
	 * Whether to loop keyboard focus back to the input when the end of the list is reached while using the arrow keys. The first item can then be reached by pressing ArrowDown again from the input, or the last item can be reached by pressing ArrowUp from the input. The input is always included in the focus loop per [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/). When disabled, focus does not move when on the last element and the user presses ArrowDown, or when on the first element and the user presses ArrowUp.
	 * @default true
	 */
	loopFocus?: boolean;
	/**
	 * Whether list items are presented in a grid layout.
	 * When enabled, arrow keys navigate across rows and columns inferred from DOM rows.
	 * @default false
	 */
	grid?: boolean;
	/**
	 * The items to be displayed in the list.
	 * Can be a flat array of items, an array of groups with items, or a collection created by
	 * the `createItems()` function, which derives each item's selection value and label.
	 * Nullish entries are not supported: remove them from the data before passing it.
	 */
	items?: ComboboxItems<Item, Value>;
	/**
	 * Filtered items to display in the list.
	 * When provided, the list uses these items instead of filtering the `items` prop internally.
	 * When `items` is also provided, this array must preserve its flat or grouped structure.
	 * With a `createItems()` collection, pass source items rather than derived values.
	 * Nullish entries are not supported, as in `items`.
	 * Use when you want to control filtering logic externally with the `useFilter()` hook.
	 */
	filteredItems?: ComboboxItemsData<Item>;
	/**
	 * ComboboxFilter function used to match items vs input query.
	 * Receives the source item, which is the derived value's item when `items` is a `createItems()`
	 * collection, and the item itself otherwise.
	 */
	filter?: ((item: Item, query: string, itemToString?: (item: Item) => string) => boolean) | null;
	/**
	 * When the item values are objects (`<Combobox.Item value={object}>`), this function converts the object value to a string representation for display in the input.
	 * If the shape of the object is `{ value, label }`, the label will be used automatically without needing to specify this prop.
	 * With a `createItems()` collection, this receives the derived value, and the collection's
	 * `getLabel` takes precedence for values it can resolve.
	 */
	itemToStringLabel?: (itemValue: Value) => string;
	/**
	 * When the item values are objects (`<Combobox.Item value={object}>`), this function converts the object value to a string representation for form submission.
	 * If the shape of the object is `{ value, label }`, the value will be used automatically without needing to specify this prop.
	 * With a `createItems()` collection, this receives the derived value.
	 */
	itemToStringValue?: (itemValue: Value) => string;
	/**
	 * Custom comparison logic used to determine if a combobox item value matches the current selected value. Useful when item values are objects without matching referentially.
	 * With a `createItems()` collection, both arguments are derived values.
	 * Defaults to `Object.is` comparison.
	 * @default Object.is
	 */
	isItemEqualToValue?: (itemValue: Value, value: Value) => boolean;
	/**
	 * Whether the list is rendered inline without using the component's own popup.
	 *
	 * Specify `open` unconditionally in conjunction with this prop so the list is considered
	 * visible: `<Combobox.Root inline open>`
	 *
	 * In a `Combobox.Root` > `Dialog.Root` composition, bind the Combobox's `open` and
	 * `onOpenChange` props to the `Dialog`'s `open` and `onOpenChange` state instead so the
	 * component resets its transient state (filter query, highlighted item, and input value) when
	 * the dialog closes.
	 * @default false
	 */
	inline?: boolean;
	/**
	 * Whether the items are being externally virtualized.
	 * @default false
	 */
	virtualized?: boolean;
	/**
	 * Determines if the popup enters a modal state when open.
	 * - `true`: user interaction is limited to the popup: document page scroll is locked and pointer interactions on outside elements are disabled.
	 * - `false`: user interaction with the rest of the document is allowed.
	 *
	 * On touch devices, a `true` modal blocks outside taps but leaves the page scrollable unless the popup spans nearly the full viewport width, matching native iOS behavior.
	 * @default false
	 */
	modal?: boolean;
	/**
	 * The maximum number of items to display in the list.
	 * @default -1
	 */
	limit?: number;
	/**
	 * The locale to use for string comparison.
	 * Defaults to the user's runtime locale.
	 */
	locale?: Intl.LocalesArgument;
	children?: Snippet;
}

export interface ComboboxRootProps<
	Value = unknown,
	Multiple extends boolean | undefined = false,
	Item = Value
> extends ComboboxSharedRootProps<Value, Item> {
	/** The selected value of the combobox. */
	value?: ComboboxValueOf<Value, Multiple>;
	/**
	 * The uncontrolled selected value of the combobox when it's initially rendered.
	 *
	 * To render a controlled combobox, use `bind:value` instead.
	 * @default null, or [] when `multiple`
	 */
	defaultValue?: ComboboxValueOf<Value, Multiple>;
	/** Event handler called when the selected value of the combobox changes. */
	onValueChange?: (
		value: ComboboxValueOf<Value, Multiple>,
		eventDetails: ComboboxChangeEventDetails
	) => void;
	/**
	 * Whether multiple items can be selected.
	 * @default false
	 */
	multiple?: Multiple;
	/** Provides a hint to the browser for autofill. */
	autocomplete?: FullAutoFill | null;
	/**
	 * Whether the first matching item is highlighted automatically while filtering.
	 * @default false
	 */
	autoHighlight?: boolean;
}

/**
 * The core every combobox-like root wraps. Combobox maps `value` and `multiple` onto it.
 * Autocomplete wraps it with `selectionMode: 'none'`.
 */
export interface AriaComboboxProps<Value = unknown, Item = Value> extends ComboboxSharedRootProps<
	Value,
	Item
> {
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
	/**
	 * Whether the highlighted item should be preserved when the pointer leaves the list.
	 * @default false
	 */
	keepHighlight?: boolean;
	/**
	 * Whether clicking an item should submit the owning form.
	 * @default false
	 */
	submitOnItemClick?: boolean;
}

export type ComboboxLabelState = FieldRootState;

export interface ComboboxLabelProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'id'
> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, ComboboxLabelState>;
	children?: Snippet;
}

export interface ComboboxValueProps {
	/**
	 * The placeholder value to display when no value is selected.
	 * This is overridden by `children` if specified, or by a null item's label in `items`.
	 */
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
	 * Whether the component should ignore user interaction.
	 * @default false
	 */
	disabled?: boolean | null;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLInputAttributes, state: ComboboxInputState, children: RenderChildren]
	>;
}

export interface ComboboxInputGroupState extends ControlState {
	/** Whether nothing is selected. */
	placeholder: boolean;
}

export interface ComboboxInputGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, ComboboxInputGroupState>;
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
	/** Whether the component should ignore user interaction. */
	disabled?: boolean | null;
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `false` if the rendered element is not a button (for example, `<div>`).
	 * @default true
	 */
	nativeButton?: boolean;
	/** The trigger's id. With the input inside the popup, defaults to the root's id. */
	id?: string | null;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
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
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, ComboboxListState>;
	/** The list content. Render `Combobox.Collection` inside to map the filtered items. */
	children?: Snippet;
}

export type ComboboxStatusState = Record<string, never>;

export interface ComboboxStatusProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, ComboboxStatusState>;
	children?: Snippet;
}

export type ComboboxPortalState = Record<string, never>;

export interface ComboboxPortalProps extends PortalProps {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
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
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, ComboboxBackdropState>;
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
	render?: RenderSnippet<HTMLDivElement, ComboboxPositionerState>;
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
	 * Determines the element to focus when the popup is opened.
	 *
	 * - `false`: Do not move focus.
	 * - `true`: Move focus based on the default behavior (first tabbable element or popup).
	 * - `HTMLElement`: Move focus to that element.
	 * - `function`: Called with the interaction type (`mouse`, `touch`, `pen`, or `keyboard`).
	 *   Return an element to focus, `true` to use the default behavior, or `false`/`undefined` to do nothing.
	 */
	initialFocus?: ComboboxFocusTarget;
	/**
	 * Determines the element to focus when the popup is closed.
	 *
	 * - `false`: Do not move focus.
	 * - `true`: Move focus based on the default behavior (trigger or previously focused element).
	 * - `HTMLElement`: Move focus to that element.
	 * - `function`: Called with the interaction type (`mouse`, `touch`, `pen`, or `keyboard`).
	 *   Return an element to focus, `true` to use the default behavior, or `false`/`undefined` to do nothing.
	 */
	finalFocus?: ComboboxFocusTarget;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, ComboboxPopupState>;
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
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, ComboboxArrowState>;
	children?: Snippet;
}

export type ComboboxIconState = Record<string, never>;

export interface ComboboxIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLSpanElement, ComboboxIconState>;
	children?: Snippet;
}

export type ComboboxGroupState = Record<string, never>;

export interface ComboboxGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Items to be rendered within this group.
	 * When provided, child `Collection` components will use these items.
	 */
	items?: readonly unknown[];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, ComboboxGroupState>;
	children?: Snippet;
}

export type ComboboxGroupLabelState = Record<string, never>;

export interface ComboboxGroupLabelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, ComboboxGroupLabelState>;
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
	 * A unique value that identifies this item.
	 * @default null
	 */
	value?: unknown;
	/**
	 * The index of the item in the list. Improves performance when specified by avoiding the need to calculate the index automatically from the DOM.
	 */
	index?: number;
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
	render?: RenderSnippet<HTMLDivElement, ComboboxItemState>;
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
	render?: RenderSnippet<HTMLSpanElement, ComboboxItemIndicatorState>;
	children?: Snippet;
}

export type ComboboxChipsState = Record<string, never>;

export interface ComboboxChipsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, ComboboxChipsState>;
	children?: Snippet;
}

export interface ComboboxChipState {
	/** Whether the combobox ignores user interaction. */
	disabled: boolean;
}

export interface ComboboxChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, ComboboxChipState>;
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
	render?: Snippet<
		[props: HTMLButtonAttributes, state: ComboboxChipRemoveState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type ComboboxRowState = Record<string, never>;

export interface ComboboxRowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, ComboboxRowState>;
	children?: Snippet;
}

export interface ComboboxCollectionProps {
	/** Rendered for each filtered item, or each item of the surrounding `Combobox.Group`. */
	children: Snippet<[item: never, index: number]>;
}

export type ComboboxEmptyState = Record<string, never>;

export interface ComboboxEmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, ComboboxEmptyState>;
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
	 * Whether the component should ignore user interaction.
	 * @default false
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
	 * Whether the component should remain mounted in the DOM when not visible.
	 * @default false
	 */
	keepMounted?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLButtonAttributes, state: ComboboxClearState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type ComboboxSeparatorProps = SeparatorProps;
export type ComboboxSeparatorState = SeparatorState;
