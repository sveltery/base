// Keyboard roving for Tabs, from the linear path of
// Base UI v1.8.0 packages/react/src/internals/composite/root/useCompositeRoot.ts
// with Tabs.List's empty disabledIndices (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c).
// MIT, see THIRD_PARTY_NOTICES.md.
//
// Same shape as ToggleGroup's roving class: items register with an attachment,
// and the class publishes tabindex and focus handlers. No element renderer.
// A `disabled` tab stays in the arrow order (it is focusable). A natively
// disabled or hidden host is skipped.

import { untrack } from 'svelte';
import { createAttachmentKey } from 'svelte/attachments';
import type { Attachment } from 'svelte/attachments';
import type { HTMLAttributes } from 'svelte/elements';
import { isSkipped } from '../internal/composite-skip.js';
import {
	ARROW_DOWN,
	ARROW_LEFT,
	ARROW_RIGHT,
	ARROW_UP,
	COMPOSITE_KEYS
} from '../internal/composite-keys.js';
import { createSlotClaim, includeSorted } from '../internal/roving-slot.js';
import type { TabsOrientation } from './types.js';

export interface TabsRovingHandlers {
	onfocus?: HTMLAttributes<HTMLElement>['onfocus'];
	onkeydown?: HTMLAttributes<HTMLElement>['onkeydown'];
}

export type TabsRovingHostProps = HTMLAttributes<HTMLElement> &
	Record<symbol, Attachment<HTMLElement>>;

function modifierHeld(event: KeyboardEvent) {
	return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
}

/**
 * One tablist. The highlighted item is the only tab stop.
 * Arrow keys follow `orientation` (horizontal arrows swap in RTL).
 * Home and End jump to the first and last item arrow keys can land on.
 */
export class TabsRoving {
	elements = $state<HTMLElement[]>([]);
	highlighted = $state<HTMLElement | null>(null);
	readLoopFocus: () => boolean = () => true;
	readOrientation: () => TabsOrientation = () => 'horizontal';
	readDirection: () => 'ltr' | 'rtl' = () => 'ltr';

	private highlightedIndex = 0;
	private settled = false;
	readonly claim = createSlotClaim();
	private readonly attachmentKey = createAttachmentKey();

	get loopFocus() {
		return this.readLoopFocus();
	}

	get orientation() {
		return this.readOrientation();
	}

	private syncElements(node: HTMLElement, present: boolean) {
		this.elements = present
			? includeSorted(this.elements, node)
			: this.elements.filter((item) => item !== node);
		this.reconcile();
	}

	register(node: HTMLElement) {
		untrack(() => this.syncElements(node, true));
		return () => untrack(() => this.syncElements(node, false));
	}

	/**
	 * Move the tab stop onto `node`.
	 * Used when the tab is focused, and when an enabled selection should follow focus
	 * that sits outside the list.
	 */
	highlight(node: HTMLElement) {
		if (!this.elements.includes(node) || this.highlighted === node) return;
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
	 * Props spread onto the tab host: tabindex, focus handlers, and the
	 * registration attachment. A consumer `onfocus` / `onkeydown` runs first.
	 * `preventDefault()` on keydown skips navigation.
	 */
	host(
		slot: number,
		node: HTMLElement | null,
		register: Attachment<HTMLElement>,
		handlers: TabsRovingHandlers
	): TabsRovingHostProps {
		return {
			tabindex: this.tabIndex(slot, node),
			onfocus: (event) => {
				handlers.onfocus?.(event);
			},
			onkeydown: (event) => {
				handlers.onkeydown?.(event);
				if (event.defaultPrevented) return;
				this.keydown(event);
			},
			[this.attachmentKey]: register
		};
	}

	keyForAttachment() {
		return this.attachmentKey;
	}

	private currentStop() {
		const highlighted = this.highlighted;
		if (highlighted && this.elements.includes(highlighted)) return highlighted;
		return this.elements.find((item) => !isSkipped(item)) ?? this.elements[0] ?? null;
	}

	private reconcile() {
		const elements = this.elements;
		if (elements.length === 0) {
			this.highlighted = null;
			return;
		}

		if (!this.settled) {
			this.settled = true;
			const active = elements.find((element) => element.hasAttribute('data-active'));
			if (active) {
				this.highlighted = active;
				this.highlightedIndex = elements.indexOf(active);
				return;
			}
			const initial = elements[this.highlightedIndex] ?? elements[0];
			if (!initial || isSkipped(initial)) {
				const fallback = this.fallbackIndex(elements);
				this.highlighted = elements[fallback] ?? null;
				this.highlightedIndex = fallback;
			} else {
				this.highlighted = initial;
				this.highlightedIndex = elements.indexOf(initial);
			}
			return;
		}

		const current = this.highlighted;
		const nextIndex = current ? elements.indexOf(current) : -1;
		if (nextIndex === -1) {
			const replacement = elements[this.highlightedIndex];
			if (!replacement || isSkipped(replacement)) {
				const fallback = this.fallbackIndex(elements);
				this.highlighted = elements[fallback] ?? null;
				this.highlightedIndex = fallback;
			} else {
				this.highlighted = replacement;
			}
			return;
		}

		if (nextIndex !== this.highlightedIndex) {
			this.highlightedIndex = nextIndex;
			this.highlighted = elements[nextIndex];
		}
	}

	private fallbackIndex(elements: HTMLElement[]) {
		let fallback = -1;
		for (let index = 0; index < elements.length; index += 1) {
			const element = elements[index];
			if (!element || isSkipped(element)) continue;
			if (element.hasAttribute('data-active')) return index;
			if (fallback === -1) fallback = index;
		}
		return Math.max(fallback, 0);
	}

	private keydown(event: KeyboardEvent) {
		if (!(event.currentTarget instanceof HTMLElement) || modifierHeld(event)) return;
		if (!COMPOSITE_KEYS.has(event.key)) return;
		const vertical = this.orientation === 'vertical';
		const rtl = this.readDirection() === 'rtl';
		const forwardKey = vertical ? ARROW_DOWN : rtl ? ARROW_LEFT : ARROW_RIGHT;
		const backwardKey = vertical ? ARROW_UP : rtl ? ARROW_RIGHT : ARROW_LEFT;

		const items = this.elements.filter((item) => !isSkipped(item));
		if (items.length === 0) return;

		const stop = this.highlighted && items.includes(this.highlighted) ? this.highlighted : items[0];
		let position = items.indexOf(stop);
		if (position < 0) position = 0;

		let next: number;
		if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = items.length - 1;
		else if (event.key === forwardKey) {
			next = position === items.length - 1 ? (this.loopFocus ? 0 : position) : position + 1;
		} else if (event.key === backwardKey) {
			next = position === 0 ? (this.loopFocus ? items.length - 1 : position) : position - 1;
		} else {
			return;
		}

		const target = items[next];
		if (!target || target === stop) return;

		event.preventDefault();
		this.highlight(target);
		target.focus();
	}
}
