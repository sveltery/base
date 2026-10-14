// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/hooks/useListNavigation.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Grid navigation is injected through `grid`. Each upstream layout effect reads its dependency list through
// `$derived` fields and runs its body untracked, so a prop it does not list never re-runs it.

import { untrack } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { isHTMLElement } from '@floating-ui/utils/dom';
import {
	activeElement,
	contains,
	createChangeEventDetails,
	getTarget,
	ownerDocument,
	platform,
	REASONS,
	ScopedAnimationFrame,
	warn
} from '@sveltery/utils';
import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import { useFloatingParentNodeId, useFloatingTree } from '../components/FloatingTree.svelte.js';
import type { FloatingTreeStore } from '../components/FloatingTreeStore.js';
import { isTypeableElement } from '../utils/element.js';
import { isVirtualClick, isVirtualPointerEvent, stopEvent } from '../utils/event.js';
import { enqueueFocus } from '../utils/enqueueFocus.js';
import { getFloatingFocusElement, isTypeableCombobox } from '../utils/focusTarget.js';
import {
	getMaxListIndex,
	getMinListIndex,
	getNextListIndex,
	isIndexOutOfListBounds,
	type DisabledIndices
} from '../utils/listIndex.js';
import {
	isCrossOrientationCloseKey,
	isCrossOrientationOpenKey,
	isMainOrientationKey,
	isMainOrientationToEndKey,
	readListOrientation,
	registerListOrientation,
	type ListOrientation
} from '../utils/listOrientation.js';

export interface UseListNavigationProps {
	/** The list items, by index. Read on every use. */
	items: () => ReadonlyArray<HTMLElement | null>;
	/** The active (focused or highlighted) item, which may or may not be selected. */
	activeIndex: number | null;
	onNavigate?: (index: number | null, event: Event | undefined) => void;
	/** @default true */
	enabled?: boolean;
	/** @default null */
	selectedIndex?: number | null;
	/**
	 * Whether to focus an item when the floating element opens. `'auto'` infers it from the
	 * opening input.
	 * @default 'auto'
	 */
	focusItemOnOpen?: boolean | 'auto';
	/** @default true */
	focusItemOnHover?: boolean;
	/** @default true */
	openOnArrowKeyDown?: boolean;
	/**
	 * Indices to skip. Without it, items with `disabled` or `aria-disabled="true"` are skipped.
	 * Pass an empty array to keep `aria-disabled` items navigable.
	 */
	disabledIndices?: DisabledIndices;
	/** Whether navigating past either end leaves the list. Needs `loopFocus` and `virtual`. */
	allowEscape?: boolean;
	/** @default false */
	loopFocus?: boolean;
	/** @default false */
	nested?: boolean;
	/** The parent list's orientation when the floating tree cannot provide it. */
	parentOrientation?: ListOrientation;
	/** @default false */
	rtl?: boolean;
	/** Keep focus on the reference and point at the item with `aria-activedescendant`. */
	virtual?: boolean;
	/** @default 'vertical' */
	orientation?: ListOrientation;
	/** The orientation used to open the list from its trigger. Defaults to `orientation`. */
	triggerOrientation?: ListOrientation;
	/** Prefix of each item id under `virtual`. */
	id?: string;
	/** @default true */
	resetOnPointerLeave?: boolean;
	/** The floating tree to use when context has none. */
	externalTree?: FloatingTreeStore;
	/** Focus target when a nested list returns to a virtually focused parent. */
	nestedReturnFocus?: () => HTMLElement | null;
	/** Two-dimensional navigation for grid-capable consumers, such as `gridNavigation`. */
	grid?: GridNavigator;
}

/** Returns the next index, or `prevIndex` for a key it does not handle. */
export type GridNavigator = (
	event: KeyboardEvent,
	prevIndex: number,
	items: ReadonlyArray<HTMLElement | null>,
	orientation: ListOrientation,
	loopFocus: boolean,
	rtl: boolean,
	disabledIndices: DisabledIndices | undefined,
	minIndex: number,
	maxIndex: number
) => number | undefined;

type Props = HTMLAttributes<HTMLElement>;

