// Derived from Base UI v1.9.0 packages/react/src/filter-dropdown/root/FilterDropdownRoot.tsx,
// FilterDropdownRootContext.ts, useFilterDropdownCloseQuery.ts, store.ts,
// packages/react/src/filter-dropdown/item/useFilterDropdownItem.ts,
// packages/react/src/filter-dropdown/group/useFilterDropdownGroup.ts,
// packages/react/src/menu/filter-root/MenuFilterDropdown.tsx, useMenuFilterRoot.ts and
// packages/react/src/menu/filter-provider/MenuFilterProviderContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream splits the filter between a generic `FilterDropdownRoot` and the Menu adapter around
// it. Only Menu uses it, so one class holds both. An item's text is watched with a
// `MutationObserver`, since a Svelte snippet has no children value to compare.

import { untrack } from 'svelte';
import { REASONS, createChangeEventDetails, type BaseUIChangeEventDetails } from '@sveltery/utils';
import { isVirtualPointerEvent } from '@sveltery/floating-ui-svelte';
import { defineOptionalContext } from '../internal/context.js';
import { preventBaseUIHandler } from '../internal/mergeProps.js';
import { getFilter } from './filter.js';
import { handleMenuFilterKeyDown, type MenuFilterKeyDownContext } from './filter-keydown.js';
import { findMenubarParent } from './parent.svelte.js';
import type { MenuStore } from './store.svelte.js';

export type MenuFilterChangeReason =
	| typeof REASONS.inputChange
	| typeof REASONS.inputClear
	| typeof REASONS.clearPress
	| typeof REASONS.popupClose;

export type MenuFilterChangeEventDetails = BaseUIChangeEventDetails<MenuFilterChangeReason>;

export type MenuFilterFunction = (text: string, query: string) => boolean;

/** What `Menu.FilterProvider` hands to the root directly inside it. */
export interface MenuFilterProviderContext {
	readonly filter: MenuFilterFunction | null | undefined;
	readonly autoHighlight: boolean | 'always';
	readonly locale: Intl.LocalesArgument | undefined;
	/** The committed query. */
	readonly value: string;
	/** Reports a query change and commits it unless it was canceled. */
	setValue(value: string, details: MenuFilterChangeEventDetails): void;
}

const [readProvider, setProvider] = defineOptionalContext<MenuFilterProviderContext | null>(null);

export const setMenuFilterProvider = setProvider;

/**
 * The provider directly above a root. The root consumes it, so a plain `Menu.SubmenuRoot`
 * inside a filterable menu stays plain.
 */
export function takeMenuFilterProvider(): MenuFilterProviderContext | null {
	const provider = readProvider();
	if (provider) setProvider(null);
	return provider;
}

/**
 * Entries keyed by registrant, published as a fresh map on each change. The plain map is the
 * source of truth: an effect teardown reads a source changed in the same batch as its old value,
 * so a write derived from the published map would drop a registration made earlier in the batch.
 */
class Registry<T> {
	readonly #entries = new Map<symbol, T>();
	current = $state.raw<ReadonlyMap<symbol, T>>(new Map());

