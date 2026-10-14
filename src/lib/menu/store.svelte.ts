// Derived from Base UI v1.9.0 packages/react/src/menu/store/MenuStore.ts and the `setOpen`
// of packages/react/src/menu/root/MenuRoot.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// ReactStore state becomes `$state` fields. Selectors that read `parent` become getters over
// the `MenuParent` union. The item registry is one `ElementList` in place of
// `itemDomElements`, `itemLabels` and `CompositeList`. The filter state (`listElement`,
// `inputProps`, `highlightedItem`, `filterTriggerProps`) is not ported.
// Trigger-owned values (payload, close delay) are read from the active trigger, as Popover does.

import type { Middleware } from '@floating-ui/dom';
import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { HTMLAttributes } from 'svelte/elements';
import {
	REASONS,
	createChangeEventDetails,
	createGenericEventDetails,
	ScopedTimeout
} from '@sveltery/utils';
import type { FloatingTreeStore } from '@sveltery/floating-ui-svelte';
import { runOnceAnimationsFinish } from '../internal/animations-finished.js';
import { ElementList } from '../internal/element-list.svelte.js';
import { PopupStore } from '../internal/popups/store.svelte.js';
import type { AnchorPositioning } from '../internal/popups/index.js';
import { PATIENT_CLICK_THRESHOLD, isKeyboardClick, isKeyboardOpen } from './constants.js';
import type { MenuParent, MouseUpGate } from './parent.svelte.js';
import type {
	MenuChangeEventDetails,
	MenuChangeReason,
	MenuHighlightEventDetails,
	MenuHighlightReason,
	MenuInstant
} from './types.js';

export interface MenuItemRecord {
	/** The `label` prop, or the item's text content. Typeahead matches against it. */
	label: string | null;
}

export interface TriggerOwned {
	payload: unknown;
	closeDelay: number;
}

type Props = HTMLAttributes<HTMLElement>;

/** Interaction props the root builds and the trigger, popup, and items spread. */
export interface MenuInteractions {
	readonly activeTriggerProps: Props;
	readonly inactiveTriggerProps: Props;
	readonly popupProps: Props;
	readonly itemProps: Props;
	/** Runs the popup's keyboard handling for a key a portaled submenu did not handle. */
	popupKeyDown(event: KeyboardEvent): void;
}

export interface MenuStoreOptions {
	readOpen: () => boolean | undefined;
	writeOpen: (open: boolean) => void;
	floatingId: string;
	nested: boolean;
	parent: MenuParent;
	rootId: string;
	tree: FloatingTreeStore | null;
	parentNodeId: string | null;
	readDisabled: () => boolean;
	readModal: () => boolean | undefined;
	readHighlightItemOnHover: () => boolean;
	readTriggerId: () => string | null | undefined;
	writeTriggerId: (id: string | null) => void;
	onOpenChange: () => ((open: boolean, details: MenuChangeEventDetails) => void) | undefined;
	onOpenChangeComplete: () => ((open: boolean) => void) | undefined;
	onItemHighlighted: () =>
		((item: HTMLElement | undefined, details: MenuHighlightEventDetails) => void) | undefined;
	animateInitialOpen?: boolean;
	instantType?: MenuInstant;
}

const GROUP_REASONS: ReadonlySet<string> = new Set([
	REASONS.triggerFocus,
	REASONS.focusOut,
	REASONS.triggerHover,
	REASONS.listNavigation,
	REASONS.siblingOpen
]);

