// Keyboard roving for ToggleGroup, Toolbar, RadioGroup, and Tabs, from the linear
// path of Base UI v1.8.0 packages/react/src/internals/composite/root/useCompositeRoot.ts
// and packages/react/src/internals/composite/item/useCompositeItem.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
//
// One list. Constructor getters supply orientation, looping, direction, and
// which items are disabled or selected. Items register with an attachment.
// The class publishes tabindex. No element renderer.

import { untrack } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import type { HTMLAttributes } from 'svelte/elements';
import { CompositeItems } from './composite-items.svelte.js';
import { ARROW_KEYS, COMPOSITE_KEYS } from './composite-keys.js';
import { byDocumentOrder } from './document-order.js';
import { plainMap } from './plain-map.js';
import { axisKeys, modifierHeld } from './roving-keys.js';

export type CompositeOrientation = 'horizontal' | 'vertical' | 'both';

export interface CompositeRootOptions {
	orientation?: () => CompositeOrientation;
	loopFocus?: () => boolean;
	direction?: () => 'ltr' | 'rtl';
	isItemDisabled?: (element: HTMLElement) => boolean;
	isItemSelected?: (element: HTMLElement, registration: CompositeRegistration) => boolean;
	/**
	 * `arrows` is the four arrow keys. `composite` also includes Home and End.
	 * A `both` orientation never treats Home or End as a move.
	 */
	keys?: 'arrows' | 'composite';
	/** `shift-ok` still blocks Ctrl, Alt, and Meta. */
	modifiers?: 'all' | 'shift-ok';
	stopPropagation?: boolean;
	/** `first` jumps to the first enabled item. `index` keeps the vacated slot. */
	replacement?: 'first' | 'index';
	/** `item` listens on each host. `root` listens on the composite root. */
	keydown?: 'item' | 'root';
	/**
	 * Metadata `disabled` can hold the tab stop. Tabs keeps those items focusable.
	 * Radio and toggle still refuse a disabled stop.
	 */
	disabledHoldsStop?: boolean;
}

export interface CompositeHandlers<T extends HTMLElement = HTMLElement> {
	onfocus?: HTMLAttributes<T>['onfocus'];
	onkeydown?: HTMLAttributes<T>['onkeydown'];
}

export interface CompositeMeta {
	disabled?: boolean;
	selected?: boolean;
	hasSelection?: boolean;
}

/** Live item metadata. The root effect reads this getter, so it tracks `value` and `disabled`. */
export interface CompositeRegistration {
	value?: unknown;
	disabled?: boolean;
}

export type CompositeItemProps = HTMLAttributes<HTMLElement> &
	Record<symbol, Attachment<HTMLElement>>;

interface RenderClaim {
	index: number;
	disabled: boolean;
}

/**
 * One composite list. The highlighted item is the only tab stop.
 * `RenderOrder` supplies the server index and returns to 0 after the list empties.
 */
export class CompositeRoot extends CompositeItems {
	/** Cached tab stop. Host props read this instead of measuring the item. */
	private stop = $state<HTMLElement | null>(null);
	private stopIndex = 0;
	private userMoved = false;
	/** Item `isItemSelected` last returned. A different item clears a manual highlight. */
	private selectedNode: HTMLElement | null = null;
	private claims: RenderClaim[] = [];
	private readonly claimByNode = plainMap<HTMLElement, RenderClaim>();
	private readonly readers = plainMap<HTMLElement, () => CompositeRegistration>();

	constructor(private readonly options: CompositeRootOptions = {}) {
		super();
		$effect(() => {
			const measured = this.measure();
			untrack(() => {
				this.observe(measured);
			});
		});
	}

	/** Render-order slot for SSR, before the node is registered. */
	claim(disabled = false) {
		const index = super.claim();
		this.claims.push({ index, disabled: Boolean(disabled) });
		return index;
	}

	register(node: HTMLElement, read: () => CompositeRegistration = () => ({}), renderIndex = -1) {
		this.readers.set(node, read);
		const claim = this.unownedClaim(renderIndex);
		if (claim) this.claimByNode.set(node, claim);
		untrack(() => {
			this.admit(node);
			this.observe(this.measure());
		});
		return () => {
			untrack(() => {
				const index = this.elements.indexOf(node);
				const removedStop = this.stop === node;
				const owned = this.claimByNode.get(node);
				this.readers.delete(node);
				this.claimByNode.delete(node);
				if (owned) {
					const at = this.claims.indexOf(owned);
					if (at !== -1) this.claims.splice(at, 1);
				}
				this.dismiss(node);
				if (removedStop) {
					this.stop = null;
					if (index !== -1) this.stopIndex = index;
				}
				if (this.elements.length === 0) {
					this.claims = [];
					this.claimByNode.clear();
					this.userMoved = false;
					this.selectedNode = null;
				}
				this.observe(this.measure());
			});
		};
	}

