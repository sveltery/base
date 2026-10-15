// Derived from Base UI v1.9.0 packages/react/src/select/store.ts and the state, refs and
// callbacks of packages/react/src/select/root/SelectRoot.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Open, mount, transition and preventUnmountOnClose stay on the shared PopupStore.
// Items register in one ElementList. Their values and labels are read from it by index,
// so there are no parallel arrays to keep in step.

import type { HTMLAttributes } from 'svelte/elements';
import { createChangeEventDetails, REASONS, type OpenInteractionType } from '@sveltery/utils';
import { ElementList } from '../internal/element-list.svelte.js';
import { PopupStore, type CloseTriggerFill } from '../internal/popups/store.svelte.js';
import { normalizeScrollOffset } from '../internal/scrollEdges.js';
import { getMaxScrollOffset } from '../internal/scrollEdges.js';
import type { InlineStyles } from './popup-utils.js';
import {
	compareItemEquality,
	findSelectionIndex,
	type ItemEqualityComparer
} from '../internal/listbox/itemEquality.js';
import { stringifyAsValue, type ItemsInput } from '../internal/listbox/resolveValueLabel.js';
import type { Side } from '../internal/popups/index.js';
import type { SelectChangeEventDetails, SelectChangeReason } from './types.js';

export interface SelectItemMeta {
	value: unknown;
	/** The text typeahead matches: the `label` prop, else the item text. */
	label: string | null;
	disabled: boolean;
	/** The `Select.ItemText` element the popup lines up with the trigger's value. */
	text: HTMLElement | null;
}

/** Root props every part reads. */
export interface SelectRootReading {
	id: string;
	value: unknown;
	multiple: boolean;
	disabled: boolean;
	readOnly: boolean;
	required: boolean;
	modal: boolean;
	highlightItemOnHover: boolean;
	items: ItemsInput;
	itemToStringLabel: ((item: never) => string) | undefined;
	itemToStringValue: ((item: never) => string) | undefined;
	isItemEqualToValue: ItemEqualityComparer;
}

/** What the mounted positioner publishes. Each field is a getter. */
export interface PositionerReading {
	readonly alignItemWithTriggerActive: boolean;
	readonly side: Side;
}

export interface SelectStoreOptions {
	readOpen: () => boolean | undefined;
	writeOpen: (open: boolean) => void;
	floatingId: string;
	/** Reads the root's props. Each field is a getter. */
	root: SelectRootReading;
	/** The root's cancelable value write. */
	commitValue: (next: unknown, details: SelectChangeEventDetails) => void;
	/** Field bookkeeping when focus or a press outside closes the popup. */
	onDismissedOutside: () => void;
	onOpenChange: () =>
		| ((
				open: boolean,
				details: SelectChangeEventDetails & { preventUnmountOnClose(): void }
		  ) => void)
		| undefined;
	onOpenChangeComplete: () => ((open: boolean) => void) | undefined;
	readTriggerProps: () => HTMLAttributes<HTMLElement>;
	readPopupProps: () => HTMLAttributes<HTMLElement>;
	/** Typeahead on the open popup. It sees every keydown, also one an item prevented. */
	readPopupTypeahead: () => HTMLAttributes<HTMLElement>;
	readItemProps: () => HTMLAttributes<HTMLElement>;
}

export class SelectStore extends PopupStore<SelectChangeReason> {
	protected override readonly closeTriggerFill: CloseTriggerFill = 'never';
	readonly items = new ElementList<HTMLElement, SelectItemMeta>();

	activeIndex = $state<number | null>(null);
	labelId = $state<string | undefined>(undefined);
	#triggerElement = $state<HTMLElement | null>(null);
	listElement = $state<HTMLElement | null>(null);
	valueElement = $state<HTMLElement | null>(null);
	/** Mounts the items while closed, for typeahead on the trigger and for autofill. */
	forceMount = $state(false);
	scrollUpArrowVisible = $state(false);
	scrollDownArrowVisible = $state(false);
	scrollArrowCount = $state(0);
	/**
	 * Inline styles the aligned popup computes for the positioner and the popup. Svelte rewrites
	 * the whole `style` attribute on change, so the writes live here and the parts render them.
	 */
	alignedPositionerStyle = $state.raw<InlineStyles>({});
	alignedPopupStyle = $state.raw<InlineStyles>({});

	/** The value on mount, restored when the selected item leaves the list. */
	initialValue: unknown = null;

	/** True while a typeahead session runs, so Space types instead of selecting. */
	typing = false;
	/** Mouseup selection after a press that opened the popup. */
	selection = { allowSelectedMouseUp: false, allowUnselectedMouseUp: false, dragY: 0 };
	/** The popup's scroll handler, which `Select.List` calls when it scrolls instead. */
	scrollHandler: ((scroller: HTMLElement) => void) | null = null;

	#positioner = $state<PositionerReading | null>(null);
	#lastOpenMethod: OpenInteractionType | null = null;
	readonly #options: SelectStoreOptions;

	constructor(options: SelectStoreOptions) {
		super({
			readOpen: options.readOpen,
			writeOpen: options.writeOpen,
			floatingId: options.floatingId,
			floatingElement: 'positioner',
			onOpenChange: options.onOpenChange,
			onOpenChangeComplete: () => (open) => {
				if (!open) this.#unmounted();
				options.onOpenChangeComplete()?.(open);
			}
		});
		this.#options = options;

		$effect.pre(() => {
			const { value, multiple, isItemEqualToValue } = this.root;
			const next = findSelectionIndex(this.values, value, isItemEqualToValue, multiple);
			if (!this.open) this.selectedIndex = next;
		});
	}

