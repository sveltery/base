// Derived from Base UI v1.8.0 packages/react/src/popover/store/PopoverStore.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Open, dismiss, and deferred preventUnmountOnClose stay on the shared PopupStore.
// Hover stick, instant type, and trigger-owned fields live here.
// The popup is the floating element so the landed focus manager traps the dialog,
// not the positioner. Positioning still attaches to the positioner.
// Focus returns through the focus manager after close, not inside setOpen.

import type { Middleware } from '@floating-ui/dom';
import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { HTMLAttributes } from 'svelte/elements';
import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
import type { ControllableValue } from '../internal/controllable-value.svelte.js';
import { runOnceAnimationsFinish } from '../internal/animations-finished.js';
import { PopupStore } from '../internal/popups/store.svelte.js';
import { Timeout } from '../internal/timeout.js';
import { PATIENT_CLICK_THRESHOLD } from './constants.js';
import type {
	PopoverChangeEventDetails,
	PopoverChangeReason,
	PopoverInstant,
	PopoverModal
} from './types.js';

export interface TriggerOwned {
	payload: unknown;
	disabled: boolean;
	openOnHover: boolean;
	closeDelay: number;
}

export interface PopoverStoreOptions {
	open: ControllableValue<boolean>;
	floatingId: string;
	nested: boolean;
	readModal: () => PopoverModal;
	readTriggerId: () => string | null | undefined;
	writeTriggerId: (id: string | null, details?: unknown) => void;
	onOpenChange: () => ((open: boolean, details: PopoverChangeEventDetails) => void) | undefined;
	onOpenChangeComplete: () => ((open: boolean) => void) | undefined;
	readDismissReference: () => HTMLAttributes<HTMLElement>;
	readDismissFloating: () => HTMLAttributes<HTMLElement>;
}

export class PopoverStore extends PopupStore<PopoverChangeReason> {
	stickIfOpen = $state(true);
	instantType = $state<PopoverInstant | undefined>(undefined);
	openChangeReason = $state<PopoverChangeReason | null>(null);
	titleElementId = $state<string | undefined>(undefined);
	descriptionElementId = $state<string | undefined>(undefined);
	/** Set while a viewport is mounted so positioning can anchor size transitions. */
	adaptiveOrigin = $state.raw<Middleware | undefined>(undefined);
	/** True after a close button has registered. */
	focusTrap = $state(false);
	/** Physical side from the positioner. Safe-polygon reads this while open. */
	placementReader: () => string | null = () => 'bottom';
	/** Viewport CSS variables. They travel with the style attribute. */
	positionerVars = $state<Record<string, string>>({});
	popupVars = $state<Record<string, string>>({});
	private readonly stickTimeout = Timeout.create();
	private readonly readModal: () => PopoverModal;
	private readonly readTriggerId: () => string | null | undefined;
	private readonly writeTriggerIdValue: (id: string | null, details?: unknown) => void;
	private readonly readDismissReference: PopoverStoreOptions['readDismissReference'];
	private readonly readDismissFloating: PopoverStoreOptions['readDismissFloating'];
	private readonly readOpenComplete: PopoverStoreOptions['onOpenChangeComplete'];
	/** Id written for this open. Survives a controlled trigger id that snaps back. */
	private claimedTriggerId: string | null = null;
	private readonly readers = new SvelteMap<string, () => TriggerOwned>();
	private triggerChangeAbort: AbortController | null = null;
	/** Trigger that opened the popup. Click remembers the next node before setOpen. */
	private openedFrom: Element | null = null;
	/** Bumps when an open popup changes trigger. The viewport snapshots on this. */
	triggerSwitch = $state(0);
	switchedFrom = $state<Element | null>(null);

	constructor(options: PopoverStoreOptions) {
		super({
			open: options.open,
			floatingId: options.floatingId,
			floatingElement: 'popup',
			nested: options.nested,
			onOpenChange: options.onOpenChange,
			onOpenChangeComplete: options.onOpenChangeComplete
		});
		this.readModal = options.readModal;
		this.readTriggerId = options.readTriggerId;
		this.writeTriggerIdValue = options.writeTriggerId;
		this.readDismissReference = options.readDismissReference;
		this.readDismissFloating = options.readDismissFloating;
		this.readOpenComplete = options.onOpenChangeComplete;

		$effect(() => {
			if (this.open) return;
			this.stickTimeout.clear();
		});

		$effect(() => {
			return () => {
				this.stickTimeout.clear();
				this.triggerChangeAbort?.abort();
			};
		});
	}

