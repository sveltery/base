// Derived from Base UI v1.9.0 packages/react/src/combobox/store.ts and the state, callbacks and
// layout effects of packages/react/src/combobox/root/AriaCombobox.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// One store serves every selection mode, so Autocomplete reuses it with `selectionMode: 'none'`.
// Open, mount and transition state stay on the shared PopupStore. Items register in one
// ElementList; with the `items` prop their values come from the filtered items instead.

import { untrack } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import {
	contains,
	createChangeEventDetails,
	createGenericEventDetails,
	REASONS,
	type BaseUIChangeEventDetails
} from '@sveltery/utils';
import { getOverflowAncestors } from '@floating-ui/dom';
import { ElementList } from '../internal/element-list.svelte.js';
import { PopupStore } from '../internal/popups/store.svelte.js';
import {
	compareItemEquality,
	findItemIndex,
	findSelectionIndex,
	removeItem,
	selectedValueIncludes,
	type ItemEqualityComparer
} from '../internal/listbox/itemEquality.js';
import {
	flattenLeafItems,
	stringifyAsLabel,
	type Group
} from '../internal/listbox/resolveValueLabel.js';
import { isScrollable } from '../internal/scrollable.js';
import {
	filterItems,
	findCollectionItem,
	mapValuesToItems,
	isItemCollection,
	type ComboboxItemCollection,
	type ComboboxItemsData,
	type ItemFilter
} from './collection.js';
import {
	createCollatorItemFilter,
	getFilter,
	type Filter,
	type FilterItemToString
} from './filter.js';
import { isTypedInput } from './parts.js';
import type {
	ComboboxChangeEventDetails,
	ComboboxChangeReason,
	ComboboxHighlightEventDetails,
	ComboboxHighlightReason,
	ComboboxOpenChangeEventDetails
} from './types.js';

export type ComboboxSelectionMode = 'single' | 'multiple' | 'none';
export type ComboboxAutoHighlight = false | 'input-change' | 'always';

export interface ComboboxItemMeta {
	value: unknown;
	disabled: boolean;
}

/** Root props the store reads. Each field is a getter. */
export interface ComboboxRootReading {
	id: string;
	selectionMode: ComboboxSelectionMode;
	selectedValue: unknown;
	inputValue: string;
	name: string | undefined;
	form: string | undefined;
	disabled: boolean;
	readOnly: boolean;
	required: boolean;
	grid: boolean;
	inline: boolean;
	openOnInputClick: boolean;
	autoHighlight: ComboboxAutoHighlight;
	modal: boolean;
	submitOnItemClick: boolean;
	fillInputOnItemPress: boolean;
	/** Whether the consumer passed `inputValue` or `defaultInputValue`. Fixed at init. */
	hasInputValue: boolean;
	items: ComboboxItemsData<unknown> | ComboboxItemCollection | undefined;
	filteredItems: ComboboxItemsData<unknown> | undefined;
	filter: ItemFilter | null | undefined;
	filterQuery: string | undefined;
	limit: number;
	locale: Intl.LocalesArgument | undefined;
	itemToStringLabel: ((item: never) => string) | undefined;
	itemToStringValue: ((item: never) => string) | undefined;
	isItemEqualToValue: ItemEqualityComparer;
}

export interface ComboboxStoreOptions {
	readOpen: () => boolean | undefined;
	writeOpen: (open: boolean) => void;
	floatingId: string;
	root: ComboboxRootReading;
	/** Calls `onSelectedValueChange`, then writes the value unless it was canceled. */
	commitSelectedValue: (next: unknown, details: ComboboxChangeEventDetails) => void;
	/** Calls `onInputValueChange`, then writes the value unless it was canceled. */
	commitInputValue: (next: string, details: ComboboxChangeEventDetails) => void;
	onOpenChange: () =>
		((open: boolean, details: ComboboxOpenChangeEventDetails) => void) | undefined;
	onOpenChangeComplete: () => ((open: boolean) => void) | undefined;
	onItemHighlighted: () =>
		((value: unknown, details: ComboboxHighlightEventDetails) => void) | undefined;
	/** Field bookkeeping when focus or a press outside closes a popup that holds the input. */
	onDismissedOutside: () => void;
	requestSubmit: () => void;
	readInputProps: () => HTMLAttributes<HTMLElement>;
	/** Name and form-source props for an input that submits the input value itself. */
	readInputFormProps: () => Record<string | symbol, unknown>;
	readPopupProps: () => HTMLAttributes<HTMLElement>;
	readListProps: () => HTMLAttributes<HTMLElement>;
	readItemProps: () => HTMLAttributes<HTMLElement>;
}