// WebKit fires zero-delta mousemove and pointermove events when the list scrolls beneath a
// stationary pointer, which would move the highlight during keyboard navigation.
function isStationaryWebKitPointer(event: MouseEvent) {
	return platform.engine.webkit && event.movementX === 0 && event.movementY === 0;
}

export class ListNavigation {
	readonly #contextTree = useFloatingTree();
	readonly #contextParentId = useFloatingParentNodeId();
	readonly #focusFrame = new ScopedAnimationFrame();
	readonly #waitForListPopulatedFrame = new ScopedAnimationFrame();

	readonly #open: boolean;
	readonly #enabled: boolean;
	readonly #activeIndex: number | null;
	readonly #selectedIndex: number | null;
	readonly #focusItemOnOpenProp: boolean | 'auto';
	readonly #nested: boolean;
	readonly #rtl: boolean;
	readonly #virtual: boolean;
	readonly #triggerOrientation: ListOrientation;
	readonly #tree: FloatingTreeStore | null;

	#focusItemOnOpen: boolean | 'auto';
	#index: number;
	#key: string | null = null;
	#isPointerModality = true;
	#previousOpen: boolean;
	#previousMounted: boolean;
	#forceSyncFocus = false;
	#forceScrollIntoView = false;
	#cancelQueuedFocus: (() => void) | null = null;

	// `useFloatingNodeId` publishes this list's own node id as the parent id for the rest of the
	// component, so a list built after it reads its own id from context.
	#parentId() {
		const own = this.store.nodeId;
		if (own == null || own !== this.#contextParentId) return this.#contextParentId;
		return this.#tree?.nodes.find((node) => node.id === own)?.parentId ?? null;
	}

