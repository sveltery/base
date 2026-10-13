// Derived from Base UI v1.9.0 packages/react/src/preview-card/store/PreviewCardStore.ts
// and the dismiss-close and instant-type rules of packages/react/src/utils/popups/popupStoreUtils.ts
// `applyPopupOpenChange` (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Open, dismiss, and deferred preventUnmountOnClose stay on the shared PopupStore.
// Each trigger registers a reader for its payload and close delay, so the active trigger's
// values are read where they are used. Upstream copies them into store state instead.
// `reconcileActiveTrigger` is upstream `useImplicitActiveTrigger` with `closeOnActiveTriggerUnmount`.

import type { Middleware } from '@floating-ui/dom';
import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { HTMLAttributes } from 'svelte/elements';
import { createChangeEventDetails, REASONS } from '@sveltery/utils';
import { TRIGGER_FOCUS_REASON } from '@sveltery/floating-ui-svelte';
import { PopupStore } from '../internal/popups/store.svelte.js';
import { CLOSE_DELAY } from './constants.js';
import { updateInlineRectCoords, type InlineRectHover } from './inline-rect.js';
import type {
	PreviewCardChangeEventDetails,
	PreviewCardChangeReason,
	PreviewCardInstant
} from './types.js';

export interface TriggerOwned {
	payload: unknown;
	closeDelay: number;
}

export interface PreviewCardStoreOptions {
	readOpen: () => boolean | undefined;
	writeOpen: (open: boolean) => void;
	floatingId: string;
	nested: boolean;
	readTriggerId: () => string | null | undefined;
	writeTriggerId: (id: string | null) => void;
	onOpenChange: () => ((open: boolean, details: PreviewCardChangeEventDetails) => void) | undefined;
	onOpenChangeComplete: () => ((open: boolean) => void) | undefined;
}

export class PreviewCardStore extends PopupStore<PreviewCardChangeReason> {
	instantType = $state<PreviewCardInstant | undefined>(undefined);
	/** Set while a viewport is mounted so positioning can anchor size transitions. */
	adaptiveOrigin = $state.raw<Middleware | undefined>(undefined);
	/** Physical side from the positioner. Safe-polygon reads this while open. */
	placement = $state<string | null>('bottom');
	/** Viewport CSS variables. They travel with the style attribute. */
	positionerVars = $state<Record<string, string>>({});
	popupVars = $state<Record<string, string>>({});
	/** Dismiss handlers from `PreviewCardInteractions`. Empty while that part is not rendered. */
	dismissReference = $state.raw<HTMLAttributes<HTMLElement>>({});
	dismissFloating = $state.raw<HTMLAttributes<HTMLElement>>({});
	/** Bumps when an open card changes trigger. The viewport snapshots on this. */
	triggerSwitch = $state(0);
	switchedFrom = $state<Element | null>(null);
	/** The hovered point of a wrapped trigger, read by the inline positioning middleware. */
	readonly inlineHover: InlineRectHover;
	private readonly readTriggerId: () => string | null | undefined;
	private readonly writeTriggerIdValue: (id: string | null) => void;
	/** Id written for this open. Survives a bound trigger id that the parent sets back. */
	private claimedTriggerId: string | null = null;
	private readonly readers = new SvelteMap<string, () => TriggerOwned>();
	/** Trigger that opened the card, remembered to tell a switch from a first open. */
	private openedFrom: Element | null = null;
	/** The active trigger id once its element was found registered. Tells a lost trigger from a pending one. */
	private resolvedTriggerId: string | null = null;
	/** Values of an active trigger that unmounted while the card stayed open. */
	private retained: { id: string; owned: TriggerOwned } | undefined;
	private destroyed = false;

	constructor(options: PreviewCardStoreOptions) {
		const inlineHover: InlineRectHover = { coords: undefined };
		super({
			readOpen: options.readOpen,
			writeOpen: options.writeOpen,
			floatingId: options.floatingId,
			floatingElement: 'positioner',
			nested: options.nested,
			onOpenChange: options.onOpenChange,
			onOpenChangeComplete: () => (open) => {
				if (!open) inlineHover.coords = undefined;
				options.onOpenChangeComplete()?.(open);
			}
		});
		this.inlineHover = inlineHover;
		this.readTriggerId = options.readTriggerId;
		this.writeTriggerIdValue = options.writeTriggerId;

		$effect(() => {
			const open = this.open;
			// Registration changes and an element swapped under one id must rerun this.
			void this.triggers.size;
			const boundId = this.readTriggerId();
			if (boundId) void this.triggers.getById(boundId);
			void this.domReferenceElement;
			untrack(() => this.reconcileActiveTrigger(open));
		});

		$effect(() => {
			this.destroyed = false;
			return () => {
				this.destroyed = true;
			};
		});
	}