const NO_HIGHLIGHT = { value: Symbol('none') as unknown, index: -1 };

interface PendingQueryHighlight {
	hasQuery: boolean;
	selection?: boolean;
	/** The value a selection-driven clear just added, so the restore keeps it highlighted. */
	toggledValue?: unknown;
}

type PopupSide = 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';

export class ComboboxStore extends PopupStore<ComboboxChangeReason> {
	readonly items = new ElementList<HTMLElement, ComboboxItemMeta>();

	activeIndex = $state<number | null>(null);
	selectedIndex = $state<number | null>(null);
	labelId = $state<string | undefined>(undefined);
	popupId = $state<string | undefined>(undefined);
	inputElement = $state<HTMLInputElement | null>(null);
	triggerElement = $state<HTMLElement | null>(null);
	inputGroupElement = $state<HTMLElement | null>(null);
	listElement = $state<HTMLElement | null>(null);
	emptyElement = $state<HTMLElement | null>(null);
	clearElement = $state<HTMLElement | null>(null);
	chipsElement = $state<HTMLElement | null>(null);
	/** Whether the input renders inside the popup. True until an input outside it mounts. */
	inputInsidePopup = $state(true);
	/** Mounts the items while closed, for typeahead on the trigger and for autofill. */
	forceMounted = $state(false);
	#readPopupSide = $state<(() => PopupSide) | null>(null);
	queryChangedAfterOpen = $state(false);
	/** The query frozen while the popup animates out. */
	closeQuery = $state<string | null>(null);
	#closingQuery: string | null = null;

	/** The item that received the last `pointerdown`, to tell a drag-select from a click. */
	pointerDownItem: Element | null = null;
	/** The keyboard event that clicked the highlighted item, reported as the selection event. */
	selectionEvent: KeyboardEvent | null = null;
	#lastHighlight = NO_HIGHLIGHT;
	#pendingQueryHighlight: PendingQueryHighlight | null = null;
	#hadInputClear = false;
	readonly #options: ComboboxStoreOptions;

