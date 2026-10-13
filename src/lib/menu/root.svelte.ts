// Derived from Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.tsx (`MenuRootInternal`)
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Menu.Root and Menu.SubmenuRoot share this setup. Call it during component init: it sets
// context and registers effects. The virtual-focus and filter options of `MenuRootInternal`
// are not ported.

import { DEV } from 'esm-env';
import { getAbortSignal, untrack } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { REASONS, ScopedTimeout, getHighlightReason } from '@sveltery/utils';
import {
	DismissInteraction,
	ListNavigation,
	Typeahead,
	setFloatingTree,
	useFloatingNodeId,
	useFloatingParentNodeId
} from '@sveltery/floating-ui-svelte';
import { runOnceAnimationsFinish } from '../internal/animations-finished.js';
import { useDirection } from '../internal/direction-context.js';
import { mergeProps } from '../internal/mergeProps.js';
import { FOCUSABLE_POPUP_PROPS } from '../internal/popups/index.js';
import { TYPEAHEAD_RESET_MS } from './constants.js';
import { findMenuRoot, setMenuRoot, type MenuRootContext } from './context.svelte.js';
import type { MenuHandle } from './handle.svelte.js';
import {
	NO_PARENT,
	findContextMenuParent,
	findMenubarParent,
	type MenuParent
} from './parent.svelte.js';
import { MenuStore, type MenuInteractions, type MenuStoreOptions } from './store.svelte.js';
import type { MenuOrientation } from './types.js';

type Props = HTMLAttributes<HTMLElement>;

export interface MenuRootOptions extends Pick<
	MenuStoreOptions,
	| 'readOpen'
	| 'writeOpen'
	| 'readTriggerId'
	| 'writeTriggerId'
	| 'onOpenChange'
	| 'onOpenChangeComplete'
	| 'onItemHighlighted'
	| 'readDisabled'
	| 'readModal'
	| 'readHighlightItemOnHover'
> {
	isSubmenu: boolean;
	id: string;
	readLoopFocus: () => boolean;
	readOrientation: () => MenuOrientation;
	readCloseParentOnEsc: () => boolean;
	readHandle: () => MenuHandle<never> | undefined;
}

function withoutKeyDown(props: Props): Props {
	const { onkeydown: _onkeydown, ...rest } = props;
	return rest;
}