	protected override preventUnmountTiming(): 'immediate' | 'deferred' {
		return 'deferred';
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

	owned(): TriggerOwned | undefined {
		const id = this.resolvedActiveTriggerId();
		if (!id) return undefined;
		const read = this.readers.get(id);
		if (read) return read();
		return this.retained?.id === id ? this.retained.owned : undefined;
	}

	get payload() {
		return this.owned()?.payload;
	}

	get closeDelay() {
		return this.owned()?.closeDelay ?? CLOSE_DELAY;
	}

	openedBy(triggerId: string | undefined) {
		if (triggerId === undefined || !this.open) return false;
		const active = this.domReferenceElement;
		if (active && this.triggers.getById(triggerId) === active) return true;
		const resolved = this.resolvedActiveTriggerId();
		// Upstream `isOpenedByTrigger` matches the active id only. A card opened through
		// `bind:open` belongs to its only trigger once `reconcileActiveTrigger` claims it.
		if (resolved == null)
			return this.triggerCount === 1 && this.triggers.getById(triggerId) != null;
		return resolved === triggerId;
	}

	noteTrigger(id: string, element: HTMLElement, read: () => TriggerOwned) {
		this.triggers.add(id, element);
		this.readers.set(id, read);
	}

	forgetTrigger(id: string, element: HTMLElement) {
		const read = this.readers.get(id);
		if (read && this.open && this.resolvedActiveTriggerId() === id) {
			this.retained = { id, owned: { ...read() } };
		}
		if (this.triggers.getById(id) === element) this.triggers.delete(id);
		this.readers.delete(id);
	}

	override setOpen(
		nextOpen: boolean,
		eventDetails:
			PreviewCardChangeEventDetails | Parameters<PopupStore<PreviewCardChangeReason>['setOpen']>[1]
	) {
		const details = eventDetails as PreviewCardChangeEventDetails;
		const reason = details.reason;
		const isHover = reason === REASONS.triggerHover;
		const isFocusOpen = nextOpen && reason === TRIGGER_FOCUS_REASON;
		const isDismissClose =
			!nextOpen && (reason === REASONS.triggerPress || reason === REASONS.escapeKey);
		const wasOpen = this.open;
		const previousElement = this.openedFrom;

		super.setOpen(nextOpen, details);
		if (details.isCanceled) return;

		// Anchor to the exact point of a wrapped link that was hovered.
		const event = details.event;
		if (
			nextOpen &&
			isHover &&
			details.trigger &&
			'clientX' in event &&
			'clientY' in event &&
			this.inlineHover.coords?.element !== details.trigger
		) {
			updateInlineRectCoords(
				this.inlineHover,
				details.trigger,
				event.clientX as number,
				event.clientY as number
			);
		}

		const registered = this.triggers.idOf(this.domReferenceElement);
		this.writeTriggerId(registered ?? (this.domReferenceElement?.id || null));
		if (!nextOpen) {
			this.openedFrom = null;
			this.claimedTriggerId = null;
		} else {
			this.openedFrom = this.activeTriggerElement;
		}

		const nextElement = this.activeTriggerElement;
		if (wasOpen && nextOpen && previousElement && nextElement && previousElement !== nextElement) {
			this.switchedFrom = previousElement;
			this.triggerSwitch += 1;
		}

		if (isFocusOpen) this.instantType = 'focus';
		else if (isDismissClose) this.instantType = 'dismiss';
		else if (isHover) this.instantType = undefined;
	}

	notifyOpened() {
		this.notifyOpenChangeComplete(true);
	}

	/** Drop a prevented unmount. The shared close completion then removes the card. */
	override forceUnmount() {
		this.preventUnmountingOnClose = false;
	}

	closeImperative() {
		this.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	}

	/**
	 * Keeps the active trigger element in step with the registry while the card is open.
	 * A card opened without a trigger press claims its only trigger. A bound id that
	 * resolves to another element moves the anchor. An active trigger that unregisters
	 * after it resolved closes the card, once a same-tick replacement had its chance.
	 */
	private reconcileActiveTrigger(open: boolean) {
		if (!open) {
			this.resolvedTriggerId = null;
			this.retained = undefined;
			return;
		}

		const boundId = this.readTriggerId();
		const element = this.domReferenceElement;
		if (boundId) {
			const registered = this.triggers.getById(boundId);
			if (registered) {
				this.resolvedTriggerId = boundId;
				if (registered !== element) this.domReferenceElement = registered;
				return;
			}
			const renamed = this.triggers.idOf(element);
			if (renamed) {
				this.resolvedTriggerId = renamed;
				this.writeTriggerId(renamed);
				return;
			}
			if (this.resolvedTriggerId === boundId) this.closeForLostTrigger(boundId);
			else this.resolvedTriggerId = null;
			return;
		}

		this.resolvedTriggerId = null;
		if (this.triggers.size !== 1) return;
		const [only] = this.triggers.elements();
		const id = this.triggers.idOf(only);
		if (!id) return;
		this.resolvedTriggerId = id;
		this.domReferenceElement = only;
		this.writeTriggerId(id);
	}

	private closeForLostTrigger(lostId: string) {
		queueMicrotask(() => {
			if (this.destroyed || !this.open || this.resolvedActiveTriggerId() !== lostId) return;
			if (this.triggers.getById(lostId)) return;
			// A canceled close keeps the previous trigger as the owner of the card that stays open.
			this.setOpen(false, createChangeEventDetails(REASONS.none));
		});
	}
}