export class MenuStore extends PopupStore<MenuChangeReason> {
	/** Where the root sits. A menubar trigger can replace it while it owns the menu. */
	parent = $state.raw<MenuParent>({ type: undefined });
	readonly ownRootId: string;
	private readonly ownTree: FloatingTreeStore | null;
	private readonly ownParentNodeId: string | null;
	/** Every item of this menu, in document order. */
	readonly items = new ElementList<HTMLElement, MenuItemRecord>();
	activeIndex = $state<number | null>(null);
	/** Whether the popup last opened from the keyboard or an assistive-technology press. */
	keyboardOpen = $state(false);
	/** Set once the pointer moves over the trigger or popup. Hover-opening submenus wait for it. */
	allowMouseEnter = $state(false);
	hoverEnabled = $state(true);
	stickIfOpen = $state(false);
	instantType = $state<MenuInstant | undefined>(undefined);
	openChangeReason = $state<MenuChangeReason | null>(null);
	/** Physical side from the positioner. Safe-polygon reads it while open. */
	/** The mounted positioner. Hover close reads its side. */
	positioning = $state.raw<AnchorPositioning | null>(null);

	get placement(): string {
		return this.positioning?.physicalSide ?? 'bottom';
	}
	adaptiveOrigin = $state.raw<Middleware | undefined>(undefined);
	positionerVars = $state<Record<string, string>>({});
	popupVars = $state<Record<string, string>>({});
	/** Bumps when an open menu changes trigger. The viewport snapshots on it. */
	triggerSwitch = $state(0);
	switchedFrom = $state<Element | null>(null);
	/** Set by a trigger in a menubar so a detached popup can forward keys to the menubar. */
	ownKeyboardEventRelay = $state.raw<((event: KeyboardEvent) => void) | undefined>(undefined);
	interactions = $state.raw<MenuInteractions | null>(null);
	/** Whether a typeahead session is in progress. Space then types instead of clicking. */
	typing = false;
	/** The event that last opened or closed the menu. */
	openEvent: Event | undefined = undefined;

	/** Why the next `activeIndex` write happens, consumed by `onItemHighlighted`. */
	private highlightReason: MenuHighlightReason = REASONS.none;
	private highlightEvent: Event | undefined = undefined;
	/** The item last reported as highlighted, so reasons compare against it. */
	private reportedItem: HTMLElement | undefined = undefined;
	private lastHighlightIndex = -1;

	private readonly ownMouseUpGate: MouseUpGate = { allow: false };
	private readonly readDisabled: () => boolean;
	private readonly readModal: () => boolean | undefined;
	private readonly readHighlightItemOnHover: () => boolean;
	private readonly readTriggerId: () => string | null | undefined;
	private readonly writeTriggerIdValue: (id: string | null) => void;
	private readonly readOnItemHighlighted: MenuStoreOptions['onItemHighlighted'];
	private readonly readers = new SvelteMap<string, () => TriggerOwned>();
	private readonly stickTimeout = new ScopedTimeout();
	private readonly touchCloseTimeout = new ScopedTimeout();
	private allowTouchToClose = true;
	/** Id written for this open. Survives a bound trigger id that the parent sets back. */
	private claimedTriggerId: string | null = null;
	private openedFrom: Element | null = null;
	private triggerChangeAbort: AbortController | null = null;

	constructor(options: MenuStoreOptions) {
		super({
			readOpen: options.readOpen,
			writeOpen: options.writeOpen,
			floatingId: options.floatingId,
			floatingElement: 'popup',
			nested: options.nested,
			onOpenChange: options.onOpenChange as never,
			onOpenChangeComplete: options.onOpenChangeComplete,
			animateInitialOpen: options.animateInitialOpen
		});
		this.parent = options.parent;
		this.ownRootId = options.rootId;
		this.ownTree = options.tree;
		this.ownParentNodeId = options.parentNodeId;
		this.instantType = options.instantType;
		this.readDisabled = options.readDisabled;
		this.readModal = options.readModal;
		this.readHighlightItemOnHover = options.readHighlightItemOnHover;
		this.readTriggerId = options.readTriggerId;
		this.writeTriggerIdValue = options.writeTriggerId;
		this.readOnItemHighlighted = options.onItemHighlighted;

		$effect.pre(() => {
			if (this.open) return;
			if (!this.hoverEnabled) this.hoverEnabled = true;
			this.stickTimeout.clear();
			this.stickIfOpen = false;
			this.openEvent = undefined;
			this.triggerChangeAbort?.abort();
			// `trigger-change` belongs to the open cycle that scheduled it.
			if (untrack(() => this.instantType) === 'trigger-change') this.instantType = undefined;
		});

		$effect.pre(() => {
			if (!this.mounted) this.allowMouseEnter = false;
		});

		// Upstream useImplicitActiveTrigger: a trigger id set from outside while open anchors the
		// menu to that trigger.
		$effect(() => {
			if (!this.open) return;
			const id = this.readTriggerId();
			const element = id ? this.triggers.getById(id) : undefined;
			if (element && element !== untrack(() => this.domReferenceElement)) {
				this.domReferenceElement = element;
			}
		});

		// The open of this menu commits, or the registry settles under the same index.
		$effect(() => {
			void this.activeIndex;
			void this.items.elements;
			untrack(() => this.syncHighlightedItem());
		});

		$effect(() => {
			return () => {
				this.stickTimeout.clear();
				this.touchCloseTimeout.clear();
				this.triggerChangeAbort?.abort();
			};
		});
	}

