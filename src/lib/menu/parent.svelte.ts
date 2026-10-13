// Derived from Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.tsx (`MenuParent`),
// packages/react/src/menubar/MenubarContext.ts and
// packages/react/src/context-menu/root/ContextMenuRootContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Menubar and ContextMenu provide these contexts. Menu only reads them.
// Upstream ref objects become mutable fields on the context object.

import type { HTMLAttributes } from 'svelte/elements';
import type { Attachment } from 'svelte/attachments';
import type { FloatingTreeStore } from '@sveltery/floating-ui-svelte';
import { defineContext } from '../internal/context.js';
import type { MenuStore } from './store.svelte.js';
import type { MenuChangeEventDetails, MenuOrientation } from './types.js';

/** Shared flag: a press that opened a menu may activate an item on mouseup. */
export interface MouseUpGate {
	allow: boolean;
}

export type CompositeItemHostProps = HTMLAttributes<HTMLElement> &
	Record<symbol, Attachment<HTMLElement>>;

export interface MenubarParentContext {
	readonly modal: boolean;
	readonly disabled: boolean;
	/** The menubar element. The internal backdrop leaves it interactive. */
	readonly contentElement: HTMLElement | null;
	readonly hasSubmenuOpen: boolean;
	setHasSubmenuOpen(open: boolean): void;
	readonly orientation: MenuOrientation;
	readonly mouseUpGate: MouseUpGate;
	readonly rootId: string | undefined;
	/** The menubar's own floating tree. Its menus emit their open changes here. */
	readonly floatingTree: FloatingTreeStore;
	/** The menubar's node in that tree, the parent node of its menus. */
	readonly nodeId: string;
	/** Forwards a key from a detached menu popup to the menubar's roving focus. */
	relayKeyboardEvent(event: KeyboardEvent): void;
	/**
	 * Makes a trigger a roving item of the menubar. Called once during the trigger's init.
	 * The returned props go on the trigger host.
	 */
	createItem(disabled: () => boolean): { readonly props: CompositeItemHostProps };
}

export interface ContextMenuTarget {
	setOpen(open: boolean, details: MenuChangeEventDetails): void;
	readonly positionerElement: HTMLElement | null;
}

export interface ContextMenuParentContext {
	readonly anchor: { getBoundingClientRect(): DOMRect };
	/** `Menu.Backdrop` publishes its element here. */
	backdropElement: HTMLElement | null;
	/** The positioner's internal backdrop publishes its element here. */
	internalBackdropElement: HTMLElement | null;
	/**
	 * `Menu.Root` publishes itself here, so the context menu trigger can open it and read its
	 * positioner.
	 */
	menu: ContextMenuTarget | null;
	readonly mouseUpGate: MouseUpGate;
	/** Where the context menu opened. An item ignores a mouseup at the same point. */
	initialCursorPoint: { x: number; y: number } | null;
	readonly rootId: string | undefined;
}

export type MenuParent =
	| { type: 'menu'; store: MenuStore }
	| { type: 'menubar'; context: MenubarParentContext }
	| { type: 'context-menu'; context: ContextMenuParentContext }
	| { type: 'nested-context-menu'; context: ContextMenuParentContext; menuStore: MenuStore }
	| { type: undefined };

export const NO_PARENT: MenuParent = { type: undefined };

export const [useMenubarParent, setMenubarParent, findMenubarParent] =
	defineContext<MenubarParentContext>(
		'Base UI: MenubarContext is missing. Menubar parts must be placed within <Menubar>.'
	);

export const [useContextMenuParent, setContextMenuParent, findContextMenuParent] =
	defineContext<ContextMenuParentContext>(
		'Base UI: ContextMenuRootContext is missing. ContextMenu parts must be placed within <ContextMenu.Root>.'
	);