	constructor(
		private readonly store: FloatingRootStore,
		private readonly props: () => UseListNavigationProps
	) {
		this.#open = $derived(store.isOpen());
		this.#enabled = $derived(props().enabled ?? true);
		this.#activeIndex = $derived(props().activeIndex);
		this.#selectedIndex = $derived(props().selectedIndex ?? null);
		this.#focusItemOnOpenProp = $derived(props().focusItemOnOpen ?? 'auto');
		this.#nested = $derived(props().nested ?? false);
		this.#rtl = $derived(props().rtl ?? false);
		this.#virtual = $derived(props().virtual ?? false);
		this.#triggerOrientation = $derived.by(() => {
			const value = props();
			return value.triggerOrientation ?? value.orientation ?? 'vertical';
		});
		this.#tree = $derived(props().externalTree ?? this.#contextTree);

		const initial = untrack(() => this.#options());
		if (initial.allowEscape && !initial.loopFocus) {
			warn('`ListNavigation` looping must be enabled to allow escaping.');
		}
		if (initial.allowEscape && !initial.virtual) {
			warn('`ListNavigation` must be virtual to allow escaping.');
		}
		if (initial.orientation === 'vertical' && initial.grid) {
			warn(
				'In grid list navigation mode, the `orientation` should be either "horizontal" or "both".'
			);
		}
		this.#focusItemOnOpen = initial.focusItemOnOpen;
		this.#index = initial.selectedIndex ?? -1;
		this.#previousOpen = untrack(() => store.isOpen());
		this.#previousMounted = untrack(() => store.floatingElement != null);
		registerListOrientation(store, () => this.#options().orientation);

		$effect(() => {
			const open = this.#open;
			const focusItemOnOpen = this.#focusItemOnOpenProp;
			if (!open) this.#key = null;
			// Keep an inferred 'auto' value from the trigger event. Apply a boolean before the
			// initial highlight is synchronized.
			if (!open || focusItemOnOpen !== 'auto') this.#focusItemOnOpen = focusItemOnOpen;
		});

		// Sync `selectedIndex` to the active index on open. Reset the active index on close.
		$effect(() => {
			if (!this.#enabled) return;
			const open = this.#open;
			const floating = this.store.floatingElement;
			const selectedIndex = this.#selectedIndex;
			untrack(() => {
				if (open && floating) {
					this.#index = selectedIndex ?? -1;
					if (this.#focusItemOnOpen && selectedIndex != null) {
						// Bring the selected item into view on open, whatever the pointer modality.
						this.#forceScrollIntoView = true;
						this.#navigate();
					}
				} else if (this.#previousMounted) {
					this.#index = -1;
					this.#navigate();
				}
			});
		});

		// Sync the focused item to the active index while open.
		$effect(() => {
			if (!this.#enabled) return;
			if (!this.#open) {
				this.#forceSyncFocus = false;
				return;
			}
			const floating = this.store.floatingElement;
			if (!floating) return;
			const activeIndex = this.#activeIndex;
			const nested = this.#nested;
			const triggerOrientation = this.#triggerOrientation;
			const rtl = this.#rtl;
			untrack(() => this.#syncActiveIndex(activeIndex, nested, triggerOrientation, rtl));
		});

		// When a nested child closes, focus the parent floating element so arrow keys keep
		// working after the pointer leaves the child.
		$effect(() => {
			if (!this.#enabled) return;
			const floating = this.store.floatingElement;
			const reference = this.store.domReferenceElement;
			const tree = this.#tree;
			const virtual = this.#virtual;
			if (floating || !tree || virtual) return;
			untrack(() => {
				if (!this.#previousMounted) return;
				const nodes = tree.nodes;
				const parent = nodes.find((node) => node.id === this.#parentId())?.context?.floatingElement;
				const activeEl = activeElement(ownerDocument(reference ?? parent ?? null));
				const treeContainsActiveEl = nodes.some(
					(node) => node.context && contains(node.context.floatingElement, activeEl)
				);
				if (parent && !treeContainsActiveEl && this.#isPointerModality) {
					parent.focus({ preventScroll: true });
				}
			});
		});

		// Runs after the effects above in the same flush, so they read the values of the last one.
		$effect(() => {
			this.#previousOpen = this.#open;
			this.#previousMounted = this.store.floatingElement != null;
		});
	}

	#options() {
		const props = this.props();
		const orientation = props.orientation ?? 'vertical';
		return {
			items: props.items,
			activeIndex: props.activeIndex,
			onNavigate: props.onNavigate,
			enabled: props.enabled ?? true,
			selectedIndex: props.selectedIndex ?? null,
			allowEscape: props.allowEscape ?? false,
			loopFocus: props.loopFocus ?? false,
			nested: props.nested ?? false,
			rtl: props.rtl ?? false,
			virtual: props.virtual ?? false,
			focusItemOnOpen: props.focusItemOnOpen ?? 'auto',
			focusItemOnHover: props.focusItemOnHover ?? true,
			openOnArrowKeyDown: props.openOnArrowKeyDown ?? true,
			disabledIndices: props.disabledIndices,
			orientation,
			triggerOrientation: props.triggerOrientation ?? orientation,
			parentOrientation: props.parentOrientation,
			id: props.id,
			resetOnPointerLeave: props.resetOnPointerLeave ?? true,
			nestedReturnFocus: props.nestedReturnFocus,
			grid: props.grid
		};
	}

	#navigate(event?: Event) {
		const onNavigate = untrack(() => this.props().onNavigate);
		onNavigate?.(this.#index === -1 ? null : this.#index, event);
	}

	#floatingFocusElement() {
		return getFloatingFocusElement(this.store.floatingElement);
	}

	#parentOrientation() {
		const { parentOrientation } = this.#options();
		if (parentOrientation) return parentOrientation;
		const parent = this.#tree?.nodes.find((node) => node.id === this.#parentId());
		return readListOrientation(parent?.context);
	}

	#focusItem() {
		// Synchronous navigation must also supersede deferred focus from an earlier update.
		this.#focusFrame.cancel();
		const { items, virtual } = this.#options();

		const runFocus = (item: HTMLElement) => {
			if (virtual) return;
			this.#cancelQueuedFocus = enqueueFocus(item, {
				sync: this.#forceSyncFocus,
				preventScroll: true,
				// A close (Tab, Escape) can land before the queued frame; drop the focus then.
				shouldFocus: () => this.store.isOpen()
			});
		};

		const initialItem = items()[this.#index];
		const forceScrollIntoView = this.#forceScrollIntoView;
		if (initialItem) runFocus(initialItem);

		const settle = () => {
			const waitedItem = items()[this.#index] || initialItem;
			if (!waitedItem) return;
			if (!initialItem) runFocus(waitedItem);
			if (forceScrollIntoView || !this.#isPointerModality) {
				waitedItem.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
			}
		};

		if (this.#forceSyncFocus) settle();
		else this.#focusFrame.request(settle);
	}

	#syncActiveIndex(
		activeIndex: number | null,
		nested: boolean,
		triggerOrientation: ListOrientation,
		rtl: boolean
	) {
		const { items } = this.#options();

		if (activeIndex == null) {
			this.#forceSyncFocus = false;
			if (this.#options().selectedIndex != null) return;

			// The list changed while open.
			if (this.#previousMounted) {
				this.#index = -1;
				this.#focusItem();
			}

			const focusItemOnOpen = this.#focusItemOnOpen;
			const initialSync =
				(!this.#previousOpen || !this.#previousMounted) &&
				focusItemOnOpen &&
				(this.#key != null || focusItemOnOpen === true);
			if (!initialSync) return;

			let runs = 0;
			const waitForListPopulated = () => {
				const list = items();
				if (list[0] == null) {
					// Try once before paint, then once on the next frame. More means something is wrong.
					if (runs === 0) queueMicrotask(waitForListPopulated);
					else if (runs === 1) this.#waitForListPopulatedFrame.request(waitForListPopulated);
					runs += 1;
					return;
				}
				// `disabledIndices` is left out so attribute-disabled items are skipped on open even
				// when the consumer passes an empty array (mui/base-ui#2604). The key came from the
				// trigger, so it is read on the trigger's orientation.
				const key = this.#key;
				this.#index =
					key == null || isMainOrientationToEndKey(key, triggerOrientation, rtl) || nested
						? getMinListIndex(list)
						: getMaxListIndex(list);
				this.#key = null;
				this.#navigate();
			};
			waitForListPopulated();
		} else if (!isIndexOutOfListBounds(items(), activeIndex)) {
			this.#index = activeIndex;
			this.#focusItem();
			this.#forceScrollIntoView = false;
		}
	}

	#syncCurrentTarget(event: Event) {
		if (!this.store.isOpen()) return;
		const { items, activeIndex } = this.#options();
		const index = items().indexOf(event.currentTarget as HTMLElement);
		if (index !== -1 && (this.#index !== index || activeIndex !== index)) {
			this.#index = index;
			this.#navigate(event);
		}
	}

	#commonOnKeyDown(event: KeyboardEvent) {
		this.#isPointerModality = false;
		this.#forceSyncFocus = true;

		// Chrome fires ArrowDown twice while composing a character. `isComposing` is avoided
		// because Safari does not support it properly.
		if (event.which === 229) return;

		// Ignore navigation while the floating element animates out. Otherwise the active index is
		// set to 0 while closed and the next ArrowDown does not focus the first item.
		const currentTarget = event.currentTarget as HTMLElement;
		if (!this.store.isOpen() && currentTarget === this.#floatingFocusElement()) return;

		const {
			items,
			activeIndex,
			nested,
			orientation,
			rtl,
			virtual,
			loopFocus,
			allowEscape,
			disabledIndices,
			nestedReturnFocus,
			grid
		} = this.#options();

		if (nested && isCrossOrientationCloseKey(event.key, orientation, rtl, grid != null)) {
			// When the close key also navigates the parent, let the parent see it.
			if (!isMainOrientationKey(event.key, this.#parentOrientation())) stopEvent(event);
			this.store.setOpen(false, createChangeEventDetails(REASONS.listNavigation, event));
			const returnElement = nestedReturnFocus?.() ?? this.store.domReferenceElement;
			if (isHTMLElement(returnElement)) returnElement.focus();
			return;
		}

		const list = items();

		// The consumer owns `activeIndex` and may decline a proposed navigation, which produces no
		// update. Reconcile here so this key moves from the rendered highlight.
		if (
			activeIndex != null &&
			activeIndex !== this.#index &&
			!isIndexOutOfListBounds(list, activeIndex)
		) {
			this.#index = activeIndex;
		}

		const currentIndex = this.#index;
		const minIndex = getMinListIndex(list, disabledIndices);
		const maxIndex = getMaxListIndex(list, disabledIndices);

		if (!isTypeableCombobox(this.store.domReferenceElement)) {
			if (event.key === 'Home') {
				stopEvent(event);
				this.#index = minIndex;
				this.#navigate(event);
			}
			if (event.key === 'End') {
				stopEvent(event);
				this.#index = maxIndex;
				this.#navigate(event);
			}
		}

		if (grid) {
			const index = grid(
				event,
				this.#index,
				list,
				orientation,
				loopFocus,
				rtl,
				disabledIndices,
				minIndex,
				maxIndex
			);
			// An unhandled key returns the current index. Reporting it would re-emit the highlight.
			if (index != null && index !== this.#index) {
				this.#index = index;
				this.#navigate(event);
			}
			if (orientation === 'both') return;
		}

		if (!isMainOrientationKey(event.key, orientation)) return;
		stopEvent(event);

		// With focus on a container inside the popup and not on an item, start from the boundary.
		// Keys bubbling from a portaled nested popup are not in this DOM and navigate normally.
		const focusedElement = activeElement(ownerDocument(currentTarget));
		if (
			this.store.isOpen() &&
			!virtual &&
			contains(currentTarget, focusedElement) &&
			!list.some((item) => item != null && contains(item, focusedElement))
		) {
			this.#index = isMainOrientationToEndKey(event.key, orientation, rtl) ? minIndex : maxIndex;
			this.#navigate(event);
			// The boundary item may already be active, so no update would move focus to it.
			if (activeIndex === this.#index) this.#focusItem();
			return;
		}

		const { index, wrapped } = getNextListIndex(list, currentIndex, {
			decrement: !isMainOrientationToEndKey(event.key, orientation, rtl),
			loopFocus,
			allowEscape,
			disabledIndices,
			minIndex,
			maxIndex
		});
		// Give virtualizers a frame to update the list.
		if (wrapped) this.#forceSyncFocus = false;
		this.#index = index;
		this.#navigate(event);
	}

	#activeDescendant(): Props {
		const { virtual, id, activeIndex } = this.#options();
		if (!virtual || !this.store.isOpen() || activeIndex == null) return {};
		return { 'aria-activedescendant': `${id}-${activeIndex}` };
	}

	readonly #itemProps: Props = {
		onfocus: (event) => {
			this.#forceSyncFocus = true;
			this.#syncCurrentTarget(event);
		},
		onclick: (event) => {
			// Safari. Virtual focus keeps real focus on the reference.
			if (!this.#options().virtual) event.currentTarget.focus({ preventScroll: true });
		},
		onmousemove: (event) => {
			if (isStationaryWebKitPointer(event)) return;
			this.#forceSyncFocus = true;
			this.#forceScrollIntoView = false;
			if (this.#options().focusItemOnHover) this.#syncCurrentTarget(event);
		},
		onpointerleave: (event) => {
			if (!this.store.isOpen() || !this.#isPointerModality || event.pointerType === 'touch') {
				return;
			}
			this.#forceSyncFocus = true;

			const { items, focusItemOnHover, resetOnPointerLeave, virtual } = this.#options();
			const relatedTarget = event.relatedTarget as HTMLElement | null;
			if (!focusItemOnHover || items().includes(relatedTarget)) return;
			if (!resetOnPointerLeave) return;

			this.#cancelQueuedFocus?.();
			this.#cancelQueuedFocus = null;
			this.#index = -1;
			this.#navigate(event);

			if (!virtual) {
				const floatingFocusEl = this.#floatingFocusElement();
				const activeEl = activeElement(ownerDocument(floatingFocusEl));
				if (floatingFocusEl && contains(floatingFocusEl, activeEl)) {
					floatingFocusEl.focus({ preventScroll: true });
				}
			}
		}
	};

	readonly #floatingHandlers: Props = {
		onkeydown: (event) => {
			const { virtual, nestedReturnFocus } = this.#options();
			// Shift+Tab closes a submenu.
			if (event.key === 'Tab' && event.shiftKey && this.store.isOpen() && !virtual) {
				// A nested element such as a Dialog opened from the menu handles its own Tab.
				const target = getTarget(event) as Element | null;
				if (target && !contains(this.#floatingFocusElement(), target)) return;

				stopEvent(event);
				const details = createChangeEventDetails(REASONS.focusOut, event);
				this.store.setOpen(false, details);
				const returnElement = nestedReturnFocus?.() ?? this.store.domReferenceElement;
				if (!details.isCanceled && isHTMLElement(returnElement)) returnElement.focus();
				return;
			}
			this.#commonOnKeyDown(event);
		},
		onpointermove: (event) => {
			if (isStationaryWebKitPointer(event)) return;
			this.#isPointerModality = true;
		}
	};

	#checkVirtualMouse = (event: MouseEvent) => {
		const { focusItemOnOpen, virtual } = this.#options();
		if (focusItemOnOpen === 'auto' && isVirtualClick(event)) this.#focusItemOnOpen = !virtual;
	};

	#checkVirtualPointer = (event: PointerEvent) => {
		// `pointerdown` fires first. Reset the state, then check.
		const { focusItemOnOpen } = this.#options();
		this.#focusItemOnOpen = focusItemOnOpen;
		if (focusItemOnOpen === 'auto' && isVirtualPointerEvent(event)) this.#focusItemOnOpen = true;
	};

	#openOnNavigationKeyDown(event: KeyboardEvent) {
		this.store.setOpen(
			true,
			createChangeEventDetails(REASONS.listNavigation, event, event.currentTarget as HTMLElement)
		);
	}

	readonly #triggerHandlers: Props = {
		onkeydown: (event) => {
			const currentOpen = this.store.isOpen();
			this.#isPointerModality = false;

			const { nested, orientation, triggerOrientation, rtl, virtual, openOnArrowKeyDown } =
				this.#options();
			const parentOrientation = this.#parentOrientation();
			const isArrowKey = event.key.startsWith('Arrow');
			const isParentCrossOpenKey = isCrossOrientationOpenKey(event.key, parentOrientation, rtl);
			const isMainKey = isMainOrientationKey(
				event.key,
				currentOpen ? orientation : triggerOrientation
			);
			const isNavigationKey =
				(nested ? isParentCrossOpenKey : isMainKey) ||
				event.key === 'Enter' ||
				event.key.trim() === '';

			if (virtual && currentOpen && (!nested || isTypeableElement(event.currentTarget))) {
				this.#commonOnKeyDown(event);
				return;
			}

			// A list that does not open on arrow keys keeps its active index unset while closed.
			if (!currentOpen && !openOnArrowKeyDown && isArrowKey) return;

			if (isNavigationKey) {
				const isParentMainKey = isMainOrientationKey(event.key, parentOrientation);
				this.#key = nested && isParentMainKey ? null : event.key;
			}

			if (nested) {
				if (isParentCrossOpenKey) {
					stopEvent(event);
					if (currentOpen) {
						const { items, disabledIndices } = this.#options();
						this.#index = getMinListIndex(items(), disabledIndices);
						this.#navigate(event);
						if (virtual) this.#floatingFocusElement()?.focus();
					} else {
						this.#openOnNavigationKeyDown(event);
					}
				}
				return;
			}

			if (isMainKey) {
				const { selectedIndex } = this.#options();
				if (selectedIndex != null) this.#index = selectedIndex;
				stopEvent(event);
				if (!currentOpen && openOnArrowKeyDown) this.#openOnNavigationKeyDown(event);
				else this.#commonOnKeyDown(event);
				if (currentOpen) this.#navigate(event);
			}
		},
		onfocus: (event) => {
			if (this.store.isOpen() && !this.#options().virtual) {
				this.#index = -1;
				this.#navigate(event);
			}
		},
		onpointerdown: this.#checkVirtualPointer,
		onpointerenter: this.#checkVirtualPointer,
		onmousedown: this.#checkVirtualMouse,
		onclick: this.#checkVirtualMouse
	};

	get reference(): Props {
		if (!this.#enabled) return {};
		return { ...this.#activeDescendant(), ...this.#triggerHandlers };
	}

	get floating(): Props {
		if (!this.#enabled) return {};
		const activeDescendant = isTypeableCombobox(this.store.domReferenceElement)
			? {}
			: this.#activeDescendant();
		return { ...activeDescendant, ...this.#floatingHandlers };
	}

	get item(): Props {
		return this.#enabled ? this.#itemProps : {};
	}

	get trigger(): Props {
		return this.#enabled ? this.#triggerHandlers : {};
	}
}