	protected override preventUnmountTiming(): 'immediate' | 'deferred' {
		return 'deferred';
	}

	get disabled(): boolean {
		const parent = this.parent;
		if (parent.type === 'menubar') return parent.context.disabled || this.readDisabled();
		return this.readDisabled();
	}

	/** Only root and context menus are modal. */
	get modal(): boolean {
		const type = this.parent.type;
		return (type === undefined || type === 'context-menu') && (this.readModal() ?? true);
	}

	get highlightItemOnHover() {
		return this.readHighlightItemOnHover();
	}

	/**
	 * Upstream `floatingTreeRoot`: the tree the menu emits its open changes on. A detached menu
	 * takes its menubar's tree while a menubar trigger owns it, so its siblings and the menubar
	 * hear it.
	 */
	get tree(): FloatingTreeStore | null {
		const parent = this.parent;
		if (parent.type === 'menu') return parent.store.tree;
		if (parent.type === 'menubar') return parent.context.floatingTree;
		return this.ownTree;
	}

	/** Upstream `floatingParentNodeId`, forwarded with the tree. */
	get parentNodeId(): string | null {
		const parent = this.parent;
		if (parent.type === 'menubar') return parent.context.nodeId;
		return this.ownParentNodeId;
	}

	get rootId(): string | undefined {
		const parent = this.parent;
		if (parent.type === 'menu') return parent.store.rootId;
		if (parent.type !== undefined) return parent.context.rootId;
		return this.ownRootId;
	}

	get keyboardEventRelay(): ((event: KeyboardEvent) => void) | undefined {
		if (this.ownKeyboardEventRelay) return this.ownKeyboardEventRelay;
		const parent = this.parent;
		if (parent.type === 'menubar') return parent.context.relayKeyboardEvent;
		// A portaled submenu's keydown does not bubble into the parent popup. Forward it.
		if (parent.type === 'menu') return parent.store.interactions?.popupKeyDown;
		return undefined;
	}

	/** One flag per menu tree, shared with a menubar or context menu. */
	get mouseUpGate(): MouseUpGate {
		const parent = this.parent;
		if (parent.type === 'menu') return parent.store.mouseUpGate;
		if (parent.type === 'menubar' || parent.type === 'context-menu') {
			return parent.context.mouseUpGate;
		}
		return this.ownMouseUpGate;
	}

	/** Item labels by index, for typeahead. */
	labels(): (string | null)[] {
		return this.items.elements.map((element) => this.items.meta(element)?.label ?? null);
	}

	isActive(element: HTMLElement | null) {
		return (
			element != null &&
			this.activeIndex != null &&
			this.items.indexOf(element) === this.activeIndex
		);
	}

	triggerProps(active: boolean): Props {
		const interactions = this.interactions;
		if (!interactions) return {};
		return active ? interactions.activeTriggerProps : interactions.inactiveTriggerProps;
	}

	get popupProps(): Props {
		return this.interactions?.popupProps ?? {};
	}

	get itemProps(): Props {
		return this.interactions?.itemProps ?? {};
	}

