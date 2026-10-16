// Derived from Base UI v1.9.0 packages/react/src/autocomplete/**/*.tsx prop and state types
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type {
	ComboboxChangeEventDetails,
	ComboboxChangeReason,
	ComboboxHighlightEventDetails,
	ComboboxHighlightReason,
	ComboboxInputGroupState,
	ComboboxItemProps,
	ComboboxOpenChangeEventDetails,
	ComboboxSharedRootProps,
	ComboboxTriggerProps,
	ComboboxTriggerState,
	ComboboxInputGroupProps
} from '../combobox/types.js';
import type { Group } from '../internal/listbox/resolveValueLabel.js';
import type { RenderChildren } from '../internal/render-children.js';
import type { SeparatorProps, SeparatorState } from '../separator/types.js';

export type {
	ComboboxArrowProps as AutocompleteArrowProps,
	ComboboxArrowState as AutocompleteArrowState,
	ComboboxBackdropProps as AutocompleteBackdropProps,
	ComboboxBackdropState as AutocompleteBackdropState,
	ComboboxClearProps as AutocompleteClearProps,
	ComboboxClearState as AutocompleteClearState,
	ComboboxCollectionProps as AutocompleteCollectionProps,
	ComboboxEmptyProps as AutocompleteEmptyProps,
	ComboboxEmptyState as AutocompleteEmptyState,
	ComboboxFilter as AutocompleteFilter,
	ComboboxFilterOptions as AutocompleteFilterOptions,
	ComboboxGroupLabelProps as AutocompleteGroupLabelProps,
	ComboboxGroupLabelState as AutocompleteGroupLabelState,
	ComboboxGroupProps as AutocompleteGroupProps,
	ComboboxGroupState as AutocompleteGroupState,
	ComboboxIconProps as AutocompleteIconProps,
	ComboboxIconState as AutocompleteIconState,
	ComboboxInputProps as AutocompleteInputProps,
	ComboboxInputState as AutocompleteInputState,
	ComboboxListProps as AutocompleteListProps,
	ComboboxListState as AutocompleteListState,
	ComboboxPopupProps as AutocompletePopupProps,
	ComboboxPopupState as AutocompletePopupState,
	ComboboxPortalProps as AutocompletePortalProps,
	ComboboxPortalState as AutocompletePortalState,
	ComboboxPositionerProps as AutocompletePositionerProps,
	ComboboxPositionerState as AutocompletePositionerState,
	ComboboxRowProps as AutocompleteRowProps,
	ComboboxRowState as AutocompleteRowState,
	ComboboxStatusProps as AutocompleteStatusProps,
	ComboboxStatusState as AutocompleteStatusState
} from '../combobox/types.js';

export type AutocompleteChangeReason = ComboboxChangeReason;
export type AutocompleteChangeEventDetails = ComboboxChangeEventDetails;
export type AutocompleteOpenChangeEventDetails = ComboboxOpenChangeEventDetails;
export type AutocompleteHighlightReason = ComboboxHighlightReason;
export type AutocompleteHighlightEventDetails = ComboboxHighlightEventDetails;

/**
 * How the list filters and whether the input completes inline.
 * - `list`: the list filters by the input. The input keeps the typed text.
 * - `both`: the list filters by the typed text, and the input shows the highlighted item.
 * - `inline`: the list does not filter, and the input shows the highlighted item.
 * - `none`: the list does not filter, and the input keeps the typed text.
 */
export type AutocompleteMode = 'list' | 'both' | 'inline' | 'none';

export interface AutocompleteRootProps<ItemValue = unknown> extends Omit<
	ComboboxSharedRootProps<ItemValue>,
	| 'inputValue'
	| 'defaultInputValue'
	| 'onInputValueChange'
	| 'itemToStringLabel'
	| 'itemToStringValue'
	| 'isItemEqualToValue'
	| 'items'
	| 'filteredItems'
	| 'openOnInputClick'
	| 'form'
	| 'filter'
	| 'inline'
	| 'submitOnItemClick'