	set(id: symbol, value: T) {
		this.#entries.set(id, value);
		this.current = new Map(this.#entries);
		return () => {
			if (!this.#entries.delete(id)) return;
			this.current = new Map(this.#entries);
		};
	}

	/** Republishes an entry, so readers run again. */
	touch(id: symbol, value: T) {
		if (!this.#entries.has(id)) return;
		this.#entries.set(id, value);
		this.current = new Map(this.#entries);
	}
}

/** A snapshot of visible ids. Each filter pass publishes a new one instead of mutating it. */
function frozenIds(ids: readonly symbol[]): ReadonlySet<symbol> {
	return new Set(ids);
}

/** Collects a group's items and hides the group once the query filters out all of them. */
export class MenuFilterGroup {
	readonly #members = new Registry<boolean>();
	readonly #id = Symbol('menu-filter-group');
	readonly hidden: boolean;

	constructor(filter: MenuFilter, parent: MenuFilterGroup | null) {
		this.hidden = $derived.by(() => {
			const visible = filter.visibleIds;
			// A group with no members has not been filtered out. Its items have not registered yet.
			const members = this.#members.current;
			if (visible === null || members.size === 0) return false;
			for (const [id, retained] of members) {
				if (retained || visible.has(id)) return false;
			}
			return true;
		});

		// A nested group collects its own items, so it reports its visibility upward.
		$effect(() => {
			const shown = !this.hidden;
			return untrack(() => parent?.register(this.#id, shown));
		});
	}

	register(id: symbol, retained: boolean) {
		return this.#members.set(id, retained);
	}
}

const [readGroup, setGroup] = defineOptionalContext<MenuFilterGroup | null>(null);

export const findMenuFilterGroup = readGroup;
export const setMenuFilterGroup = setGroup;

export interface MenuFilterItemOptions {
	/** Text used for matching. Falls back to the rendered text. */
	label: string | undefined;
	/** The rendered element, read for its text. */
	node: HTMLElement | null;
	/** Keeps the nearest group visible while this filtered-out item stays mounted. */
	retainGroup?: boolean;
}

/**
 * Registers an item with a filter and reports whether the query keeps it. A late item renders
 * once before it registers, so its text can be read: a hidden item has no text left to match.
 */
export class MenuFilterItem {
	readonly #id = Symbol('menu-filter-item');
	#registered = $state(true);
	/** The text last read from the element, used while the item is filtered out. */
	#text: string | undefined = undefined;
	readonly visible: boolean;

	constructor(
		owner: MenuFilter | null,
		options: () => MenuFilterItemOptions,
		group: MenuFilterGroup | null = readGroup()
	) {
		this.#registered = owner == null || owner.isVisible(this.#id);
		this.visible = $derived(!this.#registered || (owner?.isVisible(this.#id) ?? true));
		if (!owner) return;

		const readText = () => {
			const { label, node } = options();
			if (label != null) return label;
			// A mounted item reports what it renders now. A filtered-out item keeps its last text.
			if (node) this.#text = node.textContent?.trim() ?? '';
			return this.#text;
		};

		// `options()` also reads the node and the item's other props. A filtered-out item drops its
		// node, and re-registering it then would run the query again for nothing.
		const label = $derived(options().label);
		$effect(() => {
			void label;
			return untrack(() => {
				readText();
				const stop = owner.register(this.#id, readText);
				this.#registered = true;
				return stop;
			});
		});

		// Runs the active query again when the rendered text changes, including text that changed
		// while the item was filtered out and is read once it mounts again.
		$effect(() => {
			const { label, node } = options();
			if (label != null || !node) return;
			const sync = () => {
				const previous = this.#text;
				if (readText() !== previous) owner.touch(this.#id, readText);
			};
			untrack(sync);
			const observer = new MutationObserver(sync);
			observer.observe(node, { characterData: true, childList: true, subtree: true });
			return () => observer.disconnect();
		});

		const retained = $derived(options().retainGroup ?? false);
		$effect(() => {
			const retain = retained;
			return untrack(() => group?.register(this.#id, retain));
		});
	}
}

export interface MenuFilterOptions {
	readonly provider: MenuFilterProviderContext;
	readonly keys: MenuFilterKeyDownContext;
	/** Base for the generated list id. */
	readonly id: string;
}

/**
 * Holds the filter query, matches it against the registered items, and moves the menu's
 * highlight. The menu root owns the open state and the list navigation.
 */
export class MenuFilter {
	visibleIds = $state.raw<ReadonlySet<symbol> | null>(null);
	/** Whether the input shows its focus ring. */
	inputFocusVisible = $state(false);
	/** Whether the last interaction was a key press rather than the pointer. */
	keyboardModality = $state(false);
	/** The id an explicit `id` prop gave the list. */
	renderedListId = $state<string | undefined>(undefined);
	readonly defaultListId: string;

	readonly #registry = new Registry<() => string | undefined>();
	/** The query a closing popup keeps showing until it unmounts. */
	#closeQuery = $state<string | null>(null);
	#lastFilterQuery: string | null = null;
	readonly #provider: MenuFilterProviderContext;
	readonly #keys: MenuFilterKeyDownContext;
	readonly #inMenubar = findMenubarParent() != null;

	constructor(
		readonly store: MenuStore,
		options: MenuFilterOptions
	) {
		this.#provider = options.provider;
		this.#keys = options.keys;
		this.defaultListId = `base-ui-${options.id}-list`;

		// The input starts with its focus ring when the popup opened from the keyboard.
		$effect.pre(() => {
			const keyboard = store.keyboardOpen;
			untrack(() => {
				this.inputFocusVisible = keyboard;
				this.keyboardModality = keyboard;
			});
		});

		// Only `setOpen` records a keyboard open, so a controlled close must not leave the next
		// programmatic open looking like one.
		$effect.pre(() => {
			if (!store.open) untrack(() => (store.keyboardOpen = false));
		});

		// A close clears the committed query, while the closing popup keeps showing it.
		let wasOpen = untrack(() => store.open);
		$effect(() => {
			const open = store.open;
			const mounted = store.mounted;
			untrack(() => {
				const previous = wasOpen;
				wasOpen = open;
				const value = this.value;
				if (previous && !open && value !== '') {
					this.#closeQuery = value;
					this.#provider.setValue('', createChangeEventDetails(REASONS.popupClose));
				} else if ((open || !mounted) && this.#closeQuery !== null) {
					this.#closeQuery = null;
				}
			});
		});

		// Re-runs when an item registers or changes its text, and on the committed query, since a
		// bound consumer can reject a proposed change.
		$effect(() => {
			const registry = this.#registry.current;
			const query = this.filterQuery;
			const match = this.#matcher;
			const auto = this.autoHighlightEnabled;
			void store.open;
			untrack(() => this.#applyQuery(registry, query, match, auto));
		});
	}

	get value(): string {
		return this.#provider.value;
	}

	/** The query the items are matched against: the closing query while the popup animates out. */
	get query(): string {
		return !this.store.open && this.#closeQuery !== null ? this.#closeQuery : this.value;
	}

	get filterQuery(): string {
		return this.query.trim();
	}

	get autoHighlight(): boolean | 'always' {
		return this.#provider.autoHighlight;
	}

	get autoHighlightEnabled(): boolean {
		const auto = this.autoHighlight;
		return this.store.open && (auto === 'always' || (auto && this.filterQuery !== ''));
	}

	get listId(): string | undefined {
		return (this.renderedListId ?? this.defaultListId) || undefined;
	}

	/** The id of the trigger, for the list's label. An element's empty id means none. */
	get triggerId(): string | undefined {
		const trigger = this.store.activeTriggerElement;
		const id = trigger ? trigger.id || null : this.store.resolvedActiveTriggerId();
		return id || undefined;
	}

	get #matcher(): ((text: string, query: string) => boolean) | null {
		const filter = this.#provider.filter;
		if (this.filterQuery === '' || filter === null) return null;
		return filter ?? getFilter({ locale: this.#provider.locale }).contains;
	}

	get isEmpty(): boolean {
		const visible = this.visibleIds;
		return visible === null ? this.#registry.current.size === 0 : visible.size === 0;
	}

	isVisible(id: symbol): boolean {
		const visible = this.visibleIds;
		return visible === null || visible.has(id);
	}

	register(id: symbol, getText: () => string | undefined) {
		return this.#registry.set(id, getText);
	}

	/** Runs the query again for an item whose text changed. */
	touch(id: symbol, getText: () => string | undefined) {
		this.#registry.touch(id, getText);
	}

	setActiveIndex(index: number | null) {
		this.store.setActiveIndex(index, REASONS.none);
	}

	/** Reports a query edit and resets the highlight it invalidates. */
	onValueChange(value: string, details: MenuFilterChangeEventDetails) {
		this.#provider.setValue(value, details);
		// Indexes are positional, so a kept highlight would land on whatever fills its slot. With
		// `autoHighlight`, the query effect places the highlight instead.
		if (!details.isCanceled && !this.autoHighlight) this.setActiveIndex(null);
	}

	/** Called by the list when its items change after they first registered. */
	onItemsChange(previous: readonly HTMLElement[]) {
		const items = this.store.items.elements;
		const index = this.store.activeIndex;
		// A change that leaves the highlighted item in place keeps it.
		if (index != null && items[index] != null && items[index] === previous[index]) return;
		this.setActiveIndex(this.autoHighlightEnabled && items.length > 0 ? 0 : null);
	}

	#applyQuery(
		registry: ReadonlyMap<symbol, () => string | undefined>,
		query: string,
		match: ((text: string, query: string) => boolean) | null,
		auto: boolean
	) {
		const queryChanged = this.#lastFilterQuery !== null && this.#lastFilterQuery !== query;
		this.#lastFilterQuery = query;

		// With no query or external filtering, every registered item is visible.
		if (match === null) {
			this.visibleIds = null;
			if (auto && registry.size > 0) {
				if (queryChanged || this.store.activeIndex == null) this.setActiveIndex(0);
			} else if (query === '' && queryChanged) {
				this.setActiveIndex(null);
			}
			return;
		}

		const current = this.visibleIds;
		// Publishing an empty result before anything registered would hide every item as it
		// arrives and remount the matches.
		if (current === null && registry.size === 0) return;

		const matched = [...registry]
			.filter(([, getText]) => {
				const text = getText();
				return text != null && match(text, query);
			})
			.map(([id]) => id);
		const hasNewMatch = current === null || matched.some((id) => !current.has(id));

		// New matches or a smaller result invalidate the previous item identities.
		if (hasNewMatch || current.size !== matched.length) {
			if (auto && matched.length > 0) this.setActiveIndex(0);
			else if (current !== null || queryChanged) this.setActiveIndex(null);
			this.visibleIds = frozenIds(matched);
		} else if (auto && queryChanged && matched.length > 0) {
			this.setActiveIndex(0);
		}
	}

	/**
	 * Props the menu adds to its triggers: dialog semantics, screen reader press tracking, and a
	 * relay of list navigation typed on the trigger to the input, which holds real focus.
	 */
	readonly triggerProps = {
		'aria-haspopup': 'dialog' as const,
		onpointerdown: (event: PointerEvent) => {
			this.store.virtualPress = isVirtualPointerEvent(event);
		},
		onkeydown: (event: KeyboardEvent) => {
			if (this.#relayTriggerKey(event)) preventBaseUIHandler(event);
		}
	};

	/** Handles a key typed on the trigger. Returns whether the trigger's own handlers skip it. */
	#relayTriggerKey(event: KeyboardEvent): boolean {
		const owner = this.store.focusOwner;
		if (!this.store.open || !owner || this.#inMenubar) return false;
		if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			owner.focus({ preventScroll: true });
			handleMenuFilterKeyDown(this.#keys, event, this.value !== '');
			event.preventDefault();
			return true;
		}
		// Cross-axis keys drive submenus, which the trigger must not relay.
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') return true;
		if (
			event.key.length === 1 &&
			event.key !== ' ' &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.altKey
		) {
			owner.focus({ preventScroll: true });
		}
		return false;
	}
}