	// The shared store clears the active trigger on open changes and once closed. A select has
	// one trigger, which stays the reference for positioning, focus return and dismissal.
	get triggerElement() {
		return this.#triggerElement;
	}

	set triggerElement(element: HTMLElement | null) {
		this.#triggerElement = element;
		this.domReferenceElement = element;
	}

	protected override preventUnmountTiming(): 'immediate' | 'deferred' {
		return 'deferred';
	}

	get root(): SelectRootReading {
		return this.#options.root;
	}

	get value() {
		return this.root.value;
	}

	get multiple() {
		return this.root.multiple;
	}

	get triggerProps() {
		return this.#options.readTriggerProps();
	}

	get popupProps() {
		return this.#options.readPopupProps();
	}

	get popupTypeahead() {
		return this.#options.readPopupTypeahead();
	}

	get itemProps() {
		return this.#options.readItemProps();
	}

	/** Item values by index. */
	readonly values = $derived(this.items.elements.map((element) => this.items.meta(element)?.value));

	/** Item labels by index. Text is read from the DOM, so call this when it is needed. */
	labels() {
		return this.items.elements.map((element) => {
			const meta = this.items.meta(element);
			if (meta?.label != null) return meta.label;
			return (meta?.text ?? element).textContent;
		});
	}

	/**
	 * The selected item the popup aligns with and the list starts from. While closed it is the
	 * first selected item. While open only items that mount or change move it, so a click in
	 * `multiple` mode does not move it.
	 */
	selectedIndex = $state<number | null>(null);

	readonly hasSelectedValue = $derived.by(() => {
		const { value, multiple, itemToStringValue } = this.root;
		if (value == null) return false;
		if (multiple && Array.isArray(value)) return value.length > 0;
		return stringifyAsValue(value, itemToStringValue) !== '';
	});

	/** The interaction that opened the popup, kept until it unmounts. */
	get renderedOpenMethod(): OpenInteractionType | null {
		const method = this.openMethod;
		if (method != null) {
			this.#lastOpenMethod = method;
			return method;
		}
		return this.mounted ? this.#lastOpenMethod : null;
	}

	get hasScrollArrows() {
		return this.scrollArrowCount > 0;
	}

	get alignItemWithTriggerActive() {
		return this.#positioner?.alignItemWithTriggerActive ?? false;
	}

	/** The positioner's side, also while the popup overlaps the trigger. */
	get popupSide() {
		return this.#positioner?.side ?? null;
	}

	/** The mounted positioner publishes its placement. Returns the cleanup that withdraws it. */
	publishPositioner(reading: PositionerReading) {
		this.#positioner = reading;
		return () => {
			if (this.#positioner === reading) this.#positioner = null;
		};
	}

	textAt(index: number | null): HTMLElement | null {
		if (index == null) return null;
		const element = this.items.elements[index];
		return element ? (this.items.meta(element)?.text ?? null) : null;
	}

	isSelected(itemValue: unknown) {
		const { value, multiple, isItemEqualToValue } = this.root;
		if (multiple) {
			return (
				Array.isArray(value) &&
				value.some((selected) => compareItemEquality(itemValue, selected, isItemEqualToValue))
			);
		}
		// The value is the source of truth: a deferred `selectedIndex` must not keep a
		// previously selected item marked.
		return compareItemEquality(itemValue, value, isItemEqualToValue);
	}

	setValue(next: unknown, details: SelectChangeEventDetails) {
		this.#options.commitValue(next, details);
	}

	override setOpen(nextOpen: boolean, eventDetails: SelectChangeEventDetails) {
		super.setOpen(nextOpen, eventDetails);
		this.domReferenceElement = this.#triggerElement;
		if (eventDetails.isCanceled || nextOpen) return;
		const reason = eventDetails.reason;
		if (reason === REASONS.focusOut || reason === REASONS.outsidePress) {
			this.#options.onDismissedOutside();
		}
	}

	closeImperative() {
		if (this.open) this.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	}

	/** Upstream `actions.unmount`. A call while open does nothing. */
	override forceUnmount() {
		if (this.open || !this.mounted) return;
		super.forceUnmount();
	}

	/** Writes aligned styles to the element now, for measuring, and to the rendered record. */
	writeAlignedStyles(target: 'positioner' | 'popup', styles: InlineStyles) {
		const element = target === 'positioner' ? this.positionerElement : this.popupElement;
		if (element) {
			for (const [property, value] of Object.entries(styles)) {
				element.style.setProperty(property, value ?? '');
			}
		}
		if (target === 'positioner') {
			this.alignedPositionerStyle = { ...this.alignedPositionerStyle, ...styles };
		} else {
			this.alignedPopupStyle = { ...this.alignedPopupStyle, ...styles };
		}
	}

	clearAlignedStyles() {
		for (const [element, styles] of [
			[this.positionerElement, this.alignedPositionerStyle],
			[this.popupElement, this.alignedPopupStyle]
		] as const) {
			for (const property of Object.keys(styles)) element?.style.removeProperty(property);
		}
		this.alignedPositionerStyle = {};
		this.alignedPopupStyle = {};
	}

	handleScrollArrowVisibility(scroller: HTMLElement) {
		const maxScrollTop = getMaxScrollOffset(scroller.scrollHeight, scroller.clientHeight);
		const scrollTop = normalizeScrollOffset(scroller.scrollTop, maxScrollTop);
		this.scrollUpArrowVisible = scrollTop > 0;
		this.scrollDownArrowVisible = scrollTop < maxScrollTop;
	}

	#unmounted() {
		this.domReferenceElement = this.#triggerElement;
		this.activeIndex = null;
		this.openMethod = null;
		this.#lastOpenMethod = null;
		this.scrollUpArrowVisible = false;
		this.scrollDownArrowVisible = false;
		this.clearAlignedStyles();
	}
}