	constructor(options: ComboboxStoreOptions) {
		super({
			readOpen: options.readOpen,
			writeOpen: options.writeOpen,
			floatingId: options.floatingId,
			// The popup, else the positioner or inline list, is the floating element. The positioner
			// also holds the focus manager's guards, which must not count as its tabbables.
			floatingElement: 'popup',
			onOpenChange: options.onOpenChange as () =>
				| ((open: boolean, details: BaseUIChangeEventDetails<ComboboxChangeReason>) => void)
				| undefined,
			onOpenChangeComplete: () => (open) => {
				if (!open) {
					options.onOpenChangeComplete()?.(false);
					this.#unmountCleanup();
				} else {
					options.onOpenChangeComplete()?.(true);
				}
			}
		});
		this.#options = options;

		// A reopen through the binding skips `setOpen`, so it cancels a pending
		// `preventUnmountOnClose` here, as Select does.
		$effect.pre(() => {
			if (this.open && untrack(() => this.preventUnmountingOnClose)) {
				this.preventUnmountingOnClose = false;
			}
		});

		$effect.pre(() => {
			const floating = this.popupElement ?? this.positionerElement;
			untrack(() => {
				this.floatingElement = floating;
			});
		});

		$effect.pre(() => {
			const reference = this.defaultReference;
			untrack(() => {
				// An initially open popup still needs a reference once its control mounts.
				if (!this.open || !this.domReferenceElement) this.domReferenceElement = reference;
			});
		});

		this.#syncSelectedIndex();

		// A controlled close can bypass `setOpen`. Runs before the highlight sync, which would
		// otherwise resolve the request against the closing list.
		$effect.pre(() => {
			if (!this.open && this.#pendingQueryHighlight?.hasQuery) this.#pendingQueryHighlight = null;
		});

		this.#syncHighlight();

		// Keeps the active index off an empty list, so one ArrowDown reaches the first item.
		$effect(() => {
			const empty = this.flatFilteredValues.length === 0;
			if (this.hasItems && this.root.autoHighlight && empty) {
				untrack(() => this.setIndices({ activeIndex: null }));
			}
		});
	}

	/**
	 * Seeds the selected index of an inline list open from the start. It never gets a closed
	 * pass of the index sync, and `items` lists do not claim their index. Call once the initial
	 * value is written.
	 */
	seedSelectedIndex() {
		untrack(() => {
			const { inline, selectionMode, selectedValue, isItemEqualToValue } = this.root;
			if (inline && this.open && this.hasItems && selectionMode !== 'none') {
				this.selectedIndex = findSelectionIndex(
					this.flatFilteredValues,
					selectedValue,
					isItemEqualToValue,
					selectionMode === 'multiple'
				);
			}
		});
	}

	get root(): ComboboxRootReading {
		return this.#options.root;
	}

	get selectionMode() {
		return this.root.selectionMode;
	}

	get selectedValue() {
		return this.root.selectedValue;
	}

	get inputValue() {
		return this.root.inputValue;
	}

	get inputProps() {
		return this.#options.readInputProps();
	}

	get inputFormProps() {
		return this.#options.readInputFormProps();
	}

	get popupProps() {
		return this.#options.readPopupProps();
	}

	get listProps() {
		return this.#options.readListProps();
	}

	get itemProps() {
		return this.#options.readItemProps();
	}

	/** The element the popup is anchored to and dismissal ignores. */
	get defaultReference(): HTMLElement | null {
		return this.inputInsidePopup ? this.triggerElement : this.inputElement;
	}

	override isOpen() {
		return this.open || this.root.inline;
	}

	protected override preventUnmountTiming(): 'immediate' | 'deferred' {
		return 'deferred';
	}

	readonly collection = $derived(isItemCollection(this.root.items) ? this.root.items : null);

	/** The `items` data, or `undefined` when there is no `items` prop or it has not loaded. */
	readonly itemsData = $derived<ComboboxItemsData<unknown> | undefined>(
		this.collection
			? this.collection.data
			: (this.root.items as ComboboxItemsData<unknown> | undefined)
	);

	get hasItems() {
		return this.itemsData !== undefined;
	}

	/** Items `Combobox.Value` resolves labels from. A collection labels values itself. */
	get labelItems() {
		return this.collection ? undefined : this.itemsData;
	}

	/** The external `filteredItems` of a collection, projected to their values. */
	readonly #externalWindow = $derived.by(() => {
		const filtered = this.root.filteredItems;
		const collection = this.collection;
		if (!filtered || !collection) return undefined;
		const flat = flattenLeafItems(filtered);
		const values = flat.map((item) => collection.value(item));
		return {
			values,
			findItem(value: unknown, isEqual: ItemEqualityComparer) {
				return findCollectionItem(mapValuesToItems(values, flat), value, isEqual);
			}
		};
	});

	/** Labels a selection value: collection data first, then the external window, then the prop. */
	readonly itemToStringLabel = $derived.by((): ((item: never) => string) | undefined => {
		const collection = this.collection;
		const fallback = this.root.itemToStringLabel;
		if (!collection) return fallback;
		const isEqual = this.root.isItemEqualToValue;
		const external = this.#externalWindow;
		return ((value: unknown) =>
			collection.label(value, isEqual, (unresolved: unknown) => {
				const item = external?.findItem(unresolved, isEqual);
				if (item != null) return collection.itemLabel(item);
				return stringifyAsLabel(unresolved, fallback);
			})) as (item: never) => string;
	});

	readonly #filterItemToString = $derived.by(
		(): FilterItemToString | ((item: never) => string) | undefined => {
			const collection = this.collection;
			if (!collection) return this.root.itemToStringLabel;
			const toLabel = this.itemToStringLabel;
			return Object.assign((item: never) => collection.itemLabel(item), {
				selected: (value: unknown) => stringifyAsLabel(value, toLabel)
			});
		}
	);

	readonly collatorFilter: Filter = $derived(getFilter({ locale: this.root.locale }));

	readonly #filter = $derived.by((): ItemFilter => {
		const filter = this.root.filter;
		if (filter === null) return () => true;
		if (filter !== undefined) return filter;
		return createCollatorItemFilter(this.collatorFilter, this.#filterItemToString);
	});

	stringifyLabel(value: unknown) {
		return stringifyAsLabel(value, this.itemToStringLabel);
	}

	readonly query = $derived(
		!this.open && this.closeQuery !== null ? this.closeQuery : String(this.inputValue).trim()
	);

	readonly selectedLabelString = $derived(
		this.selectionMode === 'single' ? this.stringifyLabel(this.selectedValue) : ''
	);

	readonly #shouldBypassFiltering = $derived(
		this.selectionMode === 'single' &&
			!this.queryChangedAfterOpen &&
			this.query !== '' &&
			this.selectedLabelString.length === this.query.length &&
			this.collatorFilter.contains(this.selectedLabelString, this.query)
	);

	readonly #filterQuery = $derived(
		this.#shouldBypassFiltering ? '' : (this.root.filterQuery ?? this.query)
	);

	/** The filtered items, in their flat or grouped shape. */
	readonly filteredItems = $derived.by((): ComboboxItemsData<unknown> => {
		const external = this.root.filteredItems;
		const ignoreExternal =
			this.hasItems &&
			external !== undefined &&
			this.#shouldBypassFiltering &&
			(!this.collection ||
				this.collection.hasValue(this.selectedValue, this.root.isItemEqualToValue));
		if (external && !ignoreExternal) return external;
		const data = this.itemsData;
		if (!data) return [];
		return filterItems(data, {
			query: this.#filterQuery,
			filter: this.#filter,
			limit: this.root.limit,
			itemToString: this.#filterItemToString as (item: never) => string
		});
	});

	/** The filtered items flattened across groups and projected to their selection values. */
	readonly flatFilteredValues = $derived.by((): readonly unknown[] => {
		const external = this.#externalWindow;
		if (external && this.filteredItems === this.root.filteredItems) return external.values;
		const flat = flattenLeafItems(this.filteredItems as readonly Group[]) as readonly unknown[];
		const collection = this.collection;
		return collection ? flat.map((item) => collection.value(item)) : flat;
	});

	get listEmpty() {
		return this.filteredItems.length === 0;
	}

	/** Values of the mounted items, by index. */
	readonly registeredValues = $derived(
		this.items.elements.map((element) => this.items.meta(element)?.value)
	);

	/** The visible item values by index: the filtered items, else the mounted items. */
	get values(): readonly unknown[] {
		return this.hasItems ? this.flatFilteredValues : this.registeredValues;
	}

	get #candidateValues(): readonly unknown[] {
		return this.hasItems || this.root.filteredItems !== undefined
			? this.flatFilteredValues
			: this.registeredValues;
	}

	/** Item labels for typeahead. Derived from `items` unless the list is force-mounted. */
	labels(): Array<string | null> {
		if (this.hasItems && !this.forceMounted) {
			return this.flatFilteredValues.map((value) => this.stringifyLabel(value));
		}
		return this.items.elements.map((element) => element.textContent);
	}

	readonly hasSelectedValue = $derived.by(() => {
		const value = this.selectedValue;
		if (value == null) return false;
		if (this.selectionMode === 'multiple' && Array.isArray(value)) return value.length > 0;
		return true;
	});

	get hasSelectionChips() {
		const value = this.selectedValue;
		return Array.isArray(value) && value.length > 0;
	}

	isSelected(itemValue: unknown) {
		const { selectedValue, isItemEqualToValue } = this.root;
		if (Array.isArray(selectedValue)) {
			return selectedValue.some((selected) =>
				compareItemEquality(itemValue, selected, isItemEqualToValue)
			);
		}
		return compareItemEquality(itemValue, selectedValue, isItemEqualToValue);
	}

	/** The side of the mounted positioner. */
	get renderedPopupSide() {
		return this.mounted && this.positionerElement ? (this.#readPopupSide?.() ?? null) : null;
	}

	/** The positioner publishes its side. Returns the cleanup that withdraws it. */
	publishPopupSide(read: () => PopupSide) {
		this.#readPopupSide = read;
		return () => {
			if (this.#readPopupSide === read) this.#readPopupSide = null;
		};
	}

	forceMount() {
		if (!this.hasItems) this.forceMounted = true;
	}

	setIndices(options: {
		activeIndex?: number | null;
		selectedIndex?: number | null;
		type?: ComboboxHighlightReason;
		event?: Event;
	}) {
		if (options.selectedIndex !== undefined) this.selectedIndex = options.selectedIndex;
		const next = options.activeIndex;
		if (next === undefined) return;
		this.activeIndex = next;
		const type = options.type ?? REASONS.none;
		if (next === null) this.#emitHighlight(undefined, -1, type, options.event);
		else this.#emitHighlight(untrack(() => this.values)[next], next, type, options.event);
	}

	#emitHighlight(value: unknown, index: number, type: ComboboxHighlightReason, event?: Event) {
		if (index === -1) {
			if (this.#lastHighlight === NO_HIGHLIGHT) return;
			this.#lastHighlight = NO_HIGHLIGHT;
		} else {
			this.#lastHighlight = { value, index };
		}
		const callback = untrack(() => this.#options.onItemHighlighted());
		callback?.(
			value,
			createGenericEventDetails(type, event, { index }) as ComboboxHighlightEventDetails
		);
	}

	setInputValue(next: string, details: ComboboxChangeEventDetails) {
		this.#options.commitInputValue(next, details);
		if (details.isCanceled) return;

		this.#hadInputClear = details.reason === REASONS.inputClear;

		if (details.reason === REASONS.inputChange) {
			// A controlled popup may ignore a close. Typing proves it stays open, so release the
			// query captured for the exit animation.
			if (this.open && this.closeQuery !== null) this.closeQuery = null;

			if (isTypedInput(details.event)) {
				const hasQuery = next.trim() !== '';
				if (hasQuery) this.queryChangedAfterOpen = true;
				this.#pendingQueryHighlight = { hasQuery };
				this.#resetListScroll();
				if (
					hasQuery &&
					this.root.autoHighlight &&
					this.activeIndex == null &&
					(this.open || this.root.inline)
				) {
					this.activeIndex = 0;
				}
			}
		} else if (details.reason === REASONS.inputClear && next === '' && this.inputInsidePopup) {
			// A clear after a selection inside the popup restores the highlight to the selection.
			this.#pendingQueryHighlight = { hasQuery: false, selection: true };
		}
	}

	/** Typing scrolls the list back to its start, so a reordered list is read from the top. */
	#resetListScroll() {
		const list = this.listElement;
		if (!list) return;
		const popup = this.popupElement;
		for (const ancestor of getOverflowAncestors(list.firstElementChild ?? list)) {
			if (
				!(ancestor instanceof HTMLElement) ||
				(popup ? !contains(popup, ancestor) : ancestor.getAttribute('role') === 'dialog')
			) {
				break;
			}
			if (isScrollable(ancestor, 'vertical')) {
				ancestor.scrollTop = 0;
				break;
			}
		}
	}

	handleInterruptedReopen(isInputChange: boolean) {
		const inputValue = this.inputValue;
		const inputMatchesSelectedValue =
			this.selectionMode === 'single' &&
			!this.inputInsidePopup &&
			inputValue === this.selectedLabelString;
		const clearsPendingInput =
			!isInputChange &&
			this.inputInsidePopup &&
			!this.root.inline &&
			inputValue !== '' &&
			(String(inputValue).trim() === this.closeQuery || inputValue === this.selectedLabelString);

		if (!isInputChange && (clearsPendingInput || inputValue === '' || inputMatchesSelectedValue)) {
			this.queryChangedAfterOpen = false;
		}
		this.closeQuery = null;
		if (clearsPendingInput) {
			this.setInputValue('', createChangeEventDetails(REASONS.inputClear));
		}
	}

	override setOpen(nextOpen: boolean, eventDetails: ComboboxChangeEventDetails) {
		if (this.open === nextOpen) return;

		// Without `Combobox.Empty`, the popup is hidden with CSS when no item matches, so Escape
		// can bubble to close a parent popup.
		if (
			eventDetails.reason === REASONS.escapeKey &&
			this.hasItems &&
			this.flatFilteredValues.length === 0 &&
			!this.emptyElement
		) {
			eventDetails.allowPropagation();
		}

		const query = this.#closingQuery ?? this.query;
		const reference = this.domReferenceElement;
		super.setOpen(nextOpen, eventDetails);
		this.domReferenceElement = reference ?? this.defaultReference;

		// A typed request must not highlight a later open: drop it when its own open is rejected,
		// or when any other open change goes through.
		if (
			this.#pendingQueryHighlight?.hasQuery &&
			(eventDetails.reason === REASONS.inputChange) === eventDetails.isCanceled
		) {
			this.#pendingQueryHighlight = null;
		}

		if (eventDetails.isCanceled) return;

		if (nextOpen && this.closeQuery !== null) {
			this.handleInterruptedReopen(eventDetails.reason === REASONS.inputChange);
		}

		const { inline } = this.root;
		if (!nextOpen && this.queryChangedAfterOpen) {
			if (this.selectionMode === 'single') {
				if (!inline) this.closeQuery = query;
				// Avoids a flicker when closing with an empty query.
				if (query === '') this.queryChangedAfterOpen = false;
			} else if (this.selectionMode === 'multiple') {
				if (!inline) this.closeQuery = query;
				if (this.inputInsidePopup) this.setIndices({ activeIndex: null });
				// With the input inside the popup, the clear waits for the unmount so the list does
				// not flash unfiltered while it animates out.
				if (!this.inputInsidePopup || inline) {
					this.setInputValue(
						'',
						createChangeEventDetails(REASONS.inputClear, eventDetails.event, undefined, {
							isItemPress: eventDetails.reason === REASONS.itemPress
						})
					);
				}
			}
		}

		if (
			!nextOpen &&
			this.inputInsidePopup &&
			(eventDetails.reason === REASONS.focusOut || eventDetails.reason === REASONS.outsidePress)
		) {
			this.#options.onDismissedOutside();
		}
	}

	setSelectedValue(next: unknown, details: ComboboxChangeEventDetails) {
		this.#options.commitSelectedValue(next, details);
		if (details.isCanceled) return;

		const shouldFillInput =
			(this.selectionMode === 'none' && this.popupElement && this.root.fillInputOnItemPress) ||
			(this.selectionMode === 'single' && !this.inputInsidePopup);
		if (shouldFillInput) {
			this.setInputValue(
				this.stringifyLabel(next),
				createChangeEventDetails(details.reason, details.event)
			);
		}
	}

	handleSelection(event: MouseEvent | KeyboardEvent, itemValue: unknown) {
		const target = event.target as Element | null;
		const sourceEvent = this.selectionEvent ?? event;
		this.selectionEvent = null;
		const details = createChangeEventDetails(REASONS.itemPress, sourceEvent);

		// A link handles the press itself.
		const href = target?.closest?.('a')?.getAttribute('href');
		if (href) {
			if (href.startsWith('#')) this.setOpen(false, details);
			return;
		}

		const { isItemEqualToValue } = this.root;
		if (this.selectionMode === 'multiple') {
			const current = Array.isArray(this.selectedValue) ? (this.selectedValue as unknown[]) : [];
			const wasSelected = selectedValueIncludes(current, itemValue, isItemEqualToValue);
			const next = wasSelected
				? removeItem(current, itemValue, isItemEqualToValue)
				: [...current, itemValue];
			this.setSelectedValue(next, details);
			if (details.isCanceled) return;

			const wasFiltering = this.inputElement ? this.inputElement.value.trim() !== '' : false;
			if (!wasFiltering) return;

			if (this.inputInsidePopup) {
				this.setInputValue(
					'',
					createChangeEventDetails(REASONS.inputClear, details.event, undefined, {
						isItemPress: true
					})
				);
				// A newly selected item stays highlighted through the clear.
				const pending = this.#pendingQueryHighlight;
				if (pending && !wasSelected) pending.toggledValue = itemValue;
			} else {
				this.setOpen(false, details);
			}
		} else {
			// The selection syncs the input to its label, but the exit animation keeps the
			// typed filter, as it was when the item was pressed.
			this.#closingQuery = this.query;
			this.setSelectedValue(itemValue, details);
			if (!details.isCanceled) this.setOpen(false, details);
			this.#closingQuery = null;
		}
	}

	requestSubmit() {
		this.#options.requestSubmit();
	}

	/** Clicks the highlighted item, reporting `event` as the selection's event. */
	clickHighlightedItem(activeIndex: number, event: KeyboardEvent) {
		const item = this.items.elements[activeIndex];
		if (!item) return;
		this.selectionEvent = event;
		item.click();
		this.selectionEvent = null;
	}

	closeImperative() {
		if (this.open) this.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	}

	/** Upstream `actions.unmount`. A call while open does nothing. */
	override forceUnmount() {
		if (this.open || !this.mounted) return;
		super.forceUnmount();
	}

	#unmountCleanup() {
		this.domReferenceElement = this.defaultReference;
		this.queryChangedAfterOpen = false;
		this.closeQuery = null;
		if (this.selectionMode === 'none') {
			this.setIndices({ activeIndex: null, selectedIndex: null });
		} else {
			this.setIndices({ activeIndex: null });
		}

		const input = this.inputElement;
		// A typed filter that selected nothing clears once the close completes, without a flicker.
		if (this.selectionMode === 'multiple' && input && input.value !== '' && !this.#hadInputClear) {
			this.setInputValue('', createChangeEventDetails(REASONS.inputClear));
		}

		if (this.selectionMode === 'single') {
			if (this.inputInsidePopup) {
				if (input && input.value !== '') {
					this.setInputValue('', createChangeEventDetails(REASONS.inputClear));
				}
			} else {
				const label = this.stringifyLabel(this.selectedValue);
				if (input && input.value !== label) {
					// Without a selection this clears the typed filter.
					const reason = label === '' ? REASONS.inputClear : REASONS.none;
					this.setInputValue(label, createChangeEventDetails(reason));
				}
			}
		}
	}

	#syncSelectedIndex() {
		let previousCloseQuery = untrack(() => this.closeQuery);
		$effect.pre(() => {
			const open = this.open;
			const closeQuery = this.closeQuery;
			const { selectionMode, selectedValue, isItemEqualToValue } = this.root;
			const hasItems = this.hasItems;
			// Mounted items claim their own index. Their unmount after a close must not reset it.
			const registry = hasItems ? this.flatFilteredValues : untrack(() => this.registeredValues);
			untrack(() => {
				const released = previousCloseQuery !== null && closeQuery === null;
				previousCloseQuery = closeQuery;
				// Closing indexes against the frozen list. A reopen releases that query, so the
				// rendered coordinates are synchronized again although the popup is open.
				if (open && (!released || !hasItems)) return;
				if (!open) this.pointerDownItem = null;
				if (selectionMode === 'none') return;
				this.selectedIndex = findSelectionIndex(
					registry,
					selectedValue,
					isItemEqualToValue,
					selectionMode === 'multiple'
				);
			});
		});
	}

	#syncHighlight() {
		$effect.pre(() => {
			const open = this.open;
			const { inline, autoHighlight } = this.root;
			const activeIndex = this.activeIndex;
			const candidates = this.#candidateValues;
			const inputValue = this.inputValue;
			untrack(() =>
				this.#reconcileHighlight(open, inline, autoHighlight, activeIndex, candidates, inputValue)
			);
		});
	}

	#inlineDialog() {
		const positioner = this.positionerElement;
		return this.root.inline && positioner ? positioner.closest('[role="dialog"]') : null;
	}

	#reconcileHighlight(
		open: boolean,
		inline: boolean,
		autoHighlight: ComboboxAutoHighlight,
		activeIndex: number | null,
		candidates: readonly unknown[],
		inputValue: string
	) {
		// A kept-mounted dialog hides its inline list on close. Drop a pending restore, which
		// would otherwise report an item from the unfiltered list.
		if (!open && inline && this.#inlineDialog()) {
			this.#pendingQueryHighlight = null;
			return;
		}

		const pending = this.#pendingQueryHighlight;
		if (pending) {
			const listIsNavigable = open || inline || this.positionerElement?.hidden === false;
			if (pending.hasQuery) {
				const input = this.inputElement;
				if (
					!autoHighlight ||
					String(inputValue).trim() === '' ||
					(inline &&
						autoHighlight !== 'always' &&
						(!input || input.ownerDocument.activeElement !== input))
				) {
					this.#pendingQueryHighlight = null;
				} else if (
					listIsNavigable &&
					(candidates[0] !== undefined || (!this.hasItems && this.root.filteredItems === undefined))
				) {
					this.activeIndex = 0;
					this.#pendingQueryHighlight = null;
				}
			} else if (String(inputValue).trim() === '') {
				this.#pendingQueryHighlight = null;
				if (listIsNavigable) {
					if (autoHighlight === 'always' && !pending.selection && this.selectionMode === 'none') {
						this.activeIndex = 0;
					}
					// Items that re-mount after the clear register in a later flush.
					queueMicrotask(() => this.#restoreHighlightAfterClear(pending, autoHighlight));
				}
			}
		}

		if (!open && !inline) return;

		const current = this.activeIndex;
		if (current == null) {
			if (autoHighlight === 'always' && candidates.length > 0) {
				this.activeIndex = 0;
				return;
			}
			this.#emitHighlight(undefined, -1, REASONS.none);
			return;
		}

		// Individually rendered items register after this runs, so an empty registry is not yet
		// a reason to drop the highlight.
		if (candidates.length === 0 && !this.hasItems && this.root.filteredItems === undefined) return;

		if (current >= candidates.length) {
			this.#emitHighlight(undefined, -1, REASONS.none);
			this.activeIndex = null;
			return;
		}

		const itemValue = candidates[current];
		const previous = this.#lastHighlight;
		const isSameItem =
			previous !== NO_HIGHLIGHT &&
			compareItemEquality(itemValue, previous.value, this.root.isItemEqualToValue);
		if (previous.index !== current || !isSameItem) {
			this.#emitHighlight(itemValue, current, REASONS.none);
		}
		void activeIndex;
	}

	#restoreHighlightAfterClear(
		pending: PendingQueryHighlight,
		autoHighlight: ComboboxAutoHighlight
	) {
		if (
			(!this.open && (!this.root.inline || this.#inlineDialog())) ||
			(this.inputElement && this.inputElement.value.trim() !== '')
		) {
			return;
		}
		const { selectedValue, isItemEqualToValue } = this.root;
		const multiple = this.selectionMode === 'multiple';
		const hasSelection =
			multiple && Array.isArray(selectedValue)
				? selectedValue.length > 0
				: this.selectionMode !== 'none' && selectedValue != null;

		if (hasSelection) {
			const registry = this.#candidateValues;
			const toggledIndex = findItemIndex(registry, pending.toggledValue, isItemEqualToValue);
			this.activeIndex =
				toggledIndex !== -1
					? toggledIndex
					: findSelectionIndex(registry, selectedValue, isItemEqualToValue, multiple);
		} else if (pending.selection) {
			this.activeIndex = null;
		} else if (autoHighlight === 'always') {
			this.activeIndex = 0;
		}
	}
}
