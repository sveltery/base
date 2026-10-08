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
import { axisKeys, modifierHeld, stepLinear } from './roving-keys.js';

export type CompositeOrientation = 'horizontal' | 'vertical' | 'both';

export interface CompositeRootOptions {
	orientation?: () => CompositeOrientation;
	loopFocus?: () => boolean;
	direction?: () => 'ltr' | 'rtl';
	isItemDisabled?: (element: HTMLElement) => boolean;
	isItemSelected?: (element: HTMLElement) => boolean;
	/** `arrows` is the four arrow keys. `composite` also includes Home and End. */
	keys?: 'arrows' | 'composite';
	/** `shift-ok` still blocks Ctrl, Alt, and Meta. */
	modifiers?: 'all' | 'shift-ok';
	homeEnd?: boolean;
	stopPropagation?: boolean;
	/** `first` jumps to the first enabled item. `index` keeps the vacated slot. */
	replacement?: 'first' | 'index';
	/** `item` listens on each host. `root` listens on the composite root. */
	keydown?: 'item' | 'root';
}

export interface CompositeHandlers {
	onfocus?: HTMLAttributes<HTMLElement>['onfocus'];
	onkeydown?: HTMLAttributes<HTMLElement>['onkeydown'];
}

export interface CompositeMeta {
	disabled?: boolean;
	selected?: boolean;
	hasSelection?: boolean;
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
	private revision = $state(0);
	private stopIndex = 0;
	private userMoved = false;
	/** Item `isItemSelected` last returned. A different item clears a manual highlight. */
	private selectedNode: HTMLElement | null = null;
	private appliedGeneration = 0;
	private claims: RenderClaim[] = [];

	constructor(private readonly options: CompositeRootOptions = {}) {
		super();
		$effect(() => {
			const elements = this.elements;
			const generation = this.revision;
			const selected = elements.map((element) => this.itemSelected(element));
			untrack(() => {
				this.observe(generation, selected);
			});
		});
	}

	/** Render-order slot for SSR, before the node is registered. */
	claim() {
		const index = super.claim();
		this.claims.push({ index, disabled: false });
		return index;
	}

	register(node: HTMLElement) {
		untrack(() => {
			this.admit(node);
			this.observe(
				this.revision,
				this.elements.map((element) => this.itemSelected(element))
			);
		});
		return () => {
			untrack(() => {
				const index = this.elements.indexOf(node);
				const removedStop = this.stop === node;
				this.dismiss(node);
				if (removedStop) {
					this.stop = null;
					if (index !== -1) this.stopIndex = index;
				}
				if (this.elements.length === 0) {
					this.claims = [];
					this.userMoved = false;
					this.selectedNode = null;
				}
				this.observe(
					this.revision,
					this.elements.map((element) => this.itemSelected(element))
				);
			});
		};
	}

	/** Re-read disabled and selected items. Layout is measured here, not in host props. */
	sync() {
		// The caller is often an effect. Reading `revision` there would subscribe
		// that effect to the counter it just bumped.
		untrack(() => {
			this.revision += 1;
		});
	}

