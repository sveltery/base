// Keyboard roving for ToggleGroup, from the linear (non-grid) path of
// Base UI v1.8.0 packages/react/src/internals/composite/root/useCompositeRoot.ts
// and packages/react/src/internals/composite/item/useCompositeItem.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
//
// Items register with an attachment. The class publishes tabindex and focus
// handlers for Toggle to spread onto its host. No element renderer.

import { untrack } from 'svelte';
import { createAttachmentKey } from 'svelte/attachments';
import type { Attachment } from 'svelte/attachments';
import type { HTMLButtonAttributes } from 'svelte/elements';

export type RovingOrientation = 'horizontal' | 'vertical';

const NAV_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']);

export interface RovingHostHandlers {
	onfocus?: HTMLButtonAttributes['onfocus'];
	onkeydown?: HTMLButtonAttributes['onkeydown'];
}

export type RovingHostProps = HTMLButtonAttributes & Record<symbol, Attachment<HTMLButtonElement>>;

function isDisabled(element: HTMLElement) {
	return element.matches(':disabled') || element.getAttribute('aria-disabled') === 'true';
}

function byDocumentOrder(a: HTMLElement, b: HTMLElement) {
	if (a === b) return 0;
	return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

function modifierHeld(event: KeyboardEvent) {
	return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
}

/**
 * One composite list. The highlighted item is the only tab stop.
 * Arrow keys follow `orientation` (horizontal arrows swap in RTL).
 * Home and End jump to the first and last focusable item.
 */
export class RovingFocus {
	elements = $state<HTMLElement[]>([]);
	active = $state<HTMLElement | null>(null);
	readLoopFocus: () => boolean = () => true;
	readOrientation: () => RovingOrientation = () => 'horizontal';

	private nextSlot = 0;
	private readonly attachmentKey = createAttachmentKey();

	/** Render-order slot used for tabindex before the attachment runs (SSR). */
	claim() {
		const slot = this.nextSlot;
		this.nextSlot += 1;
		return slot;
	}

	register(node: HTMLElement) {
		// The attachment effect must not subscribe to the list it writes.
		untrack(() => {
			if (!this.elements.includes(node)) {
				this.elements = [...this.elements, node].sort(byDocumentOrder);
			}
			this.ensureActive();
		});
		return () => {
			untrack(() => {
				this.elements = this.elements.filter((item) => item !== node);
				if (this.active === node) this.active = null;
				this.ensureActive();
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
	sync(disabled = false) {
		untrack(() => {
			this.ensureActive();
			if (disabled && this.active && isDisabled(this.active)) return;
		});
	}

	private candidate() {
		const items = this.elements;
		if (items.length === 0) return null;
		if (this.active && items.includes(this.active) && !isDisabled(this.active)) return this.active;
		return items.find((item) => !isDisabled(item)) ?? items[0];
	}

	private ensureActive() {
		const next = this.candidate();
		if (next !== this.active) this.active = next;
	}

	tabIndex(slot: number, node: HTMLElement | null): 0 | -1 {
		if (this.elements.length === 0) return slot === 0 ? 0 : -1;
		const stop = this.candidate();
		if (node && stop) return node === stop ? 0 : -1;
		return slot === 0 ? 0 : -1;
	}

	activate(node: HTMLElement) {
		if (!this.elements.includes(node) || isDisabled(node)) return;
		this.active = node;
	}

	/**
	 * Props spread onto the toggle host: tabindex, focus handlers, and the
	 * registration attachment. A consumer `onfocus` / `onkeydown` runs first.
	 * `preventDefault()` on keydown skips navigation.
	 */
	host(
		slot: number,
		node: HTMLElement | null,
		register: Attachment<HTMLButtonElement>,
		handlers: RovingHostHandlers
	): RovingHostProps {
		const tabindex = this.tabIndex(slot, node);
		return {
			tabindex,
			onfocus: (event) => {
				handlers.onfocus?.(event);
				if (event.currentTarget instanceof HTMLElement) this.activate(event.currentTarget);
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

	private keydown(event: KeyboardEvent) {
		if (!NAV_KEYS.has(event.key) || modifierHeld(event)) return;
		const current = event.currentTarget;
		if (!(current instanceof HTMLElement)) return;

		const rtl = getComputedStyle(current).direction === 'rtl';
		const vertical = this.orientation === 'vertical';
		const forwardKey = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
		const backwardKey = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';

		const items = this.elements.filter((item) => !isDisabled(item));
		if (items.length === 0) return;
		const stop = this.candidate();
		let position = stop ? items.indexOf(stop) : 0;
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
		event.stopPropagation();
		this.active = target;
		target.focus();
	}
}
