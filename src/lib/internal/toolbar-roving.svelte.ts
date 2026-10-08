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
import type { Attachment } from 'svelte/attachments';
import type { HTMLAttributes } from 'svelte/elements';
import { CompositeItems } from './composite-items.svelte.js';
import { ARROWS } from './composite-keys.js';
import { isSkipped } from './composite-skip.js';
import { modifierHeld, stepLinear } from './roving-keys.js';
import { registeredTabIndex, renderOrderTabIndex } from './roving-slot.js';

export type ToolbarOrientation = 'horizontal' | 'vertical';

export interface ToolbarRovingHandlers {
	onfocus?: HTMLAttributes<HTMLElement>['onfocus'];
}

export type ToolbarRovingItemProps = HTMLAttributes<HTMLElement> &
	Record<symbol, Attachment<HTMLElement>>;

/**
 * One toolbar composite. The highlighted item is the only tab stop.
 * Arrow keys follow `orientation` (horizontal arrows swap in RTL).
 * Home and End are left to the browser. `loopFocus` defaults to true.
 */
export class ToolbarRoving extends CompositeItems {
	highlighted = $state<HTMLElement | null>(null);
	readLoopFocus: () => boolean = () => true;
	readOrientation: () => ToolbarOrientation = () => 'horizontal';
	readDirection: () => 'ltr' | 'rtl' = () => 'ltr';

	private highlightedIndex = 0;
	private settled = false;

	register(node: HTMLElement) {
		untrack(() => {
			this.admit(node);
			this.reconcile();
		});
		return () => {
			untrack(() => {
				const removed = this.highlighted === node;
				this.dismiss(node);
				if (removed) this.highlighted = null;
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

	/** Re-pick the tab stop when `node`'s disabled flag changes. */
	sync(node: HTMLElement | null, disabled: boolean, focusableWhenDisabled = true) {
		const host = { node, disabled, focusableWhenDisabled };
		untrack(() => {
			if (!host.node || !this.elements.includes(host.node)) return;
			const nativeDisabled = host.disabled && !host.focusableWhenDisabled;
			if (nativeDisabled && this.highlighted === host.node) {
				this.reconcile();
				return;
			}
			if (!nativeDisabled) {
				this.keepHighlighted();
				return;
			}
			this.rememberHighlight();
		});
	}

	private keepHighlighted() {
		if (this.highlighted == null || isSkipped(this.highlighted)) this.reconcile();
		else this.rememberHighlight();
	}

	private rememberHighlight() {
		const highlighted = this.highlighted;
		if (highlighted && this.elements.includes(highlighted) && !isSkipped(highlighted)) {
			this.highlightedIndex = this.elements.indexOf(highlighted);
			this.settled = true;
		}
	}

	/** Move the tab stop onto `node` when it can take focus. */
	highlight(node: HTMLElement) {
		if (!this.elements.includes(node) || isSkipped(node) || this.highlighted === node) return;
		this.highlighted = node;
		this.highlightedIndex = this.elements.indexOf(node);
	}

	tabIndex(node: HTMLElement | null, renderIndex: number): 0 | -1 {
		if (node && this.elements.includes(node)) {
			return registeredTabIndex(this.elements, node, this.currentStop());
		}
		return renderOrderTabIndex(this.elements, renderIndex);
	}

	/**
	 * Props spread onto a toolbar item: tabindex, focus handler, and the
	 * registration attachment. A consumer `onfocus` runs first.
	 */
	item(
		node: HTMLElement | null,
		register: Attachment<HTMLElement>,
		handlers: ToolbarRovingHandlers,
		renderIndex: number
	): ToolbarRovingItemProps {
		return {
			tabindex: this.tabIndex(node, renderIndex),
			onfocus: (event) => {
				handlers.onfocus?.(event);
				if (event.currentTarget instanceof HTMLElement) this.highlight(event.currentTarget);
			},
			[this.attachmentKey]: register
		};
	}

	/**
	 * Arrow keys bubble to the toolbar. Home, End, and modified arrows do nothing.
	 * A child `preventDefault()` does not skip this: CompositeRoot does not consult it.
	 * `preventDefault()` on the toolbar's own keydown does, and the root checks that
	 * before calling here.
	 */
	keydown(event: KeyboardEvent) {
		if (modifierHeld(event) || !ARROWS.has(event.key)) return;
		const vertical = this.orientation === 'vertical';
		const rtl = this.readDirection() === 'rtl';
		const forwardKey = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
		const backwardKey = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
		const items = this.elements.filter((item) => !isSkipped(item));
		if (items.length === 0) return;

		const stop = this.highlighted && items.includes(this.highlighted) ? this.highlighted : items[0];
		let position = stop ? items.indexOf(stop) : 0;
		if (position < 0) position = 0;

		const next = stepLinear(
			position,
			items.length,
			event.key,
			forwardKey,
			backwardKey,
			this.loopFocus,
			false
		);
		if (next == null) return;

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
