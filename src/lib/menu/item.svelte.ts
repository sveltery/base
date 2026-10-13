// Derived from Base UI v1.9.0 packages/react/src/menu/item/useMenuItem.ts and
// packages/react/src/menu/item/useMenuItemCommonProps.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// One class for every item kind. The item registers itself in the list of the menu that
// contains it, which for a submenu trigger is the parent menu. Virtual-focus props
// (`aria-selected` on WebKit, mousedown prevention) are not ported.

import { createAttachmentKey } from 'svelte/attachments';
import type { HTMLAttributes } from 'svelte/elements';
import { REASONS, platform } from '@sveltery/utils';
import { ButtonBehavior } from '../internal/button.svelte.js';
import { mergePropsN } from '../internal/mergeProps.js';
import { dispatchClickWithModifiers } from './dom.js';
import { findContextMenuParent } from './parent.svelte.js';
import type { MenuStore } from './store.svelte.js';

export interface MenuItemOptions {
	id: string | undefined;
	label: string | undefined;
	disabled: boolean;
	closeOnClick: boolean;
	nativeButton: boolean;
}

type Props = HTMLAttributes<HTMLElement>;

export class MenuItemBehavior {
	node = $state<HTMLElement | null>(null);
	readonly highlighted: boolean;
	readonly #registerKey = createAttachmentKey();
	readonly #contextMenu = findContextMenuParent();
	readonly #button: ButtonBehavior;

	/**
	 * @param list The menu whose list holds this item. A submenu trigger belongs to its parent.
	 * @param kind A submenu trigger does not close the menu or click on a drag release.
	 */
	constructor(
		private readonly list: MenuStore,
		private readonly options: () => MenuItemOptions,
		private readonly kind: 'regular' | 'submenu-trigger' = 'regular'
	) {
		this.highlighted = $derived(list.isActive(this.node));
		this.#button = new ButtonBehavior(() => {
			const { disabled, nativeButton } = this.options();
			return { disabled, native: nativeButton, focusableWhenDisabled: true, composite: true };
		});
	}

	#register = (node: HTMLElement) => {
		this.node = node;
		const stop = this.list.items.register(node, () => ({
			// Svelte markup keeps the whitespace around the text. Typeahead matches the start.
			label: this.options().label ?? node.textContent?.trim() ?? null
		}));
		return () => {
			stop();
			if (this.node === node) this.node = null;
		};
	};

	#commonProps(): Props {
		const list = this.list;
		const { id, closeOnClick } = this.options();
		const events = list.tree?.events;
		const contextMenu = this.#contextMenu;
		return {
			id,
			role: 'menuitem',
			// `-1` rather than no attribute, which would leave links and buttons in the tab order.
			tabindex: list.open && this.highlighted ? 0 : -1,
			onkeydown: (event: KeyboardEvent) => {
				if (event.key === ' ' && list.typing) event.preventDefault();
			},
			onmousemove: (event: MouseEvent) => {
				if (!list.nodeId) return;
				// Unrelated submenus of this menu close when another item is hovered.
				events?.emit('itemhover', { nodeId: list.nodeId, target: event.currentTarget });
			},
			onclick: (event: MouseEvent) => {
				if (closeOnClick) {
					events?.emit('close', { domEvent: event, reason: REASONS.itemPress });
				}
			},
			onmouseup: (event: MouseEvent) => {
				if (contextMenu) {
					const start = contextMenu.initialCursorPoint;
					contextMenu.initialCursorPoint = null;
					if (
						start &&
						Math.abs(event.clientX - start.x) <= 1 &&
						Math.abs(event.clientY - start.y) <= 1
					) {
						return;
					}
					// Outside macOS this mouseup ends the right click that opened the context menu.
					if (!platform.os.mac && event.button === 2) return;
				}
				const node = this.node;
				if (!node || !list.mouseUpGate.allow || (contextMenu && event.button !== 2)) return;
				// A press on the trigger, a move, and a release over the item activate it.
				if (this.kind === 'regular') {
					dispatchClickWithModifiers(node, event, { detail: 1, pointerType: 'mouse' });
				}
			}
		};
	}

	/** Host props. `own` is the part's own bag. The consumer's `elementProps` go last. */
	props(own: Props | Props[], elementProps: object): Props {
		const owns = Array.isArray(own) ? own : [own];
		return this.#button.props(
			mergePropsN<Props>([
				this.#commonProps(),
				this.list.itemProps,
				...owns,
				{ [this.#registerKey]: this.#register },
				elementProps
			])
		) as Props;
	}
}
