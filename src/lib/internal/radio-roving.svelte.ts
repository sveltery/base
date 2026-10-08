// Keyboard roving for RadioGroup, from the linear path of
// Base UI v1.8.0 packages/react/src/internals/composite/root/useCompositeRoot.ts
// with RadioGroup's CompositeRoot options: orientation `both`, Home/End off,
// and Shift allowed (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c).
// MIT, see THIRD_PARTY_NOTICES.md.
//
// Items register with an attachment. The class publishes tabindex. Arrow keys
// are handled on the group, not on each radio. No element renderer.

import { untrack } from 'svelte';
import { CompositeItems } from './composite-items.svelte.js';
import { isSkipped } from './composite-skip.js';
import { ARROWS } from './roving-keys.js';
import { registeredTabIndex, renderOrderTabIndex } from './roving-slot.js';

/** Hidden, natively disabled, and `aria-disabled` radios are skipped. */
function isItemSkipped(element: HTMLElement) {
	return isSkipped(element) || element.getAttribute('aria-disabled') === 'true';
}

function fallbackIndex(elements: HTMLElement[]) {
	let fallback = -1;
	for (let index = 0; index < elements.length; index += 1) {
		const element = elements[index];
		if (!element || isItemSkipped(element)) continue;
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
export class RadioGroupRoving extends CompositeItems {
	highlighted = $state<HTMLElement | null>(null);
	readDirection: () => 'ltr' | 'rtl' = () => 'ltr';

	private highlightedIndex = 0;
	private userMoved = false;

	register(node: HTMLElement) {
		untrack(() => {
			this.admit(node);
			if (this.userMoved) this.follow();
			else this.applyDefault();
		});
		return () => {
			untrack(() => {
				const wasHighlighted = this.highlighted === node;
				const index = this.dismiss(node);
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
		node: HTMLElement | null,
		selected: boolean,
		hasSelection: boolean,
		renderIndex: number
	): 0 | -1 {
		if (node && this.elements.includes(node)) {
			return registeredTabIndex(this.elements, node, this.currentStop());
		}
		if (hasSelection) return selected ? 0 : -1;
		return renderOrderTabIndex(this.elements, renderIndex);
	}

	/**
	 * Arrow keys bubble to the group. `preventDefault()` before this runs skips
	 * the move. Shift is allowed. Ctrl, Alt, and Meta are not.
	 */
	keydown(event: KeyboardEvent) {
		if (!ARROWS.has(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
		const current = event.currentTarget;
		if (!(current instanceof HTMLElement)) return;

		const rtl = this.readDirection() === 'rtl';
		const forwardHorizontal = rtl ? 'ArrowLeft' : 'ArrowRight';
		const backwardHorizontal = rtl ? 'ArrowRight' : 'ArrowLeft';
		const forward = event.key === forwardHorizontal || event.key === 'ArrowDown';
		const backward = event.key === backwardHorizontal || event.key === 'ArrowUp';
		if (!forward && !backward) return;

		const items = this.elements.filter((item) => !isItemSkipped(item));
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
		return this.elements.find((item) => !isItemSkipped(item)) ?? this.elements[0] ?? null;
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
		if (!initial || isItemSkipped(initial)) {
			const first = elements.findIndex((element) => !isItemSkipped(element));
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
		if (replacement && !isItemSkipped(replacement)) {
			this.highlighted = replacement;
			return;
		}

		const fallback = fallbackIndex(elements);
		this.highlighted = elements[fallback] ?? null;
		this.highlightedIndex = fallback;
	}
}