	setActiveIndex(index: number | null, reason: MenuHighlightReason, event?: Event) {
		// Only a write that changes the index is reported. A write back to the reported item
		// reports `none`.
		if (this.activeIndex !== index) {
			const item = index === null ? undefined : this.items.elements[index];
			const isWriteBack = item === this.reportedItem;
			this.highlightReason = isWriteBack ? REASONS.none : reason;
			this.highlightEvent = isWriteBack ? undefined : event;
		}
		this.activeIndex = index;
	}

	highlightItem(element: Element | null, reason: MenuHighlightReason, event?: Event) {
		const index = this.items.indexOf(element as HTMLElement | null);
		if (index > -1) this.setActiveIndex(index, reason, event);
	}

	/** Reports the committed highlight once, with the reason of the write that produced it. */
	private syncHighlightedItem() {
		const index = this.activeIndex;
		const item = index === null ? undefined : (this.items.elements[index] ?? undefined);
		if (item?.isConnected === false) return;
		const itemIndex = item === undefined ? -1 : index!;
		if (this.lastHighlightIndex === itemIndex && this.reportedItem === item) return;
		this.lastHighlightIndex = itemIndex;
		this.reportedItem = item;
		const reason = this.highlightReason;
		const event = this.highlightEvent;
		this.highlightReason = REASONS.none;
		this.highlightEvent = undefined;
		const callback = this.readOnItemHighlighted();
		if (!callback) return;
		// Every `pointer` write comes from a mouse or pointer event, as the details type promises.
		const details = createGenericEventDetails(reason, event, {
			label: item === undefined ? undefined : (this.items.meta(item)?.label ?? undefined)
		}) as MenuHighlightEventDetails;
		callback(item, details);
	}

	/** Id the trigger was registered under. Falls back to the DOM id. */
	resolvedActiveTriggerId() {
		const registered = this.triggers.idOf(this.domReferenceElement);
		if (registered) return registered;
		const written = this.readTriggerId();
		if (written) return written;
		if (this.open && this.claimedTriggerId) return this.claimedTriggerId;
		return this.domReferenceElement?.id || null;
	}

	writeTriggerId(id: string | null) {
		this.claimedTriggerId = id;
		if ((this.readTriggerId() ?? null) === id) return;
		this.writeTriggerIdValue(id);
	}

	private owned(): TriggerOwned | undefined {
		const id = this.resolvedActiveTriggerId();
		if (!id) return undefined;
		return this.readers.get(id)?.();
	}

	get payload() {
		return this.owned()?.payload;
	}

	get closeDelay() {
		return this.owned()?.closeDelay ?? 0;
	}

	openedBy(triggerId: string | undefined) {
		if (triggerId === undefined || !this.open) return false;
		const active = this.domReferenceElement;
		if (active && this.triggers.getById(triggerId) === active) return true;
		const resolved = this.resolvedActiveTriggerId();
		// Upstream useImplicitActiveTrigger: a menu opened without a trigger press belongs to its
		// only trigger.
		if (resolved == null) {
			return (
				!this.openedWithoutTrigger &&
				this.triggerCount === 1 &&
				this.triggers.getById(triggerId) != null
			);
		}
		return resolved === triggerId;
	}

	mountedBy(triggerId: string | undefined) {
		if (triggerId === undefined || !this.mounted) return false;
		if (this.open) return this.openedBy(triggerId);
		return this.resolvedActiveTriggerId() === triggerId;
	}

	popupIdFor(triggerId: string | undefined) {
		const popup = this.popupElement;
		if (popup == null || popup.id === '') return undefined;
		return this.openedBy(triggerId) ? popup.id : undefined;
	}

	noteTrigger(id: string, element: HTMLElement, read: () => TriggerOwned) {
		this.triggers.add(id, element);
		this.readers.set(id, read);
		untrack(() => {
			const active = this.domReferenceElement;
			const activeId = this.readTriggerId();
			if (
				active === element ||
				activeId === id ||
				(this.open &&
					active == null &&
					activeId == null &&
					this.triggerCount === 1 &&
					!this.openedWithoutTrigger)
			) {
				this.domReferenceElement = element;
				this.writeTriggerId(id);
			}
		});
	}

