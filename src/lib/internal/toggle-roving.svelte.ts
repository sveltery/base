// Keyboard roving for ToggleGroup, from the linear (non-grid) path of
// Base UI v1.8.0 packages/react/src/internals/composite/root/useCompositeRoot.ts
// and packages/react/src/internals/composite/item/useCompositeItem.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
//
// Items register with an attachment. The class publishes tabindex and focus
// handlers for Toggle to spread onto its host. No element renderer.

import { untrack } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import type { HTMLButtonAttributes } from 'svelte/elements';
import { CompositeItems } from './composite-items.svelte.js';
import { COMPOSITE_KEYS } from './composite-keys.js';
import { axisKeys, modifierHeld, stepLinear } from './roving-keys.js';
import { registeredTabIndex, renderOrderTabIndex } from './roving-slot.js';

export type RovingOrientation = 'horizontal' | 'vertical';

export interface RovingHostHandlers {
	onfocus?: HTMLButtonAttributes['onfocus'];
	onkeydown?: HTMLButtonAttributes['onkeydown'];
}

export type RovingHostProps = HTMLButtonAttributes & Record<symbol, Attachment<HTMLButtonElement>>;

function isDisabled(element: HTMLElement) {
	return element.matches(':disabled') || element.getAttribute('aria-disabled') === 'true';
}

/**
 * One composite list. The highlighted item is the only tab stop.
 * Arrow keys follow `orientation` (horizontal arrows swap in RTL).
 * Home and End jump to the first and last focusable item.
 */
export class RovingFocus extends CompositeItems {
	active = $state<HTMLElement | null>(null);
	readLoopFocus: () => boolean = () => true;
	readOrientation: () => RovingOrientation = () => 'horizontal';
	readDirection: () => 'ltr' | 'rtl' = () => 'ltr';

	register(node: HTMLElement) {
		// The attachment effect must not subscribe to the list it writes.
		untrack(() => {
			this.admit(node);
			this.ensureActive();
		});
		return () => {
			untrack(() => {
				if (this.active === node) this.active = null;
				this.dismiss(node);
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

	/** Re-pick the tab stop when `node`'s disabled flag changes. */
	sync(node: HTMLElement | null, disabled: boolean) {
		const host = { node, disabled };
		untrack(() => {
			if (!host.node || !this.elements.includes(host.node)) return;
			if (host.disabled) {
				if (this.active === host.node) this.ensureActive();
				return;
			}
			this.keepEnabled();
		});
	}

	private keepEnabled() {
		if (!this.active || isDisabled(this.active)) this.ensureActive();
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

	tabIndex(node: HTMLElement | null, renderIndex: number): 0 | -1 {
		if (node && this.elements.includes(node)) {
			return registeredTabIndex(this.elements, node, this.candidate());
		}
		return renderOrderTabIndex(this.elements, renderIndex);
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
		node: HTMLElement | null,
		register: Attachment<HTMLButtonElement>,
		handlers: RovingHostHandlers,
		renderIndex: number
	): RovingHostProps {
		const tabindex = this.tabIndex(node, renderIndex);
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

	private keydown(event: KeyboardEvent) {
		if (!COMPOSITE_KEYS.has(event.key) || modifierHeld(event)) return;
		const current = event.currentTarget;
		if (!(current instanceof HTMLElement)) return;

		const { forwardKey, backwardKey } = axisKeys(
			this.orientation === 'vertical',
			this.readDirection() === 'rtl'
		);

		const items = this.elements.filter((item) => !isDisabled(item));
		if (items.length === 0) return;
		const stop = this.candidate();
		let position = stop ? items.indexOf(stop) : 0;
		if (position < 0) position = 0;

		const next = stepLinear(
			position,
			items.length,
			event.key,
			forwardKey,
			backwardKey,
			this.loopFocus,
			true
		);
		if (next == null) return;

		const target = items[next];
		if (!target || target === stop) return;

		event.preventDefault();
		event.stopPropagation();
		this.active = target;
		target.focus();
	}
}