	/** The claim this item created, not an older item that reused the same index. */
	private unownedClaim(renderIndex: number) {
		if (renderIndex < 0) return undefined;
		let found: RenderClaim | undefined;
		for (const claim of this.claims) {
			if (claim.index !== renderIndex) continue;
			let taken = false;
			for (const owned of this.claimByNode.values()) {
				if (owned === claim) taken = true;
			}
			if (!taken) found = claim;
		}
		return found;
	}

	/** The registration getter for `node`, or an empty record. */
	meta(node: HTMLElement): CompositeRegistration {
		return this.readers.get(node)?.() ?? {};
	}

	/** Move the tab stop onto `node`. A later selection change can move it again. */
	highlight(node: HTMLElement) {
		if (!this.elements.includes(node) || this.stopBlocked(node)) return;
		this.userMoved = true;
		if (this.stop === node) return;
		this.stop = node;
		this.stopIndex = this.elements.indexOf(node);
	}

	/**
	 * Tab index for one item. A registered item compares against the cached stop.
	 * Before registration, a disabled item is never the stop. An explicit selection
	 * wins. Otherwise the first enabled item in render order is the stop.
	 */
	tabIndex(node: HTMLElement | null, renderIndex: number, meta: CompositeMeta = {}): 0 | -1 {
		if (node && this.elements.includes(node)) return node === this.stop ? 0 : -1;
		if (meta.disabled) return -1;
		if (meta.hasSelection) return meta.selected ? 0 : -1;
		const earlier = this.claims.some((item) => item.index < renderIndex && !item.disabled);
		return earlier ? -1 : 0;
	}

	/**
	 * Props spread onto an item: tabindex, focus handler, registration attachment,
	 * and, when keys are handled on the item, keydown. A consumer handler runs first.
	 * `preventDefault()` on that keydown skips navigation.
	 */
	item<T extends HTMLElement = HTMLElement>(
		node: HTMLElement | null,
		register: Attachment<HTMLElement>,
		handlers: CompositeHandlers<T>,
		renderIndex: number,
		meta: CompositeMeta = {}
	): CompositeItemProps {
		const props: CompositeItemProps = {
			tabindex: this.tabIndex(node, renderIndex, meta),
			onfocus: (event) => {
				// The host is `T`. The props object types the event as `HTMLElement`.
				handlers.onfocus?.(event as FocusEvent & { currentTarget: EventTarget & T });
				if (event.currentTarget instanceof HTMLElement) this.highlight(event.currentTarget);
			},
			[this.attachmentKey]: register
		};
		if ((this.options.keydown ?? 'item') === 'item') {
			props.onkeydown = (event) => {
				handlers.onkeydown?.(event as KeyboardEvent & { currentTarget: EventTarget & T });
				if (event.defaultPrevented) return;
				this.keydown(event);
			};
		}
		return props;
	}

	/**
	 * Arrow keys move the cached stop. Home and End do too when this list asked for them.
	 * The item list is read in DOM order, so a keyed reorder is followed on the next key.
	 */
	keydown(event: KeyboardEvent) {
		if (this.modifiersBlock(event)) return;
		const keys = (this.options.keys ?? 'composite') === 'arrows' ? ARROW_KEYS : COMPOSITE_KEYS;
		if (!keys.has(event.key)) return;
		if (!(event.currentTarget instanceof HTMLElement)) return;

		this.refreshOrder();
		const items = this.elements;
		if (!items.some((item) => !this.itemDisabled(item))) return;

		// A disabled item can still hold focus. Step from that item's own index,
		// not from the first enabled item, or the next arrow skips one.
		const focused = event.target instanceof HTMLElement ? event.target : null;
		const origin =
			focused && items.includes(focused)
				? focused
				: this.stop && items.includes(this.stop)
					? this.stop
					: items[0];
		if (!origin) return;

		const target = this.nextEnabled(event.key, items.indexOf(origin), items);
		if (!target || target === origin) return;

		event.preventDefault();
		if (this.options.stopPropagation ?? true) event.stopPropagation();
		this.highlight(target);
		target.focus();
	}

	/** One registration read per item. Later stop math uses this snapshot. */
	private measure() {
		const records = plainMap(
			this.elements.map((element) => {
				const registration = this.readers.get(element)?.() ?? {};
				const claim = this.claimByNode.get(element);
				if (claim) claim.disabled = Boolean(registration.disabled);
				// Selection reads live outside the registration getter. Touch it here so
				// this effect subscribes once, and `observe` can stay untracked.
				this.options.isItemSelected?.(element, registration);
				return [element, registration] as const;
			})
		);
		return records;
	}

