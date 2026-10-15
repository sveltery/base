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
import { createChangeEventDetails, REASONS, ScopedTimeout } from '@sveltery/utils';
import { runOnceAnimationsFinish } from '../internal/animations-finished.js';
import { BoundTriggerId } from '../internal/popups/boundTriggerId.svelte.js';
import { PopupStore } from '../internal/popups/store.svelte.js';
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
	readOpen: () => boolean | undefined;
	writeOpen: (open: boolean) => void;
	floatingId: string;
	nested: boolean;
	readModal: () => PopoverModal;
	readTriggerId: () => string | null | undefined;
	writeTriggerId: (id: string | null) => void;
	onOpenChange: () => ((open: boolean, details: PopoverChangeEventDetails) => void) | undefined;
	onOpenChangeComplete: () => ((open: boolean) => void) | undefined;
	readDismissReference: () => HTMLAttributes<HTMLElement>;
	readDismissFloating: () => HTMLAttributes<HTMLElement>;
}

export class PopoverStore extends PopupStore<PopoverChangeReason> {
	protected override readonly closeTriggerFill = 'closePress';
	stickIfOpen = $state(true);
	#instantType = $state<PopoverInstant | undefined>(undefined);
	openChangeReason = $state<PopoverChangeReason | null>(null);
	titleElementId = $state<string | undefined>(undefined);
	descriptionElementId = $state<string | undefined>(undefined);
	/** Set while a viewport is mounted so positioning can anchor size transitions. */
	adaptiveOrigin = $state.raw<Middleware | undefined>(undefined);
	/** True after a close button has registered. */
	focusTrap = $state(false);
	/** Physical side from the positioner. Safe-polygon reads this while open. */
	placement = $state<string | null>('bottom');
	/** Viewport CSS variables. They travel with the style attribute. */
	positionerVars = $state<Record<string, string>>({});
	popupVars = $state<Record<string, string>>({});
	private readonly stickTimeout = new ScopedTimeout();
	private readonly readModal: () => PopoverModal;
	readonly boundTriggerId: BoundTriggerId;
	private readonly readDismissReference: PopoverStoreOptions['readDismissReference'];
	private readonly readDismissFloating: PopoverStoreOptions['readDismissFloating'];
	private readonly readers = new SvelteMap<string, () => TriggerOwned>();
	private pendingSwitch: AbortController | null = null;
	/** Trigger that opened the popup. Click remembers the next node before setOpen. */
	private openedFrom: Element | null = null;
	/** Bumps when an open popup changes trigger. The viewport snapshots on this. */
	triggerSwitch = $state(0);
	switchedFrom = $state<Element | null>(null);

