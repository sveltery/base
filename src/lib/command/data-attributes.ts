// Derived from cmdk v1.1.1 cmdk/src/index.tsx (commit dd2250ed608443e8f32bafc5fa2d1d07a3746aa3).
// MIT, see THIRD_PARTY_NOTICES.md.

export const CommandItemDataAttributes = {
	/** `"true"` when the item is selected, else `"false"`. */
	selected: 'data-selected',
	/** `"true"` when the item is disabled, else `"false"`. */
	disabled: 'data-disabled',
	/** The item's value. */
	value: 'data-value'
} as const;

export const CommandGroupDataAttributes = {
	/** The group's value. */
	value: 'data-value'
} as const;

export const CommandListCssVars = {
	/**
	 * The height of the list's content.
	 * @type {number}
	 */
	listHeight: '--cmdk-list-height'
} as const;