> {
	/**
	 * Identifies the form that owns the internal input.
	 * Useful when the autocomplete is rendered outside the form.
	 */
	form?: string;
	/** AutocompleteFilter function used to match items against the input query. */
	filter?:
		| ((item: ItemValue, query: string, itemToString?: (item: ItemValue) => string) => boolean)
		| null;
	/**
	 * Whether the list is rendered inline without using the component's own popup.
	 *
	 * Specify `open` unconditionally in conjunction with this prop so the list is considered
	 * visible: `<Autocomplete.Root inline open>`
	 * @default false
	 */
	inline?: boolean;
	/**
	 * Whether clicking an item should submit the autocomplete's owning form.
	 * By default, clicking an item via a pointer or Enter key does not submit the owning form.
	 * Useful when the autocomplete is used as a single-field form search input.
	 * @default false
	 */
	submitOnItemClick?: boolean;
	/** The input value of the autocomplete. */
	value?: string | null;
	/**
	 * The uncontrolled input value of the autocomplete when it's initially rendered.
	 *
	 * To render a controlled autocomplete, use `bind:value` instead.
	 */
	defaultValue?: string;
	/** Event handler called when the input value of the autocomplete changes. */
	onValueChange?: (value: string, eventDetails: AutocompleteChangeEventDetails) => void;
	/** The items of the list: flat, or groups with an `items` array. */
	items?: readonly ItemValue[] | readonly Group<ItemValue>[];
	/**
	 * Filtered items to display in the list.
	 * When provided, the list uses these items instead of filtering the `items` prop internally.
	 * When `items` is also provided, this array must preserve its flat or grouped structure.
	 * Nullish entries are not supported, as in `items`.
	 * Use when you want to control filtering logic externally with the `useFilter()` hook.
	 */
	filteredItems?: readonly ItemValue[] | readonly Group<ItemValue>[];
	/**
	 * Controls how the autocomplete behaves with respect to list filtering and inline autocompletion.
	 * - `list` (default): items are dynamically filtered based on the input value. The input value does not change based on the active item.
	 * - `both`: items are dynamically filtered based on the input value, which will temporarily change based on the active item (inline autocompletion).
	 * - `inline`: items are static (not filtered), and the input value will temporarily change based on the active item (inline autocompletion).
	 * - `none`: items are static (not filtered), and the input value will not change based on the active item.
	 * @default 'list'
	 */
	mode?: AutocompleteMode;
	/**
	 * Whether the first matching item is highlighted automatically.
	 * - `true`: highlight after the user types and keep the highlight while the query changes.
	 * - `'always'`: always highlight the first item.
	 * @default false
	 */
	autoHighlight?: boolean | 'always';
	/**
	 * Whether the popup opens when clicking the input.
	 * @default false
	 */
	openOnInputClick?: boolean;
	/**
	 * When the item values are objects (`<Autocomplete.Item value={object}>`), this function converts the object value to a string representation for both display in the input and form submission.
	 * If the shape of the object is `{ value, label }`, the label will be used automatically without needing to specify this prop.
	 */
	itemToStringValue?: (itemValue: ItemValue) => string;
}

/** The item type of `items`: the element type, or a group's item type for grouped items. */
export type AutocompleteItemOf<Items> = Items extends readonly (infer Entry)[]
	? Entry extends { readonly items: readonly (infer Item)[] }
		? Item
		: Entry
	: never;

/**
 * `Autocomplete.Root` props with the item type read from `items`, so the item of a group, not
 * the group, types `itemToStringValue`, `filter` and `onItemHighlighted`.
 */
export type AutocompleteRootItemsProps<Items extends readonly unknown[]> = Omit<
	AutocompleteRootProps<AutocompleteItemOf<Items>>,
	'items'
> & {
	/**
	 * The items to be displayed in the list.
	 * Can be either a flat array of items or an array of groups with items.
	 * Nullish entries are not supported: remove them from the data before passing it.
	 */
	items?: Items;
};

export interface AutocompleteValueProps {
	/** Formats the input text. Without it the text renders as is. */
	children?: Snippet<[value: string]>;
}

export type AutocompleteTriggerState = Omit<ComboboxTriggerState, 'placeholder'>;

export interface AutocompleteTriggerProps extends Omit<ComboboxTriggerProps, 'render'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLButtonAttributes, state: AutocompleteTriggerState, children: RenderChildren]
	>;
}

export type AutocompleteInputGroupState = Omit<ComboboxInputGroupState, 'placeholder'>;

export interface AutocompleteInputGroupProps extends Omit<ComboboxInputGroupProps, 'render'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[
			props: HTMLAttributes<HTMLDivElement>,
			state: AutocompleteInputGroupState,
			children: RenderChildren
		]
	>;
}

export interface AutocompleteItemState {
	/** Whether the item ignores user interaction. */
	disabled: boolean;
	/** Whether the item is highlighted. */
	highlighted: boolean;
}

export interface AutocompleteItemProps extends Omit<ComboboxItemProps, 'render'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLDivElement>, state: AutocompleteItemState, children: RenderChildren]
	>;
}

export type AutocompleteSeparatorProps = SeparatorProps;
export type AutocompleteSeparatorState = SeparatorState;
