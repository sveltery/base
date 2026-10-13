// Derived from Base UI v1.9.0 packages/react/src/menubar/Menubar.tsx and
// packages/react/src/internals/composite/item/useCompositeItem.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The context the menu parts read is `MenubarParentContext` in ../menu/parent.svelte.ts.
// Upstream `allowMouseUpTriggerRef` is `mouseUpGate`. Upstream `CompositeRootContext.relayKeyboardEvent`
// and `useCompositeItem` are `relayKeyboardEvent` and `createItem`.

import { untrack } from 'svelte';
import { CompositeRoot } from '../internal/composite-root.svelte.js';
import { useDirection } from '../internal/direction-context.js';
import type {
	CompositeItemHostProps,
	MenubarParentContext,
	MouseUpGate
} from '../menu/parent.svelte.js';
import type { FloatingTreeStore } from './floating-tree.svelte.js';
import type { MenubarOrientation } from './types.js';

export interface MenubarOptions {
	modal: boolean;
	disabled: boolean;
	orientation: MenubarOrientation;
	loopFocus: boolean;
	rootId: string;
}

/** Upstream `isElementDisabled`: a disabled item stays in the list but arrow keys skip it. */
function isElementDisabled(element: HTMLElement) {
	return element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
}

export class MenubarContext implements MenubarParentContext {
	contentElement = $state<HTMLElement | null>(null);
	#hasSubmenuOpen = false;
	#hasSubmenuOpenVersion = $state(0);
	readonly mouseUpGate: MouseUpGate = { allow: false };
	readonly roving: CompositeRoot;

	constructor(
		private readonly options: () => MenubarOptions,
		readonly floatingTree: FloatingTreeStore,
		readonly nodeId: string
	) {
		const reading = useDirection();
		this.roving = new CompositeRoot({
			orientation: () => this.orientation,
			loopFocus: () => this.options().loopFocus,
			direction: () => reading.direction,
			isItemDisabled: isElementDisabled,
			keys: 'composite',
			homeEnd: true,
			stopPropagation: true,
			replacement: 'index',
			keydown: 'root'
		});
	}

	get modal() {
		return this.options().modal;
	}

	get disabled() {
		return this.options().disabled;
	}

	get orientation() {
		return this.options().orientation;
	}

	get rootId() {
		return this.options().rootId;
	}

	/**
	 * A plain field carries the value and a `$state` counter carries the reactivity. A trigger's
	 * focus handler can run inside the same flush that closed a menu, where a `$state` written by
	 * an effect earlier in that flush still reads its previous value.
	 */
	get hasSubmenuOpen() {
		void this.#hasSubmenuOpenVersion;
		return this.#hasSubmenuOpen;
	}

	setHasSubmenuOpen = (open: boolean) => {
		if (this.#hasSubmenuOpen === open) return;
		this.#hasSubmenuOpen = open;
		this.#hasSubmenuOpenVersion += 1;
	};

	relayKeyboardEvent = (event: KeyboardEvent) => {
		this.roving.keydown(event);
	};

	createItem(disabled: () => boolean): { readonly props: CompositeItemHostProps } {
		const roving = this.roving;
		const claim = roving.claim(untrack(disabled));
		let node = $state<HTMLElement | null>(null);

		const register = (element: HTMLElement) => {
			node = element;
			const remove = roving.register(element, () => ({ disabled: disabled() }), claim);
			return () => {
				remove();
				if (node === element) node = null;
			};
		};

		// Upstream `highlightItemOnHover`: while a menu is open, moving the pointer onto another
		// trigger focuses it, and the focus opens that trigger's menu.
		const onmousemove = (event: MouseEvent) => {
			const item = event.currentTarget as HTMLElement;
			if (!this.hasSubmenuOpen) return;
			const highlighted = roving.tabIndex(node, claim, { disabled: disabled() }) === 0;
			if (!highlighted && !isElementDisabled(item)) item.focus();
		};

		return {
			get props() {
				return {
					...roving.item(node, register, {}, claim, { disabled: disabled() }),
					onmousemove
				};
			}
		};
	}
}
