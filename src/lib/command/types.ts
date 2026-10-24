import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { CommandFilter } from './rank.js';

export type { CommandFilter };

export interface CommandRootProps extends HTMLAttributes<HTMLDivElement> {
	/** Accessible label for the command menu, rendered visually hidden. */
	label?: string;
	/**
	 * Set to false to turn off filtering and sorting, for example when the items come from a server search.
	 * @default true
	 */
	shouldFilter?: boolean;
	/** Scores an item against the search from 0 (hidden) to 1 (best). Defaults to `defaultFilter`. */
	filter?: CommandFilter;
	/**
	 * The selected item's value. Bindable. While it is empty, Root selects the first item. A value that names no item is
	 * kept, and selects the first item with that value once one mounts.
	 *
	 * To start with a value without binding it, use the `defaultValue` prop instead.
	 */
	value?: string;
	/**
	 * The value of the item selected at first.
	 * This is the uncontrolled counterpart of `value`.
	 */
	defaultValue?: string;
	/** Called on every change of the selected value, including the menu's own automatic selection. */
	onValueChange?: (value: string) => void;
	/**
	 * Wraps the arrow keys around the ends of the list.
	 * @default false
	 */
	loop?: boolean;
	/**
	 * Stops pointer movement from selecting items.
	 * @default false
	 */
	disablePointerSelection?: boolean;
	/**
	 * Enables Ctrl+N/J and Ctrl+P/K.
	 * @default true
	 */
	vimBindings?: boolean;
	/** Runs before the menu's keyboard handling. Call `event.preventDefault()` to skip it. */
	onkeydown?: HTMLAttributes<HTMLDivElement>['onkeydown'];
}

export interface CommandInputProps extends Omit<
	HTMLInputAttributes,
	'value' | 'type' | 'children'
> {
	/**
	 * The search text. Bindable.
	 *
	 * To start with a search without binding it, use the `defaultValue` prop instead.
	 */
	value?: string;
}

export interface CommandListProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * Accessible label for the listbox.
	 * @default 'Suggestions'
	 */
	label?: string;
}

export interface CommandItemProps extends HTMLAttributes<HTMLDivElement> {
	/** The item's value. Defaults to its trimmed text content. */
	value?: string;
	/** Extra words the search matches against. */
	keywords?: readonly string[];
	/**
	 * Whether the item ignores the keyboard, the pointer and clicks.
	 * @default false
	 */
	disabled?: boolean;
	/** Keeps the item visible whatever the search is. */
	forceMount?: boolean;
	/** Called with the item's value on click or Enter. */
	onSelect?: (value: string) => void;
	/** Runs before the item handles the click. Call `event.preventDefault()` to skip it. */
	onclick?: HTMLAttributes<HTMLDivElement>['onclick'];
	/** Runs before the item selects itself on pointer movement. Call `event.preventDefault()` to skip it. */
	onpointermove?: HTMLAttributes<HTMLDivElement>['onpointermove'];
}

export interface CommandGroupProps extends HTMLAttributes<HTMLDivElement> {
	/** The group's heading, which also labels its items. */
	heading?: string | Snippet;
	/** The group's `data-value`. Defaults to the heading's text. */
	value?: string;
	/**
	 * Keeps the group and its items visible whatever the search is.
	 * @default false
	 */
	forceMount?: boolean;
}

export interface CommandSeparatorProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * Keeps the separator rendered while searching.
	 * @default false
	 */
	alwaysRender?: boolean;
}

export type CommandEmptyProps = HTMLAttributes<HTMLDivElement>;

export interface CommandLoadingProps extends HTMLAttributes<HTMLDivElement> {
	/** Loading progress from 0 to 100. */
	progress?: number;
	/**
	 * Accessible label for the progress bar.
	 * @default 'Loading...'
	 */
	label?: string;
}

/** The command menu's state, read with `getCommandState()` from any descendant of Root. */
export interface CommandState {
	readonly search: string;
	readonly value: string;
	/** How many items match the search, not counting force-mounted ones. 0 until Root mounts. */
	readonly count: number;
	/** The id of the selected item element. */
	readonly selectedId: string | undefined;
}