export function createMenuRoot(options: MenuRootOptions): MenuStore {
	const parentRoot = findMenuRoot();
	const menubar = findMenubarParent();
	const contextMenu = findContextMenuParent();
	const enclosing = parentRoot?.store;

	let parent: MenuParent = NO_PARENT;
	if (options.isSubmenu && enclosing) parent = { type: 'menu', store: enclosing };
	else if (menubar) parent = { type: 'menubar', context: menubar };
	// A plain menu inside a context menu's popup is not the context menu's own root.
	else if (contextMenu && !enclosing) parent = { type: 'context-menu', context: contextMenu };

	if (DEV && parent.type !== undefined && untrack(options.readModal) !== undefined) {
		console.warn('Base UI: The `modal` prop is not supported on nested menus. It will be ignored.');
	}

	const parentNodeId = useFloatingParentNodeId();
	const tree = setFloatingTree();
	const parentStore = parent.type === 'menu' ? parent.store : undefined;
	// An initially open submenu animates in only while its parent plays its own enter transition.
	const animateInitialOpen =
		untrack(options.readOpen) === true && parentStore?.transitionStatus === 'starting';
	const seededInstantType = animateInitialOpen
		? untrack(() => parentStore?.instantType)
		: undefined;

	const store = new MenuStore({
		readOpen: options.readOpen,
		writeOpen: options.writeOpen,
		floatingId: `base-ui-${options.id}`,
		nested: parentNodeId != null,
		parent,
		rootId: `base-ui-${options.id}-root`,
		tree,
		parentNodeId,
		readDisabled: options.readDisabled,
		readModal: options.readModal,
		readHighlightItemOnHover: options.readHighlightItemOnHover,
		readTriggerId: options.readTriggerId,
		writeTriggerId: options.writeTriggerId,
		onOpenChange: options.onOpenChange,
		onOpenChangeComplete: options.onOpenChangeComplete,
		onItemHighlighted: options.onItemHighlighted,
		animateInitialOpen,
		instantType: seededInstantType
	});

	// An inherited `instantType` is for the initial reveal only. Clear it once that settles.
	if (seededInstantType !== undefined) {
		$effect(() => {
			const clear = () => {
				if (store.instantType === seededInstantType) store.instantType = undefined;
			};
			if (!store.open) {
				untrack(clear);
				return;
			}
			if (store.transitionStatus !== undefined) return;
			const popup = store.popupElement;
			if (!popup) {
				untrack(clear);
				return;
			}
			runOnceAnimationsFinish(popup, () => untrack(clear), getAbortSignal(), false);
		});
	}

	// A context menu opened by a long press or mousedown must not close on that same press.
	let allowOutsidePressDismissal = parent.type !== 'context-menu';
	const outsidePressGrace = new ScopedTimeout();
	$effect(() => {
		if (store.parent.type !== 'context-menu') return;
		if (!store.open) {
			outsidePressGrace.clear();
			allowOutsidePressDismissal = false;
			return;
		}
		outsidePressGrace.start(500, () => {
			allowOutsidePressDismissal = true;
		});
	});

	if (parent.type === 'context-menu') {
		parent.context.menu = {
			setOpen: (open, details) => store.setOpen(open, details),
			get positionerElement() {
				return store.positionerElement;
			}
		};
	}

	const dismiss = new DismissInteraction(store, () => ({
		enabled: !store.disabled,
		// Upstream's outside presses bubble by default. The internal default here does not.
		bubbles: {
			escapeKey: options.readCloseParentOnEsc() && store.parent.type === 'menu',
			outsidePress: true
		},
		outsidePress: () =>
			store.parent.type !== 'context-menu' ||
			store.openEvent?.type === 'contextmenu' ||
			allowOutsidePressDismissal
	}));

	const direction = useDirection();
	const listNavigation = new ListNavigation(store, () => {
		const current = store.parent;
		const orientation = options.readOrientation();
		return {
			enabled: !store.disabled,
			items: () => store.items.elements,
			activeIndex: store.activeIndex,
			nested: current.type !== undefined,
			parentOrientation: current.type === 'menubar' ? current.context.orientation : undefined,
			loopFocus: options.readLoopFocus(),
			orientation,
			triggerOrientation: orientation,
			rtl: direction.direction === 'rtl',
			disabledIndices: [],
			onNavigate(index, event) {
				store.setActiveIndex(index, getHighlightReason(event), event);
			},
			openOnArrowKeyDown: current.type !== 'context-menu',
			focusItemOnHover: store.highlightItemOnHover,
			resetOnPointerLeave: true
		};
	});

	const typeahead = new Typeahead(store, () => ({
		enabled: !store.disabled,
		labels: () => store.labels(),
		elements: () => store.items.elements,
		activeIndex: store.activeIndex,
		resetMs: TYPEAHEAD_RESET_MS,
		onMatch(index, event) {
			if (store.open && index !== store.activeIndex) {
				store.setActiveIndex(index, REASONS.keyboard, event);
			}
		},
		onTyping(typing) {
			store.typing = typing;
		}
	}));

	useFloatingNodeId(store);

	// Upstream merges these handlers, and every one runs. `mergeProps` here would skip the
	// handlers left of one that calls `preventDefault()`, so the chain is explicit.
	function popupKeyDown(event: KeyboardEvent) {
		(dismiss.floating.onkeydown as (event: KeyboardEvent) => void)(event);
		(listNavigation.floating.onkeydown as ((event: KeyboardEvent) => void) | undefined)?.(event);
		(typeahead.floating.onkeydown as ((event: KeyboardEvent) => void) | undefined)?.(event);
		const relay = store.keyboardEventRelay;
		if (relay && !event.cancelBubble) relay(event);
	}

	const activeTriggerProps = $derived(
		mergeProps(typeahead.reference, listNavigation.reference, dismiss.reference, {
			onmousemove() {
				store.allowMouseEnter = true;
			}
		}) as Props
	);
	const inactiveTriggerProps = $derived(
		mergeProps(listNavigation.trigger, dismiss.trigger) as Props
	);
	const popupProps = $derived(
		mergeProps(
			FOCUSABLE_POPUP_PROPS,
			withoutKeyDown(typeahead.floating),
			withoutKeyDown(listNavigation.floating),
			withoutKeyDown(dismiss.floating as Props),
			{
				onmousemove() {
					store.allowMouseEnter = true;
					if (store.parent.type === 'menu') store.hoverEnabled = false;
				},
				onclick() {
					if (store.hoverEnabled) store.hoverEnabled = false;
				},
				onkeydown: popupKeyDown
			}
		) as Props
	);

	const interactions: MenuInteractions = {
		get activeTriggerProps() {
			return activeTriggerProps;
		},
		get inactiveTriggerProps() {
			return inactiveTriggerProps;
		},
		get popupProps() {
			return popupProps;
		},
		get itemProps() {
			return listNavigation.item;
		},
		popupKeyDown
	};
	store.interactions = interactions;

	const context: MenuRootContext = {
		store,
		parent,
		get orientation() {
			return options.readOrientation();
		}
	};
	setMenuRoot(context);

	$effect(() => {
		const handle = options.readHandle();
		if (!handle) return;
		return handle.attach(store as never);
	});

	return store;
}