	protected override preventUnmountTiming(): 'immediate' | 'deferred' {
		return 'deferred';
	}

	get modal(): PopoverModal {
		return this.readModal();
	}

	get dismissReference() {
		return this.readDismissReference();
	}

	get dismissFloating() {
		return this.readDismissFloating();
	}

	readPlacement() {
		return this.placementReader();
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

	writeTriggerId(id: string | null, details?: unknown) {
		this.claimedTriggerId = id;
		if ((this.readTriggerId() ?? null) === id) return;
		this.writeTriggerIdValue(id, details);
	}

	owned(): TriggerOwned | undefined {
		const id = this.resolvedActiveTriggerId();
		if (!id) return undefined;
		return this.readers.get(id)?.();
	}

	get payload() {
		return this.owned()?.payload;
	}

	get triggerDisabled() {
		return this.owned()?.disabled ?? false;
	}

	get openOnHover() {
		return this.owned()?.openOnHover ?? false;
	}

	get closeDelay() {
		return this.owned()?.closeDelay ?? 0;
	}

	get focusManagerModal() {
		return this.modal !== false && this.focusTrap;
	}

	openedBy(triggerId: string | undefined) {
		if (triggerId === undefined || !this.open) return false;
		const active = this.domReferenceElement;
		if (active && this.triggers.getById(triggerId) === active) return true;
		return this.resolvedActiveTriggerId() === triggerId;
	}

	mountedBy(triggerId: string | undefined) {
		return triggerId !== undefined && this.mounted && this.resolvedActiveTriggerId() === triggerId;
	}

	popupIdFor(triggerId: string | undefined) {
		if (this.openedBy(triggerId)) return this.floatingId;
		if (
			triggerId !== undefined &&
			this.open &&
			this.resolvedActiveTriggerId() == null &&
			this.triggerCount === 1
		) {
			return this.floatingId;
		}
		return undefined;
	}

	noteTrigger(id: string, element: HTMLElement, read: () => TriggerOwned) {
		this.triggers.add(id, element);
		this.readers.set(id, read);
		this.triggerCount = this.triggers.size;
		// Open, the active element, and the trigger count must not re-run the
		// trigger's registration effect. Only the trigger id stays tracked there.
		untrack(() => {
			const active = this.domReferenceElement;
			const open = this.open;
			const count = this.triggerCount;
			const currentId = this.readTriggerId();
			if (active === element || currentId === id || (open && active == null && count === 1)) {
				this.domReferenceElement = element;
				this.writeTriggerId(id);
			}
		});
	}

	forgetTrigger(id: string, element: HTMLElement) {
		if (this.triggers.getById(id) === element) this.triggers.delete(id);
		this.readers.delete(id);
		this.triggerCount = this.triggers.size;
	}

	override setOpen(
		nextOpen: boolean,
		eventDetails:
			PopoverChangeEventDetails | Parameters<PopupStore<PopoverChangeReason>['setOpen']>[1]
	) {
		const details = eventDetails as PopoverChangeEventDetails;
		const reason = details.reason;
		const isHover = reason === REASONS.triggerHover;
		const isKeyboardClick =
			reason === REASONS.triggerPress && (details.event as MouseEvent).detail === 0;
		const isDismissClose = !nextOpen && (reason === REASONS.escapeKey || reason == null);
		const wasOpen = this.open;
		const previousElement = this.openedFrom;

		super.setOpen(nextOpen, details);
		if (details.isCanceled) return;

		this.openChangeReason = reason;
		const registered = this.triggers.idOf(this.domReferenceElement);
		this.writeTriggerId(registered ?? (this.domReferenceElement?.id || null), details);
		if (!nextOpen) {
			this.openedFrom = null;
			this.claimedTriggerId = null;
		} else {
			this.openedFrom = this.activeTriggerElement;
		}

		if (isHover) {
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

		let instant: PopoverInstant | undefined;
		if (isKeyboardClick) instant = 'click';
		else if (isDismissClose) instant = 'dismiss';
		else if (reason === REASONS.focusOut) instant = 'focus';
		this.instantType = instant;
	}

	notifyOpened() {
		this.readOpenComplete()?.(true);
	}

	/** Drop a prevented unmount. The shared close completion then removes the popup. */
	forceUnmount() {
		this.preventUnmountingOnClose = false;
	}

	closeImperative() {
		this.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	}

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
				this.instantType = 'trigger-change';
			},
			controller.signal,
			false
		);
	}
}