	private observe(records: Map<HTMLElement, CompositeRegistration>) {
		const elements = this.elements;
		let selectedNode: HTMLElement | null = null;
		for (const element of elements) {
			if (!this.itemSelected(element, records)) continue;
			selectedNode = element;
			break;
		}
		// A value change moves the stop back onto the selection. Removing the
		// highlighted item does not: that item is already gone, and the vacated
		// index chooses the successor.
		const stopPresent = this.stop != null && elements.includes(this.stop);
		if (selectedNode !== this.selectedNode && stopPresent) this.userMoved = false;
		this.selectedNode = selectedNode;
		this.recompute(records);
	}

	private recompute(records: Map<HTMLElement, CompositeRegistration>) {
		const elements = this.elements;
		const blocked = (element: HTMLElement) => this.stopBlocked(element, records);
		if (elements.length === 0) {
			this.stop = null;
			this.stopIndex = 0;
			return;
		}

		if (!this.userMoved) {
			const selected = elements.find(
				(element) => this.itemSelected(element, records) && !blocked(element)
			);
			if (selected) {
				this.stop = selected;
				this.stopIndex = elements.indexOf(selected);
				return;
			}
		}

		if (this.stop && elements.includes(this.stop) && !blocked(this.stop)) {
			this.stopIndex = elements.indexOf(this.stop);
			return;
		}

		if ((this.options.replacement ?? 'index') === 'index') {
			const at = elements[this.stopIndex];
			if (at && !blocked(at)) {
				this.stop = at;
				this.stopIndex = elements.indexOf(at);
				return;
			}
			// The vacated slot is gone. Radio and Tabs then use the selected item.
			const selected = elements.find(
				(element) => this.itemSelected(element, records) && !blocked(element)
			);
			if (selected) {
				this.stop = selected;
				this.stopIndex = elements.indexOf(selected);
				return;
			}
		}

		const fallback = elements.find((element) => !blocked(element)) ?? null;
		this.stop = fallback;
		this.stopIndex = fallback ? elements.indexOf(fallback) : 0;
	}

	private refreshOrder() {
		const sorted = [...this.elements].sort(byDocumentOrder);
		if (sorted.some((node, index) => node !== this.elements[index])) this.elements = sorted;
	}

	private nextEnabled(key: string, originIndex: number, items: HTMLElement[]): HTMLElement | null {
		const orientation = this.options.orientation?.() ?? 'horizontal';
		const loop = orientation === 'both' ? true : (this.options.loopFocus?.() ?? true);
		const homeEnd =
			orientation === 'both' ? false : (this.options.keys ?? 'composite') !== 'arrows';
		const rtl = this.options.direction?.() === 'rtl';

		if (homeEnd && (key === 'Home' || key === 'End')) {
			const enabled = items.filter((item) => !this.itemDisabled(item));
			return key === 'End' ? (enabled[enabled.length - 1] ?? null) : (enabled[0] ?? null);
		}

		const axes = axisKeys(orientation === 'vertical', rtl);
		const forward =
			orientation === 'both'
				? key === (rtl ? 'ArrowLeft' : 'ArrowRight') || key === 'ArrowDown'
				: key === axes.forwardKey;
		const backward =
			orientation === 'both'
				? key === (rtl ? 'ArrowRight' : 'ArrowLeft') || key === 'ArrowUp'
				: key === axes.backwardKey;
		if (!forward && !backward) return null;

		const length = items.length;
		let index = originIndex;
		for (let step = 0; step < length; step += 1) {
			if (forward) {
				if (index >= length - 1) {
					if (!loop) return null;
					index = 0;
				} else {
					index += 1;
				}
			} else if (index <= 0) {
				if (!loop) return null;
				index = length - 1;
			} else {
				index -= 1;
			}
			const candidate = items[index];
			if (candidate && !this.itemDisabled(candidate)) return candidate;
		}
		return null;
	}

	private modifiersBlock(event: KeyboardEvent) {
		if ((this.options.modifiers ?? 'all') === 'shift-ok') {
			return event.altKey || event.ctrlKey || event.metaKey;
		}
		return modifierHeld(event);
	}

	/** Keyboard skip. An `aria-disabled` tab stays reachable; a radio does not. */
	private itemDisabled(element: HTMLElement) {
		return this.options.isItemDisabled?.(element) ?? false;
	}

	/**
	 * Tab stop. Metadata `disabled` blocks it, except on a list that keeps
	 * disabled items focusable. Keyboard skip stays on `isItemDisabled`.
	 */
	private stopBlocked(element: HTMLElement, records?: Map<HTMLElement, CompositeRegistration>) {
		if (this.options.disabledHoldsStop) return this.itemDisabled(element);
		const registration = records?.get(element) ?? this.readers.get(element)?.() ?? {};
		return Boolean(registration.disabled) || this.itemDisabled(element);
	}

	private itemSelected(element: HTMLElement, records: Map<HTMLElement, CompositeRegistration>) {
		return this.options.isItemSelected?.(element, records.get(element) ?? {}) ?? false;
	}
}
