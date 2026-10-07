// Keyboard roving for Toolbar, from the linear path of
// Base UI v1.8.0 packages/react/src/internals/composite/root/useCompositeRoot.ts
// and packages/react/src/internals/composite/item/useCompositeItem.ts
// with Toolbar.Root's CompositeRoot options: Home/End off, every modifier blocks,
// and stopPropagation when focus moves
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
//
// Same shape as ToggleGroup's roving class. Items register with an attachment.
// Arrow keys are handled on the toolbar, where CompositeRoot listens.
// A focusable disabled item (aria-disabled, no native disabled) stays in the
// arrow order. A natively disabled or hidden host is skipped. No element renderer.

import { untrack } from 'svelte';
import { createAttachmentKey } from 'svelte/attachments';
import type { Attachment } from 'svelte/attachments';
import type { HTMLAttributes } from 'svelte/elements';
import type { ToolbarOrientation } from './types.js';

const ARROWS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

export interface ToolbarRovingHandlers {
	onfocus?: HTMLAttributes<HTMLElement>['onfocus'];
}

export type ToolbarRovingItemProps = HTMLAttributes<HTMLElement> &
	Record<symbol, Attachment<HTMLElement>>;

function byDocumentOrder(a: HTMLElement, b: HTMLElement) {
	if (a === b) return 0;
	return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

function modifierHeld(event: KeyboardEvent) {
	return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
}

/** Natively disabled and hidden hosts cannot take the tab stop. `aria-disabled` can. */
export function isSkipped(element: HTMLElement) {
	if (!element.isConnected) return true;
	if (element.matches(':disabled')) return true;
	const styles = getComputedStyle(element);
	if (styles.visibility === 'hidden' || styles.visibility === 'collapse') return true;
	if (typeof element.checkVisibility === 'function') return !element.checkVisibility();
	return styles.display === 'none' || styles.display === 'contents';
}

/**
 * One toolbar composite. The highlighted item is the only tab stop.
 * Arrow keys follow `orientation` (horizontal arrows swap in RTL).
 * Home and End are left to the browser. `loopFocus` defaults to true.
 */
export class ToolbarRoving {
	elements = $state<HTMLElement[]>([]);
	highlighted = $state<HTMLElement | null>(null);
	readLoopFocus: () => boolean = () => true;
	readOrientation: () => ToolbarOrientation = () => 'horizontal';
	readDirection: () => 'ltr' | 'rtl' = () => 'ltr';

	private highlightedIndex = 0;
	private settled = false;
	private nextSlot = 0;
	private readonly attachmentKey = createAttachmentKey();

	/** Render-order slot used for tabindex before the attachment runs (SSR). */
	claim() {
		const slot = this.nextSlot;
		this.nextSlot += 1;
		return slot;
	}

	register(node: HTMLElement) {
		untrack(() => {
			if (!this.elements.includes(node)) {
				this.elements = [...this.elements, node].sort(byDocumentOrder);
			}
			this.reconcile();
		});
		return () => {
			untrack(() => {
				this.elements = this.elements.filter((item) => item !== node);
				if (this.highlighted === node) this.highlighted = null;
				if (this.elements.length === 0) this.settled = false;
				this.reconcile();
			});
		};
	}

	get loopFocus() {
		return this.readLoopFocus();
	}

	get orientation() {
		return this.readOrientation();
	}

	/** Re-pick the tab stop after an item's disabled flag changes. */
	sync(disabled = false, focusableWhenDisabled = true) {
		const nativeDisabled = disabled && !focusableWhenDisabled;
		untrack(() => {
			this.reconcile();
			if (nativeDisabled && this.highlighted && isSkipped(this.highlighted)) return;
		});
	}

	/** Move the tab stop onto `node` when it can take focus. */
	highlight(node: HTMLElement) {
		if (!this.elements.includes(node) || isSkipped(node) || this.highlighted === node) return;
		this.highlighted = node;
		this.highlightedIndex = this.elements.indexOf(node);
	}

	tabIndex(slot: number, node: HTMLElement | null): 0 | -1 {
		if (this.elements.length === 0) return slot === 0 ? 0 : -1;
		const stop = this.currentStop();
		if (node && stop) return node === stop ? 0 : -1;
		return slot === 0 ? 0 : -1;
	}

	/**
	 * Props spread onto a toolbar item: tabindex, focus handler, and the
	 * registration attachment. A consumer `onfocus` runs first.
	 */
	item(
		slot: number,
		node: HTMLElement | null,
		register: Attachment<HTMLElement>,
		handlers: ToolbarRovingHandlers
	): ToolbarRovingItemProps {
		return {
			tabindex: this.tabIndex(slot, node),
			onfocus: (event) => {
				handlers.onfocus?.(event);
				if (event.currentTarget instanceof HTMLElement) this.highlight(event.currentTarget);
			},
			[this.attachmentKey]: register
		};
	}

	keyForAttachment() {
		return this.attachmentKey;
	}

	/**
	 * Arrow keys bubble to the toolbar. Home, End, and modified arrows do nothing.
	 * A child `preventDefault()` does not skip this: CompositeRoot does not consult it.
	 * `preventDefault()` on the toolbar's own keydown does, and the root checks that
	 * before calling here.
	 */
	keydown(event: KeyboardEvent) {
		if (!ARROWS.has(event.key) || modifierHeld(event)) return;
		const current = event.currentTarget;
		if (!(current instanceof HTMLElement)) return;

		const rtl = this.readDirection() === 'rtl';
		const vertical = this.orientation === 'vertical';
		const forwardKey = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
		const backwardKey = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
		if (event.key !== forwardKey && event.key !== backwardKey) return;

		const items = this.elements.filter((item) => !isSkipped(item));
		if (items.length === 0) return;

		const stop = this.highlighted && items.includes(this.highlighted) ? this.highlighted : items[0];
		let position = stop ? items.indexOf(stop) : 0;
		if (position < 0) position = 0;

		const forward = event.key === forwardKey;
		const next = forward
			? position === items.length - 1
				? this.loopFocus
					? 0
					: position
				: position + 1
			: position === 0
				? this.loopFocus
					? items.length - 1
					: position
				: position - 1;

		const target = items[next];
		if (!target || target === stop) return;

		event.preventDefault();
		event.stopPropagation();
		this.highlight(target);
		target.focus();
	}

	private currentStop() {
		const highlighted = this.highlighted;
		if (highlighted && this.elements.includes(highlighted) && !isSkipped(highlighted)) {
			return highlighted;
		}
		return this.elements.find((item) => !isSkipped(item)) ?? this.elements[0] ?? null;
	}

	private reconcile() {
		const elements = this.elements;
		if (elements.length === 0) {
			this.highlighted = null;
			return;
		}

		const current = this.highlighted;
		if (current && elements.includes(current) && !isSkipped(current)) {
			this.highlightedIndex = elements.indexOf(current);
			this.settled = true;
			return;
		}

		if (!this.settled) this.settled = true;
		const replacement = elements[this.highlightedIndex];
		const next =
			replacement && !isSkipped(replacement)
				? replacement
				: (elements.find((item) => !isSkipped(item)) ?? elements[0] ?? null);
		this.highlighted = next;
		this.highlightedIndex = next ? elements.indexOf(next) : 0;
	}
}
