// Keyboard roving for RadioGroup, from the linear path of
// Base UI v1.8.0 packages/react/src/internals/composite/root/useCompositeRoot.ts
// with RadioGroup's CompositeRoot options: orientation `both`, Home/End off,
// and Shift allowed (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c).
// MIT, see THIRD_PARTY_NOTICES.md.
//
// Items register with an attachment. The class publishes tabindex. Arrow keys
// are handled on the group, not on each radio. No element renderer.

import { untrack } from 'svelte';
import type { RadioGroupRovingFocus } from '../radio/group-context.js';

const ARROWS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

function byDocumentOrder(a: HTMLElement, b: HTMLElement) {
	if (a === b) return 0;
	return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

function isVisible(element: HTMLElement) {
	if (!element.isConnected) return false;
	const styles = getComputedStyle(element);
	if (styles.visibility === 'hidden' || styles.visibility === 'collapse') return false;
	if (typeof element.checkVisibility === 'function') return element.checkVisibility();
	return styles.display !== 'none' && styles.display !== 'contents';
}

/** Hidden, natively disabled, and `aria-disabled` radios are skipped. */
export function isSkipped(element: HTMLElement) {
	if (!isVisible(element)) return true;
	if (element.matches(':disabled')) return true;
	return element.getAttribute('aria-disabled') === 'true';
}

function fallbackIndex(elements: HTMLElement[]) {
	let fallback = -1;
	for (let index = 0; index < elements.length; index += 1) {
		const element = elements[index];
		if (!element || isSkipped(element)) continue;
		if (element.hasAttribute('data-composite-item-active')) return index;
		if (fallback === -1) fallback = index;
	}
	return Math.max(fallback, 0);
}

/**
 * One radio composite. The highlighted item is the only tab stop.
 * Vertical arrows and horizontal arrows both move, and horizontal arrows swap in RTL.
 * Shift+Arrow still moves. Home and End do not.
 */
export class RadioGroupRoving implements RadioGroupRovingFocus {
	elements = $state<HTMLElement[]>([]);
	highlighted = $state<HTMLElement | null>(null);

	private highlightedIndex = 0;
	private userMoved = false;
	private nextSlot = 0;

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
			if (this.userMoved) this.follow();
			else this.applyDefault();
		});
		return () => {
			untrack(() => {
				const index = this.elements.indexOf(node);
				const wasHighlighted = this.highlighted === node;
				this.elements = this.elements.filter((item) => item !== node);
				if (wasHighlighted) {
					this.highlighted = null;
					if (index !== -1) this.highlightedIndex = index;
				}
				if (this.userMoved) this.reconcileRemoval();
				else this.applyDefault();
			});
		};
	}

	/** Move the tab stop onto `node`. Used when the radio is focused. */
	highlight(node: HTMLElement) {
		if (!this.elements.includes(node)) return;
		this.userMoved = true;
		if (this.highlighted === node) return;
		this.highlighted = node;
		this.highlightedIndex = this.elements.indexOf(node);
	}

	tabIndex(
		slot: number,
		node: HTMLElement | null,
		selected: boolean,
		hasSelection: boolean
	): 0 | -1 {
		if (!node || !this.elements.includes(node)) {
			if (hasSelection) return selected ? 0 : -1;
			return slot === 0 ? 0 : -1;
		}
		const stop = this.currentStop();
		return node === stop ? 0 : -1;
	}

	/**
	 * Arrow keys bubble to the group. `preventDefault()` before this runs skips
	 * the move. Shift is allowed. Ctrl, Alt, and Meta are not.
	 */
	keydown(event: KeyboardEvent) {
		if (!ARROWS.has(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
		const current = event.currentTarget;
		if (!(current instanceof HTMLElement)) return;

		const rtl = getComputedStyle(current).direction === 'rtl';
		const forwardHorizontal = rtl ? 'ArrowLeft' : 'ArrowRight';
		const backwardHorizontal = rtl ? 'ArrowRight' : 'ArrowLeft';
		const forward = event.key === forwardHorizontal || event.key === 'ArrowDown';
		const backward = event.key === backwardHorizontal || event.key === 'ArrowUp';
		if (!forward && !backward) return;

		const items = this.elements.filter((item) => !isSkipped(item));
		if (items.length === 0) return;

		const stop = this.highlighted && items.includes(this.highlighted) ? this.highlighted : items[0];
		let position = stop ? items.indexOf(stop) : 0;
		if (position < 0) position = 0;

		const next = forward
			? position === items.length - 1
				? 0
				: position + 1
			: position === 0
				? items.length - 1
				: position - 1;
		const target = items[next];
		if (!target || target === stop) return;

		event.preventDefault();
		event.stopPropagation();
		this.highlight(target);
		target.focus();
	}

	private currentStop() {
		if (this.highlighted && this.elements.includes(this.highlighted)) return this.highlighted;
		return this.elements.find((item) => !isSkipped(item)) ?? this.elements[0] ?? null;
	}

	private applyDefault() {
		const elements = this.elements;
		if (elements.length === 0) {
			this.highlighted = null;
			return;
		}

		const activeIndex = elements.findIndex((element) =>
			element.hasAttribute('data-composite-item-active')
		);
		if (activeIndex !== -1) {
			this.highlighted = elements[activeIndex] ?? null;
			this.highlightedIndex = activeIndex;
			return;
		}

		const initial = elements[0];
		if (!initial || isSkipped(initial)) {
			const first = elements.findIndex((element) => !isSkipped(element));
			const index = first === -1 ? 0 : first;
			this.highlighted = elements[index] ?? null;
			this.highlightedIndex = index;
			return;
		}

		this.highlighted = initial;
		this.highlightedIndex = 0;
	}

	private follow() {
		const current = this.highlighted;
		if (!current || !this.elements.includes(current)) return;
		this.highlightedIndex = this.elements.indexOf(current);
	}

	private reconcileRemoval() {
		const elements = this.elements;
		if (elements.length === 0) {
			this.highlighted = null;
			return;
		}

		if (this.highlighted && elements.includes(this.highlighted)) {
			this.highlightedIndex = this.elements.indexOf(this.highlighted);
			return;
		}

		const replacement = elements[this.highlightedIndex];
		if (replacement && !isSkipped(replacement)) {
			this.highlighted = replacement;
			return;
		}

		const fallback = fallbackIndex(elements);
		this.highlighted = elements[fallback] ?? null;
		this.highlightedIndex = fallback;
	}
}
