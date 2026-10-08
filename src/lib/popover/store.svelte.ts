// Derived from Base UI v1.8.0 packages/react/src/popover/store/PopoverStore.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Open, dismiss, and deferred preventUnmountOnClose stay on the shared PopupStore.
// Hover stick, instant type, and trigger-owned fields live here.
// The popup is the floating element so the landed focus manager traps the dialog,
// not the positioner. Positioning still attaches to the positioner.

import type { Middleware } from '@floating-ui/dom';
import { SvelteMap } from 'svelte/reactivity';
import type { HTMLAttributes } from 'svelte/elements';
import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
import type { ControllableValue } from '../internal/controllable-value.svelte.js';
import { runOnceAnimationsFinish } from '../internal/animations-finished.js';
import { PopupStore } from '../internal/popups/store.svelte.js';
import { Timeout } from '../internal/timeout.js';
import { PATIENT_CLICK_THRESHOLD } from './constants.js';
import type {
	FocusTarget,
	InteractionType,
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
	onOpenChange: () => ((open: boolean, details: PopoverChangeEventDetails) => void) | undefined;
	onOpenChangeComplete: () => ((open: boolean) => void) | undefined;
}

export class PopoverStore extends PopupStore<PopoverChangeReason> {
	stickIfOpen = $state(true);
	instantType = $state<PopoverInstant | undefined>(undefined);
	openMethod = $state<InteractionType | null>(null);
	openChangeReason = $state<PopoverChangeReason | null>(null);
	titleElementId = $state<string | undefined>(undefined);
	descriptionElementId = $state<string | undefined>(undefined);
	/** Set while a viewport is mounted so positioning can anchor size transitions. */
	adaptiveOrigin = $state<Middleware | undefined>(undefined);
	lastInteraction = $state<InteractionType | ''>('');
	suppressReturnFocus = $state(false);
	dismissReference: HTMLAttributes<HTMLElement> = {};
	dismissFloating: HTMLAttributes<HTMLElement> = {};
	readFinalFocus: (interaction: InteractionType | '') => FocusTarget | HTMLElement | boolean = () =>
		true;
	readCloseCount: () => number = () => 0;
	/** True after a close button has registered. Updated outside the registration effect. */
	focusTrap = $state(false);
	/** Live rendered side for the shared hover safe polygon. */
	readPlacement: () => string | null = () => 'bottom';
	/** Viewport snapshots the previous trigger's DOM when the active trigger changes. */
	onTriggerSwitch: ((previous: Element, next: Element) => void) | null = null;
	private readonly stickTimeout = Timeout.create();
	private readonly readModal: () => PopoverModal;
	private readonly readTriggerId: () => string | null | undefined;
	private readonly readOpenComplete: PopoverStoreOptions['onOpenChangeComplete'];
	private readonly readers = new SvelteMap<string, () => TriggerOwned>();
	private triggerChangeAbort: AbortController | null = null;

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

	resolvedActiveTriggerId() {
		return this.readTriggerId() ?? this.activeTriggerId;
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
		return triggerId !== undefined && this.open && this.resolvedActiveTriggerId() === triggerId;
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
		const active = this.resolvedActiveTriggerId();
		if (active === id || (this.open && active == null && this.triggerCount === 1)) {
			this.activeTriggerId = id;
			this.activeTriggerElement = element;
			if (this.domReferenceElement == null) this.domReferenceElement = element;
		}
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
		const previousElement = this.activeTriggerElement;

		super.setOpen(nextOpen, details);
		if (details.isCanceled) return;

		this.openChangeReason = reason;
		if (!nextOpen) {
			this.openMethod = null;
			this.suppressReturnFocus = this.focusOnClose(details);
		}

		if (isHover) {
			this.stickIfOpen = true;
			this.stickTimeout.start(PATIENT_CLICK_THRESHOLD, () => {
				this.stickIfOpen = false;
			});
		}

		const nextElement = this.activeTriggerElement;
		if (nextOpen && previousElement && nextElement && previousElement !== nextElement) {
			this.onTriggerSwitch?.(previousElement, nextElement);
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

	private focusOnClose(details: PopoverChangeEventDetails) {
		const interaction = closeInteraction(details, this.lastInteraction);
		const target = this.readFinalFocus(interaction);
		if (target instanceof HTMLElement) {
			target.focus();
			return true;
		}
		return target === false;
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

function closeInteraction(
	details: PopoverChangeEventDetails,
	last: InteractionType | ''
): InteractionType | '' {
	if (details.reason === REASONS.escapeKey || details.reason === REASONS.focusOut)
		return 'keyboard';
	if ((details.event as MouseEvent).detail === 0 && details.event.type === 'click')
		return 'keyboard';
	return last;
}
