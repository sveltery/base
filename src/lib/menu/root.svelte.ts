// Derived from Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.tsx (`MenuRootInternal`)
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Menu.Root and Menu.SubmenuRoot share this setup. Call it during component init: it sets
// context and registers effects. A root that takes a `Menu.FilterProvider` gets virtual focus
// and a `MenuFilter`, as upstream `MenuFilterRoot` and `useMenuFilterRoot` set up.

import { DEV } from 'esm-env';
import { getAbortSignal, untrack } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { REASONS, ScopedTimeout } from '@sveltery/utils';
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
import { getHighlightReason } from '../internal/getHighlightReason.js';
import { mergeProps } from '../internal/mergeProps.js';
import { FOCUSABLE_POPUP_PROPS } from '../internal/popups/index.js';
import { TYPEAHEAD_RESET_MS } from './constants.js';
import { findMenuRoot, setMenuRoot, type MenuRootContext } from './context.svelte.js';
import { MenuFilter, type MenuFilterProviderContext } from './filter-root.svelte.js';
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
	/** The `Menu.FilterProvider` this root consumed, which makes it filterable. */
	filter?: MenuFilterProviderContext | null;
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

	const filterProvider = options.filter ?? null;
	const virtualFocus = filterProvider != null;
	// A filter that highlights automatically keeps the arrow keys in the list.
	const allowEscape = () => !(filterProvider?.autoHighlight ?? false);
	const resetOnPointerLeave = () => filterProvider?.autoHighlight !== 'always';

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
		instantType: seededInstantType,
		virtualFocus
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
		bubbles: { escapeKey: options.readCloseParentOnEsc() && store.parent.type === 'menu' },
		outsidePress: () =>
			store.parent.type !== 'context-menu' ||
			store.openEvent?.type === 'contextmenu' ||
			allowOutsidePressDismissal
	}));

	const direction = useDirection();
	const listNavigation = new ListNavigation(store, () => {
		const current = store.parent;
		const orientation = options.readOrientation();
		const loopFocus = options.readLoopFocus();
		return {
			enabled: !store.disabled,
			items: () => store.items.elements,
			activeIndex: store.activeIndex,
			virtual: virtualFocus,
			nested: current.type === 'menubar' || (!virtualFocus && current.type !== undefined),
			parentOrientation: current.type === 'menubar' ? current.context.orientation : undefined,
			loopFocus,
			// Keyboard opens highlight an item as in a plain menu. The input stays in the arrow
			// loop unless the filter highlights automatically.
			focusItemOnOpen: virtualFocus ? store.keyboardOpen : undefined,
			allowEscape: virtualFocus && loopFocus && allowEscape(),
			orientation,
			// A virtual list navigates on either axis, but its trigger opens on the vertical one.
			triggerOrientation: virtualFocus ? 'vertical' : orientation,
			rtl: direction.direction === 'rtl',
			disabledIndices: [],
			onNavigate(index, event) {
				store.setActiveIndex(index, getHighlightReason(event), event);
			},
			// A filterable submenu opens from the keyboard through its own navigation handlers.
			openOnArrowKeyDown: current.type !== 'context-menu' && !(virtualFocus && options.isSubmenu),
			nestedReturnFocus:
				current.type === 'menu' ? () => current.store.focusOwner ?? null : undefined,
			focusItemOnHover: store.highlightItemOnHover,
			resetOnPointerLeave: resetOnPointerLeave()
		};
	});

	const typeahead = new Typeahead(store, () => ({
		// The input owns typing under virtual focus. Typeahead would race the query.
		enabled: !store.disabled && !virtualFocus,
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

	// Under virtual focus the input takes the navigation's reference props
	// (`aria-activedescendant` and the key handling), and the trigger keeps the props that open.
	// Focusing the trigger while open must not seed the virtual highlight.
	const openTriggerProps = $derived.by((): Props => {
		if (!virtualFocus) return listNavigation.reference;
		const { onfocus: _onfocus, ...rest } = listNavigation.trigger;
		return rest;
	});

	const activeTriggerProps = $derived(
		mergeProps(typeahead.reference, openTriggerProps, dismiss.reference, {
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
		get inputProps() {
			return virtualFocus ? listNavigation.reference : {};
		},
		popupKeyDown
	};
	store.interactions = interactions;

	const context: MenuRootContext = {
		store,
		parent,
		get orientation() {
			return options.readOrientation();
		},
		get loopFocus() {
			return options.readLoopFocus();
		},
		get allowEscape() {
			return allowEscape();
		}
	};
	setMenuRoot(context);

	if (filterProvider) {
		store.filter = new MenuFilter(store, {
			provider: filterProvider,
			id: options.id,
			keys: {
				store,
				get orientation() {
					return options.readOrientation();
				},
				get rtl() {
					return direction.direction === 'rtl';
				}
			}
		});
	}

	$effect(() => {
		const handle = options.readHandle();
		if (!handle) return;
		return handle.attach(store as never);
	});

	return store;
}