	forgetTrigger(id: string, element: HTMLElement) {
		if (this.triggers.getById(id) === element) this.triggers.delete(id);
		this.readers.delete(id);
	}

	override setOpen(
		nextOpen: boolean,
		eventDetails: MenuChangeEventDetails | Parameters<PopupStore<MenuChangeReason>['setOpen']>[1]
	) {
		const details = eventDetails as MenuChangeEventDetails;
		const reason = details.reason;
		// Relayed tree events and stale hover timers can request a close after the state changed.
		if (!nextOpen && !this.open) return;
		if (
			this.open === nextOpen &&
			details.trigger === this.domReferenceElement &&
			this.openChangeReason === reason
		) {
			return;
		}

		const nativeEvent = details.event as PointerEvent | undefined;
		// Some mobile browsers fire focus before a delayed click. That click must not close the
		// menu the focus just opened.
		if (
			!nextOpen &&
			reason !== REASONS.itemPress &&
			nativeEvent?.type === 'click' &&
			nativeEvent.pointerType === 'touch' &&
			!this.allowTouchToClose
		) {
			return;
		}

		const wasOpen = this.open;
		const previousElement = this.openedFrom;
		super.setOpen(nextOpen, details);
		if (details.isCanceled) return;

		if (nextOpen && reason === REASONS.triggerFocus) {
			this.allowTouchToClose = false;
			this.touchCloseTimeout.start(300, () => {
				this.allowTouchToClose = true;
			});
		} else {
			this.allowTouchToClose = true;
			this.touchCloseTimeout.clear();
		}

		this.openEvent = details.event;
		this.openChangeReason = reason;
		this.keyboardOpen = nextOpen && isKeyboardOpen(reason, nativeEvent);

		const registered = this.triggers.idOf(this.domReferenceElement);
		this.writeTriggerId(registered ?? (this.domReferenceElement?.id || null));
		if (nextOpen) {
			this.openedFrom = this.activeTriggerElement;
		} else {
			this.openedFrom = null;
			this.claimedTriggerId = null;
		}

		if (nextOpen && reason === REASONS.triggerHover) {
			// A click within 500ms of a hover open keeps the menu open.
			this.stickIfOpen = true;
			this.stickTimeout.start(PATIENT_CLICK_THRESHOLD, () => {
				this.stickIfOpen = false;
			});
		}

		const nextElement = this.activeTriggerElement;
		if (wasOpen && nextOpen && previousElement && nextElement && previousElement !== nextElement) {
			this.switchedFrom = previousElement;
			this.triggerSwitch += 1;
			this.armTriggerChange();
			return;
		}

		const isDismissClose =
			!nextOpen && (reason === REASONS.escapeKey || (reason as string | null) == null);
		if (this.parent.type === 'menubar' && GROUP_REASONS.has(reason)) this.instantType = 'group';
		else if (isKeyboardClick(reason, nativeEvent)) this.instantType = 'click';
		else if (isDismissClose) this.instantType = 'dismiss';
		else this.instantType = undefined;
	}

	closeImperative() {
		this.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	}

	/** Drop a prevented unmount. The shared close completion then removes the popup. */
	override forceUnmount() {
		this.preventUnmountingOnClose = false;
	}

	/** The positioner animates between triggers, then the move is marked instant. */
	private armTriggerChange() {
		this.triggerChangeAbort?.abort();
		this.instantType = undefined;
		const positioner = this.positionerElement;
		if (!positioner) {
			this.instantType = 'trigger-change';
			return;
		}
		const controller = new AbortController();
		this.triggerChangeAbort = controller;
		runOnceAnimationsFinish(
			positioner,
			() => {
				if (this.open) this.instantType = 'trigger-change';
			},
			controller.signal,
			false
		);
	}
}