	/** Move the tab stop onto `node`. A later selection change can move it again. */
	highlight(node: HTMLElement) {
		if (!this.elements.includes(node) || this.itemDisabled(node)) return;
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
		const claim = this.claims.find((item) => item.index === renderIndex);
		if (claim) claim.disabled = Boolean(meta.disabled);
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
	item(
		node: HTMLElement | null,
		register: Attachment<HTMLElement>,
		handlers: CompositeHandlers,
		renderIndex: number,
		meta: CompositeMeta = {}
	): CompositeItemProps {
		const props: CompositeItemProps = {
			tabindex: this.tabIndex(node, renderIndex, meta),
			onfocus: (event) => {
				handlers.onfocus?.(event);
				if (event.currentTarget instanceof HTMLElement) this.highlight(event.currentTarget);
			},
			[this.attachmentKey]: register
		};
		if ((this.options.keydown ?? 'item') === 'item') {
			props.onkeydown = (event) => {
				handlers.onkeydown?.(event);
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
		const items = this.elements.filter((item) => !this.itemDisabled(item));
		if (items.length === 0) return;

		const current = this.stop && items.includes(this.stop) ? this.stop : items[0];
		let position = current ? items.indexOf(current) : 0;
		if (position < 0) position = 0;

		const next = this.nextIndex(event.key, position, items.length);
		if (next == null) return;
		const target = items[next];
		if (!target || target === current) return;

		event.preventDefault();
		if (this.options.stopPropagation ?? true) event.stopPropagation();
		this.highlight(target);
		target.focus();
	}

	private observe(generation: number, selected: boolean[]) {
		const elements = this.elements;
		let selectedNode: HTMLElement | null = null;
		for (let index = 0; index < elements.length; index += 1) {
			if (!selected[index]) continue;
			selectedNode = elements[index] ?? null;
			break;
		}
		// A value change moves the stop back onto the selection. Removing the
		// highlighted item does not: that item is already gone, and the vacated
		// index chooses the successor.
		const stopPresent = this.stop != null && elements.includes(this.stop);
		if (selectedNode !== this.selectedNode && stopPresent) this.userMoved = false;
		this.selectedNode = selectedNode;
		this.appliedGeneration = generation;
		this.recompute();
	}

	private recompute() {
		const elements = this.elements;
		if (elements.length === 0) {
			this.stop = null;
			this.stopIndex = 0;
			return;
		}

		if (!this.userMoved) {
			const selected = elements.find(
				(element) => this.itemSelected(element) && !this.itemDisabled(element)
			);
			if (selected) {
				this.stop = selected;
				this.stopIndex = elements.indexOf(selected);
				return;
			}
		}

		if (this.stop && elements.includes(this.stop) && !this.itemDisabled(this.stop)) {
			this.stopIndex = elements.indexOf(this.stop);
			return;
		}

		if ((this.options.replacement ?? 'index') === 'index') {
			const at = elements[this.stopIndex];
			if (at && !this.itemDisabled(at)) {
				this.stop = at;
				this.stopIndex = elements.indexOf(at);
				return;
			}
			// The vacated slot is gone. Radio and Tabs then use the selected item.
			const selected = elements.find(
				(element) => this.itemSelected(element) && !this.itemDisabled(element)
			);
			if (selected) {
				this.stop = selected;
				this.stopIndex = elements.indexOf(selected);
				return;
			}
		}

		const fallback = elements.find((element) => !this.itemDisabled(element)) ?? null;
		this.stop = fallback;
		this.stopIndex = fallback ? elements.indexOf(fallback) : 0;
	}

	private refreshOrder() {
		const sorted = [...this.elements].sort(byDocumentOrder);
		if (sorted.some((node, index) => node !== this.elements[index])) this.elements = sorted;
	}

	private nextIndex(key: string, position: number, length: number): number | null {
		const orientation = this.options.orientation?.() ?? 'horizontal';
		if (orientation === 'both') {
			const rtl = this.options.direction?.() === 'rtl';
			const forwardHorizontal = rtl ? 'ArrowLeft' : 'ArrowRight';
			const backwardHorizontal = rtl ? 'ArrowRight' : 'ArrowLeft';
			const forward = key === forwardHorizontal || key === 'ArrowDown';
			const backward = key === backwardHorizontal || key === 'ArrowUp';
			if (!forward && !backward) return null;
			if (forward) return position === length - 1 ? 0 : position + 1;
			return position === 0 ? length - 1 : position - 1;
		}

		const { forwardKey, backwardKey } = axisKeys(
			orientation === 'vertical',
			this.options.direction?.() === 'rtl'
		);
		return stepLinear(
			position,
			length,
			key,
			forwardKey,
			backwardKey,
			this.options.loopFocus?.() ?? true,
			this.options.homeEnd ?? false
		);
	}

	private modifiersBlock(event: KeyboardEvent) {
		if ((this.options.modifiers ?? 'all') === 'shift-ok') {
			return event.altKey || event.ctrlKey || event.metaKey;
		}
		return modifierHeld(event);
	}

	private itemDisabled(element: HTMLElement) {
		return this.options.isItemDisabled?.(element) ?? false;
	}

	private itemSelected(element: HTMLElement) {
		return this.options.isItemSelected?.(element) ?? false;
	}
}