	constructor(options: PopoverStoreOptions) {
		super({
			readOpen: options.readOpen,
			writeOpen: options.writeOpen,
			floatingId: options.floatingId,
			floatingElement: 'popup',
			nested: options.nested,
			onOpenChange: options.onOpenChange,
			onOpenChangeComplete: options.onOpenChangeComplete
		});
		this.readModal = options.readModal;
		this.boundTriggerId = new BoundTriggerId(this, options.readTriggerId, options.writeTriggerId);
		this.readDismissReference = options.readDismissReference;
		this.readDismissFloating = options.readDismissFloating;

		// Upstream useImplicitActiveTrigger: a bound trigger id moves the popup to that trigger, and
		// a popup opened without naming a trigger, such as through `bind:open`, claims its only
		// trigger until it finishes closing.
		$effect(() => {
			if (!this.open) return;
			const boundId = this.boundTriggerId.read();
			const bound = boundId ? this.triggers.getById(boundId) : undefined;
			if (bound) {
				if (bound !== untrack(() => this.domReferenceElement)) this.domReferenceElement = bound;
				return;
			}
			if (this.openedWithoutTrigger || this.triggerCount !== 1) return;
			if (this.resolvedActiveTriggerId() != null) return;
			untrack(() => {
				const [only] = this.triggers.elements();
				const id = this.triggers.idOf(only);
				if (!id) return;
				this.domReferenceElement = only;
				this.boundTriggerId.write(id);
			});
		});

		// Upstream useTriggerSwitchTransition. The positioner is instant while open, so it would jump
		// between triggers. The move animates with `instant` cleared, and `trigger-change` returns
		// once it finishes. A close cancels that, because the trigger element outlives the exit and
		// nothing else would abort a restoration that a reopen could inherit.
		$effect(() => {
			if (this.open) return;
			untrack(() => {
				this.stickTimeout.clear();
				this.pendingSwitch?.abort();
				this.pendingSwitch = null;
				if (this.#instantType === 'trigger-change') this.#instantType = undefined;
			});
		});

		$effect(() => {
			return () => {
				this.stickTimeout.clear();
			};
		});
	}

	/**
	 * Upstream runs this in the positioner, so the previous trigger is forgotten whenever the
	 * positioner unmounts. A fresh open from another trigger after a full close is not a move.
	 */
	trackTriggerSwitch() {
		let previousTrigger: Element | null = null;
		$effect(() => {
			const current = this.domReferenceElement;
			return untrack(() => {
				const previous = previousTrigger;
				if (current) previousTrigger = current;
				if (!previous || !current || current === previous || !this.open) return;
				this.#instantType = undefined;
				const controller = new AbortController();
				this.pendingSwitch = controller;
				const restore = () => {
					// The animations can finish in the frame a close commits.
					if (this.open) this.#instantType = 'trigger-change';
				};
				const positioner = this.positionerElement;
				if (positioner) runOnceAnimationsFinish(positioner, restore, controller.signal, false);
				else restore();
				return () => controller.abort();
			});
		});
	}

	protected override preventUnmountTiming(): 'immediate' | 'deferred' {
		return 'deferred';
	}

	/** `trigger-change` describes a move between triggers, so a closed popup never reports it. */
	get instantType(): PopoverInstant | undefined {
		const instant = this.#instantType;
		return instant === 'trigger-change' && !this.open ? undefined : instant;
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
		return this.placement;
	}

	setPlacement(side: string | null) {
		this.placement = side;
	}

	/** Id the trigger was registered under. Falls back to the DOM id. */
	resolvedActiveTriggerId() {
		const registered = this.triggers.idOf(this.domReferenceElement);
		if (registered) return registered;
		return this.boundTriggerId.active || this.domReferenceElement?.id || null;
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
		const resolved = this.resolvedActiveTriggerId();
		if (resolved == null) return this.isOnlyTrigger(triggerId);
		return resolved === triggerId;
	}

	/** Upstream `triggerOwnsOpenPopupOrIsOnlyTrigger` before the implicit claim lands. */
	private isOnlyTrigger(triggerId: string) {
		return (
			!this.openedWithoutTrigger &&
			this.triggerCount === 1 &&
			this.triggers.getById(triggerId) != null
		);
	}

	popupIdFor(triggerId: string | undefined) {
		const popup = this.popupElement;
		if (popup == null || popup.id === '') return undefined;
		return this.openedBy(triggerId) ? popup.id : undefined;
	}

	noteTrigger(id: string, element: HTMLElement, read: () => TriggerOwned) {
		this.triggers.add(id, element);
		this.readers.set(id, read);
		// Open, the active element, and the trigger count must not re-run the
		// trigger's registration effect. Only the trigger id stays tracked there.
		untrack(() => {
			const active = this.domReferenceElement;
			const open = this.open;
			const count = this.triggerCount;
			const currentId = this.boundTriggerId.read();
			const claimsLone = open && active == null && count === 1 && !this.openedWithoutTrigger;
			if (active === element || currentId === id || claimsLone) {
				this.domReferenceElement = element;
				this.boundTriggerId.write(id);
			}
		});
	}

	forgetTrigger(id: string, element: HTMLElement) {
		if (this.triggers.getById(id) === element) this.triggers.delete(id);
		this.readers.delete(id);
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
		this.boundTriggerId.write(registered ?? (this.domReferenceElement?.id || null), nextOpen);
		this.openedFrom = nextOpen ? this.activeTriggerElement : null;

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
		}

		let instant: PopoverInstant | undefined;
		if (isKeyboardClick) instant = 'click';
		else if (isDismissClose) instant = 'dismiss';
		else if (reason === REASONS.focusOut) instant = 'focus';
		this.#instantType = instant;
	}

	notifyOpened() {
		this.notifyOpenChangeComplete(true);
	}

	/** Drop a prevented unmount. The shared close completion then removes the popup. */
	forceUnmount() {
		this.preventUnmountingOnClose = false;
	}

	protected override onUnmount() {
		this.boundTriggerId.reset();
	}

	closeImperative() {
		this.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	}
}
