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
> {
	/**
	 * The text in the input, which is the value the form submits. Use `bind:value` to share it
	 * with the parent. Without a binding it starts from `defaultValue`.
	 */
	value?: string | null;
	/** The text the input starts with and the text a form reset restores. */
	defaultValue?: string;
	/** Called before the input text changes. Call `eventDetails.cancel()` to keep the text. */
	onValueChange?: (value: string, eventDetails: AutocompleteChangeEventDetails) => void;
	/** The items of the list: flat, or groups with an `items` array. */
	items?: readonly ItemValue[] | readonly Group<ItemValue>[];
	/**
	 * Items filtered by the consumer. The list shows them instead of filtering `items` itself.
	 * Keep the flat or grouped shape of `items`.
	 */
	filteredItems?: readonly ItemValue[] | readonly Group<ItemValue>[];
	/**
	 * How the list filters and whether the input completes inline with the highlighted item.
	 * @default 'list'
	 */
	mode?: AutocompleteMode;
	/**
	 * Whether the first matching item is highlighted automatically. `true` highlights it once the
	 * user types and keeps it while the query changes. `'always'` highlights it as soon as the
	 * list opens.
	 * @default false
	 */
	autoHighlight?: boolean | 'always';
	/**
	 * Whether the popup opens when the input is pressed.
	 * @default false
	 */
	openOnInputClick?: boolean;
	/**
	 * Converts an object item value to the text shown in the input and submitted with the form.
	 * A `{ value, label }` object uses its `label` without it.
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
	/** The items of the list: flat, or groups with an `items` array. */
	items?: Items;
};

export interface AutocompleteValueProps {
	/** Formats the input text. Without it the text renders as is. */
	children?: Snippet<[value: string]>;
}

export type AutocompleteTriggerState = Omit<ComboboxTriggerState, 'placeholder'>;

export interface AutocompleteTriggerProps extends Omit<ComboboxTriggerProps, 'render'> {
	render?: Snippet<
		[props: HTMLButtonAttributes, state: AutocompleteTriggerState, children: RenderChildren]
	>;
}

export type AutocompleteInputGroupState = Omit<ComboboxInputGroupState, 'placeholder'>;

export interface AutocompleteInputGroupProps extends Omit<ComboboxInputGroupProps, 'render'> {
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
	render?: Snippet<
		[props: HTMLAttributes<HTMLDivElement>, state: AutocompleteItemState, children: RenderChildren]
	>;
}

export type AutocompleteSeparatorProps = SeparatorProps;
export type AutocompleteSeparatorState = SeparatorState;
